import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQEvent } from './rabbitmq.types';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from './rabbitmq.service';
import { RABBITMQ_EXCHANGES } from './rabbitmq.constants';
@Injectable()
export class OutboxPublisher implements OnModuleInit {
  private readonly logger = new Logger(OutboxPublisher.name);
  private isRunning = false;
  private readonly PROCESSING_LEASE_MS = 5 * 60 * 1000;
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  onModuleInit() {
    this.start();
  }

  private start() {
    setInterval(() => {
      void this.publishPendingEvents();
    }, 1000);
    this.logger.log('Outbox publisher started');
  }

  private async publishPendingEvents() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    try {
      const leaseExpiredAt = new Date(Date.now() - this.PROCESSING_LEASE_MS);

      const events = await this.prisma.outboxEvent.findMany({
        where: {
          published: false,

          OR: [
            {
              processing: false,
            },
            {
              processing: true,
              processingAt: {
                lt: leaseExpiredAt,
              },
            },
          ],
        },

        orderBy: {
          createdAt: 'asc',
        },

        take: 10,
      });

      for (const event of events) {
        const claimed = await this.prisma.outboxEvent.updateMany({
          where: {
            id: event.id,
            published: false,

            OR: [
              {
                processing: false,
              },
              {
                processing: true,
                processingAt: {
                  lt: leaseExpiredAt,
                },
              },
            ],
          },

          data: {
            processing: true,
            processingAt: new Date(),
          },
        });

        if (claimed.count === 0) {
          continue;
        }

        try {
          const message: RabbitMQEvent = {
            pattern: event.eventType,
            data: event.payload,
          };
          await this.rabbitMQService.publishMessage(
            RABBITMQ_EXCHANGES.EVENTS,
            event.eventType,
            Buffer.from(JSON.stringify(message)),
            {
              persistent: true,
              contentType: 'application/json',
              headers: {
                eventId: event.id,
              },
            },
          );

          await this.prisma.outboxEvent.update({
            where: {
              id: event.id,
            },

            data: {
              published: true,
              processing: false,
              processingAt: null,
              publishedAt: new Date(),
            },
          });

          this.logger.log(
            `Published outbox event: ${event.id} | ${event.eventType}`,
          );
        } catch (error) {
          await this.prisma.outboxEvent.update({
            where: {
              id: event.id,
            },

            data: {
              processing: false,
              processingAt: null,
            },
          });

          this.logger.error(
            `Failed to publish outbox event: ${event.id}`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to process outbox events', error);
    } finally {
      this.isRunning = false;
    }
  }
}

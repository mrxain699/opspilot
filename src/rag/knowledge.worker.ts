import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, RmqContext, Payload } from '@nestjs/microservices';
import type { Channel, Message } from 'amqplib';
import { Prisma } from '../generated/prisma/client';
import { RagService } from './rag.service';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import {
  RABBITMQ_EXCHANGES,
  RABBITMQ_QUEUES,
  RABBITMQ_RETRY,
  RABBITMQ_ROUTING_KEYS,
} from '../rabbitmq/rabbitmq.constants';

@Controller()
export class KnowledgeWorker {
  private readonly logger = new Logger(KnowledgeWorker.name);

  constructor(
    private readonly ragService: RagService,
    private readonly prisma: PrismaService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @EventPattern('knowledge.ingest')
  // eslint-disable-next-line @typescript-eslint/require-await
  async handleKnowledgeIngest(
    @Payload()
    data: {
      id: string;
      content: string;
      source: string;
      metadata?: Record<string, unknown>;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;

    const headers = message.properties.headers ?? {};

    const contentEncoding =
      typeof message.properties.contentEncoding === 'string'
        ? message.properties.contentEncoding
        : undefined;

    const eventId = String(headers['eventId'] ?? '');

    const retryCount = Number(headers['x-retry-count']) || 0;

    this.logger.log(`Received knowledge ingest event: ${data.id}`);

    try {
      const existing = await this.prisma.processedMessage.findUnique({
        where: {
          messageKey: eventId,
        },
      });

      if (existing) {
        this.logger.warn(`Duplicate knowledge event detected: ${eventId}`);
        channel.ack(message);
        return;
      }

      await this.ragService.ingestDocument(data);

      try {
        await this.prisma.processedMessage.create({
          data: {
            messageKey: eventId,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          this.logger.warn(
            `Duplicate knowledge event detected during processing: ${eventId}`,
          );
          channel.ack(message);
          return;
        }

        throw error;
      }

      this.logger.log(`Knowledge document ingested: ${data.id}`);

      channel.ack(message);
    } catch (error) {
      this.logger.error(
        `Failed to ingest knowledge document: ${data.id}`,
        error,
      );

      if (retryCount >= RABBITMQ_RETRY.MAX_ATTEMPTS) {
        await this.rabbitMQService.publishMessage(
          RABBITMQ_EXCHANGES.DLX,
          RABBITMQ_ROUTING_KEYS.KNOWLEDGE_DLQ,
          message.content,
          {
            persistent: true,
            contentType:
              typeof message.properties.contentType === 'string'
                ? message.properties.contentType
                : 'application/json',
            contentEncoding,
            headers: {
              ...headers,
              'x-retry-count': retryCount,
            },
          },
        );

        channel.ack(message);

        this.logger.error(`Knowledge event moved to DLQ: ${eventId}`);

        return;
      }

      const nextRetryCount = retryCount + 1;

      await this.rabbitMQService.publishMessage(
        '',
        RABBITMQ_QUEUES.KNOWLEDGE_RETRY,
        message.content,
        {
          persistent: true,
          contentType:
            typeof message.properties.contentType === 'string'
              ? message.properties.contentType
              : 'application/json',
          contentEncoding,
          headers: {
            ...headers,
            'x-retry-count': nextRetryCount,
          },
        },
      );

      channel.ack(message);

      this.logger.warn(
        `Knowledge event scheduled for retry: ${eventId} | Retry: ${nextRetryCount}`,
      );
    }
  }
}

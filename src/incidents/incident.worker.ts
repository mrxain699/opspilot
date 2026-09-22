import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  RABBITMQ_EXCHANGES,
  RABBITMQ_QUEUES,
  RABBITMQ_RETRY,
  RABBITMQ_ROUTING_KEYS,
} from '../rabbitmq/rabbitmq.constants';
import type { Channel, Message } from 'amqplib';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '@/ai/ai.service';
@Controller()
export class IncidentWorker {
  private readonly logger = new Logger(IncidentWorker.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
  ) {}

  @EventPattern(RABBITMQ_ROUTING_KEYS.INCIDENT_CREATED)
  async handleIncidentCreated(
    @Payload()
    data: {
      incidentId: string;
      service: string;
      severity: string;
      message: string;
      userId: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMessage = context.getMessage() as Message;

    const headers = originalMessage.properties.headers ?? {};

    const retryCount = Number(headers['x-retry-count']) || 0;

    const eventId = String(headers['eventId'] ?? '');

    this.logger.log(
      `Received incident: ${data.incidentId} | Event: ${eventId} | Retry: ${retryCount}`,
    );
    this.logger.log(`Service: ${data.service}, Severity: ${data.severity}`);

    try {
      const existing = await this.prisma.processedMessage.findUnique({
        where: {
          messageKey: eventId,
        },
      });

      if (existing) {
        this.logger.warn(`Duplicate message detected: ${data.incidentId}`);

        channel.ack(originalMessage);

        return;
      }

      this.logger.log(`Processing incident: ${data.incidentId}`);

      // Simulate incident processing
      await new Promise((resolve) => setTimeout(resolve, 5000));

      this.logger.log(`Successfully processed incident: ${data.incidentId}`);

      await this.prisma.processedMessage.create({
        data: {
          messageKey: eventId,
        },
      });

      try {
        const aiAnalysis = await this.aiService.analyzeIncident({
          service: data.service,
          severity: data.severity,
          message: data.message,
        });

        this.logger.log(
          `AI analysis completed for incident ${data.incidentId}: ${JSON.stringify(
            aiAnalysis,
          )}`,
        );
      } catch (error) {
        this.logger.error(
          `AI analysis failed for incident ${data.incidentId}`,
          error,
        );
      }

      channel.ack(originalMessage);

      this.logger.log(`Acknowledged message for incident: ${data.incidentId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process incident: ${data.incidentId}`,
        error,
      );

      if (retryCount >= RABBITMQ_RETRY.MAX_ATTEMPTS) {
        this.logger.error(
          `Max retries reached for incident: ${data.incidentId}. Sending to DLQ.`,
        );

        await this.rabbitMQService.publishMessage(
          RABBITMQ_EXCHANGES.DLX,
          RABBITMQ_ROUTING_KEYS.INCIDENT_DLQ,
          originalMessage.content,
          {
            persistent: true,
            contentType: originalMessage.properties
              .contentType as BufferEncoding,
            contentEncoding: originalMessage.properties
              .contentEncoding as BufferEncoding,
            headers: { ...headers, 'x-retry-count': retryCount },
          },
        );

        channel.ack(originalMessage);
        return;
      }

      const nextRetryCount = retryCount + 1;
      this.logger.warn(
        `Retrying incident: ${data.incidentId} | Attempt: ${nextRetryCount}`,
      );

      await this.rabbitMQService.publishMessage(
        '',
        RABBITMQ_QUEUES.INCIDENT_RETRY,
        originalMessage.content,
        {
          persistent: true,
          contentType: originalMessage.properties.contentType as BufferEncoding,
          contentEncoding: originalMessage.properties
            .contentEncoding as BufferEncoding,
          headers: { ...headers, 'x-retry-count': nextRetryCount },
        },
      );

      channel.ack(originalMessage);
    }
  }
}

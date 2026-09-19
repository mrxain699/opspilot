import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, ConfirmChannel, ChannelModel } from 'amqplib';
import {
  RABBITMQ_EXCHANGES,
  RABBITMQ_QUEUES,
  RABBITMQ_ROUTING_KEYS,
} from './rabbitmq.constants';

@Injectable()
export class RabbitMQTopologyService implements OnModuleInit, OnModuleDestroy {
  private connection!: ChannelModel;
  private channel!: ConfirmChannel;

  async onModuleInit() {
    this.connection = await connect(
      process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
    );

    this.channel = await this.connection.createConfirmChannel();

    await this.setupTopology();
  }

  getConnection() {
    return this.connection;
  }

  private async setupTopology() {
    const eventsExchange = RABBITMQ_EXCHANGES.EVENTS;
    const dlxExchange = RABBITMQ_EXCHANGES.DLX;
    const incidentQueue = RABBITMQ_QUEUES.INCIDENT;
    const incidentRetryQueue = RABBITMQ_QUEUES.INCIDENT_RETRY;
    const incidentDlq = RABBITMQ_QUEUES.INCIDENT_DLQ;

    // Exchanges
    await this.channel.assertExchange(eventsExchange, 'topic', {
      durable: true,
    });

    await this.channel.assertExchange(dlxExchange, 'direct', {
      durable: true,
    });

    // Main queues
    await this.channel.assertQueue(incidentQueue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': dlxExchange,
        'x-dead-letter-routing-key': RABBITMQ_ROUTING_KEYS.INCIDENT_DLQ,
      },
    });

    // await this.channel.assertQueue(AI_QUEUE, {
    //   durable: true,
    //   arguments: {
    //     'x-dead-letter-exchange': DLX_EXCHANGE,
    //     'x-dead-letter-routing-key': 'ai.dlq',
    //   },
    // });

    // await this.channel.assertQueue(AUDIT_QUEUE, {
    //   durable: true,
    //   arguments: {
    //     'x-dead-letter-exchange': DLX_EXCHANGE,
    //     'x-dead-letter-routing-key': 'audit.dlq',
    //   },
    // });

    // Retry queues
    await this.channel.assertQueue(incidentRetryQueue, {
      durable: true,
      arguments: {
        'x-message-ttl': 5000,
        'x-dead-letter-exchange': eventsExchange,
        'x-dead-letter-routing-key': RABBITMQ_ROUTING_KEYS.INCIDENT_CREATED,
      },
    });

    // await this.channel.assertQueue(AI_RETRY_QUEUE, {
    //   durable: true,
    //   arguments: {
    //     'x-message-ttl': 5000,
    //     'x-dead-letter-exchange': EVENTS_EXCHANGE,
    //   },
    // });

    // await this.channel.assertQueue(AUDIT_RETRY_QUEUE, {
    //   durable: true,
    //   arguments: {
    //     'x-message-ttl': 5000,
    //     'x-dead-letter-exchange': EVENTS_EXCHANGE,
    //   },
    // });

    // DLQs
    await this.channel.assertQueue(incidentDlq, { durable: true });
    // await this.channel.assertQueue(AI_DLQ, { durable: true });
    // await this.channel.assertQueue(AUDIT_DLQ, { durable: true });

    // Main queue bindings
    await this.channel.bindQueue(incidentQueue, eventsExchange, 'incident.*');
    // await this.channel.bindQueue(AI_QUEUE, EVENTS_EXCHANGE, 'ai.*');
    // await this.channel.bindQueue(AUDIT_QUEUE, EVENTS_EXCHANGE, 'audit.*');

    // DLQ bindings
    await this.channel.bindQueue(
      incidentDlq,
      dlxExchange,
      RABBITMQ_ROUTING_KEYS.INCIDENT_DLQ,
    );
    // await this.channel.bindQueue(AI_DLQ, DLX_EXCHANGE, 'ai.dlq');
    // await this.channel.bindQueue(AUDIT_DLQ, DLX_EXCHANGE, 'audit.dlq');

    console.log('RabbitMQ topology ready');
  }

  async publish(pattern: string, data: unknown) {
    const published = this.channel.publish(
      RABBITMQ_EXCHANGES.EVENTS,
      pattern,
      Buffer.from(
        JSON.stringify({
          pattern,
          data,
        }),
      ),
      {
        persistent: true,
        contentType: 'application/json',
      },
    );

    if (!published) {
      await new Promise((resolve) => this.channel.once('drain', resolve));
    }

    await this.channel.waitForConfirms();
  }

  async publishMessage(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options: {
      persistent?: boolean;
      contentType?: string;
      contentEncoding?: string;
      headers?: Record<string, unknown>;
    } = {},
  ) {
    const published = this.channel.publish(
      exchange,
      routingKey,
      content,
      options,
    );

    if (!published) {
      await new Promise((resolve) => this.channel.once('drain', resolve));
    }

    await this.channel.waitForConfirms();
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();

    console.log('RabbitMQ connection closed');
  }
}

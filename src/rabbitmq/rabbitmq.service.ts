import { Injectable } from '@nestjs/common';
import { RabbitMQTopologyService } from './rabbitmq-topology.service';

@Injectable()
export class RabbitMQService {
  constructor(private readonly topology: RabbitMQTopologyService) {}

  publish(pattern: string, data: unknown) {
    return this.topology.publish(pattern, data);
  }

  publishMessage(
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
    return this.topology.publishMessage(exchange, routingKey, content, options);
  }
}

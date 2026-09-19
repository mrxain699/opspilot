import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQTopologyService } from '../rabbitmq/rabbitmq-topology.service';
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly rabbitMQ: RabbitMQTopologyService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const connection = this.rabbitMQ.getConnection();

    if (!connection) {
      throw new ServiceUnavailableException('RabbitMQ is unavailable');
    }
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => ({
        rabbitmq: {
          status: 'up',
        },
      }),
    ]);
  }
}

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { PrismaModule } from '../prisma/prisma.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, PrismaModule, RabbitMQModule],
  controllers: [HealthController],
})
export class HealthModule {}

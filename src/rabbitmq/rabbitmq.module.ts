import { Module } from '@nestjs/common';
import { OutboxPublisher } from './outbox.publisher';
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQTopologyService } from './rabbitmq-topology.service';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  providers: [RabbitMQService, RabbitMQTopologyService, OutboxPublisher],
  exports: [RabbitMQService, RabbitMQTopologyService],
})
export class RabbitMQModule {}

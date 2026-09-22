import { Module } from '@nestjs/common';
import { OutboxPublisher } from './outbox.publisher';
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQTopologyService } from './rabbitmq-topology.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OutboxService } from './outbox.service';
@Module({
  imports: [PrismaModule],
  providers: [
    RabbitMQService,
    RabbitMQTopologyService,
    OutboxPublisher,
    OutboxService,
  ],
  exports: [RabbitMQService, RabbitMQTopologyService, OutboxService],
})
export class RabbitMQModule {}

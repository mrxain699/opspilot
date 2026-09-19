import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { IncidentWorker } from './incident.worker';
@Module({
  imports: [PrismaModule, RabbitMQModule],
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentWorker],
})
export class IncidentsModule {}

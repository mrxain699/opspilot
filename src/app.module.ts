import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { IncidentsModule } from './incidents/incidents.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { IncidentWorker } from './incidents/incident.worker';
import { HealthModule } from './health/health.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    RabbitMQModule,
    IncidentsModule,
    HealthModule,
  ],
  controllers: [IncidentWorker],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}

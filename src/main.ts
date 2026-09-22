import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  RABBITMQ_EXCHANGES,
  RABBITMQ_QUEUES,
  RABBITMQ_ROUTING_KEYS,
} from './rabbitmq/rabbitmq.constants';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672'],
      queue: RABBITMQ_QUEUES.INCIDENT,
      queueOptions: {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': RABBITMQ_EXCHANGES.DLX,
          'x-dead-letter-routing-key': RABBITMQ_ROUTING_KEYS.INCIDENT_DLQ,
        },
      },
      noAck: false,
      prefetchCount: 1,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672'],
      queue: RABBITMQ_QUEUES.KNOWLEDGE,
      queueOptions: {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': RABBITMQ_EXCHANGES.DLX,
          'x-dead-letter-routing-key': RABBITMQ_ROUTING_KEYS.KNOWLEDGE_DLQ,
        },
      },
      noAck: false,
      prefetchCount: 1,
    },
  });

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

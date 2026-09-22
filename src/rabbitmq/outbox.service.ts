import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(input: {
    eventType: string;
    aggregateId: string;
    payload: Record<string, unknown>;
  }) {
    return this.prisma.outboxEvent.create({
      data: {
        id: crypto.randomUUID(),
        eventType: input.eventType,
        aggregateId: input.aggregateId,
        payload: input.payload as Prisma.InputJsonValue,
      },
    });
  }
}

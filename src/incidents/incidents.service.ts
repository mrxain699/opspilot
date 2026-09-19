import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { GetIncidentsDto } from './dto/get-incidents.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { RABBITMQ_ROUTING_KEYS } from '../rabbitmq/rabbitmq.constants.js';
@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(
    createIncidentDto: CreateIncidentDto,
    user: {
      userId: string;
      email: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // ------------------------------------------
      // 1. Create incident
      // ------------------------------------------

      const incident = await tx.incident.create({
        data: {
          service: createIncidentDto.service,
          severity: createIncidentDto.severity,
          message: createIncidentDto.message,

          user: {
            connect: {
              id: user.userId,
            },
          },
        },
      });

      // ------------------------------------------
      // 2. Create outbox event
      // ------------------------------------------

      await tx.outboxEvent.create({
        data: {
          eventType: RABBITMQ_ROUTING_KEYS.INCIDENT_CREATED,

          aggregateId: incident.id,

          payload: {
            incidentId: incident.id,
            service: incident.service,
            severity: incident.severity,
            message: incident.message,
            userId: user.userId,
          },
        },
      });

      // ------------------------------------------
      // 3. Transaction commits
      // ------------------------------------------

      return incident;
    });
  }

  async findAll(query: GetIncidentsDto, userId: string) {
    const {
      page,
      limit,
      severity,
      status,
      service,
      search,
      sortBy,
      sortOrder,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.IncidentWhereInput = {
      userId,
      ...(severity && { severity }),
      ...(status && { status }),
      ...(service && { service }),
      ...(search && {
        OR: [
          {
            service: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            message: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const orderBy: Prisma.IncidentOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [incidents, total] = await Promise.all([
      this.prisma.incident.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),

      this.prisma.incident.count({ where }),
    ]);

    return {
      data: incidents,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const incident = await this.prisma.incident.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!incident) {
      throw new NotFoundException(`Incident ${id} not found`);
    }

    return incident;
  }

  async update(
    id: string,
    updateIncidentDto: UpdateIncidentDto,
    userId: string,
  ) {
    await this.findOne(id, userId);

    return this.prisma.incident.update({
      where: {
        id,
      },
      data: updateIncidentDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prisma.incident.delete({
      where: {
        id,
      },
    });

    return {
      message: `Incident ${id} deleted successfully`,
    };
  }
}

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { GetIncidentsDto } from './dto/get-incidents.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  async create(
    @Body() createIncidentDto: CreateIncidentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.incidentsService.create(createIncidentDto, user);
  }

  @Get()
  async findAll(
    @Query() query: GetIncidentsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.incidentsService.findAll(query, user.userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.incidentsService.findOne(id, user.userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIncidentDto: UpdateIncidentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.incidentsService.update(
      id,
      updateIncidentDto,
      user.userId,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.incidentsService.remove(id, user.userId);
  }
}

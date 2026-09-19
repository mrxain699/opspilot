import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationDto } from './pagination.dto';
import { IncidentFilterDto } from './incident-filter.dto';
import { IncidentSortDto } from './incident-sort.dto';
export class GetIncidentsDto extends IntersectionType(
  PaginationDto,
  IncidentFilterDto,
  IncidentSortDto,
) {}

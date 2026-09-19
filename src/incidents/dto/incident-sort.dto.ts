import { IsIn, IsOptional } from 'class-validator';

export class IncidentSortDto {
  @IsOptional()
  @IsIn(['createdAt', 'severity', 'status', 'service'])
  sortBy: 'createdAt' | 'severity' | 'status' | 'service' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}

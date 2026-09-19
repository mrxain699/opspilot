import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  IncidentSeverity,
  IncidentStatus,
} from '../../generated/prisma/client.js';
export class IncidentFilterDto {
  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity?: IncidentSeverity;

  @IsOptional()
  @IsIn(['open', 'resolved'])
  status?: IncidentStatus;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  service?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

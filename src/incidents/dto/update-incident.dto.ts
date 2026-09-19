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
export class UpdateIncidentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  service?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity?: IncidentSeverity;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsIn(['open', 'resolved'])
  status?: IncidentStatus;
}

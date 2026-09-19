import { IsIn, IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { IncidentSeverity } from '../../generated/prisma/client.js';
export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  service!: string;

  @IsIn(['low', 'medium', 'high', 'critical'])
  severity!: IncidentSeverity;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message!: string;
}

import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class IngestKnowledgeDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsNotEmpty()
  source!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

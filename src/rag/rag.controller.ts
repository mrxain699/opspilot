import {
  Body,
  Controller,
  Post,
  Delete,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { RagService } from './rag.service';
import { IngestKnowledgeDto } from './dto/ingest-knowledge.dto';
import { SearchKnowledgeDto } from './dto/search-knowledge.dto';
import { RABBITMQ_ROUTING_KEYS } from '../rabbitmq/rabbitmq.constants';
import { OutboxService } from '../rabbitmq/outbox.service';
@Controller('rag')
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly outboxService: OutboxService,
  ) {}

  @Post('ingest')
  async ingest(@Body() dto: IngestKnowledgeDto) {
    await this.outboxService.createEvent({
      eventType: RABBITMQ_ROUTING_KEYS.KNOWLEDGE_INGEST,
      aggregateId: dto.id,
      payload: { ...dto },
    });

    return {
      message: 'Knowledge ingestion queued successfully',
      documentId: dto.id,
    };
  }

  @Post('search')
  async search(@Body() dto: SearchKnowledgeDto) {
    return this.ragService.retrieveRelevant(dto.query, dto.limit ?? 5);
  }

  @Delete(':documentId')
  async deleteDocument(@Param('documentId') documentId: string) {
    if (!documentId.trim()) {
      throw new BadRequestException('Document ID is required');
    }

    await this.ragService.deleteDocument(documentId);

    return {
      message: 'Knowledge document deleted successfully',
    };
  }
}

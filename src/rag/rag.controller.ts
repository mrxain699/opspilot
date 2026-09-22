import { Body, Controller, Post } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('test-ingest')
  async testIngest(
    @Body()
    body: {
      id: string;
      content: string;
      source: string;
    },
  ) {
    await this.ragService.ingestDocument(body);

    return {
      message: 'Document ingested successfully',
    };
  }

  @Post('test-search')
  async testSearch(
    @Body()
    body: {
      query: string;
      limit?: number;
    },
  ) {
    return this.ragService.retrieveRelevant(body.query, body.limit ?? 5);
  }

  @Post('test-context')
  async testContext(
    @Body()
    body: {
      query: string;
      limit?: number;
    },
  ) {
    return this.ragService.buildTestContext(body.query, body.limit ?? 5);
  }

  @Post('test-build-context')
  async testBuildContext(
    @Body()
    body: {
      query: string;
      limit?: number;
    },
  ) {
    return {
      context: await this.ragService.buildContext(body.query, body.limit ?? 5),
    };
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { EMBEDDING_PROVIDER } from './embedding.tokens';
import type { EmbeddingProvider } from './embedding.provider';
import { VectorStoreService } from './vector-store.service';
import { ChunkerService } from './chunker.service';
import { RagContextService } from './rag-context.service';

@Injectable()
export class RagService {
  constructor(
    @Inject(EMBEDDING_PROVIDER)
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly vectorStore: VectorStoreService,
    private readonly chunker: ChunkerService,
    private readonly ragContextService: RagContextService,
  ) {}

  async ingestDocument(input: {
    id: string;
    content: string;
    source: string;
    metadata?: Record<string, unknown>;
  }) {
    const chunks = this.chunker.chunk(input.content);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const embedding = await this.embeddingProvider.generateEmbedding(chunk);

      await this.vectorStore.saveChunk(
        `${input.id}-${i}`,
        chunk,
        input.source,
        embedding,
        {
          ...input.metadata,
          chunkIndex: i,
        },
      );
    }
  }

  async retrieveRelevant(query: string, limit = 5) {
    const embedding = await this.embeddingProvider.generateEmbedding(query);

    return this.vectorStore.searchSimilar(embedding, limit);
  }

  async deleteDocument(documentId: string) {
    await this.vectorStore.deleteByDocumentId(documentId);
  }

  async buildTestContext(query: string, limit = 5) {
    const chunks = await this.retrieveRelevant(query, limit);

    return {
      query,
      results: chunks,
    };
  }

  async buildContext(query: string, limit = 5) {
    const chunks = await this.retrieveRelevant(query, limit);

    return this.ragContextService.buildContext(chunks);
  }
}

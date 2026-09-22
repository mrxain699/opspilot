import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KnowledgeSearchResult } from './rag.type';
@Injectable()
export class VectorStoreService {
  constructor(private readonly prisma: PrismaService) {}

  async saveChunk(
    id: string,
    content: string,
    source: string,
    embedding: number[],
    metadata?: Record<string, unknown>,
  ) {
    const vector = `[${embedding.join(',')}]`;

    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO knowledge_chunks
        (id, content, source, metadata, embedding)
      VALUES
        ($1, $2, $3, $4::jsonb, $5::vector)
      ON CONFLICT (id)
      DO UPDATE SET
        content = EXCLUDED.content,
        source = EXCLUDED.source,
        metadata = EXCLUDED.metadata,
        embedding = EXCLUDED.embedding
      `,
      id,
      content,
      source,
      JSON.stringify(metadata ?? {}),
      vector,
    );
  }

  async searchSimilar(
    embedding: number[],
    limit = 5,
  ): Promise<KnowledgeSearchResult[]> {
    const vector = `[${embedding.join(',')}]`;

    return this.prisma.$queryRawUnsafe(
      `
      SELECT
        id,
        content,
        source,
        metadata,
        1 - (embedding <=> $1::vector) AS similarity
      FROM knowledge_chunks
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $2
      `,
      vector,
      limit,
    );
  }

  async deleteByDocumentId(documentId: string) {
    await this.prisma.$executeRawUnsafe(
      `
      DELETE FROM knowledge_chunks
      WHERE id LIKE $1
      `,
      `${documentId}-%`,
    );
  }
}

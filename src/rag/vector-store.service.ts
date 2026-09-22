import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
      `,
      id,
      content,
      source,
      JSON.stringify(metadata ?? {}),
      vector,
    );
  }

  async searchSimilar(embedding: number[], limit = 5) {
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
}

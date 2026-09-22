import { Injectable } from '@nestjs/common';
import type { EmbeddingProvider } from '../embedding.provider';

@Injectable()
export class FakeEmbeddingProvider implements EmbeddingProvider {
  async generateEmbedding(text: string): Promise<number[]> {
    const embedding = new Array(1536).fill(0);

    for (let i = 0; i < text.length; i++) {
      embedding[i % 1536] += text.charCodeAt(i) / 1000;
    }

    const magnitude = Math.sqrt(
      embedding.reduce((sum, value) => sum + value * value, 0),
    );

    if (magnitude === 0) {
      return embedding;
    }

    return embedding.map((value) => value / magnitude);
  }
}

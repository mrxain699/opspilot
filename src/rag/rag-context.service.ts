import { Injectable } from '@nestjs/common';

@Injectable()
export class RagContextService {
  buildContext(
    chunks: Array<{
      content: string;
      source: string;
      similarity: number;
    }>,
  ): string {
    if (chunks.length === 0) {
      return 'No relevant knowledge was found.';
    }

    return chunks
      .map(
        (chunk, index) =>
          `[Knowledge ${index + 1}]
Source: ${chunk.source}
Similarity: ${chunk.similarity.toFixed(3)}

${chunk.content}`,
      )
      .join('\n\n---\n\n');
  }
}

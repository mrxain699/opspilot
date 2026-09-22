import { Injectable } from '@nestjs/common';
import { KnowledgeSearchResult } from './rag.type';

@Injectable()
export class RagContextService {
  buildContext(
    chunks: Array<KnowledgeSearchResult>,
    maxContextLength = 6000,
  ): string {
    if (chunks.length === 0) {
      return 'No relevant knowledge was found.';
    }

    const sections: string[] = [];
    let currentLength = 0;

    for (let i = 0; i < chunks.length; i++) {
      const section = `[Knowledge ${i + 1}]
      Source: ${chunks[i].source}
      Similarity: ${chunks[i].similarity.toFixed(3)}

      ${chunks[i].content}`;

      if (currentLength + section.length > maxContextLength) {
        break;
      }

      sections.push(section);
      currentLength += section.length;
    }

    return sections.join('\n\n---\n\n');
  }
}

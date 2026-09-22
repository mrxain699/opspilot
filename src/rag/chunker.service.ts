import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunkerService {
  chunk(text: string, chunkSize = 500, overlap = 50): string[] {
    const chunks: string[] = [];

    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);

      chunks.push(text.slice(start, end));

      if (end === text.length) {
        break;
      }

      start = end - overlap;
    }

    return chunks;
  }
}

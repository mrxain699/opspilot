import { Injectable } from '@nestjs/common';
import { LLMProvider } from '../llm.provider';

@Injectable()
export class FakeLLMProvider implements LLMProvider {
  // eslint-disable-next-line @typescript-eslint/require-await
  async generate(prompt: string): Promise<string> {
    return JSON.stringify({
      summary:
        'The incident indicates a possible service connectivity problem.',
      possibleCause:
        'The affected service may be unavailable or unreachable based on the available knowledge.',
      impact:
        'Requests depending on the affected service may experience failures or delays.',
      recommendedActions: [
        'Check the affected service health',
        'Check network connectivity',
        'Review service logs',
      ],
      confidence: 0.75,
    });
  }
}

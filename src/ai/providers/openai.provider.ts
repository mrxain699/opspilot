import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

import { LLMProvider } from '../llm.provider';

@Injectable()
export class OpenAIProvider implements LLMProvider {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generate(prompt: string): Promise<string> {
    const response = await this.client.responses.create({
      model: 'gpt-5-mini',
      input: prompt,
    });

    return response.output_text;
  }
}

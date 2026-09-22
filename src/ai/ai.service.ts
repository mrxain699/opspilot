import { Inject, Injectable } from '@nestjs/common';
import { IncidentAIAnalysis } from './ai.types';
import type { LLMProvider } from './llm.provider';
import { LLM_PROVIDER } from './ai.tokens';
import { AIPromptService } from './ai-prompt.service';
import { AIResponseParser } from './ai-response.parser';
import { RagService } from '../rag/rag.service';
import { RagContextService } from '../rag/rag-context.service';

@Injectable()
export class AIService {
  constructor(
    @Inject(LLM_PROVIDER)
    private readonly llm: LLMProvider,
    private readonly promptService: AIPromptService,
    private readonly responseParser: AIResponseParser,
    private readonly ragService: RagService,
    private readonly ragContextService: RagContextService,
  ) {}

  async analyzeIncident(input: {
    service: string;
    severity: string;
    message: string;
  }): Promise<IncidentAIAnalysis> {
    const chunks = await this.ragService.retrieveRelevant(
      `${input.service} ${input.severity} ${input.message}`,
      5,
    );

    const ragContext = this.ragContextService.buildContext(
      chunks as Array<{
        content: string;
        source: string;
        similarity: number;
      }>,
    );

    const prompt = this.promptService.buildIncidentPrompt({
      ...input,
      ragContext,
    });

    const response = await this.llm.generate(prompt);

    return this.responseParser.parse(response);
  }

  async buildIncidentPrompt(input: {
    service: string;
    severity: string;
    message: string;
  }): Promise<string> {
    const chunks = await this.ragService.retrieveRelevant(
      `${input.service} ${input.severity} ${input.message}`,
      5,
    );

    const ragContext = this.ragContextService.buildContext(
      chunks as Array<{
        content: string;
        source: string;
        similarity: number;
      }>,
    );

    return this.promptService.buildIncidentPrompt({
      ...input,
      ragContext,
    });
  }

  parseTestResponse(response: string): IncidentAIAnalysis {
    return this.responseParser.parse(response);
  }
}

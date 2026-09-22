import { Inject, Injectable } from '@nestjs/common';
import { IncidentAIAnalysis } from './ai.types';
import type { LLMProvider } from './llm.provider';
import { LLM_PROVIDER } from './ai.tokens';
import { AIPromptService } from './ai-prompt.service';
import { AIResponseParser } from './ai-response.parser';
import { RagService } from '../rag/rag.service';
import { RagContextService } from '../rag/rag-context.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AIService {
  constructor(
    @Inject(LLM_PROVIDER)
    private readonly llm: LLMProvider,
    private readonly promptService: AIPromptService,
    private readonly responseParser: AIResponseParser,
    private readonly ragService: RagService,
    private readonly ragContextService: RagContextService,
    private readonly prisma: PrismaService,
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

    const ragContext = this.ragContextService.buildContext(chunks);

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

    const ragContext = this.ragContextService.buildContext(chunks);

    return this.promptService.buildIncidentPrompt({
      ...input,
      ragContext,
    });
  }

  parseTestResponse(response: string): IncidentAIAnalysis {
    return this.responseParser.parse(response);
  }

  async saveIncidentAnalysis(incidentId: string, analysis: IncidentAIAnalysis) {
    return this.prisma.incidentAIAnalysis.upsert({
      where: {
        incidentId,
      },
      update: {
        summary: analysis.summary,
        possibleCause: analysis.possibleCause,
        impact: analysis.impact,
        recommendedActions: analysis.recommendedActions,
        confidence: analysis.confidence,
      },
      create: {
        incidentId,
        summary: analysis.summary,
        possibleCause: analysis.possibleCause,
        impact: analysis.impact,
        recommendedActions: analysis.recommendedActions,
        confidence: analysis.confidence,
      },
    });
  }
}

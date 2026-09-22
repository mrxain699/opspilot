import { Injectable, BadRequestException } from '@nestjs/common';
import { IncidentAIAnalysis } from './ai.types';

@Injectable()
export class AIResponseParser {
  parse(response: string): IncidentAIAnalysis {
    try {
      const parsed = JSON.parse(response);

      if (
        typeof parsed.summary !== 'string' ||
        typeof parsed.possibleCause !== 'string' ||
        typeof parsed.impact !== 'string' ||
        !Array.isArray(parsed.recommendedActions) ||
        typeof parsed.confidence !== 'number'
      ) {
        throw new Error('Invalid AI response structure');
      }

      return {
        summary: parsed.summary,
        possibleCause: parsed.possibleCause,
        impact: parsed.impact,
        recommendedActions: parsed.recommendedActions,
        confidence: Math.max(0, Math.min(1, parsed.confidence)),
      };
    } catch {
      throw new BadRequestException('AI returned an invalid response format');
    }
  }
}

export interface IncidentAIAnalysis {
  summary: string;

  possibleCause: string;

  impact: string;

  recommendedActions: string[];

  confidence: number;
}

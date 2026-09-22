import { Injectable } from '@nestjs/common';

@Injectable()
export class AIPromptService {
  buildIncidentPrompt(input: {
    service: string;
    severity: string;
    message: string;
    ragContext: string;
  }): string {
    return `
You are an incident analysis assistant.

Analyze the following production incident using the provided knowledge context.

INCIDENT
Service: ${input.service}
Severity: ${input.severity}
Message: ${input.message}

RELEVANT KNOWLEDGE
${input.ragContext}

IMPORTANT:
- Treat possibleCause as a hypothesis, not a confirmed diagnosis.
- Do not invent facts that are not present in the incident or knowledge.
- If the available knowledge is insufficient, say so.
- Return JSON only.

Expected format:
{
  "summary": "string",
  "possibleCause": "string",
  "impact": "string",
  "recommendedActions": ["string"],
  "confidence": 0.0
}
`;
  }
}

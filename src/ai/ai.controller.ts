import { Body, Controller, Post } from '@nestjs/common';

import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('test-prompt')
  async testPrompt(
    @Body()
    body: {
      service: string;
      severity: string;
      message: string;
    },
  ) {
    return {
      prompt: await this.aiService.buildIncidentPrompt(body),
    };
  }

  @Post('test-parse')
  testParse(
    @Body()
    body: {
      response: string;
    },
  ) {
    return this.aiService.parseTestResponse(body.response);
  }
}

import { Module } from '@nestjs/common';
import { LLM_PROVIDER } from './ai.tokens';
import { AIService } from './ai.service';
import { OpenAIProvider } from './providers/openai.provider';
import { AIController } from './ai.controller';
import { AIPromptService } from './ai-prompt.service';
import { AIResponseParser } from './ai-response.parser';
import { RagModule } from '../rag/rag.module';
import { FakeLLMProvider } from './providers/fake-llm.provider';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [RagModule, PrismaModule],
  controllers: [AIController],
  providers: [
    AIService,
    OpenAIProvider,
    FakeLLMProvider,
    {
      provide: LLM_PROVIDER,
      useExisting: FakeLLMProvider,
    },
    AIPromptService,
    AIResponseParser,
  ],
  exports: [AIService],
})
export class AIModule {}

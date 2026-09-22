import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { VectorStoreService } from './vector-store.service';
import { EMBEDDING_PROVIDER } from './embedding.tokens';
import { OpenAIEmbeddingProvider } from './providers/openai-embedding.provider';
import { ChunkerService } from './chunker.service';
import { RagContextService } from './rag-context.service';
import { FakeEmbeddingProvider } from './providers/fake-embedding.provider';
import { RagController } from './rag.controller';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [RagController],
  providers: [
    RagService,
    VectorStoreService,
    OpenAIEmbeddingProvider,
    ChunkerService,
    RagContextService,
    FakeEmbeddingProvider,
    {
      provide: EMBEDDING_PROVIDER,
      useExisting: FakeEmbeddingProvider,
    },
  ],
  exports: [RagService, RagContextService],
})
export class RagModule {}

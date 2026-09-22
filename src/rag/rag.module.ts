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
import { KnowledgeWorker } from './knowledge.worker';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
@Module({
  imports: [PrismaModule, RabbitMQModule],
  controllers: [RagController, KnowledgeWorker],
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

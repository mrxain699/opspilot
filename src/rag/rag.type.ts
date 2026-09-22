export interface KnowledgeChunk {
  id: string;
  content: string;
  source: string;
  metadata?: Record<string, unknown> | null;
}

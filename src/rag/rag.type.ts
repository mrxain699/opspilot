export interface KnowledgeChunk {
  id: string;
  content: string;
  source: string;
  metadata?: Record<string, unknown> | null;
}

export interface KnowledgeSearchResult extends KnowledgeChunk {
  similarity: number;
}

import type { KnowledgeTrack } from "@/types/good-vibe";

export type KnowledgeEditorMode = "manual" | "ai";

export interface KnowledgeDraftPayload {
  title: string;
  summary: string;
  contentMd: string;
}

export interface GenerateKnowledgeDraftInput {
  track: KnowledgeTrack;
  topic: string;
  resourceUrl: string;
  titleHint: string;
  summaryHint: string;
  details: string;
  sourceSubmissionId?: string | null;
}

export interface GenerateKnowledgeDraftResult {
  ok: boolean;
  error?: string;
  warnings: string[];
  draft?: KnowledgeDraftPayload;
}

export interface CreateKnowledgeArticleInput {
  mode: KnowledgeEditorMode;
  track: KnowledgeTrack;
  topic: string;
  title: string;
  slug: string;
  resourceUrl: string;
  summary: string;
  contentMd: string;
  sourceSubmissionId?: string | null;
  aiGenerated?: boolean;
}

export interface CreateKnowledgeArticleResult {
  ok: boolean;
  error?: string;
  redirectTo?: string;
  slug?: string;
}

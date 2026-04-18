export type ExternalResourceChannel =
  | "youtube"
  | "blog"
  | "x"
  | "threads"
  | "news"
  | "github"
  | "docs"
  | "community"
  | "other";
export type ExternalResourceCategory =
  | "ai-agent"
  | "deploy"
  | "database"
  | "web"
  | "automation"
  | "backend"
  | "design"
  | "productivity"
  | "general";
export type ExternalResourceConfidence = "high" | "medium" | "low";
export type ViewerRole = "user" | "admin";
export type IdeaPostStatus = "published" | "hidden";
export type IdeaSort = "latest" | "popular";
export type KnowledgeTrack = "basics" | "level-up" | "tips" | "external";
export type KnowledgeStatus = "draft" | "published";
export type KnowledgeSubmissionStatus =
  | "pending"
  | "reviewing"
  | "accepted"
  | "rejected";
export type YouTubeTranscriptMode = "captions" | "metadata";
export type YouTubeSyncJobType = "backfill" | "daily";
export type YouTubeSyncJobStatus =
  | "pending"
  | "running"
  | "retrying"
  | "completed"
  | "failed";

export interface ViewerProfile {
  id: string;
  email: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  role: ViewerRole;
}

export interface ExternalResourceTaxonomy {
  channel: ExternalResourceChannel;
  channelLabel: string;
  category: ExternalResourceCategory;
  categoryLabel: string;
  subcategory: string;
  subcategoryLabel: string;
  sourceName: string;
  domain: string;
  autoClassified: boolean;
  confidence: ExternalResourceConfidence;
  matchedSignals: string[];
}

export interface IdeaPost {
  id: string;
  title: string;
  content: string;
  referenceLinks: string[];
  authorId: string;
  authorName: string;
  status: IdeaPostStatus;
  upvoteCount: number;
  createdAt: string;
  updatedAt: string;
  viewerHasVoted: boolean;
  source: "seed" | "supabase";
}

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  contentMd: string;
  track: KnowledgeTrack;
  topic: string;
  status: KnowledgeStatus;
  featured: boolean;
  platformTags: string[];
  toolTags: string[];
  resourceUrl: string | null;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  externalTaxonomy: ExternalResourceTaxonomy | null;
  externalProvider?: string | null;
  externalSourceId?: string | null;
  externalSourceLabel?: string | null;
  externalItemId?: string | null;
  source: "seed" | "supabase";
}

export interface KnowledgeSubmission {
  id: string;
  requesterId: string;
  requesterName: string;
  category: KnowledgeTrack;
  title: string;
  summary: string;
  resourceUrl: string | null;
  details: string;
  status: KnowledgeSubmissionStatus;
  createdAt: string;
  updatedAt: string;
  externalTaxonomy: ExternalResourceTaxonomy | null;
  source: "supabase";
}

export interface YouTubeChannel {
  id: string;
  youtubeChannelId: string;
  title: string;
  handle: string | null;
  channelUrl: string;
  thumbnailUrl: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
  lastVideoPublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeVideo {
  id: string;
  channelId: string;
  youtubeVideoId: string;
  title: string;
  description: string;
  publishedAt: string;
  watchUrl: string;
  thumbnailUrl: string | null;
  transcriptMode: YouTubeTranscriptMode;
  knowledgeArticleId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeSyncJob {
  id: string;
  jobType: YouTubeSyncJobType;
  status: YouTubeSyncJobStatus;
  payload: Record<string, unknown>;
  attempts: number;
  error: string | null;
  scheduledAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

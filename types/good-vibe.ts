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

export interface ViewerProfile {
  id: string;
  email: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  role: ViewerRole;
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
  source: "supabase";
}

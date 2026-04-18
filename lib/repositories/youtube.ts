import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  YouTubeChannel,
  YouTubeSyncJob,
  YouTubeSyncJobStatus,
  YouTubeSyncJobType,
  YouTubeTranscriptMode,
  YouTubeVideo,
} from "@/types/good-vibe";

function normalizeJobType(value: string): YouTubeSyncJobType {
  return value === "daily" ? "daily" : "backfill";
}

function normalizeJobStatus(value: string): YouTubeSyncJobStatus {
  if (
    value === "running" ||
    value === "retrying" ||
    value === "completed" ||
    value === "failed"
  ) {
    return value;
  }

  return "pending";
}

function normalizeTranscriptMode(value: string): YouTubeTranscriptMode {
  return value === "captions" ? "captions" : "metadata";
}

export async function listYoutubeChannelsForAdmin() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as YouTubeChannel[];
  }

  const { data, error } = await supabase
    .from("youtube_channels")
    .select(
      "id,youtube_channel_id,title,handle,channel_url,thumbnail_url,is_active,last_synced_at,last_video_published_at,created_at,updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [] as YouTubeChannel[];
  }

  return data.map((row) => ({
    id: row.id,
    youtubeChannelId: row.youtube_channel_id,
    title: row.title,
    handle: row.handle,
    channelUrl: row.channel_url,
    thumbnailUrl: row.thumbnail_url,
    isActive: Boolean(row.is_active),
    lastSyncedAt: row.last_synced_at,
    lastVideoPublishedAt: row.last_video_published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })) satisfies YouTubeChannel[];
}

export async function listYoutubeVideosForAdmin(input?: {
  youtubeChannelId?: string;
  limit?: number;
}) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as YouTubeVideo[];
  }

  let query = supabase
    .from("youtube_videos")
    .select(
      "id,channel_id,youtube_video_id,title,description,published_at,watch_url,thumbnail_url,transcript_mode,knowledge_article_id,created_at,updated_at,youtube_channels!inner(youtube_channel_id)",
    )
    .order("published_at", { ascending: false })
    .limit(Math.max(1, Math.min(input?.limit ?? 50, 200)));

  if (input?.youtubeChannelId) {
    query = query.eq("youtube_channels.youtube_channel_id", input.youtubeChannelId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [] as YouTubeVideo[];
  }

  return data.map((row) => ({
    id: row.id,
    channelId: row.channel_id,
    youtubeVideoId: row.youtube_video_id,
    title: row.title,
    description: row.description ?? "",
    publishedAt: row.published_at,
    watchUrl: row.watch_url,
    thumbnailUrl: row.thumbnail_url,
    transcriptMode: normalizeTranscriptMode(row.transcript_mode),
    knowledgeArticleId: row.knowledge_article_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })) satisfies YouTubeVideo[];
}

export async function listYoutubeSyncJobsForAdmin(limit = 40) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as YouTubeSyncJob[];
  }

  const { data, error } = await supabase
    .from("youtube_sync_jobs")
    .select(
      "id,job_type,status,payload,attempts,error,scheduled_at,started_at,finished_at,created_at,updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(Math.max(1, Math.min(limit, 200)));

  if (error || !data) {
    return [] as YouTubeSyncJob[];
  }

  return data.map((row) => ({
    id: row.id,
    jobType: normalizeJobType(row.job_type),
    status: normalizeJobStatus(row.status),
    payload:
      row.payload && typeof row.payload === "object"
        ? (row.payload as Record<string, unknown>)
        : {},
    attempts: Number(row.attempts ?? 0),
    error: row.error ?? null,
    scheduledAt: row.scheduled_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })) satisfies YouTubeSyncJob[];
}


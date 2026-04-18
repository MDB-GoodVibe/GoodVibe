
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugifyKnowledgeTitle } from "@/lib/knowledge/editor";
import {
  listRecentYouTubeVideos,
  resolveYouTubeChannel,
  type ResolvedYouTubeChannel,
  type YouTubeVideoMetadata,
} from "@/lib/youtube/api";
import { fetchYouTubeTranscript } from "@/lib/youtube/transcript";
import {
  filterNewYouTubeVideoIds,
  slugifyFragment,
  withRetryBackoffMinutes,
} from "@/lib/youtube/utils";

type SupabaseWritableClient =
  | NonNullable<ReturnType<typeof createSupabaseAdminClient>>
  | NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

type SyncJobType = "backfill" | "daily";
type SyncJobStatus = "pending" | "running" | "retrying" | "completed" | "failed";
type TranscriptMode = "captions" | "metadata";

type YouTubeChannelRow = {
  id: string;
  youtube_channel_id: string;
  title: string;
  handle: string | null;
  channel_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  last_video_published_at: string | null;
};

type YouTubeVideoRow = {
  youtube_video_id: string;
  knowledge_article_id: string | null;
};

type YouTubeSyncJobRow = {
  id: string;
  job_type: SyncJobType;
  status: SyncJobStatus;
  payload: Record<string, unknown> | null;
  attempts: number;
  scheduled_at: string;
};

type DraftPayload = {
  title: string;
  summary: string;
  contentMd: string;
  warnings: string[];
  transcriptMode: TranscriptMode;
};

export type YoutubeSyncWorkerResult = {
  processedJobs: number;
  completedJobs: number;
  failedJobs: number;
  createdArticles: number;
  createdVideos: number;
  skippedVideos: number;
  warnings: string[];
};

export type YoutubeResummarizeResult = {
  scannedVideos: number;
  updatedArticles: number;
  skippedArticles: number;
  failedArticles: number;
  warnings: string[];
};

type ChannelSyncStats = {
  createdArticles: number;
  createdVideos: number;
  skippedVideos: number;
  warnings: string[];
};

const BACKFILL_MAX_RESULTS = 10;
const DAILY_MAX_RESULTS = 10;
const MAX_RETRY_ATTEMPTS = 3;

function makeEmptyWorkerResult(): YoutubeSyncWorkerResult {
  return {
    processedJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    createdArticles: 0,
    createdVideos: 0,
    skippedVideos: 0,
    warnings: [],
  };
}

function makeEmptyResummarizeResult(): YoutubeResummarizeResult {
  return {
    scannedVideos: 0,
    updatedArticles: 0,
    skippedArticles: 0,
    failedArticles: 0,
    warnings: [],
  };
}

function isUniqueViolation(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? (error as { code?: string }).code : undefined;
  return code === "23505";
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : "Unknown error";
  }

  return "Unknown error";
}

async function getWritableSupabaseClient(): Promise<SupabaseWritableClient> {
  const adminClient = createSupabaseAdminClient();

  if (adminClient) {
    return adminClient;
  }

  const serverClient = await createSupabaseServerClient();

  if (!serverClient) {
    throw new Error("Supabase client is not configured.");
  }

  return serverClient;
}

function requireSupabaseAdminClient() {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    throw new Error(
      "SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) is required for YouTube sync worker.",
    );
  }

  return adminClient;
}

function sanitizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function normalizeSummaryText(value: string) {
  return value
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/www\.\S+/gi, " ")
    .replace(/[#@][\p{Letter}\p{Number}_-]+/gu, " ")
    .replace(/[|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isPromotionalLine(value: string) {
  const lowered = value.toLowerCase();
  const patterns = [
    "subscribe",
    "like",
    "notification",
    "comment",
    "sponsor",
    "inquiry",
    "sponsor",
    "subscribe",
    "follow",
    "link",
    "coupon",
    "discord",
    "instagram",
  ];

  return patterns.some((pattern) => lowered.includes(pattern));
}

function extractUsefulDescription(description: string) {
  const lines = description
    .split(/\r?\n/)
    .map((line) => normalizeSummaryText(line))
    .filter((line) => line.length >= 8)
    .filter((line) => !isPromotionalLine(line))
    .filter((line, index, source) => source.indexOf(line) === index)
    .slice(0, 4);

  if (lines.length > 0) {
    return lines.join(" ");
  }

  return "";
}

function isLikelyFallbackArticle(contentMd: string | null | undefined) {
  const content = sanitizeText(contentMd).toLowerCase();

  if (!content) {
    return true;
  }

  const markers = [
    "## quick overview",
    "## what this video covers",
    "## practical notes",
    "## summary",
    "## key points",
    "## notes",
    "## source link",
  ];

  return markers.some((marker) => content.includes(marker));
}

function parseJobPayload(payload: Record<string, unknown> | null | undefined) {
  const youtubeChannelId =
    typeof payload?.youtubeChannelId === "string"
      ? payload.youtubeChannelId.trim()
      : "";

  return {
    youtubeChannelId: youtubeChannelId || null,
  };
}

async function resolveUniqueSlug(
  supabase: SupabaseWritableClient,
  desiredSlug: string,
) {
  const baseSlug = slugifyKnowledgeTitle(desiredSlug);
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("knowledge_articles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function buildFallbackDraft(input: {
  video: YouTubeVideoMetadata;
  channel: YouTubeChannelRow;
  transcriptMode: TranscriptMode;
}) {
  const cleanSummary = extractUsefulDescription(sanitizeText(input.video.description));
  const summary =
    cleanSummary.length > 0
      ? cleanSummary.slice(0, 240)
      : `New video from ${input.channel.title}. Summary generated from metadata.`;

  return {
    title: input.video.title,
    summary,
    contentMd: [
      "## Summary",
      summary,
      "",
      "## Key Points",
      cleanSummary.length > 0
        ? cleanSummary
        : "Unable to extract enough key points from the description.",
      "",
      "## Notes",
      `- Channel: ${input.channel.title}`,
      `- Published: ${input.video.publishedAt}`,
      `- Mode: ${input.transcriptMode === "captions" ? "captions" : "metadata"}`,
      "",
      "## Source Link",
      `- Video: ${input.video.watchUrl}`,
    ].join("\n"),
  };
}

async function generateDraftForVideo(input: {
  supabase: SupabaseWritableClient;
  video: YouTubeVideoMetadata;
  channel: YouTubeChannelRow;
}) {
  const transcriptResult = await fetchYouTubeTranscript({
    youtubeVideoId: input.video.youtubeVideoId,
  });
  const transcriptMode = transcriptResult.transcriptMode;
  const transcriptExcerpt = transcriptResult.transcript
    ? transcriptResult.transcript.slice(0, 12_000)
    : "";
  const details = [
    `YouTube channel: ${input.channel.title}`,
    `YouTube channel id: ${input.channel.youtube_channel_id}`,
    `Video id: ${input.video.youtubeVideoId}`,
    `Video published at: ${input.video.publishedAt}`,
    transcriptExcerpt
      ? `Transcript excerpt:\n${transcriptExcerpt}`
      : "Transcript not available. Please summarize from metadata and title/description.",
  ].join("\n\n");
  const { data, error } = await input.supabase.functions.invoke(
    "generate-knowledge-draft",
    {
      body: {
        track: "external",
        topic: "examples-and-showcase",
        titleHint: input.video.title,
        summaryHint: sanitizeText(input.video.description).slice(0, 600),
        details,
        resourceUrl: input.video.watchUrl,
        resourceTaxonomy: {
          channelLabel: "YouTube",
          categoryLabel: "External",
          subcategoryLabel: input.channel.title,
          sourceName: input.channel.title,
          confidence: transcriptExcerpt ? "high" : "medium",
          matchedSignals: [
            "youtube.com",
            input.channel.youtube_channel_id,
            input.video.youtubeVideoId,
          ],
        },
      },
    },
  );
  const hasValidDraft =
    typeof data?.title === "string" &&
    typeof data?.summary === "string" &&
    typeof data?.contentMd === "string" &&
    data.title.trim().length > 0 &&
    data.summary.trim().length > 0 &&
    data.contentMd.trim().length > 0;

  if (error || !hasValidDraft) {
    const fallback = buildFallbackDraft({
      video: input.video,
      channel: input.channel,
      transcriptMode,
    });
    const warnings = [
      "AI draft generation failed, fallback draft was used.",
      ...(error ? [toErrorMessage(error)] : []),
    ];

    return {
      title: fallback.title,
      summary: fallback.summary,
      contentMd: fallback.contentMd,
      warnings,
      transcriptMode,
    } satisfies DraftPayload;
  }

  const warnings = Array.isArray(data.warnings)
    ? data.warnings.filter(
        (warning: unknown): warning is string => typeof warning === "string",
      )
    : [];

  return {
    title: data.title.trim(),
    summary: data.summary.trim(),
    contentMd: data.contentMd.trim(),
    warnings,
    transcriptMode,
  } satisfies DraftPayload;
}

async function getKnowledgeArticleIdByExternalItem(
  supabase: SupabaseWritableClient,
  youtubeVideoId: string,
) {
  const { data, error } = await supabase
    .from("knowledge_articles")
    .select("id")
    .eq("external_provider", "youtube")
    .eq("external_item_id", youtubeVideoId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

async function createOrGetKnowledgeArticleForVideo(input: {
  supabase: SupabaseWritableClient;
  video: YouTubeVideoMetadata;
  channel: YouTubeChannelRow;
}) {
  const existingArticleId = await getKnowledgeArticleIdByExternalItem(
    input.supabase,
    input.video.youtubeVideoId,
  );

  if (existingArticleId) {
    return {
      knowledgeArticleId: existingArticleId,
      created: false,
      warnings: [] as string[],
      transcriptMode: "metadata" as TranscriptMode,
    };
  }

  const draft = await generateDraftForVideo(input);
  const slugBase = `${slugifyFragment(draft.title)}-${input.video.youtubeVideoId.toLowerCase()}`;
  const uniqueSlug = await resolveUniqueSlug(input.supabase, slugBase);
  const { data, error } = await input.supabase
    .from("knowledge_articles")
    .insert({
      slug: uniqueSlug,
      title: draft.title,
      summary: draft.summary,
      content_md: draft.contentMd,
      track: "external",
      topic: "examples-and-showcase",
      status: "published",
      featured: false,
      platform_tags: ["YouTube"],
      tool_tags: [input.channel.title, "YouTube"],
      resource_url: input.video.watchUrl,
      published_at: input.video.publishedAt,
      external_provider: "youtube",
      external_source_id: input.channel.youtube_channel_id,
      external_source_label: input.channel.title,
      external_item_id: input.video.youtubeVideoId,
    })
    .select("id")
    .maybeSingle();

  if (error && !isUniqueViolation(error)) {
    throw error;
  }

  const recoveredArticleId =
    data?.id ??
    (await getKnowledgeArticleIdByExternalItem(
      input.supabase,
      input.video.youtubeVideoId,
    ));

  if (!recoveredArticleId) {
    throw new Error(
      `Failed to resolve knowledge article id for video ${input.video.youtubeVideoId}`,
    );
  }

  return {
    knowledgeArticleId: recoveredArticleId,
    created: Boolean(data?.id),
    warnings: draft.warnings,
    transcriptMode: draft.transcriptMode,
  };
}

async function upsertYoutubeVideo(input: {
  supabase: SupabaseWritableClient;
  channelId: string;
  video: YouTubeVideoMetadata;
  transcriptMode: TranscriptMode;
  knowledgeArticleId: string;
}) {
  const { error } = await input.supabase.from("youtube_videos").upsert(
    {
      channel_id: input.channelId,
      youtube_video_id: input.video.youtubeVideoId,
      title: input.video.title,
      description: sanitizeText(input.video.description),
      published_at: input.video.publishedAt,
      watch_url: input.video.watchUrl,
      thumbnail_url: input.video.thumbnailUrl,
      transcript_mode: input.transcriptMode,
      knowledge_article_id: input.knowledgeArticleId,
    },
    {
      onConflict: "youtube_video_id",
    },
  );

  if (error) {
    throw error;
  }
}

async function fetchExistingVideoRows(
  supabase: SupabaseWritableClient,
  youtubeVideoIds: string[],
) {
  if (youtubeVideoIds.length === 0) {
    return [] as YouTubeVideoRow[];
  }

  const { data, error } = await supabase
    .from("youtube_videos")
    .select("youtube_video_id,knowledge_article_id")
    .in("youtube_video_id", youtubeVideoIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as YouTubeVideoRow[];
}

async function syncSingleChannel(input: {
  supabase: SupabaseWritableClient;
  channel: YouTubeChannelRow;
  mode: "backfill" | "daily";
}) {
  const videos = await listRecentYouTubeVideos({
    youtubeChannelId: input.channel.youtube_channel_id,
    maxResults: input.mode === "backfill" ? BACKFILL_MAX_RESULTS : DAILY_MAX_RESULTS,
    publishedAfter:
      input.mode === "daily" ? input.channel.last_video_published_at : null,
  });
  const nowIso = new Date().toISOString();

  if (videos.length === 0) {
    await input.supabase
      .from("youtube_channels")
      .update({
        last_synced_at: nowIso,
      })
      .eq("id", input.channel.id);

    return {
      createdArticles: 0,
      createdVideos: 0,
      skippedVideos: 0,
      warnings: [] as string[],
    } satisfies ChannelSyncStats;
  }

  const videoIds = videos.map((video) => video.youtubeVideoId);
  const existingRows = await fetchExistingVideoRows(input.supabase, videoIds);
  const existingIdSet = new Set(existingRows.map((row) => row.youtube_video_id));
  const idsMissingVideoRows = filterNewYouTubeVideoIds(videoIds, existingIdSet);
  const existingWithoutArticleIds = existingRows
    .filter((row) => !row.knowledge_article_id)
    .map((row) => row.youtube_video_id);
  const idsToProcess = new Set([
    ...idsMissingVideoRows,
    ...existingWithoutArticleIds,
  ]);
  const processTargets = videos.filter((video) =>
    idsToProcess.has(video.youtubeVideoId),
  );
  const warnings: string[] = [];
  let createdArticles = 0;
  let createdVideos = 0;
  const skippedVideos = videos.length - processTargets.length;

  for (const video of processTargets) {
    const articleResult = await createOrGetKnowledgeArticleForVideo({
      supabase: input.supabase,
      video,
      channel: input.channel,
    });

    await upsertYoutubeVideo({
      supabase: input.supabase,
      channelId: input.channel.id,
      video,
      transcriptMode: articleResult.transcriptMode,
      knowledgeArticleId: articleResult.knowledgeArticleId,
    });
    createdVideos += 1;
    createdArticles += articleResult.created ? 1 : 0;
    warnings.push(...articleResult.warnings);
  }

  const newestFetchedPublishedAt = videos[0]?.publishedAt ?? null;
  const nextLastVideoPublishedAt =
    newestFetchedPublishedAt &&
    (!input.channel.last_video_published_at ||
      new Date(newestFetchedPublishedAt).getTime() >
        new Date(input.channel.last_video_published_at).getTime())
      ? newestFetchedPublishedAt
      : input.channel.last_video_published_at;

  await input.supabase
    .from("youtube_channels")
    .update({
      last_synced_at: nowIso,
      last_video_published_at: nextLastVideoPublishedAt,
    })
    .eq("id", input.channel.id);

  return {
    createdArticles,
    createdVideos,
    skippedVideos,
    warnings,
  } satisfies ChannelSyncStats;
}

async function loadActiveChannels(
  supabase: SupabaseWritableClient,
  youtubeChannelId: string | null,
) {
  let query = supabase
    .from("youtube_channels")
    .select(
      "id,youtube_channel_id,title,handle,channel_url,thumbnail_url,is_active,last_synced_at,last_video_published_at",
    )
    .eq("is_active", true);

  if (youtubeChannelId) {
    query = query.eq("youtube_channel_id", youtubeChannelId);
  }

  const { data, error } = await query.order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as YouTubeChannelRow[];
}

async function processBackfillJob(
  supabase: SupabaseWritableClient,
  payload: Record<string, unknown> | null,
) {
  const parsedPayload = parseJobPayload(payload);
  const channels = await loadActiveChannels(supabase, parsedPayload.youtubeChannelId);
  let createdArticles = 0;
  let createdVideos = 0;
  let skippedVideos = 0;
  const warnings: string[] = [];

  for (const channel of channels) {
    const stats = await syncSingleChannel({
      supabase,
      channel,
      mode: "backfill",
    });
    createdArticles += stats.createdArticles;
    createdVideos += stats.createdVideos;
    skippedVideos += stats.skippedVideos;
    warnings.push(...stats.warnings);
  }

  return {
    createdArticles,
    createdVideos,
    skippedVideos,
    warnings,
  } satisfies ChannelSyncStats;
}

async function processDailyJob(
  supabase: SupabaseWritableClient,
  payload: Record<string, unknown> | null,
) {
  const parsedPayload = parseJobPayload(payload);
  const channels = await loadActiveChannels(supabase, parsedPayload.youtubeChannelId);
  let createdArticles = 0;
  let createdVideos = 0;
  let skippedVideos = 0;
  const warnings: string[] = [];

  for (const channel of channels) {
    const stats = await syncSingleChannel({
      supabase,
      channel,
      mode: "daily",
    });
    createdArticles += stats.createdArticles;
    createdVideos += stats.createdVideos;
    skippedVideos += stats.skippedVideos;
    warnings.push(...stats.warnings);
  }

  return {
    createdArticles,
    createdVideos,
    skippedVideos,
    warnings,
  } satisfies ChannelSyncStats;
}

async function markJobFailure(input: {
  supabase: SupabaseWritableClient;
  job: YouTubeSyncJobRow;
  attempts: number;
  errorMessage: string;
}) {
  const exhausted = input.attempts >= MAX_RETRY_ATTEMPTS;
  const backoffMinutes = withRetryBackoffMinutes(input.attempts);
  const nextSchedule = new Date(Date.now() + backoffMinutes * 60_000).toISOString();
  const { error } = await input.supabase
    .from("youtube_sync_jobs")
    .update({
      status: exhausted ? "failed" : "retrying",
      error: input.errorMessage.slice(0, 2_000),
      finished_at: exhausted ? new Date().toISOString() : null,
      scheduled_at: exhausted ? input.job.scheduled_at : nextSchedule,
    })
    .eq("id", input.job.id);

  if (error) {
    throw error;
  }
}

async function processClaimedJob(input: {
  supabase: SupabaseWritableClient;
  job: YouTubeSyncJobRow;
}) {
  if (input.job.job_type === "backfill") {
    return processBackfillJob(input.supabase, input.job.payload);
  }

  return processDailyJob(input.supabase, input.job.payload);
}

async function claimDueJobs(input: {
  supabase: SupabaseWritableClient;
  maxJobs: number;
}) {
  const { data, error } = await input.supabase
    .from("youtube_sync_jobs")
    .select("id,job_type,status,payload,attempts,scheduled_at")
    .in("status", ["pending", "retrying"])
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(Math.max(1, Math.min(input.maxJobs, 20)));

  if (error) {
    throw error;
  }

  return (data ?? []) as YouTubeSyncJobRow[];
}

async function incrementAndClaimJob(input: {
  supabase: SupabaseWritableClient;
  job: YouTubeSyncJobRow;
}) {
  const nextAttempts = Number(input.job.attempts ?? 0) + 1;
  const { data, error } = await input.supabase
    .from("youtube_sync_jobs")
    .update({
      status: "running",
      attempts: nextAttempts,
      started_at: new Date().toISOString(),
      finished_at: null,
      error: null,
    })
    .eq("id", input.job.id)
    .in("status", ["pending", "retrying"])
    .select("id,job_type,status,payload,attempts,scheduled_at")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as YouTubeSyncJobRow | null) ?? null;
}

export async function enqueueYoutubeSync(input: {
  jobType: SyncJobType;
  payload?: Record<string, unknown>;
  scheduledAt?: string;
}) {
  const supabase = await getWritableSupabaseClient();
  const youtubeChannelId =
    typeof input.payload?.youtubeChannelId === "string"
      ? input.payload.youtubeChannelId.trim()
      : "";

  if (input.jobType === "backfill" && youtubeChannelId) {
    const { data: existingJob, error: existingJobError } = await supabase
      .from("youtube_sync_jobs")
      .select("id,job_type,status,payload,attempts,scheduled_at")
      .eq("job_type", "backfill")
      .in("status", ["pending", "running", "retrying"])
      .contains("payload", { youtubeChannelId })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingJobError) {
      throw new Error(toErrorMessage(existingJobError));
    }

    if (existingJob) {
      return existingJob as YouTubeSyncJobRow;
    }
  }

  const { data, error } = await supabase
    .from("youtube_sync_jobs")
    .insert({
      job_type: input.jobType,
      status: "pending",
      payload: input.payload ?? {},
      scheduled_at: input.scheduledAt ?? new Date().toISOString(),
    })
    .select("id,job_type,status,payload,attempts,scheduled_at")
    .maybeSingle();

  if (error || !data) {
    const baseError = error ?? new Error("Failed to enqueue YouTube sync job.");
    throw new Error(toErrorMessage(baseError));
  }

  return data as YouTubeSyncJobRow;
}

function toChannelUpsert(channel: ResolvedYouTubeChannel) {
  return {
    youtube_channel_id: channel.youtubeChannelId,
    title: channel.title,
    handle: channel.handle,
    channel_url: channel.channelUrl,
    thumbnail_url: channel.thumbnailUrl,
    is_active: true,
  };
}

export async function registerYoutubeChannel(input: { channelInput: string }) {
  const supabase = await getWritableSupabaseClient();
  const resolved = await resolveYouTubeChannel(input.channelInput);

  if (!resolved) {
    throw new Error("Could not resolve YouTube channel from the provided input.");
  }

  const { data: existingChannel, error: existingChannelError } = await supabase
    .from("youtube_channels")
    .select(
      "id,youtube_channel_id,title,handle,channel_url,thumbnail_url,is_active,last_synced_at,last_video_published_at",
    )
    .eq("youtube_channel_id", resolved.youtubeChannelId)
    .maybeSingle();

  if (existingChannelError) {
    throw new Error(toErrorMessage(existingChannelError));
  }

  const { data: channel, error: upsertError } = await supabase
    .from("youtube_channels")
    .upsert(toChannelUpsert(resolved), {
      onConflict: "youtube_channel_id",
    })
    .select(
      "id,youtube_channel_id,title,handle,channel_url,thumbnail_url,is_active,last_synced_at,last_video_published_at",
    )
    .maybeSingle();

  if (upsertError || !channel) {
    const baseError =
      upsertError ?? new Error("Failed to upsert YouTube channel.");
    throw new Error(toErrorMessage(baseError));
  }
  const isNewChannel = !existingChannel;

  return {
    channel: channel as YouTubeChannelRow,
    job: null,
    isNewChannel,
  };
}

export async function runYoutubeSyncWorker(input?: { maxJobs?: number }) {
  const supabase = requireSupabaseAdminClient();
  const maxJobs = Math.max(1, Math.min(input?.maxJobs ?? 5, 20));
  const result = makeEmptyWorkerResult();
  const dueJobs = await claimDueJobs({
    supabase,
    maxJobs,
  });

  for (const dueJob of dueJobs) {
    const claimed = await incrementAndClaimJob({
      supabase,
      job: dueJob,
    });

    if (!claimed) {
      continue;
    }

    result.processedJobs += 1;

    try {
      const stats = await processClaimedJob({
        supabase,
        job: claimed,
      });

      result.createdArticles += stats.createdArticles;
      result.createdVideos += stats.createdVideos;
      result.skippedVideos += stats.skippedVideos;
      result.warnings.push(...stats.warnings);

      const { error: completeError } = await supabase
        .from("youtube_sync_jobs")
        .update({
          status: "completed",
          error: null,
          finished_at: new Date().toISOString(),
        })
        .eq("id", claimed.id);

      if (completeError) {
        throw completeError;
      }

      result.completedJobs += 1;
    } catch (error) {
      await markJobFailure({
        supabase,
        job: claimed,
        attempts: claimed.attempts,
        errorMessage: toErrorMessage(error),
      });
      result.failedJobs += 1;
      result.warnings.push(`Job ${claimed.id} failed: ${toErrorMessage(error)}`);
    }
  }

  return result;
}

export async function runYoutubeDailySync() {
  await enqueueYoutubeSync({
    jobType: "daily",
    payload: {
      source: "daily-sync",
    },
  });

  return runYoutubeSyncWorker({
    maxJobs: 8,
  });
}

export async function rerunYoutubeSummaries(input?: {
  youtubeChannelId?: string;
  limit?: number;
  onlyFallback?: boolean;
}) {
  const supabase = requireSupabaseAdminClient();
  const result = makeEmptyResummarizeResult();
  const limit = Math.max(1, Math.min(input?.limit ?? 30, 200));
  const onlyFallback = input?.onlyFallback ?? true;
  let query = supabase
    .from("youtube_videos")
    .select(
      "id,channel_id,youtube_video_id,title,description,published_at,watch_url,thumbnail_url,transcript_mode,knowledge_article_id,youtube_channels!inner(id,youtube_channel_id,title,handle,channel_url,thumbnail_url,is_active,last_synced_at,last_video_published_at)",
    )
    .not("knowledge_article_id", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (input?.youtubeChannelId) {
    query = query.eq("youtube_channels.youtube_channel_id", input.youtubeChannelId);
  }

  const { data: videos, error: videosError } = await query;

  if (videosError) {
    throw new Error(toErrorMessage(videosError));
  }

  for (const row of videos ?? []) {
    result.scannedVideos += 1;
    const knowledgeArticleId =
      typeof row.knowledge_article_id === "string" ? row.knowledge_article_id : "";

    if (!knowledgeArticleId) {
      result.skippedArticles += 1;
      continue;
    }

    const { data: article, error: articleError } = await supabase
      .from("knowledge_articles")
      .select("id,content_md")
      .eq("id", knowledgeArticleId)
      .maybeSingle();

    if (articleError || !article) {
      result.failedArticles += 1;
      result.warnings.push(
        `Article fetch failed for ${knowledgeArticleId}: ${toErrorMessage(articleError)}`,
      );
      continue;
    }

    if (onlyFallback && !isLikelyFallbackArticle(article.content_md)) {
      result.skippedArticles += 1;
      continue;
    }

    const joinedChannel = Array.isArray(row.youtube_channels)
      ? row.youtube_channels[0]
      : row.youtube_channels;

    if (!joinedChannel || typeof joinedChannel.youtube_channel_id !== "string") {
      result.failedArticles += 1;
      result.warnings.push(
        `Channel relation missing for video ${row.youtube_video_id}`,
      );
      continue;
    }

    const channel: YouTubeChannelRow = {
      id: String(joinedChannel.id),
      youtube_channel_id: String(joinedChannel.youtube_channel_id),
      title: String(joinedChannel.title ?? ""),
      handle:
        typeof joinedChannel.handle === "string" ? joinedChannel.handle : null,
      channel_url: String(joinedChannel.channel_url ?? ""),
      thumbnail_url:
        typeof joinedChannel.thumbnail_url === "string"
          ? joinedChannel.thumbnail_url
          : null,
      is_active: Boolean(joinedChannel.is_active),
      last_synced_at:
        typeof joinedChannel.last_synced_at === "string"
          ? joinedChannel.last_synced_at
          : null,
      last_video_published_at:
        typeof joinedChannel.last_video_published_at === "string"
          ? joinedChannel.last_video_published_at
          : null,
    };

    const video: YouTubeVideoMetadata = {
      youtubeVideoId: String(row.youtube_video_id),
      title: String(row.title ?? ""),
      description: sanitizeText(row.description),
      publishedAt: String(row.published_at),
      watchUrl: String(row.watch_url),
      thumbnailUrl:
        typeof row.thumbnail_url === "string" ? row.thumbnail_url : null,
    };

    try {
      const draft = await generateDraftForVideo({
        supabase,
        video,
        channel,
      });
      const { error: updateArticleError } = await supabase
        .from("knowledge_articles")
        .update({
          title: draft.title,
          summary: draft.summary,
          content_md: draft.contentMd,
          updated_at: new Date().toISOString(),
        })
        .eq("id", knowledgeArticleId);

      if (updateArticleError) {
        throw updateArticleError;
      }

      const { error: updateVideoError } = await supabase
        .from("youtube_videos")
        .update({
          transcript_mode: draft.transcriptMode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (updateVideoError) {
        throw updateVideoError;
      }

      result.updatedArticles += 1;
      result.warnings.push(...draft.warnings);
    } catch (error) {
      result.failedArticles += 1;
      result.warnings.push(
        `Resummarize failed for ${video.youtubeVideoId}: ${toErrorMessage(error)}`,
      );
    }
  }

  return result;
}



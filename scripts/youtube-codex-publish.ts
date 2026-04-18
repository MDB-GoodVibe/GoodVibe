import { readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

type DraftItem = {
  channel: {
    id: string;
    youtubeChannelId: string;
    title: string;
    url: string;
  };
  video: {
    youtubeVideoId: string;
    title: string;
    description: string;
    publishedAt: string;
    watchUrl: string;
    thumbnailUrl: string | null;
  };
  transcriptMode: "captions" | "metadata";
  summary: string;
  contentMd: string;
  title?: string;
};

function hasBrokenKoreanText(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  // Typical mojibake/replacement markers from wrong encoding conversions.
  if (trimmed.includes("�") || /\?{2,}/.test(trimmed)) {
    return true;
  }

  return false;
}

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function getArg(name: string) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function slugify(input: string) {
  const lower = input.toLowerCase();
  const replaced = lower
    .replace(/[\u3131-\u318e]/g, "")
    .replace(/[^a-z0-9\uac00-\ud7a3]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return replaced.length > 0 ? replaced : "youtube-note";
}

async function resolveUniqueSlug(
  supabase: ReturnType<typeof createClient>,
  desiredSlug: string,
) {
  let candidate = desiredSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("knowledge_articles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return candidate;

    candidate = `${desiredSlug}-${suffix}`;
    suffix += 1;
  }
}

async function main() {
  loadLocalEnv();

  const inputArg = getArg("input");
  if (!inputArg) {
    throw new Error("Pass --input=<draft json path>");
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  const raw = readFileSync(inputPath, "utf8");
  const parsed = JSON.parse(raw) as {
    drafts?: DraftItem[];
    channelRuns?: Array<{
      channelId: string;
      newestFetchedPublishedAt: string | null;
    }>;
  };

  const drafts = Array.isArray(parsed.drafts) ? parsed.drafts : [];
  if (drafts.length === 0) {
    throw new Error("No drafts found in input file.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required.");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let createdArticles = 0;
  let updatedArticles = 0;
  let upsertedVideos = 0;
  let skipped = 0;
  const warnings: string[] = [];

  for (const draft of drafts) {
    const videoId = draft.video?.youtubeVideoId?.trim();
    const channelId = draft.channel?.id?.trim();
    const summary = draft.summary?.trim();
    const contentMd = draft.contentMd?.trim();

    if (!videoId || !channelId || !summary || !contentMd) {
      skipped += 1;
      warnings.push(`Skipped invalid draft item: ${videoId ?? "unknown"}`);
      continue;
    }

    const finalTitle = (draft.title?.trim() || draft.video.title || "").trim();
    if (!finalTitle) {
      skipped += 1;
      warnings.push(`Skipped draft with empty title: ${videoId}`);
      continue;
    }

    if (hasBrokenKoreanText(summary) || hasBrokenKoreanText(contentMd)) {
      skipped += 1;
      warnings.push(
        `Skipped broken-encoding draft: ${videoId} (summary/content contains replacement markers)`,
      );
      continue;
    }

    const { data: existingArticle, error: existingArticleError } = await supabase
      .from("knowledge_articles")
      .select("id")
      .eq("external_provider", "youtube")
      .eq("external_item_id", videoId)
      .maybeSingle();

    if (existingArticleError) {
      throw new Error(existingArticleError.message);
    }

    let knowledgeArticleId = existingArticle?.id ?? null;

    if (!knowledgeArticleId) {
      const slugBase = `${slugify(finalTitle)}-${videoId.toLowerCase()}`;
      const uniqueSlug = await resolveUniqueSlug(supabase, slugBase);

      const { data: insertedArticle, error: insertArticleError } = await supabase
        .from("knowledge_articles")
        .insert({
          slug: uniqueSlug,
          title: finalTitle,
          summary,
          content_md: contentMd,
          track: "external",
          topic: "examples-and-showcase",
          status: "published",
          featured: false,
          platform_tags: ["YouTube"],
          tool_tags: [draft.channel.title, "YouTube"],
          resource_url: draft.video.watchUrl,
          published_at: draft.video.publishedAt,
          external_provider: "youtube",
          external_source_id: draft.channel.youtubeChannelId,
          external_source_label: draft.channel.title,
          external_item_id: videoId,
        })
        .select("id")
        .maybeSingle();

      if (insertArticleError || !insertedArticle?.id) {
        throw new Error(
          insertArticleError?.message ??
            `Failed to insert article for video ${videoId}`,
        );
      }

      knowledgeArticleId = insertedArticle.id;
      createdArticles += 1;
    } else {
      const { error: updateArticleError } = await supabase
        .from("knowledge_articles")
        .update({
          title: finalTitle,
          summary,
          content_md: contentMd,
          resource_url: draft.video.watchUrl,
          published_at: draft.video.publishedAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", knowledgeArticleId);

      if (updateArticleError) {
        throw new Error(updateArticleError.message);
      }

      updatedArticles += 1;
    }

    const { error: upsertVideoError } = await supabase.from("youtube_videos").upsert(
      {
        channel_id: channelId,
        youtube_video_id: videoId,
        title: draft.video.title,
        description: draft.video.description ?? "",
        published_at: draft.video.publishedAt,
        watch_url: draft.video.watchUrl,
        thumbnail_url: draft.video.thumbnailUrl,
        transcript_mode: draft.transcriptMode ?? "metadata",
        knowledge_article_id: knowledgeArticleId,
      },
      { onConflict: "youtube_video_id" },
    );

    if (upsertVideoError) {
      throw new Error(upsertVideoError.message);
    }

    upsertedVideos += 1;
  }

  const grouped = new Map<string, string | null>();
  for (const row of parsed.channelRuns ?? []) {
    if (!row.channelId) continue;
    const prev = grouped.get(row.channelId);
    const current = row.newestFetchedPublishedAt;
    if (!prev) {
      grouped.set(row.channelId, current);
      continue;
    }
    if (current && new Date(current).getTime() > new Date(prev).getTime()) {
      grouped.set(row.channelId, current);
    }
  }

  for (const [channelId, newestFetchedPublishedAt] of grouped.entries()) {
    const { data: channel, error: channelError } = await supabase
      .from("youtube_channels")
      .select("last_video_published_at")
      .eq("id", channelId)
      .maybeSingle();

    if (channelError) {
      throw new Error(channelError.message);
    }

    const prev = channel?.last_video_published_at ?? null;
    const nextLastVideoPublishedAt =
      newestFetchedPublishedAt &&
      (!prev ||
        new Date(newestFetchedPublishedAt).getTime() > new Date(prev).getTime())
        ? newestFetchedPublishedAt
        : prev;

    const { error: updateChannelError } = await supabase
      .from("youtube_channels")
      .update({
        last_synced_at: new Date().toISOString(),
        last_video_published_at: nextLastVideoPublishedAt,
      })
      .eq("id", channelId);

    if (updateChannelError) {
      throw new Error(updateChannelError.message);
    }
  }

  console.log("YouTube Codex publish completed.");
  console.log(
    JSON.stringify(
      {
        inputPath,
        createdArticles,
        updatedArticles,
        upsertedVideos,
        skipped,
        warnings,
      },
      null,
      2,
    ),
  );
}

void main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Unknown youtube-codex-publish error",
  );
  process.exit(1);
});

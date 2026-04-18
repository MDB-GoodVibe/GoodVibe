import { readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

type TranscriptMode = "captions" | "metadata";

type YoutubeVideoRow = {
  id: string;
  youtube_video_id: string;
  title: string;
  description: string | null;
  published_at: string;
  watch_url: string;
  transcript_mode: TranscriptMode;
  knowledge_article_id: string | null;
  youtube_channels:
    | {
        youtube_channel_id: string;
        title: string;
      }
    | Array<{
        youtube_channel_id: string;
        title: string;
      }>;
};

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function getArg(name: string) {
  const prefix = `--${name}=`;
  const matched = process.argv.find((arg) => arg.startsWith(prefix));
  return matched ? matched.slice(prefix.length) : null;
}

function sanitizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function normalizeSummaryText(value: string) {
  return value
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/www\.\S+/gi, " ")
    .replace(/[#@][\p{Letter}\p{Number}_-]+/gu, " ")
    .replace(/[|•·]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isPromotionalLine(value: string) {
  const lowered = value.toLowerCase();
  const patterns = [
    "구독",
    "좋아요",
    "알림",
    "댓글",
    "문의",
    "협찬",
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
    "## 요약",
    "## 영상 핵심 내용",
    "## 메모",
    "## 원문 링크",
  ];

  return markers.some((marker) => content.includes(marker));
}

function buildFallbackDraft(input: {
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  watchUrl: string;
  transcriptMode: TranscriptMode;
}) {
  const cleanSummary = extractUsefulDescription(input.description);
  const summary =
    cleanSummary.length > 0
      ? cleanSummary.slice(0, 240)
      : `${input.channelTitle} 채널의 신규 영상입니다. 메타데이터 기반으로 요약했습니다.`;

  return {
    title: input.title,
    summary,
    contentMd: [
      "## 요약",
      summary,
      "",
      "## 영상 핵심 내용",
      cleanSummary.length > 0
        ? cleanSummary
        : "영상 설명에서 핵심 문장을 충분히 추출하지 못했습니다.",
      "",
      "## 메모",
      `- 채널: ${input.channelTitle}`,
      `- 게시일: ${input.publishedAt}`,
      `- 요약 방식: ${input.transcriptMode === "captions" ? "자막 기반" : "메타데이터 기반"}`,
      "",
      "## 원문 링크",
      `- 영상: ${input.watchUrl}`,
    ].join("\n"),
  };
}

async function main() {
  loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required.");
  }

  const limitArg = Number(getArg("limit") ?? "50");
  const channelIdArg = getArg("channelId");
  const onlyFallbackArg = getArg("onlyFallback");
  const onlyFallback =
    onlyFallbackArg === null
      ? true
      : onlyFallbackArg.toLowerCase() !== "false";

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  let query = supabase
    .from("youtube_videos")
    .select(
      "id,youtube_video_id,title,description,published_at,watch_url,transcript_mode,knowledge_article_id,youtube_channels!inner(youtube_channel_id,title)",
    )
    .not("knowledge_article_id", "is", null)
    .order("published_at", { ascending: false })
    .limit(Math.max(1, Math.min(Number.isFinite(limitArg) ? limitArg : 50, 200)));

  if (channelIdArg) {
    query = query.eq("youtube_channels.youtube_channel_id", channelIdArg);
  }

  const { data: videos, error: videosError } = await query;

  if (videosError) {
    throw new Error(videosError.message);
  }

  const result = {
    scannedVideos: 0,
    updatedArticles: 0,
    skippedArticles: 0,
    failedArticles: 0,
    warnings: [] as string[],
  };

  for (const row of (videos ?? []) as YoutubeVideoRow[]) {
    result.scannedVideos += 1;

    if (!row.knowledge_article_id) {
      result.skippedArticles += 1;
      continue;
    }

    const { data: article, error: articleError } = await supabase
      .from("knowledge_articles")
      .select("id,content_md")
      .eq("id", row.knowledge_article_id)
      .maybeSingle();

    if (articleError || !article) {
      result.failedArticles += 1;
      result.warnings.push(
        `Article fetch failed for ${row.knowledge_article_id}: ${articleError?.message ?? "not found"}`,
      );
      continue;
    }

    if (onlyFallback && !isLikelyFallbackArticle(article.content_md)) {
      result.skippedArticles += 1;
      continue;
    }

    const channel = Array.isArray(row.youtube_channels)
      ? row.youtube_channels[0]
      : row.youtube_channels;

    if (!channel?.youtube_channel_id || !channel?.title) {
      result.failedArticles += 1;
      result.warnings.push(`Channel relation missing for video ${row.youtube_video_id}`);
      continue;
    }

    const cleanedDescription = extractUsefulDescription(sanitizeText(row.description));

    let draft:
      | {
          title: string;
          summary: string;
          contentMd: string;
          transcriptMode: TranscriptMode;
        }
      | null = null;

    try {
      const details = [
        `YouTube channel: ${channel.title}`,
        `YouTube channel id: ${channel.youtube_channel_id}`,
        `Video id: ${row.youtube_video_id}`,
        `Video published at: ${row.published_at}`,
        cleanedDescription
          ? `Cleaned description:\n${cleanedDescription}`
          : "Description not available. Please summarize from title and metadata.",
      ].join("\n\n");

      const { data: aiData, error: aiError } = await supabase.functions.invoke(
        "generate-knowledge-draft",
        {
          body: {
            track: "external",
            topic: "examples-and-showcase",
            titleHint: row.title,
            summaryHint: cleanedDescription.slice(0, 600),
            details,
            resourceUrl: row.watch_url,
            resourceTaxonomy: {
              channelLabel: "YouTube",
              categoryLabel: "External",
              subcategoryLabel: channel.title,
              sourceName: channel.title,
              confidence: "medium",
              matchedSignals: ["youtube.com", channel.youtube_channel_id, row.youtube_video_id],
            },
          },
        },
      );

      const validAiDraft =
        !aiError &&
        typeof aiData?.title === "string" &&
        typeof aiData?.summary === "string" &&
        typeof aiData?.contentMd === "string" &&
        aiData.title.trim().length > 0 &&
        aiData.summary.trim().length > 0 &&
        aiData.contentMd.trim().length > 0;

      if (validAiDraft) {
        draft = {
          title: aiData.title.trim(),
          summary: aiData.summary.trim(),
          contentMd: aiData.contentMd.trim(),
          transcriptMode: row.transcript_mode ?? "metadata",
        };
      }
    } catch {
      draft = null;
    }

    if (!draft) {
      const fallback = buildFallbackDraft({
        title: row.title,
        description: sanitizeText(row.description),
        channelTitle: channel.title,
        publishedAt: row.published_at,
        watchUrl: row.watch_url,
        transcriptMode: row.transcript_mode ?? "metadata",
      });

      draft = {
        ...fallback,
        transcriptMode: row.transcript_mode ?? "metadata",
      };

      result.warnings.push(`AI draft fallback used for ${row.youtube_video_id}`);
    }

    const { error: updateArticleError } = await supabase
      .from("knowledge_articles")
      .update({
        title: draft.title,
        summary: draft.summary,
        content_md: draft.contentMd,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.knowledge_article_id);

    if (updateArticleError) {
      result.failedArticles += 1;
      result.warnings.push(
        `Article update failed for ${row.knowledge_article_id}: ${updateArticleError.message}`,
      );
      continue;
    }

    result.updatedArticles += 1;
  }

  console.log("YouTube re-summarize completed.");
  console.log(JSON.stringify(result, null, 2));
}

void main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Unknown YouTube re-summarize error",
  );
  process.exit(1);
});


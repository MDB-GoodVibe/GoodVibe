import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import { listRecentYouTubeVideos } from "@/lib/youtube/api";
import { fetchYouTubeTranscript } from "@/lib/youtube/transcript";

type ChannelRow = {
  id: string;
  youtube_channel_id: string;
  title: string;
  channel_url: string;
  last_synced_at: string | null;
  last_video_published_at: string | null;
};

type ExistingVideoRow = {
  youtube_video_id: string;
};

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

async function main() {
  loadLocalEnv();

  const outputArg = getArg("output");
  const channelIdArg = getArg("channelId");
  const outputPath = path.resolve(
    process.cwd(),
    outputArg ?? ".tmp/youtube-codex-pending.json",
  );

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

  let channelQuery = supabase
    .from("youtube_channels")
    .select(
      "id,youtube_channel_id,title,channel_url,last_synced_at,last_video_published_at",
    )
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (channelIdArg) {
    channelQuery = channelQuery.eq("youtube_channel_id", channelIdArg);
  }

  const { data: channels, error: channelsError } = await channelQuery;
  if (channelsError) {
    throw new Error(`Failed to load channels: ${channelsError.message}`);
  }

  const pendingItems: Array<Record<string, unknown>> = [];
  const channelRuns: Array<Record<string, unknown>> = [];
  let totalFetchedVideos = 0;

  for (const channel of (channels ?? []) as ChannelRow[]) {
    const { count: existingCount, error: existingCountError } = await supabase
      .from("youtube_videos")
      .select("id", { head: true, count: "exact" })
      .eq("channel_id", channel.id);

    if (existingCountError) {
      throw new Error(
        `Failed to count existing videos for ${channel.youtube_channel_id}: ${existingCountError.message}`,
      );
    }

    const isInitial = (existingCount ?? 0) === 0;
    const fetched = await listRecentYouTubeVideos({
      youtubeChannelId: channel.youtube_channel_id,
      maxResults: 10,
      publishedAfter: isInitial ? null : channel.last_video_published_at,
    });
    totalFetchedVideos += fetched.length;

    const fetchedIds = fetched.map((item) => item.youtubeVideoId);
    let existingRows: ExistingVideoRow[] = [];

    if (fetchedIds.length > 0) {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("youtube_video_id")
        .in("youtube_video_id", fetchedIds);

      if (error) {
        throw new Error(
          `Failed to load existing videos for ${channel.youtube_channel_id}: ${error.message}`,
        );
      }

      existingRows = (data ?? []) as ExistingVideoRow[];
    }

    const existingSet = new Set(existingRows.map((row) => row.youtube_video_id));
    const targets = fetched.filter((video) => !existingSet.has(video.youtubeVideoId));

    for (const video of targets) {
      const transcript = await fetchYouTubeTranscript({
        youtubeVideoId: video.youtubeVideoId,
      });

      pendingItems.push({
        channel: {
          id: channel.id,
          youtubeChannelId: channel.youtube_channel_id,
          title: channel.title,
          url: channel.channel_url,
          isInitial,
        },
        video: {
          youtubeVideoId: video.youtubeVideoId,
          title: video.title,
          description: video.description,
          publishedAt: video.publishedAt,
          watchUrl: video.watchUrl,
          thumbnailUrl: video.thumbnailUrl,
        },
        transcript: transcript.transcript ?? "",
        transcriptMode: transcript.transcriptMode,
        transcriptLanguage: transcript.languageCode,
      });
    }

    channelRuns.push({
      channelId: channel.id,
      youtubeChannelId: channel.youtube_channel_id,
      title: channel.title,
      isInitial,
      fetchedCount: fetched.length,
      newTargetCount: targets.length,
      newestFetchedPublishedAt: fetched[0]?.publishedAt ?? null,
    });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    summaryTemplateVersion: "youtube-codex-v1-ko",
    instructions: {
      language: "ko",
      outputRequiredFields: [
        "youtubeVideoId",
        "title",
        "summary",
        "contentMd",
        "transcriptMode",
      ],
    },
    channelRuns,
    pendingItems,
    stats: {
      channelCount: (channels ?? []).length,
      fetchedVideoCount: totalFetchedVideos,
      pendingItemCount: pendingItems.length,
    },
  };

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log("YouTube Codex collect completed.");
  console.log(
    JSON.stringify(
      {
        outputPath,
        stats: payload.stats,
      },
      null,
      2,
    ),
  );
}

void main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Unknown youtube-codex-collect error",
  );
  process.exit(1);
});

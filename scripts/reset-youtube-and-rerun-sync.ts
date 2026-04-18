import { readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import {
  registerYoutubeChannel,
  runYoutubeDailySync,
} from "@/lib/youtube/sync";

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

async function main() {
  loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required.");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: existingChannels, error: channelsError } = await supabase
    .from("youtube_channels")
    .select("youtube_channel_id,title,channel_url")
    .order("created_at", { ascending: true });

  if (channelsError) {
    throw new Error(`Failed to load existing channels: ${channelsError.message}`);
  }

  const channelInputArg = getArg("channel");
  const skipSyncArg = getArg("skipSync");
  const skipSync =
    skipSyncArg !== null && skipSyncArg.toLowerCase() !== "false";
  const fallbackChannelInput =
    existingChannels && existingChannels.length === 1
      ? existingChannels[0]?.channel_url ?? null
      : null;
  const channelInput = channelInputArg ?? fallbackChannelInput;

  if (!channelInput) {
    throw new Error(
      "Pass --channel=<youtube channel url or handle>. Existing channel auto-detect works only when exactly one channel is registered.",
    );
  }

  const { data: linkedVideos, error: linkedVideosError } = await supabase
    .from("youtube_videos")
    .select("knowledge_article_id")
    .not("knowledge_article_id", "is", null);

  if (linkedVideosError) {
    throw new Error(
      `Failed to load linked knowledge article ids: ${linkedVideosError.message}`,
    );
  }

  const articleIds = (linkedVideos ?? [])
    .map((row) => row.knowledge_article_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  const { error: deleteJobsError, count: deletedJobs } = await supabase
    .from("youtube_sync_jobs")
    .delete({ count: "exact" })
    .not("id", "is", null);

  if (deleteJobsError) {
    throw new Error(`Failed to delete youtube_sync_jobs: ${deleteJobsError.message}`);
  }

  const { error: deleteVideosError, count: deletedVideos } = await supabase
    .from("youtube_videos")
    .delete({ count: "exact" })
    .not("id", "is", null);

  if (deleteVideosError) {
    throw new Error(`Failed to delete youtube_videos: ${deleteVideosError.message}`);
  }

  const { error: deleteChannelsError, count: deletedChannels } = await supabase
    .from("youtube_channels")
    .delete({ count: "exact" })
    .not("id", "is", null);

  if (deleteChannelsError) {
    throw new Error(
      `Failed to delete youtube_channels: ${deleteChannelsError.message}`,
    );
  }

  const deletedArticleIds = new Set<string>();
  const { error: deleteExternalArticlesError, data: deletedExternalRows } =
    await supabase
      .from("knowledge_articles")
      .delete()
      .eq("external_provider", "youtube")
      .select("id");

  if (deleteExternalArticlesError) {
    throw new Error(
      `Failed to delete youtube external articles: ${deleteExternalArticlesError.message}`,
    );
  }

  for (const row of deletedExternalRows ?? []) {
    if (typeof row.id === "string") {
      deletedArticleIds.add(row.id);
    }
  }

  const orphanArticleIds = articleIds.filter((id) => !deletedArticleIds.has(id));
  if (orphanArticleIds.length > 0) {
    const { error: deleteLinkedArticlesError, data: deletedLinkedRows } =
      await supabase
        .from("knowledge_articles")
        .delete()
        .in("id", orphanArticleIds)
        .select("id");

    if (deleteLinkedArticlesError) {
      throw new Error(
        `Failed to delete linked youtube articles: ${deleteLinkedArticlesError.message}`,
      );
    }

    for (const row of deletedLinkedRows ?? []) {
      if (typeof row.id === "string") {
        deletedArticleIds.add(row.id);
      }
    }
  }

  const registerResult = await registerYoutubeChannel({
    channelInput,
  });

  const syncResult = skipSync ? null : await runYoutubeDailySync();

  console.log("YouTube reset + re-register + daily sync completed.");
  console.log(
    JSON.stringify(
      {
        requestedChannelInput: channelInput,
        deleted: {
          channels: deletedChannels ?? 0,
          videos: deletedVideos ?? 0,
          jobs: deletedJobs ?? 0,
          articles: deletedArticleIds.size,
        },
        registeredChannel: {
          youtubeChannelId: registerResult.channel.youtube_channel_id,
          title: registerResult.channel.title,
          isNewChannel: registerResult.isNewChannel,
        },
        skipSync,
        syncResult,
      },
      null,
      2,
    ),
  );
}

void main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Unknown YouTube reset + rerun sync error",
  );
  process.exit(1);
});

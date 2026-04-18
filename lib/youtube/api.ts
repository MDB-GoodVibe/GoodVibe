
import { getYouTubeRuntime } from "@/lib/youtube/config";
import {
  buildYouTubeChannelUrl,
  buildYouTubeWatchUrl,
  parseYouTubeChannelInput,
} from "@/lib/youtube/utils";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

type ThumbnailMap = {
  default?: { url?: string };
  medium?: { url?: string };
  high?: { url?: string };
  standard?: { url?: string };
  maxres?: { url?: string };
};

type ChannelSnippet = {
  title?: string;
  customUrl?: string;
  thumbnails?: ThumbnailMap;
};

type VideoSnippet = {
  title?: string;
  description?: string;
  publishedAt?: string;
  thumbnails?: ThumbnailMap;
  channelId?: string;
};

type SearchItem = {
  id?: {
    kind?: string;
    channelId?: string;
    videoId?: string;
  };
  snippet?: VideoSnippet;
};

export type ResolvedYouTubeChannel = {
  youtubeChannelId: string;
  title: string;
  handle: string | null;
  channelUrl: string;
  thumbnailUrl: string | null;
};

export type YouTubeVideoMetadata = {
  youtubeVideoId: string;
  title: string;
  description: string;
  publishedAt: string;
  watchUrl: string;
  thumbnailUrl: string | null;
};

function pickThumbnailUrl(thumbnails: ThumbnailMap | undefined) {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    null
  );
}

function normalizeHandle(snippet: ChannelSnippet | undefined) {
  const rawHandle = snippet?.customUrl?.trim();

  if (!rawHandle) {
    return null;
  }

  return rawHandle.replace(/^@+/, "").toLowerCase();
}

async function fetchYouTubeJson<T>(path: string, searchParams: URLSearchParams) {
  const runtime = getYouTubeRuntime();

  if (!runtime.apiKey) {
    throw new Error("YOUTUBE_API_KEY is required for YouTube sync.");
  }

  searchParams.set("key", runtime.apiKey);
  const requestUrl = `${YOUTUBE_API_BASE_URL}/${path}?${searchParams.toString()}`;
  const response = await fetch(requestUrl, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`YouTube API request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

async function fetchChannelById(youtubeChannelId: string) {
  const data = await fetchYouTubeJson<{
    items?: Array<{
      id?: string;
      snippet?: ChannelSnippet;
    }>;
  }>("channels", new URLSearchParams({
    part: "snippet",
    id: youtubeChannelId,
    maxResults: "1",
  }));

  const item = data.items?.[0];
  if (!item) {
    return null;
  }

  const channelId = item.id?.trim();

  if (!channelId) {
    return null;
  }

  const title = item.snippet?.title?.trim() || channelId;
  const handle = normalizeHandle(item.snippet);

  return {
    youtubeChannelId: channelId,
    title,
    handle,
    channelUrl:
      buildYouTubeChannelUrl({ handle, channelId }) ??
      `https://www.youtube.com/channel/${channelId}`,
    thumbnailUrl: pickThumbnailUrl(item.snippet?.thumbnails),
  } satisfies ResolvedYouTubeChannel;
}

async function fetchChannelByHandle(handle: string) {
  const data = await fetchYouTubeJson<{
    items?: Array<{
      id?: string;
      snippet?: ChannelSnippet;
    }>;
  }>("channels", new URLSearchParams({
    part: "snippet",
    forHandle: handle,
    maxResults: "1",
  }));

  const item = data.items?.[0];
  if (!item) {
    return null;
  }

  const channelId = item.id?.trim();

  if (!channelId) {
    return null;
  }

  const title = item.snippet?.title?.trim() || channelId;
  const normalizedHandle = normalizeHandle(item.snippet) ?? handle;

  return {
    youtubeChannelId: channelId,
    title,
    handle: normalizedHandle,
    channelUrl:
      buildYouTubeChannelUrl({ handle: normalizedHandle, channelId }) ??
      `https://www.youtube.com/channel/${channelId}`,
    thumbnailUrl: pickThumbnailUrl(item.snippet?.thumbnails),
  } satisfies ResolvedYouTubeChannel;
}

async function fetchChannelBySearchQuery(query: string) {
  const data = await fetchYouTubeJson<{ items?: SearchItem[] }>(
    "search",
    new URLSearchParams({
      part: "snippet",
      type: "channel",
      q: query,
      maxResults: "1",
      order: "relevance",
    }),
  );
  const channelItem = data.items?.find(
    (item) => item.id?.kind === "youtube#channel" && Boolean(item.id.channelId),
  );
  const channelId = channelItem?.id?.channelId?.trim();

  if (!channelId) {
    return null;
  }

  return fetchChannelById(channelId);
}

async function fetchChannelByVideoId(videoId: string) {
  const data = await fetchYouTubeJson<{
    items?: Array<{
      id?: string;
      snippet?: VideoSnippet;
    }>;
  }>("videos", new URLSearchParams({
    part: "snippet",
    id: videoId,
    maxResults: "1",
  }));

  const channelId = data.items?.[0]?.snippet?.channelId?.trim();
  return channelId ? fetchChannelById(channelId) : null;
}

export async function resolveYouTubeChannel(input: string) {
  const parsed = parseYouTubeChannelInput(input);

  if (!parsed.raw) {
    return null;
  }

  if (parsed.channelId) {
    return fetchChannelById(parsed.channelId);
  }

  if (parsed.handle) {
    return fetchChannelByHandle(parsed.handle);
  }

  if (parsed.watchVideoId) {
    return fetchChannelByVideoId(parsed.watchVideoId);
  }

  if (parsed.searchQuery) {
    return fetchChannelBySearchQuery(parsed.searchQuery);
  }

  return null;
}

export async function listRecentYouTubeVideos(input: {
  youtubeChannelId: string;
  maxResults?: number;
  publishedAfter?: string | null;
}) {
  const maxResults = Math.max(1, Math.min(input.maxResults ?? 10, 50));
  const params = new URLSearchParams({
    part: "snippet",
    channelId: input.youtubeChannelId,
    type: "video",
    order: "date",
    maxResults: String(maxResults),
  });

  if (input.publishedAfter) {
    params.set("publishedAfter", input.publishedAfter);
  }

  const data = await fetchYouTubeJson<{ items?: SearchItem[] }>("search", params);
  const videos = (data.items ?? [])
    .map((item) => {
      const videoId = item.id?.videoId?.trim();
      const title = item.snippet?.title?.trim();
      const publishedAt = item.snippet?.publishedAt?.trim();

      if (!videoId || !title || !publishedAt) {
        return null;
      }

      return {
        youtubeVideoId: videoId,
        title,
        description: item.snippet?.description?.trim() ?? "",
        publishedAt,
        watchUrl: buildYouTubeWatchUrl(videoId),
        thumbnailUrl: pickThumbnailUrl(item.snippet?.thumbnails),
      } satisfies YouTubeVideoMetadata;
    })
    .filter((video): video is YouTubeVideoMetadata => Boolean(video));
  const deduped = new Map<string, YouTubeVideoMetadata>();

  for (const video of videos) {
    if (!deduped.has(video.youtubeVideoId)) {
      deduped.set(video.youtubeVideoId, video);
    }
  }

  return Array.from(deduped.values()).sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
}


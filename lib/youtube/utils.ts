const CHANNEL_ID_PATTERN = /^UC[a-zA-Z0-9_-]{22}$/;
const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export type ParsedYouTubeChannelInput = {
  raw: string;
  channelId: string | null;
  handle: string | null;
  watchVideoId: string | null;
  channelUrl: string | null;
  searchQuery: string | null;
};

function normalizeInput(value: string) {
  return value.trim();
}

function normalizeHandle(value: string) {
  const trimmed = value.trim().replace(/^@+/, "");
  return trimmed ? trimmed.toLowerCase() : null;
}

function normalizeYouTubeUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^(www\.)?(youtube\.com|youtu\.be)\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return null;
}

function readVideoIdFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const shortsIndex = segments.findIndex((segment) => segment === "shorts");

  if (shortsIndex !== -1) {
    const candidate = segments[shortsIndex + 1] ?? "";
    return VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
  }

  if (segments.length === 1 && VIDEO_ID_PATTERN.test(segments[0] ?? "")) {
    return segments[0] ?? null;
  }

  return null;
}

export function parseYouTubeChannelInput(input: string): ParsedYouTubeChannelInput {
  const raw = normalizeInput(input);

  if (!raw) {
    return {
      raw,
      channelId: null,
      handle: null,
      watchVideoId: null,
      channelUrl: null,
      searchQuery: null,
    };
  }

  if (CHANNEL_ID_PATTERN.test(raw)) {
    return {
      raw,
      channelId: raw,
      handle: null,
      watchVideoId: null,
      channelUrl: `https://www.youtube.com/channel/${raw}`,
      searchQuery: raw,
    };
  }

  if (raw.startsWith("@")) {
    const handle = normalizeHandle(raw);
    return {
      raw,
      channelId: null,
      handle,
      watchVideoId: null,
      channelUrl: handle ? `https://www.youtube.com/@${handle}` : null,
      searchQuery: handle,
    };
  }

  const normalizedUrl = normalizeYouTubeUrl(raw);

  if (normalizedUrl) {
    try {
      const parsed = new URL(normalizedUrl);
      const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
      const pathname = parsed.pathname;
      const segments = pathname.split("/").filter(Boolean);
      const watchVideoId = parsed.searchParams.get("v");

      if (hostname === "youtu.be") {
        const shortVideoId = readVideoIdFromPath(pathname);
        return {
          raw,
          channelId: null,
          handle: null,
          watchVideoId: shortVideoId,
          channelUrl: null,
          searchQuery: shortVideoId,
        };
      }

      if (hostname === "youtube.com") {
        if (watchVideoId && VIDEO_ID_PATTERN.test(watchVideoId)) {
          return {
            raw,
            channelId: null,
            handle: null,
            watchVideoId,
            channelUrl: null,
            searchQuery: watchVideoId,
          };
        }

        const shortsVideoId = readVideoIdFromPath(pathname);
        if (shortsVideoId) {
          return {
            raw,
            channelId: null,
            handle: null,
            watchVideoId: shortsVideoId,
            channelUrl: null,
            searchQuery: shortsVideoId,
          };
        }

        const firstSegment = segments[0] ?? "";
        const secondSegment = segments[1] ?? "";

        if (firstSegment === "channel" && CHANNEL_ID_PATTERN.test(secondSegment)) {
          return {
            raw,
            channelId: secondSegment,
            handle: null,
            watchVideoId: null,
            channelUrl: `https://www.youtube.com/channel/${secondSegment}`,
            searchQuery: secondSegment,
          };
        }

        if (firstSegment.startsWith("@")) {
          const handle = normalizeHandle(firstSegment);
          return {
            raw,
            channelId: null,
            handle,
            watchVideoId: null,
            channelUrl: handle ? `https://www.youtube.com/@${handle}` : null,
            searchQuery: handle,
          };
        }

        const queryCandidate = [firstSegment, secondSegment].filter(Boolean).join(" ");

        return {
          raw,
          channelId: null,
          handle: null,
          watchVideoId: null,
          channelUrl: normalizedUrl,
          searchQuery: queryCandidate || normalizedUrl,
        };
      }
    } catch {
      // fall through to generic query
    }
  }

  return {
    raw,
    channelId: null,
    handle: null,
    watchVideoId: null,
    channelUrl: null,
    searchQuery: raw,
  };
}

export function buildYouTubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function buildYouTubeChannelUrl(input: { channelId?: string | null; handle?: string | null }) {
  if (input.handle) {
    return `https://www.youtube.com/@${input.handle.replace(/^@+/, "")}`;
  }

  if (input.channelId) {
    return `https://www.youtube.com/channel/${input.channelId}`;
  }

  return null;
}

export function slugifyFragment(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "youtube";
}

export function withRetryBackoffMinutes(attempt: number) {
  const safeAttempt = Math.max(attempt, 1);
  return Math.min(60, 2 ** safeAttempt);
}

export function filterNewYouTubeVideoIds(
  candidateVideoIds: string[],
  existingVideoIds: Set<string>,
) {
  const uniqueCandidateIds = Array.from(
    new Set(candidateVideoIds.map((videoId) => videoId.trim()).filter(Boolean)),
  );

  return uniqueCandidateIds.filter((videoId) => !existingVideoIds.has(videoId));
}


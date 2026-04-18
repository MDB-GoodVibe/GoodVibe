
import { getYouTubeRuntime } from "@/lib/youtube/config";

type CaptionTrack = {
  baseUrl?: string;
  languageCode?: string;
  kind?: string;
};

type TimedTextEvent = {
  segs?: Array<{ utf8?: string }>;
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function extractPlayerResponseJson(html: string) {
  const patterns = [
    /ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\});/,
    /window\["ytInitialPlayerResponse"\]\s*=\s*(\{[\s\S]*?\});/,
  ];

  for (const pattern of patterns) {
    const matched = html.match(pattern);

    if (matched?.[1]) {
      return matched[1];
    }
  }

  return null;
}

function selectCaptionTrack(
  tracks: CaptionTrack[],
  preferredLangs: string[],
) {
  const normalizedPreferred = preferredLangs.map((lang) =>
    lang.trim().toLowerCase(),
  );

  for (const lang of normalizedPreferred) {
    const exact = tracks.find(
      (track) => track.languageCode?.toLowerCase() === lang,
    );

    if (exact) {
      return exact;
    }

    const prefixMatch = tracks.find((track) =>
      track.languageCode?.toLowerCase().startsWith(`${lang}-`),
    );

    if (prefixMatch) {
      return prefixMatch;
    }
  }

  const nonAsr = tracks.find((track) => track.kind !== "asr");
  return nonAsr ?? tracks[0] ?? null;
}

function extractTranscriptText(payload: { events?: TimedTextEvent[] }) {
  const segments = (payload.events ?? [])
    .flatMap((event) => event.segs ?? [])
    .map((segment) => segment.utf8 ?? "")
    .map((text) => text.replace(/\n/g, " ").trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const deduped = segments.filter(
    (segment, index) => index === 0 || segment !== segments[index - 1],
  );
  const text = normalizeWhitespace(deduped.join(" "));

  return text.length > 0 ? text : null;
}

export async function fetchYouTubeTranscript(input: { youtubeVideoId: string }) {
  const runtime = getYouTubeRuntime();
  const watchUrl = `https://www.youtube.com/watch?v=${input.youtubeVideoId}`;

  try {
    const watchResponse = await fetch(watchUrl, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      },
    });

    if (!watchResponse.ok) {
      return {
        transcriptMode: "metadata" as const,
        transcript: null,
        languageCode: null,
      };
    }

    const watchHtml = await watchResponse.text();
    const playerResponseJson = extractPlayerResponseJson(watchHtml);

    if (!playerResponseJson) {
      return {
        transcriptMode: "metadata" as const,
        transcript: null,
        languageCode: null,
      };
    }

    const playerResponse = JSON.parse(playerResponseJson) as {
      captions?: {
        playerCaptionsTracklistRenderer?: {
          captionTracks?: CaptionTrack[];
        };
      };
    };

    const tracks =
      playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks ??
      [];

    if (tracks.length === 0) {
      return {
        transcriptMode: "metadata" as const,
        transcript: null,
        languageCode: null,
      };
    }

    const selectedTrack = selectCaptionTrack(tracks, runtime.defaultLangs);

    if (!selectedTrack?.baseUrl) {
      return {
        transcriptMode: "metadata" as const,
        transcript: null,
        languageCode: null,
      };
    }

    const captionUrl = new URL(selectedTrack.baseUrl);
    captionUrl.searchParams.set("fmt", "json3");

    const captionResponse = await fetch(captionUrl.toString(), {
      cache: "no-store",
    });

    if (!captionResponse.ok) {
      return {
        transcriptMode: "metadata" as const,
        transcript: null,
        languageCode: selectedTrack.languageCode ?? null,
      };
    }

    const captionJson = (await captionResponse.json()) as {
      events?: TimedTextEvent[];
    };
    const transcript = extractTranscriptText(captionJson);

    if (!transcript) {
      return {
        transcriptMode: "metadata" as const,
        transcript: null,
        languageCode: selectedTrack.languageCode ?? null,
      };
    }

    return {
      transcriptMode: "captions" as const,
      transcript,
      languageCode: selectedTrack.languageCode ?? null,
    };
  } catch {
    return {
      transcriptMode: "metadata" as const,
      transcript: null,
      languageCode: null,
    };
  }
}



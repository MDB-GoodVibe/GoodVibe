
function normalize(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseDefaultLangs(value: string | null) {
  if (!value) {
    return ["ko", "en"];
  }

  const langs = value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  return langs.length > 0 ? langs : ["ko", "en"];
}

export function getYouTubeRuntime() {
  const apiKey = normalize(process.env.YOUTUBE_API_KEY);
  const syncSecret = normalize(process.env.YOUTUBE_SYNC_SECRET);
  const defaultLangs = parseDefaultLangs(
    normalize(process.env.YOUTUBE_DEFAULT_LANGS),
  );

  return {
    apiKey,
    syncSecret,
    defaultLangs,
  };
}



import { readFileSync } from "node:fs";
import path from "node:path";

type DraftItem = {
  video?: { youtubeVideoId?: string };
  summary?: string;
  contentMd?: string;
};

function getArg(name: string) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function hasBrokenEncoding(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.includes("�") || /\?{2,}/.test(trimmed)) return true;
  return false;
}

async function main() {
  const inputArg = getArg("input");
  if (!inputArg) {
    throw new Error("Pass --input=<draft json path>");
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  const raw = readFileSync(inputPath, "utf8");
  const parsed = JSON.parse(raw) as { drafts?: DraftItem[] };
  const drafts = Array.isArray(parsed.drafts) ? parsed.drafts : [];

  const broken: Array<{ youtubeVideoId: string; reason: string }> = [];

  for (const draft of drafts) {
    const videoId = draft.video?.youtubeVideoId?.trim() || "unknown";
    const summary = draft.summary?.trim() ?? "";
    const contentMd = draft.contentMd?.trim() ?? "";

    if (hasBrokenEncoding(summary)) {
      broken.push({
        youtubeVideoId: videoId,
        reason: "summary has broken/replacement characters",
      });
    }

    if (hasBrokenEncoding(contentMd)) {
      broken.push({
        youtubeVideoId: videoId,
        reason: "contentMd has broken/replacement characters",
      });
    }
  }

  if (broken.length > 0) {
    console.error("Draft validation failed.");
    console.error(JSON.stringify({ brokenCount: broken.length, broken }, null, 2));
    process.exit(1);
  }

  console.log("Draft validation passed.");
  console.log(JSON.stringify({ draftCount: drafts.length }, null, 2));
}

void main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Unknown youtube-codex-validate-drafts error",
  );
  process.exit(1);
});

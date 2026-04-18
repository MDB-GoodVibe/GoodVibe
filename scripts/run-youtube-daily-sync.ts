import { readFileSync } from "node:fs";
import path from "node:path";

import { runYoutubeDailySync } from "@/lib/youtube/sync";

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

async function main() {
  loadLocalEnv();
  const result = await runYoutubeDailySync();

  console.log("YouTube daily sync completed.");
  console.log(JSON.stringify(result, null, 2));
}

void main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Unknown YouTube daily sync error",
  );
  process.exit(1);
});

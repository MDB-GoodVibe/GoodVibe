import { readFileSync } from "node:fs";
import path from "node:path";

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

async function run() {
  loadLocalEnv();

  const filePath = process.argv[2];

  if (!filePath) {
    throw new Error("SQL 파일 경로를 인자로 넘겨 주세요.");
  }

  const projectRef = process.env.SUPABASE_PROJECT_REF;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  if (!projectRef || !accessToken) {
    throw new Error("SUPABASE_PROJECT_REF 또는 SUPABASE_ACCESS_TOKEN이 없습니다.");
  }

  const absoluteFilePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  const query = readFileSync(absoluteFilePath, "utf8");

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`SQL 실행 실패 (${response.status}): ${text}`);
  }

  console.log(`SQL 적용 완료: ${path.basename(absoluteFilePath)}`);
}

void run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

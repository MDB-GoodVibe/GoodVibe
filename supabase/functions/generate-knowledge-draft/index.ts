declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(
    handler: (request: Request) => Response | Promise<Response>,
  ): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

type DraftRequest = {
  track?: string;
  topic?: string;
  titleHint?: string;
  summaryHint?: string;
  details?: string;
  resourceUrl?: string | null;
  sourceSubmissionId?: string | null;
};

type DraftPayload = {
  title: string;
  summary: string;
  contentMd: string;
  warnings: string[];
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTrack(value: string) {
  if (value === "level-up" || value === "tips" || value === "external") {
    return value;
  }

  return "basics";
}

function extractReadableTextFromHtml(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");

  if (!document) {
    return "";
  }

  document
    .querySelectorAll(
      "script, style, noscript, svg, nav, footer, header, aside, form",
    )
    .forEach((node) => node.remove());

  const root =
    document.querySelector("article") ??
    document.querySelector("main") ??
    document.body;

  return root?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

async function loadResourceContext(resourceUrl: string) {
  const warnings: string[] = [];

  if (!resourceUrl) {
    return { excerpt: "", warnings };
  }

  try {
    const response = await fetch(resourceUrl, {
      headers: {
        "User-Agent":
          "GoodVibeKnowledgeBot/1.0 (+https://good-vibe-six.vercel.app)",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`Failed with ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    const rawText = await response.text();
    const extracted = contentType.includes("html")
      ? extractReadableTextFromHtml(rawText)
      : rawText.replace(/\s+/g, " ").trim();

    if (!extracted) {
      warnings.push(
        "참고 링크를 읽었지만 본문 텍스트를 충분히 추출하지 못했습니다.",
      );

      return { excerpt: "", warnings };
    }

    return {
      excerpt: extracted.slice(0, 12_000),
      warnings,
    };
  } catch {
    warnings.push(
      "참고 링크 본문을 읽지 못해 입력된 정보만으로 초안을 생성했습니다.",
    );

    return { excerpt: "", warnings };
  }
}

function buildPrompt(input: {
  track: string;
  topic: string;
  titleHint: string;
  summaryHint: string;
  details: string;
  resourceUrl: string;
  resourceExcerpt: string;
  linkWarnings: string[];
}) {
  return `
너는 GoodVibe 서비스의 지식 문서 편집자다.
결과는 반드시 JSON 객체 하나만 반환한다.

JSON 형식:
{
  "title": "문서 제목",
  "summary": "2~4문장 요약",
  "contentMd": "Markdown 본문",
  "warnings": []
}

규칙:
- 한국어로 작성한다.
- contentMd는 반드시 Markdown만 사용하고 HTML은 절대 쓰지 않는다.
- Markdown에는 최소한 아래 섹션을 포함한다.
  1. ## 한눈에 보기
  2. ## 핵심 포인트
  3. ## 자세히 설명하기
  4. ## 실전 체크리스트
- 필요하면 목록, 표, 인용문, fenced code block을 사용한다.
- 과장하거나 확인되지 않은 사실을 단정하지 않는다.
- 링크 본문을 읽지 못했거나 정보가 부족하면 일반적인 가이드 문장으로 안전하게 작성한다.
- warnings 배열에는 사람이 확인하면 좋은 주의사항만 짧은 한국어 문장으로 넣는다.
- summary는 목록이 아니라 자연스러운 문장으로 작성한다.
- title은 깔끔하고 검색 가능한 문장형 제목으로 작성한다.

입력 정보:
- track: ${input.track}
- topic: ${input.topic}
- titleHint: ${input.titleHint || "(없음)"}
- summaryHint: ${input.summaryHint || "(없음)"}
- details: ${input.details || "(없음)"}
- resourceUrl: ${input.resourceUrl || "(없음)"}
- linkWarnings: ${input.linkWarnings.length > 0 ? input.linkWarnings.join(" | ") : "(없음)"}

참고 링크 본문 요약:
${input.resourceExcerpt || "(본문 추출 없음)"}
`.trim();
}

function extractJson(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  return objectMatch?.[0]?.trim() ?? text.trim();
}

function normalizeDraftPayload(payload: unknown): DraftPayload | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const title = cleanText(record.title);
  const summary = cleanText(record.summary);
  const contentMd = cleanText(record.contentMd);
  const warnings = Array.isArray(record.warnings)
    ? record.warnings.filter((value): value is string => typeof value === "string")
    : [];

  if (!title || !summary || !contentMd) {
    return null;
  }

  return {
    title,
    summary,
    contentMd,
    warnings,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY")?.trim();
  const model =
    Deno.env.get("GEMINI_MODEL")?.trim() || "gemini-2.5-flash";

  if (!apiKey) {
    return json({ error: "Missing GEMINI_API_KEY" }, 500);
  }

  let body: DraftRequest;

  try {
    body = (await request.json()) as DraftRequest;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const track = normalizeTrack(cleanText(body.track));
  const topic = cleanText(body.topic) || "concepts-and-tips";
  const titleHint = cleanText(body.titleHint);
  const summaryHint = cleanText(body.summaryHint);
  const details = cleanText(body.details);
  const resourceUrl = cleanText(body.resourceUrl);

  if (!titleHint && !summaryHint && !details && !resourceUrl) {
    return json(
      { error: "At least one hint or resourceUrl is required" },
      400,
    );
  }

  const { excerpt, warnings: linkWarnings } = await loadResourceContext(
    resourceUrl,
  );
  const prompt = buildPrompt({
    track,
    topic,
    titleHint,
    summaryHint,
    details,
    resourceUrl,
    resourceExcerpt: excerpt,
    linkWarnings,
  });

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.5,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text();
    return json(
      {
        error: "Gemini request failed",
        details: errorText,
      },
      502,
    );
  }

  const geminiData = await geminiResponse.json();
  const text = ((geminiData?.candidates ?? []) as Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>)
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("\n")
    .trim();

  if (!text) {
    return json({ error: "Gemini returned an empty response" }, 502);
  }

  let parsed: DraftPayload | null = null;

  try {
    parsed = normalizeDraftPayload(JSON.parse(extractJson(text)));
  } catch {
    parsed = null;
  }

  if (!parsed) {
    return json({ error: "Unable to parse Gemini response" }, 502);
  }

  return json({
    ...parsed,
    warnings: [...linkWarnings, ...parsed.warnings],
  });
});

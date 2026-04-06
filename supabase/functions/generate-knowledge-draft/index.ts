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

type PromptTaxonomy = {
  channelLabel?: string;
  categoryLabel?: string;
  subcategoryLabel?: string;
  sourceName?: string;
  confidence?: string;
  matchedSignals?: string[];
} | null;

type DraftRequest = {
  track?: string;
  topic?: string;
  titleHint?: string;
  summaryHint?: string;
  details?: string;
  resourceUrl?: string | null;
  resourceTaxonomy?: PromptTaxonomy;
  sourceSubmissionId?: string | null;
};

type DraftPayload = {
  title: string;
  summary: string;
  contentMd: string;
  warnings: string[];
};

type ResourceMetadata = {
  pageTitle: string;
  description: string;
  siteName: string;
  contentType: string;
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

function readMetaContent(document: Document, selectors: string[]) {
  for (const selector of selectors) {
    const value = cleanText(
      document.querySelector(selector)?.getAttribute("content"),
    );

    if (value) {
      return value;
    }
  }

  return "";
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

function extractResourceMetadata(html: string, contentType: string) {
  const document = new DOMParser().parseFromString(html, "text/html");

  if (!document) {
    return {
      pageTitle: "",
      description: "",
      siteName: "",
      contentType,
    } satisfies ResourceMetadata;
  }

  const pageTitle =
    cleanText(
      readMetaContent(document, [
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
      ]),
    ) || cleanText(document.querySelector("title")?.textContent);
  const description = readMetaContent(document, [
    'meta[property="og:description"]',
    'meta[name="description"]',
    'meta[name="twitter:description"]',
  ]);
  const siteName = readMetaContent(document, [
    'meta[property="og:site_name"]',
    'meta[name="application-name"]',
  ]);

  return {
    pageTitle,
    description,
    siteName,
    contentType,
  } satisfies ResourceMetadata;
}

async function loadResourceContext(resourceUrl: string) {
  const warnings: string[] = [];

  if (!resourceUrl) {
    return {
      excerpt: "",
      metadata: {
        pageTitle: "",
        description: "",
        siteName: "",
        contentType: "",
      } satisfies ResourceMetadata,
      warnings,
    };
  }

  try {
    const response = await fetch(resourceUrl, {
      headers: {
        "User-Agent":
          "GoodVibeKnowledgeBot/2.0 (+https://good-vibe-six.vercel.app)",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`Failed with ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    const rawText = await response.text();
    const metadata = contentType.includes("html")
      ? extractResourceMetadata(rawText, contentType)
      : {
          pageTitle: "",
          description: "",
          siteName: "",
          contentType,
        };
    const extracted = contentType.includes("html")
      ? extractReadableTextFromHtml(rawText)
      : rawText.replace(/\s+/g, " ").trim();

    if (!extracted) {
      warnings.push(
        "링크 본문을 충분히 읽지 못해 메타데이터와 입력 힌트를 중심으로 초안을 만들었습니다.",
      );

      return {
        excerpt: "",
        metadata,
        warnings,
      };
    }

    return {
      excerpt: extracted.slice(0, 15_000),
      metadata,
      warnings,
    };
  } catch {
    warnings.push(
      "링크를 직접 읽지 못해 입력된 힌트만으로 초안을 생성했습니다.",
    );

    return {
      excerpt: "",
      metadata: {
        pageTitle: "",
        description: "",
        siteName: "",
        contentType: "",
      } satisfies ResourceMetadata,
      warnings,
    };
  }
}

function stringifySignals(signals: string[]) {
  return signals.length > 0 ? signals.join(", ") : "(none)";
}

function buildPrompt(input: {
  track: string;
  topic: string;
  titleHint: string;
  summaryHint: string;
  details: string;
  resourceUrl: string;
  taxonomy: PromptTaxonomy;
  metadata: ResourceMetadata;
  resourceExcerpt: string;
  linkWarnings: string[];
}) {
  const channel = cleanText(input.taxonomy?.channelLabel);
  const category = cleanText(input.taxonomy?.categoryLabel);
  const subcategory = cleanText(input.taxonomy?.subcategoryLabel);
  const sourceName =
    cleanText(input.taxonomy?.sourceName) || cleanText(input.metadata.siteName);

  return `
You write polished Korean knowledge-base articles for the GoodVibe product.
Return exactly one JSON object and nothing else.

Required JSON shape:
{
  "title": "document title",
  "summary": "3-5 sentence summary",
  "contentMd": "full markdown article",
  "warnings": ["optional warning"]
}

Hard requirements:
- Write the entire response in Korean.
- The markdown must feel like a curated, high-quality internal note, not a short memo.
- Keep the tone practical, concrete, and easy to scan.
- For external resources, the article should be useful even if the reader never opens the original link.
- Do not invent facts that are not supported by the source excerpt, metadata, or hints.
- If source evidence is weak, say so in the markdown and keep the guidance generic.
- Use Markdown only. No HTML.
- The summary must be natural prose, not bullet points.
- The summary should be rich enough to stand on its own: aim for about 4-6 Korean sentences when evidence is available.
- The article must be materially detailed: aim for roughly 900+ Korean characters unless the source is extremely thin.
- Prefer concise paragraphs plus useful bullet lists over long vague prose.
- Avoid empty recommendations such as "check the original for details" unless absolutely necessary.
- Do not write teaser copy. Explain the actual substance of the resource.

The markdown must include all of these sections in this order:
1. ## 한눈에 보기
2. ## 무엇을 다루는 자료인가
3. ## 핵심 내용 요약
4. ## 실무에 바로 적용할 포인트
5. ## 추천 대상과 활용 시점
6. ## 주의할 점
7. ## 빠른 체크리스트

Additional structure rules:
- If the resource is a YouTube, blog, X/Threads post, or news article, make the "핵심 내용 요약" section explicitly summarize the source content.
- If the resource is official docs or GitHub, focus on what the reader should open first, what to copy into practice, and what usually causes confusion.
- When the source has enough substance, make the "핵심 내용 요약" section detailed enough that a reader can understand the main points without opening the original.
- The "핵심 내용 요약" section should contain concrete substance, not just impressions or praise.
- The checklist section should contain 4-6 actionable items.
- Add short bullet lists where useful, but keep them meaningful.
- Use fenced code blocks only when the source clearly suggests commands or snippets.

Context:
- track: ${input.track}
- topic: ${input.topic}
- resourceUrl: ${input.resourceUrl || "(none)"}
- inferred channel: ${channel || "(unknown)"}
- inferred category: ${category || "(unknown)"}
- inferred subcategory: ${subcategory || "(unknown)"}
- inferred source name: ${sourceName || "(unknown)"}
- taxonomy confidence: ${cleanText(input.taxonomy?.confidence) || "(unknown)"}
- taxonomy signals: ${stringifySignals(input.taxonomy?.matchedSignals ?? [])}
- titleHint: ${input.titleHint || "(none)"}
- summaryHint: ${input.summaryHint || "(none)"}
- details: ${input.details || "(none)"}
- source page title: ${input.metadata.pageTitle || "(none)"}
- source description: ${input.metadata.description || "(none)"}
- source site name: ${input.metadata.siteName || "(none)"}
- source content type: ${input.metadata.contentType || "(none)"}
- link warnings: ${input.linkWarnings.length > 0 ? input.linkWarnings.join(" | ") : "(none)"}

Source excerpt:
${input.resourceExcerpt || "(no excerpt available)"}
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

  const { excerpt, metadata, warnings: linkWarnings } = await loadResourceContext(
    resourceUrl,
  );
  const prompt = buildPrompt({
    track,
    topic,
    titleHint,
    summaryHint,
    details,
    resourceUrl,
    taxonomy: body.resourceTaxonomy ?? null,
    metadata,
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
          temperature: 0.45,
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

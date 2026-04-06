import { getExternalTaxonomy } from "@/lib/knowledge/external-resource";
import type { ExternalResourceTaxonomy, KnowledgeArticle } from "@/types/good-vibe";

type MarkdownSection = {
  heading: string;
  body: string;
  bullets: string[];
  paragraphs: string[];
};

type ExternalSeedSection = {
  heading: string;
  blocks: string[];
};

export type ExternalResourceBrief = {
  overview: string;
  takeaways: string[];
  sectionHighlights: Array<{ heading: string; excerpt: string }>;
};

const SECTION_PRIORITY = [
  "한눈에 보기",
  "무엇을",
  "핵심 내용 요약",
  "핵심",
  "실무",
  "적용",
  "추천",
  "주의",
  "체크리스트",
];

function dedupe(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_{1,2}([^_]+)_{1,2}/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, limit = 160) {
  const clean = stripMarkdown(value);

  if (!clean) {
    return "";
  }

  if (clean.length <= limit) {
    return clean;
  }

  return `${clean.slice(0, limit).trim()}...`;
}

function splitSentences(value: string) {
  return stripMarkdown(value)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 18);
}

function parseMarkdownSections(contentMd: string) {
  const normalized = contentMd.trim();

  if (!normalized) {
    return [] as MarkdownSection[];
  }

  const chunks = normalized
    .split(/\n(?=##\s+)/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks
    .map((chunk) => {
      const lines = chunk.split(/\r?\n/);
      const firstLine = lines[0] ?? "";
      const hasHeading = firstLine.startsWith("## ");
      const heading = hasHeading ? firstLine.replace(/^##\s+/, "").trim() : "본문";
      const rawBody = (hasHeading ? lines.slice(1) : lines).join("\n").trim();

      if (!rawBody) {
        return null;
      }

      const bulletLines = rawBody
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => /^(?:[-*+]|\d+\.)\s+/.test(line))
        .map((line) => truncate(line, 120))
        .filter(Boolean);

      const paragraphs = rawBody
        .split(/\n\s*\n/)
        .map((paragraph) => truncate(paragraph, 170))
        .filter((paragraph) => paragraph.length >= 20);

      return {
        heading,
        body: stripMarkdown(rawBody),
        bullets: bulletLines,
        paragraphs,
      } satisfies MarkdownSection;
    })
    .filter((section): section is MarkdownSection => Boolean(section));
}

function sectionPriority(heading: string) {
  const normalizedHeading = heading.toLowerCase();
  const index = SECTION_PRIORITY.findIndex((keyword) =>
    normalizedHeading.includes(keyword.toLowerCase()),
  );

  return index === -1 ? SECTION_PRIORITY.length : index;
}

function prioritizedSections(sections: MarkdownSection[]) {
  return [...sections].sort((left, right) => {
    const leftPriority = sectionPriority(left.heading);
    const rightPriority = sectionPriority(right.heading);

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return right.body.length - left.body.length;
  });
}

function joinTags(tags: string[] | undefined, fallback: string) {
  const unique = dedupe(tags ?? []).slice(0, 3);
  return unique.length > 0 ? unique.join(", ") : fallback;
}

function taxonomySentence(taxonomy: ExternalResourceTaxonomy | null) {
  if (!taxonomy) {
    return "이 자료는 외부 콘텐츠의 핵심 맥락을 빠르게 파악할 수 있도록 정리한 참고 노트입니다.";
  }

  return `이 자료는 ${taxonomy.sourceName}의 ${taxonomy.channelLabel} 콘텐츠를 바탕으로 ${taxonomy.categoryLabel} / ${taxonomy.subcategoryLabel} 흐름을 빠르게 파악할 수 있게 정리한 노트입니다.`;
}

function buildOverview(
  summary: string,
  sections: MarkdownSection[],
  taxonomy: ExternalResourceTaxonomy | null,
) {
  const summaryText = stripMarkdown(summary);
  const firstParagraph = prioritizedSections(sections)
    .flatMap((section) => section.paragraphs)
    .find((paragraph) => paragraph.length >= 30);

  const parts = dedupe([summaryText, firstParagraph ?? "", taxonomySentence(taxonomy)])
    .filter((value) => value.length >= 20)
    .slice(0, 2);

  return truncate(parts.join(" "), 220);
}

function buildFallbackTakeaways(
  article: Pick<
    KnowledgeArticle,
    "toolTags" | "platformTags" | "resourceUrl" | "title"
  >,
  taxonomy: ExternalResourceTaxonomy | null,
) {
  const takeaways: string[] = [];

  if (taxonomy) {
    takeaways.push(
      `${taxonomy.channelLabel} 형식의 ${taxonomy.sourceName} 자료이며 ${taxonomy.categoryLabel} -> ${taxonomy.subcategoryLabel} 축에서 참고할 내용이 많습니다.`,
    );
  }

  if (article.toolTags.length > 0) {
    takeaways.push(
      `핵심 키워드는 ${joinTags(article.toolTags, "관련 도구")} 중심으로 읽으면 맥락이 빠르게 잡힙니다.`,
    );
  }

  if (article.platformTags.length > 0) {
    takeaways.push(
      `${joinTags(article.platformTags, "공통 환경")} 기준으로 적용 상황을 떠올리면서 보면 정리 속도가 훨씬 빨라집니다.`,
    );
  }

  if (article.resourceUrl) {
    takeaways.push("원문을 열기 전에도 전체 개념, 적용 포인트, 먼저 볼 키워드 정도는 이 페이지에서 바로 파악할 수 있습니다.");
  }

  return takeaways;
}

function buildTakeaways(
  article: Pick<
    KnowledgeArticle,
    "summary" | "toolTags" | "platformTags" | "resourceUrl" | "title"
  >,
  sections: MarkdownSection[],
  taxonomy: ExternalResourceTaxonomy | null,
) {
  const candidates = dedupe([
    ...prioritizedSections(sections).flatMap((section) => section.bullets),
    ...prioritizedSections(sections).flatMap((section) => section.paragraphs.slice(0, 2)),
    ...splitSentences(article.summary),
    ...buildFallbackTakeaways(article, taxonomy),
  ])
    .map((sentence) => truncate(sentence, 120))
    .filter((sentence) => sentence.length >= 20);

  return candidates.slice(0, 4);
}

function buildFallbackHighlights(
  article: Pick<KnowledgeArticle, "summary" | "toolTags" | "platformTags">,
  taxonomy: ExternalResourceTaxonomy | null,
) {
  const highlights = [
    {
      heading: "자료 성격",
      excerpt: truncate(
        `${taxonomySentence(taxonomy)} ${stripMarkdown(article.summary)}`,
        130,
      ),
    },
    {
      heading: "핵심 키워드",
      excerpt: truncate(
        `이 자료를 볼 때는 ${joinTags(article.toolTags, taxonomy?.subcategoryLabel ?? "핵심 키워드")} 중심으로 읽으면 좋습니다.`,
        130,
      ),
    },
    {
      heading: "적용 맥락",
      excerpt: truncate(
        `${joinTags(article.platformTags, "공통 환경")} 기준으로 바로 적용할 수 있는 포인트를 먼저 확인해 두면 실무 연결이 쉬워집니다.`,
        130,
      ),
    },
  ].filter((item) => item.excerpt);

  return highlights.slice(0, 3);
}

function buildSectionHighlights(
  article: Pick<KnowledgeArticle, "summary" | "toolTags" | "platformTags">,
  sections: MarkdownSection[],
  taxonomy: ExternalResourceTaxonomy | null,
) {
  const highlights = prioritizedSections(sections)
    .slice(0, 3)
    .map((section) => ({
      heading: section.heading,
      excerpt: truncate(section.paragraphs[0] || section.body, 130),
    }))
    .filter((section) => section.excerpt);

  return highlights.length > 0 ? highlights : buildFallbackHighlights(article, taxonomy);
}

export function getExternalResourceBrief(
  article: Pick<
    KnowledgeArticle,
    "summary" | "contentMd" | "externalTaxonomy" | "resourceUrl" | "title" | "platformTags" | "toolTags"
  >,
): ExternalResourceBrief | null {
  const taxonomy =
    article.externalTaxonomy ??
    getExternalTaxonomy({
      ...article,
      externalTaxonomy: article.externalTaxonomy ?? null,
    } as KnowledgeArticle);
  const sections = parseMarkdownSections(article.contentMd);
  const overview = buildOverview(article.summary, sections, taxonomy ?? null);
  const takeaways = buildTakeaways(article, sections, taxonomy ?? null);
  const sectionHighlights = buildSectionHighlights(article, sections, taxonomy ?? null);

  if (!overview && takeaways.length === 0 && sectionHighlights.length === 0) {
    return null;
  }

  return {
    overview,
    takeaways,
    sectionHighlights,
  };
}

function buildOriginalGuide(channel: ExternalResourceTaxonomy["channel"] | "other") {
  switch (channel) {
    case "youtube":
      return [
        "영상에서 본 흐름을 실제로 적용해 볼 때 명령어, 링크, 버전 정보를 다시 확인합니다.",
        "화면 데모는 빠르게 이해하고 세부 설정은 공식 문서로 교차 확인합니다.",
        "영상이 소개한 도구 중 우리 작업 흐름에 바로 붙일 항목만 추려서 메모합니다.",
      ];
    case "github":
    case "docs":
      return [
        "설치 순서나 설정 값이 필요한 순간에 원문 명령어와 버전 문구를 다시 확인합니다.",
        "예제 코드를 그대로 복사하기보다 우리 프로젝트 구조에 맞게 바꿔 넣을 지점을 먼저 잡습니다.",
        "권한, 제한 사항, 최신 변경점은 원문을 기준으로 최종 확인합니다.",
      ];
    default:
      return [
        "핵심 개념은 여기서 먼저 파악하고 수치, 정책, 링크 같은 세부 정보만 원문에서 다시 확인합니다.",
        "이 페이지의 요약으로 방향을 잡은 뒤 실제 적용 전에 예시나 제한 사항을 한 번 더 체크합니다.",
        "읽으면서 잡힌 키워드를 기준으로 필요한 부분만 원문에서 골라 보면 시간을 줄일 수 있습니다.",
      ];
  }
}

export function buildExternalResourceSeedSections(input: {
  title: string;
  summary: string;
  platformTags?: string[];
  toolTags?: string[];
  resourceUrl?: string | null;
  taxonomy?: ExternalResourceTaxonomy | null;
}) {
  const taxonomy = input.taxonomy ?? null;
  const toolText = joinTags(input.toolTags, taxonomy?.subcategoryLabel ?? "관련 도구");
  const platformText = joinTags(input.platformTags, "공통 환경");
  const focusLabel = taxonomy
    ? `${taxonomy.categoryLabel} / ${taxonomy.subcategoryLabel}`
    : "관련 주제";
  const originalGuide = buildOriginalGuide(taxonomy?.channel ?? "other");

  return [
    {
      heading: "Good Vibe 한눈에 보기",
      blocks: [
        `${taxonomySentence(taxonomy)} ${stripMarkdown(input.summary)}`,
        [
          `- 자료 성격: ${focusLabel}`,
          `- 먼저 볼 키워드: ${toolText}`,
          `- 적용 환경: ${platformText}`,
        ].join("\n"),
      ],
    },
    {
      heading: "바로 가져갈 포인트",
      blocks: [
        [
          `- 이 자료를 읽을 때는 ${toolText} 중심으로 핵심 개념과 흐름을 먼저 잡는 편이 좋습니다.`,
          `- ${platformText} 기준으로 어떤 상황에서 바로 써먹을 수 있는지 연결해서 보면 메모 가치가 커집니다.`,
          `- 원문을 보지 않더라도 '무슨 주제인지', '어디에 쓰는지', '무엇부터 확인할지' 정도는 이 페이지에서 바로 파악할 수 있게 정리합니다.`,
        ].join("\n"),
      ],
    },
    {
      heading: "원문을 열면 좋은 순간",
      blocks: [originalGuide.map((item, index) => `${index + 1}. ${item}`).join("\n")],
    },
  ] satisfies ExternalSeedSection[];
}

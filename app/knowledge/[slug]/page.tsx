import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getKnowledgeArticleBySlug } from "@/lib/repositories/knowledge";
import type { KnowledgeTrack } from "@/types/good-vibe";

const topicLabelMap: Record<string, string> = {
  "tool-setup": "도구 준비",
  "concepts-and-tips": "핵심 개념",
  "examples-and-showcase": "예시와 사례",
  glossary: "용어 정리",
  "coding-basics": "구현 기본기",
  "workflow-and-ops": "실전 운영",
  security: "보안",
  "saas-guides": "플랫폼 가이드",
};

const trackLabelMap: Record<KnowledgeTrack, string> = {
  basics: "기초가이드",
  "level-up": "레벨업",
  tips: "꿀팁",
  external: "외부리소스",
};

const trackPathMap: Record<KnowledgeTrack, string> = {
  basics: "/knowledge/basics",
  "level-up": "/knowledge/level-up",
  tips: "/knowledge/tips",
  external: "/knowledge/external",
};

type ContentBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "unordered-list";
      items: string[];
    }
  | {
      type: "ordered-list";
      items: string[];
    };

type ContentSection = {
  id: string;
  heading: string | null;
  blocks: ContentBlock[];
};

function formatPublishedDate(value: string | null) {
  if (!value) {
    return "최근 업데이트";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function parseBlock(block: string): ContentBlock {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.every((line) => line.startsWith("- "))) {
    return {
      type: "unordered-list",
      items: lines.map((line) => line.slice(2).trim()),
    };
  }

  if (lines.every((line) => /^\d+\.\s/.test(line))) {
    return {
      type: "ordered-list",
      items: lines.map((line) => line.replace(/^\d+\.\s/, "").trim()),
    };
  }

  return {
    type: "paragraph",
    text: lines.join(" "),
  };
}

function parseSections(contentMd: string): ContentSection[] {
  const rawSections = contentMd.split("\n\n## ");

  return rawSections.map((rawSection, index) => {
    const normalizedSection = index === 0 ? rawSection : `## ${rawSection}`;
    const lines = normalizedSection.split("\n");
    const heading = lines[0]?.startsWith("## ")
      ? lines[0].replace("## ", "")
      : null;
    const body = heading ? lines.slice(1).join("\n") : normalizedSection;
    const blocks = body
      .split("\n\n")
      .map((block) => block.trim())
      .filter(Boolean)
      .map(parseBlock);

    return {
      id: `${index}-${heading ?? "body"}`,
      heading,
      blocks,
    };
  });
}

function renderBlock(block: ContentBlock, key: string) {
  if (block.type === "unordered-list") {
    return (
      <ul key={key} className="space-y-2 pl-5 text-[15px] leading-8 text-foreground/92">
        {block.items.map((item) => (
          <li key={item} className="list-disc">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "ordered-list") {
    return (
      <ol key={key} className="space-y-2 pl-5 text-[15px] leading-8 text-foreground/92">
        {block.items.map((item, index) => (
          <li key={item} className="list-decimal">
            <span className="font-medium text-foreground">{index + 1}. </span>
            {item}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <p key={key} className="text-[15px] leading-8 text-foreground/92">
      {block.text}
    </p>
  );
}

export default async function KnowledgeArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getKnowledgeArticleBySlug(slug);

  if (!article) {
    redirect("/knowledge/basics");
  }

  const sections = parseSections(article.contentMd);
  const backHref = trackPathMap[article.track];

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
      <article className="min-w-0 space-y-8">
        <header className="space-y-5 border-b border-[rgba(121,118,127,0.08)] pb-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            {trackLabelMap[article.track]} 목록으로
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-[rgba(255,107,108,0.08)] px-3 py-1 font-bold text-secondary">
              {trackLabelMap[article.track]}
            </span>
            <span className="rounded-full bg-[rgba(59,53,97,0.08)] px-3 py-1 font-bold text-primary">
              {topicLabelMap[article.topic] ?? article.topic}
            </span>
            <span>{formatPublishedDate(article.publishedAt)}</span>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-4xl text-[clamp(2.4rem,4vw,4.2rem)] font-extrabold leading-[1.04] tracking-[-0.07em] text-primary">
              {article.title}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              {article.summary}
            </p>
          </div>
        </header>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.id} className="space-y-4">
              {section.heading ? (
                <h2 className="text-2xl font-bold tracking-[-0.04em] text-primary">
                  {section.heading}
                </h2>
              ) : null}
              <div className="space-y-4">
                {section.blocks.map((block, index) => renderBlock(block, `${section.id}-${index}`))}
              </div>
            </section>
          ))}
        </div>
      </article>

      <aside className="space-y-4">
        <div className="surface-subtle rounded-[1.8rem] px-5 py-5">
          <p className="text-sm font-semibold text-foreground">관련 태그</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[...article.platformTags, ...article.toolTags].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-3 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {article.resourceUrl ? (
          <div className="panel-accent rounded-[1.8rem] px-5 py-5">
            <p className="text-lg font-bold tracking-[-0.03em]">원문 리소스</p>
            <p className="mt-2 text-sm leading-6 text-white/76">
              공식 문서나 외부 자료를 함께 보면 이해가 더 빨라집니다. 설명을 먼저 읽고 원문으로
              넘어가 보세요.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-4 w-full border-white/18 bg-white text-primary hover:bg-white/92"
            >
              <Link href={article.resourceUrl} target="_blank" rel="noreferrer">
                원문 열기
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>
        ) : null}

        <div className="surface-subtle rounded-[1.8rem] px-5 py-5">
          <p className="text-sm font-semibold text-foreground">다음으로 보기</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            같은 카테고리의 다른 문서를 이어서 보면서 감을 빠르게 넓힐 수 있습니다.
          </p>
          <Button asChild className="mt-4 w-full">
            <Link href={backHref}>
              목록으로 돌아가기
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}

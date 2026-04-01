import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

import { KnowledgeMarkdown } from "@/components/knowledge-markdown";
import { Button } from "@/components/ui/button";
import { getKnowledgeArticleBySlug } from "@/lib/repositories/knowledge";
import type { KnowledgeTrack } from "@/types/good-vibe";

const topicLabelMap: Record<string, string> = {
  "tool-setup": "도구 준비",
  "concepts-and-tips": "개념과 팁",
  "examples-and-showcase": "예시와 쇼케이스",
  glossary: "용어 정리",
  "coding-basics": "구현 기본기",
  "workflow-and-ops": "워크플로와 운영",
  security: "보안",
  "saas-guides": "서비스 가이드",
};

const trackLabelMap: Record<KnowledgeTrack, string> = {
  basics: "기초 가이드",
  "level-up": "레벨업",
  tips: "팁 모음",
  external: "외부 리소스",
};

const trackPathMap: Record<KnowledgeTrack, string> = {
  basics: "/knowledge/basics",
  "level-up": "/knowledge/level-up",
  tips: "/knowledge/tips",
  external: "/knowledge/external",
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

  const backHref = trackPathMap[article.track];
  const tags = [...article.platformTags, ...article.toolTags];

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <article className="min-w-0 space-y-8">
        <header className="hero-surface overflow-hidden rounded-[2.2rem] px-7 py-8 shadow-[0_28px_68px_rgba(37,31,74,0.16)]">
          <div className="relative z-10 space-y-5">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/72 transition hover:text-white"
            >
              <ArrowLeft className="size-4" />
              {trackLabelMap[article.track]} 목록으로
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-xs text-white/74">
              <span className="rounded-full bg-white/12 px-3 py-1 font-bold text-white">
                {trackLabelMap[article.track]}
              </span>
              <span className="rounded-full bg-[rgba(255,255,255,0.12)] px-3 py-1 font-bold text-white">
                {topicLabelMap[article.topic] ?? article.topic}
              </span>
              <span>{formatPublishedDate(article.publishedAt)}</span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-[clamp(2.5rem,4.2vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.07em] text-white">
                {article.title}
              </h1>
              <p className="max-w-3xl text-[15px] leading-8 text-white/78">
                {article.summary}
              </p>
            </div>
          </div>
        </header>

        <div className="rounded-[2rem] border border-[rgba(121,118,127,0.08)] bg-white px-6 py-7 shadow-[0_18px_40px_rgba(37,31,74,0.05)] md:px-8 md:py-8">
          <KnowledgeMarkdown content={article.contentMd} />
        </div>
      </article>

      <aside className="space-y-4">
        <div className="sticky top-24 space-y-4">
          <div className="surface-subtle rounded-[1.8rem] px-5 py-5">
            <p className="text-sm font-semibold text-foreground">문서 정보</p>
            <dl className="mt-4 space-y-4 text-[13px]">
              <div className="space-y-1">
                <dt className="text-muted-foreground">트랙</dt>
                <dd className="font-semibold text-primary">{trackLabelMap[article.track]}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground">주제</dt>
                <dd className="font-semibold text-primary">
                  {topicLabelMap[article.topic] ?? article.topic}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground">업데이트</dt>
                <dd className="font-semibold text-primary">
                  {formatPublishedDate(article.publishedAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="surface-subtle rounded-[1.8rem] px-5 py-5">
            <p className="text-sm font-semibold text-foreground">관련 태그</p>
            {tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-3 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
                아직 연결된 태그가 없습니다.
              </p>
            )}
          </div>

          {article.resourceUrl ? (
            <div className="panel-accent rounded-[1.8rem] px-5 py-5">
              <p className="text-lg font-bold tracking-[-0.03em]">원문 리소스</p>
              <p className="mt-2 text-sm leading-6 text-white/76">
                공식 문서나 외부 자료를 함께 보면 맥락을 더 빠르게 이해할 수 있습니다.
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
              같은 트랙의 다른 문서를 이어서 보면 개념을 더 단단하게 연결할 수 있습니다.
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href={backHref}>
                목록으로 돌아가기
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

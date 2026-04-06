import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

import { KnowledgeMarkdown } from "@/components/knowledge-markdown";
import { Button } from "@/components/ui/button";
import { getExternalResourceBrief } from "@/lib/knowledge/external-resource-brief";
import {
  formatExternalTaxonomyPath,
  getExternalTaxonomy,
} from "@/lib/knowledge/external-resource";
import { getKnowledgeArticleBySlug } from "@/lib/repositories/knowledge";
import type { KnowledgeTrack } from "@/types/good-vibe";

const topicLabelMap: Record<string, string> = {
  "tool-setup": "도구 준비",
  "concepts-and-tips": "개념과 팁",
  "examples-and-showcase": "예시와 쇼케이스",
  glossary: "용어 정리",
  "coding-basics": "구현 기본기",
  "workflow-and-ops": "워크플로우와 운영",
  security: "보안",
  "saas-guides": "SaaS 가이드",
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
    return "최신 업데이트";
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
  const externalTaxonomy = getExternalTaxonomy(article);
  const externalBrief =
    article.track === "external" ? getExternalResourceBrief(article) : null;

  return (
    <div className="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <article className="min-w-0 space-y-6">
        <header className="hero-surface overflow-hidden rounded-[1.7rem] px-4 py-4 shadow-[0_20px_44px_rgba(37,31,74,0.14)] sm:rounded-[1.8rem] sm:px-5 sm:py-5 md:px-6 md:py-6">
          <div className="relative z-10 space-y-4">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-white/72 transition hover:text-white"
            >
              <ArrowLeft className="size-4" />
              {trackLabelMap[article.track]} 목록으로
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/74">
              <span className="rounded-full bg-white/12 px-2.5 py-1 font-bold text-white">
                {trackLabelMap[article.track]}
              </span>
              <span className="rounded-full bg-[rgba(255,255,255,0.12)] px-2.5 py-1 font-bold text-white">
                {topicLabelMap[article.topic] ?? article.topic}
              </span>
              {externalTaxonomy ? (
                <span className="rounded-full bg-[rgba(255,255,255,0.12)] px-2.5 py-1 font-bold text-white">
                  {externalTaxonomy.channelLabel}
                </span>
              ) : null}
              <span>{formatPublishedDate(article.publishedAt)}</span>
            </div>

            <div className="space-y-3">
              <h1 className="max-w-3xl text-[clamp(1.24rem,1.75vw,1.75rem)] font-extrabold leading-[1.16] tracking-[-0.04em] text-white">
                {article.title}
              </h1>
              <p className="max-w-2xl text-[12px] leading-5 text-white/78">
                {article.summary}
              </p>
            </div>
          </div>
        </header>

        {externalBrief ? (
          <section className="rounded-[1.5rem] border border-[rgba(121,118,127,0.08)] bg-white px-4 py-4 shadow-[0_12px_26px_rgba(37,31,74,0.04)] sm:rounded-[1.6rem] sm:px-5 sm:py-5">
            <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-3">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary/52">
                  핵심 요약
                </p>
                <p className="text-[14px] leading-7 text-foreground/82">
                  {externalBrief.overview}
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary/52">
                  바로 알 수 있는 포인트
                </p>
                <ul className="space-y-2 text-[13px] leading-6 text-muted-foreground">
                  {externalBrief.takeaways.map((takeaway) => (
                    <li key={takeaway} className="ml-4 list-disc">
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {externalBrief.sectionHighlights.length > 0 ? (
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {externalBrief.sectionHighlights.map((highlight) => (
                  <div
                    key={`${highlight.heading}-${highlight.excerpt}`}
                    className="rounded-[1.15rem] bg-[rgba(244,243,243,0.84)] px-4 py-4"
                  >
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary/48">
                      {highlight.heading}
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-foreground/76">
                      {highlight.excerpt}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="rounded-[1.7rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_16px_34px_rgba(37,31,74,0.05)] sm:rounded-[1.8rem] sm:px-6 sm:py-6 md:px-7 md:py-7">
          <KnowledgeMarkdown content={article.contentMd} />
        </div>
      </article>

      <aside className="space-y-4">
        <div className="sticky top-24 space-y-4">
          <div className="surface-subtle rounded-[1.7rem] px-4 py-4 sm:rounded-[1.8rem] sm:px-5 sm:py-5">
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
              {externalTaxonomy ? (
                <>
                  <div className="space-y-1">
                    <dt className="text-muted-foreground">분류 경로</dt>
                    <dd className="font-semibold text-primary">
                      {formatExternalTaxonomyPath(externalTaxonomy)}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-muted-foreground">소스</dt>
                    <dd className="font-semibold text-primary">
                      {externalTaxonomy.sourceName}
                    </dd>
                  </div>
                </>
              ) : null}
              <div className="space-y-1">
                <dt className="text-muted-foreground">업데이트</dt>
                <dd className="font-semibold text-primary">
                  {formatPublishedDate(article.publishedAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="surface-subtle rounded-[1.7rem] px-4 py-4 sm:rounded-[1.8rem] sm:px-5 sm:py-5">
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

          {externalTaxonomy ? (
            <div className="surface-subtle rounded-[1.7rem] px-4 py-4 sm:rounded-[1.8rem] sm:px-5 sm:py-5">
              <p className="text-sm font-semibold text-foreground">외부 리소스 분류</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-3 py-1 text-xs text-muted-foreground">
                  {externalTaxonomy.channelLabel}
                </span>
                <span className="rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-3 py-1 text-xs text-muted-foreground">
                  {externalTaxonomy.categoryLabel}
                </span>
                <span className="rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-3 py-1 text-xs text-muted-foreground">
                  {externalTaxonomy.subcategoryLabel}
                </span>
              </div>
              {externalTaxonomy.matchedSignals.length > 0 ? (
                <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
                  자동 분류 근거: {externalTaxonomy.matchedSignals.join(", ")}
                </p>
              ) : null}
            </div>
          ) : null}

          {article.resourceUrl ? (
            <div className="panel-accent rounded-[1.7rem] px-4 py-4 sm:rounded-[1.8rem] sm:px-5 sm:py-5">
              <p className="text-lg font-bold tracking-[-0.03em]">원문 리소스</p>
              <p className="mt-2 text-sm leading-6 text-white/76">
                핵심은 이 페이지에서 먼저 파악하고, 세부 명령어·버전·예시는 원문에서 최종 확인하면 좋습니다.
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

          <div className="surface-subtle rounded-[1.7rem] px-4 py-4 sm:rounded-[1.8rem] sm:px-5 sm:py-5">
            <p className="text-sm font-semibold text-foreground">다음으로 보기</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              같은 트랙의 다른 문서를 이어 보면 개념 흐름을 더 자연스럽게 연결할 수 있습니다.
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

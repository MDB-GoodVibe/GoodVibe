import Link from "next/link";
import { ArrowRight, ExternalLink, Files, Star } from "lucide-react";

import type { KnowledgeArticle, KnowledgeTrack } from "@/types/good-vibe";

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

const trackMeta: Record<
  KnowledgeTrack,
  { kicker: string; accentClass: string; surfaceClass: string }
> = {
  basics: {
    kicker: "Basics",
    accentClass: "bg-[rgba(255,107,108,0.10)] text-secondary",
    surfaceClass:
      "bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(249,247,249,0.96))]",
  },
  "level-up": {
    kicker: "Level Up",
    accentClass: "bg-[rgba(91,95,151,0.10)] text-primary",
    surfaceClass:
      "bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,244,252,0.96))]",
  },
  tips: {
    kicker: "Tips",
    accentClass: "bg-[rgba(81,163,163,0.12)] text-accent",
    surfaceClass:
      "bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,249,249,0.96))]",
  },
  external: {
    kicker: "Resources",
    accentClass: "bg-[rgba(255,193,69,0.18)] text-primary",
    surfaceClass:
      "bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(250,247,239,0.96))]",
  },
};

function formatPublishedDate(value: string | null) {
  if (!value) {
    return "최근 업데이트";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getTopicLabel(topic: string) {
  return topicLabelMap[topic] ?? topic;
}

export function KnowledgeTrackView({
  track,
  title,
  description,
  articles,
}: {
  track: KnowledgeTrack;
  title: string;
  description: string;
  articles: KnowledgeArticle[];
}) {
  const meta = trackMeta[track];
  const featuredCount = articles.filter((article) => article.featured).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section
        className={`rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] px-5 py-5 shadow-[0_14px_30px_rgba(37,31,74,0.05)] sm:rounded-[2rem] sm:px-6 sm:py-6 md:px-7 md:py-7 ${meta.surfaceClass}`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span
              className={`inline-flex rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] ${meta.accentClass}`}
            >
              {meta.kicker}
            </span>
            <h1 className="text-[clamp(1.22rem,1.7vw,1.55rem)] font-extrabold tracking-[-0.04em] text-primary">
              {title}
            </h1>
            <p className="max-w-3xl text-[13px] leading-6 text-muted-foreground sm:text-sm">
              {description}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <div className="min-w-0 rounded-[1.25rem] border border-[rgba(121,118,127,0.08)] bg-white/88 px-4 py-3.5 shadow-[0_10px_24px_rgba(37,31,74,0.04)] sm:rounded-[1.4rem] sm:px-5 sm:py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="whitespace-nowrap text-[11px] font-semibold tracking-[0.18em] text-primary/55">
                    전체 문서
                  </p>
                  <p className="mt-3 text-[1.65rem] font-extrabold tracking-[-0.05em] text-primary sm:text-2xl">
                    {articles.length}
                  </p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-full bg-[rgba(59,53,97,0.08)] text-primary">
                  <Files className="size-4" />
                </span>
              </div>
            </div>
            <div className="min-w-0 rounded-[1.25rem] border border-[rgba(121,118,127,0.08)] bg-white/88 px-4 py-3.5 shadow-[0_10px_24px_rgba(37,31,74,0.04)] sm:rounded-[1.4rem] sm:px-5 sm:py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="whitespace-nowrap text-[11px] font-semibold tracking-[0.18em] text-primary/55">
                    추천 문서
                  </p>
                  <p className="mt-3 text-[1.65rem] font-extrabold tracking-[-0.05em] text-primary sm:text-2xl">
                    {featuredCount}
                  </p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-full bg-[rgba(255,107,108,0.10)] text-secondary">
                  <Star className="size-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {articles.length ? (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/knowledge/${article.slug}`}
              className="group flex min-h-[230px] flex-col rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(37,31,74,0.05)] transition duration-200 hover:-translate-y-0.5 sm:rounded-[1.8rem] sm:px-5 sm:py-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${meta.accentClass}`}>
                    {getTopicLabel(article.topic)}
                  </span>
                  {article.featured ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(59,53,97,0.08)] px-3 py-1 text-[11px] font-bold text-primary">
                      <Star className="size-3.5" />
                      추천
                    </span>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatPublishedDate(article.publishedAt)}
                </span>
              </div>

              <div className="mt-5 flex-1 space-y-3">
                <h2 className="text-base font-extrabold leading-[1.28] tracking-[-0.03em] text-primary sm:text-[1.05rem]">
                  {article.title}
                </h2>
                <p className="line-clamp-4 text-[13px] leading-6 text-muted-foreground">
                  {article.summary}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {article.toolTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[rgba(244,243,243,0.92)] px-3 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {track === "external" && article.resourceUrl ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(244,243,243,0.92)] px-3 py-1 text-xs text-muted-foreground">
                    원문 링크
                    <ExternalLink className="size-3.5" />
                  </span>
                ) : null}
              </div>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
                문서 보기
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-8 text-center shadow-[0_12px_24px_rgba(37,31,74,0.05)] sm:rounded-[1.8rem] sm:px-6 sm:py-10">
          <p className="text-base font-semibold text-primary">아직 등록된 문서가 없습니다.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            같은 카테고리의 문서를 준비하고 있으니 조금만 기다려 주세요.
          </p>
        </section>
      )}
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, Lightbulb, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentViewer } from "@/lib/auth/viewer";
import { listIdeaPosts } from "@/lib/repositories/ideas";
import { listKnowledgeArticles } from "@/lib/repositories/knowledge";

const helperSteps = [
  {
    step: "01",
    title: "아이디어 선택",
    summary: "아이디어를 입력하거나 게시판에서 바로 가져옵니다.",
  },
  {
    step: "02",
    title: "구조 선택",
    summary: "예산, 디자인, 환경에 맞는 구조를 정합니다.",
  },
  {
    step: "03",
    title: "스킬 선택",
    summary: "구조에 맞는 설치 보조 도구와 추천 스킬을 고릅니다.",
  },
  {
    step: "04",
    title: "프롬프트 실행",
    summary: "단계별 프롬프트를 순서대로 복사해서 바로 실행합니다.",
  },
];

function CompactIntro({
  title,
  description,
  href,
  actionLabel,
  tone = "soft",
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  tone?: "soft" | "accent";
}) {
  const accent = tone === "accent";

  return (
    <div
      className={
        accent
          ? "rounded-[1.8rem] bg-primary px-6 py-6 text-white shadow-[0_18px_36px_rgba(37,31,74,0.14)]"
          : "rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-white px-6 py-6 shadow-[0_12px_24px_rgba(37,31,74,0.05)]"
      }
    >
      <h2
        className={
          accent
            ? "text-[1.3rem] font-bold tracking-[-0.03em]"
            : "text-[1.3rem] font-bold tracking-[-0.03em] text-primary"
        }
      >
        {title}
      </h2>
      <p
        className={
          accent
            ? "mt-3 text-sm leading-6 text-white/78"
            : "mt-3 text-sm leading-6 text-muted-foreground"
        }
      >
        {description}
      </p>
      <Button
        asChild
        variant={accent ? "outline" : "secondary"}
        className={
          accent
            ? "mt-6 w-full border-white/18 bg-white text-primary hover:bg-white/92"
            : "mt-6 w-full"
        }
      >
        <Link href={href}>
          {actionLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

export default async function HomeDashboardPage() {
  const viewer = await getCurrentViewer();
  const [basics, levelUp, tips, external, popularIdeas] = await Promise.all([
    listKnowledgeArticles("basics"),
    listKnowledgeArticles("level-up"),
    listKnowledgeArticles("tips"),
    listKnowledgeArticles("external"),
    listIdeaPosts("popular", viewer?.id),
  ]);

  const knowledgeMenus = [
    {
      title: "기초가이드",
      summary: "입문, 도구 준비, 요구사항 작성, 기본 구현 흐름",
      href: "/knowledge/basics",
      count: basics.length,
    },
    {
      title: "레벨업",
      summary: "권한 설계, 보안, SaaS 연동, 배포와 운영",
      href: "/knowledge/level-up",
      count: levelUp.length,
    },
    {
      title: "꿀팁",
      summary: "프롬프트 습관, 기획 팁, 검증과 배포 비교",
      href: "/knowledge/tips",
      count: tips.length,
    },
    {
      title: "외부리소스",
      summary: "공식 문서, GitHub, YouTube 큐레이션",
      href: "/knowledge/external",
      count: external.length,
    },
  ];

  const topIdeas = popularIdeas.slice(0, 3);

  return (
    <div className="space-y-10 py-2">
      <section className="grid gap-5 xl:grid-cols-[0.9fr_2.1fr] xl:items-stretch">
        <CompactIntro
          title="지식 베이스"
          description="4개 메뉴로 나누어 필요한 정보만 빠르게 찾아볼 수 있습니다."
          href="/knowledge/basics"
          actionLabel="열기"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {knowledgeMenus.map((menu) => (
            <Link
              key={menu.title}
              href={menu.href}
              className="rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_12px_24px_rgba(37,31,74,0.05)] transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-bold tracking-[-0.03em] text-primary">
                    {menu.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {menu.summary}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[rgba(244,243,243,0.92)] px-3 py-1 text-xs font-semibold text-primary">
                  {menu.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[2.1fr_0.9fr] xl:items-stretch">
        <div className="grid gap-4 xl:grid-cols-3">
          {topIdeas.length > 0 ? (
            topIdeas.map((idea, index) => (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className="rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_12px_24px_rgba(37,31,74,0.05)] transition hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-secondary">
                    Top {index + 1}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(244,243,243,0.92)] px-3 py-1 text-xs font-semibold text-primary">
                    <Lightbulb className="size-3.5" />
                    {idea.upvoteCount}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold tracking-[-0.03em] text-primary">
                  {idea.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {idea.content}
                </p>
              </Link>
            ))
          ) : (
            <div className="rounded-[1.6rem] border border-dashed border-[rgba(121,118,127,0.18)] bg-white px-6 py-10 text-center text-sm text-muted-foreground xl:col-span-3">
              아직 등록된 아이디어가 없습니다.
            </div>
          )}
        </div>

        <CompactIntro
          title="아이디어 보드"
          description="지금 가장 반응이 좋은 아이디어 3개를 먼저 확인할 수 있습니다."
          href="/ideas"
          actionLabel="보드 열기"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_2.1fr] xl:items-stretch">
        <CompactIntro
          title="바이브 헬퍼"
          description="실제 흐름에 맞춰 아이디어 → 구조 → 스킬 → 프롬프트로 이어지는 4단계 작업 순서를 안내합니다."
          href="/helper/idea"
          actionLabel="시작하기"
          tone="accent"
        />

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {helperSteps.map((step) => (
            <article
              key={step.step}
              className="rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_12px_24px_rgba(37,31,74,0.05)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-secondary">
                  Step {step.step}
                </span>
                <Sparkles className="size-4 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-[-0.03em] text-primary">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.summary}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

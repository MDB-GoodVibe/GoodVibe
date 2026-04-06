import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Database,
  ExternalLink,
  PlayCircle,
  Shield,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { KnowledgeArticle } from "@/types/good-vibe";

function formatDate(value: string | null, style: "long" | "short" = "short") {
  if (!value) {
    return "최근 업데이트";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: style === "long" ? "numeric" : undefined,
    month: style === "long" ? "long" : "short",
    day: "numeric",
  }).format(new Date(value));
}

function stripMarkdown(value: string) {
  return value
    .replace(/^##\s+/gm, "")
    .replace(/^- /gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .trim();
}

function extractPreview(value: string, limit = 160) {
  const plain = stripMarkdown(value).replace(/\s+/g, " ");
  return plain.length > limit ? `${plain.slice(0, limit).trim()}...` : plain;
}

function estimateMinutes(value: string) {
  return Math.max(4, Math.ceil(stripMarkdown(value).length / 280));
}

function hostLabel(url: string | null) {
  if (!url) {
    return "GOOD VIBE";
  }

  try {
    return new URL(url).hostname.replace(/^www\./, "").toUpperCase();
  } catch {
    return "WEB";
  }
}

function findArticle(articles: KnowledgeArticle[], slug: string) {
  return articles.find((article) => article.slug === slug) ?? null;
}

function SectionTitle({
  title,
  actionLabel,
  actionHref,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="h-8 w-1 rounded-full bg-secondary" />
        <h2 className="text-[clamp(1.22rem,1.8vw,1.55rem)] font-extrabold tracking-[-0.04em] text-primary">
          {title}
        </h2>
      </div>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="text-sm font-bold text-secondary">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function KnowledgeBasicsShowcase({
  articles,
}: {
  articles: KnowledgeArticle[];
}) {
  const introArticle =
    findArticle(articles, "vibe-coding-what-is") ??
    articles.find((article) => article.featured) ??
    articles[0] ??
    null;
  const setupArticle =
    findArticle(articles, "tool-setup-windows-mac") ?? articles[1] ?? introArticle;
  const glossaryArticle =
    findArticle(articles, "vibe-coding-glossary") ?? articles[2] ?? introArticle;

  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <span className="inline-flex rounded-full bg-[rgba(255,107,108,0.08)] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary">
          기초 안내 가이드
        </span>
        <div className="space-y-4">
          <h1 className="max-w-4xl text-[clamp(1.7rem,2.4vw,2.35rem)] font-extrabold leading-[1.08] tracking-[-0.05em] text-primary">
            AI 코딩의 시작:
            <br />
            Claude Code와 Vibe Coding
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDate(introArticle?.publishedAt ?? null, "long")}</span>
            <span>{estimateMinutes(introArticle?.contentMd ?? "")}분 읽기</span>
            <span>Good Vibe 에디터</span>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2.25rem] border border-[rgba(121,118,127,0.08)] bg-[linear-gradient(135deg,#f7f5ff_0%,#fffefc_52%,#eef2ff_100%)] px-8 py-10 shadow-soft">
        <div className="absolute -right-10 top-6 h-52 w-52 rounded-full bg-[rgba(255,107,108,0.16)] blur-3xl" />
        <div className="absolute left-12 top-16 h-48 w-48 rounded-full bg-[rgba(91,95,151,0.10)] blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-5">
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">
              처음 시작하는 분이 바로 따라갈 수 있도록 도구 준비, 핵심 개념, 꼭 알아야 할 용어를
              한 흐름으로 정리했습니다.
            </p>
            <div className="rounded-[1.5rem] border border-[rgba(255,193,69,0.45)] bg-[rgba(255,255,255,0.84)] px-5 py-4 text-sm leading-7 text-foreground/82">
              “{introArticle?.summary ?? "아이디어를 자연어로 설명하고 AI와 함께 결과물을 만드는 작업 방식"}”
            </div>
          </div>

          <div className="relative h-[320px] overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#ffffff_0%,#f0eefc_45%,#dcdcf7_100%)]">
            <div className="absolute bottom-10 left-10 h-32 w-48 rounded-[999px] bg-[#1f2030] shadow-[0_24px_40px_rgba(31,32,48,0.26)]" />
            <div className="absolute bottom-16 left-28 h-28 w-44 rotate-[-10deg] rounded-[999px] bg-[#2b2b3a] shadow-[0_20px_36px_rgba(31,32,48,0.28)]" />
            <div className="absolute right-8 top-8 rounded-full bg-white/80 px-4 py-2 text-xs font-bold tracking-[0.18em] text-primary">
              START HERE
            </div>
            <div className="absolute bottom-6 right-8 rounded-[1.4rem] bg-white/84 px-4 py-3 text-sm font-semibold text-primary shadow-[0_14px_30px_rgba(37,31,74,0.08)]">
              Claude Code
              <br />
              Codex
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle title="Vibe Coding이란 무엇인가?" />
        <p className="max-w-4xl text-base leading-8 text-muted-foreground">
          {extractPreview(introArticle?.contentMd ?? "", 340)}
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface-subtle rounded-[1.7rem] px-5 py-5">
            <p className="text-lg font-bold tracking-[-0.03em] text-primary">바이브 코딩의 장점</p>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
              <li>빠르게 화면과 구조를 먼저 확인할 수 있습니다.</li>
              <li>비개발자도 아이디어를 실제 결과물로 연결하기 쉽습니다.</li>
              <li>작은 수정 요청으로 품질을 점진적으로 높일 수 있습니다.</li>
            </ul>
          </div>
          <div className="surface-subtle rounded-[1.7rem] px-5 py-5">
            <p className="text-lg font-bold tracking-[-0.03em] text-primary">핵심 역할의 변화</p>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
              <li>코드 한 줄보다 목표와 맥락을 명확히 정의하는 힘이 중요합니다.</li>
              <li>설계, 사용자 경험, 검토 기준이 더 큰 차이를 만듭니다.</li>
              <li>AI에게 무엇을 맡기고 무엇을 확인할지 결정하는 감각이 필요합니다.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle title="도구 설치 가이드: Claude Code & Codex" />
        <div className="flex gap-2">
          <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
            Windows
          </span>
          <span className="rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-4 py-2 text-sm font-semibold text-primary">
            macOS
          </span>
        </div>
        <div className="space-y-5">
          {[
            {
              step: "01",
              title: "Node.js 환경 구성",
              body: "CLI 도구 설치를 위해 Node.js 18 이상 버전을 먼저 확인합니다.",
              code: "node -v",
            },
            {
              step: "02",
              title: "Claude Code CLI 설치",
              body:
                "터미널에서 설치 명령을 실행하고 로그인 상태를 확인합니다.",
              code: "npm install -g @anthropic-ai/claude-code",
            },
            {
              step: "03",
              title: "VS Code와 Codex 점검",
              body:
                "확장 설치 후 새 프로젝트 폴더에서 간단한 명령이 정상 동작하는지 확인합니다.",
              code: "codex --help",
            },
          ].map((item) => (
            <div key={item.step} className="space-y-3 rounded-[1.8rem] bg-white px-6 py-6 shadow-[0_16px_34px_rgba(37,31,74,0.05)]">
              <div className="flex items-start gap-4">
                <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ffc145] text-sm font-extrabold text-primary">
                  {item.step}
                </span>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-[-0.03em] text-primary">{item.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
                </div>
              </div>
              <div className="rounded-[1.2rem] bg-primary px-4 py-4 font-mono text-sm text-white">
                {item.code}
              </div>
            </div>
          ))}
        </div>
        {setupArticle ? (
          <Button asChild variant="outline">
            <Link href={`/knowledge/${setupArticle.slug}`}>설치 가이드 상세보기</Link>
          </Button>
        ) : null}
      </section>

      <section className="space-y-6">
        <SectionTitle title="입문자를 위한 Vibe Coding 3단계" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "의도 정의",
              body: "만들고 싶은 기능과 꼭 필요한 화면을 짧게 적습니다.",
            },
            {
              title: "프롬프트 실행",
              body: "작은 단계로 나눠 요청하고 결과를 바로 확인합니다.",
            },
            {
              title: "반복 개선",
              body: "좋았던 점과 부족한 점을 정리해 다음 요청에 반영합니다.",
            },
          ].map((item, index) => (
            <div key={item.title} className="surface-subtle rounded-[1.8rem] px-5 py-6">
              <span className="text-sm font-bold tracking-[0.18em] text-secondary">
                0{index + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold tracking-[-0.03em] text-primary">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-accent rounded-[2rem] px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-lg font-bold tracking-[-0.03em]">도움이 되었나요?</p>
            <p className="mt-2 text-sm leading-7 text-white/72">
              기초를 익혔다면 이제 컨텍스트 관리와 보안 운영이 포함된 레벨업 가이드로 넘어가 보세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/knowledge/level-up">
                레벨업 가이드 보기
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            {glossaryArticle ? (
              <Button
                asChild
                variant="outline"
                className="border-white/18 bg-white/10 text-white hover:bg-white/14"
              >
                <Link href={`/knowledge/${glossaryArticle.slug}`}>용어 정리 보기</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

export function KnowledgeLevelUpShowcase({
  articles,
}: {
  articles: KnowledgeArticle[];
}) {
  const leadArticle = articles.find((article) => article.featured) ?? articles[0] ?? null;
  const securityArticle =
    articles.find((article) => article.topic === "security") ?? articles[1] ?? leadArticle;
  const saasArticle =
    articles.find((article) => article.topic === "saas-guides") ?? articles[2] ?? leadArticle;

  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <span className="inline-flex rounded-full bg-[rgba(255,107,108,0.08)] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary">
          Expert Path
        </span>
        <h1 className="max-w-5xl text-[clamp(1.7rem,2.4vw,2.3rem)] font-extrabold leading-[1.08] tracking-[-0.05em] text-primary">
          레벨업: 전문가를 위한 가이드
        </h1>
        <p className="max-w-4xl text-base leading-8 text-muted-foreground">
          컨텍스트 최적화부터 보안, SaaS 연동 전략까지 실제 서비스 수준의 바이브 코딩 운영에
          필요한 내용을 한 번에 모았습니다.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.62fr]">
        <div className="surface-subtle rounded-[2.2rem] px-8 py-8">
          <div className="flex size-14 items-center justify-center rounded-[1.4rem] bg-[rgba(59,53,97,0.08)] text-primary">
            <Sparkles className="size-7" />
          </div>
          <h2 className="mt-8 text-[clamp(1.35rem,1.9vw,1.7rem)] font-extrabold tracking-[-0.04em] text-primary">
            {leadArticle?.title ?? "컨텍스트 관리 전략"}
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
            {leadArticle?.summary ??
              "복잡한 프로젝트에서도 AI가 방향을 잃지 않도록 문서, 범위, 로그를 함께 운영하는 전략입니다."}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {(leadArticle?.toolTags ?? ["Token Optimization", "Hierarchy Logic"]).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-3 py-1 text-sm text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[2.2rem] bg-[#dd7373] px-8 py-8 text-white shadow-[0_24px_52px_rgba(221,115,115,0.18)]">
          <div className="flex size-14 items-center justify-center rounded-[1.4rem] bg-white/12 text-white">
            <WandSparkles className="size-7" />
          </div>
          <h2 className="mt-8 text-[clamp(1.4rem,2vw,1.85rem)] font-extrabold tracking-[-0.05em]">
            플랜 모드 마스터
          </h2>
          <p className="mt-4 text-base leading-8 text-white/84">
            대규모 프로젝트를 위한 마일스톤 설계와 단계별 실행 계획 수립 감각을 기르는 출발점입니다.
          </p>
          {leadArticle ? (
            <Button
              asChild
              variant="outline"
              className="mt-10 w-full border-white/18 bg-white text-secondary hover:bg-white/92"
            >
              <Link href={`/knowledge/${leadArticle.slug}`}>
                가이드 시작하기
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="surface-subtle rounded-[2rem] px-6 py-6">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#ffc145] text-primary">
            <Shield className="size-6" />
          </div>
          <h3 className="mt-5 text-lg font-bold tracking-[-0.03em] text-primary">
            {securityArticle?.title ?? "보안 지침"}
          </h3>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
            <li>데이터 마스킹과 민감 정보 분리</li>
            <li>엔드포인트 인증과 권한 계층화</li>
            <li>로그 추적과 감사 포인트 점검</li>
          </ul>
        </div>

        <div className="surface-subtle rounded-[2rem] px-6 py-6">
          <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <h3 className="text-lg font-bold tracking-[-0.03em] text-primary">
                {saasArticle?.title ?? "주요 SaaS 연동 가이드"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {saasArticle?.summary ??
                  "Supabase, Vercel, Cloudflare 같은 핵심 도구를 프로젝트에 안정적으로 연결하는 흐름을 정리했습니다."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {(saasArticle?.toolTags ?? ["Supabase", "Vercel", "Cloudflare"]).slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[1rem] bg-[rgba(244,243,243,0.92)] px-4 py-3 text-sm font-semibold text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[1.8rem] bg-[linear-gradient(160deg,#ffffff_0%,#f0eefc_55%,#e2e0f7_100%)] px-5 py-6 text-center">
              <Database className="mx-auto size-10 text-primary" />
              <p className="mt-4 text-lg font-bold text-primary">실전 연동</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">키 확인, 입력, 검증까지 한 흐름으로 연결합니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle title="실전 배포 아키텍처" />
        <div className="space-y-5">
          {articles.slice(0, 3).map((article, index) => (
            <div key={article.id} className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-full bg-primary text-base font-extrabold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.03em] text-primary">{article.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{article.summary}</p>
                </div>
              </div>
              <div className="rounded-[1.8rem] bg-white px-6 py-6 shadow-[0_14px_30px_rgba(37,31,74,0.05)]">
                <p className="text-base leading-8 text-muted-foreground">
                  {extractPreview(article.contentMd, 360)}
                </p>
                <Button asChild variant="outline" className="mt-5">
                  <Link href={`/knowledge/${article.slug}`}>문서 열기</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function KnowledgeTipsShowcase({
  articles,
}: {
  articles: KnowledgeArticle[];
}) {
  const leadArticle = articles[0] ?? null;
  const spotlightArticle = articles[1] ?? leadArticle;

  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <span className="inline-flex rounded-full bg-[rgba(255,107,108,0.08)] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary">
          Pro Tip Collection
        </span>
        <h1 className="max-w-5xl text-[clamp(1.7rem,2.4vw,2.35rem)] font-extrabold leading-[1.08] tracking-[-0.05em] text-primary">
          당신의 생산성을 깨우는
          <br />
          <span className="text-secondary">정교한 꿀팁 모음</span>
        </h1>
        <p className="max-w-4xl text-base leading-8 text-muted-foreground">
          반복되는 작업에서 벗어나 더 창의적인 일에 집중할 수 있도록, Good Vibe가 검증한
          프롬프트와 워크플로우 팁을 모아 두었습니다.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.28fr_0.72fr]">
        <div className="surface-subtle rounded-[2.2rem] px-7 py-7">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[rgba(81,163,163,0.12)] px-3 py-1 text-xs font-bold text-accent">
              생산성
            </span>
            <span className="rounded-full bg-[rgba(91,95,151,0.10)] px-3 py-1 text-xs font-bold text-primary">
              Top Pick
            </span>
          </div>
          <h2 className="mt-6 max-w-3xl text-[clamp(1.3rem,1.8vw,1.65rem)] font-extrabold leading-[1.14] tracking-[-0.04em] text-primary">
            {leadArticle?.title ?? "프롬프트 체이닝으로 복잡한 결과물 만들기"}
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
            {leadArticle?.summary ??
              "하나의 큰 요청 대신 작은 단계로 나누면 결과가 더 예측 가능해지고 수정도 쉬워집니다."}
          </p>
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-foreground/72">
              <span className="flex size-10 items-center justify-center rounded-full bg-[rgba(59,53,97,0.08)] text-primary">
                <BookOpen className="size-4" />
              </span>
              에디터, 김현우
            </div>
            {leadArticle ? (
              <Link href={`/knowledge/${leadArticle.slug}`} className="text-base font-bold text-secondary">
                상세보기
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-[2.2rem] bg-primary px-7 py-7 text-white">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/12 text-white">
            <Sparkles className="size-6" />
          </div>
          <span className="mt-6 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/76">
            프롬프트
          </span>
          <h2 className="mt-5 text-[clamp(1.4rem,2vw,1.9rem)] font-extrabold leading-[1.15] tracking-[-0.05em]">
            결과물이 달라지는
            <br />
            ‘역할 지정’의 기술
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            AI에게 단순 지시 대신 역할과 관점을 함께 주면 훨씬 설득력 있는 결과를 만들 수 있습니다.
          </p>
          {spotlightArticle ? (
            <Button
              asChild
              variant="outline"
              className="mt-10 w-full border-white/18 bg-white text-primary hover:bg-white/92"
            >
              <Link href={`/knowledge/${spotlightArticle.slug}`}>
                튜토리얼 보기
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle title="최신 꿀팁 리스트" />
        <div className="space-y-4">
          {articles.map((article, index) => (
            <details
              key={article.id}
              open={index === 0}
              className="group overflow-hidden rounded-[1.8rem] bg-white shadow-[0_14px_30px_rgba(37,31,74,0.05)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold tracking-[-0.04em] text-primary">{article.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{article.summary}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-secondary">
                  {estimateMinutes(article.contentMd)}분
                </span>
              </summary>
              <div className="grid gap-6 border-t border-[rgba(121,118,127,0.08)] px-6 py-6 lg:grid-cols-[1fr_0.86fr]">
                <div className="space-y-4">
                  <p className="text-base leading-8 text-muted-foreground">
                    {extractPreview(article.contentMd, 360)}
                  </p>
                  <div className="rounded-[1.4rem] bg-[rgba(244,243,243,0.9)] px-5 py-4 text-sm leading-7 text-foreground/78">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary/55">
                      Prompting Step
                    </p>
                    <ol className="mt-3 space-y-2">
                      <li>1. 문제를 한 문장으로 정의합니다.</li>
                      <li>2. 필요한 결과 형식을 먼저 지정합니다.</li>
                      <li>3. 조사, 초안, 개선 요청을 순서대로 나눕니다.</li>
                    </ol>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-[1.6rem] bg-primary px-5 py-5 text-sm leading-7 text-white/88">
                    “먼저 주제의 핵심 쟁점 3가지를 정리하고, 그다음 각 쟁점별로 지금 당장 필요한
                    실행 항목만 추려줘.”
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="secondary">
                      <Link href="/helper/prompts">헬퍼에서 써보기</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/knowledge/${article.slug}`}>문서 열기</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export function KnowledgeExternalShowcase({
  articles,
}: {
  articles: KnowledgeArticle[];
}) {
  const featuredArticle = articles.find((article) => article.featured) ?? articles[0] ?? null;
  const totalResources = articles.length;
  const documentationCount = articles.filter((article) =>
    article.toolTags.some((tag) =>
      ["Claude Code", "Supabase", "Next.js", "Vercel"].includes(tag),
    ),
  ).length;
  const guideCount = articles.filter(
    (article) => article.topic === "workflow-and-ops" || article.topic === "tool-setup",
  ).length;

  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <span className="inline-flex rounded-full bg-[rgba(255,107,108,0.08)] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary">
          External Resources
        </span>
        <h1 className="max-w-4xl text-[clamp(1.7rem,2.4vw,2.3rem)] font-extrabold leading-[1.08] tracking-[-0.05em] text-primary">
          외부 리소스 창고
        </h1>
        <p className="max-w-4xl text-base leading-8 text-muted-foreground">
          Good Vibe 팀이 직접 추린 공식 문서, 튜토리얼, 기술 가이드입니다. 필요한 자료를 빠르게
          찾고 바로 원문으로 이동할 수 있습니다.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.62fr]">
        <div className="relative overflow-hidden rounded-[2.3rem] bg-[linear-gradient(135deg,#201738_0%,#41346d_40%,#7e567a_100%)] px-8 py-8 text-white shadow-[0_26px_52px_rgba(37,31,74,0.18)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,193,69,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(81,163,163,0.18),transparent_32%)]" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex rounded-full bg-white/14 px-3 py-1 text-xs font-bold tracking-[0.18em] text-white">
              FEATURED RESOURCE
            </span>
            <p className="text-sm text-white/68">{hostLabel(featuredArticle?.resourceUrl ?? null)}</p>
            <h2 className="text-[clamp(1.35rem,1.9vw,1.75rem)] font-extrabold leading-[1.14] tracking-[-0.04em]">
              {featuredArticle?.title ?? "대표 리소스"}
            </h2>
            <p className="max-w-2xl text-base leading-8 text-white/76">
              {featuredArticle?.summary ??
                "공식 문서와 튜토리얼 위주로 큐레이션해 시작할 때 덜 헤매도록 정리했습니다."}
            </p>
            {featuredArticle?.resourceUrl ? (
              <Button
                asChild
                variant="outline"
                className="mt-6 border-white/18 bg-white text-primary hover:bg-white/92"
              >
                <Link href={featuredArticle.resourceUrl} target="_blank" rel="noreferrer">
                  원문에서 보기
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="rounded-[2.3rem] bg-primary px-7 py-7 text-white">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#ffc145] text-primary">
            <Database className="size-6" />
          </div>
          <h2 className="mt-6 text-[clamp(1.3rem,1.8vw,1.65rem)] font-extrabold tracking-[-0.04em]">
            리소스 통계
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/72">
            Good Vibe에서 자주 참고하는 외부 자료만 선별해 정리했습니다.
          </p>
          <div className="mt-8 space-y-6">
            {[
              { label: "전체 리소스", value: `${totalResources}+`, tone: "bg-[#ffc145]" },
              { label: "공식 문서", value: `${documentationCount}+`, tone: "bg-[#51a3a3]" },
              { label: "실전 가이드", value: `${guideCount}+`, tone: "bg-[#ff6b6c]" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/76">{item.label}</span>
                  <span className="text-2xl font-extrabold tracking-[-0.05em]">{item.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/14">
                  <div className={`h-full rounded-full ${item.tone}`} style={{ width: "72%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle title="블로그 및 아티클" />
        <div className="grid gap-5 xl:grid-cols-2">
          {articles.map((article) => (
            <article
              key={article.id}
              className="surface-subtle rounded-[2rem] px-6 py-6 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex gap-4">
                <div className="flex size-24 shrink-0 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(160deg,#2a2148_0%,#4a3d78_52%,#7a648e_100%)] text-white">
                  <PlayCircle className="size-10" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.18em] text-accent">
                    <span>{hostLabel(article.resourceUrl)}</span>
                    <span className="text-muted-foreground">{estimateMinutes(article.contentMd)} min read</span>
                  </div>
                  <h3 className="mt-3 text-[1.2rem] font-extrabold leading-[1.24] tracking-[-0.04em] text-primary">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{article.summary}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href={`/knowledge/${article.slug}`}>설명 보기</Link>
                </Button>
                {article.resourceUrl ? (
                  <Button asChild variant="secondary">
                    <Link href={article.resourceUrl} target="_blank" rel="noreferrer">
                      원문 열기
                      <ExternalLink className="size-4" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useRef, useState, type ReactNode } from "react";
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Cloud,
  Code2,
  Database,
  ExternalLink,
  LayoutTemplate,
  LoaderCircle,
  PanelTop,
  Rocket,
  Search,
  Wand2,
} from "lucide-react";

import { MermaidDiagram } from "@/components/mermaid-diagram";
import { PromptCard } from "@/components/prompt-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import { useWorkspace } from "@/components/workspace-provider";
import { rankCatalogItemsForDraft } from "@/lib/explore/recommendations";
import { cn } from "@/lib/utils";
import type {
  ArchitectureOptions,
  CatalogSort,
  CatalogSourceFilter,
  ExploreApiResponse,
  ExternalCatalogItem,
  SelectedSkill,
  WorkspaceSection,
} from "@/types/project";

const budgetOptions = [
  { value: "free" as const, label: "무료 중심", hint: "가볍게 시작하고 검증하기 좋은 구성" },
  { value: "flexible" as const, label: "유료 포함", hint: "좋은 도구를 같이 써도 괜찮은 구성" },
] as const;

const designOptions = [
  { value: "standard" as const, label: "기본 UI", hint: "빠른 구현과 검증에 맞는 화면" },
  { value: "custom" as const, label: "브랜드형 UI", hint: "톤과 인상이 더 중요한 화면" },
] as const;

const environmentOptions = [
  { value: "local" as const, label: "로컬 작업", hint: "Cursor, Claude Code, Codex 같은 흐름" },
  { value: "cloud" as const, label: "클라우드 작업", hint: "브라우저 중심으로 빠르게 진행" },
] as const;

const stageItems = [
  { id: "idea" as const, title: "아이디어", summary: "무엇을 만들지 정하기", href: "/helper/idea" },
  { id: "architecture" as const, title: "구조", summary: "기술 구성을 고르기", href: "/helper/architecture" },
  { id: "skills" as const, title: "스킬", summary: "설치할 보조 도구 고르기", href: "/helper/skills" },
  { id: "prompts" as const, title: "프롬프트", summary: "복사해서 바로 실행하기", href: "/helper/prompts" },
] as const;

const skillSources = [
  { id: "all" as const, label: "전체" },
  { id: "skills-sh" as const, label: "skills.sh" },
  { id: "claude-marketplaces" as const, label: "Claude Marketplaces" },
] as const;

const skillSorts: Array<{ id: CatalogSort; label: string }> = [
  { id: "popular", label: "인기순" },
  { id: "trending", label: "트렌딩" },
  { id: "hot", label: "HOT" },
];

function HelperShell({ children }: { children: ReactNode }) {
  return <div className="space-y-5">{children}</div>;
}

function HelperHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-[linear-gradient(180deg,#fcfbfb_0%,#f8f6f7_100%)] px-6 py-5 shadow-[0_14px_28px_rgba(37,31,74,0.04)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-secondary">
            Vibe Helper
          </p>
          <h1 className="text-[1.45rem] font-bold tracking-[-0.04em] text-primary">
            {title}
          </h1>
          <p className="text-[13px] text-muted-foreground">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  );
}

function HorizontalStageNav({
  current,
}: {
  current: Extract<WorkspaceSection, "idea" | "architecture" | "skills" | "prompts">;
}) {
  return (
    <section className="grid gap-3 xl:grid-cols-4">
      {stageItems.map((item, index) => {
        const active = item.id === current;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "group rounded-[1.4rem] border px-4 py-4 transition",
              active
                ? "border-secondary/22 bg-white shadow-[0_14px_28px_rgba(37,31,74,0.06)]"
                : "border-[rgba(121,118,127,0.08)] bg-[rgba(255,255,255,0.72)] hover:bg-white",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-[12px] font-extrabold",
                    active
                      ? "bg-[rgba(255,107,108,0.12)] text-secondary"
                      : "bg-[rgba(59,53,97,0.06)] text-primary",
                  )}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-primary">{item.title}</p>
                  <p className="text-[12px] text-muted-foreground">{item.summary}</p>
                </div>
              </div>
              {active ? (
                <span className="shrink-0 rounded-full bg-[rgba(255,107,108,0.10)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-secondary">
                  현재 단계
                </span>
              ) : null}
            </div>
          </Link>
        );
      })}
    </section>
  );
}

function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_12px_24px_rgba(37,31,74,0.04)]",
        className,
      )}
    >
      <div className="space-y-1">
        <h2 className="text-[1rem] font-semibold tracking-[-0.03em] text-primary">{title}</h2>
        {description ? <p className="text-[12px] leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatGrid({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[1.2rem] border border-[rgba(121,118,127,0.08)] bg-[rgba(248,247,248,0.92)] px-4 py-4"
        >
          <p className="text-[11px] text-muted-foreground">{item.label}</p>
          <p className="mt-1.5 text-[1.05rem] font-semibold tracking-[-0.03em] text-primary">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function OptionCard({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: ReadonlyArray<{ value: string; label: string; hint: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <SectionCard title={title}>
      <div className="space-y-2">
        {options.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "w-full rounded-[1rem] border px-4 py-3 text-left transition",
                active
                  ? "border-primary/16 bg-primary text-white"
                  : "border-[rgba(121,118,127,0.08)] bg-[rgba(248,247,248,0.92)] text-foreground hover:bg-white",
              )}
            >
              <p className="text-[13px] font-semibold">{option.label}</p>
              <p className={cn("mt-1 text-[12px]", active ? "text-white/76" : "text-muted-foreground")}>
                {option.hint}
              </p>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function buildSelectedSkill(item: ExternalCatalogItem): SelectedSkill {
  return {
    id: item.id,
    title: item.title,
    sourceLabel: item.sourceLabel,
    summary: item.summary,
    url: item.url,
    repoUrl: item.repoUrl,
    installCommand: item.installCommand,
    tags: item.tags,
    popularityLabel: item.popularityLabel,
  };
}

function StageSelector({
  stages,
  activeStage,
  onSelect,
}: {
  stages: Array<{
    stage: 1 | 2 | 3 | 4;
    title: string;
    objective: string;
    checklist: string[];
  }>;
  activeStage: 1 | 2 | 3 | 4;
  onSelect: (stage: 1 | 2 | 3 | 4) => void;
}) {
  return (
    <section className="grid gap-3 xl:grid-cols-4">
      {stages.map((stage) => {
        const active = stage.stage === activeStage;

        return (
          <button
            key={stage.stage}
            type="button"
            onClick={() => onSelect(stage.stage)}
            className={cn(
              "rounded-[1.4rem] border px-4 py-4 text-left transition",
              active
                ? "border-primary/14 bg-primary text-white shadow-[0_16px_30px_rgba(59,53,97,0.16)]"
                : "border-[rgba(121,118,127,0.08)] bg-white hover:bg-[rgba(248,247,248,0.92)]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className={cn(
                    "text-[10px] font-extrabold uppercase tracking-[0.22em]",
                    active ? "text-white/72" : "text-primary/56",
                  )}
                >
                  Stage {stage.stage}
                </p>
                <p className="mt-2 text-[14px] font-semibold">{stage.title}</p>
                <p
                  className={cn(
                    "mt-1 text-[12px] leading-5",
                    active ? "text-white/76" : "text-muted-foreground",
                  )}
                >
                  {stage.objective}
                </p>
              </div>
              {active ? (
                <span className="shrink-0 rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/80">
                  실행 중
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </section>
  );
}

function TechnologyCards({
  options,
}: {
  options: ArchitectureOptions;
}) {
  const items = [
    {
      title: "Next.js + TypeScript",
      description: "App Router 기반으로 화면과 서버 동작을 함께 관리합니다.",
      icon: PanelTop,
    },
    {
      title: "Tailwind + shadcn/ui",
      description: options.design === "custom" ? "브랜드 톤을 더한 커스텀 UI에 맞습니다." : "빠른 구현과 검증에 맞는 UI 조합입니다.",
      icon: LayoutTemplate,
    },
    {
      title: "Supabase",
      description: "인증, 데이터 저장, 기본 백엔드 역할을 한 번에 맡깁니다.",
      icon: Database,
    },
    {
      title: options.environment === "local" ? "로컬 IDE" : "클라우드 IDE",
      description: options.environment === "local" ? "Cursor, Claude Code, Codex 같은 흐름과 잘 맞습니다." : "브라우저 중심 작업과 빠른 공유에 유리합니다.",
      icon: options.environment === "local" ? Code2 : Cloud,
    },
    {
      title: "Vercel",
      description: "프론트엔드 배포와 미리보기를 가장 빠르게 연결할 수 있습니다.",
      icon: Rocket,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-[1.2rem] border border-[rgba(121,118,127,0.08)] bg-[rgba(248,247,248,0.92)] px-4 py-4"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-white text-primary">
              <Icon className="size-4" />
            </div>
            <p className="mt-3 text-[13px] font-semibold text-primary">{item.title}</p>
            <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
}

export function IdeaWorkspaceScreen({
  importedIdea,
  autoAnalyze = false,
}: {
  importedIdea?: {
    sourceIdeaId: string;
    sourceIdeaTitle: string;
    idea: string;
  } | null;
  autoAnalyze?: boolean;
}) {
  const {
    analyzeIdea,
    draft,
    importIdeaSource,
    selectServiceType,
    selectedServiceType,
    setIdea,
    setProjectName,
    visitSection,
  } = useWorkspace();
  const autoAnalyzedSourceIdRef = useRef<string | null>(null);

  useEffect(() => {
    visitSection("idea");
  }, [visitSection]);

  useEffect(() => {
    if (!importedIdea) {
      return;
    }

    if (
      draft.sourceIdeaId === importedIdea.sourceIdeaId &&
      draft.idea.trim() === importedIdea.idea.trim()
    ) {
      return;
    }

    importIdeaSource(importedIdea);
  }, [draft.idea, draft.sourceIdeaId, importIdeaSource, importedIdea]);

  useEffect(() => {
    if (!autoAnalyze || !importedIdea) {
      return;
    }

    const ready =
      draft.sourceIdeaId === importedIdea.sourceIdeaId &&
      draft.idea.trim() === importedIdea.idea.trim();

    if (!ready || draft.analysis) {
      return;
    }

    if (autoAnalyzedSourceIdRef.current === importedIdea.sourceIdeaId) {
      return;
    }

    autoAnalyzedSourceIdRef.current = importedIdea.sourceIdeaId;
    analyzeIdea("idea");
  }, [analyzeIdea, autoAnalyze, draft.analysis, draft.idea, draft.sourceIdeaId, importedIdea]);

  return (
    <HelperShell>
      <HelperHeader
        title="아이디어 선택"
        description="입력한 내용을 바탕으로 시작 형태를 정하고, 다음 단계로 바로 넘길 수 있습니다."
        action={
          <Button asChild size="sm" variant="outline">
            <Link href="/ideas">게시판에서 가져오기</Link>
          </Button>
        }
      />

      <HorizontalStageNav current="idea" />

      <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
        <SectionCard
          title="아이디어 입력"
          description="무엇을 만들지, 어떤 결과가 나오면 좋은지 짧게 적어 주세요."
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="helper-project-name" className="text-[12px] font-semibold text-foreground">
                프로젝트 이름
              </label>
              <Input
                id="helper-project-name"
                value={draft.projectName}
                onChange={(event) => setProjectName(event.target.value, "idea")}
                placeholder="예: 사장님용 매장 소개 예약 서비스"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="helper-idea" className="text-[12px] font-semibold text-foreground">
                아이디어 설명
              </label>
              <Textarea
                id="helper-idea"
                className="min-h-40"
                value={draft.idea}
                onChange={(event) => setIdea(event.target.value, "idea")}
                placeholder="누가 쓰는지, 어떤 문제를 해결하는지, 꼭 들어가야 하는 기능을 적어 주세요."
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              {draft.analysis ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/helper/architecture">구조 단계로 이동</Link>
                </Button>
              ) : null}
              <Button onClick={() => analyzeIdea("idea")} disabled={!draft.idea.trim()} size="sm">
                <Wand2 className="size-4" />
                {draft.analysis ? "다시 정리" : "내용 정리"}
              </Button>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <StatGrid
            items={[
              { label: "입력 방식", value: draft.sourceIdeaTitle ?? "직접 입력" },
              { label: "분석 상태", value: draft.analysis ? "정리 완료" : "입력 대기" },
              { label: "선택 형태", value: selectedServiceType?.name ?? "아직 선택 안 함" },
            ]}
          />

          <SectionCard
            title="시작 형태 선택"
            description="한 번만 고르면 다음 단계 구조와 프롬프트가 여기에 맞춰 정리됩니다."
          >
            <div className="grid gap-3">
              {(draft.analysis?.serviceTypes ?? []).map((serviceType) => {
                const active = draft.selectedTypeId === serviceType.id;

                return (
                  <button
                    key={serviceType.id}
                    type="button"
                    onClick={() => selectServiceType(serviceType.id, "idea")}
                    className={cn(
                      "rounded-[1.2rem] border px-4 py-4 text-left transition",
                      active
                        ? "border-primary/14 bg-primary text-white"
                        : "border-[rgba(121,118,127,0.08)] bg-[rgba(248,247,248,0.92)] hover:bg-white",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold">{serviceType.name}</p>
                        <p className={cn("mt-1 text-[12px] leading-5", active ? "text-white/78" : "text-muted-foreground")}>
                          {serviceType.summary}
                        </p>
                      </div>
                      {active ? <BadgeCheck className="mt-0.5 size-4 shrink-0" /> : null}
                    </div>
                  </button>
                );
              })}
              {!draft.analysis ? (
                <div className="rounded-[1.2rem] border border-dashed border-[rgba(121,118,127,0.16)] px-4 py-4 text-[12px] text-muted-foreground">
                  먼저 내용을 정리하면 시작 형태를 고를 수 있습니다.
                </div>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </section>

      <SectionCard
        title="입력 요약"
        description="다음 결정을 빠르게 하기 위한 정리본입니다."
      >
        {draft.analysis ? (
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.2rem] bg-[rgba(248,247,248,0.92)] px-4 py-4">
              <p className="text-[12px] font-semibold text-primary">핵심 요구</p>
              <ul className="mt-3 space-y-2 text-[13px] leading-6 text-muted-foreground">
                {draft.analysis.keyNeeds.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-1 size-3.5 shrink-0 text-secondary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="rounded-[1.2rem] bg-[rgba(248,247,248,0.92)] px-4 py-4">
                <p className="text-[12px] font-semibold text-primary">다음에 정할 것</p>
                <ul className="mt-3 space-y-2 text-[13px] leading-6 text-muted-foreground">
                  {draft.analysis.nextQuestions.map((item) => (
                    <li key={item} className="flex gap-2">
                      <ChevronRight className="mt-1 size-3.5 shrink-0 text-primary/60" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {selectedServiceType ? (
                <div className="rounded-[1.2rem] border border-[rgba(121,118,127,0.08)] bg-white px-4 py-4">
                  <p className="text-[12px] font-semibold text-primary">현재 선택</p>
                  <p className="mt-2 text-[14px] font-semibold text-primary">{selectedServiceType.name}</p>
                  <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{selectedServiceType.fitReason}</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-[1.2rem] border border-dashed border-[rgba(121,118,127,0.16)] px-4 py-6 text-[12px] text-muted-foreground">
            내용을 정리하면 핵심 요구와 다음에 정할 항목이 여기에 보입니다.
          </div>
        )}
      </SectionCard>
    </HelperShell>
  );
}

export function ArchitectureWorkspaceScreen() {
  const { completion, draft, selectedServiceType, updateOptions, visitSection } = useWorkspace();

  useEffect(() => {
    visitSection("architecture");
  }, [visitSection]);

  if (!completion.idea || !selectedServiceType) {
    return (
      <HelperShell>
        <HelperHeader
          title="구조 선택"
          description="먼저 아이디어와 시작 형태를 정하면 구조를 잡을 수 있습니다."
        />
        <HorizontalStageNav current="architecture" />
        <WorkspaceEmptyState
          eyebrow="구조"
          title="먼저 아이디어를 정리해 주세요"
          description="아이디어가 정리되면 예산, 디자인, 작업 환경을 기준으로 구조를 바로 만들 수 있습니다."
          actionHref="/helper/idea"
          actionLabel="아이디어 단계로 이동"
        />
      </HelperShell>
    );
  }

  return (
    <HelperShell>
      <HelperHeader
        title="구조 선택"
        description="예산과 작업 환경을 고르면 사용할 기술과 구조 초안이 바로 정리됩니다."
      />

      <HorizontalStageNav current="architecture" />

      <section className="grid gap-4 xl:grid-cols-3">
        <OptionCard
          title="예산"
          options={budgetOptions}
          value={draft.options.budget}
          onChange={(value) =>
            updateOptions({ budget: value as ArchitectureOptions["budget"] }, "architecture")
          }
        />
        <OptionCard
          title="디자인"
          options={designOptions}
          value={draft.options.design}
          onChange={(value) =>
            updateOptions({ design: value as ArchitectureOptions["design"] }, "architecture")
          }
        />
        <OptionCard
          title="작업 환경"
          options={environmentOptions}
          value={draft.options.environment}
          onChange={(value) =>
            updateOptions(
              { environment: value as ArchitectureOptions["environment"] },
              "architecture",
            )
          }
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title={draft.architecture?.title ?? "구조 초안"}
          description={draft.architecture?.summary ?? "구조 초안이 여기에 보입니다."}
        >
          {draft.architecture ? (
            <div className="space-y-4">
              <div className="rounded-[1.4rem] border border-[rgba(121,118,127,0.08)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f6f8_100%)] p-4">
                <MermaidDiagram chart={draft.architecture.mermaid} />
              </div>
              <div className="flex flex-wrap gap-2">
                {draft.architecture.highlights.map((item) => (
                  <span
                    key={item.label}
                    className="rounded-full bg-[rgba(248,247,248,0.92)] px-3 py-1 text-[12px] text-muted-foreground"
                  >
                    {item.label} · {item.value}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </SectionCard>

        <div className="space-y-4">
          <StatGrid
            items={[
              { label: "선택 형태", value: selectedServiceType.name },
              {
                label: "UI 방향",
                value: draft.options.design === "custom" ? "브랜드형 UI" : "기본 UI",
              },
              {
                label: "작업 환경",
                value: draft.options.environment === "local" ? "로컬 작업" : "클라우드 작업",
              },
            ]}
          />

          <SectionCard
            title="기술 구성"
            description="이 구조에서 바로 쓰게 되는 언어, 프레임워크, SaaS 조합입니다."
          >
            <TechnologyCards options={draft.options} />
          </SectionCard>
        </div>
      </section>

      <div className="flex justify-end">
        <Button asChild size="sm">
          <Link href="/helper/skills">스킬 단계로 이동</Link>
        </Button>
      </div>
    </HelperShell>
  );
}

export function SkillsWorkspaceScreen() {
  const { completion, draft, toggleSkill, clearSkills, visitSection } = useWorkspace();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<CatalogSourceFilter>("all");
  const [sort, setSort] = useState<CatalogSort>("popular");
  const [items, setItems] = useState<ExternalCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    visitSection("skills");
  }, [visitSection]);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/explore?kind=skills&source=${source}&sort=${sort}&limit=24&q=${encodeURIComponent(
            deferredQuery,
          )}`,
        );

        if (!response.ok) {
          throw new Error("failed");
        }

        const payload = (await response.json()) as ExploreApiResponse;

        if (!cancelled) {
          setItems(payload.items);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
          setError("스킬 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadItems();

    return () => {
      cancelled = true;
    };
  }, [deferredQuery, sort, source]);

  if (!completion.architecture) {
    return (
      <HelperShell>
        <HelperHeader
          title="스킬 추천과 선택"
          description="먼저 구조를 정하면 그 구조에 맞는 스킬을 고를 수 있습니다."
        />
        <HorizontalStageNav current="skills" />
        <WorkspaceEmptyState
          eyebrow="스킬"
          title="먼저 구조를 정리해 주세요"
          description="구조가 정리되면 설치와 연결에 도움 되는 스킬을 고를 수 있습니다."
          actionHref="/helper/architecture"
          actionLabel="구조 단계로 이동"
        />
      </HelperShell>
    );
  }

  const visibleItems = draft.idea ? rankCatalogItemsForDraft(draft, items, "skills") : items;

  return (
    <HelperShell>
      <HelperHeader
        title="스킬 추천과 선택"
        description="여기서 고른 스킬은 Stage 1 로컬 세팅 프롬프트에 자동으로 포함됩니다."
        action={
          <Button asChild size="sm" variant="outline">
            <Link href="/knowledge/skills">전체 스킬 정보 보기</Link>
          </Button>
        }
      />

      <HorizontalStageNav current="skills" />

      <SectionCard title="찾기">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="스킬 이름, 저장소, 키워드 검색"
              className="h-11 pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {skillSources.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSource(item.id)}
                className={cn(
                  "rounded-full px-3 py-2 text-[12px] font-medium transition",
                  source === item.id
                    ? "bg-primary text-white"
                    : "bg-[rgba(248,247,248,0.92)] text-muted-foreground hover:bg-white",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {skillSorts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSort(item.id)}
                className={cn(
                  "rounded-full px-3 py-2 text-[12px] font-medium transition",
                  sort === item.id
                    ? "bg-secondary text-white"
                    : "bg-[rgba(248,247,248,0.92)] text-muted-foreground hover:bg-white",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="추천 스킬"
          description="현재 아이디어와 구조를 기준으로 먼저 보면 좋은 스킬입니다."
        >
          {loading ? (
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              스킬을 불러오는 중입니다.
            </div>
          ) : error ? (
            <div className="rounded-[1.2rem] border border-dashed border-[rgba(121,118,127,0.16)] px-4 py-5 text-[12px] text-muted-foreground">
              {error}
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-[1.2rem] border border-dashed border-[rgba(121,118,127,0.16)] px-4 py-5 text-[12px] text-muted-foreground">
              조건에 맞는 스킬이 없습니다.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleItems.slice(0, 8).map((item) => {
                const selected = draft.selectedSkills.some((skill) => skill.id === item.id);

                return (
                  <article
                    key={item.id}
                    className={cn(
                      "rounded-[1.2rem] border px-4 py-4 transition",
                      selected
                        ? "border-primary/14 bg-primary text-white"
                        : "border-[rgba(121,118,127,0.08)] bg-[rgba(248,247,248,0.92)]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          <span className={cn("rounded-full px-2.5 py-1 font-semibold", selected ? "bg-white/10 text-white/82" : "bg-white text-muted-foreground")}>
                            {item.sourceLabel}
                          </span>
                          <span className={selected ? "text-white/68" : "text-muted-foreground"}>
                            {item.popularityLabel}
                          </span>
                        </div>
                        <p className="mt-3 text-[14px] font-semibold">{item.title}</p>
                        <p className={cn("mt-1 text-[12px] leading-5", selected ? "text-white/76" : "text-muted-foreground")}>
                          {item.summary}
                        </p>
                      </div>
                      {selected ? <BadgeCheck className="mt-0.5 size-4 shrink-0" /> : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={selected ? "outline" : "secondary"}
                        className={selected ? "border-white/18 bg-white/10 text-white hover:bg-white/16" : ""}
                        onClick={() => toggleSkill(buildSelectedSkill(item), "skills")}
                      >
                        {selected ? "선택 해제" : "선택"}
                      </Button>
                      <Button asChild size="sm" variant={selected ? "ghost" : "outline"}>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          원본
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title={`선택한 스킬 ${draft.selectedSkills.length}개`}
            description="선택하지 않아도 다음 단계로 갈 수 있지만, 고른 스킬은 Stage 1에 반영됩니다."
          >
            {draft.selectedSkills.length > 0 ? (
              <div className="space-y-3">
                {draft.selectedSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="rounded-[1.1rem] border border-[rgba(121,118,127,0.08)] bg-[rgba(248,247,248,0.92)] px-4 py-4"
                  >
                    <p className="text-[13px] font-semibold text-primary">{skill.title}</p>
                    <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{skill.summary}</p>
                    {skill.installCommand ? (
                      <p className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-[11px] text-primary">
                        {skill.installCommand}
                      </p>
                    ) : null}
                  </div>
                ))}

                <Button type="button" variant="ghost" size="sm" onClick={() => clearSkills("skills")}>
                  선택 비우기
                </Button>
              </div>
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-[rgba(121,118,127,0.16)] px-4 py-5 text-[12px] text-muted-foreground">
                아직 선택한 스킬이 없습니다.
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="이 단계에서 하는 일"
            description="설치할 스킬만 정하고, 실제 설치 순서는 Stage 1 프롬프트에서 안내받습니다."
          >
            <div className="space-y-2 text-[12px] leading-6 text-muted-foreground">
              <p>1. 필요한 스킬만 선택합니다.</p>
              <p>2. Stage 1 프롬프트에서 설치 순서와 연결 방법을 받습니다.</p>
              <p>3. 구현 프롬프트는 다음 단계에서 이어갑니다.</p>
            </div>
          </SectionCard>
        </div>
      </section>

      <div className="flex justify-end">
        <Button asChild size="sm">
          <Link href="/helper/prompts">프롬프트 단계로 이동</Link>
        </Button>
      </div>
    </HelperShell>
  );
}

export function PromptsWorkspaceScreen() {
  const {
    completion,
    draft,
    isReadyToSave,
    isSavingProject,
    savedProjectId,
    saveProject,
    setPromptStage,
    visitSection,
  } = useWorkspace();

  useEffect(() => {
    visitSection("prompts");
  }, [visitSection]);

  if (!completion.architecture) {
    return (
      <HelperShell>
        <HelperHeader
          title="프롬프트"
          description="앞단계가 정리되면 바로 복사해서 쓸 프롬프트가 만들어집니다."
        />
        <HorizontalStageNav current="prompts" />
        <WorkspaceEmptyState
          eyebrow="프롬프트"
          title="먼저 구조를 정리해 주세요"
          description="아이디어와 구조가 정리되면 단계별 프롬프트가 자동으로 준비됩니다."
          actionHref="/helper/architecture"
          actionLabel="구조 단계로 이동"
        />
      </HelperShell>
    );
  }

  const activePrompt =
    draft.promptStages.find((stage) => stage.stage === draft.activePromptStage) ??
    draft.promptStages[0] ??
    null;

  return (
    <HelperShell>
      <HelperHeader
        title="프롬프트"
        description="상단에서 단계만 고르면, 아래에서 바로 복사해서 사용할 수 있습니다."
      />

      <section className="space-y-3">
        <div className="flex items-start gap-3 rounded-[1.4rem] border border-[rgba(121,118,127,0.08)] bg-[rgba(255,255,255,0.78)] px-4 py-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-[rgba(59,53,97,0.08)] text-primary">
            <LayoutTemplate className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-primary/56">
              Vibe Helper 순서
            </p>
            <p className="text-[14px] font-semibold text-primary">
              위 영역은 헬퍼 전체 진행 단계입니다.
            </p>
            <p className="text-[12px] leading-6 text-muted-foreground">
              아이디어, 구조, 스킬, 프롬프트 중 현재 어디에 있는지 보여 주는 내비게이션입니다.
            </p>
          </div>
        </div>
        <HorizontalStageNav current="prompts" />
      </section>

      <section className="space-y-4 rounded-[1.8rem] border border-[rgba(91,95,151,0.14)] bg-[linear-gradient(180deg,rgba(244,244,252,0.96),rgba(255,255,255,0.98))] px-5 py-5 shadow-[0_12px_24px_rgba(37,31,74,0.04)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-white">
              <Wand2 className="size-4" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-primary/56">
                Prompt Order
              </p>
              <p className="text-[15px] font-semibold text-primary">
                아래 Stage는 실제 실행 프롬프트 순서입니다.
              </p>
              <p className="text-[12px] leading-6 text-muted-foreground">
                위의 헬퍼 단계와는 다른 개념이며, 여기서는 Stage 1부터 4까지 순서대로 복사해 실행하면 됩니다.
              </p>
            </div>
          </div>
          <div className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-primary shadow-[0_8px_18px_rgba(37,31,74,0.06)]">
            현재 선택: Stage {draft.activePromptStage}
          </div>
        </div>

        <StageSelector
          stages={draft.promptStages}
          activeStage={draft.activePromptStage}
          onSelect={(stage) => setPromptStage(stage, "prompts")}
        />
      </section>

      {activePrompt ? <PromptCard stage={activePrompt} showObjective={false} /> : null}

      {activePrompt ? (
        <SectionCard title="체크 포인트">
          <div className="flex flex-wrap gap-2">
            {activePrompt.checklist.map((item) => (
              <span
                key={item}
                className="rounded-full bg-[rgba(248,247,248,0.92)] px-3 py-1 text-[12px] text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        title="저장"
        description="현재 아이디어, 구조, 프롬프트를 프로젝트로 저장해 둘 수 있습니다."
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-[12px] text-muted-foreground">현재 단계 결과를 프로젝트로 저장해 둘 수 있습니다.</div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void saveProject()}
              disabled={!isReadyToSave || isSavingProject}
              size="sm"
            >
              {isSavingProject ? "저장 중..." : "프로젝트 저장"}
            </Button>
            {savedProjectId ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/helper/projects/${savedProjectId}`}>저장된 프로젝트 보기</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/helper/projects/saved">내 프로젝트 목록</Link>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </SectionCard>
    </HelperShell>
  );
}

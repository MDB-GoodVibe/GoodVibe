"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Check,
  ExternalLink,
  LoaderCircle,
  Search,
  Sparkles,
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
  { value: "free" as const, label: "무료 우선", hint: "최소 비용으로 빠르게 검증합니다." },
  { value: "flexible" as const, label: "유연한 예산", hint: "필요 시 유료 도구를 사용합니다." },
] as const;

const designOptions = [
  { value: "standard" as const, label: "기본 UI", hint: "빠르게 구현하고 단순하게 전달합니다." },
  { value: "custom" as const, label: "브랜드 중심 UI", hint: "시각 아이덴티티에 더 투자합니다." },
] as const;

const environmentOptions = [
  { value: "local" as const, label: "로컬", hint: "내 PC에서 Codex/Cursor/CLI 흐름으로 작업합니다." },
  { value: "cloud" as const, label: "클라우드", hint: "브라우저 중심 협업 흐름으로 작업합니다." },
] as const;

const stageItems = [
  { id: "planning" as const, title: "0. Superpowers", summary: "아이디어를 기획 입력값으로 정리", href: "/helper/planning" },
  { id: "idea" as const, title: "1. 아이디어", summary: "구체 아이디어 분석", href: "/helper/idea" },
  { id: "architecture" as const, title: "2. 아키텍처", summary: "스택과 구조 선택", href: "/helper/architecture" },
  { id: "skills" as const, title: "3. 도구 추천", summary: "스킬/플러그인 선택", href: "/helper/skills" },
  { id: "prompts" as const, title: "4. 실행 프롬프트", summary: "단계별 프롬프트 실행", href: "/helper/prompts" },
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

const fixedRecommendedSkills = [
  {
    name: "obra/superpowers",
    reason: "코딩 전 brainstorming -> writing-plans 순서로 구체화합니다.",
    how: "Codex 플러그인 사이드바에서 설치(권장).",
  },
  {
    name: "playwright",
    reason: "UI 동작 검증이 필요한 프로젝트에 적합합니다.",
    how: "브라우저 실제 동작 확인이 중요할 때 사용합니다.",
  },
  {
    name: "openai-docs",
    reason: "OpenAI API 기반 서비스에 적합합니다.",
    how: "최신 모델/문서 기준 가이드가 필요할 때 사용합니다.",
  },
  {
    name: "vercel-deploy",
    reason: "배포 중심 프로젝트에 적합합니다.",
    how: "4단계에서 빠르게 배포할 때 사용합니다.",
  },
  {
    name: "security-best-practices",
    reason: "인증/DB/API 포함 프로젝트에 적합합니다.",
    how: "계정, 세션, 사용자 데이터가 있을 때 사용합니다.",
  },
];

function HelperShell({ children }: { children: ReactNode }) {
  return <div className="space-y-5">{children}</div>;
}

function HelperHeader({
  title,
  description,
  fixedGuide,
  action,
}: {
  title: string;
  description: string;
  fixedGuide: string;
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
          <p className="rounded-xl bg-[rgba(59,53,97,0.06)] px-3 py-2 text-[12px] text-primary">
            {fixedGuide}
          </p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  );
}

function HorizontalStageNav({
  current,
}: {
  current: Extract<WorkspaceSection, "planning" | "idea" | "architecture" | "skills" | "prompts">;
}) {
  return (
    <section className="grid gap-3 xl:grid-cols-5">
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
                  {index}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-primary">{item.title}</p>
                  <p className="text-[12px] text-muted-foreground">{item.summary}</p>
                </div>
              </div>
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

function normalizeToken(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function getExternalSkillIdentity(item: ExternalCatalogItem) {
  const normalizedSlug = normalizeToken(item.slug);
  if (normalizedSlug) {
    return normalizedSlug.split("/").pop() ?? normalizedSlug;
  }
  return normalizeToken(item.title);
}

function getSelectedSkillIdentity(skill: SelectedSkill) {
  const normalizedId = normalizeToken(skill.id);
  const trailingId = normalizedId.split(":").pop() ?? normalizedId;
  const idSlug = trailingId.split("/").pop() ?? trailingId;
  return idSlug || normalizeToken(skill.title);
}

function isSkillSelected(
  selectedSkills: SelectedSkill[],
  item: ExternalCatalogItem,
) {
  const targetIdentity = getExternalSkillIdentity(item);
  return selectedSkills.some(
    (selectedSkill) => getSelectedSkillIdentity(selectedSkill) === targetIdentity,
  );
}

export function PlanningWorkspaceScreen() {
  const { draft, setPlanningBrief, setSuperpowersStatus, completion, visitSection } = useWorkspace();

  useEffect(() => {
    visitSection("planning");
  }, [visitSection]);

  const brainstormingPrompt = `superpowers의 brainstorming으로 아래 아이디어를 구체화해줘:\n- 문제 정의: ${draft.planningBrief.problem || "[작성]"}\n- 대상 사용자: ${draft.planningBrief.targetUser || "[작성]"}\n- 사용자 여정: ${draft.planningBrief.userJourney || "[작성]"}\n- MVP 범위: ${draft.planningBrief.mvpScope || "[작성]"}\n- 제외 범위: ${draft.planningBrief.outOfScope || "[작성]"}\n- 성공 기준: ${draft.planningBrief.successCriteria || "[작성]"}\n- 기술 제약: ${draft.planningBrief.constraints || "[작성]"}`;

  const writingPlansPrompt = `이제 superpowers의 writing-plans를 사용해줘.\n위에서 정리한 기획을 기준으로 마일스톤, 수용 기준, 리스크 점검이 포함된 구현 계획으로 만들어줘.`;

  return (
    <HelperShell>
      <HelperHeader
        title="Superpowers 기획"
        description="코딩 전에 superpowers 방식으로 아이디어를 구조화하세요."
        fixedGuide="이 단계의 결과는 아이디어 분석과 프롬프트 생성의 핵심 입력값으로 사용됩니다."
      />
      <HorizontalStageNav current="planning" />

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Superpowers란?"
          description="brainstorming으로 가정을 다듬고 writing-plans로 실행 계획으로 전환합니다."
        >
          <div className="space-y-2 text-[13px] text-muted-foreground">
            <p>1. `brainstorming`: 빠진 질문을 찾아 범위를 선명하게 만듭니다.</p>
            <p>2. `writing-plans`: 합의된 범위를 구현 가능한 작업으로 쪼갭니다.</p>
            <p>3. `using-superpowers`: 상황에 맞는 스킬 사용 흐름을 안내합니다.</p>
          </div>
        </SectionCard>

        <SectionCard title="설치 가이드" description="권장 경로를 우선, 수동 설치는 보조로 안내합니다.">
          <div className="space-y-3 text-[13px]">
            <div className="rounded-xl bg-[rgba(248,247,248,0.92)] p-3">
              <p className="font-semibold text-primary">권장: Codex 플러그인 사이드바</p>
              <p className="text-muted-foreground">플러그인 사이드바에서 `Superpowers`를 설치하세요.</p>
            </div>
            <div className="rounded-xl border border-dashed border-[rgba(121,118,127,0.2)] p-3">
              <p className="font-semibold text-primary">고급 수동 설치 (Windows)</p>
              <p className="font-mono text-[12px] text-muted-foreground">git clone https://github.com/obra/superpowers.git ~/.codex/superpowers</p>
              <p className="font-mono text-[12px] text-muted-foreground">mklink /J ~/.agents/skills/superpowers ~/.codex/superpowers</p>
              <p className="text-muted-foreground">수동 설치 후 Codex를 재시작하세요.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["not_installed", "미설치"],
                ["plugin_installed", "플러그인 설치 완료"],
                ["manual_installed", "수동 설치 완료"],
                ["skipped", "이번엔 건너뛰기"],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={draft.superpowersStatus === value ? "default" : "outline"}
                  onClick={() =>
                    setSuperpowersStatus(value as typeof draft.superpowersStatus, "planning")
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard title="기획 입력 템플릿" description="아래 항목을 채우면 다음 단계 가이드 정확도가 올라갑니다.">
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={draft.planningBrief.problem} placeholder="문제 정의" onChange={(e) => setPlanningBrief({ problem: e.target.value }, "planning")} />
          <Input value={draft.planningBrief.targetUser} placeholder="대상 사용자" onChange={(e) => setPlanningBrief({ targetUser: e.target.value }, "planning")} />
          <Textarea className="min-h-24" value={draft.planningBrief.userJourney} placeholder="핵심 사용자 여정" onChange={(e) => setPlanningBrief({ userJourney: e.target.value }, "planning")} />
          <Textarea className="min-h-24" value={draft.planningBrief.mvpScope} placeholder="MVP 범위" onChange={(e) => setPlanningBrief({ mvpScope: e.target.value }, "planning")} />
          <Textarea className="min-h-24" value={draft.planningBrief.outOfScope} placeholder="제외 범위" onChange={(e) => setPlanningBrief({ outOfScope: e.target.value }, "planning")} />
          <Textarea className="min-h-24" value={draft.planningBrief.successCriteria} placeholder="성공 기준" onChange={(e) => setPlanningBrief({ successCriteria: e.target.value }, "planning")} />
          <Textarea className="min-h-24 md:col-span-2" value={draft.planningBrief.constraints} placeholder="기술 제약" onChange={(e) => setPlanningBrief({ constraints: e.target.value }, "planning")} />
        </div>
      </SectionCard>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="프롬프트: brainstorming" description="기획 정제 시 Codex에 붙여 넣어 사용하세요.">
          <pre className="overflow-x-auto rounded-xl bg-[rgba(248,247,248,0.92)] p-3 text-[12px] whitespace-pre-wrap">{brainstormingPrompt}</pre>
        </SectionCard>
        <SectionCard title="프롬프트: writing-plans" description="기획 합의 후 실행 계획을 만들 때 사용하세요.">
          <pre className="overflow-x-auto rounded-xl bg-[rgba(248,247,248,0.92)] p-3 text-[12px] whitespace-pre-wrap">{writingPlansPrompt}</pre>
          {completion.planning ? (
            <p className="mt-3 text-[12px] text-primary">기획 단계 완료: 아이디어 단계에 사용할 구조화 입력값이 준비되었습니다.</p>
          ) : null}
        </SectionCard>
      </section>

      <div className="flex justify-end">
        <Button asChild size="sm">
          <Link href="/helper/idea">아이디어 단계로 이동</Link>
        </Button>
      </div>
    </HelperShell>
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
  const router = useRouter();
  const {
    analyzeIdea,
    draft,
    importIdeaSource,
    selectServiceType,
    selectedServiceType,
    setIdea,
    setProjectName,
    visitSection,
    completion,
  } = useWorkspace();
  const autoAnalyzedSourceIdRef = useRef<string | null>(null);

  useEffect(() => {
    visitSection("idea");
  }, [visitSection]);

  useEffect(() => {
    if (!importedIdea) return;
    if (
      draft.sourceIdeaId === importedIdea.sourceIdeaId &&
      draft.idea.trim() === importedIdea.idea.trim()
    ) {
      return;
    }
    importIdeaSource(importedIdea);
    router.replace("/helper/idea");
  }, [draft.idea, draft.sourceIdeaId, importIdeaSource, importedIdea, router]);

  useEffect(() => {
    if (!autoAnalyze || !importedIdea) return;
    const ready =
      draft.sourceIdeaId === importedIdea.sourceIdeaId &&
      draft.idea.trim() === importedIdea.idea.trim();
    if (!ready || draft.analysis) return;
    if (autoAnalyzedSourceIdRef.current === importedIdea.sourceIdeaId) return;
    autoAnalyzedSourceIdRef.current = importedIdea.sourceIdeaId;
    analyzeIdea("idea");
  }, [analyzeIdea, autoAnalyze, draft.analysis, draft.idea, draft.sourceIdeaId, importedIdea]);

  return (
    <HelperShell>
      <HelperHeader
        title="Idea Definition"
        description="아이디어를 구체적으로 입력하고 분석을 실행하세요."
        fixedGuide="여기서 선택한 서비스 유형이 아키텍처와 프롬프트에 반영됩니다."
        action={
          <Button asChild size="sm" variant="outline">
            <Link href="/ideas">아이디어보드에서 가져오기</Link>
          </Button>
        }
      />
      <HorizontalStageNav current="idea" />
      {!completion.planning ? (
        <SectionCard title="사전 권장 단계" description="Superpowers 0단계를 먼저 완료하면 품질이 올라갑니다.">
          <p className="text-[13px] text-muted-foreground">지금 진행할 수는 있지만 0단계를 완료한 뒤가 더 정확합니다.</p>
          <Button asChild className="mt-3" size="sm" variant="outline">
            <Link href="/helper/planning">Superpowers 단계로 이동</Link>
          </Button>
        </SectionCard>
      ) : null}

      <SectionCard title="입력" description="문제, 사용자, 기대 결과를 구체적으로 작성하세요.">
        <div className="space-y-4">
          <Input value={draft.projectName} onChange={(e) => setProjectName(e.target.value, "idea")} placeholder="프로젝트 이름" />
          <Textarea className="min-h-40" value={draft.idea} onChange={(e) => setIdea(e.target.value, "idea")} placeholder="만들고 싶은 서비스 아이디어를 구체적으로 적어주세요." />
          <div className="flex flex-wrap justify-end gap-2">
            {draft.analysis ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/helper/architecture">아키텍처 단계로 이동</Link>
              </Button>
            ) : null}
            <Button onClick={() => analyzeIdea("idea")} disabled={!draft.idea.trim()} size="sm">
              <Wand2 className="size-4" />
              {draft.analysis ? "다시 분석" : "아이디어 분석"}
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="서비스 유형 선택" description="가장 맞는 서비스 형태를 하나 선택하세요.">
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
                    <p className={cn("mt-1 text-[12px] leading-5", active ? "text-white/70" : "text-muted-foreground")}>
                      {serviceType.fitReason}
                    </p>
                  </div>
                  {active ? <BadgeCheck className="mt-0.5 size-4 shrink-0" /> : null}
                </div>
              </button>
            );
          })}
          {!draft.analysis ? (
            <p className="rounded-[1.2rem] border border-dashed border-[rgba(121,118,127,0.16)] px-4 py-4 text-[12px] text-muted-foreground">
              추천 유형을 보려면 먼저 아이디어 분석을 실행하세요.
            </p>
          ) : null}
        </div>
      </SectionCard>

      {selectedServiceType ? (
        <SectionCard title="선택 요약">
          <div className="flex flex-wrap gap-2 text-[12px]">
            <span className="rounded-full bg-[rgba(248,247,248,0.92)] px-3 py-1">{selectedServiceType.name}</span>
            {selectedServiceType.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[rgba(248,247,248,0.92)] px-3 py-1">{tag}</span>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </HelperShell>
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

export function ArchitectureWorkspaceScreen() {
  const { completion, draft, selectedServiceType, updateOptions, visitSection } = useWorkspace();

  useEffect(() => {
    visitSection("architecture");
  }, [visitSection]);

  if (!completion.idea || !selectedServiceType) {
    return (
      <HelperShell>
        <HelperHeader
          title="아키텍처"
          description="아이디어/서비스 유형 선택 후 아키텍처를 결정합니다."
          fixedGuide="아키텍처는 아이디어 단계 결과를 기반으로 생성됩니다."
        />
        <HorizontalStageNav current="architecture" />
        <WorkspaceEmptyState
          eyebrow="아키텍처"
          title="아이디어 단계를 먼저 완료하세요"
          description="아이디어 분석과 서비스 유형 선택 후 아키텍처를 진행할 수 있습니다."
          actionHref="/helper/idea"
          actionLabel="아이디어 단계로 이동"
        />
      </HelperShell>
    );
  }

  return (
    <HelperShell>
      <HelperHeader
        title="아키텍처 선택"
        description="예산, 디자인, 환경을 조정하면 블루프린트가 재생성됩니다."
        fixedGuide="이 단계 변경 사항은 아키텍처와 프롬프트 전체에 반영됩니다."
      />
      <HorizontalStageNav current="architecture" />

      <section className="grid gap-4 xl:grid-cols-3">
        <OptionCard title="예산" options={budgetOptions} value={draft.options.budget} onChange={(v) => updateOptions({ budget: v as ArchitectureOptions["budget"] }, "architecture")} />
        <OptionCard title="디자인" options={designOptions} value={draft.options.design} onChange={(v) => updateOptions({ design: v as ArchitectureOptions["design"] }, "architecture")} />
        <OptionCard title="작업 환경" options={environmentOptions} value={draft.options.environment} onChange={(v) => updateOptions({ environment: v as ArchitectureOptions["environment"] }, "architecture")} />
      </section>

      <SectionCard title={draft.architecture?.title ?? "아키텍처 블루프린트"} description={draft.architecture?.summary ?? "서비스 유형/옵션 선택 후 블루프린트가 표시됩니다."}>
        {draft.architecture ? (
          <div className="space-y-4">
            <div className="rounded-[1.4rem] border border-[rgba(121,118,127,0.08)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f6f8_100%)] p-4">
              <MermaidDiagram chart={draft.architecture.mermaid} />
            </div>
            <div className="flex flex-wrap gap-2">
              {draft.architecture.highlights.map((item) => (
                <span key={item.label} className="rounded-full bg-[rgba(248,247,248,0.92)] px-3 py-1 text-[12px] text-muted-foreground">
                  {item.label}: {item.value}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </SectionCard>

      <div className="flex justify-end">
        <Button asChild size="sm">
          <Link href="/helper/skills">도구 추천 단계로 이동</Link>
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
          title="도구 추천"
          description="아키텍처 준비 후 사용할 스킬을 선택합니다."
          fixedGuide="선택한 스킬은 Stage 1 설정 프롬프트에 자동 반영됩니다."
        />
        <HorizontalStageNav current="skills" />
        <WorkspaceEmptyState
          eyebrow="도구 추천"
          title="아키텍처 단계를 먼저 완료하세요"
          description="아키텍처 정보가 있어야 추천 정확도가 높아집니다."
          actionHref="/helper/architecture"
          actionLabel="아키텍처 단계로 이동"
        />
      </HelperShell>
    );
  }

  const visibleItems = draft.idea ? rankCatalogItemsForDraft(draft, items, "skills") : items;

  return (
    <HelperShell>
      <HelperHeader
        title="도구 추천"
        description="구현을 도와줄 스킬/도구를 선택하세요."
        fixedGuide="이 단계 결과는 프롬프트 단계의 설치/설정 지시에 반영됩니다."
      />
      <HorizontalStageNav current="skills" />

      <SectionCard title="고정 추천 번들" description="Superpowers 및 상황별 보완 스킬 추천입니다.">
        <div className="grid gap-3 md:grid-cols-2">
          {fixedRecommendedSkills.map((skill) => (
            <div key={skill.name} className="rounded-[1.2rem] border border-[rgba(121,118,127,0.08)] bg-[rgba(248,247,248,0.92)] p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <p className="text-[13px] font-semibold text-primary">{skill.name}</p>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">{skill.reason}</p>
              <p className="mt-2 text-[12px] text-muted-foreground">{skill.how}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="스킬 탐색">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름/저장소/태그로 검색" className="h-11 pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            {skillSources.map((item) => (
              <button key={item.id} type="button" onClick={() => setSource(item.id)} className={cn("rounded-full px-3 py-2 text-[12px] font-medium transition", source === item.id ? "bg-primary text-white" : "bg-[rgba(248,247,248,0.92)] text-muted-foreground hover:bg-white")}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {skillSorts.map((item) => (
              <button key={item.id} type="button" onClick={() => setSort(item.id)} className={cn("rounded-full px-3 py-2 text-[12px] font-medium transition", sort === item.id ? "bg-secondary text-white" : "bg-[rgba(248,247,248,0.92)] text-muted-foreground hover:bg-white")}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="추천 스킬">
          {loading ? (
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              스킬 목록 불러오는 중...
            </div>
          ) : error ? (
            <p className="text-[12px] text-muted-foreground">{error}</p>
          ) : visibleItems.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">검색 결과가 없습니다.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleItems.slice(0, 8).map((item) => {
                const selected = isSkillSelected(draft.selectedSkills, item);
                return (
                  <article key={item.id} className={cn("rounded-[1.2rem] border px-4 py-4 transition", selected ? "border-primary/14 bg-primary text-white" : "border-[rgba(121,118,127,0.08)] bg-[rgba(248,247,248,0.92)]")}>
                    <p className="text-[14px] font-semibold">{item.title}</p>
                    <p className={cn("mt-1 text-[12px] leading-5", selected ? "text-white/76" : "text-muted-foreground")}>{item.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant={selected ? "outline" : "secondary"} className={selected ? "border-white/18 bg-white/10 text-white hover:bg-white/16" : ""} onClick={() => toggleSkill(buildSelectedSkill(item), "skills")}>
                        {selected ? "제거" : "선택"}
                      </Button>
                      <Button asChild size="sm" variant={selected ? "ghost" : "outline"}>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          원문
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

        <SectionCard title={`선택됨 (${draft.selectedSkills.length})`}>
          {draft.selectedSkills.length > 0 ? (
            <div className="space-y-3">
              {draft.selectedSkills.map((skill) => (
                <div key={skill.id} className="rounded-[1.1rem] border border-[rgba(121,118,127,0.08)] bg-[rgba(248,247,248,0.92)] px-4 py-4">
                  <p className="text-[13px] font-semibold text-primary">{skill.title}</p>
                  <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{skill.summary}</p>
                  {skill.installCommand ? (
                    <p className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-[11px] text-primary">{skill.installCommand}</p>
                  ) : null}
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => clearSkills("skills")}>
                선택 비우기
              </Button>
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground">아직 선택된 스킬이 없습니다.</p>
          )}
          <SectionCard title="고급 자동화 안내" className="mt-4">
            <p className="text-[12px] text-muted-foreground">`subagent-driven-development`, `dispatching-parallel-agents` 같은 실행 자동화는 v1에서는 고급 영역으로 분리해 두었습니다.</p>
          </SectionCard>
        </SectionCard>
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
          title="실행 프롬프트"
          description="아키텍처 준비 후 단계별 프롬프트가 생성됩니다."
          fixedGuide="프롬프트는 planning + idea + architecture 결과를 합쳐 재생성됩니다."
        />
        <HorizontalStageNav current="prompts" />
        <WorkspaceEmptyState
          eyebrow="프롬프트"
          title="아키텍처 단계를 먼저 완료하세요"
          description="프롬프트 단계에는 아키텍처 블루프린트가 필요합니다."
          actionHref="/helper/architecture"
          actionLabel="아키텍처 단계로 이동"
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
        title="실행 프롬프트"
        description="설정부터 배포까지 순서대로 실행하세요."
        fixedGuide="권장 순서: brainstorming -> writing-plans -> Vibe Helper Stage 1~4"
      />
      <HorizontalStageNav current="prompts" />

      <SectionCard title="프롬프트 단계">
        <div className="flex flex-wrap gap-2">
          {draft.promptStages.map((stage) => (
            <Button key={stage.stage} type="button" size="sm" variant={stage.stage === draft.activePromptStage ? "default" : "outline"} onClick={() => setPromptStage(stage.stage, "prompts")}>
              단계 {stage.stage}
            </Button>
          ))}
        </div>
      </SectionCard>

      {activePrompt ? <PromptCard stage={activePrompt} showObjective={false} /> : null}
      {activePrompt ? (
      <SectionCard title="체크리스트">
          <div className="flex flex-wrap gap-2">
            {activePrompt.checklist.map((item) => (
              <span key={item} className="rounded-full bg-[rgba(248,247,248,0.92)] px-3 py-1 text-[12px] text-muted-foreground">
                <Check className="mr-1 inline size-3" />
                {item}
              </span>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="프로젝트 저장">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-[12px] text-muted-foreground">현재 드래프트를 프로젝트 스냅샷으로 저장합니다.</div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void saveProject()} disabled={!isReadyToSave || isSavingProject} size="sm">
              {isSavingProject ? "저장 중..." : "프로젝트 저장"}
            </Button>
            {savedProjectId ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/helper/projects/${savedProjectId}`}>프로젝트 열기</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/helper/projects/saved">저장된 프로젝트</Link>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </SectionCard>
    </HelperShell>
  );
}

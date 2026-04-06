"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Layers3, Wand2 } from "lucide-react";

import { HelpTip } from "@/components/help-tip";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { PromptCard } from "@/components/prompt-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateArchitectureBlueprint } from "@/lib/architecture-generator";
import { analyzeIdea } from "@/lib/idea-analyzer";
import { buildMockProject, saveMockProject } from "@/lib/mock-project-store";
import { generatePromptStages } from "@/lib/prompt-generator";
import { cn } from "@/lib/utils";
import type {
  IdeaAnalysisResult,
  PromptStage,
  ServiceTypeId,
} from "@/types/project";

type WizardStep = 1 | 2 | 3;

const stepMeta = [
  {
    id: 1 as const,
    label: "아이디어",
    title: "무엇을 만들지 정합니다",
    description: "아이디어를 적고 가장 맞는 시작 형태를 고릅니다.",
  },
  {
    id: 2 as const,
    label: "구조",
    title: "아키텍처 옵션을 고릅니다",
    description: "예산, 디자인, 환경을 정하면 구조도가 만들어집니다.",
  },
  {
    id: 3 as const,
    label: "프롬프트",
    title: "실행 프롬프트를 확인합니다",
    description: "단계별 프롬프트를 검토하고 목업 저장소에 보관합니다.",
  },
];

const budgetOptions = [
  { value: "free", label: "Free-tier", hint: "비용 부담 적게 시작" },
  { value: "flexible", label: "Flexible", hint: "유료 확장 허용" },
] as const;

const designOptions = [
  { value: "standard", label: "Shadcn", hint: "표준 UI 중심" },
  { value: "custom", label: "Custom", hint: "브랜드 감도 우선" },
] as const;

const environmentOptions = [
  { value: "local", label: "Local", hint: "Cursor · CLI 중심" },
  { value: "cloud", label: "Cloud", hint: "브라우저 작업 중심" },
] as const;

export function StepWizard() {
  const [activeStep, setActiveStep] = useState<WizardStep>(1);
  const [projectName, setProjectName] = useState("");
  const [idea, setIdea] = useState("");
  const [budget, setBudget] = useState<"free" | "flexible">("free");
  const [design, setDesign] = useState<"standard" | "custom">("standard");
  const [environment, setEnvironment] = useState<"local" | "cloud">("local");
  const [analysis, setAnalysis] = useState<IdeaAnalysisResult | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<ServiceTypeId | null>(
    null,
  );
  const [activePromptStage, setActivePromptStage] =
    useState<PromptStage["stage"]>(1);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);

  function handleAnalyzeIdea() {
    const nextAnalysis = analyzeIdea({
      idea,
      projectName,
      prioritizeFreeTools: budget === "free",
    });

    setAnalysis(nextAnalysis);
    setSelectedTypeId(nextAnalysis.serviceTypes[0]?.id ?? null);
    setActivePromptStage(1);
    setSavedProjectId(null);
  }

  const selectedServiceType = analysis?.serviceTypes.find(
    (serviceType) => serviceType.id === selectedTypeId,
  );

  const architectureBlueprint =
    selectedServiceType && selectedTypeId && idea.trim()
      ? generateArchitectureBlueprint({
          idea,
          projectName,
          serviceType: selectedServiceType.name,
          serviceTypeId: selectedTypeId,
          budget,
          design,
          environment,
        })
      : null;

  const promptStages =
    selectedServiceType && selectedTypeId && idea.trim()
      ? generatePromptStages({
          idea,
          projectName,
          serviceType: selectedServiceType.name,
          serviceTypeId: selectedTypeId,
          budget,
          design,
          environment,
        })
      : [];

  const activePrompt =
    promptStages.find((stage) => stage.stage === activePromptStage) ??
    promptStages[0];

  const canEnterStep2 = Boolean(selectedServiceType);
  const canEnterStep3 = Boolean(architectureBlueprint);

  function goToStep(step: WizardStep) {
    if (step === 1) {
      setActiveStep(step);
      return;
    }

    if (step === 2 && canEnterStep2) {
      setActiveStep(step);
      return;
    }

    if (step === 3 && canEnterStep3) {
      setActiveStep(step);
    }
  }

  function handleSaveProject() {
    if (!analysis || !selectedServiceType || !selectedTypeId || !architectureBlueprint) {
      return;
    }

    const savedProject = saveMockProject(
      buildMockProject({
        title: projectName.trim() || `${selectedServiceType.name} 프로젝트`,
        idea,
        serviceTypeId: selectedTypeId,
        serviceTypeLabel: selectedServiceType.name,
        options: {
          budget,
          design,
          environment,
        },
        architecture: architectureBlueprint,
        promptStages,
        keyNeeds: analysis.keyNeeds,
        nextQuestions: analysis.nextQuestions,
      }),
    );

    setSavedProjectId(savedProject.id);
  }

  const currentStepMeta = stepMeta.find((step) => step.id === activeStep)!;

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-3">
          {stepMeta.map((step) => {
            const isActive = activeStep === step.id;
            const isEnabled =
              step.id === 1 ||
              (step.id === 2 && canEnterStep2) ||
              (step.id === 3 && canEnterStep3);

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
                disabled={!isEnabled}
                className={cn(
                  "group flex min-w-[220px] items-center gap-4 rounded-[1.8rem] border px-4 py-4 text-left transition",
                  isActive
                    ? "border-primary/40 bg-primary/10"
                    : isEnabled
                      ? "border-white/10 bg-white/5 hover:border-primary/20 hover:bg-white/7"
                      : "border-white/8 bg-white/[0.03] opacity-50",
                )}
              >
                <div
                  className={cn(
                    "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/8 text-muted-foreground",
                  )}
                >
                  {step.id}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {step.label}
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {step.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Card className="glass-panel overflow-hidden">
        <CardHeader className="space-y-4 border-b border-white/10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Step {currentStepMeta.id}
              </p>
              <CardTitle className="text-xl">{currentStepMeta.title}</CardTitle>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {currentStepMeta.description}
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground">
              {activeStep} / 3
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8 sm:py-8">
          {activeStep === 1 ? (
            <div className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="projectName"
                        className="text-sm font-semibold text-foreground"
                      >
                        프로젝트 이름
                      </label>
                      <HelpTip content="선택 사항입니다. 프롬프트와 대시보드 제목에 같이 들어갑니다." />
                    </div>
                    <Input
                      id="projectName"
                      value={projectName}
                      onChange={(event) => setProjectName(event.target.value)}
                      placeholder="예: 카페 예약 도우미"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="idea"
                        className="text-sm font-semibold text-foreground"
                      >
                        서비스 설명
                      </label>
                      <HelpTip content="핵심 사용자와 기능 2~3개만 적어도 충분합니다. 길게 쓰기보다 중요한 포인트만 남기는 게 좋습니다." />
                    </div>
                    <Textarea
                      id="idea"
                      value={idea}
                      onChange={(event) => setIdea(event.target.value)}
                      className="min-h-44"
                      placeholder="예: 동네 카페가 신메뉴를 소개하고 예약 문의를 받을 수 있는 웹 서비스를 만들고 싶어요."
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      size="lg"
                      onClick={handleAnalyzeIdea}
                      disabled={!idea.trim()}
                    >
                      <Wand2 className="size-4" />
                      아이디어 분석
                    </Button>

                    {canEnterStep2 ? (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => goToStep(2)}
                      >
                        다음 단계
                        <ArrowRight className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      입력 팁
                    </p>
                    <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                      <li>누가 쓰는지 먼저 적기</li>
                      <li>가장 중요한 기능 1~2개만 남기기</li>
                      <li>결제, 로그인, 업로드 같은 키워드는 꼭 포함하기</li>
                    </ul>
                  </div>
                </div>
              </div>

              {analysis ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      추천 서비스 형태
                    </p>
                    <HelpTip content="카드를 하나 고르면 다음 단계에서 그 형태를 기준으로 구조를 생성합니다." />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    {analysis.serviceTypes.map((serviceType) => (
                      <button
                        key={serviceType.id}
                        type="button"
                        onClick={() => {
                          setSelectedTypeId(serviceType.id);
                          setSavedProjectId(null);
                        }}
                        className={cn(
                          "rounded-[1.6rem] border p-5 text-left transition",
                          selectedTypeId === serviceType.id
                            ? "border-primary/40 bg-primary/10"
                            : "border-white/10 bg-white/5 hover:border-primary/20 hover:bg-white/6",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-foreground">
                              {serviceType.name}
                            </p>
                            <p className="text-sm leading-6 text-muted-foreground">
                              {serviceType.summary}
                            </p>
                          </div>

                          {selectedTypeId === serviceType.id ? (
                            <div className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <BadgeCheck className="size-4" />
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
                            난이도 {serviceType.complexity}
                          </span>
                          {serviceType.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {analysis.keyNeeds.map((need) => (
                      <span
                        key={need}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground"
                      >
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {activeStep === 2 ? (
            <div className="space-y-8">
              <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      선택된 시작 형태
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {selectedServiceType?.name}
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {selectedServiceType?.fitReason}
                    </p>
                  </div>

                  <Button variant="outline" onClick={() => goToStep(1)}>
                    <ArrowLeft className="size-4" />
                    이전 단계
                  </Button>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">예산</p>
                    <HelpTip content="무료 플랜 중심으로 시작할지, 확장 가능한 유료 도구까지 열어둘지 정합니다." />
                  </div>
                  <div className="space-y-2">
                    {budgetOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setBudget(option.value);
                          setSavedProjectId(null);
                        }}
                        className={cn(
                          "w-full rounded-2xl border px-4 py-4 text-left transition",
                          budget === option.value
                            ? "border-primary/40 bg-primary/10"
                            : "border-white/10 bg-white/5 hover:border-primary/20",
                        )}
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {option.label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {option.hint}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">디자인</p>
                    <HelpTip content="빠른 구현이 목표면 Shadcn, 더 강한 개성이 필요하면 Custom이 맞습니다." />
                  </div>
                  <div className="space-y-2">
                    {designOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setDesign(option.value);
                          setSavedProjectId(null);
                        }}
                        className={cn(
                          "w-full rounded-2xl border px-4 py-4 text-left transition",
                          design === option.value
                            ? "border-primary/40 bg-primary/10"
                            : "border-white/10 bg-white/5 hover:border-primary/20",
                        )}
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {option.label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {option.hint}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">환경</p>
                    <HelpTip content="로컬 개발 중심인지, 브라우저 기반 워크플로우 중심인지 정합니다." />
                  </div>
                  <div className="space-y-2">
                    {environmentOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setEnvironment(option.value);
                          setSavedProjectId(null);
                        }}
                        className={cn(
                          "w-full rounded-2xl border px-4 py-4 text-left transition",
                          environment === option.value
                            ? "border-primary/40 bg-primary/10"
                            : "border-white/10 bg-white/5 hover:border-primary/20",
                        )}
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {option.label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {option.hint}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {architectureBlueprint ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-4">
                    {architectureBlueprint.highlights.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                      >
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <MermaidDiagram chart={architectureBlueprint.mermaid} />
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button variant="outline" onClick={() => goToStep(1)}>
                  <ArrowLeft className="size-4" />
                  아이디어로
                </Button>
                <Button onClick={() => goToStep(3)}>
                  프롬프트 단계로
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}

          {activeStep === 3 ? (
            <div className="space-y-8">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {promptStages.map((stage) => (
                      <button
                        key={stage.stage}
                        type="button"
                        onClick={() => setActivePromptStage(stage.stage)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition",
                          activePromptStage === stage.stage
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:border-primary/20",
                        )}
                      >
                        Stage {stage.stage}
                        <ArrowRight className="size-4" />
                      </button>
                    ))}
                  </div>

                  {activePrompt ? <PromptCard stage={activePrompt} /> : null}
                </div>

                <div className="space-y-4">
                  <Card className="glass-panel border-white/10 bg-white/5">
                    <CardHeader className="space-y-2">
                      <CardTitle className="text-lg">목업 저장</CardTitle>
                      <p className="text-sm leading-6 text-muted-foreground">
                        지금은 DB 없이 localStorage로 전체 플로우를 점검합니다.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full" onClick={handleSaveProject}>
                        프로젝트 저장
                      </Button>

                      {savedProjectId ? (
                        <div className="grid gap-2">
                          <Button asChild variant="outline">
                            <Link href={`/dashboard/${savedProjectId}`}>
                              저장 결과 보기
                            </Link>
                          </Button>
                          <Button asChild variant="outline">
                            <Link href="/dashboard">대시보드 열기</Link>
                          </Button>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>

                  <Card className="glass-panel border-white/10 bg-white/5">
                    <CardHeader className="space-y-2">
                      <CardTitle className="text-lg">다음 연결 예정</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                      <p>스킬 탐색 기능</p>
                      <p>목업 사용자 플로우</p>
                      <p>최종 DB 연결</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button variant="outline" onClick={() => goToStep(2)}>
                  <ArrowLeft className="size-4" />
                  구조 단계로
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    전체 흐름 확인
                    <Layers3 className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

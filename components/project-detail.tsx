"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

import { MermaidDiagram } from "@/components/mermaid-diagram";
import { PromptCard } from "@/components/prompt-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getBrowserProject,
  toggleBrowserProjectChecklistItem,
  updateBrowserProjectStatus,
} from "@/lib/repositories/helper-projects";
import { cn } from "@/lib/utils";
import type { PromptStage, ProjectStatus, SavedProject } from "@/types/project";

interface ProjectDetailProps {
  projectId: string;
}

const statusLabelMap: Record<ProjectStatus, string> = {
  draft: "초안",
  ready: "준비됨",
  "mock-live": "운영 중",
};

const statusOptions: Array<{ value: ProjectStatus }> = [
  { value: "draft" },
  { value: "ready" },
  { value: "mock-live" },
];

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const [project, setProject] = useState<SavedProject | null>(null);
  const [activeTab, setActiveTab] = useState("architecture");
  const [activePromptStage, setActivePromptStage] =
    useState<PromptStage["stage"]>(1);

  useEffect(() => {
    void getBrowserProject(projectId).then(setProject);
  }, [projectId]);

  const activePrompt =
    project?.promptStages.find((stage) => stage.stage === activePromptStage) ??
    project?.promptStages[0];
  const backHref =
    project?.status === "mock-live"
      ? "/helper/projects/saved"
      : "/helper/projects/in-progress";

  if (!project) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" className="w-fit">
          <Link href="/helper/projects/saved">
            <ArrowLeft className="size-4" />
            프로젝트로 돌아가기
          </Link>
        </Button>

        <Card className="glass-panel rounded-[2rem] border-[#b8b8d1]/35">
          <CardContent className="px-6 py-12 text-center">
            <p className="text-lg font-semibold text-foreground">
              프로젝트를 찾지 못했습니다.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              로컬 초안이 초기화되었거나 저장 기록이 없을 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button asChild variant="ghost" className="w-fit">
          <Link href={backHref}>
            <ArrowLeft className="size-4" />
            프로젝트로 돌아가기
          </Link>
        </Button>
      </div>

      <Card className="glass-panel rounded-[2rem] border-[#b8b8d1]/35">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-primary">
                {project.serviceTypeLabel}
              </p>
              <CardTitle className="text-lg sm:text-xl">{project.title}</CardTitle>
            </div>
            <span className="rounded-full border border-[#b8b8d1]/45 bg-[#fffffb]/72 px-3 py-1 text-xs text-muted-foreground">
              {statusLabelMap[project.status]}
            </span>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">{project.idea}</p>
        </CardHeader>
      </Card>

      <div className="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="glass-panel rounded-[2rem] border-[#b8b8d1]/35">
          <CardHeader className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="-mx-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <TabsList className="min-w-max">
                <TabsTrigger value="architecture">구조</TabsTrigger>
                <TabsTrigger value="prompts">프롬프트</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="architecture" className="mt-5 space-y-4">
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                  {project.architecture.highlights.map((item) => (
                    <span
                      key={item.label}
                      className="rounded-full border border-[#b8b8d1]/45 bg-[#fffffb]/72 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {item.value}
                    </span>
                  ))}
                </div>

                <MermaidDiagram chart={project.architecture.mermaid} />
              </TabsContent>

              <TabsContent value="prompts" className="mt-5 space-y-4">
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                  {project.promptStages.map((stage) => (
                    <button
                      key={stage.stage}
                      type="button"
                      onClick={() => setActivePromptStage(stage.stage)}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm transition",
                        activePromptStage === stage.stage
                          ? "border-primary/30 bg-primary text-primary-foreground"
                          : "border-[#b8b8d1]/35 bg-[#fffffb]/72 text-muted-foreground hover:border-accent/35",
                      )}
                    >
                      단계 {stage.stage}
                      <ChevronRight className="size-4" />
                    </button>
                  ))}
                </div>

                {activePrompt ? <PromptCard stage={activePrompt} compact /> : null}
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          <Card className="glass-panel rounded-[1.8rem] border-[#b8b8d1]/35">
            <CardHeader className="space-y-3">
              <CardTitle className="text-lg">상태</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => {
                    void updateBrowserProjectStatus(project.id, status.value).then(
                      setProject,
                    );
                  }}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    project.status === status.value
                      ? "border-accent/30 bg-accent text-accent-foreground shadow-soft"
                      : "border-[#b8b8d1]/35 bg-[#fffffb]/72 hover:border-primary/30 hover:bg-[#fffffb]",
                  )}
                >
                  <p className="text-sm font-semibold">{statusLabelMap[status.value]}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-[1.8rem] border-[#b8b8d1]/35">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-accent" />
                <CardTitle className="text-lg">체크리스트</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.checklist.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    void toggleBrowserProjectChecklistItem(project.id, item.id).then(
                      setProject,
                    );
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                    item.done
                      ? "border-primary/25 bg-primary text-primary-foreground"
                      : "border-[#b8b8d1]/35 bg-[#fffffb]/72 hover:border-accent/35 hover:bg-[#fffffb]",
                  )}
                >
                  <div
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-full",
                      item.done
                        ? "bg-[#fffffb]/20 text-primary-foreground"
                        : "bg-[#b8b8d1]/18 text-primary",
                    )}
                  >
                    <CheckCircle2 className="size-4" />
                  </div>
                  <span
                    className={cn(
                      "text-sm",
                      item.done ? "text-primary-foreground" : "text-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

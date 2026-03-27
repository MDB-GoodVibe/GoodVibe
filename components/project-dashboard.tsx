"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { listBrowserProjects } from "@/lib/repositories/helper-projects";
import type { SavedProject } from "@/types/project";

const statusLabelMap = {
  draft: "초안",
  ready: "준비됨",
  "mock-live": "운영 중",
} as const;

export function ProjectDashboard({
  view,
}: {
  view: "in-progress" | "saved";
}) {
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    async function loadProjects() {
      setProjects(await listBrowserProjects());
    }

    function handleStorage() {
      void loadProjects();
    }

    void loadProjects();
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const filteredProjects = projects.filter((project) =>
    view === "saved" ? true : project.status !== "mock-live",
  );

  return (
    <div className="space-y-8">
      <section className="hero-surface px-7 py-8 sm:px-9 sm:py-10">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="inline-flex rounded-full bg-white/12 px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/82">
              Projects
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.07em] text-white sm:text-5xl">
              {view === "saved" ? "저장된 프로젝트" : "진행 중인 프로젝트"}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
              저장한 흐름을 다시 열어 이어서 작업하고, 구조와 프롬프트를 한눈에 확인하세요.
            </p>
          </div>

          <Button asChild variant="secondary">
            <Link href="/helper/idea">Helper 시작하기</Link>
          </Button>
        </div>
      </section>

      {filteredProjects.length === 0 ? (
        <section className="surface-subtle rounded-[2rem] px-6 py-12 text-center">
          <p className="text-lg font-bold text-primary">
            {view === "saved"
              ? "아직 저장된 프로젝트가 없어요."
              : "진행 중인 프로젝트가 없어요."}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            아이디어를 정리하고 첫 번째 프로젝트를 만들어보세요.
          </p>
          <Button asChild className="mt-5">
            <Link href="/helper/idea">
              Helper 시작하기
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      ) : null}

      <div className="space-y-3">
        {filteredProjects.map((project) => {
          const completedCount = project.checklist.filter((item) => item.done).length;

          return (
            <Link
              key={project.id}
              href={`/helper/projects/${project.id}`}
              className="group block rounded-[1.9rem] bg-white px-6 py-5 shadow-[0_14px_34px_rgba(37,31,74,0.05)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-[rgba(59,53,97,0.08)] px-3 py-1 font-semibold text-primary">
                      {project.serviceTypeLabel}
                    </span>
                    <span className="rounded-full bg-[rgba(221,115,115,0.10)] px-3 py-1 font-semibold text-secondary">
                      {statusLabelMap[project.status]}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-primary">
                    {project.title}
                  </h2>
                  <p className="line-clamp-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                    {project.idea}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[rgba(244,243,243,0.92)] px-4 py-2 text-xs text-muted-foreground">
                    체크리스트 {completedCount}/{project.checklist.length}
                  </span>
                  {project.architecture.highlights.slice(0, 1).map((item) => (
                    <span
                      key={item.label}
                      className="rounded-full bg-[rgba(244,243,243,0.92)] px-4 py-2 text-xs text-muted-foreground"
                    >
                      {item.value}
                    </span>
                  ))}
                  <span className="text-sm font-bold text-primary transition-transform duration-200 group-hover:translate-x-1">
                    열기
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

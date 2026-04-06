"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import {
  ArrowRight,
  Compass,
  ExternalLink,
  Package2,
  Search,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { skillCatalog, type SkillCatalogEntry, type SkillGoal } from "@/lib/skill-catalog";
import { cn } from "@/lib/utils";

const sourceFilters = [
  { id: "all", label: "전체" },
  { id: "official", label: "공식" },
  { id: "session", label: "세션 사용 가능" },
  { id: "community", label: "커뮤니티" },
] as const;

const goalOptions: Array<{ id: SkillGoal; label: string }> = [
  { id: "ux-ui", label: "UI/UX" },
  { id: "skill-search", label: "스킬 탐색" },
  { id: "custom-skill", label: "커스텀 스킬" },
  { id: "docs-api", label: "문서/API" },
  { id: "automation", label: "자동화" },
];

const sourceLabelMap = {
  official: "공식",
  session: "세션",
  community: "커뮤니티",
} as const;

function getSkillScore(skill: SkillCatalogEntry, activeGoals: SkillGoal[]) {
  let score = 0;

  if (skill.availableInSession) {
    score += 2;
  }

  if (skill.official) {
    score += 1;
  }

  for (const goal of activeGoals) {
    if (skill.goals.includes(goal)) {
      score += 3;
    }
  }

  return score;
}

export function SkillExplorer() {
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] =
    useState<(typeof sourceFilters)[number]["id"]>("all");
  const [activeGoals, setActiveGoals] = useState<SkillGoal[]>([
    "ux-ui",
    "skill-search",
  ]);
  const deferredQuery = useDeferredValue(query);

  const scoredSkills = skillCatalog
    .map((skill) => ({
      ...skill,
      score: getSkillScore(skill, activeGoals),
    }))
    .filter((skill) => {
      if (sourceFilter !== "all" && skill.sourceType !== sourceFilter) {
        return false;
      }

      if (!deferredQuery.trim()) {
        return true;
      }

      const queryValue = deferredQuery.toLowerCase();
      const haystack = [
        skill.name,
        skill.summary,
        skill.whyItFits,
        ...skill.tags,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(queryValue);
    })
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));

  const recommendedSkills = scoredSkills.slice(0, 3);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(
    recommendedSkills[0]?.id ?? skillCatalog[0]?.id ?? null,
  );

  const selectedSkill =
    scoredSkills.find((skill) => skill.id === selectedSkillId) ?? scoredSkills[0] ?? null;

  function toggleGoal(goal: SkillGoal) {
    setActiveGoals((currentGoals) =>
      currentGoals.includes(goal)
        ? currentGoals.filter((item) => item !== goal)
        : [...currentGoals, goal],
    );
  }

  const projectSummary =
    activeGoals.length > 0
      ? `${activeGoals.length}개의 목표에 맞춰 추천 중`
      : "전체 카탈로그 탐색 중";

  return (
    <div className="space-y-8">
      <Card className="glass-panel overflow-hidden">
        <CardContent className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
              <Compass className="size-3.5 text-primary" />
              Project-aware Search
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              지금 프로젝트에 맞는 스킬을
              <br />
              검색하고 추천받을 수 있습니다
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              현재는 세션 스킬과 검증된 공식/커뮤니티 후보를 함께 보여주는
              탐색 UI입니다. 다음 단계에서는 원격 카탈로그 설치까지 연결할 수
              있도록 확장할 수 있습니다.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              현재 추천 상태
            </p>
            <p className="mt-3 text-lg font-semibold text-foreground">
              {projectSummary}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              UI/UX와 스킬 탐색 기능을 함께 강화하려는 현재 목적에 맞춰 우선순위를
              계산하고 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="스킬 이름, 태그, 요약으로 검색"
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {sourceFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSourceFilter(filter.id)}
                className={cn(
                  "rounded-full border px-3 py-2 text-sm transition",
                  sourceFilter === filter.id
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:border-primary/20",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {goalOptions.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "rounded-full border px-3 py-2 text-sm transition",
                activeGoals.includes(goal.id)
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-primary/20",
              )}
            >
              {goal.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">
                추천 스킬
              </p>
              <p className="text-xs text-muted-foreground">
                결과 {scoredSkills.length}개
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {recommendedSkills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setSelectedSkillId(skill.id)}
                  className={cn(
                    "rounded-[1.6rem] border p-5 text-left transition",
                    selectedSkill?.id === skill.id
                      ? "border-primary/40 bg-primary/10"
                      : "border-white/10 bg-white/5 hover:border-primary/20 hover:bg-white/6",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
                        {sourceLabelMap[skill.sourceType]}
                      </span>
                      <p className="text-lg font-semibold text-foreground">
                        {skill.name}
                      </p>
                    </div>
                    <Sparkles className="size-4 text-primary" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {skill.summary}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              전체 탐색 결과
            </p>

            <div className="space-y-3">
              {scoredSkills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setSelectedSkillId(skill.id)}
                  className={cn(
                    "w-full rounded-[1.6rem] border p-5 text-left transition",
                    selectedSkill?.id === skill.id
                      ? "border-primary/40 bg-primary/10"
                      : "border-white/10 bg-white/5 hover:border-primary/20 hover:bg-white/6",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
                          {skill.sourceLabel}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
                          {skill.category}
                        </span>
                        {skill.availableInSession ? (
                          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
                            세션 사용 가능
                          </span>
                        ) : null}
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        {skill.name}
                      </p>
                    </div>

                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                      Fit {skill.score}
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {skill.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {skill.tags.map((tag) => (
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
          </div>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          {selectedSkill ? (
            <Card className="glass-panel">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
                      {selectedSkill.sourceLabel}
                    </span>
                    <CardTitle className="text-xl">{selectedSkill.name}</CardTitle>
                  </div>
                  <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Package2 className="size-4" />
                  </div>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {selectedSkill.summary}
                </p>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">
                    Why It Fits
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {selectedSkill.whyItFits}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    언제 쓰면 좋은가
                  </p>
                  <div className="space-y-2">
                    {selectedSkill.whenToUse.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-muted-foreground"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  {selectedSkill.sourceUrl ? (
                    <Button asChild variant="outline">
                      <a
                        href={selectedSkill.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        소스 보기
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  ) : null}

                  <Button asChild>
                    <Link href="/wizard">
                      이 프로젝트 흐름에 적용해보기
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="glass-panel">
            <CardHeader className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">
                Next Connection
              </p>
              <CardTitle className="text-lg">다음 확장 포인트</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
              <p>공식 카탈로그 원격 조회</p>
              <p>설치 버튼과 실제 skill-installer 연결</p>
              <p>프로젝트 단계별 자동 추천</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

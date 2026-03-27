import Link from "next/link";
import { ExternalLink, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getExploreCatalog } from "@/lib/explore/catalog";
import { cn } from "@/lib/utils";
import type { CatalogSort, CatalogSourceFilter } from "@/types/project";

const sourceOptions: Array<{ id: CatalogSourceFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "skills-sh", label: "skills.sh" },
  { id: "claude-marketplaces", label: "Claude Marketplaces" },
];

const sortOptions: Array<{ id: CatalogSort; label: string }> = [
  { id: "popular", label: "인기순" },
  { id: "trending", label: "트렌딩" },
  { id: "hot", label: "HOT" },
];

export default async function KnowledgeSkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const source: CatalogSourceFilter =
    params.source === "skills-sh" || params.source === "claude-marketplaces"
      ? params.source
      : "all";
  const sort: CatalogSort =
    params.sort === "trending" || params.sort === "hot" ? params.sort : "popular";

  const catalog = await getExploreCatalog({
    kind: "skills",
    q,
    source,
    sort,
    limit: 24,
  });

  return (
    <div className="space-y-5">
      <section className="rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-[linear-gradient(180deg,#fcfbfb_0%,#f8f6f7_100%)] px-6 py-5 shadow-[0_14px_28px_rgba(37,31,74,0.04)]">
        <div className="space-y-1.5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-secondary">
            Skill Library
          </p>
          <h1 className="text-[1.45rem] font-bold tracking-[-0.04em] text-primary">
            스킬 정보
          </h1>
          <p className="text-[13px] text-muted-foreground">
            전체 스킬을 훑어보고, 헬퍼 단계에서 선택할 후보를 미리 찾을 수 있습니다.
          </p>
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_12px_24px_rgba(37,31,74,0.04)]">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center">
          <form action="/knowledge/skills" className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="스킬 이름, 저장소, 키워드 검색"
              className="h-11 w-full rounded-xl border border-[rgba(121,118,127,0.12)] bg-[rgba(248,247,248,0.92)] pl-9 pr-4 text-[13px] outline-none placeholder:text-muted-foreground"
            />
            <input type="hidden" name="source" value={source} />
            <input type="hidden" name="sort" value={sort} />
          </form>

          <div className="flex flex-wrap gap-2">
            {sourceOptions.map((item) => (
              <Link
                key={item.id}
                href={q ? `/knowledge/skills?q=${encodeURIComponent(q)}&source=${item.id}&sort=${sort}` : `/knowledge/skills?source=${item.id}&sort=${sort}`}
                className={cn(
                  "rounded-full px-3 py-2 text-[12px] font-medium transition",
                  source === item.id
                    ? "bg-primary text-white"
                    : "bg-[rgba(248,247,248,0.92)] text-muted-foreground hover:bg-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {sortOptions.map((item) => (
              <Link
                key={item.id}
                href={q ? `/knowledge/skills?q=${encodeURIComponent(q)}&source=${source}&sort=${item.id}` : `/knowledge/skills?source=${source}&sort=${item.id}`}
                className={cn(
                  "rounded-full px-3 py-2 text-[12px] font-medium transition",
                  sort === item.id
                    ? "bg-secondary text-white"
                    : "bg-[rgba(248,247,248,0.92)] text-muted-foreground hover:bg-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {catalog.items.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {catalog.items.map((item) => (
            <article
              key={item.id}
              className="rounded-[1.5rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_12px_24px_rgba(37,31,74,0.04)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-[rgba(248,247,248,0.92)] px-2.5 py-1 font-semibold text-muted-foreground">
                    {item.sourceLabel}
                  </span>
                  <span className="rounded-full bg-[rgba(255,107,108,0.08)] px-2.5 py-1 font-semibold text-secondary">
                    {item.popularityLabel}
                  </span>
                </div>
                <Sparkles className="size-4 text-primary/42" />
              </div>

              <div className="mt-4 space-y-2">
                <h2 className="text-[1rem] font-semibold tracking-[-0.03em] text-primary">
                  {item.title}
                </h2>
                <p className="text-[12px] leading-6 text-muted-foreground">{item.summary}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[rgba(248,247,248,0.92)] px-2.5 py-1 text-[11px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {item.installCommand ? (
                <div className="mt-4 rounded-[1rem] bg-[rgba(248,247,248,0.92)] px-3 py-3 font-mono text-[11px] text-primary">
                  {item.installCommand}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    원본
                    <ExternalLink className="size-3.5" />
                  </a>
                </Button>
                {item.repoUrl ? (
                  <Button asChild size="sm" variant="outline">
                    <a href={item.repoUrl} target="_blank" rel="noreferrer">
                      저장소
                      <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-[1.6rem] border border-dashed border-[rgba(121,118,127,0.16)] bg-white px-5 py-8 text-[12px] text-muted-foreground shadow-[0_12px_24px_rgba(37,31,74,0.04)]">
          조건에 맞는 스킬이 없습니다.
        </section>
      )}
    </div>
  );
}

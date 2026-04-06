"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  Compass,
  Copy,
  ExternalLink,
  LoaderCircle,
  Search,
} from "lucide-react";

import { useWorkspace } from "@/components/workspace-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rankCatalogItemsForDraft } from "@/lib/explore/recommendations";
import { cn } from "@/lib/utils";
import type {
  CatalogSort,
  CatalogSourceFilter,
  ExploreApiResponse,
  ExternalCatalogItem,
} from "@/types/project";

const skillSourceFilters = [
  { id: "all", label: "전체" },
  { id: "skills-sh", label: "skills.sh" },
  { id: "claude-marketplaces", label: "Claude Marketplaces" },
] as const;

const marketplaceSourceFilters = [
  { id: "all", label: "전체" },
  { id: "claude-marketplaces", label: "Claude Marketplaces" },
] as const;

const sortOptions: Array<{ id: CatalogSort; label: string }> = [
  { id: "popular", label: "인기순" },
  { id: "trending", label: "트렌딩" },
  { id: "hot", label: "HOT" },
];

function buildExternalSearchLink(
  kind: "skills" | "marketplaces",
  source: CatalogSourceFilter,
  query: string,
) {
  const encodedQuery = encodeURIComponent(query);

  if (source === "skills-sh") {
    return query
      ? `https://skills.sh/search?q=${encodedQuery}`
      : "https://skills.sh/trending";
  }

  const basePath = kind === "skills" ? "skills" : "marketplaces";

  return query
    ? `https://claudemarketplaces.com/${basePath}?search=${encodedQuery}`
    : `https://claudemarketplaces.com/${basePath}`;
}

export function ExploreHub({
  kind,
}: {
  kind: "skills" | "marketplaces";
}) {
  const { draft } = useWorkspace();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<CatalogSourceFilter>("all");
  const [sort, setSort] = useState<CatalogSort>("popular");
  const [items, setItems] = useState<ExternalCatalogItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ExploreApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (kind === "marketplaces" && source === "skills-sh") {
      setSource("all");
    }

    if (kind === "marketplaces" && sort !== "popular") {
      setSort("popular");
    }
  }, [kind, sort, source]);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/explore?kind=${kind}&source=${source}&sort=${sort}&limit=30&q=${encodeURIComponent(
            deferredQuery,
          )}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load explore results.");
        }

        const payload = (await response.json()) as ExploreApiResponse;

        if (!cancelled) {
          setMetadata(payload);
          setItems(payload.items);
        }
      } catch {
        if (!cancelled) {
          setError("탐색 결과를 불러오지 못했어요.");
          setItems([]);
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
  }, [deferredQuery, kind, sort, source]);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0]?.id ?? null);
    }
  }, [items, selectedId]);

  const recommendedItems = draft.idea
    ? rankCatalogItemsForDraft(draft, items, "explore").slice(0, 3)
    : items.slice(0, 3);

  const selectedItem =
    items.find((item) => item.id === selectedId) ?? recommendedItems[0] ?? null;

  const sourceFilters =
    kind === "skills" ? skillSourceFilters : marketplaceSourceFilters;

  async function copyInstallCommand(command: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      window.setTimeout(() => setCopiedCommand(null), 1800);
    } catch {
      setCopiedCommand(null);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="hero-surface px-5 py-6 sm:px-9 sm:py-10">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="inline-flex rounded-full bg-white/12 px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/82">
              {kind === "skills" ? "Skills" : "Plugins & Marketplaces"}
            </p>
            <h1 className="text-[1.55rem] font-extrabold leading-[1.08] tracking-[-0.05em] text-white sm:text-3xl">
              {kind === "skills" ? "프로젝트에 맞는 스킬 탐색" : "연결할 플러그인과 마켓 탐색"}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
              {kind === "skills"
                ? "현재 아이디어와 구조에 맞춰 자주 함께 쓰는 스킬을 먼저 보여줍니다."
                : "외부 마켓과 플러그인을 모아보고, 원본 페이지로 바로 이어갈 수 있어요."}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs text-white/76">
            <Compass className="size-3.5" />
            {draft.projectName.trim() || "현재 워크스페이스"}
          </div>
        </div>
      </section>

      <section className="surface-subtle rounded-[1.8rem] px-4 py-4 sm:rounded-[2rem] sm:px-6 sm:py-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-10"
              placeholder={
                kind === "skills"
                  ? "스킬 이름, 저장소, 키워드를 검색해보세요."
                  : "플러그인 이름, 저장소, 키워드를 검색해보세요."
              }
            />
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {sourceFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSource(filter.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                  source === filter.id
                    ? "bg-primary text-white"
                    : "bg-[rgba(244,243,243,0.92)] text-muted-foreground hover:bg-white hover:text-primary",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {kind === "skills" ? (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSort(option.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                    sort === option.id
                      ? "bg-secondary text-white"
                      : "bg-[rgba(244,243,243,0.92)] text-muted-foreground hover:bg-white hover:text-primary",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {recommendedItems.length > 0 ? (
          <div className="mt-5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {recommendedItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition",
                  selectedItem?.id === item.id
                    ? "bg-[rgba(221,115,115,0.14)] text-secondary"
                    : "bg-[rgba(244,243,243,0.92)] text-muted-foreground hover:bg-white hover:text-primary",
                )}
              >
                {item.title}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.78fr)]">
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-[1.8rem] bg-white shadow-[0_10px_24px_rgba(37,31,74,0.05)]"
              />
            ))
          ) : null}

          {!loading && error ? (
            <div className="surface-subtle rounded-[1.8rem] px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : null}

          {!loading &&
            !error &&
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  "w-full rounded-[1.6rem] px-4 py-4 text-left transition-all sm:rounded-[1.8rem] sm:px-5 sm:py-5",
                  selectedItem?.id === item.id
                    ? "bg-primary text-white shadow-[0_16px_34px_rgba(37,31,74,0.14)]"
                    : "bg-white text-foreground shadow-[0_10px_24px_rgba(37,31,74,0.05)] hover:-translate-y-0.5",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 font-semibold",
                          selectedItem?.id === item.id
                            ? "bg-white/10 text-white/80"
                            : "bg-[rgba(244,243,243,0.92)] text-muted-foreground",
                        )}
                      >
                        {item.sourceLabel}
                      </span>
                      <span
                        className={cn(
                          selectedItem?.id === item.id
                            ? "text-white/68"
                            : "text-muted-foreground",
                        )}
                      >
                        {item.popularityLabel}
                      </span>
                    </div>
                    <h2 className="text-base font-extrabold tracking-[-0.03em] sm:text-lg">
                      {item.title}
                    </h2>
                    <p
                      className={cn(
                        "line-clamp-2 text-sm leading-7",
                        selectedItem?.id === item.id
                          ? "text-white/76"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.summary}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p
                      className={cn(
                        "text-sm font-bold",
                        selectedItem?.id === item.id
                          ? "text-white"
                          : "text-primary",
                      )}
                    >
                      {item.owner}
                    </p>
                  </div>
                </div>
              </button>
            ))}
        </div>

        <div className="space-y-4">
          {selectedItem ? (
            <section className="surface-subtle rounded-[1.8rem] px-5 py-5 sm:rounded-[2rem] sm:px-6 sm:py-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-[rgba(59,53,97,0.08)] px-3 py-1 font-semibold text-primary">
                  {selectedItem.sourceLabel}
                </span>
                <span>{selectedItem.popularityLabel}</span>
              </div>

              <div className="mt-4 space-y-3">
                <h2 className="text-lg font-extrabold tracking-[-0.04em] text-primary sm:text-xl">
                  {selectedItem.title}
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  {selectedItem.summary}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {selectedItem.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[rgba(244,243,243,0.92)] px-3 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {selectedItem.installCommand ? (
                <div className="mt-6 rounded-[1.5rem] bg-primary px-4 py-4 text-white sm:rounded-[1.6rem] sm:px-5 sm:py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/62">
                        설치 명령어
                      </p>
                      <pre className="mt-3 overflow-x-auto text-sm leading-7 whitespace-pre-wrap text-white">
                        {selectedItem.installCommand}
                      </pre>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/18 bg-white/10 text-white hover:bg-white/16 sm:w-auto"
                      onClick={() => void copyInstallCommand(selectedItem.installCommand!)}
                    >
                      <Copy className="size-4" />
                      {copiedCommand === selectedItem.installCommand ? "복사됨" : "복사"}
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 grid gap-2">
                <Button asChild>
                  <a href={selectedItem.url} target="_blank" rel="noreferrer">
                    원본 페이지 열기
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                {selectedItem.repoUrl ? (
                  <Button asChild variant="outline">
                    <a href={selectedItem.repoUrl} target="_blank" rel="noreferrer">
                      저장소 열기
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : null}
              </div>
            </section>
          ) : null}

          <section className="surface-subtle rounded-[1.7rem] px-5 py-5 sm:rounded-[1.8rem] sm:px-6 sm:py-6">
            <p className="text-lg font-bold text-primary">바로 이동</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              결과가 부족하면 원본 사이트에서 더 깊게 탐색할 수 있어요.
            </p>
            <div className="mt-4 grid gap-2">
              <Button asChild variant="outline">
                <a
                  href={buildExternalSearchLink(kind, source, deferredQuery)}
                  target="_blank"
                  rel="noreferrer"
                >
                  원본 사이트에서 계속 검색
                  <ExternalLink className="size-4" />
                </a>
              </Button>
              <div className="rounded-[1.4rem] bg-[rgba(244,243,243,0.92)] px-4 py-4 text-xs leading-6 text-muted-foreground">
                {metadata?.fallbackUsed
                  ? "현재는 캐시와 스냅샷 데이터를 함께 사용 중입니다."
                  : "현재는 공개 목록을 바탕으로 결과를 보여주고 있습니다."}
              </div>
            </div>
          </section>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          결과를 불러오는 중입니다.
        </div>
      ) : null}
    </div>
  );
}

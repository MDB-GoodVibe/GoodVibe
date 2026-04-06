"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IdeaSort } from "@/types/good-vibe";

function buildIdeasHref(pathname: string, sort: IdeaSort, query: string) {
  const params = new URLSearchParams();
  const normalizedQuery = query.trim();

  if (sort === "popular") {
    params.set("sort", "popular");
  }

  if (normalizedQuery) {
    params.set("q", normalizedQuery);
  }

  const serialized = params.toString();

  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function IdeaBoardFilters({
  initialQuery,
  sort,
}: {
  initialQuery: string;
  sort: IdeaSort;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const normalizedInitialQuery = initialQuery.trim();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const normalizedDeferredQuery = deferredQuery.trim();

    if (normalizedDeferredQuery === normalizedInitialQuery) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timeout = window.setTimeout(() => {
      startTransition(() => {
        router.replace(buildIdeasHref(pathname, sort, normalizedDeferredQuery), {
          scroll: false,
        });
      });
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [deferredQuery, normalizedInitialQuery, pathname, router, sort]);

  useEffect(() => {
    setIsSearching(false);
  }, [initialQuery, sort]);

  const statusLabel = useMemo(() => {
    if (isSearching) {
      return "검색 중";
    }

    if (query.trim()) {
      return "입력 즉시 반영";
    }

    return "전체 보기";
  }, [isSearching, query]);

  function handleSortChange(nextSort: IdeaSort) {
    const nextQuery = query.trim();

    startTransition(() => {
      router.replace(buildIdeasHref(pathname, nextSort, nextQuery), {
        scroll: false,
      });
    });
  }

  return (
    <section className="rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(37,31,74,0.05)] sm:rounded-[1.8rem] sm:px-5 sm:py-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-2 lg:max-w-[560px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="아이디어 검색"
              className="h-11 w-full rounded-xl border border-[rgba(121,118,127,0.12)] bg-[rgba(244,243,243,0.92)] pl-10 pr-4 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold",
                isSearching
                  ? "bg-[rgba(59,53,97,0.08)] text-primary"
                  : "bg-[rgba(244,243,243,0.92)]",
              )}
            >
              {isSearching ? <LoaderCircle className="size-3 animate-spin" /> : null}
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="flex w-full lg:w-auto lg:justify-end">
          <div className="inline-flex w-full justify-between rounded-full border border-[rgba(121,118,127,0.12)] bg-[rgba(244,243,243,0.92)] p-1 sm:w-auto sm:justify-start">
            <Button
              type="button"
              size="sm"
              variant={sort === "latest" ? "secondary" : "ghost"}
              onClick={() => handleSortChange("latest")}
            >
              최신순
            </Button>
            <Button
              type="button"
              size="sm"
              variant={sort === "popular" ? "secondary" : "ghost"}
              onClick={() => handleSortChange("popular")}
            >
              추천순
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

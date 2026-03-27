"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";

import { useWorkspace } from "@/components/workspace-provider";
import { Button } from "@/components/ui/button";
import { rankCatalogItemsForDraft } from "@/lib/explore/recommendations";
import type {
  ExploreApiResponse,
  ExternalCatalogItem,
  WorkspaceSection,
} from "@/types/project";

interface ContextualExplorerCardProps {
  kind: "skills" | "marketplaces";
  section: WorkspaceSection;
  title: string;
  description?: string;
}

export function ContextualExplorerCard({
  kind,
  section,
  title,
  description,
}: ContextualExplorerCardProps) {
  const { draft } = useWorkspace();
  const [items, setItems] = useState<ExternalCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/explore?kind=${kind}&sort=popular&limit=${kind === "skills" ? 12 : 8}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load explore items.");
        }

        const payload = (await response.json()) as ExploreApiResponse;
        const rankedItems = draft.idea
          ? rankCatalogItemsForDraft(draft, payload.items, section)
          : payload.items;

        if (!cancelled) {
          setItems(rankedItems.slice(0, 3));
        }
      } catch {
        if (!cancelled) {
          setError("추천 항목을 불러오지 못했어요.");
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
  }, [draft, kind, section]);

  return (
    <section className="surface-subtle rounded-[1.8rem] px-5 py-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-accent" />
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h3>
      </div>

      {description ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 rounded-[1.3rem] border border-white/60 bg-white/50"
            />
          ))
        ) : null}

        {!loading && error ? (
          <div className="rounded-[1.3rem] border border-white/60 bg-white/52 px-4 py-4 text-sm text-muted-foreground">
            {error}
          </div>
        ) : null}

        {!loading &&
          !error &&
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-[1.35rem] border border-white/65 bg-white/56 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {item.summary}
                  </p>
                </div>
                <span className="rounded-full border border-[#5b5f97]/12 bg-white/72 px-2.5 py-1 text-[11px] text-muted-foreground">
                  {item.popularityLabel}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{item.sourceLabel}</span>
                {item.repoUrl ? (
                  <a
                    href={item.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary"
                  >
                    저장소
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
              </div>
            </div>
          ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild>
          <Link
            href={kind === "skills" ? "/helper/explore/skills" : "/helper/explore/plugins"}
          >
            전체 보기
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        {items[0] ? (
          <Button asChild variant="outline">
            <a href={items[0].url} target="_blank" rel="noreferrer">
              첫 추천 열기
              <ExternalLink className="size-4" />
            </a>
          </Button>
        ) : null}
      </div>
    </section>
  );
}

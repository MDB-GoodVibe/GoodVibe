"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  BrandIcon,
  getCategoryIcon,
  getChannelIcon,
  getSubcategoryIcon,
  getTagIcon,
} from "@/components/knowledge/external-resource-icons";
import { Button } from "@/components/ui/button";
import { getExternalResourceBrief } from "@/lib/knowledge/external-resource-brief";
import { getExternalTaxonomy } from "@/lib/knowledge/external-resource";
import { cn } from "@/lib/utils";
import type { ExternalResourceTaxonomy, KnowledgeArticle } from "@/types/good-vibe";

type ResourceCardItem = {
  article: KnowledgeArticle;
  taxonomy: ExternalResourceTaxonomy;
};

type FilterOption = {
  value: string;
  label: string;
  count: number;
};

type FilterKind = "channel" | "category" | "subcategory";

function formatDate(value: string | null) {
  if (!value) {
    return "최신 업데이트";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function byLabel(left: FilterOption, right: FilterOption) {
  return left.label.localeCompare(right.label, "ko");
}

function buildOptions(values: Array<{ value: string; label: string }>) {
  const counts = new Map<string, FilterOption>();

  for (const item of values) {
    const existing = counts.get(item.value);

    if (existing) {
      existing.count += 1;
      continue;
    }

    counts.set(item.value, {
      value: item.value,
      label: item.label,
      count: 1,
    });
  }

  return Array.from(counts.values()).sort(byLabel);
}

function getFilterIcon(kind: FilterKind, value: string) {
  if (value === "all") {
    return {
      type: "emoji" as const,
      value: "✨",
      alt: "전체",
    };
  }

  if (kind === "channel") {
    return getChannelIcon(value);
  }

  if (kind === "category") {
    return getCategoryIcon(value);
  }

  return getSubcategoryIcon(value);
}

function hostLabel(taxonomy: ExternalResourceTaxonomy) {
  return taxonomy.domain
    ? taxonomy.domain.replace(/^www\./, "").toUpperCase()
    : taxonomy.sourceName.toUpperCase();
}

function FilterChipGroup({
  label,
  kind,
  value,
  options,
  onChange,
  compact = false,
  showSelectedLabel = true,
}: {
  label: string;
  kind: FilterKind;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  compact?: boolean;
  showSelectedLabel?: boolean;
}) {
  const totalCount = options.reduce((sum, option) => sum + option.count, 0);
  const selectedOption = options.find((option) => option.value === value);
  const items = [{ value: "all", label: "전체", count: totalCount }, ...options];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary/50">
          {label}
        </span>
        {showSelectedLabel && selectedOption && selectedOption.value !== "all" ? (
          <span className="text-xs font-medium text-muted-foreground">
            {selectedOption.label}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((option) => {
          const selected = option.value === value;
          const icon = getFilterIcon(kind, option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border font-semibold transition",
                compact ? "h-9 px-3 text-[13px]" : "h-10 px-3.5 text-sm",
                selected
                  ? "border-primary bg-primary text-white shadow-[0_10px_20px_rgba(37,31,74,0.18)]"
                  : "border-[rgba(121,118,127,0.12)] bg-white text-primary hover:border-[rgba(59,53,97,0.25)] hover:bg-[rgba(249,247,255,0.85)]",
              )}
            >
              <BrandIcon
                icon={icon}
                size={14}
                bubbleClassName={
                  selected ? "bg-white text-primary" : "bg-[rgba(244,243,243,0.96)]"
                }
              />
              <span>{option.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  selected
                    ? "bg-white/18 text-white"
                    : "bg-[rgba(59,53,97,0.08)] text-primary/70",
                )}
              >
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TaxonomyPill({
  icon,
  label,
  tone,
}: {
  icon: ReturnType<typeof getChannelIcon>;
  label: string;
  tone: "channel" | "category" | "subcategory" | "tag";
}) {
  const toneClassName =
    tone === "channel"
      ? "bg-[rgba(59,53,97,0.08)] text-primary"
      : tone === "category"
        ? "bg-[rgba(255,193,69,0.18)] text-primary"
        : tone === "subcategory"
          ? "bg-[rgba(81,163,163,0.14)] text-primary"
          : "bg-[rgba(244,243,243,0.92)] text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold",
        toneClassName,
      )}
    >
      <BrandIcon icon={icon} size={12} bubbleClassName="bg-white/92" />
      <span>{label}</span>
    </span>
  );
}

export function KnowledgeExternalTrackView({
  title,
  articles,
}: {
  title: string;
  articles: KnowledgeArticle[];
}) {
  const items = useMemo<ResourceCardItem[]>(
    () =>
      articles
        .map((article) => {
          const taxonomy = getExternalTaxonomy(article);

          if (!taxonomy) {
            return null;
          }

          return {
            article,
            taxonomy,
          };
        })
        .filter((item): item is ResourceCardItem => Boolean(item)),
    [articles],
  );

  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const channelOptions = useMemo(
    () =>
      buildOptions(
        items.map(({ taxonomy }) => ({
          value: taxonomy.channel,
          label: taxonomy.channelLabel,
        })),
      ),
    [items],
  );

  const categorySource = useMemo(
    () =>
      items.filter(
        ({ taxonomy }) =>
          selectedChannel === "all" || taxonomy.channel === selectedChannel,
      ),
    [items, selectedChannel],
  );

  const categoryOptions = useMemo(
    () =>
      buildOptions(
        categorySource.map(({ taxonomy }) => ({
          value: taxonomy.category,
          label: taxonomy.categoryLabel,
        })),
      ),
    [categorySource],
  );

  const subcategorySource = useMemo(
    () =>
      categorySource.filter(
        ({ taxonomy }) =>
          selectedCategory === "all" || taxonomy.category === selectedCategory,
      ),
    [categorySource, selectedCategory],
  );

  const subcategoryOptions = useMemo(
    () =>
      buildOptions(
        subcategorySource.map(({ taxonomy }) => ({
          value: taxonomy.subcategory,
          label: taxonomy.subcategoryLabel,
        })),
      ),
    [subcategorySource],
  );

  const filteredItems = useMemo(
    () =>
      subcategorySource.filter(
        ({ taxonomy }) =>
          selectedSubcategory === "all" ||
          taxonomy.subcategory === selectedSubcategory,
      ),
    [selectedSubcategory, subcategorySource],
  );

  const hasAdvancedSelection =
    selectedCategory !== "all" || selectedSubcategory !== "all";
  const hasActiveFilters = selectedChannel !== "all" || hasAdvancedSelection;
  const selectedCategoryLabel =
    categoryOptions.find((option) => option.value === selectedCategory)?.label ??
    null;
  const selectedSubcategoryLabel =
    subcategoryOptions.find((option) => option.value === selectedSubcategory)
      ?.label ?? null;

  function handleChannelChange(value: string) {
    setSelectedChannel(value);
    setSelectedCategory("all");
    setSelectedSubcategory("all");
  }

  function handleCategoryChange(value: string) {
    setSelectedCategory(value);
    setSelectedSubcategory("all");

    if (value !== "all") {
      setShowAdvancedFilters(true);
    }
  }

  function handleSubcategoryChange(value: string) {
    setSelectedSubcategory(value);

    if (value !== "all") {
      setShowAdvancedFilters(true);
    }
  }

  function resetFilters() {
    setSelectedChannel("all");
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setShowAdvancedFilters(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(250,247,239,0.96))] px-5 py-5 shadow-[0_14px_30px_rgba(37,31,74,0.05)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-[rgba(255,193,69,0.18)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">
              Resources
            </span>
            <h1 className="text-[clamp(1.2rem,1.6vw,1.5rem)] font-extrabold tracking-[-0.03em] text-primary">
              {title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-3.5 py-2 font-semibold text-primary">
              리소스 {filteredItems.length}
            </span>
            <span className="rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-3.5 py-2 font-semibold text-primary">
              채널 {channelOptions.length}
            </span>
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-full px-3.5"
              onClick={() => setShowAdvancedFilters((current) => !current)}
            >
              <SlidersHorizontal className="size-3.5" />
              {showAdvancedFilters ? "필터 접기" : "필터 더보기"}
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  showAdvancedFilters ? "rotate-180" : "rotate-0",
                )}
              />
            </Button>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-3.5 text-sm font-semibold text-primary transition hover:border-[rgba(59,53,97,0.22)] hover:bg-[rgba(249,247,255,0.85)]"
              >
                초기화
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <FilterChipGroup
            label="채널"
            kind="channel"
            value={selectedChannel}
            options={channelOptions}
            onChange={handleChannelChange}
            compact
            showSelectedLabel={false}
          />

          {!showAdvancedFilters && hasAdvancedSelection ? (
            <div className="flex flex-wrap gap-2">
              {selectedCategoryLabel ? (
                <TaxonomyPill
                  icon={getCategoryIcon(selectedCategory)}
                  label={`주제 ${selectedCategoryLabel}`}
                  tone="category"
                />
              ) : null}
              {selectedSubcategoryLabel ? (
                <TaxonomyPill
                  icon={getSubcategoryIcon(selectedSubcategory)}
                  label={`도구 ${selectedSubcategoryLabel}`}
                  tone="subcategory"
                />
              ) : null}
            </div>
          ) : null}

          {showAdvancedFilters ? (
            <div className="rounded-[1.4rem] border border-[rgba(121,118,127,0.08)] bg-[rgba(250,249,249,0.78)] px-4 py-4">
              <div className="space-y-4">
                <FilterChipGroup
                  label="주제"
                  kind="category"
                  value={selectedCategory}
                  options={categoryOptions}
                  onChange={handleCategoryChange}
                  compact
                />
                <FilterChipGroup
                  label="도구"
                  kind="subcategory"
                  value={selectedSubcategory}
                  options={subcategoryOptions}
                  onChange={handleSubcategoryChange}
                  compact
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {filteredItems.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredItems.map(({ article, taxonomy }) => {
            const brief = getExternalResourceBrief(article);

            return (
              <article
                key={article.id}
                className="flex min-h-[240px] flex-col rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_14px_28px_rgba(37,31,74,0.05)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary/52">
                    <BrandIcon icon={getChannelIcon(taxonomy.channel)} size={12} />
                    <span className="truncate">{hostLabel(taxonomy)}</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(article.publishedAt)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <TaxonomyPill
                    icon={getChannelIcon(taxonomy.channel)}
                    label={taxonomy.channelLabel}
                    tone="channel"
                  />
                  <TaxonomyPill
                    icon={getCategoryIcon(taxonomy.category)}
                    label={taxonomy.categoryLabel}
                    tone="category"
                  />
                  <TaxonomyPill
                    icon={getSubcategoryIcon(taxonomy.subcategory)}
                    label={taxonomy.subcategoryLabel}
                    tone="subcategory"
                  />
                </div>

                <div className="mt-5 flex-1 space-y-3">
                  <h2 className="text-[1.05rem] font-extrabold leading-[1.28] tracking-[-0.03em] text-primary">
                    {article.title}
                  </h2>
                  <p className="text-[13px] leading-6 text-muted-foreground">
                    {brief?.overview ?? article.summary}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {article.toolTags.slice(0, 3).map((tag) => (
                    <TaxonomyPill
                      key={tag}
                      icon={
                        getTagIcon(tag) ?? {
                          type: "emoji",
                          value: "🏷️",
                          alt: tag,
                        }
                      }
                      label={tag}
                      tone="tag"
                    />
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/knowledge/${article.slug}`}>
                      노트 보기
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  {article.resourceUrl ? (
                    <Button asChild variant="secondary" size="sm">
                      <Link
                        href={article.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        원문
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-[1.8rem] border border-dashed border-[rgba(121,118,127,0.18)] bg-white px-6 py-10 text-center">
          <p className="text-base font-semibold text-primary">
            조건에 맞는 리소스가 없습니다.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 rounded-full px-4"
            onClick={resetFilters}
          >
            필터 초기화
          </Button>
        </section>
      )}
    </div>
  );
}

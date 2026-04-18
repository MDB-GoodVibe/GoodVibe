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

type FilterKind = "channel" | "category" | "subcategory" | "source";

function formatDate(value: string | null) {
  if (!value) {
    return "Latest update";
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
      value: "*",
      alt: "all",
    };
  }

  if (kind === "channel") {
    return getChannelIcon(value);
  }

  if (kind === "category") {
    return getCategoryIcon(value);
  }

  if (kind === "source") {
    return getChannelIcon("youtube");
  }

  return getSubcategoryIcon(value);
}

function getSourceFilterKey(article: KnowledgeArticle, taxonomy: ExternalResourceTaxonomy) {
  if (taxonomy.channel !== "youtube") {
    return null;
  }

  return article.externalSourceId ?? taxonomy.sourceName;
}

function getSourceFilterLabel(article: KnowledgeArticle, taxonomy: ExternalResourceTaxonomy) {
  if (taxonomy.channel !== "youtube") {
    return null;
  }

  return article.externalSourceLabel ?? taxonomy.sourceName;
}

function hostLabel(article: KnowledgeArticle, taxonomy: ExternalResourceTaxonomy) {
  if (taxonomy.channel === "youtube") {
    return (
      article.externalSourceLabel ??
      taxonomy.sourceName ??
      taxonomy.channelLabel
    );
  }

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
  const items = [{ value: "all", label: "All", count: totalCount }, ...options];

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

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {items.map((option) => {
          const selected = option.value === value;
          const icon = getFilterIcon(kind, option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border font-semibold transition",
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
  const [selectedSource, setSelectedSource] = useState("all");
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

  const channelSource = useMemo(
    () =>
      items.filter(
        ({ taxonomy }) =>
          selectedChannel === "all" || taxonomy.channel === selectedChannel,
      ),
    [items, selectedChannel],
  );

  const sourceOptions = useMemo(
    () =>
      buildOptions(
        channelSource
          .map(({ article, taxonomy }) => {
            const value = getSourceFilterKey(article, taxonomy);
            const label = getSourceFilterLabel(article, taxonomy);

            if (!value || !label) {
              return null;
            }

            return { value, label };
          })
          .filter((item): item is { value: string; label: string } => Boolean(item)),
      ),
    [channelSource],
  );

  const categorySource = useMemo(
    () =>
      channelSource.filter(({ article, taxonomy }) => {
        if (selectedChannel !== "youtube") {
          return true;
        }

        if (selectedSource === "all") {
          return true;
        }

        return getSourceFilterKey(article, taxonomy) === selectedSource;
      }),
    [channelSource, selectedChannel, selectedSource],
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
  const hasActiveFilters =
    selectedChannel !== "all" ||
    selectedSource !== "all" ||
    hasAdvancedSelection;
  const selectedCategoryLabel =
    categoryOptions.find((option) => option.value === selectedCategory)?.label ??
    null;
  const selectedSubcategoryLabel =
    subcategoryOptions.find((option) => option.value === selectedSubcategory)
      ?.label ?? null;
  const selectedSourceLabel =
    sourceOptions.find((option) => option.value === selectedSource)?.label ?? null;

  function handleChannelChange(value: string) {
    setSelectedChannel(value);
    setSelectedSource("all");
    setSelectedCategory("all");
    setSelectedSubcategory("all");
  }

  function handleSourceChange(value: string) {
    setSelectedSource(value);
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
    setSelectedSource("all");
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setShowAdvancedFilters(false);
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(250,247,239,0.96))] px-4 py-4 shadow-[0_14px_30px_rgba(37,31,74,0.05)] sm:rounded-[1.8rem] sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-[rgba(255,193,69,0.18)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">
              Resources
            </span>
            <h1 className="text-[clamp(1.2rem,1.6vw,1.5rem)] font-extrabold tracking-[-0.03em] text-primary">
              {title}
            </h1>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 text-sm lg:w-auto lg:justify-end">
            <span className="rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-3 py-1.5 text-xs font-semibold text-primary sm:px-3.5 sm:py-2 sm:text-sm">
              Resources {filteredItems.length}
            </span>
            <span className="rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-3 py-1.5 text-xs font-semibold text-primary sm:px-3.5 sm:py-2 sm:text-sm">
              Channels {channelOptions.length}
            </span>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full rounded-full px-3.5 sm:w-auto"
              onClick={() => setShowAdvancedFilters((current) => !current)}
            >
              <SlidersHorizontal className="size-3.5" />
              {showAdvancedFilters ? "Hide Filters" : "Show Filters"}
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
                className="inline-flex h-9 w-full items-center justify-center rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-3.5 text-sm font-semibold text-primary transition hover:border-[rgba(59,53,97,0.22)] hover:bg-[rgba(249,247,255,0.85)] sm:w-auto"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <FilterChipGroup
            label="Channel"
            kind="channel"
            value={selectedChannel}
            options={channelOptions}
            onChange={handleChannelChange}
            compact
            showSelectedLabel={false}
          />

          {!showAdvancedFilters && hasAdvancedSelection ? (
            <div className="flex flex-wrap gap-2">
              {selectedSourceLabel ? (
                <TaxonomyPill
                  icon={getChannelIcon("youtube")}
                  label={`Source ${selectedSourceLabel}`}
                  tone="channel"
                />
              ) : null}
              {selectedCategoryLabel ? (
                <TaxonomyPill
                  icon={getCategoryIcon(selectedCategory)}
                  label={`Category ${selectedCategoryLabel}`}
                  tone="category"
                />
              ) : null}
              {selectedSubcategoryLabel ? (
                <TaxonomyPill
                  icon={getSubcategoryIcon(selectedSubcategory)}
                  label={`Subcategory ${selectedSubcategoryLabel}`}
                  tone="subcategory"
                />
              ) : null}
            </div>
          ) : null}

          {selectedChannel === "youtube" && sourceOptions.length > 0 ? (
            <FilterChipGroup
              label="YouTube Channel"
              kind="source"
              value={selectedSource}
              options={sourceOptions}
              onChange={handleSourceChange}
              compact
            />
          ) : null}

          {showAdvancedFilters ? (
            <div className="rounded-[1.3rem] border border-[rgba(121,118,127,0.08)] bg-[rgba(250,249,249,0.78)] px-3.5 py-3.5 sm:rounded-[1.4rem] sm:px-4 sm:py-4">
              <div className="space-y-4">
                <FilterChipGroup
                  label="Category"
                  kind="category"
                  value={selectedCategory}
                  options={categoryOptions}
                  onChange={handleCategoryChange}
                  compact
                />
                <FilterChipGroup
                  label="Subcategory"
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
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredItems.map(({ article, taxonomy }) => {
            const brief = getExternalResourceBrief(article);

            return (
              <article
                key={article.id}
                className="flex min-h-[230px] flex-col rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(37,31,74,0.05)] sm:rounded-[1.8rem] sm:px-5 sm:py-5"
              >
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="flex min-w-0 items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary/52">
                    <BrandIcon icon={getChannelIcon(taxonomy.channel)} size={12} />
                    <span className="truncate">{hostLabel(article, taxonomy)}</span>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground sm:text-xs">
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
                  <h2 className="text-base font-extrabold leading-[1.28] tracking-[-0.03em] text-primary sm:text-[1.05rem]">
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
                          value: "*",
                          alt: tag,
                        }
                      }
                      label={tag}
                      tone="tag"
                    />
                  ))}
                </div>

                <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
                  <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                    <Link href={`/knowledge/${article.slug}?id=${article.id}`}>
                      Open Note
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  {article.resourceUrl ? (
                    <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
                      <Link
                        href={article.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Source
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
        <section className="rounded-[1.6rem] border border-dashed border-[rgba(121,118,127,0.18)] bg-white px-5 py-8 text-center sm:rounded-[1.8rem] sm:px-6 sm:py-10">
          <p className="text-base font-semibold text-primary">
            No resources match this filter.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 rounded-full px-4"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
        </section>
      )}
    </div>
  );
}

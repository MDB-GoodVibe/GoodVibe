import {
  fetchClaudeMarketplaceCatalog,
  fetchClaudeSkillsCatalog,
} from "@/lib/explore/claude-marketplaces";
import { marketplacesSnapshot, skillsSnapshot } from "@/lib/explore/snapshots";
import { fetchSkillsShCatalog } from "@/lib/explore/skills-sh";
import type {
  CatalogQuery,
  CatalogSourceSummary,
  ExploreApiResponse,
  ExternalCatalogItem,
} from "@/types/project";

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

function searchMatches(item: ExternalCatalogItem, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    item.title,
    item.summary,
    item.owner,
    item.repo,
    item.slug,
    ...item.tags,
    ...item.categories,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function dedupeCatalogItems(items: ExternalCatalogItem[]) {
  const sourcePriority: Record<ExternalCatalogItem["source"], number> = {
    "skills-sh": 1,
    "claude-marketplaces": 2,
  };
  const byIdentity = new Map<string, ExternalCatalogItem>();

  function normalizeToken(value: string) {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function normalizeSkillSlug(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }

    const parts = trimmed.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? trimmed;
  }

  function buildIdentity(item: ExternalCatalogItem) {
    if (item.kind !== "skills") {
      return `id:${item.id}`;
    }

    const normalizedSlug = normalizeToken(normalizeSkillSlug(item.slug));
    const normalizedTitle = normalizeToken(item.title);
    const normalizedOwner = normalizeToken(item.owner);

    if (normalizedSlug) {
      return `skills:slug:${normalizedSlug}`;
    }

    if (normalizedTitle) {
      return `skills:title:${normalizedTitle}`;
    }

    return `skills:owner:${normalizedOwner}`;
  }

  function pickPreferred(
    current: ExternalCatalogItem,
    incoming: ExternalCatalogItem,
  ) {
    const currentPriority = sourcePriority[current.source] ?? 0;
    const incomingPriority = sourcePriority[incoming.source] ?? 0;

    if (incomingPriority > currentPriority) {
      return incoming;
    }

    if (incomingPriority < currentPriority) {
      return current;
    }

    if (incoming.popularityValue > current.popularityValue) {
      return incoming;
    }

    return current;
  }

  for (const item of items) {
    const identity = buildIdentity(item);
    const existing = byIdentity.get(identity);

    if (!existing) {
      byIdentity.set(identity, item);
      continue;
    }

    byIdentity.set(identity, pickPreferred(existing, item));
  }

  return [...byIdentity.values()];
}

function filterBySource(
  items: ExternalCatalogItem[],
  source: CatalogQuery["source"],
) {
  if (!source || source === "all") {
    return items;
  }

  return items.filter((item) => item.source === source);
}

function sortItems(items: ExternalCatalogItem[], query: string) {
  return [...items].sort((left, right) => {
    const leftTitleMatch = left.title.toLowerCase().includes(query) ? 1 : 0;
    const rightTitleMatch = right.title.toLowerCase().includes(query) ? 1 : 0;

    if (rightTitleMatch !== leftTitleMatch) {
      return rightTitleMatch - leftTitleMatch;
    }

    if (right.popularityValue !== left.popularityValue) {
      return right.popularityValue - left.popularityValue;
    }

    return left.title.localeCompare(right.title);
  });
}

async function fetchSkillsCatalog(query: CatalogQuery) {
  const sourceSummaries: CatalogSourceSummary[] = [];
  const items: ExternalCatalogItem[] = [];
  let fallbackUsed = false;
  let stale = false;

  if (!query.source || query.source === "all" || query.source === "skills-sh") {
    try {
      items.push(...(await fetchSkillsShCatalog(query.sort ?? "popular")));
      sourceSummaries.push({
        id: "skills-sh",
        label: "skills.sh",
        kind: ["skills"],
        fallbackUsed: false,
      });
    } catch {
      fallbackUsed = true;
      stale = true;
      items.push(...skillsSnapshot.filter((item) => item.source === "skills-sh"));
      sourceSummaries.push({
        id: "skills-sh",
        label: "skills.sh",
        kind: ["skills"],
        fallbackUsed: true,
      });
    }
  }

  if (
    !query.source ||
    query.source === "all" ||
    query.source === "claude-marketplaces"
  ) {
    try {
      items.push(...(await fetchClaudeSkillsCatalog()));
      sourceSummaries.push({
        id: "claude-marketplaces",
        label: "Claude Marketplaces",
        kind: ["skills", "marketplaces"],
        fallbackUsed: false,
      });
    } catch {
      fallbackUsed = true;
      stale = true;
      items.push(
        ...skillsSnapshot.filter((item) => item.source === "claude-marketplaces"),
      );
      sourceSummaries.push({
        id: "claude-marketplaces",
        label: "Claude Marketplaces",
        kind: ["skills", "marketplaces"],
        fallbackUsed: true,
      });
    }
  }

  return {
    items,
    sourceSummaries,
    fallbackUsed,
    stale,
  };
}

async function fetchMarketplaceCatalog() {
  const sourceSummaries: CatalogSourceSummary[] = [];
  let fallbackUsed = false;
  let stale = false;
  let items: ExternalCatalogItem[] = [];

  try {
    items = await fetchClaudeMarketplaceCatalog();
    sourceSummaries.push({
      id: "claude-marketplaces",
      label: "Claude Marketplaces",
      kind: ["skills", "marketplaces"],
      fallbackUsed: false,
    });
  } catch {
    fallbackUsed = true;
    stale = true;
    items = marketplacesSnapshot;
    sourceSummaries.push({
      id: "claude-marketplaces",
      label: "Claude Marketplaces",
      kind: ["skills", "marketplaces"],
      fallbackUsed: true,
    });
  }

  return {
    items,
    sourceSummaries,
    fallbackUsed,
    stale,
  };
}

export async function getExploreCatalog(
  query: CatalogQuery,
): Promise<ExploreApiResponse> {
  const normalizedQuery = normalizeSearchText(query.q ?? "");
  const cappedLimit = Math.min(Math.max(query.limit ?? 18, 1), 60);

  const response =
    query.kind === "marketplaces"
      ? await fetchMarketplaceCatalog()
      : await fetchSkillsCatalog(query);

  const filteredItems = sortItems(
    dedupeCatalogItems(
      filterBySource(response.items, query.source).filter((item) =>
        searchMatches(item, normalizedQuery),
      ),
    ),
    normalizedQuery,
  ).slice(0, cappedLimit);

  return {
    items: filteredItems,
    sources: response.sourceSummaries,
    fetchedAt: new Date().toISOString(),
    stale: response.stale,
    fallbackUsed: response.fallbackUsed,
  };
}

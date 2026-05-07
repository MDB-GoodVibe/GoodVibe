import type { ExternalCatalogItem } from "@/types/project";

function parseRscPayloadStrings(html: string) {
  const payloads: string[] = [];
  const pattern = /self\.__next_f\.push\(\[1,("([\s\S]*?)")\]\)<\/script>/g;

  for (const match of html.matchAll(pattern)) {
    try {
      payloads.push(JSON.parse(match[1]) as string);
    } catch {
      continue;
    }
  }

  return payloads;
}

function extractJsonArray(payloads: string[], marker: string) {
  for (const payload of payloads) {
    const markerIndex = payload.indexOf(marker);

    if (markerIndex < 0) {
      continue;
    }

    const arrayStart = payload.indexOf("[", markerIndex);

    if (arrayStart < 0) {
      continue;
    }

    let depth = 0;
    let inString = false;
    let isEscaped = false;

    for (let index = arrayStart; index < payload.length; index += 1) {
      const character = payload[index];

      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (character === "\\") {
        isEscaped = true;
        continue;
      }

      if (character === '"') {
        inString = !inString;
        continue;
      }

      if (inString) {
        continue;
      }

      if (character === "[") {
        depth += 1;
      } else if (character === "]") {
        depth -= 1;

        if (depth === 0) {
          const arrayText = payload.slice(arrayStart, index + 1);
          return JSON.parse(arrayText) as Record<string, unknown>[];
        }
      }
    }
  }

  return [];
}

function formatCompactNumber(value: number) {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getSlugTail(slug: string) {
  const parts = slug.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? slug;
}

function toSkillSummary(input: {
  title: string;
  repo: string;
  installs: number;
  stars: number;
}) {
  const installsText = input.installs > 0 ? formatCompactNumber(input.installs) : "0";
  const starsText = input.stars > 0 ? formatCompactNumber(input.stars) : "0";

  return `${input.repo} 저장소 기반의 ${input.title} 스킬입니다. 커뮤니티 지표 기준 설치 ${installsText}, 스타 ${starsText} 수준이며, 실무 작업 자동화를 위해 재사용 가능한 스킬 패턴을 제공합니다.`;
}

export function parseClaudeSkillsFromHtml(html: string): ExternalCatalogItem[] {
  const payloads = parseRscPayloadStrings(html);
  const skills = extractJsonArray(payloads, '"skills":[');

  return skills.reduce<ExternalCatalogItem[]>((items, entry) => {
    const repo = String(entry.repo ?? "");
    const [owner = ""] = repo.split("/");
    const rawSlug = String(entry.path ?? entry.name ?? "");
    const slug = getSlugTail(rawSlug);
    const installs = Number(entry.installs ?? 0);
    const stars = Number(entry.stars ?? 0);
    const title = String(entry.name ?? slug);

    if (!title || !repo) {
      return items;
    }

    items.push({
      id: `claude-marketplaces:skills:${repo}/${slug}`,
      kind: "skills",
      source: "claude-marketplaces",
      sourceLabel: "Claude Marketplaces",
      title,
      summary: toSkillSummary({ title, repo, installs, stars }),
      owner,
      repo,
      slug,
      url: `https://claudemarketplaces.com/skills/${slug}`,
      repoUrl: `https://github.com/${repo}`,
      installCommand:
        typeof entry.installCommand === "string"
          ? entry.installCommand
          : undefined,
      tags: [...new Set(`${title} ${repo}`.split(/[-/\s]+/).filter(Boolean))],
      categories: ["community"],
      popularityValue: installs > 0 ? installs : stars,
      popularityLabel:
        installs > 0
          ? `${formatCompactNumber(installs)} installs`
          : `${formatCompactNumber(stars)} stars`,
    });

    return items;
  }, []);
}

export function parseClaudeMarketplacesFromHtml(
  html: string,
): ExternalCatalogItem[] {
  const payloads = parseRscPayloadStrings(html);
  const marketplaces = extractJsonArray(payloads, '"marketplaces":[');

  return marketplaces.reduce<ExternalCatalogItem[]>((items, entry) => {
    const repo = String(entry.repo ?? "");
    const [owner = ""] = repo.split("/");
    const slug = String(entry.slug ?? "");
    const title = repo || slug;
    const pluginCount = Number(entry.pluginCount ?? 0);
    const stars = Number(entry.stars ?? 0);
    const categories = Array.isArray(entry.categories)
      ? entry.categories.map((category) => String(category))
      : [];
    const tags = Array.isArray(entry.pluginKeywords)
      ? entry.pluginKeywords.slice(0, 12).map((keyword) => String(keyword))
      : [];

    if (!repo || !slug) {
      return items;
    }

    items.push({
      id: `claude-marketplaces:marketplace:${repo}`,
      kind: "marketplaces",
      source: "claude-marketplaces",
      sourceLabel: "Claude Marketplaces",
      title,
      summary: `${repo} 관련 플러그인을 모아두는 마켓플레이스 항목입니다. 포함 플러그인 ${pluginCount}개, 저장소 스타 ${formatCompactNumber(stars)} 기준으로 정렬됩니다.`,
      owner,
      repo,
      slug,
      url: `https://claudemarketplaces.com/plugins/${slug}`,
      repoUrl: `https://github.com/${repo}`,
      tags,
      categories,
      popularityValue: stars + pluginCount * 1_000,
      popularityLabel: `${pluginCount} plugins / ${formatCompactNumber(stars)} stars`,
    });

    return items;
  }, []);
}

export async function fetchClaudeSkillsCatalog() {
  const response = await fetch("https://claudemarketplaces.com/skills", {
    next: {
      revalidate: 21_600,
    },
  });

  if (!response.ok) {
    throw new Error(
      `claudemarketplaces skills request failed with status ${response.status}`,
    );
  }

  const html = await response.text();
  return parseClaudeSkillsFromHtml(html);
}

export async function fetchClaudeMarketplaceCatalog() {
  const response = await fetch("https://claudemarketplaces.com/marketplaces", {
    next: {
      revalidate: 21_600,
    },
  });

  if (!response.ok) {
    throw new Error(
      `claudemarketplaces marketplaces request failed with status ${response.status}`,
    );
  }

  const html = await response.text();
  return parseClaudeMarketplacesFromHtml(html);
}

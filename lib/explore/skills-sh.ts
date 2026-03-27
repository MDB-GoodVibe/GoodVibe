import * as cheerio from "cheerio";

import type { CatalogSort, ExternalCatalogItem } from "@/types/project";

const skillsShListPathMap: Record<CatalogSort, string> = {
  popular: "/",
  trending: "/trending",
  hot: "/hot",
};

function parseCompactNumber(value: string) {
  const normalizedValue = value.replaceAll(",", "").trim().toUpperCase();
  const multiplier = normalizedValue.endsWith("M")
    ? 1_000_000
    : normalizedValue.endsWith("K")
      ? 1_000
      : 1;
  const numericValue = Number.parseFloat(normalizedValue.replace(/[MK]$/, ""));

  if (Number.isNaN(numericValue)) {
    return 0;
  }

  return Math.round(numericValue * multiplier);
}

function toTitleSummary(skillName: string, repo: string) {
  const name = skillName.replaceAll("-", " ");
  return `${repo}에서 제공하는 ${name} 관련 인기 스킬입니다.`;
}

export function parseSkillsShList(
  html: string,
  sort: CatalogSort = "popular",
): ExternalCatalogItem[] {
  const $ = cheerio.load(html);
  const items: ExternalCatalogItem[] = [];
  const seen = new Set<string>();

  $('a[href^="/"]').each((_, element) => {
    const href = $(element).attr("href") ?? "";
    const segments = href.split("/").filter(Boolean);

    if (segments.length !== 3) {
      return;
    }

    const [owner, repoName, skillSlug] = segments;
    const repo = `${owner}/${repoName}`;
    const title = $(element).find("h3").first().text().trim();
    const popularityText = $(element).find("span").last().text().trim();
    const repoText = $(element).find("p").first().text().trim();
    const id = `skills-sh:${repo}/${skillSlug}`;

    if (!title || !repoText || !popularityText || seen.has(id)) {
      return;
    }

    seen.add(id);
    items.push({
      id,
      kind: "skills",
      source: "skills-sh",
      sourceLabel: "skills.sh",
      title,
      summary: toTitleSummary(title, repoText),
      owner,
      repo,
      slug: skillSlug,
      url: `https://skills.sh${href}`,
      repoUrl: `https://github.com/${repo}`,
      installCommand: `npx skills add https://github.com/${repo} --skill ${skillSlug}`,
      tags: [...new Set(skillSlug.split("-"))],
      categories: sort === "popular" ? ["인기"] : [sort],
      popularityValue: parseCompactNumber(popularityText),
      popularityLabel: `${popularityText} 설치`,
    });
  });

  return items;
}

export async function fetchSkillsShCatalog(sort: CatalogSort = "popular") {
  const path = skillsShListPathMap[sort];
  const response = await fetch(`https://skills.sh${path}`, {
    next: {
      revalidate: 21_600,
    },
  });

  if (!response.ok) {
    throw new Error(`skills.sh request failed with status ${response.status}`);
  }

  const html = await response.text();
  return parseSkillsShList(html, sort);
}

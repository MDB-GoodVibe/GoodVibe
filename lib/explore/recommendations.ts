import { getSelectedServiceType } from "@/lib/workspace-draft-store";
import type {
  ExternalCatalogItem,
  WorkspaceDraft,
  WorkspaceSection,
} from "@/types/project";

const ideaStopwords = new Set([
  "the",
  "and",
  "with",
  "from",
  "into",
  "that",
  "this",
  "have",
  "will",
  "user",
  "users",
  "service",
  "app",
  "web",
  "for",
  "your",
  "project",
  "screen",
  "feature",
  "idea",
  "서비스",
  "화면",
  "기능",
  "프로젝트",
  "사용자",
]);

function extractIdeaKeywords(idea: string) {
  return idea
    .toLowerCase()
    .split(/[^\p{L}\p{N}-]+/u)
    .filter((keyword) => keyword.length >= 2 && !ideaStopwords.has(keyword))
    .slice(0, 10);
}

function buildDraftKeywords(draft: WorkspaceDraft, section: WorkspaceSection) {
  const selectedServiceType = getSelectedServiceType(draft);
  const keywords = new Set<string>(extractIdeaKeywords(draft.idea));

  if (selectedServiceType) {
    keywords.add(selectedServiceType.name.toLowerCase());

    for (const tag of selectedServiceType.tags) {
      keywords.add(tag.toLowerCase());
    }
  }

  if (draft.options.design === "standard") {
    keywords.add("shadcn");
    keywords.add("ui");
  } else {
    keywords.add("design");
    keywords.add("frontend");
    keywords.add("brand");
  }

  if (draft.options.environment === "local") {
    keywords.add("local");
    keywords.add("cli");
    keywords.add("workflow");
  } else {
    keywords.add("cloud");
    keywords.add("deployment");
  }

  if (draft.options.budget === "free") {
    keywords.add("free");
    keywords.add("open-source");
  }

  if (section === "prompts") {
    keywords.add("prompt");
    keywords.add("workflow");
  }

  if (section === "skills") {
    keywords.add("cli");
    keywords.add("install");
    keywords.add("tooling");
  }

  if (section === "architecture") {
    keywords.add("architecture");
    keywords.add("design");
  }

  return [...keywords];
}

function getItemScore(
  item: ExternalCatalogItem,
  keywords: string[],
  section: WorkspaceSection,
) {
  const haystack = [
    item.title,
    item.summary,
    item.repo,
    item.slug,
    ...item.tags,
    ...item.categories,
  ]
    .join(" ")
    .toLowerCase();

  let score = Math.log10(item.popularityValue + 10);

  for (const keyword of keywords) {
    if (haystack.includes(keyword)) {
      score += 3;
    }
  }

  if (section === "architecture" && item.kind === "skills") {
    score += 1;
  }

  if (section === "prompts" && item.installCommand) {
    score += 1.5;
  }

  if (section === "skills" && item.installCommand) {
    score += 1.8;
  }

  if (item.source === "skills-sh" && section !== "projects") {
    score += 0.5;
  }

  return score;
}

export function rankCatalogItemsForDraft(
  draft: WorkspaceDraft,
  items: ExternalCatalogItem[],
  section: WorkspaceSection,
) {
  const keywords = buildDraftKeywords(draft, section);

  return [...items].sort((left, right) => {
    const leftScore = getItemScore(left, keywords, section);
    const rightScore = getItemScore(right, keywords, section);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return right.popularityValue - left.popularityValue;
  });
}

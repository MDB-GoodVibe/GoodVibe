import type {
  ExternalResourceCategory,
  ExternalResourceChannel,
  ExternalResourceConfidence,
  ExternalResourceTaxonomy,
  KnowledgeArticle,
} from "@/types/good-vibe";

type ClassificationInput = {
  url?: string | null;
  title?: string | null;
  summary?: string | null;
  details?: string | null;
  platformTags?: string[] | null;
  toolTags?: string[] | null;
};

type ChannelMatch = {
  channel: ExternalResourceChannel;
  label: string;
  score: number;
  matchedSignals: string[];
};

type SubcategoryRule = {
  id: string;
  label: string;
  keywords: string[];
};

type CategoryRule = {
  id: ExternalResourceCategory;
  label: string;
  keywords: string[];
  subcategories: SubcategoryRule[];
};

type SourceHint = {
  hostPatterns: string[];
  pathPatterns?: string[];
  category: ExternalResourceCategory;
  subcategory?: string;
};

const knownSources: Record<string, string> = {
  "code.claude.com": "Claude Code",
  "developers.openai.com": "OpenAI Docs",
  "docs.cursor.com": "Cursor Docs",
  "supabase.com": "Supabase",
  "nextjs.org": "Next.js",
  "vercel.com": "Vercel",
  "docs.anthropic.com": "Anthropic Docs",
  "anthropic.com": "Anthropic",
  "openai.com": "OpenAI",
  "github.com": "GitHub",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "x.com": "X",
  "twitter.com": "X",
  "threads.net": "Threads",
};

const channelRules: Array<{
  channel: ExternalResourceChannel;
  label: string;
  hostPatterns: string[];
  pathPatterns?: string[];
  textPatterns?: string[];
}> = [
  {
    channel: "youtube",
    label: "YouTube",
    hostPatterns: ["youtube.com", "youtu.be"],
  },
  {
    channel: "x",
    label: "X",
    hostPatterns: ["x.com", "twitter.com"],
  },
  {
    channel: "threads",
    label: "Threads",
    hostPatterns: ["threads.net"],
  },
  {
    channel: "github",
    label: "GitHub",
    hostPatterns: ["github.com", "gist.github.com"],
  },
  {
    channel: "docs",
    label: "Docs",
    hostPatterns: [
      "docs.",
      "developers.",
      "developer.",
      "help.",
      "support.",
      "code.claude.com",
    ],
    pathPatterns: ["/docs", "/guide", "/guides", "/kb", "/learn"],
  },
  {
    channel: "blog",
    label: "Blog",
    hostPatterns: [
      "blog.",
      "medium.com",
      "substack.com",
      "hashnode.com",
      "velog.io",
      "dev.to",
      "tistory.com",
      "brunch.co.kr",
      "wordpress.com",
      "ghost.io",
    ],
    pathPatterns: ["/blog", "/posts", "/post", "/article", "/articles"],
  },
  {
    channel: "news",
    label: "News Site",
    hostPatterns: [
      "techcrunch.com",
      "theverge.com",
      "wired.com",
      "venturebeat.com",
      "arstechnica.com",
      "zdnet.com",
      "reuters.com",
      "bloomberg.com",
      "news.",
    ],
    pathPatterns: ["/news"],
  },
  {
    channel: "community",
    label: "Community",
    hostPatterns: ["reddit.com", "discord.com", "discord.gg", "forum.", "community."],
    textPatterns: ["community", "forum", "reddit", "discord"],
  },
];

const categoryRules: CategoryRule[] = [
  {
    id: "ai-agent",
    label: "AI Agent",
    keywords: [
      "agent",
      "ai agent",
      "claude",
      "codex",
      "gemini",
      "cursor",
      "windsurf",
      "anthropic",
      "openai",
      "llm",
      "assistant",
    ],
    subcategories: [
      { id: "claude", label: "Claude", keywords: ["claude", "anthropic", "code.claude.com"] },
      { id: "codex", label: "Codex", keywords: ["codex"] },
      { id: "gemini", label: "Gemini", keywords: ["gemini"] },
      { id: "cursor", label: "Cursor", keywords: ["cursor"] },
      { id: "windsurf", label: "Windsurf", keywords: ["windsurf"] },
      { id: "openai", label: "OpenAI", keywords: ["openai", "responses api", "assistants"] },
    ],
  },
  {
    id: "deploy",
    label: "Deploy",
    keywords: [
      "deploy",
      "deployment",
      "hosting",
      "production",
      "preview",
      "vercel",
      "cloudflare",
      "netlify",
      "render",
      "docker",
      "aws",
    ],
    subcategories: [
      { id: "vercel", label: "Vercel", keywords: ["vercel"] },
      { id: "cloudflare", label: "Cloudflare", keywords: ["cloudflare", "workers", "pages"] },
      { id: "netlify", label: "Netlify", keywords: ["netlify"] },
      { id: "render", label: "Render", keywords: ["render"] },
      { id: "docker", label: "Docker", keywords: ["docker", "container"] },
      { id: "aws", label: "AWS", keywords: ["aws", "amazon web services"] },
    ],
  },
  {
    id: "database",
    label: "Database",
    keywords: [
      "database",
      "db",
      "sql",
      "postgres",
      "postgresql",
      "supabase",
      "prisma",
      "drizzle",
      "sqlite",
      "mysql",
      "mongodb",
      "local db",
    ],
    subcategories: [
      { id: "supabase", label: "Supabase", keywords: ["supabase"] },
      { id: "postgres", label: "Postgres", keywords: ["postgres", "postgresql"] },
      { id: "sqlite", label: "SQLite", keywords: ["sqlite", "local db"] },
      { id: "mysql", label: "MySQL", keywords: ["mysql"] },
      { id: "mongodb", label: "MongoDB", keywords: ["mongodb", "mongo"] },
      { id: "prisma", label: "Prisma", keywords: ["prisma"] },
      { id: "drizzle", label: "Drizzle", keywords: ["drizzle"] },
    ],
  },
  {
    id: "web",
    label: "Web",
    keywords: [
      "web",
      "frontend",
      "ui",
      "react",
      "next.js",
      "nextjs",
      "vite",
      "tailwind",
      "javascript",
      "typescript",
      "router",
      "ssr",
    ],
    subcategories: [
      { id: "nextjs", label: "Next.js", keywords: ["next.js", "nextjs"] },
      { id: "react", label: "React", keywords: ["react"] },
      { id: "vite", label: "Vite", keywords: ["vite"] },
      { id: "tailwind", label: "Tailwind", keywords: ["tailwind"] },
      { id: "vue", label: "Vue", keywords: ["vue"] },
      { id: "svelte", label: "Svelte", keywords: ["svelte"] },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    keywords: [
      "automation",
      "workflow",
      "orchestration",
      "trigger",
      "cron",
      "pipeline",
      "n8n",
      "zapier",
      "make.com",
      "github actions",
    ],
    subcategories: [
      { id: "n8n", label: "n8n", keywords: ["n8n"] },
      { id: "zapier", label: "Zapier", keywords: ["zapier"] },
      { id: "make", label: "Make", keywords: ["make.com", "integromat"] },
      { id: "github-actions", label: "GitHub Actions", keywords: ["github actions"] },
      { id: "cron", label: "Cron", keywords: ["cron", "scheduled"] },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    keywords: [
      "backend",
      "api",
      "server",
      "auth",
      "queue",
      "rpc",
      "rest",
      "graphql",
      "node.js",
      "nodejs",
      "express",
      "nest",
    ],
    subcategories: [
      { id: "auth", label: "Auth", keywords: ["auth", "oauth", "login"] },
      { id: "api", label: "API", keywords: ["api", "rest", "graphql", "rpc"] },
      { id: "node", label: "Node.js", keywords: ["node.js", "nodejs"] },
      { id: "express", label: "Express", keywords: ["express"] },
      { id: "nest", label: "NestJS", keywords: ["nest", "nestjs"] },
    ],
  },
  {
    id: "design",
    label: "Design",
    keywords: [
      "design",
      "ui",
      "ux",
      "figma",
      "brand",
      "typography",
      "layout",
      "motion",
      "visual",
    ],
    subcategories: [
      { id: "figma", label: "Figma", keywords: ["figma"] },
      { id: "ui", label: "UI", keywords: ["ui", "interface"] },
      { id: "ux", label: "UX", keywords: ["ux", "user experience"] },
      { id: "branding", label: "Branding", keywords: ["brand", "branding"] },
    ],
  },
  {
    id: "productivity",
    label: "Productivity",
    keywords: [
      "productivity",
      "testing",
      "debugging",
      "git",
      "github",
      "workflow tips",
      "developer workflow",
      "review",
    ],
    subcategories: [
      { id: "git", label: "Git", keywords: ["git", "github"] },
      { id: "testing", label: "Testing", keywords: ["testing", "test"] },
      { id: "debugging", label: "Debugging", keywords: ["debugging", "debug"] },
      { id: "review", label: "Code Review", keywords: ["review"] },
    ],
  },
];

const sourceHints: SourceHint[] = [
  {
    hostPatterns: ["code.claude.com", "docs.anthropic.com", "anthropic.com"],
    category: "ai-agent",
    subcategory: "claude",
  },
  {
    hostPatterns: ["developers.openai.com", "openai.com"],
    category: "ai-agent",
    subcategory: "openai",
  },
  {
    hostPatterns: ["docs.cursor.com", "cursor.com"],
    category: "ai-agent",
    subcategory: "cursor",
  },
  {
    hostPatterns: ["vercel.com"],
    pathPatterns: ["/guides", "/docs", "/kb"],
    category: "deploy",
    subcategory: "vercel",
  },
  {
    hostPatterns: ["cloudflare.com", "developers.cloudflare.com"],
    category: "deploy",
    subcategory: "cloudflare",
  },
  {
    hostPatterns: ["supabase.com"],
    category: "database",
    subcategory: "supabase",
  },
  {
    hostPatterns: ["nextjs.org"],
    category: "web",
    subcategory: "nextjs",
  },
];

function cleanText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function slugToLabel(value: string) {
  return value
    .split(/[-_/]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function dedupe(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function safeUrlParts(url: string | null | undefined) {
  const value = cleanText(url);

  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    return {
      hostname: parsed.hostname.toLowerCase(),
      pathname: parsed.pathname.toLowerCase(),
      href: parsed.href,
    };
  } catch {
    return null;
  }
}

function countKeywordMatches(text: string, keywords: string[]) {
  let score = 0;
  const matchedSignals: string[] = [];

  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      score += keyword.includes(".") || keyword.includes(" ") ? 2 : 1;
      matchedSignals.push(keyword);
    }
  }

  return { score, matchedSignals };
}

function matchesSourceHint(
  hostname: string,
  pathname: string,
  hint: SourceHint,
) {
  const hostMatch = hint.hostPatterns.some(
    (hostPattern) =>
      hostname === hostPattern || hostname.endsWith(`.${hostPattern}`) || hostname.includes(hostPattern),
  );

  if (!hostMatch) {
    return false;
  }

  if (!hint.pathPatterns || hint.pathPatterns.length === 0) {
    return true;
  }

  return hint.pathPatterns.some((pathPattern) => pathname.includes(pathPattern));
}

function detectChannel(input: ClassificationInput): ChannelMatch {
  const urlParts = safeUrlParts(input.url);
  const hostname = urlParts?.hostname ?? "";
  const pathname = urlParts?.pathname ?? "";
  const text = [
    cleanText(input.title),
    cleanText(input.summary),
    cleanText(input.details),
    ...(input.platformTags ?? []),
    ...(input.toolTags ?? []),
    hostname,
    pathname,
  ]
    .join(" ")
    .toLowerCase();

  const matches = channelRules
    .map((rule) => {
      let score = 0;
      const matchedSignals: string[] = [];

      for (const hostPattern of rule.hostPatterns) {
        if (hostname === hostPattern || hostname.endsWith(`.${hostPattern}`) || hostname.includes(hostPattern)) {
          score += 4;
          matchedSignals.push(hostPattern);
        }
      }

      for (const pathPattern of rule.pathPatterns ?? []) {
        if (pathname.includes(pathPattern)) {
          score += 2;
          matchedSignals.push(pathPattern);
        }
      }

      for (const textPattern of rule.textPatterns ?? []) {
        if (text.includes(textPattern)) {
          score += 1;
          matchedSignals.push(textPattern);
        }
      }

      return {
        channel: rule.channel,
        label: rule.label,
        score,
        matchedSignals: dedupe(matchedSignals),
      };
    })
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score);

  return (
    matches[0] ?? {
      channel: "other",
      label: "Other",
      score: 0,
      matchedSignals: [],
    }
  );
}

function detectCategory(input: ClassificationInput) {
  const urlParts = safeUrlParts(input.url);
  const hostname = urlParts?.hostname ?? "";
  const pathname = urlParts?.pathname ?? "";
  const text = [
    cleanText(input.title),
    cleanText(input.summary),
    cleanText(input.details),
    ...(input.platformTags ?? []),
    ...(input.toolTags ?? []),
    hostname,
    pathname,
  ]
    .join(" ")
    .toLowerCase();
  const matchedSourceHints = sourceHints.filter((hint) =>
    matchesSourceHint(hostname, pathname, hint),
  );

  const categoryMatches = categoryRules
    .map((category) => {
      const categoryMatch = countKeywordMatches(text, category.keywords);
      const subcategoryMatches = category.subcategories
        .map((subcategory) => {
          const subcategoryMatch = countKeywordMatches(text, subcategory.keywords);
          return {
            ...subcategory,
            score: subcategoryMatch.score,
            matchedSignals: subcategoryMatch.matchedSignals,
          };
        })
        .sort((left, right) => right.score - left.score);
      const matchingHints = matchedSourceHints.filter(
        (hint) => hint.category === category.id,
      );
        const hintForSubcategory = matchingHints.find((hint) =>
          category.subcategories.some(
            (subcategory) => subcategory.id === hint.subcategory,
          ),
        );
        const leadSubcategory = subcategoryMatches[0];
        const hintedSubcategory = hintForSubcategory
          ? category.subcategories.find(
              (subcategory) => subcategory.id === hintForSubcategory.subcategory,
            )
          : null;
        const effectiveSubcategory =
          hintForSubcategory && hintedSubcategory
            ? {
                ...hintedSubcategory,
                score: Math.max(
                  subcategoryMatches.find(
                    (subcategory) => subcategory.id === hintedSubcategory.id,
                  )?.score ?? 0,
                  2,
                ),
                matchedSignals: dedupe([
                  ...(leadSubcategory?.matchedSignals ?? []),
                  ...hintForSubcategory.hostPatterns,
                ]),
              }
            : leadSubcategory;
      const score =
        categoryMatch.score +
        (effectiveSubcategory?.score ?? 0) * 2 +
        matchingHints.length * 5;

      return {
        id: category.id,
        label: category.label,
        score,
        matchedSignals: dedupe([
          ...categoryMatch.matchedSignals,
          ...(effectiveSubcategory?.matchedSignals ?? []),
          ...matchingHints.flatMap((hint) => hint.hostPatterns),
        ]),
          subcategory:
            effectiveSubcategory && effectiveSubcategory.score > 0
              ? {
                  id: effectiveSubcategory.id,
                  label: effectiveSubcategory.label,
                matchedSignals: effectiveSubcategory.matchedSignals,
              }
            : null,
      };
    })
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score);

  return (
    categoryMatches[0] ?? {
      id: "general" as const,
      label: "General",
      score: 0,
      matchedSignals: [],
      subcategory: null,
    }
  );
}

function inferConfidence(channelScore: number, categoryScore: number): ExternalResourceConfidence {
  if (channelScore >= 4 && categoryScore >= 4) {
    return "high";
  }

  if (channelScore >= 2 || categoryScore >= 2) {
    return "medium";
  }

  return "low";
}

function fallbackSourceName(domain: string) {
  if (!domain) {
    return "External Resource";
  }

  const normalizedDomain = domain.replace(/^www\./, "");
  const knownSource = knownSources[normalizedDomain];

  if (knownSource) {
    return knownSource;
  }

  const sourceToken = normalizedDomain.split(".")[0] ?? normalizedDomain;
  return slugToLabel(sourceToken);
}

export function classifyExternalResource(
  input: ClassificationInput,
): ExternalResourceTaxonomy | null {
  const urlParts = safeUrlParts(input.url);
  const hasSignals =
    Boolean(urlParts?.href) ||
    Boolean(cleanText(input.title)) ||
    Boolean(cleanText(input.summary)) ||
    Boolean(cleanText(input.details)) ||
    Boolean(input.platformTags?.length) ||
    Boolean(input.toolTags?.length);

  if (!hasSignals) {
    return null;
  }

  const channel = detectChannel(input);
  const category = detectCategory(input);
  const domain = urlParts?.hostname.replace(/^www\./, "") ?? "";
  const sourceName = fallbackSourceName(domain);

  return {
    channel: channel.channel,
    channelLabel: channel.label,
    category: category.id,
    categoryLabel: category.label,
    subcategory: category.subcategory?.id ?? "general",
    subcategoryLabel: category.subcategory?.label ?? "General",
    sourceName,
    domain,
    autoClassified: true,
    confidence: inferConfidence(channel.score, category.score),
    matchedSignals: dedupe([...channel.matchedSignals, ...category.matchedSignals]).slice(0, 8),
  };
}

export function getExternalTaxonomy(article: Pick<
  KnowledgeArticle,
  "externalTaxonomy" | "resourceUrl" | "title" | "summary" | "platformTags" | "toolTags"
>) {
  return (
    article.externalTaxonomy ??
    classifyExternalResource({
      url: article.resourceUrl,
      title: article.title,
      summary: article.summary,
      platformTags: article.platformTags,
      toolTags: article.toolTags,
    })
  );
}

export function formatExternalTaxonomyPath(taxonomy: ExternalResourceTaxonomy | null) {
  if (!taxonomy) {
    return "Other / General / General";
  }

  return [
    taxonomy.channelLabel,
    taxonomy.categoryLabel,
    taxonomy.subcategoryLabel,
  ].join(" / ");
}

export function extractKnowledgePreview(contentMd: string, limit = 180) {
  const plain = contentMd
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#+\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^- /gm, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) {
    return "";
  }

  return plain.length > limit ? `${plain.slice(0, limit).trim()}...` : plain;
}

type ExternalCategoryGroup = {
  taxonomy: ExternalResourceTaxonomy;
  articles: KnowledgeArticle[];
};

type ExternalChannelGroup = {
  taxonomy: ExternalResourceTaxonomy;
  articles: KnowledgeArticle[];
  categories: Map<string, ExternalCategoryGroup>;
};

export function groupExternalArticlesByChannel(articles: KnowledgeArticle[]) {
  const groups = new Map<string, ExternalChannelGroup>();

  for (const article of articles) {
    const taxonomy =
      getExternalTaxonomy(article) ??
      classifyExternalResource({
        title: article.title,
        summary: article.summary,
        platformTags: article.platformTags,
        toolTags: article.toolTags,
      });

      if (!taxonomy) {
        continue;
      }

      const channelKey = taxonomy.channel;
      const categoryKey = `${taxonomy.channel}:${taxonomy.category}:${taxonomy.subcategory}`;
      const channelGroup: ExternalChannelGroup = groups.get(channelKey) ?? {
        taxonomy,
        articles: [],
        categories: new Map<string, ExternalCategoryGroup>(),
      };

      channelGroup.articles.push(article);

      const categoryGroup: ExternalCategoryGroup =
        channelGroup.categories.get(categoryKey) ?? {
        taxonomy,
        articles: [],
        };

    categoryGroup.articles.push(article);
    channelGroup.categories.set(categoryKey, categoryGroup);
    groups.set(channelKey, channelGroup);
  }

  return Array.from(groups.values())
    .sort((left, right) => right.articles.length - left.articles.length)
    .map((channelGroup) => ({
      ...channelGroup,
      categories: Array.from(channelGroup.categories.values()).sort(
        (left, right) => right.articles.length - left.articles.length,
      ),
    }));
}

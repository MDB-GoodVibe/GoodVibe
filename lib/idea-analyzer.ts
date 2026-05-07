import type {
  IdeaAnalysisInput,
  IdeaAnalysisResult,
  ServiceTypeId,
  ServiceTypeRecommendation,
} from "@/types/project";

const serviceTypeCatalog: Record<
  ServiceTypeId,
  Omit<ServiceTypeRecommendation, "fitReason">
> = {
  utility: {
    id: "utility",
    name: "Utility Tool",
    summary: "Small focused tool that solves a single task quickly.",
    complexity: "low",
    tags: ["mvp", "simple", "single-purpose"],
  },
  landing: {
    id: "landing",
    name: "Landing Page",
    summary: "Marketing or conversion page with CTA and lead capture.",
    complexity: "low",
    tags: ["marketing", "cta", "lead"],
  },
  "web-service": {
    id: "web-service",
    name: "Web Service",
    summary: "Full web product with account flow, dashboard, and data.",
    complexity: "medium",
    tags: ["auth", "dashboard", "database"],
  },
  "data-tool": {
    id: "data-tool",
    name: "Data Tool",
    summary: "Upload/process/analyze data with structured output.",
    complexity: "medium",
    tags: ["analysis", "files", "report"],
  },
  "content-generator": {
    id: "content-generator",
    name: "Content Generator",
    summary: "Transforms prompts into reusable generated content.",
    complexity: "medium",
    tags: ["ai", "generation", "drafting"],
  },
  app: {
    id: "app",
    name: "Mobile App",
    summary: "Mobile-first product with engagement-centric UX.",
    complexity: "high",
    tags: ["mobile", "notifications", "camera"],
  },
};

const keywordRules: Record<ServiceTypeId, string[]> = {
  utility: ["tool", "converter", "checklist", "helper", "assistant"],
  landing: ["landing", "promotion", "inquiry", "reservation", "brand"],
  "web-service": ["dashboard", "account", "login", "admin", "database", "auth"],
  "data-tool": ["csv", "upload", "analyze", "analytics", "report", "chart"],
  "content-generator": ["generate", "draft", "content", "template", "copy"],
  app: ["mobile", "ios", "android", "push", "camera", "location"],
};

function normalizeInput(input: IdeaAnalysisInput) {
  const planning = input.planningBrief;
  if (!planning) {
    return input.idea.trim();
  }

  const planningText = [
    planning.problem,
    planning.targetUser,
    planning.userJourney,
    planning.mvpScope,
    planning.successCriteria,
    planning.constraints,
  ]
    .filter(Boolean)
    .join(" ");

  return `${planningText} ${input.idea}`.trim();
}

function containsAny(text: string, keywords: string[]) {
  return keywords.filter((keyword) => text.includes(keyword));
}

function deriveKeyNeeds(normalizedIdea: string) {
  const baseNeeds = [
    "Define one clear first action the user can take in under 10 seconds.",
    "Show the core value before asking for complex setup.",
    "Keep iteration loops short with measurable checkpoints.",
  ];

  if (normalizedIdea.includes("auth") || normalizedIdea.includes("login")) {
    baseNeeds[1] = "Include account lifecycle and permission boundaries early.";
  }

  if (normalizedIdea.includes("api") || normalizedIdea.includes("integration")) {
    baseNeeds[2] =
      "Define API reliability and fallback behavior before implementation.";
  }

  return baseNeeds;
}

function deriveNextQuestions(primaryTypeId?: ServiceTypeId) {
  const common = [
    "What is the single most important user outcome in week one?",
    "Which metric will decide whether this MVP should continue?",
  ];

  if (primaryTypeId === "web-service") {
    return [...common, "What account and role model is needed on day one?"];
  }

  if (primaryTypeId === "data-tool") {
    return [...common, "What data format and volume must be supported first?"];
  }

  return [...common, "What feature should be explicitly out of scope for v1?"];
}

export function analyzeIdea(input: IdeaAnalysisInput): IdeaAnalysisResult {
  const normalizedIdea = normalizeInput(input);
  const lowerIdea = normalizedIdea.toLowerCase();

  const rankedServiceTypes = Object.values(serviceTypeCatalog)
    .map((serviceType) => {
      const matchedKeywords = containsAny(lowerIdea, keywordRules[serviceType.id]);
      let score = matchedKeywords.length * 3;

      if (input.prioritizeFreeTools && serviceType.complexity !== "high") {
        score += 1;
      }

      if (lowerIdea.length > 140 && serviceType.id === "web-service") {
        score += 1;
      }

      return {
        ...serviceType,
        score,
        matchedKeywords,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((serviceType) => ({
      id: serviceType.id,
      name: serviceType.name,
      summary: serviceType.summary,
      complexity: serviceType.complexity,
      tags: serviceType.tags,
      fitReason:
        serviceType.matchedKeywords.length > 0
          ? `Detected signals: ${serviceType.matchedKeywords.slice(0, 3).join(", ")}.`
          : "This option provides the most balanced starting point for the current brief.",
    }));

  return {
    normalizedIdea,
    confidenceLabel: normalizedIdea.length > 100 ? "high" : "normal",
    keyNeeds: deriveKeyNeeds(lowerIdea),
    nextQuestions: deriveNextQuestions(rankedServiceTypes[0]?.id),
    serviceTypes: rankedServiceTypes,
  };
}

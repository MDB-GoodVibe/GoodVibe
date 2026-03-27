export type ServiceTypeId =
  | "utility"
  | "landing"
  | "web-service"
  | "data-tool"
  | "content-generator"
  | "app";

export type ProjectComplexity = "가벼움" | "중간" | "높음";
export type BudgetPreference = "free" | "flexible";
export type DesignPreference = "standard" | "custom";
export type BuildEnvironment = "local" | "cloud";
export type AnalysisConfidence = "보통" | "높음";
export type ProjectStatus = "draft" | "ready" | "mock-live";

export interface ArchitectureOptions {
  budget: BudgetPreference;
  design: DesignPreference;
  environment: BuildEnvironment;
}

export interface ArchitectureHighlight {
  label: string;
  value: string;
}

export interface ServiceTypeRecommendation {
  id: ServiceTypeId;
  name: string;
  summary: string;
  fitReason: string;
  complexity: ProjectComplexity;
  tags: string[];
}

export interface IdeaAnalysisInput {
  idea: string;
  projectName?: string;
  prioritizeFreeTools?: boolean;
}

export interface IdeaAnalysisResult {
  normalizedIdea: string;
  confidenceLabel: AnalysisConfidence;
  keyNeeds: string[];
  nextQuestions: string[];
  serviceTypes: ServiceTypeRecommendation[];
}

export interface PromptGeneratorInput {
  idea: string;
  projectName?: string;
  serviceType: string;
  serviceTypeId?: ServiceTypeId;
  budget: BudgetPreference;
  design: DesignPreference;
  environment: BuildEnvironment;
  selectedSkills?: SelectedSkill[];
}

export interface PromptStage {
  stage: 1 | 2 | 3 | 4;
  title: string;
  objective: string;
  prompt: string;
  checklist: string[];
}

export interface ArchitectureBlueprint {
  title: string;
  summary: string;
  mermaid: string;
  highlights: ArchitectureHighlight[];
  stack: string[];
}

export interface ProjectChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface SelectedSkill {
  id: string;
  title: string;
  sourceLabel: string;
  summary: string;
  url: string;
  repoUrl?: string;
  installCommand?: string;
  tags: string[];
  popularityLabel: string;
}

export interface SavedProject {
  id: string;
  title: string;
  idea: string;
  sourceIdeaId?: string | null;
  sourceIdeaTitle?: string | null;
  ownerUserId?: string | null;
  serviceTypeId: ServiceTypeId;
  serviceTypeLabel: string;
  options: ArchitectureOptions;
  architecture: ArchitectureBlueprint;
  promptStages: PromptStage[];
  keyNeeds: string[];
  nextQuestions: string[];
  checklist: ProjectChecklistItem[];
  status: ProjectStatus;
  updatedAt: string;
  source: "mock" | "supabase";
}

export interface ProjectRecord {
  title: string;
  serviceType: ServiceTypeId;
  techOptions: ArchitectureOptions;
  flowChartData: string;
}

export type WorkspaceSection =
  | "idea"
  | "architecture"
  | "skills"
  | "prompts"
  | "explore"
  | "projects";

export interface DraftCompletionState {
  idea: boolean;
  architecture: boolean;
  skills: boolean;
  prompts: boolean;
}

export interface WorkspaceDraft {
  projectName: string;
  idea: string;
  sourceIdeaId: string | null;
  sourceIdeaTitle: string | null;
  analysis: IdeaAnalysisResult | null;
  selectedTypeId: ServiceTypeId | null;
  options: ArchitectureOptions;
  architecture: ArchitectureBlueprint | null;
  selectedSkills: SelectedSkill[];
  promptStages: PromptStage[];
  activePromptStage: PromptStage["stage"];
  lastVisitedSection: WorkspaceSection;
  updatedAt: string | null;
}

export type CatalogKind = "skills" | "marketplaces";
export type CatalogSource = "skills-sh" | "claude-marketplaces";
export type CatalogSourceFilter = "all" | CatalogSource;
export type CatalogSort = "popular" | "trending" | "hot";

export interface CatalogQuery {
  kind: CatalogKind;
  q?: string;
  source?: CatalogSourceFilter;
  sort?: CatalogSort;
  limit?: number;
}

export interface CatalogSourceSummary {
  id: CatalogSource;
  label: string;
  kind: CatalogKind[];
  fallbackUsed: boolean;
}

export interface ExternalCatalogItem {
  id: string;
  kind: CatalogKind;
  source: CatalogSource;
  sourceLabel: string;
  title: string;
  summary: string;
  owner: string;
  repo: string;
  slug: string;
  url: string;
  repoUrl?: string;
  installCommand?: string;
  tags: string[];
  categories: string[];
  popularityValue: number;
  popularityLabel: string;
}

export interface ExploreApiResponse {
  items: ExternalCatalogItem[];
  sources: CatalogSourceSummary[];
  fetchedAt: string;
  stale: boolean;
  fallbackUsed: boolean;
}

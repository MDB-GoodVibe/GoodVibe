import { generateArchitectureBlueprint } from "@/lib/architecture-generator";
import { analyzeIdea } from "@/lib/idea-analyzer";
import { buildMockProject } from "@/lib/mock-project-store";
import { generatePromptStages } from "@/lib/prompt-generator";
import type {
  ArchitectureOptions,
  DraftCompletionState,
  PlanningBrief,
  SavedProject,
  SelectedSkill,
  ServiceTypeRecommendation,
  WorkspaceDraft,
  WorkspaceSection,
} from "@/types/project";

const WORKSPACE_DRAFT_KEY = "vibe-coding-helper.workspace-draft";
const DEFAULT_PROMPT_STAGE: WorkspaceDraft["activePromptStage"] = 1;

const defaultOptions: ArchitectureOptions = {
  budget: "free",
  design: "standard",
  environment: "local",
};

const defaultPlanningBrief: PlanningBrief = {
  problem: "",
  targetUser: "",
  userJourney: "",
  mvpScope: "",
  outOfScope: "",
  successCriteria: "",
  constraints: "",
};

function normalizeToken(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function getSkillIdentity(skill: SelectedSkill) {
  const normalizedId = normalizeToken(skill.id);
  const idParts = normalizedId.split(":");
  const trailingId = idParts[idParts.length - 1] ?? normalizedId;
  const idSlug = trailingId.split("/").pop() ?? trailingId;
  const normalizedTitle = normalizeToken(skill.title);
  return idSlug || normalizedTitle;
}

export function createEmptyWorkspaceDraft(): WorkspaceDraft {
  return {
    projectName: "",
    idea: "",
    planningBrief: { ...defaultPlanningBrief },
    superpowersStatus: "not_installed",
    sourceIdeaId: null,
    sourceIdeaTitle: null,
    analysis: null,
    selectedTypeId: null,
    options: defaultOptions,
    architecture: null,
    selectedSkills: [],
    promptStages: [],
    activePromptStage: DEFAULT_PROMPT_STAGE,
    lastVisitedSection: "planning",
    updatedAt: null,
  };
}

export function getSelectedServiceType(draft: WorkspaceDraft) {
  return (
    draft.analysis?.serviceTypes.find(
      (serviceType) => serviceType.id === draft.selectedTypeId,
    ) ?? null
  );
}

function hasPlanningBriefInput(planningBrief: PlanningBrief) {
  const values = Object.values(planningBrief);
  return values.some((value) => value.trim().length > 0);
}

function recomputeDerivedArtifacts(draft: WorkspaceDraft): WorkspaceDraft {
  const selectedServiceType = getSelectedServiceType(draft);

  if (!selectedServiceType || !draft.idea.trim()) {
    return {
      ...draft,
      architecture: null,
      promptStages: [],
      activePromptStage: DEFAULT_PROMPT_STAGE,
    };
  }

  const architecture = generateArchitectureBlueprint({
    idea: draft.idea,
    projectName: draft.projectName,
    serviceType: selectedServiceType.name,
    serviceTypeId: selectedServiceType.id,
    budget: draft.options.budget,
    design: draft.options.design,
    environment: draft.options.environment,
  });

  const promptStages = generatePromptStages({
    idea: draft.idea,
    projectName: draft.projectName,
    serviceType: selectedServiceType.name,
    serviceTypeId: selectedServiceType.id,
    budget: draft.options.budget,
    design: draft.options.design,
    environment: draft.options.environment,
    selectedSkills: draft.selectedSkills,
    planningBrief: draft.planningBrief,
    superpowersStatus: draft.superpowersStatus,
  });

  const hasActivePrompt = promptStages.some(
    (stage) => stage.stage === draft.activePromptStage,
  );

  return {
    ...draft,
    architecture,
    promptStages,
    activePromptStage: hasActivePrompt
      ? draft.activePromptStage
      : (promptStages[0]?.stage ?? DEFAULT_PROMPT_STAGE),
  };
}

export function hydrateWorkspaceDraft(
  value?: Partial<WorkspaceDraft> | null,
): WorkspaceDraft {
  const base = createEmptyWorkspaceDraft();
  const draft: WorkspaceDraft = {
    ...base,
    ...value,
    options: {
      ...base.options,
      ...(value?.options ?? {}),
    },
    planningBrief: {
      ...base.planningBrief,
      ...(value?.planningBrief ?? {}),
    },
    superpowersStatus: value?.superpowersStatus ?? base.superpowersStatus,
    analysis: value?.analysis ?? null,
    architecture: value?.architecture ?? null,
    promptStages: value?.promptStages ?? [],
    activePromptStage: value?.activePromptStage ?? DEFAULT_PROMPT_STAGE,
    lastVisitedSection: value?.lastVisitedSection ?? "planning",
    sourceIdeaId: value?.sourceIdeaId ?? null,
    sourceIdeaTitle: value?.sourceIdeaTitle ?? null,
    selectedTypeId: value?.selectedTypeId ?? null,
    selectedSkills: value?.selectedSkills ?? [],
    updatedAt: value?.updatedAt ?? null,
  };

  return recomputeDerivedArtifacts(draft);
}

export function createAnalyzedWorkspaceDraft(
  draft: WorkspaceDraft,
  currentSection: WorkspaceSection = draft.lastVisitedSection,
) {
  if (!draft.idea.trim()) {
    return hydrateWorkspaceDraft({
      ...draft,
      lastVisitedSection: currentSection,
    });
  }

  const analysis = analyzeIdea({
    idea: draft.idea,
    projectName: draft.projectName,
    prioritizeFreeTools: draft.options.budget === "free",
    planningBrief: draft.planningBrief,
  });

  return hydrateWorkspaceDraft({
    ...draft,
    analysis,
    selectedTypeId: analysis.serviceTypes[0]?.id ?? null,
    lastVisitedSection: currentSection,
    updatedAt: new Date().toISOString(),
  });
}

export function updateWorkspacePlanningBrief(
  draft: WorkspaceDraft,
  partialBrief: Partial<PlanningBrief>,
  currentSection: WorkspaceSection = "planning",
) {
  return hydrateWorkspaceDraft({
    ...draft,
    planningBrief: {
      ...draft.planningBrief,
      ...partialBrief,
    },
    analysis: null,
    selectedTypeId: null,
    selectedSkills: [],
    lastVisitedSection: currentSection,
    updatedAt: new Date().toISOString(),
  });
}

export function updateSuperpowersStatus(
  draft: WorkspaceDraft,
  status: WorkspaceDraft["superpowersStatus"],
  currentSection: WorkspaceSection = "planning",
) {
  return hydrateWorkspaceDraft({
    ...draft,
    superpowersStatus: status,
    lastVisitedSection: currentSection,
    updatedAt: new Date().toISOString(),
  });
}

export function updateWorkspaceIdea(
  draft: WorkspaceDraft,
  idea: string,
  currentSection: WorkspaceSection = "idea",
) {
  const hasMeaningfulChange = idea !== draft.idea;
  return hydrateWorkspaceDraft({
    ...draft,
    idea,
    analysis: hasMeaningfulChange ? null : draft.analysis,
    selectedTypeId: hasMeaningfulChange ? null : draft.selectedTypeId,
    selectedSkills: hasMeaningfulChange ? [] : draft.selectedSkills,
    lastVisitedSection: currentSection,
    updatedAt: new Date().toISOString(),
  });
}

export function importWorkspaceIdeaSource(
  draft: WorkspaceDraft,
  input: {
    sourceIdeaId: string;
    sourceIdeaTitle: string;
    idea: string;
  },
  currentSection: WorkspaceSection = "idea",
) {
  return hydrateWorkspaceDraft({
    ...draft,
    projectName: draft.projectName.trim() || input.sourceIdeaTitle,
    idea: input.idea,
    sourceIdeaId: input.sourceIdeaId,
    sourceIdeaTitle: input.sourceIdeaTitle,
    analysis: null,
    selectedTypeId: null,
    selectedSkills: [],
    lastVisitedSection: currentSection,
    updatedAt: new Date().toISOString(),
  });
}

export function updateWorkspaceProjectName(
  draft: WorkspaceDraft,
  projectName: string,
  currentSection: WorkspaceSection = draft.lastVisitedSection,
) {
  return hydrateWorkspaceDraft({
    ...draft,
    projectName,
    lastVisitedSection: currentSection,
    updatedAt: new Date().toISOString(),
  });
}

export function updateWorkspaceOptions(
  draft: WorkspaceDraft,
  partialOptions: Partial<ArchitectureOptions>,
  currentSection: WorkspaceSection = draft.lastVisitedSection,
) {
  return hydrateWorkspaceDraft({
    ...draft,
    options: {
      ...draft.options,
      ...partialOptions,
    },
    lastVisitedSection: currentSection,
    updatedAt: new Date().toISOString(),
  });
}

export function selectWorkspaceServiceType(
  draft: WorkspaceDraft,
  selectedTypeId: WorkspaceDraft["selectedTypeId"],
  currentSection: WorkspaceSection = draft.lastVisitedSection,
) {
  return hydrateWorkspaceDraft({
    ...draft,
    selectedTypeId,
    selectedSkills: [],
    lastVisitedSection: currentSection,
    updatedAt: new Date().toISOString(),
  });
}

export function setWorkspacePromptStage(
  draft: WorkspaceDraft,
  stage: WorkspaceDraft["activePromptStage"],
  currentSection: WorkspaceSection = draft.lastVisitedSection,
) {
  return hydrateWorkspaceDraft({
    ...draft,
    activePromptStage: stage,
    lastVisitedSection: currentSection,
    updatedAt: new Date().toISOString(),
  });
}

export function toggleWorkspaceSkill(
  draft: WorkspaceDraft,
  skill: SelectedSkill,
  currentSection: WorkspaceSection = "skills",
) {
  const targetIdentity = getSkillIdentity(skill);
  const exists = draft.selectedSkills.some(
    (item) => getSkillIdentity(item) === targetIdentity,
  );

  return hydrateWorkspaceDraft({
    ...draft,
    selectedSkills: exists
      ? draft.selectedSkills.filter(
          (item) => getSkillIdentity(item) !== targetIdentity,
        )
      : [...draft.selectedSkills, skill],
    lastVisitedSection: currentSection,
    updatedAt: new Date().toISOString(),
  });
}

export function clearWorkspaceSkills(
  draft: WorkspaceDraft,
  currentSection: WorkspaceSection = "skills",
) {
  return hydrateWorkspaceDraft({
    ...draft,
    selectedSkills: [],
    lastVisitedSection: currentSection,
    updatedAt: new Date().toISOString(),
  });
}

export function setWorkspaceSection(
  draft: WorkspaceDraft,
  section: WorkspaceSection,
) {
  return hydrateWorkspaceDraft({
    ...draft,
    lastVisitedSection: section,
    updatedAt: new Date().toISOString(),
  });
}

export function canUseDraftStorage() {
  return typeof window !== "undefined";
}

export function loadWorkspaceDraft() {
  if (!canUseDraftStorage()) {
    return createEmptyWorkspaceDraft();
  }

  const rawValue = window.localStorage.getItem(WORKSPACE_DRAFT_KEY);
  if (!rawValue) {
    return createEmptyWorkspaceDraft();
  }

  try {
    return hydrateWorkspaceDraft(JSON.parse(rawValue) as WorkspaceDraft);
  } catch {
    return createEmptyWorkspaceDraft();
  }
}

export function persistWorkspaceDraft(draft: WorkspaceDraft) {
  if (!canUseDraftStorage()) {
    return;
  }

  window.localStorage.setItem(
    WORKSPACE_DRAFT_KEY,
    JSON.stringify({
      ...draft,
      updatedAt: new Date().toISOString(),
    }),
  );
}

export function clearWorkspaceDraft() {
  if (!canUseDraftStorage()) {
    return;
  }
  window.localStorage.removeItem(WORKSPACE_DRAFT_KEY);
}

export function getDraftCompletionState(
  draft: WorkspaceDraft,
): DraftCompletionState {
  const planningDone =
    hasPlanningBriefInput(draft.planningBrief) &&
    draft.superpowersStatus !== "not_installed";

  return {
    planning: planningDone,
    idea: Boolean(draft.idea.trim() && draft.analysis && draft.selectedTypeId),
    architecture: Boolean(draft.architecture),
    skills: Boolean(draft.architecture),
    prompts: draft.promptStages.length > 0,
  };
}

export function buildSavedProjectFromDraft(draft: WorkspaceDraft) {
  const selectedServiceType = getSelectedServiceType(draft);
  if (!draft.analysis || !selectedServiceType || !draft.architecture) {
    return null;
  }

  return buildMockProject({
    title: draft.projectName.trim() || `${selectedServiceType.name} Project`,
    idea: draft.idea,
    sourceIdeaId: draft.sourceIdeaId,
    sourceIdeaTitle: draft.sourceIdeaTitle,
    serviceTypeId: selectedServiceType.id,
    serviceTypeLabel: selectedServiceType.name,
    options: draft.options,
    architecture: draft.architecture,
    promptStages: draft.promptStages,
    keyNeeds: draft.analysis.keyNeeds,
    nextQuestions: draft.analysis.nextQuestions,
    planningBrief: draft.planningBrief,
    superpowersStatus: draft.superpowersStatus,
  });
}

export function createWorkspaceSummary(draft: WorkspaceDraft) {
  const selectedServiceType = getSelectedServiceType(draft);

  return {
    title: draft.projectName.trim() || draft.sourceIdeaTitle || "Untitled",
    idea: draft.idea.trim(),
    serviceType: selectedServiceType?.name ?? "Not selected",
    updatedAt: draft.updatedAt,
  };
}

export function getRecommendedServiceKeywords(
  serviceType: ServiceTypeRecommendation | null,
) {
  if (!serviceType) {
    return [];
  }
  return [serviceType.name, ...serviceType.tags].filter(Boolean);
}

export function isWorkspaceDraftReadyToSave(draft: WorkspaceDraft) {
  return Boolean(buildSavedProjectFromDraft(draft));
}

export type SavedWorkspaceProject = SavedProject;

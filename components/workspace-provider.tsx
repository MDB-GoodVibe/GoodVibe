"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { saveBrowserProject } from "@/lib/repositories/helper-projects";
import {
  buildSavedProjectFromDraft,
  clearWorkspaceDraft,
  createAnalyzedWorkspaceDraft,
  createEmptyWorkspaceDraft,
  createWorkspaceSummary,
  getDraftCompletionState,
  getSelectedServiceType,
  hydrateWorkspaceDraft,
  importWorkspaceIdeaSource,
  isWorkspaceDraftReadyToSave,
  loadWorkspaceDraft,
  persistWorkspaceDraft,
  clearWorkspaceSkills,
  selectWorkspaceServiceType,
  setWorkspacePromptStage,
  setWorkspaceSection,
  toggleWorkspaceSkill,
  updateWorkspaceIdea,
  updateWorkspaceOptions,
  updateWorkspaceProjectName,
} from "@/lib/workspace-draft-store";
import type {
  ArchitectureOptions,
  SavedProject,
  SelectedSkill,
  WorkspaceDraft,
  WorkspaceSection,
} from "@/types/project";

interface WorkspaceContextValue {
  draft: WorkspaceDraft;
  isHydrated: boolean;
  completion: ReturnType<typeof getDraftCompletionState>;
  selectedServiceType: ReturnType<typeof getSelectedServiceType>;
  savedProjectId: string | null;
  summary: ReturnType<typeof createWorkspaceSummary>;
  isReadyToSave: boolean;
  isSavingProject: boolean;
  setProjectName: (value: string, section?: WorkspaceSection) => void;
  setIdea: (value: string, section?: WorkspaceSection) => void;
  analyzeIdea: (section?: WorkspaceSection) => void;
  selectServiceType: (
    serviceTypeId: WorkspaceDraft["selectedTypeId"],
    section?: WorkspaceSection,
  ) => void;
  updateOptions: (
    options: Partial<ArchitectureOptions>,
    section?: WorkspaceSection,
  ) => void;
  setPromptStage: (
    stage: WorkspaceDraft["activePromptStage"],
    section?: WorkspaceSection,
  ) => void;
  toggleSkill: (skill: SelectedSkill, section?: WorkspaceSection) => void;
  clearSkills: (section?: WorkspaceSection) => void;
  visitSection: (section: WorkspaceSection) => void;
  importIdeaSource: (input: {
    sourceIdeaId: string;
    sourceIdeaTitle: string;
    idea: string;
  }) => void;
  saveProject: () => Promise<SavedProject | null>;
  resetDraft: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<WorkspaceDraft>(createEmptyWorkspaceDraft());
  const [isHydrated, setIsHydrated] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);

  useEffect(() => {
    setDraft(loadWorkspaceDraft());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    persistWorkspaceDraft(draft);
  }, [draft, isHydrated]);

  const completion = getDraftCompletionState(draft);
  const selectedServiceType = getSelectedServiceType(draft);
  const summary = createWorkspaceSummary(draft);
  const isReadyToSave = isWorkspaceDraftReadyToSave(draft);

  const value: WorkspaceContextValue = {
    draft,
    isHydrated,
    completion,
    selectedServiceType,
    savedProjectId,
    summary,
    isReadyToSave,
    isSavingProject,
    setProjectName(nextProjectName, section = draft.lastVisitedSection) {
      setDraft((currentDraft) =>
        updateWorkspaceProjectName(currentDraft, nextProjectName, section),
      );
    },
    setIdea(nextIdea, section = "idea") {
      setSavedProjectId(null);
      setDraft((currentDraft) =>
        updateWorkspaceIdea(currentDraft, nextIdea, section),
      );
    },
    analyzeIdea(section = "idea") {
      setSavedProjectId(null);
      setDraft((currentDraft) =>
        createAnalyzedWorkspaceDraft(currentDraft, section),
      );
    },
    selectServiceType(serviceTypeId, section = draft.lastVisitedSection) {
      setSavedProjectId(null);
      setDraft((currentDraft) =>
        selectWorkspaceServiceType(currentDraft, serviceTypeId, section),
      );
    },
    updateOptions(options, section = draft.lastVisitedSection) {
      setSavedProjectId(null);
      setDraft((currentDraft) =>
        updateWorkspaceOptions(currentDraft, options, section),
      );
    },
    setPromptStage(stage, section = draft.lastVisitedSection) {
      setDraft((currentDraft) =>
        setWorkspacePromptStage(currentDraft, stage, section),
      );
    },
    toggleSkill(skill, section = "skills") {
      setSavedProjectId(null);
      setDraft((currentDraft) =>
        toggleWorkspaceSkill(currentDraft, skill, section),
      );
    },
    clearSkills(section = "skills") {
      setSavedProjectId(null);
      setDraft((currentDraft) => clearWorkspaceSkills(currentDraft, section));
    },
    visitSection(section) {
      setDraft((currentDraft) => {
        if (currentDraft.lastVisitedSection === section) {
          return currentDraft;
        }

        return setWorkspaceSection(currentDraft, section);
      });
    },
    importIdeaSource(input) {
      setSavedProjectId(null);
      setDraft((currentDraft) =>
        importWorkspaceIdeaSource(currentDraft, input, "idea"),
      );
    },
    async saveProject() {
      const builtProject = buildSavedProjectFromDraft(draft);

      if (!builtProject) {
        return null;
      }

      setIsSavingProject(true);

      try {
        const savedProject = await saveBrowserProject(builtProject);
        setSavedProjectId(savedProject.id);

        setDraft((currentDraft) =>
          hydrateWorkspaceDraft({
            ...currentDraft,
            updatedAt: new Date().toISOString(),
          }),
        );

        return savedProject;
      } finally {
        setIsSavingProject(false);
      }
    },
    resetDraft() {
      setSavedProjectId(null);
      clearWorkspaceDraft();
      setDraft(createEmptyWorkspaceDraft());
    },
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider.");
  }

  return context;
}

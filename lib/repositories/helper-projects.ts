import {
  getMockProject,
  listMockProjects,
  saveMockProject,
  toggleMockChecklistItem,
  updateMockProjectStatus,
} from "@/lib/mock-project-store";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type {
  ProjectChecklistItem,
  ProjectStatus,
  SavedProject,
} from "@/types/project";

type HelperProjectRow = {
  id: string;
  user_id: string;
  source_idea_id: string | null;
  title: string;
  idea: string;
  service_type_id: string;
  service_type_label: string;
  options_json: SavedProject["options"];
  architecture_json: SavedProject["architecture"];
  prompt_stages_json: SavedProject["promptStages"];
  checklist_json: ProjectChecklistItem[];
  key_needs_json: string[];
  next_questions_json: string[];
  status: ProjectStatus;
  updated_at: string;
  ideas?: { title?: string | null } | Array<{ title?: string | null }> | null;
};

async function getBrowserProjectContext() {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return { supabase, user };
}

function getIdeaJoinTitle(
  ideas: HelperProjectRow["ideas"],
  fallbackTitle?: string | null,
) {
  if (!ideas) {
    return fallbackTitle ?? null;
  }

  if (Array.isArray(ideas)) {
    return ideas[0]?.title ?? fallbackTitle ?? null;
  }

  return ideas.title ?? fallbackTitle ?? null;
}

function normalizeRow(
  row: HelperProjectRow,
  fallbackTitle?: string | null,
): SavedProject {
  return {
    id: row.id,
    ownerUserId: row.user_id,
    title: row.title,
    idea: row.idea,
    sourceIdeaId: row.source_idea_id,
    sourceIdeaTitle: getIdeaJoinTitle(row.ideas, fallbackTitle),
    serviceTypeId: row.service_type_id as SavedProject["serviceTypeId"],
    serviceTypeLabel: row.service_type_label,
    options: row.options_json,
    architecture: row.architecture_json,
    promptStages: row.prompt_stages_json,
    checklist: row.checklist_json,
    keyNeeds: row.key_needs_json,
    nextQuestions: row.next_questions_json,
    status: row.status,
    updatedAt: row.updated_at,
    source: "supabase",
  };
}

function serializeProject(project: SavedProject, userId: string) {
  return {
    id: project.id,
    user_id: userId,
    source_idea_id: project.sourceIdeaId ?? null,
    title: project.title,
    idea: project.idea,
    service_type_id: project.serviceTypeId,
    service_type_label: project.serviceTypeLabel,
    options_json: project.options,
    architecture_json: project.architecture,
    prompt_stages_json: project.promptStages,
    checklist_json: project.checklist,
    key_needs_json: project.keyNeeds,
    next_questions_json: project.nextQuestions,
    status: project.status,
  };
}

export async function listBrowserProjects() {
  const context = await getBrowserProjectContext();

  if (!context) {
    return listMockProjects();
  }

  const { data, error } = await context.supabase
    .from("helper_projects")
    .select(
      "id,user_id,source_idea_id,title,idea,service_type_id,service_type_label,options_json,architecture_json,prompt_stages_json,checklist_json,key_needs_json,next_questions_json,status,updated_at,ideas(title)",
    )
    .eq("user_id", context.user.id)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return listMockProjects();
  }

  return data.map((row) => normalizeRow(row));
}

export async function getBrowserProject(projectId: string) {
  const context = await getBrowserProjectContext();

  if (!context) {
    return getMockProject(projectId);
  }

  const { data, error } = await context.supabase
    .from("helper_projects")
    .select(
      "id,user_id,source_idea_id,title,idea,service_type_id,service_type_label,options_json,architecture_json,prompt_stages_json,checklist_json,key_needs_json,next_questions_json,status,updated_at,ideas(title)",
    )
    .eq("id", projectId)
    .eq("user_id", context.user.id)
    .maybeSingle();

  if (error || !data) {
    return getMockProject(projectId);
  }

  return normalizeRow(data);
}

export async function saveBrowserProject(project: SavedProject) {
  const context = await getBrowserProjectContext();

  if (!context) {
    return saveMockProject(project);
  }

  const { data, error } = await context.supabase
    .from("helper_projects")
    .upsert(serializeProject(project, context.user.id))
    .select(
      "id,user_id,source_idea_id,title,idea,service_type_id,service_type_label,options_json,architecture_json,prompt_stages_json,checklist_json,key_needs_json,next_questions_json,status,updated_at",
    )
    .single();

  if (error || !data) {
    return saveMockProject(project);
  }

  return normalizeRow(data, project.sourceIdeaTitle ?? null);
}

export async function updateBrowserProjectStatus(
  projectId: string,
  status: ProjectStatus,
) {
  const context = await getBrowserProjectContext();

  if (!context) {
    return updateMockProjectStatus(projectId, status);
  }

  const { data, error } = await context.supabase
    .from("helper_projects")
    .update({ status })
    .eq("id", projectId)
    .eq("user_id", context.user.id)
    .select(
      "id,user_id,source_idea_id,title,idea,service_type_id,service_type_label,options_json,architecture_json,prompt_stages_json,checklist_json,key_needs_json,next_questions_json,status,updated_at,ideas(title)",
    )
    .maybeSingle();

  if (error || !data) {
    return updateMockProjectStatus(projectId, status);
  }

  return normalizeRow(data);
}

export async function toggleBrowserProjectChecklistItem(
  projectId: string,
  itemId: string,
) {
  const context = await getBrowserProjectContext();

  if (!context) {
    return toggleMockChecklistItem(projectId, itemId);
  }

  const current = await getBrowserProject(projectId);

  if (!current) {
    return null;
  }

  const nextChecklist = current.checklist.map((item) =>
    item.id === itemId ? { ...item, done: !item.done } : item,
  );

  const { data, error } = await context.supabase
    .from("helper_projects")
    .update({ checklist_json: nextChecklist })
    .eq("id", projectId)
    .eq("user_id", context.user.id)
    .select(
      "id,user_id,source_idea_id,title,idea,service_type_id,service_type_label,options_json,architecture_json,prompt_stages_json,checklist_json,key_needs_json,next_questions_json,status,updated_at,ideas(title)",
    )
    .maybeSingle();

  if (error || !data) {
    return toggleMockChecklistItem(projectId, itemId);
  }

  return normalizeRow(data);
}

import { generateArchitectureBlueprint } from "@/lib/architecture-generator";
import { generatePromptStages } from "@/lib/prompt-generator";
import type {
  ArchitectureOptions,
  ProjectChecklistItem,
  ProjectStatus,
  SavedProject,
  ServiceTypeId,
} from "@/types/project";

const STORAGE_KEY = "vibe-coding-helper.mock-projects";

function createChecklist(): ProjectChecklistItem[] {
  return [
    { id: "idea", label: "아이디어 방향 확인", done: true },
    { id: "architecture", label: "구조 옵션 정리", done: true },
    { id: "prompts", label: "프롬프트 검토", done: false },
    { id: "handoff", label: "빌드 시작 준비", done: false },
  ];
}

function createSeedProjects(): SavedProject[] {
  const idea =
    "카페 메뉴를 소개하고 예약 문의를 받으면 운영자가 요청 내용을 쉽게 확인할 수 있는 간단한 웹 서비스를 만들고 싶어요.";

  const architecture = generateArchitectureBlueprint({
    idea,
    projectName: "카페 예약 랜딩",
    serviceType: "웹 서비스",
    serviceTypeId: "web-service",
    budget: "free",
    design: "standard",
    environment: "local",
  });

  return [
    {
      id: "seed-cafe-launch",
      title: "카페 예약 랜딩",
      idea,
      serviceTypeId: "web-service",
      serviceTypeLabel: "웹 서비스",
      options: {
        budget: "free",
        design: "standard",
        environment: "local",
      },
      architecture,
      promptStages: generatePromptStages({
        idea,
        projectName: "카페 예약 랜딩",
        serviceType: "웹 서비스",
        serviceTypeId: "web-service",
        budget: "free",
        design: "standard",
        environment: "local",
      }),
      keyNeeds: [
        "문의에서 예약으로 이어지는 전환 흐름",
        "처음 방문한 사람도 이해하기 쉬운 첫 화면",
        "운영자가 관리하기 쉬운 간단한 관리자 흐름",
      ],
      nextQuestions: [
        "예약까지 받을 건가요, 아니면 문의만 먼저 받을 건가요?",
        "운영자가 메뉴와 소개 문구를 직접 수정해야 할까요?",
      ],
      checklist: createChecklist(),
      status: "draft",
      updatedAt: new Date("2026-03-19T10:00:00.000Z").toISOString(),
      source: "mock",
    },
  ];
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function persistProjects(projects: SavedProject[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function ensureProjects() {
  if (!canUseStorage()) {
    return createSeedProjects();
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    const seededProjects = createSeedProjects();
    persistProjects(seededProjects);
    return seededProjects;
  }

  try {
    return JSON.parse(rawValue) as SavedProject[];
  } catch {
    const seededProjects = createSeedProjects();
    persistProjects(seededProjects);
    return seededProjects;
  }
}

export function listMockProjects() {
  return ensureProjects().sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

export function getMockProject(projectId: string) {
  return ensureProjects().find((project) => project.id === projectId) ?? null;
}

export function buildMockProject(input: {
  title: string;
  idea: string;
  sourceIdeaId?: string | null;
  sourceIdeaTitle?: string | null;
  serviceTypeId: ServiceTypeId;
  serviceTypeLabel: string;
  options: ArchitectureOptions;
  architecture: SavedProject["architecture"];
  promptStages: SavedProject["promptStages"];
  keyNeeds: string[];
  nextQuestions: string[];
}): SavedProject {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `mock-${Date.now()}`,
    title: input.title,
    idea: input.idea,
    sourceIdeaId: input.sourceIdeaId ?? null,
    sourceIdeaTitle: input.sourceIdeaTitle ?? null,
    serviceTypeId: input.serviceTypeId,
    serviceTypeLabel: input.serviceTypeLabel,
    options: input.options,
    architecture: input.architecture,
    promptStages: input.promptStages,
    keyNeeds: input.keyNeeds,
    nextQuestions: input.nextQuestions,
    checklist: createChecklist(),
    status: "draft",
    updatedAt: new Date().toISOString(),
    source: "mock",
  };
}

export function saveMockProject(project: SavedProject) {
  const projects = ensureProjects();
  const nextProjects = [
    { ...project, updatedAt: new Date().toISOString() },
    ...projects.filter((item) => item.id !== project.id),
  ];

  persistProjects(nextProjects);
  return nextProjects[0];
}

export function updateMockProjectStatus(
  projectId: string,
  status: ProjectStatus,
) {
  const nextProjects = ensureProjects().map((project) =>
    project.id === projectId
      ? {
          ...project,
          status,
          updatedAt: new Date().toISOString(),
        }
      : project,
  );

  persistProjects(nextProjects);
  return nextProjects.find((project) => project.id === projectId) ?? null;
}

export function toggleMockChecklistItem(projectId: string, itemId: string) {
  const nextProjects = ensureProjects().map((project) => {
    if (project.id !== projectId) {
      return project;
    }

    return {
      ...project,
      checklist: project.checklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item,
      ),
      updatedAt: new Date().toISOString(),
    };
  });

  persistProjects(nextProjects);
  return nextProjects.find((project) => project.id === projectId) ?? null;
}

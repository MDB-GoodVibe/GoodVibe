import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import { generateArchitectureBlueprint } from "@/lib/architecture-generator";
import { seedKnowledgeArticles } from "@/lib/mock/knowledge-library";
import { generatePromptStages } from "@/lib/prompt-generator";
import type {
  ArchitectureOptions,
  ProjectChecklistItem,
  ServiceTypeId,
} from "@/types/project";

type DemoUserRole = "user" | "admin";

type SeedUser = {
  email: string;
  nickname: string;
  role: DemoUserRole;
};

type SeedIdea = {
  id: string;
  title: string;
  content: string;
  authorEmail: string;
  createdAt: string;
};

type SeedProject = {
  id: string;
  title: string;
  idea: string;
  sourceIdeaId: string | null;
  ownerEmail: string;
  serviceTypeId: ServiceTypeId;
  serviceTypeLabel: string;
  options: ArchitectureOptions;
  keyNeeds: string[];
  nextQuestions: string[];
  status: "draft" | "ready" | "mock-live";
  updatedAt: string;
};

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const seedUsers: SeedUser[] = [
  {
    email: "seed-admin@goodvibe.example",
    nickname: "Good Vibe 팀",
    role: "admin",
  },
  {
    email: "seed-minji@goodvibe.example",
    nickname: "민지",
    role: "user",
  },
  {
    email: "seed-junho@goodvibe.example",
    nickname: "준호",
    role: "user",
  },
  {
    email: "seed-seoyeon@goodvibe.example",
    nickname: "서연",
    role: "user",
  },
];

const seedIdeas: SeedIdea[] = [
  {
    id: "6b6d6bc7-6c76-4ec1-8dbd-9027216b7f01",
    title: "지역 카페 예약 문의와 메뉴 소개를 동시에 해결하는 웹 서비스",
    content:
      "카페 소개, 대표 메뉴, 예약 문의를 한 화면에서 끝낼 수 있는 서비스가 필요합니다. 운영자는 예약 문의를 모아보고 응답 상태를 관리할 수 있으면 좋겠습니다.",
    authorEmail: "seed-minji@goodvibe.example",
    createdAt: "2026-03-20T09:00:00.000Z",
  },
  {
    id: "4dc2a928-1f7f-4820-b6f5-b1e955d5f202",
    title: "보고서 초안을 자동으로 만드는 문서 요약 도구",
    content:
      "PDF나 회의록을 올리면 핵심 요약, 실행 항목, 보고용 문장까지 한 번에 정리해 주는 도구를 만들고 싶습니다. 비개발자도 쓸 수 있을 만큼 쉽게 구성되면 좋겠습니다.",
    authorEmail: "seed-junho@goodvibe.example",
    createdAt: "2026-03-21T10:30:00.000Z",
  },
  {
    id: "f1885d6b-bc88-4e89-a85b-9f72745f8303",
    title: "수업 자료, 공지, 과제 제출 현황을 한 번에 보는 클래스 대시보드",
    content:
      "강의자와 수강생이 자료, 공지, 제출 상태를 한 곳에서 확인할 수 있는 간단한 대시보드가 필요합니다. 처음에는 웹 버전부터 만들고 싶습니다.",
    authorEmail: "seed-seoyeon@goodvibe.example",
    createdAt: "2026-03-22T08:10:00.000Z",
  },
];

const defaultChecklist: ProjectChecklistItem[] = [
  { id: "idea", label: "아이디어 방향 확인", done: true },
  { id: "architecture", label: "구조 옵션 정리", done: true },
  { id: "prompts", label: "프롬프트 검토", done: true },
  { id: "handoff", label: "빌드 시작 준비", done: false },
];

const seedProjects: SeedProject[] = [
  {
    id: "d41e687d-458f-4b56-a3a5-6671bfa4a401",
    title: "카페 예약 런칭 페이지",
    idea:
      "카페 소개와 대표 메뉴를 보여주고, 예약 문의를 간단히 받아 운영자가 빠르게 확인할 수 있는 서비스를 만들고 싶습니다.",
    sourceIdeaId: "6b6d6bc7-6c76-4ec1-8dbd-9027216b7f01",
    ownerEmail: "seed-minji@goodvibe.example",
    serviceTypeId: "web-service",
    serviceTypeLabel: "웹 서비스",
    options: {
      budget: "free",
      design: "custom",
      environment: "local",
    },
    keyNeeds: [
      "문의에서 예약으로 자연스럽게 이어지는 전환 흐름",
      "처음 방문한 사람도 이해하기 쉬운 첫 화면",
      "운영자가 예약 요청을 빠르게 확인할 수 있는 관리 지점",
    ],
    nextQuestions: [
      "예약을 확정하기 전에 운영자 확인 단계가 필요한가요?",
      "메뉴와 소개 문구를 운영자가 직접 수정할 수 있어야 하나요?",
    ],
    status: "ready",
    updatedAt: "2026-03-23T09:00:00.000Z",
  },
  {
    id: "2375a089-14f5-4f0b-9961-7dd79b1dd402",
    title: "문서 요약 보고서 도우미",
    idea:
      "문서를 업로드하면 핵심 요약, 액션 아이템, 보고용 초안을 자동으로 만들어주는 도구가 필요합니다.",
    sourceIdeaId: "4dc2a928-1f7f-4820-b6f5-b1e955d5f202",
    ownerEmail: "seed-junho@goodvibe.example",
    serviceTypeId: "data-tool",
    serviceTypeLabel: "데이터 도구",
    options: {
      budget: "flexible",
      design: "standard",
      environment: "cloud",
    },
    keyNeeds: [
      "파일 업로드와 결과 다운로드가 자연스럽게 이어지는 흐름",
      "한눈에 읽히는 요약 리포트 화면",
      "나중에 AI API 확장도 가능한 구조",
    ],
    nextQuestions: [
      "출력 형식을 텍스트, 표, 프레젠테이션 초안 중 무엇으로 잡을까요?",
      "결과를 히스토리로 다시 볼 수 있어야 하나요?",
    ],
    status: "draft",
    updatedAt: "2026-03-24T11:15:00.000Z",
  },
];

function buildProjectRow(
  project: SeedProject,
  userId: string,
) {
  const architecture = generateArchitectureBlueprint({
    idea: project.idea,
    projectName: project.title,
    serviceType: project.serviceTypeLabel,
    serviceTypeId: project.serviceTypeId,
    budget: project.options.budget,
    design: project.options.design,
    environment: project.options.environment,
  });

  const promptStages = generatePromptStages({
    idea: project.idea,
    projectName: project.title,
    serviceType: project.serviceTypeLabel,
    serviceTypeId: project.serviceTypeId,
    budget: project.options.budget,
    design: project.options.design,
    environment: project.options.environment,
  });

  return {
    id: project.id,
    user_id: userId,
    source_idea_id: project.sourceIdeaId,
    title: project.title,
    idea: project.idea,
    service_type_id: project.serviceTypeId,
    service_type_label: project.serviceTypeLabel,
    options_json: project.options,
    architecture_json: architecture,
    prompt_stages_json: promptStages,
    checklist_json: defaultChecklist,
    key_needs_json: project.keyNeeds,
    next_questions_json: project.nextQuestions,
    status: project.status,
    updated_at: project.updatedAt,
  };
}

async function run() {
  loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const adminKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !adminKey) {
    throw new Error("Supabase URL 또는 관리자 키가 없습니다.");
  }

  const supabase = createClient(supabaseUrl, adminKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const existingUsers = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (existingUsers.error) {
    throw existingUsers.error;
  }

  const userIdByEmail = new Map<string, string>();

  for (const seedUser of seedUsers) {
    const foundUser = existingUsers.data.users.find(
      (user) => user.email === seedUser.email,
    );

    if (foundUser) {
      userIdByEmail.set(seedUser.email, foundUser.id);
      continue;
    }

    const createdUser = await supabase.auth.admin.createUser({
      email: seedUser.email,
      password: `${randomUUID()}!Aa1`,
      email_confirm: true,
      user_metadata: {
        nickname: seedUser.nickname,
        role: seedUser.role,
      },
    });

    if (createdUser.error || !createdUser.data.user) {
      throw createdUser.error ?? new Error(`사용자 생성 실패: ${seedUser.email}`);
    }

    userIdByEmail.set(seedUser.email, createdUser.data.user.id);
  }

  const profiles = seedUsers.map((seedUser) => ({
    id: userIdByEmail.get(seedUser.email)!,
    nickname: seedUser.nickname,
    avatar_url: null,
    role: seedUser.role,
  }));

  const profilesResult = await supabase.from("profiles").upsert(profiles);

  if (profilesResult.error) {
    throw profilesResult.error;
  }

  const adminUserId = userIdByEmail.get("seed-admin@goodvibe.example")!;

  const knowledgeRows = seedKnowledgeArticles.map((article) => ({
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    content_md: article.contentMd,
    track: article.track,
    topic: article.topic,
    status: article.status,
    featured: article.featured,
    platform_tags: article.platformTags,
    tool_tags: article.toolTags,
    resource_url: article.resourceUrl,
    author_id: adminUserId,
    published_at: article.publishedAt,
  }));

  const knowledgeResult = await supabase
    .from("knowledge_articles")
    .upsert(knowledgeRows, { onConflict: "slug" });

  if (knowledgeResult.error) {
    throw knowledgeResult.error;
  }

  const ideaRows = seedIdeas.map((idea) => ({
    id: idea.id,
    author_id: userIdByEmail.get(idea.authorEmail)!,
    title: idea.title,
    content: idea.content,
    status: "published",
    created_at: idea.createdAt,
    updated_at: idea.createdAt,
  }));

  const ideasResult = await supabase
    .from("ideas")
    .upsert(ideaRows, { onConflict: "id" });

  if (ideasResult.error) {
    throw ideasResult.error;
  }

  const projectRows = seedProjects.map((project) =>
    buildProjectRow(project, userIdByEmail.get(project.ownerEmail)!),
  );

  const projectsResult = await supabase
    .from("helper_projects")
    .upsert(projectRows, { onConflict: "id" });

  if (projectsResult.error) {
    throw projectsResult.error;
  }

  console.log("Good Vibe 시드 데이터 적용 완료");
  console.log(`- 프로필 ${profiles.length}개`);
  console.log(`- 아이디어 ${ideaRows.length}개`);
  console.log(`- 지식 문서 ${knowledgeRows.length}개`);
  console.log(`- Helper 프로젝트 ${projectRows.length}개`);
}

void run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

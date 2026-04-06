import { classifyExternalResource } from "@/lib/knowledge/external-resource";
import type { IdeaPost, KnowledgeArticle } from "@/types/good-vibe";

const seedCreatedAt = "2026-03-20T09:00:00.000Z";

export const seedIdeaPosts: IdeaPost[] = [
  {
    id: "idea-cafe-landing",
    title: "카페 예약 문의와 메뉴 소개를 한 번에 보여주는 브랜드 페이지",
    content:
      "메뉴, 분위기, 예약 문의를 한 화면에 담고 사장님이 손쉽게 수정할 수 있는 소개 사이트를 만들고 싶습니다. 비개발자도 운영하기 쉬운 구조였으면 좋겠어요.",
    referenceLinks: [],
    authorId: "seed-user-1",
    authorName: "민지",
    status: "published",
    upvoteCount: 24,
    createdAt: seedCreatedAt,
    updatedAt: seedCreatedAt,
    viewerHasVoted: false,
    source: "seed",
  },
  {
    id: "idea-report-helper",
    title: "문서 업로드 후 요약 보고서를 바로 만드는 AI 도구",
    content:
      "PDF나 텍스트 파일을 올리면 핵심 요약, 액션 아이템, 간단한 보고서 초안까지 자동으로 정리해 주는 서비스가 필요합니다. 초보자도 결과를 바로 이해할 수 있으면 좋겠습니다.",
    referenceLinks: [],
    authorId: "seed-user-2",
    authorName: "준호",
    status: "published",
    upvoteCount: 31,
    createdAt: "2026-03-21T10:30:00.000Z",
    updatedAt: "2026-03-21T10:30:00.000Z",
    viewerHasVoted: false,
    source: "seed",
  },
  {
    id: "idea-class-dashboard",
    title: "수업 자료와 공지를 관리하는 간단한 학습 대시보드",
    content:
      "강의 자료, 공지, 과제 제출 현황을 한곳에서 확인할 수 있는 가벼운 대시보드가 있으면 좋겠습니다. 로그인과 역할 구분만 간단하게 들어가도 충분합니다.",
    referenceLinks: [],
    authorId: "seed-user-3",
    authorName: "서연",
    status: "published",
    upvoteCount: 18,
    createdAt: "2026-03-22T08:10:00.000Z",
    updatedAt: "2026-03-22T08:10:00.000Z",
    viewerHasVoted: false,
    source: "seed",
  },
];

const seedKnowledgeArticleEntries = [
  {
    id: "knowledge-basics-vibe-coding",
    slug: "vibe-coding-what-is",
    title: "Vibe Coding이란 무엇인가?",
    summary:
      "개발자가 아니어도 AI에게 목표와 맥락을 설명해 원하는 서비스를 만드는 작업 방식을 쉬운 언어로 정리했습니다.",
    contentMd: `## 정의
Vibe Coding은 코드를 직접 길게 작성하는 대신, 만들고 싶은 서비스의 목적과 분위기, 핵심 동작을 자연어로 설명해 AI와 함께 결과물을 완성하는 방식입니다.

## 왜 입문자에게 잘 맞을까
- 처음부터 문법을 깊게 몰라도 됩니다.
- 아이디어를 빠르게 화면으로 옮겨볼 수 있습니다.
- 결과를 보면서 수정 요청을 주고받는 흐름이 자연스럽습니다.

## 시작할 때 기억할 점
- 한 번에 큰 요청보다 작은 단계로 나누면 결과가 더 안정적입니다.
- 구조와 화면, 데이터 저장을 분리해서 생각하면 수정이 쉬워집니다.
- 항상 테스트와 검토 단계를 마지막에 남겨 두는 것이 좋습니다.`,
    track: "basics",
    topic: "concepts-and-tips",
    status: "published",
    featured: true,
    platformTags: ["공통"],
    toolTags: ["Claude Code", "Codex", "Cursor"],
    resourceUrl: null,
    authorName: "Good Vibe",
    publishedAt: seedCreatedAt,
    createdAt: seedCreatedAt,
    updatedAt: seedCreatedAt,
    source: "seed",
  },
  {
    id: "knowledge-basics-tool-setup",
    slug: "tool-setup-windows-mac",
    title: "Windows / Mac에서 Claude Code와 Codex 시작하기",
    summary:
      "Node.js, Git, 터미널, VS Code까지 어떤 순서로 준비하면 되는지 입문자 기준으로 차근차근 정리했습니다.",
    contentMd: `## 준비물
- Node.js 18 이상
- Git
- 터미널 사용 권한

## 설치 순서
1. Node.js 버전을 확인합니다.
2. Claude Code CLI 또는 사용하는 에이전트 툴을 설치합니다.
3. VS Code 확장과 API 키 연동 여부를 점검합니다.

## 설치 후 체크
- 새 폴더를 만든 뒤 간단한 명령이 실행되는지 확인합니다.
- 로그인 상태와 프로젝트 접근 권한을 확인합니다.
- overview.md 같은 프로젝트 문서를 함께 준비합니다.`,
    track: "basics",
    topic: "tool-setup",
    status: "published",
    featured: true,
    platformTags: ["Windows", "macOS"],
    toolTags: ["Claude Code", "Codex", "VS Code"],
    resourceUrl: null,
    authorName: "Good Vibe",
    publishedAt: "2026-03-21T09:00:00.000Z",
    createdAt: "2026-03-21T09:00:00.000Z",
    updatedAt: "2026-03-21T09:00:00.000Z",
    source: "seed",
  },
  {
    id: "knowledge-basics-glossary",
    slug: "vibe-coding-glossary",
    title: "Skills, MCP, Plugin, API를 한 번에 이해하는 용어 정리",
    summary:
      "AI 에이전트 문맥에서 자주 나오는 용어를 비개발자도 바로 이해할 수 있도록 짧고 명확하게 정리했습니다.",
    contentMd: `## Skills
에이전트가 특정 작업을 더 잘 수행하도록 돕는 작업 지침 모음입니다.

## MCP
AI가 외부 도구나 서비스와 연결될 때 사용하는 표준 인터페이스 개념입니다.

## Plugin
기능을 붙여 주는 연결 장치라고 생각하면 쉽습니다.

## API
서비스가 다른 서비스와 데이터를 주고받는 규칙입니다.`,
    track: "basics",
    topic: "glossary",
    status: "published",
    featured: false,
    platformTags: ["공통"],
    toolTags: ["Skills", "MCP", "Plugin", "API"],
    resourceUrl: null,
    authorName: "Good Vibe",
    publishedAt: "2026-03-22T11:00:00.000Z",
    createdAt: "2026-03-22T11:00:00.000Z",
    updatedAt: "2026-03-22T11:00:00.000Z",
    source: "seed",
  },
  {
    id: "knowledge-level-context",
    slug: "level-up-context-management",
    title: "컨텍스트 관리 전략: 길게 가는 프로젝트를 위한 기본기",
    summary:
      "큰 프로젝트에서 AI가 흔들리지 않도록 overview 문서, 범위 관리, 단계 로그를 어떻게 운영해야 하는지 설명합니다.",
    contentMd: `## 왜 중요한가
프로젝트가 길어질수록 AI는 현재 목표와 제외 범위를 잃기 쉽습니다. 컨텍스트 관리가 흔들리면 결과 품질도 함께 흔들립니다.

## 운영 원칙
- overview.md를 중심 문서로 둡니다.
- 현재 목표와 제외 범위를 분리합니다.
- 의사결정과 테스트 결과를 계속 기록합니다.
- 필요할 때는 하위 작업을 분리해 서브 에이전트로 넘깁니다.`,
    track: "level-up",
    topic: "workflow-and-ops",
    status: "published",
    featured: true,
    platformTags: ["공통"],
    toolTags: ["Plan Mode", "Overview", "Sub Agent"],
    resourceUrl: null,
    authorName: "Good Vibe",
    publishedAt: "2026-03-23T09:30:00.000Z",
    createdAt: "2026-03-23T09:30:00.000Z",
    updatedAt: "2026-03-23T09:30:00.000Z",
    source: "seed",
  },
  {
    id: "knowledge-level-security",
    slug: "level-up-security-basics",
    title: "키 관리와 배포 전 보안 체크리스트",
    summary:
      "env 파일, 공개 키와 비밀 키 구분, 로그 점검, Git 업로드 금지 항목까지 실무에서 반드시 확인해야 할 보안 기본기를 정리했습니다.",
    contentMd: `## 절대 공개하면 안 되는 값
- Secret key
- Service role key
- 개인 액세스 토큰

## 기본 수칙
- 공개 키와 비밀 키를 반드시 분리합니다.
- .env.local은 저장소에 올리지 않습니다.
- 배포 전에 로그와 콘솔 출력에 민감 정보가 없는지 확인합니다.
- 외부 협업 전에 권한 범위를 다시 점검합니다.`,
    track: "level-up",
    topic: "security",
    status: "published",
    featured: true,
    platformTags: ["공통"],
    toolTags: ["Supabase", "Vercel", "GitHub"],
    resourceUrl: null,
    authorName: "Good Vibe",
    publishedAt: "2026-03-24T08:40:00.000Z",
    createdAt: "2026-03-24T08:40:00.000Z",
    updatedAt: "2026-03-24T08:40:00.000Z",
    source: "seed",
  },
  {
    id: "knowledge-level-saas",
    slug: "level-up-saas-keys-guide",
    title: "Supabase, Vercel, Cloudflare 키를 어디서 찾고 어떻게 넣을까",
    summary:
      "대표적인 SaaS에서 Project URL, Publishable Key, Secret Key를 확인하고 프로젝트에 연결하는 기본 흐름을 안내합니다.",
    contentMd: `## Supabase
Settings 또는 Connect 화면에서 URL과 공개 키를 확인할 수 있습니다.

## Vercel
프로젝트 Settings의 Environment Variables에서 값을 관리합니다.

## Cloudflare
API Tokens 메뉴에서 필요한 권한의 토큰을 발급합니다.`,
    track: "level-up",
    topic: "saas-guides",
    status: "published",
    featured: false,
    platformTags: ["공통"],
    toolTags: ["Supabase", "Vercel", "Cloudflare"],
    resourceUrl: null,
    authorName: "Good Vibe",
    publishedAt: "2026-03-24T13:15:00.000Z",
    createdAt: "2026-03-24T13:15:00.000Z",
    updatedAt: "2026-03-24T13:15:00.000Z",
    source: "seed",
  },
  {
    id: "knowledge-tips-prompt-chaining",
    slug: "prompt-chaining-productivity",
    title: "프롬프트 체이닝으로 복잡한 결과물을 안정적으로 만드는 법",
    summary:
      "한 번에 큰 요청을 던지지 않고 단계별 질문으로 쪼개면 결과 품질이 어떻게 달라지는지 실전 예시와 함께 설명합니다.",
    contentMd: `## 핵심 원리
큰 요청은 종종 범위를 흐리게 만듭니다. 조사, 구조화, 초안, 다듬기 순서로 나누면 결과가 훨씬 예측 가능해집니다.

## 활용 예시
1. 핵심 자료 조사
2. 목차와 구조 설계
3. 초안 작성
4. 문체와 디테일 다듬기

## 추천 상황
보고서, 기획서, 제안서, 설명 문서처럼 완성형 결과물이 필요한 작업에 특히 잘 맞습니다.`,
    track: "tips",
    topic: "concepts-and-tips",
    status: "published",
    featured: true,
    platformTags: ["공통"],
    toolTags: ["Prompt", "Workflow"],
    resourceUrl: null,
    authorName: "Good Vibe",
    publishedAt: "2026-03-24T15:00:00.000Z",
    createdAt: "2026-03-24T15:00:00.000Z",
    updatedAt: "2026-03-24T15:00:00.000Z",
    source: "seed",
  },
  {
    id: "knowledge-tips-email-workflow",
    slug: "email-automation-workflow",
    title: "이메일 지옥에서 탈출하는 3단계 AI 자동화 워크플로우",
    summary:
      "반복되는 메일 확인, 분류, 초안 작성 흐름을 AI와 자동화 도구로 정리하는 방법을 소개합니다.",
    contentMd: `## 1단계
자주 오는 메일 유형을 먼저 분류합니다.

## 2단계
응답 초안 템플릿을 만듭니다.

## 3단계
중요 메일만 사람이 검토하고 나머지는 자동 처리 흐름으로 넘깁니다.`,
    track: "tips",
    topic: "workflow-and-ops",
    status: "published",
    featured: false,
    platformTags: ["공통"],
    toolTags: ["Zapier", "GPT", "Automation"],
    resourceUrl: null,
    authorName: "Good Vibe",
    publishedAt: "2026-03-24T16:10:00.000Z",
    createdAt: "2026-03-24T16:10:00.000Z",
    updatedAt: "2026-03-24T16:10:00.000Z",
    source: "seed",
  },
  {
    id: "knowledge-tips-pdf-insights",
    slug: "pdf-insights-in-1-minute",
    title: "복잡한 PDF 문서에서 1분 만에 인사이트 뽑아내기",
    summary:
      "긴 보고서나 제안서에서 핵심 주장, 수치, 액션 아이템만 먼저 뽑아보는 요약 프롬프트 패턴을 공유합니다.",
    contentMd: `## 먼저 할 일
문서의 목적과 읽는 사람을 정의합니다.

## 추천 요청 방식
핵심 요약, 중요한 수치, 당장 필요한 액션 순서로 분리해서 요청합니다.

## 결과 활용
회의 준비, 보고서 초안, 발표 자료 정리에 바로 연결할 수 있습니다.`,
    track: "tips",
    topic: "concepts-and-tips",
    status: "published",
    featured: false,
    platformTags: ["공통"],
    toolTags: ["PDF", "Summary", "Prompt"],
    resourceUrl: null,
    authorName: "Good Vibe",
    publishedAt: "2026-03-24T17:20:00.000Z",
    createdAt: "2026-03-24T17:20:00.000Z",
    updatedAt: "2026-03-24T17:20:00.000Z",
    source: "seed",
  },
  {
    id: "knowledge-external-anthropic",
    slug: "external-claude-code-overview",
    title: "Anthropic Claude Code 공식 문서",
    summary:
      "Claude Code의 개념, 설치, 워크플로우를 빠르게 파악할 수 있는 공식 가이드입니다. 처음 시작하는 사용자에게 특히 유용합니다.",
    contentMd: `## 왜 추천하나요
공식 문서라서 설치 방법과 핵심 개념을 가장 신뢰도 높게 확인할 수 있습니다.

## 이렇게 활용해 보세요
Good Vibe의 기초 가이드와 함께 보면 도구 이해 속도가 훨씬 빨라집니다.`,
    track: "external",
    topic: "tool-setup",
    status: "published",
    featured: true,
    platformTags: ["Web"],
    toolTags: ["Claude Code", "Anthropic"],
    resourceUrl: "https://docs.anthropic.com/en/docs/claude-code/overview",
    authorName: "Good Vibe",
    publishedAt: "2026-03-24T18:00:00.000Z",
    createdAt: "2026-03-24T18:00:00.000Z",
    updatedAt: "2026-03-24T18:00:00.000Z",
    source: "seed",
  },
  {
    id: "knowledge-external-supabase",
    slug: "external-supabase-docs",
    title: "Supabase 시작 가이드",
    summary:
      "인증, 데이터베이스, API 키 구조를 공식 문서 기준으로 빠르게 이해할 수 있는 입문용 문서 모음입니다.",
    contentMd: `## 추천 포인트
Auth, Database, Storage를 한 흐름으로 파악하기 좋습니다.

## 함께 보면 좋은 곳
Level-up 섹션의 SaaS 키 가이드와 함께 보면 실전 연결이 쉬워집니다.`,
    track: "external",
    topic: "saas-guides",
    status: "published",
    featured: false,
    platformTags: ["Web"],
    toolTags: ["Supabase"],
    resourceUrl: "https://supabase.com/docs/guides/getting-started",
    authorName: "Good Vibe",
    publishedAt: "2026-03-24T18:15:00.000Z",
    createdAt: "2026-03-24T18:15:00.000Z",
    updatedAt: "2026-03-24T18:15:00.000Z",
    source: "seed",
  },
  {
    id: "knowledge-external-nextjs",
    slug: "external-nextjs-docs",
    title: "Next.js 공식 문서",
    summary:
      "라우팅, 서버 컴포넌트, 데이터 패칭까지 현대적인 웹 앱 구조를 이해하는 데 가장 기본이 되는 자료입니다.",
    contentMd: `## 추천 포인트
App Router와 서버 액션 흐름을 공식 예제로 확인할 수 있습니다.

## 활용 팁
Helper가 제안한 구조를 실제 코드로 옮길 때 문서와 함께 보는 것이 가장 빠릅니다.`,
    track: "external",
    topic: "coding-basics",
    status: "published",
    featured: false,
    platformTags: ["Web"],
    toolTags: ["Next.js"],
    resourceUrl: "https://nextjs.org/docs",
    authorName: "Good Vibe",
    publishedAt: "2026-03-24T18:30:00.000Z",
    createdAt: "2026-03-24T18:30:00.000Z",
    updatedAt: "2026-03-24T18:30:00.000Z",
    source: "seed",
  },
  {
    id: "knowledge-external-vercel",
    slug: "external-vercel-guides",
    title: "Vercel 배포 가이드 모음",
    summary:
      "배포, 환경변수, 프리뷰 링크, 에러 추적까지 실제 서비스 운영에 필요한 Vercel 안내 문서를 모았습니다.",
    contentMd: `## 추천 포인트
배포 과정에서 자주 막히는 환경변수와 도메인 연결 흐름을 빠르게 확인할 수 있습니다.

## 함께 보면 좋은 곳
Good Vibe 레벨업 섹션의 배포 아키텍처 문서와 연결해서 보세요.`,
    track: "external",
    topic: "workflow-and-ops",
    status: "published",
    featured: false,
    platformTags: ["Web"],
    toolTags: ["Vercel", "Deploy"],
    resourceUrl: "https://vercel.com/guides",
    authorName: "Good Vibe",
    publishedAt: "2026-03-24T18:45:00.000Z",
    createdAt: "2026-03-24T18:45:00.000Z",
    updatedAt: "2026-03-24T18:45:00.000Z",
    source: "seed",
  },
 ] satisfies Array<Omit<KnowledgeArticle, "externalTaxonomy">>;

export const seedKnowledgeArticles: KnowledgeArticle[] = seedKnowledgeArticleEntries.map((article) => ({
  ...article,
  externalTaxonomy:
    article.track === "external" || article.resourceUrl
      ? classifyExternalResource({
          url: article.resourceUrl,
          title: article.title,
          summary: article.summary,
          platformTags: article.platformTags,
          toolTags: article.toolTags,
        })
      : null,
}));

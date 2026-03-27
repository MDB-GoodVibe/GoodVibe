export type SkillSourceType = "official" | "session" | "community";
export type SkillCategory =
  | "design"
  | "discovery"
  | "docs"
  | "automation"
  | "workflow";
export type SkillGoal =
  | "ux-ui"
  | "skill-search"
  | "custom-skill"
  | "docs-api"
  | "automation";

export interface SkillCatalogEntry {
  id: string;
  name: string;
  summary: string;
  sourceType: SkillSourceType;
  category: SkillCategory;
  sourceLabel: string;
  official: boolean;
  installed: boolean;
  availableInSession: boolean;
  tags: string[];
  goals: SkillGoal[];
  whyItFits: string;
  whenToUse: string[];
  sourceUrl?: string;
}

export const skillCatalog: SkillCatalogEntry[] = [
  {
    id: "skill-installer",
    name: "skill-installer",
    summary: "공식/외부 스킬 목록을 보고 설치 흐름까지 연결하는 시스템 스킬",
    sourceType: "official",
    category: "discovery",
    sourceLabel: "OpenAI System",
    official: true,
    installed: true,
    availableInSession: true,
    tags: ["catalog", "install", "skills", "marketplace"],
    goals: ["skill-search"],
    whyItFits:
      "지금 만들고 있는 스킬 탐색 기능의 실제 설치 연결점이 되는 핵심 스킬입니다.",
    whenToUse: [
      "공식/외부 스킬 목록을 보여주고 싶을 때",
      "설치 가능한 스킬을 구분하고 싶을 때",
      "스킬 검색 결과를 설치 흐름과 연결할 때",
    ],
    sourceUrl: "https://github.com/openai/skills",
  },
  {
    id: "skill-creator",
    name: "skill-creator",
    summary: "프로젝트 전용 스킬을 설계하고 문서화할 때 쓰는 시스템 스킬",
    sourceType: "official",
    category: "workflow",
    sourceLabel: "OpenAI System",
    official: true,
    installed: true,
    availableInSession: true,
    tags: ["custom", "workflow", "design-system", "playbook"],
    goals: ["ux-ui", "custom-skill", "skill-search"],
    whyItFits:
      "당신이 원하는 'Next.js + Tailwind 디자인 품질 전용 스킬'은 이 스킬로 커스텀 제작하는 방향이 가장 잘 맞습니다.",
    whenToUse: [
      "프로젝트 고유의 UI/UX 기준을 스킬로 만들고 싶을 때",
      "디자인 리뷰 기준과 구현 규칙을 재사용하고 싶을 때",
      "팀 전용 프론트엔드 플레이북을 만들고 싶을 때",
    ],
    sourceUrl:
      "https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md",
  },
  {
    id: "openai-docs",
    name: "openai-docs",
    summary: "OpenAI 제품과 API 문서를 공식 자료 기준으로 확인하는 시스템 스킬",
    sourceType: "official",
    category: "docs",
    sourceLabel: "OpenAI System",
    official: true,
    installed: true,
    availableInSession: true,
    tags: ["api", "models", "docs", "openai"],
    goals: ["docs-api"],
    whyItFits:
      "나중에 OpenAI 기반 기능이나 문서 연결이 들어갈 때 공식 문서를 우선 참조하는 흐름에 맞습니다.",
    whenToUse: [
      "OpenAI API 사용법을 최신 공식 문서로 확인할 때",
      "모델 선택이나 업그레이드 가이드를 볼 때",
    ],
    sourceUrl: "https://github.com/openai/skills",
  },
  {
    id: "autotrade-runtime",
    name: "autotrade-runtime",
    summary: "자동화 잡과 런타임 규칙을 다루는 세션 스킬",
    sourceType: "session",
    category: "automation",
    sourceLabel: "Session Skill",
    official: false,
    installed: true,
    availableInSession: true,
    tags: ["automation", "runtime", "jobs"],
    goals: ["automation"],
    whyItFits:
      "스킬 탐색 기능에 자동화/잡 중심 카테고리를 추가할 때 참고할 수 있습니다.",
    whenToUse: [
      "자동화 워크플로우를 설계할 때",
      "주기 실행 잡과 런타임 규칙을 정의할 때",
    ],
  },
  {
    id: "frontend-design",
    name: "frontend-design",
    summary: "프로덕션 수준 프론트엔드 인터페이스와 스타일링을 돕는 커뮤니티 스킬",
    sourceType: "community",
    category: "design",
    sourceLabel: "Community",
    official: false,
    installed: false,
    availableInSession: false,
    tags: ["frontend", "tailwind", "ux", "design"],
    goals: ["ux-ui", "custom-skill"],
    whyItFits:
      "당신이 원하는 '더 잘 어울리고 사용자 친화적인 UI/UX' 방향에 가장 직접적으로 맞는 외부 참고 스킬 후보입니다.",
    whenToUse: [
      "Tailwind 기반 화면 완성도를 끌어올리고 싶을 때",
      "디자인 시스템이나 컴포넌트 감도를 높이고 싶을 때",
      "현재 UI/UX를 한 단계 더 세련되게 정리하고 싶을 때",
    ],
    sourceUrl: "https://github.com/skillcreatorai/Ai-Agent-Skills",
  },
  {
    id: "artifacts-builder",
    name: "artifacts-builder",
    summary: "React/Tailwind 기반 인터랙티브 UI 조합에 강한 커뮤니티 스킬",
    sourceType: "community",
    category: "design",
    sourceLabel: "Community",
    official: false,
    installed: false,
    availableInSession: false,
    tags: ["react", "tailwind", "interactive", "ui"],
    goals: ["ux-ui"],
    whyItFits:
      "검색, 추천, 상세 미리보기처럼 상호작용이 많은 페이지를 더 풍부하게 다듬는 데 어울립니다.",
    whenToUse: [
      "리치한 검색 UI나 대시보드를 만들 때",
      "카드/패널/인터랙션 완성도를 높이고 싶을 때",
    ],
    sourceUrl: "https://github.com/skillcreatorai/Ai-Agent-Skills",
  },
];

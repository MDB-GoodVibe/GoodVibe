import type {
  ArchitectureBlueprint,
  PromptGeneratorInput,
  ServiceTypeId,
} from "@/types/project";

interface ServicePreset {
  title: string;
  experience: string;
  logic: string;
  data: string;
  operator: string;
  external?: string;
}

const servicePresets: Record<ServiceTypeId, ServicePreset> = {
  utility: {
    title: "유틸리티 도구",
    experience: "단일 입력과 빠른 결과",
    logic: "변환 또는 계산 로직",
    data: "가벼운 결과 기록",
    operator: "기본 설정 관리",
  },
  landing: {
    title: "랜딩 페이지",
    experience: "브랜드 소개와 CTA",
    logic: "문의 또는 예약 처리",
    data: "리드 수집",
    operator: "문의 확인 화면",
  },
  "web-service": {
    title: "웹 서비스",
    experience: "로그인 후 사용하는 제품 화면",
    logic: "인증과 CRUD 흐름",
    data: "핵심 서비스 데이터",
    operator: "운영 대시보드",
  },
  "data-tool": {
    title: "데이터 도구",
    experience: "업로드와 결과 확인",
    logic: "파싱과 분석 파이프라인",
    data: "원본과 결과 데이터",
    operator: "리포트 검토 화면",
  },
  "content-generator": {
    title: "콘텐츠 생성기",
    experience: "입력 후 결과물 생성",
    logic: "프롬프트 조합과 결과 정리",
    data: "요청 기록과 생성 결과",
    operator: "생성 이력 관리",
    external: "AI API",
  },
  app: {
    title: "모바일 앱",
    experience: "기기 중심 인터랙션",
    logic: "상태 관리와 사용자 흐름",
    data: "사용자 데이터와 알림 기록",
    operator: "운영 메시지 관리",
  },
};

function formatBudget(budget: PromptGeneratorInput["budget"]) {
  return budget === "free" ? "무료 중심" : "유료 포함 가능";
}

function formatDesign(design: PromptGeneratorInput["design"]) {
  return design === "standard" ? "기본 UI" : "브랜드형 UI";
}

function formatEnvironment(environment: PromptGeneratorInput["environment"]) {
  return environment === "local" ? "로컬 작업" : "클라우드 작업";
}

function escapeMermaidLabel(label: string) {
  return label.replaceAll('"', "&quot;").replaceAll("\n", "<br/>");
}

function buildNode(id: string, label: string) {
  return `${id}["${escapeMermaidLabel(label)}"]`;
}

export function generateArchitectureBlueprint(
  input: PromptGeneratorInput & { serviceTypeId: ServiceTypeId },
): ArchitectureBlueprint {
  const preset = servicePresets[input.serviceTypeId];
  const deployment =
    input.budget === "free" ? "Vercel Hobby\n무료 배포" : "Vercel Pro\n운영 배포";
  const dataLayer =
    input.budget === "free"
      ? `Supabase Free\n${preset.data}`
      : `Supabase\n${preset.data}`;
  const buildSpace =
    input.environment === "local"
      ? "Cursor 또는 CLI\n로컬 개발 흐름"
      : "Cloud IDE\n브라우저 작업 흐름";
  const designSystem =
    input.design === "standard"
      ? "shadcn/ui\n기본 컴포넌트"
      : "shadcn/ui + 커스텀 스타일\n브랜드 톤 반영";

  const mermaidLines = [
    "flowchart TD",
    buildNode("user", "사용자"),
    buildNode("product", `${preset.title}\n${preset.experience}`),
    buildNode("design", designSystem),
    buildNode("logic", preset.logic),
    buildNode("data", dataLayer),
    buildNode("admin", preset.operator),
    buildNode("deploy", deployment),
    buildNode("dev", buildSpace),
    "user --> product",
    "design --> product",
    "product --> logic",
    "logic --> data",
    "admin --> product",
    "product --> deploy",
    "dev -. 빌드 .-> product",
  ];

  if (preset.external) {
    mermaidLines.push(buildNode("external", preset.external));
    mermaidLines.push("logic --> external");
    mermaidLines.push("class external accent");
  }

  mermaidLines.push(
    "linkStyle default stroke:#94a3b8,stroke-width:1.4px,color:#475569",
    "classDef core fill:#e9edff,stroke:#6a78e7,color:#1f2a5a,stroke-width:1.6px",
    "classDef surface fill:#f8fafc,stroke:#c5ceda,color:#334155,stroke-width:1.2px",
    "classDef data fill:#fff3c4,stroke:#f2b431,color:#7a4b00,stroke-width:1.4px",
    "classDef accent fill:#fff0f0,stroke:#ef7f82,color:#b42318,stroke-width:1.4px",
    "class user,admin accent",
    "class product,logic core",
    "class design,deploy,dev surface",
    "class data data",
  );

  return {
    title: `${input.serviceType} 구조 초안`,
    summary: `${input.serviceType}를 Next.js, Supabase, Vercel 조합으로 빠르게 시작하기 위한 기본 구조입니다.`,
    mermaid: mermaidLines.join("\n"),
    highlights: [
      { label: "유형", value: input.serviceType },
      { label: "예산", value: formatBudget(input.budget) },
      { label: "UI", value: formatDesign(input.design) },
      { label: "환경", value: formatEnvironment(input.environment) },
    ],
    stack: ["Next.js", "Supabase", "Vercel"],
  };
}

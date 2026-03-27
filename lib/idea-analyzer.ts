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
    name: "유틸리티 도구",
    summary: "한 가지 입력을 빠르게 처리해 결과를 돌려주는 간단한 서비스에 잘 맞습니다.",
    complexity: "가벼움",
    tags: ["빠른 MVP", "단일 기능", "실험"],
  },
  landing: {
    id: "landing",
    name: "랜딩 페이지",
    summary: "브랜드 소개, 예약, 문의, 홍보 같은 전환 중심 화면에 적합합니다.",
    complexity: "가벼움",
    tags: ["브랜드 소개", "CTA", "문의 수집"],
  },
  "web-service": {
    id: "web-service",
    name: "웹 서비스",
    summary: "로그인, 데이터 저장, 관리자 화면이 포함되는 본격적인 제품형 서비스입니다.",
    complexity: "중간",
    tags: ["로그인", "대시보드", "데이터 관리"],
  },
  "data-tool": {
    id: "data-tool",
    name: "데이터 도구",
    summary: "업로드, 분석, 요약, 시각화 같은 데이터 흐름이 중심인 서비스에 맞습니다.",
    complexity: "중간",
    tags: ["파일 처리", "분석", "리포트"],
  },
  "content-generator": {
    id: "content-generator",
    name: "콘텐츠 생성기",
    summary: "문서, 초안, 보고서, 게시글 같은 결과물을 생성하는 흐름에 적합합니다.",
    complexity: "중간",
    tags: ["AI 생성", "문서", "자동화"],
  },
  app: {
    id: "app",
    name: "모바일 앱",
    summary: "반복 사용과 알림, 카메라, 위치 기능이 중요한 모바일 중심 서비스에 어울립니다.",
    complexity: "높음",
    tags: ["모바일", "알림", "반복 사용"],
  },
};

const keywordRules: Record<ServiceTypeId, string[]> = {
  utility: ["tool", "utility", "converter", "summary", "checklist", "계산", "정리", "도구"],
  landing: ["landing", "promo", "reservation", "inquiry", "brand", "랜딩", "문의", "예약", "브랜드", "소개"],
  "web-service": ["dashboard", "account", "login", "auth", "admin", "db", "database", "로그인", "회원", "관리", "대시보드"],
  "data-tool": ["upload", "csv", "chart", "analytics", "analysis", "report", "file", "업로드", "분석", "리포트", "파일"],
  "content-generator": ["generate", "draft", "document", "report", "content", "blog", "copy", "생성", "초안", "문서", "콘텐츠"],
  app: ["app", "mobile", "ios", "android", "push", "camera", "location", "앱", "모바일", "알림", "위치"],
};

function containsAny(text: string, keywords: string[]) {
  return keywords.filter((keyword) => text.includes(keyword.toLowerCase()));
}

function deriveKeyNeeds(idea: string) {
  const lowerIdea = idea.toLowerCase();
  const candidates = [
    {
      keywords: ["예약", "reservation", "booking", "문의", "inquiry", "contact"],
      label: "문의와 예약이 자연스럽게 이어지는 전환 흐름",
    },
    {
      keywords: ["로그인", "account", "auth", "login", "회원"],
      label: "반복 사용자를 위한 계정과 권한 구조",
    },
    {
      keywords: ["관리", "admin", "dashboard", "대시보드"],
      label: "운영자가 빠르게 확인하고 수정할 수 있는 관리자 화면",
    },
    {
      keywords: ["upload", "업로드", "file", "csv", "파일"],
      label: "입력과 결과가 분명하게 보이는 파일 처리 흐름",
    },
    {
      keywords: ["분석", "analysis", "analytics", "report", "리포트"],
      label: "숫자만 보여주지 않고 해석까지 전달하는 결과 화면",
    },
    {
      keywords: ["payment", "결제", "price", "plan", "구독"],
      label: "추후 결제나 유료 플랜으로 확장할 수 있는 구조",
    },
    {
      keywords: ["content", "콘텐츠", "blog", "문서", "copy", "생성"],
      label: "입력부터 결과 생성까지 반복 사용하기 쉬운 생성 흐름",
    },
  ];

  const selected = candidates
    .filter((item) => item.keywords.some((keyword) => lowerIdea.includes(keyword)))
    .map((item) => item.label);

  if (selected.length > 0) {
    return selected.slice(0, 3);
  }

  return [
    "처음 보는 사람도 바로 이해할 수 있는 첫 화면",
    "설명보다 행동이 먼저 보이는 핵심 버튼과 흐름",
    "사용자가 다음 단계로 자연스럽게 이동하는 구조",
  ];
}

function deriveNextQuestions(primaryTypeId?: ServiceTypeId) {
  const commonQuestions = [
    "사용자가 처음 5초 안에 눌러야 하는 버튼은 무엇인가요?",
    "첫 화면에서 반드시 보여줘야 하는 정보는 무엇인가요?",
  ];

  switch (primaryTypeId) {
    case "landing":
      return [...commonQuestions, "문의만 받으면 충분한가요, 아니면 운영자가 직접 관리해야 하나요?"];
    case "web-service":
      return [...commonQuestions, "다시 방문한 사용자를 위해 저장돼야 하는 데이터는 무엇인가요?"];
    case "data-tool":
      return [...commonQuestions, "입력 파일 형식과 최종 결과 화면은 어떤 모습이어야 하나요?"];
    case "content-generator":
      return [...commonQuestions, "반복 생성에 필요한 입력 템플릿은 어떤 구조가 좋을까요?"];
    case "app":
      return [...commonQuestions, "모바일에서만 필요한 핵심 상호작용은 무엇인가요?"];
    default:
      return [...commonQuestions, "이번 주 안에 가장 먼저 출시할 기능 한 가지는 무엇인가요?"];
  }
}

function buildFitReason(
  serviceType: Omit<ServiceTypeRecommendation, "fitReason">,
  matchedKeywords: string[],
  prioritizeFreeTools: boolean,
) {
  if (matchedKeywords.length > 0) {
    return `${matchedKeywords.slice(0, 3).join(", ")} 같은 표현이 보여서 ${serviceType.name} 형태로 시작하는 편이 가장 자연스럽습니다.`;
  }

  if (prioritizeFreeTools && serviceType.complexity !== "높음") {
    return "무료 도구 중심으로 빠르게 검증하기 좋고, 이후에 확장해도 무리가 적은 구조입니다.";
  }

  return "현재 아이디어를 부담 없이 구현해보면서 다음 단계로 확장하기 좋은 출발점입니다.";
}

export function analyzeIdea({
  idea,
  prioritizeFreeTools = false,
}: IdeaAnalysisInput): IdeaAnalysisResult {
  const normalizedIdea = idea.trim();
  const lowerIdea = normalizedIdea.toLowerCase();

  const rankedServiceTypes = Object.values(serviceTypeCatalog)
    .map((serviceType) => {
      const matchedKeywords = containsAny(lowerIdea, keywordRules[serviceType.id]);
      let score = matchedKeywords.length * 3;

      if (
        serviceType.id === "web-service" &&
        /(dashboard|admin|account|login|auth|database|로그인|회원|관리|대시보드|데이터)/i.test(
          normalizedIdea,
        )
      ) {
        score += 3;
      }

      if (
        serviceType.id === "landing" &&
        /(landing|promo|marketing|reservation|inquiry|brand|랜딩|홍보|예약|문의|브랜드|소개)/i.test(
          normalizedIdea,
        )
      ) {
        score += 2;
      }

      if (
        serviceType.id === "content-generator" &&
        /(generate|generator|draft|document|report|content|생성|초안|문서|보고서|콘텐츠)/i.test(
          normalizedIdea,
        )
      ) {
        score += 2;
      }

      if (
        serviceType.id === "data-tool" &&
        /(upload|csv|chart|analytics|analysis|report|업로드|분석|차트|리포트|파일)/i.test(
          normalizedIdea,
        )
      ) {
        score += 2;
      }

      if (prioritizeFreeTools && serviceType.complexity !== "높음") {
        score += 1;
      }

      if (normalizedIdea.length > 70 && serviceType.id === "web-service") {
        score += 1;
      }

      return {
        ...serviceType,
        matchedKeywords,
        score,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((serviceType) => ({
      id: serviceType.id,
      name: serviceType.name,
      summary: serviceType.summary,
      complexity: serviceType.complexity,
      tags: serviceType.tags,
      fitReason: buildFitReason(
        serviceType,
        serviceType.matchedKeywords,
        prioritizeFreeTools,
      ),
    }));

  return {
    normalizedIdea,
    confidenceLabel: normalizedIdea.length > 80 ? "높음" : "보통",
    keyNeeds: deriveKeyNeeds(normalizedIdea),
    nextQuestions: deriveNextQuestions(rankedServiceTypes[0]?.id),
    serviceTypes: rankedServiceTypes,
  };
}

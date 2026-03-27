import type { PromptGeneratorInput, PromptStage } from "@/types/project";

function createContextSummary(input: PromptGeneratorInput) {
  const projectLabel = input.projectName?.trim() || "이름 미정 프로젝트";
  const selectedSkills =
    input.selectedSkills && input.selectedSkills.length > 0
      ? input.selectedSkills
          .map((skill) => `${skill.title} (${skill.sourceLabel})`)
          .join(", ")
      : "선택한 스킬 없음";

  return [
    `프로젝트 이름: ${projectLabel}`,
    `아이디어: ${input.idea.trim()}`,
    `시작 형태: ${input.serviceType}`,
    `예산 방향: ${
      input.budget === "free"
        ? "무료 도구 위주로 시작"
        : "유료 도구도 포함 가능"
    }`,
    `디자인 방향: ${
      input.design === "standard" ? "기본 UI 중심" : "브랜드형 UI 중심"
    }`,
    `작업 환경: ${
      input.environment === "local"
        ? "로컬 IDE 중심 작업"
        : "클라우드 IDE 또는 브라우저 작업"
    }`,
    `선택한 스킬: ${selectedSkills}`,
  ].join("\n");
}

function createSkillSetupBlock(input: PromptGeneratorInput) {
  if (!input.selectedSkills || input.selectedSkills.length === 0) {
    return [
      "선택된 스킬은 아직 없습니다.",
      "필요하다면 로컬 세팅 단계에서 함께 설치하면 좋은 스킬도 2~3개 추천해 주세요.",
    ].join("\n");
  }

  return input.selectedSkills
    .map((skill, index) => {
      const installLine = skill.installCommand
        ? `설치 명령어 참고: ${skill.installCommand}`
        : "설치 명령어가 없으면 저장소와 원본 페이지를 기준으로 설치 방법을 정리";

      return [
        `${index + 1}. ${skill.title} - ${skill.summary}`,
        `출처: ${skill.sourceLabel}`,
        installLine,
      ].join("\n");
    })
    .join("\n\n");
}

export function generatePromptStages(
  input: PromptGeneratorInput,
): PromptStage[] {
  const context = createContextSummary(input);
  const skillSetupBlock = createSkillSetupBlock(input);

  return [
    {
      stage: 1,
      title: "로컬 세팅과 도구 준비",
      objective:
        "개발 환경을 먼저 안정적으로 세팅하고, 선택한 스킬이 있다면 이 단계에서 함께 연결합니다.",
      prompt: `당신은 비개발자도 따라올 수 있게 설명하는 시니어 풀스택 코치입니다. 아래 프로젝트 정보를 기준으로, 로컬 개발을 바로 시작할 수 있는 세팅 가이드를 작성해 주세요.

${context}

[요청 사항]
1. Node.js, 패키지 매니저, Git, Next.js 프로젝트 생성까지 순서대로 설명해 주세요.
2. Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui 기준으로 초기 생성 명령어를 제안해 주세요.
3. 아래 선택 스킬이 있다면 어떤 순서로 설치하고 연결하면 좋은지 정리해 주세요.

${skillSetupBlock}

4. 각 명령어 아래에는 왜 필요한지 짧게 설명해 주세요.
5. 마지막에는 "여기까지 끝나면 구조 설계 단계로 이동" 체크리스트를 정리해 주세요.`,
      checklist: [
        "Node.js와 패키지 매니저 확인",
        "Next.js 기본 프로젝트 생성",
        "선택 스킬 설치 순서 정리",
      ],
    },
    {
      stage: 2,
      title: "화면 구현 시작",
      objective:
        "첫 화면과 핵심 흐름을 빠르게 만들 수 있도록 UI 구조와 구현 순서를 정리합니다.",
      prompt: `당신은 제품 감각이 좋은 프론트엔드 개발자입니다. 아래 프로젝트 정보를 기준으로, 첫 버전을 만드는 화면 구현 프롬프트를 작성해 주세요.

${context}

[요청 사항]
1. 첫 화면부터 필요한 주요 페이지를 우선순위대로 정리해 주세요.
2. 각 페이지에서 필요한 shadcn/ui 컴포넌트를 추천해 주세요.
3. 사용자 입장에서 이해하기 쉬운 문구와 CTA를 짧고 명확하게 제안해 주세요.
4. 모바일과 데스크톱에서 모두 무리 없는 레이아웃 방향을 함께 적어 주세요.`,
      checklist: [
        "핵심 페이지 우선순위 정리",
        "공통 UI 컴포넌트 선택",
        "첫 버전 화면 흐름 확정",
      ],
    },
    {
      stage: 3,
      title: "인프라와 데이터 연결",
      objective:
        "Supabase를 기준으로 인증, 데이터 구조, 서버 동작을 어떤 순서로 붙일지 정리합니다.",
      prompt: `당신은 백엔드와 인프라 설계에 강한 시니어 개발자입니다. 아래 프로젝트 정보를 기준으로 Supabase 중심 구조 초안을 작성해 주세요.

${context}

[요청 사항]
1. Supabase 프로젝트 생성부터 URL, Publishable Key 연결까지 설명해 주세요.
2. 필요한 테이블과 각 테이블의 핵심 컬럼을 제안해 주세요.
3. Next.js에서 서버 액션, 인증, 읽기/쓰기 흐름을 어떻게 나누면 좋은지 알려 주세요.
4. 마지막에는 환경변수와 보안 주의사항을 짧게 체크리스트로 정리해 주세요.`,
      checklist: [
        "Supabase 연결 정보 정리",
        "핵심 테이블 초안 구성",
        "인증과 서버 동작 흐름 정리",
      ],
    },
    {
      stage: 4,
      title: "배포와 운영 정리",
      objective:
        "Vercel 배포, 확인 포인트, AI 에이전트와 협업하는 방식까지 한 번에 정리합니다.",
      prompt: `당신은 서비스 출시 경험이 많은 시니어 엔지니어입니다. 아래 프로젝트 정보를 기준으로 배포와 운영 가이드를 작성해 주세요.

${context}

[요청 사항]
1. Vercel 배포 과정을 순서대로 설명해 주세요.
2. 배포 전 체크리스트와 배포 후 확인할 항목을 정리해 주세요.
3. AI 에이전트에게 수정 작업을 요청할 때 바로 붙여 넣을 수 있는 예시 문장을 3개 제안해 주세요.
4. 오류가 났을 때 어떤 로그를 복사해서 질문하면 좋은지 예시를 들어 주세요.`,
      checklist: [
        "Vercel 배포 준비",
        "배포 전후 확인 포인트 정리",
        "AI 협업용 요청 문장 준비",
      ],
    },
  ];
}

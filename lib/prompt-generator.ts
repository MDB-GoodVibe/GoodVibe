import type { PromptGeneratorInput, PromptStage } from "@/types/project";

function planningLines(input: PromptGeneratorInput) {
  const brief = input.planningBrief;
  if (!brief) {
    return [
      "- 문제 정의: (미입력)",
      "- 대상 사용자: (미입력)",
      "- 핵심 여정: (미입력)",
      "- MVP 범위: (미입력)",
      "- 제외 범위: (미입력)",
      "- 성공 기준: (미입력)",
      "- 기술 제약: (미입력)",
    ].join("\n");
  }

  return [
    `- 문제 정의: ${brief.problem || "(미입력)"}`,
    `- 대상 사용자: ${brief.targetUser || "(미입력)"}`,
    `- 핵심 여정: ${brief.userJourney || "(미입력)"}`,
    `- MVP 범위: ${brief.mvpScope || "(미입력)"}`,
    `- 제외 범위: ${brief.outOfScope || "(미입력)"}`,
    `- 성공 기준: ${brief.successCriteria || "(미입력)"}`,
    `- 기술 제약: ${brief.constraints || "(미입력)"}`,
  ].join("\n");
}

function selectedSkillLines(input: PromptGeneratorInput) {
  if (!input.selectedSkills || input.selectedSkills.length === 0) {
    return "- 선택된 추가 스킬 없음";
  }

  return input.selectedSkills
    .map((skill, index) => {
      const installLine = skill.installCommand
        ? `설치 명령: ${skill.installCommand}`
        : "설치 명령: 저장소 문서 참조";
      return `${index + 1}. ${skill.title} (${skill.sourceLabel})\n   ${installLine}`;
    })
    .join("\n");
}

function baseMeta(input: PromptGeneratorInput) {
  const projectName = input.projectName?.trim() || "이름 미정 프로젝트";
  return [
    `프로젝트명: ${projectName}`,
    `아이디어 원문: ${input.idea.trim() || "(미입력)"}`,
    `서비스 유형: ${input.serviceType}`,
    `예산: ${input.budget}`,
    `디자인: ${input.design}`,
    `환경: ${input.environment}`,
    `superpowers 상태: ${input.superpowersStatus ?? "not_installed"}`,
  ].join("\n");
}

function superpowersRequiredBlock() {
  return [
    "[필수: superpowers 구체화 단계]",
    "1. `brainstorming`을 먼저 사용한다.",
    "2. 답변 과정에서 사용자에게 반드시 질의응답을 진행해 누락된 요구사항을 채운다.",
    "3. 질의응답 종료 후 `writing-plans`로 구현 계획 초안을 만든다.",
  ].join("\n");
}

export function generatePromptStages(input: PromptGeneratorInput): PromptStage[] {
  const meta = baseMeta(input);
  const planning = planningLines(input);
  const skills = selectedSkillLines(input);

  return [
    {
      stage: 1,
      title: "Stage 1 - 아이디어 구체화 + 기준 문서 생성",
      objective:
        "superpowers 기반 질의응답으로 아이디어를 구체화하고, 이후 단계의 단일 기준 문서(project-brief.md)를 만든다.",
      prompt: `너는 시니어 제품 코치이자 구현 리드다.

[기본 정보]
${meta}

[기획 입력]
${planning}

${superpowersRequiredBlock()}

[작업 지시]
1. 사용자에게 필요한 확인 질문을 우선순위 5~8개로 진행한다.
2. 질문-답변 결과를 반영해 범위를 고정한다.
3. 아래 파일을 반드시 생성한다.
   - 파일명: project-brief.md
   - 포함 섹션:
     - 문제/사용자/핵심 시나리오
     - MVP 포함/제외 범위
     - 성공 지표
     - 기술 제약 및 리스크
     - 구현 우선순위
     - 열린 이슈(확정 안 된 항목)
4. 문서 하단에 "다음 단계 입력 요약" 섹션을 만들고 Stage 2~4에서 참조할 핵심 포인트를 8줄 이내로 정리한다.
5. 선택 스킬 설치가 필요하면 아래 목록을 반영해 설치 순서까지 제시한다.

[선택 스킬]
${skills}

[출력]
- 실행 체크리스트
- 생성 파일 경로
- 사용자에게 마지막 확인 질문 1~2개`,
      checklist: [
        "사용자 질의응답 완료",
        "project-brief.md 생성",
        "다음 단계 입력 요약 작성",
      ],
    },
    {
      stage: 2,
      title: "Stage 2 - UI/화면 설계 실행",
      objective:
        "Stage 1 산출물을 기준으로 화면 구조와 사용자 흐름을 설계하고 구현 순서를 만든다.",
      prompt: `Stage 1에서 생성한 project-brief.md를 먼저 읽어라.

[지시]
1. 문서의 "다음 단계 입력 요약"을 기준으로 화면 설계안을 만든다.
2. 필요한 경우에만 문서 본문 세부 항목을 참조한다.
3. 아래 산출물을 만든다.
   - ui-plan.md
   - 포함 내용: 페이지 목록, 페이지별 목적, 핵심 컴포넌트, CTA 문구, 모바일/데스크탑 차이, 구현 우선순위
4. 구현 단계에서 충돌 가능성이 있는 요구사항을 "모순/리스크" 항목으로 분리한다.

[출력]
- ui-plan.md 요약
- 바로 구현 가능한 첫 3개 작업`,
      checklist: [
        "project-brief.md 참조",
        "ui-plan.md 생성",
        "첫 구현 작업 3개 확정",
      ],
    },
    {
      stage: 3,
      title: "Stage 3 - 데이터/백엔드 설계 실행",
      objective:
        "Stage 1~2 산출물을 연결해 데이터 모델, 인증, API 계약을 확정한다.",
      prompt: `project-brief.md와 ui-plan.md를 읽은 뒤 진행하라.

[지시]
1. UI 흐름에 필요한 데이터 엔티티를 도출한다.
2. 테이블/관계/권한(RLS 포함)/API 계약을 설계한다.
3. 아래 산출물을 만든다.
   - backend-plan.md
   - 포함 내용: 스키마 초안, 인증/권한 정책, API 입출력 계약, 환경변수 목록, 마이그레이션 순서
4. "필수 구현"과 "후속 구현"을 분리한다.

[출력]
- backend-plan.md 요약
- 마이그레이션/구현 착수 순서`,
      checklist: [
        "project-brief.md 참조",
        "ui-plan.md 참조",
        "backend-plan.md 생성",
      ],
    },
    {
      stage: 4,
      title: "Stage 4 - 배포/검증/반복 준비",
      objective:
        "앞선 산출물을 바탕으로 배포 체크리스트와 운영 루프를 완성한다.",
      prompt: `project-brief.md, ui-plan.md, backend-plan.md를 읽고 진행하라.

[지시]
1. 배포 전 검증 항목을 우선순위로 정리한다.
2. 배포 후 모니터링/버그 트리아지/다음 개선 루프를 설계한다.
3. 아래 산출물을 만든다.
   - launch-plan.md
   - 포함 내용: 배포 체크리스트, 장애 대응 기준, 로그/모니터링 포인트, 1주 개선 백로그
4. 사용자에게 "출시 가능/보류" 판정과 근거를 제시한다.

[출력]
- launch-plan.md 요약
- 출시 판정(가능/보류) + 근거`,
      checklist: [
        "이전 단계 산출물 3개 참조",
        "launch-plan.md 생성",
        "출시 판정 제시",
      ],
    },
  ];
}

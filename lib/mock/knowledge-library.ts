import { buildExternalResourceSeedSections } from "@/lib/knowledge/external-resource-brief";
import { classifyExternalResource } from "@/lib/knowledge/external-resource";
import type { KnowledgeArticle, KnowledgeTrack } from "@/types/good-vibe";

type ArticleSection = {
  heading: string;
  blocks: string[];
};

type ArticleSeedInput = {
  slug: string;
  title: string;
  summary: string;
  track: KnowledgeTrack;
  topic: string;
  featured?: boolean;
  platformTags?: string[];
  toolTags?: string[];
  resourceUrl?: string | null;
  sections: ArticleSection[];
};

const authorName = "Good Vibe";
const publishedBase = new Date(Date.UTC(2026, 1, 1, 9, 0, 0));

function bullets(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function steps(items: string[]) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function createTimestamp(index: number) {
  const date = new Date(publishedBase);
  date.setUTCDate(publishedBase.getUTCDate() + index);
  date.setUTCHours(9 + (index % 5), 0, 0, 0);
  return date.toISOString();
}

function createMarkdown(sections: ArticleSection[]) {
  return sections
    .map((section) => `## ${section.heading}\n${section.blocks.join("\n\n")}`)
    .join("\n\n");
}

function createArticle(index: number, input: ArticleSeedInput): KnowledgeArticle {
  const publishedAt = createTimestamp(index);
  const externalTaxonomy =
    input.track === "external" || input.resourceUrl
      ? classifyExternalResource({
          url: input.resourceUrl,
          title: input.title,
          summary: input.summary,
          platformTags: input.platformTags ?? [],
          toolTags: input.toolTags ?? [],
        })
      : null;
  const sections =
    input.track === "external"
      ? [
          ...input.sections,
          ...buildExternalResourceSeedSections({
            title: input.title,
            summary: input.summary,
            platformTags: input.platformTags ?? [],
            toolTags: input.toolTags ?? [],
            resourceUrl: input.resourceUrl ?? null,
            taxonomy: externalTaxonomy,
          }),
        ]
      : input.sections;

  return {
    id: `knowledge-${input.slug}`,
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    contentMd: createMarkdown(sections),
    track: input.track,
    topic: input.topic,
    status: "published",
    featured: Boolean(input.featured),
    platformTags: input.platformTags ?? ["웹"],
    toolTags: input.toolTags ?? [],
    resourceUrl: input.resourceUrl ?? null,
    authorName,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    externalTaxonomy,
    source: "seed",
  };
}

const basicsArticles: ArticleSeedInput[] = [
  {
    slug: "vibe-coding-what-is",
    title: "바이브 코딩이란 무엇인가",
    summary:
      "바이브 코딩의 핵심은 코드를 외우는 것이 아니라 목표, 맥락, 검증 기준을 자연어로 명확하게 전달하는 데 있습니다.",
    track: "basics",
    topic: "concepts-and-tips",
    featured: true,
    platformTags: ["공통"],
    toolTags: ["Claude Code", "Codex", "Cursor"],
    sections: [
      {
        heading: "무엇을 한다는 뜻인가",
        blocks: [
          "바이브 코딩은 AI에게 코드를 대신 써 달라고 막연하게 요청하는 방식이 아닙니다. 만들고 싶은 서비스의 목적, 사용자, 화면 흐름, 제약 조건, 검증 기준을 자연어로 구조화해서 전달하고, AI가 그 맥락 안에서 설계와 구현을 돕게 만드는 작업 방식입니다.",
          bullets([
            "정답 코드를 외우기보다 문제를 잘 정의하는 능력이 중요합니다.",
            "한 번에 완성하려 하기보다 작은 단계로 나누어 반복합니다.",
            "생성 결과를 그대로 믿지 않고 테스트와 리뷰로 검증합니다.",
          ]),
        ],
      },
      {
        heading: "왜 기초가 더 중요해졌나",
        blocks: [
          "AI가 강해질수록 오히려 사용자에게 필요한 기본기가 바뀝니다. 프레임워크 문법을 전부 기억하는 것보다 어떤 기능이 진짜 필요한지, 데이터가 어떻게 흘러야 하는지, 무엇이 성공인지 설명하는 능력이 더 큰 차이를 만듭니다.",
          bullets([
            "좋은 요청은 좋은 기획서의 축약본처럼 읽힙니다.",
            "좋은 피드백은 무엇이 어색했는지 근거를 남깁니다.",
            "좋은 검증은 화면, 데이터, 예외 상황을 분리해 확인합니다.",
          ]),
        ],
      },
      {
        heading: "처음 시작하는 사람의 안전한 순서",
        blocks: [
          steps([
            "만들 서비스의 한 줄 설명과 핵심 사용자 한 명을 먼저 적습니다.",
            "첫 화면과 가장 중요한 동작 한 가지를 정합니다.",
            "AI에게 폴더 구조, 화면 흐름, 데이터 구조를 먼저 제안받습니다.",
            "작동 여부를 확인한 뒤 문구, 디자인, 예외 처리 순으로 다듬습니다.",
          ]),
          '예시 요청: "카페 예약 문의를 받는 단일 페이지를 만들고 싶어. 방문자가 메뉴, 위치, 예약 문의 폼을 한 화면에서 볼 수 있게 구성해 줘. 먼저 필요한 화면 섹션과 데이터 항목부터 정리해 줘."',
        ],
      },
    ],
  },
  {
    slug: "tool-setup-windows-mac",
    title: "Windows와 Mac에서 바이브 코딩 도구 준비하기",
    summary:
      "Node.js, Git, 터미널, 에디터, 로그인 상태까지 한 번에 점검해야 이후의 시행착오가 크게 줄어듭니다.",
    track: "basics",
    topic: "tool-setup",
    featured: true,
    platformTags: ["Windows", "macOS"],
    toolTags: ["Node.js", "Git", "VS Code", "Claude Code"],
    sections: [
      {
        heading: "가장 먼저 준비할 것",
        blocks: [
          bullets([
            "Node.js LTS 버전 설치 여부 확인",
            "Git 설치 및 터미널에서 동작 여부 확인",
            "VS Code, Cursor 같은 편한 편집기 선택",
            "AI 도구 로그인과 프로젝트 권한 확인",
          ]),
          "설치보다 중요한 것은 실제 프로젝트 폴더 안에서 명령이 동작하는지 확인하는 것입니다. 버전은 맞지만 PATH가 꼬여 있거나, 로그인은 되었지만 권한이 없는 경우가 흔합니다.",
        ],
      },
      {
        heading: "초기 점검 체크리스트",
        blocks: [
          steps([
            "터미널에서 node -v, npm -v, git --version을 실행해 기본 환경을 확인합니다.",
            "새 폴더를 만들고 npm init 또는 기존 프로젝트 열기로 실제 작업 공간을 준비합니다.",
            "AI 도구를 실행해 로그인, 권한, 파일 읽기 가능 여부를 확인합니다.",
            "테스트용 파일을 만들고 수정, 실행, 삭제까지 한 번 해 봅니다.",
          ]),
        ],
      },
      {
        heading: "초보자가 자주 막히는 지점",
        blocks: [
          bullets([
            "회사 PC나 보안 도구 때문에 스크립트 실행이 막히는 경우",
            "Windows에서 Git 또는 Node 경로가 잡히지 않는 경우",
            "프로젝트 루트가 아닌 다른 폴더에서 도구를 실행하는 경우",
            "환경 변수 파일을 만들었지만 서버 재시작을 하지 않은 경우",
          ]),
          "설치가 끝났다면 바로 복잡한 서비스를 만들지 말고, 제목 하나 바꾸는 작은 작업을 먼저 성공시키는 것이 좋습니다. 첫 성공 경험이 이후 전체 흐름의 속도를 결정합니다.",
        ],
      },
    ],
  },
  {
    slug: "vibe-coding-glossary",
    title: "바이브 코딩에서 자주 보는 용어 정리",
    summary:
      "Skill, MCP, 프롬프트, 컨텍스트, 시드, 마이그레이션 같은 단어를 이해하면 도구 설명이 훨씬 빨리 읽힙니다.",
    track: "basics",
    topic: "glossary",
    platformTags: ["공통"],
    toolTags: ["Skill", "MCP", "Prompt", "Migration"],
    sections: [
      {
        heading: "꼭 알아야 하는 핵심 용어",
        blocks: [
          bullets([
            "프롬프트: AI에게 전달하는 요청과 맥락",
            "컨텍스트: 현재 작업에 필요한 배경 정보와 상태",
            "스킬: 특정 작업을 더 잘 수행하도록 정리된 지침 묶음",
            "MCP: 외부 도구와 데이터를 연결하는 표준 방식",
            "시드: 개발용 기본 데이터를 DB에 넣는 작업",
            "마이그레이션: DB 구조를 변경하는 기록 가능한 SQL 변경",
          ]),
        ],
      },
      {
        heading: "왜 용어를 알아야 하는가",
        blocks: [
          "용어를 모르면 같은 일을 두고도 서로 다른 의미로 대화하게 됩니다. 예를 들어 '데이터를 넣어 줘'라는 요청은 시드인지, 실제 운영 데이터 입력인지, 테스트용 임시 값인지에 따라 작업 방식이 완전히 달라집니다.",
          bullets([
            "기획자와 개발자가 같은 단어를 같은 뜻으로 써야 수정 요청이 정확해집니다.",
            "AI 도구 문서를 읽을 때 필요한 부분만 빠르게 찾을 수 있습니다.",
            "오류 메시지를 검색하거나 질문할 때 설명력이 좋아집니다.",
          ]),
        ],
      },
      {
        heading: "실무에서 자주 쓰는 표현 예시",
        blocks: [
          steps([
            '"현재 컨텍스트를 유지한 채 이 기능만 분리해 줘."',
            '"이 작업은 스킬로 반복 가능하게 만들어 줘."',
            '"새 테이블이 필요하면 마이그레이션부터 작성해 줘."',
            '"운영 DB가 아니라 시드 데이터로만 채워 줘."',
          ]),
        ],
      },
    ],
  },
  {
    slug: "prompt-first-planning",
    title: "좋은 요청은 어떻게 쓰는가",
    summary:
      "AI에게 일을 잘 맡기려면 결과물, 제약 조건, 사용 대상, 완료 기준을 함께 주는 습관이 필요합니다.",
    track: "basics",
    topic: "concepts-and-tips",
    platformTags: ["공통"],
    toolTags: ["Prompt", "Specification"],
    sections: [
      {
        heading: "좋은 요청의 구조",
        blocks: [
          "좋은 요청은 보통 네 가지를 담습니다. 무엇을 만들지, 누가 쓸지, 어디까지 할지, 무엇으로 성공 여부를 판단할지를 함께 말해야 합니다.",
          bullets([
            "목표: 어떤 화면이나 기능을 만들지",
            "대상: 어떤 사용자가 어떤 상황에서 쓰는지",
            "범위: 이번 요청에서 포함할 것과 제외할 것",
            "검증: 완료 후 무엇을 확인하면 되는지",
          ]),
        ],
      },
      {
        heading: "나쁜 요청과 좋은 요청의 차이",
        blocks: [
          '"앱 하나 만들어 줘"는 너무 넓고 검증 기준이 없습니다. 반대로 "모바일 우선 랜딩 페이지를 만들고, 첫 화면에는 문제 제기와 CTA만 넣어 줘. 로그인과 결제는 이번 범위에서 제외해 줘"는 훨씬 실행 가능성이 높습니다.',
          bullets([
            "넓은 표현보다 구체적인 결과 형식을 먼저 말합니다.",
            "디자인 감성보다 사용자 행동 목표를 먼저 말합니다.",
            "완성 요청보다 초안 요청이 더 안정적입니다.",
          ]),
        ],
      },
      {
        heading: "바로 써먹는 요청 템플릿",
        blocks: [
          steps([
            "문제: 누구의 어떤 문제를 해결하려는지 한 문장으로 적습니다.",
            "결과물: 화면, API, DB, 문서 중 무엇을 원하는지 정합니다.",
            "제약: 기술 스택, 일정, 예산, 반드시 포함하거나 제외할 요소를 적습니다.",
            "검증: 테스트, 체크리스트, 확인 포인트를 마지막에 붙입니다.",
          ]),
          '템플릿: "초보자가 쓸 수 있는 일정 관리 웹앱 초안을 만들고 싶어. 이번 단계에서는 홈 화면과 일정 추가 폼만 만들어 줘. Next.js와 Supabase를 기준으로 구조를 잡고, 나중에 알림 기능을 붙이기 쉬운 형태로 설명해 줘. 마지막에는 내가 직접 확인할 체크리스트도 넣어 줘."',
        ],
      },
    ],
  },
  {
    slug: "requirement-writing-checklist",
    title: "기능 요구사항을 짧고 강하게 쓰는 법",
    summary:
      "기능 목록만 나열하면 AI가 추측을 많이 하게 되고, 요구사항을 사용자 행동 기준으로 쓰면 결과가 안정됩니다.",
    track: "basics",
    topic: "concepts-and-tips",
    platformTags: ["공통"],
    toolTags: ["Requirement", "User Flow"],
    sections: [
      {
        heading: "기능보다 행동을 먼저 적기",
        blocks: [
          "초보자는 '게시판 만들기', '로그인 붙이기'처럼 기능명으로만 요청하는 경우가 많습니다. 하지만 실제로 중요한 것은 사용자가 무엇을 보고, 무엇을 입력하고, 어떤 결과를 받는지입니다.",
          bullets([
            "사용자는 첫 화면에서 무엇을 이해해야 하는가",
            "사용자는 어떤 값을 입력하거나 선택하는가",
            "완료 후 무엇을 보게 되는가",
            "실패하면 어떤 메시지를 보여 줄 것인가",
          ]),
        ],
      },
      {
        heading: "요구사항 문서 최소 구성",
        blocks: [
          steps([
            "한 줄 목표",
            "핵심 사용자 1명",
            "주요 화면 3개 이내",
            "성공 조건 3개",
            "이번 범위에서 제외할 항목",
          ]),
          "이 다섯 가지만 있어도 AI는 훨씬 덜 헤매고, 이후 사람이 검토할 때도 논점이 선명해집니다.",
        ],
      },
      {
        heading: "작게 쪼개는 기준",
        blocks: [
          bullets([
            "데이터 저장이 필요한가",
            "권한 구분이 필요한가",
            "외부 연동이 필요한가",
            "디자인보다 로직이 먼저 필요한가",
          ]),
          "이 기준 중 하나라도 '예'라면 별도 단계로 분리하는 것이 좋습니다. 작은 성공을 여러 번 쌓는 쪽이 큰 실패를 한 번 막는 것보다 훨씬 효율적입니다.",
        ],
      },
    ],
  },
  {
    slug: "project-folder-and-docs",
    title: "프로젝트 폴더와 문서를 먼저 잡아야 하는 이유",
    summary:
      "폴더 구조와 핵심 문서가 정리되어 있으면 AI도 덜 흔들리고, 사람이 다시 들어와도 맥락을 잃지 않습니다.",
    track: "basics",
    topic: "workflow-and-ops",
    platformTags: ["공통"],
    toolTags: ["README", "CLAUDE.md", "docs"],
    sections: [
      {
        heading: "처음부터 필요한 문서",
        blocks: [
          bullets([
            "README: 서비스가 무엇인지, 어떻게 실행하는지",
            "overview 또는 product brief: 무엇을 만들고 왜 만드는지",
            "환경 변수 안내: 어떤 키가 필요한지",
            "배포 메모: 어디에 배포했고 무엇을 확인해야 하는지",
          ]),
          "문서가 한 줄도 없으면 다음 세션의 AI는 물론, 미래의 나도 프로젝트를 다시 이해하는 데 시간을 크게 씁니다.",
        ],
      },
      {
        heading: "폴더 구조를 단순하게 유지하는 법",
        blocks: [
          "초기에는 폴더를 예쁘게 나누는 것보다 찾기 쉬운 구조가 중요합니다. 너무 이른 추상화는 오히려 수정 비용을 높입니다.",
          bullets([
            "app 또는 src 아래 화면 단위로 시작합니다.",
            "lib에는 재사용되는 로직만 모읍니다.",
            "scripts는 DB 적용, 시드, 배포 확인처럼 반복 작업만 둡니다.",
            "docs는 짧아도 좋으니 팀이 공유할 결정을 남깁니다.",
          ]),
        ],
      },
      {
        heading: "문서와 AI를 연결하는 습관",
        blocks: [
          steps([
            "작업 전 현재 목표를 문서 한 줄로 갱신합니다.",
            "중요한 결정은 채팅 기록 대신 파일에 남깁니다.",
            "다음 세션에서 AI에게 먼저 관련 문서를 읽게 합니다.",
            "배포와 DB 변경 내역은 따로 누적 기록합니다.",
          ]),
        ],
      },
    ],
  },
  {
    slug: "debug-with-ai-basics",
    title: "AI와 함께 디버깅할 때 꼭 지켜야 할 순서",
    summary:
      "오류를 복사해서 붙여 넣는 것만으로는 부족하고, 재현 조건과 기대 결과를 함께 주어야 빠르게 원인을 좁힐 수 있습니다.",
    track: "basics",
    topic: "coding-basics",
    platformTags: ["공통"],
    toolTags: ["Debugging", "Logs", "Repro"],
    sections: [
      {
        heading: "디버깅의 출발점",
        blocks: [
          "AI는 현재 무엇이 실패했는지보다, 내가 기대한 동작이 무엇이었는지 알 때 더 잘 도와줍니다. 오류 문장만 던지지 말고 언제, 어디서, 어떤 입력으로 실패했는지를 같이 주는 습관이 중요합니다.",
          bullets([
            "실패 화면 또는 위치",
            "재현 단계",
            "실제 결과",
            "기대한 결과",
          ]),
        ],
      },
      {
        heading: "질문 순서를 바꾸면 해결 속도가 빨라진다",
        blocks: [
          steps([
            "이 오류가 언제부터 발생했는지 먼저 확인합니다.",
            "최근 바뀐 파일이나 환경 변수를 좁힙니다.",
            "가설을 세우고 로그나 콘솔로 실제 값을 확인합니다.",
            "수정 후 같은 경로로 다시 재현합니다.",
          ]),
          "AI에게 처음부터 해결책을 달라고 하기보다 원인 후보를 3개로 좁혀 달라고 요청하면 훨씬 정확한 답을 얻는 경우가 많습니다.",
        ],
      },
      {
        heading: "초보자가 많이 하는 실수",
        blocks: [
          bullets([
            "오류가 난 줄 알고 다른 파일을 먼저 고치는 것",
            "동작은 하지만 틀린 값을 넣고 있다는 사실을 놓치는 것",
            "수정 후 브라우저 캐시나 서버 재시작을 하지 않는 것",
            "로그 없이 감으로만 수정하는 것",
          ]),
        ],
      },
    ],
  },
  {
    slug: "git-basics-for-vibe-coders",
    title: "비개발자도 알아야 하는 Git 최소 기본기",
    summary:
      "브랜치, 커밋, 되돌리기 개념만 알아도 AI와 함께 작업할 때 훨씬 덜 불안해집니다.",
    track: "basics",
    topic: "coding-basics",
    platformTags: ["공통"],
    toolTags: ["Git", "Branch", "Commit"],
    sections: [
      {
        heading: "왜 Git을 알아야 하는가",
        blocks: [
          "AI와 작업하면 파일이 빠르게 많이 바뀝니다. 이때 Git은 저장 버튼이 아니라 시간 여행 기록장 역할을 합니다. 무엇을 바꿨는지, 어디서부터 이상해졌는지, 어떤 상태로 돌아갈 수 있는지를 보장해 줍니다.",
          bullets([
            "브랜치: 별도 실험 공간",
            "커밋: 의미 있는 저장 지점",
            "diff: 무엇이 바뀌었는지 비교하는 화면",
          ]),
        ],
      },
      {
        heading: "처음 익힐 명령의 범위",
        blocks: [
          steps([
            "git status로 현재 상태를 봅니다.",
            "git diff로 바뀐 내용을 확인합니다.",
            "git add와 git commit으로 작은 단위 저장을 합니다.",
            "실험은 새 브랜치에서 시작합니다.",
          ]),
          "처음부터 어려운 명령을 다 알 필요는 없습니다. 대신 바꾸기 전과 바꾼 후를 비교하는 습관이 가장 중요합니다.",
        ],
      },
      {
        heading: "AI와 함께 쓸 때의 안전 수칙",
        blocks: [
          bullets([
            "큰 작업 전에 먼저 커밋을 남깁니다.",
            "의미가 다른 변경은 한 커밋에 섞지 않습니다.",
            "자동 생성 파일까지 함께 바뀌었는지 diff를 확인합니다.",
            "되돌릴 자신이 없는 명령은 AI에게 설명부터 요청합니다.",
          ]),
        ],
      },
    ],
  },
  {
    slug: "test-before-trust",
    title: "생성된 코드는 왜 반드시 테스트해야 하는가",
    summary:
      "AI가 만든 코드는 그럴듯해 보이지만, 실제 사용자 입력과 예외 상황까지 통과하는지는 별개의 문제입니다.",
    track: "basics",
    topic: "coding-basics",
    platformTags: ["공통"],
    toolTags: ["Test", "QA", "Review"],
    sections: [
      {
        heading: "그럴듯함과 정확함은 다르다",
        blocks: [
          "AI는 문법적으로 맞고 보기 좋은 코드를 빠르게 만들 수 있습니다. 하지만 실제 데이터와 예외 케이스를 모두 만족하는지는 실행해 보기 전까지 알 수 없습니다. 그래서 테스트는 선택이 아니라 검증 장치입니다.",
          bullets([
            "정상 입력이 되는지",
            "빈 값과 잘못된 값에서 안전한지",
            "권한이 없는 사용자가 접근 못 하는지",
            "배포 환경에서도 같은 결과가 나는지",
          ]),
        ],
      },
      {
        heading: "초보자용 최소 테스트 세트",
        blocks: [
          steps([
            "기본 화면이 열리는지 확인합니다.",
            "폼 입력과 저장이 되는지 확인합니다.",
            "잘못된 입력에서 안내 문구가 보이는지 확인합니다.",
            "새로고침 후에도 저장 내용이 유지되는지 확인합니다.",
          ]),
        ],
      },
      {
        heading: "AI에게 테스트를 부탁하는 방법",
        blocks: [
          '예시 요청: "이 기능이 실패하기 쉬운 경계 조건을 먼저 정리하고, 최소 테스트 케이스를 목록으로 만들어 줘. 그 다음 자동화 가능한 테스트와 사람이 직접 확인해야 할 테스트를 나눠 줘."',
          bullets([
            "테스트 코드 작성",
            "테스트 실행과 실패 원인 정리",
            "수정 후 재검증",
          ]),
        ],
      },
    ],
  },
  {
    slug: "data-model-thinking-basics",
    title: "서비스를 만들기 전에 데이터 구조부터 생각하기",
    summary:
      "화면보다 먼저 엔티티와 관계를 생각해 두면 나중에 기능이 늘어나도 흔들림이 적습니다.",
    track: "basics",
    topic: "coding-basics",
    platformTags: ["공통"],
    toolTags: ["Database", "Schema", "Entity"],
    sections: [
      {
        heading: "데이터 관점으로 서비스 보기",
        blocks: [
          "모든 서비스는 결국 누가 무엇을 만들고, 읽고, 수정하고, 삭제하는지의 흐름입니다. 화면은 바뀌어도 데이터 구조는 더 오래 남기 때문에, 초기부터 주요 엔티티를 잡아 두는 것이 중요합니다.",
          bullets([
            "사용자",
            "콘텐츠 또는 문서",
            "상태값",
            "기록 시점과 수정 시점",
          ]),
        ],
      },
      {
        heading: "초기 스키마를 설계하는 질문",
        blocks: [
          steps([
            "이 서비스의 핵심 객체는 무엇인가",
            "한 객체가 여러 개를 가질 수 있는가",
            "공개와 비공개를 나눌 필요가 있는가",
            "언제 생성되고 언제 수정되는가",
          ]),
        ],
      },
      {
        heading: "AI에게 스키마를 요청할 때 주의점",
        blocks: [
          bullets([
            "컬럼 이름만 달라고 하지 말고 사용 시나리오를 같이 줍니다.",
            "권한과 공개 범위를 먼저 설명합니다.",
            "나중에 추가될 기능까지 한 줄 정도 언급합니다.",
            "마이그레이션과 시드 데이터 예시를 함께 요청하면 좋습니다.",
          ]),
        ],
      },
    ],
  },
  {
    slug: "first-release-checklist",
    title: "첫 공개 전에 반드시 확인할 기본 체크리스트",
    summary:
      "서비스를 처음 외부에 보여 주기 전에는 기능보다 신뢰를 무너뜨릴 요소부터 빠르게 걷어내야 합니다.",
    track: "basics",
    topic: "workflow-and-ops",
    platformTags: ["공통"],
    toolTags: ["Launch", "Checklist", "QA"],
    sections: [
      {
        heading: "사용자 입장에서 먼저 보기",
        blocks: [
          bullets([
            "첫 화면에서 서비스가 무엇인지 5초 안에 이해되는가",
            "버튼과 폼이 실제로 동작하는가",
            "모바일 화면에서도 읽기 쉬운가",
            "오류가 나더라도 사용자가 다음 행동을 알 수 있는가",
          ]),
        ],
      },
      {
        heading: "운영자 입장에서 확인할 것",
        blocks: [
          bullets([
            "환경 변수와 비밀 키가 노출되지 않는가",
            "문의, 가입, 저장 같은 핵심 데이터가 실제 DB에 남는가",
            "잘못된 값이 들어왔을 때 로그를 확인할 수 있는가",
            "문제가 생기면 어디를 보면 되는지 알고 있는가",
          ]),
        ],
      },
      {
        heading: "첫 공개의 목표는 완벽이 아니다",
        blocks: [
          "첫 공개는 전체 완성도를 증명하는 자리가 아니라, 핵심 가치가 통하는지 확인하는 자리입니다. 그래서 기능을 늘리는 대신 혼란을 줄이고, 사용자가 한 번이라도 끝까지 경험할 수 있게 만드는 편이 좋습니다.",
        ],
      },
    ],
  },
];

const levelUpArticles: ArticleSeedInput[] = [
  {
    slug: "level-up-context-management",
    title: "긴 프로젝트에서 컨텍스트를 지키는 법",
    summary:
      "서비스가 커질수록 AI는 방향을 잃기 쉬우므로, 문서와 범위 관리 체계를 먼저 깔아 두는 것이 중요합니다.",
    track: "level-up",
    topic: "workflow-and-ops",
    featured: true,
    platformTags: ["공통"],
    toolTags: ["Overview", "Plan", "Docs"],
    sections: [
      {
        heading: "왜 프로젝트가 커질수록 흔들리는가",
        blocks: [
          "작은 작업에서는 AI가 현재 대화만으로도 충분히 정확하게 움직입니다. 하지만 파일 수가 늘고 예외 상황이 많아지면, 현재 목표와 과거 결정이 분리되면서 불필요한 수정이나 중복 구현이 자주 생깁니다.",
          bullets([
            "지금 무엇을 하는지",
            "무엇은 이번 범위가 아닌지",
            "이전 결정이 무엇이었는지",
            "검증이 어디까지 끝났는지",
          ]),
        ],
      },
      {
        heading: "실전 운영 방식",
        blocks: [
          steps([
            "프로젝트 개요 문서를 루트에 두고 항상 최신 상태를 유지합니다.",
            "현재 작업 목표와 제외 범위를 짧게 적어 둡니다.",
            "중요한 결정은 채팅이 아니라 파일에 기록합니다.",
            "큰 작업은 하위 작업으로 쪼개고 검증 단위를 분리합니다.",
          ]),
        ],
      },
      {
        heading: "유지보수까지 생각한 요청 방식",
        blocks: [
          '예시 요청: "현재 프로젝트 문서를 먼저 읽고, 이번 작업은 결제 기능이 아니라 가격 안내 UI만 다루어 줘. 기존 인증 흐름은 건드리지 말고, 변경 파일과 테스트 포인트를 마지막에 정리해 줘."',
        ],
      },
    ],
  },
  {
    slug: "level-up-security-basics",
    title: "서비스 운영 관점에서 보는 기본 보안",
    summary:
      "API 키를 숨기는 것만이 보안이 아니며, 권한 분리와 로그 관리, 공개 범위 통제가 함께 설계되어야 합니다.",
    track: "level-up",
    topic: "security",
    featured: true,
    platformTags: ["공통"],
    toolTags: ["Env", "Supabase", "RLS"],
    sections: [
      {
        heading: "초보자가 놓치기 쉬운 보안 포인트",
        blocks: [
          bullets([
            "프론트엔드에 서버 전용 키를 넣는 실수",
            "로그에 토큰이나 개인정보를 남기는 실수",
            "관리자와 일반 사용자 권한을 같은 코드로 처리하는 실수",
            "테스트용 우회 코드를 배포 전에 제거하지 않는 실수",
          ]),
        ],
      },
      {
        heading: "기본적으로 나눠야 할 것",
        blocks: [
          bullets([
            "공개 가능한 키와 서버 전용 키",
            "읽기 권한과 쓰기 권한",
            "운영 데이터와 테스트 데이터",
            "관리자 화면과 일반 사용자 화면",
          ]),
          "특히 Supabase 같은 백엔드 서비스는 테이블 정책과 서비스 롤 키의 역할을 정확히 이해해야 안전합니다.",
        ],
      },
      {
        heading: "배포 전 보안 점검 순서",
        blocks: [
          steps([
            "환경 변수 파일과 배포 환경 변수를 다시 대조합니다.",
            "브라우저 네트워크 탭에서 민감한 값이 보이지 않는지 확인합니다.",
            "권한이 없는 계정으로 관리자 기능 접근을 시도합니다.",
            "에러 로그에 사용자 데이터가 남지 않는지 확인합니다.",
          ]),
        ],
      },
    ],
  },
  {
    slug: "level-up-saas-keys-guide",
    title: "주요 SaaS 키와 설정을 연결하는 실전 감각",
    summary:
      "Supabase, Vercel, OpenAI 같은 서비스는 키의 종류와 사용 위치를 정확히 구분해야 안정적으로 연결됩니다.",
    track: "level-up",
    topic: "saas-guides",
    platformTags: ["Web"],
    toolTags: ["Supabase", "Vercel", "OpenAI"],
    sections: [
      {
        heading: "먼저 구분해야 할 키 유형",
        blocks: [
          bullets([
            "브라우저에 노출 가능한 공개 키",
            "서버에서만 써야 하는 비밀 키",
            "관리 작업 전용의 강한 권한 키",
            "배포 플랫폼의 환경 변수 이름과 실제 값",
          ]),
        ],
      },
      {
        heading: "서비스별로 보는 연결 포인트",
        blocks: [
          bullets([
            "Supabase: URL, publishable key, service role key",
            "Vercel: 프로젝트별 환경 변수와 프리뷰/프로덕션 구분",
            "OpenAI: 서버에서만 써야 하는 API 키와 사용량 추적",
          ]),
          "이때 중요한 것은 키를 찾는 위치보다 어떤 코드가 그 키를 읽는지입니다. 같은 값이라도 브라우저 코드에서 읽으면 바로 노출될 수 있습니다.",
        ],
      },
      {
        heading: "연결 후 확인해야 하는 것",
        blocks: [
          steps([
            "로컬 개발 환경에서 먼저 정상 동작을 확인합니다.",
            "프리뷰 배포에서 동일하게 동작하는지 봅니다.",
            "실패 시 에러 메시지가 과도하게 노출되지 않는지 확인합니다.",
            "권한이 큰 키는 서버 코드 외부에서 참조되지 않는지 검색합니다.",
          ]),
        ],
      },
    ],
  },
  {
    slug: "level-up-auth-and-role-design",
    title: "인증과 권한 설계를 빨리 해 두어야 하는 이유",
    summary:
      "로그인 기능은 붙였다 뗄 수 있어 보여도, 실제로는 데이터 구조와 화면 흐름 전체에 큰 영향을 줍니다.",
    track: "level-up",
    topic: "security",
    platformTags: ["Web"],
    toolTags: ["Auth", "Role", "Access Control"],
    sections: [
      {
        heading: "인증과 권한은 다른 문제다",
        blocks: [
          "인증은 '누구인지 확인하는 일'이고, 권한은 '무엇을 할 수 있는지 정하는 일'입니다. 로그인만 붙인다고 관리자 페이지가 안전해지지는 않습니다.",
          bullets([
            "비로그인 사용자",
            "일반 사용자",
            "운영자 또는 관리자",
            "특정 팀이나 조직 소속 사용자",
          ]),
        ],
      },
      {
        heading: "초기 설계 질문",
        blocks: [
          steps([
            "어떤 화면이 로그인 없이 공개되는가",
            "누가 어떤 데이터를 수정할 수 있는가",
            "관리자는 무엇을 더 볼 수 있는가",
            "탈퇴나 계정 비활성화 시 데이터는 어떻게 처리할 것인가",
          ]),
        ],
      },
      {
        heading: "나중에 커지기 쉬운 지점",
        blocks: [
          bullets([
            "사용자별 소유 데이터",
            "공개와 비공개 콘텐츠",
            "검수 승인 흐름",
            "관리자 전용 도구와 로그",
          ]),
          "처음에는 단순해 보여도 이 축이 생기면 스키마, API, 화면 분기 모두 달라지므로 초기에 최소한의 구조는 잡아 두는 편이 좋습니다.",
        ],
      },
    ],
  },
  {
    slug: "level-up-supabase-schema-planning",
    title: "Supabase 기준으로 테이블을 설계할 때의 사고법",
    summary:
      "테이블은 화면을 따라 만드는 것이 아니라, 핵심 엔티티와 공개 정책을 기준으로 설계해야 수정 비용이 낮습니다.",
    track: "level-up",
    topic: "saas-guides",
    platformTags: ["Web"],
    toolTags: ["Supabase", "Schema", "RLS"],
    sections: [
      {
        heading: "테이블을 나누는 기준",
        blocks: [
          bullets([
            "생명 주기가 다른 데이터인가",
            "권한 규칙이 다른가",
            "조회 패턴이 다른가",
            "나중에 별도 관리가 필요한가",
          ]),
          "예를 들어 게시글과 댓글은 함께 보이더라도 생성 규칙, 삭제 정책, 필드 구조가 다르므로 분리하는 편이 일반적입니다.",
        ],
      },
      {
        heading: "Supabase에서 특히 중요한 포인트",
        blocks: [
          bullets([
            "created_at, updated_at 같은 공통 컬럼",
            "slug, status, published_at 같은 운영 컬럼",
            "관계 테이블과 외래 키",
            "RLS 정책을 고려한 author_id 또는 owner_id",
          ]),
        ],
      },
      {
        heading: "스키마 제안 요청 예시",
        blocks: [
          '예시 요청: "아이디어 게시판과 지식 문서 서비스를 만들고 있어. 일반 사용자는 공개 글만 보고, 관리자는 초안을 관리해야 해. Supabase 테이블, 주요 컬럼, 인덱스, RLS 관점까지 같이 제안해 줘."',
        ],
      },
    ],
  },
  {
    slug: "level-up-api-contract-first",
    title: "API를 먼저 정의하면 화면 작업이 쉬워지는 이유",
    summary:
      "요청과 응답의 형태를 먼저 정해 두면 프론트엔드와 백엔드를 병렬로 움직이기 쉬워집니다.",
    track: "level-up",
    topic: "coding-basics",
    platformTags: ["공통"],
    toolTags: ["API", "Contract", "Validation"],
    sections: [
      {
        heading: "API 계약이란 무엇인가",
        blocks: [
          "API 계약은 엔드포인트 주소만 뜻하지 않습니다. 어떤 입력을 받고 어떤 응답을 주며, 어떤 실패 형식을 가지는지까지 합의된 약속입니다.",
          bullets([
            "입력 필드와 타입",
            "응답 구조",
            "에러 코드와 메시지",
            "권한 요구사항",
          ]),
        ],
      },
      {
        heading: "계약을 먼저 정하면 생기는 장점",
        blocks: [
          bullets([
            "프론트는 mock 데이터로 먼저 화면을 만들 수 있습니다.",
            "백엔드는 필요한 필드만 명확하게 구현할 수 있습니다.",
            "AI에게도 추측이 아닌 명시된 구조를 줄 수 있습니다.",
            "테스트 케이스를 미리 작성하기 쉬워집니다.",
          ]),
        ],
      },
      {
        heading: "실무형 요청 흐름",
        blocks: [
          steps([
            "사용자 행동 기준으로 필요한 API 목록을 뽑습니다.",
            "각 API의 입력과 출력 예시를 JSON으로 적습니다.",
            "성공과 실패 예시를 함께 둡니다.",
            "그 다음 코드 생성이나 연결 작업으로 넘어갑니다.",
          ]),
        ],
      },
    ],
  },
  {
    slug: "level-up-deployment-checklist",
    title: "배포 전에 확인해야 할 운영 체크리스트",
    summary:
      "로컬에서 되는 서비스가 배포 후 망가지는 가장 흔한 이유는 환경 변수, 경로, 권한 차이를 놓치기 때문입니다.",
    track: "level-up",
    topic: "workflow-and-ops",
    platformTags: ["Web"],
    toolTags: ["Deploy", "Vercel", "Env"],
    sections: [
      {
        heading: "로컬과 배포 환경의 차이",
        blocks: [
          bullets([
            "환경 변수 설정 방식",
            "파일 경로와 정적 자산 처리",
            "서버 전용 코드와 브라우저 코드의 구분",
            "도메인과 인증 콜백 주소",
          ]),
        ],
      },
      {
        heading: "배포 직전 필수 점검",
        blocks: [
          steps([
            "빌드가 로컬에서 한 번은 통과하는지 확인합니다.",
            "프리뷰 배포에서 핵심 사용자 흐름을 끝까지 실행합니다.",
            "실제 운영 URL 기준으로 로그인이나 저장을 다시 검증합니다.",
            "404, 권한 오류, 잘못된 리다이렉트를 직접 체크합니다.",
          ]),
        ],
      },
      {
        heading: "배포 후 바로 볼 대시보드",
        blocks: [
          bullets([
            "배포 로그",
            "함수 또는 서버 에러 로그",
            "DB 쓰기 성공 여부",
            "폼 제출이나 회원가입 같은 핵심 이벤트 수",
          ]),
        ],
      },
    ],
  },
  {
    slug: "level-up-observability-and-logs",
    title: "운영 로그를 설계하면 문제를 훨씬 빨리 찾는다",
    summary:
      "에러가 발생한 뒤에 로그를 추가하는 것보다, 어떤 행동을 추적할지 미리 정해 두는 편이 훨씬 효율적입니다.",
    track: "level-up",
    topic: "workflow-and-ops",
    platformTags: ["공통"],
    toolTags: ["Logs", "Monitoring", "Alert"],
    sections: [
      {
        heading: "무엇을 남겨야 하는가",
        blocks: [
          bullets([
            "사용자가 어떤 요청을 했는지",
            "서버가 어떤 결과를 돌려줬는지",
            "실패가 어느 단계에서 났는지",
            "운영자가 추적 가능한 최소한의 식별자",
          ]),
          "단, 토큰이나 개인정보 원문은 로그에 남기지 않는 것이 원칙입니다.",
        ],
      },
      {
        heading: "로그 수준을 나누는 방법",
        blocks: [
          bullets([
            "info: 정상 흐름 확인",
            "warn: 의심스러운 상태나 재시도 상황",
            "error: 실제 실패와 원인 추적이 필요한 경우",
          ]),
          "모든 것을 error로 찍으면 중요한 신호가 묻힙니다. 반대로 아무것도 남기지 않으면 원인 추적 자체가 불가능해집니다.",
        ],
      },
      {
        heading: "운영에 도움이 되는 질문",
        blocks: [
          steps([
            "어제 잘 되던 기능이 오늘 왜 안 되는가",
            "특정 사용자만 실패하는가",
            "DB 저장은 됐는데 화면 반영만 안 되는가",
            "실패가 프론트, API, DB 중 어디에서 끊기는가",
          ]),
        ],
      },
    ],
  },
  {
    slug: "level-up-ai-cost-control",
    title: "AI 서비스 비용을 통제하는 운영 감각",
    summary:
      "프롬프트 품질만큼 중요한 것이 호출 빈도와 컨텍스트 크기 관리이며, 이것이 장기 운영 비용을 좌우합니다.",
    track: "level-up",
    topic: "workflow-and-ops",
    platformTags: ["공통"],
    toolTags: ["Cost", "Context", "Caching"],
    sections: [
      {
        heading: "비용이 빠르게 커지는 패턴",
        blocks: [
          bullets([
            "불필요하게 긴 컨텍스트를 매번 보내는 경우",
            "동일한 요청을 캐시 없이 반복하는 경우",
            "사용자 행동마다 무거운 모델을 호출하는 경우",
            "실패 재시도 로직이 과도한 경우",
          ]),
        ],
      },
      {
        heading: "줄일 수 있는 영역",
        blocks: [
          bullets([
            "입력 텍스트 전처리와 요약",
            "단계별 모델 분리",
            "캐시와 중복 방지 키",
            "관리자용 사용량 모니터링 화면",
          ]),
        ],
      },
      {
        heading: "서비스 설계에 반영하는 방법",
        blocks: [
          steps([
            "비싼 호출이 꼭 필요한 순간만 정의합니다.",
            "결과를 다시 쓸 수 있는지 먼저 생각합니다.",
            "정확도가 덜 중요한 단계는 가벼운 모델을 검토합니다.",
            "사용량과 실패율을 함께 기록해 개선 포인트를 찾습니다.",
          ]),
        ],
      },
    ],
  },
  {
    slug: "level-up-team-handoff",
    title: "사람과 AI가 함께 일할 때 인수인계를 잘하는 법",
    summary:
      "작업 결과만 넘기지 말고 의도, 변경 범위, 검증 상태를 함께 남겨야 다음 작업자가 빠르게 이어받을 수 있습니다.",
    track: "level-up",
    topic: "workflow-and-ops",
    platformTags: ["공통"],
    toolTags: ["Handoff", "Review", "Checklist"],
    sections: [
      {
        heading: "좋은 인수인계의 구성",
        blocks: [
          bullets([
            "이번에 무엇을 바꿨는지",
            "왜 그렇게 바꿨는지",
            "어디까지 검증했는지",
            "아직 남은 리스크가 무엇인지",
          ]),
        ],
      },
      {
        heading: "AI 작업 결과를 넘길 때의 주의점",
        blocks: [
          "AI가 여러 파일을 동시에 수정하면 의도 없이 파생된 변경도 함께 생길 수 있습니다. 그래서 결과 파일 목록과 핵심 변경 이유를 꼭 분리해서 남겨야 검토 비용이 줄어듭니다.",
          bullets([
            "변경 파일 목록",
            "사용한 가정",
            "실행한 테스트",
            "추가 확인이 필요한 항목",
          ]),
        ],
      },
      {
        heading: "실무형 마무리 템플릿",
        blocks: [
          '템플릿: "이번 작업에서는 지식 문서 시드와 조회 화면만 수정했습니다. DB 스키마는 기존 테이블을 재사용했습니다. 카테고리별 10개 이상 문서를 추가했고, 외부 리소스는 공식 문서와 GitHub, YouTube 링크를 포함했습니다. 시드 적용 후 각 카테고리 건수와 대표 문서 조회를 확인해 주세요."',
        ],
      },
    ],
  },
];

const tipsArticles: ArticleSeedInput[] = [
  {
    slug: "prompt-chaining-productivity",
    title: "복잡한 작업은 프롬프트 체이닝으로 나누기",
    summary:
      "조사, 구조화, 초안, 수정의 단계를 나누면 결과 품질이 더 안정되고 재사용도 쉬워집니다.",
    track: "tips",
    topic: "concepts-and-tips",
    featured: true,
    platformTags: ["공통"],
    toolTags: ["Prompt", "Workflow"],
    sections: [
      {
        heading: "왜 한 번에 시키면 품질이 흔들리는가",
        blocks: [
          "하나의 요청에 조사, 판단, 글쓰기, 형식화, 검수까지 다 넣으면 AI가 어느 단계에서 실수했는지 파악하기 어려워집니다. 그래서 단계별 산출물을 분리하는 체이닝 방식이 효과적입니다.",
        ],
      },
      {
        heading: "추천하는 4단계 흐름",
        blocks: [
          steps([
            "자료와 조건을 정리하게 합니다.",
            "핵심 구조나 개요를 먼저 잡게 합니다.",
            "그 구조를 바탕으로 초안을 만들게 합니다.",
            "마지막에 톤, 누락, 오류만 다듬게 합니다.",
          ]),
        ],
      },
      {
        heading: "어떤 작업에 특히 잘 맞나",
        blocks: [
          bullets([
            "서비스 기획서 초안",
            "랜딩 페이지 카피",
            "기술 문서 요약",
            "배포 체크리스트 생성",
          ]),
        ],
      },
    ],
  },
  {
    slug: "email-automation-workflow",
    title: "반복 메일 대응을 줄이는 AI 워크플로우",
    summary:
      "메일을 전부 자동 답장하는 것보다 분류, 초안, 검토의 세 단계를 나누면 훨씬 안전하고 실용적입니다.",
    track: "tips",
    topic: "workflow-and-ops",
    platformTags: ["공통"],
    toolTags: ["Automation", "Email", "Zapier"],
    sections: [
      {
        heading: "자동화 대상부터 좁히기",
        blocks: [
          bullets([
            "반복 문의",
            "일정 조율",
            "자료 요청",
            "단순 상태 확인 메일",
          ]),
          "감정적인 대응이 필요한 메일이나 계약 관련 메일은 자동화보다 초안 보조 수준에 두는 것이 안전합니다.",
        ],
      },
      {
        heading: "실전 운영 흐름",
        blocks: [
          steps([
            "메일 유형을 먼저 분류합니다.",
            "유형별 답변 템플릿을 만듭니다.",
            "AI는 초안을 만들고 사람은 최종 검토만 합니다.",
            "자주 수정되는 문장을 주기적으로 템플릿에 반영합니다.",
          ]),
        ],
      },
      {
        heading: "서비스 운영에도 응용 가능하다",
        blocks: [
          "문의 폼, 고객 지원, 파트너 응답처럼 반복되는 텍스트 작업은 메일뿐 아니라 모든 운영 채널에 응용할 수 있습니다. 핵심은 자동화보다 분류 체계를 먼저 만드는 것입니다.",
        ],
      },
    ],
  },
  {
    slug: "pdf-insights-in-1-minute",
    title: "긴 PDF에서 핵심만 빠르게 뽑아내는 질문법",
    summary:
      "요약만 시키지 말고 핵심 주장, 숫자, 실행 항목으로 나눠 묻는 편이 훨씬 실무적입니다.",
    track: "tips",
    topic: "concepts-and-tips",
    platformTags: ["공통"],
    toolTags: ["PDF", "Summary", "Insight"],
    sections: [
      {
        heading: "요약만 하면 놓치는 것",
        blocks: [
          "긴 문서는 요약하면 그럴듯한 문장 몇 개만 남고, 실제 의사결정에 필요한 숫자, 비교 포인트, 행동 항목은 빠지기 쉽습니다. 그래서 요약보다 질문 설계가 중요합니다.",
        ],
      },
      {
        heading: "추천 질문 순서",
        blocks: [
          steps([
            "이 문서의 핵심 주장 3가지를 추려 달라고 합니다.",
            "그 주장을 뒷받침하는 숫자나 근거를 찾게 합니다.",
            "우리 서비스나 프로젝트에 적용 가능한 실행 항목을 뽑게 합니다.",
            "의문점이나 추가 조사 주제까지 정리하게 합니다.",
          ]),
        ],
      },
      {
        heading: "바로 쓰는 활용 예시",
        blocks: [
          bullets([
            "회의 전 빠른 브리핑",
            "시장 조사 보고서 훑기",
            "제안서 핵심 포인트 정리",
            "고객 인터뷰 자료 요약",
          ]),
        ],
      },
    ],
  },
  {
    slug: "screen-first-prototyping",
    title: "기능보다 화면부터 그려 보는 프로토타이핑 팁",
    summary:
      "초기 기획 단계에서는 완벽한 로직보다 사용자 화면의 흐름을 먼저 잡는 편이 훨씬 빠르게 방향을 맞춥니다.",
    track: "tips",
    topic: "examples-and-showcase",
    platformTags: ["Web"],
    toolTags: ["Prototype", "UI", "Flow"],
    sections: [
      {
        heading: "왜 화면부터 잡으면 빠른가",
        blocks: [
          "사용자는 결국 화면을 통해 서비스를 경험합니다. 그래서 로직을 길게 설명하는 것보다 첫 화면, 리스트 화면, 상세 화면의 흐름을 잡아 보면 기능의 우선순위도 함께 정리됩니다.",
        ],
      },
      {
        heading: "실전 진행 순서",
        blocks: [
          steps([
            "첫 화면의 목표를 한 줄로 정합니다.",
            "핵심 행동 버튼을 하나만 둡니다.",
            "완료 화면 또는 결과 화면까지 이어 봅니다.",
            "그 후에 필요한 데이터와 로직을 뒤에서 채웁니다.",
          ]),
        ],
      },
      {
        heading: "작게 시작하는 화면 묶음",
        blocks: [
          bullets([
            "랜딩",
            "입력 폼",
            "결과 또는 리스트",
            "오류/빈 상태",
          ]),
        ],
      },
    ],
  },
  {
    slug: "meeting-notes-to-spec",
    title: "회의 메모를 바로 기능 명세로 바꾸는 흐름",
    summary:
      "회의록은 정보가 많지만 구조가 약하므로, 의사결정과 실행 항목으로 먼저 분리해야 실제 개발 명세가 됩니다.",
    track: "tips",
    topic: "workflow-and-ops",
    platformTags: ["공통"],
    toolTags: ["Meeting", "Spec", "Action Items"],
    sections: [
      {
        heading: "회의록을 그대로 쓰면 안 되는 이유",
        blocks: [
          "회의록에는 의견, 고민, 미확정 내용이 뒤섞여 있습니다. 이 상태로 바로 구현을 시작하면 AI와 사람 모두 추측을 많이 하게 됩니다.",
        ],
      },
      {
        heading: "회의록 정리 질문 3개",
        blocks: [
          steps([
            "이번 회의에서 실제로 결정된 것은 무엇인가",
            "아직 정해지지 않아 다음 논의가 필요한 것은 무엇인가",
            "지금 바로 구현 가능한 항목은 무엇인가",
          ]),
        ],
      },
      {
        heading: "회의 후 바로 만드는 문서",
        blocks: [
          bullets([
            "기능 목표",
            "사용자 행동 흐름",
            "필수 데이터",
            "보류 항목",
          ]),
          "이 네 가지로 다시 정리하면 곧바로 AI에게 명세 기반 작업을 시킬 수 있습니다.",
        ],
      },
    ],
  },
  {
    slug: "competitor-analysis-fast",
    title: "경쟁 서비스 분석을 빠르게 끝내는 관찰 포인트",
    summary:
      "화려한 기능 나열보다, 첫인상과 핵심 흐름, 과금 구조, 신뢰 장치만 봐도 충분히 배울 수 있습니다.",
    track: "tips",
    topic: "concepts-and-tips",
    platformTags: ["Web"],
    toolTags: ["Research", "Positioning", "Benchmark"],
    sections: [
      {
        heading: "어디를 봐야 하는가",
        blocks: [
          bullets([
            "첫 화면에서 무엇을 약속하는가",
            "가입 또는 체험 흐름이 얼마나 짧은가",
            "가격과 요금제가 어떻게 보이는가",
            "후기, 수치, 사례 같은 신뢰 장치가 있는가",
          ]),
        ],
      },
      {
        heading: "비교할 때 놓치지 말 것",
        blocks: [
          "비슷한 기능이 있어도 누구를 위한 서비스인지가 다르면 카피와 구조가 달라집니다. 따라서 단순 복제보다 포지셔닝 차이를 먼저 읽는 편이 중요합니다.",
        ],
      },
      {
        heading: "AI에게 요청하는 방식",
        blocks: [
          '예시 요청: "이 세 개 서비스의 첫 화면 메시지, 핵심 CTA, 신뢰 장치, 가격 노출 방식을 표로 비교해 줘. 그리고 우리 서비스에 바로 적용할 수 있는 차별점 3가지를 제안해 줘."',
        ],
      },
    ],
  },
  {
    slug: "landing-page-copy-patterns",
    title: "랜딩 페이지 카피를 쓸 때 바로 먹히는 구조",
    summary:
      "카피는 멋진 문장보다 사용자 문제와 변화, 행동 유도를 짧게 연결하는 구조가 훨씬 잘 작동합니다.",
    track: "tips",
    topic: "examples-and-showcase",
    platformTags: ["Web"],
    toolTags: ["Landing Page", "Copywriting", "CTA"],
    sections: [
      {
        heading: "기본 구조 4단계",
        blocks: [
          steps([
            "문제 인식: 사용자가 겪는 불편을 명확히 말합니다.",
            "해결 약속: 우리 서비스가 바꾸는 결과를 보여 줍니다.",
            "근거 제시: 수치, 사례, 사용 흐름으로 신뢰를 줍니다.",
            "행동 유도: 지금 무엇을 하면 되는지 한 문장으로 정리합니다.",
          ]),
        ],
      },
      {
        heading: "카피가 약해지는 패턴",
        blocks: [
          bullets([
            "너무 많은 가치를 한 문장에 넣는 경우",
            "사용자 대신 서비스 자랑만 하는 경우",
            "CTA 문구가 모호한 경우",
            "증거 없이 최고, 혁신 같은 단어만 쓰는 경우",
          ]),
        ],
      },
      {
        heading: "AI를 잘 쓰는 팁",
        blocks: [
          "처음부터 완성 카피를 달라고 하기보다, 헤드라인 10개, 서브카피 5개, CTA 10개처럼 분리해서 요청하면 훨씬 좋은 조합을 만들 수 있습니다.",
        ],
      },
    ],
  },
  {
    slug: "deployment-platform-comparison",
    title: "배포 플랫폼을 고를 때 비교해야 할 것",
    summary:
      "Vercel, Netlify, Cloudflare 같은 플랫폼은 모두 비슷해 보이지만, 프로젝트 성격에 따라 체감 차이가 큽니다.",
    track: "tips",
    topic: "workflow-and-ops",
    platformTags: ["Web"],
    toolTags: ["Vercel", "Netlify", "Cloudflare"],
    sections: [
      {
        heading: "비교 기준을 먼저 정하기",
        blocks: [
          bullets([
            "프레임워크와의 궁합",
            "배포 편의성",
            "환경 변수와 미리보기 배포 지원",
            "함수 실행 방식과 제한",
            "도메인과 CDN 운영 편의성",
          ]),
        ],
      },
      {
        heading: "간단한 선택 가이드",
        blocks: [
          bullets([
            "Next.js 중심이라면 Vercel이 빠르게 맞습니다.",
            "정적 사이트나 단순 폼 중심이라면 Netlify도 충분합니다.",
            "에지 성능과 네트워크 제어가 중요하면 Cloudflare 계열이 매력적입니다.",
          ]),
        ],
      },
      {
        heading: "초기에는 무엇이 중요한가",
        blocks: [
          "첫 프로젝트라면 최저 단가보다 문제를 빨리 찾고 쉽게 되돌릴 수 있는 운영 경험이 더 중요합니다. 그래서 디버깅과 프리뷰, 환경 변수 관리가 익숙한 플랫폼을 우선 선택하는 편이 좋습니다.",
        ],
      },
    ],
  },
  {
    slug: "fake-door-validation",
    title: "만들기 전에 반응부터 보는 페이크 도어 검증",
    summary:
      "기능을 먼저 완성하기보다, 필요성을 빠르게 검증하는 것이 시간과 비용을 아끼는 가장 좋은 방법일 때가 많습니다.",
    track: "tips",
    topic: "concepts-and-tips",
    platformTags: ["Web"],
    toolTags: ["Validation", "Landing Page", "Experiment"],
    sections: [
      {
        heading: "페이크 도어란 무엇인가",
        blocks: [
          "아직 완성되지 않은 기능이지만, 마치 제공되는 것처럼 소개하고 사용자의 반응을 보는 검증 방식입니다. 가입, 대기자 등록, 문의 클릭 같은 행동으로 수요를 빠르게 측정할 수 있습니다.",
        ],
      },
      {
        heading: "언제 써야 하는가",
        blocks: [
          bullets([
            "개발 비용이 큰 기능을 만들기 전",
            "타깃 사용자가 명확하지 않을 때",
            "어떤 메시지가 더 반응이 좋은지 보고 싶을 때",
            "서비스 전체보다 특정 기능의 매력을 검증할 때",
          ]),
        ],
      },
      {
        heading: "운영 시 주의점",
        blocks: [
          bullets([
            "사용자를 속이기보다 기대를 관리해야 합니다.",
            "대기자 등록 후 후속 안내를 반드시 해야 합니다.",
            "클릭 수보다 실제 연락처 남김이나 신청 전환을 더 중시합니다.",
            "반응이 없으면 기능보다 메시지나 타깃부터 수정합니다.",
          ]),
        ],
      },
    ],
  },
  {
    slug: "feature-priority-by-user-pain",
    title: "기능 우선순위는 사용자 고통 기준으로 정하기",
    summary:
      "좋아 보이는 기능보다 지금 당장 사용자를 움직이게 할 핵심 문제 해결 기능을 먼저 배치해야 합니다.",
    track: "tips",
    topic: "concepts-and-tips",
    platformTags: ["공통"],
    toolTags: ["Prioritization", "UX", "Product"],
    sections: [
      {
        heading: "우선순위를 잘못 잡는 흔한 이유",
        blocks: [
          "새 기능 아이디어는 늘 많지만, 모든 기능이 같은 무게를 갖지는 않습니다. 특히 초기 서비스는 '멋진 것'보다 '안 쓰면 불편한 것'을 먼저 해결해야 반응이 옵니다.",
        ],
      },
      {
        heading: "질문 기준 4개",
        blocks: [
          bullets([
            "이 문제가 얼마나 자주 발생하는가",
            "사용자가 직접 우회하고 있는가",
            "해결되면 즉시 가치가 느껴지는가",
            "구현 난이도 대비 효과가 큰가",
          ]),
        ],
      },
      {
        heading: "우선순위 회의에 바로 쓰는 방식",
        blocks: [
          steps([
            "후보 기능을 전부 적습니다.",
            "각 기능이 해결하는 사용자 문제를 한 줄로 적습니다.",
            "빈도와 고통, 구현 비용을 나란히 비교합니다.",
            "상위 1개 또는 2개만 이번 릴리스 범위에 넣습니다.",
          ]),
        ],
      },
    ],
  },
];

const externalArticles: ArticleSeedInput[] = [
  {
    slug: "external-claude-code-overview",
    title: "Claude Code 공식 문서",
    summary:
      "설치, 동작 방식, 권한 모델, 여러 작업 표면을 한 번에 파악하고 싶을 때 가장 먼저 봐야 하는 공식 출발점입니다.",
    track: "external",
    topic: "tool-setup",
    featured: true,
    platformTags: ["Web"],
    toolTags: ["Claude Code", "Anthropic", "Docs"],
    resourceUrl: "https://code.claude.com/docs/en/overview",
    sections: [
      {
        heading: "이 리소스가 좋은 이유",
        blocks: [
          "Claude Code가 터미널, IDE, 데스크톱, 웹에서 어떻게 동작하는지 공식 관점으로 정리되어 있습니다. 특히 설치 방법과 권한 모드, 공통 워크플로우를 한 번에 이해하기 좋습니다.",
        ],
      },
      {
        heading: "어디부터 보면 좋은가",
        blocks: [
          bullets([
            "Overview로 전체 그림 잡기",
            "Quickstart로 첫 작업 흐름 익히기",
            "Best practices로 협업 패턴 보기",
            "Permission modes와 common workflows 확인하기",
          ]),
        ],
      },
      {
        heading: "이렇게 연결해서 쓰면 좋다",
        blocks: [
          "기초 가이드에서 도구 준비를 끝낸 뒤 이 문서의 quickstart를 따라 하면, AI가 실제로 파일을 읽고 수정하고 검증하는 흐름을 빠르게 체감할 수 있습니다.",
        ],
      },
    ],
  },
  {
    slug: "external-openai-responses-guide",
    title: "OpenAI Responses API 전환 가이드",
    summary:
      "최신 OpenAI API 흐름을 이해하고, 기존 채팅 API 사고방식에서 벗어나려는 팀에게 도움이 되는 공식 문서입니다.",
    track: "external",
    topic: "coding-basics",
    platformTags: ["Web"],
    toolTags: ["OpenAI", "Responses API", "Docs"],
    resourceUrl: "https://developers.openai.com/api/docs/guides/migrate-to-responses",
    sections: [
      {
        heading: "왜 추천하는가",
        blocks: [
          "OpenAI 기능을 서비스에 넣을 때 최신 문서 흐름을 기준으로 설계해야 이후 유지보수가 수월합니다. 이 문서는 Responses API 관점으로 사고방식을 정리하는 데 도움이 됩니다.",
        ],
      },
      {
        heading: "이 문서를 볼 사람",
        blocks: [
          bullets([
            "OpenAI를 서비스 구현에 붙이려는 사람",
            "기존 방식에서 최신 흐름으로 옮기려는 사람",
            "응답 구조와 모델 사용 패턴을 다시 정리하고 싶은 사람",
          ]),
        ],
      },
      {
        heading: "활용 팁",
        blocks: [
          "문서를 읽고 나서는 바로 코드에 넣기보다, 우리 서비스에서 어떤 입력과 어떤 출력이 필요한지 먼저 API 계약으로 정리해 두면 훨씬 덜 헤맵니다.",
        ],
      },
    ],
  },
  {
    slug: "external-cursor-docs",
    title: "Cursor 공식 시작 문서",
    summary:
      "설치, 온보딩, 인덱싱, 퀵스타트 흐름을 빠르게 훑을 수 있어 Cursor를 실전 에디터로 쓰려는 분에게 유용합니다.",
    track: "external",
    topic: "tool-setup",
    platformTags: ["Web"],
    toolTags: ["Cursor", "Docs", "Editor"],
    resourceUrl: "https://docs.cursor.com/getting-started",
    sections: [
      {
        heading: "무엇을 확인할 수 있나",
        blocks: [
          bullets([
            "설치와 초기 설정",
            "프로젝트 인덱싱 개념",
            "퀵스타트와 핵심 단축키",
            "다른 에디터에서 넘어오는 흐름",
          ]),
        ],
      },
      {
        heading: "언제 읽으면 가장 좋은가",
        blocks: [
          "Cursor를 처음 설치한 직후, 또는 VS Code와 병행 사용 전략을 잡을 때 읽기 좋습니다. 특히 인덱싱 개념을 알면 왜 프로젝트를 연 뒤 잠시 기다려야 하는지 이해가 쉬워집니다.",
        ],
      },
      {
        heading: "추천 활용 방식",
        blocks: [
          "Cursor에서 처음 작업할 프로젝트를 하나 정하고, 공식 quickstart 흐름대로 작은 수정부터 해 보는 것을 권합니다. 도구 자체를 익히는 시간은 짧게, 실제 작업 감각은 빠르게 얻을 수 있습니다.",
        ],
      },
    ],
  },
  {
    slug: "external-supabase-docs",
    title: "Supabase 시작 가이드",
    summary:
      "인증, 데이터베이스, 스토리지, 함수 등 서비스를 만드는 데 필요한 백엔드 기능을 공식 문서로 빠르게 익힐 수 있습니다.",
    track: "external",
    topic: "saas-guides",
    platformTags: ["Web"],
    toolTags: ["Supabase", "Docs", "Backend"],
    resourceUrl: "https://supabase.com/docs/guides/getting-started",
    sections: [
      {
        heading: "왜 자주 보게 되는가",
        blocks: [
          "바이브 코딩으로 웹 서비스를 만들 때 인증과 DB, 파일 저장이 필요해지는 순간이 빠르게 옵니다. Supabase 공식 문서는 이 연결 지점을 한 흐름으로 이해하기 좋습니다.",
        ],
      },
      {
        heading: "이 문서에서 먼저 볼 항목",
        blocks: [
          bullets([
            "프로젝트 생성",
            "데이터베이스 연결",
            "인증 설정",
            "클라이언트 SDK 사용법",
          ]),
        ],
      },
      {
        heading: "같이 보면 좋은 내부 주제",
        blocks: [
          "레벨업 섹션의 스키마 설계, 보안, SaaS 키 관리 문서와 함께 보면 실제 프로젝트에 연결할 때 시행착오를 크게 줄일 수 있습니다.",
        ],
      },
    ],
  },
  {
    slug: "external-nextjs-docs",
    title: "Next.js 공식 문서",
    summary:
      "App Router, 서버 컴포넌트, 데이터 패칭, 배포 연결까지 현대적인 React 기반 서비스 구조를 이해하는 데 가장 기본이 되는 문서입니다.",
    track: "external",
    topic: "coding-basics",
    platformTags: ["Web"],
    toolTags: ["Next.js", "React", "Docs"],
    resourceUrl: "https://nextjs.org/docs",
    sections: [
      {
        heading: "이 문서를 언제 보나",
        blocks: [
          "AI가 Next.js 코드를 생성해 주더라도, 라우팅과 서버/클라이언트 경계는 사람이 이해하고 있어야 수정이 쉬워집니다. 따라서 서비스를 실제로 다듬기 시작할 때 꼭 다시 보게 되는 문서입니다.",
        ],
      },
      {
        heading: "처음 읽을 우선순위",
        blocks: [
          bullets([
            "Routing",
            "Data Fetching",
            "Rendering",
            "Deployment",
          ]),
        ],
      },
      {
        heading: "효율적으로 보는 팁",
        blocks: [
          "전체를 다 읽기보다, 지금 막힌 주제를 기준으로 필요한 장만 읽고 바로 코드에 적용해 보는 방식이 좋습니다. 공식 문서는 정답집이 아니라 문제 해결용 레퍼런스로 쓰는 편이 훨씬 실용적입니다.",
        ],
      },
    ],
  },
  {
    slug: "external-vercel-guides",
    title: "Vercel 운영 가이드 모음",
    summary:
      "배포, 도메인, 환경 변수, 프리뷰 운영 같은 실제 서비스 운영 이슈를 공식 문서 기반으로 빠르게 확인할 수 있습니다.",
    track: "external",
    topic: "workflow-and-ops",
    platformTags: ["Web"],
    toolTags: ["Vercel", "Deploy", "Docs"],
    resourceUrl: "https://vercel.com/kb",
    sections: [
      {
        heading: "특히 도움이 되는 상황",
        blocks: [
          bullets([
            "프리뷰는 되는데 운영에서만 실패할 때",
            "환경 변수 적용이 꼬였을 때",
            "도메인이나 리다이렉트 설정이 이상할 때",
            "배포 후 성능이나 로그를 확인할 때",
          ]),
        ],
      },
      {
        heading: "왜 공식 가이드를 보나",
        blocks: [
          "배포 문제는 검색 결과가 많지만, 플랫폼 설정은 공식 문서를 보는 편이 빠릅니다. 특히 환경 변수, 함수 제한, 도메인 설정은 문서 기준으로 확인해야 혼선이 적습니다.",
        ],
      },
      {
        heading: "실전 연결 포인트",
        blocks: [
          "프로젝트가 어느 정도 완성되면 배포 플랫폼 사용법도 제품 개발의 일부가 됩니다. 이 문서는 코드보다 운영 감각을 키우는 데 도움이 됩니다.",
        ],
      },
    ],
  },
  {
    slug: "external-anthropic-skills-github",
    title: "Anthropic Skills GitHub 저장소",
    summary:
      "반복 작업을 잘하는 에이전트를 만들고 싶을 때, 실제 스킬 구조와 예시를 한 번에 볼 수 있는 대표 레퍼런스입니다.",
    track: "external",
    topic: "examples-and-showcase",
    platformTags: ["GitHub"],
    toolTags: ["Anthropic", "Skills", "GitHub"],
    resourceUrl: "https://github.com/anthropics/skills",
    sections: [
      {
        heading: "무엇을 배울 수 있나",
        blocks: [
          bullets([
            "SKILL.md 구조",
            "지침과 예시를 어떻게 묶는지",
            "문서 작업, 디자인, 개발 등 다양한 스킬 패턴",
            "반복 가능한 작업을 에이전트에 가르치는 방법",
          ]),
        ],
      },
      {
        heading: "초보자가 보면 좋은 관점",
        blocks: [
          "코드를 그대로 복사하기보다, 좋은 스킬은 어떤 설명을 담고 어떤 조건에서 호출되는지 관찰하는 편이 중요합니다. 결국 핵심은 기능이 아니라 사용 맥락을 명시하는 법을 배우는 것입니다.",
        ],
      },
      {
        heading: "어떻게 응용하면 좋은가",
        blocks: [
          "내 프로젝트의 반복 업무가 있다면, 이 저장소의 패턴을 참고해 초안 템플릿, 리뷰 체크리스트, 배포 점검 스킬처럼 작고 선명한 단위부터 만들어 보는 것을 추천합니다.",
        ],
      },
    ],
  },
  {
    slug: "external-vercel-chatbot-github",
    title: "Vercel Chatbot GitHub 예제",
    summary:
      "AI 채팅 제품을 직접 만들고 싶은 사람에게, 실전형 예제 구조와 연결 방식을 참고하기 좋은 레퍼런스 저장소입니다.",
    track: "external",
    topic: "examples-and-showcase",
    platformTags: ["GitHub"],
    toolTags: ["Vercel", "Chatbot", "Next.js"],
    resourceUrl: "https://github.com/vercel/chatbot",
    sections: [
      {
        heading: "이 예제가 유용한 이유",
        blocks: [
          "AI 앱은 단순 채팅 UI만으로 끝나지 않고, 스트리밍 응답, 상태 관리, 인증, 저장, 배포까지 함께 고려해야 합니다. 이 저장소는 그런 전체 흐름을 참고하기 좋습니다.",
        ],
      },
      {
        heading: "볼 때 집중할 포인트",
        blocks: [
          bullets([
            "폴더 구조",
            "환경 변수 연결 방식",
            "UI와 데이터 흐름 분리",
            "운영에 필요한 기본 설정",
          ]),
        ],
      },
      {
        heading: "주의할 점",
        blocks: [
          "예제는 출발점이지 그대로 복사해 운영하면 안 됩니다. 내 서비스 목적에 맞게 필요한 부분만 가져오고, 인증과 비용, 데이터 정책은 별도로 다시 설계해야 합니다.",
        ],
      },
    ],
  },
  {
    slug: "external-supabase-github",
    title: "Supabase GitHub 저장소",
    summary:
      "공식 예제, 제품 방향, 기능별 구현 패턴을 폭넓게 참고하고 싶을 때 살펴보기 좋은 대형 레퍼런스 저장소입니다.",
    track: "external",
    topic: "saas-guides",
    platformTags: ["GitHub"],
    toolTags: ["Supabase", "GitHub", "Examples"],
    resourceUrl: "https://github.com/supabase/supabase",
    sections: [
      {
        heading: "어떤 사람에게 맞는가",
        blocks: [
          "Supabase를 깊게 쓰기 시작했거나, 공식 제품이 어떤 식으로 예제와 기능을 소개하는지 참고하고 싶은 사람에게 특히 좋습니다.",
        ],
      },
      {
        heading: "활용 포인트",
        blocks: [
          bullets([
            "공식 예제 탐색",
            "문서와 제품 방향 확인",
            "커뮤니티 사용 방식 관찰",
            "스키마와 운영 패턴 참고",
          ]),
        ],
      },
      {
        heading: "읽는 방법",
        blocks: [
          "전체를 다 보기보다 현재 만들고 있는 기능과 비슷한 예시나 문서 링크를 타고 들어가는 방식이 좋습니다. 레포 자체보다 거기서 연결되는 예제가 실제 체감 가치가 큽니다.",
        ],
      },
    ],
  },
  {
    slug: "external-fireship-youtube",
    title: "Fireship YouTube 채널",
    summary:
      "짧은 영상으로 새로운 도구와 개발 흐름을 빠르게 훑고 싶을 때, 감각을 올리는 데 도움이 되는 대표적인 개발 채널입니다.",
    track: "external",
    topic: "examples-and-showcase",
    platformTags: ["YouTube"],
    toolTags: ["Fireship", "YouTube", "Trends"],
    resourceUrl: "https://www.youtube.com/@fireship",
    sections: [
      {
        heading: "이 채널을 보는 이유",
        blocks: [
          "새로운 도구를 빠르게 훑고 전체 맥락을 잡는 데 강점이 있습니다. 긴 문서를 읽기 전에 분위기와 핵심 키워드를 먼저 파악하고 싶을 때 유용합니다.",
        ],
      },
      {
        heading: "이렇게 보면 더 좋다",
        blocks: [
          bullets([
            "관심 있는 기술의 개요를 먼저 봅니다.",
            "재미있는 기능을 발견하면 공식 문서로 넘어갑니다.",
            "영상만 보고 끝내지 말고 내 프로젝트와 연결 포인트를 적어 둡니다.",
          ]),
        ],
      },
      {
        heading: "주의할 점",
        blocks: [
          "짧은 영상은 큰 그림을 빠르게 주지만 세부 구현과 운영 판단까지 대신해 주지는 않습니다. 흥미를 얻는 입구로 쓰고, 실제 적용은 공식 자료로 검증하는 습관이 필요합니다.",
        ],
      },
    ],
  },
  {
    slug: "external-theprimeagen-youtube",
    title: "ThePrimeagen YouTube 채널",
    summary:
      "AI 코딩 도구와 개발 생산성을 조금 더 날것의 시선으로 보고 싶을 때 참고하기 좋은 유명 개발 채널입니다.",
    track: "external",
    topic: "examples-and-showcase",
    platformTags: ["YouTube"],
    toolTags: ["ThePrimeagen", "YouTube", "Developer Workflow"],
    resourceUrl: "https://www.youtube.com/@ThePrimeagen",
    sections: [
      {
        heading: "왜 참고할 만한가",
        blocks: [
          "도구를 맹신하지 않고 장단점을 빠르게 짚어 주는 편이라, 새로운 AI 코딩 툴을 도입할 때 균형 감각을 잡는 데 도움이 됩니다.",
        ],
      },
      {
        heading: "어떤 시청자에게 맞는가",
        blocks: [
          bullets([
            "도구 홍보보다 실제 생산성 관점을 보고 싶은 사람",
            "개발자 워크플로우 관점에서 AI 도구를 이해하고 싶은 사람",
            "기능 자체보다 사용 습관과 사고법을 배우고 싶은 사람",
          ]),
        ],
      },
      {
        heading: "시청 후 바로 할 일",
        blocks: [
          steps([
            "내 작업 흐름에서 가장 느린 지점을 하나 적습니다.",
            "그 지점에 AI가 실제로 도움이 되는지 작은 실험을 합니다.",
            "효과가 있으면 반복 가능한 루틴이나 스킬로 정리합니다.",
          ]),
        ],
      },
    ],
  },
];

const articleInputs = [
  ...basicsArticles,
  ...levelUpArticles,
  ...tipsArticles,
  ...externalArticles,
];

export const seedKnowledgeArticles = articleInputs.map((input, index) =>
  createArticle(index, input),
);

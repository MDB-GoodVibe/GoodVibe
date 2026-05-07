import { readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

type Track = "basics" | "level-up" | "tips";

type GuideArticle = {
  slug: string;
  title: string;
  track: Track;
  topic: string;
  summary: string;
  contentMd: string;
  platformTags?: string[];
  toolTags?: string[];
};

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const curatedArticles: GuideArticle[] = [
  {
    slug: "tool-setup-windows-mac-detailed",
    title: "Windows·Mac 바이브 코딩 개발환경 준비 (Node.js, Git, VS Code) 완전 가이드",
    track: "basics",
    topic: "tool-setup",
    summary:
      "IT 비전공자도 그대로 따라할 수 있도록 Windows/macOS 기준으로 Node.js, Git, VS Code 설치부터 버전 확인, PATH 점검, 첫 실행 검증까지 순서대로 안내합니다.",
    contentMd: `## 누구를 위한 문서인가
- 개발을 처음 시작했거나, 설치는 했지만 실제로 잘 된 건지 확신이 없는 분
- Windows와 macOS 중 어떤 OS든 동일한 흐름으로 환경을 맞추고 싶은 분

## 설치 전에 먼저 확인할 것
1. 관리자 권한(Windows) 또는 관리자 암호(macOS)를 준비합니다.
2. 설치 중에는 터미널/PowerShell을 모두 닫아 둡니다.
3. 설치 후에는 반드시 새 터미널을 열어 버전 확인을 합니다.

## 1) Node.js 설치
### Windows
1. Node.js 공식 다운로드 페이지에서 LTS 버전을 선택합니다.
2. 설치 파일(\`.msi\`) 실행 후 기본 옵션으로 설치합니다.
3. 설치 완료 후 새 PowerShell을 열어 아래 명령으로 확인합니다.
\`\`\`bash
node -v
npm -v
\`\`\`
4. 버전이 출력되면 정상입니다. (예: \`v24.x\`, \`11.x\`)

### macOS
1. Node.js 공식 다운로드 페이지에서 macOS 설치 파일(\`.pkg\`)을 내려받습니다.
2. 설치 마법사를 따라 기본 옵션으로 설치합니다.
3. 새 Terminal을 열고 아래 명령으로 확인합니다.
\`\`\`bash
node -v
npm -v
\`\`\`

## 2) Git 설치
### Windows
1. Git 공식 설치 페이지(\`download/win\`)에서 설치 파일을 내려받습니다.
2. 설치 중 특별한 요구가 없다면 기본값으로 진행합니다.
3. 새 PowerShell에서 확인합니다.
\`\`\`bash
git --version
\`\`\`
4. 예: \`git version 2.xx.x\`가 보이면 정상입니다.

### macOS
1. 터미널에서 먼저 아래 명령을 실행합니다.
\`\`\`bash
git --version
\`\`\`
2. Xcode Command Line Tools 설치 안내가 뜨면 설치를 진행합니다.
3. 더 최신 버전을 원하면 Git 공식 macOS 설치 프로그램을 사용합니다.

## 3) VS Code 설치
### Windows
1. VS Code Windows 설치 프로그램을 실행합니다.
2. 설치 완료 후 새 터미널에서 \`code .\`를 실행해 현재 폴더를 열어봅니다.
3. 동작하지 않으면 터미널을 재시작하고 다시 시도합니다.

### macOS
1. VS Code 앱을 \`Applications\` 폴더로 드래그합니다.
2. VS Code에서 Command Palette(\`Cmd+Shift+P\`)를 열고
   \`Shell Command: Install 'code' command in PATH\`를 실행합니다.
3. 새 터미널에서 \`code .\`를 실행해 확인합니다.

## 4) 최종 점검 체크리스트
- [ ] \`node -v\`가 출력된다
- [ ] \`npm -v\`가 출력된다
- [ ] \`git --version\`이 출력된다
- [ ] \`code .\`로 VS Code가 열린다

## 자주 막히는 문제
### 명령어가 인식되지 않는 경우
- 원인: 설치 후 터미널을 재시작하지 않음, 또는 PATH 반영 전 상태
- 해결: 터미널을 완전히 닫고 다시 실행, 그래도 안 되면 재설치

### 회사 PC에서 설치가 막히는 경우
- 원인: 보안 정책/권한 제한
- 해결: IT 관리자에게 설치 승인 요청 (Node.js/Git/VS Code 공식 링크 함께 전달)

## 참고 자료
- Node.js 공식 다운로드: https://nodejs.org/en/download/
- Git 설치 가이드(공식): https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
- VS Code Windows 설치: https://code.visualstudio.com/docs/setup/windows
- VS Code macOS 설치: https://code.visualstudio.com/docs/setup/mac

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, 공식 문서 링크 기준으로 설치 절차를 검수해 정리했습니다.
`,
    platformTags: ["Windows", "macOS"],
    toolTags: ["Node.js", "Git", "VS Code"],
  },
  {
    slug: "ai-cli-setup-codex-claude-code-detailed",
    title: "Codex CLI·Claude Code 설치와 첫 실행 검증 (Windows/macOS)",
    track: "basics",
    topic: "tool-setup",
    summary:
      "AI CLI 도구를 처음 쓰는 사용자를 위해 Codex CLI와 Claude Code의 설치 명령, 버전 확인, 로그인 전 점검, 실패 시 복구 순서를 상세하게 안내합니다.",
    contentMd: `## 사전 준비
- Node.js가 먼저 설치되어 있어야 합니다.
- 새 터미널에서 \`node -v\`, \`npm -v\`가 정상 출력되는지 확인합니다.

## 1) Codex CLI 설치
1. 터미널에서 설치:
\`\`\`bash
npm install -g @openai/codex
\`\`\`
2. 설치 확인:
\`\`\`bash
codex --version
\`\`\`
3. 실행:
\`\`\`bash
codex
\`\`\`

## 2) Claude Code 설치
1. 터미널에서 설치:
\`\`\`bash
npm install -g @anthropic-ai/claude-code
\`\`\`
2. 설치 확인:
\`\`\`bash
claude --version
claude doctor
\`\`\`
3. 실행:
\`\`\`bash
claude
\`\`\`

## 3) Windows에서 자주 막히는 포인트
### A. 전역 설치 권한 오류
- 증상: npm global 설치 시 권한 오류
- 해결:
1. 관리자 PowerShell로 다시 시도
2. 그래도 실패하면 npm global 경로 설정 정책 점검

### B. 명령어 인식 실패
- 증상: \`codex\` 또는 \`claude\` 명령을 찾지 못함
- 해결:
1. 터미널 완전 재시작
2. \`npm prefix -g\` 확인 후 global bin 경로 PATH 반영 여부 점검

## 4) macOS에서 자주 막히는 포인트
### A. shell PATH 반영 문제
- 증상: 설치했는데 명령어가 안 보임
- 해결:
1. 터미널 재시작
2. \`which node\`, \`which npm\`로 실행 경로 확인

## 5) 첫 실행 체크리스트
- [ ] \`codex --version\` 출력 확인
- [ ] \`claude --version\` 출력 확인
- [ ] \`claude doctor\` 진단 완료
- [ ] 실제 프로젝트 폴더에서 도구 실행 확인

## 참고 자료
- OpenAI Codex CLI(공식 리포지토리): https://github.com/openai/codex
- Claude Code Setup(공식): https://code.claude.com/docs/en/setup

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, 공식 설치 문서/공식 저장소 기준으로 명령과 점검 절차를 검수했습니다.
`,
    platformTags: ["Windows", "macOS"],
    toolTags: ["Codex CLI", "Claude Code"],
  },
  {
    slug: "git-basics-for-non-developers-detailed",
    title: "비전공자를 위한 Git 최소 실전: init부터 commit, 복구까지",
    track: "basics",
    topic: "coding-basics",
    summary:
      "Git을 처음 쓰는 사용자가 가장 자주 하는 실수를 줄일 수 있도록 저장소 생성, 변경 확인, 커밋, 되돌리기, 원격 연결 기본 흐름을 실제 명령 기준으로 안내합니다.",
    contentMd: `## 왜 Git이 필요한가
- AI가 코드를 빠르게 만들수록 \"이전 상태로 안전하게 돌아가는 능력\"이 중요합니다.
- Git은 코드의 변경 이력을 남기고, 문제가 생겼을 때 복구를 쉽게 만들어줍니다.

## 1) 시작 5분 루틴
\`\`\`bash
mkdir my-project
cd my-project
git init
git status
\`\`\`
- \`git status\`가 \"현재 상태\"를 보여주는 가장 중요한 명령입니다.

## 2) 첫 커밋 만들기
1. 파일 생성 후 저장
2. 아래 명령 실행
\`\`\`bash
git add .
git commit -m \"chore: initial project setup\"
\`\`\`
3. 확인
\`\`\`bash
git log --oneline -n 5
\`\`\`

## 3) 자주 쓰는 안전 명령
- 변경 확인: \`git status\`
- 파일 차이 확인: \`git diff\`
- 커밋 간 이력: \`git log --oneline\`

## 4) 실수했을 때 복구 패턴
### A. 아직 커밋 전 실수
- 편집 내용을 다시 원복:
\`\`\`bash
git restore <파일명>
\`\`\`

### B. 커밋은 했지만 메시지나 내용 수정이 필요한 경우
- 최근 커밋 메시지 수정:
\`\`\`bash
git commit --amend -m \"새 메시지\"
\`\`\`

## 5) 원격 저장소 연결 최소 흐름
\`\`\`bash
git remote add origin <원격저장소URL>
git branch -M main
git push -u origin main
\`\`\`

## 6) 비전공자 운영 팁
- 하루 최소 1회는 \"작은 단위 커밋\"으로 쪼개세요.
- 커밋 메시지는 \"무엇을/왜\" 바꿨는지 짧게 적으세요.
- 큰 변경 전에는 브랜치를 새로 파서 위험을 줄이세요.

## 참고 자료
- Git 설치 및 시작(공식 Git Book): https://git-scm.com/book/en/v2/Getting-Started-Installing-Git

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, Git 공식 문서의 권장 흐름을 기반으로 실전용 순서로 재구성했습니다.
`,
    platformTags: ["Git"],
    toolTags: ["Git", "Version Control"],
  },
  {
    slug: "level-up-env-secrets-vercel-supabase",
    title: "Vercel·Supabase 환경변수/시크릿 운영: 유출 없이 배포하는 실전 기준",
    track: "level-up",
    topic: "workflow-and-ops",
    summary:
      "개발/프리뷰/운영 환경을 분리해 키를 관리하고, 재배포 시 반영 규칙과 Supabase Edge Function 시크릿 반영 절차를 혼동 없이 운영하는 방법을 설명합니다.",
    contentMd: `## 핵심 원칙
1. 민감 정보는 코드가 아니라 환경변수/시크릿으로만 관리
2. Development / Preview / Production 값을 분리
3. 키 수정 후 반영 시점(재배포 필요 여부)을 반드시 확인

## 1) Vercel 환경변수 운영
### 왜 중요한가
- Vercel 문서 기준, 환경변수 변경은 \"기존 배포\"에 자동 적용되지 않고 \"새 배포\"부터 적용됩니다.

### 운영 절차
1. 프로젝트 Settings → Environment Variables에서 키 등록
2. 환경(Development/Preview/Production)을 정확히 지정
3. 키 변경 후 반드시 새 배포 실행

### 로컬 동기화
\`\`\`bash
vercel env pull
\`\`\`
- 로컬 테스트 시 Dashboard 값과 불일치 문제를 줄입니다.

## 2) Supabase Edge Functions 시크릿 운영
### 핵심 포인트
- Supabase Functions 시크릿은 Dashboard 또는 CLI(\`supabase secrets set\`)로 설정 가능
- 문서 기준으로 시크릿 설정 후 함수에서 즉시 접근 가능하며, 별도 재배포가 필요하지 않은 케이스가 있습니다.

### 권장 절차
1. \`.env\` 파일에 필요한 시크릿 정의(로컬 전용, git 미커밋)
2. 배포 시:
\`\`\`bash
supabase secrets set --env-file .env
\`\`\`
3. 함수에서 \`Deno.env.get(\"KEY\")\`로 읽기

## 3) 실수 방지 체크리스트
- [ ] 운영 키를 \`.env.local\` 외 파일이나 코드에 하드코딩하지 않았는가
- [ ] Preview와 Production 키를 분리했는가
- [ ] Vercel 키 변경 후 재배포했는가
- [ ] Supabase 시크릿 변경 후 \`supabase secrets list\`로 반영 여부를 확인했는가

## 참고 자료
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Supabase Functions Secrets: https://supabase.com/docs/guides/functions/secrets

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, Vercel/Supabase 공식 문서 기준으로 운영 규칙과 반영 시점을 검수해 작성했습니다.
`,
    platformTags: ["Vercel", "Supabase"],
    toolTags: ["Environment Variables", "Secrets"],
  },
  {
    slug: "level-up-release-runbook-next-vercel",
    title: "Next.js + Vercel 배포 런북: 배포 전/중/후 체크리스트",
    track: "level-up",
    topic: "workflow-and-ops",
    summary:
      "main 푸시 자동 배포 환경에서 실제 장애를 줄이기 위한 배포 전 검증, 배포 중 확인, 배포 후 헬스체크 루틴을 단계별로 정리했습니다.",
    contentMd: `## 목표
- \"배포는 됐는데 기능이 안 되는 상태\"를 줄이는 운영 루틴을 표준화합니다.

## 배포 전(Pre-deploy)
1. 로컬 빌드 확인
\`\`\`bash
npm run build
\`\`\`
2. 주요 환경변수 누락 여부 확인
3. 인증/콜백 URL(로컬/운영) 정합성 확인

## 배포 중(Deploy)
1. main 브랜치 푸시 후 Vercel 배포 로그 확인
2. 실패 시 프리렌더/환경변수 에러부터 우선 점검
3. 필요하면 재배포:
\`\`\`bash
vercel redeploy <deployment-url>
\`\`\`

## 배포 후(Post-deploy)
1. 핵심 경로 점검
- 로그인
- 관리자 페이지 접근
- 지식베이스 읽기/작성
2. API 응답 코드 확인(\`/api/*\`)
3. 브라우저 콘솔/서버 로그에서 에러 확인

## 장애 대응 우선순위
1. 환경변수 누락/오타
2. 빌드 타임 에러(\`useSearchParams\` + suspense 등)
3. 권한/콜백 URL 불일치

## 팀 운영 팁
- 배포 체크리스트를 PR 템플릿에 고정
- \"배포 담당자\"와 \"검증 담당자\"를 분리
- 실패 원인을 짧게 기록해 재발 방지

## 참고 자료
- Vercel redeploy CLI: https://vercel.com/docs/cli/redeploy
- Vercel Environment Variables: https://vercel.com/docs/environment-variables

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, Vercel 공식 문서 기반 명령/반영 방식에 맞춰 체크리스트형으로 정리했습니다.
`,
    platformTags: ["Next.js", "Vercel"],
    toolTags: ["Deployment", "Runbook"],
  },
  {
    slug: "level-up-ai-tool-troubleshooting-playbook",
    title: "AI 개발도구 문제해결 플레이북: 설치·인증·네트워크 이슈를 15분 안에 좁히기",
    track: "level-up",
    topic: "workflow-and-ops",
    summary:
      "Codex CLI/Claude Code 사용 중 자주 발생하는 설치 실패, 명령어 인식 실패, 인증 실패를 단계적으로 좁혀서 해결하는 운영형 트러블슈팅 절차입니다.",
    contentMd: `## 증상별 빠른 분류
### A. 설치 실패
- npm 권한 오류
- 패키지 설치 중 네트워크 타임아웃

### B. 설치는 됐는데 명령어 미인식
- PATH 반영 실패
- 터미널 재시작 누락

### C. 실행은 되는데 인증 실패
- 계정/키 미설정
- 네트워크/프록시 정책

## 1단계: 런타임 확인
\`\`\`bash
node -v
npm -v
git --version
\`\`\`
- 여기서 실패하면 AI CLI 이전에 기본 런타임 문제입니다.

## 2단계: 도구 자체 확인
\`\`\`bash
codex --version
claude --version
claude doctor
\`\`\`
- 최소 버전 확인 및 진단 결과를 먼저 확보합니다.

## 3단계: 환경변수/시크릿 확인
- 키가 필요한 도구는 로컬 shell 환경변수 또는 서비스 설정값 누락 여부를 먼저 확인합니다.
- 로컬/운영 값을 섞어 쓰지 않도록 환경별 파일을 분리합니다.

## 4단계: 네트워크 점검
- 사내망/보안 솔루션으로 외부 접근이 차단되는지 확인
- 인증 페이지 리디렉션이 막히는 브라우저 정책 여부 확인

## 5단계: 재설치 기준
- 동일 오류가 2회 이상 반복되고 원인이 불명확하면
  1) 패키지 제거
  2) 터미널 재시작
  3) 공식 설치 명령으로 재설치

## 참고 자료
- OpenAI Codex CLI(공식): https://github.com/openai/codex
- Claude Code Setup: https://code.claude.com/docs/en/setup

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, 공식 설치/진단 명령을 기준으로 현장에서 바로 적용 가능한 순서로 재구성했습니다.
`,
    platformTags: ["Operations"],
    toolTags: ["Troubleshooting", "Codex CLI", "Claude Code"],
  },
  {
    slug: "tips-prompt-template-for-clear-requests",
    title: "요청을 잘 쓰는 실전 템플릿: 비전공자용 프롬프트 구조 7단계",
    track: "tips",
    topic: "concepts-and-tips",
    summary:
      "무엇을 만들고 싶은지 막연할 때도 결과 품질을 높일 수 있도록 목표·제약·출력형식·검증기준을 포함한 요청 템플릿을 제공합니다.",
    contentMd: `## 왜 템플릿이 필요한가
- AI 품질은 모델보다 \"요청의 명확도\"에 더 크게 영향을 받습니다.
- 특히 비전공자는 기술 용어보다 목표/맥락/검증기준을 분리해서 쓰는 것이 효과적입니다.

## 7단계 요청 템플릿
1. 목표: 무엇을 만들고 싶은가
2. 대상: 누가 사용할 것인가
3. 환경: OS/언어/프레임워크/배포 환경
4. 제약: 시간, 예산, 사용 금지 기술
5. 출력 형식: 코드/문서/체크리스트/표
6. 검증 기준: 성공 여부를 무엇으로 판단할지
7. 금지 사항: 추측 금지, 불확실 시 질문 등

## 바로 쓰는 예시
\`\`\`text
목표: 관리자 화면에서 지식 문서를 삭제할 수 있게 해줘.
환경: Next.js App Router, Supabase 사용 중
제약: 기존 UI 스타일 유지, 관리자만 가능
출력 형식: 변경 파일 목록 + 핵심 코드 + 테스트 방법
검증 기준: 삭제 후 목록에서 즉시 사라지고, 권한 없는 사용자는 실패해야 함
금지 사항: 기존 동작 깨뜨리지 말 것
\`\`\`

## 품질을 올리는 한 줄
- \"완료 후 변경/수정/삭제 리스트를 표로 정리해줘\"
- \"실패 가능성이 있는 부분은 가정으로 표시해줘\"

## 참고 자료
- 자체 생성 (내부 운영 패턴 기반 템플릿)

## 작성/검증 방식
- 본 문서는 AI가 자체 생성한 운영 템플릿이며, 특정 외부 문서를 직접 인용하지 않았습니다.
`,
    platformTags: ["Prompting"],
    toolTags: ["Prompt", "Template"],
  },
  {
    slug: "tips-bug-report-template-for-ai-collaboration",
    title: "버그 제보를 잘 쓰는 법: AI/개발자 모두 이해하는 재현 템플릿",
    track: "tips",
    topic: "workflow-and-ops",
    summary:
      "버그를 빨리 고치려면 '문제 설명'보다 '재현 가능한 정보'가 중요합니다. 재현 단계, 기대 결과, 실제 결과, 로그 첨부 기준을 템플릿으로 제공합니다.",
    contentMd: `## 왜 버그 제보 형식이 중요한가
- 같은 버그라도 제보 품질에 따라 해결 시간 차이가 크게 납니다.
- AI와 협업할 때는 특히 \"재현 가능성\"이 핵심입니다.

## 버그 제보 템플릿
### 1) 제목
- [영역] + [증상] + [조건]
- 예: [지식문서관리] 삭제 버튼 클릭 시 화면 멈춤 (관리자 계정)

### 2) 재현 단계
1. 관리자 로그인
2. /admin/knowledge 접속
3. 특정 문서 삭제 버튼 클릭
4. 결과 확인

### 3) 기대 결과 / 실제 결과
- 기대: 삭제 후 목록에서 즉시 제거
- 실제: 로딩만 계속됨, 목록 갱신 안 됨

### 4) 환경 정보
- OS, 브라우저, 시간대, 배포 URL, 사용자 권한

### 5) 증거 첨부
- 콘솔 에러 캡처
- 네트워크 탭 실패 요청/응답
- 서버 로그(가능한 범위)

## AI에게 바로 넘기는 요약 형식
\`\`\`text
문제: ...
재현 단계: ...
기대 결과: ...
실제 결과: ...
최근 변경 파일: ...
로그 요약: ...
\`\`\`

## 참고 자료
- 자체 생성 (실무 버그 트리아지 패턴 기반)

## 작성/검증 방식
- 본 문서는 AI가 자체 생성한 운영 템플릿이며, 특정 외부 문서를 직접 인용하지 않았습니다.
`,
    platformTags: ["Ops"],
    toolTags: ["Bug Report", "Template"],
  },
];

async function run() {
  loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required.");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const targetTracks: Track[] = ["basics", "level-up", "tips"];
  const curatedSlugSet = new Set(curatedArticles.map((item) => item.slug));

  const { data: existingRows, error: existingError } = await supabase
    .from("knowledge_articles")
    .select("id,slug,title,track,status")
    .in("track", targetTracks);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existing = existingRows ?? [];
  const toDelete = existing.filter((row) => !curatedSlugSet.has(row.slug));

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("knowledge_articles")
      .delete()
      .in(
        "id",
        toDelete.map((row) => row.id),
      );

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  const nowIso = new Date().toISOString();
  const existingBySlug = new Map(existing.map((row) => [row.slug, row]));
  let created = 0;
  let updated = 0;

  for (const article of curatedArticles) {
    const current = existingBySlug.get(article.slug);

    const payload = {
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      content_md: article.contentMd,
      track: article.track,
      topic: article.topic,
      status: "published",
      featured: article.track === "basics",
      platform_tags: article.platformTags ?? [],
      tool_tags: article.toolTags ?? [],
      resource_url: null,
      published_at: nowIso,
      updated_at: nowIso,
    };

    const { error: upsertError } = await supabase
      .from("knowledge_articles")
      .upsert(payload, { onConflict: "slug" });

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    if (current) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log("Knowledge guides refresh completed.");
  console.log(
    JSON.stringify(
      {
        created,
        updated,
        deleted: toDelete.length,
        deletedList: toDelete.map((row) => ({
          slug: row.slug,
          title: row.title,
          track: row.track,
          status: row.status,
        })),
        curatedList: curatedArticles.map((row) => ({
          slug: row.slug,
          title: row.title,
          track: row.track,
          topic: row.topic,
        })),
      },
      null,
      2,
    ),
  );
}

void run().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Unknown refresh knowledge guides error",
  );
  process.exit(1);
});

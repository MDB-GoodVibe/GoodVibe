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

function normalizeTitle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const newArticles: GuideArticle[] = [
  {
    slug: "terminal-basics-windows-mac-for-beginners",
    title: "터미널 기초 사용법: Windows PowerShell·macOS Terminal 입문",
    track: "basics",
    topic: "coding-basics",
    summary:
      "경로 이동, 파일 확인, 명령 실패 원인 파악까지 비전공자 기준으로 터미널 기본기를 단계별로 익히는 실전 가이드입니다.",
    contentMd: `## 누구를 위한 문서인가
- 마우스 중심 작업에 익숙하지만 AI 코딩 도구를 쓰기 위해 터미널이 필요한 분
- 에러가 나면 무엇부터 확인해야 할지 막막한 초급 사용자

## 왜 터미널이 중요한가
- Codex/Claude 같은 CLI 도구는 터미널에서 실행됩니다.
- 설치 확인, 버전 점검, 로그 확인은 대부분 터미널 명령으로 가장 빠르게 해결됩니다.

## 1) 꼭 알아야 할 기본 개념
- 현재 위치(working directory): 지금 명령이 실행되는 폴더
- 절대 경로: 드라이브/루트부터 시작하는 전체 주소
- 상대 경로: 현재 폴더 기준 이동 주소

## 2) Windows PowerShell 기본 명령
\`\`\`powershell
Get-Location         # 현재 위치 확인
Get-ChildItem        # 현재 폴더 목록 보기
Set-Location <경로>  # 폴더 이동 (cd와 동일)
\`\`\`

자주 쓰는 예시:
\`\`\`powershell
Set-Location C:\\Users\\<사용자명>\\Desktop
Get-ChildItem -Force
\`\`\`

## 3) macOS Terminal 기본 명령
\`\`\`bash
pwd            # 현재 위치
ls -la         # 파일/폴더 목록(숨김 포함)
cd <경로>      # 폴더 이동
\`\`\`

자주 쓰는 예시:
\`\`\`bash
cd ~/Desktop
ls -la
\`\`\`

## 4) 명령 실패 시 읽는 순서
1. 명령어 오타가 없는지 확인
2. 경로가 실제로 존재하는지 확인
3. 권한 오류인지 확인(관리자/권한 필요 여부)
4. 동일 명령 재실행 전, 에러 메시지의 핵심 키워드 기록

## 5) 비전공자 체크리스트
- [ ] 현재 경로를 직접 확인할 수 있다
- [ ] 원하는 폴더로 이동할 수 있다
- [ ] 파일 목록을 보고 숨김 파일까지 확인할 수 있다
- [ ] 에러 메시지에서 핵심 원인(경로/권한/오타)을 구분할 수 있다

## 참고 자료
- Microsoft PowerShell 기본 가이드: https://learn.microsoft.com/powershell/
- Mac Terminal 사용 안내: https://support.apple.com/guide/terminal/welcome/mac

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, 명령 체계와 개념 정의는 공식 문서 기준으로 검증했습니다.
`,
    platformTags: ["Windows", "macOS"],
    toolTags: ["PowerShell", "Terminal", "CLI"],
  },
  {
    slug: "api-key-management-openai-anthropic-gemini",
    title: "API 키 발급·보관·검증 실전: OpenAI·Anthropic·Gemini",
    track: "basics",
    topic: "tool-setup",
    summary:
      "OpenAI, Anthropic, Google Gemini API 키를 안전하게 발급하고, env로 연결하고, 유출 없이 운영하는 기본 절차를 정리한 문서입니다.",
    contentMd: `## 문서 목표
- API 키를 어디서 만들고 어디에 넣어야 하는지 혼동하지 않도록 표준 절차를 제시합니다.
- '브라우저/프론트에 키 노출 금지' 원칙을 실제 프로젝트 흐름에 맞춰 설명합니다.

## 1) 발급 위치
- OpenAI: Platform의 API Keys 페이지
- Anthropic: Console/Account의 API 키 관리 페이지
- Gemini: Google AI Studio에서 프로젝트 키 생성

## 2) 저장 원칙 (가장 중요)
1. 키는 서버 환경변수로만 사용
2. Git 저장소 커밋 금지
3. 팀원별 개별 키 사용(공유 금지)
4. 의심 시 즉시 키 폐기/재발급(rotate)

## 3) 프로젝트 적용 패턴
- 로컬 개발: \`.env.local\`
- 배포 환경: Vercel/Supabase 대시보드 환경변수
- 코드: \`process.env.<KEY_NAME>\`로만 참조

예시:
\`\`\`bash
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
\`\`\`

## 4) 연결 검증 방법
- 앱 시작 로그에서 '키 존재 여부'만 확인(실제 키 출력 금지)
- API 테스트 요청 1회로 인증 성공 여부 확인
- 실패 시 키 값보다 헤더/엔드포인트/권한 범위를 먼저 점검

## 5) 사고 예방 체크리스트
- [ ] 프론트 코드에 키가 없음
- [ ] 저장소 히스토리에 키 문자열이 없음
- [ ] 팀원별 권한/키를 분리함
- [ ] 월 사용량 모니터링/알림을 설정함

## 참고 자료
- OpenAI API 키 생성/사용: https://help.openai.com/en/articles/4936850-how-to-create-and-use-an-api-key
- OpenAI 키 보안 모범사례: https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
- Anthropic API 시작: https://docs.anthropic.com/en/api/getting-started
- Gemini API 키 설정: https://ai.google.dev/tutorials/setup

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, 키 보안/발급 동선은 각 서비스 공식 문서 기준으로 검증했습니다.
`,
    platformTags: ["OpenAI", "Anthropic", "Google AI Studio"],
    toolTags: ["API Key", "Environment Variables", "Security"],
  },
  {
    slug: "vscode-essential-extensions-and-setup",
    title: "VS Code 필수 확장/설정 가이드: 초보자 생산성 세팅",
    track: "basics",
    topic: "tool-setup",
    summary:
      "확장 설치 기준, 동기화 설정, 안전한 확장 관리까지 VS Code를 실무형으로 세팅하는 방법을 안내합니다.",
    contentMd: `## 목표
- "확장이 많을수록 좋다"가 아니라 "목적에 맞게 최소 구성"으로 안정성을 확보합니다.

## 1) 확장 선택 원칙
1. 사용 빈도가 높은 언어/프레임워크 중심으로 설치
2. 포맷터/린터는 팀 규칙과 일치하는 조합만 사용
3. 퍼블리셔 신뢰도, 업데이트 이력 확인 후 설치

## 2) 초보자 추천 시작 세트
- ESLint: 문법/품질 경고
- Prettier: 코드 포맷 일관화
- GitLens: 변경 이력 가시성
- Error Lens: 에러 즉시 표시

## 3) 설치와 점검
1. Extensions 뷰에서 확장 검색/설치
2. 프로젝트를 열고 실제 동작 확인
3. 충돌 시 포맷터 우선순위부터 정리

## 4) Settings Sync 사용법
- 여러 PC에서 같은 설정/확장을 재사용하려면 Settings Sync를 활성화
- 장치별로 동기화 제외할 항목을 분리해서 관리

## 5) 보안 주의사항
- 낯선 퍼블리셔 확장은 설명/권한 범위를 먼저 확인
- 불필요한 확장은 비활성화 또는 제거

## 체크리스트
- [ ] 포맷터가 팀 규칙과 일치함
- [ ] 린트 경고가 에디터에서 즉시 보임
- [ ] Settings Sync로 작업 환경이 재현됨
- [ ] 사용하지 않는 확장은 정리됨

## 참고 자료
- VS Code 확장 마켓플레이스 가이드: https://code.visualstudio.com/docs/configure/extensions/extension-marketplace
- VS Code 확장 사용 시작: https://code.visualstudio.com/docs/getstarted/extensions
- Settings Sync: https://code.visualstudio.com/docs/editor/settings-sync

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, 확장 설치/동기화 흐름은 VS Code 공식 문서 기준으로 검증했습니다.
`,
    platformTags: ["VS Code"],
    toolTags: ["Extensions", "Settings Sync", "Lint/Format"],
  },
  {
    slug: "oauth-callback-local-vs-production",
    title: "OAuth 콜백 URL 실수 방지: localhost와 배포 URL 분리 운영",
    track: "basics",
    topic: "concepts-and-tips",
    summary:
      "로그인 후 잘못된 도메인으로 튀는 문제를 막기 위해 Site URL/Redirect URLs를 환경별로 설정하는 방법을 설명합니다.",
    contentMd: `## 자주 발생하는 문제
- 로컬에서 로그인했는데 배포 URL로 이동
- 배포에서 로그인했는데 localhost로 리다이렉트

## 핵심 원리
- Site URL: redirectTo를 지정하지 않았을 때의 기본 리다이렉트
- Redirect URLs: 인증 후 허용할 목적지 목록
- 환경(dev/preview/prod)마다 URL이 분리되어야 충돌이 줄어듭니다.

## 1) 설정 절차
1. Supabase URL Configuration에서 Site URL을 프로덕션 도메인으로 설정
2. Redirect URLs에 localhost와 preview/prod 패턴을 정확히 추가
3. 클라이언트 코드에서 가능하면 \`redirectTo\`를 명시

## 2) Vercel + Supabase 운영 팁
- 프리뷰 URL은 와일드카드 패턴 사용 가능
- 프로덕션은 가능한 정확한 URL로 고정

## 3) 점검 순서
1. 로그인 요청 코드의 redirectTo 확인
2. Supabase 대시보드 Redirect allow list 확인
3. 실제 콜백 URL이 allow list와 일치하는지 확인

## 체크리스트
- [ ] localhost/preview/prod URL이 모두 등록됨
- [ ] Site URL이 프로덕션 기준으로 설정됨
- [ ] 인증 실패 시 URL fragment 에러를 파싱해 원인 확인 가능

## 참고 자료
- Supabase Redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, 리다이렉트 동작/와일드카드 규칙은 Supabase 공식 문서 기준으로 검증했습니다.
`,
    platformTags: ["Supabase", "Vercel"],
    toolTags: ["OAuth", "Redirect", "Auth"],
  },
  {
    slug: "supabase-rls-practical-patterns",
    title: "Supabase RLS 실전 패턴: 읽기/쓰기 권한 분리 설계",
    track: "level-up",
    topic: "workflow-and-ops",
    summary:
      "RLS를 켜는 것에서 끝내지 않고, 사용자/관리자/서비스 역할별 정책을 나누어 안전하게 운영하는 실전 패턴을 제공합니다.",
    contentMd: `## 목표
- "RLS 켰다"가 아니라 "테이블별 허용 규칙이 문서화되어 있다" 상태를 만듭니다.

## 1) 기본 원칙
1. 기본 거부(deny by default)
2. 필요한 작업만 최소 허용
3. 서비스 롤 우회 경로를 최소화

## 2) 정책 설계 순서
1. 액터 정의: anonymous, authenticated, service role, admin
2. 작업 정의: select/insert/update/delete
3. 테이블별 정책 매핑 문서화

## 3) 대표 패턴
- 본인 데이터만 조회: \`auth.uid() = user_id\`
- 관리자 전용 수정: 관리자 role claim 또는 별도 admin 테이블 검증
- 공개 데이터 읽기 + 쓰기 제한 분리

## 4) 운영 체크
- 신규 테이블 생성 시 RLS 기본 활성화 여부
- 정책 없는 쓰기 권한이 열려 있지 않은지 점검
- API 에러 로그에서 permission denied 빈도 모니터링

## 체크리스트
- [ ] 모든 핵심 테이블에 RLS 적용
- [ ] 액터별 허용 작업표가 존재
- [ ] 관리자 정책과 일반 사용자 정책이 분리됨

## 참고 자료
- Supabase API 보안 가이드: https://supabase.com/docs/guides/api/securing-your-api
- Supabase RLS 가이드: https://supabase.com/docs/guides/auth/row-level-security

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, 정책 방향성과 권장 보안 패턴은 Supabase 공식 문서 기준으로 검증했습니다.
`,
    platformTags: ["Supabase"],
    toolTags: ["RLS", "Authorization", "Security"],
  },
  {
    slug: "youtube-data-api-quota-error-retry-guide",
    title: "YouTube Data API 쿼터·오류 대응 가이드",
    track: "level-up",
    topic: "workflow-and-ops",
    summary:
      "채널/영상 수집 자동화에서 자주 만나는 quotaExceeded, 4xx/5xx 에러를 분류하고 재시도/백오프 전략을 설계하는 방법입니다.",
    contentMd: `## 목표
- "왜 실패했는지"를 빠르게 분류하고, 재시도 가능한 실패와 아닌 실패를 분리합니다.

## 1) 쿼터 기본 이해
- YouTube Data API는 요청마다 quota unit을 소비
- 기본 일일 할당량이 있으며, 잘못된 요청도 최소 비용이 발생
- 페이지네이션 시 호출 횟수만큼 추가 비용 발생

## 2) 자주 나오는 오류 타입
- 400 badRequest: 파라미터 조합/값 오류
- 403 forbidden/quotaExceeded: 권한 또는 쿼터 초과
- 404 notFound: 채널/영상 식별자 불일치

## 3) 재시도 전략
- 즉시 실패 처리: 400류(요청 수정 필요)
- 제한적 재시도: 429/5xx, 네트워크 일시 오류
- 지수 백오프 + 상한 설정 + 최대 시도 횟수 제한

## 4) 운영 팁
- 고비용 endpoint 최소화
- 중복 수집 방지(이미 처리한 videoId skip)
- job 로그에 요청 파라미터/응답코드 저장

## 체크리스트
- [ ] quota 모니터링 대시보드 확인 루틴 존재
- [ ] 에러 코드별 대응 규칙 문서화
- [ ] 재시도 횟수와 백오프 정책이 코드에 반영됨

## 참고 자료
- YouTube Data API 개요/쿼터: https://developers.google.com/youtube/v3/getting-started
- Quota Calculator: https://developers.google.com/youtube/v3/determine_quota_cost
- YouTube Data API Errors: https://developers.google.com/youtube/v3/docs/errors

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, 쿼터/오류 분류 기준은 YouTube 공식 문서 기준으로 검증했습니다.
`,
    platformTags: ["YouTube"],
    toolTags: ["YouTube Data API", "Retry", "Backoff"],
  },
  {
    slug: "automation-flow-collect-summarize-publish-idempotent",
    title: "자동화 플로우 설계: 수집→요약→등록을 idempotent하게 운영하기",
    track: "level-up",
    topic: "workflow-and-ops",
    summary:
      "자동화가 중복 등록/중복 요약을 만들지 않도록 idempotency 키와 단계별 상태관리를 설계하는 방법을 설명합니다.",
    contentMd: `## 목표
- 같은 작업을 여러 번 실행해도 결과가 중복되지 않는 자동화 구조를 만듭니다.

## 1) 파이프라인 3단계
1. 수집(Collect): 신규 항목 식별
2. 요약(Summarize): 텍스트/메타 기반 초안 생성
3. 등록(Publish): knowledge_articles 반영

## 2) idempotency 핵심
- 외부 고유 ID(videoId 등)를 내부 unique key로 사용
- 등록 전 "이미 존재하는지" 조회
- 실패 재실행 시 동일 항목은 스킵 또는 업데이트만 수행

## 3) 상태 관리 권장안
- pending → running → completed/failed
- 각 단계별 started_at/finished_at/error 저장
- 재처리 버튼은 "failed만 재실행" 같은 명확한 기준 필요

## 4) 장애 대응
- 일시 오류: 백오프 재시도
- 영구 오류(잘못된 입력): 즉시 실패 및 수동 개입 필요 표시
- 로그에 correlation id를 넣어 한 건의 흐름을 추적

## 체크리스트
- [ ] 외부 ID unique 제약이 있다
- [ ] 단계별 상태 전이가 기록된다
- [ ] 실패 재실행 시 중복 생성이 없다

## 참고 자료
- HTTP idempotent method 개념(MDN): https://developer.mozilla.org/en-US/docs/Glossary/Idempotent
- Stripe idempotency 개념 참고: https://docs.stripe.com/api/idempotent_requests

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, idempotency 개념은 표준/공식 API 문서 개념을 기준으로 검증했습니다.
`,
    platformTags: ["Automation"],
    toolTags: ["Idempotency", "Workflow", "Job Queue"],
  },
  {
    slug: "prompt-quality-evaluation-and-regression-guide",
    title: "프롬프트 품질 검증 가이드: 평가 기준과 회귀 테스트 운영",
    track: "level-up",
    topic: "examples-and-showcase",
    summary:
      "좋은 프롬프트를 감으로 관리하지 않고, 평가 기준/샘플셋/회귀 테스트로 품질을 유지하는 운영 방법을 설명합니다.",
    contentMd: `## 목표
- "잘 되는 것 같다" 수준에서 벗어나 반복 가능한 품질 평가 체계를 만듭니다.

## 1) 평가 기준 먼저 정의
- 정확성: 사실/요구사항 일치 여부
- 완전성: 필요한 항목 누락 여부
- 실행가능성: 사용자가 바로 따라할 수 있는지

## 2) 테스트 세트 운영
- 대표 시나리오 10~20개 고정
- 쉬운 케이스/어려운 케이스/오류 유도 케이스 분리
- 프롬프트 수정 전후 결과를 같은 세트로 비교

## 3) 회귀(regression) 체크
- 개선하려던 항목이 좋아져도, 기존 강점이 깨지지 않았는지 확인
- 점수 하락 항목은 릴리즈 전 차단

## 4) 실무 적용 팁
- 평가 결과를 PR 설명에 첨부
- "왜 바꿨는지"와 "무엇이 좋아졌는지"를 수치/사례로 기록

## 체크리스트
- [ ] 평가 기준 3개 이상이 문서화됨
- [ ] 고정 테스트 세트가 존재함
- [ ] 변경 전/후 비교 결과가 남아 있음

## 참고 자료
- OpenAI Prompting Guide: https://platform.openai.com/docs/guides/prompt-engineering
- OpenAI Evals guide: https://platform.openai.com/docs/guides/evals

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, 프롬프트 평가/개선 방법은 OpenAI 공식 가이드를 기준으로 정리했습니다.
`,
    platformTags: ["Prompt Engineering"],
    toolTags: ["Evaluation", "Regression", "Quality"],
  },
  {
    slug: "utf8-encoding-bom-troubleshooting-guide",
    title: "한글 깨짐 방지 실전: UTF-8/BOM 인코딩 점검 루틴",
    track: "tips",
    topic: "workflow-and-ops",
    summary:
      "문서/코드/DB에서 한글이 깨지는 문제를 UTF-8 기준으로 빠르게 진단하고 복구하는 체크리스트를 제공합니다.",
    contentMd: `## 증상 예시
- 화면에 ??? 또는 깨진 문자 표시
- 같은 파일인데 에디터/브라우저/DB에서 다르게 보임

## 1) 원인 분류
1. 파일 인코딩 불일치(UTF-8 아님)
2. BOM(Byte Order Mark) 처리 차이
3. DB 연결/클라이언트 문자셋 불일치

## 2) 빠른 진단 순서
1. 파일 저장 인코딩 확인(UTF-8)
2. API 응답의 content-type charset 확인
3. DB에서 원문 값이 깨졌는지 직접 조회
4. 렌더러가 escaping/디코딩을 잘못했는지 점검

## 3) 복구 팁
- 동일 소스에서 깨진 문자열이 퍼졌다면 원본부터 재입력
- 파일 저장 시 UTF-8(no BOM) 팀 규칙 통일
- 배포 전 인코딩 체크 스크립트/리뷰 항목 추가

## 체크리스트
- [ ] 주요 텍스트 파일이 UTF-8로 저장됨
- [ ] BOM 정책(허용/비허용)이 팀에 합의됨
- [ ] API/DB/프론트에서 문자열이 일관되게 표시됨

## 참고 자료
- Unicode BOM FAQ: https://www.unicode.org/faq/utf_bom.html
- W3C Character encodings overview: https://www.w3.org/International/questions/qa-what-is-encoding

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, 인코딩/BOM 개념 정의는 Unicode/W3C 공식 자료 기준으로 검증했습니다.
`,
    platformTags: ["Encoding"],
    toolTags: ["UTF-8", "BOM", "Troubleshooting"],
  },
  {
    slug: "ai-output-quality-checklist-for-non-developers",
    title: "AI 결과물 품질 체크리스트: 비전공자 검수 루틴",
    track: "tips",
    topic: "concepts-and-tips",
    summary:
      "AI가 만든 답변/코드/문서를 그대로 쓰지 않고 정확성·재현성·보안 관점에서 빠르게 검수하는 방법을 제공합니다.",
    contentMd: `## 왜 검수가 필요한가
- AI 출력은 빠르지만, 사실 오류/누락/환각이 섞일 수 있습니다.
- 특히 배포 전에는 "작동"과 "안전"을 분리해 확인해야 합니다.

## 1) 5분 검수 루틴
1. 요구사항 충족 여부: 빠진 조건 없는지
2. 사실 검증: 외부 문서 링크로 핵심 주장 확인
3. 실행 검증: 실제 명령/코드 실행 여부 확인
4. 보안 검증: 비밀키/권한/개인정보 노출 여부
5. 롤백 계획: 잘못 배포했을 때 되돌리는 방법

## 2) 문서형 결과물 체크
- 초보자가 그대로 따라할 수 있는 단계인지
- 전제조건/주의사항/실패 대응이 있는지
- 참고 출처 링크가 명확한지

## 3) 코드형 결과물 체크
- 오류 로그가 없는지
- 테스트/빌드가 통과하는지
- 기존 기능에 회귀(regression)가 없는지

## 참고 자료
- OpenAI Prompting guide: https://platform.openai.com/docs/guides/prompt-engineering
- OpenAI API Quickstart: https://platform.openai.com/docs/quickstart

## 작성/검증 방식
- 본 문서는 AI가 자체 생성한 검수 프레임워크를 바탕으로 작성했고, 검증 관점은 OpenAI 공식 개발 가이드를 참고했습니다.
`,
    platformTags: ["AI Collaboration"],
    toolTags: ["Checklist", "Validation", "QA"],
  },
  {
    slug: "token-cost-optimization-practical-tips",
    title: "토큰/비용 절약 실전 팁: 문맥 줄이기·배치 처리·스트리밍",
    track: "tips",
    topic: "workflow-and-ops",
    summary:
      "API 사용량이 늘어날수록 비용을 통제하기 위해 적용할 수 있는 토큰 최적화 패턴을 실무 기준으로 정리했습니다.",
    contentMd: `## 목표
- 품질을 크게 해치지 않으면서 토큰 사용량과 호출 비용을 줄입니다.

## 1) 입력 최적화
- 불필요한 대화 이력 제거
- 중복 지시문 통합
- 긴 문서 전체 대신 필요한 구간만 전달

## 2) 처리 방식 최적화
- 대량 작업은 Batch 처리 고려
- 사용자 체감 속도는 Streaming으로 개선
- 재사용 가능한 시스템 지침은 템플릿화

## 3) 운영 최적화
- 요청 유형별 모델/파라미터 분리
- 실패 재시도는 동일 입력 중복 호출을 막도록 설계
- 월/주 단위 사용량 리포트 자동화

## 체크리스트
- [ ] 긴 대화 컨텍스트를 주기적으로 정리함
- [ ] 대량 작업은 배치 경로를 사용함
- [ ] 응답 지연 체감은 스트리밍으로 완화함

## 참고 자료
- OpenAI Batch guide: https://platform.openai.com/docs/guides/batch
- OpenAI Streaming guide: https://platform.openai.com/docs/guides/streaming-responses
- OpenAI Rate limits/tiers: https://platform.openai.com/docs/guides/rate-limits

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, 비용/처리 최적화 방법은 OpenAI 공식 가이드 기준으로 검증했습니다.
`,
    platformTags: ["OpenAI API"],
    toolTags: ["Cost Optimization", "Batch", "Streaming"],
  },
  {
    slug: "pr-commit-quality-rules-for-small-teams",
    title: "PR/커밋 품질 규칙: 작은 팀을 위한 실전 운영 기준",
    track: "tips",
    topic: "workflow-and-ops",
    summary:
      "코드 리뷰가 빠르고 정확해지도록 PR 크기, 설명 방식, 커밋 메시지 규칙을 팀 단위로 정착시키는 방법을 안내합니다.",
    contentMd: `## 목표
- 리뷰 시간을 줄이면서 품질을 올리는 팀 공통 규칙을 만듭니다.

## 1) 작은 PR 원칙
- 한 PR에 하나의 목적만 담기
- 변경 파일이 많다면 리뷰 순서를 본문에 안내
- 스크린샷/테스트 결과 첨부로 맥락 제공

## 2) 커밋 메시지 규칙
- "무엇을" + "왜"를 짧게 포함
- 의미 없는 메시지(update, fix only) 지양
- 롤백 가능한 단위로 쪼개서 커밋

## 3) 리뷰 품질 높이기
- PR 본문에 위험요소/테스트 범위 명시
- 리뷰어에게 확인 포인트를 구체적으로 요청
- 피드백 반영 내역을 댓글로 요약

## 체크리스트
- [ ] PR이 단일 목적을 갖는다
- [ ] PR 본문에 변경 이유와 검증 방법이 있다
- [ ] 커밋 히스토리만 봐도 의도 파악이 가능하다

## 참고 자료
- GitHub PR Best Practices: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/best-practices-for-pull-requests

## 작성/검증 방식
- 본 문서는 AI가 초안을 작성했고, PR 협업 운영 원칙은 GitHub 공식 가이드를 기준으로 검증했습니다.
`,
    platformTags: ["GitHub"],
    toolTags: ["Pull Request", "Commit", "Code Review"],
  },
];

async function run() {
  loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY(or SUPABASE_SECRET_KEY) are required.");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: existingRows, error: existingError } = await supabase
    .from("knowledge_articles")
    .select("id,slug,title,track,status")
    .in("track", ["basics", "level-up", "tips"]);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existing = existingRows ?? [];
  const existingSlugSet = new Set(existing.map((row) => row.slug));
  const existingTitleSet = new Set(existing.map((row) => normalizeTitle(row.title)));

  const nowIso = new Date().toISOString();
  const created: string[] = [];
  const updated: string[] = [];
  const skippedByTitle: string[] = [];

  for (const article of newArticles) {
    const duplicatedTitle = existingTitleSet.has(normalizeTitle(article.title));
    const duplicatedSlug = existingSlugSet.has(article.slug);

    if (duplicatedTitle && !duplicatedSlug) {
      skippedByTitle.push(`${article.track} :: ${article.title} :: ${article.slug}`);
      continue;
    }

    const payload = {
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      content_md: article.contentMd,
      track: article.track,
      topic: article.topic,
      status: "published",
      featured: false,
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
      throw new Error(`${article.slug}: ${upsertError.message}`);
    }

    if (duplicatedSlug) {
      updated.push(`${article.track} :: ${article.title} :: ${article.slug}`);
    } else {
      created.push(`${article.track} :: ${article.title} :: ${article.slug}`);
      existingSlugSet.add(article.slug);
      existingTitleSet.add(normalizeTitle(article.title));
    }
  }

  console.log(
    JSON.stringify(
      {
        totalInput: newArticles.length,
        createdCount: created.length,
        updatedCount: updated.length,
        skippedByTitleCount: skippedByTitle.length,
        created,
        updated,
        skippedByTitle,
      },
      null,
      2,
    ),
  );
}

void run().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Unknown add expanded knowledge guides error",
  );
  process.exit(1);
});

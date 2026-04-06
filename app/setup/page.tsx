import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  KeyRound,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabasePublicRuntime, getSupabaseSetupChecklist } from "@/lib/env";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin";

const requiredEnvRows = [
  {
    key: "NEXT_PUBLIC_SITE_URL",
    description: "로컬 개발과 OAuth 리디렉션 기준 주소",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    description: "프로젝트 URL",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    description: "브라우저에서 쓰는 공개 키",
  },
] as const;

const optionalEnvRows = [
  {
    key: "SUPABASE_SECRET_KEY",
    description: "서버 전용 관리자 작업용 키",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    description: "이전 코드 호환용 공개 키",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    description: "이전 코드 호환용 서버 관리자 키",
  },
  {
    key: "SUPABASE_PROJECT_REF",
    description: "CLI 및 운영 자동화용 프로젝트 참조값",
  },
  {
    key: "SUPABASE_ACCESS_TOKEN",
    description: "Supabase 계정 토큰",
  },
] as const;

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#b8b8d1]/35 bg-[#fffffb]/72 px-4 py-3">
      <span className="text-sm text-foreground">{label}</span>
      <span className="inline-flex items-center gap-2 text-sm">
        {value ? (
          <>
            <CheckCircle2 className="size-4 text-[#5b5f97]" />
            준비됨
          </>
        ) : (
          <>
            <XCircle className="size-4 text-[#ff6b6c]" />
            필요
          </>
        )}
      </span>
    </div>
  );
}

export default function SetupPage() {
  const runtime = getSupabasePublicRuntime();
  const checklist = getSupabaseSetupChecklist();
  const hasPublicEnv = checklist.supabaseUrl && checklist.browserKey;
  const hasAdminEnv = hasSupabaseAdminEnv();

  return (
    <main className="section-shell flex-1 py-10 sm:py-14">
      <div className="space-y-8">
        <Card className="glass-panel rounded-[2rem] border-[#b8b8d1]/35">
          <CardContent className="grid gap-6 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#b8b8d1]/45 bg-[#fffffb]/80 px-4 py-2 text-sm text-muted-foreground shadow-soft">
                <KeyRound className="size-4 text-primary" />
                Supabase 0단계 설정
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  키를 넣기 전에
                  <br />
                  연결 구조부터 준비해 두었습니다.
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                  이 페이지에서 현재 준비 상태를 확인하고, 같은 구조로{" "}
                  <code className="mx-1 rounded bg-[#fffffb] px-1.5 py-0.5 text-foreground">
                    .env.local
                  </code>
                  을 채우면 바로 다음 단계 구현으로 이어갈 수 있습니다.
                </p>
              </div>
            </div>

            <div className="rounded-[1.8rem] panel-accent px-5 py-5">
              <p className="text-xs uppercase tracking-[0.22em] text-primary">
                현재 상태
              </p>
              <div className="mt-4 space-y-3">
                <StatusRow label="공개 연결 키" value={hasPublicEnv} />
                <StatusRow label="관리자 서버 키" value={hasAdminEnv} />
                <StatusRow label="SITE URL" value={checklist.siteUrl} />
              </div>

              <div className="mt-4 rounded-2xl panel-muted px-4 py-4 text-sm leading-6 text-muted-foreground">
                <p>
                  Project URL:{" "}
                  <span className="text-foreground">
                    {runtime.supabaseUrl ?? "아직 비어 있음"}
                  </span>
                </p>
                <p className="mt-2">
                  공개 키 우선순위:{" "}
                  <span className="text-foreground">
                    {checklist.publishableKey
                      ? "Publishable key 사용 중"
                      : checklist.legacyAnonKey
                        ? "Legacy anon key fallback 사용 중"
                        : "아직 비어 있음"}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="glass-panel rounded-[2rem] border-[#b8b8d1]/35">
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl">1. .env.local 구조</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[1.6rem] border border-[#b8b8d1]/35 bg-[#5b5f97] px-5 py-5 text-sm leading-7 whitespace-pre-wrap text-[#fffffb] shadow-soft">
{`# 필수
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# 선택: 서버 전용 고권한 키
SUPABASE_SECRET_KEY=

# 선택: 과거 코드/점진 전환용
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 선택: 향후 CLI/운영 자동화용
SUPABASE_PROJECT_REF=
SUPABASE_ACCESS_TOKEN=`}
              </div>

              <div className="grid gap-3">
                {requiredEnvRows.map((row) => (
                  <StatusRow
                    key={row.key}
                    label={`${row.key} · ${row.description}`}
                    value={
                      row.key === "NEXT_PUBLIC_SITE_URL"
                        ? checklist.siteUrl
                        : row.key === "NEXT_PUBLIC_SUPABASE_URL"
                          ? checklist.supabaseUrl
                          : checklist.publishableKey || checklist.legacyAnonKey
                    }
                  />
                ))}
              </div>

              <div className="grid gap-3">
                {optionalEnvRows.map((row) => (
                  <div
                    key={row.key}
                    className="rounded-2xl border border-[#b8b8d1]/35 bg-[#fffffb]/72 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-foreground">{row.key}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {row.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-panel rounded-[2rem] border-[#b8b8d1]/35">
              <CardHeader className="space-y-3">
                <CardTitle className="text-lg">2. 키 위치</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                <p>
                  Project URL / Publishable key:
                  <br />
                  Supabase Dashboard에서 프로젝트를 열고{" "}
                  <strong className="text-foreground">Connect</strong> 또는{" "}
                  <strong className="text-foreground">Settings → API Keys</strong>
                  에서 확인합니다.
                </p>
                <p>
                  Secret key:
                  <br />
                  <strong className="text-foreground">Settings → API Keys</strong>
                  의 서버 전용 키입니다. 이 값은 반드시{" "}
                  <code className="mx-1 rounded bg-[#fffffb] px-1.5 py-0.5 text-foreground">
                    .env.local
                  </code>
                  에만 넣습니다.
                </p>
                <p>
                  Google 로그인 설정:
                  <br />
                  <strong className="text-foreground">
                    Authentication → Providers → Google
                  </strong>
                  에서 Supabase callback URL을 확인하고, Google Cloud Console의 Redirect URI에 같은 값을 넣습니다.
                </p>
                <p>
                  Redirect URL / Site URL:
                  <br />
                  <strong className="text-foreground">
                    Authentication → URL Configuration
                  </strong>
                  에서 관리합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel rounded-[2rem] border-[#b8b8d1]/35">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-accent" />
                  <CardTitle className="text-lg">3. 보안 규칙</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>
                  <strong className="text-foreground">NEXT_PUBLIC_</strong> 값은 브라우저에
                  노출됩니다. 공개 키만 넣어야 합니다.
                </p>
                <p>
                  Secret / service_role 계열 키는 절대 Git에 올리지 말고,
                  대화창이나 문서에도 그대로 붙이지 않습니다.
                </p>
                <p>
                  Google Client ID / Secret은 Next.js env보다 Supabase Google Provider 설정에
                  넣는 방식을 기본으로 사용합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a
              href="https://supabase.com/docs/guides/api/api-keys"
              target="_blank"
              rel="noreferrer"
            >
              API Keys 문서
              <ExternalLink className="size-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a
              href="https://supabase.com/docs/guides/auth/social-login/auth-google"
              target="_blank"
              rel="noreferrer"
            >
              Google 로그인 문서
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}

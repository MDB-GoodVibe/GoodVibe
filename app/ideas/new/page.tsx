import Link from "next/link";
import { redirect } from "next/navigation";

import { createIdeaPostAction } from "@/app/ideas/actions";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { IdeaFormFields } from "@/components/ideas/idea-form-fields";
import { FormPendingOverlay } from "@/components/ui/form-pending-overlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { getCurrentViewer } from "@/lib/auth/viewer";

export default async function NewIdeaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const viewer = await getCurrentViewer();
  const params = await searchParams;

  if (viewer && !viewer.nickname) {
    redirect("/auth/onboarding?next=/ideas/new");
  }

  return (
    <main className="section-shell flex-1 py-12">
      <div className="mx-auto max-w-3xl">
        {!viewer ? (
          <Card className="glass-panel rounded-[2rem] border-[#b8b8d1]/35">
            <CardHeader className="space-y-3">
              <CardTitle className="text-3xl">
                아이디어를 등록하려면 로그인해 주세요
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                아이디어 작성은 Google 로그인 후 이용할 수 있습니다.
              </p>
              <GoogleSignInButton next="/ideas/new" />
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-panel rounded-[2rem] border-[#b8b8d1]/35">
            <CardHeader className="space-y-3">
              <CardTitle className="text-3xl">아이디어 등록</CardTitle>
              <p className="text-sm leading-7 text-muted-foreground">
                모든 회원이 아이디어를 등록할 수 있고, 등록한 글은 본인만 수정할 수 있습니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={createIdeaPostAction} className="relative space-y-4">
                <IdeaFormFields />

                {params.error ? (
                  <p className="text-sm text-accent">
                    {params.error === "invalid-links"
                      ? "참고 링크는 http 또는 https 형식의 올바른 주소만 입력할 수 있습니다."
                      : "저장하지 못했습니다. Supabase 테이블이 아직 준비되지 않았거나 입력값이 비어 있을 수 있습니다."}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <PendingSubmitButton pendingLabel="등록 중...">
                    등록하기
                  </PendingSubmitButton>
                  <Button asChild variant="outline">
                    <Link href="/ideas">목록으로</Link>
                  </Button>
                </div>

                <FormPendingOverlay
                  label="아이디어를 등록하고 있어요..."
                  className="rounded-[1.5rem]"
                />
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

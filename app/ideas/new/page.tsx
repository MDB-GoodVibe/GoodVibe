import Link from "next/link";
import { redirect } from "next/navigation";

import { createIdeaPostAction } from "@/app/ideas/actions";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
                아이디어 작성은 Google 로그인 후 사용할 수 있습니다.
              </p>
              <GoogleSignInButton next="/ideas/new" />
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-panel rounded-[2rem] border-[#b8b8d1]/35">
            <CardHeader className="space-y-3">
              <CardTitle className="text-3xl">아이디어 등록</CardTitle>
              <p className="text-sm leading-7 text-muted-foreground">
                제목과 내용을 적으면 다른 사용자가 보고 투표할 수 있습니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={createIdeaPostAction} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground" htmlFor="title">
                    제목
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="예: 수업 공지와 자료를 한 번에 관리하는 서비스"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground" htmlFor="content">
                    내용
                  </label>
                  <Textarea
                    id="content"
                    name="content"
                    className="min-h-56"
                    placeholder="누가 쓰는지, 어떤 문제가 있는지, 어떤 결과를 얻고 싶은지 중심으로 적어 주세요."
                    required
                  />
                </div>

                {params.error ? (
                  <p className="text-sm text-accent">
                    저장하지 못했습니다. Supabase 테이블이 아직 준비되지 않았거나 입력값이 비어 있을 수 있습니다.
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit">등록하기</Button>
                  <Button asChild variant="outline">
                    <Link href="/ideas">목록으로</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

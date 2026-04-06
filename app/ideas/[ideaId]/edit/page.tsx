import Link from "next/link";
import { redirect } from "next/navigation";

import { updateIdeaPostAction } from "@/app/ideas/actions";
import { IdeaFormFields } from "@/components/ideas/idea-form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormPendingOverlay } from "@/components/ui/form-pending-overlay";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { getCurrentViewer } from "@/lib/auth/viewer";
import { getEditableIdeaPostById } from "@/lib/repositories/ideas";

export default async function EditIdeaPage({
  params,
  searchParams,
}: {
  params: Promise<{ ideaId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { ideaId } = await params;
  const query = await searchParams;
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect(`/profile?next=/ideas/${ideaId}/edit`);
  }

  if (!viewer.nickname) {
    redirect(`/auth/onboarding?next=/ideas/${ideaId}/edit`);
  }

  const idea = await getEditableIdeaPostById(ideaId, viewer.id);

  if (!idea) {
    return (
      <main className="section-shell flex-1 py-12">
        <div className="mx-auto max-w-2xl">
          <Card className="glass-panel rounded-[2rem] border-[#b8b8d1]/35">
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl">작성자만 수정할 수 있어요</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                존재하지 않는 글이거나 현재 계정으로 수정 권한이 없는 아이디어입니다.
              </p>
              <Button asChild variant="outline">
                <Link href="/ideas/mine">내가 등록한 아이디어로 이동</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="section-shell flex-1 py-12">
      <div className="mx-auto max-w-3xl">
        <Card className="glass-panel rounded-[2rem] border-[#b8b8d1]/35">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl">아이디어 수정</CardTitle>
            <p className="text-sm leading-7 text-muted-foreground">
              등록한 회원 본인만 제목, 내용, 참고 링크를 수정할 수 있습니다.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={updateIdeaPostAction} className="relative space-y-4">
              <input type="hidden" name="ideaId" value={idea.id} />

              <IdeaFormFields
                defaultTitle={idea.title}
                defaultContent={idea.content}
                defaultReferenceLinks={idea.referenceLinks}
              />

              {query.error ? (
                <p className="text-sm text-accent">
                  {query.error === "invalid-links"
                    ? "참고 링크는 http 또는 https 형식의 올바른 주소만 입력할 수 있습니다."
                    : "수정하지 못했습니다. 입력값을 다시 확인해 주세요."}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <PendingSubmitButton pendingLabel="수정 중...">
                  수정 저장
                </PendingSubmitButton>
                <Button asChild variant="outline">
                  <Link href={`/ideas/${idea.id}`}>상세로 돌아가기</Link>
                </Button>
              </div>

              <FormPendingOverlay
                label="아이디어를 수정하고 있어요..."
                className="rounded-[1.5rem]"
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

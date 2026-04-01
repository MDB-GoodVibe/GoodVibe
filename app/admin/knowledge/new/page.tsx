import { redirect } from "next/navigation";

import { KnowledgeEditor } from "@/components/admin/knowledge-editor";
import {
  getDefaultKnowledgeTopic,
  normalizeKnowledgeEditorMode,
  normalizeKnowledgeTrack,
} from "@/lib/knowledge/editor";
import { getCurrentViewer } from "@/lib/auth/viewer";
import { getKnowledgeSubmissionForAdmin } from "@/lib/repositories/knowledge-submissions";

function mapErrorMessage(error: string | undefined) {
  switch (error) {
    case "forbidden":
      return "관리자만 지식 문서를 작성할 수 있습니다.";
    default:
      return null;
  }
}

export default async function AdminKnowledgeNewPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    mode?: string;
    sourceSubmissionId?: string;
  }>;
}) {
  const viewer = await getCurrentViewer();
  const params = await searchParams;

  if (!viewer) {
    redirect("/profile");
  }

  if (viewer.role !== "admin") {
    redirect("/admin/knowledge?error=forbidden");
  }

  const mode = normalizeKnowledgeEditorMode(params.mode);
  const submission = params.sourceSubmissionId
    ? await getKnowledgeSubmissionForAdmin(params.sourceSubmissionId)
    : null;
  const initialTrack = submission
    ? normalizeKnowledgeTrack(submission.category)
    : normalizeKnowledgeTrack("basics");
  const initialTopic = getDefaultKnowledgeTopic(initialTrack);

  return (
    <main className="flex-1 py-10">
      <KnowledgeEditor
        initialMode={mode}
        initialTrack={initialTrack}
        initialTopic={initialTopic}
        initialError={mapErrorMessage(params.error)}
        initialResourceUrl={submission?.resourceUrl ?? ""}
        initialTitleHint={mode === "ai" ? submission?.title ?? "" : ""}
        initialSummaryHint={mode === "ai" ? submission?.summary ?? "" : ""}
        initialDetails={mode === "ai" ? submission?.details ?? "" : ""}
        initialSubmission={
          submission
            ? {
                id: submission.id,
                requesterName: submission.requesterName,
                title: submission.title,
                summary: submission.summary,
                details: submission.details,
                category: submission.category,
                resourceUrl: submission.resourceUrl,
              }
            : null
        }
      />
    </main>
  );
}

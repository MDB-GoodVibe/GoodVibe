import { KnowledgeTrackView } from "@/components/knowledge-track-view";
import { listKnowledgeArticles } from "@/lib/repositories/knowledge";

export default async function KnowledgeExternalPage() {
  const articles = await listKnowledgeArticles("external");

  return (
    <KnowledgeTrackView
      track="external"
      title="외부리소스"
      description="공식 문서, GitHub 저장소, YouTube 채널처럼 바이브 코딩 학습과 서비스 구현에 도움이 되는 외부 자료를 큐레이션했습니다."
      articles={articles}
    />
  );
}

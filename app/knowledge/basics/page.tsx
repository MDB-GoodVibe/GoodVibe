import { KnowledgeTrackView } from "@/components/knowledge-track-view";
import { listKnowledgeArticles } from "@/lib/repositories/knowledge";

export default async function KnowledgeBasicsPage() {
  const articles = await listKnowledgeArticles("basics");

  return (
    <KnowledgeTrackView
      track="basics"
      title="기초가이드"
      description="바이브 코딩을 시작할 때 꼭 알아야 하는 핵심 개념, 도구 준비, 요구사항 작성법, 디버깅과 테스트 같은 기본기를 모았습니다."
      articles={articles}
    />
  );
}

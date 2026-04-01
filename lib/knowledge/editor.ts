import type { KnowledgeEditorMode } from "@/types/admin-knowledge";
import type { KnowledgeTrack } from "@/types/good-vibe";

export const knowledgeTopicOptions = {
  basics: [
    { value: "tool-setup", label: "도구 준비" },
    { value: "concepts-and-tips", label: "개념과 팁" },
    { value: "coding-basics", label: "구현 기본기" },
    { value: "glossary", label: "용어 정리" },
  ],
  "level-up": [
    { value: "workflow-and-ops", label: "워크플로와 운영" },
    { value: "examples-and-showcase", label: "예시와 쇼케이스" },
    { value: "concepts-and-tips", label: "고급 개념과 팁" },
  ],
  tips: [
    { value: "concepts-and-tips", label: "실전 팁" },
    { value: "workflow-and-ops", label: "운영 노하우" },
    { value: "glossary", label: "빠른 참고" },
  ],
  external: [
    { value: "examples-and-showcase", label: "외부 레퍼런스" },
    { value: "saas-guides", label: "서비스 가이드" },
    { value: "workflow-and-ops", label: "도입/운영 자료" },
  ],
} as const satisfies Record<KnowledgeTrack, Array<{ value: string; label: string }>>;

export function normalizeKnowledgeTrack(
  value: string | null | undefined,
): KnowledgeTrack {
  if (value === "level-up" || value === "tips" || value === "external") {
    return value;
  }

  return "basics";
}

export function normalizeKnowledgeEditorMode(
  value: string | null | undefined,
): KnowledgeEditorMode {
  return value === "ai" ? "ai" : "manual";
}

export function slugifyKnowledgeTitle(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "knowledge-article";
}

export function getDefaultKnowledgeTopic(track: KnowledgeTrack) {
  return knowledgeTopicOptions[track][0]?.value ?? "concepts-and-tips";
}

export function isValidKnowledgeTopic(track: KnowledgeTrack, topic: string) {
  return knowledgeTopicOptions[track].some((option) => option.value === topic);
}

export function createKnowledgeMarkdownTemplate(title: string) {
  const heading = title.trim() || "문서 제목";

  return `## 한눈에 보기
${heading}가 어떤 맥락에서 왜 중요한지 2~3문장으로 먼저 정리해 주세요.

## 핵심 포인트
- 가장 중요한 포인트를 3개 이내로 정리합니다.
- 처음 보는 사람도 바로 이해할 수 있게 쉬운 표현을 사용합니다.

## 자세히 설명하기
실제 사용 흐름, 주의할 점, 실무 팁을 문단과 목록으로 자연스럽게 설명해 주세요.

## 다음 액션
1. 읽은 사람이 바로 해볼 수 있는 첫 단계를 적어 주세요.
2. 함께 보면 좋은 링크나 참고 자료가 있다면 마지막에 덧붙여 주세요.
`;
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  ExternalLink,
  FileText,
  Loader2,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import {
  useDeferredValue,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  createKnowledgeArticleAction,
  generateKnowledgeDraftAction,
} from "@/app/admin/knowledge/actions";
import { KnowledgeMarkdown } from "@/components/knowledge-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  createKnowledgeMarkdownTemplate,
  getDefaultKnowledgeTopic,
  isValidKnowledgeTopic,
  knowledgeTopicOptions,
  slugifyKnowledgeTitle,
} from "@/lib/knowledge/editor";
import {
  classifyExternalResource,
  formatExternalTaxonomyPath,
} from "@/lib/knowledge/external-resource";
import { cn } from "@/lib/utils";
import type { KnowledgeEditorMode } from "@/types/admin-knowledge";
import type { KnowledgeTrack } from "@/types/good-vibe";

type SubmissionPrefill = {
  id: string;
  requesterName: string;
  title: string;
  summary: string;
  details: string;
  category: KnowledgeTrack;
  resourceUrl: string | null;
} | null;

const trackLabels: Record<KnowledgeTrack, string> = {
  basics: "기초",
  "level-up": "레벨업",
  tips: "팁 모음",
  external: "외부 자료",
};

const modeCards: Array<{
  mode: KnowledgeEditorMode;
  title: string;
  description: string;
  icon: typeof FileText;
}> = [
  {
    mode: "manual",
    title: "직접 작성",
    description: "작성자가 입력한 Markdown 본문을 그대로 draft로 저장합니다.",
    icon: FileText,
  },
  {
    mode: "ai",
    title: "AI로 생성",
    description: "입력한 정보와 링크를 바탕으로 AI가 Markdown 초안을 만듭니다.",
    icon: WandSparkles,
  },
];

const markdownGuide = [
  "제목은 `## 섹션 제목`처럼 작성하면 큰 호흡으로 읽기 좋습니다.",
  "강조하고 싶은 내용은 목록, 인용문, 표로 나누면 가독성이 훨씬 좋아집니다.",
  "코드는 fenced block(````ts`)을 쓰면 실제 상세 페이지와 같은 스타일로 보입니다.",
];

export interface KnowledgeEditorProps {
  initialMode: KnowledgeEditorMode;
  initialTrack: KnowledgeTrack;
  initialTopic: string;
  initialTitle?: string;
  initialSlug?: string;
  initialSummary?: string;
  initialContentMd?: string;
  initialResourceUrl?: string;
  initialTitleHint?: string;
  initialSummaryHint?: string;
  initialDetails?: string;
  initialError?: string | null;
  initialSubmission?: SubmissionPrefill;
}

function SectionLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[13px] font-semibold tracking-[-0.01em] text-foreground"
    >
      {children}
    </label>
  );
}

export function KnowledgeEditor({
  initialMode,
  initialTrack,
  initialTopic,
  initialTitle = "",
  initialSlug = "",
  initialSummary = "",
  initialContentMd = "",
  initialResourceUrl = "",
  initialTitleHint = "",
  initialSummaryHint = "",
  initialDetails = "",
  initialError = null,
  initialSubmission = null,
}: KnowledgeEditorProps) {
  const router = useRouter();
  const [mode, setMode] = useState<KnowledgeEditorMode>(initialMode);
  const [track, setTrack] = useState<KnowledgeTrack>(initialTrack);
  const [topic, setTopic] = useState(
    isValidKnowledgeTopic(initialTrack, initialTopic)
      ? initialTopic
      : getDefaultKnowledgeTopic(initialTrack),
  );
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [summary, setSummary] = useState(initialSummary);
  const [contentMd, setContentMd] = useState(
    initialContentMd ||
      (initialMode === "manual"
        ? createKnowledgeMarkdownTemplate(initialTitle || initialTitleHint)
        : ""),
  );
  const [resourceUrl, setResourceUrl] = useState(initialResourceUrl);
  const [titleHint, setTitleHint] = useState(initialTitleHint);
  const [summaryHint, setSummaryHint] = useState(initialSummaryHint);
  const [details, setDetails] = useState(initialDetails);
  const [previewTab, setPreviewTab] = useState<"write" | "preview">("write");
  const [slugDirty, setSlugDirty] = useState(Boolean(initialSlug));
  const [warnings, setWarnings] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(initialError);
  const [aiGenerated, setAiGenerated] = useState(
    initialMode === "ai" &&
      Boolean(initialTitle && initialSummary && initialContentMd),
  );
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const deferredContent = useDeferredValue(contentMd);

  const topicOptions = knowledgeTopicOptions[track];
  const currentModeCard = modeCards.find((card) => card.mode === mode) ?? modeCards[0];
  const effectiveSlug = slugDirty ? slug : slugifyKnowledgeTitle(title);
  const isBusy = isGenerating || isSaving;
  const saveDisabled =
    isBusy || (mode === "ai" && !aiGenerated);

  const previewFallback = useMemo(() => {
    if (deferredContent.trim()) {
      return deferredContent;
    }

    return [
      "## 미리보기 준비 중",
      "",
      "왼쪽 입력 영역에 Markdown 본문을 작성하면 여기에서 실제 지식 문서처럼 렌더링됩니다.",
    ].join("\n");
  }, [deferredContent]);
  const autoResourceTaxonomy = useMemo(
    () =>
      classifyExternalResource({
        url: resourceUrl,
        title: titleHint || title,
        summary: summaryHint || summary,
        details,
      }),
    [details, resourceUrl, summary, summaryHint, title, titleHint],
  );

  function handleTrackChange(value: string) {
    const nextTrack = value as KnowledgeTrack;
    setTrack(nextTrack);
    if (!isValidKnowledgeTopic(nextTrack, topic)) {
      setTopic(getDefaultKnowledgeTopic(nextTrack));
    }
  }

  function handleTitleChange(value: string) {
    setTitle(value);
  }

  function handleSlugChange(value: string) {
    setSlug(value);
    setSlugDirty(Boolean(value.trim()));
  }

  function handleModeChange(nextMode: KnowledgeEditorMode) {
    setMode(nextMode);
    setStatusMessage(null);

    if (nextMode === "manual" && !contentMd.trim()) {
      setContentMd(createKnowledgeMarkdownTemplate(title || titleHint));
    }
  }

  function handleContentChange(value: string) {
    setContentMd(value);
  }

  function handleGenerateDraft() {
    setStatusMessage(null);
    setWarnings([]);

    startGenerating(async () => {
      const result = await generateKnowledgeDraftAction({
        track,
        topic,
        resourceUrl,
        titleHint,
        summaryHint,
        details,
        sourceSubmissionId: initialSubmission?.id ?? null,
      });

      if (!result.ok || !result.draft) {
        setWarnings(result.warnings);
        setStatusMessage(result.error ?? "AI 초안 생성에 실패했습니다.");
        return;
      }

      setTitle(result.draft.title);
      if (!slugDirty) {
        setSlug(slugifyKnowledgeTitle(result.draft.title));
      }
      setSummary(result.draft.summary);
      setContentMd(result.draft.contentMd);
      setWarnings(result.warnings);
      setAiGenerated(true);
      setPreviewTab("preview");
      setStatusMessage("AI 초안이 생성되었습니다. 저장 전에 꼭 한 번 다듬어 주세요.");
    });
  }

  function handleSave() {
    setStatusMessage(null);

    startSaving(async () => {
      const result = await createKnowledgeArticleAction({
        mode,
        track,
        topic,
        title,
        slug: effectiveSlug,
        resourceUrl,
        summary,
        contentMd,
        sourceSubmissionId: initialSubmission?.id ?? null,
        aiGenerated,
      });

      if (!result.ok) {
        setStatusMessage(result.error ?? "문서 저장에 실패했습니다.");
        return;
      }

      router.push(result.redirectTo ?? "/admin/knowledge");
      router.refresh();
    });
  }

  return (
    <div className="relative space-y-6">
      {isBusy ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(250,249,249,0.5)] backdrop-blur-[2px]">
          <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-5 py-3 text-sm font-semibold text-primary shadow-[0_20px_40px_rgba(37,31,74,0.12)]">
            <Loader2 className="size-4 animate-spin text-secondary" />
            {isGenerating ? "AI 초안을 생성하고 있어요..." : "문서를 저장하고 있어요..."}
          </div>
        </div>
      ) : null}
      <section className="rounded-[2rem] border border-[rgba(121,118,127,0.08)] bg-white px-6 py-6 shadow-[0_18px_38px_rgba(37,31,74,0.06)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary">
              Knowledge Editor
            </p>
            <h1 className="text-[1.9rem] font-bold tracking-[-0.05em] text-foreground">
              지식 문서 작성
            </h1>
            <p className="max-w-2xl text-[13px] leading-6 text-muted-foreground">
              Markdown 본문을 기준으로 문서를 저장하고, 필요하면 AI가 만든 초안을 검토한 뒤
              draft로 등록할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/knowledge">문서 관리로 돌아가기</Link>
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saveDisabled}>
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              초안 저장
            </Button>
          </div>
        </div>

        {initialSubmission ? (
          <div className="mt-5 rounded-[1.6rem] border border-[rgba(255,107,108,0.16)] bg-[linear-gradient(135deg,rgba(255,107,108,0.08),rgba(255,255,255,0.95))] px-5 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="rounded-full bg-[rgba(59,53,97,0.08)] px-3 py-1 font-semibold text-primary">
                    제보 기반 초안
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-muted-foreground">
                    {trackLabels[initialSubmission.category]}
                  </span>
                </div>
                <p className="text-lg font-bold tracking-[-0.03em] text-primary">
                  {initialSubmission.title}
                </p>
                <p className="max-w-2xl text-[13px] leading-6 text-muted-foreground">
                  제보자 {initialSubmission.requesterName} 님이 남긴 내용을 바탕으로 초안을
                  만들고 있습니다.
                </p>
              </div>

              {initialSubmission.resourceUrl ? (
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={initialSubmission.resourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    참고 링크 열기
                    <ExternalLink className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {modeCards.map((card) => {
            const Icon = card.icon;
            const active = card.mode === mode;

            return (
              <button
                key={card.mode}
                type="button"
                onClick={() => handleModeChange(card.mode)}
                className={cn(
                  "rounded-[1.6rem] border px-5 py-5 text-left transition-all",
                  active
                    ? "border-primary/12 bg-[linear-gradient(135deg,rgba(59,53,97,0.08),rgba(255,255,255,0.98))] shadow-[0_18px_34px_rgba(37,31,74,0.08)]"
                    : "border-[rgba(121,118,127,0.08)] bg-[rgba(250,249,249,0.78)] hover:border-secondary/18 hover:bg-white",
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-[1.1rem]",
                      active
                        ? "bg-primary text-white"
                        : "bg-[rgba(59,53,97,0.08)] text-primary",
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[1rem] font-semibold tracking-[-0.03em] text-primary">
                      {card.title}
                    </p>
                    <p className="text-[13px] leading-6 text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[rgba(121,118,127,0.08)] bg-white px-6 py-6 shadow-[0_16px_32px_rgba(37,31,74,0.05)]">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[rgba(59,53,97,0.08)] text-primary">
                {mode === "ai" ? <Bot className="size-4" /> : <FileText className="size-4" />}
              </div>
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.02em] text-primary">
                  {currentModeCard.title}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {currentModeCard.description}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <SectionLabel htmlFor="track">트랙</SectionLabel>
                <select
                  id="track"
                  value={track}
                  onChange={(event) => handleTrackChange(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[rgba(121,118,127,0.08)] bg-input px-4 text-sm text-foreground outline-none transition focus-visible:border-secondary/30 focus-visible:ring-4 focus-visible:ring-ring"
                >
                  <option value="basics">기초</option>
                  <option value="level-up">레벨업</option>
                  <option value="tips">팁 모음</option>
                  <option value="external">외부 자료</option>
                </select>
              </div>

              <div className="space-y-2">
                <SectionLabel htmlFor="topic">주제</SectionLabel>
                <select
                  id="topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[rgba(121,118,127,0.08)] bg-input px-4 text-sm text-foreground outline-none transition focus-visible:border-secondary/30 focus-visible:ring-4 focus-visible:ring-ring"
                >
                  {topicOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <SectionLabel htmlFor="resourceUrl">참고 링크</SectionLabel>
              <Input
                id="resourceUrl"
                value={resourceUrl}
                onChange={(event) => setResourceUrl(event.target.value)}
                placeholder="https://example.com/article"
              />
            </div>

            {autoResourceTaxonomy ? (
              <div className="mt-4 rounded-[1.4rem] border border-[rgba(121,118,127,0.08)] bg-[rgba(250,249,249,0.88)] px-4 py-4">
                <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-primary/52">
                  Auto Classification
                </p>
                <p className="mt-2 text-[14px] font-semibold text-primary">
                  {formatExternalTaxonomyPath(autoResourceTaxonomy)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[rgba(59,53,97,0.08)] px-3 py-1 text-xs font-semibold text-primary">
                    {autoResourceTaxonomy.sourceName}
                  </span>
                  <span className="rounded-full bg-[rgba(255,193,69,0.18)] px-3 py-1 text-xs font-semibold text-primary">
                    confidence {autoResourceTaxonomy.confidence}
                  </span>
                </div>
                {autoResourceTaxonomy.matchedSignals.length > 0 ? (
                  <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
                    URL is used for the channel, and title/summary/details refine the middle and
                    detailed categories: {autoResourceTaxonomy.matchedSignals.join(", ")}
                  </p>
                ) : null}
              </div>
            ) : null}

            {mode === "ai" ? (
              <div className="mt-6 space-y-4 rounded-[1.7rem] bg-[rgba(250,249,249,0.88)] px-5 py-5">
                <div className="space-y-1">
                  <p className="text-[15px] font-semibold tracking-[-0.02em] text-primary">
                    AI 입력 정보
                  </p>
                  <p className="text-[13px] leading-6 text-muted-foreground">
                    제목 힌트, 요약, 상세 메모와 링크를 바탕으로 Markdown 초안을 생성합니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <SectionLabel htmlFor="titleHint">제목 힌트</SectionLabel>
                  <Input
                    id="titleHint"
                    value={titleHint}
                    onChange={(event) => setTitleHint(event.target.value)}
                    placeholder="예: Supabase Auth + Google 로그인 셋업 가이드"
                  />
                </div>

                <div className="space-y-2">
                  <SectionLabel htmlFor="summaryHint">요약 힌트</SectionLabel>
                  <Textarea
                    id="summaryHint"
                    value={summaryHint}
                    onChange={(event) => setSummaryHint(event.target.value)}
                    className="min-h-24"
                    placeholder="문서가 꼭 담아야 할 핵심 포인트를 짧게 적어 주세요."
                  />
                </div>

                <div className="space-y-2">
                  <SectionLabel htmlFor="details">상세 메모 / 소스 노트</SectionLabel>
                  <Textarea
                    id="details"
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    className="min-h-44"
                    placeholder="제보 내용, 정리하고 싶은 구조, 꼭 포함할 문장이나 참고 메모를 자유롭게 적어 주세요."
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleGenerateDraft}
                    disabled={isGenerating || isSaving}
                  >
                    {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                    AI 초안 생성
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreviewTab("preview")}
                    disabled={!contentMd.trim()}
                  >
                    미리보기 보기
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-[rgba(121,118,127,0.08)] bg-white px-6 py-6 shadow-[0_16px_32px_rgba(37,31,74,0.05)]">
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <SectionLabel htmlFor="title">문서 제목</SectionLabel>
                  <Input
                    id="title"
                    value={title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    placeholder="예: GoodVibe에서 Google 로그인 연결하기"
                  />
                </div>

                <div className="space-y-2">
                  <SectionLabel htmlFor="slug">slug</SectionLabel>
                  <Input
                    id="slug"
                    value={effectiveSlug}
                    onChange={(event) => handleSlugChange(event.target.value)}
                    placeholder="비워두면 제목 기준으로 자동 생성됩니다."
                  />
                </div>

                <div className="space-y-2">
                  <SectionLabel>저장 방식</SectionLabel>
                  <div className="flex h-12 items-center rounded-2xl border border-[rgba(121,118,127,0.08)] bg-[rgba(250,249,249,0.88)] px-4 text-sm text-muted-foreground">
                    항상 draft로 저장됩니다.
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <SectionLabel htmlFor="summary">요약</SectionLabel>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  className="min-h-28"
                  placeholder="목록 화면과 상세 상단에 노출될 요약을 작성해 주세요."
                />
              </div>

              <Tabs
                value={previewTab}
                onValueChange={(value) => setPreviewTab(value as "write" | "preview")}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[15px] font-semibold tracking-[-0.02em] text-primary">
                      Markdown 본문
                    </p>
                    <p className="text-[13px] text-muted-foreground">
                      작성 화면과 실제 지식 문서 상세 렌더링이 같은 renderer를 사용합니다.
                    </p>
                  </div>
                  <TabsList>
                    <TabsTrigger value="write">작성</TabsTrigger>
                    <TabsTrigger value="preview">미리보기</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="write">
                  <Textarea
                    id="contentMd"
                    value={contentMd}
                    onChange={(event) => handleContentChange(event.target.value)}
                    className="min-h-[420px] bg-[linear-gradient(180deg,rgba(250,249,249,0.82),rgba(255,255,255,0.96))] font-mono text-[13px] leading-7"
                    placeholder="Markdown 본문을 입력해 주세요."
                  />
                </TabsContent>

                <TabsContent value="preview">
                  <div className="rounded-[1.7rem] border border-[rgba(121,118,127,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,249,249,0.92))] px-6 py-6">
                    <KnowledgeMarkdown content={previewFallback} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {statusMessage ? (
            <div
              className={cn(
                "rounded-[1.4rem] px-4 py-3 text-[13px] leading-6",
                statusMessage.includes("실패") ||
                  statusMessage.includes("관리자") ||
                  statusMessage.includes("입력") ||
                  statusMessage.includes("Supabase")
                  ? "border border-[rgba(255,107,108,0.18)] bg-[rgba(255,107,108,0.08)] text-secondary"
                  : "border border-[rgba(81,163,163,0.22)] bg-[rgba(81,163,163,0.08)] text-primary",
              )}
            >
              {statusMessage}
            </div>
          ) : null}

          {warnings.length > 0 ? (
            <div className="rounded-[1.6rem] border border-[rgba(221,115,115,0.14)] bg-[rgba(255,248,244,0.92)] px-5 py-5">
              <p className="text-[14px] font-semibold text-primary">AI 생성 경고</p>
              <ul className="mt-3 space-y-2 pl-5 text-[13px] leading-6 text-muted-foreground">
                {warnings.map((warning) => (
                  <li key={warning} className="list-disc">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-[2rem] border border-[rgba(121,118,127,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,243,243,0.92))] px-5 py-5 shadow-[0_16px_32px_rgba(37,31,74,0.05)]">
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-primary">
                작성 가이드
              </p>
              <div className="mt-4 space-y-3 text-[13px] leading-6 text-muted-foreground">
                {markdownGuide.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_16px_32px_rgba(37,31,74,0.05)]">
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-primary">
                저장 전 체크
              </p>
              <ul className="mt-4 space-y-3 pl-5 text-[13px] leading-6 text-muted-foreground">
                <li className="list-disc">모든 본문은 Markdown 기준으로 저장됩니다.</li>
                <li className="list-disc">
                  AI 모드에서는 초안 생성 후 수정한 내용까지 그대로 draft에 반영됩니다.
                </li>
                <li className="list-disc">
                  제보 기반 문서는 저장이 끝난 뒤에만 해당 제보 상태가 reviewing으로 바뀝니다.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

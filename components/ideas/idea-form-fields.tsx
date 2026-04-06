"use client";

import { Minus, Plus, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type IdeaFormFieldsProps = {
  defaultTitle?: string;
  defaultContent?: string;
  defaultReferenceLinks?: string[];
};

const contentPlaceholder = [
  "1. 해결하려는 문제는 무엇인가요?",
  "2. 누가 이 아이디어를 사용하게 되나요?",
  "3. 꼭 들어가야 할 핵심 기능은 무엇인가요?",
  "4. 사용자는 어떤 흐름으로 이용하게 되나요?",
  "5. 이 아이디어가 실현되면 어떤 변화가 생기나요?",
].join("\n");

export function IdeaFormFields({
  defaultTitle = "",
  defaultContent = "",
  defaultReferenceLinks = [],
}: IdeaFormFieldsProps) {
  const [referenceLinks, setReferenceLinks] = useState<string[]>(
    defaultReferenceLinks.length > 0 ? defaultReferenceLinks : [""],
  );

  function updateReferenceLink(index: number, value: string) {
    setReferenceLinks((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index ? value : item,
      ),
    );
  }

  function addReferenceLinkField() {
    setReferenceLinks((current) => [...current, ""]);
  }

  function removeReferenceLinkField(index: number) {
    setReferenceLinks((current) => {
      if (current.length === 1) {
        return [""];
      }

      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  return (
    <>
      <div className="rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-[rgba(244,243,243,0.72)] px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[rgba(59,53,97,0.1)] text-primary">
            <Sparkles className="size-4" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">작성 팁</p>
            <p className="text-sm leading-7 text-muted-foreground">
              AI와 함께 먼저 기획을 구체화한 뒤, 정리된 내용으로 올리면 다른 사람들이
              아이디어를 훨씬 쉽게 이해할 수 있어요.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="title">
          제목
        </label>
        <Input
          id="title"
          name="title"
          defaultValue={defaultTitle}
          placeholder="예: 작업 공지, 자료, 진행 상태를 한 번에 관리하는 팀 보드"
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
          defaultValue={defaultContent}
          className="min-h-72"
          placeholder={contentPlaceholder}
          required
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <label className="text-sm font-semibold text-foreground" htmlFor="reference-link-0">
              참고 링크
            </label>
            <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
              비슷한 서비스, 레퍼런스 화면, 문서 링크를 여러 개 남길 수 있어요.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addReferenceLinkField}
          >
            <Plus className="size-4" />
            링크 추가
          </Button>
        </div>

        <div className="space-y-3">
          {referenceLinks.map((referenceLink, index) => (
            <div key={`reference-link-${index}`} className="flex gap-2">
              <Input
                id={`reference-link-${index}`}
                name="referenceLinks"
                type="url"
                inputMode="url"
                value={referenceLink}
                onChange={(event) =>
                  updateReferenceLink(index, event.currentTarget.value)
                }
                placeholder="https://example.com/reference"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeReferenceLinkField(index)}
                aria-label={`참고 링크 ${index + 1}번 삭제`}
              >
                <Minus className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

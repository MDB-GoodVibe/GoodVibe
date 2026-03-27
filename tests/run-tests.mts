import assert from "node:assert/strict";

import {
  parseClaudeMarketplacesFromHtml,
  parseClaudeSkillsFromHtml,
} from "@/lib/explore/claude-marketplaces";
import { parseSkillsShList } from "@/lib/explore/skills-sh";
import {
  createAnalyzedWorkspaceDraft,
  createEmptyWorkspaceDraft,
  getDraftCompletionState,
  hydrateWorkspaceDraft,
  updateWorkspaceIdea,
} from "@/lib/workspace-draft-store";

function run(name: string, fn: () => void) {
  fn();
  console.log(`PASS ${name}`);
}

run("parseSkillsShList extracts leaderboard rows", () => {
  const html = `
    <div>
      <a href="/anthropics/skills/frontend-design">
        <h3>frontend-design</h3>
        <p>anthropics/skills</p>
        <span>192.6K</span>
      </a>
      <a href="/vercel-labs/agent-skills/web-design-guidelines">
        <h3>web-design-guidelines</h3>
        <p>vercel-labs/agent-skills</p>
        <span>193.4K</span>
      </a>
    </div>
  `;

  const items = parseSkillsShList(html, "popular");

  assert.equal(items.length, 2);
  assert.equal(items[0]?.title, "frontend-design");
  assert.equal(
    items[0]?.installCommand,
    "npx skills add https://github.com/anthropics/skills --skill frontend-design",
  );
  assert.equal(items[1]?.popularityValue, 193400);
});

run("parseClaudeSkillsFromHtml extracts RSC payload skills", () => {
  const payload = JSON.stringify(
    '{"skills":[{"id":"anthropics/skills/frontend-design","name":"frontend-design","description":"Frontend design helper","repo":"anthropics/skills","path":"frontend-design","stars":99300,"installs":186400,"installCommand":"npx skills add https://github.com/anthropics/skills --skill frontend-design"}]}',
  );
  const html = `<script>self.__next_f.push([1,${payload}])</script>`;

  const items = parseClaudeSkillsFromHtml(html);

  assert.equal(items.length, 1);
  assert.equal(items[0]?.repo, "anthropics/skills");
  assert.equal(items[0]?.popularityLabel, "186.4K 설치");
});

run("parseClaudeMarketplacesFromHtml extracts marketplace payload", () => {
  const payload = JSON.stringify(
    '{"marketplaces":[{"repo":"anthropics/claude-code","slug":"anthropics-claude-code","description":"Bundled plugins for Claude Code","pluginCount":8,"categories":["development","productivity"],"pluginKeywords":["frontend","workflow"],"stars":65114,"voteCount":1}]}',
  );
  const html = `<script>self.__next_f.push([1,${payload}])</script>`;

  const items = parseClaudeMarketplacesFromHtml(html);

  assert.equal(items.length, 1);
  assert.equal(items[0]?.title, "anthropics/claude-code");
  assert.equal(items[0]?.popularityLabel, "8개 플러그인 / 65.1K 스타");
});

run("workspace draft hydration recomputes derived artifacts", () => {
  const analyzedDraft = createAnalyzedWorkspaceDraft({
    ...createEmptyWorkspaceDraft(),
    projectName: "Cafe Launch",
    idea: "카페 메뉴를 소개하고 예약 문의를 받는 웹 서비스를 만들고 싶어.",
  });

  const hydratedDraft = hydrateWorkspaceDraft(analyzedDraft);
  const completion = getDraftCompletionState(hydratedDraft);

  assert.ok(hydratedDraft.analysis);
  assert.ok(hydratedDraft.selectedTypeId);
  assert.ok(hydratedDraft.architecture);
  assert.equal(hydratedDraft.promptStages.length, 4);
  assert.equal(completion.idea, true);
  assert.equal(completion.architecture, true);
  assert.equal(completion.prompts, true);
});

run("updating idea clears stale analysis and selection", () => {
  const analyzedDraft = createAnalyzedWorkspaceDraft({
    ...createEmptyWorkspaceDraft(),
    projectName: "Cafe Launch",
    idea: "카페 메뉴를 소개하고 예약 문의를 받는 웹 서비스를 만들고 싶어.",
  });

  const updatedDraft = updateWorkspaceIdea(
    analyzedDraft,
    "사진 작가 포트폴리오를 소개하는 랜딩 페이지를 만들고 싶어.",
  );

  assert.equal(updatedDraft.analysis, null);
  assert.equal(updatedDraft.selectedTypeId, null);
  assert.equal(updatedDraft.architecture, null);
  assert.equal(updatedDraft.promptStages.length, 0);
});

console.log("All tests passed.");

import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { actions } from "../apps/agent/actions.mjs";
import { promptContext, toolAdvice } from "../apps/agent/context.mjs";
import { brief, canvasPrompt, guide, rules, skill } from "../apps/agent/guide.mjs";
import { createWorkspace } from "../apps/host/project.mjs";
import { runChecks } from "../apps/editor/checks.mjs";
import { passageChanges } from "../apps/editor/edition.mjs";
import { startHost } from "../apps/host/serve.mjs";
import { refusalForAgent } from "../packages/session/messages.mjs";
import { changeRecord } from "../packages/session/record.mjs";
import { Rejected } from "../packages/session/store.mjs";

const docx = text => Buffer.concat([Buffer.from([0x50, 0x4b, 3, 4]), Buffer.from(text)]);
const action = name => actions.find(item => item.name === name).run;
const node = number => String(number).padStart(32, "0");

function project() {
  const folder = realpathSync(mkdtempSync(join(tmpdir(), "ternleaf-agent-")));
  for (const path of ["engine/prebuilt/webapp", "examples", "docs"]) mkdirSync(join(folder, path), { recursive: true });
  writeFileSync(join(folder, "examples/welcome-to-ternleaf.docx"), docx("welcome"));
  writeFileSync(join(folder, "docs/Brief.docx"), docx("brief"));
  writeFileSync(join(folder, "engine/prebuilt/webapp/editor.html"), "<!doctype html>");
  return folder;
}

test("every action describes itself, and the guide names every action", () => {
  const names = actions.map(item => item.name);
  assert.equal(new Set(names).size, names.length);
  const undescribed = [];
  const walk = (schema, path) => {
    for (const [key, value] of Object.entries(schema.properties ?? {})) {
      if (!value.description) undescribed.push(`${path}.${key}`);
      if (value.type === "object") {
        assert.equal(value.additionalProperties, false, `${path}.${key} is closed`);
        walk(value, `${path}.${key}`);
      }
      if (value.items?.type === "object") {
        assert.equal(value.items.additionalProperties, false, `${path}.${key} items are closed`);
        walk(value.items, `${path}.${key}[]`);
      }
    }
  };
  for (const item of actions) {
    assert.match(item.name, /^ternleaf_[a-z_]+$/);
    assert(item.description.length >= 60 && item.description.length <= 520, `${item.name} has a description of a useful length`);
    assert.equal(item.inputSchema.additionalProperties, false, `${item.name} is closed`);
    assert.equal(typeof item.run, "function");
    walk(item.inputSchema, item.name);
    assert(guide.includes(item.name) || item.name === "ternleaf_guide", `the guide names ${item.name}`);
  }
  assert.deepEqual(undescribed, []);
  // A word in the guide that looks like an action is an action.
  for (const mentioned of guide.match(/ternleaf_[a-z_]+/g)) assert(names.includes(mentioned), mentioned);
  for (const mentioned of [...brief.matchAll(/ternleaf_[a-z_]+/g), ...canvasPrompt("i", "r").matchAll(/ternleaf_[a-z_]+/g)]) {
    assert(names.includes(mentioned[0]), mentioned[0]);
  }
  assert.match(canvasPrompt("main", "abc", "document"), /document text[\s\S]*"main"[\s\S]*"abc"/);
  // The skill is the guide. scripts/write-skill.mjs writes it.
  assert.equal(readFileSync(new URL("../.github/skills/ternleaf/SKILL.md", import.meta.url), "utf8").replaceAll("\r\n", "\n"), skill);
  // Each example of an input in the words for Copilot fits the schema.
  const fields = name => Object.keys(actions.find(item => item.name === name).inputSchema.properties);
  for (const [name, words] of [["ternleaf_suggest", rules.chat(3)], ["ternleaf_suggest", rules.document], ["ternleaf_propose", rules.passage], ["ternleaf_suggest", guide], ["ternleaf_propose", guide]]) {
    const examples = [...words.matchAll(/\{"(?:revision|requestId|text|paragraph)"[^\n]*?\}(?=[.\n]|$)/g)].map(match => match[0]);
    assert(examples.length > 0, name + " has an example");
    for (const example of examples) {
      const keys = [...example.matchAll(/"([a-zA-Z]+)":/g)].map(match => match[1]);
      const allowed = new Set([...fields("ternleaf_suggest"), ...fields("ternleaf_propose"), "paragraph", "find", "replacement", "rationale", "remark", "answers"]);
      for (const key of keys) assert(allowed.has(key), `${key} in ${example}`);
    }
  }
  // The page for people lists the same actions.
  const page = readFileSync(new URL("../docs/Agent.md", import.meta.url), "utf8");
  assert.deepEqual([...new Set(page.match(/ternleaf_[a-z_]+/g))].sort(), [...names].sort());
});

test("Copilot works on the document from the chat, and the author stays in control", async () => {
  const folder = project();
  const workspace = createWorkspace({ project: folder });
  const titles = [];
  const host = await startHost({ ...workspace.resolve("docs/Brief.docx"), workspace, port: 0, onDocument: name => titles.push(name) });
  const origin = new URL(host.url).origin;
  const token = new URL(host.url).hash.slice(1);
  let epoch;
  const post = async (path, data) => {
    const response = await fetch(origin + "/api/" + path, { method: "POST", body: JSON.stringify(data),
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json",
        ...(epoch === undefined ? {} : { "X-Ternleaf-Epoch": String(epoch) }) } });
    return { status: response.status, ...await response.json() };
  };
  // The part of the editor that Copilot's actions need: it reports the
  // selection and does the jobs. `answers` maps a job kind to its result.
  let lease;
  let selection = null;
  const seen = [];
  const pulse = () => post("pulse", { lease, live: { revision: 0, pages: 2, words: 9, suggesting: false, selection } });
  const editor = async (work, answers = {}) => {
    let finished = false;
    const result = Promise.resolve(work).finally(() => { finished = true; });
    result.catch(() => {});
    const done = new Set();
    while (!finished) {
      const state = await pulse();
      seen.push(...state.notices);
      for (const job of state.jobs.filter(item => !done.has(item.id))) {
        done.add(job.id);
        const answer = answers[job.kind]?.(job) ?? { error: "invalid-request" };
        await post("job", { lease, id: job.id, ...answer });
      }
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    return result;
  };
  const paragraphs = [[node(1), "Harbour Library"], [node(2), "The the council should approve the plan."],
    [node(3), "The roof is old. The roof leaks."], [node(4), " "]];
  const read = { read: () => ({ result: { revision: 0, paragraphs, outline: [{ level: 1, node: node(1) }], pages: 2, words: 9, comments: 1, trackedChanges: 0 } }) };
  const refused = async (work, code) => {
    await assert.rejects(Promise.resolve().then(work), error => {
      assert(error instanceof Rejected, String(error));
      assert.equal(error.code, code);
      assert.notEqual(refusalForAgent(error), code, `${code} has words for the agent`);
      return true;
    });
  };
  try {
    // Before the editor shows the document, nothing can be read.
    assert.deepEqual(host.status().canvas, { ready: false });
    await refused(() => action("ternleaf_read")(host, {}), "canvas-not-ready");

    const claimed = await post("claim", { previous: null });
    ({ lease, epoch } = claimed);
    await pulse();
    let status = action("ternleaf_status")(host, {});
    assert.deepEqual(status.document, { name: "Brief.docx", path: "docs/Brief.docx", revision: 0 });
    assert.deepEqual(status.canvas, { ready: true, pages: 2, words: 9, suggestingMode: false, selection: null });
    assert.equal(status.chatAccess, true);
    assert.match(status.next, /No text is selected/);
    // Copilot knows that the .docx on disk is behind, but no action saves it.
    assert.equal(status.unsavedRevisions, 0);
    assert.match(guide, /The \.docx file on disk has the text of the last save to the file only[^\n]*Only the author can save/);
    assert.deepEqual(actions.filter(item => /save|write/i.test(item.name)), []);
    assert.deepEqual((await action("ternleaf_guide")(host, {})).guide, guide);

    // The text comes from the editor, in numbered paragraphs.
    const text = await editor(action("ternleaf_read")(host, {}), read);
    assert.deepEqual(text.paragraphs, [{ paragraph: 1, heading: 1, text: "Harbour Library" },
      { paragraph: 2, text: "The the council should approve the plan." }, { paragraph: 3, text: "The roof is old. The roof leaks." }]);
    assert.deepEqual([text.revision, text.total, text.pages, text.comments, text.next], [0, 3, 2, 1, undefined]);
    assert.match(text.reply, /"revision": 0/);
    const second = await editor(host.read({ from: 2, budget: 10 }), read);
    assert.deepEqual([second.paragraphs.map(item => item.paragraph), second.next], [[2], 3]);

    // Suggestions that began in the chat. Those that do not match the text
    // are reported back.
    await refused(() => action("ternleaf_suggest")(host, { instructions: "Proofread.", revision: 4,
      suggestions: [{ paragraph: 2, find: "The the", replacement: "The" }] }), "stale-document");
    await refused(() => action("ternleaf_suggest")(host, { instructions: "Proofread.", revision: 0,
      suggestions: [{ paragraph: 3, find: "The roof", replacement: "It" }] }), "invalid-suggestions");
    await refused(() => action("ternleaf_suggest")(host, { revision: 0,
      suggestions: [{ paragraph: 2, find: "The the", replacement: "The" }] }), "invalid-selection-or-instructions");
    const before = (await pulse()).stamp;
    // One bad item does not fail the list: each item is refused on its own,
    // with the reason.
    const checked = [];
    const check = { check: job => { checked.push(job.changes); return { result: { blocked: job.changes.length > 1 ? [{ index: 1, reason: "This text is the result of a field, such as a cross-reference. Change the text beside it." }] : [] } }; } };
    const suggested = await editor(action("ternleaf_suggest")(host, { instructions: "Proofread.", revision: 0, suggestions: [
      { paragraph: 2, find: "The the", replacement: "The", rationale: "A repeated word." },
      { paragraph: 9, find: "x", replacement: "y" },
      { paragraph: 3, find: "old.\tThe", replacement: "old. The" },
      { paragraph: 3, find: "leaks", replacement: "leaks\tbadly" },
      { paragraph: 3, find: "roof leaks", replacement: "roof is wet", rationale: "x".repeat(601) },
      { paragraph: 3, find: "leaks", replacement: "drips" }] }), check);
    assert.deepEqual([suggested.suggested, suggested.refused], [1, [{ suggestion: 2, reason: "unknown paragraph number" },
      { suggestion: 3, reason: "the find text has a tab or a line break. A change cannot cross it. Give the text before or after it" },
      { suggestion: 4, reason: "the replacement has a tab. Ternleaf cannot write a tab. Give the text without it" },
      { suggestion: 5, reason: "give a rationale of at most 600 characters" },
      { suggestion: 6, reason: "cannot be applied: This text is the result of a field, such as a cross-reference. Change the text beside it." }]]);
    // The canvas tried the two changes that passed the host's own checks.
    assert.deepEqual(checked, [[{ node: node(2), find: "The the", replacement: "The" }, { node: node(3), find: "leaks", replacement: "drips" }]]);
    assert.equal((await pulse()).stamp, before + 1);
    const queue = await post("suggestions", { lease });
    assert.deepEqual([queue.origin, queue.batch.prompt, queue.batch.state, queue.suggestions[0].find], ["chat", "Proofread.", "answered", "The the"]);
    assert.deepEqual(action("ternleaf_status")(host, {}).review, { proposal: false, openSuggestions: 1 });
    // The author has not decided. Copilot waits.
    await refused(() => action("ternleaf_suggest")(host, { instructions: "Again.", revision: 0,
      suggestions: [{ paragraph: 2, find: "The the", replacement: "The" }] }), "review-in-progress");
    await post("discard-batch", { lease });

    // A proposal for the text that the author has selected now.
    await refused(() => action("ternleaf_propose")(host, { instructions: "Shorten.", text: "The roof is old.", replacement: "Old roof." }), "no-selection");
    selection = { node: node(3), start: 0, end: 16, before: "The roof is old.", revision: 0 };
    await pulse();
    status = action("ternleaf_status")(host, {});
    assert.deepEqual(status.canvas.selection, { text: "The roof is old." });
    assert.deepEqual((await pulse()).notices, ["Copilot read the selected text."]);
    await refused(() => action("ternleaf_propose")(host, { instructions: "Shorten.", text: "The roof", replacement: "Old roof." }), "selection-changed");
    await refused(() => action("ternleaf_propose")(host, { instructions: "Shorten.", text: "The roof is old.", replacement: "The roof is old." }), "invalid-replacement");
    assert.equal((await post("reviews", { lease })).draft, null);
    const proposed = action("ternleaf_propose")(host, { instructions: "Shorten.", text: "The roof is old.",
      replacement: "The roof is worn.", rationale: "More exact.", alternatives: ["The roof has aged."] });
    assert.equal(proposed.proposed, true);
    const { draft } = await post("reviews", { lease });
    assert.deepEqual([draft.id, draft.origin, draft.prompt, draft.replacement, draft.alternatives, draft.before],
      [proposed.requestId, "chat", "Shorten.", "The roof is worn.", ["The roof is worn.", "The roof has aged."], "The roof is old."]);
    await refused(() => action("ternleaf_propose")(host, { instructions: "Shorten.", text: "The roof is old.", replacement: "Old." }), "review-in-progress");

    // With each prompt Copilot learns what the canvas shows and what the
    // author decided. The selected text is not in that context.
    const instances = new Map([["main", host]]);
    const state = { briefed: false, advised: false };
    await post("discard", { lease });
    const context = promptContext(instances, state);
    assert(context.startsWith(brief));
    assert.match(context, /instance "main" shows "docs\/Brief.docx" \(revision 0, 2 pages, 9 words\)/);
    assert.match(context, /has 4 words selected/);
    assert.match(context, /the author dismissed 1 open suggestion; discarded the proposal for "The roof is old\."/);
    assert(!context.includes("The roof is old. The roof leaks"));
    const again = promptContext(instances, state);
    assert(!again.includes(brief) && !again.includes("Since your last turn"));

    // A page as a picture, and a file in the exports folder.
    const page = await editor(action("ternleaf_view_page")(host, { page: 2 }),
      { page: job => ({ result: { png: "iVBORw0KGgo=", pages: 2, revision: 0, width: 992, height: 1403, asked: job.page } }) });
    assert.deepEqual([page.resultType, page.binaryResultsForLlm[0].mimeType, page.binaryResultsForLlm[0].data, JSON.parse(page.textResultForLlm).page],
      ["success", "image/png", "iVBORw0KGgo=", 2]);
    await refused(() => editor(action("ternleaf_view_page")(host, { page: 7 }),
      { page: () => ({ error: "page-out-of-range", detail: "The document has 2 pages." }) }), "page-out-of-range");
    assert.equal(refusalForAgent(new Rejected("page-out-of-range", "The document has 2 pages.")), "That page does not exist. The document has 2 pages.");
    const exported = await editor(action("ternleaf_export")(host, { format: "markdown" }),
      { export: job => ({ result: { bytes: Buffer.from("# " + job.format).toString("base64"), revision: 0 } }) });
    assert.deepEqual([exported.path, exported.bytes, exported.revision], ["exports/Brief-r0.md", 10, 0]);
    assert.equal(readFileSync(join(folder, "exports/Brief-r0.md"), "utf8"), "# markdown");
    await refused(() => editor(action("ternleaf_export")(host, { format: "docx" }), { export: () => ({ error: "export-needs-author" }) }), "export-needs-author");
    assert(!workspace.documents().documents.some(item => item.path.startsWith("exports/")));

    // A remark points at text and has no replacement. The author reads it.
    await refused(() => action("ternleaf_suggest")(host, { instructions: "Review.", revision: 0,
      suggestions: [{ paragraph: 2, find: "the plan", replacement: "it", remark: "Which plan?" }] }), "invalid-suggestions");
    const reviewed = await editor(action("ternleaf_suggest")(host, { instructions: "Review against the house rules.", revision: 0, suggestions: [
      { paragraph: 2, find: "the plan", remark: "Rule 2: name the plan and its date." },
      { paragraph: 3, find: "leaks", replacement: "leaks in three places", rationale: "More exact." }] }), { check: () => ({ result: { blocked: [] } }) });
    assert.equal(reviewed.suggested, 2);
    const mixed = (await post("suggestions", { lease })).suggestions;
    assert.deepEqual(mixed.map(item => [item.kind, item.find, item.replacement, item.rationale]),
      [["remark", "the plan", "", "Rule 2: name the plan and its date."], [null, "leaks", "leaks in three places", "More exact."]]);
    // A remark cannot become a proposal.
    assert.equal((await post("adopt", { lease, id: mixed[0].id,
      scope: { node: node(2), start: 30, end: 38, before: "the plan", revision: 0, note: "" } })).error, "unknown-review");
    await post("discard-batch", { lease });
    host.news();

    // The length of the document with a list of changes, from the engine.
    const measured = await editor(action("ternleaf_measure")(host, { revision: 0, suggestions: [
      { paragraph: 3, find: "The roof is old. ", replacement: "" }, { paragraph: 2, find: "should approve", replacement: "approves" },
      { paragraph: 8, find: "x", replacement: "y" }] }),
      { measure: job => ({ result: { pagesBefore: 3, wordsBefore: 900, pagesAfter: 2, wordsAfter: 860,
        blocked: job.changes[1].find === "should approve" ? [{ index: 1, reason: "the change crosses a formatting boundary" }] : [] } }) });
    assert.deepEqual([measured.now, measured.after, measured.applied], [{ pages: 3, words: 900 }, { pages: 2, words: 860 }, 1]);
    assert.deepEqual(measured.cannotApply, [{ suggestion: 3, reason: "unknown paragraph number" },
      { suggestion: 2, reason: "the change crosses a formatting boundary" }]);
    assert.match(measured.next, /cannot be applied/);
    await refused(() => action("ternleaf_measure")(host, { revision: 5, suggestions: [{ paragraph: 1, find: "a", replacement: "b" }] }), "stale-document");

    // The house rules of the project reach Copilot with the text.
    assert.equal(action("ternleaf_status")(host, {}).houseRules, null);
    writeFileSync(join(folder, "ternleaf.rules.md"), "1. Write in plain English.\n2. Name every plan and its date.\n");
    assert.equal(action("ternleaf_status")(host, {}).houseRules, "ternleaf.rules.md");
    assert.deepEqual((await editor(action("ternleaf_read")(host, {}), read)).houseRules,
      { path: "ternleaf.rules.md", text: "1. Write in plain English.\n2. Name every plan and its date." });

    // Rules with a fixed form are checked without a model. The editor
    // reports the checks that fail, and Copilot gets them.
    writeFileSync(join(folder, "ternleaf.rules.md"), "Plain English.\n```ternleaf\nmax-pages: 2\nmax-sentence-words: 4\nrequire-heading: Decision\navoid: utilize => use\nmax-pages: many\n```\n");
    const fixed = workspace.rules().checks;
    assert.deepEqual(fixed, [{ kind: "max-pages", limit: 2 }, { kind: "max-sentence-words", limit: 4 },
      { kind: "require-heading", heading: "Decision" }, { kind: "avoid", term: "utilize", better: "use" }]);
    assert.deepEqual(runChecks(fixed, { pages: 3, words: 12, headings: ["The decision we ask for"],
      paragraphs: ["We utilize the roof. Utilized is fine. This sentence is far too long here."] }).map(item => [item.ok, item.text]), [
      [false, "Length: 3 pages. The limit is 2."],
      [false, '1 sentence longer than 4 words. The longest has 7: "This sentence is far too long here."'],
      [true, 'The heading "Decision" is there.'], [false, '"utilize" occurs once. Use "use".']]);
    await post("pulse", { lease, live: { revision: 0, pages: 3, words: 12, selection, failing: ["Length: 3 pages. The limit is 2."] } });
    assert.deepEqual(action("ternleaf_status")(host, {}).failingChecks, ["Length: 3 pages. The limit is 2."]);
    assert.match(promptContext(new Map([["main", host]]), { briefed: true }), /1 house rule check fail/);
    assert.equal((await post("history", { lease })).rules.checks.length, 4);
    host.news();

    // An edition knows its reference and the revision that it was checked
    // against. Copilot gets the changed passages from the editor.
    assert.deepEqual((await post("edition", { lease })).edition, null);
    await refused(() => action("ternleaf_reference_changes")(host, {}), "no-reference");
    assert.equal((await post("edition-set", { lease, reference: "docs/Brief.docx" })).error, "project");
    assert.deepEqual((await post("edition-set", { lease, reference: "examples/welcome-to-ternleaf.docx" })).edition,
      { reference: "examples/welcome-to-ternleaf.docx", checked: 0 });
    const reference = await post("edition-reference", { lease });
    assert.deepEqual([Buffer.from(reference.source, "base64").subarray(4).toString(), reference.frames], ["welcome", []]);
    await post("pulse", { lease, live: { revision: 0, selection, referenceChanges: 2 } });
    assert.deepEqual(action("ternleaf_status")(host, {}).edition, { reference: "examples/welcome-to-ternleaf.docx", checked: 0, changedPassages: 2 });
    assert.match(promptContext(new Map([["main", host]]), { briefed: true }), /edition of "examples\/welcome-to-ternleaf.docx", and 2 passages of the reference changed/);
    const moved = await editor(action("ternleaf_reference_changes")(host, {}), { reference: () => ({ result: {
      reference: "examples/welcome-to-ternleaf.docx", checked: 0, head: 3,
      changes: passageChanges([["a", "Costs 4 million."], ["b", "Opens in May."], ["c", " "]], [["a", "Costs 5 million."], ["d", "A new risk."]]) } }) });
    assert.deepEqual(moved.changes, [{ id: "c1", change: "changed", before: "Costs 4 million.", after: "Costs 5 million." },
      { id: "c2", change: "added", after: "A new risk." }, { id: "c3", change: "removed", before: "Opens in May." }]);
    assert.deepEqual([moved.checkedRevision, moved.referenceRevision], [0, 3]);
    assert.match(moved.next, /ternleaf_suggest/);
    assert.deepEqual((await post("edition-checked", { lease, revision: 3 })).edition.checked, 3);
    assert.match(promptContext(new Map([["main", host]]), { briefed: true }), /marked this edition as checked against revision 3/);
    assert.equal((await post("edition-set", { lease, reference: null })).edition, null);
    host.news();

    // The change record: what was accepted, for a reader who was not there.
    const record = await action("ternleaf_export")(host, { format: "changes" });
    assert.deepEqual([record.path, record.acceptedChanges], ["exports/Brief-changes-r0.md", 0]);
    assert.match(changeRecord({ document: "Brief.docx", revision: 3, when: new Date("2026-11-14T10:00:00Z"), changes: [
      { revision: 2, prompt: "Shorten.", before: "The roof is old.", replacement: "The roof\nis worn.", rationale: "More exact.", note: "Agreed with Ann.", origin: "chat" }] }),
      /^# Change record: Brief\.docx\n\nRevision 3, written 2026-11-14\. 1 accepted change\.[\s\S]*## 1\. Revision 2\n\n- Request \(from the chat\): Shorten\.\n- Copilot's reason: More exact\.\n- Author's note: Agreed with Ann\.\n\nBefore:\n\n> The roof is old\.\n\nAfter:\n\n> The roof is worn\.\n$/);

    // Other documents of the project.
    assert.deepEqual(action("ternleaf_documents")(host, {}).documents.map(item => item.path), ["docs/Brief.docx", "examples/welcome-to-ternleaf.docx"]);
    assert.deepEqual(action("ternleaf_history")(host, {}), { document: "Brief.docx", revision: 0, acceptedChanges: 0, changes: [] });
    const waiting = host.read();
    waiting.catch(() => {});
    assert.equal(action("ternleaf_open_document")(host, { document: "examples/welcome-to-ternleaf.docx" }).opened, "welcome-to-ternleaf.docx");
    await refused(() => waiting, "document-changed");
    assert.deepEqual(titles, ["welcome-to-ternleaf.docx"]);
    assert.deepEqual(host.status().canvas, { ready: false });
    assert.equal((await pulse()).error, "document-changed");

    // A tool call that goes around the canvas.
    const advice = input => toolAdvice(input, { project: folder, instances, state });
    assert.equal(advice({ toolName: "bash", toolArgs: { command: "sqlite3 .ternleaf\\Brief-0123456789.sqlite .dump" } }).permissionDecision, "ask");
    assert.equal(advice({ toolName: "view", toolArgs: { path: ".ternleaf/Brief-0123456789.sqlite" } }), undefined);
    assert.equal(advice({ toolName: "edit", toolArgs: { path: join(folder, "examples/welcome-to-ternleaf.docx") } }).permissionDecision, "ask");
    assert.equal(advice({ toolName: "invoke_canvas_action", toolArgs: { input: { document: "examples/welcome-to-ternleaf.docx" } } }), undefined);
    assert.match(advice({ toolName: "view", toolArgs: { path: "apps/host/serve.mjs" } }).additionalContext, /ternleaf_guide/);
    assert.equal(advice({ toolName: "view", toolArgs: { path: "apps/host/serve.mjs" } }), undefined);
    assert.equal(advice({ toolName: "view", toolArgs: { path: "README.md" } }), undefined);
    assert.match(toolAdvice({ toolName: "powershell", toolArgs: { command: "Expand-Archive docs/Brief.docx" } },
      { project: folder, instances: new Map(), state: { advised: false } }).additionalContext, /open_canvas/);
    assert.equal(promptContext(new Map(), { briefed: true }), undefined);

    // A project can keep Copilot to the requests from the canvas.
    assert.equal(workspace.resolve().chat, true);
    writeFileSync(join(folder, ".ternleaf/canvas.json"), JSON.stringify({ chat: false }));
    const closed = await startHost({ ...workspace.resolve("docs/Brief.docx"), workspace, port: 0 });
    try {
      const shut = new URL(closed.url);
      const call = async (path, data) => (await fetch(shut.origin + "/api/" + path, { method: "POST", body: JSON.stringify(data),
        headers: { Authorization: "Bearer " + shut.hash.slice(1) } })).json();
      const held = (await call("claim", { previous: null })).lease;
      await call("pulse", { lease: held, live: { revision: 0, selection: { node: node(3), start: 0, end: 16, before: "The roof is old.", revision: 0 } } });
      const limited = action("ternleaf_status")(closed, {});
      assert.deepEqual([limited.chatAccess, limited.canvas.selection], [false, null]);
      assert.match(limited.next, /only on requests that the author sends from the canvas/);
      for (const blocked of [() => action("ternleaf_read")(closed, {}), () => action("ternleaf_view_page")(closed, { page: 1 }),
        () => action("ternleaf_export")(closed, { format: "pdf" }), () => action("ternleaf_history")(closed, {}),
        () => action("ternleaf_propose")(closed, { instructions: "x", text: "The roof is old.", replacement: "Old." }),
        () => action("ternleaf_suggest")(closed, { instructions: "x", revision: 0, suggestions: [{ paragraph: 1, find: "a", replacement: "b" }] })]) {
        await refused(blocked, "chat-access-off");
      }
      assert.match(promptContext(new Map([["main", closed]]), { briefed: true }), /only on requests that the author sends from the canvas/);
    } finally { await closed.close(); }
    assert.deepEqual([...new Set(seen.filter(Boolean))], ["Copilot read the selected text."]);
  } finally {
    await host.close();
    assert(existsSync(join(folder, ".ternleaf")));
    rmSync(folder, { recursive: true, force: true });
  }
});

test("an accepted update of an edition links its paragraph to the paragraph of the reference", async () => {
  const folder = project();
  const workspace = createWorkspace({ project: folder });
  const host = await startHost({ ...workspace.resolve("docs/Brief.docx"), workspace, port: 0 });
  const origin = new URL(host.url).origin;
  const token = new URL(host.url).hash.slice(1);
  const post = async (path, data) => {
    const response = await fetch(origin + "/api/" + path, { method: "POST", body: JSON.stringify(data),
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" } });
    return { status: response.status, ...await response.json() };
  };
  const { lease } = await post("claim", { previous: null });
  // The editor: it does the jobs that the actions queue.
  const editor = async (work, answers) => {
    let finished = false;
    const result = Promise.resolve(work).finally(() => { finished = true; });
    result.catch(() => {});
    const done = new Set();
    while (!finished) {
      const state = await post("pulse", { lease, live: { revision: 0, pages: 1, words: 9, selection: null } });
      for (const job of state.jobs.filter(item => !done.has(item.id))) {
        done.add(job.id);
        await post("job", { lease, id: job.id, ...(answers[job.kind]?.(job) ?? { error: "invalid-request" }) });
      }
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    return result;
  };
  const brief = [[node(11), "The roof costs 4 million."], [node(12), "It opens in May."]];
  const paper = [[node(1), "Costs 4 million."], [node(2), "Opens in May."]];
  let linked = null;
  const reference = () => ({ result: { reference: "examples/welcome-to-ternleaf.docx", checked: 0, head: 1,
    changes: passageChanges(paper, [[node(1), "Costs 5 million."], [node(3), "A new risk."]]).map(item => ({ ...item, linked: item.node === node(1) ? linked : null })) } });
  try {
    await post("edition-set", { lease, reference: "examples/welcome-to-ternleaf.docx" });
    await post("pulse", { lease, live: { revision: 0, pages: 1, words: 9, selection: null } });
    const first = await editor(action("ternleaf_reference_changes")(host, {}), { reference });
    assert.deepEqual(first.changes, [{ id: "c1", change: "changed", before: "Costs 4 million.", after: "Costs 5 million." },
      { id: "c2", change: "added", after: "A new risk." }, { id: "c3", change: "removed", before: "Opens in May." }]);
    assert.match(first.next, /answers[\s\S]*evidence, not proof/);
    await editor(action("ternleaf_read")(host, {}), { read: () => ({ result: { revision: 0, paragraphs: brief, pages: 1, words: 9 } }) });
    // A suggestion names the change that it answers. A name that the last
    // result does not have is refused.
    const sent = await editor(action("ternleaf_suggest")(host, { instructions: "Update the edition.", revision: 0, suggestions: [
      { paragraph: 1, find: "4 million", replacement: "5 million", rationale: "The reference says 5 million.", answers: "c1" },
      { paragraph: 2, find: "May", replacement: "June", answers: "c9" },
      { paragraph: 2, find: "It opens", replacement: "It may open", answers: "c3" }] }), { check: () => ({ result: { blocked: [] } }) });
    assert.equal(sent.suggested, 2);
    assert.match(sent.refused[0].reason, /answers names no change/);
    // Copilot's word alone records nothing.
    assert.equal(workspace.edition(join(folder, "docs/Brief.docx")).links, undefined);
    const [update, other] = (await post("suggestions", { lease })).suggestions;
    // The author accepts both. The frames are the ones the editor makes.
    for (const [head, suggestion, start, removed, inserted] of [[0, update, 15, "4", "5"], [1, other, 0, "opens", "may open"]]) {
      const target = suggestion.node;
      const opened = await post("adopt", { lease, id: suggestion.id,
        scope: { node: target, start, end: start + Buffer.byteLength(suggestion.find), before: suggestion.find, revision: head, note: "" } });
      assert.equal(opened.status, 200, JSON.stringify(opened));
      const id = opened.draft.id;
      const at = start + (suggestion === update ? 0 : 3);
      const forward = [{ DeleteText: { range: { start: { node: target, offset: at }, end: { node: target, offset: at + removed.length } } } },
        { InsertText: { at: { node: target, offset: at }, text: inserted } }];
      const committed = await post("commit", { lease, request: { id, fingerprint: "f" + head, expected: head, command: { kind: "edit" },
        frame: { base: head, revision: head + 1, forward, inverse: ["x"] }, editorial: { target, note: "" }, reviewId: id } });
      assert.equal(committed.status, 200, JSON.stringify(committed));
    }
    // Only the accepted change with a paragraph of the reference is a link.
    assert.deepEqual(workspace.edition(join(folder, "docs/Brief.docx")).links, { [node(1)]: node(11) });
    // The next time, the editor names the linked paragraph, and Copilot gets it.
    assert.deepEqual((await post("edition-reference", { lease })).edition.links, { [node(1)]: node(11) });
    linked = { paragraph: 1, text: "The roof costs 5 million." };
    const second = await editor(action("ternleaf_reference_changes")(host, {}), { reference });
    assert.deepEqual(second.changes[0].linkedTo, { paragraph: 1, text: "The roof costs 5 million." });
    // A check of the edition keeps the links. A new reference ends them.
    await post("edition-checked", { lease, revision: 1 });
    assert.deepEqual(workspace.edition(join(folder, "docs/Brief.docx")).links, { [node(1)]: node(11) });
    workspace.setEdition(join(folder, "docs/Brief.docx"), "examples/welcome-to-ternleaf.docx", 1);
    assert.deepEqual(workspace.edition(join(folder, "docs/Brief.docx")).links, { [node(1)]: node(11) });
    // A save of the reference gives its paragraphs new IDs. The links follow.
    workspace.restartEditionsOf(join(folder, "examples/welcome-to-ternleaf.docx"), { head: 1, renamed: [[node(1), node(21)]] });
    assert.deepEqual(workspace.edition(join(folder, "docs/Brief.docx")).links, { [node(21)]: node(11) });
  } finally {
    await host.close();
    rmSync(folder, { recursive: true, force: true });
  }
});

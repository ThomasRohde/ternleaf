import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { actions } from "../apps/agent/actions.mjs";
import { promptContext, toolAdvice } from "../apps/agent/context.mjs";
import { brief, canvasPrompt, guide, rules, skill } from "../apps/agent/guide.mjs";
import { createWorkspace } from "../apps/host/project.mjs";
import { startHost } from "../apps/host/serve.mjs";
import { refusalForAgent } from "../packages/session/messages.mjs";
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
    assert(item.description.length >= 60 && item.description.length <= 420, `${item.name} has a description of a useful length`);
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
      const allowed = new Set([...fields("ternleaf_suggest"), ...fields("ternleaf_propose"), "paragraph", "find", "replacement", "rationale"]);
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
    const suggested = action("ternleaf_suggest")(host, { instructions: "Proofread.", revision: 0, suggestions: [
      { paragraph: 2, find: "The the", replacement: "The", rationale: "A repeated word." },
      { paragraph: 9, find: "x", replacement: "y" }] });
    assert.deepEqual([suggested.suggested, suggested.refused], [1, [{ suggestion: 2, reason: "unknown paragraph number" }]]);
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
    assert.deepEqual(seen.filter(Boolean), []);
  } finally {
    await host.close();
    assert(existsSync(join(folder, ".ternleaf")));
    rmSync(folder, { recursive: true, force: true });
  }
});

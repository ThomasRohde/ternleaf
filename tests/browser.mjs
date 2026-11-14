import assert from "node:assert/strict";
import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { actions } from "../apps/agent/actions.mjs";
import { promptContext } from "../apps/agent/context.mjs";
import { createWorkspace } from "../apps/host/project.mjs";
import { startHost } from "../apps/host/serve.mjs";

const [playwright, chrome, engine, out, font, ...additionalFonts] = process.argv.slice(2);
const { chromium } = await import(pathToFileURL(playwright));
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: chrome });
const authoredNote = "Keep the executive recommendation explicit.";
const run = randomUUID();
let host;
let requestId;
try {
  const launch = async (source, project, loseProposalReplyOnce = false) => {
    host = await startHost({ source: join(out, source + ".docx"), state: join(out, project + "-" + run + ".sqlite"),
      engine, font, fonts: additionalFonts.length ? [font, ...additionalFonts] : undefined,
      loseProposalReplyOnce, askAgent: id => { requestId = id; } });
    const page = await browser.newPage({ viewport: { width: 1450, height: 1050 } });
    page.on("pageerror", error => console.error(error.message));
    const base = new URL(host.url).origin;
    await page.route("**/*", route => route.request().url().startsWith(base + "/") ? route.continue() : route.abort());
    await page.goto(host.url, { waitUntil: "domcontentloaded" });
    try {
      await page.locator("#ternleaf-panel [role=status]").filter({ hasText: /^Saved at revision / }).waitFor({ timeout: 60_000 });
    } catch (error) {
      console.error(await page.locator("#ternleaf-start [role=status]").textContent().catch(() => "(editor absent)"));
      throw error;
    }
    return page;
  };
  const close = async page => {
    await page.goto("about:blank");
    await page.close();
    await host.close();
    host = null;
  };
  const state = page => page.evaluate(() => window.ternleafSession.state());
  const hasText = (page, phrase) => page.evaluate(text => {
    const hit = window.ternleafEditor.doc.findText(text, "", 0, true, true);
    try { return Boolean(hit.startNode); } finally { hit.free(); }
  }, phrase);
  const key = async (page, keyName) => {
    await page.locator(".page-wrap canvas.page").first().click({ position: { x: 78, y: 80 } });
    await page.keyboard.press(keyName);
  };
  const editEnd = async (page, char) => {
    await key(page, "Control+Home");
    await page.keyboard.press("End");
    await page.keyboard.type(char);
  };
  const save = async (page, name) => {
    const awaited = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export DOCX" }).click();
    await (await awaited).saveAs(join(out, name + ".docx"));
  };

  const admission = [];
  const measure = async page => admission.push(...await page.evaluate(() => window.ternleafSession.admissionMs()));
  let page = await launch("owned", "slice", true);
  await editEnd(page, "X");
  assert.equal((await state(page)).head, 1);
  await page.keyboard.press("Home");
  await page.keyboard.press("Shift+End");
  await page.getByRole("textbox", { name: "Instructions for selected text" }).fill("Change the last character to Y.");
  await page.locator("#ternleaf-panel").getByRole("button", { name: "Ask Copilot" }).click();
  await page.getByText("Waiting for Copilot").first().waitFor();
  assert.deepEqual(host.readReview(requestId), { text: "Alpha KEEP omegaX", instructions: "Change the last character to Y." });
  host.submitProposal(requestId, "Alpha KEEP omegaY", "Changed the last character as instructed.");
  await page.locator("#ternleaf-panel ins").filter({ hasText: /^Y$/ }).waitFor();
  await page.getByText("Changed the last character as instructed.").waitFor();
  await page.getByRole("textbox", { name: "Edition note" }).fill(authoredNote);
  await page.getByRole("button", { name: "Save note" }).click();
  await page.getByText("Note saved").waitFor();
  await measure(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByText("Proposal ready to review").waitFor();
  assert.throws(() => host.readReview(requestId), /stale-agent-request/);
  assert.throws(() => host.submitProposal(requestId, "Stale response"), /stale-agent-request/);
  assert.equal(await page.getByRole("textbox", { name: "Edition note" }).inputValue(), authoredNote);
  await page.getByRole("button", { name: "Accept change" }).click();
  await page.getByRole("button", { name: "Reload saved revision" }).waitFor();
  assert.equal((await state(page)).head, 1);
  await measure(page);
  await close(page);

  // A declined request shows the agent's reason. A discarded request closes,
  // and the agent can no longer answer it.
  page = await launch("owned", "answers");
  const select = async () => {
    await key(page, "Control+Home");
    await page.keyboard.press("Shift+End");
  };
  await select();
  await page.locator("#ternleaf-bubble").getByRole("button", { name: "Proofread" }).click();
  await page.getByText("Waiting for Copilot").first().waitFor();
  assert.match(host.readReview(requestId).instructions, /spelling/);
  host.declineProposal(requestId, "The passage has no errors.");
  await page.getByText("The passage has no errors.").waitFor();
  assert.throws(() => host.submitProposal(requestId, "Late proposal"), /proposal-already-submitted/);
  await page.locator("#ternleaf-panel").getByRole("button", { name: "Discard" }).click();
  await page.getByRole("textbox", { name: "Instructions for selected text" }).waitFor();
  await select();
  await page.getByRole("textbox", { name: "Instructions for selected text" }).fill("Use sentence case.");
  await page.keyboard.press("Control+Enter");
  await page.getByText("Waiting for Copilot").first().waitFor();
  const cancelled = requestId;
  await page.getByRole("button", { name: "Cancel request" }).click();
  await page.getByRole("textbox", { name: "Instructions for selected text" }).waitFor();
  assert.throws(() => host.submitProposal(cancelled, "Alpha keep omega"), /unknown-review/);
  assert.equal((await state(page)).head, 0);

  // Copilot offers alternatives. The author picks one, edits it and accepts.
  const panel = page.locator("#ternleaf-panel");
  await select();
  await page.locator("#ternleaf-bubble").getByRole("button", { name: "Shorten" }).click();
  await page.getByText("Waiting for Copilot").first().waitFor();
  host.submitProposal(requestId, "Alpha KEEP one", "Three options.", ["Alpha KEEP two", "Alpha KEEP three"]);
  await panel.locator("ins").filter({ hasText: /^one$/ }).waitFor();
  await panel.getByRole("button", { name: "Option 2" }).click();
  await panel.locator("ins").filter({ hasText: /^two$/ }).waitFor();
  await panel.getByRole("button", { name: "Edit the text" }).click();
  await panel.getByRole("textbox", { name: "Edit the proposed text" }).fill("Alpha KEEP four");
  await panel.getByRole("button", { name: "Apply edit" }).click();
  await panel.locator("ins").filter({ hasText: /^four$/ }).waitFor();
  await panel.getByRole("button", { name: "Accept change" }).click();
  await page.getByText("Saved at revision 1").waitFor();
  assert(await hasText(page, "Alpha KEEP four"));

  // A whole-document review returns a queue. Each opened suggestion goes
  // through the same review and acceptance as a selected passage.
  await page.getByRole("button", { name: "Whole document" }).click();
  await panel.getByRole("button", { name: "Tighten" }).click();
  await page.getByText("Waiting for Copilot").first().waitFor();
  const shared = host.readReview(requestId);
  assert.equal(shared.scope, "document");
  const number = shared.paragraphs.find(item => item.text === "Alpha KEEP four").paragraph;
  assert.throws(() => host.submitSuggestions(requestId, [{ paragraph: number, find: "absent", replacement: "x" }]), /invalid-suggestions/);
  assert.deepEqual(host.submitSuggestions(requestId, [
    { paragraph: number, find: "Alpha", replacement: "Beta", rationale: "First." },
    { paragraph: number, find: "four", replacement: "five", rationale: "Second." },
    { paragraph: 999, find: "Alpha", replacement: "Gamma" },
  ]), { suggested: 2, refused: [{ suggestion: 3, reason: "unknown paragraph number" }] });
  await page.getByText("2 suggestions ready to review").waitFor();
  await panel.getByRole("button", { name: "Review", exact: true }).first().click();
  await page.getByText("Suggestion 1 of 2").waitFor();
  await panel.getByRole("button", { name: "Accept change" }).click();
  await page.getByText("Suggestion 2 of 2").waitFor();
  await panel.getByRole("button", { name: "Skip" }).click();
  await page.getByText("All suggestions reviewed").first().waitFor();
  assert.equal((await state(page)).head, 2);
  assert(await hasText(page, "Beta KEEP four"));
  await close(page);

  page = await launch("owned", "slice");
  const accepted = await state(page);
  assert.equal(accepted.head, 2);
  assert.equal(accepted.editorial.note, authoredNote);
  assert(await hasText(page, "Alpha KEEP omegaY"));
  assert.equal(await page.getByText("Unsaved work recovered").isVisible(), false);
  await save(page, "owned-browser");
  await key(page, "Control+z");
  assert.deepEqual(await state(page), { head: 3, editorial: null });
  assert(await hasText(page, "Alpha KEEP omegaX"));
  await page.getByRole("tab", { name: /History/ }).click();
  await page.getByText("Copilot change accepted").waitFor();
  await page.getByRole("button", { name: "Retry last acceptance" }).click();
  await page.getByText("Already applied at revision 2 · current revision 3").waitFor();
  assert.equal((await state(page)).head, 3);
  assert(await hasText(page, "Alpha KEEP omegaX"));
  await key(page, "Control+y");
  assert.deepEqual(await state(page), { head: 4, editorial: accepted.editorial });
  assert(await hasText(page, "Alpha KEEP omegaY"));
  await measure(page);
  await close(page);

  page = await launch("geometry", "geometry");
  await editEnd(page, "X");
  assert.equal((await state(page)).head, 1);
  await page.keyboard.press("Control+Home");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Shift+Enter");
  assert.equal((await state(page)).head, 2);
  await save(page, "geometry-edited");
  await measure(page);
  const geometry = await page.evaluate(() => {
    const doc = window.ternleafEditor.doc;
    return Array.from({ length: doc.pageCount }, (_, index) => {
      const origins = JSON.parse(doc.glyphOrigins(index));
      const bitmap = doc.renderPage(index, 360);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.widthPx;
        canvas.height = bitmap.heightPx;
        canvas.getContext("2d").putImageData(new ImageData(bitmap.rgba, bitmap.widthPx, bitmap.heightPx), 0, 0);
        return { origins, png: canvas.toDataURL().split(",")[1] };
      } finally { bitmap.free(); }
    });
  });
  for (const [i, page] of geometry.entries()) {
    await writeFile(join(out, "geometry-browser-" + (i + 1) + ".png"), Buffer.from(page.png, "base64"));
  }
  await writeFile(join(out, "geometry-browser.json"), JSON.stringify(geometry.map(page => page.origins)));
  await close(page);
  // A project with several documents: open another one, make a new one, add
  // a copy of a file, and return to the last document in a new canvas.
  const folder = join(out, "project-" + run);
  await mkdir(join(folder, "docs"), { recursive: true });
  await mkdir(join(folder, ".ternleaf"));
  await copyFile(join(out, "owned.docx"), join(folder, "docs", "First.docx"));
  await copyFile(join(out, "geometry.docx"), join(folder, "docs", "Second.docx"));
  await writeFile(join(folder, ".ternleaf", "canvas.json"), JSON.stringify({ engine, source: "docs/First.docx", state: ".ternleaf/first.sqlite" }));
  const workspace = createWorkspace({ project: folder });
  const openProject = async () => {
    host = await startHost({ ...workspace.resolve(), workspace, askAgent: id => { requestId = id; } });
    const view = await browser.newPage({ viewport: { width: 1450, height: 1050 } });
    view.on("pageerror", error => console.error(error.message));
    await view.goto(host.url, { waitUntil: "domcontentloaded" });
    return view;
  };
  const shows = (view, name) => view.locator("#ternleaf-panel [data-ready=true], #ternleaf-panel[data-ready=true]")
    .locator("[data-part=name]").filter({ hasText: name }).waitFor({ timeout: 60_000 });
  page = await openProject();
  await shows(page, "First.docx");
  await editEnd(page, "Z");
  assert.equal((await state(page)).head, 1);
  await page.keyboard.press("Control+s");
  await page.getByText("Saved at revision 1. Ternleaf saves every change.").waitFor();
  await page.keyboard.press("Control+o");
  await page.locator("#ternleaf-documents .tl-doc").filter({ hasText: "Second" }).click();
  await shows(page, "Second.docx");
  assert.equal((await state(page)).head, 0);
  await page.locator("#ternleaf-panel [data-action=documents]").click();
  await page.getByRole("button", { name: "New document…" }).click();
  await page.locator("#ternleaf-new [data-part=name]").fill("Third: a/b");
  await page.getByRole("button", { name: "Create document" }).click();
  await shows(page, "Third a b.docx");
  const chooser = page.waitForEvent("filechooser");
  await page.keyboard.press("Control+o");
  await page.getByRole("button", { name: "Add a file from this computer…" }).click();
  await (await chooser).setFiles(join(out, "owned.docx"));
  await shows(page, "owned.docx");
  assert.deepEqual((await readdir(join(folder, "documents"))).sort(), ["owned.docx"]);
  assert.deepEqual((await readdir(join(folder, "docs"))).sort(), ["First.docx", "Second.docx", "Third a b.docx"]);
  // The agent opens a document in the open canvas. The page follows.
  host.openDocument("docs/First.docx");
  await shows(page, "First.docx");
  assert.equal((await state(page)).head, 1);
  assert(await hasText(page, "Alpha KEEP omegaZ"));
  await close(page);
  page = await openProject();
  await shows(page, "First.docx");

  // Copilot works from the chat, with no request from the canvas: it reads
  // the text, looks at a page, exports files, and sends suggestions and a
  // proposal that the author reviews.
  const act = name => actions.find(item => item.name === name).run;
  const until = async (check, what) => {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await check()) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("Timed out: " + what);
  };
  await until(() => host.status().canvas.ready, "the canvas reports to the host");
  assert.deepEqual(host.status().document, { name: "First.docx", path: "docs/First.docx", revision: 1 });
  const text = await act("ternleaf_read")(host, {});
  const line = text.paragraphs.find(item => item.text === "Alpha KEEP omegaZ");
  assert(line, JSON.stringify(text.paragraphs.slice(0, 4)));
  assert.deepEqual([text.revision, text.total >= 2, text.pages >= 1, text.words > 3], [1, true, true, true]);
  await page.getByText("Copilot read the document text.").waitFor();
  const picture = await act("ternleaf_view_page")(host, { page: 1 });
  const png = Buffer.from(picture.binaryResultsForLlm[0].data, "base64");
  assert.deepEqual([png.subarray(1, 4).toString(), png.length > 4000, JSON.parse(picture.textResultForLlm).width > 600], ["PNG", true, true]);
  await writeFile(join(out, "copilot-page-1.png"), png);
  await assert.rejects(act("ternleaf_view_page")(host, { page: 99 }), error => error.code === "page-out-of-range" && /The document has \d+ page/.test(error.detail));
  for (const [format, start] of [["markdown", "Alpha"], ["text", ""], ["html", "<"], ["pdf", "%PDF"], ["docx", "PK"]]) {
    const exported = await act("ternleaf_export")(host, { format });
    const content = await readFile(join(folder, exported.path));
    assert.deepEqual([exported.revision, content.length === exported.bytes, content.subarray(0, 40).toString("latin1").trimStart().startsWith(start)],
      [1, true, true], format + ": " + content.subarray(0, 40).toString("latin1"));
    if (format === "markdown") assert(content.toString().includes("Alpha KEEP omegaZ"));
  }
  // The engine lays out a copy with the changes and reports the real length.
  const measured = await act("ternleaf_measure")(host, { revision: text.revision, suggestions: [
    { paragraph: line.paragraph, find: "Alpha KEEP ", replacement: "" }, { paragraph: line.paragraph, find: "absent", replacement: "x" }] });
  assert.deepEqual([measured.now.pages >= 1, measured.after.pages <= measured.now.pages, measured.now.words - measured.after.words, measured.applied,
    measured.cannotApply], [true, true, 2, 1, [{ suggestion: 2, reason: "the find text is not in that paragraph" }]]);
  assert.equal((await state(page)).head, 1);
  const sent = act("ternleaf_suggest")(host, { instructions: "Use HOLD, not KEEP.", revision: text.revision, suggestions: [
    { paragraph: line.paragraph, find: "Alpha", remark: "Say what Alpha is." },
    { paragraph: line.paragraph, find: "KEEP", replacement: "HOLD", rationale: "The author asked for HOLD." },
    { paragraph: line.paragraph, find: "absent", replacement: "x" }] });
  assert.deepEqual([sent.suggested, sent.refused.length], [2, 1]);
  await page.getByText("1 suggestion and 1 remark to review").waitFor();
  const remark = page.locator('#ternleaf-panel [data-part=queue-list] li[data-kind=remark]');
  await remark.getByText("Say what Alpha is.").waitFor();
  await remark.getByRole("button", { name: "Done" }).click();
  await page.getByText("1 suggestion to review").waitFor();
  await page.locator('#ternleaf-panel [data-part=queue-prompt][data-origin=chat]').filter({ hasText: "Use HOLD, not KEEP." }).waitFor();
  await page.locator("#ternleaf-panel [data-part=queue-list]").getByRole("button", { name: "Review" }).click();
  await page.locator('#ternleaf-panel [data-part=asked][data-origin=chat]').waitFor();
  await page.getByRole("button", { name: "Accept change" }).click();
  await until(async () => (await state(page)).head === 2, "the accepted suggestion is revision 2");
  assert(await hasText(page, "Alpha HOLD omegaZ"));
  // The document changed, so the text that Copilot read is out of date.
  assert.throws(() => act("ternleaf_suggest")(host, { instructions: "Again.", revision: 1,
    suggestions: [{ paragraph: line.paragraph, find: "HOLD", replacement: "KEEP" }] }), /stale-document/);
  await select();
  await until(() => host.status().canvas.selection?.text === "Alpha HOLD omegaZ", "the selection reaches the host");
  const proposed = act("ternleaf_propose")(host, { instructions: "End with Y.", text: "Alpha HOLD omegaZ",
    replacement: "Alpha HOLD omegaY", rationale: "The last letter is now Y." });
  await page.locator("#ternleaf-panel ins").filter({ hasText: /^Y$/ }).waitFor();
  await page.locator('#ternleaf-panel [data-part=asked][data-origin=chat]').filter({ hasText: "End with Y." }).waitFor();
  await page.getByText("The last letter is now Y.").waitFor();
  await page.getByRole("button", { name: "Accept change" }).click();
  await until(async () => (await state(page)).head === 3, "the accepted proposal is revision 3");
  assert(await hasText(page, "Alpha HOLD omegaY"));
  const told = promptContext(new Map([["main", host]]), { briefed: true });
  assert.match(told, /shows "docs\/First.docx" \(revision 3, /);
  assert.match(told, /the author accepted "KEEP" → "HOLD" \(revision 2\); accepted "Alpha HOLD omegaZ" → "Alpha HOLD omegaY" \(revision 3\)/);
  const past = act("ternleaf_history")(host, {});
  assert.deepEqual(past.changes.slice(-2).map(item => [item.revision, item.from, item.instructions, item.after]),
    [[2, "chat", "Use HOLD, not KEEP.", "HOLD"], [3, "chat", "End with Y.", "Alpha HOLD omegaY"]]);
  assert.equal(past.changes.at(-1).before, "Alpha HOLD omegaZ");
  assert.equal(typeof proposed.requestId, "string");
  // The change record, from Copilot and from the History tab.
  const record = await act("ternleaf_export")(host, { format: "changes" });
  const written = (await readFile(join(folder, record.path))).toString();
  assert.match(written, /# Change record: First\.docx[\s\S]*2 accepted changes[\s\S]*Request \(from the chat\): End with Y\.[\s\S]*> Alpha HOLD omegaY/);
  await page.locator("#ternleaf-panel").getByRole("tab", { name: /History/ }).click();
  const [saved] = await Promise.all([page.waitForEvent("download"),
    page.getByRole("button", { name: "Download the change record" }).click()]);
  assert.equal(saved.suggestedFilename(), "First-changes-r3.md");

  // Stage 2 of the plan, in a document with bold text inside a paragraph:
  // checks without a model, a remark that becomes a Word comment, and a
  // change across a formatting boundary with its warning.
  await writeFile(join(folder, "ternleaf.rules.md"), "Write plainly.\n```ternleaf\nmax-words: 5\navoid: sentence => line\nmax-pages: 3\n```\n");
  await copyFile(new URL("./fixtures/mixed.docx", import.meta.url), join(folder, "docs", "Mixed.docx"));
  host.openDocument("docs/Mixed.docx");
  await shows(page, "Mixed.docx");
  await until(() => host.status().canvas.ready && host.status().failingChecks?.length === 2, "the failing checks reach the host");
  await page.getByText("House rules: 2 of 3 checks fail").waitFor();
  await page.getByText('"sentence" occurs once. Use "line".').waitFor();
  const mixed = await act("ternleaf_read")(host, {});
  assert.deepEqual([mixed.houseRules.path, mixed.failingChecks.length], ["ternleaf.rules.md", 2]);
  const bold = mixed.paragraphs.find(item => item.text === "Plain start bold middle plain end of the sentence.");
  const third = mixed.paragraphs.find(item => item.text.startsWith("Third paragraph"));
  const second = mixed.paragraphs.find(item => item.text === "Second paragraph stays here.");
  const runsOf = text => page.evaluate(wanted => {
    const doc = window.ternleafEditor.doc;
    const [node] = JSON.parse(doc.searchableText()).find(([, value]) => value === wanted);
    return doc.copyRichRuns(node, 0, node, doc.paragraphLength(node));
  }, text);
  const acceptNext = async head => {
    await page.getByRole("button", { name: "Accept change" }).click();
    await until(async () => (await state(page)).head === head, "the accepted change is revision " + head);
  };
  act("ternleaf_suggest")(host, { instructions: "Review against the house rules.", revision: mixed.revision, suggestions: [
    { paragraph: bold.paragraph, find: "bold middle", replacement: "strong centre", rationale: "A whole bold phrase." },
    { paragraph: second.paragraph, find: "stays here.", replacement: "stays.\nA new paragraph follows.", rationale: "A new paragraph." },
    { paragraph: third.paragraph, find: "Third paragraph", remark: "Say which paragraph." }] });
  await page.getByText("2 suggestions and 1 remark to review").waitFor();
  await page.locator("#ternleaf-panel li[data-kind=remark]").getByRole("button", { name: "Add as comment" }).click();
  await page.getByText("The remark is now a comment in the document.").waitFor();
  await until(async () => (await state(page)).head === 1, "the comment is revision 1");
  assert.equal((await act("ternleaf_read")(host, {})).comments, 1);
  // A change over a whole bold phrase keeps the bold, with no warning.
  await page.locator("#ternleaf-panel [data-part=queue-list]").getByRole("button", { name: "Review" }).first().click();
  await page.locator("#ternleaf-panel [data-part=rationale-text]").filter({ hasText: "A whole bold phrase." }).waitFor();
  assert(await page.locator("#ternleaf-panel [data-part=mixed]").isHidden());
  await acceptNext(2);
  assert.deepEqual(JSON.parse(await runsOf("Plain start strong centre plain end of the sentence.")),
    [{ text: "Plain start " }, { text: "strong centre", bold: true }, { text: " plain end of the sentence." }]);
  // A line break in the replacement is a new paragraph, in one revision.
  await page.locator("#ternleaf-panel [data-part=rationale-text]").filter({ hasText: "A new paragraph." }).waitFor();
  await acceptNext(3);
  assert(await hasText(page, "Second paragraph stays."));
  assert(await hasText(page, "A new paragraph follows."));
  // In Suggesting mode an accepted proposal is a Word tracked change.
  await page.evaluate(async () => {
    const { doc, refresh } = window.ternleafEditor;
    const [node] = JSON.parse(doc.searchableText())[0];
    await refresh(doc.setTrackRevisions(true, node, 0));
  });
  await until(() => host.status().canvas.suggestingMode === true && host.status().document.revision === 4, "Suggesting mode reaches the host");
  let now = await act("ternleaf_read")(host, {});
  act("ternleaf_suggest")(host, { instructions: "Call it a note.", revision: now.revision, suggestions: [
    { paragraph: now.paragraphs.find(item => item.text.startsWith("Third paragraph")).paragraph, find: "for a comment", replacement: "for a note", rationale: "Tracked." }] });
  await page.locator("#ternleaf-panel [data-part=queue-list]").getByRole("button", { name: "Review" }).click();
  await page.locator("#ternleaf-panel [data-part=tracked]").filter({ hasText: "tracked change" }).waitFor();
  await acceptNext(5);
  const trackedChanges = JSON.parse(await page.evaluate(() => window.ternleafEditor.doc.listRevisions()));
  assert.deepEqual(trackedChanges.map(item => [item.kind, item.text]).sort(), [["deletion", "comment"], ["insertion", "note"]]);
  await page.evaluate(async () => {
    const { doc, refresh } = window.ternleafEditor;
    const [node] = JSON.parse(doc.searchableText())[0];
    await refresh(doc.setTrackRevisions(false, node, 0));
  });
  await until(() => host.status().canvas.suggestingMode === false && host.status().document.revision === 6, "Editing mode reaches the host");
  // A change across bold and plain text is applied, with a warning.
  now = await act("ternleaf_read")(host, {});
  act("ternleaf_suggest")(host, { instructions: "Shorten.", revision: now.revision, suggestions: [
    { paragraph: now.paragraphs.find(item => item.text.startsWith("Plain start")).paragraph, find: "start strong centre plain", replacement: "opening", rationale: "Shorter." }] });
  await page.locator("#ternleaf-panel [data-part=queue-list]").getByRole("button", { name: "Review" }).click();
  await page.locator("#ternleaf-panel [data-part=mixed]").filter({ hasText: "formatting of the first replaced word" }).waitFor();
  await acceptNext(7);
  assert(await hasText(page, "Plain opening end of the sentence."));
  const word = await act("ternleaf_export")(host, { format: "docx" });

  // A copy comes back from Word. It was exported at revision 0, and the
  // document changed here after that. Only the changes from Word come to the
  // review, and the change that was made here stays.
  await copyFile(new URL("./fixtures/mixed.docx", import.meta.url), join(folder, "docs", "Back.docx"));
  host.openDocument("docs/Back.docx");
  await shows(page, "Back.docx");
  await until(() => host.status().canvas.ready, "the canvas shows Back.docx");
  const fromWord = Buffer.from(await page.evaluate(async () => {
    const wasm = await import("/pkg/casual_doc_wasm.js");
    const { doc, refresh } = window.ternleafEditor;
    const format = "org.openxmlformats.wordprocessingml.document";
    const exported = doc.exportAs(format, "exact_if_unchanged");
    const copy = wasm.open(exported.bytes);
    exported.free();
    const paragraphs = JSON.parse(copy.searchableText());
    copy.replaceSelection(paragraphs[1][0], 0, paragraphs[1][0], 6, "Middle").free();
    copy.replaceSelection(paragraphs[0][0], 0, paragraphs[0][0], 6, "").free();
    const edited = copy.exportAs(format, "preserve_when_safe");
    const bytes = Array.from(edited.bytes);
    edited.free();
    copy.free();
    // Meanwhile the author changes the third paragraph here.
    const [third] = JSON.parse(doc.searchableText())[2];
    await refresh(doc.replaceSelection(third, 0, third, 5, "Final"));
    return bytes;
  }));
  await writeFile(join(out, "Back-r0.docx"), fromWord);
  await until(async () => (await state(page)).head === 1, "the author's edit is revision 1");
  await page.locator("#ternleaf-panel [data-action=export-menu]").click();
  const [wordFile] = await Promise.all([page.waitForEvent("filechooser"),
    page.getByRole("menuitem", { name: "Merge a copy from Word…" }).click()]);
  await wordFile.setFiles(join(out, "Back-r0.docx"));
  await page.getByText("2 suggestions to review").waitFor();
  await page.locator("#ternleaf-panel [data-part=queue-prompt][data-origin=word]")
    .filter({ hasText: "Changes from Back-r0.docx, made in Word after revision 0." }).waitFor();
  await page.locator("#ternleaf-panel [data-part=queue-list]").getByRole("button", { name: "Review" }).first().click();
  await page.locator("#ternleaf-panel [data-part=asked][data-origin=word]").waitFor();
  await acceptNext(2);
  await page.locator("#ternleaf-panel [data-part=rationale-text]").filter({ hasText: "Changed in Word." }).waitFor();
  await acceptNext(3);
  for (const expected of ["start bold middle plain end of the sentence.", "Middle paragraph stays here.", "Final paragraph for a comment."]) {
    assert(await hasText(page, expected), expected);
  }
  assert(!(await hasText(page, "Plain start")));
  assert.equal(act("ternleaf_history")(host, {}).changes.at(-1).from, "word");
  assert.equal((await readFile(join(folder, word.path))).subarray(0, 2).toString(), "PK");

  // Editions: a brief is an edition of a paper. The paper changes, and the
  // brief shows the changed passage and gives it to Copilot.
  await copyFile(new URL("./fixtures/mixed.docx", import.meta.url), join(folder, "docs", "Paper.docx"));
  await copyFile(new URL("./fixtures/mixed.docx", import.meta.url), join(folder, "docs", "Summary.docx"));
  const editPaper = async (from, to, head) => {
    host.openDocument("docs/Paper.docx");
    await shows(page, "Paper.docx");
    await until(() => host.status().canvas.ready, "the canvas shows Paper.docx");
    await page.evaluate(async ([find, text]) => {
      const { doc, refresh } = window.ternleafEditor;
      const [node, value] = JSON.parse(doc.searchableText()).find(([, paragraph]) => paragraph.includes(find));
      const start = new TextEncoder().encode(value.slice(0, value.indexOf(find))).length;
      await refresh(doc.replaceSelection(node, start, node, start + new TextEncoder().encode(find).length, text));
    }, [from, to]);
    await until(async () => (await state(page)).head === head, "the paper is at revision " + head);
    host.openDocument("docs/Summary.docx");
    await shows(page, "Summary.docx");
    await until(() => host.status().canvas.ready, "the canvas shows Summary.docx");
  };
  await editPaper("Second", "Another", 1);
  await page.locator("#ternleaf-panel [data-action=export-menu]").click();
  await page.getByRole("menuitem", { name: "Make this an edition of…" }).click();
  await page.locator("#ternleaf-select select").selectOption("docs/Paper.docx");
  await page.locator("#ternleaf-select").getByRole("button", { name: "Save" }).click();
  await page.getByText("Edition of docs/Paper.docx").waitFor();
  await page.getByText("The reference did not change since you last checked this edition.").waitFor();
  await editPaper("stays here", "stays for now", 2);
  await page.getByText("The reference changed in 1 passage since you last checked this edition.").waitFor();
  await until(() => host.status().edition?.changedPassages === 1, "the changed passage reaches the host");
  const reference = await act("ternleaf_reference_changes")(host, {});
  assert.deepEqual([reference.reference, reference.checkedRevision, reference.referenceRevision, reference.changes],
    ["docs/Paper.docx", 1, 2, [{ change: "changed", before: "Another paragraph stays here.", after: "Another paragraph stays for now." }]]);
  await page.getByText("Copilot read the changes of the reference document.").waitFor();
  await page.locator("#ternleaf-panel").getByRole("button", { name: "Mark as checked" }).click();
  await page.getByText("The reference did not change since you last checked this edition.").waitFor();
  await until(() => host.status().edition?.changedPassages === 0, "the checked edition reaches the host");
  assert.deepEqual(host.status().edition, { reference: "docs/Paper.docx", checked: 2, changedPassages: 0 });
  await close(page);

  console.log(JSON.stringify({ synchronousAdmissionMs: admission }));
  console.log("Browser selection review, saved draft, stale action rejection after reload, lost-response recovery, decline, discard, alternatives, author edit, document review, export, undo, retry, redo, project documents and Copilot's work from the chat passed.");
} finally {
  await browser.close();
  await host?.close();
}

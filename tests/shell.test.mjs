import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { ProjectStore } from "../packages/session/store.mjs";
import { forAgent, forAuthor } from "../packages/session/messages.mjs";
import { ProjectError, resolveProject } from "../apps/host/project.mjs";
import { wordCount, wordDiff } from "../apps/editor/diff.mjs";

const node = "000000000000000100000000000000b8";
const scope = { node, start: 0, end: 4, before: "KEEP", revision: 0, prompt: "Use sentence case", note: "" };

test("the agent can decline, and the author can discard open requests", () => {
  const db = new ProjectStore(":memory:");
  try {
    db.initialize(Buffer.from("immutable source"));
    const { lease } = db.claim();
    const declined = db.createReview(lease, "session-a", "font-a", scope);
    assert.throws(() => db.declineReview(lease, "session-b", declined.id, "No change"), /stale-agent-request/);
    assert.throws(() => db.declineReview(lease, "session-a", declined.id, " "), /invalid-rationale/);
    db.declineReview(lease, "session-a", declined.id, "The passage is correct.");
    assert.deepEqual([db.reviewState(lease).draft.declined, db.reviewState(lease).draft.rationale],
      [true, "The passage is correct."]);
    assert.throws(() => db.submitReview(lease, "session-a", declined.id, "Keep"), /proposal-already-submitted/);

    const proposed = db.createReview(lease, "session-a", "font-a", scope);
    assert.throws(() => db.submitReview(lease, "session-a", proposed.id, "Keep", "x".repeat(601)), /invalid-rationale/);
    db.submitReview(lease, "session-a", proposed.id, "Keep", "Sentence case.");
    assert.equal(db.reviewState(lease).draft.rationale, "Sentence case.");
    assert.throws(() => db.declineReview(lease, "session-a", proposed.id, "Late"), /proposal-already-submitted/);

    assert.equal(db.discardReviews(lease), 2);
    assert.equal(db.reviewState(lease).draft, null);
    assert.throws(() => db.submitReview(lease, "session-a", proposed.id, "Keep"), /unknown-review/);
    assert.deepEqual(db.acceptedReviews(lease), []);
  } finally { db.close(); }
});

test("the author can choose an alternative or edit a proposal before acceptance", () => {
  const db = new ProjectStore(":memory:");
  try {
    db.initialize(Buffer.from("immutable source"));
    const { lease } = db.claim();
    const draft = db.createReview(lease, "session-a", "font-a", scope);
    assert.throws(() => db.reviseReview(lease, draft.id, "Keep"), /review-closed/);
    assert.throws(() => db.submitReview(lease, "session-a", draft.id, "Keep", undefined, ["a", "b", "c"]), /invalid-replacement/);
    assert.throws(() => db.submitReview(lease, "session-a", draft.id, "Keep", undefined, ["KEEP"]), /invalid-replacement/);
    db.submitReview(lease, "session-a", draft.id, "Keep", "Sentence case.", ["keep", "Keep"]);
    assert.deepEqual(db.reviewState(lease).draft.alternatives, ["Keep", "keep"]);
    db.reviseReview(lease, draft.id, "keep");
    assert.equal(db.reviewState(lease).draft.replacement, "keep");
    assert.throws(() => db.reviseReview(lease, draft.id, "KEEP"), /invalid-replacement/);
    assert.throws(() => db.reviseReview(lease, draft.id, "two\tcolumns"), /invalid-replacement/);
    const start = { node, offset: 0 };
    const forward = [{ DeleteText: { range: { start, end: { node, offset: 4 } } } }, { InsertText: { at: start, text: "keep" } }];
    const frame = { base: 0, revision: 1, forward, inverse: ["engine inverse"] };
    const accept = replacementFrame => ({ id: draft.id, fingerprint: "f", expected: 0, command: { kind: "edit" },
      frame: replacementFrame, editorial: { target: node, note: "" }, reviewId: draft.id });
    const other = [{ DeleteText: forward[0].DeleteText }, { InsertText: { at: start, text: "Keep" } }];
    assert.throws(() => db.publish(lease, accept({ ...frame, forward: other }), undefined, "font-a"), /review-frame-mismatch/);
    assert.equal(db.publish(lease, accept(frame), undefined, "font-a").record.revision, 1);
    assert.throws(() => db.reviseReview(lease, draft.id, "Keep"), /review-closed/);
  } finally { db.close(); }
});

test("whole-document suggestions become ordinary reviews when the author opens them", () => {
  const db = new ProjectStore(":memory:");
  try {
    db.initialize(Buffer.from("immutable source"));
    const { lease } = db.claim();
    assert.throws(() => db.createBatch(lease, "session-a", { revision: 1, prompt: "Proofread" }), /stale-revision/);
    const { id } = db.createBatch(lease, "session-a", { revision: 0, prompt: "Proofread" });
    assert.throws(() => db.submitSuggestions(lease, "session-b", id, []), /stale-agent-request/);
    assert.throws(() => db.submitSuggestions(lease, "session-a", id, []), /invalid-suggestions/);
    assert.throws(() => db.submitSuggestions(lease, "session-a", id, [{ node, find: "KEEP", replacement: "KEEP" }]), /invalid-suggestions/);
    db.submitSuggestions(lease, "session-a", id, [
      { node, find: "KEEP", replacement: "Keep", rationale: "Sentence case." },
      { node, find: "omega", replacement: "Omega" },
    ]);
    assert.throws(() => db.declineBatch(lease, "session-a", id, "Late"), /proposal-already-submitted/);
    const [first, second] = db.batchState(lease).suggestions;
    assert.deepEqual([first.state, first.rationale, second.rationale], ["open", "Sentence case.", null]);
    db.setSuggestionState(lease, second.id, "skipped");
    const passage = { node, start: 0, end: 4, before: "KEEP", revision: 0, note: "" };
    assert.throws(() => db.adoptSuggestion(lease, "session-a", "font-a", first.id, { ...passage, before: "KEEQ" }), /invalid-selection/);
    const adopted = db.adoptSuggestion(lease, "session-a", "font-a", first.id, passage);
    const draft = db.reviewState(lease).draft;
    assert.deepEqual([draft.id, draft.replacement, draft.prompt, draft.suggestion, draft.rationale],
      [adopted.id, "Keep", "Proofread", first.id, "Sentence case."]);
    const start = { node, offset: 1 };
    const forward = [{ DeleteText: { range: { start, end: { node, offset: 4 } } } }, { InsertText: { at: start, text: "eep" } }];
    db.publish(lease, { id: draft.id, fingerprint: "f", expected: 0, command: { kind: "edit" },
      frame: { base: 0, revision: 1, forward, inverse: ["engine inverse"] }, editorial: { target: node, note: "" },
      reviewId: draft.id }, undefined, "font-a");
    assert.deepEqual(db.batchState(lease).suggestions.map(item => item.state), ["accepted", "skipped"]);
    assert.throws(() => db.adoptSuggestion(lease, "session-a", "font-a", first.id, passage), /unknown-review/);
    assert.throws(() => db.setSuggestionState(lease, first.id, "open"), /unknown-review/);

    const declined = db.createBatch(lease, "session-a", { revision: 1, prompt: "Is the tone formal?" });
    assert.deepEqual(db.batchState(lease).suggestions, []);
    db.declineBatch(lease, "session-a", declined.id, "Answered in the chat.");
    assert.deepEqual([db.batchState(lease).batch.state, db.batchState(lease).batch.reason], ["declined", "Answered in the chat."]);
    db.discardBatch(lease);
    assert.equal(db.batchState(lease).batch, null);
  } finally { db.close(); }
});

test("a project written before the review columns existed still opens", () => {
  const folder = mkdtempSync(join(tmpdir(), "ternleaf-"));
  try {
    const path = join(folder, "old.sqlite");
    let db = new ProjectStore(path);
    db.initialize(Buffer.from("immutable source"));
    for (const column of ["rationale", "declined", "created", "alternatives", "suggestion"]) db.db.exec(`ALTER TABLE reviews DROP COLUMN ${column}`);
    db.db.prepare("INSERT INTO reviews VALUES (?, ?, NULL, ?, ?, NULL)").run("old", JSON.stringify({ id: "old", ...scope }), "Old", "");
    db.close();
    db = new ProjectStore(path);
    const { lease } = db.claim();
    assert.deepEqual([db.reviewState(lease).draft.declined, db.reviewState(lease).draft.rationale], [false, null]);
    db.close();
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

test("a canvas opens the configured document or a DOCX inside the project", () => {
  const project = mkdtempSync(join(tmpdir(), "ternleaf-"));
  const outside = mkdtempSync(join(tmpdir(), "ternleaf-"));
  try {
    for (const folder of [".ternleaf", "opendoc", "docs"]) mkdirSync(join(project, folder));
    writeFileSync(join(project, "docs/brief.docx"), "docx");
    writeFileSync(join(project, "docs/Two Page Brief.docx"), "docx");
    writeFileSync(join(project, "notes.txt"), "text");
    writeFileSync(join(outside, "secret.docx"), "docx");
    assert.throws(() => resolveProject({ project }), ProjectError);
    // Without a configuration, the project's own engine and example are used.
    mkdirSync(join(project, "engine/prebuilt/webapp"), { recursive: true });
    mkdirSync(join(project, "examples"));
    writeFileSync(join(project, "examples/welcome-to-ternleaf.docx"), "docx");
    const first = resolveProject({ project });
    assert.equal(first.engine, join(project, "opendoc"));
    assert.match(first.state, /[\\/]\.ternleaf[\\/]welcome-to-ternleaf-[a-f0-9]{10}\.sqlite$/);
    writeFileSync(join(project, ".ternleaf/canvas.json"),
      JSON.stringify({ source: "docs/brief.docx", state: ".ternleaf/brief.sqlite" }));
    const main = resolveProject({ project });
    assert.equal(main.state, join(project, ".ternleaf/brief.sqlite"));
    assert.equal(resolveProject({ project, document: "docs/brief.docx" }).state, main.state);
    const other = resolveProject({ project, workingDirectory: project, document: "docs/Two Page Brief.docx" });
    assert.match(other.state, /[\\/]\.ternleaf[\\/]Two-Page-Brief-[a-f0-9]{10}\.sqlite$/);
    assert.equal(resolveProject({ project, document: "docs/Two Page Brief.docx" }).state, other.state);
    for (const document of ["notes.txt", "docs/missing.docx", join(outside, "secret.docx"), "../" + outside.split(/[\\/]/).pop() + "/secret.docx", 7]) {
      assert.throws(() => resolveProject({ project, document }), ProjectError, String(document));
    }
  } finally {
    rmSync(project, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test("the review slip shows the words and letters that change", () => {
  const text = parts => parts.map(part => ({ same: "", del: "-", ins: "+" })[part.kind] + part.text);
  assert.deepEqual(text(wordDiff("Alpha KEEP omegaX", "Alpha KEEP omegaY")), ["Alpha KEEP omega", "-X", "+Y"]);
  assert.deepEqual(text(wordDiff("We recommend that the plan", "We recommend the plan")), ["We recommend ", "-that ", "the plan"]);
  assert.deepEqual(text(wordDiff("a cat", "a dog")), ["a ", "-cat", "+dog"]);
  for (const [before, after] of [["One two", "Two one"], ["x", "x y"], ["😀 a", "😃 a"]]) {
    const parts = wordDiff(before, after);
    assert.equal(parts.filter(part => part.kind !== "ins").map(part => part.text).join(""), before);
    assert.equal(parts.filter(part => part.kind !== "del").map(part => part.text).join(""), after);
  }
  assert.equal(wordCount("The committee's two-page brief, now."), 5);
});

test("each refusal has plain text for the author and an instruction for the agent", () => {
  assert.match(forAuthor("writer-active"), /another Ternleaf canvas/);
  assert.match(forAgent("invalid-replacement"), /ternleaf_decline/);
  assert.equal(forAuthor("unlisted-code"), "unlisted-code");
});

test("the store accepts only a frame that does exactly the reviewed change", async () => {
  const { frameDoesChange, reviewChange } = await import("../packages/session/review-change.mjs");
  const node = "a".repeat(32);
  const fresh = "b".repeat(32);
  const at = offset => ({ node, offset });
  const del = (start, end) => ({ DeleteText: { range: { start: at(start), end: at(end) } } });
  const ins = (offset, text, where = node) => ({ InsertText: { at: { node: where, offset }, text } });
  const format = (start, end) => ({ FormatText: { range: { start: at(start), end: at(end) }, delta: { bold: true } } });

  // Inside text of one formatting: a deletion and an insertion.
  const narrow = reviewChange({ before: "bold middle", replacement: "bold kernel", start: 12 });
  assert.deepEqual(narrow, { start: 17, end: 23, removed: "middle", inserted: "kernel" });
  assert(frameDoesChange([del(17, 23), ins(17, "kernel")], node, narrow));
  assert(!frameDoesChange([del(17, 23), ins(17, "kernal")], node, narrow));
  assert(!frameDoesChange([del(16, 23), ins(17, "kernel")], node, narrow));
  assert(!frameDoesChange([ins(17, "kernel")], node, narrow));
  assert(!frameDoesChange([del(17, 23), ins(17, "kernel"), del(0, 5)], node, narrow));

  // A wide change: the new text gets formatting, and only the new text.
  assert(frameDoesChange([del(17, 23), ins(17, "kernel"), format(17, 23)], node, narrow));
  assert(!frameDoesChange([del(17, 23), ins(17, "kernel"), format(0, 23)], node, narrow));
  assert(!frameDoesChange([del(17, 23), ins(17, "kernel"), { SetParagraphStyle: { node } }], node, narrow));

  // New paragraphs: text, a split, and text in the new paragraph.
  const wide = reviewChange({ before: "stays", replacement: "one\ntwo", start: 6 });
  const split = { SplitParagraph: { at: at(9), new_id: fresh, properties: null } };
  assert(frameDoesChange([del(6, 11), ins(6, "one"), split, ins(0, "two", fresh)], node, wide));
  assert(!frameDoesChange([del(6, 11), ins(6, "one"), ins(9, "two")], node, wide));
  assert(!frameDoesChange([del(6, 11), ins(6, "one"), split, ins(0, "two and more", fresh)], node, wide));
  assert(!frameDoesChange([del(6, 11), ins(6, "one"), { SplitParagraph: { at: at(8), new_id: fresh } }, ins(0, "two", fresh)], node, wide));

  // The removal of a whole paragraph: its text goes, and it joins the one before.
  const gone = reviewChange({ before: "A whole paragraph.", replacement: "", start: 0 });
  const join = (first, second) => ({ JoinParagraphs: { first, second, properties: null } });
  assert(frameDoesChange([del(0, 18), join(fresh, node)], node, gone));
  assert(!frameDoesChange([del(0, 18), join(node, fresh)], node, gone));
  assert(!frameDoesChange([del(0, 12), join(fresh, node)], node, gone));
  assert(!frameDoesChange([del(17, 23), join(fresh, node)], node, narrow));
  assert(!frameDoesChange([del(0, 18), join(fresh, node), join(fresh, "c".repeat(32))], node, gone));

  // Suggesting mode: one tracked deletion and one tracked insertion.
  const run = text => ({ type: "run", text });
  const revision = (kind, text) => ({ type: "revision", kind, inlines: [run(text)] });
  const tracked = inlines => [{ UpdateReviewState: { paragraphs: [{ node, inlines }], comments: null } }];
  assert(frameDoesChange(tracked([run("bold "), revision("insertion", "kernel"), revision("deletion", "middle")]), node, narrow));
  assert(!frameDoesChange(tracked([run("bold "), revision("insertion", "kernal"), revision("deletion", "middle")]), node, narrow));
  assert(!frameDoesChange(tracked([run("bold kernel")]), node, narrow));
  assert(!frameDoesChange([{ UpdateReviewState: { paragraphs: [{ node: fresh, inlines: [revision("insertion", "kernel"), revision("deletion", "middle")] }], comments: null } }], node, narrow));
  assert(!frameDoesChange(tracked([revision("insertion", "one\ntwo"), revision("deletion", "stays")]), node, wide));

  // The fill of a content control: the inlines again, with the new text in
  // the control, in the format that the engine writes (fillContentControl).
  const owner = reviewChange({ before: "Søren Kjær", replacement: "Mette Ørsted", start: 7 });
  const control = (text, properties = { bold: true }) => ({ type: "sdt", id: "c".repeat(32), properties: { controlKind: "plain_text", alias: "Owner" },
    inlines: [{ type: "run", id: "d".repeat(32), properties, text }] });
  const plain = text => ({ type: "run", id: "e".repeat(32), properties: {}, text });
  const inlines = (...list) => [{ SetInlines: { node, inlines: list } }];
  const before = inlines(plain("Owner: "), control("Søren Kjær"), plain(" is here."));
  assert(frameDoesChange(inlines(plain("Owner: "), control("Mette Ørsted"), plain(" is here.")), node, owner, before));
  assert(!frameDoesChange(inlines(plain("Owner: "), control("Mette Ørsted"), plain(" is here.")), node, owner), "the inverse is needed");
  assert(!frameDoesChange(inlines(plain("Owner: "), control("Mette Hansen"), plain(" is here.")), node, owner, before));
  assert(!frameDoesChange(inlines(plain("Owner: "), control("Mette Ørsted", {}), plain(" is here.")), node, owner, before), "the formatting stays");
  assert(!frameDoesChange(inlines(plain("Ejer: "), control("Mette Ørsted"), plain(" is here.")), node, owner, before), "nothing else changes");
  assert(!frameDoesChange(inlines(plain("Owner: "), control("Mette Ørsted"), plain(" is here.")), fresh, owner, before));
  const shifted = reviewChange({ before: "Søren Kjær", replacement: "Mette Ørsted", start: 6 });
  assert(!frameDoesChange(inlines(plain("Owner: "), control("Mette Ørsted"), plain(" is here.")), node, shifted, before), "the change is at the control");
  const part = reviewChange({ before: "Søren Kjær", replacement: "Søren Hansen", start: 7 });
  assert(frameDoesChange(inlines(plain("Owner: "), control("Søren Hansen"), plain(" is here.")), node, part, before));
  const empty = reviewChange({ before: "Søren Kjær", replacement: "", start: 7 });
  assert(!frameDoesChange(inlines(plain("Owner: "), control(""), plain(" is here.")), node, empty, before));
});

test("the changes of a copy from Word become suggestions with a find text that occurs once", async () => {
  const { exportedRevision, suggestionsFromComparison } = await import("../apps/editor/merge.mjs");
  assert.deepEqual(["brief-r12.docx", "Brief-r0 (1).docx", "brief.docx", "r3.docx"].map(exportedRevision), [12, 0, null, null]);
  const text = { a: "The plan is the plan that we made. Größe matters.", b: "One two three.", c: "x" };
  const at = (node, start, end, rightText) => ({ family: "text", left: { node, start, end }, ...(rightText === undefined ? {} : { rightText }) });
  const { suggestions, other } = suggestionsFromComparison([
    at("a", 12, 15, "our"),                      // The second "the": a window of one word is not enough.
    at("a", 35, 42, "Size"),                     // "Größe": the offsets are bytes.
    at("b", 4, 8),                               // A deletion of "two ".
    at("c", 0, 0, "y"),                          // An insertion with no text around it to find.
    at("gone", 0, 3, "abc"),
    { family: "block", kind: "insertion", right: { node: "n" }, rightText: "A new paragraph." },
    { family: "metadata", kind: "property" },
  ], node => text[node] ?? null);
  assert.deepEqual(suggestions, [
    { node: "a", find: "the plan that we made. Größe", replacement: "our plan that we made. Size" },
    { node: "b", find: "two ", replacement: "" }, { node: "c", find: "x", replacement: "yx" }]);
  assert.equal(other, 2);
  for (const { node, find } of suggestions) assert.equal(text[node].split(find).length, 2);
});

test("new and removed paragraphs of a copy from Word become suggestions on the paragraphs of the base", async () => {
  const { suggestionsFromComparison } = await import("../apps/editor/merge.mjs");
  // The shapes are those of the engine's comparison. An added paragraph has
  // only its place in the copy, and the copy's IDs are not the base's.
  const text = { a: "First paragraph here.", b: "Second paragraph, and the second part.", c: "Third paragraph.", d: "Fourth paragraph." };
  const blocks = ["a", "b", "c", null, "d"];
  const block = index => [{ kind: "block", index }];
  const inserted = (index, rightText) => ({ family: "block", kind: "insertion", left: null, right: { path: block(index), node: "x" }, rightText });
  const deleted = (node, index) => ({ family: "block", kind: "deletion", left: { path: block(index), node }, right: null, leftText: text[node] });
  // The copy: new before a, a, b with a change and two new paragraphs after
  // it, the table, d. c is removed.
  const comparison = { left: { blocks: 5 }, right: { blocks: 7 }, changes: [
    inserted(0, "Before all."),
    { family: "text", left: { path: block(1), node: "b", start: 0, end: 6 }, right: {}, rightText: "Other" },
    inserted(3, "New one."), inserted(4, "New two."),
    deleted("c", 2),
    { family: "section", kind: "property" }] };
  const { suggestions, other } = suggestionsFromComparison(comparison, node => text[node] ?? null, blocks);
  assert.deepEqual(suggestions, [
    { node: "b", find: "Second paragraph, and the second part.", replacement: "Other paragraph, and the second part.\nNew one.\nNew two." },
    { node: "c", find: "Third paragraph.", replacement: "" }]);
  assert.equal(other, 1, "the paragraph before the first one is counted");
  // The first paragraph, a paragraph after a table and a paragraph that is
  // now the first one cannot be merged.
  const first = suggestionsFromComparison({ left: { blocks: 5 }, right: { blocks: 4 }, changes: [
    inserted(0, "Instead of a."), deleted("a", 0), deleted("d", 4)] }, node => text[node] ?? null, blocks);
  assert.deepEqual(first, { suggestions: [], other: 3 });
  // Only added paragraphs: the find text is the last word, widened until it
  // occurs once.
  const after = suggestionsFromComparison({ left: { blocks: 5 }, right: { blocks: 6 }, changes: [inserted(2, "After b.")] },
    node => ({ ...text, b: "Part two. Part two." })[node] ?? null, blocks);
  assert.deepEqual(after.suggestions, [{ node: "b", find: "two. Part two.", replacement: "two. Part two.\nAfter b." }]);
  // When the counts of blocks do not agree, an added paragraph is counted.
  assert.deepEqual(suggestionsFromComparison({ left: { blocks: 5 }, right: { blocks: 9 }, changes: [inserted(2, "After b.")] },
    node => text[node] ?? null, blocks), { suggestions: [], other: 1 });
});

test("a Word export names its history, and paragraphs are paired across a save", async () => {
  const { exportedName, pairParagraphs } = await import("../apps/editor/merge.mjs");
  assert.deepEqual(["brief-r12-0a1b2c3d4e.docx", "Brief-r0-0A1B2C3D4E (1).docx", "brief-r3.docx", "brief.docx"].map(exportedName), [
    { revision: 12, history: "0a1b2c3d4e" }, { revision: 0, history: "0a1b2c3d4e" }, { revision: 3, history: null }, { revision: null, history: null }]);
  // The end of one history and the start of the next have the same text
  // and new IDs. A paragraph removed in the middle history has no pair.
  const ids = pairParagraphs([
    [[["a", "One."], ["b", "Two."]], [["c", "One."], ["d", "Two."]]],
    [[["c", "One."], ["x", "New."]], [["e", "One."], ["f", "New."]]]]);
  assert.deepEqual([...ids], [["a", "e"]]);
  assert.equal(pairParagraphs([[[["a", "One."]], [["c", "Changed on disk."]]]]), null);
});

test("passages that the author did not check before a save of the reference come back with the later changes", async () => {
  const { combinePassages } = await import("../apps/editor/edition.mjs");
  const carried = [{ change: "changed", before: "A.", after: "B." }, { change: "added", after: "New." }, { change: "changed", before: "X.", after: "Y." }];
  assert.deepEqual(combinePassages(carried, [
    { change: "changed", before: "B.", after: "C." },   // One change from the first text to the last.
    { change: "removed", before: "New." },              // Added, then removed: no change.
    { change: "changed", before: "Y.", after: "X." },   // Back to the first text: no change.
    { change: "changed", before: "P.", after: "Q." }]), [
    { change: "changed", before: "A.", after: "C." }, { change: "changed", before: "P.", after: "Q." }]);
  assert.deepEqual(combinePassages(undefined, [{ change: "added", after: "N." }]), [{ change: "added", after: "N." }]);
});

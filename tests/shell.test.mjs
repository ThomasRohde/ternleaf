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
    assert.throws(() => db.reviseReview(lease, draft.id, "two\nlines"), /invalid-replacement/);
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

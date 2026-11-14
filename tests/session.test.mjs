import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { ProjectStore } from "../packages/session/store.mjs";
import { lossInWords, validateDocxExport } from "../apps/editor/export-policy.mjs";
import { reviewChange } from "../packages/session/review-change.mjs";

const source = Buffer.from("immutable source");
const editorial = { target: "000000000000000100000000000000b8", note: "Keep the recommendation explicit." };
const frame = revision => ({ base: revision - 1, revision, forward: ["engine edit"], inverse: ["engine inverse"] });

test("DOCX export refuses omitted source constructs and permits reported bookkeeping", () => {
  const entry = (feature, retentionOutcome) => ({ feature, retentionOutcome });
  const report = entries => JSON.stringify({ entries });
  assert.equal(validateDocxExport(report([entry("docx.rsid", "not_retained")])).length, 1);
  assert.throws(() => validateDocxExport(report([
    entry("docx.export.stale.styles_with_effects", "not_retained"),
  ])), /would lose unsupported source data/);
  assert.throws(() => validateDocxExport(report([entry("unknown-property", "not_retained")])),
    /unknown-property/);
  // The author can accept a known, small loss. Nothing else can be accepted.
  const legacy = "docx.export.stale.styles_with_effects";
  assert.equal(validateDocxExport(report([entry(legacy, "not_retained")]), new Set([legacy])).length, 1);
  assert.throws(() => validateDocxExport(report([entry("unknown-property", "not_retained")]),
    new Set(["unknown-property"])), error => error.decidable === false);
  assert.throws(() => validateDocxExport(report([entry(legacy, "not_retained")])), error => error.decidable === true);
});

function request(id, expected, command, extra = {}) {
  return { id, fingerprint: JSON.stringify({ expected, command, extra }), expected, command,
    frame: frame(expected + 1), ...extra };
}

test("scoped reviews fence old renderers and bind acceptance to persisted dependencies", () => {
  const db = new ProjectStore(":memory:");
  const other = new ProjectStore(":memory:");
  try {
    db.initialize(source);
    other.initialize(source);
    assert.notEqual(other.documentId(), db.documentId());
    const { lease } = db.claim();
    const scope = { node: editorial.target, start: 0, end: 4, before: "KEEP", revision: 0,
      prompt: "Use sentence case", note: editorial.note };
    const draft = db.createReview(lease, "session-a", "font-a", scope);
    assert.throws(() => db.actionReview(lease, "session-b", draft.id), /stale-agent-request/);
    assert.throws(() => other.actionReview(other.claim().lease, "session-a", draft.id), /unknown-review/);
    db.submitReview(lease, "session-a", draft.id, "Keep");
    db.submitReview(lease, "session-a", draft.id, "Keep");
    assert.throws(() => db.submitReview(lease, "session-a", draft.id, "Replace"), /already-submitted/);
    const current = db.claim(lease).lease;
    db.release(lease);
    assert.throws(() => db.actionReview(current, "session-a", draft.id), /stale-agent-request/);
    assert.equal(db.reviewState(current).draft.replacement, "Keep");
    const start = { node: scope.node, offset: scope.start + 1 };
    const end = { node: scope.node, offset: scope.end };
    const forward = [{ DeleteText: { range: { start, end } } }, { InsertText: { at: start, text: "eep" } }];
    const acceptance = request(draft.id, 0, { kind: "edit" },
      { reviewId: draft.id, editorial, frame: { ...frame(1), forward } });
    assert.throws(() => db.publish(current, acceptance, undefined, "font-b"), /stale-review/);
    assert.throws(() => db.publish(current, { ...acceptance, editorial: { ...editorial, note: "Other" } },
      undefined, "font-a"), /review-frame-mismatch/);
    assert.equal(db.reviewState(current).draft.accepted, null);
    assert.throws(() => db.publish(current, acceptance, () => { throw new Error("interrupted"); }, "font-a"), /interrupted/);
    assert.equal(db.project().head, 0);
    assert.equal(db.reviewState(current).draft.accepted, null);
    const saved = db.publish(current, acceptance, undefined, "font-a");
    db.publish(current, request("undo", 1, { kind: "undo", target: 1 }));
    assert.deepEqual(db.retryReview(current, draft.id), { record: saved.record, duplicate: true });
    assert.equal(db.project().head, 2);
    assert.equal(db.project().editorial, "null");
  } finally {
    db.close();
    other.close();
  }
});

test("review changes preserve shared text and count Unicode offsets in UTF-8 bytes", () => {
  assert.deepEqual(reviewChange({ before: "📄 KEEP x", replacement: "📄 Retain x", start: 12 }),
    { start: 17, end: 21, removed: "KEEP", inserted: "Retain" });
  assert.deepEqual(reviewChange({ before: "A📄", replacement: "A📃", start: 0 }),
    { start: 1, end: 5, removed: "📄", inserted: "📃" });
});

test("head, independently authored editorial delta and receipt recover across process termination and undo", () => {
  const dir = mkdtempSync(join(tmpdir(), "ternleaf-"));
  const file = join(dir, "project.sqlite");
  let now = 0;
  const open = () => new ProjectStore(file, { now: () => now, leaseMs: 100 });
  try {
    let store = open();
    store.initialize(source);
    let { lease } = store.claim();
    assert.throws(() => store.claim(), /writer-active/);
    const operation = request("proposal-7", 0, { kind: "edit" }, { editorial });
    store.close();

    const worker = `
      import { ProjectStore } from ${JSON.stringify(new URL("../packages/session/store.mjs", import.meta.url).href)};
      const db = new ProjectStore(process.argv[1], { now: () => 0, leaseMs: 100 });
      const lease = JSON.parse(process.argv[2]);
      const request = JSON.parse(process.argv[3]);
      const before = process.argv[4] === "before";
      db.publish(lease, request, before ? () => process.exit(7) : undefined);
      process.exit(8);
    `;
    const stop = stage => spawnSync(process.execPath, ["--input-type=module", "-e", worker,
      file, JSON.stringify(lease), JSON.stringify(operation), stage], { encoding: "utf8" });
    assert.equal(stop("before").status, 7);
    store = open();
    assert.deepEqual(store.journal(), []);
    assert.equal(store.project().head, 0);
    assert.equal(store.project().editorial, "null");
    store.close();

    assert.equal(stop("after").status, 8);
    store = open();
    assert.deepEqual(JSON.parse(store.project().editorial), editorial);
    assert.equal(store.project().head, 1);
    const committed = store.receipt(lease, operation.id, operation.fingerprint);
    assert.deepEqual(committed.editorial, { before: null, after: editorial });
    assert.deepEqual(store.publish(lease, operation), { record: committed, duplicate: true });
    store.publish(lease, request("undo-7", 1, { kind: "undo", target: 1 }));
    assert.equal(store.project().editorial, "null");
    store.close();

    now = 101;
    store = open();
    const restarted = store.claim();
    assert.equal(restarted.head, 2);
    assert.throws(() => store.publish(lease, operation), /writer-fenced/);
    lease = restarted.lease;
    assert.deepEqual(store.publish(lease, operation), { record: committed, duplicate: true });
    assert.equal(store.project().head, 2);
    assert.equal(store.project().editorial, "null");
    store.publish(lease, request("redo-7", 2, { kind: "redo", target: 1 }));
    assert.deepEqual(JSON.parse(store.project().editorial), editorial);
    assert.throws(() => store.publish(lease, { ...operation, fingerprint: "different" }), /operation-id-collision/);
    assert.throws(() => store.publish(lease, request("stale", 0, { kind: "edit" })), /stale-revision/);
    assert.equal(store.project().head, 3);
    store.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a refused export names the lost features in words", () => {
  assert.equal(lossInWords(["annotationRef", "pStyle", "rStyle"]), "parts of the Word comments (the comment marks and the comment styles)");
  assert.equal(lossInWords(["fldChar", "instrText"]), "a table of contents or another field that spans paragraphs");
  assert.equal(lossInWords(["annotationRef", "rStyle", "fldChar", "w14:glow"]),
    "parts of the Word comments (the comment marks and the comment styles), a table of contents or another field that spans paragraphs and other content that the engine does not keep (w14:glow)");
  assert.equal(lossInWords(["pStyle"]), "other content that the engine does not keep (pStyle)");
});

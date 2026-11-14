import { DatabaseSync } from "node:sqlite";
import { createHash, randomUUID } from "node:crypto";
import { frameDoesChange, reviewChange } from "./review-change.mjs";

export class Rejected extends Error {
  // `detail` is one plain sentence for the reader of the refusal, for example
  // the number of pages when a page number is out of range.
  constructor(code, detail) {
    super(code);
    this.code = code;
    if (detail) this.detail = detail;
  }
}

const parse = JSON.parse;
const encode = JSON.stringify;
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const same = (a, b) => encode(a) === encode(b);

function requireThat(condition, code) {
  if (!condition) throw new Rejected(code);
}

const validReplacement = (text, before) => typeof text === "string" && text.length <= 4000
  && text !== before && !/[\r\t\uFFFC]/.test(text) && text.split("\n").length <= 31;

function normalizeMetadata(value) {
  if (value === null) return null;
  requireThat(value && typeof value.target === "string" && /^[a-f0-9]{32}$/.test(value.target)
    && typeof value.note === "string" && value.note.length <= 2000, "invalid-editorial-record");
  return { target: value.target, note: value.note };
}

export class ProjectStore {
  constructor(path, { now = Date.now, leaseMs = 30_000 } = {}) {
    this.db = new DatabaseSync(path);
    this.now = now;
    this.leaseMs = leaseMs;
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = FULL;
      PRAGMA busy_timeout = 5000;
      CREATE TABLE IF NOT EXISTS project (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        source BLOB NOT NULL, source_hash TEXT NOT NULL, head INTEGER NOT NULL,
        editorial TEXT NOT NULL, fence INTEGER NOT NULL, owner TEXT, expires INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS commits (
        revision INTEGER PRIMARY KEY, id TEXT NOT NULL UNIQUE, fingerprint TEXT NOT NULL,
        record TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS document_identity (id INTEGER PRIMARY KEY CHECK(id = 1), uuid TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY, scope TEXT NOT NULL, replacement TEXT, prompt TEXT NOT NULL,
        note TEXT NOT NULL, accepted INTEGER
      );
      CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY, session TEXT NOT NULL, fence INTEGER NOT NULL, revision INTEGER NOT NULL,
        prompt TEXT NOT NULL, state TEXT NOT NULL, reason TEXT, created INTEGER
      );
      CREATE TABLE IF NOT EXISTS suggestions (
        id TEXT PRIMARY KEY, batch TEXT NOT NULL, position INTEGER NOT NULL, node TEXT NOT NULL,
        find TEXT NOT NULL, replacement TEXT NOT NULL, rationale TEXT, state TEXT NOT NULL
      );
    `);
    // Columns added after the first projects were written. Each is nullable so
    // an older project opens without a rewrite.
    const columns = new Set(this.db.prepare("PRAGMA table_info(reviews)").all().map(column => column.name));
    for (const [name, type] of [["rationale", "TEXT"], ["declined", "INTEGER"], ["created", "INTEGER"],
      ["alternatives", "TEXT"], ["suggestion", "TEXT"]]) {
      if (!columns.has(name)) this.db.exec(`ALTER TABLE reviews ADD COLUMN ${name} ${type}`);
    }
    if (!this.db.prepare("PRAGMA table_info(batches)").all().some(column => column.name === "origin")) {
      this.db.exec("ALTER TABLE batches ADD COLUMN origin TEXT");
    }
    // A suggestion of the kind "remark" points at text and says something
    // about it. It has no replacement.
    if (!this.db.prepare("PRAGMA table_info(suggestions)").all().some(column => column.name === "kind")) {
      this.db.exec("ALTER TABLE suggestions ADD COLUMN kind TEXT");
    }
  }

  close() { this.db.close(); }

  write(callback) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = callback();
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  initialize(source) {
    requireThat(source.byteLength > 0, "missing-source");
    this.db.prepare("INSERT OR IGNORE INTO project VALUES (1, ?, ?, 0, 'null', 0, NULL, 0)")
      .run(source, digest(source));
    requireThat(this.project().source_hash === digest(source), "source-already-set");
    this.db.prepare("INSERT OR IGNORE INTO document_identity VALUES (1, ?)").run(randomUUID());
  }

  project() {
    const project = this.db.prepare("SELECT * FROM project WHERE id = 1").get();
    requireThat(project, "project-uninitialized");
    return project;
  }

  claim(previous) {
    return this.write(() => {
      const project = this.project();
      requireThat(!project.owner || project.expires <= this.now()
        || (previous?.owner === project.owner && previous?.fence === project.fence), "writer-active");
      const lease = { owner: randomUUID(), fence: project.fence + 1 };
      this.db.prepare("UPDATE project SET owner = ?, fence = ?, expires = ? WHERE id = 1")
        .run(lease.owner, lease.fence, this.now() + this.leaseMs);
      return { lease, head: project.head, sourceHash: project.source_hash,
        editorial: parse(project.editorial), journal: this.journal() };
    });
  }

  checkLease(lease, project = this.project()) {
    requireThat(lease && lease.owner === project.owner && lease.fence === project.fence
      && project.expires > this.now(), "writer-fenced");
  }

  renew(lease) {
    return this.write(() => {
      this.checkLease(lease);
      this.db.prepare("UPDATE project SET expires = ? WHERE id = 1").run(this.now() + this.leaseMs);
    });
  }

  release(lease) {
    this.db.prepare("UPDATE project SET owner = NULL, expires = 0 WHERE id = 1 AND owner = ? AND fence = ?")
      .run(lease.owner, lease.fence);
  }

  journal() {
    return this.db.prepare("SELECT record FROM commits ORDER BY revision").all().map(row => parse(row.record));
  }

  documentId() {
    return this.db.prepare("SELECT uuid FROM document_identity WHERE id = 1").get().uuid;
  }

  review(id) {
    const row = this.db.prepare("SELECT * FROM reviews WHERE id = ?").get(id);
    requireThat(row, "unknown-review");
    return { ...parse(row.scope), replacement: row.replacement, prompt: row.prompt,
      note: row.note, accepted: row.accepted, rationale: row.rationale ?? null,
      declined: Boolean(row.declined), created: row.created ?? null,
      alternatives: row.alternatives ? parse(row.alternatives) : null, suggestion: row.suggestion ?? null };
  }

  reviewState(lease) {
    this.checkLease(lease);
    const latest = this.db.prepare("SELECT id FROM reviews WHERE accepted IS NULL ORDER BY rowid DESC LIMIT 1").get();
    const accepted = this.db.prepare("SELECT id FROM reviews WHERE accepted IS NOT NULL ORDER BY accepted DESC LIMIT 1").get();
    return { draft: latest ? this.review(latest.id) : null, accepted: accepted?.id ?? null };
  }

  // `origin` is "chat" when the request came from the Copilot chat and not
  // from the canvas. The editor shows where a request came from.
  createReview(lease, session, fontHash, { node, start, end, before, revision, prompt, note, origin }) {
    return this.write(() => {
      const project = this.project();
      this.checkLease(lease, project);
      requireThat(revision === project.head, "stale-revision");
      requireThat(typeof node === "string" && /^[a-f0-9]{32}$/.test(node)
        && Number.isSafeInteger(start) && start >= 0 && Number.isSafeInteger(end) && end > start
        && typeof before === "string" && before.length > 0 && before.length <= 4000
        && Buffer.byteLength(before) === end - start && !/[\r\n\t\uFFFC]/.test(before)
        && typeof prompt === "string" && prompt.trim() && prompt.length <= 2000
        && typeof note === "string" && note.length <= 2000, "invalid-selection-or-instructions");
      const scope = { id: randomUUID(), session, fence: lease.fence, documentId: this.documentId(),
        sourceHash: project.source_hash, fontHash, revision, node, start, end, before,
        ...(origin === "chat" ? { origin } : {}) };
      this.db.prepare("INSERT INTO reviews (id, scope, replacement, prompt, note, accepted, created) VALUES (?, ?, NULL, ?, ?, NULL, ?)")
        .run(scope.id, encode(scope), prompt, note, this.now());
      return scope;
    });
  }

  // A proposal that starts in the Copilot chat: the request and its answer
  // arrive together. Both are saved, or neither.
  createAnsweredReview(lease, session, fontHash, scope, replacement, rationale, alternatives = []) {
    const created = this.createReview(lease, session, fontHash, { ...scope, origin: "chat" });
    try { this.submitReview(lease, session, created.id, replacement, rationale, alternatives); }
    catch (error) {
      this.db.prepare("DELETE FROM reviews WHERE id = ? AND accepted IS NULL").run(created.id);
      throw error;
    }
    return created;
  }

  actionReview(lease, session, id) {
    const project = this.project();
    this.checkLease(lease, project);
    requireThat(typeof id === "string", "unknown-review");
    const draft = this.review(id);
    const current = this.reviewState(lease).draft;
    requireThat(current?.id === id && draft.session === session && draft.fence === lease.fence
      && draft.documentId === this.documentId() && draft.sourceHash === project.source_hash
      && draft.revision === project.head, "stale-agent-request");
    return draft;
  }

  submitReview(lease, session, id, replacement, rationale, alternatives = []) {
    return this.write(() => {
      const draft = this.actionReview(lease, session, id);
      requireThat(!draft.declined, "proposal-already-submitted");
      requireThat(validReplacement(replacement, draft.before), "invalid-replacement");
      requireThat(Array.isArray(alternatives) && alternatives.length <= 2
        && alternatives.every(text => validReplacement(text, draft.before)), "invalid-replacement");
      requireThat(rationale === undefined || (typeof rationale === "string" && rationale.length <= 600), "invalid-rationale");
      requireThat(draft.replacement === null || draft.replacement === replacement, "proposal-already-submitted");
      const options = [...new Set([replacement, ...alternatives])];
      this.db.prepare("UPDATE reviews SET replacement = ?, rationale = COALESCE(?, rationale), alternatives = COALESCE(alternatives, ?) WHERE id = ?")
        .run(replacement, rationale?.trim() || null, options.length > 1 ? encode(options) : null, id);
    });
  }

  // The author picks another option or edits the proposed text. Acceptance
  // still goes through publish, which checks the engine frame against the
  // text saved here.
  reviseReview(lease, id, replacement) {
    return this.write(() => {
      this.checkLease(lease);
      const draft = this.review(id);
      requireThat(draft.accepted === null && draft.replacement !== null, "review-closed");
      requireThat(validReplacement(replacement, draft.before), "invalid-replacement");
      this.db.prepare("UPDATE reviews SET replacement = ? WHERE id = ?").run(replacement, id);
    });
  }

  // The agent may answer that the passage needs no change. The reason is shown
  // to the author. A declined request cannot later receive a proposal.
  declineReview(lease, session, id, reason) {
    return this.write(() => {
      const draft = this.actionReview(lease, session, id);
      requireThat(draft.replacement === null, "proposal-already-submitted");
      requireThat(typeof reason === "string" && reason.trim() && reason.length <= 600, "invalid-rationale");
      this.db.prepare("UPDATE reviews SET declined = 1, rationale = ? WHERE id = ?").run(reason.trim(), id);
    });
  }

  // Close every request that was not accepted. Accepted reviews are history
  // and stay. Returns the number of closed requests.
  discardReviews(lease) {
    return this.write(() => {
      this.checkLease(lease);
      return Number(this.db.prepare("DELETE FROM reviews WHERE accepted IS NULL").run().changes);
    });
  }

  // ---- Whole-document review ------------------------------------------
  // The author shares the document text for one request. The agent answers
  // with suggestions. Each suggestion becomes an ordinary review when the
  // author opens it, so acceptance keeps every check of the review path.

  createBatch(lease, session, { revision, prompt, origin }) {
    return this.write(() => {
      const project = this.project();
      this.checkLease(lease, project);
      requireThat(revision === project.head, "stale-revision");
      requireThat(typeof prompt === "string" && prompt.trim() && prompt.length <= 2000, "invalid-selection-or-instructions");
      this.db.exec("DELETE FROM suggestions; DELETE FROM batches");
      const id = randomUUID();
      this.db.prepare("INSERT INTO batches (id, session, fence, revision, prompt, state, reason, created, origin) VALUES (?, ?, ?, ?, ?, 'waiting', NULL, ?, ?)")
        .run(id, session, lease.fence, revision, prompt, this.now(), origin === "chat" || origin === "word" ? origin : null);
      return { id };
    });
  }

  actionBatch(lease, session, id) {
    this.checkLease(lease);
    requireThat(typeof id === "string", "unknown-review");
    const batch = this.db.prepare("SELECT * FROM batches WHERE id = ?").get(id);
    requireThat(batch, "unknown-review");
    requireThat(batch.session === session && batch.fence === lease.fence, "stale-agent-request");
    return batch;
  }

  submitSuggestions(lease, session, id, list) {
    return this.write(() => {
      const batch = this.actionBatch(lease, session, id);
      requireThat(batch.state === "waiting", "proposal-already-submitted");
      requireThat(Array.isArray(list) && list.length > 0 && list.length <= 60 && list.every(item =>
        item && typeof item.node === "string" && /^[a-f0-9]{32}$/.test(item.node)
        && typeof item.find === "string" && item.find.length > 0 && !/[\r\n\t\uFFFC]/.test(item.find)
        && (typeof item.remark === "string"
          ? item.remark.trim().length > 0 && item.remark.length <= 600 && item.replacement === undefined
          : validReplacement(item.replacement, item.find))
        && (item.rationale === undefined || (typeof item.rationale === "string" && item.rationale.length <= 600))),
      "invalid-suggestions");
      const insert = this.db.prepare("INSERT INTO suggestions (id, batch, position, node, find, replacement, rationale, state, kind) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?)");
      list.forEach((item, position) => typeof item.remark === "string"
        ? insert.run(randomUUID(), id, position, item.node, item.find, "", item.remark.trim(), "remark")
        : insert.run(randomUUID(), id, position, item.node, item.find, item.replacement, item.rationale?.trim() || null, null));
      this.db.prepare("UPDATE batches SET state = 'answered' WHERE id = ?").run(id);
    });
  }

  declineBatch(lease, session, id, reason) {
    return this.write(() => {
      const batch = this.actionBatch(lease, session, id);
      requireThat(batch.state === "waiting", "proposal-already-submitted");
      requireThat(typeof reason === "string" && reason.trim() && reason.length <= 600, "invalid-rationale");
      this.db.prepare("UPDATE batches SET state = 'declined', reason = ? WHERE id = ?").run(reason.trim(), id);
    });
  }

  batchState(lease) {
    this.checkLease(lease);
    const batch = this.db.prepare("SELECT id, fence, revision, prompt, state, reason, created, origin FROM batches").get();
    if (!batch) return { batch: null, suggestions: [] };
    return { batch, suggestions: this.db.prepare(
      "SELECT id, node, find, replacement, rationale, state, kind FROM suggestions WHERE batch = ? ORDER BY position").all(batch.id) };
  }

  discardBatch(lease) {
    return this.write(() => {
      this.checkLease(lease);
      this.db.exec("DELETE FROM suggestions; DELETE FROM batches");
    });
  }

  setSuggestionState(lease, id, state) {
    this.checkLease(lease);
    requireThat(state === "open" || state === "skipped", "invalid-request");
    requireThat(this.db.prepare("UPDATE suggestions SET state = ? WHERE id = ? AND state != 'accepted'").run(state, id).changes,
      "unknown-review");
  }

  // Open one suggestion as a review at the current revision. The author
  // starts this, so it replaces any request that was not accepted.
  adoptSuggestion(lease, session, fontHash, id, { node, start, end, before, revision, note }) {
    return this.write(() => {
      const project = this.project();
      this.checkLease(lease, project);
      const suggestion = this.db.prepare("SELECT * FROM suggestions WHERE id = ?").get(id);
      requireThat(suggestion && suggestion.state !== "accepted" && suggestion.kind !== "remark", "unknown-review");
      requireThat(revision === project.head, "stale-revision");
      requireThat(node === suggestion.node && before === suggestion.find
        && Number.isSafeInteger(start) && start >= 0 && Number.isSafeInteger(end) && end > start
        && before.length <= 4000 && Buffer.byteLength(before) === end - start
        && typeof note === "string" && note.length <= 2000, "invalid-selection-or-instructions");
      const batch = this.db.prepare("SELECT prompt, origin FROM batches WHERE id = ?").get(suggestion.batch);
      const scope = { id: randomUUID(), session, fence: lease.fence, documentId: this.documentId(),
        sourceHash: project.source_hash, fontHash, revision, node, start, end, before,
        ...(batch?.origin ? { origin: batch.origin } : {}) };
      this.db.prepare("DELETE FROM reviews WHERE accepted IS NULL").run();
      this.db.prepare("INSERT INTO reviews (id, scope, replacement, prompt, note, accepted, created, rationale, suggestion) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?)")
        .run(scope.id, encode(scope), suggestion.replacement, batch?.prompt ?? "", note, this.now(), suggestion.rationale, id);
      if (suggestion.state !== "open") this.db.prepare("UPDATE suggestions SET state = 'open' WHERE id = ?").run(id);
      return scope;
    });
  }

  // The reviewed changes behind committed revisions, oldest first.
  acceptedReviews(lease) {
    this.checkLease(lease);
    return this.db.prepare("SELECT id FROM reviews WHERE accepted IS NOT NULL ORDER BY accepted").all()
      .map(({ id }) => {
        const { accepted, before, replacement, prompt, note, rationale, created, origin } = this.review(id);
        return { id, revision: accepted, before, replacement, prompt, note, rationale, created, ...(origin ? { origin } : {}) };
      });
  }

  saveNote(lease, id, note) {
    this.checkLease(lease);
    requireThat(typeof note === "string" && note.length <= 2000, "invalid-editorial-record");
    requireThat(this.db.prepare("UPDATE reviews SET note = ? WHERE id = ? AND accepted IS NULL").run(note, id).changes,
      "review-closed");
  }

  retryReview(lease, id) {
    const draft = this.review(id);
    requireThat(draft.accepted, "review-not-accepted");
    const { id: operation, fingerprint, expected } = this.db.prepare("SELECT id, fingerprint, revision - 1 AS expected FROM commits WHERE revision = ?")
      .get(draft.accepted);
    return this.publish(lease, { id: operation, fingerprint, expected });
  }

  receipt(lease, id, fingerprint) {
    this.checkLease(lease);
    const prior = this.db.prepare("SELECT * FROM commits WHERE id = ?").get(id);
    if (!prior) return null;
    requireThat(prior.fingerprint === fingerprint, "operation-id-collision");
    return parse(prior.record);
  }

  publish(lease, request, beforeCommit, fontHash) {
    return this.write(() => {
      const project = this.project();
      const { id, fingerprint, expected, command, frame, editorial, reviewId } = request;
      this.checkLease(lease, project);
      requireThat(typeof id === "string" && id.length > 0 && id.length <= 128
        && typeof fingerprint === "string" && fingerprint.length <= 8192, "invalid-request");
      const prior = this.receipt(lease, id, fingerprint);
      if (prior) return { record: prior, duplicate: true };
      requireThat(Number.isSafeInteger(expected) && expected === project.head, "stale-revision");
      requireThat(command && ["edit", "undo", "redo"].includes(command.kind)
        && frame && frame.base === expected && frame.revision === expected + 1
        && Array.isArray(frame.forward) && frame.forward.length > 0
        && Array.isArray(frame.inverse) && frame.inverse.length > 0, "invalid-engine-frame");

      if (reviewId !== undefined) {
        const draft = this.review(reviewId);
        requireThat(id === reviewId && draft.accepted === null && draft.replacement !== null
          && draft.documentId === this.documentId() && draft.sourceHash === project.source_hash
          && draft.fontHash === fontHash && draft.revision === expected, "stale-review");
        const change = reviewChange(draft);
        requireThat(command.kind === "edit" && frameDoesChange(frame.forward, draft.node, change)
          && editorial?.target === draft.node && editorial.note === draft.note, "review-frame-mismatch");
        this.db.prepare("UPDATE reviews SET accepted = ? WHERE id = ?").run(expected + 1, reviewId);
        if (draft.suggestion) {
          this.db.prepare("UPDATE suggestions SET state = 'accepted' WHERE id = ?").run(draft.suggestion);
        }
      }

      const previous = parse(project.editorial);
      let next = previous;
      if (command.kind === "edit" && editorial !== undefined) {
        next = normalizeMetadata(editorial);
      } else if (command.kind !== "edit") {
        const entry = this.db.prepare("SELECT record FROM commits WHERE revision = ?").get(command.target);
        requireThat(entry, "unknown-history-target");
        const original = parse(entry.record);
        requireThat(original.command.kind === "edit", "invalid-history-target");
        const undo = command.kind === "undo";
        requireThat(same(previous, undo ? original.editorial.after : original.editorial.before), "editorial-history-conflict");
        next = undo ? original.editorial.before : original.editorial.after;
      }

      const revision = expected + 1;
      const record = { id, fingerprint, revision, command, frame, editorial: { before: previous, after: next },
        at: this.now() };
      this.db.prepare("INSERT INTO commits VALUES (?, ?, ?, ?)").run(revision, id, fingerprint, encode(record));
      this.db.prepare("UPDATE project SET head = ?, editorial = ?, expires = ? WHERE id = 1")
        .run(revision, encode(next), this.now() + this.leaseMs);
      beforeCommit?.();
      return { record, duplicate: false };
    });
  }
}

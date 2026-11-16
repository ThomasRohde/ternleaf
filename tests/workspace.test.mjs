import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { ProjectError, createWorkspace } from "../apps/host/project.mjs";
import { startHost } from "../apps/host/serve.mjs";

const docx = text => Buffer.concat([Buffer.from([0x50, 0x4b, 3, 4]), Buffer.from(text)]);

test("personal fonts apply across projects and project overrides remain local", () => {
  const personal = realpathSync(mkdtempSync(join(tmpdir(), "ternleaf-fonts-")));
  const first = project();
  const second = project();
  const directory = join(personal, "ternleaf");
  const file = join(directory, "fonts.json");
  try {
    const a = createWorkspace({ project: first, copilotHome: personal });
    const b = createWorkspace({ project: second, copilotHome: personal });
    assert.equal(a.resolve().fonts, undefined);
    mkdirSync(directory);
    const paths = [join(directory, "Bank-Regular.ttf"), join(directory, "Bank-Bold.ttf")];
    writeFileSync(file, "\uFEFF" + JSON.stringify({ fonts: ["Bank-Regular.ttf", paths[1]] }));
    assert.deepEqual(a.resolve().fonts, paths);
    assert.deepEqual(b.resolve().fonts, paths);
    // Resolving a document rereads the personal configuration.
    writeFileSync(file, JSON.stringify({ fonts: ["Bank-Italic.ttf"] }));
    assert.deepEqual(a.resolve().fonts, [join(directory, "Bank-Italic.ttf")]);
    mkdirSync(join(first, ".ternleaf"));
    const local = join(first, ".ternleaf/canvas.json");
    writeFileSync(local, JSON.stringify({ fonts: ["team.ttf"] }));
    assert.deepEqual(a.resolve().fonts, [join(first, "team.ttf")]);
    assert.deepEqual(b.resolve().fonts, [join(directory, "Bank-Italic.ttf")]);
    writeFileSync(local, JSON.stringify({ fonts: [] }));
    assert.deepEqual(a.resolve().fonts, []);
    writeFileSync(local, JSON.stringify({ font: "legacy.ttf" }));
    assert.equal(a.resolve().font, join(first, "legacy.ttf"));
    assert.equal(a.resolve().fonts, undefined);
    writeFileSync(file, "{invalid");
    assert.throws(() => b.resolve(), error => error instanceof ProjectError && error.message.includes(file));
    assert.equal(a.resolve().font, join(first, "legacy.ttf"));
    writeFileSync(file, JSON.stringify({ fonts: "wrong" }));
    assert.throws(() => b.resolve(), /must be a list of font file paths/);
    writeFileSync(local, JSON.stringify({ fonts: [null] }));
    assert.throws(() => a.resolve(), /must be a list of font file paths/);
    assert(existsSync(file), "personal settings are separate from installed extension files");
  } finally {
    for (const folder of [personal, first, second]) rmSync(folder, { recursive: true, force: true });
  }
});

function project() {
  const folder = realpathSync(mkdtempSync(join(tmpdir(), "ternleaf-")));
  for (const path of ["engine/prebuilt/webapp", "examples", "docs/notes", "node_modules/pkg", ".hidden"]) {
    mkdirSync(join(folder, path), { recursive: true });
  }
  writeFileSync(join(folder, "examples/welcome-to-ternleaf.docx"), docx("welcome"));
  writeFileSync(join(folder, "docs/Brief.docx"), docx("brief"));
  writeFileSync(join(folder, "docs/notes/Minutes.docx"), docx("minutes"));
  writeFileSync(join(folder, "docs/~$Brief.docx"), docx("lock"));
  writeFileSync(join(folder, "node_modules/pkg/tool.docx"), docx("tool"));
  writeFileSync(join(folder, ".hidden/secret.docx"), docx("hidden"));
  writeFileSync(join(folder, "engine/prebuilt/webapp/editor.html"), "<!doctype html>");
  return folder;
}

test("a project lists its documents, returns to the last one and writes new ones safely", () => {
  const folder = project();
  try {
    const workspace = createWorkspace({ project: folder });
    assert.equal(workspace.resolve().key, "examples/welcome-to-ternleaf.docx");
    assert.deepEqual(workspace.documents().documents.map(item => item.path),
      ["docs/Brief.docx", "docs/notes/Minutes.docx", "examples/welcome-to-ternleaf.docx"]);
    assert.deepEqual(workspace.documents().folders, ["", "docs", "docs/notes", "examples"]);

    workspace.remember(join(folder, "docs/Brief.docx"), 7);
    assert.equal(workspace.resolve().key, "docs/Brief.docx");
    const [first] = workspace.documents().documents;
    assert.deepEqual([first.path, first.revisions], ["docs/Brief.docx", 7]);
    // A remembered document that no longer exists is passed over.
    rmSync(join(folder, "docs/Brief.docx"));
    assert.equal(workspace.resolve().key, "examples/welcome-to-ternleaf.docx");

    const made = workspace.create({ name: "Plan: phase 1/2?.docx", folder: "docs", bytes: new Uint8Array(docx("plan")) });
    assert.equal(made, join(folder, "docs", "Plan phase 1 2.docx"));
    assert.equal(workspace.create({ name: "Plan: phase 1/2?", folder: "docs", bytes: new Uint8Array(docx("again")) }),
      join(folder, "docs", "Plan phase 1 2 2.docx"));
    assert.equal(readFileSync(made, "utf8").slice(4), "plan");
    assert.equal(workspace.create({ name: "New", folder: "drafts/2026", bytes: new Uint8Array(docx("new")) }),
      join(folder, "drafts", "2026", "New.docx"));
    for (const refused of [{ name: "x", folder: "..", bytes: new Uint8Array(docx("x")) },
      { name: "x", folder: ".ternleaf", bytes: new Uint8Array(docx("x")) },
      { name: "x", folder: folder, bytes: new Uint8Array(docx("x")) },
      { name: " . ", folder: "", bytes: new Uint8Array(docx("x")) },
      { name: "x", folder: "", bytes: new Uint8Array(Buffer.from("not a zip")) }]) {
      assert.throws(() => workspace.create(refused), ProjectError, JSON.stringify(refused.name + refused.folder));
    }
    assert.throws(() => workspace.resolve("../outside.docx"), ProjectError);
    assert.throws(() => workspace.resolve("docs/missing.docx"), ProjectError);
    assert.equal(workspace.port, createWorkspace({ project: folder }).port);
    assert(workspace.port >= 42000 && workspace.port < 58000);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

test("one canvas opens, makes and adds documents, and a page on an earlier document is told to reload", async () => {
  const folder = project();
  const workspace = createWorkspace({ project: folder });
  const host = await startHost({ ...workspace.resolve(), workspace, port: workspace.port });
  const second = await startHost({ ...workspace.resolve("docs/notes/Minutes.docx"), workspace, port: workspace.port });
  try {
    const origin = new URL(host.url).origin;
    assert.equal(Number(new URL(origin).port), workspace.port);
    assert.notEqual(new URL(second.url).port, new URL(origin).port);
    const token = new URL(host.url).hash.slice(1);
    const post = async (path, data, headers = {}) => {
      const response = await fetch(origin + "/api/" + path, { method: "POST", body: JSON.stringify(data),
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", ...headers } });
      return { status: response.status, ...await response.json() };
    };
    const claimed = await post("claim", { previous: null });
    assert.deepEqual([claimed.status, claimed.name, claimed.workspace], [200, "welcome-to-ternleaf.docx", true]);
    const epoch = { "X-Ternleaf-Epoch": String(claimed.epoch) };
    assert.equal((await post("opened", { lease: claimed.lease }, epoch)).status, 200);

    const listed = await post("documents", {}, epoch);
    assert.equal(listed.current, "examples/welcome-to-ternleaf.docx");
    assert.equal(listed.documents[0].path, "examples/welcome-to-ternleaf.docx");

    assert.deepEqual([(await post("open", { path: "docs/Brief.docx" }, epoch)).name, host.name], ["Brief.docx", "Brief.docx"]);
    // The page that showed the first document still has its number.
    assert.deepEqual(await post("renew", { lease: claimed.lease }, epoch), { status: 409, error: "document-changed" });
    assert.deepEqual(await post("open", { path: "../x.docx" }), { status: 409, error: "project",
      message: "No .docx file at that path inside this project: ../x.docx" });

    const made = await post("new", { name: "Fresh", folder: "docs", bytes: docx("fresh").toString("base64") });
    assert.deepEqual([made.status, made.name], [200, "Fresh.docx"]);
    assert.equal((await post("new", { name: "Bad", bytes: Buffer.from("text").toString("base64") })).error, "project");

    const added = await fetch(origin + "/api/import", { method: "POST", body: docx("from elsewhere"),
      headers: { Authorization: "Bearer " + token, "X-Ternleaf-Name": encodeURIComponent("Årsrapport 2026.docx") } });
    assert.deepEqual(await added.json(), { name: "Årsrapport 2026.docx" });
    assert.deepEqual(readdirSync(join(folder, "documents")), ["Årsrapport 2026.docx"]);

    // The .docx changes outside Ternleaf. Its history is kept apart.
    writeFileSync(join(folder, "docs/Brief.docx"), docx("brief, edited in Word"));
    assert.deepEqual(await post("open", { path: "docs/Brief.docx" }), { status: 409, error: "source-already-set" });
    assert.equal(host.name, "Årsrapport 2026.docx");
    assert.equal((await post("open", { path: "docs/Brief.docx", restart: true })).status, 200);
    assert.equal(readdirSync(join(folder, ".ternleaf/archive")).filter(name => /Brief-[a-f0-9]{10}\.sqlite$/.test(name)).length, 1);

    // The agent opens a document in the open canvas.
    host.openDocument("docs/notes/Minutes.docx");
    assert.equal(host.name, "Minutes.docx");
    assert.throws(() => host.openDocument("docs/none.docx"), ProjectError);
  } finally {
    await host.close();
    await second.close();
    assert.equal(JSON.parse(readFileSync(join(folder, ".ternleaf/workspace.json"), "utf8")).last, "examples/welcome-to-ternleaf.docx");
    assert(existsSync(join(folder, ".ternleaf")));
    rmSync(folder, { recursive: true, force: true });
  }
});

test("the author saves to the Word file: the file, its text copy and change log, the archive and a new history", async () => {
  const folder = project();
  // Enough of a Word package for the host's check: a ZIP with a main part.
  const word = text => Buffer.concat([Buffer.from([0x50, 0x4b, 3, 4]), Buffer.from(`[Content_Types].xml word/document.xml ${text}`)]);
  const brief = join(folder, "docs/Brief.docx");
  writeFileSync(brief, word("brief"));
  const workspace = createWorkspace({ project: folder });
  let host = await startHost({ ...workspace.resolve("docs/Brief.docx"), workspace, port: 0, askAgent: () => {} });
  try {
    let origin = new URL(host.url).origin;
    let token = new URL(host.url).hash.slice(1);
    let epoch;
    const post = async (path, data) => {
      const response = await fetch(origin + "/api/" + path, { method: "POST", body: JSON.stringify(data),
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json",
          ...(epoch === undefined ? {} : { "X-Ternleaf-Epoch": String(epoch) }) } });
      return { status: response.status, ...await response.json() };
    };
    let claimed = await post("claim", { previous: null });
    let lease = claimed.lease;
    epoch = claimed.epoch;
    assert.deepEqual(claimed.saveFile, { textCopy: true, changeLog: true });
    const firstHistory = claimed.history;
    assert.match(firstHistory, /^[a-f0-9]{10}$/);
    // One accepted change and one typed edit.
    const node = "a".repeat(32);
    const asked = await post("ask", { lease, scope: { node, start: 0, end: 4, before: "KEEP", revision: 0, prompt: "Use HOLD.", note: "" } });
    host.submitProposal(asked.id, "HOLD", "The author asked for HOLD.");
    const forward = [{ DeleteText: { range: { start: { node, offset: 0 }, end: { node, offset: 4 } } } }, { InsertText: { at: { node, offset: 0 }, text: "HOLD" } }];
    assert.equal((await post("commit", { lease, request: { id: asked.id, fingerprint: "f1", expected: 0, command: { kind: "edit" },
      frame: { base: 0, revision: 1, forward, inverse: ["x"] }, editorial: { target: node, note: "" }, reviewId: asked.id } })).status, 200);
    assert.equal((await post("commit", { lease, request: { id: "typed", fingerprint: "f2", expected: 1, command: { kind: "edit" },
      frame: { base: 1, revision: 2, forward: ["typed"], inverse: ["x"] } } })).status, 200);
    assert.equal(host.status().unsavedRevisions, 2);

    const saved = word("saved at revision 2");
    const save = extra => post("save-file", { lease, revision: 2, bytes: saved.toString("base64"), markdown: "# Brief\n\nHOLD the line.\n", ...extra });
    const archived = () => existsSync(join(folder, ".ternleaf/archive")) ? readdirSync(join(folder, ".ternleaf/archive")).filter(name => name.endsWith(".sqlite")).length : 0;
    const untouched = () => {
      assert.equal(readFileSync(brief, "utf8").slice(4), "[Content_Types].xml word/document.xml brief");
      assert.equal(host.status().document.revision, 2);
      assert.equal(archived(), 0);
    };
    // Refusals write nothing.
    assert.deepEqual(await save({ bytes: Buffer.from("not a word file at all, only text").toString("base64") }), { status: 409, error: "not-a-docx" });
    assert.deepEqual(await save({ revision: 1 }), { status: 409, error: "stale-revision" });
    writeFileSync(brief, word("edited in Word"));
    assert.deepEqual(await save(), { status: 409, error: "file-changed-on-disk" });
    writeFileSync(brief, word("brief"));
    untouched();
    assert(!existsSync(brief + ".md") && !existsSync(brief + ".changes.md"));
    assert.deepEqual(readdirSync(join(folder, "docs")).filter(name => name.startsWith(".")), []);

    // Two editions of the brief were checked at revision 1. The editor sends
    // the unchecked passages of one of them with the save.
    const minutes = join(folder, "docs/notes/Minutes.docx");
    const welcome = join(folder, "examples/welcome-to-ternleaf.docx");
    workspace.setEdition(minutes, "docs/Brief.docx", 1);
    workspace.setEdition(welcome, "docs/Brief.docx", 1);
    assert.deepEqual((await post("editions-of", { lease })).editions, [
      { edition: "docs/notes/Minutes.docx", checked: 1, carried: [] }, { edition: "examples/welcome-to-ternleaf.docx", checked: 1, carried: [] }]);
    const passage = { change: "changed", before: "KEEP the line.", after: "HOLD the line." };
    const result = await save({ editions: [{ edition: "docs/notes/Minutes.docx", checked: 1, changes: [passage, { change: "moved" }] }] });
    assert.equal(result.status, 200, JSON.stringify(result));
    assert.deepEqual(workspace.edition(minutes), { reference: "docs/Brief.docx", checked: 0, carried: [passage] });
    assert.deepEqual(workspace.edition(welcome), { reference: "docs/Brief.docx", checked: 0, lost: true });
    // Marking an edition as checked ends both.
    workspace.setEdition(welcome, "docs/Brief.docx", 0);
    assert.deepEqual(workspace.edition(welcome), { reference: "docs/Brief.docx", checked: 0 });
    assert.deepEqual([result.document, result.revisions, result.acceptedChanges, result.textCopy, result.changeLog],
      ["docs/Brief.docx", 2, 1, "docs/Brief.docx.md", "docs/Brief.docx.changes.md"]);
    assert.equal(result.commitMessage, 'Update docs/Brief.docx: 1 accepted change, 2 revisions\n\n- "KEEP" → "HOLD" (revision 1)');
    assert.deepEqual(readFileSync(brief), saved);
    const copy = readFileSync(brief + ".md", "utf8");
    assert.match(copy.split("\n")[0], /^<!-- Ternleaf writes this file from Brief\.docx .*Do not edit this file.* -->$/);
    assert(copy.includes("HOLD the line."));
    const log = readFileSync(brief + ".changes.md", "utf8");
    assert.match(log, /^<!-- [^\n]*Do not edit this file\. -->\n\n# Change log: Brief\.docx\n[\s\S]*## Saved \d{4}-\d\d-\d\d \d\d:\d\d UTC: 2 revisions, 1 accepted change\n[\s\S]*Request \(from the canvas\): Use HOLD\.[\s\S]*> KEEP[\s\S]*> HOLD/);
    assert.equal(archived(), 1);
    assert.deepEqual(readdirSync(join(folder, "docs")).filter(name => name.startsWith(".")), []);
    assert.deepEqual(readdirSync(join(folder, ".ternleaf")).filter(name => name.includes(".save")), []);
    // The page on the earlier history reloads, and the new history starts
    // at revision 0 from the saved file.
    assert.deepEqual(await post("renew", { lease }), { status: 409, error: "document-changed" });
    epoch = undefined;
    claimed = await post("claim", { previous: null });
    ({ lease, epoch } = claimed);
    assert.deepEqual([claimed.head, claimed.journal, claimed.accepted], [0, [], []]);
    assert.equal(host.status().unsavedRevisions, 0);
    const source = await fetch(origin + "/api/source", { headers: { Authorization: "Bearer " + token } });
    assert.deepEqual(Buffer.from(await source.arrayBuffer()), saved);
    // A Word copy from the first history finds it in the archive.
    assert.notEqual(claimed.history, firstHistory);
    const [old, ...later] = (await post("archived-history", { lease, history: firstHistory })).histories;
    assert.deepEqual([old.history, old.frames.length, Buffer.from(old.source, "base64").toString("utf8").slice(4), later],
      [firstHistory, 2, "[Content_Types].xml word/document.xml brief", []]);
    assert.deepEqual((await post("archived-history", { lease, history: claimed.history })).histories, []);
    assert.deepEqual((await post("archived-history", { lease, history: "../x" })).histories, []);

    // A second save adds a section to the change log.
    assert.equal((await post("commit", { lease, request: { id: "typed-2", fingerprint: "f3", expected: 0, command: { kind: "edit" },
      frame: { base: 0, revision: 1, forward: ["typed"], inverse: ["x"] } } })).status, 200);
    const again = await post("save-file", { lease, revision: 1, bytes: word("second").toString("base64"), markdown: "Second.",
      editions: [{ edition: "docs/notes/Minutes.docx", checked: 0, changes: [{ change: "changed", before: "KEEP the line.", after: "HOLD it." }] }] });
    assert.deepEqual(workspace.edition(minutes).carried, [{ change: "changed", before: "KEEP the line.", after: "HOLD it." }]);
    // The welcome edition was checked at 0, and the history had 1 revision.
    assert.equal(workspace.edition(welcome).lost, true);
    assert.equal(again.commitMessage, "Update docs/Brief.docx: no accepted changes, 1 revision");
    const longer = readFileSync(brief + ".changes.md", "utf8");
    assert(longer.startsWith(log.trimEnd()));
    assert.match(longer.slice(log.trimEnd().length), /## Saved [^\n]*: 1 revision, 0 accepted changes\n\nNo accepted changes in this save\./);
    assert.equal(readFileSync(brief + ".md", "utf8").split("\n").slice(2).join("\n"), "Second.\n");
    assert.equal(archived(), 2);

    // A project can turn the two Markdown files off.
    writeFileSync(join(folder, ".ternleaf/canvas.json"), JSON.stringify({ textCopy: false, changeLog: false }));
    epoch = undefined;
    ({ lease, epoch } = await post("claim", { previous: null }));
    assert.equal((await post("archived-history", { lease, history: firstHistory })).histories.length, 2);
    const quiet = await post("save-file", { lease, revision: 0, bytes: word("third").toString("base64"), markdown: "Third." });
    assert.deepEqual([quiet.status, quiet.textCopy, quiet.changeLog], [200, null, null]);
    assert.equal(readFileSync(brief, "utf8").slice(-5), "third");
    assert.equal(readFileSync(brief + ".md", "utf8").split("\n").slice(2).join("\n"), "Second.\n");
    assert.equal(readFileSync(brief + ".changes.md", "utf8"), longer);
    assert.equal(archived(), 3);
  } finally {
    await host.close();
    rmSync(folder, { recursive: true, force: true });
  }
});

test("a save that a crash stopped is finished or undone when the document opens again", async () => {
  const folder = project();
  const word = text => Buffer.concat([Buffer.from([0x50, 0x4b, 3, 4]), Buffer.from(`[Content_Types].xml word/document.xml ${text}`)]);
  const brief = join(folder, "docs/Brief.docx");
  writeFileSync(brief, word("brief"));
  const workspace = createWorkspace({ project: folder });
  const settings = workspace.resolve("docs/Brief.docx");
  const { prepareSave, commitSave } = await import("../packages/session/save.mjs");
  const head = async () => {
    const host = await startHost({ ...settings, workspace, port: 0 });
    try { return host.status().document.revision; } finally { await host.close(); }
  };
  try {
    // A project with one revision.
    const { ProjectStore } = await import("../packages/session/store.mjs");
    mkdirSync(join(folder, ".ternleaf"), { recursive: true });
    const store = new ProjectStore(settings.state);
    store.initialize(word("brief"));
    const { lease } = store.claim();
    store.publish(lease, { id: "a", fingerprint: "a", expected: 0, command: { kind: "edit" }, frame: { base: 0, revision: 1, forward: ["x"], inverse: ["y"] } });
    store.release(lease);
    store.close();
    // Stopped before the commit: the old state stays.
    prepareSave({ ...settings, bytes: word("lost"), files: [{ path: brief + ".md", text: "lost" }] });
    assert.equal(await head(), 1);
    assert.equal(readFileSync(brief, "utf8").slice(-5), "brief");
    assert(!existsSync(brief + ".md"));
    assert.deepEqual(readdirSync(join(folder, "docs")).filter(name => name.startsWith(".")), []);
    // Stopped after the commit: the save is finished.
    prepareSave({ ...settings, bytes: word("kept"), files: [{ path: brief + ".md", text: "kept" }] });
    commitSave(settings);
    assert.equal(await head(), 0);
    assert.equal(readFileSync(brief + ".md", "utf8"), "kept");
    assert.equal(readdirSync(join(folder, ".ternleaf/archive")).length, 1);
    assert.deepEqual(readdirSync(join(folder, ".ternleaf")).filter(name => name.includes(".save")), []);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

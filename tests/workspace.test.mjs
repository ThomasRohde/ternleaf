import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { ProjectError, createWorkspace } from "../apps/host/project.mjs";
import { startHost } from "../apps/host/serve.mjs";

const docx = text => Buffer.concat([Buffer.from([0x50, 0x4b, 3, 4]), Buffer.from(text)]);

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

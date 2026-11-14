import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { extension, manifestPath, run, skill } from "../scripts/install.mjs";
import { copyRelease } from "../scripts/package-canvas.mjs";
import { partsFolder, projectFolder, startProblem } from "../.github/extensions/ternleaf/start-check.mjs";

const source = fileURLToPath(new URL("..", import.meta.url));
const docx = text => Buffer.concat([Buffer.from([0x50, 0x4b, 3, 4]), Buffer.from(text)]);

// A repository of a team, with its own files, also in .github.
function repository({ gitignore = "node_modules/\n" } = {}) {
  const folder = realpathSync(mkdtempSync(join(tmpdir(), "ternleaf-install-")));
  for (const path of [".git", ".github/workflows", "docs"]) mkdirSync(join(folder, path), { recursive: true });
  writeFileSync(join(folder, "README.md"), "# Team\n");
  writeFileSync(join(folder, ".github/workflows/ci.yml"), "on: push\n");
  writeFileSync(join(folder, "docs/Brief.docx"), docx("brief"));
  if (gitignore !== null) writeFileSync(join(folder, ".gitignore"), gitignore);
  return folder;
}

// Every file and folder with its content hash, to compare a folder before and after.
function snapshot(folder) {
  const result = {};
  const walk = directory => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      const key = relative(folder, path).replaceAll("\\", "/");
      if (entry.isDirectory()) { result[key + "/"] = "folder"; walk(path); }
      else result[key] = createHash("sha256").update(readFileSync(path)).digest("hex");
    }
  };
  walk(folder);
  return result;
}

const quiet = () => { const lines = []; return { lines, print: line => lines.push(line), text: () => lines.join("\n") }; };
const install = (target, options = {}) => { const out = quiet(); return { code: run({ source, target, print: out.print, ...options }), text: out.text() }; };

test("install puts Ternleaf in .github, adds .gitignore lines once and a second run changes nothing", () => {
  const target = repository({ gitignore: "node_modules/\n/exports\n" });
  const before = snapshot(target);
  try {
    const first = install(target);
    assert.equal(first.code, 0, first.text);
    assert.match(first.text, /The copy is \d+\.\d MB in \d+ files\. The document engine is/);
    assert.match(first.text, /Next:/);
    for (const path of [`${extension}/extension.mjs`, `${extension}/start-check.mjs`, `${extension}/icon.svg`,
      `${extension}/apps/host/serve.mjs`, `${extension}/packages/session/store.mjs`, `${extension}/LICENSE`,
      `${extension}/examples/welcome-to-ternleaf.docx`, `${extension}/engine/prebuilt/webapp/editor.html`,
      `${extension}/engine/prebuilt/webapp/pkg/casual_doc_wasm_bg.wasm.gz`, `${extension}/engine/notices/copilot-sdk-MIT.txt`, skill]) {
      assert(existsSync(join(target, path)), path);
    }
    assert(!existsSync(join(target, extension, "node_modules")), "The Copilot app gives the SDK");
    // The team's files are the same, and nothing of Ternleaf is outside the two places.
    const after = snapshot(target);
    for (const [path, hash] of Object.entries(before)) if (path !== ".gitignore") assert.equal(after[path], hash, path);
    for (const path of Object.keys(after)) {
      if (path in before) continue;
      assert(path.startsWith(extension + "/") || path.startsWith(dirname(skill) + "/")
        || [".github/extensions/", ".github/skills/"].includes(path), path);
    }
    // "/exports" counts as the exports line, so only .ternleaf/ is added.
    assert.equal(readFileSync(join(target, ".gitignore"), "utf8"), "node_modules/\n/exports\n\n# Ternleaf: project files and exports\n.ternleaf/\n");
    const manifest = JSON.parse(readFileSync(join(target, manifestPath), "utf8"));
    const installed = Object.keys(after).filter(path => !path.endsWith("/") && !(path in before) && path !== manifestPath);
    assert.deepEqual(Object.keys(manifest.files).sort(), installed.sort());
    for (const [path, hash] of Object.entries(manifest.files)) assert.equal(after[path], hash, path);
    assert.deepEqual(manifest.directories.filter(path => !path.startsWith(extension + "/")),
      [".github/extensions", ".github/extensions/ternleaf", ".github/skills", ".github/skills/ternleaf"]);
    const stamp = statSync(join(target, manifestPath)).mtimeMs;

    const second = install(target);
    assert.equal(second.code, 0, second.text);
    assert.match(second.text, /Nothing was changed/);
    assert.deepEqual(snapshot(target), after);
    assert.equal(statSync(join(target, manifestPath)).mtimeMs, stamp);
    const check = install(target, { check: true });
    assert.equal(check.code, 0, check.text);
    assert.match(check.text, /Nothing needs to change/);
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test("install never replaces a file that it did not write, and keeps a local change without --force", () => {
  const target = repository();
  try {
    mkdirSync(join(target, dirname(skill)), { recursive: true });
    writeFileSync(join(target, skill), "The team's own skill\n");
    const before = snapshot(target);
    const blocked = install(target);
    assert.equal(blocked.code, 1);
    assert.match(blocked.text, /Nothing was changed/);
    assert.match(blocked.text, /\.github\/skills\/ternleaf\/SKILL\.md exists, and Ternleaf did not write it/);
    assert.deepEqual(snapshot(target), before);
    assert.equal(install(target, { force: true }).code, 1, "--force does not replace a file of the team");
    rmSync(join(target, skill));

    assert.equal(install(target).code, 0);
    const changed = join(target, extension, "apps/host/serve.mjs");
    writeFileSync(changed, readFileSync(changed, "utf8") + "// A local change.\n");
    const installed = snapshot(target);
    const check = install(target, { check: true });
    assert.equal(check.code, 1);
    assert.match(check.text, /apps\/host\/serve\.mjs was changed after Ternleaf installed it/);
    const update = install(target);
    assert.equal(update.code, 1);
    assert.match(update.text, /--force/);
    assert.deepEqual(snapshot(target), installed);
    const removal = install(target, { remove: true });
    assert.equal(removal.code, 1);
    assert.match(removal.text, /Ternleaf was not removed/);
    assert.deepEqual(snapshot(target), installed);

    const forced = install(target, { force: true });
    assert.equal(forced.code, 0, forced.text);
    assert.match(forced.text, /Replaced .*serve\.mjs/);
    assert.equal(readFileSync(changed, "utf8"), readFileSync(join(source, "apps/host/serve.mjs"), "utf8"));
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test("--remove leaves the repository as it was before the install", () => {
  for (const gitignore of ["node_modules/\n", "node_modules/", "", null]) {
    const target = repository({ gitignore });
    try {
      const before = snapshot(target);
      assert.equal(install(target).code, 0);
      // What the author made with Ternleaf stays.
      mkdirSync(join(target, ".ternleaf"));
      writeFileSync(join(target, ".ternleaf/brief.sqlite"), "revisions");
      const removed = install(target, { remove: true });
      assert.equal(removed.code, 0, removed.text);
      assert.match(removed.text, /Ternleaf is removed/);
      assert(existsSync(join(target, ".ternleaf/brief.sqlite")));
      rmSync(join(target, ".ternleaf"), { recursive: true });
      assert.deepEqual(snapshot(target), before, JSON.stringify(gitignore));
      assert.equal(install(target, { remove: true }).code, 1, "a second removal has nothing to remove");
    } finally { rmSync(target, { recursive: true, force: true }); }
  }
});

test("the installed copy finds its engine, its introduction and the documents of the repository", async () => {
  const target = repository();
  try {
    assert.equal(install(target).code, 0);
    const installed = join(target, extension);
    const { createWorkspace, ProjectError } = await import(pathToFileURL(join(installed, "apps/host/project.mjs")).href);
    const { startHost } = await import(pathToFileURL(join(installed, "apps/host/serve.mjs")).href);
    const workspace = createWorkspace({ project: target });
    const welcome = workspace.resolve();
    assert.equal(welcome.key, `${extension}/examples/welcome-to-ternleaf.docx`);
    assert.equal(welcome.engine, join(installed, "engine/prebuilt/webapp"));
    assert.equal(welcome.state, join(target, ".ternleaf", basenameOf(welcome.state)));
    assert.equal(workspace.resolve("docs/Brief.docx").key, "docs/Brief.docx");
    // The introduction opens, but the list shows only the team's documents.
    assert.deepEqual(workspace.documents().documents.map(item => item.path), ["docs/Brief.docx"]);

    const host = await startHost({ ...welcome, workspace, port: 0 });
    try {
      const origin = new URL(host.url).origin;
      const page = await fetch(origin + "/editor.html");
      assert.equal(page.status, 200);
      assert.match(await page.text(), /<html/i);
      const shell = await fetch(origin + "/ternleaf/editor.mjs");
      assert.equal(shell.status, 200);
      const module = await fetch(origin + "/pkg/casual_doc_wasm_bg.wasm");
      assert.equal(module.headers.get("content-encoding"), "gzip");
      await module.arrayBuffer();
    } finally { await host.close(); }

    // A missing part gives one sentence with what to do.
    rmSync(join(installed, "examples/welcome-to-ternleaf.docx"));
    assert.throws(() => createWorkspace({ project: target }).resolve(),
      error => error instanceof ProjectError && /introduction .* is missing\. Open Ternleaf with the path .*install\.mjs/.test(error.message));
    rmSync(join(installed, "engine"), { recursive: true });
    assert.throws(() => createWorkspace({ project: target }).resolve("docs/Brief.docx"),
      error => error instanceof ProjectError && /engine is missing: no folder .*install\.mjs/.test(error.message));
    writeFileSync(join(target, ".ternleaf/canvas.json"), JSON.stringify({ engine: "nowhere" }));
    assert.throws(() => createWorkspace({ project: target }).resolve("docs/Brief.docx"),
      error => error instanceof ProjectError && /"engine" path in \.ternleaf\/canvas\.json\. Correct the path/.test(error.message));
  } finally { rmSync(target, { recursive: true, force: true }); }
});

const basenameOf = path => path.split(/[\\/]/).pop();

test("the installed extension opens a canvas on the repository", async () => {
  const target = repository();
  try {
    assert.equal(install(target).code, 0);
    const installed = join(target, extension);
    // A stand-in for the SDK that the Copilot app gives the extension. It
    // keeps what the extension registers.
    const sdk = join(installed, "node_modules/@github/copilot-sdk");
    mkdirSync(sdk, { recursive: true });
    writeFileSync(join(sdk, "package.json"), JSON.stringify({ name: "@github/copilot-sdk", type: "module", exports: { "./extension": "./extension.js" } }));
    writeFileSync(join(sdk, "extension.js"), `
      export class CanvasError extends Error { constructor(code, message) { super(message); this.code = code; } }
      export const createCanvas = options => options;
      export async function joinSession(config) {
        globalThis.ternleafJoined = config;
        return { send: async () => {}, log: async () => {}, on: () => {}, rpc: { canvas: { open: async () => {} } } };
      }`);
    await import(pathToFileURL(join(installed, "extension.mjs")).href);
    const [canvas] = globalThis.ternleafJoined.canvases;
    assert(canvas.actions.length > 5);
    const opened = await canvas.open({ instanceId: "one", input: null, session: { workingDirectory: target } });
    try {
      assert.equal(opened.title, "welcome-to-ternleaf.docx");
      assert.equal((await fetch(new URL("/editor.html", opened.url))).status, 200);
      const other = await canvas.open({ instanceId: "two", input: { document: "docs/Brief.docx" }, session: { workingDirectory: target } });
      assert.equal(other.title, "Brief.docx");
      await canvas.onClose({ instanceId: "two" });
      await assert.rejects(canvas.open({ instanceId: "three", input: { document: "docs/Missing.docx" }, session: {} }),
        error => error.code === "project" && /docs\/Missing\.docx/.test(error.message));
    } finally { await canvas.onClose({ instanceId: "one" }); }
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test("the start check names what is missing and what to do", async () => {
  const extensionFolder = join(source, extension);
  assert.equal(partsFolder(extensionFolder), join(source, extension, "../../.."));
  assert.equal(projectFolder(extensionFolder), source.replace(/[\\/]$/, ""));
  assert.equal(await startProblem(partsFolder(extensionFolder)), null);
  const old = await startProblem(source, { load: async () => { throw new Error("No such built-in module: node:sqlite"); }, version: "20.11.0" });
  assert.match(old, /^Ternleaf cannot start: Node\.js 20\.11\.0 has no node:sqlite module, and Ternleaf needs Node\.js 24 or later\. Update the GitHub Copilot app/);
  const empty = realpathSync(mkdtempSync(join(tmpdir(), "ternleaf-empty-")));
  try {
    assert.equal(partsFolder(empty), join(empty, "../../.."));
    const missing = await startProblem(empty);
    assert.match(missing, /^Ternleaf cannot start: 7 of its files are missing in .*, for example apps\/agent\/actions\.mjs\. Install Ternleaf again with "node scripts\/install\.mjs <repository>"/);
  } finally { rmSync(empty, { recursive: true, force: true }); }
});

test("a release bundle installs like a clone", () => {
  const folder = realpathSync(mkdtempSync(join(tmpdir(), "ternleaf-release-")));
  const bundle = join(folder, "ternleaf");
  const fromClone = repository();
  const fromBundle = repository();
  try {
    copyRelease(source, bundle);
    assert(existsSync(join(bundle, "scripts/install.mjs")));
    assert(existsSync(join(bundle, "README.md")));
    assert.equal(install(fromClone).code, 0);
    const out = quiet();
    assert.equal(run({ source: bundle, target: fromBundle, print: out.print }), 0, out.text());
    assert.deepEqual(snapshot(fromBundle), snapshot(fromClone));
  } finally {
    for (const path of [folder, fromClone, fromBundle]) rmSync(path, { recursive: true, force: true });
  }
});

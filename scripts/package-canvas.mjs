import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const [checkoutArg, outputArg] = process.argv.slice(2);
assert(checkoutArg && outputArg, "Usage: node scripts/package-canvas.mjs OPENDOC_CHECKOUT NEW_BUNDLE_DIRECTORY");
const project = fileURLToPath(new URL("..", import.meta.url));
const checkout = resolve(checkoutArg);
const output = resolve(outputArg);
const pin = readFileSync(join(project, "engine/opendoc.lock"), "utf8").trim();
assert.equal(execFileSync("git", ["-C", checkout, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(), pin);
const patch = join(project, "engine/opendoc.patch");
execFileSync("git", ["-C", checkout, "apply", "--reverse", "--check", patch]);
assert(!existsSync(output), "Use a new output directory");

function copy(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true, errorOnExist: true, force: false });
}
const extension = ".github/extensions/ternleaf";
for (const path of ["LICENSE", "apps/agent", "apps/editor", "apps/host", "packages/session", "examples",
  ".github/skills/ternleaf/SKILL.md", `${extension}/extension.mjs`, `${extension}/icon.svg`, `${extension}/package.json`, `${extension}/package-lock.json`]) {
  copy(join(project, path), join(output, path));
}
const notices = join(output, "notices");
for (const path of ["LICENSE", "NOTICE", "Cargo.lock", "crates/casual-doc-layout/fonts/LICENSES",
  "crates/casual-doc-layout/fonts/README.md"]) copy(join(checkout, path), join(notices, "opendoc", path));
copy(patch, join(notices, "opendoc/ternleaf.patch"));
for (const path of ["editor.html", "opendoc-mark.svg", "site.webmanifest", "apple-touch-icon.png",
  "icon-192.png", "icon-512.png", "assets", "src", "locales", "dict", "packs", "generated",
  "plugins", "pkg/casual_doc_wasm.js", "pkg/casual_doc_wasm_bg.wasm"]) {
  copy(join(checkout, "webapp", path), join(output, "opendoc", path));
}

const runtime = join(project, extension);
const npm = JSON.parse(readFileSync(join(runtime, "package-lock.json"), "utf8"));
const packages = [];
for (const [path, spec] of Object.entries(npm.packages)) {
  // joinSession uses Copilot's existing session transport. The optional
  // standalone agent runtime belongs to the Copilot installation.
  if (!path || path.startsWith("node_modules/@github/copilot-sdk-")) continue;
  if (!existsSync(join(runtime, path))) {
    assert(spec.optional, "Run npm ci for the extension first. Missing " + path);
    continue;
  }
  copy(join(runtime, path), join(output, extension, path));
  packages.push({ path, version: spec.version, license: spec.license, integrity: spec.integrity });
}
assert(packages.some(item => item.path === "node_modules/@github/copilot-sdk"), "Run npm ci for the extension first");
copy(join(project, "engine/notices/copilot-sdk-MIT.txt"), join(notices, "copilot-sdk-MIT.txt"));

const rust = "1.97.1";
const sysroot = execFileSync("rustc", ["+" + rust, "--print", "sysroot"], { encoding: "utf8" }).trim();
for (const path of ["COPYRIGHT-library.html", "licenses"]) {
  copy(join(sysroot, "share/doc/rust", path), join(notices, "rust-standard-library", path));
}
const tree = execFileSync("cargo", ["+" + rust, "tree", "--locked", "--offline", "--target", "wasm32-unknown-unknown",
  "-p", "casual-doc-wasm", "--features", "web-host-fonts", "--edges", "normal,build", "--prefix", "none",
  "--format", "{p}|{l}"], { cwd: checkout, encoding: "utf8" });
const cargoHome = process.env.CARGO_HOME ?? join(homedir(), ".cargo");
const registry = join(cargoHome, "registry", "src");
const indexes = readdirSync(registry).map(name => join(registry, name));
const crates = new Map();
for (const line of tree.trim().split(/\r?\n/)) {
  const [, name, version, origin, license] = /^(\S+) v(\S+)(.*?)\|(.+?)(?: \(\*\))?$/.exec(line) ?? [];
  assert(name && license, "Missing licence in Cargo dependency graph: " + line);
  const key = `${name}-${version}`;
  if (crates.has(key)) continue;
  crates.set(key, { name, version, license });
  if (origin.includes(checkout)) continue;
  const source = indexes.map(index => join(index, key)).find(existsSync);
  assert(source, "Crate source missing from local cache: " + key);
  const files = readdirSync(source).filter(file => /^(licen[cs]e|copying|notice|copyright)([._-]|$)/i.test(file));
  if (!files.length) crates.get(key).notice = "See upstream package source and SPDX expression";
  for (const file of files) copy(join(source, file), join(notices, "rust", key, file));
}

function inventory(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return inventory(file);
    const bytes = readFileSync(file);
    return [{ path: relative(output, file).replaceAll("\\", "/"), bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex") }];
  });
}
const commit = execFileSync("git", ["-C", project, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const changes = execFileSync("git", ["-C", project, "status", "--porcelain", "--",
  "apps", "packages", "engine", "examples", "docs/Install.md", "scripts/package-canvas.mjs", extension], { encoding: "utf8" });
// The install guide is the bundle's README. Its links point into a docs
// folder, so the guide keeps that place and the README refers to it.
copy(join(project, "docs/Install.md"), join(output, "docs/Install.md"));
writeFileSync(join(output, "README.md"),
  "# Ternleaf canvas bundle\n\nOpen this folder in the GitHub Copilot desktop app and choose **+ → Canvas → Ternleaf**.\n"
  + "[Install and run Ternleaf](docs/Install.md) has the details.\n");
writeFileSync(join(output, "BUNDLE-INVENTORY.json"), JSON.stringify({
  commit, dirtyRuntime: Boolean(changes.trim()), opendoc: pin, platform: process.platform, arch: process.arch,
  npm: packages, rustToolchain: rust, rustBuildGraph: [...crates.values()], files: inventory(output),
}, null, 2) + "\n");
console.log(output);

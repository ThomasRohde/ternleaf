// Make a release bundle of Ternleaf.
//
//   node scripts/package-canvas.mjs OPENDOC_CHECKOUT NEW_BUNDLE_DIRECTORY
//
// The bundle has the layout of a clone, cut to what scripts/install.mjs
// installs, and the install script itself. A team unpacks it and runs
//   node scripts/install.mjs <repository>
// The file list comes from scripts/install.mjs, so the two cannot drift.
//
// The engine is the prebuilt one in engine/prebuilt. The OpenDoc checkout
// must be at the pinned commit with the Ternleaf patch applied. It gives the
// licence notices of OpenDoc, the Rust standard library and every crate in
// the build, and, if it holds a build, proof that the prebuilt module is
// that build.
//
// The bundle has no node_modules: the Copilot app gives the extension its
// @github/copilot-sdk. docs/Install.md says what to do if an app does not.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sourceFiles, tools } from "./install.mjs";

const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");

function copy(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true, errorOnExist: true, force: false });
}

// Copy what scripts/install.mjs needs from a Ternleaf clone into a new
// folder. The result installs like a clone.
export function copyRelease(project, output) {
  assert(!existsSync(output), "Use a new output directory");
  for (const file of sourceFiles(project)) copy(join(project, file.from), join(output, file.from));
  for (const path of tools) copy(join(project, path), join(output, path));
  // The install guide is the bundle's README. Its links point into a docs
  // folder, so the guide keeps that place and the README refers to it.
  copy(join(project, "docs/Install.md"), join(output, "docs/Install.md"));
  writeFileSync(join(output, "README.md"),
    "# Ternleaf release\n\nInstall Ternleaf in a repository with one command:\n\n"
    + "    node scripts/install.mjs <path of the repository>\n\n"
    + "Install for your user account across projects with:\n\n    node scripts/install.mjs --user\n\n"
    + "Or install it for your user account across projects:\n\n"
    + "    node scripts/install.mjs --user\n\n"
    + "Run the same command again to update. Add --check to see what would change, or --remove to remove Ternleaf.\n"
    + "[Install and run Ternleaf](docs/Install.md) has the details.\n");
}

function inventory(output, directory = output) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return inventory(output, file);
    const bytes = readFileSync(file);
    return [{ path: relative(output, file).replaceAll("\\", "/"), bytes: bytes.length, sha256: sha256(bytes) }];
  });
}

function main([checkoutArg, outputArg]) {
  assert(checkoutArg && outputArg, "Usage: node scripts/package-canvas.mjs OPENDOC_CHECKOUT NEW_BUNDLE_DIRECTORY");
  const project = fileURLToPath(new URL("..", import.meta.url));
  const checkout = resolve(checkoutArg);
  const output = resolve(outputArg);
  const pin = readFileSync(join(project, "engine/opendoc.lock"), "utf8").trim();
  assert.equal(execFileSync("git", ["-C", checkout, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(), pin);
  const patch = join(project, "engine/opendoc.patch");
  execFileSync("git", ["-C", checkout, "apply", "--reverse", "--check", patch]);
  const build = JSON.parse(readFileSync(join(project, "engine/prebuilt/BUILD.json"), "utf8"));
  assert.equal(build.opendoc, pin, "engine/prebuilt is not a build of the pinned OpenDoc commit");
  assert.equal(build.patchSha256, sha256(readFileSync(patch)), "engine/prebuilt was built with another patch");
  const module = join(checkout, "webapp/pkg/casual_doc_wasm_bg.wasm");
  if (existsSync(module)) {
    assert.equal(sha256(readFileSync(module)), build.wasmSha256, "The module in the checkout is not the prebuilt module");
  }
  assert(!existsSync(output), "Use a new output directory");
  copyRelease(project, output);

  const notices = join(output, "notices");
  for (const path of ["LICENSE", "NOTICE", "Cargo.lock", "crates/casual-doc-layout/fonts/LICENSES",
    "crates/casual-doc-layout/fonts/README.md"]) copy(join(checkout, path), join(notices, "opendoc", path));
  copy(patch, join(notices, "opendoc/ternleaf.patch"));

  const rust = build.tools?.rust ?? "1.97.1";
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

  const commit = execFileSync("git", ["-C", project, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const changes = execFileSync("git", ["-C", project, "status", "--porcelain", "--",
    "apps", "packages", "engine", "examples", "docs/Install.md", "scripts", ".github"], { encoding: "utf8" });
  writeFileSync(join(output, "BUNDLE-INVENTORY.json"), JSON.stringify({
    commit, dirtyRuntime: Boolean(changes.trim()), opendoc: pin, build,
    rustToolchain: rust, rustBuildGraph: [...crates.values()], files: inventory(output),
  }, null, 2) + "\n");
  console.log(output);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main(process.argv.slice(2));

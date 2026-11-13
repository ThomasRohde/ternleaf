// Replace the prebuilt engine in engine/prebuilt with a fresh build.
//
//   node scripts/update-prebuilt.mjs OPENDOC_CHECKOUT
//
// The checkout must be at the pinned commit with the Ternleaf patch applied
// and built by scripts/build-engine.ps1. Add the licence notices of a changed
// dependency graph to engine/prebuilt/notices by hand: scripts/package-canvas.mjs
// collects them into the notices folder of a bundle.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const [checkoutArg] = process.argv.slice(2);
assert(checkoutArg, "Usage: node scripts/update-prebuilt.mjs OPENDOC_CHECKOUT");
const project = fileURLToPath(new URL("..", import.meta.url));
const checkout = resolve(checkoutArg);
const pin = readFileSync(join(project, "engine/opendoc.lock"), "utf8").trim();
assert.equal(execFileSync("git", ["-C", checkout, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(), pin,
  "The checkout is not at the pinned OpenDoc commit");
const patch = join(project, "engine/opendoc.patch");
execFileSync("git", ["-C", checkout, "apply", "--reverse", "--check", patch]);

const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const target = join(project, "engine/prebuilt/webapp");
rmSync(target, { recursive: true, force: true });
for (const path of ["editor.html", "opendoc-mark.svg", "site.webmanifest", "apple-touch-icon.png",
  "icon-192.png", "icon-512.png", "assets", "src", "locales", "dict", "packs", "generated",
  "plugins", "pkg/casual_doc_wasm.js"]) {
  cpSync(join(checkout, "webapp", path), join(target, path), { recursive: true });
}
// GitHub refuses a file over 100 MB. The host serves the compressed module
// with Content-Encoding: gzip.
const wasm = readFileSync(join(checkout, "webapp/pkg/casual_doc_wasm_bg.wasm"));
writeFileSync(join(target, "pkg/casual_doc_wasm_bg.wasm.gz"), gzipSync(wasm, { level: 9 }));
const notices = join(project, "engine/prebuilt/notices/opendoc");
if (existsSync(notices)) {
  for (const path of ["LICENSE", "NOTICE", "Cargo.lock"]) cpSync(join(checkout, path), join(notices, path));
  cpSync(patch, join(notices, "ternleaf.patch"));
}
writeFileSync(join(project, "engine/prebuilt/BUILD.json"), JSON.stringify({
  opendoc: pin,
  patchSha256: sha256(readFileSync(patch)),
  wasmSha256: sha256(wasm),
  wasmBytes: wasm.length,
  built: new Date().toISOString().slice(0, 10),
}, null, 2) + "\n");
console.log(target);

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

// The engine's WebAssembly module, from a fresh build or from the prebuilt
// engine, which stores it compressed.
export async function readEngineModule(webapp) {
  const file = join(webapp, "pkg/casual_doc_wasm_bg.wasm");
  return existsSync(file) ? readFile(file) : gunzipSync(await readFile(file + ".gz"));
}

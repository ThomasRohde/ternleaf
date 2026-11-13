import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { readEngineModule } from "./wasm.mjs";

const [webapp, out] = process.argv.slice(2);
const { initSync, open } = await import(pathToFileURL(join(webapp, "pkg/casual_doc_wasm.js")));
initSync({ module: await readEngineModule(webapp) });
const format = "org.openxmlformats.wordprocessingml.document";
const input = await readFile(join(out, "owned.docx"));
const doc = open(input);

function hit(handle, query) {
  const result = handle.findText(query, "", 0, true, true);
  try {
    assert.ok(result.startNode, query);
    return [result.startNode, result.startOffset, result.endNode, result.endOffset];
  } finally { result.free(); }
}

function bytes(handle, mode) {
  const data = handle.exportAs(format, mode);
  try { return Buffer.from(data.bytes); }
  finally { data.free(); }
}

assert.deepEqual(bytes(doc, "exact_if_unchanged"), input);
doc.replaceSelection(...hit(doc, "KEEP"), "KEPT").free();
doc.replaceSelection(...hit(doc, "Header"), "Updated header").free();
const [header] = hit(doc, "Updated header");
doc.splitParagraph(header, 15).free();
doc.deleteBackward(hit(doc, "Reference link")[0], 0).free();
const [first] = hit(doc, "Alpha");
doc.splitParagraph(first, 6).free();
await writeFile(join(out, "owned-split.docx"), bytes(doc, "preserve_when_safe"));
doc.deleteBackward(hit(doc, "KEPT")[0], 0).free();
await writeFile(join(out, "owned-joined.docx"), bytes(doc, "preserve_when_safe"));
doc.moveBodyBlocks(0, 2, 1).free();
assert.throws(() => doc.deleteBackward(hit(doc, "Alpha")[0], 0), /Unsupported/);
const moved = bytes(doc, "preserve_when_safe");
await writeFile(join(out, "owned-moved.docx"), moved);
const reopened = open(moved);
await writeFile(join(out, "owned-reopened.docx"), bytes(reopened, "preserve_when_safe"));
reopened.free();
doc.undo().free();
await writeFile(join(out, "owned-undone.docx"), bytes(doc, "preserve_when_safe"));
doc.free();
console.log("Engine preservation sequence exported");

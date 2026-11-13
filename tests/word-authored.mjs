import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { validateDocxExport } from "../apps/editor/export-policy.mjs";
import { readEngineModule } from "./wasm.mjs";

const [webapp, out, font, pass = "first", ...additionalFonts] = process.argv.slice(2);
const { initSync, open } = await import(pathToFileURL(join(webapp, "pkg/casual_doc_wasm.js")));
initSync({ module: await readEngineModule(webapp) });
const doc = open(await readFile(join(out, pass === "first" ? "word-authored.docx" : "word-resaved.docx")));
for (const path of [font, ...additionalFonts]) doc.registerFont(await readFile(path));

function hit(query) {
  const result = doc.findText(query, "", 0, true, true);
  try {
    assert.ok(result.startNode, query);
    return [result.startNode, result.startOffset, result.endNode, result.endOffset];
  } finally { result.free(); }
}

async function save(stem) {
  const output = doc.exportAs("org.openxmlformats.wordprocessingml.document", "preserve_when_safe");
  try {
    validateDocxExport(output.reportJson);
    await writeFile(join(out, stem + ".docx"), output.bytes);
    return JSON.parse(output.reportJson);
  } finally { output.free(); }
}

try {
  if (pass === "first") {
    const [last] = hit("Last paragraph");
    const revision = doc.revision;
    assert.throws(() => doc.deleteBackward(last, 0), /Unsupported/);
    assert.equal(doc.revision, revision);
    doc.replaceSelection(...hit("ending"), "ending revised").free();
    await save("word-chart-text-edit");
    doc.undo().free();
    doc.replaceSelection(...hit("KEEP"), "REVIEWED").free();
  } else {
    doc.replaceSelection(...hit("REVIEWED"), "ACCEPTED").free();
  }
  doc.undo().free();
  await save(`word-${pass}-undo`);
  doc.redo().free();
  const report = await save(`word-${pass}`);
  const logical = Array.from({ length: doc.pageCount }, (_, index) => JSON.parse(doc.glyphOrigins(index)));
  const chart = doc.renderPage(0, 360);
  try {
    await writeFile(join(out, `word-${pass}.rgba`), chart.rgba);
    await writeFile(join(out, `word-${pass}-layout.json`),
      JSON.stringify({ allowed: true, report, logical, width: chart.widthPx, height: chart.heightPx }));
  } finally { chart.free(); }
  console.log(JSON.stringify({ pass, allowed: true, pages: doc.pageCount }));
} finally { doc.free(); }

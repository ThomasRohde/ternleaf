// The smallest reproductions of the export defects that the real-documents
// test found. Each case opens a minimal document from make-minimal.py in the
// engine, makes one text change with replaceSelection (the call that the
// Review pane uses for a change in one formatting), exports it as the editor
// does and checks the file with the export policy and with constructs.py.
//
//   python3 tests/real/make-minimal.py <folder>
//   node tests/real/repro.mjs <engine webapp> <folder>
//
// It prints one line for each case: "present" while the defect is there,
// "fixed" when it is gone. It exits with 0 in both cases; the real-documents
// test is the one that fails on a change.
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateDocxExport } from "../../apps/editor/export-policy.mjs";
import { readEngineModule } from "../wasm.mjs";

const [webapp, folder] = process.argv.slice(2);
const { initSync, open } = await import(pathToFileURL(join(webapp, "pkg/casual_doc_wasm.js")));
initSync({ module: await readEngineModule(webapp) });
const format = "org.openxmlformats.wordprocessingml.document";
const reader = fileURLToPath(new URL("./constructs.py", import.meta.url));

// The last two cases are not export defects: they show an engine call that
// Ternleaf needs and does not have (docs/Engine-Requests.md).

// Open `file`, replace `find` (in the first paragraph that has it) with
// `text`, export, and list what the export kept.
async function edit(file, find, text) {
  const source = join(folder, file);
  const doc = open(await readFile(source));
  try {
    const [node, value] = JSON.parse(doc.searchableText()).find(([, paragraph]) => paragraph.includes(find));
    const start = Buffer.byteLength(value.slice(0, value.indexOf(find)));
    doc.replaceSelection(node, start, node, start + Buffer.byteLength(find), text).free();
    const output = doc.exportAs(format, "preserve_when_safe");
    const target = join(folder, file.replace(/\.docx$/, "-edited.docx"));
    try {
      await writeFile(target, output.bytes);
      let refused = [];
      try { validateDocxExport(output.reportJson); } catch (error) { refused = error.features; }
      const listed = JSON.parse(execFileSync("python3", ["-I", reader, source, target], { encoding: "utf8" }));
      return { refused, before: listed[source], after: listed[target], controls: JSON.parse(doc.contentControls()).length };
    } finally { output.free(); }
  } finally { doc.free(); }
}

const cases = [
  ["A change over the result of a REF field removes the field, and the export allows it",
    async () => { const r = await edit("ref-field.docx", "table 1 for", "tabel 1 for"); return [r.after.fields.length < r.before.fields.length && !r.refused.length, r.before.fields, r.after.fields, r.refused]; }],
  ["A change of the whole text of a plain-text content control removes the control, and the export allows it",
    async () => { const r = await edit("sdt.docx", "Søren Kjær", "Mette Ørsted"); return [r.after.contentControls.length < r.before.contentControls.length && !r.refused.length, r.before.contentControls, r.after.contentControls, r.refused]; }],
  ["Any edit in a document with a comment that Word wrote makes the export refuse",
    async () => { const r = await edit("comment.docx", "Another paragraph", "Another line"); return [r.refused.length > 0, r.before.comments, r.after.comments, r.refused]; }],
  ["Any edit in a document with a Word table of contents makes the export refuse, and the first PAGEREF is missing",
    async () => { const r = await edit("toc.docx", "Body text of scope", "Body text of the scope"); return [r.refused.length > 0, r.before.fields, r.after.fields, r.refused]; }],
  ["Any edit replaces every style ID with a number",
    async () => { const r = await edit("plain.docx", "Second paragraph", "Other paragraph"); return [r.after.styleIds.every(id => /^\d+$/.test(id)), r.before.styleIds.slice(0, 3), r.after.styleIds.slice(0, 3), r.refused]; }],
  ["Any edit writes the package without compression",
    async () => { const r = await edit("plain.docx", "Second paragraph", "Other paragraph"); return [r.after.package.stored.length > 0, r.before.package.bytes, r.after.package.bytes, r.refused]; }],
  ["Any edit in a document with footnotes drops the separator footnotes, and the export allows it",
    async () => { const r = await edit("footnote.docx", "A claim", "One claim"); return [r.after.noteSeparators < r.before.noteSeparators && !r.refused.length, r.before.noteSeparators, r.after.noteSeparators, r.refused]; }],
  ["Any edit turns a simple field into a complex field with the same code (no loss)",
    async () => { const r = await edit("simple-field.docx", "Another paragraph", "Another line"); return [r.after.simpleFields.length < r.before.simpleFields.length, r.before.simpleFields, r.after.simpleFields, r.refused]; }],
  // The engine calls that Ternleaf needs, as they behave now.
  ["The fields of a paragraph in a table cell cannot be located: the assistant read gives the table",
    async () => {
      // The same REF field in a body paragraph (ref-field.docx) and in a cell.
      const read = async file => {
        const doc = open(await readFile(join(folder, file)));
        try {
          const [node] = JSON.parse(doc.searchableText()).find(([, text]) => text.startsWith("See table"));
          const block = JSON.parse(doc.aiRead(JSON.stringify({ tool: "read", start: node, maxTokens: 1 }), "read")).value.blocks[0];
          return { kind: block.kind, fields: (block.fields ?? []).map(field => field.instruction) };
        } finally { doc.free(); }
      };
      const [body, cell] = [await read("ref-field.docx"), await read("cell-field.docx")];
      return [cell.kind !== "paragraph" || !cell.fields.length, body, cell, []];
    }],
  ["A tracked replacement with a line break keeps the break as a character in one paragraph",
    async () => {
      const doc = open(await readFile(join(folder, "plain.docx")));
      try {
        const before = JSON.parse(doc.searchableText()).length;
        const [node, value] = JSON.parse(doc.searchableText()).find(([, text]) => text.includes("Second paragraph"));
        doc.setTrackRevisions(true, node, 0);
        doc.suggestReplace(node, 0, Buffer.byteLength(value), "Second\nThird", "Reviewer", null, null).free();
        const after = JSON.parse(doc.searchableText());
        return [after.length === before, before, after.length, []];
      } finally { doc.free(); }
    }],
];

for (const [name, run] of cases) {
  try {
    const [present, before, after, refused] = await run();
    console.log(`${present ? "present" : "fixed  "}  ${name}\n         source: ${JSON.stringify(before)}\n         export: ${JSON.stringify(after)}\n         refused: ${JSON.stringify(refused)}`);
  } catch (error) {
    console.log(`error    ${name}: ${error.message}`);
  }
}

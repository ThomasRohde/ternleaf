// The zip writer that compresses an edited Word export, checked against
// Node's zlib and against the engine itself.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { crc32, inflateRawSync } from "node:zlib";
import { compressZip, fieldCounts, isStored, readZip } from "../apps/editor/zip.mjs";
import { readEngineModule } from "./wasm.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const encoder = new TextEncoder();

// A stored zip, written the simple way, as the reference input.
function storedZip(files) {
  const parts = [];
  const directory = [];
  let offset = 0;
  for (const [name, text] of files) {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(text);
    const head = Buffer.alloc(30);
    head.writeUInt32LE(0x04034b50, 0); head.writeUInt16LE(20, 4); head.writeUInt16LE(0, 8);
    head.writeUInt16LE(0x6000, 10); head.writeUInt16LE(0x5a21, 12);
    head.writeUInt32LE(crc32(data), 14); head.writeUInt32LE(data.length, 18); head.writeUInt32LE(data.length, 22);
    head.writeUInt16LE(nameBytes.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x6000, 12); central.writeUInt16LE(0x5a21, 14);
    central.writeUInt32LE(crc32(data), 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBytes.length, 28); central.writeUInt32LE(offset, 42);
    parts.push(head, nameBytes, data);
    directory.push(central, nameBytes);
    offset += 30 + nameBytes.length + data.length;
  }
  const size = directory.reduce((sum, item) => sum + item.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(size, 12); end.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...parts, ...directory, end]));
}

// Read a zip from its local headers, as a reader that ignores the central
// directory does, and inflate each entry with zlib.
function readLocal(bytes) {
  const buffer = Buffer.from(bytes);
  const files = [];
  for (let at = 0; buffer.readUInt32LE(at) === 0x04034b50;) {
    const method = buffer.readUInt16LE(at + 8);
    const crc = buffer.readUInt32LE(at + 14);
    const packed = buffer.readUInt32LE(at + 18);
    const size = buffer.readUInt32LE(at + 22);
    const nameLength = buffer.readUInt16LE(at + 26);
    const extra = buffer.readUInt16LE(at + 28);
    const name = buffer.subarray(at + 30, at + 30 + nameLength).toString("utf8");
    const data = buffer.subarray(at + 30 + nameLength + extra, at + 30 + nameLength + extra + packed);
    const content = method === 8 ? inflateRawSync(data) : Buffer.from(data);
    assert.equal(content.length, size, name);
    assert.equal(crc32(content), crc, name);
    files.push({ name, method, content: content.toString("utf8") });
    at += 30 + nameLength + extra + packed;
  }
  return files;
}

test("compressZip keeps the order, the names and the contents, and compresses", async () => {
  const files = [["[Content_Types].xml", "<Types>" + "<Default/>".repeat(200) + "</Types>"],
    ["word/document.xml", "<w:document>" + "<w:p><w:r><w:t>Æble og ø</w:t></w:r></w:p>".repeat(300) + "</w:document>"],
    ["word/empty.xml", ""], ["customXml/item1.xml", "x"]];
  const input = storedZip(files);
  assert(isStored(input));
  const output = await compressZip(input);
  assert(output.length < input.length / 5, `${output.length} of ${input.length}`);
  const read = readLocal(output);
  assert.deepEqual(read.map(file => [file.name, file.content]), files);
  assert.deepEqual(read.map(file => file.method), [8, 8, 0, 0], "an empty or tiny entry stays stored");
  assert.deepEqual(readZip(output).map(entry => [entry.name, entry.time, entry.date]), files.map(([name]) => [name, 0x6000, 0x5a21]));
  // Twice is the same as once.
  assert.deepEqual(await compressZip(output), output);
});

test("an edited Word export is stored, and its compressed copy opens with the same text", async () => {
  const webapp = join(root, "engine/prebuilt/webapp");
  const { initSync, open } = await import(pathToFileURL(join(webapp, "pkg/casual_doc_wasm.js")));
  initSync({ module: await readEngineModule(webapp) });
  const doc = open(await readFile(join(root, "examples/welcome-to-ternleaf.docx")));
  try {
    const [node, text] = JSON.parse(doc.searchableText()).find(([, value]) => value.length > 10);
    doc.replaceSelection(node, 0, node, Buffer.byteLength(text.slice(0, 4)), "Æøå ").free();
    const output = doc.exportAs("org.openxmlformats.wordprocessingml.document", "preserve_when_safe");
    let edited;
    try { edited = output.bytes; } finally { output.free(); }
    assert(isStored(edited), "the engine stores the entries of an edited export");
    const packed = await compressZip(edited);
    assert(packed.length * 4 < edited.length, `${packed.length} of ${edited.length}`);
    assert.deepEqual(readLocal(packed).map(file => [file.name, file.content]), readLocal(edited).map(file => [file.name, file.content]));
    const again = open(packed);
    try { assert.equal(again.searchableText(), doc.searchableText()); } finally { again.free(); }
    assert.deepEqual(await fieldCounts(packed), await fieldCounts(edited));
  } finally { doc.free(); }
});

test("fieldCounts counts a simple and a complex field the same way, by story", async () => {
  const body = '<w:p><w:fldSimple w:instr=" FILENAME "/><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText>REF a</w:instrText></w:r>'
    + '<w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r><w:sdt><w:sdtPr/></w:sdt></w:p>';
  const counts = await fieldCounts(storedZip([["word/document.xml", body], ["word/footer2.xml", '<w:fldSimple w:instr="PAGE">'],
    ["word/styles.xml", '<w:fldSimple w:instr="PAGE">']]));
  assert.deepEqual(counts, { body: { fields: 2, controls: 1 }, footer: { fields: 1, controls: 0 } });
});

// A small reader and writer for the zip packages of Word files.
//
// The engine writes an edited DOCX with every entry stored, without
// compression, so the file is about 15 times the size of the source.
// `compressZip` writes the same entries again, in the same order, with the
// same names and the same contents, and compresses each stored entry. The
// browser and Node.js both have CompressionStream, so this module has no
// dependency. `fieldCounts` reads the parts of a package that can hold
// fields, so that the editor can see that an edit would lose one.

const LOCAL = 0x04034b50;
const CENTRAL = 0x02014b50;
const END = 0x06054b50;
const STORED = 0;
const DEFLATED = 8;

// Read the central directory. Each entry has its name, its method, its
// compressed bytes and the fields that the writer copies.
export function readZip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let at = bytes.length - 22; at >= Math.max(0, bytes.length - 22 - 0xffff); at--) {
    if (view.getUint32(at, true) === END) { end = at; break; }
  }
  if (end < 0) throw new Error("not a zip package");
  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  const entries = [];
  const decoder = new TextDecoder();
  for (let index = 0; index < count; index++) {
    if (view.getUint32(at, true) !== CENTRAL) throw new Error("damaged zip directory");
    const entry = {
      madeBy: view.getUint16(at + 4, true),
      needed: view.getUint16(at + 6, true),
      flags: view.getUint16(at + 8, true),
      method: view.getUint16(at + 10, true),
      time: view.getUint16(at + 12, true),
      date: view.getUint16(at + 14, true),
      crc: view.getUint32(at + 16, true),
      compressedSize: view.getUint32(at + 20, true),
      size: view.getUint32(at + 24, true),
      internal: view.getUint16(at + 36, true),
      external: view.getUint32(at + 38, true),
    };
    const nameLength = view.getUint16(at + 28, true);
    const extraLength = view.getUint16(at + 30, true);
    const commentLength = view.getUint16(at + 32, true);
    const local = view.getUint32(at + 42, true);
    entry.nameBytes = bytes.subarray(at + 46, at + 46 + nameLength);
    entry.name = decoder.decode(entry.nameBytes);
    if (entry.compressedSize === 0xffffffff || entry.size === 0xffffffff || local === 0xffffffff) throw new Error("zip64 is not supported");
    if (view.getUint32(local, true) !== LOCAL) throw new Error("damaged zip entry");
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    entry.data = bytes.subarray(start, start + entry.compressedSize);
    entries.push(entry);
    at += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

async function through(stream, data) {
  const output = new Blob([data]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(output).arrayBuffer());
}

// The uncompressed contents of one entry.
export async function entryContent(entry) {
  if (entry.method === STORED) return entry.data;
  if (entry.method === DEFLATED) return through(new DecompressionStream("deflate-raw"), entry.data);
  throw new Error("unknown zip method " + entry.method);
}

export const isStored = bytes => readZip(bytes).some(entry => entry.method === STORED && entry.size > 0);

// Write the package again with each stored entry compressed. An entry that
// is already compressed keeps its bytes. Nothing else changes: the order,
// the names, the times, the attributes and the checksums are the ones of the
// input, because the contents are the same.
export async function compressZip(bytes) {
  const entries = readZip(bytes);
  const parts = [];
  const directory = [];
  let offset = 0;
  for (const entry of entries) {
    let { method, data } = entry;
    if (method === STORED && entry.size > 0) {
      const packed = await through(new CompressionStream("deflate-raw"), data);
      if (packed.length < data.length) { method = DEFLATED; data = packed; }
    }
    // Bit 3 says that the sizes follow the data. Here they are in the header.
    const flags = entry.flags & ~0x0008;
    const head = new Uint8Array(30 + entry.nameBytes.length);
    const local = new DataView(head.buffer);
    local.setUint32(0, LOCAL, true);
    local.setUint16(4, entry.needed, true);
    local.setUint16(6, flags, true);
    local.setUint16(8, method, true);
    local.setUint16(10, entry.time, true);
    local.setUint16(12, entry.date, true);
    local.setUint32(14, entry.crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, entry.size, true);
    local.setUint16(26, entry.nameBytes.length, true);
    local.setUint16(28, 0, true);
    head.set(entry.nameBytes, 30);
    const central = new Uint8Array(46 + entry.nameBytes.length);
    const record = new DataView(central.buffer);
    record.setUint32(0, CENTRAL, true);
    record.setUint16(4, entry.madeBy, true);
    record.setUint16(6, entry.needed, true);
    record.setUint16(8, flags, true);
    record.setUint16(10, method, true);
    record.setUint16(12, entry.time, true);
    record.setUint16(14, entry.date, true);
    record.setUint32(16, entry.crc, true);
    record.setUint32(20, data.length, true);
    record.setUint32(24, entry.size, true);
    record.setUint16(28, entry.nameBytes.length, true);
    record.setUint16(36, entry.internal, true);
    record.setUint32(38, entry.external, true);
    record.setUint32(42, offset, true);
    central.set(entry.nameBytes, 46);
    parts.push(head, data);
    directory.push(central);
    offset += head.length + data.length;
  }
  const size = directory.reduce((sum, item) => sum + item.length, 0);
  const tail = new Uint8Array(22);
  const end = new DataView(tail.buffer);
  end.setUint32(0, END, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, size, true);
  end.setUint32(16, offset, true);
  return new Uint8Array(await new Blob([...parts, ...directory, tail]).arrayBuffer());
}

// The parts of a Word package that can hold fields and content controls,
// by the kind of story that the engine names (storyKind).
const partKind = name => name === "word/document.xml" ? "body"
  : /^word\/header\d*\.xml$/.test(name) ? "header"
  : /^word\/footer\d*\.xml$/.test(name) ? "footer"
  : name === "word/footnotes.xml" ? "footnote"
  : name === "word/endnotes.xml" ? "endnote" : null;

// For each kind of story: the number of fields (a complex field counts at
// its begin marker, a simple field once, so the two forms count the same)
// and the number of content controls.
export async function fieldCounts(bytes) {
  const counts = {};
  const decoder = new TextDecoder();
  for (const entry of readZip(bytes)) {
    const kind = partKind(entry.name);
    if (!kind) continue;
    const xml = decoder.decode(await entryContent(entry));
    const count = pattern => (xml.match(pattern) ?? []).length;
    const sum = counts[kind] ?? { fields: 0, controls: 0 };
    sum.fields += count(/<w:fldChar\b[^>]*w:fldCharType="begin"/g) + count(/<w:fldSimple\b/g);
    sum.controls += count(/<w:sdt>|<w:sdt\s/g);
    counts[kind] = sum;
  }
  return counts;
}

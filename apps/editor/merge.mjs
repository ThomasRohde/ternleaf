// A copy of the document comes back from Word. Ternleaf knows the revision
// that was exported, so it can tell what changed in Word from what changed
// here since then. The engine compares the exported revision (the base) with
// the copy. This module turns the differences of text and paragraphs into
// suggestions for the ordinary review: one per paragraph of the base, each
// with a find text that occurs once.
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// The revision and the history in the name of a Ternleaf export, for
// example brief-r12-0a1b2c3d4e.docx. A save to the file starts a new history
// at revision 0, so a revision alone does not say which history it is in.
// An export from before histories had names has only the revision.
export function exportedName(fileName) {
  const match = /-r(\d+)(?:-([a-f0-9]{10}))?(?: ?\(\d+\))?\.docx$/i.exec(fileName ?? "");
  return match ? { revision: Number(match[1]), history: match[2]?.toLowerCase() ?? null } : { revision: null, history: null };
}
export const exportedRevision = fileName => exportedName(fileName).revision;

// Paragraph IDs across histories. A new history starts from the file that
// the history before it saved, and the engine gives the paragraphs of that
// file new IDs. `steps` are pairs of paragraph lists ([ID, text] in order):
// the last revision of one history and the first revision of the next. The
// result maps an ID of the first history to the ID of the same paragraph in
// the last one, or is null when a pair does not have the same text, because
// then the next history did not start from the file that was saved.
export function pairParagraphs(steps) {
  let map = null;
  for (const [end, start] of steps) {
    if (end.length !== start.length || end.some(([, text], index) => text !== start[index][1])) return null;
    const step = new Map(end.map(([node], index) => [node, start[index][0]]));
    map = map ? new Map([...map].filter(([, node]) => step.has(node)).map(([from, node]) => [from, step.get(node)])) : step;
  }
  return map ?? new Map();
}

// `comparison` is the engine's comparison of the base (left) with the copy
// (right). `paragraphText(node)` returns the text of a paragraph of the
// base, or null. `blocks` lists the top-level blocks of the base in order:
// the ID of a paragraph, or null for another block such as a table.
//
// The comparison names a removed paragraph by its ID in the base. It names
// an added paragraph only by its place among the blocks of the copy, and the
// IDs of the copy are not the IDs of the base. So the blocks of the two
// sides are paired in order, without the removed and the added ones, and an
// added paragraph goes after the base paragraph of the block before it.
export function suggestionsFromComparison(comparison, paragraphText, blocks = []) {
  const changes = Array.isArray(comparison) ? comparison : comparison?.changes ?? [];
  const byNode = new Map();
  const edit = node => {
    if (!byNode.has(node)) byNode.set(node, { edits: [], added: [] });
    return byNode.get(node);
  };
  const removed = [];
  const added = [];
  let other = 0;
  const top = side => Array.isArray(side?.path) && side.path.length === 1 && side.path[0]?.kind === "block"
    && Number.isSafeInteger(side.path[0].index) ? side.path[0].index : null;
  for (const change of changes) {
    const left = change.left;
    if (change.family === "block" && change.kind === "deletion" && top(left) !== null && left.node) {
      removed.push({ node: left.node, index: top(left), text: change.leftText ?? "" });
      continue;
    }
    if (change.family === "block" && change.kind === "insertion" && top(change.right) !== null) {
      added.push({ index: top(change.right), text: change.rightText ?? "" });
      continue;
    }
    if (change.family !== "text" || !left?.node || !Number.isSafeInteger(left.start) || !Number.isSafeInteger(left.end)) {
      // Formatting, sections, properties and other blocks have no text
      // range in this document. The author sees how many there are.
      if (change.family !== "metadata" && change.family !== "section") other += 1;
      continue;
    }
    edit(left.node).edits.push({ start: left.start, end: left.end, text: change.rightText ?? "" });
  }

  // Pair the blocks that both sides keep. If the counts do not agree, the
  // comparison has a block change that this pairing does not know, and an
  // added paragraph has no safe place.
  const baseCount = comparison?.left?.blocks ?? blocks.length;
  const copyCount = comparison?.right?.blocks;
  const gone = new Set(removed.map(item => item.index));
  const fresh = new Set(added.map(item => item.index));
  const kept = [];
  for (let index = 0; index < baseCount; index++) if (!gone.has(index)) kept.push(index);
  const paired = Number.isSafeInteger(copyCount) && copyCount - fresh.size === kept.length && baseCount === blocks.length;
  const baseOf = new Map();
  for (let index = 0, at = 0; paired && index < copyCount; index++) if (!fresh.has(index)) baseOf.set(index, kept[at++]);
  for (const item of added.sort((a, b) => a.index - b.index)) {
    let before = item.index - 1;
    while (before >= 0 && fresh.has(before)) before -= 1;
    // A paragraph added before the first block of the document has no
    // paragraph before it to carry it.
    const node = paired && before >= 0 ? blocks[baseOf.get(before)] : null;
    if (!node) { other += 1; continue; }
    edit(node).added.push(item.text);
  }

  const suggestions = [];
  for (const [node, { edits, added: lines }] of byNode) {
    const count = edits.length + lines.length;
    const text = paragraphText(node);
    if (typeof text !== "string") { other += count; continue; }
    const bytes = encoder.encode(text);
    const cut = (from, to) => decoder.decode(bytes.subarray(from, to));
    edits.sort((a, b) => a.start - b.start);
    // The window in characters: from the first change to the last one. New
    // paragraphs start at the end of this one, so then the window ends there.
    let to = lines.length ? text.length : cut(0, edits.at(-1).end).length;
    let from = edits.length ? cut(0, edits[0].start).length : to;
    if (!edits.length) while (from > 0 && /\S/.test(text[from - 1])) from -= 1;
    const occurrences = part => part ? text.split(part).length - 1 : 0;
    // Widen the window word by word until its text occurs once.
    while (occurrences(text.slice(from, to)) !== 1 && (from > 0 || to < text.length)) {
      if (from > 0) { from -= 1; while (from > 0 && /\S/.test(text[from - 1])) from -= 1; }
      if (to < text.length) { to += 1; while (to < text.length && /\S/.test(text[to])) to += 1; }
    }
    const find = text.slice(from, to);
    const offset = encoder.encode(text.slice(0, from)).length;
    let replacement = "";
    let at = offset;
    for (const { start, end, text: inserted } of edits) {
      replacement += cut(at, start) + inserted;
      at = end;
    }
    replacement += cut(at, offset + encoder.encode(find).length);
    // A line break in a replacement starts a new paragraph.
    for (const line of lines) replacement += "\n" + line;
    if (!find || find === replacement || /[\r\n\t\uFFFC]/.test(find) || /[\r\t\uFFFC]/.test(replacement)
      || lines.some(line => line.includes("\n")) || lines.length > 30 || find.length > 4000 || replacement.length > 4000) {
      other += count;
      continue;
    }
    suggestions.push({ node, find, replacement });
  }

  // A removed paragraph: all its text is deleted, and the editor joins the
  // empty paragraph to the paragraph before it. The first paragraph, or one
  // after a table, cannot be joined, and an empty one has no text to find.
  // When the paragraph before is removed too, the editor joins to the one
  // before that, so the order of acceptance does not matter.
  for (const { node, index, text } of removed) {
    const before = index > 0 ? blocks[index - 1] : null;
    if (!before || !text || text !== paragraphText(node) || /[\r\n\t\uFFFC]/.test(text) || text.length > 4000) {
      other += 1;
      continue;
    }
    suggestions.push({ node, find: text, replacement: "" });
  }
  return { suggestions, other };
}

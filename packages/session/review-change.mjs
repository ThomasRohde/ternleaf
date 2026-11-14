const utf8 = new TextEncoder();

// The engine addresses paragraph offsets in UTF-8 bytes. Compare by Unicode
// code point so a shared prefix cannot split a surrogate pair.
export function reviewChange({ before, replacement, start }) {
  const original = Array.from(before);
  const revised = Array.from(replacement);
  let first = 0;
  while (first < original.length && first < revised.length && original[first] === revised[first]) first++;
  let oldEnd = original.length;
  let newEnd = revised.length;
  while (oldEnd > first && newEnd > first && original[oldEnd - 1] === revised[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }
  const removed = original.slice(first, oldEnd).join("");
  const offset = start + utf8.encode(original.slice(0, first).join("")).length;
  return { start: offset, end: offset + utf8.encode(removed).length,
    removed, inserted: revised.slice(first, newEnd).join("") };
}

// Does an engine frame do exactly the reviewed change? The store asks this
// before it saves an accepted proposal, so that what the author reviewed is
// what the document gets. `forward` is the list of operations of the frame.
// Three forms are valid:
//  1. A deletion and an insertion of text. This is a change inside text of
//     one formatting.
//  2. The same, with the new text in parts: text, paragraph breaks, and
//     formatting of the new text only. This is a wide change or a change
//     with new paragraphs.
//  3. One update of the review state of the paragraph, with the removed text
//     as a tracked deletion and the new text as a tracked insertion. This is
//     a change that the author accepted in Suggesting mode.
export function frameDoesChange(forward, node, change) {
  if (!Array.isArray(forward) || !forward.length) return false;
  const ops = forward.map(op => Object.entries(op ?? {})[0] ?? []);
  if (ops.length === 1 && ops[0][0] === "UpdateReviewState") {
    const state = ops[0][1];
    if (change.inserted.includes("\n") || state?.comments != null || !Array.isArray(state?.paragraphs)
      || state.paragraphs.length !== 1 || state.paragraphs[0].node !== node) return false;
    const text = inline => inline.type === "run" ? inline.text ?? "" : (inline.inlines ?? []).map(text).join("");
    const tracked = kind => (state.paragraphs[0].inlines ?? []).filter(inline => inline.type === "revision" && inline.kind === kind).map(text);
    return (!change.inserted || tracked("insertion").includes(change.inserted))
      && (!change.removed || tracked("deletion").includes(change.removed));
  }
  let index = 0;
  if (change.removed) {
    const range = ops[0][0] === "DeleteText" ? ops[0][1]?.range : null;
    if (!range || range.start.node !== node || range.end.node !== node
      || range.start.offset !== change.start || range.end.offset !== change.end) return false;
    index = 1;
  }
  // Follow the new text through the operations, part by part.
  let at = { node, offset: change.start };
  let written = "";
  const nodes = new Set([node]);
  for (; index < ops.length; index++) {
    const [kind, value] = ops[index];
    if (kind === "InsertText") {
      if (value?.at?.node !== at.node || value.at.offset !== at.offset || typeof value.text !== "string") return false;
      written += value.text;
      at = { node: at.node, offset: at.offset + utf8.encode(value.text).length };
    } else if (kind === "SplitParagraph") {
      if (value?.at?.node !== at.node || value.at.offset !== at.offset || typeof value.new_id !== "string") return false;
      written += "\n";
      at = { node: value.new_id, offset: 0 };
      nodes.add(value.new_id);
    } else if (kind === "FormatText") {
      const range = value?.range;
      if (!range || !nodes.has(range.start?.node) || !nodes.has(range.end?.node)
        || (range.start.node === node && range.start.offset < change.start)) return false;
    } else return false;
  }
  return written === change.inserted;
}

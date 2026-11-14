// A copy of the document comes back from Word. Ternleaf knows the revision
// that was exported, so it can tell what changed in Word from what changed
// here since then. The engine compares the exported revision (the base) with
// the copy. This module turns the text differences into suggestions for the
// ordinary review: one per paragraph, each with a find text that occurs once.
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// The revision in the name of a Ternleaf export, for example brief-r12.docx.
export function exportedRevision(fileName) {
  const match = /-r(\d+)(?: ?\(\d+\))?\.docx$/i.exec(fileName ?? "");
  return match ? Number(match[1]) : null;
}

// `changes` are the changes of the engine's comparison. `paragraphText(node)`
// returns the text of a paragraph of the base, or null.
export function suggestionsFromComparison(changes, paragraphText) {
  const byNode = new Map();
  let other = 0;
  for (const change of changes ?? []) {
    const left = change.left;
    if (change.family !== "text" || !left?.node || !Number.isSafeInteger(left.start) || !Number.isSafeInteger(left.end)) {
      // New or removed paragraphs, formatting, sections and properties have
      // no text range in this document. The author sees how many there are.
      if (change.family !== "metadata" && change.family !== "section") other += 1;
      continue;
    }
    if (!byNode.has(left.node)) byNode.set(left.node, []);
    byNode.get(left.node).push({ start: left.start, end: left.end, text: change.rightText ?? "" });
  }
  const suggestions = [];
  for (const [node, edits] of byNode) {
    const text = paragraphText(node);
    if (typeof text !== "string") { other += edits.length; continue; }
    const bytes = encoder.encode(text);
    const cut = (from, to) => decoder.decode(bytes.subarray(from, to));
    edits.sort((a, b) => a.start - b.start);
    // The window in characters: from the first change to the last one.
    let from = cut(0, edits[0].start).length;
    let to = cut(0, edits.at(-1).end).length;
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
    for (const edit of edits) {
      replacement += cut(at, edit.start) + edit.text;
      at = edit.end;
    }
    replacement += cut(at, offset + encoder.encode(find).length);
    if (!find || find === replacement || /[\r\n\t￼]/.test(find + replacement) || find.length > 4000 || replacement.length > 4000) {
      other += edits.length;
      continue;
    }
    suggestions.push({ node, find, replacement });
  }
  return { suggestions, other };
}

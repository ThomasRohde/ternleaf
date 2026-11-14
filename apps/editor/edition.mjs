// An edition is a document for one kind of reader that says what another
// document of the project, its reference, says. When the reference changes,
// the edition may be out of date. This module finds the passages of the
// reference that changed between two of its revisions.
//
// Both lists are [paragraph ID, text] in document order. The engine keeps
// the ID of a paragraph through its edits, so a paragraph with the same ID
// and another text is a changed passage.
export function passageChanges(before, after) {
  const clean = list => list.filter(([, text]) => text.trim());
  const old = new Map(clean(before));
  const now = new Map(clean(after));
  const changes = [];
  for (const [node, text] of now) {
    if (!old.has(node)) changes.push({ change: "added", after: text });
    else if (old.get(node) !== text) changes.push({ change: "changed", before: old.get(node), after: text });
  }
  for (const [node, text] of old) if (!now.has(node)) changes.push({ change: "removed", before: text });
  return changes;
}

// The instruction when the author asks Copilot for an update. The author
// sees it in the Review pane.
export const updateInstruction = reference =>
  `Update this edition for the changes in the reference document ${reference}. Keep the length and the voice of this edition.`;

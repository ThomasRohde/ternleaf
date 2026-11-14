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
  // `node` is the paragraph of the reference. A link to a passage of the
  // edition is recorded for it.
  for (const [node, text] of now) {
    if (!old.has(node)) changes.push({ change: "added", after: text, node });
    else if (old.get(node) !== text) changes.push({ change: "changed", before: old.get(node), after: text, node });
  }
  for (const [node, text] of old) if (!now.has(node)) changes.push({ change: "removed", before: text });
  return changes;
}

// The changes of a reference that the author did not check before a save to
// its file (`carried`, as text), with the changes after the save. A passage
// that changed on both sides of the save is one change from the first text
// to the last. A passage that has its first text again is not a change.
export function combinePassages(carried, later) {
  const result = (carried ?? []).map(item => ({ ...item }));
  for (const item of later) {
    const earlier = item.before === undefined ? -1 : result.findIndex(old => old.after !== undefined && old.after === item.before && !old.joined);
    if (earlier < 0) { result.push(item); continue; }
    const old = result[earlier];
    const merged = { change: old.change === "added" ? (item.change === "removed" ? null : "added") : item.change === "removed" ? "removed" : "changed",
      ...(old.before !== undefined ? { before: old.before } : {}), ...(item.after !== undefined ? { after: item.after } : {}),
      ...(item.node ? { node: item.node } : {}), joined: true };
    if (!merged.change || (merged.change === "changed" && merged.before === merged.after)) result.splice(earlier, 1);
    else result[earlier] = merged;
  }
  return result.map(({ joined, ...item }) => item);
}

// The first words of a paragraph, to name it for the author.
export const firstWords = (text, count = 8) => {
  const words = text.trim().split(/\s+/);
  return words.length > count ? words.slice(0, count).join(" ") + " …" : words.join(" ");
};

// The instruction when the author asks Copilot for an update. The author
// sees it in the Review pane.
export const updateInstruction = reference =>
  `Update this edition for the changes in the reference document ${reference}. Keep the length and the voice of this edition.`;

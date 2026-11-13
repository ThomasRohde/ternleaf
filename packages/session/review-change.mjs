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

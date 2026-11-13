// A word-level comparison for the review slip. It shows the author what the
// accepted paragraph will say. The edit that reaches the engine is computed
// separately by reviewChange.

const tokens = text => text.match(/[\p{L}\p{N}\p{M}'’_-]+|\s+|[^\p{L}\p{N}\p{M}\s'’_-]/gu) ?? [];
const isWord = token => /^[\p{L}\p{N}]/u.test(token);

function push(parts, kind, text) {
  if (!text) return;
  const last = parts.at(-1);
  if (last?.kind === kind) last.text += text;
  else parts.push({ kind, text });
}

// When one word replaces one word, show only the changed letters if most of
// the word is the same. Compare by code point, so a surrogate pair stays whole.
function refine(removed, inserted) {
  const a = Array.from(removed);
  const b = Array.from(inserted);
  let head = 0;
  while (head < a.length && head < b.length && a[head] === b[head]) head++;
  let tail = 0;
  while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] === b[b.length - 1 - tail]) tail++;
  const shared = head + tail;
  if (shared < 3 || shared * 2 < Math.min(a.length, b.length)) return null;
  return [
    { kind: "same", text: a.slice(0, head).join("") },
    { kind: "del", text: a.slice(head, a.length - tail).join("") },
    { kind: "ins", text: b.slice(head, b.length - tail).join("") },
    { kind: "same", text: a.slice(a.length - tail).join("") },
  ];
}

export function wordDiff(before, after) {
  const a = tokens(before);
  const b = tokens(after);
  const parts = [];
  if (a.length * b.length > 1_500_000) {
    push(parts, "del", before);
    push(parts, "ins", after);
    return parts;
  }
  const width = b.length + 1;
  const table = new Uint16Array((a.length + 1) * width);
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i * width + j] = a[i] === b[j] ? table[(i + 1) * width + j + 1] + 1
        : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }
  const raw = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) { push(raw, "same", a[i]); i++; j++; }
    else if (j < b.length && (i === a.length || table[i * width + j + 1] > table[(i + 1) * width + j])) { push(raw, "ins", b[j]); j++; }
    else { push(raw, "del", a[i]); i++; }
  }
  for (let index = 0; index < raw.length; index++) {
    const part = raw[index];
    const next = raw[index + 1];
    const pair = part.kind !== "same" && next && next.kind !== "same" && next.kind !== part.kind;
    if (pair) {
      const removed = part.kind === "del" ? part.text : next.text;
      const inserted = part.kind === "ins" ? part.text : next.text;
      const fine = isWord(removed) && isWord(inserted) && !/\s/.test(removed + inserted) ? refine(removed, inserted) : null;
      for (const piece of fine ?? [{ kind: "del", text: removed }, { kind: "ins", text: inserted }]) push(parts, piece.kind, piece.text);
      index++;
    } else push(parts, part.kind, part.text);
  }
  return parts;
}

export const wordCount = text => (text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;

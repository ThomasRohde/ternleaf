// The house rules that Ternleaf checks itself, without a model. The rules
// file names them in a fenced block. Each check returns one line for the
// author and for Copilot: what the rule is and how the document stands.
const count = (number, word) => `${number} ${word}${number === 1 ? "" : "s"}`;
const words = text => text.trim().split(/\s+/).filter(Boolean);
const clip = (text, limit = 60) => text.length > limit ? text.slice(0, limit - 1).trimEnd() + "…" : text;

// facts: { pages, words, paragraphs: [text], headings: [text] }
export function runChecks(checks, facts) {
  return (checks ?? []).map(check => {
    if (check.kind === "max-pages") {
      return { ok: facts.pages <= check.limit,
        text: `Length: ${count(facts.pages, "page")}. The limit is ${check.limit}.` };
    }
    if (check.kind === "max-words") {
      return { ok: facts.words <= check.limit,
        text: `Length: ${count(facts.words, "word")}. The limit is ${check.limit}.` };
    }
    if (check.kind === "max-sentence-words") {
      const long = facts.paragraphs.flatMap(text => text.split(/(?<=[.!?])\s+/))
        .map(sentence => ({ sentence, size: words(sentence).length })).filter(item => item.size > check.limit)
        .sort((a, b) => b.size - a.size);
      return { ok: long.length === 0, text: long.length
        ? `${count(long.length, "sentence")} longer than ${check.limit} words. The longest has ${long[0].size}: "${clip(long[0].sentence)}"`
        : `No sentence is longer than ${check.limit} words.` };
    }
    if (check.kind === "require-heading") {
      const found = facts.headings.some(text => text.toLowerCase().includes(check.heading.toLowerCase()));
      return { ok: found, text: found ? `The heading "${check.heading}" is there.` : `The heading "${check.heading}" is missing.` };
    }
    if (check.kind === "avoid") {
      const escaped = check.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "giu");
      const times = facts.paragraphs.reduce((sum, text) => sum + (text.match(pattern)?.length ?? 0), 0);
      return { ok: times === 0, text: times
        ? `"${check.term}" occurs ${times === 1 ? "once" : times + " times"}.${check.better ? ` Use "${check.better}".` : ""}`
        : `"${check.term}" does not occur.` };
    }
    return { ok: true, text: "" };
  }).filter(result => result.text);
}

// The change record of a document: every change that the author accepted,
// with the request, the reason and the author's note. It is written for a
// reader who was not there, for example a reviewer or an approver.
const line = text => String(text ?? "").replace(/\s+/g, " ").trim();
const quote = text => "> " + (line(text) || "(nothing)");

export function changeRecord({ document, revision, changes, when = new Date() }) {
  const out = [`# Change record: ${document}`, "",
    `Revision ${revision}, written ${when.toISOString().slice(0, 10)}. ${changes.length} accepted ${changes.length === 1 ? "change" : "changes"}.`,
    "", "The author accepted each change below. A change that is not in this record was typed by the author.", ""];
  for (const [index, change] of changes.entries()) {
    out.push(`## ${index + 1}. Revision ${change.revision}`, "",
      change.origin === "word" ? `- Source: ${line(change.prompt)}`
        : `- Request (${change.origin === "chat" ? "from the chat" : "from the canvas"}): ${line(change.prompt)}`);
    if (change.rationale) out.push(`- Copilot's reason: ${line(change.rationale)}`);
    if (change.note) out.push(`- Author's note: ${line(change.note)}`);
    out.push("", "Before:", "", quote(change.before), "", "After:", "", quote(change.replacement), "");
  }
  return out.join("\n");
}

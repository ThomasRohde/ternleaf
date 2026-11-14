// What Copilot learns without a call: a line of context with each chat
// prompt, and advice when a tool call goes around the canvas.
import { isAbsolute, relative, resolve } from "node:path";
import { brief } from "./guide.mjs";

const clip = (text, limit = 160) => text.length > limit ? text.slice(0, limit - 1).trimEnd() + "…" : text;
const count = (number, word) => `${number} ${word}${number === 1 ? "" : "s"}`;

function decision(event) {
  if (event.decision === "accepted") return `accepted "${clip(event.before, 80)}" → "${clip(event.replacement, 80)}" (revision ${event.revision})`;
  if (event.decision === "discarded") return `discarded the proposal for "${clip(event.before, 80)}"`;
  if (event.decision === "dismissed") return `dismissed ${count(event.suggestions, "open suggestion")}`;
  return null;
}

// The context for one chat prompt. `instances` maps a canvas instance ID to
// its host. `state.briefed` is set once the session has the introduction.
// The selected text itself is not in the context: the author did not share
// it with this prompt. ternleaf_status returns it, and the author is told.
export function promptContext(instances, state) {
  const lines = [];
  if (!state.briefed) {
    state.briefed = true;
    lines.push(brief);
  }
  for (const [instanceId, host] of instances) {
    let status;
    try { status = host.status(); } catch { continue; }
    const { document, canvas, request, review } = status;
    const facts = [`revision ${document.revision}`];
    if (canvas.ready) {
      if (canvas.pages) facts.push(count(canvas.pages, "page"));
      if (canvas.words) facts.push(count(canvas.words, "word"));
    }
    const line = [`Ternleaf canvas instance ${JSON.stringify(instanceId)} shows ${JSON.stringify(document.path)} (${facts.join(", ")}).`];
    if (!status.chatAccess) line.push("In this project you work only on requests that the author sends from the canvas.");
    else if (!canvas.ready) line.push("The canvas is loading or hidden.");
    else if (canvas.selection) line.push(`The author has ${count(canvas.selection.text.trim().split(/\s+/).length, "word")} selected: ternleaf_status returns the text.`);
    else line.push("The author has no text selected.");
    if (request) line.push(`A request from the canvas waits for your answer: call ternleaf_read with requestId ${request.requestId}.`);
    if (review) line.push("The author has a review open in the canvas.");
    if (status.failingChecks?.length) line.push(`${count(status.failingChecks.length, "house rule check")} fail: ternleaf_status lists them.`);
    const decided = host.news().map(decision).filter(Boolean);
    if (decided.length) line.push(`Since your last turn the author ${decided.join("; ")}.`);
    line.push("For any work on this document use the canvas actions (invoke_canvas_action). ternleaf_guide explains them.");
    lines.push(line.join(" "));
  }
  return lines.length ? lines.join("\n") : undefined;
}

const readers = /^(view|read|cat|grep|glob|rg|search|find|ls|list|fetch|open)/i;
const shells = /^(bash|sh|shell|powershell|pwsh|terminal|run|exec|command)/i;

// Advice for one tool call before it runs. It returns nothing for a call
// that has nothing to do with Ternleaf.
//  - A write to a Ternleaf project file, or to the document that a canvas
//    shows, needs the author's approval: Ternleaf must be the only writer.
//  - A call that reads the document or the Ternleaf source to get around
//    the canvas gets one line that points to the actions. Once per session.
export function toolAdvice({ toolName, toolArgs }, { project, instances, state }) {
  const name = String(toolName ?? "");
  if (/canvas/i.test(name)) return undefined;
  let args;
  try { args = JSON.stringify(toolArgs ?? "").replaceAll("\\\\", "/"); } catch { return undefined; }
  const reads = readers.test(name);
  const shell = shells.test(name);

  if (/\.ternleaf\/[^"'\s]*\.sqlite/i.test(args) && !reads) {
    return { permissionDecision: "ask",
      permissionDecisionReason: "This call touches a Ternleaf project file in .ternleaf. It holds the saved revisions of a document, and only Ternleaf writes it.",
      additionalContext: "The files in .ternleaf are Ternleaf's own. For the text use ternleaf_read, for the accepted changes ternleaf_history." };
  }

  const open = [];
  for (const host of instances.values()) {
    try {
      const { path } = host.status().document;
      open.push(path, isAbsolute(path) ? relative(project, path).replaceAll("\\", "/") : resolve(project, path).replaceAll("\\", "/"));
    } catch { /* A closing host has no document. */ }
  }
  const touchesOpen = open.some(path => path && args.includes(path));
  if (touchesOpen && !reads && !shell) {
    return { permissionDecision: "ask",
      permissionDecisionReason: "This call writes the Word file that the Ternleaf canvas shows. The canvas keeps the author's revisions apart from that file, and a changed file starts a new history.",
      additionalContext: "Do not edit the .docx file. Propose changes with ternleaf_propose or ternleaf_suggest." };
  }

  if (state.advised) return undefined;
  const source = /(\.github\/extensions\/ternleaf|apps\/(host|editor|agent)\/|packages\/session\/)/.test(args);
  if (instances.size && (touchesOpen || source)) {
    state.advised = true;
    return { additionalContext: touchesOpen
      ? "The .docx file on disk is the original. It does not have the author's saved revisions. For the current text call the canvas action ternleaf_read, for a file ternleaf_export."
      : "If you read this to learn how to work with the Ternleaf canvas, you do not need the source: call the canvas action ternleaf_guide." };
  }
  if (!instances.size && /\.docx\b/i.test(args) && (reads || shell)) {
    state.advised = true;
    return { additionalContext: "For a Word document in this project, prefer the Ternleaf canvas: open_canvas with canvas \"ternleaf\" and input {\"document\": \"<path>\"}, then its actions. Start with ternleaf_guide." };
  }
  return undefined;
}

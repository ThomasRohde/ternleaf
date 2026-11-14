// Plain-language text for the refusal codes of the session store and the
// loopback host. The editor shows `forAuthor`. The canvas actions return
// `forAgent`, so that Copilot can correct a refused call.
const author = {
  "writer-active": "This document is open in another Ternleaf canvas. Close that canvas, then reload.",
  "writer-fenced": "Another canvas took over this document. Reload to continue here.",
  "stale-revision": "The document changed after this request. Reload to get the saved revision.",
  "stale-review": "The document changed after this proposal. Discard it and ask again.",
  "stale-agent-request": "This request is no longer current.",
  "unknown-review": "This request was discarded.",
  "review-closed": "This request is closed.",
  "review-not-accepted": "No accepted change to check.",
  "review-frame-mismatch": "The edit does not match the reviewed proposal. The saved revision is unchanged.",
  "invalid-selection-or-instructions": "Select text within one paragraph and give an instruction.",
  "invalid-editorial-record": "The note is too long. Use 2,000 characters or fewer.",
  "live-agent-unavailable": "Copilot is not connected to this canvas.",
  "agent-unreachable": "Copilot did not take the request. Send it again.",
  "empty-document": "The document has no text to review.",
  "invalid-replacement": "Give text for one paragraph that differs from the original: no line breaks or tabs, at most 4,000 characters.",
  "source-already-set": "This file changed since Ternleaf last opened it.",
  "file-changed-on-disk": "The Word file changed on disk after Ternleaf opened it, so Ternleaf did not write it. Your revisions are saved here. Choose Export DOCX to keep them as a copy, then open the changed file again.",
  "not-a-docx": "The export is not a Word document, so Ternleaf did not write the file. Your revisions are saved here. Reload the canvas, then save again.",
  "review-in-progress": "Accept or discard the open proposal and suggestions first.",
  "document-changed": "This canvas now shows another document.",
  "single-document": "This canvas shows one document.",
  "request-too-large": "That file is too large. Ternleaf opens files up to 64 MB.",
  "invalid-request": "The request was not complete.",
  "publication-unknown": "The save could not be confirmed. Reload to get the saved revision.",
  "authorization": "This canvas lost its connection. Reopen Ternleaf from the Copilot canvas menu.",
};

const agent = {
  "stale-agent-request": "This request is no longer current. The author changed the document, reloaded the canvas or sent a newer request. Do not retry. Tell the author to send the request again from Ternleaf.",
  "unknown-review": "The author discarded this request. Do not retry.",
  "invalid-replacement": "Replacement refused. Give plain text for the same single paragraph: no line breaks, no tabs, at most 4,000 characters, and different from the original text. If no change is necessary, call ternleaf_decline with a reason.",
  "invalid-rationale": "Give a reason of at most 600 characters.",
  "proposal-already-submitted": "This request already has an answer. The author reviews it in the canvas. Do not send another.",
  "invalid-suggestions": "Suggestions refused: no item can go to the author. Give 1 to 60 suggestions. Each needs a paragraph number from ternleaf_read, a find text copied exactly from that paragraph (no line breaks or tabs), and a different replacement or a remark. Correct each item as its reason says.",
  "source-already-set": "This file changed since Ternleaf last opened it. Tell the author to open it with File, Open in the canvas. The canvas asks before it starts a new history.",
  "writer-fenced": "The Ternleaf canvas is not ready. Tell the author to reload the canvas and send the request again.",
  "writer-active": "The Ternleaf canvas is not ready. Wait a few seconds and try once more.",
  "canvas-not-ready": "The Ternleaf canvas does not show the document yet. Wait a few seconds and try once more. If it fails again, tell the author to reload the Ternleaf canvas.",
  "canvas-timeout": "The Ternleaf canvas did not answer in time. Try once more. If it fails again, tell the author to reload the Ternleaf canvas.",
  "canvas-closed": "This Ternleaf canvas is closed. Open it again with open_canvas.",
  "canvas-error": "The Ternleaf canvas could not do this.",
  "document-changed": "The canvas now shows another document. Call ternleaf_status, then read again.",
  "no-selection": "The author has no text selected. Ask the author to select text within one paragraph. Or read the document with ternleaf_read and answer with ternleaf_suggest.",
  "selection-changed": "The text you gave is not the text that is selected now. Call ternleaf_status to get the selection, then send the proposal for that text.",
  "stale-document": "The document changed after you read it. Call ternleaf_read again, then send the suggestions with the new revision number.",
  "stale-revision": "The document changed. Call ternleaf_status, then try again.",
  "review-in-progress": "The author has a proposal or suggestions in the canvas that are not decided. Do not send more now. Tell the author to finish that review, then ask again.",
  "request-waiting": "The author sent a request from the canvas that waits for your answer. Answer it first: call ternleaf_read with its requestId.",
  "invalid-selection-or-instructions": "Give the instructions: the author's request in one or two sentences, at most 2,000 characters.",
  "page-out-of-range": "That page does not exist.",
  "export-needs-author": "This Word export leaves out a legacy part of the original file, and only the author can accept that. Ask the author to choose Export DOCX in the canvas once. The pdf, markdown, html and text formats work now.",
  "export-refused": "Ternleaf cannot write this document as a Word file without losing content. Use the pdf, markdown, html or text format.",
  "chat-access-off": "In this project, Copilot works only on what the author sends from the canvas. You cannot read the document or send proposals for a request from the chat. Tell the author to select the text, or to choose Whole document, in the Review pane and send the request there.",
  "single-document": "This canvas shows one document and has no project folder.",
  "no-reference": "This document is not an edition of another document. Only the author can make it one, in the Review pane menu next to Export DOCX.",
  "invalid-request": "The input is not valid. Read the input schema of the action with list_canvas_capabilities.",
};

// One sentence for the agent: what was refused and what to do next.
export const refusalForAgent = error => [agent[error.code] ?? author[error.code] ?? error.code, error.detail]
  .filter(Boolean).join(" ");

export const forAuthor = code => author[code] ?? code;
export const forAgent = code => agent[code] ?? author[code] ?? code;

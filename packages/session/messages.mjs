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
  "source-already-set": "This project file belongs to a different document.",
  "publication-unknown": "The save could not be confirmed. Reload to get the saved revision.",
  "authorization": "This canvas lost its connection. Reopen Ternleaf from the Copilot canvas menu.",
};

const agent = {
  "stale-agent-request": "This request is no longer current. The author changed the document, reloaded the canvas or sent a newer request. Do not retry. Tell the author to send the request again from Ternleaf.",
  "unknown-review": "The author discarded this request. Do not retry.",
  "invalid-replacement": "Replacement refused. Give plain text for the same single paragraph: no line breaks, no tabs, at most 4,000 characters, and different from the original text. If no change is necessary, call ternleaf_decline with a reason.",
  "invalid-rationale": "Give a reason of at most 600 characters.",
  "proposal-already-submitted": "This request already has an answer. The author reviews it in the canvas. Do not send another.",
  "invalid-suggestions": "Suggestions refused. Give 1 to 60 suggestions. Each needs a paragraph number from ternleaf_read, a find text copied exactly from that paragraph (no line breaks or tabs), and a different replacement.",
  "writer-fenced": "The Ternleaf canvas is not ready. Tell the author to reload the canvas and send the request again.",
};

export const forAuthor = code => author[code] ?? code;
export const forAgent = code => agent[code] ?? author[code] ?? code;

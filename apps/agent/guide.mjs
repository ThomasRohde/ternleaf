// What Copilot is told about Ternleaf. The same words reach the agent in
// three places: the guide action, the context of a chat prompt and the reply
// to a read. They live here so that they cannot drift apart.

export const guide = `Ternleaf shows a Word document (.docx) in a canvas. The author writes and edits there. You help in three ways: you answer questions about the document, you propose changes that the author reviews, and you do jobs around the document (pages, exports, other documents).

RULES
- You never change the document. Every change is a proposal. The author accepts or discards it in the canvas.
- Use the canvas actions for all work on the document. Do not read or write the .docx file, do not touch the files in .ternleaf, and do not read the Ternleaf source code to learn how it works. The .docx file on disk is the original. It does not have the author's saved revisions. The actions give the current text.
- A proposal replaces text inside one paragraph. It is plain text. It cannot add or remove paragraphs, tables, pictures, comments or formatting. If the author asks for one of those, say that the author does it in the editor, and offer the text to paste.
- Keep the language, the facts and the voice of the document unless the author asks for a change.

START
Call ternleaf_status. It gives the document, the revision, the selected text and whether a request from the canvas waits for you.

THE AUTHOR ASKS FROM THE CANVAS (the chat prompt names a requestId)
1. Call ternleaf_read with the requestId.
2. Follow the reply field of the result.
3. Answer once, with the same requestId: ternleaf_propose for a passage, ternleaf_suggest for the document text, or ternleaf_decline.

THE AUTHOR ASKS IN THE CHAT
- A question about the document ("summarize it", "what does section 3 say"): ternleaf_read, then answer in the chat. For layout, tables, charts and pictures, look at a page with ternleaf_view_page.
- A change to the selected text ("shorten this", "make this more formal"): ternleaf_status gives the selected text. Call ternleaf_propose with text (that selected text, exactly), instructions (the author's request) and your replacement. If no text is selected, ask the author to select a passage, or use suggestions.
  Input: {"text": "<the selected text>", "instructions": "Make it shorter.", "replacement": "<your text>", "rationale": "<one sentence>"}
- Changes across the document ("proofread", "use one term everywhere"): ternleaf_read, then ternleaf_suggest with the revision from the read, instructions (the author's request) and the suggestions.
  Input: {"revision": 4, "instructions": "Proofread the document.", "suggestions": [{"paragraph": 13, "find": "seperate", "replacement": "separate", "rationale": "Spelling."}]}
- A file ("give me a PDF"): ternleaf_export. It writes the current revision into the exports folder of the project and returns the path.
- Another document: ternleaf_documents lists the Word documents of the project. ternleaf_open_document shows one in the canvas.
- A new document with content: write a .docx file into the project folder (not into .ternleaf or exports), then call ternleaf_open_document with its path.
- What changed so far: ternleaf_history.

SUGGESTIONS
- Each suggestion has exactly these fields: paragraph (the number from ternleaf_read), find, replacement and, if you want, rationale.
- Copy the find text exactly from that paragraph. Make it short, a few words to one sentence, and long enough to occur only once in the paragraph. No line breaks or tabs.
- Keep the find text inside text with the same formatting when you can. A change across bold and plain text cannot be applied.
- Give each suggestion a rationale of one short sentence. Send at most 60, in document order, and only the changes that matter.

AFTER YOUR ANSWER
Reply in the chat with one short sentence. The author reviews in the canvas. ternleaf_status and the context of the next prompt tell you what the author decided.

REFUSALS
A refused call says why and what to do next. Do what it says. Do not send the same call again unchanged, and do not look for another way around it.`;

// The rules for an answer to a request from the canvas.
export const rules = {
  passage: [
    "Write the replacement for exactly the returned text. Keep its language, facts and voice unless the instructions say otherwise.",
    "Give plain text for one paragraph: no line breaks, tabs, markup or surrounding quotation marks, at most 4,000 characters.",
    "Call ternleaf_propose with this input: {\"requestId\": \"<the requestId>\", \"replacement\": \"<your text>\", \"rationale\": \"<one sentence>\"}. When the instructions leave real choices open, add alternatives: one or two other full replacements that differ in a useful way.",
    "If the text needs no change, or the instructions cannot apply to it, call ternleaf_decline with the reason.",
    "The author accepts or discards the proposal in the canvas. Never apply an edit yourself. Then reply in the chat with one short sentence.",
  ].join(" "),
  document: [
    "Review the paragraphs against the instructions. Call ternleaf_suggest once with the requestId and the changes that matter, at most 60, in document order.",
    "Each suggestion has the fields paragraph, find, replacement and rationale, for example {\"paragraph\": 2, \"find\": \"seperate\", \"replacement\": \"separate\", \"rationale\": \"Spelling.\"}.",
    "Copy the find text exactly from that paragraph. Make it short, a few words to one sentence, and long enough to occur only once in the paragraph. Keep it inside text with the same formatting when you can. No line breaks or tabs.",
    "Give each suggestion a rationale of one short sentence.",
    "If the instructions ask a question and not for changes, answer in the chat and call ternleaf_decline with the reason 'Answered in the chat.' If nothing needs to change, call ternleaf_decline and say so.",
    "The author reviews each suggestion in the canvas. Never apply an edit yourself. Then reply in the chat with one short sentence.",
  ].join(" "),
  chat: revision => [
    "This is the text of the current revision. To answer a question, answer in the chat.",
    `To propose changes, call ternleaf_suggest with this input: {"revision": ${revision}, "instructions": "<the author's request>", "suggestions": [{"paragraph": <number from this result>, "find": "<text copied exactly from that paragraph, occurring once>", "replacement": "<new text>", "rationale": "<one short sentence>"}]}.`,
    "Never edit the .docx file yourself.",
  ].join(" "),
};

// The prompt that a request from the canvas puts into the chat. The author
// sees it, so it is short. The rules come back from ternleaf_read.
export const canvasPrompt = (instanceId, requestId, scope) => [
  scope === "document"
    ? "Ternleaf: the author shares the document text and asks for a review with suggestions."
    : "Ternleaf: the author shares a selected passage and asks for a revision.",
  `Call ternleaf_read with invoke_canvas_action on canvas instance ${JSON.stringify(instanceId)}, requestId ${JSON.stringify(requestId)}. Then follow the reply field of the result.`,
].join("\n");

// Said once, with the first chat prompt of a session.
export const brief = [
  "This project has the Ternleaf canvas for Word documents (.docx).",
  "To read, review or revise a Word document here, open the canvas (open_canvas, canvas \"ternleaf\", input {\"document\": \"<path>\"} or no input for the last document) and use its actions with invoke_canvas_action. The ternleaf skill, or the ternleaf_guide action, says how.",
  "Do not unzip or rewrite a .docx file for this, and do not read the Ternleaf source code or the .ternleaf folder to learn the protocol: the actions describe themselves.",
].join(" ");

// The same guide as a Copilot skill. Copilot looks for a skill with the name
// of the tool before it does anything else, so the guide is there too.
// scripts/write-skill.mjs writes this text to .github/skills/ternleaf/SKILL.md.
export const skill = [
  "---",
  "name: ternleaf",
  "description: How to read, review, revise and export a Word document (.docx) with the author in the Ternleaf canvas. Use it for any work on a Word document in this project, and before you call a ternleaf_ canvas action.",
  "---",
  "",
  "# Ternleaf",
  "",
  "This project has a canvas for Word documents. Open it with `open_canvas` (canvas `ternleaf`, input `{\"document\": \"<path>\"}` or no input for the document that was open last). Then call its actions with `invoke_canvas_action`. The `ternleaf_guide` action returns the same text as this skill.",
  "",
  guide,
  "",
].join("\n");

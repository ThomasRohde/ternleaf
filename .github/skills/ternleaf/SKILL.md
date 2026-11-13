---
name: ternleaf
description: How to read, review, revise and export a Word document (.docx) with the author in the Ternleaf canvas. Use it for any work on a Word document in this project, and before you call a ternleaf_ canvas action.
---

# Ternleaf

This project has a canvas for Word documents. Open it with `open_canvas` (canvas `ternleaf`, input `{"document": "<path>"}` or no input for the document that was open last). Then call its actions with `invoke_canvas_action`. The `ternleaf_guide` action returns the same text as this skill.

Ternleaf shows a Word document (.docx) in a canvas. The author writes and edits there. You help in three ways: you answer questions about the document, you propose changes that the author reviews, and you do jobs around the document (pages, exports, other documents).

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
A refused call says why and what to do next. Do what it says. Do not send the same call again unchanged, and do not look for another way around it.

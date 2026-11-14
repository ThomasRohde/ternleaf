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
- A proposal replaces text inside one paragraph. It is plain text. A line break in the replacement starts a new paragraph, so you can add paragraphs: to draft new text, replace the end of the paragraph before it. A proposal cannot remove or join paragraphs, and it cannot add tables, pictures or formatting. If the author asks for one of those, say that the author does it in the editor.
- When the author works in Suggesting mode (ternleaf_status: suggestingMode), an accepted proposal becomes a Word tracked change. Then keep each change small, and do not add paragraphs.
- Keep the language, the facts and the voice of the document unless the author asks for a change.

HOUSE RULES
A project can have house rules: what a document here must follow, in the team's own words. ternleaf_read returns them in houseRules. Follow them in every proposal, and check the text against them in every review. Name the rule in the rationale or the remark when a change comes from one. When the house rules and the author's instruction disagree, the instruction wins.
Ternleaf checks some rules itself, such as a length limit or a word to avoid. ternleaf_status and ternleaf_read return the checks that fail now in failingChecks. The author sees them too. In a review, propose changes that make them pass.

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
- A length ("fit this to two pages", "cut 100 words"): ternleaf_read, write the cuts, then ternleaf_measure with them. It returns the real pages and words after the changes. Change the list until the length is right, then send it with ternleaf_suggest. Keep the decisions, the numbers and the conditions of the document. Never propose a smaller font, margin or picture to make a length.
- A review against the house rules or for quality ("review this", "is this ready to send"): ternleaf_read, then ternleaf_suggest with changes where new text solves the problem and remarks where it does not.
- A file ("give me a PDF"): ternleaf_export. The format "changes" writes the change record: every accepted change with the request, the reason and the author's note. It writes the current revision into the exports folder of the project and returns the path.
- Another document: ternleaf_documents lists the Word documents of the project. ternleaf_open_document shows one in the canvas.
- A new document with content: write a .docx file into the project folder (not into .ternleaf or exports), then call ternleaf_open_document with its path.
- What changed so far: ternleaf_history.

SUGGESTIONS
- Each suggestion has exactly these fields: paragraph (the number from ternleaf_read), find, replacement and, if you want, rationale.
- Copy the find text exactly from that paragraph. Make it short, a few words to one sentence, and long enough to occur only once in the paragraph. No line breaks or tabs.
- Keep the find text inside text with the same formatting when you can. A change across bold and plain text, can be applied: the new text gets the formatting of the first replaced word, and the author gets a warning. A change over one whole bold phrase keeps the bold. A change cannot touch a link, a tab or a line break.
- Give each suggestion a rationale of one short sentence. Send at most 60, in document order, and only the changes that matter.
- A remark has paragraph, find and remark, and no replacement: {"paragraph": 4, "find": "saves 2 million a year", "remark": "This number has no source. Add where it comes from."}. Use a remark when no replacement text can solve the problem: a claim without a source, a contradiction between two paragraphs, a missing owner or date, a rule that needs the author's knowledge. Do not use a remark for something that you can fix with a change.

AFTER YOUR ANSWER
Reply in the chat with one short sentence. The author reviews in the canvas. ternleaf_status and the context of the next prompt tell you what the author decided.

REFUSALS
A refused call says why and what to do next. Do what it says. Do not send the same call again unchanged, and do not look for another way around it.

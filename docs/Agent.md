# Copilot's side of Ternleaf

This page is for people who want to know what Copilot can do with a Ternleaf canvas, and for people who change that part of the code.

Copilot does not need to read this page, or the source code, to do its work. Everything that it needs reaches it through Copilot's own channels: the description of the canvas, the actions with their input schemas, a skill and a guide action with the same text, a line of context with each prompt, and a clear sentence with each refusal.

## Two ways to ask

**From the canvas.** The author selects a passage, or chooses **Whole document**, and sends an instruction from the Review pane. Ternleaf saves the request and posts a short prompt to the chat. The prompt names a request ID. Copilot reads what the author shared and answers that request.

**From the chat.** The author types in the Copilot chat, for example "Proofread the document" or "Make the selected sentence shorter". No request exists yet. Copilot reads the current text through the canvas and sends a proposal or a list of suggestions. The Review pane shows them with the label **From the chat**.

Both ways end in the same place: a proposal that the author accepts, edits or discards. No action changes the document.

## The actions

Copilot calls an action with `invoke_canvas_action` on an open canvas instance.

| Action | What it does |
| --- | --- |
| `ternleaf_guide` | Returns the rules, the steps for each kind of request and the limits. |
| `ternleaf_status` | Returns the open document, its revision, the selected text, a request that waits and a review that is not finished. |
| `ternleaf_read` | With a request ID: what the author shared for that request. Without one: the text of the current revision in numbered paragraphs, with heading levels. A long document comes in parts. |
| `ternleaf_propose` | Proposes a replacement for one passage, with a reason and up to two alternatives. With a request ID it answers that request. Without one it is for the text that the author has selected now. |
| `ternleaf_suggest` | Sends up to 60 suggested changes and remarks. A change names a paragraph number, a find text and a replacement. A remark names the text and says what Copilot noticed, with no replacement. For an edition, a change can name the change of the reference that it answers. Each item that the author could not accept comes back in `refused` with the reason. |
| `ternleaf_measure` | Lays out a copy of the document with a list of changes and returns the real pages and words, now and after. Nothing is saved. |
| `ternleaf_decline` | Answers a request from the canvas without a change, with a reason. |
| `ternleaf_view_page` | Returns a picture of one page, for questions about layout, tables, charts and pictures. |
| `ternleaf_export` | Writes the current revision as `docx`, `pdf`, `markdown`, `html` or `text` into the `exports` folder of the project and returns the path. The format `changes` writes the change record. |
| `ternleaf_reference_changes` | For an edition: the passages of its reference document that changed since the author last checked, with the text before and after, an identifier for each change and the paragraph of the edition that it is linked to. |
| `ternleaf_documents` | Lists the Word documents of the project folder. |
| `ternleaf_open_document` | Shows another document of the project in the canvas. |
| `ternleaf_history` | Returns the accepted changes: the request, the text before and after, and the author's note. |

The definitions are in [`apps/agent/actions.mjs`](../apps/agent/actions.mjs). Each action is a name, a description, an input schema and one function of the host. A test checks that every action and every input field has a description, and that the guide and this page name every action.

## What Copilot knows without a call

**With each chat prompt.** While a canvas is open, the extension adds one line of context to the prompt: which document the canvas shows, its revision, pages and words, whether text is selected, whether a request waits, and what the author decided since Copilot's last turn. The selected text itself is not in that line. Copilot gets it from `ternleaf_status`, and the author is told.

**With the first prompt of a session.** One short paragraph says that the project has a canvas for Word documents and how to open it.

**From the skill.** Copilot looks for a skill with the name of a tool before it uses the tool. [`.github/skills/ternleaf/SKILL.md`](../.github/skills/ternleaf/SKILL.md) is that skill. It has the same text as the `ternleaf_guide` action, with an example input for each kind of answer. [`scripts/write-skill.mjs`](../scripts/write-skill.mjs) writes it from the guide, and a test fails when the two differ.

**With each refusal.** A refused action returns one sentence that says what was wrong and what to do next, for example "The document changed after you read it. Call ternleaf_read again, then send the suggestions with the new revision number."

## House rules, remarks and length

**House rules.** `ternleaf.rules.md` in the project folder holds what a document must follow. `ternleaf_read` returns the text in `houseRules`, for a request from the canvas and from the chat. The guide tells Copilot to follow the rules, to check against them, and to name the rule in its reason. The author's instruction wins over a rule.

**Remarks.** An item of `ternleaf_suggest` can have a `remark` in place of a `replacement`. The store keeps it as a suggestion of the kind "remark". It cannot become a proposal, and it never changes the document. The author reads it and chooses **Done**.

**How a change is applied.** The editor applies an accepted change in one of five ways, and each makes one revision: a plain replacement inside text of one formatting, a replacement in parts (text, paragraph breaks and the formatting of the new text), a tracked replacement in Suggesting mode, the removal of a whole paragraph, or the fill of a content control. `frameDoesChange` in [`review-change.mjs`](../packages/session/review-change.mjs) is the store's check that the engine's edit is exactly the reviewed change. The preview asks the same question on a copy of the document, before the author sees the proposal.

**What a change must keep.** The engine gives the result of a field and the text of a content control as plain text, and a replacement over them removes the field or the control without a report. So the editor checks each change ([`structure.mjs`](../apps/editor/structure.mjs)) and refuses, with a sentence that says what to do:

- a change that touches a link, a tab, a line break or an object;
- a change that overlaps the result of a field, such as a cross-reference, a caption number or a page number. The engine's assistant read gives the fields of a paragraph and their results. For a paragraph in a table cell it does not, so the preview exports the copy with the change and counts the fields and the content controls of the part. That check costs two exports, about 10 to 45 ms on the corpus of [Word fidelity](Word-Fidelity.md#documents-with-real-structure), and runs only when the part has a field or a control;
- a change in an entry of a table of contents. The author changes the heading, and Word writes the entry again;
- a change that crosses the edge of a content control, or that removes all its text.

A change of all the text of a plain-text, combo box or drop-down control fills the control (`fillContentControl`), so the control stays. A drop-down list takes only one of its choices. A change that removes all the text of a paragraph removes the paragraph when the paragraph before it is in the same story (the body, a header or footer, a note) and the same table cell. Otherwise only the text goes, and the review says so. [Requests for the engine](Engine-Requests.md) lists what the engine must do so that these refusals become changes.

`ternleaf_suggest` applies the same checks: it sends the changes to the editor as a job and refuses each change that the author could not accept, with the reason, before the author sees the list. One bad item never fails the whole list: the host refuses each item on its own, for example a find text with a tab or a line break.

In Suggesting mode, a change with a line break is refused, and the author is told to switch to Editing or to remove the line break. The prebuilt engine has no call that makes a tracked change with a new paragraph in one revision. `suggestReplace` and `suggestInsert` keep a line break as a character inside the paragraph. `pasteRichRuns` makes the paragraph break, but not as a tracked change. `suggestSplit` tracks a paragraph break without text. An AI turn (`aiTurnReplace`, `aiTurnWrite`) makes the right tracked change, but in three or more revisions and with the author "Casual AI". `applyDiffAsRevisions` cannot mark a new paragraph, and it refuses a document that has tracked changes. The engine needs one call that makes the tracked deletion, the tracked paragraph break and the tracked new text as one edit, for example `suggestReplace` that reads a line break as a paragraph break. Then the store gets a sixth form.

**Checks.** A block with the name `ternleaf` in the rules file holds rules with a fixed form. The editor checks them after every change ([`checks.mjs`](../apps/editor/checks.mjs)), shows the failing ones to the author and reports them with the pulse. `ternleaf_status` and `ternleaf_read` return them in `failingChecks`.

**Length.** `ternleaf_measure` sends the changes to the editor as a job. The editor opens a copy of the source, replays the journal, applies each change with the same checks as a real proposal, and returns the page and word counts. A change that cannot be applied comes back with the reason, so Copilot can correct its list before the author sees it.

## Editions

A document can be an edition of another document of the project, its reference. The author makes the link in the menu next to **Export DOCX**. The record is in `.ternleaf/editions.json`: the reference, and the revision of the reference that the author last checked the edition against.

The editor gets the reference's source and saved edits from the host, builds the checked revision and the newest one in a copy, and compares their paragraphs ([`edition.mjs`](../apps/editor/edition.mjs)). The engine keeps the ID of a paragraph through its edits, so a paragraph with the same ID and another text is a changed passage. The Review pane lists the changed passages. `ternleaf_status` gives Copilot the count, and `ternleaf_reference_changes` gives it the text.

A save of the reference to its Word file starts its history again at revision 0. The passages that the author had not checked yet stay in the edition record as text, and the Review pane and `ternleaf_reference_changes` show them with the changes after the save. [Architecture](Architecture.md#save-to-the-file) describes how.

Which passage of the edition says the same thing as a changed passage of the reference is Copilot's judgement. It names the passage in its reason, and the author checks it. Only the author can mark the edition as checked.

**Passage links.** `ternleaf_reference_changes` gives each change an identifier, such as `c1`. A suggestion of `ternleaf_suggest` can name the change that it answers in `answers`. The host keeps which paragraph of the reference each identifier stands for, so Copilot never names a paragraph of the reference itself, and a name that the last result does not have is refused. When the author accepts such a suggestion, the host records a link from the paragraph of the reference to the paragraph of the edition in `.ternleaf/editions.json`. Copilot's word alone records nothing: the link comes from the accepted review. The next time that paragraph of the reference changes, the Review pane shows "Linked to:" with the first words of the paragraph of the edition, and `ternleaf_reference_changes` gives it in `linkedTo`, with its paragraph number. The guide tells Copilot to start there, and that a link is evidence, not proof: the edition can have changed since. A check of the edition keeps the links. A new reference ends them. A save to the file gives the paragraphs new IDs, and the editor sends the pairs of old and new IDs with the save, so the links follow.

## Save to the file

Only the author can write the current revision into the `.docx` file, with **Save to the Word file…** in the canvas. No action saves, and Copilot must not write the file itself. `ternleaf_status` returns `unsavedRevisions`, the number of revisions that are not in the `.docx` on disk yet, and the guide tells Copilot that the file has the text of the last save only. So Copilot can tell the author that a save is due, for example before a pull request. [Architecture](Architecture.md#save-to-the-file) describes the save.

## What keeps Copilot on the canvas

An agent that does not know how to do a task looks for another way: it unzips the `.docx` file, queries the SQLite file or reads the source code. Each of these gives a wrong result or a broken project. The `.docx` on disk has the text of the last save to the file, without the revisions after it.

The extension uses the `onPreToolUse` hook of the SDK for this:

- A tool call that writes a file in `.ternleaf`, or the `.docx` file that a canvas shows, needs the author's approval. The author sees the reason.
- A tool call that reads the open `.docx`, or the Ternleaf source while a canvas is open, gets one line of advice that points to the actions. The call still runs. The advice is given once in a session.

The code is in [`apps/agent/context.mjs`](../apps/agent/context.mjs).

## What the author sees

- A notice in the canvas each time Copilot reads the document text or the selected text, looks at a page or exports a file.
- The label **From the chat** on a proposal or a suggestion list that began in the chat, in the Review pane and in the history.
- The same review as for a request from the canvas: the changed words, the reason, the page before and after.

Copilot does not replace work that the author has not finished. While a proposal or open suggestions wait in the canvas, an answer from the chat is refused, and Copilot is told to wait.

## Turn off access from the chat

A project can keep Copilot to the requests that the author sends from the canvas. Set this in `.ternleaf/canvas.json`:

```json
{ "chat": false }
```

Then Copilot cannot read the text, look at pages, export or send proposals for a chat request. `ternleaf_status` says so, and Copilot tells the author to send the request from the Review pane.

## /ternleaf in the chat

The skill is also a command in the chat. Type `/ternleaf` and your request, for example `/ternleaf open docs/brief.docx` or `/ternleaf proofread the document`. Copilot loads the guide, opens the canvas if it must, and does the request.

## How an action reaches the document

The document lives in the editor: only the engine in the canvas knows its text and its pages. The host has the journal, but it cannot read a document.

1. Once a second the editor sends a pulse to the host with a few facts: the revision, the number of pages and words, and the selection.
2. An action that needs the document queues a job in the host: read, page or export.
3. The answer to the next pulse carries the job. The editor does it with the engine and posts the result.
4. The host returns the result to the action. If the editor does not answer in time, the action is refused with a sentence that says so.

An answer from the chat is saved by the host itself, in the same store and through the same checks as an answer to a request from the canvas. The host then raises a counter that the pulse returns, and the editor loads the new proposal.

## Change this part

- Add an action in [`apps/agent/actions.mjs`](../apps/agent/actions.mjs). Give every input field a description.
- Put words for Copilot in [`apps/agent/guide.mjs`](../apps/agent/guide.mjs), and words for a refusal in [`packages/session/messages.mjs`](../packages/session/messages.mjs). After a change to the guide, run `node scripts/write-skill.mjs`.
- [`extension.mjs`](../.github/extensions/ternleaf/extension.mjs) only connects these parts to the SDK. Keep document logic out of it.
- [`tests/agent.test.mjs`](../tests/agent.test.mjs) plays the editor and runs every action. [`tests/browser.mjs`](../tests/browser.mjs) runs them against the real engine.

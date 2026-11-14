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
| `ternleaf_suggest` | Sends up to 60 suggested changes and remarks. A change names a paragraph number, a find text and a replacement. A remark names the text and says what Copilot noticed, with no replacement. |
| `ternleaf_measure` | Lays out a copy of the document with a list of changes and returns the real pages and words, now and after. Nothing is saved. |
| `ternleaf_decline` | Answers a request from the canvas without a change, with a reason. |
| `ternleaf_view_page` | Returns a picture of one page, for questions about layout, tables, charts and pictures. |
| `ternleaf_export` | Writes the current revision as `docx`, `pdf`, `markdown`, `html` or `text` into the `exports` folder of the project and returns the path. The format `changes` writes the change record. |
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

**How a change is applied.** The editor applies an accepted change in one of three ways, and each makes one revision: a plain replacement inside text of one formatting, a replacement in parts (text, paragraph breaks and the formatting of the new text), or a tracked replacement in Suggesting mode. `frameDoesChange` in [`review-change.mjs`](../packages/session/review-change.mjs) is the store's check that the engine's edit is exactly the reviewed change.

**Checks.** A block with the name `ternleaf` in the rules file holds rules with a fixed form. The editor checks them after every change ([`checks.mjs`](../apps/editor/checks.mjs)), shows the failing ones to the author and reports them with the pulse. `ternleaf_status` and `ternleaf_read` return them in `failingChecks`.

**Length.** `ternleaf_measure` sends the changes to the editor as a job. The editor opens a copy of the source, replays the journal, applies each change with the same checks as a real proposal, and returns the page and word counts. A change that cannot be applied comes back with the reason, so Copilot can correct its list before the author sees it.

## What keeps Copilot on the canvas

An agent that does not know how to do a task looks for another way: it unzips the `.docx` file, queries the SQLite file or reads the source code. Each of these gives a wrong result or a broken project. The `.docx` on disk is the original file, without the author's saved revisions.

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

# Architecture

Ternleaf has three parts: an extension that talks to Copilot, a loopback host that owns the document's saved state, and an editor that runs in the canvas. Each part has one job, and only one of them can change a document.

```
GitHub Copilot app
 ├─ chat session ◄──── session.send ───── extension            .github/extensions/ternleaf
 │      │                                   │
 │      └─ invoke_canvas_action ──────────► ├─ canvas actions
 │                                          │
 └─ canvas (webview) ◄── HTTP, 127.0.0.1 ──►└─ host             apps/host
        ├─ OpenDoc engine (Rust/WASM)            └─ session store packages/session
        └─ Ternleaf shell                                        apps/editor
```

## The parts

**Extension.** [`extension.mjs`](../.github/extensions/ternleaf/extension.mjs) joins the Copilot session, declares the canvas, its actions and two hooks, and starts one host for each canvas instance. It sends a short prompt to the chat when the author makes a request, and it turns a refusal from the store into an instruction that the agent can act on. It contains no document logic.

**Agent surface.** [`apps/agent`](../apps/agent) holds what Copilot can do and what it is told: the actions, the guide, the context for each prompt and the advice for tool calls that go around the canvas. [Copilot's side of Ternleaf](Agent.md) describes it.

**Host.** [`serve.mjs`](../apps/host/serve.mjs) is an HTTP server on `127.0.0.1`. It serves the engine and the shell, and it exposes the session store to the editor. Every API call needs the bearer token of that canvas, which is new for each canvas, and the host checks the `Host` and `Origin` headers. The host asks for the same port for a project each time, so the editor keeps one origin and with it the author's settings. If that port is taken, any free port works.

**Workspace.** [`project.mjs`](../apps/host/project.mjs) knows the documents of the project folder. It finds the `.docx` files, maps each one to its project file in `.ternleaf/`, remembers which document was open last, and writes a new or added document without ever replacing a file.

**Session store.** [`store.mjs`](../packages/session/store.mjs) is the authority for saved state. One SQLite file per document holds the source bytes, the journal of revisions, the requests and the suggestions.

**Editor.** The [OpenDoc](https://github.com/CasualOffice/opendoc) engine lays out and edits the document in the webview. The Ternleaf shell in [`apps/editor`](../apps/editor) adds the Review pane, the selection bubble, the launcher and the document windows. [`editor.mjs`](../apps/editor/editor.mjs) holds the behaviour, [`documents.mjs`](../apps/editor/documents.mjs) the Open and New windows, [`shell.mjs`](../apps/editor/shell.mjs) the markup and [`editor.css`](../apps/editor/editor.css) the styles.

## One writer, one journal

The engine instance in the open canvas is the only thing that edits a document. The store makes this safe across reloads and across canvases.

- **Writer lease.** A canvas claims the project file and gets a lease with a fencing number. It renews the lease every five seconds. A second canvas is refused while the lease is live. A claim after expiry raises the fencing number, so the earlier canvas can no longer publish.
- **Admission.** The engine patch calls the editor before it publishes a revision. The editor posts the engine's forward and inverse operations to the host in one synchronous request. The host writes the frame, the edition note and a receipt in one SQLite transaction, and checks the lease and the expected revision. If the host refuses, the engine rolls the edit back. Typing, toolbar commands, undo and redo all take this path.
- **Replay.** A canvas that opens a project loads the source bytes and replays the journal. The source in the project file is never changed. A save to the file starts a new project file (see below).
- **Receipts.** Each publication has an operation ID. A repeated request with the same ID returns the first receipt and changes nothing. A request that was accepted, then undone, is therefore not applied a second time.

## One canvas, many documents

A host holds one open document at a time. When the author opens another document, makes a new one or adds a file, the host closes the first project file, opens the second and counts one document further. The editor sends that count with every call. A page that still shows the earlier document gets the answer "document-changed" and reloads, so it can never write into the wrong journal. The same happens when Copilot opens a document in a canvas that is already open.

The engine patch gives the shell two hooks for this. The editor's command registry passes through `ternleafCommands`, where Open, New, Save, Version history and the Word export become Ternleaf's own. Every path that would replace the document on screen, such as a template, a picked file or a dropped file, ends in `ternleafOpen`, which turns the bytes into a new document of the project.

A `.docx` that changed on disk no longer matches its project file. The host refuses to open it until the author agrees to start a new history. The earlier project file then moves to `.ternleaf/archive`.

## From request to revision

1. The author selects a passage and gives an instruction. The editor sends the passage, its position and the current revision to the host.
2. The store saves the request, bound to the document identity, the source hash, the host session, the lease and the revision.
3. The extension posts a prompt to the chat with the canvas instance and the request ID.
4. Copilot calls `ternleaf_read` and gets the passage, the instruction and the rules for the answer.
5. Copilot calls `ternleaf_propose` with a replacement, a reason and up to two alternatives, or `ternleaf_decline` with a reason.
6. The editor shows the changed words and renders the page before and after in a second engine instance.
7. On **Accept change**, the editor applies the smallest contiguous change to the live engine. The admission request carries the request ID. The store recomputes the change from the saved proposal and publishes only if the engine frame matches it exactly.

A request stops being answerable when the author discards it, reloads the canvas or changes the document. An accepted proposal is checked again against the text, the revision and the fonts at the moment of acceptance.

A whole-document request works the same way with one difference. The editor sends the text of every paragraph, and the host keeps it in memory for that request. Copilot answers with `ternleaf_suggest`. The host keeps a suggestion only if its text is found once in the paragraph that Copilot names and the editor can apply it. Each other suggestion goes back to Copilot with the reason. When the author opens a suggestion, the store turns it into an ordinary request at the current revision, so steps 6 and 7 apply unchanged.

## What Copilot can and cannot do

| Action | Effect |
| --- | --- |
| `ternleaf_guide`, `ternleaf_status`, `ternleaf_documents`, `ternleaf_history` | Return facts. They change nothing. |
| `ternleaf_read` | Returns what the author shared for one request, or the current text for a request from the chat. |
| `ternleaf_view_page` | Returns a picture of one page. |
| `ternleaf_propose` | Saves a proposal for the author to review. |
| `ternleaf_suggest` | Saves a list of suggestions for the author to review. |
| `ternleaf_decline` | Saves a reason for the author. |
| `ternleaf_export` | Writes a copy of the current revision into the `exports` folder. |
| `ternleaf_open_document` | Shows another document of the project in the canvas. |

No action applies an edit. The author's acceptance in the canvas is the only way to a new revision. The only file that an action writes is an export, and the only folder is `exports`.

## A copy from Word

The name of an exported Word file has its revision and the identifier of its history, for example `brief-r12-0a1b2c3d4e.docx`. A history is the journal of one project file, and a save to the file starts a new one at revision 0, so a revision alone is not enough. When the file comes back, the editor builds that revision again from the source and the journal, and the engine compares it with the copy. The result is what changed in Word, and not what changed in Ternleaf since the export. [`merge.mjs`](../apps/editor/merge.mjs) makes one suggestion for each paragraph of the base that changed, and the host saves them as a suggestion list with the origin "word". From there the path is the ordinary review. A suggestion whose text is no longer in the document is a conflict, and the author merges it by hand.

- **A changed paragraph.** The find text is the changed words, widened word by word until it occurs once in the paragraph.
- **A removed paragraph.** The find text is all the text of the paragraph, and the replacement is empty. The editor then joins the empty paragraph to the paragraph before it. The first paragraph, a paragraph after a table and an empty paragraph cannot be removed this way, so they are counted.
- **An added paragraph.** The comparison names an added paragraph only by its place among the blocks of the copy, and the paragraph IDs of a copy are not the IDs of the base. So the merge pairs the blocks that the two sides keep, in order, and the new paragraph goes after the base paragraph of the block before it. The find text is the last words of that paragraph, and the replacement is the same words, a line break and the new text. A paragraph added before the first block is counted.
- **More than one change in a paragraph.** The text changes and the new paragraphs after it are one suggestion. Two suggestions on one paragraph would not work: after the first is accepted, the find text of the second is not there.

Formatting, comments and other changes that are not text are counted, and the author sees the number with a pointer to the engine's Review, Compare.

**A copy from before a save.** When the history in the name is not the current one, the editor asks the host for the archived histories, from the one of the copy to the newest ([`serve.mjs`](../apps/host/serve.mjs), `archivedHistories`). The archive has the source and the journal of each one, so the editor can build the base. The engine gives the paragraphs of a saved file new IDs when the next history opens it, so the editor pairs the paragraphs of the last revision of each history with the first revision of the next one, in order, and checks that they have the same text (`pairParagraphs` in `merge.mjs`). Each suggestion then gets the ID of its paragraph in the current history. If the history is not in the archive, or a pair does not have the same text because the `.docx` changed on disk in between, the editor tells the author in one sentence and offers to compare the copy with the document as it is now. A name without a history is from an earlier version of Ternleaf, and its revision is taken to be in the current history.

## A request from the chat

The author can also ask in the chat. Then no request exists when Copilot starts, and the host must get the text from the editor, because only the engine there can read the document.

1. Once a second the editor sends a pulse with the revision, the page and word counts and the selection. The host keeps these facts for `ternleaf_status` and for the context of the next prompt.
2. `ternleaf_read`, `ternleaf_view_page` and `ternleaf_export` queue a job. The answer to the next pulse carries it. The editor does the job with the engine, shows the author a notice and posts the result.
3. `ternleaf_suggest` without a request ID checks each suggestion against the text that Copilot read, at the same revision, and sends the changes to the editor as a job, which tries each one with the checks of the Review pane. A suggestion that fails a check is refused with its reason, and the others are kept. `ternleaf_propose` without a request ID checks that the text Copilot names is the text that is selected now. The host then saves the request and its answer together, with the origin "chat".
4. The host raises a counter. The editor sees it in the next pulse and loads the proposal or the suggestions. From here the path is the same as steps 6 and 7 above.

An answer from the chat is refused while the author has a proposal or open suggestions that are not decided. A project can turn the whole path off with `"chat": false` in `.ternleaf/canvas.json`.

## Save to the file

Every revision is saved in the project file at once, but the `.docx` file on disk keeps the text that it had. Git ignores `.ternleaf`, so without a save the `.docx` in git is not the current text. **Save to the Word file…** in the menu next to **Export DOCX** closes that gap. Only the author can start it. No canvas action saves.

1. The editor exports the current revision as DOCX, with the same loss check as **Export DOCX**. A known, small loss needs the author's agreement. Any other loss stops the save, and nothing is written. The editor also exports the text as Markdown.
2. A window tells the author what happens: the file gets the current text, the history up to now goes to the archive, a new history starts from the saved file, and undo cannot go back before the save.
3. The host refuses the save if the revision is not the newest one, if a proposal or suggestions are not decided, if the bytes are not a DOCX, or if the `.docx` on disk changed since Ternleaf opened it (its hash is not the source hash of the project file).
4. The host writes the files ([`save.mjs`](../packages/session/save.mjs)). Each new file is first a temporary file in the folder of its target, next to a marker in `.ternleaf`. Then the temporary `.docx` is renamed over the `.docx`. That rename is the commit. After it, the host renames the other files, moves the project file to `.ternleaf/archive` and starts a new project file at revision 0 from the saved file. The host counts one document further, so the editor reloads.
5. The editor shows a proposed commit message with a button that copies it. Ternleaf does not run git.

A crash before the commit leaves the old state: the next opening removes the temporary files. A crash after the commit leaves the new `.docx` and the marker: the next opening sees that the `.docx` has the hash in the marker, and finishes the save. The old history is never deleted. It is in the archive.

Two files go next to the document with each save, so that a pull request shows the review:

- `<file>.docx.md`, the text of the document as Markdown, from the engine's Markdown export. Its first line says that Ternleaf writes it and that it must not be edited. `"textCopy": false` in `.ternleaf/canvas.json` turns it off.
- `<file>.docx.changes.md`, the change log. Each save adds a section with the date, the number of revisions and every change that the author accepted since the save before, with the request, the reason and the note ([`record.mjs`](../packages/session/record.mjs)). `"changeLog": false` turns it off.

`ternleaf_status` gives Copilot `unsavedRevisions`, the number of revisions that are not in the `.docx` on disk.

**Editions across a save.** An edition records the revision of its reference that the author last checked. A save of the reference starts its history again at 0, so before the save the editor of the reference asks the host for its editions (`/api/editions-of`), builds the checked revision of each one, and sends the passages that changed since then as text with the save. The host keeps them in the edition record (`carried`) and sets the checked revision to 0 ([`project.mjs`](../apps/host/project.mjs), `restartEditionsOf`). The edition then shows these passages with the changes after the save, and a passage that changed on both sides is one change from its first text to its last (`combinePassages` in [`edition.mjs`](../apps/editor/edition.mjs)). Text is the simplest record that is correct here: the paragraphs of the saved file have new IDs, so the two histories cannot be compared by ID. If the editor sent no list for an edition that had unchecked changes, the record gets `lost`, and the Review pane tells the author to compare the edition by hand. **Mark as checked** clears both. The links between passages of an edition and its reference (see [Copilot's side](Agent.md#editions)) are keyed by paragraph ID, so the editor also sends the pairs of IDs of the last revision and of the saved file, and the host renames the links.

## Export

**Export DOCX** asks the engine for a DOCX with its retention report. [`export-policy.mjs`](../apps/editor/export-policy.mjs) sorts what the report says was not kept into three kinds:

- **Bookkeeping** that Word writes again on its next save, such as revision save IDs, statistics and the thumbnail. The export goes ahead.
- **A known, small loss.** Today that is one part: the second copy of the styles that Word 2010 wrote (`stylesWithEffects.xml`). Ternleaf explains the loss and exports only after the author agrees.
- **Anything else.** The export is refused.

An unchanged document exports byte for byte. PDF, Markdown, web page and plain text are conversions, so they are not checked this way.

The engine writes the entries of an edited DOCX without compression, so the file is about 15 times the size of the source. Before a download, a save to the file and an export for Copilot, the editor writes the package again with each entry compressed, in the same order, with the same names and the same contents ([`zip.mjs`](../apps/editor/zip.mjs)). It then reads the result back: each entry must have the same bytes, and the engine must read the same text. If a check fails, the export is the file as the engine wrote it. An unchanged export is not written again.

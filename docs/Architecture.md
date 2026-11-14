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
- **Replay.** A canvas that opens a project loads the source bytes and replays the journal. The source is never changed.
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

A whole-document request works the same way with one difference. The editor sends the text of every paragraph, and the host keeps it in memory for that request. Copilot answers with `ternleaf_suggest`. The host keeps a suggestion only if its text is found once in the paragraph that Copilot names. When the author opens a suggestion, the store turns it into an ordinary request at the current revision, so steps 6 and 7 apply unchanged.

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

The name of an exported Word file has its revision. When the file comes back, the editor builds that revision again from the source and the journal, and the engine compares it with the copy. The result is what changed in Word, and not what changed in Ternleaf since the export. [`merge.mjs`](../apps/editor/merge.mjs) makes one suggestion for each changed paragraph, and the host saves them as a suggestion list with the origin "word". From there the path is the ordinary review. A suggestion whose text is no longer in the document is a conflict, and the author merges it by hand.

## A request from the chat

The author can also ask in the chat. Then no request exists when Copilot starts, and the host must get the text from the editor, because only the engine there can read the document.

1. Once a second the editor sends a pulse with the revision, the page and word counts and the selection. The host keeps these facts for `ternleaf_status` and for the context of the next prompt.
2. `ternleaf_read`, `ternleaf_view_page` and `ternleaf_export` queue a job. The answer to the next pulse carries it. The editor does the job with the engine, shows the author a notice and posts the result.
3. `ternleaf_suggest` without a request ID checks each suggestion against the text that Copilot read, at the same revision. `ternleaf_propose` without a request ID checks that the text Copilot names is the text that is selected now. The host then saves the request and its answer together, with the origin "chat".
4. The host raises a counter. The editor sees it in the next pulse and loads the proposal or the suggestions. From here the path is the same as steps 6 and 7 above.

An answer from the chat is refused while the author has a proposal or open suggestions that are not decided. A project can turn the whole path off with `"chat": false` in `.ternleaf/canvas.json`.

## Export

**Export DOCX** asks the engine for a DOCX with its retention report. [`export-policy.mjs`](../apps/editor/export-policy.mjs) sorts what the report says was not kept into three kinds:

- **Bookkeeping** that Word writes again on its next save, such as revision save IDs, statistics and the thumbnail. The export goes ahead.
- **A known, small loss.** Today that is one part: the second copy of the styles that Word 2010 wrote (`stylesWithEffects.xml`). Ternleaf explains the loss and exports only after the author agrees.
- **Anything else.** The export is refused.

An unchanged document exports byte for byte. PDF, Markdown, web page and plain text are conversions, so they are not checked this way.

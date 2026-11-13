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

**Extension.** [`extension.mjs`](../.github/extensions/ternleaf/extension.mjs) joins the Copilot session, declares the canvas and its four actions, and starts one host for each canvas instance. It sends a short prompt to the chat when the author makes a request, and it turns a refusal from the store into an instruction that the agent can act on. It contains no document logic.

**Host.** [`serve.mjs`](../apps/host/serve.mjs) is an HTTP server on `127.0.0.1` with a random port. It serves the engine and the shell, and it exposes the session store to the editor. Every API call needs the bearer token of that canvas, and the host checks the `Host` and `Origin` headers. [`project.mjs`](../apps/host/project.mjs) decides which document, project file, engine and fonts a canvas uses.

**Session store.** [`store.mjs`](../packages/session/store.mjs) is the authority for saved state. One SQLite file per document holds the source bytes, the journal of revisions, the requests and the suggestions.

**Editor.** The [OpenDoc](https://github.com/CasualOffice/opendoc) engine lays out and edits the document in the webview. The Ternleaf shell in [`apps/editor`](../apps/editor) adds the Review pane, the selection bubble and the launcher. [`editor.mjs`](../apps/editor/editor.mjs) holds the behaviour, [`shell.mjs`](../apps/editor/shell.mjs) the markup and [`editor.css`](../apps/editor/editor.css) the styles.

## One writer, one journal

The engine instance in the open canvas is the only thing that edits a document. The store makes this safe across reloads and across canvases.

- **Writer lease.** A canvas claims the project file and gets a lease with a fencing number. It renews the lease every five seconds. A second canvas is refused while the lease is live. A claim after expiry raises the fencing number, so the earlier canvas can no longer publish.
- **Admission.** The engine patch calls the editor before it publishes a revision. The editor posts the engine's forward and inverse operations to the host in one synchronous request. The host writes the frame, the edition note and a receipt in one SQLite transaction, and checks the lease and the expected revision. If the host refuses, the engine rolls the edit back. Typing, toolbar commands, undo and redo all take this path.
- **Replay.** A canvas that opens a project loads the source bytes and replays the journal. The source is never changed.
- **Receipts.** Each publication has an operation ID. A repeated request with the same ID returns the first receipt and changes nothing. A request that was accepted, then undone, is therefore not applied a second time.

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
| `ternleaf_read` | Returns what the author shared for one request. |
| `ternleaf_propose` | Saves a proposal for the author to review. |
| `ternleaf_suggest` | Saves a list of suggestions for the author to review. |
| `ternleaf_decline` | Saves a reason for the author. |

No action applies an edit, reads the document without a request, or reaches the file system. The author's acceptance in the canvas is the only way to a new revision.

## Export

**Export DOCX** asks the engine for a DOCX with its retention report. [`export-policy.mjs`](../apps/editor/export-policy.mjs) refuses the export if the report lists source content that would be lost. Session bookkeeping that Word rewrites anyway, such as revision save IDs, statistics and the thumbnail, is allowed. An unchanged document exports byte for byte.

# Development

## Layout

| Path | Contents |
| --- | --- |
| [`.github/extensions/ternleaf`](../.github/extensions/ternleaf) | The Copilot canvas extension |
| [`.github/skills/ternleaf`](../.github/skills/ternleaf) | The Copilot skill: the guide for the agent, written by `scripts/write-skill.mjs` |
| [`apps/editor`](../apps/editor) | The Ternleaf shell that runs in the canvas |
| [`apps/host`](../apps/host) | The loopback host and document selection |
| [`apps/agent`](../apps/agent) | What Copilot can do and what it is told: actions, guide, prompt context |
| [`packages/session`](../packages/session) | The SQLite session store, the review rules and the messages |
| [`engine`](../engine) | The OpenDoc pin, the patch and the prebuilt engine |
| [`examples`](../examples) | The example document and configuration |
| [`scripts`](../scripts) | Engine build, prebuilt update and bundle packaging |
| [`tests`](../tests) | Tests, fixtures and recorded measurements |

[Architecture](Architecture.md) explains how the parts work together.

## Change the shell

The host serves `apps/editor` without a cache. After a change to the shell's scripts or styles, close the canvas and open it again. The files of the engine in `engine/prebuilt/webapp` come from the patch: change them in an OpenDoc checkout, write the new diff to `engine/opendoc.patch`, and copy the changed files. After a change to the host, the store or the extension, start a new Copilot session, because the extension process keeps running for the life of a session.

To run the editor in an ordinary browser, start the host yourself:

```powershell
node apps/host/serve.mjs examples/harbour-library-brief.docx .build/dev.sqlite engine/prebuilt/webapp
```

It prints a URL with the access token. **Ask Copilot** answers "Copilot is not connected" there, because no agent is attached. The browser test shows how to stand in for the agent.

## Tests

### Unit tests

```powershell
npm test
```

They need Node.js 24 and nothing else. They cover the session store (leases, publication, recovery after a killed process, undo and receipts), the review path, alternatives and author edits, whole-document suggestions, the project's documents (listing, the last document, new and added files, a file that changed on disk), the host's document switching over HTTP, every Copilot action with a test that plays the editor, the context for a prompt, the advice for tool calls, the comparison of changed words and the export check.

### Browser test

[`tests/browser.mjs`](../tests/browser.mjs) drives the real editor and host in Chrome with Playwright and plays the agent through the host's own functions. It covers a request, a saved draft, a reload, a lost reply during acceptance, decline, discard, alternatives, an author edit, a whole-document review, export, undo, retry and redo, and a project with several documents: open, new, add a file and a document that Copilot opens. The last part is Copilot's work from the chat against the real engine: read, page picture, the five export formats, suggestions and a proposal.

```powershell
python -m pip install python-docx==1.2.0 lxml==6.0.2
$tools = Join-Path $PWD '.build/tools'
npm.cmd install --prefix $tools playwright@1.63.0

$out = Join-Path $env:TEMP ('ternleaf-' + [guid]::NewGuid())
python tests/fixtures.py $out
node tests/browser.mjs (Join-Path $tools 'node_modules/playwright/index.mjs') `
  'C:/Program Files/Google/Chrome/Application/chrome.exe' engine/prebuilt/webapp $out C:/Windows/Fonts/arial.ttf
```

Update this test with every change to the editor's behaviour or labels.

### Engine and Word tests

[Word fidelity](Word-Fidelity.md) lists the engine tests and the comparisons with Microsoft Word. Run them after a change to the engine, the patch or the export path.

### In the Copilot app

Automated tests do not cover the Copilot app itself. Before a release, open the canvas in the app and check a selection request, a whole-document review, acceptance, export and a reload.

To test recovery from a lost reply in the app, set `"verification": { "loseProposalReplyOnce": true }` in `.ternleaf/canvas.json` with a disposable project file. The host then drops its first reply to an acceptance. The canvas must ask for a reload and show the accepted revision afterwards.

## Package a bundle

A bundle is a folder with the extension, the shell, the host, the engine and every notice. It runs without this repository.

```powershell
npm.cmd ci --prefix .github/extensions/ternleaf
node scripts/package-canvas.mjs $engine $bundle
git -C $bundle init
```

`$engine` is a built OpenDoc checkout (see [The document engine](Engine.md)) and `$bundle` is a new folder. The script needs the Rust toolchain, because it reads the licences of the build's dependency graph. It writes `BUNDLE-INVENTORY.json` with the versions, licence expressions and file hashes. The Copilot app discovers a repository extension in a Git folder, hence the `git init`.

## Conventions

- JavaScript is plain ES modules, without a build step and without runtime dependencies beyond the Copilot SDK.
- Text in the user interface is short, plain and in sentence case. A button names its action, and the same action has the same name everywhere.
- A refusal has a code in the store and a sentence in [`messages.mjs`](../packages/session/messages.mjs): one for the author and one for the agent.
- Comments say why, not what.

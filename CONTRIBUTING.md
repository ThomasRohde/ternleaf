# Contribute to Ternleaf

Thank you for your interest. Ternleaf is young, so small and focused changes are the easiest to review.

## Before you start

- For a bug, open an issue with the steps, what you expected and what happened. Add the document only if you can share it.
- For a larger change, open an issue first and describe the approach.
- For a security problem, follow [SECURITY.md](SECURITY.md). Do not open a public issue.

## Set up

You need Node.js 24 or later. The unit tests have no other dependency:

```powershell
npm test
```

To run the canvas, open the repository folder in the Copilot app. [Install and run Ternleaf](docs/Install.md) has the steps, and [Development](docs/Development.md) describes the tests and the layout.

## Rules that keep documents safe

These rules are the reason Ternleaf can be trusted with a document. A change must keep them.

- **Copilot cannot edit.** A canvas action reads what the author shared or records a proposal. Only the author's acceptance publishes a change.
- **Copilot reads for the author, and the author knows.** Copilot reads the document for a request from the canvas or from the chat. Each read shows a notice in the canvas, and `"chat": false` turns reads from the chat off. Do not add a read that the author cannot see or cannot turn off.
- **Copilot never has to guess.** Every action and every input field has a description, and every refusal says what to do next. An agent that has to read the source to use Ternleaf has found a defect.
- **One publication path.** Every change goes through `ProjectStore.publish`, with the writer lease, the expected revision and the engine frame checked together.
- **No silent loss.** Export must refuse a DOCX when the engine reports lost source content.
- **The author's file changes only when the author saves.** Ternleaf writes the `.docx` file only when the author chooses **Save to the Word file…**, with the same loss check as the export, and only if the file on disk did not change since Ternleaf opened it. No canvas action can save. A crash during a save must leave the old state or the new state.
- **Keep the engine patch small.** Change the engine in a pinned checkout and carry the change in [`engine/opendoc.patch`](engine/opendoc.patch). [The document engine](docs/Engine.md) explains how.

## Pull requests

- Add or update a test for each change in behaviour. Store and host logic belongs in `tests/*.test.mjs`. Editor behaviour belongs in `tests/browser.mjs`.
- Run `npm test`. If you changed the editor or the host, run the browser test as well.
- Keep the user interface text short, plain and in sentence case.
- By contributing, you agree that your contribution is licensed under the [Apache License 2.0](LICENSE).

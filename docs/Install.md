# Install and run Ternleaf

Ternleaf is a repository extension for the GitHub Copilot desktop app. The repository contains a prebuilt engine, so you need no build tools.

## Requirements

- The GitHub Copilot desktop app with canvas extensions, signed in.

Ternleaf was developed and tested on Windows. The engine and the extension are platform-independent, but other systems are untested.

## Run it

**From the repository:** choose **+ → Canvas → Import canvas from repo**, enter the repository URL, start a session in the imported folder, then choose **+ → Canvas → Ternleaf**.

**From a local clone:** clone the repository, open the folder in the Copilot app, start a session, then choose **+ → Canvas → Ternleaf**.

The canvas opens [`examples/harbour-library-brief.docx`](../examples/harbour-library-brief.docx). Select a sentence and choose **Shorten** to try the review flow.

If the canvas is not in the list, the app could not load the extension. Run `npm ci --prefix .github/extensions/ternleaf` and start a new session. This installs the Copilot SDK next to the extension for an app version that does not supply it, or when the platform packages are missing for your system.

## Open your own document

Ask Copilot to open Ternleaf with a path, for example:

> Open docs/brief.docx in the Ternleaf canvas.

The path must name a `.docx` file inside the project folder or the session's working directory. Each document gets its own project file in `.ternleaf/`. The project file holds a copy of the source and every saved revision, and the original DOCX is never changed. **Export DOCX** writes the current revision as a new file.

## Configure the project

`.ternleaf/canvas.json` is optional. Use it to set the default document and the fonts. [`examples/canvas.example.json`](../examples/canvas.example.json) is a starting point.

| Key | Meaning |
| --- | --- |
| `source` | The document that opens when no path is given. |
| `state` | The SQLite project file for `source`. Set both or neither. |
| `fonts` | Font files to load, in addition to the fonts that come with the engine. |
| `engine` | The folder of the OpenDoc web application. The default is `engine/prebuilt/webapp`. |

Paths are relative to the project folder or absolute.

### Fonts

Line breaks and page breaks depend on the exact fonts. The engine brings open fonts with it. Fonts with their own licence, such as Arial and Cambria on Windows, stay on your computer. To get the same pages as Word, list the font files that your document uses, with their regular, bold and italic faces:

```json
{
  "fonts": [
    "C:/Windows/Fonts/arial.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
    "C:/Windows/Fonts/ariali.ttf",
    "C:/Windows/Fonts/arialbi.ttf"
  ]
}
```

A change to the font list makes a saved proposal preview out of date. Ask again to get a new one.

## Use the canvas

- **Ask in place.** Select text in one paragraph. Choose a quick request in the bubble, or choose **Ask Copilot** and write an instruction. Ctrl+Enter sends it. Ctrl+Shift+Space opens the Review pane.
- **Review.** Compare the changed words and the page before and after. Switch between the options if Copilot gave more than one. **Edit the text** changes the proposal yourself. **Accept change** saves a revision. **Discard** and **Ask again** leave the document as it is.
- **Whole document.** Choose **Whole document**, then a quick review or your own instruction. **Review** opens a suggestion as a proposal. **Accept change** goes to the next one, and **Skip** leaves the text as it is.
- **History.** The History tab lists every revision. Undo and redo are revisions too.
- **Recover.** If the canvas loses its connection, choose **Reload**. The canvas opens the last saved revision. A proposal that Copilot already sent is still there.

One document can be open in one canvas at a time.

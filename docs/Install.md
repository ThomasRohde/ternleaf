# Install and run Ternleaf

Ternleaf is a repository extension for the GitHub Copilot desktop app. The repository contains a prebuilt engine, so you need no build tools.

## Requirements

- The GitHub Copilot desktop app with canvas extensions, signed in.
- Git, to clone the repository.

Ternleaf was developed and tested on Windows. The engine and the extension are platform-independent, but other systems are untested.

## Run it

1. Clone the repository.
2. Open the folder in the Copilot app and start a session.
3. Choose **+ → Canvas → Ternleaf**, or ask Copilot to "open the Ternleaf canvas".

The canvas opens [`examples/welcome-to-ternleaf.docx`](../examples/welcome-to-ternleaf.docx), a short introduction to the canvas. It has three exercises: a selected passage, a whole-document review and a request in the chat. [`scripts/make-welcome.py`](../scripts/make-welcome.py) writes that document.

If the canvas is not in the list, the app could not load the extension. Run `npm ci --prefix .github/extensions/ternleaf` and start a new session. This installs the Copilot SDK next to the extension for an app version that does not supply it.

## Work on your own documents

Ternleaf works on the Word documents (`.docx`) in the project folder, which is the folder that you opened in the Copilot app.

- **Open.** Press Ctrl+O, or choose **File → Open**, or choose the document name at the top of the Review pane. The window lists every Word document in the project folder. Type to search, and choose a document to open it.
- **New.** Choose **New document…** in that window, or **File → New document**. Start from a blank page, a letter, a report or meeting notes, and give the document a name and a folder.
- **Add a file.** Choose **Add a file from this computer…**, or drop a Word file on the canvas. Ternleaf puts a copy in the `documents` folder of the project and opens the copy. The file that you chose is not changed.
- **Ask Copilot.** For example: "Open docs/brief.docx in the Ternleaf canvas."

A new canvas returns to the document that you had open last.

Each document has its own project file in `.ternleaf/`. The project file holds a copy of the source and every saved revision. Ternleaf never changes the `.docx` file itself. **Export DOCX** writes the current revision as a new file.

### When a file changes outside Ternleaf

If you edit a `.docx` in Word, or replace it, its saved revisions no longer match the file. When you open it, Ternleaf asks whether to start a new history from the file as it is now. The earlier history moves to `.ternleaf/archive`.

To continue in Word and come back, export from Ternleaf, edit the export in Word, and add or open the result as a new document.

## Configure the project

`.ternleaf/canvas.json` is optional. Use it to load fonts, or to set the document that opens when none was open before. [`examples/canvas.example.json`](../examples/canvas.example.json) is a starting point.

| Key | Meaning |
| --- | --- |
| `fonts` | Font files to load, in addition to the fonts that come with the engine. |
| `source` | The document that opens in a project where no document was opened before. |
| `state` | The SQLite project file for `source`. Set both or neither. |
| `engine` | The folder of the OpenDoc web application. The default is `engine/prebuilt/webapp`. |
| `chat` | Set it to `false` to keep Copilot to the requests that you send from the canvas. Copilot then cannot read the document for a request in the chat. |

Paths are relative to the project folder or absolute.

### Fonts

Line breaks and page breaks depend on the exact fonts. The engine brings open fonts with it. Fonts with their own licence, such as Arial and Cambria on Windows, stay on your computer. To get the same pages as Word, list the font files that your documents use, with their regular, bold and italic faces:

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

### Settings

The editor's settings, such as the theme, the language, your name for comments and your personal dictionary, belong to the project folder. Ternleaf serves each project from the same local address every time, so the settings are still there in the next session. A second canvas of the same project gets another address and starts with the default settings.

## Use the canvas

- **Ask in place.** Select text in one paragraph. Choose a quick request in the bubble, or choose **Ask Copilot** and write an instruction. Ctrl+Enter sends it. Ctrl+Shift+Space opens the Review pane.
- **Review.** Compare the changed words and the page before and after. Switch between the options if Copilot gave more than one. **Edit the text** changes the proposal yourself. **Accept change** saves a revision. **Discard** and **Ask again** leave the document as it is.
- **Ask in the chat.** Type your request in the Copilot chat, for example "Proofread the document", "Make the selected sentence more formal" or "Export a PDF". Copilot reads the current text through the canvas, and a notice tells you when it does. Its proposals come to the Review pane with the label **From the chat**. An export goes into the `exports` folder of the project. You can start a request with `/ternleaf`, for example `/ternleaf open docs/brief.docx`.
- **Whole document.** Choose **Whole document**, then a quick review or your own instruction. **Review** opens a suggestion as a proposal. **Accept change** goes to the next one, and **Skip** leaves the text as it is.
- **History.** The History tab lists every revision. Undo and redo are revisions too. Ternleaf saves each change at once, so there is nothing to save by hand: Ctrl+S confirms the saved revision.
- **Export.** **Export DOCX** downloads the current revision as a Word file. The arrow next to it offers PDF, Markdown, web page and plain text. If a Word export would leave out a known legacy part of the source, Ternleaf explains it and asks first. If it would lose anything else, Ternleaf refuses the Word export, and the other formats still work.
- **Suggesting mode.** The editor's Suggesting mode records your own edits as tracked changes. Switch to Editing to accept a Copilot proposal.
- **Recover.** If the canvas loses its connection, choose **Reload**. The canvas opens the last saved revision. A proposal that Copilot already sent is still there.

One document can be open in one canvas at a time. A second canvas waits and opens the document when the first one closes.

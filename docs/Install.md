# Install and run Ternleaf

Ternleaf is a canvas extension for the GitHub Copilot desktop app. It contains a prebuilt engine, so you need no build tools. Install it for your user account to use it across projects, or install it in a repository to share it with that team.

## Requirements

- The GitHub Copilot desktop app with canvas extensions, signed in.
- Node.js 24 or later, to run the install script. The extension needs the `node:sqlite` module of Node.js 24 too.
- Git, to clone the Ternleaf repository. A release bundle needs no Git.

Ternleaf was developed and tested on Windows. The engine and the extension are platform-independent, but other systems are untested.

## Try it in the Ternleaf repository

1. Clone the repository.
2. Open the folder in the Copilot app and start a session.
3. Choose **+ → Canvas → Ternleaf**, or ask Copilot to "open the Ternleaf canvas".

The canvas opens [`examples/welcome-to-ternleaf.docx`](../examples/welcome-to-ternleaf.docx), a two-page introduction with four exercises: shorten a sentence, proofread the whole document, get a remark, and fit the document to one page. The first exercise takes less than a minute. [`examples/house-rules-tour.docx`](../examples/house-rules-tour.docx) is a tour of the house rules, the checks and a fit to a length. [`scripts/make-welcome.py`](../scripts/make-welcome.py) and [`scripts/make-tour.py`](../scripts/make-tour.py) write the two documents.

## Install it in your repository

Run the install script from a clone of Ternleaf or from an unpacked release bundle. Give the path of your repository:

```powershell
node scripts/install.mjs C:/work/team-docs
```

The script tells you the size before it copies. Most of it is the document engine, about 38 MB in about 500 files. One of them is the compressed WebAssembly module, about 12 MB. The script then tells you what it did and what to do next.

| Where | What |
| --- | --- |
| `.github/extensions/ternleaf/` | The extension, its parts (`apps`, `packages`), the engine (`engine/prebuilt`), the introduction (`examples`), the licence and the notices. |
| `.github/extensions/ternleaf/ternleaf-install.json` | The manifest: each installed file with its SHA-256 hash. |
| `.github/skills/ternleaf/SKILL.md` | The skill. Copilot looks for skills only in `.github/skills`. |
| `.gitignore` | The lines `.ternleaf/` and `exports/`, if they are not there. They keep each author's revisions and exports out of the repository. |

Nothing else changes. The project folder is the root of your repository: Ternleaf finds your documents there, writes its project files into `.ternleaf/` and its exports into `exports/`. The introduction opens from `.github/extensions/ternleaf/examples`, and the document list shows only your documents.

Then open your repository in the Copilot app, start a new session and choose **+ → Canvas → Ternleaf**. A session that was open during the install does not see the extension. Commit the two folders if your team must get Ternleaf from the repository.

| Command | Effect |
| --- | --- |
| `node scripts/install.mjs <repository>` | Install. Run it again from a newer clone or release to update. A file that is the same is not written again. |
| `node scripts/install.mjs --check <repository>` | Report what an install or update would do. Change nothing. The exit code is 0 when nothing must change. |
| `node scripts/install.mjs --remove <repository>` | Remove the files in the manifest, the lines that the install added to `.gitignore` and the folders that it made. Your documents, `.ternleaf/` and `exports/` stay. |
| `--force` | Also replace or remove installed files that were changed in your repository. Without it, the script changes nothing and lists them. |

The script never replaces a file that it did not write. If such a file is in the way, for example your own `.github/skills/ternleaf/SKILL.md`, the script changes nothing and names the file. Move or rename it and run the command again.

[`scripts/package-canvas.mjs`](../scripts/package-canvas.mjs) makes a release bundle. It has the layout of a clone, cut to what the install script needs, with the licence notices of the engine and its dependencies.

## Install for your user account

From a Ternleaf clone or an unpacked release, run:

```powershell
node scripts/install.mjs --user
```

This installs the extension, engine and notices in `~/.copilot/extensions/ternleaf/` and the personal skill in `~/.copilot/skills/ternleaf/SKILL.md`. On Windows, `~` is your user profile directory, for example `C:/Users/thoma`. If `COPILOT_HOME` is set, the installer uses that directory instead of `~/.copilot`. These are Copilot's personal extension and skill locations. [GitHub's configuration directory reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference)

Open the folder containing your documents in Copilot Desktop, start a new session, and choose **+ → Canvas → Ternleaf**. The canvas uses that session's project folder for documents, `.ternleaf/` history, `exports/` and font configuration. You can open a different project in another session and use the same installation.

```powershell
node scripts/install.mjs --user --check
node scripts/install.mjs --user
node scripts/install.mjs --user --remove
```

The first command checks the installed files. Run the second from a newer release to update. The third removes the installed extension and skill. Existing project documents and histories remain in their project folders. Local changes to installed files receive the same checks as repository installs.

If the app needs the SDK installed beside the personal extension, run this in PowerShell for the default configuration directory:

```powershell
npm ci --prefix "$env:USERPROFILE/.copilot/extensions/ternleaf"
```

Start a new session afterward. If you set `COPILOT_HOME`, use its `extensions/ternleaf` directory for that command. The user install leaves project `.gitignore` files alone. Add `.ternleaf/` and `exports/` to a project's ignore file if you keep that project in Git.

## If the canvas does not open

- **The canvas is not in the list.** The app could not load the extension. Start a new session. If that does not help, run `npm ci --prefix .github/extensions/ternleaf` in the repository and start a new session. This installs the Copilot SDK next to the extension for an app version that does not supply it. The Copilot app normally supplies it, so the install script does not copy it.
- **The canvas gives a sentence that starts with "Ternleaf cannot start".** A part is missing, or the Node.js of the app has no `node:sqlite`. The sentence says what to do. Usually that is to install again, or to update the Copilot app.
- **The engine or the introduction is missing.** The sentence names the path. Run the install script again. `--check` lists the files that are missing or changed.

## Work on your own documents

Ternleaf works on the Word documents (`.docx`) in the project folder, which is the folder that you opened in the Copilot app.

- **Open.** Press Ctrl+O, or choose **File → Open**, or choose the document name at the top of the Review pane. The window lists every Word document in the project folder. Type to search, and choose a document to open it.
- **New.** Choose **New document…** in that window, or **File → New document**. Start from a blank page, a letter, a report or meeting notes, and give the document a name and a folder.
- **Add a file.** Choose **Add a file from this computer…**, or drop a Word file on the canvas. Ternleaf puts a copy in the `documents` folder of the project and opens the copy. The file that you chose is not changed.
- **Ask Copilot.** For example: "Open docs/brief.docx in the Ternleaf canvas."

A new canvas returns to the document that you had open last.

Each document has its own project file in `.ternleaf/`. The project file holds a copy of the source and every saved revision. Ternleaf changes the `.docx` file only when you choose **Save to the Word file…**. Then the file gets the current text, and the history moves to `.ternleaf/archive`. **Export DOCX** writes the current revision as a new file. In `.ternleaf/canvas.json`, `"textCopy": false` and `"changeLog": false` stop the two Markdown files that a save writes next to the document.

### When a file changes outside Ternleaf

If you edit a `.docx` in Word, or replace it, its saved revisions no longer match the file. When you open it, Ternleaf asks whether to start a new history from the file as it is now. The earlier history moves to `.ternleaf/archive`.

To continue in Word and come back, export from Ternleaf, edit the export in Word, and merge it with **Merge a copy from Word** (see below).

## Configure the project

`.ternleaf/canvas.json` is optional. Use it to load fonts, or to set the document that opens when none was open before. [`examples/canvas.example.json`](../examples/canvas.example.json) is a starting point.

| Key | Meaning |
| --- | --- |
| `fonts` | Font files to load, in addition to the fonts that come with the engine. |
| `source` | The document that opens in a project where no document was opened before. |
| `state` | The SQLite project file for `source`. Set both or neither. |
| `engine` | The folder of the OpenDoc web application. The default is `engine/prebuilt/webapp` in the project folder, or else in the folder of the installed extension. |
| `rules` | The path of the house rules file. The default is `ternleaf.rules.md` in the project folder. |
| `chat` | Set it to `false` to keep Copilot to the requests that you send from the canvas. Copilot then cannot read the document for a request in the chat. |
| `textCopy` | Set it to `false` to stop the text copy `<file>.docx.md` that **Save to the Word file…** writes next to the document. |
| `changeLog` | Set it to `false` to stop the change log `<file>.docx.changes.md` that **Save to the Word file…** writes next to the document. |

Paths are relative to the project folder or absolute.

### Fonts

Line breaks and page breaks depend on the exact fonts. The engine brings open fonts with it. Fonts with their own licence, such as Arial and Cambria on Windows, stay on your computer.

To use the same fonts across all projects, create `~/.copilot/ternleaf/fonts.json`. On Windows this is `%USERPROFILE%\.copilot\ternleaf\fonts.json`. If you set `COPILOT_HOME`, use its `ternleaf/fonts.json` instead. Both user and repository installations read this personal setting.

List the font files that your documents use, with their regular, bold and italic faces:

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

Absolute file paths work directly. Relative paths in the personal file are resolved from its `ternleaf` directory. The setting stays separate from the installed extension, so updates and removal preserve it.

A project's `.ternleaf/canvas.json` can override the personal list with its own `fonts` array or its legacy `font` path. Set `"fonts": []` in a project to use only the bundled fonts. Remove both project font keys to inherit your personal fonts again.

Close and reopen the canvas after changing the font configuration. A change to the loaded font list makes a saved proposal preview out of date. Ask again to get a new one.

### Your Danske Bank font

Use the font files installed or provided by your workplace. Add their absolute paths to the `fonts` array in your personal `~/.copilot/ternleaf/fonts.json` once to use them across projects. Include every face used in the Word document, such as regular, bold, italic and bold italic. Fonts installed for your account may be under `%LOCALAPPDATA%/Microsoft/Windows/Fonts`; system fonts are usually under `C:/Windows/Fonts`.

For example, if your approved font files are in `C:/Work/Fonts`, the configuration would have this form. Replace these example filenames with the actual files:

```json
{
  "fonts": [
    "C:/Work/Fonts/YourBankFont-Regular.ttf",
    "C:/Work/Fonts/YourBankFont-Bold.ttf",
    "C:/Work/Fonts/YourBankFont-Italic.ttf",
    "C:/Work/Fonts/YourBankFont-BoldItalic.ttf"
  ]
}
```

Remove a project's font override if it should inherit the personal list. These paths stay on the work computer and the font files stay outside the Ternleaf release. Load the same font family and faces used by Word. Qualification with Arial and Cambria does not establish matching pages with the bank font; compare an edited export in your work Word environment after configuring it. The bank font's exact files and its rendering have yet to be tested here.

### Settings

The editor's settings, such as the theme, the language, your name for comments and your personal dictionary, belong to the project folder. Ternleaf serves each project from the same local address every time, so the settings are still there in the next session. A second canvas of the same project gets another address and starts with the default settings.

## Use the canvas

- **Ask in place.** Select text in one paragraph. Choose a quick request in the bubble, or choose **Ask Copilot** and write an instruction. Ctrl+Enter sends it. Ctrl+Shift+Space opens the Review pane.
- **Review.** Compare the changed words and the page before and after. Switch between the options if Copilot gave more than one. **Edit the text** changes the proposal yourself. **Accept change** saves a revision. **Discard** and **Ask again** leave the document as it is.
- **Ask in the chat.** Type your request in the Copilot chat, for example "Proofread the document", "Make the selected sentence more formal" or "Export a PDF". Copilot reads the current text through the canvas, and a notice tells you when it does. Its proposals come to the Review pane with the label **From the chat**. An export goes into the `exports` folder of the project. You can start a request with `/ternleaf`, for example `/ternleaf open docs/brief.docx`.
- **House rules.** Put your writing rules in `ternleaf.rules.md` in the project folder. [`examples/ternleaf.rules.example.md`](../examples/ternleaf.rules.example.md) is a starting point. Copilot gets the rules with every read, and the Review pane names the file. Then ask "Review this document against the house rules".
- **Checks.** Rules with a fixed form go into a block in the rules file. Ternleaf checks them itself after every change and shows the ones that fail at the top of the Review pane:

  ````
  ```ternleaf
  max-pages: 2
  max-words: 800
  max-sentence-words: 25
  require-heading: Recommendation
  avoid: utilize => use
  ```
  ````

- **Remarks.** In a review, Copilot can leave a remark where no new text can solve a problem. A remark quotes the text and says what Copilot noticed. **Add as comment** puts it into the document as a Word comment. Choose **Done** when you have dealt with it.
- **Wide changes.** A proposal can replace text across bold and plain text. The new text gets the formatting of the first replaced word. The review warns you and shows the page after the change. A proposal can also add paragraphs.
- **Tracked changes.** Switch the editor from Editing to Suggesting. A proposal that you accept then becomes a Word tracked change. Set your name in the editor's settings first.
- **Editions.** A document can be an edition of another document of the project: a short brief of a long paper, for example. Choose the arrow next to **Export DOCX**, then **Make this an edition of…**, and choose the reference document. When the reference changes, the top of the Review pane lists the changed passages. **Ask Copilot to update** asks for proposals for this edition. **Mark as checked** says that the edition is right for the reference as it is now.
- **A copy from Word.** Export a Word file and keep its name: the name has the revision and the history, for example `brief-r12-0a1b2c3d4e.docx`. When the edited file comes back, choose the arrow next to **Export DOCX**, then **Merge a copy from Word**. Changed, new and removed paragraphs from Word come to the review as suggestions, also for a copy from before a save to the Word file. A paragraph that also changed here is shown as a conflict: merge it by hand. Formatting and comments from the copy are counted, not merged. **Review → Compare** shows them.
- **Fit to a length.** Ask in the chat, for example "Fit this document to two pages". Copilot measures its cuts on a copy before it suggests them.
- **Change record.** In the History tab, **Download the change record** writes a Markdown file with every accepted change, its request, its reason and your note.
- **Whole document.** Choose **Whole document**, then a quick review or your own instruction. **Review** opens a suggestion as a proposal. **Accept change** goes to the next one, and **Skip** leaves the text as it is.
- **History.** The History tab lists every revision. Undo and redo are revisions too. Ternleaf saves each change at once, so there is nothing to save by hand: Ctrl+S confirms the saved revision.
- **Export.** **Export DOCX** downloads the current revision as a Word file. The arrow next to it offers PDF, Markdown, web page and plain text. If a Word export would leave out a known legacy part of the source, Ternleaf explains it and asks first. If it would lose anything else, Ternleaf refuses the Word export, and the other formats still work. Today that is the case after an edit in a document with comments that Word wrote, or with a table of contents that Word made.
- **Suggesting mode.** The editor's Suggesting mode records your own edits as tracked changes, and an accepted Copilot proposal too.
- **Recover.** If the canvas loses its connection, choose **Reload**. The canvas opens the last saved revision. A proposal that Copilot already sent is still there.

One document can be open in one canvas at a time. A second canvas waits and opens the document when the first one closes.

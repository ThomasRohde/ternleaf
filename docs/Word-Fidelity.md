# Word fidelity

Ternleaf's compatibility target is Microsoft Word. A document that Ternleaf edits and exports must open in Word with the same content, the same source structures and the same pages. This page states what is verified, how it is measured and what is still open.

Word is a test reference only. Nothing from Word is part of Ternleaf.

## How it is measured

The Word tests export a DOCX from the editor, open it in Word and compare three things:

- **Package.** Independent ZIP and XML checks on the exported file: paragraph owners, run properties, relationships and the bytes of embedded parts.
- **Geometry.** The engine's glyph origins against the text positions in the PDF that Word produces from the same file.
- **Raster.** The engine's page and Word's PDF page at 360 dpi, compared at the edges of text and chart marks.

The tolerance is **0.25 pt** for every geometric comparison.

Reference environment: Windows, Word 16.0.20704 (Microsoft 365), Chrome 157, with the Windows Arial and Cambria fonts loaded from the test computer.

## What is verified

### Text with exact line spacing

Fixture: Arial at 8, 12 and 16 pt in exact line heights from 12 to 32 pt, over two pages, with an edit that moves a line to the second page.

| Measure | Largest error |
| --- | --- |
| Baseline | 0.18 pt |
| Top of ink | 0.20 pt |

Both pages had the same line count as Word. [Measurements](../tests/evidence/word-exact-spacing.json)

### A Word-authored document with an inline chart

Fixture: a paragraph with bold and italic runs around a native column chart, a header with a hyperlink, and paragraph IDs written by Word. The test edits the text, exports, saves the result in Word, imports it again, edits again and exports again.

| Measure | Largest error |
| --- | --- |
| Glyph origin, horizontal | 0.07 pt |
| Baseline | 0.09 pt |
| Edges of chart bars and legend keys | 0.20 pt |

Word opened every export as one page with one native chart. The package checks passed for paragraph and text version IDs, the `w:noProof` overrides, the chart anchor and extent, the chart and workbook relationships with byte-identical parts, and the header link. [Measurements](../tests/evidence/word-mixed-chart.json)

The same edit, undo and redo in the Copilot canvas gave the same results. [Measurements](../tests/evidence/copilot-word-chart.json)

### Structural edits

On a fixture with owned paragraphs, a marked run, a native chart and a header link, the engine tests cover text replacement, paragraph split and join, a move within the body, undo, reimport and re-export. Paragraph identity follows these rules:

- A split keeps the ID on the leading paragraph.
- A join moves the ID if only the trailing paragraph has one, and is refused if both paragraphs have one.
- A move within the body carries the ID. A copy gets a new owner.
- Undo restores the original owners and text versions.

## What is not verified

- Chart types other than the tested single-series clustered column chart, and other chart styling.
- Paragraphs with fields, tabs or explicit breaks next to inline objects.
- Moves across sections or between the body and a header, footer or note.
- Source XML that OpenDoc does not model, and losses that its report does not name. The package checks found one such loss during development, which is why they run independently of the report.
- Long documents: the cost of admission, of the page preview and of journal replay.
- Any platform other than Windows.

Because of the first four points, the export check is strict. A document outside the verified set often still opens and edits, but **Export DOCX** refuses it if the engine reports a loss.

## Documents with real structure

The four fixtures above are small. A document of an architecture team has numbered headings, tables with merged cells, lists, footnotes, cross-references, headers and footers, a landscape section, comments, tracked changes, a table of contents and content controls. [`tests/real-documents.mjs`](../tests/real-documents.mjs) tests Ternleaf on eight such documents with the real engine.

**Microsoft Word was not used for these results.** They come from Linux, Chrome and the prebuilt engine, with Liberation Sans as the only font. Nothing here says how Word lays out or opens the files. LibreOffice 24.2 was the second reader of the exported files. It is not Word: it shows only that each package opens and how many pages it has.

### How it is measured

[`tests/real/make-corpus.py`](../tests/real/make-corpus.py) writes the documents with python-docx and raw XML. The output is the same bytes on each run. For each document the test does these steps:

1. It opens the document in the editor and records the pages, words, paragraphs and the engine's import report.
2. It exports the document without a change, and compares the bytes with the source.
3. It makes each change through Copilot's actions: `ternleaf_read`, then `ternleaf_suggest` with one suggestion, then **Review** and **Accept change** in the Review pane. It records each refusal and its sentence.
4. It exports the edited document and applies `validateDocxExport`. It also calls `ternleaf_export` with `docx` and records the sentence that Copilot gets.
5. It opens the export in a new engine document and compares the text of every paragraph with the editor.
6. [`tests/real/constructs.py`](../tests/real/constructs.py) reads the source and the export with Python, without the engine, and compares the field codes, numbering, table grids and merges, notes, header and footer parts, section properties, comments, tracked changes, content controls, links, bookmarks, pictures and styles.

[`tests/real/expected.json`](../tests/real/expected.json) holds 128 results. The test fails when one of them changes, also when a known defect is fixed. Update the file after a fix.

### The corpus

| Document | Pages | Structure |
| --- | --- | --- |
| `adr-event-streaming` | 2 | Numbered headings (a list linked to Heading 1 to 3), a bulleted list with two levels, an external link, the team's own paragraph and character styles, Danish text |
| `da-brief-identity` | 1 | A table with two header rows, cells merged across and down, cell shading; a numbered list with three levels |
| `standard-api` | 1 | Numbered headings, requirements with their own numbering (R1, R1.1), bold keywords inside a requirement, a tab |
| `minutes-eada` | 2 | Danish minutes: attendees, a numbered agenda, an action table with a header row and a cell with two paragraphs |
| `notes-crossref` | 1 | Three footnotes, bookmarks, a caption with a `SEQ` field, `REF` and `PAGEREF` cross-references |
| `layout-landscape` | 3 | A different first-page header, a footer with `PAGE`, `NUMPAGES` and a simple `FILENAME` field, a picture, a landscape section between two portrait sections |
| `review-comments` | 1 | Two comments in the form that Word writes, a tracked insertion and deletion, a formatting change, an inserted paragraph |
| `toc-controls` | 3 | A title page, a table of contents field with links and `PAGEREF` fields, plain-text, drop-down and date content controls, a block content control |

### What is verified

These results are asserted in `tests/real/expected.json`.

| Check | Result |
| --- | --- |
| Export without a change | Byte-identical to the source for all eight documents, from the pane and from `ternleaf_export`. |
| Text after reopen | The text of every paragraph of each edited export is the text in the editor, in all eight documents. |
| Changes accepted | 51 of 57 changes, none of them with a loss of structure. A change of all the text of a plain-text control and a choice of a drop-down list fill the control, so it stays. The removal of a header paragraph deletes its text, and the paragraph stays empty, as the review says. The others: body text, list items, headings, table cells, merged cells, header-row cells, the second paragraph of a cell, a whole cell text, a removed cell text, a paragraph with a link or a footnote reference (beside the link or the reference), a run in a character style, bold keywords, a paragraph with a tab (beside the tab), a header, a footer beside a field, a caption, footnote text, a paragraph with a comment or tracked changes, text inside a tracked insertion and across its edge, a paragraph in a block content control. |
| A new list item | A line break in a replacement makes a new paragraph at the same list level. |
| Kept in the export bytes | These are the bytes that the engine makes, also for the two documents where Ternleaf refuses to write them. Footnote references and footnotes, header and footer parts and references, the first-page setting, the three sections and their page sizes, the table grids, `gridSpan`, `vMerge`, header rows and shading, the numbering of every list paragraph, the list definitions, comments and their ranges, tracked insertions, deletions and formatting changes, links, bookmarks, the picture with the same bytes, and the custom styles by name. |
| Size of an edited export | The engine stores the entries of an edited package without compression, about 380 KB for a source of 24 KB. The file that Ternleaf writes, from the pane and from `ternleaf_export`, is compressed again: about 21 KB. |
| Second reader | LibreOffice opened every export. For each document it gave the same page count for the unchanged and the edited file. Its counts differ from the engine's for two documents (1 and 2 pages in place of 2 and 1), because the fonts differ. |

### What is refused

Each refusal has a sentence that says what to do next. `ternleaf_suggest` tries each change in the canvas, so these changes go back to Copilot with the reason, and the author does not see them. A proposal for a selected passage gets the same sentence in the Review pane.

| Case | Where | What the author or Copilot sees |
| --- | --- | --- |
| A change across a link | `ternleaf_suggest` | "This change touches a link. Ternleaf cannot change the text of a link. Change the text beside it, or edit the link in the document." |
| A find text with a tab | `ternleaf_suggest` | This item only: "the find text has a tab or a line break. A change cannot cross it. Give the text before or after it". The other items of the list are kept. |
| A change over a field result | `ternleaf_suggest` | "This text is the result of a field, such as a cross-reference. Change the text beside it." |
| A table of contents entry | `ternleaf_suggest` | "This text is in the table of contents. Change the heading. Word updates the table of contents when you update the field." |
| A change across the edge of a content control | `ternleaf_suggest` | "This change crosses the edge of a content control. Change the text in the control or the text beside it, not both." |
| A drop-down text that is not one of its choices | `ternleaf_suggest` | "This text is a choice in a drop-down list. Give one of the choices: Draft, Approved. Or choose it in the control in the document." |
| Any edit in a document with a comment that Word wrote | Export DOCX | Refused: "The engine does not keep parts of the Word comments (the comment marks and the comment styles)." The sentence says that the revisions are saved and that PDF export works. |
| Any edit in a document with a Word table of contents | Export DOCX | Refused: "The engine does not keep a table of contents or another field that spans paragraphs." The `PAGEREF` field of the first entry is missing in the export. |

### What is lost

The independent reader found these losses. "Silent" means that the engine did not report it and the export was allowed.

| Loss | When | Silent |
| --- | --- | --- |
| A `REF`, `PAGEREF` or `SEQ` field | A change that covers part of the field result, for example "Table 1 lists" where "1" is a `REF` result, made with the engine's `replaceSelection`. The result text stays as plain text. Ternleaf refuses such a change (see above), so its exports do not have this loss. | Yes, in the engine |
| A plain-text or drop-down content control | A change that covers all of the control's text, made with `replaceSelection`. Part of the text keeps the control. Ternleaf fills the control in place of the replacement. | Yes, in the engine |
| The separator and continuation separator footnotes | Any edit in a document with footnotes. | Yes |
| Style IDs | Any edit. Every `w:styleId` becomes a number such as `18446744073709551618`. Names and references stay consistent. | Yes |
| Compression | Any edit. The engine stores the edited package without compression, about 15 times the size of the source (380 KB in place of 24 KB). Ternleaf compresses it before it writes the file. | No loss of content |
| The form of a simple field | Any edit. A `w:fldSimple` becomes a complex field with the same code. The field is kept. | Yes, no loss of content |
| `numPr` with only `ilvl` in the Subtitle style of the python-docx template, and `ilvl` beside `numId` 0 | Any edit. Neither has a list, so nothing changes on the page. | Yes, no visible effect |
| `annotationRef` and the comment styles | Any edit in a document with a comment that Word wrote. The comments and their ranges stay. | No: the export is refused |

[`tests/real/make-minimal.py`](../tests/real/make-minimal.py) writes the smallest document for each loss and refusal of the engine, and [`tests/real/repro.mjs`](../tests/real/repro.mjs) shows each one without a browser. [Requests for the engine](Engine-Requests.md) says what the engine must do for each.

### What is not verified here

- How Word opens, lays out and saves the exported files. The losses above must be checked in Word, in particular a missing footnote separator and numeric style IDs.
- Documents that Word wrote. The corpus is written by python-docx in the form that Word uses, but Word writes more, such as `w14:paraId`, `commentsExtended.xml` for replies, and theme fonts.
- Suggesting mode on these documents, merge from Word, and moves of paragraphs.
- Endnotes, text boxes, equations, nested tables, and documents longer than three pages.

### Run it

```bash
python3 -m pip install python-docx==1.2.0 lxml
OUT=$(mktemp -d)
node tests/real-documents.mjs <playwright>/index.mjs <chrome> engine/prebuilt/webapp $OUT \
  /usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
python3 tests/real/make-minimal.py $OUT/minimal
node tests/real/repro.mjs engine/prebuilt/webapp $OUT/minimal
```

The test writes `real-documents.json` and `real-documents.md` into the output folder. It uses LibreOffice when `soffice` is installed. The page counts in `expected.json` are for Liberation Sans only.

## Run the comparisons

You need Windows with Word and Chrome, Python 3.13, Node.js 24 and Playwright. Use a new output folder for each run.

```powershell
python -m pip install python-docx==1.2.0 lxml==6.0.2 Pillow==11.3.0 PyMuPDF==1.28.2
$tools = Join-Path $PWD '.build/tools'
npm.cmd install --prefix $tools playwright@1.63.0

$web = Join-Path $PWD 'engine/prebuilt/webapp'
$out = Join-Path $env:TEMP ('ternleaf-' + [guid]::NewGuid())
$pw = Join-Path $tools 'node_modules/playwright/index.mjs'
$chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$fonts = Join-Path $env:WINDIR 'Fonts'
$font = Join-Path $fonts 'arial.ttf'
$faces = @('arialbd.ttf','arialbi.ttf','cambria.ttc') | ForEach-Object { Join-Path $fonts $_ }

python tests/fixtures.py $out

# Structural edits and source retention
node tests/engine.mjs $web $out
python tests/verify-fragments.py $out

# Text with exact line spacing
node tests/browser.mjs $pw $chrome $web $out $font $faces
& tests/word-reference.ps1 -Directory $out -Name @('geometry','geometry-edited')
python tests/geometry.py $out

# The Word-authored document, two generations
& tests/word-authored.ps1 -Directory $out
node tests/word-authored.mjs $web $out $font first $faces
& tests/word-authored.ps1 -Directory $out -SecondPass
node tests/word-authored.mjs $web $out $font second $faces
& tests/word-reference.ps1 -Directory $out -Name @('word-first','word-second','word-first-undo','word-second-undo')
python tests/word-authored.py $out
```

To compare an export from the Copilot canvas, set `"verification": { "captureWordComparison": true }` in `.ternleaf/canvas.json` for a one-page test document. After **Export DOCX**, the pane offers **Download Word comparison data**. Save the downloads as `word-canvas-edit.docx`, `word-canvas-undo.docx` and `word-canvas-redo.docx`, the capture as `word-canvas-redo-capture.json` and the source as `word-authored.docx`, then run:

```powershell
& tests/word-reference.ps1 -Directory $out -Name @('word-canvas-edit','word-canvas-undo','word-canvas-redo')
python tests/word-authored.py $out --canvas
```

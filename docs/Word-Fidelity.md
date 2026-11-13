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

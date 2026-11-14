# Requests for the engine

Ternleaf refuses or works around these defects of the prebuilt engine. Each needs a change in [OpenDoc](https://github.com/CasualOffice/opendoc) or in the [patch](../engine/opendoc.patch). [`tests/real-documents.mjs`](../tests/real-documents.mjs) found them on the corpus in [Word fidelity](Word-Fidelity.md#documents-with-real-structure). [`tests/real/repro.mjs`](../tests/real/repro.mjs) shows each one without a browser:

```bash
python3 tests/real/make-minimal.py /tmp/minimal
node tests/real/repro.mjs engine/prebuilt/webapp /tmp/minimal
```

The case names below are the lines that `repro.mjs` prints. A case says "present" while the defect is there and "fixed" when it is gone. When one is fixed, update `tests/real/expected.json`.

## 1. Word comments block the export after an edit

**What happens.** After any edit, the DOCX export of a document with a comment that Word wrote reports `annotationRef`, `pStyle` and `rStyle` as not kept. The comments and their ranges are in the export, but the comment mark in the comment text, the paragraph style `CommentText` and the character style `CommentReference` are not. Ternleaf refuses the export and the save to the Word file. PDF export works.

**Reproduction.** `comment.docx`, case "Any edit in a document with a comment that Word wrote makes the export refuse". Corpus: `review-comments.docx`.

**What the engine must do.** Keep `w:annotationRef` in the comment paragraph, and keep the `w:pStyle` and `w:rStyle` references of the comment part and the comment reference run, with their styles, in an edited export.

**How Ternleaf uses it.** No change. When the report has no loss, the export goes ahead.

## 2. A Word table of contents blocks the export after an edit

**What happens.** A table of contents is a `TOC` field that begins in the first entry and ends in its own paragraph, with a `PAGEREF` field in each entry. After any edit, the export reports `fldChar` and `instrText` as not kept, and the `PAGEREF` field of the first entry is missing: the importer reads the first entry's nested field as plain text. Ternleaf refuses the export.

**Reproduction.** `toc.docx`, case "Any edit in a document with a Word table of contents makes the export refuse, and the first PAGEREF is missing". `toc-flat.docx` is the same table without nested fields, for comparison. Corpus: `toc-controls.docx`.

**What the engine must do.** Import a field that is nested in the first paragraph of a field range, and export the range with all its markers and nested fields.

**How Ternleaf uses it.** No change in the export. Ternleaf refuses a change inside an entry of a table of contents and tells the author to change the heading. That rule stays, because Word writes the entries again when it updates the field.

## 3. Footnote separators are lost

**What happens.** After any edit, the export of a document with footnotes has no separator and continuation separator footnotes (`w:type="separator"`, `w:type="continuationSeparator"`). The engine does not report it, so the export is allowed. Word can then show the notes without the line above them.

**Reproduction.** `footnote.docx`, case "Any edit in a document with footnotes drops the separator footnotes, and the export allows it". Corpus: `notes-crossref.docx`.

**What the engine must do.** Keep the separator footnotes and endnotes of the source in an edited export, or report them as not kept.

**How Ternleaf uses it.** No change. If the engine reports the loss, the export policy refuses it until a rule for it exists.

## 4. Style IDs become numbers

**What happens.** After any edit, every `w:styleId` in the export is a number such as `18446744073709551618`, and every reference uses the number. The names and the references stay consistent, so nothing is lost on the page, but a template, a macro or a tool that looks for a style by its ID no longer finds it.

**Reproduction.** `plain.docx`, case "Any edit replaces every style ID with a number". Every corpus document.

**What the engine must do.** Write the style ID of the source for each style that came from the source, and make a readable ID from the name for a new style.

**How Ternleaf uses it.** No change.

## 5. An inline field cannot be located in a table cell

**What happens.** `copyRichRuns` gives the result of an inline field (`REF`, `PAGEREF`, `SEQ`, `PAGE`) as plain runs, and a replacement over it removes the field without a report. Ternleaf finds the fields of a paragraph with the engine's assistant read (`aiRead` with `{"tool": "read", "start": <paragraph>}`): it gives the runs without the field results and the fields with their results, and `fieldRanges` in [`structure.mjs`](../apps/editor/structure.mjs) finds where they are. For a paragraph in a table cell, the read gives the whole table, with the text of each cell and no fields. Then Ternleaf exports a copy with the change and counts the fields of the part, which costs two exports (about 10 to 45 ms on the corpus) for each preview.

**Reproduction.** `cell-field.docx` and `ref-field.docx`, case "The fields of a paragraph in a table cell cannot be located: the assistant read gives the table". The loss itself: `ref-field.docx`, case "A change over the result of a REF field removes the field, and the export allows it".

**What the engine must do.** Give the inline fields of any paragraph with their byte ranges: for example `fieldSpans(node)` that returns `[{start, end, instruction, resultStart, resultEnd}]`, or the same ranges in `copyRichRuns` as a `field` key on the runs of a result. Better still, refuse or report an edit that deletes part of a field result.

**How Ternleaf uses it.** `checkReviewRun` in [`editor.mjs`](../apps/editor/editor.mjs) reads the ranges from the new call for every paragraph, and the export check in the preview is no longer needed.

## 6. A tracked change with a paragraph break needs one engine call

**What happens.** In Suggesting mode, Ternleaf must make an accepted proposal one tracked change in one revision. `suggestReplace` keeps a line break as a character inside the paragraph. `pasteRichRuns` makes the paragraph break, but not as a tracked change. `suggestSplit` tracks a paragraph break without text. An AI turn makes the right tracked change, but in three or more revisions and with the author "Casual AI". So Ternleaf refuses a change with a line break in Suggesting mode.

**Reproduction.** `plain.docx`, case "A tracked replacement with a line break keeps the break as a character in one paragraph".

**What the engine must do.** One call that makes the tracked deletion, the tracked paragraph break and the tracked new text as one edit and one revision, with the author that the host gives. For example, `suggestReplace` that reads `\n` as a tracked paragraph break.

**How Ternleaf uses it.** `applyChange` calls it in Suggesting mode, and `frameDoesChange` in [`review-change.mjs`](../packages/session/review-change.mjs) gets a sixth form for its frame.

## Fixed in Ternleaf without the engine

These defects of the same test are now handled in Ternleaf. They are here so that the list is complete.

- **A content control lost with all its text.** A change of all the text of a plain-text, combo box or drop-down control fills the control (`fillContentControl`) in one revision, and the store checks that frame (the fifth form of `frameDoesChange`). A drop-down list takes only one of its choices. Other cases are refused with a sentence. The engine defect stays: `replaceSelection` over all the text of an inline control removes the control without a report (case "A change of the whole text of a plain-text content control removes the control, and the export allows it").
- **An edited export without compression.** The engine stores the entries of an edited DOCX without compression, about 15 times the size of the source (case "Any edit writes the package without compression"). The editor compresses them before a download, a save and an export for Copilot ([`zip.mjs`](../apps/editor/zip.mjs)), and checks the result with the engine.

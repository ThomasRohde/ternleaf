# Roadmap

Ternleaf aims to be a document studio for substantial writing: precise pages, structural editing, audience editions that stay aligned, and agent proposals that the author inspects before they change the document. This page describes where it is and where it is going. Nothing here is a commitment to a date.

## Principles

- **The author decides.** An agent proposes. Only the author's acceptance changes a document.
- **Word is the compatibility contract.** An edited document must open in Word with the same content, the same source structures and the same pages. A limit of the engine does not redefine that goal.
- **No silent loss.** If Ternleaf cannot keep something, it says so and refuses the export.
- **Local first.** The document, its history and its fonts stay on the author's computer. Every shipped component is open and redistributable.
- **A comfortable place to write.** The author should want to write here without invoking a model at all.

## Today: write and review

- Open a DOCX in a Copilot canvas with real pages.
- Ask Copilot to revise a selected passage, with quick requests or an instruction.
- Review the changed words, the reason and the page before and after. Choose between options, or edit the proposal.
- Review a whole document through a queue of suggestions.
- Every edit is a saved revision with undo, redo, recovery after a reload and an edition note.
- Export a DOCX, guarded against lost content.

The limits: a proposal changes text inside one paragraph and within text of the same formatting, and one document is open in one canvas at a time. [Word fidelity](Word-Fidelity.md) lists what is verified against Word.

## Next: widen what can be edited and exported

1. **More Word-authored documents.** Other chart types and styling, paragraphs with fields, tabs and breaks, and source XML that the importer drops without a report. Each construct needs a rule for edits and a test before export allows it.
2. **Wider proposals.** Changes across formatting boundaries, whole paragraphs and several paragraphs, still as one reviewed operation.
3. **Performance on long documents.** Measure admission, preview and journal replay separately, and add journal checkpoints.
4. **Structural agent proposals.** Split, join, move and restyle, with the same review and the same preview.

## Later

### Write

Two views of one document: a continuous view for writing and a pages view with true page geometry. An inspector that answers practical questions from the model and the layout, such as "why does this paragraph look different?" and "why did this table move?".

### Structure

An outline of the real document with word counts and page spans. Moving a section moves its content with its notes, figures, comments and references. The deterministic move is separate from any proposed rewrite of transitions, and the author sees the consequences, such as a broken reference or a figure on another page, before they accept.

### Editions

One project with several documents for different readers, for example a technical paper, a two-page decision brief and an implementation note. Each edition owns its prose and layout. The project records which passages correspond and what must stay consistent:

| Policy | Values |
| --- | --- |
| Inclusion | Required, or only constrained when mentioned |
| Fidelity | Exact wording, or the same meaning |

When the reference document changes, the affected passages in the other editions show up for review. An author can accept an update, edit it, confirm that the current text is still right, or record an intended difference. A model's claim that the meaning is the same is evidence for the review, not proof.

### Fit to length

"Fit this brief to two pages. Keep the recommendation, its qualifications and the requested decision. Keep the layout and the typography." The agent proposes wording, the engine composes each candidate, and Ternleaf reports the real page count. Shrinking a figure or changing the type silently is not a valid way to succeed.

### Back from Word

Record the exported revision as a merge base. When an edited copy comes back from Word, compare it with that base and with the current edition, and merge through review.

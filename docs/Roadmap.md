# Roadmap

Ternleaf aims to be a document studio for substantial writing: precise pages, structural editing, audience editions that stay aligned, and agent proposals that the author inspects before they change the document. This page describes where it is and where it is going. Nothing here is a commitment to a date.

## Principles

- **The author decides.** An agent proposes. Only the author's acceptance changes a document.
- **Word is the compatibility contract.** An edited document must open in Word with the same content, the same source structures and the same pages. A limit of the engine does not redefine that goal.
- **No silent loss.** If Ternleaf cannot keep something, it says so and refuses the export.
- **Local first.** The document, its history and its fonts stay on the author's computer. Every shipped component is open and redistributable.
- **A comfortable place to write.** The author should want to write here without invoking a model at all.

## More than a word processor

A word processor helps you type a document. It does not know what the document is for. Ternleaf does three things that a word processor does not do:

- **It reviews against your standards.** The project has house rules in the team's own words. Copilot follows them in every proposal and checks every document against them.
- **It measures before it proposes.** The engine lays out a copy of the document with the proposed changes and counts the real pages. "Fit this to two pages" is checked, not hoped for.
- **It keeps the reasons.** Every accepted change has its request, Copilot's reason and the author's note. The change record gives them to a reader who was not there.

Each stage of this plan must add to one of these three, or to the precision of the page that they stand on.

## Today: write and review

- Open a DOCX in a Copilot canvas with real pages, and the full editor around it: styles, tables, pictures, headers, notes, comments and tracked changes.
- Open, create and add documents in the project folder. Each document keeps its own history.
- Ask Copilot to revise a selected passage, with quick requests or an instruction.
- Review the changed words, the reason and the page before and after. Choose between options, or edit the proposal.
- Review a whole document through a queue of suggestions.
- Ask in the chat: Copilot reads the current text and the pages through the canvas, and its proposals come to the same review.
- Every edit is a saved revision with undo, redo, recovery after a reload and an edition note.
- Export a DOCX, guarded against lost content, or a PDF, Markdown, web page or plain text.

Stage 1 of the plan is also done:

- **House rules.** `ternleaf.rules.md` in the project folder reaches Copilot with every read.
- **Remarks.** In a review, Copilot can point at text and say what it noticed, when no replacement can solve the problem: a number without a source, a contradiction, an action without an owner.
- **Fit to length.** Copilot tries its cuts on a copy of the document and gets the real page and word counts before it proposes them.
- **Change record.** One Markdown file with every accepted change, the request, the reason and the author's note.

The limits: a proposal starts inside one paragraph and cannot remove or join paragraphs, and one document is open in one canvas at a time. [Word fidelity](Word-Fidelity.md) lists what is verified against Word.

## The plan

### Stage 2: proposals as wide as the request

Done:

- **Changes across formatting.** A proposal can cross bold and plain text, or replace a whole formatted phrase or paragraph. The new text gets the formatting of the first replaced word. When the replaced text has more than one formatting, the review shows a warning.
- **New paragraphs.** A line break in a proposal starts a new paragraph, so Copilot can draft new text. The text, the paragraph breaks and the formatting are one revision.
- **Proposals in Suggesting mode.** When the author works in Suggesting mode, an accepted proposal becomes a Word tracked change.
- **Remarks that travel.** **Add as comment** turns a remark into a Word comment on the text.
- **Rules that are checked without a model.** A block in the rules file sets a page limit, a word limit, a sentence length, a required heading or a word to avoid.

The store still checks every accepted change: the engine's edit must do exactly the reviewed change, in one of three known forms, or the store refuses it.

Open:

1. **Remove and join paragraphs.** A proposal works inside one paragraph. It can add paragraphs after it, but it cannot remove a paragraph or join two.
2. **A tracked change with a new paragraph.** In Suggesting mode, a proposal with a line break is refused.

### Stage 3: one source, several readers

Done:

- **Back from Word, first form.** The name of an exported Word file carries its revision. **Merge a copy from Word** compares that revision with the copy that comes back, so only the changes from Word come to the review, one suggestion for each changed paragraph. A change that meets a change made here is shown as a conflict.

- **Editions, first form.** A document can be an edition of a reference document. When the reference changes, the Review pane lists the changed passages, and Copilot proposes the updates of the edition through the ordinary review. The author marks the edition as checked.

Open:

3. **Back from Word, the rest.** New and removed paragraphs, formatting and comments from the copy are counted, but not merged. The engine's own Review, Compare shows them.
4. **Editions, the rest.** See below.

### All the time: the page

5. **More Word-authored documents.** Other chart types and styling, paragraphs with fields, tabs and breaks, and source XML that the importer drops without a report. Each construct needs a rule for edits and a test before export allows it.
6. **Performance on long documents.** Measure admission, preview and journal replay separately, and add journal checkpoints.
7. **Structural agent proposals.** Split, join, move and restyle, with the same review and the same preview.

## Later

### Write

Two views of one document: a continuous view for writing and a pages view with true page geometry. An inspector that answers practical questions from the model and the layout, such as "why does this paragraph look different?" and "why did this table move?".

### Structure

An outline of the real document with word counts and page spans. Moving a section moves its content with its notes, figures, comments and references. The deterministic move is separate from any proposed rewrite of transitions, and the author sees the consequences, such as a broken reference or a figure on another page, before they accept.

### Editions

The first form is done: an edition knows its reference and the revision that it was checked against, and the changed passages of the reference come up for review. What remains is the record of which passages correspond, and the policies below.

One project with several documents for different readers, for example a technical paper, a two-page decision brief and an implementation note. Each edition owns its prose and layout. The project records which passages correspond and what must stay consistent:

| Policy | Values |
| --- | --- |
| Inclusion | Required, or only constrained when mentioned |
| Fidelity | Exact wording, or the same meaning |

When the reference document changes, the affected passages in the other editions show up for review. An author can accept an update, edit it, confirm that the current text is still right, or record an intended difference. A model's claim that the meaning is the same is evidence for the review, not proof.

### Fit to length

The first form is done: Copilot measures its cuts on a copy before it proposes them. What remains is the author's side: a length goal that the canvas shows next to the real page count, and a review that shows the count fall as each cut is accepted. Shrinking a figure or changing the type silently is not a valid way to succeed.

### Back from Word

The first form is done: a three-way merge of text through the ordinary review. What remains: the changes that are not text, a record of each export so that the base does not depend on the file name, and a merge when the same paragraph changed on both sides.

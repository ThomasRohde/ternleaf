"""Write examples/welcome-to-ternleaf.docx, the document that a new canvas opens.

Every paragraph is one run of text with one format. Ternleaf applies a change
inside such a run, so each exercise in the document works.

    python -m pip install python-docx
    python scripts/make-welcome.py
"""
from pathlib import Path

from docx import Document
from docx.shared import Mm, Pt, RGBColor

INDIGO = RGBColor(0x20, 0x3F, 0xBF)
doc = Document()
section = doc.sections[0]
section.page_width, section.page_height = Mm(210), Mm(297)
section.left_margin = section.right_margin = Mm(25)
section.top_margin = section.bottom_margin = Mm(22)

normal = doc.styles["Normal"]
normal.font.name = "Arial"
normal.font.size = Pt(10.5)
normal.paragraph_format.space_after = Pt(7)
normal.paragraph_format.line_spacing = 1.2
for name, size, before in (("Title", 26, 0), ("Heading 1", 14, 14)):
    style = doc.styles[name]
    style.font.name = "Arial"
    style.font.size = Pt(size)
    style.font.bold = True
    style.font.color.rgb = INDIGO
    style.paragraph_format.space_before = Pt(before)
    style.paragraph_format.space_after = Pt(5)

doc.core_properties.title = "Welcome to Ternleaf"
doc.core_properties.author = "Ternleaf"
doc.core_properties.comments = "The introduction that a new Ternleaf canvas opens."

CONTENT = [
    ("Title", "Welcome to Ternleaf"),
    ("Normal", "A short tour of the canvas. You can do every exercise in this document. Nothing changes until you accept it, and you can undo every change."),
    ("Heading 1", "What Ternleaf does"),
    ("Normal", "Ternleaf is a place to write and revise a Word document together with GitHub Copilot. You share a passage or the whole text, Copilot proposes changes, and you review each proposal before it touches the page."),
    ("Normal", "Copilot cannot edit this document. It can only make proposals. The decision is always yours."),
    ("Heading 1", "Exercise 1: ask about a selection"),
    ("Normal", "Select the next paragraph with the mouse. A bubble appears below your selection. Choose Shorten."),
    ("Normal", "In order to be able to make a decision at this point in time, the committee would like to request that each and every member read the report in its entirety before the meeting takes place."),
    ("Normal", "The Review pane shows the changed words, the reason that Copilot gives, and the page before and after. If Copilot offers more than one option, you can switch between them. Choose Edit the text to change the proposal yourself. Then choose Accept change, Discard or Ask again."),
    ("Normal", "For your own instruction, choose Ask Copilot in the bubble, write what you want and press Ctrl+Enter."),
    ("Heading 1", "Exercise 2: review the whole document"),
    ("Normal", "In the Review pane, choose Whole document and then Proofread. Copilot reads the text of the document for that one request and returns a list of suggestions. The next paragraph has three mistakes for it to find."),
    ("Normal", "This canvas keeps a seperate project file for every document. Their is one revision for each change, and you can undo any of them. The orginal file is never changed."),
    ("Normal", "Choose Review on a suggestion to see it as a proposal. Accept change takes you to the next suggestion. Skip leaves the text as it is."),
    ("Heading 1", "Exercise 3: ask in the chat"),
    ("Normal", "You can also type your request in the Copilot chat. Try this: Is this document easy to read? Give me three suggestions. Copilot reads the current text through the canvas, and a notice here tells you when it does. Its suggestions come to the Review pane with the label From the chat."),
    ("Normal", "Select a sentence and type in the chat: Make the selected sentence more formal. Or ask for a file: Export this document as a PDF. The file goes into the exports folder of the project."),
    ("Heading 1", "History and export"),
    ("Normal", "Every edit and every accepted proposal is a saved revision. The History tab shows what you asked, what changed and the edition note that you wrote. Undo and redo work as usual."),
    ("Normal", "Export DOCX writes the current revision as a new Word file. Ternleaf refuses an export that would lose content from the original document."),
    ("Heading 1", "What Copilot can see"),
    ("Normal", "Copilot reads the document for you: the passage or the text that you share here, or the text that it needs for a request in the chat. A notice tells you each time. The document and its history stay on your computer."),
    ("Heading 1", "Your own documents"),
    ("Normal", "Press Ctrl+O, or choose File and then Open, to see the Word documents in this project folder. Choose one to open it. Each document keeps its own history, and a new canvas returns to the document that you had open last."),
    ("Normal", "In the same window, New document starts from a blank page, a letter, a report or meeting notes. Add a file from this computer puts a copy of a Word file into the documents folder of the project. You can also drop a Word file on the canvas."),
    ("Normal", "You can ask Copilot too, for example: Open docs/brief.docx in the Ternleaf canvas. To load the fonts that your documents use, see docs/Install.md in the repository."),
    ("Heading 1", "Shortcuts"),
    ("Normal", "Ctrl+O opens another document. Ctrl+Shift+Space opens the Review pane for the selection. Ctrl+Enter sends your instruction. Ctrl+Z and Ctrl+Y undo and redo."),
]
for style, text in CONTENT:
    paragraph = doc.add_paragraph(text, style=style)
    # The spelling checker does not know the product name. A paragraph that
    # names it is one run that is not checked. The paragraph with the planted
    # mistakes does not name it, so its mistakes stay marked.
    if "Ternleaf" in text:
        paragraph.runs[0].font.no_proof = True

# python-docx starts from a template with a Word 2010 copy of the styles
# (stylesWithEffects.xml). An edited export would have to leave that part
# out, and Ternleaf asks the author first. The introduction has no use for
# the part, so it goes.
for rel_id, rel in list(doc.part.rels.items()):
    if rel.reltype.endswith("/stylesWithEffects"):
        doc.part.drop_rel(rel_id)

target = Path(__file__).resolve().parent.parent / "examples" / "welcome-to-ternleaf.docx"
doc.save(target)
print(target)

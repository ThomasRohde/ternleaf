"""Write examples/welcome-to-ternleaf.docx, the document that a new canvas opens.

The document is a short tour with exercises. Each exercise names what to do,
and the text that it works on is in the document, in a shaded box. The first
exercise gives a result in less than a minute. The document is a little
longer than one page, so that the exercise "fit to one page" has a section to
cut. It must stay at two pages or less.

A paragraph that an exercise changes is one run of text with one format.
Ternleaf applies a change inside such a run, so each exercise works.

    python -m pip install python-docx
    python scripts/make-welcome.py
"""
import re
from pathlib import Path

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Mm, Pt, RGBColor

INDIGO = RGBColor(0x20, 0x3F, 0xBF)
INK = RGBColor(0x1F, 0x23, 0x2B)
MUTED = RGBColor(0x5A, 0x60, 0x6E)
FONT = "Arial"


def set_font(style, size, bold=False, color=INK):
    """Give a style an explicit font. The python-docx template names theme
    fonts (Calibri, Cambria) that win over font.name, so they go."""
    style.font.name = FONT
    style.font.size = Pt(size)
    style.font.bold = bold
    style.font.color.rgb = color
    fonts = style.element.get_or_add_rPr().get_or_add_rFonts()
    for key in ("asciiTheme", "hAnsiTheme", "eastAsiaTheme", "cstheme"):
        fonts.attrib.pop(qn("w:" + key), None)
    for key in ("ascii", "hAnsi", "cs", "eastAsia"):
        fonts.set(qn("w:" + key), FONT)


def border_and_shade(style, side, color, fill=None, size=12, space=6):
    """A rule on one side of a paragraph, and an optional shade behind it."""
    ppr = style.element.get_or_add_pPr()
    for old in ppr.findall(qn("w:pBdr")) + ppr.findall(qn("w:shd")):
        ppr.remove(old)
    borders = OxmlElement("w:pBdr")
    edge = OxmlElement("w:" + side)
    for key, value in (("val", "single"), ("sz", str(size)), ("space", str(space)), ("color", color)):
        edge.set(qn("w:" + key), value)
    borders.append(edge)
    ppr.append(borders)
    if fill:
        shade = OxmlElement("w:shd")
        for key, value in (("val", "clear"), ("color", "auto"), ("fill", fill)):
            shade.set(qn("w:" + key), value)
        ppr.append(shade)


def build(content, target, title, comments, top=Mm(18), bottom=Mm(16)):
    doc = Document()
    section = doc.sections[0]
    section.page_width, section.page_height = Mm(210), Mm(297)
    section.left_margin = section.right_margin = Mm(24)
    section.top_margin, section.bottom_margin = top, bottom

    normal = doc.styles["Normal"]
    set_font(normal, 10.5)
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.18

    title_style = doc.styles["Title"]
    set_font(title_style, 24, bold=True, color=INDIGO)
    title_style.paragraph_format.space_after = Pt(8)
    border_and_shade(title_style, "bottom", "203FBF", size=8, space=6)

    lead = doc.styles.add_style("Lead", 1)
    lead.base_style = normal
    set_font(lead, 11.5, color=INK)
    lead.paragraph_format.space_after = Pt(4)

    heading = doc.styles["Heading 1"]
    set_font(heading, 13, bold=True, color=INDIGO)
    heading.paragraph_format.space_before = Pt(11)
    heading.paragraph_format.space_after = Pt(4)

    # The text that an exercise works on: a shaded box with a rule on the left.
    practice = doc.styles.add_style("Practice", 1)
    practice.base_style = normal
    set_font(practice, 10.5)
    practice.paragraph_format.left_indent = Mm(4)
    practice.paragraph_format.space_before = Pt(2)
    practice.paragraph_format.space_after = Pt(8)
    border_and_shade(practice, "left", "203FBF", fill="EEF1FB", size=18, space=8)

    # What to type in the Copilot chat.
    chat = doc.styles.add_style("Chat", 1)
    chat.base_style = normal
    set_font(chat, 10.5, bold=True, color=INDIGO)
    chat.paragraph_format.left_indent = Mm(4)
    chat.paragraph_format.space_after = Pt(6)

    item = doc.styles.add_style("Item", 1)
    item.base_style = normal
    set_font(item, 10)
    item.paragraph_format.left_indent = Mm(4)
    item.paragraph_format.space_after = Pt(2)

    small = doc.styles.add_style("Small", 1)
    small.base_style = normal
    set_font(small, 9, color=MUTED)

    doc.core_properties.title = title
    doc.core_properties.author = "Ternleaf"
    doc.core_properties.comments = comments

    new_page = False
    for style, text in content:
        # ("Break", "") starts the next paragraph on a new page.
        if style == "Break":
            new_page = True
            continue
        paragraph = doc.add_paragraph(style=style)
        if new_page:
            paragraph.paragraph_format.page_break_before = True
            new_page = False
        # **Bold** marks the name of a button. The spelling checker does not
        # know the product name, so each "Ternleaf" is a run that is not
        # checked. The rest of the text is checked, and the planted mistakes
        # stay marked.
        for index, part in enumerate(re.split(r"\*\*(.+?)\*\*", text)):
            for piece in re.split(r"(Ternleaf)", part):
                if not piece:
                    continue
                run = paragraph.add_run(piece)
                run.bold = True if index % 2 else None
                if piece == "Ternleaf":
                    run.font.no_proof = True

    # python-docx starts from a template with a Word 2010 copy of the styles
    # (stylesWithEffects.xml). An edited export would have to leave that part
    # out, and Ternleaf asks the author first. The examples have no use for
    # the part, so it goes.
    # The template's theme is not used either: every style names its font and
    # colour. Without it, the editor has no import findings to report.
    for rel_id, rel in list(doc.part.rels.items()):
        if rel.reltype.endswith(("/stylesWithEffects", "/theme")):
            doc.part.drop_rel(rel_id)

    doc.save(target)
    print(target)


# Each exercise names what to do, and its text is in a Practice box. Keep each
# box text unique in the document, so that a search finds it once.
CONTENT = [
    ("Title", "Welcome to Ternleaf"),
    ("Lead", "Copilot proposes. You decide. Nothing changes until you accept it, and you can undo every change. Do the exercises in order. The first one takes less than a minute."),

    ("Heading 1", "1. Shorten a sentence"),
    ("Normal", "Select the sentence in the box. A bubble appears below it. Choose **Shorten**."),
    ("Practice", "In order to be able to make a decision at this point in time, the committee would like to request that each and every member read the report in its entirety before the meeting takes place."),
    ("Normal", "The Review pane shows the changed words, the reason and the page after. Choose **Accept change**. Ctrl+Z undoes it."),

    ("Heading 1", "2. Proofread the whole document"),
    ("Normal", "In the Review pane, choose **Whole document**, then **Proofread**. The box has three mistakes."),
    ("Practice", "Each accepted change becomes a seperate revision with its request and its reason. The orginal Word file changes only when you ask, and you can undo a change untill you are satisfied."),
    ("Normal", "**Review** opens a suggestion. **Accept change** goes to the next one. **Skip** leaves the text as it is."),

    ("Heading 1", "3. Get a remark"),
    ("Normal", "Some problems need facts that only you have. Type this in the Copilot chat:"),
    ("Chat", "Check the numbers in this document. Leave a remark where a number has no source."),
    ("Practice", "Teams that review a draft against written rules find more problems before approval. In one pilot, the time from first draft to approval fell by 38 percent."),
    ("Normal", "A remark says what Copilot noticed. **Add as comment** keeps it as a Word comment."),

    ("Heading 1", "4. Fit to one page, measured"),
    ("Normal", "This document is a little longer than one page. Type this in the chat:"),
    ("Chat", "Fit this document to one page."),
    ("Normal", "Copilot tries its cuts on a copy, and the engine counts the real pages before you see a suggestion. A good cut is the section About this document."),

    ("Heading 1", "More in Ternleaf"),
    ("Item", "**History.** The change record in the History tab gives every accepted change with its reason."),
    ("Item", "**House rules.** Ternleaf checks your rules as you write. Press Ctrl+O and open house-rules-tour."),
    ("Item", "**Tracked changes.** In Suggesting mode, an accepted change becomes a Word tracked change."),
    ("Item", "**A copy from Word.** Merge a copy from Word brings only the changes from Word to the review."),
    ("Item", "**Editions.** Make this an edition of… links a brief to its paper and shows what changed."),
    ("Item", "**Your documents.** Ctrl+O opens, creates or adds a Word document of the project."),
    ("Item", "**Privacy.** Copilot reads what you share or ask about in the chat, and a notice tells you each time."),
    ("Item", "**The guide.** docs/Install.md in the Ternleaf repository tells you more about each feature."),

    ("Heading 1", "About this document"),
    ("Small", "This is the first document that a new canvas opens. It shows the main parts of the canvas in four short exercises and points to the guide for the rest. It is a little longer than one page, so that the fourth exercise has a part to cut. Undo takes back each change, so you can do the exercises again at any time."),
]

if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    build(CONTENT, root / "examples" / "welcome-to-ternleaf.docx", "Welcome to Ternleaf",
          "The introduction that a new Ternleaf canvas opens.")

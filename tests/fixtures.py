"""Generate the bounded preservation and exact-spacing reference inputs."""
import sys
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

from docx import Document
from docx.enum.text import WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from lxml import etree as ET

ROOT = Path(__file__).resolve().parent.parent
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W14 = "http://schemas.microsoft.com/office/word/2010/wordml"
MC = "http://schemas.openxmlformats.org/markup-compatibility/2006"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS = dict(w=W, w14=W14, r=R, probe="urn:ternleaf:probe")


def add_identity(paragraph, value):
    paragraph._p.set(qn("w14:paraId"), value)


def save_fixture(doc, path):
    for key, rel in list(doc.part.rels.items()):
        if rel.reltype.endswith("/stylesWithEffects"):
            del doc.part.rels[key]
    doc.save(path)


def geometry(folder):
    doc = Document()
    section = doc.sections[0]
    section.page_width, section.page_height = Inches(8.5), Inches(11)
    section.top_margin = section.bottom_margin = section.left_margin = section.right_margin = Inches(1)
    for size, height in [(8, 12), (8, 16), (12, 16), (12, 24), (16, 24), (16, 32)]:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = Pt(height)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.widow_control = False
        for text in (f"A{size}-{height} FIRST", f"B{size}-{height} SECOND"):
            if p.runs:
                p.runs[-1].add_break()
            run = p.add_run(text)
            run.font.name, run.font.size = "Arial", Pt(size)
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = Pt(16)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.widow_control = False
    for index in range(32):
        run = p.add_run(f"REFLOW {index + 1:02d}")
        run.font.name, run.font.size = "Arial", Pt(12)
        if index < 31:
            run.add_break()
    save_fixture(doc, folder / "geometry.docx")


def preservation(folder):
    chart = ROOT / "tests/fixtures/chart.docx"
    doc = Document(chart)
    # The chart template uses exact 16 pt spacing. An inline chart needs a line
    # that can grow to its full height in Word.
    doc.paragraphs[1].paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
    add_identity(doc.paragraphs[0], "0000ABCD")
    add_identity(doc.paragraphs[2], "0000EF01")
    header = doc.sections[0].header.paragraphs[0]
    header.add_run("Header ")
    add_identity(header, "00001234")
    hyperlink = OxmlElement("w:hyperlink")
    rid = header.part.relate_to("https://example.com/ternleaf", RT.HYPERLINK, is_external=True)
    hyperlink.set(qn("r:id"), rid)
    run = OxmlElement("w:r")
    t = OxmlElement("w:t")
    t.text = "Reference link"
    run.append(t)
    hyperlink.append(run)
    header._p.append(hyperlink)
    save_fixture(doc, folder / "owned.docx")


if __name__ == "__main__":
    folder = Path(sys.argv[1])
    folder.mkdir(parents=True, exist_ok=True)
    geometry(folder)
    preservation(folder)

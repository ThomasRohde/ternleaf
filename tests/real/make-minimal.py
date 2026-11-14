"""Write the smallest documents that show each defect that the real-documents
test found. tests/real/repro.mjs runs them against the engine.

    python3 tests/real/make-minimal.py <folder>
"""
import importlib.util
import sys
from pathlib import Path

from docx.oxml import parse_xml

sys.dont_write_bytecode = True

spec = importlib.util.spec_from_file_location("corpus", Path(__file__).with_name("make-corpus.py"))
corpus = importlib.util.module_from_spec(spec)
spec.loader.exec_module(corpus)
NS, r, field, append, finish = corpus.NS, corpus.r, corpus.field, corpus.append, corpus.finish


def plain(folder):
    doc = corpus.base("Plain", "Minimal")
    doc.add_paragraph("First paragraph.")
    doc.add_paragraph("Second paragraph.")
    finish(doc, folder / "plain.docx")


def comment(folder):
    # python-docx writes a comment as Word does: annotationRef in a
    # CommentText paragraph, and a CommentReference run in the body.
    doc = corpus.base("Comment", "Minimal")
    p = doc.add_paragraph("A sentence with a comment.")
    doc.add_comment(p.runs[0], text="A remark.", author="Reviewer", initials="R")
    doc.add_paragraph("Another paragraph.")
    finish(doc, folder / "comment.docx")


def toc(folder, nested=True, name="toc.docx"):
    # A TOC field that begins in the first entry and ends in its own
    # paragraph, as Word writes it. Each entry has a nested PAGEREF field.
    doc = corpus.base("Contents", "Minimal")
    entries = [("_Toc1", "Purpose", "1"), ("_Toc2", "Scope", "1")]
    xml = ""
    for index, (mark, text, page) in enumerate(entries):
        start = ('<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o "1-3" \\h \\z \\u </w:instrText></w:r>'
                 '<w:r><w:fldChar w:fldCharType="separate"/></w:r>') if index == 0 else ""
        entry = r(text) + "<w:r><w:tab/></w:r>" + (field(f"PAGEREF {mark} \\h", page) if nested else r(page))
        xml += f'<w:p>{start}<w:hyperlink w:anchor="{mark}" w:history="1">{entry}</w:hyperlink></w:p>'
    xml += '<w:p><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>'
    anchor = doc.add_paragraph("")
    for child in list(parse_xml(f"<w:body {NS}>{xml}</w:body>")):
        anchor._p.addprevious(child)
    anchor._p.getparent().remove(anchor._p)
    for ident, (mark, text, _) in enumerate(entries, start=10):
        heading = doc.add_heading(text, 1)
        corpus.bookmark(heading, mark, ident)
        doc.add_paragraph("Body text of " + text.lower() + ".")
    finish(doc, folder / name)


def sdt(folder):
    doc = corpus.base("Control", "Minimal")
    p = doc.add_paragraph("Owner: ")
    append(p, '<w:sdt><w:sdtPr><w:alias w:val="Owner"/><w:tag w:val="owner"/><w:id w:val="1001"/><w:text/></w:sdtPr>'
              f'<w:sdtContent>{r("Søren Kjær")}</w:sdtContent></w:sdt>')
    doc.add_paragraph("Another paragraph.")
    finish(doc, folder / "sdt.docx")


def simple_field(folder):
    doc = corpus.base("Simple field", "Minimal")
    p = doc.add_paragraph("File: ")
    append(p, f'<w:fldSimple w:instr=" FILENAME "><w:r>{corpus.t("simple-field.docx")}</w:r></w:fldSimple>')
    doc.add_paragraph("Another paragraph.")
    finish(doc, folder / "simple-field.docx")


def ref_field(folder):
    # A cross-reference: a bookmark on a caption and a REF field to it.
    doc = corpus.base("Field", "Minimal")
    caption = doc.add_paragraph("Table 1: Retention periods")
    corpus.bookmark(caption, "_Ref1", 1)
    p = doc.add_paragraph("See table ")
    append(p, field("REF _Ref1 \\h", "1") + r(" for the periods."))
    finish(doc, folder / "ref-field.docx")


def cell_field(folder):
    # A cross-reference in a table cell. The engine's assistant read gives
    # the fields of a body paragraph, but a cell paragraph only as the table.
    doc = corpus.base("Cell field", "Minimal")
    caption = doc.add_paragraph("Table 1: Retention periods")
    corpus.bookmark(caption, "_Ref1", 1)
    table = doc.add_table(rows=1, cols=2)
    append(table.cell(0, 0).paragraphs[0], r("See table ") + field("REF _Ref1 \\h", "1") + r(" in a cell."))
    table.cell(0, 1).paragraphs[0].add_run("Other cell")
    doc.add_paragraph("After the table.")
    finish(doc, folder / "cell-field.docx")


def footnote(folder):
    doc = corpus.base("Footnote", "Minimal")
    p = doc.add_paragraph("A claim with a source.")
    append(p, corpus.footnote_ref(1))
    finish(doc, folder / "footnote.docx", [
        ("word/footnotes.xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml",
         "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes",
         corpus.footnotes_part(["The source, version 3."]))])


if __name__ == "__main__":
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    plain(out)
    comment(out)
    toc(out)
    toc(out, nested=False, name="toc-flat.docx")
    sdt(out)
    simple_field(out)
    ref_field(out)
    footnote(out)
    cell_field(out)
    print("\n".join(sorted(p.name for p in out.glob("*.docx"))))

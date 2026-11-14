"""Write a corpus of Word documents with the structure of real team documents.

Each document has one focus: numbered headings, tables with merged cells,
lists, footnotes and cross-references, headers and footers with a landscape
section, comments and tracked changes, or a table of contents with content
controls. tests/real-documents.mjs opens, edits and exports each one.

    python3 tests/real/make-corpus.py <folder>

The output is deterministic: the same script writes the same bytes. The
documents are not kept in the repository.
"""
import io
import re
import struct
import sys
import zlib
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

from docx import Document
from docx.enum.section import WD_ORIENT, WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls, qn
from docx.shared import Mm, Pt, RGBColor

STAMP = datetime(2026, 10, 1, 9, 0, 0)
DATE = "2026-10-01T09:00:00Z"
NS = nsdecls("w", "r")
NAVY = RGBColor(0x1F, 0x3A, 0x5F)


# ---- Small builders for raw WordprocessingML --------------------------------

def t(text):
    return f'<w:t xml:space="preserve">{escape(text)}</w:t>'


def r(text, rpr=""):
    return f"<w:r>{'<w:rPr>' + rpr + '</w:rPr>' if rpr else ''}{t(text)}</w:r>"


def field(instr, result, rpr=""):
    """A complex field: begin, code, separate, the cached result, end."""
    pr = f"<w:rPr>{rpr}</w:rPr>" if rpr else ""
    return (f'<w:r>{pr}<w:fldChar w:fldCharType="begin"/></w:r>'
            f'<w:r>{pr}<w:instrText xml:space="preserve"> {escape(instr)} </w:instrText></w:r>'
            f'<w:r>{pr}<w:fldChar w:fldCharType="separate"/></w:r>'
            + r(result, rpr)
            + f'<w:r>{pr}<w:fldChar w:fldCharType="end"/></w:r>')


def append(paragraph, xml):
    """Append raw runs (or other inline content) to a python-docx paragraph."""
    holder = parse_xml(f"<w:p {NS}>{xml}</w:p>")
    for child in list(holder):
        paragraph._p.append(child)


def bookmark(paragraph, name, ident):
    """Put a bookmark around all the content of a paragraph."""
    p = paragraph._p
    start = parse_xml(f'<w:bookmarkStart {NS} w:id="{ident}" w:name="{name}"/>')
    end = parse_xml(f'<w:bookmarkEnd {NS} w:id="{ident}"/>')
    ppr = p.find(qn("w:pPr"))
    (ppr.addnext(start) if ppr is not None else p.insert(0, start))
    p.append(end)


def set_numbering(paragraph, num_id, level=0):
    num_pr = paragraph._p.get_or_add_pPr().get_or_add_numPr()
    num_pr.get_or_add_ilvl().val = level
    num_pr.get_or_add_numId().val = num_id


def add_abstract(doc, levels, multilevel=True):
    """Add a list definition and an instance of it. Returns the numId.

    levels: (numFmt, lvlText, indent twips, pStyle or None, bullet font)."""
    numbering = doc.part.numbering_part.element
    abstract_ids = [int(x.get(qn("w:abstractNumId"))) for x in numbering.findall(qn("w:abstractNum"))]
    num_ids = [int(x.get(qn("w:numId"))) for x in numbering.findall(qn("w:num"))]
    abstract_id = max(abstract_ids + [0]) + 1
    num_id = max(num_ids + [0]) + 1
    body = "".join(
        f'<w:lvl w:ilvl="{i}"><w:start w:val="1"/><w:numFmt w:val="{fmt}"/>'
        + (f'<w:pStyle w:val="{style}"/>' if style else "")
        + f'<w:lvlText w:val="{text}"/><w:lvlJc w:val="left"/>'
        f'<w:pPr><w:ind w:left="{indent}" w:hanging="{360 if not style else indent}"/></w:pPr>'
        + (f'<w:rPr><w:rFonts w:ascii="{font}" w:hAnsi="{font}" w:hint="default"/></w:rPr>' if font else "")
        + "</w:lvl>"
        for i, (fmt, text, indent, style, font) in enumerate(levels))
    abstract = parse_xml(f'<w:abstractNum {NS} w:abstractNumId="{abstract_id}">'
                         f'<w:multiLevelType w:val="{"multilevel" if multilevel else "hybridMultilevel"}"/>{body}</w:abstractNum>')
    first_num = numbering.find(qn("w:num"))
    if first_num is not None:
        first_num.addprevious(abstract)
    else:
        numbering.append(abstract)
    numbering.append(parse_xml(f'<w:num {NS} w:numId="{num_id}"><w:abstractNumId w:val="{abstract_id}"/></w:num>'))
    return num_id


BULLETS = [("bullet", "•", 720, None, "Symbol"), ("bullet", "–", 1440, None, "Arial"), ("bullet", "▪", 2160, None, "Arial")]
DECIMAL = [("decimal", "%1.", 720, None, None), ("lowerLetter", "%2)", 1440, None, None), ("lowerRoman", "%3.", 2160, None, None)]


def numbered_headings(doc):
    """A multilevel list linked to Heading 1 to 3, as Word makes it."""
    num_id = add_abstract(doc, [("decimal", "%1.", 432, "Heading1", None),
                                ("decimal", "%1.%2.", 576, "Heading2", None),
                                ("decimal", "%1.%2.%3.", 720, "Heading3", None)])
    for level, name in enumerate(["Heading 1", "Heading 2", "Heading 3"]):
        num_pr = doc.styles[name].element.get_or_add_pPr().get_or_add_numPr()
        if level:
            num_pr.get_or_add_ilvl().val = level
        num_pr.get_or_add_numId().val = num_id
    return num_id


def base(title, subject):
    doc = Document()
    section = doc.sections[0]
    section.page_width, section.page_height = Mm(210), Mm(297)
    section.left_margin = section.right_margin = Mm(25)
    section.top_margin = section.bottom_margin = Mm(25)
    normal = doc.styles["Normal"]
    normal.font.name = "Arial"
    normal.font.size = Pt(10.5)
    normal.paragraph_format.space_after = Pt(6)
    for name, size in (("Title", 24), ("Heading 1", 14), ("Heading 2", 12), ("Heading 3", 11)):
        style = doc.styles[name]
        style.font.name = "Arial"
        style.font.size = Pt(size)
        style.font.color.rgb = NAVY
    props = doc.core_properties
    props.title, props.subject, props.author, props.last_modified_by = title, subject, "EA Team", "EA Team"
    props.created = props.modified = STAMP
    props.revision = 1
    props.comments = ""
    return doc


def house_styles(doc):
    """Styles of the team's own template, which Word does not know."""
    body = doc.styles.add_style("EA Body", WD_STYLE_TYPE.PARAGRAPH)
    body.base_style = doc.styles["Normal"]
    body.paragraph_format.space_after = Pt(8)
    body.paragraph_format.line_spacing = 1.15
    status = doc.styles.add_style("EA Status", WD_STYLE_TYPE.PARAGRAPH)
    status.base_style = body
    status.font.bold = True
    status.font.color.rgb = RGBColor(0x0B, 0x6E, 0x4F)
    term = doc.styles.add_style("EA Term", WD_STYLE_TYPE.CHARACTER)
    term.font.italic = True
    term.font.color.rgb = NAVY
    return body


def header_row(table):
    for cell in table.rows[0].cells:
        for run in cell.paragraphs[0].runs:
            run.bold = True
    tr_pr = table.rows[0]._tr.get_or_add_trPr()
    tr_pr.append(parse_xml(f"<w:tblHeader {NS}/>"))


def fill_table(table, rows):
    for row, values in zip(table.rows, rows):
        for cell, value in zip(row.cells, values):
            if value is not None:
                cell.paragraphs[0].text = value


def png(width, height):
    """A small, deterministic picture: three boxes and two connectors."""
    pixels = []
    boxes = [(10, 20, 60, 60), (100, 20, 150, 60), (190, 20, 240, 60)]
    for y in range(height):
        row = bytearray([0])
        for x in range(width):
            inside = any(x0 <= x <= x1 and y0 <= y <= y1 for x0, y0, x1, y1 in boxes)
            edge = any((x in (x0, x1) and y0 <= y <= y1) or (y in (y0, y1) and x0 <= x <= x1) for x0, y0, x1, y1 in boxes)
            line = y == 40 and (60 < x < 100 or 150 < x < 190)
            row += bytes((31, 58, 95)) if edge or line else bytes((214, 228, 240)) if inside else bytes((255, 255, 255))
        pixels.append(bytes(row))
    raw = zlib.compress(b"".join(pixels), 9)
    chunk = lambda kind, data: struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", raw) + chunk(b"IEND", b""))


# ---- Saving ----------------------------------------------------------------

CT_TYPES = '{http://schemas.openxmlformats.org/package/2006/content-types}'


def finish(doc, path, extra=()):
    """Save without the Word 2010 style copy, add raw parts, and write a ZIP
    with fixed times so that the bytes are the same on every run."""
    for rel_id, rel in list(doc.part.rels.items()):
        if rel.reltype.endswith("/stylesWithEffects"):
            doc.part.drop_rel(rel_id)
    buffer = io.BytesIO()
    doc.save(buffer)
    with ZipFile(buffer) as source:
        names = source.namelist()
        parts = {name: source.read(name) for name in names}
    for name, content_type, rel_type, xml in extra:
        parts[name] = xml.encode("utf-8")
        if name not in names:
            names.append(name)
        types = parts["[Content_Types].xml"].decode()
        types = types.replace("</Types>", f'<Override PartName="/{name}" ContentType="{content_type}"/></Types>')
        parts["[Content_Types].xml"] = types.encode()
        rels = parts["word/_rels/document.xml.rels"].decode()
        ident = "rIdX" + str(len(re.findall("rIdX", rels)) + 1)
        target = name.split("word/", 1)[1]
        rels = rels.replace("</Relationships>", f'<Relationship Id="{ident}" Type="{rel_type}" Target="{target}"/></Relationships>')
        parts["word/_rels/document.xml.rels"] = rels.encode()
    # python-docx stamps comments with the current time.
    if "word/comments.xml" in parts:
        parts["word/comments.xml"] = re.sub(rb'w:date="[^"]*"', f'w:date="{DATE}"'.encode(), parts["word/comments.xml"])
    with ZipFile(path, "w") as target:
        for name in names:
            info = ZipInfo(name, date_time=(2026, 10, 1, 9, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            target.writestr(info, parts[name])


def footnotes_part(notes):
    body = "".join(f'<w:footnote w:id="{i}"><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>'
                   f'<w:r><w:rPr><w:vertAlign w:val="superscript"/></w:rPr><w:footnoteRef/></w:r>'
                   f'{r(" " + text, "<w:sz w:val=\"18\"/>")}</w:p></w:footnote>'
                   for i, text in enumerate(notes, start=1))
    return (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:footnotes {NS}>'
            '<w:footnote w:type="separator" w:id="-1"><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:separator/></w:r></w:p></w:footnote>'
            '<w:footnote w:type="continuationSeparator" w:id="0"><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:continuationSeparator/></w:r></w:p></w:footnote>'
            f"{body}</w:footnotes>")


def footnote_ref(number):
    return f'<w:r><w:rPr><w:vertAlign w:val="superscript"/></w:rPr><w:footnoteReference w:id="{number}"/></w:r>'


def hyperlink(doc, paragraph, text, url):
    rel = doc.part.relate_to(url, RT.HYPERLINK, is_external=True)
    append(paragraph, f'<w:hyperlink r:id="{rel}" w:history="1">'
                      + r(text, '<w:color w:val="0563C1"/><w:u w:val="single"/>') + "</w:hyperlink>")


# ---- The documents ---------------------------------------------------------

def adr(folder):
    """An architecture decision record: numbered headings, a two-level
    bulleted list, a hyperlink, the team's own styles and Danish text."""
    doc = base("ADR-014 Event streaming platform", "Architecture decision record")
    body = house_styles(doc)
    numbered_headings(doc)
    bullets = add_abstract(doc, BULLETS)
    doc.add_paragraph("ADR-014: Event streaming platform for payments", style="Title")
    doc.add_paragraph("Status: Accepted by the design authority on 24 September 2026", style="EA Status")
    doc.add_heading("Context", 1)
    p = doc.add_paragraph("", style=body)
    p.add_run("Payments, cards and fraud detection exchange events through point-to-point queues. Each team runs its own broker, and nobody can see the whole flow of a payment. The ")
    p.add_run("event backbone").style = doc.styles["EA Term"]
    p.add_run(" that this record describes replaces those queues with one managed platform.")
    doc.add_paragraph("The current queues lose messages when a broker restarts. In the last two quarters three incidents had this cause, and each one needed a manual reconciliation.", style=body)
    doc.add_heading("Forces", 2)
    for level, text in [(0, "Regulators expect a full audit trail for each payment event."),
                        (1, "DORA requires that we can show the flow of critical services."),
                        (1, "GDPR requires that personal data in an event can be removed."),
                        (0, "The platform teams have limited capacity for new operations work."),
                        (0, "Danish characters must survive every hop: æ, ø and å in names and addresses.")]:
        set_numbering(doc.add_paragraph(text, style="List Paragraph"), bullets, level)
    doc.add_heading("Decision", 1)
    doc.add_paragraph("We use a managed event streaming service with a schema registry. Every producer registers its schema before it publishes. Topics are owned by the domain that writes them.", style=body)
    doc.add_paragraph("Beslutningen gælder for alle nye integrationer fra 1. januar 2027. Eksisterende køer flyttes, når de skal ændres alligevel.", style=body)
    doc.add_heading("Options that we rejected", 2)
    doc.add_paragraph("A self-hosted cluster gives more control, but it needs a team of four people to run it. A shared message queue does not keep the order of events per account, and the fraud models need that order.", style=body)
    doc.add_heading("Consequences", 1)
    for level, text in [(0, "Producers must register a schema and keep it backward compatible."),
                        (0, "The integration team gives each domain a template for a new topic."),
                        (1, "The template includes retention, partitions and access rules."),
                        (0, "The old queues are switched off when the last consumer has moved.")]:
        set_numbering(doc.add_paragraph(text, style="List Paragraph"), bullets, level)
    p = doc.add_paragraph("The platform guidelines are in the ", style=body)
    hyperlink(doc, p, "integration handbook", "https://example.com/integration/handbook")
    p.add_run(". Ask the integration team for access.")
    doc.add_heading("Follow-up", 2)
    doc.add_paragraph("The design authority reviews this decision after the first two domains have moved, or after six months, whichever comes first.", style=body)
    finish(doc, folder / "adr-event-streaming.docx")


def brief(folder):
    """A design authority brief: a table of options with a repeated header
    row, cells merged across and down, shading, and a numbered list."""
    doc = base("Design authority brief: customer identity", "Brief")
    numbers = add_abstract(doc, DECIMAL)
    doc.add_paragraph("Design authority brief: customer identity", style="Title")
    doc.add_heading("Question for the design authority", 1)
    doc.add_paragraph("Which identity platform do we use for retail and business customers from 2027? The current platform reaches end of support in March 2028, and the contract cannot be extended.")
    doc.add_heading("Options", 1)
    doc.add_paragraph("The working group assessed three options against cost, risk and fit with the target architecture. All costs are in million DKK over five years.")
    table = doc.add_table(rows=6, cols=5)
    table.style = doc.styles["Table Grid"]
    fill_table(table, [
        ["Option", "Description", "Cost", None, "Risk"],
        [None, None, "Build", "Run", None],
        ["A. Upgrade", "Upgrade the current platform to the vendor's cloud edition.", "12", "30", "Low: the same vendor and the same team."],
        ["B. Replace", "Move to a new identity provider with federation for business customers.", "25", "22", "Medium: migration of 2.1 million customer accounts."],
        ["C. Split", "Keep retail on the current vendor and move business customers.", "18", "34", "High: two platforms to run."],
        [None, "Federation needs a second contract for the business part.", None, None, None],
    ])
    table.cell(0, 2).merge(table.cell(0, 3))
    table.cell(0, 0).merge(table.cell(1, 0))
    table.cell(0, 1).merge(table.cell(1, 1))
    table.cell(0, 4).merge(table.cell(1, 4))
    table.cell(4, 0).merge(table.cell(5, 0))
    table.cell(4, 2).merge(table.cell(5, 2))
    table.cell(4, 3).merge(table.cell(5, 3))
    table.cell(4, 4).merge(table.cell(5, 4))
    header_row(table)
    table.rows[1]._tr.get_or_add_trPr().append(parse_xml(f"<w:tblHeader {NS}/>"))
    # A merged cell appears once for each grid column it spans.
    for tc in dict.fromkeys(cell._tc for cell in table.rows[0].cells):
        tc.get_or_add_tcPr().append(parse_xml(f'<w:shd {NS} w:val="clear" w:color="auto" w:fill="D9E2F3"/>'))
    doc.add_heading("Recommendation", 1)
    doc.add_paragraph("The working group recommends option B. It has the lowest running cost and one platform for all customers.")
    for level, text in [(0, "Approve option B as the target identity platform."),
                        (0, "Ask the programme to plan the migration in three waves:"),
                        (1, "employees and test customers,"),
                        (1, "retail customers,"),
                        (1, "business customers with federation."),
                        (0, "Review the business case again before the second wave.")]:
        set_numbering(doc.add_paragraph(text), numbers, level)
    doc.add_heading("Decision requested", 1)
    small = doc.add_table(rows=3, cols=2)
    small.style = doc.styles["Table Grid"]
    fill_table(small, [["Decision", "Owner"], ["Approve option B", "Design authority"], ["Fund the first wave", "Investment board"]])
    header_row(small)
    finish(doc, folder / "da-brief-identity.docx")


def standard(folder):
    """A standard with numbered requirements: numbered headings, a
    requirement list with its own numbering, bold keywords and tabs."""
    doc = base("Standard: API design", "Standard")
    house_styles(doc)
    numbered_headings(doc)
    reqs = add_abstract(doc, [("decimal", "R%1", 720, None, None), ("decimal", "R%1.%2", 1440, None, None)])
    doc.add_paragraph("Standard: API design", style="Title")
    doc.add_paragraph("Version 2.1. Owner: Enterprise Architecture. Applies to every API that another team uses.", style="EA Body")
    doc.add_heading("Purpose", 1)
    doc.add_paragraph("This standard makes our APIs predictable for the teams that use them. A team that follows it can be reviewed in one meeting.", style="EA Body")
    doc.add_heading("Requirements", 1)
    doc.add_heading("Naming and versions", 2)
    for level, parts in [(0, [("Every API ", False), ("MUST", True), (" have a name that says what it does, in English, in kebab case.", False)]),
                         (0, [("Every API ", False), ("MUST", True), (" have a major version in the path, for example /v2/.", False)]),
                         (1, [("A new major version ", False), ("MUST", True), (" run beside the old one for at least six months.", False)]),
                         (1, [("Minor changes ", False), ("SHOULD", True), (" be backward compatible.", False)])]:
        p = doc.add_paragraph()
        for text, bold in parts:
            p.add_run(text).bold = bold
        set_numbering(p, reqs, level)
    doc.add_heading("Errors", 2)
    for parts in [[("Errors ", False), ("MUST", True), (" use the problem details format of RFC 9457.", False)],
                  [("An error ", False), ("MUST NOT", True), (" contain a stack trace or personal data.", False)]]:
        p = doc.add_paragraph()
        for text, bold in parts:
            p.add_run(text).bold = bold
        set_numbering(p, reqs, 0)
    doc.add_heading("Security", 2)
    p = doc.add_paragraph("Every API ")
    p.add_run("MUST").bold = True
    p.add_run(" require OAuth 2.0 with scopes per operation.")
    set_numbering(p, reqs, 0)
    doc.add_heading("Exceptions", 1)
    doc.add_paragraph("A team that cannot meet a requirement asks the design authority for an exception. The request names the requirement, the reason and the date by which the team will comply.", style="EA Body")
    p = doc.add_paragraph("Contact:\tEnterprise Architecture, design authority secretary", style="EA Body")
    doc.add_paragraph("Kontakt arkitekturteamet på dansk eller engelsk; svar gives inden for fem arbejdsdage.", style="EA Body")
    finish(doc, folder / "standard-api.docx")


def minutes(folder):
    """Meeting minutes in Danish and English: attendees, a numbered agenda,
    decisions, and an action table with a two-paragraph cell."""
    doc = base("Referat: Design authority 14. oktober 2026", "Minutes")
    bullets = add_abstract(doc, BULLETS)
    numbers = add_abstract(doc, DECIMAL)
    doc.add_paragraph("Referat: Design authority, 14. oktober 2026", style="Title")
    doc.add_paragraph("Sted: Mødelokale Ørestad og Teams. Referent: Åse Lindqvist.")
    doc.add_heading("Deltagere", 1)
    for name in ["Søren Kjær (formand)", "Mette Ørsted", "Jørgen Bæk", "Åse Lindqvist (sekretær)", "Zoë Müller (gæst, leverandør)"]:
        set_numbering(doc.add_paragraph(name), bullets, 0)
    doc.add_heading("Dagsorden", 1)
    for level, text in [(0, "Godkendelse af referat fra sidste møde"),
                        (0, "ADR-014: Event streaming platform"),
                        (1, "Præsentation ved integrationsteamet"),
                        (1, "Spørgsmål og beslutning"),
                        (0, "Eventuelt")]:
        set_numbering(doc.add_paragraph(text), numbers, level)
    doc.add_heading("Beslutninger", 1)
    doc.add_paragraph("Referatet fra mødet den 9. september blev godkendt uden ændringer.")
    doc.add_paragraph("ADR-014 blev godkendt. Design authority beder integrationsteamet om at vise en plan for flytning af de eksisterende køer på næste møde.")
    doc.add_paragraph("The vendor confirmed that the managed service runs in two EU regions. Data stays in the EU.")
    doc.add_heading("Handlinger", 1)
    table = doc.add_table(rows=5, cols=4)
    table.style = doc.styles["Table Grid"]
    fill_table(table, [["Nr.", "Handling", "Ansvarlig", "Frist"],
                       ["1", "Send plan for flytning af køer til sekretæren.", "Jørgen Bæk", "4. november"],
                       ["2", "Tjek kontrakten for dataplacering i EU.", "Mette Ørsted", "28. oktober"],
                       ["3", "Opdatér arkitekturkataloget med ADR-014.", "Åse Lindqvist", "21. oktober"],
                       ["4", "Book næste møde.", "Søren Kjær", "18. oktober"]])
    table.cell(2, 1).add_paragraph("Inddrag juridisk afdeling, hvis kontrakten er uklar.")
    header_row(table)
    doc.add_heading("Næste møde", 1)
    doc.add_paragraph("Næste møde holdes den 11. november 2026 kl. 13.00–14.30.")
    finish(doc, folder / "minutes-eada.docx")


def notes(folder):
    """A position paper with footnotes, bookmarks, a table caption with a
    SEQ field, and REF and PAGEREF cross-references."""
    doc = base("Data retention position paper", "Position paper")
    numbered_headings(doc)
    doc.add_paragraph("Data retention for event platforms", style="Title")
    h = doc.add_heading("Scope", 1)
    bookmark(h, "_Ref180000001", 201)
    p = doc.add_paragraph("This paper covers events that contain personal data. It does not cover logs, which have their own standard.")
    append(p, footnote_ref(1))
    doc.add_heading("Retention periods", 1)
    p = doc.add_paragraph("The retention periods follow the legal minimum and the business need. ")
    append(p, r("Table ") + field("REF _Ref180000002 \\h", "1") + r(" lists them. The rules apply from the date in section ")
           + field("REF _Ref180000001 \\r \\h", "1") + r("."))
    caption = doc.add_paragraph("", style="Caption")
    append(caption, r("Table ") + field("SEQ Table \\* ARABIC", "1") + r(": Retention periods by kind of event"))
    bookmark(caption, "_Ref180000002", 202)
    table = doc.add_table(rows=4, cols=3)
    table.style = doc.styles["Table Grid"]
    fill_table(table, [["Kind of event", "Retention", "Legal basis"],
                       ["Payment initiated", "5 years", "Bookkeeping Act"],
                       ["Card authorised", "13 months", "Card scheme rules"],
                       ["Login attempt", "90 days", "Legitimate interest"]])
    header_row(table)
    p = doc.add_paragraph("A payment event keeps the account number for five years.")
    append(p, footnote_ref(2) + r(" After that period the platform removes the event or replaces the personal data with a token."))
    doc.add_heading("Deletion", 1)
    p = doc.add_paragraph("Deletion runs every night. A request from a customer to delete data is handled within 30 days, as the scope on page ")
    append(p, field("PAGEREF _Ref180000001 \\h", "1") + r(" describes."))
    append(p, footnote_ref(3))
    doc.add_paragraph("Sletning af data i backup sker, når backuppen udløber; den gendannes aldrig med slettede hændelser.")
    finish(doc, folder / "notes-crossref.docx", [
        ("word/footnotes.xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml",
         "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes",
         footnotes_part(["Logs follow the logging standard, version 3.",
                         "The Danish Bookkeeping Act (bogføringsloven), section 12.",
                         "GDPR article 12(3): one month, which can be extended in some cases."]))])


def layout(folder):
    """Headers and footers with PAGE and NUMPAGES fields, a different first
    page, a picture, and a landscape section between two portrait ones."""
    doc = base("Target architecture: payments", "Architecture overview")
    section = doc.sections[0]
    section.different_first_page_header_footer = True
    first = section.first_page_header.paragraphs[0]
    first.text = "Internal. Draft for the design authority."
    header = section.header.paragraphs[0]
    header.text = "Target architecture: payments"
    footer = section.footer.paragraphs[0]
    append(footer, r("Page ") + field("PAGE", "1") + r(" of ") + field("NUMPAGES", "3")
           + r(" · ") + f'<w:fldSimple w:instr=" FILENAME "><w:r>{t("layout-landscape.docx")}</w:r></w:fldSimple>')
    doc.add_paragraph("Target architecture: payments", style="Title")
    doc.add_paragraph("This overview shows the target state for the payment domain in 2028. The next page has the capability map in landscape format.")
    doc.add_heading("Overview", 1)
    doc.add_paragraph("Three platforms carry the payment flow: the channel layer, the payment hub and the ledger. Each platform owns its data and publishes events.")
    doc.add_picture(io.BytesIO(png(250, 80)), width=Mm(120))
    doc.add_paragraph("Figure 1: The three platforms and the events between them.", style="Caption")
    doc.add_paragraph("The payment hub is the only system that talks to the clearing houses. Channels never call the ledger directly.")
    wide = doc.add_section(WD_SECTION.NEW_PAGE)
    wide.orientation = WD_ORIENT.LANDSCAPE
    wide.page_width, wide.page_height = Mm(297), Mm(210)
    doc.add_heading("Capability map", 1)
    table = doc.add_table(rows=4, cols=6)
    table.style = doc.styles["Table Grid"]
    fill_table(table, [["Capability", "Channel", "Payment hub", "Ledger", "Owner", "Target date"],
                       ["Initiate payment", "Yes", "Yes", "No", "Payments", "Q2 2027"],
                       ["Screen payment", "No", "Yes", "No", "Financial crime", "Q3 2027"],
                       ["Book payment", "No", "No", "Yes", "Core banking", "Q1 2028"]])
    header_row(table)
    doc.add_paragraph("The landscape page lets the map show all six columns at a readable size.")
    back = doc.add_section(WD_SECTION.NEW_PAGE)
    back.orientation = WD_ORIENT.PORTRAIT
    back.page_width, back.page_height = Mm(210), Mm(297)
    doc.add_heading("Next steps", 1)
    doc.add_paragraph("The domain architects check the map with their teams before the design authority meets on 11 November.")
    finish(doc, folder / "layout-landscape.docx")


def review(folder):
    """A draft that came back from a reviewer: two comments, an insertion,
    a deletion, a formatting change and an inserted paragraph."""
    doc = base("Cloud exit strategy, draft 3", "Strategy")
    doc.add_paragraph("Cloud exit strategy", style="Title")
    doc.add_heading("Why we need an exit strategy", 1)
    p = doc.add_paragraph("DORA requires a documented exit strategy for each critical ICT service that a third party provides.")
    doc.add_comment(p.runs[0], text="Add the article number, please.", author="Mette Ørsted", initials="MØ")
    p = doc.add_paragraph("The strategy must be tested ")
    append(p, f'<w:ins w:id="101" w:author="Mette Ørsted" w:date="{DATE}">{r("at least once a year ")}</w:ins>'
           + r("and updated when the service changes."))
    p = doc.add_paragraph("")
    append(p, r("We keep ") + f'<w:del w:id="102" w:author="Jørgen Bæk" w:date="{DATE}"><w:r><w:delText xml:space="preserve">all </w:delText></w:r></w:del>'
           + r("copies of the data in a format that a second provider can read."))
    doc.add_heading("Options for exit", 1)
    p = doc.add_paragraph("")
    append(p, f'<w:r><w:rPr><w:b/><w:rPrChange w:id="103" w:author="Jørgen Bæk" w:date="{DATE}"><w:rPr/></w:rPrChange></w:rPr>{t("Move to a second provider.")}</w:r>'
           + r(" This is the preferred option for stateless services."))
    p = doc.add_paragraph("Bring the service back on premises. This option needs space in the data centre, which we do not have today.")
    doc.add_comment(p.runs[0], text="Facilities say that space is possible from 2028. Hvem tjekker det?", author="Søren Kjær", initials="SK")
    p = doc.add_paragraph("")
    p._p.get_or_add_pPr().append(parse_xml(f'<w:rPr {NS}><w:ins w:id="104" w:author="Mette Ørsted" w:date="{DATE}"/></w:rPr>'))
    append(p, f'<w:ins w:id="105" w:author="Mette Ørsted" w:date="{DATE}">{r("Stop the service and use a manual process for at most five days.")}</w:ins>')
    doc.add_heading("Next steps", 1)
    doc.add_paragraph("Each service owner writes the exit plan for the service by the end of the first quarter.")
    finish(doc, folder / "review-comments.docx")


def toc(folder):
    """A handbook with a title page, a table of contents field with cached
    entries and links, and inline and block content controls."""
    doc = base("Architecture handbook", "Handbook")
    numbered_headings(doc)
    for name, indent in (("toc 1", 0), ("toc 2", 220)):
        style = doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
        style.base_style = doc.styles["Normal"]
        style.element.set(qn("w:styleId"), "TOC" + name[-1])
        style.paragraph_format.left_indent = Pt(indent / 20)
        style.paragraph_format.space_after = Pt(3)
    doc.add_paragraph("Architecture handbook", style="Title")
    doc.add_paragraph("How the enterprise architecture team works", style="Subtitle")
    p = doc.add_paragraph("Document owner: ")
    append(p, '<w:sdt><w:sdtPr><w:alias w:val="Document owner"/><w:tag w:val="owner"/><w:id w:val="1001"/><w:text/></w:sdtPr>'
              f'<w:sdtContent>{r("Søren Kjær")}</w:sdtContent></w:sdt>')
    p = doc.add_paragraph("Status: ")
    append(p, '<w:sdt><w:sdtPr><w:alias w:val="Status"/><w:tag w:val="status"/><w:id w:val="1002"/>'
              '<w:dropDownList><w:listItem w:displayText="Draft" w:value="Draft"/><w:listItem w:displayText="Approved" w:value="Approved"/></w:dropDownList></w:sdtPr>'
              f'<w:sdtContent>{r("Draft")}</w:sdtContent></w:sdt>')
    p = doc.add_paragraph("Approved on: ")
    append(p, '<w:sdt><w:sdtPr><w:alias w:val="Approval date"/><w:tag w:val="approved"/><w:id w:val="1003"/>'
              '<w:date w:fullDate="2026-11-02T00:00:00Z"><w:dateFormat w:val="d. MMMM yyyy"/><w:lid w:val="da-DK"/>'
              '<w:storeMappedDataAs w:val="dateTime"/><w:calendar w:val="gregorian"/></w:date></w:sdtPr>'
              f'<w:sdtContent>{r("2. november 2026")}</w:sdtContent></w:sdt>')
    doc.add_page_break()
    headings = [(1, "Purpose", "_Toc180000011", "2"), (1, "How we work", "_Toc180000012", "2"),
                (2, "Design authority", "_Toc180000013", "2"), (2, "Assessments", "_Toc180000014", "2"),
                (1, "Standards", "_Toc180000015", "3")]
    toc_xml = ('<w:sdt><w:sdtPr><w:id w:val="1010"/><w:docPartObj><w:docPartGallery w:val="Table of Contents"/><w:docPartUnique/></w:docPartObj></w:sdtPr><w:sdtContent>'
               f'<w:p><w:pPr><w:pStyle w:val="TOCHeading"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="0"/></w:numPr></w:pPr>{r("Contents")}</w:p>')
    numbers = {1: 0, 2: 0}
    for index, (level, text, mark, page) in enumerate(headings):
        numbers[level] += 1
        if level == 1:
            numbers[2] = 0
        label = f"{numbers[1]}." if level == 1 else f"{numbers[1]}.{numbers[2]}."
        start = (('<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o "1-3" \\h \\z \\u </w:instrText></w:r>'
                  '<w:r><w:fldChar w:fldCharType="separate"/></w:r>') if index == 0 else "")
        toc_xml += (f'<w:p><w:pPr><w:pStyle w:val="TOC{level}"/><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9060"/></w:tabs></w:pPr>{start}'
                    f'<w:hyperlink w:anchor="{mark}" w:history="1">{r(label + " " + text)}<w:r><w:tab/></w:r>'
                    f'{field("PAGEREF " + mark + " \\h", page)}</w:hyperlink></w:p>')
    toc_xml += '<w:p><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:sdtContent></w:sdt>'
    holder = parse_xml(f"<w:body {NS}>{toc_xml}</w:body>")
    anchor = doc.add_paragraph("")
    for child in list(holder):
        anchor._p.addprevious(child)
    anchor._p.getparent().remove(anchor._p)
    doc.add_page_break()
    texts = {
        "Purpose": "This handbook says how the team works, which documents we write and who decides. New members read it in their first week.",
        "How we work": "We work in the open. Every assessment and every decision record is in the shared repository, and anyone in the bank can read it.",
        "Design authority": "The design authority meets every second week. The secretary sends the agenda three working days before the meeting.",
        "Assessments": "An assessment compares a solution with the target architecture and the standards. It ends with a recommendation and the conditions for approval.",
        "Standards": "Standards are short and testable. Each requirement has a number, so that an assessment can refer to it.",
    }
    for ident, (level, text, mark, _) in enumerate(headings, start=211):
        bookmark(doc.add_heading(text, level), mark, ident)
        doc.add_paragraph(texts[text])
    summary = ('<w:sdt><w:sdtPr><w:alias w:val="Summary for the catalogue"/><w:tag w:val="summary"/><w:id w:val="1004"/></w:sdtPr><w:sdtContent>'
               f'<w:p>{r("Summary: the handbook describes roles, the design authority, assessments and standards. Opdateres hvert halvår.")}</w:p>'
               '</w:sdtContent></w:sdt>')
    anchor = doc.add_paragraph("")
    anchor._p.addprevious(parse_xml(f"<w:body {NS}>{summary}</w:body>")[0])
    anchor._p.getparent().remove(anchor._p)
    finish(doc, folder / "toc-controls.docx")


BUILDERS = [adr, brief, standard, minutes, notes, layout, review, toc]

if __name__ == "__main__":
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    for build in BUILDERS:
        build(out)
    print("\n".join(sorted(p.name for p in out.glob("*.docx"))))

"""Check source owners and relationships after every structural checkpoint."""
import posixpath
import sys
from pathlib import Path
from zipfile import ZipFile
from lxml import etree as ET

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W14 = "http://schemas.microsoft.com/office/word/2010/wordml"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
C = "http://schemas.openxmlformats.org/drawingml/2006/chart"
NS = dict(w=W, w14=W14, c=C, probe="urn:ternleaf:probe")
root = Path(sys.argv[1])


def rel(archive, source, rid, kind):
    folder, filename = posixpath.split(source)
    path = posixpath.join(folder, "_rels", filename + ".rels")
    entries = [r for r in ET.fromstring(archive.read(path))
               if r.get("Id") == rid and r.get("Type") == R + "/" + kind]
    assert len(entries) == 1, (source, rid, kind)
    return entries[0]


def resolve(source, target):
    return target.lstrip("/") if target.startswith("/") else posixpath.normpath(posixpath.join(posixpath.dirname(source), target))


def examine(archive, chart_bytes, workbook_bytes, order):
    source = "word/document.xml"
    xml = ET.fromstring(archive.read(source))
    nodes = xml.xpath("w:body/w:p", namespaces=NS)
    ids = [p.get(f"{{{W14}}}paraId") for p in nodes]
    assert ids == order, ids
    marked = xml.xpath(".//w:p[@w14:paraId='0000ABCD']", namespaces=NS)[0]
    assert marked.xpath(".//probe:kept/@value", namespaces=NS) == ["keep & verify"]
    anchors = xml.xpath(".//c:chart", namespaces=NS)
    assert len(anchors) == 1
    anchor = anchors[0]
    assert any(p.tag.endswith("}inline") for p in anchor.iterancestors())
    chart_owner = next(p for p in anchor.iterancestors() if p.tag == f"{{{W}}}p")
    spacing = chart_owner.find("w:pPr/w:spacing", NS)
    assert spacing is not None and spacing.get(f"{{{W}}}lineRule") == "auto"
    chart = resolve(source, rel(archive, source, anchor.get(f"{{{R}}}id"), "chart").get("Target"))
    assert archive.read(chart) == chart_bytes
    chart_tree = ET.fromstring(chart_bytes)
    workbook = resolve(chart, rel(archive, chart, chart_tree.find(f"{{{C}}}externalData").get(f"{{{R}}}id"), "package").get("Target"))
    assert archive.read(workbook) == workbook_bytes
    header_ref = xml.xpath(".//w:headerReference", namespaces=NS)[0]
    header = resolve(source, rel(archive, source, header_ref.get(f"{{{R}}}id"), "header").get("Target"))
    header_xml = ET.fromstring(archive.read(header))
    owner = header_xml.xpath("w:p[@w14:paraId='00001234']", namespaces=NS)[0]
    assert "".join(owner.xpath(".//w:t/text()", namespaces=NS)) == "Updated header Reference link"
    link = owner.xpath("w:hyperlink", namespaces=NS)[0]
    target = rel(archive, header, link.get(f"{{{R}}}id"), "hyperlink")
    assert target.get("TargetMode") == "External"
    assert target.get("Target") == "https://example.com/ternleaf"


with ZipFile(root / "owned.docx") as source:
    chart_bytes = source.read("word/charts/chart1.xml")
    workbook_bytes = source.read("word/embeddings/data.xlsx")

for step, order in {
    "split": ["0000ABCD", None, None, "0000EF01"],
    "joined": ["0000ABCD", None, "0000EF01"],
    "moved": ["0000EF01", "0000ABCD", None],
    "reopened": ["0000EF01", "0000ABCD", None],
    "undone": ["0000ABCD", None, "0000EF01"],
}.items():
    with ZipFile(root / f"owned-{step}.docx") as document:
        examine(document, chart_bytes, workbook_bytes, order)
    print(step, "paragraph owner, header owner and hyperlink, chart anchor and workbook")

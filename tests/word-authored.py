"""Compare retained OOXML owners/targets and measure the Word-authored chart at 360 dpi."""
import hashlib
from base64 import b64decode
from io import BytesIO
import json
import posixpath
import sys
from pathlib import Path
from zipfile import ZipFile

import pymupdf
from lxml import etree as ET
from PIL import Image

root = Path(sys.argv[1])
TOLERANCE = 0.25
DPI = 360
SCALE = DPI / 72
ns = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "w14": "http://schemas.microsoft.com/office/word/2010/wordml",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "c": "http://schemas.openxmlformats.org/drawingml/2006/chart",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "probe": "urn:ternleaf:probe",
}


def target(zip_file, part, node, kind):
    path, name = posixpath.split(part)
    rid = node.get(f"{{{ns['r']}}}id")
    relations = ET.fromstring(zip_file.read(posixpath.join(path, "_rels", name + ".rels")))
    entry, = (r for r in relations if r.get("Id") == rid and r.get("Type") == ns["r"] + "/" + kind)
    dest = entry.get("Target")
    if entry.get("TargetMode") == "External":
        return dest
    return dest.lstrip("/") if dest.startswith("/") else posixpath.normpath(posixpath.join(path, dest))


def package(stem):
    with ZipFile(root / (stem + ".docx")) as archive:
        part = "word/document.xml"
        body = ET.fromstring(archive.read(part))
        paragraphs = body.xpath("w:body/w:p", namespaces=ns)
        chart_anchor, = body.xpath(".//wp:inline[.//c:chart]", namespaces=ns)
        chart = target(archive, part, chart_anchor.xpath(".//c:chart", namespaces=ns)[0], "chart")
        chart_data = archive.read(chart)
        workbook = target(archive, chart, ET.fromstring(chart_data).find("c:externalData", ns), "package")
        header = target(archive, part, body.xpath(".//w:headerReference", namespaces=ns)[0], "header")
        header_xml = ET.fromstring(archive.read(header))
        link = target(archive, header, header_xml.xpath(".//w:hyperlink", namespaces=ns)[0], "hyperlink")
        extent = chart_anchor.find("wp:extent", ns)
        owners = paragraphs + header_xml.xpath("w:p", namespaces=ns)
        assert chart_anchor in paragraphs[1].xpath(".//wp:inline", namespaces=ns)
        def proofing(node):
            return [p.get(f"{{{ns['w']}}}val", "1") not in {"0", "false", "off"}
                    for p in node.xpath("w:rPr/w:noProof", namespaces=ns)]

        drawing_run = next(p for p in chart_anchor.iterancestors() if p.tag == f"{{{ns['w']}}}r")
        return {
            "owners": [p.get(f"{{{ns['w14']}}}paraId") for p in owners],
            "text_ids": [p.get(f"{{{ns['w14']}}}textId") for p in owners],
            "styles_with_effects": "word/stylesWithEffects.xml" in archive.namelist(),
            "chart_and_workbook": [hashlib.sha256(data).hexdigest() for data in [chart_data, archive.read(workbook)]],
            "anchor_extent": [extent.get(key) for key in ["cx", "cy"]],
            "link": link,
            "mixed_runs": paragraphs[1].xpath(".//w:t/text()", namespaces=ns),
            "mixed_run_properties": [ET.QName(child).localname for child in paragraphs[1].xpath("w:r/w:rPr/*", namespaces=ns)],
            "first_text": "".join(paragraphs[0].xpath(".//w:t/text()", namespaces=ns)),
            "first_marker": paragraphs[0].xpath(".//probe:kept/@value", namespaces=ns),
            "chart_no_proof": proofing(drawing_run),
            "text_no_proof": [proofing(r) for r in paragraphs[0].xpath("w:r[w:t]", namespaces=ns)],
        }


def visual(stem, capture=None):
    if capture is None:
        model = json.loads((root / (stem + "-layout.json")).read_text())
        browser = Image.frombytes("RGBA", (model["width"], model["height"]), (root / (stem + ".rgba")).read_bytes())
    else:
        model = capture
        assert model["dpi"] == DPI
        assert model["docxSha256"] == hashlib.sha256((root / (stem + ".docx")).read_bytes()).hexdigest()
        browser = Image.open(BytesIO(b64decode(model["png"], validate=True))).convert("RGBA")
        assert browser.size == (model["width"], model["height"])
    with pymupdf.open(root / (stem + "-word.pdf")) as reference:
        page = reference[0]
        raster = page.get_pixmap(matrix=pymupdf.Matrix(SCALE, SCALE), alpha=False)
        word = Image.frombytes("RGB", (raster.width, raster.height), raster.samples)
        assert browser.size == word.size
        word_text = [span for block in page.get_text("dict")["blocks"] for line in block.get("lines", [])
                     for span in line["spans"] if span["text"].strip()]
        remaining = [(x / 20, y / 20) for x, y in model["logical"][0]]
        assert len(remaining) == len(word_text), (remaining, word_text)
        origins = {}
        for span in word_text:
            x, y = span["origin"]
            nearest = min(remaining, key=lambda point: (x - point[0]) ** 2 + (y - point[1]) ** 2)
            remaining.remove(nearest)
            origins[span["text"].strip()] = [round(abs(x - nearest[0]), 3), round(abs(y - nearest[1]), 3)]

        # Word emits three bar fills and three legend keys as vector rectangles.
        colored_shapes = [(d["rect"], tuple(round(255 * c) for c in d["fill"]))
                          for d in page.get_drawings()
                          if d["fill"] and max(d["fill"]) - min(d["fill"]) > 0.15]
        assert len(colored_shapes) == 6, colored_shapes

    # Saturated chart fills. Report the bounding box of all three bars, in page points.
    def colored_box(image):
        area = image.convert("RGB").crop((250, 300, 2600, 2000))
        mask = Image.new("L", area.size)
        mask.putdata([255 if max(rgb) - min(rgb) >= 40 and min(rgb) < 175 else 0 for rgb in area.getdata()])
        x0, y0, x1, y1 = mask.getbbox()
        return [(x0 + 250) / SCALE, (y0 + 300) / SCALE, (x1 + 250) / SCALE, (y1 + 300) / SCALE]

    a, b = colored_box(browser), colored_box(word)
    delta = [round(abs(x - y), 3) for x, y in zip(a, b)]
    rectangles = []
    for rect, color in colored_shapes:
        region = (int(rect.x0 * SCALE) - 5, int(rect.y0 * SCALE) - 5,
                  int(rect.x1 * SCALE) + 6, int(rect.y1 * SCALE) + 6)
        boxes = []
        for page in [browser, word]:
            area = page.convert("RGB").crop(region)
            mask = Image.new("L", area.size)
            mask.putdata([255 if max(abs(a - b) for a, b in zip(pixel, color)) <= 3 else 0
                          for pixel in area.getdata()])
            box = mask.getbbox()
            assert box, (rect, color)
            boxes.append(box)
        rectangles.append([round(abs(a - b) / SCALE, 3) for a, b in zip(*boxes)])

    all_errors = [*delta, *(v for pair in origins.values() for v in pair),
                  *(v for edges in rectangles for v in edges)]
    return {"production_export": model.get("allowed", True), "glyph_origin_error_pt": origins,
            "browser_color_box_pt": a, "word_color_box_pt": b, "box_edge_delta_pt": delta,
            "bar_and_legend_edge_errors_pt": rectangles, "maximum_error_pt": max(all_errors),
            "passes_existing_0_25_pt_threshold": max(all_errors) <= TOLERANCE}


def verify_canvas():
    source, edited, undone, redone = [package(stem) for stem in
                                       ["word-authored", "word-canvas-edit", "word-canvas-undo", "word-canvas-redo"]]
    original = "Mixed  chart ending"
    assert ["".join(doc["mixed_runs"]) for doc in [source, edited, undone, redone]] == [
        original, original + "x", original, original + "x"]
    for doc in [edited, undone, redone]:
        for key in ["owners", "chart_and_workbook", "anchor_extent", "link", "chart_no_proof",
                    "text_no_proof", "mixed_run_properties", "first_text"]:
            assert doc[key] == source[key], (key, doc[key], source[key])
    assert source["chart_no_proof"] == [True]
    assert source["text_no_proof"] and all(value == [True] for value in source["text_no_proof"])
    assert source["text_ids"][1] and edited["text_ids"][1] and edited["text_ids"][1] != source["text_ids"][1]
    for index in [0, 2, 3]:
        assert edited["text_ids"][index] == source["text_ids"][index]
    assert undone["text_ids"] == source["text_ids"]
    assert redone["text_ids"] == edited["text_ids"]
    capture = json.loads((root / "word-canvas-redo-capture.json").read_text())
    assert capture["revision"] == 3
    comparison = visual("word-canvas-redo", capture)
    print(json.dumps({
        "source_text_ids": source["text_ids"], "edit_text_ids": edited["text_ids"],
        "undo_text_ids": undone["text_ids"], "redo_text_ids": redone["text_ids"],
        "native_chart_and_workbook_sha256": redone["chart_and_workbook"], "anchor_extent": redone["anchor_extent"],
        "source_sha256": hashlib.sha256((root / "word-authored.docx").read_bytes()).hexdigest(),
        "redo_docx_sha256": capture["docxSha256"], "comparison": comparison,
    }, indent=2))
    assert comparison["passes_existing_0_25_pt_threshold"]


if "--canvas" in sys.argv[2:]:
    verify_canvas()
    sys.exit(0)

result = {}
chart_source = package("word-authored")
chart_edited = package("word-chart-text-edit")
assert "".join(chart_edited["mixed_runs"]) == "Mixed  chart ending revised"
assert chart_source["text_ids"][0] == chart_edited["text_ids"][0]
assert chart_source["text_ids"][1] != chart_edited["text_ids"][1]
for key in ["owners", "chart_and_workbook", "chart_no_proof", "anchor_extent"]:
    assert chart_source[key] == chart_edited[key], key

for original, edited, expected in [("word-authored", "word-first", "Alpha REVIEWED omega"),
                                    ("word-resaved", "word-second", "Alpha ACCEPTED omega")]:
    before, after = package(original), package(edited)
    undone = package(edited + "-undo")
    assert after["first_text"] == expected
    assert undone["first_text"] == before["first_text"]
    for key in ["owners", "chart_and_workbook", "anchor_extent", "link", "first_marker", "chart_no_proof"]:
        assert before[key] == after[key] == undone[key], (key, before[key], after[key], undone[key])
    assert before["chart_no_proof"] == [True]
    assert all(doc["text_no_proof"] and all(value == [True] for value in doc["text_no_proof"])
               for doc in [before, after, undone])
    assert undone["text_ids"] == before["text_ids"]
    assert after["text_ids"][1:] == before["text_ids"][1:]
    # Word Save As can omit paragraph IDs and their version tokens. Use the
    # actual saved source as the second generation's ownership baseline.
    if before["text_ids"][0] is not None:
        assert after["text_ids"][0] and after["text_ids"][0] != before["text_ids"][0]
    else:
        assert edited == "word-second" and after["text_ids"][0] is None
    assert "".join(before["mixed_runs"]) == "".join(after["mixed_runs"])
    result[edited] = {"before": before, "after": after, "undo_text_ids": undone["text_ids"], "comparison": visual(edited)}

if (root / "owned-packaged-canvas.docx").exists():
    live = package("owned-packaged-canvas")
    source = package("owned")
    assert live["first_text"] == "Alpha Retain omegax"
    for key in ["owners", "chart_and_workbook", "anchor_extent", "link", "first_marker"]:
        assert live[key] == source[key], (key, live[key], source[key])
    result["packaged-canvas"] = {"first_text": live["first_text"], "owners": live["owners"],
                                 "chart_and_workbook": live["chart_and_workbook"], "link": live["link"]}
print(json.dumps(result, indent=2))
assert all(result[stem]["comparison"]["passes_existing_0_25_pt_threshold"] for stem in ["word-first", "word-second"])

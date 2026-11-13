import json
import sys
from pathlib import Path

import pymupdf
from PIL import Image, ImageChops

out = Path(sys.argv[1])
reference = pymupdf.open(out / "geometry-edited-word.pdf")
origins = json.loads((out / "geometry-browser.json").read_text())
assert len(origins) == len(reference) >= 2
TOLERANCE = 0.25


def ink(image, top, bottom):
    band = image.convert("L").crop((0, top, image.width, bottom)).point(lambda v: 255 if v < 128 else 0)
    box = band.getbbox()
    return None if box is None else (box[0], box[1] + top, box[2], box[3] + top)


records = []
for i, page in enumerate(reference):
    browser = Image.open(out / f"geometry-browser-{i + 1}.png").convert("RGB")
    sx, sy = browser.width / page.rect.width, browser.height / page.rect.height
    pix = page.get_pixmap(matrix=pymupdf.Matrix(sx, sy), alpha=False)
    word = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    assert browser.size == word.size
    word.save(out / f"geometry-word-{i + 1}.png")
    ref, font_sizes = {}, {}
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            for span in line["spans"]:
                if span["text"].strip():
                    assert span["font"] == "ArialMT", span["font"]
                    y = round(span["origin"][1], 2)
                    ref.setdefault(y, []).append(span["text"].strip())
                    font_sizes[y] = max(font_sizes.get(y, 0), span["size"])
    pdf_baselines = sorted(ref)
    engine_baselines = sorted({y / 20 for _, y in origins[i]})
    assert len(engine_baselines) == len(pdf_baselines), (i, engine_baselines, pdf_baselines)
    logical = [round(a - b, 3) for a, b in zip(engine_baselines, pdf_baselines)]
    visual_top = []
    for baseline in pdf_baselines:
        lower = baseline - font_sizes[baseline] * 0.97
        upper = baseline + font_sizes[baseline] * 0.30
        a = ink(browser, round(lower * sy), round(upper * sy))
        b = ink(word, round(lower * sy), round(upper * sy))
        assert a and b, (i, baseline, a, b)
        visual_top.append(round((a[1] - b[1]) / sy, 3))
    records.append({
        "page": i + 1, "dpi": round(sy * 72), "lines": len(logical),
        "first_line": " ".join(ref[pdf_baselines[0]]),
        "last_line": " ".join(ref[pdf_baselines[-1]]),
        "max_logical_baseline_error_pt": max(map(abs, logical)),
        "max_visual_ink_top_error_pt": max(map(abs, visual_top)),
        "logical_baseline_delta_pt": logical,
        "visual_ink_top_delta_pt": visual_top,
        "binary_different_pixels": ImageChops.difference(
            browser.convert("L").point(lambda v: 255 if v < 128 else 0),
            word.convert("L").point(lambda v: 255 if v < 128 else 0)).histogram()[255],
    })

(out / "geometry-comparison.json").write_text(json.dumps(records, indent=2))
print(json.dumps([{key: value for key, value in page.items() if not key.endswith("delta_pt")} for page in records], indent=2))
assert all(page["max_logical_baseline_error_pt"] <= TOLERANCE for page in records), "Logical Word geometry tolerance exceeded"
assert all(page["max_visual_ink_top_error_pt"] <= TOLERANCE for page in records), "Vertical ink tolerance exceeded"
original = pymupdf.open(out / "geometry-word.pdf")
assert original[1].get_text().splitlines()[0].strip() == "REFLOW 26"
assert records[1]["first_line"] == "REFLOW 25", "Expected the added line to move content to page two"

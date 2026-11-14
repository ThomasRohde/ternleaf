"""List the source structures of a .docx file, for the real-documents test.

    python3 -I tests/real/constructs.py <file.docx> [<file.docx> ...]

Prints one JSON object per file name. Each value is a count or a sorted list
that a text edit must not change: field codes, numbering, table grids and
merges, notes, header and footer parts, section properties, comments,
tracked changes, content controls, links, bookmarks, pictures and styles.
The reader is independent of the engine: it reads the ZIP and the XML.
"""
import hashlib
import json
import re
import sys
from zipfile import ZipFile

from lxml import etree

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PR = "http://schemas.openxmlformats.org/package/2006/relationships"
N = {"w": W, "r": R, "pr": PR}


def q(name):
    prefix, local = name.split(":")
    return "{%s}%s" % (N[prefix], local)


def fields(root):
    """The code of every complex field, in document order."""
    codes, depth = [], []
    for node in root.iter(q("w:fldChar"), q("w:instrText")):
        if node.tag == q("w:fldChar"):
            kind = node.get(q("w:fldCharType"))
            if kind == "begin":
                depth.append([])
            elif kind == "end" and depth:
                code = " ".join("".join(depth.pop()).split())
                codes.append(code)
        elif depth:
            # Only the code before "separate" counts; a nested field has its own.
            depth[-1].append(node.text or "")
    return codes


def inventory(path):
    with ZipFile(path) as package:
        names = sorted(package.namelist())
        read = lambda name: etree.fromstring(package.read(name)) if name in names else None
        doc = read("word/document.xml")
        styles = read("word/styles.xml")
        numbering = read("word/numbering.xml")
        rels = read("word/_rels/document.xml.rels")
        stories = [doc] + [read(name) for name in names
                           if re.match(r"word/(header|footer)\d*\.xml$|word/(footnotes|endnotes|comments)\.xml$", name)]
        media = {name: hashlib.sha256(package.read(name)).hexdigest()[:16] for name in names if name.startswith("word/media/")}
        name_of = {style.get(q("w:styleId")): style.xpath("string(w:name/@w:val)", namespaces=N)
                   for style in styles.iter(q("w:style"))} if styles is not None else {}
        count = lambda root, xpath: len(root.xpath(xpath, namespaces=N)) if root is not None else 0
        all_count = lambda xpath: sum(count(root, xpath) for root in stories if root is not None)
        rel_types = sorted(rel.get("Type").rsplit("/", 1)[-1] for rel in rels.iter(q("pr:Relationship"))) if rels is not None else []
        body_paragraphs = doc.xpath("//w:body//w:p", namespaces=N)
        text = ["".join(p.xpath(".//w:t/text()", namespaces=N)) for p in body_paragraphs]
        result = {
            "parts": [name for name in names if re.match(r"word/(header|footer)\d*\.xml$|word/(footnotes|endnotes|comments|numbering|settings|styles|commentsExtended|commentsIds)\.xml$", name)],
            "relationshipTypes": rel_types,
            # Every field code, whatever its form. A simple field that comes
            # back as a complex one keeps its code; "simpleFields" shows the form.
            "fields": sorted([code for root in stories if root is not None for code in fields(root)]
                             + [" ".join(node.get(q("w:instr")).split()) for root in stories if root is not None
                                for node in root.iter(q("w:fldSimple"))]),
            "simpleFields": sorted(" ".join(node.get(q("w:instr")).split()) for root in stories if root is not None
                                   for node in root.iter(q("w:fldSimple"))),
            "numberedParagraphs": count(doc, "//w:body//w:p[w:pPr/w:numPr]"),
            "numberingLevels": sorted(f"{p.xpath('string(w:pPr/w:numPr/w:numId/@w:val)', namespaces=N)}:{p.xpath('string(w:pPr/w:numPr/w:ilvl/@w:val)', namespaces=N)}"
                                      for p in doc.xpath("//w:body//w:p[w:pPr/w:numPr]", namespaces=N)),
            "abstractNums": count(numbering, "/w:numbering/w:abstractNum"),
            "nums": count(numbering, "/w:numbering/w:num"),
            # Styles by name, so that the check holds when the IDs change;
            # "styleIds" shows the IDs themselves.
            "linkedLevelStyles": sorted(name_of.get(value, "?" + value) for value in numbering.xpath("//w:lvl/w:pStyle/@w:val", namespaces=N)) if numbering is not None else [],
            "stylesWithNumbering": sorted(styles.xpath("//w:style[w:pPr/w:numPr]/w:name/@w:val", namespaces=N)) if styles is not None else [],
            "customStyles": sorted(styles.xpath("//w:style[@w:customStyle='1']/w:name/@w:val", namespaces=N)) if styles is not None else [],
            "styleIds": sorted(styles.xpath("//w:style/@w:styleId", namespaces=N)) if styles is not None else [],
            "paragraphStyles": sorted(set(name_of.get(value, "?" + value) for value in doc.xpath("//w:pStyle/@w:val", namespaces=N))),
            "tables": count(doc, "//w:tbl"),
            "gridColumns": [len(t.xpath("w:tblGrid/w:gridCol", namespaces=N)) for t in doc.xpath("//w:tbl", namespaces=N)],
            "gridSpans": count(doc, "//w:tcPr/w:gridSpan"),
            "verticalMerges": count(doc, "//w:tcPr/w:vMerge"),
            "headerRows": count(doc, "//w:trPr/w:tblHeader"),
            "cellShading": count(doc, "//w:tcPr/w:shd"),
            "footnoteReferences": count(doc, "//w:footnoteReference"),
            "footnotes": count(read("word/footnotes.xml"), "/w:footnotes/w:footnote[not(@w:type)]"),
            "noteSeparators": count(read("word/footnotes.xml"), "/w:footnotes/w:footnote[@w:type]"),
            "headerReferences": sorted(f"{x.get(q('w:type'))}" for x in doc.iter(q("w:headerReference"))),
            "footerReferences": sorted(f"{x.get(q('w:type'))}" for x in doc.iter(q("w:footerReference"))),
            "titlePage": count(doc, "//w:sectPr/w:titlePg"),
            "sections": count(doc, "//w:sectPr"),
            "pageSizes": [f"{s.get(q('w:w'))}x{s.get(q('w:h'))}{':' + s.get(q('w:orient')) if s.get(q('w:orient')) else ''}"
                          for s in doc.xpath("//w:sectPr/w:pgSz", namespaces=N)],
            "comments": count(read("word/comments.xml"), "/w:comments/w:comment"),
            "commentRanges": count(doc, "//w:commentRangeStart"),
            "commentReferences": count(doc, "//w:commentReference"),
            "insertions": count(doc, "//w:ins[not(parent::w:rPr)]"),
            "deletions": count(doc, "//w:del[not(parent::w:rPr)]"),
            "formatChanges": count(doc, "//w:rPrChange"),
            "insertedParagraphMarks": count(doc, "//w:pPr/w:rPr/w:ins"),
            "revisionAuthors": sorted(set(doc.xpath("//w:ins/@w:author|//w:del/@w:author|//w:rPrChange/@w:author", namespaces=N))),
            "contentControls": sorted(
                (s.xpath("string(w:sdtPr/w:alias/@w:val)", namespaces=N) or "-") + ":"
                + ",".join(sorted(etree.QName(c).localname for c in s.find(q("w:sdtPr")) if etree.QName(c).localname in ("text", "dropDownList", "date", "docPartObj", "richText", "comboBox")))
                + (":block" if s.getparent().tag == q("w:body") else ":inline")
                for s in doc.iter(q("w:sdt"))),
            "hyperlinks": sorted(("anchor:" + h.get(q("w:anchor"))) if h.get(q("w:anchor")) else "external" for h in doc.iter(q("w:hyperlink"))),
            "bookmarks": sorted(b.get(q("w:name")) for b in doc.iter(q("w:bookmarkStart"))),
            "drawings": all_count("//w:drawing"),
            "media": media,
            "tabs": count(doc, "//w:r/w:tab"),
            "nonAsciiCharacters": sum(1 for line in text for ch in line if ord(ch) > 127),
        }
        result["bodyText"] = [line for line in text if line.strip()]
        result["package"] = {"bytes": sum(info.compress_size for info in package.infolist()),
                             "stored": sorted(info.filename for info in package.infolist() if info.compress_type == 0)}
        return result


if __name__ == "__main__":
    print(json.dumps({path: inventory(path) for path in sys.argv[1:]}, ensure_ascii=False, indent=1))

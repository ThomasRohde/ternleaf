// What an exported Word file may leave out.
//
// Parts that Word derives from the document and writes again on its next
// save. An edit makes the source's copy stale, so the exporter leaves it out.
const refreshedBookkeeping = new Set([
  "docx.export.stale.statistics",
  "docx.export.stale.thumbnail",
  "docx.rsid",
]);

// Source content that an edited export leaves out, where the loss is known
// and small. Ternleaf does not decide this for the author: it explains the
// loss and exports only after the author agrees.
export const authorDecides = new Map([
  ["docx.export.stale.styles_with_effects",
    "This document has a second copy of its styles from Word 2010 (stylesWithEffects.xml). An edited export leaves that copy out. Word 2013 and later versions do not use it. Word 2010 then shows text effects in styles, such as glow and shadow, without the effect."],
]);

export function validateDocxExport(reportJson, accepted = new Set()) {
  const entries = JSON.parse(reportJson).entries;
  const refused = entries.filter(entry => entry.retentionOutcome === "not_retained"
    && !refreshedBookkeeping.has(entry.feature)
    && !(authorDecides.has(entry.feature) && accepted.has(entry.feature)));
  if (refused.length) {
    const features = [...new Set(refused.map(entry => entry.feature))];
    throw Object.assign(new Error("DOCX export would lose unsupported source data (" + features[0] + ")"),
      { features, decidable: features.every(feature => authorDecides.has(feature)) });
  }
  return entries;
}

// The features that the engine reports as not kept, in words for the
// author. The real-documents test (tests/real-documents.mjs) found two
// groups: a comment that Word wrote has a comment mark (annotationRef) in a
// paragraph with the comment style, and a table of contents is a field
// whose markers (fldChar, instrText) are in more than one paragraph.
export function lossInWords(features) {
  const left = new Set(features);
  const words = [];
  if (left.has("annotationRef")) {
    words.push("parts of the Word comments (the comment marks and the comment styles)");
    for (const feature of ["annotationRef", "pStyle", "rStyle"]) left.delete(feature);
  }
  if (left.has("fldChar") || left.has("instrText")) {
    words.push("a table of contents or another field that spans paragraphs");
    for (const feature of ["fldChar", "instrText"]) left.delete(feature);
  }
  if (left.size) words.push(`other content that the engine does not keep (${[...left].join(", ")})`);
  return words.length > 1 ? words.slice(0, -1).join(", ") + " and " + words.at(-1) : words[0] ?? "content that the engine does not keep";
}

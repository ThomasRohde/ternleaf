// The rules for a change near a field result or a content control.
import assert from "node:assert/strict";
import test from "node:test";
import { contentsStyle, controlChange, fieldRanges, sentences, touches } from "../apps/editor/structure.mjs";
import { reviewChange } from "../packages/session/review-change.mjs";

test("fieldRanges finds the results of the inline fields of a paragraph", () => {
  // The engine's read gives the runs without the field results, and the results.
  const text = "Tabel 1 lists them. The rules apply from the date in section 1.";
  assert.deepEqual(fieldRanges(text, ["Tabel ", " lists them. The rules apply from the date in section ", "."], ["1", "1"]), [[6, 7], [61, 62]]);
  // Offsets are UTF-8 bytes.
  assert.deepEqual(fieldRanges("Side 3 af 9 · ø.docx", ["Side ", " af ", " · "], ["3", "9", "ø.docx"]), [[5, 6], [10, 11], [15, 22]]);
  // A tab is in the text without a run.
  assert.deepEqual(fieldRanges("2.1. Design authority\t2", ["2.1. Design authority"], ["2"]), [[22, 23]]);
  // When two places are possible, both are protected.
  assert.deepEqual(fieldRanges("11", ["1"], ["1"]).sort(), [[0, 1], [1, 2]]);
  assert.deepEqual(fieldRanges("No field here.", ["No field here."], []), []);
  // Lists that do not make the text: unknown.
  assert.equal(fieldRanges("See table 2.", ["See table "], ["1"]), null);
});

test("a change touches a field result when it overlaps it, not at its edge", () => {
  assert(touches({ start: 5, end: 7 }, [6, 7]));
  assert(!touches({ start: 0, end: 6 }, [6, 7]));
  assert(!touches({ start: 7, end: 9 }, [6, 7]));
  assert(!touches({ start: 7, end: 7 }, [6, 7]));
  assert(touches({ start: 7, end: 7 }, [6, 9]));
});

test("a change of all the text of a content control fills the control", () => {
  const owner = { id: "c1", scope: "inline", kind: "plainText", lock: "unlocked", text: "Søren Kjær", start: 16, end: 28 };
  const change = (before, replacement, start) => reviewChange({ before, replacement, start });
  assert.deepEqual(controlChange([owner], change("Søren Kjær", "Mette Ørsted", 16)), { fill: { id: "c1", text: "Mette Ørsted" } });
  // Part of the text keeps the control as it is.
  assert.equal(controlChange([owner], change("Søren Kjær", "Søren Hansen", 16)), null);
  // Text beside the control.
  assert.equal(controlChange([owner], change("Document owner", "Dokumentejer", 0)), null);
  assert.equal(controlChange([owner], { start: 28, end: 28, inserted: "!" }), null);
  // Across the edge, empty, in Suggesting mode, a line break.
  assert.throws(() => controlChange([owner], change("owner: Søren", "ejer: Mette", 9)), { message: sentences.controlEdge });
  assert.throws(() => controlChange([owner], change("Søren Kjær", "", 16)), { message: sentences.controlEmpty });
  assert.throws(() => controlChange([owner], change("Søren Kjær", "Mette Ørsted", 16), true), { message: sentences.controlTracked });
  assert.throws(() => controlChange([owner], change("Søren Kjær", "Mette\nØrsted", 16)), { message: sentences.lineBreak });
  assert.throws(() => controlChange([{ ...owner, lock: "contentLocked" }], change("Søren Kjær", "Søren Hansen", 16)), { message: sentences.controlLocked });
  assert.deepEqual(controlChange([{ ...owner, lock: "sdtLocked" }], change("Søren Kjær", "Mette Ørsted", 16)), { fill: { id: "c1", text: "Mette Ørsted" } });

  // A drop-down list takes only one of its choices, also for a part of the text.
  const status = { id: "c2", scope: "inline", kind: "dropDownList", lock: "unlocked", text: "Draft", start: 8, end: 13,
    items: [{ display: "Draft", value: "Draft" }, { display: "Approved", value: "Approved" }] };
  assert.deepEqual(controlChange([status], change("Draft", "Approved", 8)), { fill: { id: "c2", text: "Approved" } });
  assert.throws(() => controlChange([status], change("Draft", "Godkendt", 8)), { message: sentences.controlChoice(["Draft", "Approved"]) });
  assert.throws(() => controlChange([status], change("Draft", "Drift", 8)), /Draft, Approved/);
  // A date and a rich text control are not filled with text.
  assert.throws(() => controlChange([{ ...owner, kind: "date" }], change("Søren Kjær", "Mette", 16)), { message: sentences.controlDate });
  assert.throws(() => controlChange([{ ...owner, kind: "richText" }], change("Søren Kjær", "Mette", 16)), { message: sentences.controlKind });
  // A block control holds whole paragraphs. Its text is ordinary text.
  assert.equal(controlChange([{ ...owner, scope: "block", start: 0, end: 0 }], change("Søren Kjær", "Mette", 16)), null);
});

test("the entries of a table of contents are known by their style", () => {
  assert(contentsStyle("toc 1") && contentsStyle("TOC 3") && contentsStyle("Contents 2"));
  assert(!contentsStyle("TOC Heading") && !contentsStyle("Heading 1") && !contentsStyle(""));
});

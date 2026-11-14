// Rules for a change near structure that the text does not show.
//
// The engine gives the text of a paragraph as plain runs: the result of a
// field, such as a cross-reference, and the text of a content control look
// like any other text. A replacement over them removes the field or the
// control, and the export does not report the loss. The editor gets the
// fields and the controls of a paragraph from the engine, and these pure
// functions decide what a change may do with them.

const utf8 = new TextEncoder();
const bytes = text => utf8.encode(text).length;

// What the author reads when a change is refused. Each sentence says what
// to do next.
export const sentences = {
  contents: "This text is in the table of contents. Change the heading. Word updates the table of contents when you update the field.",
  link: "This change touches a link. Ternleaf cannot change the text of a link. Change the text beside it, or edit the link in the document.",
  tab: "This change crosses a tab. A change cannot cross it. Change the text before or after the tab.",
  lineBreak: "This change crosses a line break. A change cannot cross it. Change the text before or after the line break.",
  object: "This change touches an object, such as a picture or a note reference. Change the text beside it.",
  field: "This text is the result of a field, such as a cross-reference. Change the text beside it.",
  fieldLost: "This change would remove a field, such as a cross-reference or a page number. Change the text beside the field.",
  controlLost: "This change would remove a content control. Change part of the text in the control, or fill the control in the document.",
  controlEdge: "This change crosses the edge of a content control. Change the text in the control or the text beside it, not both.",
  controlEmpty: "This change removes all the text of a content control. A control cannot be empty here. Give a new text, or fill the control in the document.",
  controlTracked: "In Suggesting mode, Ternleaf cannot replace all the text of a content control. Switch to Editing, or change part of the text.",
  controlDate: "This text is the date of a date control. Choose the date in the control in the document.",
  controlKind: "This text is in a content control that Ternleaf cannot fill. Change part of the text, or fill the control in the document.",
  controlLocked: "This content control is locked. Unlock it in the control's properties, or change the text beside it.",
  controlChoice: list => `This text is a choice in a drop-down list. Give one of the choices: ${list.join(", ")}. Or choose it in the control in the document.`,
};

// The byte ranges of the field results in a paragraph. `text` is the
// paragraph text. `runs` are the texts of the runs that are not field
// results, and `results` the results of the inline fields, both in document
// order, as the engine's assistant read gives them. The read does not say
// where a field is, so this finds every way to interleave the two lists
// into the text and returns the union of the result ranges. A tab, a line
// break or an object can be in the text without a run. Null when the lists
// do not make the text, or when there are too many ways: then the caller
// must check the change in another way.
export function fieldRanges(text, runs, results) {
  const pieces = runs.filter(run => run);
  const wanted = results.filter(result => result);
  if (!wanted.length) return [];
  const found = new Map();
  const dead = new Set();
  let ways = 0;
  const walk = (at, run, field, marks) => {
    if (ways > 32) return false;
    const key = `${at} ${run} ${field}`;
    if (dead.has(key)) return false;
    if (at === text.length && run === pieces.length && field === wanted.length) {
      ways++;
      for (const mark of marks) found.set(mark.join(" "), mark);
      return true;
    }
    let any = false;
    if (run < pieces.length && text.startsWith(pieces[run], at)) any = walk(at + pieces[run].length, run + 1, field, marks) || any;
    if (field < wanted.length && text.startsWith(wanted[field], at)) {
      any = walk(at + wanted[field].length, run, field + 1, [...marks, [at, at + wanted[field].length]]) || any;
    }
    if (at < text.length && /[\t\n\r￼]/.test(text[at])) any = walk(at + 1, run, field, marks) || any;
    if (!any) dead.add(key);
    return any;
  };
  walk(0, 0, 0, []);
  if (!ways || ways > 32) return null;
  return [...found.values()].map(([from, to]) => [bytes(text.slice(0, from)), bytes(text.slice(0, to))]);
}

// Does a change touch a range? A replacement touches what it overlaps. An
// insertion touches a range only strictly inside it: text at the edge of a
// field result is kept beside the field.
export const touches = (change, [from, to]) => change.end > change.start
  ? change.start < to && change.end > from
  : change.start > from && change.start < to;

// What a change does with the inline content controls of its paragraph.
// `controls` are the engine's records (contentControls): kind, start, end,
// text, items and lock. Returns null when the change can be applied as it
// is, or `{ fill: { id, text } }` when the editor must fill the control so
// that it stays. Throws an Error with a sentence for the author when the
// change would lose the control.
export function controlChange(controls, change, tracked = false) {
  const touched = controls.filter(control => control.scope === "inline" && touches(change, [control.start, control.end]));
  if (!touched.length) return null;
  const [control] = touched;
  if (touched.length > 1 || change.start < control.start || change.end > control.end) throw new Error(sentences.controlEdge);
  // A lock on the content ("contentLocked", "sdtContentLocked") stops any
  // change of the text. A lock on the control alone allows it.
  if (/content/i.test(control.lock ?? "")) throw new Error(sentences.controlLocked);
  const whole = change.start === control.start && change.end === control.end;
  const list = control.kind === "dropDownList";
  // Part of the text keeps the control, except in a list, where the text
  // must be one of the choices.
  if (!whole && !list) return null;
  if (control.kind === "date") throw new Error(sentences.controlDate);
  if (!["plainText", "comboBox", "dropDownList"].includes(control.kind)) throw new Error(sentences.controlKind);
  if (tracked) throw new Error(sentences.controlTracked);
  if (change.inserted.includes("\n")) throw new Error(sentences.lineBreak);
  const old = utf8.encode(control.text);
  const decode = part => new TextDecoder().decode(part);
  const text = decode(old.slice(0, change.start - control.start)) + change.inserted + decode(old.slice(change.end - control.start));
  if (!text) throw new Error(sentences.controlEmpty);
  if (list) {
    const choices = (control.items ?? []).map(item => item.display ?? item.value).filter(Boolean);
    if (!choices.includes(text)) throw new Error(sentences.controlChoice(choices));
  }
  return { fill: { id: control.id, text } };
}

// A paragraph style that Word gives to the entries of a table of contents.
export const contentsStyle = name => /^(toc|contents) [1-9]$/i.test(String(name ?? "").trim());

import { open as openDoc } from "/pkg/casual_doc_wasm.js";
import { authorDecides, lossInWords, validateDocxExport } from "./export-policy.mjs";
import { frameDoesChange, reviewChange } from "./review-change.mjs";
import { contentsStyle, controlChange, fieldRanges, sentences, touches } from "./structure.mjs";
import { compressZip, entryContent, fieldCounts, isStored, readZip } from "./zip.mjs";
import { runChecks } from "./checks.mjs";
import { combinePassages, firstWords, passageChanges, updateInstruction } from "./edition.mjs";
import { forAuthor } from "./messages.mjs";
import { captureWordEvidence } from "./word-evidence.mjs";
import { wordCount, wordDiff } from "./diff.mjs";
import { documentActions, layout, quickActions } from "./shell.mjs";
import { confirmDialog, copyDialog, createDocuments } from "./documents.mjs";
import { ago } from "./time.mjs";

const format = "org.openxmlformats.wordprocessingml.document";
const headers = token => ({ Authorization: "Bearer " + token, "Content-Type": "application/json" });
const utf8 = new TextEncoder();
const bytes = text => utf8.encode(text).length;
const previewDpi = 160;
const twip = previewDpi / 1440;

export function attachTernleaf(editor) {
  const token = location.hash.slice(1);
  if (!/^[a-f0-9]{64}$/.test(token)) return;

  // ---- Shell ------------------------------------------------------------
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/ternleaf/editor.css";
  document.head.append(stylesheet);
  for (const link of document.querySelectorAll('link[rel~="icon"]')) link.href = "/ternleaf/mark.svg";
  const { panel, launcher, bubble, toaster, start: startCard } = layout();
  const workarea = document.querySelector(".workarea") ?? document.body;
  workarea.append(panel, launcher, startCard);
  document.body.append(bubble, toaster);

  const part = name => panel.querySelector(`[data-part="${name}"]`);
  const button = action => panel.querySelector(`[data-action="${action}"]`);
  const status = panel.querySelector("[role=status]");
  const note = panel.querySelector('[data-field="note"]');
  const prompt = panel.querySelector('[data-field="prompt"]');
  const review = part("proposal");
  const diagnostics = panel.querySelector("output");
  const startStatus = startCard.querySelector('[data-part="start-status"]');
  const message = (text, tone = "") => {
    status.textContent = text;
    status.dataset.tone = tone;
    if (startCard.hidden) return;
    startStatus.textContent = text;
    startStatus.dataset.tone = tone;
  };

  // ---- Session state ----------------------------------------------------
  let lease, source, fonts, fontHash, proposal, pending, heartbeat, poll, draft, accepted;
  let captureWordComparison, wordEvidence;
  let journal = [];
  let reviewed = [];
  let name = "Document.docx";
  let captured = null;      // The passage a request will share.
  let hint = "";            // Why the current selection cannot be shared.
  let waitingSince = 0;
  let unanswered = false;
  let unreachable = null;
  let problem = "";         // Why a saved proposal cannot be shown.
  let preview = null;
  let busy = false;
  let batch = null;         // The whole-document request, if any.
  let suggestions = [];
  let batchStopped = "";    // Why a whole-document request got no answer.
  let scope = "selection";
  let editing = false;
  const admissionMs = [];
  const leaseKey = "ternleaf-lease";
  let blocked = false;
  let epoch;                // The host's count of documents, from the claim.
  let leaving = false;      // A save to the file is done. The page reloads when the author closes its window.
  let saveFile = { textCopy: true, changeLog: true };
  // The identifier of this history. A Word export carries it in its name.
  let history = null;

  // A short notice at the bottom of the canvas. It goes away by itself.
  let toastTimer;
  function toast(text, tone = "") {
    toaster.textContent = text;
    toaster.dataset.tone = tone;
    toaster.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toaster.hidden = true; }, tone === "problem" ? 9000 : 4500);
  }
  const reload = () => location.reload();

  const updateDiagnostics = () => {
    const last = admissionMs.at(-1);
    diagnostics.textContent = `Saved revision ${journal.length}` + (last === undefined ? "" :
      ` · last admission ${last.toFixed(1)} ms · ${admissionMs.length} samples this opening`);
  };
  // Two kinds of saved: every revision is saved in Ternleaf at once, and the
  // Word file on disk has the text of the last save to the file, which is
  // where this history starts.
  const ready = () => message(journal.length ? `Saved at revision ${journal.length} · not in the Word file`
    : "Saved at revision 0 · same as the Word file", "ok");
  const report = error => {
    button("reload").hidden = !blocked;
    panel.dataset.blocked = String(blocked);
    if (blocked) { setOpen(true); paintPill(); }
    message(error.message ?? String(error), "problem");
  };
  const sent = () => ({ ...headers(token), ...(epoch === undefined ? {} : { "X-Ternleaf-Epoch": String(epoch) }) });
  // The host answers "document-changed" when the canvas was told to show
  // another document. The page then loads that document.
  const moved = code => { if (code === "document-changed") { if (!leaving) reload(); return true; } return false; };

  function postSync(path, data) {
    const req = new XMLHttpRequest();
    req.open("POST", "/api/" + path, false);
    for (const [key, value] of Object.entries(sent())) req.setRequestHeader(key, value);
    try { req.send(JSON.stringify(data)); }
    catch { blocked = true; throw new Error("Connection lost. Reload to recover the last saved revision."); }
    if (req.status !== 200) {
      if (req.status >= 500 || req.status === 0) blocked = true;
      const code = JSON.parse(req.responseText || "{}").error;
      moved(code);
      throw new Error(code ? forAuthor(code) : "Publication uncertain. Reload to recover.");
    }
    try { return JSON.parse(req.responseText); }
    catch { blocked = true; throw new Error("Publication response could not be read. Reload to recover."); }
  }

  async function call(path, data) {
    const response = await fetch("/api/" + path, { method: "POST", headers: sent(), body: JSON.stringify(data) });
    const value = await response.json();
    if (!response.ok) {
      moved(value.error);
      throw Object.assign(new Error(value.message ?? forAuthor(value.error)), { code: value.error });
    }
    return value;
  }
  // Send a file's bytes. The name travels in a header, not in the address.
  async function upload(path, bytes, fileName) {
    const response = await fetch("/api/" + path, { method: "POST", body: bytes,
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/octet-stream",
        "X-Ternleaf-Name": encodeURIComponent(fileName) } });
    const value = await response.json();
    if (!response.ok) throw Object.assign(new Error(value.message ?? forAuthor(value.error)), { code: value.error });
    return value;
  }
  const documents = createDocuments({ api: call, upload, toast, reload });

  function renderState(record) {
    if (record.editorial.before?.note !== record.editorial.after?.note) {
      note.value = record.editorial.after?.note ?? "";
    }
    if (record.id === draft?.id) {
      accepted = record.id;
      // A quick request is done when its proposal is accepted. Its text
      // must not stay in the instruction box as if it were the author's.
      if (presets.has(prompt.value)) prompt.value = "";
      draft = undefined;
      proposal = undefined;
      dropPreview();
      void call("history", { lease }).then(state => { reviewed = state.accepted; houseRules = state.rules; renderHistory(); render(); }).catch(() => {});
      if (record.id === advanceAfter) queueMicrotask(() => void nextSuggestion());
    }
    updateDiagnostics();
    ready();
    render();
    if (panel.dataset.view === "history") renderHistory();
    else part("history-count").textContent = String(journal.length);
  }

  window.ternleafAdmit = raw => {
    if (blocked || !lease) return false;
    try {
      const frame = JSON.parse(raw);
      const target = frame.kind === "redo" ? journal[frame.target - 1]?.command.target : frame.target;
      const command = { kind: frame.kind, target };
      const request = pending ?? { id: crypto.randomUUID(), fingerprint: crypto.randomUUID() };
      const started = performance.now();
      let publication;
      try { publication = postSync("commit", { lease, request: { ...request, expected: frame.base, command, frame } }); }
      finally {
        if (admissionMs.length === 256) admissionMs.shift();
        admissionMs.push(performance.now() - started);
      }
      const { record, duplicate } = publication;
      if (duplicate || record?.revision !== frame.revision) {
        blocked = true;
        throw new Error("The saved revision differs from the editor. Reload to recover.");
      }
      journal.push(record);
      queueMicrotask(() => renderState(record));
      return true;
    } catch (error) { updateDiagnostics(); report(error); return false; }
  };
  // A Word file must keep what the source had, so its export is checked. The
  // other formats are conversions, and nobody expects them to carry it all.
  const acceptedLosses = new Set();  // Known losses that the author accepted for this document.
  window.ternleafValidateExport = (targetFormat, exportReport) => {
    if (!/wordprocessingml/.test(targetFormat)) return [];
    try { return validateDocxExport(exportReport, acceptedLosses); }
    catch (error) {
      if (error.decidable) throw new Error("this export leaves out a legacy part. Use Export DOCX in the Ternleaf pane, which asks you about it");
      throw error;
    }
  };

  // ---- The editor's own commands ------------------------------------------
  // The engine asks here before it replaces the document on screen.
  globalThis.ternleafOpen = (content, fileName) => documents.receive(content, fileName);
  const leaveFilePage = () => {
    const back = document.querySelector("#filePageBack");
    if (back && back.offsetParent) back.click();
  };
  const everySaved = () => toast(blocked ? "This canvas cannot save. Reload it to get the last saved revision."
    : `Saved at revision ${journal.length}. Ternleaf saves every change. The Word file changes only when you choose Save to the Word file.`, blocked ? "problem" : "ok");
  const replaced = {
    "file.open": () => void documents.open(),
    "file.new": () => void documents.create(),
    "file.save": everySaved,
    "file.export.docx": () => { leaveFilePage(); void act("export"); },
    "file.versionHistory": () => { leaveFilePage(); setOpen(true); showView("history"); panel.focus({ preventScroll: true }); },
  };
  globalThis.ternleafCommands = commands => commands.map(command => replaced[command.id]
    ? { ...command, enabled: true, disabledReason: undefined, run: replaced[command.id],
      ...(command.id === "file.new" ? { label: "New document…" } : {}) }
    : command);

  // The editor's state pill says "Edited" until a download. In a Ternleaf
  // project every revision is saved at once, so the pill says that.
  const pill = document.querySelector("#documentState");
  function paintPill() {
    const label = pill?.querySelector("#documentStateText");
    const symbol = pill?.querySelector(".ms");
    if (!label || !symbol || !lease) return;
    const [text, glyph] = blocked ? ["Not saved", "error"] : ["Saved", "check_circle"];
    if (label.textContent !== text) label.textContent = text;
    if (symbol.textContent !== glyph) symbol.textContent = glyph;
    if (pill.dataset.state !== "opened") pill.dataset.state = "opened";
    pill.title = blocked ? "Reload the canvas to get the last saved revision."
      : "Ternleaf saves every change as a revision. The Word file changes only when you choose Save to the Word file.";
  }
  if (pill) new MutationObserver(paintPill).observe(pill, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["data-state"] });

  async function start() {
    await new Promise(resolve => {
      const check = () => document.querySelector("#file")?.disabled ? setTimeout(check, 50) : resolve();
      check();
    });
    // The spelling checker does not know the product's name.
    try {
      const words = await (await import("/src/drafts.mjs")).openWordStore({});
      await words?.add("Ternleaf");
    } catch { /* A personal dictionary is a convenience. */ }
    // Another canvas can hold the document for a few seconds after it closes.
    // Wait for it instead of failing.
    let state;
    for (;;) {
      try { state = await call("claim", { previous: JSON.parse(sessionStorage.getItem(leaseKey) ?? "null") }); break; }
      catch (error) {
        if (error.code !== "writer-active") throw error;
        startCard.querySelector('[data-part="start-other"]').hidden = false;
        message("This document is open in another Ternleaf canvas. This canvas opens it when the other one closes.", "problem");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    message("Opening the document…");
    lease = state.lease;
    epoch = state.epoch;
    panel.dataset.workspace = String(state.workspace !== false);
    sessionStorage.setItem(leaseKey, JSON.stringify(lease));
    fontHash = state.fontHash;
    captureWordComparison = state.captureWordComparison;
    journal = state.journal;
    reviewed = state.accepted ?? [];
    houseRules = state.rules ?? null;
    rulesExample = state.rulesExample ?? rulesExample;
    saveFile = state.saveFile ?? saveFile;
    history = state.history ?? null;
    name = state.name ?? name;
    part("name").textContent = startCard.querySelector('[data-part="start-name"]').textContent = name;
    part("name").title = name;
    const [input, ...faces] = await Promise.all([
      fetch("/api/source", { headers: headers(token) }),
      ...Array.from({ length: state.fontCount }, (_, index) =>
        fetch("/api/font/" + index, { headers: headers(token) })),
    ]);
    if (!input.ok) throw new Error("Project source is unavailable");
    source = new Uint8Array(await input.arrayBuffer());
    if (faces.some(face => !face.ok)) throw new Error("A configured local font is unavailable");
    fonts = await Promise.all(faces.map(async face => new Uint8Array(await face.arrayBuffer())));
    await editor.open(source, name);
    const doc = editor.doc;
    if (!doc) throw new Error("Ternleaf could not read this document. The file may be damaged, or it is not a Word document.");
    for (const font of fonts) doc.registerFont(font);
    for (const record of journal) doc.replayDurableFrame(JSON.stringify(record.frame));
    await editor.renderAll();
    // The editor's own status line can keep "Opening <name>…" after the
    // document is on screen. The document is open now, so remove it.
    const line = editor.statusEl;
    if (line && line.textContent.includes(name) && line.textContent.trim().endsWith("…")) {
      try { editor.setStatus(""); } catch { line.textContent = ""; }
    }
    doc.enableDurableAdmission();
    globalThis.ternleafProjectAttached = true;
    paintPill();
    void call("opened", { lease }).catch(() => {});
    void loadEdition().catch(() => {});
    note.value = state.editorial?.note ?? "";
    updateDiagnostics();
    ready();
    panel.dataset.ready = "true";
    startCard.hidden = true;
    startStatus.textContent = "";
    await syncReviews(state.reviews, true);
    syncBatch(state.suggestions ?? { batch: null, suggestions: [] }, true);
    if (draft || batch) setOpen(true);
    render();
    renderHistory();
    heartbeat = setInterval(() => leaving || call("renew", { lease }).catch(error => { blocked = true; report(error); }), 5000);
    poll = setInterval(() => {
      if (leaving) return;
      if (!blocked && draft && draft.replacement === null && !draft.declined) {
        void call("reviews", { lease }).then(syncReviews).catch(report);
      }
      if (!blocked && !draft && batch?.state === "waiting") {
        void call("suggestions", { lease }).then(syncBatch).catch(report);
      }
    }, 800);
    setInterval(watchSelection, 200);
    setInterval(() => void pulse(), 1000);
  }

  // ---- Copilot's side: requests that begin in the chat -------------------
  // The host cannot read a document. Only the engine in this page knows the
  // text and the pages. With each pulse the page reports a few facts, and it
  // does the jobs that Copilot's actions queue: read, page and export.
  const jobsDone = new Set();
  const told = new Map();   // Notices already shown, with the time.
  let pulsing = false;
  let chatStamp;
  let shownChecks = -1;
  let rulesStamp;
  let counted = { revision: -1, words: null };
  // The author sees what Copilot takes from the canvas. One notice of a kind
  // every 20 seconds is enough.
  function tell(text) {
    if (Date.now() - (told.get(text) ?? 0) < 20_000) return;
    told.set(text, Date.now());
    toast(text);
  }
  const refusal = (code, detail) => Object.assign(new Error(code), { code, detail });
  function wordTotal() {
    if (counted.revision !== journal.length) {
      let words = null;
      try { const stats = editor.doc.documentStats(); words = stats.words; stats.free(); } catch { /* A count is optional. */ }
      counted = { revision: journal.length, words };
    }
    return counted.words;
  }
  const listLength = read => { try { return (JSON.parse(read()) ?? []).length; } catch { return 0; } };

  function readForCopilot() {
    const doc = editor.doc;
    const paragraphs = JSON.parse(doc.searchableText()).filter(([, text]) => text.trim());
    let outline = [];
    try {
      outline = Array.from(doc.documentOutline()).map(row => String(row).split("\t"))
        .filter(parts => parts.length >= 4).map(([level, node]) => ({ level: Number(level), node }));
    } catch { /* A document without headings has no outline. */ }
    tell("Copilot read the document text.");
    return { revision: journal.length, paragraphs, outline, pages: doc.pageCount, words: wordTotal(),
      comments: listLength(() => doc.listComments()), trackedChanges: listLength(() => doc.listRevisions()) };
  }

  function pageForCopilot(page) {
    const doc = editor.doc;
    const pages = doc.pageCount;
    if (page > pages) throw refusal("page-out-of-range", `The document has ${pages} ${pages === 1 ? "page" : "pages"}.`);
    const bitmap = doc.renderPage(page - 1, 120);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.widthPx;
      canvas.height = bitmap.heightPx;
      canvas.getContext("2d").putImageData(new ImageData(bitmap.rgba, bitmap.widthPx, bitmap.heightPx), 0, 0);
      tell(`Copilot looked at page ${page}.`);
      return { png: canvas.toDataURL("image/png").split(",")[1], pages, revision: journal.length,
        width: canvas.width, height: canvas.height };
    } finally { bitmap.free(); }
  }

  const exportFormats = { docx: ["org.openxmlformats.wordprocessingml.document", "a Word file"],
    pdf: ["application.pdf", "a PDF"], markdown: ["text.markdown", "Markdown"], html: ["text.html", "a web page"],
    text: ["text.plain", "plain text"] };
  async function exportForCopilot(format) {
    const [id, label] = exportFormats[format] ?? [];
    if (!id) throw refusal("invalid-request");
    const word = format === "docx";
    const output = editor.doc.exportAs(id, !word ? "semantic" : journal.length ? "preserve_when_safe" : "exact_if_unchanged");
    let content;
    try {
      if (word) {
        // The same check as the author's own Word export. Only the author
        // can accept a loss.
        try { validateDocxExport(output.reportJson, acceptedLosses); }
        catch (error) {
          throw error.decidable ? refusal("export-needs-author")
            : refusal("export-refused", `After an edit, the engine does not keep ${lossInWords(error.features)}. The revisions are saved in the canvas.`);
        }
      }
      content = output.bytes;
    } finally { output.free(); }
    const revision = journal.length;
    if (word) content = await compressed(content);
    let binary = "";
    for (let at = 0; at < content.length; at += 0x8000) binary += String.fromCharCode(...content.subarray(at, at + 0x8000));
    tell(`Copilot exported revision ${revision} as ${label}.`);
    return { bytes: btoa(binary), revision };
  }

  // The engine writes the entries of an edited Word export without
  // compression, so the file is about 15 times the size of the source.
  // Compress them (zip.mjs), then read the result back: each entry must
  // have the same bytes, and the engine must read the same text as from the
  // stored file. If any check fails, the stored file is the export. An
  // unchanged export is the source, byte for byte, and stays as it is.
  async function compressed(content) {
    if (!journal.length) return content;
    try {
      if (!isStored(content)) return content;
      const result = await compressZip(content);
      const [stored, packed] = [readZip(content), readZip(result)];
      if (stored.length !== packed.length) return content;
      for (const [index, entry] of stored.entries()) {
        const [a, b] = [await entryContent(entry), await entryContent(packed[index])];
        if (entry.name !== packed[index].name || a.length !== b.length || a.some((value, at) => value !== b[at])) return content;
      }
      const text = bytesOf => {
        const copy = openDoc(bytesOf);
        try { return JSON.stringify(JSON.parse(copy.searchableText()).map(([, value]) => value)); } finally { copy.free(); }
      };
      return text(result) === text(content) ? result : content;
    } catch { return content; }
  }

  // ---- Editions ----------------------------------------------------------
  // This document can be an edition of another document of the project.
  // The editor gets the reference's source and its saved edits, builds the
  // revision that the author last checked and the newest one, and compares
  // their paragraphs. Only text is read. The reference is not changed.
  let edition = null;            // { reference, checked }
  let referenceHead = 0;
  let referenceChanges = null;   // null until the comparison has run.
  async function loadEdition() {
    const state = await call("edition-reference", { lease });
    edition = state.edition;
    referenceChanges = null;
    if (edition) {
      const sample = openDoc(Uint8Array.from(atob(state.source), char => char.charCodeAt(0)));
      try {
        const read = () => JSON.parse(sample.searchableText());
        const replay = frames => { for (const frame of frames) sample.replayDurableFrame(JSON.stringify(frame)); };
        const checked = Math.min(edition.checked, state.frames.length);
        replay(state.frames.slice(0, checked));
        const before = read();
        replay(state.frames.slice(checked));
        referenceHead = state.frames.length;
        // The passages that changed before a save of the reference to its
        // file come as text with the record.
        referenceChanges = combinePassages(edition.carried, passageChanges(before, read()));
      } finally { sample.free(); }
    }
    renderEdition();
    return edition;
  }
  // The paragraph of this edition that a change of the reference is linked
  // to: the author accepted an update of it for an earlier change of the
  // same paragraph of the reference. Its number is the number that
  // ternleaf_read gives it. Null when there is no link, or the paragraph is gone.
  function linkOf(change) {
    const target = change.node && edition?.links?.[change.node];
    if (!target) return null;
    const list = JSON.parse(editor.doc.searchableText()).filter(([, text]) => text.trim());
    const index = list.findIndex(([node]) => node === target);
    return index < 0 ? null : { paragraph: index + 1, text: firstWords(list[index][1]) };
  }
  function renderEdition() {
    const section = part("edition");
    section.hidden = !edition;
    if (!edition) return;
    const changed = referenceChanges?.length ?? 0;
    section.dataset.state = changed ? "changed" : "current";
    part("edition-title").textContent = `Edition of ${edition.reference}`;
    part("edition-state").textContent = (referenceChanges === null ? "Comparing with the reference…"
      : changed ? `The reference changed in ${changed} ${changed === 1 ? "passage" : "passages"} since you last checked this edition.`
      : "The reference did not change since you last checked this edition.")
      + (edition.lost ? " Ternleaf could not keep the changes from before the last save of the reference to its Word file. Compare this edition with the reference, then mark it as checked." : "");
    part("edition-list").replaceChildren(...(referenceChanges ?? []).slice(0, 4).map(item => {
      const row = document.createElement("li");
      const slip = document.createElement("p");
      slip.className = "tl-slip tl-slip-small";
      if (item.change === "changed") slip.append(...diffNodes(item.before, item.after));
      else slip.append(Object.assign(document.createElement(item.change === "added" ? "ins" : "del"), { textContent: item.after ?? item.before }));
      row.append(slip);
      const linked = linkOf(item);
      if (linked) row.append(Object.assign(document.createElement("p"), { className: "tl-help", textContent: `Linked to: ${linked.text}` }));
      return row;
    }));
    part("edition-more").hidden = changed <= 4;
    part("edition-more").textContent = changed > 4 ? `And ${changed - 4} more.` : "";
    button("edition-ask").hidden = !changed;
    button("edition-checked").hidden = !changed && !edition.lost;
  }
  async function chooseReference() {
    const { selectDialog } = await import("./documents.mjs");
    const state = await call("edition", { lease });
    const choice = await selectDialog({
      title: "Make this document an edition",
      paragraphs: ["An edition says what another document says, for another reader: a short brief of a long paper, for example.",
        "Choose the reference document. When the reference changes, Ternleaf shows you the changed passages here, so that you can bring this edition up to date."],
      label: "Reference document",
      options: [{ value: "", label: "No reference" }, ...state.candidates.map(path => ({ value: path, label: path }))],
      value: state.edition?.reference ?? "", yes: "Save" });
    if (choice === undefined) return;
    await call("edition-set", { lease, reference: choice || null });
    await loadEdition();
    setOpen(true);
    showView("review");
  }

  // Merge a copy that comes back from Word. The name of a Ternleaf export
  // carries its revision and its history: that revision is the base. The
  // engine compares the base with the copy, so the result is what changed
  // in Word, and not what changed here since the export. Each changed, new
  // or removed paragraph becomes a suggestion in the ordinary review.
  async function mergeFromWord(content, fileName) {
    const { exportedName, pairParagraphs, suggestionsFromComparison } = await import("/ternleaf/merge.mjs");
    const { diffVersions } = await import("/pkg/casual_doc_wasm.js");
    const exported = exportedName(fileName);
    let named = exported.revision;
    // The histories from the one of the copy to this one. A save to the file
    // archives a history, and the archive has its source and its journal.
    let chain = [{ source, frames: journal.map(record => record.frame) }];
    if (exported.history && exported.history !== history) {
      const { histories } = await call("archived-history", { lease, history: exported.history });
      chain = histories.length && named <= histories[0].frames.length
        ? [...histories.map(item => ({ source: Uint8Array.from(atob(item.source), char => char.charCodeAt(0)), frames: item.frames })), chain[0]]
        : null;
    }
    const scratch = (bytesOf, frames) => {
      let doc;
      try {
        doc = openDoc(bytesOf);
        for (const font of fonts) doc.registerFont(font);
        for (const frame of frames) doc.replayDurableFrame(JSON.stringify(frame));
        return doc;
      } catch {
        doc?.free();
        throw new Error("Ternleaf cannot build the revision that this copy was exported from. Use Review, Compare in the editor to see the changes of the copy.");
      }
    };
    const paragraphsOf = (bytesOf, frames) => {
      const doc = scratch(bytesOf, frames);
      try { return JSON.parse(doc.searchableText()); } finally { doc.free(); }
    };
    // The IDs of the base, in this history. Null when a history did not
    // start from the file that the one before it saved.
    let ids = null;
    if (chain && chain.length > 1) {
      ids = pairParagraphs(chain.slice(0, -1).map((item, index) =>
        [paragraphsOf(item.source, item.frames), paragraphsOf(chain[index + 1].source, [])]));
      if (!ids) chain = null;
    }
    if (!chain) {
      const agreed = await confirmDialog({ title: "Compare with the document as it is now?",
        paragraphs: [`${fileName} is from before the last save to the Word file, and Ternleaf cannot build the revision that it was exported from.`,
          "Ternleaf can compare the copy with the document as it is now. Then the list also shows the changes that you made here after the export, as changes to undo. Check each suggestion."],
        yes: "Compare with the document now" });
      if (!agreed) { ready(); return; }
      chain = [{ source, frames: journal.map(record => record.frame) }];
      named = null;
    }
    const [first] = chain;
    const base = named !== null && named <= first.frames.length ? named : first.frames.length;
    const sample = scratch(first.source, first.frames.slice(0, base));
    let found;
    try {
      const output = sample.exportAs("org.openxmlformats.wordprocessingml.document", base ? "preserve_when_safe" : "exact_if_unchanged");
      let comparison;
      try { comparison = JSON.parse(diffVersions(output.bytes, content)); }
      catch { throw new Error("Ternleaf cannot read this file as a Word document."); }
      finally { output.free(); }
      // The top-level blocks of the base, so that an added paragraph finds
      // the paragraph before it.
      const blocks = Array(comparison.left?.blocks ?? 0).fill(null);
      for (const [node] of JSON.parse(sample.searchableText())) {
        const index = sample.blockIndexOf(node);
        if (index >= 0 && index < blocks.length && sample.blockNodeOf(node) === node) blocks[index] = node;
      }
      found = suggestionsFromComparison(comparison, node => {
        try { return sample.copyText(node, 0, node, sample.paragraphLength(node)); } catch { return null; }
      }, blocks);
    } finally { sample.free(); }
    if (ids) {
      // A paragraph that was removed here after the export has no ID now.
      const all = found.suggestions.length;
      found.suggestions = found.suggestions.filter(item => ids.has(item.node)).map(item => ({ ...item, node: ids.get(item.node) }));
      found.other += all - found.suggestions.length;
    }
    const count = (number, word) => `${number} ${word}${number === 1 ? "" : "s"}`;
    if (!found.suggestions.length) {
      toast(found.other ? `No text changes to merge. ${count(found.other, "other change")}: see Review, Compare.`
        : "The copy has the same text as the exported revision.");
      return;
    }
    const summary = `Changes from ${fileName}, made in Word after revision ${base}`
      + (chain.length > 1 ? ` of the history before the last save to the Word file` : "")
      + (named === null ? " (Ternleaf does not know the revision of the copy, so the copy was compared with the document as it is now)" : "") + "."
      + (found.other ? ` ${count(found.other, "other change")}, such as formatting or a paragraph before the first one, ${found.other === 1 ? "is" : "are"} not in this list: see Review, Compare.` : "");
    syncBatch(await call("merge", { lease, revision: journal.length, summary, changes: found.suggestions }));
    setOpen(true);
    showView("review");
  }

  // Lay out a copy of the document with a list of changes applied, and
  // count its pages. Nothing is saved and the page on screen does not move.
  function measureForCopilot(changes) {
    const sample = openDoc(source);
    try {
      for (const font of fonts) sample.registerFont(font);
      for (const record of journal) sample.replayDurableFrame(JSON.stringify(record.frame));
      const count = doc => { try { const stats = doc.documentStats(); const { words } = stats; stats.free(); return words; } catch { return null; } };
      const before = { pages: sample.pageCount, words: count(sample) };
      const blocked = [];
      (Array.isArray(changes) ? changes : []).forEach(({ node, find, replacement }, index) => {
        try {
          const text = sample.copyText(node, 0, node, sample.paragraphLength(node));
          const at = text.indexOf(find);
          if (at < 0 || text.indexOf(find, at + 1) >= 0) throw new Error("the find text is not there once after the earlier changes");
          const start = bytes(text.slice(0, at));
          const change = reviewChange({ node, start, end: start + bytes(find), before: find, replacement });
          checkReviewRun(node, change, sample);
          try { applyChange(sample, node, change, "Preview").free(); }
          catch (error) { throw error.sentence ? error : new Error("the engine cannot apply this change"); }
        } catch (error) { blocked.push({ index, reason: error.sentence || /find text/.test(error.message) ? error.message : "the engine cannot apply this change" }); }
      });
      return { pagesBefore: before.pages, wordsBefore: before.words, pagesAfter: sample.pageCount, wordsAfter: count(sample), blocked };
    } finally { sample.free(); }
  }

  // Check each change of a list from Copilot as the Review pane does, on
  // the document as it is now. Nothing changes. The host refuses the
  // changes that the author could not accept, with the reason.
  function checkForCopilot(changes) {
    const blocked = [];
    (Array.isArray(changes) ? changes : []).forEach(({ node, find, replacement }, index) => {
      const { reason } = locate({ node, find, replacement });
      if (reason) blocked.push({ index, reason });
    });
    return { blocked };
  }

  async function doJob(job) {
    let answer;
    try {
      if (!editor.doc) throw refusal("canvas-not-ready");
      const result = job.kind === "read" ? readForCopilot()
        : job.kind === "page" ? pageForCopilot(job.page)
        : job.kind === "export" ? await exportForCopilot(job.format)
        : job.kind === "measure" ? measureForCopilot(job.changes)
        : job.kind === "check" ? checkForCopilot(job.changes)
        : job.kind === "reference" ? await (async () => {
          if (!await loadEdition()) throw refusal("no-reference");
          tell("Copilot read the changes of the reference document.");
          return { reference: edition.reference, checked: edition.checked, head: referenceHead,
            changes: referenceChanges.map(item => ({ ...item, linked: linkOf(item) })) };
        })()
        : (() => { throw refusal("invalid-request"); })();
      answer = { result };
    } catch (error) {
      // A sentence of Ternleaf goes to Copilot as it is. The text of an
      // engine error does not: it says nothing that Copilot can act on.
      answer = { error: error.code ?? "canvas-error", detail: error.code ? error.detail
        : error.sentence ? error.message : "The engine reported an error for this job." };
    }
    try { await call("job", { lease, id: job.id, ...answer }); } catch { /* The action reports a canvas that did not answer. */ }
  }

  async function pulse() {
    if (!lease || blocked || pulsing || leaving || !editor.doc) return;
    pulsing = true;
    try {
      const selection = live ?? (stillThere(captured) ? captured : null);
      const state = await call("pulse", { lease, live: { revision: journal.length, pages: editor.doc.pageCount,
        words: wordTotal(), suggesting: Boolean(editor.doc.trackRevisions), selection,
        failing: houseChecks().filter(result => !result.ok).map(result => result.text),
        referenceChanges: edition && referenceChanges ? referenceChanges.length : null } });
      if (checked.revision !== shownChecks) { shownChecks = checked.revision; renderChecks(); }
      const changed = chatStamp !== undefined && state.stamp !== chatStamp;
      chatStamp = state.stamp;
      for (const line of state.notices ?? []) tell(String(line).slice(0, 200));
      if (state.rules !== rulesStamp) {
        // The rules file is new or changed. Read it again.
        const first = rulesStamp === undefined;
        rulesStamp = state.rules;
        if (!first || !houseRules !== !state.rules) {
          houseRules = (await call("history", { lease })).rules;
          checked = { revision: -1, results: [] };
          renderChecks();
        }
      }
      for (const job of state.jobs) {
        if (jobsDone.has(job.id)) continue;
        jobsDone.add(job.id);
        void doJob(job);
      }
      if (changed) {
        // Copilot put a proposal or suggestions in the canvas from the chat.
        syncBatch(await call("suggestions", { lease }));
        await syncReviews(await call("reviews", { lease }));
      }
    } catch { /* The heartbeat reports a lost canvas. A lost pulse is tried again. */ }
    finally { pulsing = false; }
  }

  // ---- Selection --------------------------------------------------------
  function selectedPassage(range) {
    const [node, anchor, focusNode, focus] = range ?? [];
    if (!node || node !== focusNode || anchor === focus) throw new Error("Select text within one paragraph");
    const start = Math.min(anchor, focus);
    const end = Math.max(anchor, focus);
    const before = editor.doc.copyText(node, start, node, end);
    if (!before || before.length > 4000 || bytes(before) !== end - start
      || /[\r\n\t￼]/.test(before)) throw new Error("Select up to 4,000 characters of continuous text");
    return { revision: journal.length, node, start, end, before };
  }

  const stillThere = passage => passage && passage.revision === journal.length
    && editor.doc.copyText(passage.node, passage.start, passage.node, passage.end) === passage.before;
  const inShell = () => panel.contains(document.activeElement) || bubble.contains(document.activeElement);
  let pointerDown = false;
  let live = null;          // The valid selection now in the document, if any.
  let signature = "";

  function watchSelection() {
    if (!lease || blocked || !editor.doc) return;
    let range = null;
    try { range = editor.selectedRange(); } catch { /* The engine has no selection during a reload. */ }
    const collapsed = !range || (range[0] === range[2] && range[1] === range[3]);
    let next = captured;
    let nextHint = "";
    live = null;
    if (!collapsed) {
      try { next = live = selectedPassage(range); }
      catch (error) { next = null; nextHint = error.message; }
    } else if (!inShell() || !stillThere(captured)) next = null;
    const key = JSON.stringify([next, nextHint, Boolean(live), pointerDown, mode(), panel.dataset.open, inShell()]);
    if (key === signature) return;
    signature = key;
    captured = next;
    hint = nextHint;
    renderCompose();
    placeBubble();
  }

  function placeBubble() {
    const show = live && !pointerDown && mode() === "compose" && !inShell() && !busy;
    if (!show) { bubble.hidden = true; return; }
    let rects;
    try { rects = editor.doc.selectionRects(live.node, live.start, live.node, live.end); } catch { rects = []; }
    if (rects.length < 5) { bubble.hidden = true; return; }
    const [page, x, y, w, h] = rects.slice(rects.length - 5);
    const sheet = document.querySelector(`.page-wrap[data-page-number="${page}"] canvas.page`);
    const view = document.querySelector("#viewport")?.getBoundingClientRect();
    if (!sheet || !view) { bubble.hidden = true; return; }
    const box = sheet.getBoundingClientRect();
    let scale;
    try {
      const size = editor.doc.pageSize(page - 1);
      try { scale = box.width / size.widthTwip; } finally { size.free(); }
    } catch { bubble.hidden = true; return; }
    bubble.hidden = false;
    const width = bubble.offsetWidth;
    const height = bubble.offsetHeight;
    const lineBottom = box.top + (y + h) * scale;
    let top = lineBottom + 8;
    if (top + height > view.bottom - 4) top = box.top + y * scale - height - 8;
    const left = Math.min(Math.max(box.left + (x + w) * scale - width / 2, view.left + 8), view.right - width - 8);
    if (top < view.top || top + height > view.bottom) { bubble.hidden = true; return; }
    bubble.style.left = Math.round(left) + "px";
    bubble.style.top = Math.round(top) + "px";
  }

  // ---- Review -----------------------------------------------------------
  // Facts that the engine computes for the whole document, kept for one
  // revision of the document on screen. A scratch copy asks each time,
  // because its text changes between the calls.
  let factsRevision = -1;
  const facts = new Map();
  function fact(doc, key, compute) {
    if (doc !== editor.doc) return compute();
    if (factsRevision !== journal.length) { facts.clear(); factsRevision = journal.length; }
    if (!facts.has(key)) facts.set(key, compute());
    return facts.get(key);
  }
  // A refusal with a sentence for the author. Any other error from the
  // engine is not shown as it is.
  const refuse = sentence => Object.assign(new Error(sentence), { sentence: true });
  const cannotRead = "Ternleaf cannot read this part of the document. Discard the proposal, then edit the text in the document.";

  // The number of fields in the document. Without a field, no paragraph
  // needs the slower check below. On an error, assume that there are fields.
  const fieldTotal = doc => fact(doc, "fields", () => {
    try { return Number(JSON.parse(doc.aiRead(JSON.stringify({ tool: "outline" }), "read")).value?.counts?.fields ?? 1); }
    catch { return 1; }
  });
  // The paragraphs of a table of contents: those inside a TOC field, and
  // those with a style that Word gives to its entries.
  const contentsNodes = doc => fact(doc, "contents", () => {
    const nodes = new Set();
    try {
      for (const row of doc.fieldRangeSpans()) {
        const [, instruction = "", list = ""] = String(row).split("\t");
        if (/^\s*TOC\b/i.test(instruction)) for (const id of list.split(" ")) if (id) nodes.add(id);
      }
    } catch { /* An engine without field ranges leaves the style. */ }
    return nodes;
  });
  const inContents = (doc, node) => {
    if (contentsNodes(doc).has(node)) return true;
    try { return contentsStyle(doc.paragraphStyleAt(node)); } catch { return false; }
  };
  // The byte ranges of the field results in a paragraph, or null when the
  // engine cannot say: then the preview checks the export (keptInExport).
  // copyRichRuns gives a field result as plain runs. The assistant read of
  // the engine names the fields of a paragraph and their results.
  function fieldResultsOf(doc, node) {
    return fact(doc, "fields " + node, () => {
      let block;
      try { block = JSON.parse(doc.aiRead(JSON.stringify({ tool: "read", start: node, maxTokens: 1 }), "read")).value?.blocks?.[0]; }
      catch { return null; }
      // A paragraph in a table cell comes as the whole table, without fields.
      if (block?.id !== node || block.kind !== "paragraph") return null;
      const fields = (block.fields ?? []).filter(field => !field.spansParagraphs);
      if (!fields.length) return [];
      return fieldRanges(doc.copyText(node, 0, node, doc.paragraphLength(node)),
        (block.runs ?? []).map(run => String(run.text ?? "")), fields.map(field => String(field.result ?? "")));
    });
  }
  const controlsIn = (doc, node) => fact(doc, "controls", () => {
    try { return JSON.parse(doc.contentControls()); } catch { return []; }
  }).filter(control => control.paragraph === node);

  // Check that the engine can apply a text change, and say how. The engine
  // gives new text the formatting of the character before it. So that the
  // new text keeps the formatting of the text it replaces, the result names
  // two formats: `format` of the first replaced character and `before` of
  // the character before the change. `mixed` is true when the replaced text
  // has more than one formatting, or when a formatting cannot be carried
  // over: some of it is lost, and the review says so.
  // A change that touches a link, a tab, a line break, an object or a field
  // result is refused, and so is a change in a table of contents. A change
  // of all the text of a content control gives `fill`: the editor fills the
  // control, so that the control stays (controlChange in structure.mjs).
  // `verify` says that the engine could not show where the fields of the
  // paragraph are, so the preview must check the export.
  function checkReviewRun(node, change, doc = editor.doc) {
    let length, runs;
    try {
      length = doc.paragraphLength(node);
      runs = JSON.parse(doc.copyRichRuns(node, 0, node, length));
    } catch { throw refuse(cannotRead); }
    if (inContents(doc, node)) throw refuse(sentences.contents);
    const formatOf = run => Object.fromEntries(Object.entries(run).filter(([key]) => key !== "text" && key !== "paragraphBreak"));
    const signature = format => JSON.stringify(Object.entries(format).sort());
    let end = 0;
    let before = null;
    const touched = [];
    for (const run of runs) {
      const start = end;
      end += bytes(run.text);
      if (change.start > start && change.start <= end) before = formatOf(run);
      const overlaps = change.end > change.start ? change.start < end && change.end > start : change.start >= start && change.start <= end;
      if (!overlaps) continue;
      if (run.href) throw refuse(sentences.link);
      if (/\t/.test(run.text)) throw refuse(sentences.tab);
      if (/[\r\n]/.test(run.text)) throw refuse(sentences.lineBreak);
      if (/￼/.test(run.text)) throw refuse(sentences.object);
      touched.push(formatOf(run));
    }
    if (end !== length) throw refuse("This paragraph has content that Ternleaf cannot change. Discard the proposal, then edit the text in the document.");
    let verify = false;
    if (fieldTotal(doc) > 0) {
      const ranges = fieldResultsOf(doc, node);
      if (!ranges) verify = true;
      else if (ranges.some(range => touches(change, range))) throw refuse(sentences.field);
    }
    let control;
    try { control = controlChange(controlsIn(doc, node), change, Boolean(doc.trackRevisions)); }
    catch (error) { throw refuse(error.message); }
    const format = touched[0] ?? {};
    const same = !before || signature(before) === signature(format);
    // What the new text must switch off to differ from the text before it.
    // Only an on/off formatting, such as bold, can be switched off.
    const off = same ? {} : Object.fromEntries(Object.entries(before).filter(([key]) => !(key in format)).map(([key, value]) => [key, value === true ? false : undefined]));
    const lost = Object.values(off).some(value => value === undefined);
    return { format, same, off: Object.fromEntries(Object.entries(off).filter(([, value]) => value !== undefined)),
      mixed: !control && change.end > change.start && change.inserted !== ""
        && (touched.some(item => signature(item) !== signature(format)) || lost),
      fill: control?.fill ?? null, verify };
  }

  // Where a paragraph is: its story (the body, one header or footer, one
  // note) and its table cell. A paragraph joins only a paragraph in the
  // same place: the engine refuses a join across stories ("selection
  // crosses editing surfaces"), and a join across cells is not a removal.
  function placeOf(doc, node) {
    try {
      const edge = doc.storyEdge(node, false);
      const story = edge.node;
      edge.free();
      const cell = doc.cellTextRange(node);
      try {
        return { story, cell: cell.found ? cell.startNode + " " + cell.endNode : "",
          onlyInCell: cell.found && cell.startNode === node && cell.endNode === node };
      } finally { cell.free(); }
    } catch { return null; }
  }

  // A change that deletes all the text of a paragraph removes the paragraph
  // too, when the paragraph before it is in the same story and the same
  // table cell: the empty paragraph joins it, and the paragraph before keeps
  // its own style. Otherwise only the text goes. `effect` is what the review
  // tells the author: "paragraph", "cell" (the only paragraph of a cell) or
  // "text" (the empty paragraph stays). Null for any other change.
  function removalOf(doc, node, change) {
    if (doc.trackRevisions || change.inserted || change.start !== 0 || !change.end || change.end !== doc.paragraphLength(node)) return null;
    const here = placeOf(doc, node);
    if (here?.onlyInCell) return { previous: null, effect: "cell" };
    const all = JSON.parse(doc.searchableText());
    const index = all.findIndex(([id]) => id === node);
    const previous = index > 0 ? all[index - 1][0] : null;
    const there = previous && here ? placeOf(doc, previous) : null;
    if (there && there.story === here.story && there.cell === here.cell) return { previous, effect: "paragraph" };
    return { previous: null, effect: "text" };
  }
  const removalText = {
    paragraph: "This change removes the whole paragraph.",
    cell: "This change empties the table cell.",
    text: "This change deletes all the text of the paragraph. The empty paragraph stays, because Ternleaf can join it only to a paragraph before it in the same part of the document.",
  };

  // Apply a reviewed change to a document as one revision. The store checks
  // the frame that the engine makes, so each way to apply a change has a
  // form that the store knows (frameDoesChange).
  function applyChange(doc, node, change, author = null) {
    const { format, same, off, fill } = checkReviewRun(node, change, doc);
    const removal = removalOf(doc, node, change);
    if (removal?.previous) return doc.replaceSelection(removal.previous, doc.paragraphLength(removal.previous), node, change.end, "");
    // A replacement of all the text of a content control would remove the
    // control. A fill keeps it, in one revision.
    if (fill) return doc.fillContentControl(fill.id, JSON.stringify({ text: fill.text }));
    if (doc.trackRevisions) {
      // Suggesting mode: the change becomes a tracked change, for a reader
      // who reviews in Word.
      // The engine has no call that makes a tracked change with a new
      // paragraph in one revision: suggestReplace keeps a line break as a
      // character inside the paragraph, pasteRichRuns does not track, and
      // an AI turn writes the change in three or more revisions.
      if (change.inserted.includes("\n")) {
        throw refuse("In Suggesting mode, Ternleaf cannot accept a change with a new paragraph, because the engine cannot record it as one tracked change. Switch to Editing to accept it as a plain change, or edit the proposal so that it has no line break.");
      }
      // Without `author`, the engine uses the name that the author set for
      // comments and suggestions.
      return doc.suggestReplace(node, change.start, change.end, change.inserted, author, null, null);
    }
    if (!change.inserted || (same && !change.inserted.includes("\n"))) {
      return doc.replaceSelection(node, change.start, node, change.end, change.inserted);
    }
    const style = same ? {} : { ...off, ...format };
    const runs = change.inserted.split("\n").flatMap((line, index) =>
      [...(index ? [{ text: "", paragraphBreak: true }] : []), ...(line ? [{ ...style, text: line }] : [])]);
    return doc.pasteRichRuns(node, change.start, node, change.end, JSON.stringify(runs));
  }

  // Apply a change to a scratch copy and get the frame that the engine
  // makes, so that the preview can ask the store's own question
  // (frameDoesChange) before the author sees the proposal. The copy's
  // admission goes to this function for the length of the call only.
  function frameOf(sample, apply) {
    const admit = globalThis.ternleafAdmit;
    let frame = null;
    globalThis.ternleafAdmit = raw => { try { frame = JSON.parse(raw); } catch { frame = null; } return true; };
    try {
      sample.enableDurableAdmission();
      return { result: apply(), frame: () => frame };
    } finally { globalThis.ternleafAdmit = admit; }
  }

  // An edit must keep every field and content control. Where the engine
  // could not say where the fields of a paragraph are, and as a second
  // check everywhere, the preview exports the copy with the change and
  // counts the fields and controls in the part of the paragraph. It does
  // this only when that part has a field or a control.
  let exportedCounts = { revision: -1, counts: null };
  const checkMs = [];
  async function countsOf(doc) {
    const output = doc.exportAs(format, "preserve_when_safe");
    let content;
    try { content = output.bytes; } finally { output.free(); }
    return fieldCounts(content);
  }
  async function keptInExport(node, sample) {
    let kind;
    try { kind = editor.doc.storyKind(node); } catch { kind = "body"; }
    const started = performance.now();
    if (exportedCounts.revision !== journal.length) {
      const revision = journal.length;
      exportedCounts = { revision, counts: await countsOf(editor.doc) };
    }
    const before = exportedCounts.counts[kind];
    if (!before?.fields && !before?.controls) return;
    const after = (await countsOf(sample))[kind] ?? { fields: 0, controls: 0 };
    checkMs.push(performance.now() - started);
    if (checkMs.length > 64) checkMs.shift();
    if (after.fields < before.fields) throw refuse(sentences.fieldLost);
    if (after.controls < before.controls) throw refuse(sentences.controlLost);
  }

  async function syncReviews(state, opening = false, force = false) {
    accepted = state.accepted;
    unanswered = Boolean(state.unanswered);
    const candidate = state.draft;
    if (!candidate) {
      if (draft) { draft = undefined; proposal = undefined; problem = ""; dropPreview(); render(); }
      renderHistory();
      return;
    }
    const fresh = draft?.id !== candidate.id;
    if (fresh || opening) {
      prompt.value = candidate.prompt;
      note.value = candidate.note;
      waitingSince = Date.now();
    }
    const answered = draft?.replacement == null && candidate.replacement !== null;
    const declined = candidate.declined && !(draft?.id === candidate.id && draft.declined);
    draft = candidate;
    if (candidate.replacement !== null && (fresh || answered || opening || force)) {
      editing = false;
      try {
        await inspectProposal(candidate);
        problem = "";
        message("Proposal ready to review", "ok");
        setOpen(true);
      } catch (error) {
        proposal = undefined;
        problem = error.sentence ? error.message : "Ternleaf cannot show this proposal on a copy of the document. Discard it, then ask again.";
        report(new Error(problem));
      }
    } else if (declined) {
      message("Copilot proposed no change");
      setOpen(true);
    }
    render();
  }

  function renderPageCanvas(doc, page) {
    const bitmap = doc.renderPage(page - 1, previewDpi);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.widthPx;
      canvas.height = bitmap.heightPx;
      canvas.getContext("2d").putImageData(new ImageData(bitmap.rgba, bitmap.widthPx, bitmap.heightPx), 0, 0);
      return canvas;
    } finally { bitmap.free(); }
  }

  // Mark the changed text on a rendered page. Returns the marked area in
  // pixels, so the close view can centre on it.
  function mark(canvas, doc, node, start, end, page, color) {
    let rects = [];
    try {
      rects = Array.from(end > start ? doc.selectionRects(node, start, node, end) : doc.caretRect(node, start));
    } catch { /* A position with no line has no mark. */ }
    const context = canvas.getContext("2d");
    context.globalCompositeOperation = "multiply";
    context.fillStyle = color;
    let focus = null;
    for (let index = 0; index + 4 < rects.length; index += 5) {
      if (rects[index] !== page) continue;
      const [x, y, w, h] = rects.slice(index + 1, index + 5).map(value => value * twip);
      const width = Math.max(w, 3);
      context.fillRect(x - (w ? 1 : 1.5), y, width + (w ? 2 : 0), h);
      focus = focus
        ? { x: Math.min(focus.x, x), y: Math.min(focus.y, y), right: Math.max(focus.right, x + width), bottom: Math.max(focus.bottom, y + h) }
        : { x, y, right: x + width, bottom: y + h };
    }
    context.globalCompositeOperation = "source-over";
    return focus ?? { x: 0, y: 0, right: canvas.width, bottom: canvas.height / 4 };
  }

  async function inspectProposal(candidate) {
    if (!candidate || candidate.revision !== journal.length || candidate.fontHash !== fontHash) {
      throw refuse("The document changed after this proposal. Discard it, then ask again.");
    }
    const { node, start, end, before } = candidate;
    if (editor.doc.copyText(node, start, node, end) !== before) throw refuse("The passage changed after this proposal. Discard it, then ask again.");
    const change = reviewChange(candidate);
    const next = { view: "after", whole: false, mixed: checkReviewRun(node, change).mixed, tracked: Boolean(editor.doc.trackRevisions),
      removes: removalOf(editor.doc, node, change)?.effect ?? null };
    const sample = openDoc(source);
    try {
      for (const font of fonts) sample.registerFont(font);
      for (const record of journal) sample.replayDurableFrame(JSON.stringify(record.frame));
      const [beforePage = 1] = editor.doc.caretRect(node, change.start);
      const beforeCanvas = renderPageCanvas(editor.doc, beforePage);
      next.before = { canvas: beforeCanvas,
        focus: mark(beforeCanvas, editor.doc, node, change.start, change.end, beforePage, "#f7c6c0") };
      let applied;
      try { applied = frameOf(sample, () => applyChange(sample, node, change, "Preview")); }
      catch (error) {
        if (error.sentence) throw error;
        throw refuse("The engine cannot apply this change here. Discard it, then edit the text in the document.");
      }
      const { result } = applied;
      try { if (result.revision !== candidate.revision + 1) throw refuse("The engine cannot apply this change here. Discard it, then edit the text in the document."); }
      finally { result.free(); }
      // The store accepts only a frame that does exactly the reviewed
      // change. Ask the same question now, so that the author does not
      // accept a change that the store then refuses.
      const frame = applied.frame();
      if (!frame || !frameDoesChange(frame.forward, node, change, frame.inverse)) {
        throw refuse(checkReviewRun(node, change).fill ? sentences.controlLost
          : "Ternleaf cannot apply this change as one checked edit. Discard it, then edit the text in the document.");
      }
      await keptInExport(node, sample);
      const [afterPage = 1] = sample.caretRect(node, change.start);
      const afterCanvas = renderPageCanvas(sample, afterPage);
      next.after = { canvas: afterCanvas,
        focus: mark(afterCanvas, sample, node, change.start, change.start + bytes(change.inserted.split("\n")[0]), afterPage, "#b9e6cf") };
      next.pages = { before: editor.doc.pageCount, after: sample.pageCount };
    } finally { sample.free(); }
    preview = next;
    proposal = candidate;
  }

  function dropPreview() {
    preview = null;
    const canvas = part("page");
    canvas.width = canvas.height = 0;
  }

  function paintPreview() {
    if (!preview) return;
    const canvas = part("page");
    const { canvas: page, focus } = preview[preview.view];
    const context = canvas.getContext("2d");
    canvas.width = 660;
    if (preview.whole) {
      canvas.height = Math.round(canvas.width * page.height / page.width);
      context.imageSmoothingQuality = "high";
      context.drawImage(page, 0, 0, canvas.width, canvas.height);
    } else {
      canvas.height = 300;
      const x = Math.max(0, Math.min((focus.x + focus.right) / 2 - canvas.width / 2, page.width - canvas.width));
      const y = Math.max(0, Math.min((focus.y + focus.bottom) / 2 - canvas.height / 2, page.height - canvas.height));
      context.drawImage(page, x, y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    }
    canvas.dataset.whole = String(preview.whole);
    for (const view of ["before", "after"]) button("view-" + view).setAttribute("aria-pressed", String(preview.view === view));
    button("whole").setAttribute("aria-pressed", String(preview.whole));
    button("whole").textContent = preview.whole ? "Show close view" : "Show whole page";
    const { before, after } = preview.pages;
    part("pages").textContent = before === after ? "" :
      `The document goes from ${before} to ${after} ${after === 1 ? "page" : "pages"}.`;
  }

  async function acceptProposal(candidate, authoredNote = note.value) {
    const { id, node, start, end, before, replacement, revision } = candidate;
    const editorial = { target: node, note: authoredNote };
    const intent = utf8.encode(JSON.stringify({ node, start, end, before, replacement, revision, fontHash, editorial }));
    const fingerprint = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", intent)),
      byte => byte.toString(16).padStart(2, "0")).join("");
    if (revision !== journal.length || candidate.fontHash !== fontHash
      || editor.doc.copyText(node, start, node, end) !== before) {
      throw new Error("The document changed after this proposal. Discard it, then ask again.");
    }
    if (pending) throw new Error("Another edit is being accepted");
    await call("review-note", { lease, id, note: authoredNote });
    if (pending || revision !== journal.length) throw new Error("The document changed after this proposal. Discard it, then ask again.");
    const change = reviewChange(candidate);
    checkReviewRun(node, change);
    pending = { id, fingerprint, editorial, reviewId: id };
    let result;
    try { result = applyChange(editor.doc, node, change); }
    catch (error) {
      if (error.sentence || blocked) throw error;
      throw new Error("The engine refused this change. The saved revision is unchanged. Discard the proposal, then edit the text in the document.");
    }
    finally { pending = undefined; }
    if (result.revision !== revision + 1) {
      result.free();
      if (!blocked) throw new Error("The edit was refused. The saved revision is unchanged.");
      return;
    }
    await editor.refresh(result);
    return journal.at(-1);
  }

  async function ask(scope) {
    busy = true;
    unreachable = null;
    unanswered = false;
    message("Sending the request…");
    render();
    try {
      await call("ask", { lease, scope });
      message("Waiting for Copilot");
    } catch (error) {
      if (error.code !== "agent-unreachable") throw error;
      unreachable = true;
      message(error.message, "problem");
    } finally {
      busy = false;
      await syncReviews(await call("reviews", { lease }));
      render();
    }
  }

  // ---- Whole-document review --------------------------------------------
  let advanceAfter = null;  // The review whose acceptance opens the next suggestion.
  let batchOrigin = "canvas";
  let houseRules = null;    // The path of the project's rules file, if any.

  function syncBatch(state, opening = false) {
    // An answer from the chat arrives complete: there was no waiting state.
    const arrived = Boolean(state.batch) && state.batch.id !== batch?.id && state.batch.state !== "waiting";
    const answered = arrived || (batch?.state === "waiting" && state.batch?.state !== "waiting");
    batch = state.batch;
    batchOrigin = ["chat", "word"].includes(state.origin) ? state.origin : "canvas";
    suggestions = state.suggestions;
    if (state.unanswered) batchStopped = "Copilot finished without suggestions. Read the chat for the reason.";
    if (batch && batch.state === "waiting" && batch.fence !== lease.fence) {
      batchStopped = "This request was interrupted before Copilot answered.";
    }
    if (answered && !opening) {
      const count = suggestions.length;
      message(batch?.state === "declined" ? "Copilot suggested no changes"
        : `${count} ${count === 1 ? "suggestion" : "suggestions"} ready to review`, "ok");
      setOpen(true);
      showView("review");
    }
    render();
  }

  // Find a suggestion's text in the document as it is now. Returns the
  // passage, or the reason why the suggestion cannot be applied.
  // A remark that becomes a comment only needs its text (`textOnly`).
  function locate(suggestion, textOnly = false) {
    const { node, find, replacement } = suggestion;
    let text;
    try { text = editor.doc.copyText(node, 0, node, editor.doc.paragraphLength(node)); }
    catch { return { reason: "The paragraph is no longer in the document." }; }
    const at = text.indexOf(find);
    if (at < 0) return { reason: batchOrigin === "word" ? "This text also changed here. Merge it by hand." : "The text changed after Copilot read it." };
    if (text.indexOf(find, at + 1) >= 0) return { reason: "The text occurs more than once in the paragraph." };
    const start = bytes(text.slice(0, at));
    const passage = { node, start, end: start + bytes(find), before: find, revision: journal.length };
    if (textOnly) return { passage };
    try { checkReviewRun(node, reviewChange({ ...passage, replacement })); }
    catch (error) { return { reason: error.sentence ? error.message : cannotRead }; }
    return { passage };
  }

  async function adopt(suggestion) {
    const { passage, reason } = locate(suggestion);
    if (!passage) throw new Error(reason);
    // A note belongs to one change. A suggestion starts without the note of
    // the change before it.
    note.value = "";
    await syncReviews(await call("adopt", { lease, id: suggestion.id, scope: { ...passage, note: "" } }), false, true);
    showView("review");
  }

  async function nextSuggestion() {
    advanceAfter = null;
    if (blocked || draft) return;
    try {
      syncBatch(await call("suggestions", { lease }));
      const next = suggestions.find(item => item.state === "open" && item.kind !== "remark" && locate(item).passage);
      if (next) await adopt(next);
      else if (suggestions.length) message("All suggestions reviewed. Your accepted changes are in the History tab.", "ok");
    } catch (error) { report(error); render(); }
  }

  async function requestDocument(instruction) {
    const paragraphs = JSON.parse(editor.doc.searchableText()).filter(([, text]) => text.trim());
    busy = true;
    batchStopped = "";
    message("Sending the document text…");
    render();
    try {
      await call("review-document", { lease, revision: journal.length, prompt: instruction, paragraphs });
      message("Waiting for Copilot");
    } catch (error) {
      if (error.code !== "agent-unreachable") throw error;
      batchStopped = "Copilot did not take the request.";
      message(error.message, "problem");
    } finally {
      busy = false;
      syncBatch(await call("suggestions", { lease }));
    }
  }

  async function discard(quiet = false) {
    await call("discard", { lease });
    draft = undefined;
    proposal = undefined;
    problem = "";
    unreachable = null;
    unanswered = false;
    dropPreview();
    if (!quiet) ready();
    render();
  }

  // ---- Rendering --------------------------------------------------------
  function mode() {
    if (!draft) return batch?.state === "waiting" ? "batch" : "compose";
    if (draft.revision !== journal.length) return "problem";
    if (draft.declined) return "declined";
    if (draft.replacement === null) return "waiting";
    return proposal?.id === draft.id ? "proposal" : "problem";
  }

  function quote(element, text) {
    element.textContent = text;
    element.title = text.length > 280 ? "" : text;
  }

  function renderCompose() {
    const passage = part("passage");
    const has = Boolean(captured);
    passage.dataset.empty = String(!has);
    if (has) {
      quote(part("passage-text"), captured.before);
      const words = wordCount(captured.before);
      part("passage-meta").textContent = `${words} ${words === 1 ? "word" : "words"} selected`;
    } else {
      part("passage-text").textContent = "";
      part("passage-meta").textContent = hint ? hint + "." : "Select a sentence in the document, or choose Whole document to review all of it.";
    }
    part("passage-meta").dataset.tone = hint ? "problem" : "";
    const whole = scope === "document";
    passage.hidden = whole;
    part("doc-note").hidden = !whole;
    part("chips-selection").hidden = whole;
    part("chips-document").hidden = !whole;
    part("request-label").textContent = whole ? "Review document" : "Ask Copilot";
    prompt.placeholder = whole ? "Tell Copilot what to look for in the document"
      : "Tell Copilot what to change in the selected text";
    part("compose-help").hidden = whole;
    for (const option of panel.querySelectorAll("[data-scope]")) option.setAttribute("aria-pressed", String(option.dataset.scope === scope));
    for (const chip of part("chips-selection").querySelectorAll("[data-quick]")) {
      chip.disabled = !has || busy;
      chip.title = has ? quickActions.find(item => item.id === chip.dataset.quick)?.instruction ?? "" : "Select text first.";
    }
    part("doc-start").hidden = Boolean(batch);
    for (const chip of part("chips-document").querySelectorAll("[data-quick]")) chip.disabled = busy;
    for (const chip of bubble.querySelectorAll("[data-quick]")) chip.disabled = busy;
    button("request").disabled = busy || !prompt.value.trim() || (!whole && !has);
  }

  const presets = new Set([...quickActions, ...documentActions].map(item => item.instruction));
  function renderRecent() {
    const recent = [...new Set(reviewed.map(item => item.prompt).filter(text => text && !presets.has(text)).reverse())].slice(0, 3);
    part("recent").hidden = recent.length === 0;
    part("recent").replaceChildren(...recent.map(text => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "tl-chip";
      chip.dataset.action = "recent";
      chip.dataset.prompt = text;
      chip.title = text;
      chip.textContent = text.length > 34 ? text.slice(0, 32).trimEnd() + "…" : text;
      return chip;
    }));
  }

  const diffNodes = (before, after) => wordDiff(before, after).map(({ kind, text }) => {
    const element = document.createElement(kind === "same" ? "span" : kind);
    element.textContent = text;
    return element;
  });

  function renderQueue() {
    const queue = part("queue");
    queue.hidden = !batch || batch.state === "waiting";
    if (queue.hidden) return;
    const open = suggestions.filter(item => item.state === "open" && item.kind !== "remark").length;
    const remarks = suggestions.filter(item => item.state === "open" && item.kind === "remark").length;
    const plural = (number, word) => `${number} ${word}${number === 1 ? "" : "s"}`;
    part("queue-title").textContent = batch.state === "declined" ? "Copilot suggested no changes"
      : open && remarks ? `${plural(open, "suggestion")} and ${plural(remarks, "remark")} to review`
      : open ? `${plural(open, "suggestion")} to review`
      : remarks ? `${plural(remarks, "remark")} to read` : "All suggestions reviewed";
    part("queue-prompt").textContent = batch.prompt;
    part("queue-prompt").dataset.origin = batchOrigin;
    part("queue-reason").hidden = batch.state !== "declined";
    part("queue-reason").textContent = batch.reason?.trim() || "Copilot found nothing to change. Try another review, or ask in the chat.";
    part("queue-done").hidden = batch.state === "declined" || !suggestions.length || suggestions.some(item => item.state === "open");
    part("queue-list").replaceChildren(...suggestions.map(item => {
      const row = document.createElement("li");
      row.dataset.state = item.state;
      const slip = document.createElement("p");
      slip.className = "tl-slip tl-slip-small";
      if (item.kind === "remark") {
        // A remark has no change to review. It quotes the text and says
        // what Copilot noticed. The author decides what to do about it.
        row.dataset.kind = "remark";
        slip.textContent = item.find;
        const said = document.createElement("p");
        said.className = "tl-remark";
        said.textContent = item.rationale;
        row.append(slip, said);
        const actions = document.createElement("div");
        actions.className = "tl-actions";
        const control = document.createElement("button");
        control.type = "button";
        control.className = "tl-link";
        control.dataset.action = item.state === "skipped" ? "restore" : "skip";
        control.dataset.id = item.id;
        control.textContent = item.state === "skipped" ? "Restore" : "Done";
        if (item.state === "skipped") actions.append(Object.assign(document.createElement("span"), { className: "tl-help", textContent: "Done" }));
        else if (locate(item, true).passage) {
          // Keep the remark with the document, as a Word comment on the text.
          const keep = document.createElement("button");
          keep.type = "button";
          keep.className = "tl-button";
          keep.dataset.action = "comment";
          keep.dataset.id = item.id;
          keep.textContent = "Add as comment";
          keep.title = "Adds the remark to the document as a Word comment on this text.";
          actions.append(keep);
        }
        actions.append(control);
        row.append(actions);
        return row;
      }
      slip.append(...diffNodes(item.find, item.replacement));
      row.append(slip);
      if (item.rationale) {
        const why = document.createElement("p");
        why.className = "tl-help";
        why.textContent = item.rationale;
        row.append(why);
      }
      const actions = document.createElement("div");
      actions.className = "tl-actions";
      const add = (label, action, kind = "tl-link") => {
        const control = document.createElement("button");
        control.type = "button";
        control.className = kind;
        control.dataset.action = action;
        control.dataset.id = item.id;
        control.textContent = label;
        actions.append(control);
      };
      if (item.state === "accepted") actions.append(Object.assign(document.createElement("span"), { className: "tl-done", textContent: "Accepted" }));
      else if (item.state === "skipped") {
        actions.append(Object.assign(document.createElement("span"), { className: "tl-help", textContent: "Skipped" }));
        add("Restore", "restore");
      } else {
        const { reason } = locate(item);
        if (reason) {
          row.dataset.state = "blocked";
          actions.append(Object.assign(document.createElement("span"), { className: "tl-blocked", textContent: reason }));
        } else add("Review", "adopt", "tl-button");
        add("Skip", "skip");
      }
      row.append(actions);
      return row;
    }));
  }

  function render() {
    const current = mode();
    panel.dataset.mode = current;
    const shown = { declined: "notice", problem: "notice", batch: "waiting" }[current] ?? current;
    for (const view of ["compose", "waiting", "proposal", "notice"]) part(view).hidden = view !== shown;
    button("retry").hidden = !accepted;
    renderCompose();
    if (current === "compose") { renderQueue(); renderRecent(); }
    if (current === "batch") {
      part("waiting-prompt").textContent = batch.prompt;
      part("waiting-text").hidden = true;
      part("waiting").dataset.stopped = String(Boolean(batchStopped));
      part("waiting-status").textContent = batchStopped
        || (Date.now() - batch.created > 90_000 ? "Copilot is still working. Look at the chat if it asks for approval."
          : "Copilot is reading the document in the chat.");
      button("resend").hidden = !batchStopped;
    }
    if (current === "waiting") {
      part("waiting-text").hidden = false;
      quote(part("waiting-text"), draft.before);
      part("waiting-prompt").textContent = draft.prompt;
      const interrupted = draft.fence !== lease.fence;
      const stopped = interrupted || unreachable || unanswered;
      part("waiting").dataset.stopped = String(Boolean(stopped));
      part("waiting-status").textContent = interrupted ? "This request was interrupted before Copilot answered."
        : unreachable ? "Copilot did not take the request."
        : unanswered ? "Copilot finished without a proposal. Read the chat for the reason."
        : Date.now() - waitingSince > 45_000 ? "Copilot is still working. Look at the chat if it asks for approval."
        : "Copilot is reading the passage in the chat.";
      button("resend").hidden = !stopped;
    }
    if (current === "proposal") {
      part("asked").textContent = draft.prompt;
      part("asked").dataset.origin = draft.origin ?? (draft.suggestion ? batchOrigin : "canvas");
      const adopted = Boolean(draft.suggestion);
      const position = suggestions.findIndex(item => item.id === draft.suggestion);
      part("step").hidden = position < 0;
      part("step").textContent = `Suggestion ${position + 1} of ${suggestions.length}`;
      button("again").hidden = adopted;
      button("back").hidden = !adopted;
      review.querySelector('[data-action="discard"]').textContent = adopted ? "Skip" : "Discard";
      const options = draft.alternatives ?? [];
      const custom = options.length > 0 && !options.includes(draft.replacement);
      part("options").hidden = options.length < 2;
      part("options").replaceChildren(...options.map((text, index) => {
        const option = document.createElement("button");
        option.type = "button";
        option.dataset.action = "option";
        option.dataset.index = String(index);
        option.textContent = "Option " + (index + 1);
        option.title = text;
        option.setAttribute("aria-pressed", String(text === draft.replacement));
        return option;
      }), ...(custom ? [Object.assign(document.createElement("button"),
        { type: "button", textContent: "Your edit", ariaPressed: "true" })] : []));
      const slip = part("diff");
      slip.hidden = editing;
      part("edit").hidden = !editing;
      button("edit").hidden = editing;
      slip.replaceChildren(...diffNodes(draft.before, draft.replacement));
      const from = wordCount(draft.before);
      const to = wordCount(draft.replacement);
      part("count").textContent = from === to ? `${to} words` : `${from} → ${to} words`;
      part("rationale").hidden = !draft.rationale;
      part("mixed").hidden = !preview?.mixed;
      part("tracked").hidden = !preview?.tracked;
      part("removes").hidden = !preview?.removes;
      part("removes").textContent = removalText[preview?.removes] ?? "";
      part("rationale-text").textContent = draft.rationale ?? "";
      button("save-note").hidden = note.value === draft.note;
      paintPreview();
    }
    if (current === "declined" || current === "problem") {
      part("notice").dataset.kind = current;
      const outdated = draft.revision !== journal.length;
      part("notice-title").textContent = current === "declined" ? "Copilot proposed no change"
        : outdated ? "This request is out of date" : "This proposal cannot be applied";
      part("notice-text").textContent = current === "declined" ? draft.rationale ?? ""
        : outdated ? "The document changed after this request. Discard it, then ask again." : problem;
      quote(part("notice-passage"), draft.before);
    }
    const waitingList = suggestions.filter(item => item.state === "open").length;
    const label = { compose: waitingList ? `${waitingList} ${waitingList === 1 ? "suggestion" : "suggestions"}` : "Ternleaf",
      waiting: "Waiting for Copilot", batch: "Waiting for Copilot", proposal: "Proposal ready",
      declined: "Copilot answered", problem: "Proposal needs attention" }[current];
    launcher.dataset.attention = String(current === "compose" && waitingList > 0);
    launcher.dataset.mode = current;
    launcher.querySelector("[data-part=launcher-label]").textContent = label;
    signature = "";
  }

  // The house rules with a fixed form, checked against the document as it
  // is now. The result is kept for one revision.
  let checked = { revision: -1, results: [] };
  function houseChecks() {
    if (!houseRules?.checks?.length || !editor.doc) return [];
    if (checked.revision !== journal.length) {
      let results = [];
      try {
        const paragraphs = JSON.parse(editor.doc.searchableText()).map(([, text]) => text).filter(text => text.trim());
        let headings = [];
        try { headings = Array.from(editor.doc.documentOutline()).map(row => String(row).split("\t").slice(3).join(" ")); } catch { /* No outline. */ }
        results = runChecks(houseRules.checks, { pages: editor.doc.pageCount, words: wordTotal() ?? 0, paragraphs, headings });
      } catch { /* A check that cannot run reports nothing. */ }
      checked = { revision: journal.length, results };
    }
    return checked.results;
  }
  // Without house rules, or without checks in them, one quiet line says how
  // to start. The author can hide it for good.
  let rulesExample = "examples/ternleaf.rules.example.md";
  const hintKey = kind => "ternleaf-hide-rules-hint-" + kind;
  function renderRulesHint() {
    const kind = !houseRules ? "none" : !houseRules.checks?.length ? "no-checks" : null;
    let hidden = !kind;
    try { hidden ||= localStorage.getItem(hintKey(kind)) === "true"; } catch { /* Show the line. */ }
    part("rules-hint").hidden = hidden || panel.dataset.workspace === "false";
    part("rules-hint").dataset.kind = kind ?? "";
    part("rules-hint-text").textContent = kind === "none"
      ? `No house rules in this project. Copy ${rulesExample} to ternleaf.rules.md, and Ternleaf checks the rules while you write.`
      : kind ? `Copilot follows ${houseRules.path}. Add a ternleaf block, for example max-pages: 2, and Ternleaf checks it while you write.` : "";
  }
  function renderChecks() {
    renderRulesHint();
    const section = part("checks");
    section.hidden = !houseRules?.checks?.length;
    if (section.hidden) return;
    const results = houseChecks();
    const failing = results.filter(result => !result.ok);
    part("checks-title").textContent = !results.length ? "House rules"
      : failing.length ? `House rules: ${failing.length} of ${results.length} checks fail` : `House rules: all ${results.length} checks pass`;
    section.dataset.state = failing.length ? "failing" : "passing";
    part("checks-file").textContent = `Copilot follows ${houseRules.path}.`;
    part("checks-list").replaceChildren(...failing.map(result =>
      Object.assign(document.createElement("li"), { textContent: result.text })));
  }

  function renderHistory() {
    const list = part("history");
    const byRevision = new Map(reviewed.map(entry => [entry.revision, entry]));
    const groups = [];
    for (const record of journal) {
      const item = byRevision.get(record.revision);
      const kind = record.command.kind === "edit" ? (item ? "copilot" : "edit") : record.command.kind;
      const last = groups.at(-1);
      if (kind === "edit" && last?.kind === "edit") { last.to = record.revision; last.at = record.at; last.count++; }
      else groups.push({ kind, from: record.revision, to: record.revision, at: record.at, count: 1, item,
        target: record.command.target, noteText: record.editorial.after?.note });
    }
    part("history-count").textContent = journal.length ? String(journal.length) : "";
    part("history-empty").hidden = groups.length > 0;
    button("record").hidden = reviewed.length === 0;
    part("record-empty").hidden = groups.length === 0 || reviewed.length > 0;
    renderChecks();
    list.replaceChildren(...groups.reverse().map(group => {
      const row = document.createElement("li");
      row.dataset.kind = group.kind;
      const head = document.createElement("div");
      head.className = "tl-row-head";
      const title = document.createElement("strong");
      title.textContent = group.kind === "copilot" ? "Copilot change accepted"
        : group.kind === "edit" ? (group.count === 1 ? "Edit in the document" : `${group.count} edits in the document`)
        : group.kind === "undo" ? `Undo of revision ${group.target}` : `Redo of revision ${group.target}`;
      const meta = document.createElement("span");
      meta.textContent = (group.from === group.to ? `Revision ${group.to}` : `Revisions ${group.from}–${group.to}`)
        + (group.at ? ", " + ago(group.at) : "");
      head.append(title, meta);
      row.append(head);
      if (group.item) {
        const asked = document.createElement("p");
        asked.className = "tl-row-asked";
        asked.textContent = group.item.prompt;
        const slip = document.createElement("p");
        slip.className = "tl-slip tl-slip-small";
        slip.append(...wordDiff(group.item.before, group.item.replacement).map(({ kind, text }) => {
          const element = document.createElement(kind === "same" ? "span" : kind);
          element.textContent = text;
          return element;
        }));
        row.append(asked, slip);
        if (group.item.note) {
          const noted = document.createElement("p");
          noted.className = "tl-row-note";
          noted.textContent = group.item.note;
          row.append(noted);
        }
      }
      return row;
    }));
  }

  // ---- Pane -------------------------------------------------------------
  const openKey = "ternleaf-open";
  function setOpen(open, focus = false) {
    if (panel.dataset.open !== String(open)) {
      panel.dataset.open = String(open);
      launcher.hidden = open;
      try { localStorage.setItem(openKey, String(open)); } catch { /* Storage can be unavailable. */ }
      window.dispatchEvent(new Event("resize"));
    }
    if (open && focus) {
      showView("review");
      queueMicrotask(() => (mode() === "compose" ? prompt : panel).focus({ preventScroll: true }));
    }
  }
  function showView(view) {
    panel.dataset.view = view;
    for (const tab of panel.querySelectorAll("[role=tab]")) {
      const selected = tab.dataset.view === view;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    for (const section of panel.querySelectorAll("[role=tabpanel]")) section.hidden = section.dataset.view !== view;
    if (view === "history") renderHistory();
  }
  const narrow = () => document.documentElement.clientWidth < 900;
  function fit() {
    const overlay = narrow();
    if (panel.dataset.layout === (overlay ? "overlay" : "docked")) return;
    panel.dataset.layout = overlay ? "overlay" : "docked";
    document.documentElement.dataset.ternleafLayout = panel.dataset.layout;
  }
  fit();
  new ResizeObserver(() => { fit(); signature = ""; }).observe(document.documentElement);
  let stored = null;
  try { stored = localStorage.getItem(openKey); } catch { /* Use the default. */ }
  setOpen(stored === null ? !narrow() : stored === "true");
  showView("review");
  // The compact toolbar leaves more room for the page in a narrow canvas.
  // An author who chose a toolbar keeps that choice.
  let chosen = null;
  try { chosen = localStorage.getItem("opendoc.chromeMode"); } catch { /* Use the default. */ }
  if (!chosen && narrow() && document.documentElement.dataset.chrome === "ribbon") {
    document.querySelector('[data-chrome-mode="compact"]')?.click();
    // This was Ternleaf's choice for a narrow canvas, not the author's.
    try { localStorage.removeItem("opendoc.chromeMode"); } catch { /* Nothing to undo. */ }
  }

  function downloadFile(content, type, fileName) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // The Word export of the revision on screen, with the engine's report. An
  // unchanged document exports byte for byte.
  function wordExport(doc, revision) {
    try { return doc.exportAs(format, revision ? "preserve_when_safe" : "exact_if_unchanged"); }
    catch { throw new Error("The engine cannot write this document as a Word file. Your revisions are saved, and PDF export still works."); }
  }

  async function download() {
    const doc = editor.doc;
    if (captureWordComparison) {
      wordEvidence = undefined;
      button("word-evidence").hidden = true;
    }
    const output = wordExport(doc, journal.length);
    try {
      try { validateDocxExport(output.reportJson, acceptedLosses); }
      catch (error) {
        if (!error.decidable) {
          throw new Error(`Ternleaf cannot export this document as DOCX after an edit yet. The engine does not keep ${lossInWords(error.features)}. Your revisions are saved, and PDF export still works.`);
        }
        // A known, small loss. The author decides, once for this document.
        const agreed = await confirmDialog({ title: "Export without a legacy part?",
          paragraphs: error.features.map(feature => authorDecides.get(feature)), yes: "Export DOCX" });
        if (!agreed) { ready(); return; }
        for (const feature of error.features) acceptedLosses.add(feature);
        validateDocxExport(output.reportJson, acceptedLosses);
      }
      const revision = journal.length;
      const content = await compressed(output.bytes);
      const stem = name.replace(/\.docx$/i, "");
      downloadFile(content, output.mimeType, `${stem}-r${revision}${history ? "-" + history : ""}.docx`);
      message(`Exported revision ${journal.length} as a Word file`, "ok");
      if (captureWordComparison) {
        wordEvidence = await captureWordEvidence(doc, content, journal.length);
        button("word-evidence").hidden = false;
      }
    } finally { output.free(); }
  }

  // ---- Save to the file ----------------------------------------------------
  // The author writes the current revision into the .docx file on disk, so
  // that git has the current text. The host writes the file, archives the
  // history and starts a new one from the saved file (apps/host/serve.mjs).
  const base64 = content => {
    let binary = "";
    for (let at = 0; at < content.length; at += 0x8000) binary += String.fromCharCode(...content.subarray(at, at + 0x8000));
    return btoa(binary);
  };
  async function saveToFile() {
    const doc = editor.doc;
    const revision = journal.length;
    let content;
    // The same check as Export DOCX. If the export is refused, nothing is
    // sent, so nothing is written.
    const output = wordExport(doc, revision);
    try {
      try { validateDocxExport(output.reportJson, acceptedLosses); }
      catch (error) {
        if (!error.decidable) {
          throw new Error(`Ternleaf cannot save this document to the Word file after an edit yet. The engine does not keep ${lossInWords(error.features)}. Your revisions are saved here, the Word file did not change, and PDF export still works.`);
        }
        const agreed = await confirmDialog({ title: "Save without a legacy part?",
          paragraphs: error.features.map(feature => authorDecides.get(feature)), yes: "Continue" });
        if (!agreed) { ready(); return; }
        for (const feature of error.features) acceptedLosses.add(feature);
        validateDocxExport(output.reportJson, acceptedLosses);
      }
      content = output.bytes;
    } finally { output.free(); }
    content = await compressed(content);
    const text = doc.exportAs("text.markdown", "semantic");
    let markdown;
    try { markdown = new TextDecoder().decode(text.bytes); } finally { text.free(); }
    const extra = [saveFile.textCopy && `${name}.md, a text copy for diffs`,
      saveFile.changeLog && `${name}.changes.md, the log of accepted changes`].filter(Boolean);
    const agreed = await confirmDialog({ title: "Save to the Word file?",
      paragraphs: [`Ternleaf writes revision ${revision} into ${name} on disk. The file then has the current text.`,
        "Ternleaf moves the history up to now to the archive in .ternleaf/archive. A new history starts at revision 0 from the saved file. Undo cannot go back to a revision before the save.",
        ...(extra.length ? [`Ternleaf also writes ${extra.join(" and ")}, next to the document.`] : []),
        "Ternleaf does not commit to git. After the save, you get a commit message to copy."],
      yes: "Save to the Word file" });
    if (!agreed || journal.length !== revision) { ready(); return; }
    message("Saving to the Word file…");
    // From here the host can answer "document-changed" to any call. The
    // page must not reload before the author saw the commit message.
    leaving = true;
    // An edition of this document was checked against a revision of the
    // history that the save archives. Its unchecked passages go with the
    // save as text, so that the edition still shows them afterwards.
    let editions = [];
    try {
      const { editions: list } = await call("editions-of", { lease });
      if (list.some(item => item.checked < revision)) {
        const sample = openDoc(source);
        try {
          const read = () => JSON.parse(sample.searchableText());
          let at = 0;
          const now = JSON.parse(doc.searchableText());
          for (const item of [...list].sort((a, b) => a.checked - b.checked)) {
            if (item.checked >= revision) continue;
            for (; at < item.checked; at++) sample.replayDurableFrame(JSON.stringify(journal[at].frame));
            editions.push({ edition: item.edition, checked: item.checked, changes: combinePassages(item.carried, passageChanges(read(), now)) });
          }
        } finally { sample.free(); }
      }
      for (const item of list) if (item.checked === revision) editions.push({ edition: item.edition, checked: item.checked, changes: item.carried });
    } catch { /* Without the lists, the host tells each edition to compare by hand. */ editions = []; }
    // The saved file gives its paragraphs new IDs when the new history opens
    // it. The links between passages of editions follow them, and so do
    // the carried passages.
    let renamed = null;
    try {
      const { pairParagraphs } = await import("/ternleaf/merge.mjs");
      const saved = openDoc(content);
      let ids;
      try { ids = pairParagraphs([[JSON.parse(doc.searchableText()), JSON.parse(saved.searchableText())]]); } finally { saved.free(); }
      if (ids) {
        renamed = [...ids];
        for (const item of editions) {
          item.changes = (item.changes ?? []).map(({ node, ...change }) => ids.has(node) ? { ...change, node: ids.get(node) } : change);
        }
      }
    } catch { /* Without the pairs, a link stays with the old ID and no longer shows. */ }
    let result;
    try { result = await call("save-file", { lease, revision, bytes: base64(content), markdown, editions, renamed }); }
    catch (error) { leaving = false; throw error; }
    const written = [result.textCopy, result.changeLog].filter(Boolean);
    await copyDialog({ title: "Saved to the Word file",
      paragraphs: [`${result.document} has the text of revision ${result.revisions} now. A new history starts at revision 0.`,
        ...(written.length ? [`Ternleaf also wrote ${written.join(" and ")}.`] : []),
        "To keep the save in git, commit these files. Here is a commit message."],
      label: "Commit message", text: result.commitMessage, copy: "Copy the commit message" });
    reload();
  }

  // ---- Events -----------------------------------------------------------
  const request = async instruction => {
    const passage = stillThere(captured) ? captured : selectedPassage(editor.selectedRange());
    setOpen(true);
    showView("review");
    await ask({ ...passage, prompt: instruction, note: note.value });
  };
  const act = async (action, target) => {
    if (action === "reload") { location.reload(); return; }
    if (action === "close") { setOpen(false); return; }
    if (action === "open") { setOpen(true, true); return; }
    if (action === "tab") { showView(target.dataset.view); return; }
    if (action === "documents") { void documents.open(); return; }
    if (action === "export-menu" || action === "export-as") {
      const menu = part("export-menu");
      const open = action === "export-menu" && menu.hidden;
      menu.hidden = !open;
      button("export-menu").setAttribute("aria-expanded", String(open));
      if (action === "export-as" && lease && !blocked) {
        const result = await window.opendoc?.execute?.(target.dataset.command);
        if (result && result.ok === false) toast("That format is not available here.", "problem");
      }
      return;
    }
    if (!lease || blocked) return;
    try {
      switch (action) {
        case "compose": scope = "selection"; render(); setOpen(true, true); break;
        case "scope":
          scope = target.dataset.scope;
          render();
          break;
        case "quick": {
          const whole = documentActions.find(item => item.id === target.dataset.quick);
          const { instruction } = whole ?? quickActions.find(item => item.id === target.dataset.quick);
          prompt.value = instruction;
          if (whole) await requestDocument(instruction);
          else { scope = "selection"; await request(instruction); }
          break;
        }
        case "recent":
          prompt.value = target.dataset.prompt;
          renderCompose();
          prompt.focus();
          break;
        case "request":
          if (scope === "document") await requestDocument(prompt.value);
          else await request(prompt.value);
          break;
        case "adopt": await adopt(suggestions.find(item => item.id === target.dataset.id)); break;
        case "comment": {
          // A comment is the author's own edit: it is a revision like any
          // other, and it goes into the Word export.
          const item = suggestions.find(entry => entry.id === target.dataset.id);
          const { passage } = locate(item, true);
          if (!passage) throw new Error("The text of this remark changed. Choose Done.");
          let result;
          try { result = editor.doc.addComment(passage.node, passage.start, passage.node, passage.end, item.rationale, "Copilot", "C", new Date().toISOString()); }
          catch { throw new Error("Ternleaf cannot add a comment on this text. Select the text in the document, then add the comment from the Review tab of the editor."); }
          await editor.refresh(result);
          syncBatch(await call("suggestion-state", { lease, id: item.id, state: "skipped" }));
          toast("The remark is now a comment in the document.");
          break;
        }
        case "skip": case "restore":
          syncBatch(await call("suggestion-state", { lease, id: target.dataset.id, state: action === "skip" ? "skipped" : "open" }));
          break;
        case "discard-batch":
          syncBatch(await call("discard-batch", { lease }));
          ready();
          break;
        case "back": await discard(); break;
        case "option":
          await syncReviews(await call("revise", { lease, id: draft.id, replacement: draft.alternatives[Number(target.dataset.index)] }), false, true);
          break;
        case "edit":
          editing = true;
          panel.querySelector('[data-field="edit"]').value = draft.replacement;
          render();
          panel.querySelector('[data-field="edit"]').focus();
          break;
        case "cancel-edit": editing = false; render(); break;
        case "apply-edit": {
          const text = panel.querySelector('[data-field="edit"]').value.trim();
          if (text === draft.replacement) { editing = false; render(); break; }
          await syncReviews(await call("revise", { lease, id: draft.id, replacement: text }), false, true);
          break;
        }
        case "resend": {
          if (mode() === "batch") { await requestDocument(batch.prompt); break; }
          const { node, start, end, before, revision } = draft;
          const passage = { node, start, end, before, revision };
          if (!stillThere(passage)) throw new Error("The passage changed. Discard this request, then select the passage again.");
          await ask({ ...passage, prompt: draft.prompt, note: draft.note });
          break;
        }
        case "discard":
          if (mode() === "batch") { syncBatch(await call("discard-batch", { lease })); ready(); break; }
          if (draft?.suggestion && mode() === "proposal") {
            const skipped = draft.suggestion;
            await discard(true);
            syncBatch(await call("suggestion-state", { lease, id: skipped, state: "skipped" }));
            await nextSuggestion();
            if (!draft) ready();
            break;
          }
          await discard();
          break;
        case "again": {
          const { node, start, end, before, revision, prompt: asked } = draft;
          await discard(true);
          prompt.value = asked;
          const passage = { node, start, end, before, revision };
          captured = stillThere(passage) ? passage : null;
          render();
          message("Change the instruction, then ask again");
          prompt.focus();
          prompt.select();
          break;
        }
        case "save-note":
          if (draft) {
            await call("review-note", { lease, id: draft.id, note: note.value });
            draft.note = note.value;
            button("save-note").hidden = true;
            message("Note saved", "ok");
          }
          break;
        case "retry": {
          const { record } = await call("retry", { lease, id: accepted });
          message("Already applied at revision " + record.revision + " · current revision " + journal.length, "ok");
          break;
        }
        case "accept":
          if (proposal) {
            button("accept").disabled = true;
            advanceAfter = proposal.suggestion ? proposal.id : null;
            try { await acceptProposal(proposal); } finally { button("accept").disabled = false; }
          }
          break;
        case "view-before": case "view-after":
          if (preview) { preview.view = action.slice(5); paintPreview(); }
          break;
        case "whole":
          if (preview) { preview.whole = !preview.whole; paintPreview(); }
          break;
        case "export": await download(); break;
        case "edition": closeExportMenu(); await chooseReference(); break;
        case "save-file": closeExportMenu(); await saveToFile(); break;
        case "edition-refresh": await loadEdition(); break;
        case "edition-checked":
          await call("edition-checked", { lease, revision: referenceHead });
          await loadEdition();
          toast("This edition is checked against the reference as it is now.");
          break;
        case "edition-ask": await requestDocument(updateInstruction(edition.reference)); break;
        case "merge": {
          closeExportMenu();
          const picker = Object.assign(document.createElement("input"), { type: "file", accept: ".docx" });
          picker.addEventListener("change", () => {
            const [file] = picker.files;
            if (file) void file.arrayBuffer().then(buffer => mergeFromWord(new Uint8Array(buffer), file.name))
              .catch(error => { message(error.message ?? String(error), "problem"); render(); });
          });
          picker.click();
          break;
        }
        case "hide-rules-hint":
          try { localStorage.setItem(hintKey(part("rules-hint").dataset.kind), "true"); } catch { /* The line goes for this opening only. */ }
          part("rules-hint").hidden = true;
          break;
        case "record": {
          const { changeRecord } = await import("/ternleaf/record.mjs");
          downloadFile(changeRecord({ document: name, revision: journal.length, changes: reviewed }), "text/markdown",
            `${name.replace(/\.docx$/i, "")}-changes-r${journal.length}.md`);
          break;
        }
        case "word-evidence":
          if (wordEvidence) downloadFile(JSON.stringify(wordEvidence), "application/json",
            "Ternleaf-word-comparison-r" + wordEvidence.revision + ".json");
          break;
      }
    } catch (error) { if (!blocked) { report(error); render(); } }
  };
  for (const surface of [panel, launcher, bubble, startCard]) {
    surface.addEventListener("click", event => {
      const target = event.target.closest("[data-action]");
      if (target && !target.disabled) void act(target.dataset.action, target);
    });
  }
  // A click elsewhere, or Escape, closes the export menu.
  const closeExportMenu = () => {
    if (part("export-menu").hidden) return;
    part("export-menu").hidden = true;
    button("export-menu").setAttribute("aria-expanded", "false");
  };
  document.addEventListener("pointerdown", event => { if (!event.target.closest?.(".tl-export")) closeExportMenu(); });
  panel.addEventListener("keydown", event => { if (event.key === "Escape") closeExportMenu(); });

  // A click on the bubble must not move the focus out of the document, or
  // the selection that the bubble belongs to could collapse.
  bubble.addEventListener("pointerdown", event => event.preventDefault());
  bubble.addEventListener("mousedown", event => event.preventDefault());
  // Read the selection at once. The watch interval can be a moment behind
  // an author who selects and types quickly.
  prompt.addEventListener("focus", () => { watchSelection(); renderCompose(); });
  prompt.addEventListener("input", () => { watchSelection(); renderCompose(); });
  note.addEventListener("input", () => { if (draft) button("save-note").hidden = note.value === draft.note; });
  prompt.addEventListener("keydown", event => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) watchSelection();
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && !button("request").disabled) {
      event.preventDefault();
      void act("request", button("request"));
    }
  });
  panel.addEventListener("keydown", event => {
    if (event.key === "Escape" && panel.dataset.layout === "overlay") { event.stopPropagation(); setOpen(false); }
    // Typing in the pane must not reach the document's shortcut handlers.
    if (event.target.matches("textarea")) event.stopPropagation();
  });
  panel.querySelector("[role=tablist]").addEventListener("keydown", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const next = panel.dataset.view === "review" ? "history" : "review";
    showView(next);
    panel.querySelector(`[role=tab][data-view="${next}"]`).focus();
  });
  window.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.code === "KeyO") {
      event.preventDefault();
      event.stopPropagation();
      void documents.open();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === "Space") {
      event.preventDefault();
      event.stopPropagation();
      watchSelection();
      setOpen(true, true);
    }
  }, true);
  const viewport = document.querySelector("#viewport");
  viewport?.addEventListener("pointerdown", () => { pointerDown = true; bubble.hidden = true; });
  window.addEventListener("pointerup", () => { pointerDown = false; signature = ""; });
  viewport?.addEventListener("scroll", () => { if (!bubble.hidden) placeBubble(); }, { passive: true });
  setInterval(() => { if (mode() === "waiting" || mode() === "batch") render(); }, 5000);

  // Editor correction. The File page borrows a dialog, for example Document
  // properties, and shows it as a pane. When the author leaves the File page
  // through another ribbon tab, the editor does not give the dialog back, so
  // its header button then opens nothing. Give it back here.
  const filePage = document.querySelector("#panelFile");
  if (filePage) {
    new MutationObserver(async () => {
      if (!filePage.hidden || !filePage.querySelector(".panel-in-page")) return;
      try { (await import("/src/file_pane.mjs")).releaseSettingsPanel?.(); }
      catch { /* An engine without this module keeps its own behaviour. */ }
    }).observe(filePage, { attributes: true, attributeFilter: ["hidden"] });
  }

  window.addEventListener("pagehide", () => {
    clearInterval(heartbeat);
    clearInterval(poll);
    if (lease) void fetch("/api/release", { method: "POST", headers: headers(token),
      body: JSON.stringify({ lease }), keepalive: true }).catch(() => {});
  });
  window.ternleafSession = Object.freeze({
    state: () => ({ head: journal.length, editorial: journal.at(-1)?.editorial.after ?? null }),
    admissionMs: () => admissionMs.slice(),
    // The time of the preview's export check (keptInExport), in ms.
    checkMs: () => checkMs.slice(),
    mode,
  });
  start().catch(error => {
    blocked = true;
    for (const control of startCard.querySelectorAll("button")) control.hidden = false;
    report(error);
    if (lease) void call("release", { lease }).catch(() => {});
  });
}

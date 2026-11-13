import { open as openDoc } from "/pkg/casual_doc_wasm.js";
import { validateDocxExport } from "./export-policy.mjs";
import { reviewChange } from "./review-change.mjs";
import { forAuthor } from "./messages.mjs";
import { captureWordEvidence } from "./word-evidence.mjs";
import { wordCount, wordDiff } from "./diff.mjs";
import { documentActions, layout, quickActions } from "./shell.mjs";

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
  const { panel, launcher, bubble } = layout();
  const workarea = document.querySelector(".workarea") ?? document.body;
  workarea.append(panel, launcher);
  document.body.append(bubble);

  const part = name => panel.querySelector(`[data-part="${name}"]`);
  const button = action => panel.querySelector(`[data-action="${action}"]`);
  const status = panel.querySelector("[role=status]");
  const note = panel.querySelector('[data-field="note"]');
  const prompt = panel.querySelector('[data-field="prompt"]');
  const review = part("proposal");
  const diagnostics = panel.querySelector("output");
  const message = (text, tone = "") => { status.textContent = text; status.dataset.tone = tone; };

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

  const updateDiagnostics = () => {
    const last = admissionMs.at(-1);
    diagnostics.textContent = `Saved revision ${journal.length}` + (last === undefined ? "" :
      ` · last admission ${last.toFixed(1)} ms · ${admissionMs.length} samples this opening`);
  };
  const ready = () => message(journal.length ? "Saved at revision " + journal.length : "Saved at revision 0", "ok");
  const report = error => {
    button("reload").hidden = !blocked;
    panel.dataset.blocked = String(blocked);
    if (blocked) setOpen(true);
    message(error.message ?? String(error), "problem");
  };

  function postSync(path, data) {
    const req = new XMLHttpRequest();
    req.open("POST", "/api/" + path, false);
    for (const [key, value] of Object.entries(headers(token))) req.setRequestHeader(key, value);
    try { req.send(JSON.stringify(data)); }
    catch { blocked = true; throw new Error("Connection lost. Reload to recover the last saved revision."); }
    if (req.status !== 200) {
      if (req.status >= 500 || req.status === 0) blocked = true;
      const code = JSON.parse(req.responseText || "{}").error;
      throw new Error(code ? forAuthor(code) : "Publication uncertain. Reload to recover.");
    }
    try { return JSON.parse(req.responseText); }
    catch { blocked = true; throw new Error("Publication response could not be read. Reload to recover."); }
  }

  async function call(path, data) {
    const response = await fetch("/api/" + path, { method: "POST", headers: headers(token), body: JSON.stringify(data) });
    const value = await response.json();
    if (!response.ok) throw Object.assign(new Error(forAuthor(value.error)), { code: value.error });
    return value;
  }

  function renderState(record) {
    if (record.editorial.before?.note !== record.editorial.after?.note) {
      note.value = record.editorial.after?.note ?? "";
    }
    if (record.id === draft?.id) {
      accepted = record.id;
      draft = undefined;
      proposal = undefined;
      dropPreview();
      void call("history", { lease }).then(state => { reviewed = state.accepted; renderHistory(); render(); }).catch(() => {});
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
  window.ternleafValidateExport = (targetFormat, exportReport) => {
    if (targetFormat !== format) throw new Error("This project supports DOCX export");
    return validateDocxExport(exportReport);
  };

  async function start() {
    await new Promise(resolve => {
      const check = () => document.querySelector("#file")?.disabled ? setTimeout(check, 50) : resolve();
      check();
    });
    const state = await call("claim", { previous: JSON.parse(sessionStorage.getItem(leaseKey) ?? "null") });
    lease = state.lease;
    sessionStorage.setItem(leaseKey, JSON.stringify(lease));
    fontHash = state.fontHash;
    captureWordComparison = state.captureWordComparison;
    journal = state.journal;
    reviewed = state.accepted ?? [];
    name = state.name ?? name;
    part("name").textContent = name;
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
    if (!doc) throw new Error("OpenDoc could not open the source");
    for (const font of fonts) doc.registerFont(font);
    for (const record of journal) doc.replayDurableFrame(JSON.stringify(record.frame));
    await editor.renderAll();
    doc.enableDurableAdmission();
    globalThis.ternleafProjectAttached = true;
    document.querySelector("#file").disabled = true;
    note.value = state.editorial?.note ?? "";
    updateDiagnostics();
    ready();
    panel.dataset.ready = "true";
    await syncReviews(state.reviews, true);
    syncBatch(state.suggestions ?? { batch: null, suggestions: [] }, true);
    if (draft || batch) setOpen(true);
    render();
    renderHistory();
    heartbeat = setInterval(() => call("renew", { lease }).catch(error => { blocked = true; report(error); }), 5000);
    poll = setInterval(() => {
      if (!blocked && draft && draft.replacement === null && !draft.declined) {
        void call("reviews", { lease }).then(syncReviews).catch(report);
      }
      if (!blocked && !draft && batch?.state === "waiting") {
        void call("suggestions", { lease }).then(syncBatch).catch(report);
      }
    }, 800);
    setInterval(watchSelection, 200);
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
  function checkReviewRun(node, change) {
    const doc = editor.doc;
    const length = doc.paragraphLength(node);
    const runs = JSON.parse(doc.copyRichRuns(node, 0, node, length));
    let end = 0;
    let supported = false;
    for (const run of runs) {
      const start = end;
      end += bytes(run.text);
      if (!run.href && !/[\r\n\t￼]/.test(run.text)
        && change.start >= start && change.end <= end && change.end - change.start < end - start) supported = true;
    }
    if (!supported || end !== length) {
      throw new Error("This change crosses a formatting boundary. Ternleaf can apply a change inside one run of text with the same formatting. Discard it, then select a smaller passage.");
    }
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
      } catch (error) { proposal = undefined; problem = error.message ?? String(error); report(error); }
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
      throw new Error("The document changed after this proposal. Discard it, then ask again.");
    }
    const { node, start, end, before } = candidate;
    if (editor.doc.copyText(node, start, node, end) !== before) throw new Error("The passage changed after this proposal. Discard it, then ask again.");
    const change = reviewChange(candidate);
    checkReviewRun(node, change);
    const next = { view: "after", whole: false };
    const sample = openDoc(source);
    try {
      for (const font of fonts) sample.registerFont(font);
      for (const record of journal) sample.replayDurableFrame(JSON.stringify(record.frame));
      const [beforePage = 1] = editor.doc.caretRect(node, change.start);
      const beforeCanvas = renderPageCanvas(editor.doc, beforePage);
      next.before = { canvas: beforeCanvas,
        focus: mark(beforeCanvas, editor.doc, node, change.start, change.end, beforePage, "#f7c6c0") };
      const result = sample.replaceSelection(node, change.start, node, change.end, change.inserted);
      try { if (result.revision !== candidate.revision + 1) throw new Error("The selected range cannot be edited"); }
      finally { result.free(); }
      const [afterPage = 1] = sample.caretRect(node, change.start);
      const afterCanvas = renderPageCanvas(sample, afterPage);
      next.after = { canvas: afterCanvas,
        focus: mark(afterCanvas, sample, node, change.start, change.start + bytes(change.inserted), afterPage, "#b9e6cf") };
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
      throw new Error("The proposal is stale");
    }
    if (pending) throw new Error("Another edit is being accepted");
    await call("review-note", { lease, id, note: authoredNote });
    if (pending || revision !== journal.length) throw new Error("The proposal is stale");
    const change = reviewChange(candidate);
    checkReviewRun(node, change);
    pending = { id, fingerprint, editorial, reviewId: id };
    let result;
    try { result = editor.doc.replaceSelection(node, change.start, node, change.end, change.inserted); }
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

  function syncBatch(state, opening = false) {
    const answered = batch?.state === "waiting" && state.batch?.state !== "waiting";
    batch = state.batch;
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
  function locate(suggestion) {
    const { node, find, replacement } = suggestion;
    let text;
    try { text = editor.doc.copyText(node, 0, node, editor.doc.paragraphLength(node)); }
    catch { return { reason: "The paragraph is no longer in the document." }; }
    const at = text.indexOf(find);
    if (at < 0) return { reason: "The text changed after Copilot read it." };
    if (text.indexOf(find, at + 1) >= 0) return { reason: "The text occurs more than once in the paragraph." };
    const start = bytes(text.slice(0, at));
    const passage = { node, start, end: start + bytes(find), before: find, revision: journal.length };
    try { checkReviewRun(node, reviewChange({ ...passage, replacement })); }
    catch { return { reason: "The change crosses a formatting boundary." }; }
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
      const next = suggestions.find(item => item.state === "open" && locate(item).passage);
      if (next) await adopt(next);
      else if (suggestions.length) message("All suggestions reviewed", "ok");
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
      part("passage-meta").textContent = hint ? hint + "." : "Select a passage in the document.";
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
    for (const chip of part("chips-selection").querySelectorAll("[data-quick]")) chip.disabled = !has || busy;
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
    const open = suggestions.filter(item => item.state === "open").length;
    part("queue-title").textContent = batch.state === "declined" ? "Copilot suggested no changes"
      : open ? `${open} ${open === 1 ? "suggestion" : "suggestions"} to review` : "All suggestions reviewed";
    part("queue-prompt").textContent = batch.prompt;
    part("queue-reason").hidden = batch.state !== "declined";
    part("queue-reason").textContent = batch.reason ?? "";
    part("queue-list").replaceChildren(...suggestions.map(item => {
      const row = document.createElement("li");
      row.dataset.state = item.state;
      const slip = document.createElement("p");
      slip.className = "tl-slip tl-slip-small";
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

  const ago = at => {
    const seconds = Math.round((Date.now() - at) / 1000);
    if (seconds < 60) return "just now";
    const steps = [[60, "minute"], [60, "hour"], [24, "day"]];
    let value = seconds;
    let unit = "second";
    for (const [size, nameOfUnit] of steps) {
      if (value < size) break;
      value = Math.floor(value / size);
      unit = nameOfUnit;
    }
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-value, unit);
  };

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
      try { sessionStorage.setItem(openKey, String(open)); } catch { /* Storage can be unavailable. */ }
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
  try { stored = sessionStorage.getItem(openKey); } catch { /* Use the default. */ }
  setOpen(stored === null ? !narrow() : stored === "true");
  showView("review");
  // The compact toolbar leaves more room for the page in a narrow canvas.
  if (narrow() && document.documentElement.dataset.chrome === "ribbon") {
    document.querySelector('[data-chrome-mode="compact"]')?.click();
  }

  function downloadFile(content, type, fileName) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function download() {
    const doc = editor.doc;
    if (captureWordComparison) {
      wordEvidence = undefined;
      button("word-evidence").hidden = true;
    }
    const output = doc.exportAs(format, journal.length ? "preserve_when_safe" : "exact_if_unchanged");
    try {
      const findings = validateDocxExport(output.reportJson);
      const content = output.bytes;
      const stem = name.replace(/\.docx$/i, "");
      downloadFile(content, output.mimeType, journal.length ? `${stem}-r${journal.length}.docx` : `${stem}.docx`);
      message(findings.length ? `Exported revision ${journal.length} with ${findings.length} bookkeeping findings`
        : `Exported revision ${journal.length}`, "ok");
      if (captureWordComparison) {
        wordEvidence = await captureWordEvidence(doc, content, journal.length);
        button("word-evidence").hidden = false;
      }
    } finally { output.free(); }
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
        case "word-evidence":
          if (wordEvidence) downloadFile(JSON.stringify(wordEvidence), "application/json",
            "Ternleaf-word-comparison-r" + wordEvidence.revision + ".json");
          break;
      }
    } catch (error) { if (!blocked) { report(error); render(); } }
  };
  for (const surface of [panel, launcher, bubble]) {
    surface.addEventListener("click", event => {
      const target = event.target.closest("[data-action]");
      if (target && !target.disabled) void act(target.dataset.action, target);
    });
  }
  // A click on the bubble must not move the focus out of the document, or
  // the selection that the bubble belongs to could collapse.
  bubble.addEventListener("pointerdown", event => event.preventDefault());
  bubble.addEventListener("mousedown", event => event.preventDefault());
  prompt.addEventListener("input", renderCompose);
  note.addEventListener("input", () => { if (draft) button("save-note").hidden = note.value === draft.note; });
  prompt.addEventListener("keydown", event => {
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
    mode,
  });
  start().catch(error => {
    blocked = true;
    report(error);
    if (lease) void call("release", { lease }).catch(() => {});
  });
}

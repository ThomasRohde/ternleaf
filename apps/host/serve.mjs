import { createServer } from "node:http";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, statSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { basename, dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ProjectStore, Rejected } from "../../packages/session/store.mjs";
import { changeLog as changeLogText, changeRecord, commitMessage, textCopy as textCopyText } from "../../packages/session/record.mjs";
import { clearSave, commitSave, finishSave, isDocx, prepareSave, sameFile, settleSave } from "../../packages/session/save.mjs";
import { ProjectError } from "./project.mjs";

const mime = { ".mjs": "text/javascript", ".js": "text/javascript", ".html": "text/html",
  ".json": "application/json", ".wasm": "application/wasm", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".ttf": "font/ttf" };
// The identifier of a history: the first characters of the identity of its
// project file. Each save to the file and each restart makes a new one.
const historyOf = uuid => String(uuid).replace(/-/g, "").slice(0, 10);
const historyId = store => historyOf(store.documentId());
const editorAssets = fileURLToPath(new URL("../editor/", import.meta.url));
const sessionAssets = fileURLToPath(new URL("../../packages/session/", import.meta.url));

function json(res, status, value) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(value));
}

async function raw(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Rejected("request-too-large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function body(req, limit = 8 * 1024 * 1024) {
  try { return JSON.parse((await raw(req, limit)).toString("utf8")); }
  catch (error) {
    if (error instanceof Rejected) throw error;
    throw new Rejected("invalid-json");
  }
}

function staticFile(res, root, path, noStore = false) {
  const file = resolve(root, "." + path);
  if (!file.startsWith(root + sep)) return false;
  // The prebuilt engine stores its WebAssembly module compressed, to keep
  // the repository small. The browser inflates it.
  let physical;
  let encoded = false;
  for (const candidate of [file, file + ".gz"]) {
    try {
      const found = realpathSync(candidate);
      if (!found.startsWith(root + sep) || !statSync(found).isFile()) continue;
      physical = found;
      encoded = candidate !== file;
      break;
    } catch { /* Try the compressed form. */ }
  }
  if (!physical) return false;
  res.writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream",
    ...(encoded ? { "Content-Encoding": "gzip" } : {}),
    ...(noStore ? { "Cache-Control": "no-store" } : {}) });
  createReadStream(physical).pipe(res);
  return true;
}

// One host serves one canvas. It holds one open document at a time. With a
// `workspace` (see project.mjs), the author can open another document of the
// project, make a new one or add a copy of a file: the host then closes the
// project file of the first document and opens that of the second, and the
// editor reloads. Without a workspace, the host serves `source` and `state`.
export async function startHost({ source, state, engine, font, fonts = font ? [font] : [], port = 0,
  askAgent, loseProposalReplyOnce = false, captureWordComparison = false, workspace, restart = false,
  onDocument, chat = true, textCopy = true, changeLog = true }) {
  const root = realpathSync(engine);
  const ui = realpathSync(editorAssets);
  const fontBytes = fonts.map(path => readFileSync(path));
  let store, sourceBytes, name, current, currentState, opened = false;
  // Counts the documents this host has served. The editor sends the number
  // with each call, so a page that still shows an earlier document reloads.
  let epoch = 0;
  let lease;
  // Set when the agent finished a turn and the newest request has no answer.
  let unanswered;
  // The document text the author shared for the current whole-document
  // request. It stays in memory and is replaced by the next request.
  let shared;

  // ---- Copilot's side of the canvas ------------------------------------
  // The document lives in the editor: only the engine there knows its text
  // and its pages. The editor reports a few facts with each pulse, and it
  // does the jobs that the host queues for it: read, page and export.
  let live;                 // What the editor last reported, with the time.
  let stamp = 0;            // Counts changes that began in the chat.
  let snapshot;             // The text Copilot last read: { revision, paragraphs }.
  let answered = new Map(); // The changes of the reference that Copilot last read: id to paragraph.
  const jobs = new Map();
  const notices = [];       // Lines for the author about what Copilot took.
  const events = [];        // The author's decisions since Copilot last asked.
  const present = () => Boolean(lease && live && Date.now() - live.at < 6000);
  const note = event => { events.push(event); if (events.length > 20) events.shift(); };

  function editorJob(kind, params = {}, wait = 15_000) {
    if (!chat) throw new Rejected("chat-access-off");
    if (!present()) throw new Rejected("canvas-not-ready");
    return new Promise((accept, reject) => {
      const id = randomUUID();
      const timer = setTimeout(() => { jobs.delete(id); reject(new Rejected("canvas-timeout")); }, wait);
      jobs.set(id, { kind, params, accept, reject, timer });
    });
  }

  function dropJobs(code) {
    for (const [id, job] of jobs) { clearTimeout(job.timer); job.reject(new Rejected(code)); jobs.delete(id); }
  }

  // The house rules as Copilot reads them: the file and its text.
  const readable = found => found ? { path: found.path, text: found.text } : null;
  const rulesForEditor = () => { const found = workspace?.rules(); return found ? { path: found.path, checks: found.checks } : null; };
  const validParagraphs = list => Array.isArray(list) ? list.filter(item => Array.isArray(item)
    && /^[a-f0-9]{32}$/.test(item[0]) && typeof item[1] === "string" && item[1].trim()) : [];

  // Sort suggestions into those the author can review and those that do not
  // match the text. The refused ones go back to the agent with the reason.
  // Each item is checked here against the rules of the store
  // (submitSuggestions), so that one bad item cannot fail the whole list.
  function itemProblem(item, paragraph) {
    const text = value => typeof value === "string";
    if (!paragraph) return "unknown paragraph number";
    if (!text(item.find) || !item.find) return "give the find text, copied from the paragraph";
    if (/[\t\r\n]/.test(item.find)) return "the find text has a tab or a line break. A change cannot cross it. Give the text before or after it";
    if (item.find.includes("\uFFFC")) return "the find text has an object, such as a picture or a note reference. A change cannot cross it. Give the text before or after it";
    if (!paragraph[1].includes(item.find)) return "the find text is not in that paragraph";
    if (paragraph[1].indexOf(item.find) !== paragraph[1].lastIndexOf(item.find)) return "the find text occurs more than once; give a longer find text";
    if (item.rationale !== undefined && (!text(item.rationale) || item.rationale.length > 600)) return "give a rationale of at most 600 characters";
    if (item.remark !== undefined) {
      if (item.replacement !== undefined) return "give a replacement or a remark, not both";
      if (!text(item.remark) || !item.remark.trim() || item.remark.length > 600) return "give a remark of 1 to 600 characters";
      return null;
    }
    if (!text(item.replacement)) return "give a replacement text, or a remark";
    if (item.replacement === item.find) return "the replacement is the same as the find text";
    if (item.replacement.length > 4000) return "the replacement is longer than 4,000 characters; split the change";
    if (/[\t\r]/.test(item.replacement)) return "the replacement has a tab. Ternleaf cannot write a tab. Give the text without it";
    if (item.replacement.includes("\uFFFC")) return "the replacement has an object character. Give plain text";
    if (item.replacement.split("\n").length > 31) return "the replacement has more than 30 line breaks; split the change";
    return null;
  }
  function sortSuggestions(paragraphs, list) {
    const kept = [];
    const refused = [];
    for (const [index, item] of (Array.isArray(list) ? list : []).entries()) {
      const paragraph = paragraphs[item?.paragraph - 1];
      const answers = item?.answers === undefined ? undefined : answered.get(item.answers);
      const reason = !item || typeof item !== "object" ? "give an object with a paragraph, a find text and a replacement or a remark"
        : index >= 60 ? "a list has at most 60 items; send the rest after the author reviewed these"
        : item.answers !== undefined && answers === undefined ? "answers names no change of the last ternleaf_reference_changes result; call it again and copy the id"
        : itemProblem(item, paragraph);
      if (reason) refused.push({ suggestion: index + 1, reason });
      else if (typeof item.remark === "string") kept.push({ node: paragraph[0], find: item.find, remark: item.remark, position: index + 1 });
      else kept.push({ node: paragraph[0], find: item.find, replacement: item.replacement, rationale: item.rationale,
        ...(answers ? { answers } : {}), position: index + 1 });
      if (!reason && item.given) kept.at(-1).given = item.given;
    }
    if (!kept.length) throw refusedAll(refused);
    return { kept, refused };
  }
  const refusedAll = refused => new Rejected("invalid-suggestions", refused.length
    ? "Refused: " + refused.slice(0, 5).map(item => `suggestion ${item.suggestion}, ${item.reason.replace(/\.$/, "")}`).join("; ") + "."
    : undefined);

  // Try each change on the document in the canvas, with the checks of the
  // Review pane, so that Copilot hears at once about a change that the
  // author could not accept, as ternleaf_measure does. Such a change is not
  // shown to the author. Without the canvas, the author sees the reason in
  // the Review pane instead.
  async function checkInCanvas(kept, refused) {
    const changes = kept.filter(item => typeof item.remark !== "string");
    if (!changes.length || !chat || !present()) return kept;
    let result;
    try { result = await editorJob("check", { changes: changes.map(({ node, find, replacement }) => ({ node, find, replacement })) }, 10_000); }
    catch { return kept; }
    const out = new Set();
    for (const { index, reason } of Array.isArray(result?.blocked) ? result.blocked : []) {
      const item = changes[index];
      if (!item || out.has(item)) continue;
      out.add(item);
      refused.push({ suggestion: item.position, reason: "cannot be applied: " + String(reason).slice(0, 300) });
    }
    refused.sort((a, b) => a.suggestion - b.suggestion);
    const left = kept.filter(item => !out.has(item));
    if (!left.length) throw refusedAll(refused);
    return left;
  }

  // A proposal from the chat must not take the place of work that the author
  // has not finished in the canvas.
  function checkFree() {
    if (!chat) throw new Rejected("chat-access-off");
    if (!present()) throw new Rejected("canvas-not-ready");
    const { draft } = store.reviewState(lease);
    const { batch, suggestions: list } = store.batchState(lease);
    const head = Number(store.project().head);
    if (draft && !draft.declined && draft.revision === head) {
      if (draft.replacement !== null) throw new Rejected("review-in-progress");
      if (draft.fence === lease.fence) throw new Rejected("request-waiting", `Its requestId is ${draft.id}.`);
    }
    if (batch?.state === "waiting" && batch.fence === lease.fence && shared?.id === batch.id) {
      throw new Rejected("request-waiting", `Its requestId is ${batch.id}.`);
    }
    if (list.some(item => item.state === "open")) throw new Rejected("review-in-progress");
  }

  function remember() {
    if (!workspace || !opened || !store) return;
    try { workspace.remember(current, Number(store.project().head)); } catch { /* A convenience only. */ }
  }

  // Open the project file of a document. `restart` begins a new history when
  // the .docx changed since its project file was made. The earlier project
  // file moves to .ternleaf/archive.
  function load(settings, { restart = false } = {}) {
    // A save to the file that a crash stopped is finished or undone first.
    // A finished save needs the new history that the save would have made.
    if (settleSave(settings) === "committed") restart = true;
    const bytes = readFileSync(settings.source);
    mkdirSync(dirname(resolve(settings.state)), { recursive: true });
    let next = new ProjectStore(settings.state, { leaseMs: 15_000 });
    try { next.initialize(bytes); }
    catch (error) {
      next.close();
      if (!(error instanceof Rejected) || error.code !== "source-already-set" || !restart) throw error;
      const archive = resolve(dirname(resolve(settings.state)), "archive");
      mkdirSync(archive, { recursive: true });
      // Two saves can come in the same second. An archived file is never
      // replaced, so the name gets a number when it is taken.
      let stamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 18);
      for (let attempt = 2; existsSync(resolve(archive, `${stamp}-${basename(settings.state)}`)); attempt++) {
        stamp = stamp.replace(/-\d+$/, "") + "-" + attempt;
      }
      for (const suffix of ["", "-wal", "-shm"]) {
        if (existsSync(settings.state + suffix)) {
          renameSync(settings.state + suffix, resolve(archive, `${stamp}-${basename(settings.state)}${suffix}`));
        }
      }
      next = new ProjectStore(settings.state, { leaseMs: 15_000 });
      try { next.initialize(bytes); } catch (again) { next.close(); throw again; }
    }
    if (store) {
      remember();
      if (lease) store.release(lease);
      store.close();
    }
    store = next;
    clearSave(settings);
    sourceBytes = bytes;
    name = basename(settings.source);
    current = settings.source;
    currentState = settings.state;
    opened = false;
    lease = shared = unanswered = live = snapshot = undefined;
    answered = new Map();
    events.length = 0;
    dropJobs("document-changed");
    epoch += 1;
    if (epoch > 1) { try { onDocument?.(name); } catch { /* The title is a convenience. */ } }
  }
  load({ source, state }, { restart });

  // The archived histories of the open document, oldest first, from the one
  // with the identifier `history` to the newest. Each later history started
  // from the file that the one before it saved, or from a file that changed
  // on disk; the editor checks which. An empty list: no such history.
  function archivedHistories(history) {
    if (!/^[a-f0-9]{10}$/.test(history)) return [];
    const archive = resolve(dirname(resolve(currentState)), "archive");
    const own = "-" + basename(currentState);
    let files = [];
    try { files = readdirSync(archive).filter(file => file.endsWith(own)); } catch { return []; }
    // The name starts with the time of the archive. A second archive in the
    // same time has "-2", "-3" after the time.
    const order = file => { const [, time, attempt] = /^(\d{8}T\d+)(?:-(\d+))?-/.exec(file) ?? [, file, 1]; return [time, Number(attempt ?? 1)]; };
    files.sort((a, b) => { const [x, y] = [order(a), order(b)]; return x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : x[1] - y[1]; });
    const histories = [];
    for (const file of files) {
      let db;
      try {
        db = new DatabaseSync(resolve(archive, file), { readOnly: true });
        const project = db.prepare("SELECT source FROM project").get();
        const identity = db.prepare("SELECT uuid FROM document_identity").get();
        if (!project || !identity) continue;
        const id = historyOf(identity.uuid);
        if (!histories.length && id !== history) continue;
        histories.push({ history: id, source: Buffer.from(project.source).toString("base64"),
          frames: db.prepare("SELECT record FROM commits ORDER BY revision").all().map(row => JSON.parse(row.record).frame) });
      } catch { /* A damaged archive is not a base. */ }
      finally { db?.close(); }
    }
    return histories;
  }

  // ---- Save to the file ---------------------------------------------------
  // The author asks Ternleaf to write the current revision into the .docx
  // file. The project file then goes to the archive, and a new history
  // starts from the saved file. packages/session/save.mjs says why the
  // steps come in this order.
  const saveOptions = () => {
    let found = { textCopy, changeLog };
    if (workspace) {
      try { found = workspace.resolve(current); } catch { /* Keep the options of the host. */ }
    }
    return { textCopy: found.textCopy !== false, changeLog: found.changeLog !== false };
  };
  function saveToFile(data) {
    store.checkLease(data.lease);
    const project = store.project();
    const head = Number(project.head);
    if (data.revision !== head) throw new Rejected("stale-revision");
    const waiting = store.batchState(data.lease);
    if (store.reviewState(data.lease).draft?.replacement != null
      || waiting.suggestions.some(item => item.state === "open") || waiting.batch?.state === "waiting") {
      throw new Rejected("review-in-progress");
    }
    const bytes = typeof data.bytes === "string" ? new Uint8Array(Buffer.from(data.bytes, "base64")) : null;
    if (!isDocx(bytes)) throw new Rejected("not-a-docx");
    if (typeof data.markdown !== "string") throw new Rejected("invalid-request");
    // The author, Word or git may have changed the file since Ternleaf
    // opened it. That change must not be lost under this save.
    if (!sameFile(current, project.source_hash)) throw new Rejected("file-changed-on-disk");

    const options = saveOptions();
    const changes = store.acceptedReviews(data.lease);
    const document = workspace ? workspace.key(current) : name;
    const files = [];
    if (options.textCopy) files.push({ path: current + ".md", text: textCopyText(name, data.markdown) });
    if (options.changeLog) {
      const path = current + ".changes.md";
      let existing = "";
      try { existing = readFileSync(path, "utf8"); } catch { /* The first save makes the log. */ }
      files.push({ path, text: changeLogText({ document: name, existing, revision: head, changes }) });
    }
    const settings = { source: current, state: currentState };
    try {
      prepareSave({ ...settings, bytes, files });
      commitSave(settings);
    } catch (error) {
      throw new ProjectError(`Ternleaf could not write ${name} (${error.code ?? error.message}). If the file is open in Word, close it there and save again. Nothing changed.`);
    }
    // The .docx has the new text now. What follows can run again after a
    // crash: load() finishes a save that it finds in progress.
    finishSave(settings);
    remember();
    if (lease) store.release(lease);
    store.close();
    store = undefined;
    try { load(settings, { restart: true }); }
    catch (error) {
      console.error(error?.message ?? error);
      throw new ProjectError(`${name} has the new text, but Ternleaf could not start its new history. Reload the canvas. Ternleaf finishes the save when it opens the document.`);
    }
    // An edition counts the revisions of its reference. The reference now
    // starts again at revision 0, and an edition keeps, as text, the
    // passages that the author did not check yet (see restartEditionsOf).
    try { workspace?.restartEditionsOf?.(current, { head, carried: data.editions, renamed: data.renamed }); } catch { /* The editions file is a convenience. */ }
    const at = path => workspace ? workspace.key(path) : basename(path);
    return { document, revisions: head, acceptedChanges: changes.length,
      textCopy: options.textCopy ? at(current + ".md") : null,
      changeLog: options.changeLog ? at(current + ".changes.md") : null,
      commitMessage: commitMessage({ document, revision: head, changes }) };
  }
  const token = randomBytes(32).toString("hex");
  const secret = Buffer.from("Bearer " + token);
  const fontHashes = fontBytes.map(bytes => createHash("sha256").update(bytes).digest("hex"));
  const fontHash = fontHashes.length > 1
    ? createHash("sha256").update(JSON.stringify(fontHashes)).digest("hex")
    : fontHashes[0] ?? null;
  const session = randomUUID();

  const server = createServer(async (req, res) => {
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "connect-src 'self'; font-src 'self' data:; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'");
    const origin = `http://127.0.0.1:${server.address().port}`;
    if (req.headers.host !== new URL(origin).host) return json(res, 403, { error: "host" });
    let path;
    try { path = decodeURIComponent(new URL(req.url, origin).pathname); }
    catch { return json(res, 400, { error: "path" }); }
    try {
      if (path.startsWith("/api/")) {
        const supplied = Buffer.from(req.headers.authorization ?? "");
        if (supplied.length !== secret.length || !timingSafeEqual(supplied, secret)
          || (req.headers.origin && req.headers.origin !== origin)) {
          return json(res, 403, { error: "authorization" });
        }
        if (req.method === "GET" && path === "/api/source") {
          res.writeHead(200, { "Content-Type": "application/octet-stream", "Cache-Control": "no-store" });
          return res.end(sourceBytes);
        }
        const fontIndex = /^\/api\/font\/(\d+)$/.exec(path);
        if (req.method === "GET" && fontIndex) {
          const bytes = fontBytes[Number(fontIndex[1])];
          if (!bytes) return json(res, 404, { error: "font-unavailable" });
          res.writeHead(200, { "Content-Type": "application/octet-stream", "Cache-Control": "no-store" });
          return res.end(bytes);
        }
        if (req.method !== "POST") return json(res, 405, { error: "method" });
        if (path === "/api/import") {
          // A copy of a file from the author's computer becomes a document
          // of the project. The bytes are the request body.
          if (!workspace) return json(res, 409, { error: "single-document" });
          const bytes = new Uint8Array(await raw(req, 64 * 1024 * 1024));
          let title;
          try { title = decodeURIComponent(String(req.headers["x-ternleaf-name"] ?? "")); }
          catch { title = ""; }
          load(workspace.resolve(workspace.create({ name: title, folder: "documents", bytes })));
          return json(res, 200, { name });
        }
        const data = await body(req, path === "/api/job" ? 96 * 1024 * 1024 : path === "/api/save-file" ? 160 * 1024 * 1024 : undefined);
        const sent = req.headers["x-ternleaf-epoch"];
        if (sent !== undefined && Number(sent) !== epoch) return json(res, 409, { error: "document-changed" });
        switch (path) {
          case "/api/documents":
            if (!workspace) return json(res, 200, { current: null, documents: [], folders: [], single: true });
            return json(res, 200, { current: workspace.key(current), ...workspace.documents() });
          case "/api/open":
            if (!workspace) return json(res, 409, { error: "single-document" });
            load(workspace.resolve(data.path), { restart: data.restart === true });
            return json(res, 200, { name });
          case "/api/new": {
            if (!workspace) return json(res, 409, { error: "single-document" });
            if (typeof data.bytes !== "string") throw new Rejected("invalid-request");
            const bytes = new Uint8Array(Buffer.from(data.bytes, "base64"));
            load(workspace.resolve(workspace.create({ name: data.name, folder: data.folder ?? "", bytes })));
            return json(res, 200, { name });
          }
          case "/api/opened":
            // The editor showed the document. Only now is it worth returning to.
            store.checkLease(data.lease);
            opened = true;
            remember();
            return json(res, 200, {});
          case "/api/claim": {
            const claimed = store.claim(data.previous);
            lease = claimed.lease;
            return json(res, 200, { ...claimed, name, epoch, workspace: Boolean(workspace),
              fontHash, fontCount: fontBytes.length,
              captureWordComparison, reviews: reviews(lease), accepted: store.acceptedReviews(lease), rules: rulesForEditor(),
              rulesExample: workspace?.rulesExample ?? null, saveFile: saveOptions(), history: historyId(store),
              suggestions: suggestions(lease) });
          }
          case "/api/pulse": {
            // The editor reports what Copilot may ask about without a job,
            // and collects the jobs that wait for it.
            store.checkLease(data.lease);
            const told = data.live ?? {};
            const picked = told.selection;
            live = { at: Date.now(), revision: Number(told.revision) || 0,
              pages: Number(told.pages) || null, words: Number(told.words) || null,
              suggesting: told.suggesting === true,
              // The house rule checks that fail now, as the editor found them.
              failing: (Array.isArray(told.failing) ? told.failing : []).slice(0, 12).map(line => String(line).slice(0, 300)),
              // How many passages of the reference changed since the author
              // last checked this edition. Null when the editor has not looked.
              referenceChanges: Number.isSafeInteger(told.referenceChanges) ? told.referenceChanges : null,
              selection: picked && /^[a-f0-9]{32}$/.test(picked.node) && Number.isSafeInteger(picked.start)
                && Number.isSafeInteger(picked.end) && typeof picked.before === "string" && picked.before.length <= 4000
                && Number.isSafeInteger(picked.revision)
                ? { node: picked.node, start: picked.start, end: picked.end, before: picked.before, revision: picked.revision }
                : null };
            return json(res, 200, { stamp, notices: notices.splice(0), rules: workspace?.rules()?.stamp ?? null,
              jobs: [...jobs].map(([id, job]) => ({ id, kind: job.kind, ...job.params })) });
          }
          case "/api/job": {
            store.checkLease(data.lease);
            const job = jobs.get(data.id);
            if (job) {
              jobs.delete(data.id);
              clearTimeout(job.timer);
              if (data.error) job.reject(new Rejected(String(data.error).slice(0, 60), typeof data.detail === "string" ? data.detail.slice(0, 400) : undefined));
              else job.accept(data.result ?? {});
            }
            return json(res, 200, {});
          }
          case "/api/renew": store.renew(data.lease); return json(res, 200, {});
          case "/api/save-file": return json(res, 200, saveToFile(data));
          case "/api/release": store.release(data.lease); return json(res, 200, {});
          case "/api/commit": {
            const result = store.publish(data.lease, data.request, undefined, fontHash);
            if (data.request.reviewId && !result.duplicate) {
              const { before, replacement } = store.review(data.request.reviewId);
              note({ decision: "accepted", revision: result.record.revision, before, replacement });
              // The author accepted a change that answers a change of the
              // reference: the two paragraphs are linked from now on.
              const link = store.answeredReference(data.request.reviewId);
              if (link) { try { workspace?.linkEdition(current, link.reference, link.node); } catch { /* The editions file is a convenience. */ } }
            }
            if (loseProposalReplyOnce && data.request.reviewId && !result.duplicate) {
              loseProposalReplyOnce = false;
              return res.destroy();
            }
            return json(res, 200, result);
          }
          case "/api/reviews": return json(res, 200, reviews(data.lease));
          case "/api/discard": {
            const { draft } = store.reviewState(data.lease);
            if (draft && draft.replacement !== null) note({ decision: "discarded", before: draft.before, replacement: draft.replacement });
            return json(res, 200, { discarded: store.discardReviews(data.lease) });
          }
          case "/api/revise":
            store.reviseReview(data.lease, data.id, data.replacement);
            return json(res, 200, reviews(data.lease));
          case "/api/review-document": {
            if (!askAgent) return json(res, 409, { error: "live-agent-unavailable" });
            const paragraphs = validParagraphs(data.paragraphs);
            if (!paragraphs.length) throw new Rejected("empty-document");
            const batch = store.createBatch(data.lease, session, data);
            shared = { id: batch.id, prompt: data.prompt, paragraphs };
            unanswered = undefined;
            try { await askAgent(batch.id, "document"); }
            catch (error) {
              console.error(error?.message ?? error);
              return json(res, 502, { error: "agent-unreachable", id: batch.id });
            }
            return json(res, 202, { id: batch.id });
          }
          case "/api/suggestions": return json(res, 200, suggestions(data.lease));
          case "/api/suggestion-state":
            store.setSuggestionState(data.lease, data.id, data.state);
            return json(res, 200, suggestions(data.lease));
          case "/api/adopt":
            store.adoptSuggestion(data.lease, session, fontHash, data.id, data.scope);
            return json(res, 200, reviews(data.lease));
          case "/api/edition": {
            // Is this document an edition of another one, and which
            // documents could be its reference?
            store.checkLease(data.lease);
            const mine = workspace?.key(current);
            return json(res, 200, { edition: workspace?.edition(current) ?? null,
              candidates: (workspace?.documents().documents ?? []).map(item => item.path).filter(path => path !== mine).slice(0, 200) });
          }
          case "/api/edition-set": {
            store.checkLease(data.lease);
            if (!workspace) throw new Rejected("single-document");
            if (data.reference === null) return json(res, 200, { edition: workspace.setEdition(current, null) });
            // A new edition starts as checked against the reference as it is now.
            const head = workspace.referenceState(data.reference).frames.length;
            return json(res, 200, { edition: workspace.setEdition(current, data.reference, head) });
          }
          case "/api/edition-checked": {
            store.checkLease(data.lease);
            const record = workspace?.edition(current);
            if (!record || !Number.isSafeInteger(data.revision) || data.revision < 0) throw new Rejected("invalid-request");
            note({ decision: "checked", reference: record.reference, revision: data.revision });
            return json(res, 200, { edition: workspace.setEdition(current, record.reference, data.revision) });
          }
          case "/api/editions-of":
            // The editions of this document, so that the editor can keep
            // their unchecked passages through a save to the file.
            store.checkLease(data.lease);
            return json(res, 200, { editions: workspace?.editionsOf(current) ?? [] });
          case "/api/archived-history": {
            // A copy from Word that was exported before a save to the file.
            store.checkLease(data.lease);
            return json(res, 200, { histories: archivedHistories(String(data.history ?? "")) });
          }
          case "/api/edition-reference": {
            store.checkLease(data.lease);
            const record = workspace?.edition(current);
            if (!record) return json(res, 200, { edition: null });
            const { source: bytes, frames } = workspace.referenceState(record.reference);
            return json(res, 200, { edition: record, source: Buffer.from(bytes).toString("base64"), frames });
          }
          case "/api/merge": {
            // Changes that the author made in Word, found by the editor in a
            // copy that came back. They go to the same review as Copilot's
            // suggestions, and nothing else decides about them.
            store.checkLease(data.lease);
            const waiting = store.batchState(data.lease);
            if (store.reviewState(data.lease).draft?.replacement != null
              || waiting.suggestions.some(item => item.state === "open") || waiting.batch?.state === "waiting") {
              throw new Rejected("review-in-progress");
            }
            const list = (Array.isArray(data.changes) ? data.changes : []).slice(0, 60)
              .map(({ node, find, replacement }) => ({ node, find, replacement, rationale: "Changed in Word." }));
            const batch = store.createBatch(data.lease, session, { revision: data.revision, origin: "word",
              prompt: String(data.summary ?? "").slice(0, 2000) });
            try { store.submitSuggestions(data.lease, session, batch.id, list); }
            catch (error) { store.discardBatch(data.lease); throw error; }
            shared = undefined;
            return json(res, 200, suggestions(data.lease));
          }
          case "/api/discard-batch": {
            const waiting = store.batchState(data.lease).suggestions.filter(item => item.state === "open").length;
            if (waiting) note({ decision: "dismissed", suggestions: waiting });
            store.discardBatch(data.lease);
            shared = undefined;
            return json(res, 200, suggestions(data.lease));
          }
          case "/api/history": return json(res, 200, { accepted: store.acceptedReviews(data.lease),
            rules: rulesForEditor() });
          case "/api/review-note":
            store.saveNote(data.lease, data.id, data.note);
            return json(res, 200, {});
          case "/api/retry": return json(res, 200, store.retryReview(data.lease, data.id));
          case "/api/ask":
            if (!askAgent) return json(res, 409, { error: "live-agent-unavailable" });
            const scope = store.createReview(data.lease, session, fontHash, data.scope);
            unanswered = undefined;
            // The request is saved first. A refused prompt leaves a draft the
            // author can send again or discard.
            try { await askAgent(scope.id); }
            catch (error) {
              console.error(error?.message ?? error);
              return json(res, 502, { error: "agent-unreachable", id: scope.id });
            }
            return json(res, 202, { id: scope.id });
          default: return json(res, 404, { error: "route" });
        }
      }
      if (req.method !== "GET") return json(res, 405, { error: "method" });
      if ((path === "/ternleaf/review-change.mjs" || path === "/ternleaf/messages.mjs" || path === "/ternleaf/record.mjs")
        && staticFile(res, resolve(sessionAssets), path.slice("/ternleaf".length), true)) return;
      if (path.startsWith("/ternleaf/") && staticFile(res, ui, path.slice("/ternleaf".length), true)) return;
      if (staticFile(res, root, path === "/" ? "/editor.html" : path)) return;
      return json(res, 404, { error: "asset" });
    } catch (error) {
      if (error instanceof Rejected) return json(res, 409, { error: error.code });
      if (error instanceof ProjectError) return json(res, 409, { error: "project", message: error.message });
      console.error(error.message);
      return json(res, 500, { error: "publication-unknown" });
    }
  });
  // A project asks for the same port each time, so that the editor keeps its
  // origin and with it the author's settings and personal dictionary. If
  // that port is taken, for example by a second canvas, any free port works.
  const candidates = [...new Set([port, 0])];
  for (const candidate of candidates) {
    try {
      await new Promise((accept, reject) => {
        const failed = error => { server.off("listening", listening); reject(error); };
        const listening = () => { server.off("error", failed); accept(); };
        server.once("error", failed);
        server.once("listening", listening);
        server.listen(candidate, "127.0.0.1");
      });
      break;
    } catch (error) {
      if (error.code !== "EADDRINUSE" || candidate === candidates.at(-1)) { store.close(); throw error; }
    }
  }
  function reviews(current) {
    const state = store.reviewState(current);
    return { ...state, unanswered: Boolean(state.draft && state.draft.id === unanswered
      && state.draft.replacement === null && !state.draft.declined) };
  }
  function suggestions(current) {
    const state = store.batchState(current);
    return { ...state, unanswered: Boolean(state.batch?.state === "waiting" && state.batch.id === unanswered),
      origin: state.batch?.origin ?? "canvas" };
  }
  return {
    get name() { return name; },
    // Open another document of the project in this canvas. The editor
    // reloads when it next calls the host.
    openDocument(document, options) {
      if (!workspace) throw new ProjectError("This canvas shows one document.");
      const settings = workspace.resolve(document);
      if (settings.source !== current) load(settings, options);
    },
    url: `http://127.0.0.1:${server.address().port}/editor.html?blank=1&autosave=0&ternleaf=1#${token}`,
    readReview(id) {
      if (shared?.id === id) {
        store.actionBatch(lease, session, id);
        return { scope: "document", instructions: shared.prompt,
          paragraphs: shared.paragraphs.map(([, text], index) => ({ paragraph: index + 1, text })) };
      }
      const { before, prompt } = store.actionReview(lease, session, id);
      return { text: before, instructions: prompt };
    },
    submitProposal(id, replacement, rationale, alternatives) {
      store.submitReview(lease, session, id, replacement, rationale, alternatives);
      return { proposed: true };
    },
    // Suggestions for a whole-document request. A suggestion is kept when
    // its find text is in the paragraph that the agent names. The others
    // are reported back, so the agent knows what the author will not see.
    async submitSuggestions(id, list) {
      if (shared?.id !== id) throw new Rejected("stale-agent-request");
      const sorted = sortSuggestions(shared.paragraphs, list);
      const kept = await checkInCanvas(sorted.kept, sorted.refused);
      if (shared?.id !== id) throw new Rejected("stale-agent-request");
      store.submitSuggestions(lease, session, id, kept);
      return { suggested: kept.length, refused: sorted.refused };
    },
    declineProposal(id, reason) {
      if (shared?.id === id) store.declineBatch(lease, session, id, reason);
      else store.declineReview(lease, session, id, reason);
      return { declined: true };
    },
    // The adapter calls this when the agent's turn ends. The editor then
    // tells the author that the newest request got no answer.
    agentIdle() {
      if (!lease) return;
      try {
        const { draft } = store.reviewState(lease);
        if (draft && draft.replacement === null && !draft.declined) unanswered = draft.id;
        const { batch } = store.batchState(lease);
        if (batch?.state === "waiting") unanswered = batch.id;
      } catch { /* A fenced or released lease has no request to flag. */ }
    },
    // ---- What Copilot can do from the chat -------------------------------
    // The facts that need no job: the document, the canvas and what waits.
    status() {
      const head = Number(store.project().head);
      let request = null;
      let review = null;
      if (lease) {
        try {
          const { draft } = store.reviewState(lease);
          const { batch, suggestions: list } = store.batchState(lease);
          const open = list.filter(item => item.state === "open").length;
          if (draft && draft.replacement === null && !draft.declined && draft.fence === lease.fence && draft.revision === head) {
            request = { requestId: draft.id, scope: "passage" };
          } else if (batch?.state === "waiting" && shared?.id === batch.id) request = { requestId: batch.id, scope: "document" };
          if ((draft && draft.replacement !== null && draft.revision === head) || open) {
            review = { proposal: Boolean(draft && draft.replacement !== null), openSuggestions: open };
          }
        } catch { /* A fenced lease has nothing to report. */ }
      }
      const ready = present();
      return {
        document: { name, path: workspace ? workspace.key(current) : name, revision: head },
        canvas: ready ? { ready: true, pages: live.pages, words: live.words, suggestingMode: live.suggesting,
          selection: chat && live.selection && live.selection.revision === head ? { text: live.selection.before } : null }
          : { ready: false },
        // The .docx on disk has the text of the last save, which is where
        // this history starts.
        unsavedRevisions: head,
        request, review, chatAccess: chat, houseRules: workspace?.rules()?.path ?? null,
        ...(ready && live.failing.length ? { failingChecks: live.failing } : {}),
        ...(edition => edition ? { edition: { reference: edition.reference, checked: edition.checked,
          ...(ready && live.referenceChanges !== null ? { changedPassages: live.referenceChanges } : {}) } } : {})(workspace?.edition(current) ?? null),
      };
    },
    documents() {
      if (!workspace) return { current: name, documents: [] };
      const { documents: list, more } = workspace.documents();
      return { current: workspace.key(current), more,
        documents: list.slice(0, 100).map(({ path, bytes, modified, opened: last, revisions }) =>
          ({ path, bytes, modified: new Date(modified).toISOString(), opened: last ? new Date(last).toISOString() : null, revisions })) };
    },
    // The document text as it is now in the editor, in numbered paragraphs.
    // A long document comes in parts: `from` is the first paragraph number.
    async read({ from = 1, budget = 60_000 } = {}) {
      const result = await editorJob("read");
      const paragraphs = validParagraphs(result.paragraphs);
      const revision = Number(result.revision);
      snapshot = { revision, paragraphs };
      const levels = new Map((Array.isArray(result.outline) ? result.outline : []).map(item => [item.node, item.level]));
      const first = Math.min(Math.max(1, Number.isSafeInteger(from) ? from : 1), Math.max(1, paragraphs.length));
      const part = [];
      let size = 0;
      for (let index = first - 1; index < paragraphs.length; index++) {
        const [node, text] = paragraphs[index];
        if (part.length && size + text.length > budget) break;
        size += text.length;
        part.push({ paragraph: index + 1, ...(levels.has(node) ? { heading: levels.get(node) } : {}), text });
      }
      const last = first + part.length - 1;
      return { document: name, revision, paragraphs: part, total: paragraphs.length,
        ...(last < paragraphs.length ? { next: last + 1 } : {}),
        pages: Number(result.pages) || null, words: Number(result.words) || null,
        comments: Number(result.comments) || 0, trackedChanges: Number(result.trackedChanges) || 0,
        selection: live?.selection && live.selection.revision === revision ? { text: live.selection.before } : null,
        houseRules: readable(workspace?.rules()),
        ...(live?.failing.length ? { failingChecks: live.failing } : {}) };
    },
    houseRules() { return readable(workspace?.rules()); },
    // What changed in the reference document since the author last checked
    // this edition against it. The editor compares the two revisions.
    async referenceChanges() {
      if (!workspace?.edition(current)) throw new Rejected("no-reference");
      const result = await editorJob("reference", {}, 40_000);
      // Each change gets an identifier that a suggestion can name in
      // `answers`. The host keeps which paragraph of the reference it is, so
      // that Copilot never names a paragraph itself.
      answered = new Map();
      const changes = (Array.isArray(result.changes) ? result.changes : []).slice(0, 80).map(({ change, before, after, node, linked }, index) => {
        const id = "c" + (index + 1);
        answered.set(id, typeof node === "string" && /^[a-f0-9]{32}$/.test(node) ? node : null);
        return { id, change: String(change), ...(typeof before === "string" ? { before: before.slice(0, 4000) } : {}),
          ...(typeof after === "string" ? { after: after.slice(0, 4000) } : {}),
          ...(Number.isSafeInteger(linked?.paragraph) && typeof linked.text === "string"
            ? { linkedTo: { paragraph: linked.paragraph, text: linked.text.slice(0, 200) } } : {}) };
      });
      return { reference: String(result.reference), checkedRevision: Number(result.checked), referenceRevision: Number(result.head), changes };
    },
    // What the document would be if the author accepted these changes: the
    // engine lays out a copy and counts the pages. Nothing is saved, and the
    // author sees nothing.
    async measure({ revision, suggestions: list }) {
      if (!snapshot || snapshot.revision !== revision || revision !== Number(store.project().head)) {
        throw new Rejected(chat ? "stale-document" : "chat-access-off");
      }
      const changes = (Array.isArray(list) ? list : []).map((item, index) => ({ ...item, given: index + 1 }))
        .filter(item => typeof item.remark !== "string");
      const { kept, refused } = sortSuggestions(snapshot.paragraphs, changes);
      const result = await editorJob("measure", { changes: kept.map(({ node, find, replacement }) => ({ node, find, replacement })) }, 40_000);
      const blocked = (Array.isArray(result.blocked) ? result.blocked : [])
        .map(({ index, reason }) => ({ suggestion: kept[index]?.given, reason: String(reason) }));
      return { revision, now: { pages: Number(result.pagesBefore), words: Number(result.wordsBefore) },
        after: { pages: Number(result.pagesAfter), words: Number(result.wordsAfter) },
        applied: kept.length - blocked.length, cannotApply: [...refused, ...blocked] };
    },
    // The accepted changes as a Markdown file in the exports folder.
    exportRecord() {
      if (!chat) throw new Rejected("chat-access-off");
      if (!lease) throw new Rejected("canvas-not-ready");
      if (!workspace) throw new Rejected("single-document");
      const revision = Number(store.project().head);
      const changes = store.acceptedReviews(lease);
      const bytes = new TextEncoder().encode(changeRecord({ document: name, revision, changes }));
      const path = workspace.exportFile({ name: `${name.replace(/\.docx$/i, "")}-changes-r${revision}`, extension: "md", bytes });
      return { path, format: "changes", bytes: bytes.length, revision, acceptedChanges: changes.length };
    },
    // A proposal for the passage that the author has selected now.
    proposeFromChat({ instructions, text, replacement, rationale, alternatives }) {
      checkFree();
      const selection = live.selection;
      if (!selection) throw new Rejected("no-selection");
      if (text !== selection.before) throw new Rejected("selection-changed");
      store.discardReviews(lease);
      const scope = store.createAnsweredReview(lease, session, fontHash,
        { ...selection, prompt: instructions, note: "" }, replacement, rationale, alternatives);
      stamp += 1;
      return { proposed: true, requestId: scope.id };
    },
    // Suggestions for the document text that Copilot read with `read`.
    async suggestFromChat({ instructions, revision, suggestions: list }) {
      checkFree();
      const fresh = () => {
        if (!snapshot || snapshot.revision !== revision || revision !== Number(store.project().head)) throw new Rejected("stale-document");
      };
      fresh();
      // The store checks the instructions too, but only after the canvas
      // tried the changes. A missing instruction must not wait for that.
      if (typeof instructions !== "string" || !instructions.trim() || instructions.length > 2000) throw new Rejected("invalid-selection-or-instructions");
      const sorted = sortSuggestions(snapshot.paragraphs, list);
      const kept = await checkInCanvas(sorted.kept, sorted.refused);
      const { refused } = sorted;
      checkFree();
      fresh();
      const batch = store.createBatch(lease, session, { revision, prompt: instructions, origin: "chat" });
      try { store.submitSuggestions(lease, session, batch.id, kept); }
      catch (error) { store.discardBatch(lease); throw error; }
      shared = undefined;
      stamp += 1;
      return { suggested: kept.length, refused, requestId: batch.id };
    },
    // One page as the author sees it, as a PNG image.
    async viewPage(page) {
      if (!Number.isSafeInteger(page) || page < 1) throw new Rejected("page-out-of-range");
      const result = await editorJob("page", { page }, 20_000);
      return { page, pages: Number(result.pages), revision: Number(result.revision), png: String(result.png),
        width: Number(result.width), height: Number(result.height) };
    },
    // The current revision as a file in the exports folder of the project.
    async exportDocument(format) {
      const extension = { docx: "docx", pdf: "pdf", markdown: "md", html: "html", text: "txt" }[format];
      if (!extension) throw new Rejected("invalid-request");
      if (!workspace) throw new Rejected("single-document");
      const result = await editorJob("export", { format }, 40_000);
      const bytes = new Uint8Array(Buffer.from(String(result.bytes ?? ""), "base64"));
      const revision = Number(result.revision);
      // A Word file carries the history in its name too, so that a copy
      // that comes back finds its base after a save to the file.
      const path = workspace.exportFile({ name: `${name.replace(/\.docx$/i, "")}-r${revision}${format === "docx" ? "-" + historyId(store) : ""}`, extension, bytes });
      return { path, format, bytes: bytes.length, revision };
    },
    // The accepted changes behind the revisions, oldest first.
    history() {
      if (!chat) throw new Rejected("chat-access-off");
      if (!lease) throw new Rejected("canvas-not-ready");
      const accepted = store.acceptedReviews(lease);
      return { document: name, revision: Number(store.project().head), acceptedChanges: accepted.length,
        changes: accepted.slice(-30).map(({ revision, before, replacement, prompt, note: authorNote, rationale, origin }) => ({
          revision, instructions: prompt, before, after: replacement, ...(rationale ? { rationale } : {}),
          ...(authorNote ? { authorNote } : {}), from: origin ?? "canvas" })) };
    },
    // What the author decided in the canvas since Copilot last asked.
    news() { return events.splice(0); },
    // The author sees what Copilot takes from the canvas.
    tellAuthor(text) { if (!notices.includes(text) && notices.length < 5) notices.push(text); },
    async close() {
      dropJobs("canvas-closed");
      await new Promise(accept => server.close(accept));
      remember();
      if (lease) store.release(lease);
      store.close();
    },
  };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const [source, state, engine, font, port] = process.argv.slice(2);
  if (!source || !state || !engine) {
    console.error("Usage: node apps/host/serve.mjs SOURCE.docx PROJECT.sqlite OPENDOC_WEBAPP [FONT.ttf] [PORT]");
    process.exitCode = 2;
  } else {
    const host = await startHost({ source, state, engine, font, port: port ? Number(port) : 0 });
    console.log(host.url);
    process.once("SIGINT", () => void host.close());
  }
}

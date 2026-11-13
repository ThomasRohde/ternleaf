import { createServer } from "node:http";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, realpathSync, renameSync, statSync } from "node:fs";
import { basename, dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ProjectStore, Rejected } from "../../packages/session/store.mjs";
import { ProjectError } from "./project.mjs";

const mime = { ".mjs": "text/javascript", ".js": "text/javascript", ".html": "text/html",
  ".json": "application/json", ".wasm": "application/wasm", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".ttf": "font/ttf" };
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
  onDocument, chat = true }) {
  const root = realpathSync(engine);
  const ui = realpathSync(editorAssets);
  const fontBytes = fonts.map(path => readFileSync(path));
  let store, sourceBytes, name, current, opened = false;
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

  const validParagraphs = list => Array.isArray(list) ? list.filter(item => Array.isArray(item)
    && /^[a-f0-9]{32}$/.test(item[0]) && typeof item[1] === "string" && item[1].trim()) : [];

  // Sort suggestions into those the author can review and those that do not
  // match the text. The refused ones go back to the agent with the reason.
  function sortSuggestions(paragraphs, list) {
    const kept = [];
    const refused = [];
    for (const [index, item] of (Array.isArray(list) ? list : []).entries()) {
      const paragraph = paragraphs[item?.paragraph - 1];
      const reason = !paragraph ? "unknown paragraph number"
        : typeof item.find !== "string" || !paragraph[1].includes(item.find) ? "the find text is not in that paragraph"
        : paragraph[1].indexOf(item.find) !== paragraph[1].lastIndexOf(item.find) ? "the find text occurs more than once; give a longer find text"
        : item.replacement === item.find ? "the replacement is the same as the find text" : null;
      if (reason) refused.push({ suggestion: index + 1, reason });
      else kept.push({ node: paragraph[0], find: item.find, replacement: item.replacement, rationale: item.rationale });
    }
    if (!kept.length) {
      throw new Rejected("invalid-suggestions", refused.length
        ? "Refused: " + refused.slice(0, 5).map(item => `suggestion ${item.suggestion}, ${item.reason}`).join("; ") + "."
        : undefined);
    }
    return { kept, refused };
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
    const bytes = readFileSync(settings.source);
    mkdirSync(dirname(resolve(settings.state)), { recursive: true });
    let next = new ProjectStore(settings.state, { leaseMs: 15_000 });
    try { next.initialize(bytes); }
    catch (error) {
      next.close();
      if (!(error instanceof Rejected) || error.code !== "source-already-set" || !restart) throw error;
      const archive = resolve(dirname(resolve(settings.state)), "archive");
      mkdirSync(archive, { recursive: true });
      const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
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
    sourceBytes = bytes;
    name = basename(settings.source);
    current = settings.source;
    opened = false;
    lease = shared = unanswered = live = snapshot = undefined;
    events.length = 0;
    dropJobs("document-changed");
    epoch += 1;
    if (epoch > 1) { try { onDocument?.(name); } catch { /* The title is a convenience. */ } }
  }
  load({ source, state }, { restart });
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
        const data = await body(req, path === "/api/job" ? 96 * 1024 * 1024 : undefined);
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
              captureWordComparison, reviews: reviews(lease), accepted: store.acceptedReviews(lease),
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
              selection: picked && /^[a-f0-9]{32}$/.test(picked.node) && Number.isSafeInteger(picked.start)
                && Number.isSafeInteger(picked.end) && typeof picked.before === "string" && picked.before.length <= 4000
                && Number.isSafeInteger(picked.revision)
                ? { node: picked.node, start: picked.start, end: picked.end, before: picked.before, revision: picked.revision }
                : null };
            return json(res, 200, { stamp, notices: notices.splice(0),
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
          case "/api/release": store.release(data.lease); return json(res, 200, {});
          case "/api/commit": {
            const result = store.publish(data.lease, data.request, undefined, fontHash);
            if (data.request.reviewId && !result.duplicate) {
              const { before, replacement } = store.review(data.request.reviewId);
              note({ decision: "accepted", revision: result.record.revision, before, replacement });
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
          case "/api/discard-batch": {
            const waiting = store.batchState(data.lease).suggestions.filter(item => item.state === "open").length;
            if (waiting) note({ decision: "dismissed", suggestions: waiting });
            store.discardBatch(data.lease);
            shared = undefined;
            return json(res, 200, suggestions(data.lease));
          }
          case "/api/history": return json(res, 200, { accepted: store.acceptedReviews(data.lease) });
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
      if ((path === "/ternleaf/review-change.mjs" || path === "/ternleaf/messages.mjs")
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
      origin: state.batch?.origin === "chat" ? "chat" : "canvas" };
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
    submitSuggestions(id, list) {
      if (shared?.id !== id) throw new Rejected("stale-agent-request");
      const { kept, refused } = sortSuggestions(shared.paragraphs, list);
      store.submitSuggestions(lease, session, id, kept);
      return { suggested: kept.length, refused };
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
        request, review, chatAccess: chat,
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
        selection: live?.selection && live.selection.revision === revision ? { text: live.selection.before } : null };
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
    suggestFromChat({ instructions, revision, suggestions: list }) {
      checkFree();
      if (!snapshot || snapshot.revision !== revision || revision !== Number(store.project().head)) {
        throw new Rejected("stale-document");
      }
      const { kept, refused } = sortSuggestions(snapshot.paragraphs, list);
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
      const path = workspace.exportFile({ name: `${name.replace(/\.docx$/i, "")}-r${revision}`, extension, bytes });
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

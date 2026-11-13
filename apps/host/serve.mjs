import { createServer } from "node:http";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createReadStream, mkdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { basename, dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ProjectStore, Rejected } from "../../packages/session/store.mjs";

const mime = { ".mjs": "text/javascript", ".js": "text/javascript", ".html": "text/html",
  ".json": "application/json", ".wasm": "application/wasm", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".ttf": "font/ttf" };
const editorAssets = fileURLToPath(new URL("../editor/", import.meta.url));
const sessionAssets = fileURLToPath(new URL("../../packages/session/", import.meta.url));

function json(res, status, value) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(value));
}

async function body(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 8 * 1024 * 1024) throw new Rejected("request-too-large");
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new Rejected("invalid-json"); }
}

function staticFile(res, root, path, noStore = false) {
  const file = resolve(root, "." + path);
  if (!file.startsWith(root + sep)) return false;
  // The prebuilt engine stores its WebAssembly module compressed, to stay
  // under the file size limit of a Git host. The browser inflates it.
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

export async function startHost({ source, state, engine, font, fonts = font ? [font] : [], port = 0,
  askAgent, loseProposalReplyOnce = false, captureWordComparison = false }) {
  const root = realpathSync(engine);
  const ui = realpathSync(editorAssets);
  const sourceBytes = readFileSync(source);
  const fontBytes = fonts.map(path => readFileSync(path));
  mkdirSync(dirname(resolve(state)), { recursive: true });
  const store = new ProjectStore(state, { leaseMs: 15_000 });
  try { store.initialize(sourceBytes); } catch (error) { store.close(); throw error; }
  const token = randomBytes(32).toString("hex");
  const secret = Buffer.from("Bearer " + token);
  const fontHashes = fontBytes.map(bytes => createHash("sha256").update(bytes).digest("hex"));
  const fontHash = fontHashes.length > 1
    ? createHash("sha256").update(JSON.stringify(fontHashes)).digest("hex")
    : fontHashes[0] ?? null;
  const session = randomUUID();
  const name = basename(source);
  let lease;
  // Set when the agent finished a turn and the newest request has no answer.
  let unanswered;
  // The document text the author shared for the current whole-document
  // request. It stays in memory and is replaced by the next request.
  let shared;

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
        const data = await body(req);
        switch (path) {
          case "/api/claim": {
            const claimed = store.claim(data.previous);
            lease = claimed.lease;
            return json(res, 200, { ...claimed, name, fontHash, fontCount: fontBytes.length,
              captureWordComparison, reviews: reviews(lease), accepted: store.acceptedReviews(lease),
              suggestions: suggestions(lease) });
          }
          case "/api/renew": store.renew(data.lease); return json(res, 200, {});
          case "/api/release": store.release(data.lease); return json(res, 200, {});
          case "/api/commit": {
            const result = store.publish(data.lease, data.request, undefined, fontHash);
            if (loseProposalReplyOnce && data.request.reviewId && !result.duplicate) {
              loseProposalReplyOnce = false;
              return res.destroy();
            }
            return json(res, 200, result);
          }
          case "/api/reviews": return json(res, 200, reviews(data.lease));
          case "/api/discard": return json(res, 200, { discarded: store.discardReviews(data.lease) });
          case "/api/revise":
            store.reviseReview(data.lease, data.id, data.replacement);
            return json(res, 200, reviews(data.lease));
          case "/api/review-document": {
            if (!askAgent) return json(res, 409, { error: "live-agent-unavailable" });
            const paragraphs = Array.isArray(data.paragraphs) ? data.paragraphs.filter(item => Array.isArray(item)
              && /^[a-f0-9]{32}$/.test(item[0]) && typeof item[1] === "string" && item[1].trim()) : [];
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
          case "/api/discard-batch":
            store.discardBatch(data.lease);
            shared = undefined;
            return json(res, 200, suggestions(data.lease));
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
      console.error(error.message);
      return json(res, 500, { error: "publication-unknown" });
    }
  });
  try {
    await new Promise((accept, reject) => {
      server.once("error", reject);
      server.listen(port, "127.0.0.1", accept);
    });
  } catch (error) { store.close(); throw error; }
  function reviews(current) {
    const state = store.reviewState(current);
    return { ...state, unanswered: Boolean(state.draft && state.draft.id === unanswered
      && state.draft.replacement === null && !state.draft.declined) };
  }
  function suggestions(current) {
    const state = store.batchState(current);
    return { ...state, unanswered: Boolean(state.batch?.state === "waiting" && state.batch.id === unanswered) };
  }
  return {
    name,
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
      const kept = [];
      const refused = [];
      for (const [index, item] of (Array.isArray(list) ? list : []).entries()) {
        const paragraph = shared.paragraphs[item?.paragraph - 1];
        const reason = !paragraph ? "unknown paragraph number"
          : typeof item.find !== "string" || !paragraph[1].includes(item.find) ? "the find text is not in that paragraph"
          : paragraph[1].indexOf(item.find) !== paragraph[1].lastIndexOf(item.find) ? "the find text occurs more than once; give a longer find text"
          : item.replacement === item.find ? "the replacement is the same as the find text" : null;
        if (reason) refused.push({ suggestion: index + 1, reason });
        else kept.push({ node: paragraph[0], find: item.find, replacement: item.replacement, rationale: item.rationale });
      }
      if (!kept.length) throw new Rejected("invalid-suggestions");
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
    async close() {
      await new Promise(accept => server.close(accept));
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

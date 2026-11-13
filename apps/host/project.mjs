import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";

export class ProjectError extends Error {}

const inside = (root, path) => path === root || path.startsWith(root + sep);
const engines = ["opendoc", "engine/prebuilt/webapp"];
const welcome = "examples/welcome-to-ternleaf.docx";
const maxBytes = 64 * 1024 * 1024;
// Folders that hold tools and build output, never the author's documents.
const skipped = new Set(["node_modules", "engine", "exports", "opendoc", "dist", "target", "build", "notices"]);

// The documents of one project folder.
//
// A document is a .docx file inside the project folder or the session's
// working directory. Each document has its own project file in `.ternleaf/`,
// so its revisions stay with it, and the .docx file itself is never changed.
//
// `.ternleaf/canvas.json` is optional. It can name the engine, the fonts and
// a default document. `.ternleaf/workspace.json` is written by Ternleaf. It
// remembers the documents that were opened, so a new canvas returns to the
// last one.
export function createWorkspace({ project, workingDirectory }) {
  const home = realpathSync(project);
  const roots = [...new Set([workingDirectory, project].filter(Boolean).map(root => realpathSync(root)))];
  const memory = join(home, ".ternleaf", "workspace.json");

  function config() {
    const file = join(home, ".ternleaf", "canvas.json");
    if (!existsSync(file)) return {};
    try { return JSON.parse(readFileSync(file, "utf8")); }
    catch { throw new ProjectError(".ternleaf/canvas.json is not valid JSON."); }
  }

  function remembered() {
    try {
      const value = JSON.parse(readFileSync(memory, "utf8"));
      return { last: typeof value.last === "string" ? value.last : null,
        recent: value.recent && typeof value.recent === "object" ? value.recent : {} };
    } catch { return { last: null, recent: {} }; }
  }

  // The name a document goes by: its path from the project folder, with
  // forward slashes. A document outside every root keeps its full path.
  const key = source => {
    const root = [home, ...roots].find(candidate => inside(candidate, source));
    return (root ? relative(root, source) : source).replaceAll("\\", "/");
  };

  function locate(document) {
    if (typeof document !== "string" || !document || document.length > 1024
      || extname(document).toLowerCase() !== ".docx") {
      throw new ProjectError("Give the path of a .docx file.");
    }
    for (const root of roots) {
      const candidate = isAbsolute(document) ? document : resolve(root, document);
      let physical;
      try { physical = realpathSync(candidate); } catch { continue; }
      if (roots.some(allowed => inside(allowed, physical)) && statSync(physical).isFile()) return physical;
    }
    throw new ProjectError("No .docx file at that path inside this project: " + document);
  }

  function stateFor(source, settings) {
    const configured = settings.source ? resolve(home, settings.source) : undefined;
    if (configured && settings.state && existsSync(configured) && realpathSync(configured) === source) {
      return resolve(home, settings.state);
    }
    const stem = basename(source, extname(source)).replace(/[^A-Za-z0-9._-]+/g, "-").slice(0, 48) || "document";
    const id = createHash("sha256").update(key(source)).digest("hex").slice(0, 10);
    return join(home, ".ternleaf", `${stem}-${id}.sqlite`);
  }

  // Find the DOCX, its project file, the engine and the fonts for a canvas.
  // Without `document`, that is the last opened document, then the configured
  // one, then the introduction that comes with Ternleaf.
  function resolveDocument(document) {
    const settings = config();
    const result = {
      engine: resolve(home, settings.engine ?? engines.find(path => existsSync(join(home, path))) ?? engines[0]),
      font: settings.font ? resolve(home, settings.font) : undefined,
      fonts: settings.fonts?.map(path => resolve(home, path)),
      loseProposalReplyOnce: settings.verification?.loseProposalReplyOnce === true,
      captureWordComparison: settings.verification?.captureWordComparison === true,
      // With "chat": false, Copilot works only on what the author sends
      // from the canvas. It cannot read the document for a chat request.
      chat: settings.chat !== false,
    };
    if (!existsSync(result.engine)) {
      throw new ProjectError("The OpenDoc engine is missing. Set \"engine\" in .ternleaf/canvas.json. See docs/Install.md.");
    }
    let source;
    if (document !== undefined && document !== "") source = locate(document);
    else {
      for (const candidate of [remembered().last, settings.source, welcome]) {
        if (!candidate) continue;
        try { source = locate(candidate); break; }
        catch {
          // A configured default may live outside the project, for example a
          // fixture in a build folder. The author named it, so it is allowed.
          const configured = candidate === settings.source ? resolve(home, candidate) : null;
          if (configured && existsSync(configured)) { source = realpathSync(configured); break; }
        }
      }
      if (!source) {
        throw new ProjectError("No document to open. Open Ternleaf with a document path, or set \"source\" in .ternleaf/canvas.json.");
      }
    }
    return { ...result, source, state: stateFor(source, settings), key: key(source) };
  }

  function documents() {
    const { recent } = remembered();
    const found = [];
    const folders = new Set([""]);
    const walk = (directory, depth) => {
      if (found.length >= 400) return;
      let entries;
      try { entries = readdirSync(directory, { withFileTypes: true }); } catch { return; }
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name.startsWith("~$")) continue;
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
          if (depth < 6 && !skipped.has(entry.name)) walk(path, depth + 1);
        } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".docx") {
          let stat;
          try { stat = statSync(path); } catch { continue; }
          const id = key(path);
          const folder = dirname(id) === "." ? "" : dirname(id);
          if (!isAbsolute(id)) folders.add(folder);
          found.push({ path: id, name: entry.name, folder, modified: Math.round(stat.mtimeMs), bytes: stat.size,
            opened: recent[id]?.opened ?? null, revisions: recent[id]?.revisions ?? null });
        }
      }
    };
    const seen = new Set();
    for (const root of roots) {
      walk(root, 0);
    }
    const unique = found.filter(item => !seen.has(item.path) && seen.add(item.path));
    unique.sort((a, b) => (b.opened ?? 0) - (a.opened ?? 0) || a.path.localeCompare(b.path));
    return { documents: unique, folders: [...folders].sort((a, b) => a.localeCompare(b)), more: found.length >= 400 };
  }

  // Record that a document opened, so that a new canvas returns to it.
  function remember(source, revisions) {
    const state = remembered();
    const id = key(source);
    state.last = id;
    state.recent[id] = { opened: Date.now(), revisions };
    const kept = Object.entries(state.recent).sort((a, b) => b[1].opened - a[1].opened).slice(0, 50);
    try {
      mkdirSync(dirname(memory), { recursive: true });
      writeFileSync(memory, JSON.stringify({ last: state.last, recent: Object.fromEntries(kept) }, null, 2) + "\n");
    } catch { /* Memory is a convenience. A read-only project still opens. */ }
  }

  const cleanName = name => {
    const stem = String(name ?? "").replace(/\.docx$/i, "").replace(/[<>:"/\\|?*\u0000-\u001f]+/g, " ")
      .replace(/\s+/g, " ").replace(/^[. ]+|[. ]+$/g, "").slice(0, 100);
    if (!stem) throw new ProjectError("Give the document a name.");
    return stem;
  };

  // Write a new .docx into the project and return its path. An existing file
  // is never replaced: the new document gets a number after its name.
  function create({ name, folder = "", bytes }) {
    if (!(bytes instanceof Uint8Array) || bytes.length < 4 || bytes.length > maxBytes
      || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
      throw new ProjectError("That file is not a Word document (.docx).");
    }
    if (typeof folder !== "string" || folder.length > 400 || isAbsolute(folder)
      || folder.split(/[\\/]/).some(part => part === ".." || part.startsWith("."))) {
      throw new ProjectError("Choose a folder inside this project.");
    }
    const directory = resolve(roots[0], folder);
    if (!inside(roots[0], directory)) throw new ProjectError("Choose a folder inside this project.");
    const stem = cleanName(name);
    mkdirSync(directory, { recursive: true });
    for (let attempt = 1; attempt < 200; attempt++) {
      const file = join(directory, attempt === 1 ? `${stem}.docx` : `${stem} ${attempt}.docx`);
      try {
        writeFileSync(file, bytes, { flag: "wx" });
        return realpathSync(file);
      } catch (error) {
        if (error.code !== "EEXIST") throw new ProjectError("The document could not be written: " + error.code);
      }
    }
    throw new ProjectError("Too many documents have that name. Choose another name.");
  }

  // Write an export of a document into the exports folder of the project and
  // return its path. An export is a copy that can be made again, so a file
  // with the same name is replaced.
  function exportFile({ name, extension, bytes }) {
    if (!(bytes instanceof Uint8Array) || !bytes.length || bytes.length > maxBytes || !/^[a-z0-9]{1,5}$/.test(extension)) {
      throw new ProjectError("The export could not be written.");
    }
    const directory = resolve(roots[0], "exports");
    try {
      mkdirSync(directory, { recursive: true });
      const file = join(directory, `${cleanName(name)}.${extension}`);
      writeFileSync(file, bytes);
      return key(realpathSync(file));
    } catch (error) {
      if (error instanceof ProjectError) throw error;
      throw new ProjectError("The export could not be written: " + error.code);
    }
  }

  // The port that this project's host asks for first. It is the same for
  // every canvas of the project, so the editor keeps one origin.
  const port = 42000 + (Number.parseInt(createHash("sha256").update(home).digest("hex").slice(0, 8), 16) % 16000);

  return { resolve: resolveDocument, documents, remember, create, exportFile, key, project: home, welcome, port };
}

// The settings for one canvas. See createWorkspace.
export function resolveProject({ project, workingDirectory, document }) {
  return createWorkspace({ project, workingDirectory }).resolve(document);
}

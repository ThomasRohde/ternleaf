import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

// Rules with a fixed form are checked by Ternleaf itself, without a model.
// They stand in the rules file in a fenced block with the name ternleaf:
//   max-pages: 2
//   max-words: 800
//   max-sentence-words: 30
//   require-heading: Recommendation
//   avoid: utilize => use
export function parseChecks(text) {
  const block = /```ternleaf[^\n]*\n([\s\S]*?)```/.exec(text);
  const checks = [];
  for (const line of (block?.[1] ?? "").split("\n")) {
    const match = /^\s*([a-z-]+)\s*:\s*(.+?)\s*$/.exec(line);
    if (!match) continue;
    const [, kind, value] = match;
    const number = Number(value);
    if (["max-pages", "max-words", "max-sentence-words"].includes(kind)) {
      if (Number.isSafeInteger(number) && number > 0) checks.push({ kind, limit: number });
    } else if (kind === "require-heading") checks.push({ kind, heading: value.slice(0, 120) });
    else if (kind === "avoid") {
      const [term, better] = value.split("=>").map(part => part.trim());
      if (term) checks.push({ kind, term: term.slice(0, 80), ...(better ? { better: better.slice(0, 80) } : {}) });
    }
    if (checks.length >= 40) break;
  }
  return checks;
}

export class ProjectError extends Error {}

const inside = (root, path) => path === root || path.startsWith(root + sep);
// The engine and the introduction come with Ternleaf. In the Ternleaf
// repository they are in the project folder. In a repository where
// scripts/install.mjs installed Ternleaf, they are in the extension folder,
// two folders above this file. The project folder comes first, so a project
// can bring its own.
const ternleaf = fileURLToPath(new URL("../..", import.meta.url));
const engines = ["opendoc", "engine/prebuilt/webapp"];
const welcome = "examples/welcome-to-ternleaf.docx";
const findEngine = home => engines.map(path => join(home, path)).find(existsSync)
  ?? engines.map(path => join(ternleaf, path)).find(path => existsSync(join(path, "editor.html")));
const introductionFor = home => existsSync(join(home, welcome)) ? welcome : join(ternleaf, welcome);
// The example rules file, as a path from the project folder, so that the
// Review pane can name it: examples/ in a clone, the extension folder in a
// repository where Ternleaf is installed.
const rulesExample = "examples/ternleaf.rules.example.md";
const rulesExampleFor = home => existsSync(join(home, rulesExample)) ? rulesExample
  : relative(home, join(ternleaf, rulesExample)).replaceAll("\\", "/");
const maxBytes = 64 * 1024 * 1024;
// Folders that hold tools and build output, never the author's documents.
const skipped = new Set(["node_modules", "engine", "exports", "opendoc", "dist", "target", "build", "notices"]);

// The documents of one project folder.
//
// A document is a .docx file inside the project folder or the session's
// working directory. Each document has its own project file in `.ternleaf/`,
// so its revisions stay with it. Ternleaf writes the .docx file only when the
// author chooses Save to the Word file (see apps/host/serve.mjs).
//
// `.ternleaf/canvas.json` is optional. It can name the engine, the fonts and
// a default document. `.ternleaf/workspace.json` is written by Ternleaf. It
// remembers the documents that were opened, so a new canvas returns to the
// last one.
export function createWorkspace({ project, workingDirectory,
  copilotHome = process.env.COPILOT_HOME || join(homedir(), ".copilot") }) {
  const home = realpathSync(project);
  const roots = [...new Set([workingDirectory, project].filter(Boolean).map(root => realpathSync(root)))];
  const memory = join(home, ".ternleaf", "workspace.json");

  function config() {
    const file = join(home, ".ternleaf", "canvas.json");
    if (!existsSync(file)) return {};
    try { return JSON.parse(readFileSync(file, "utf8")); }
    catch { throw new ProjectError(".ternleaf/canvas.json is not valid JSON."); }
  }

  function fontConfig(settings) {
    let base = home;
    let label = ".ternleaf/canvas.json";
    if (!Object.hasOwn(settings, "fonts") && !Object.hasOwn(settings, "font")) {
      const file = resolve(copilotHome, "ternleaf/fonts.json");
      if (!existsSync(file)) return {};
      try {
        settings = JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
        if (!settings || typeof settings !== "object" || Array.isArray(settings)) throw new Error();
      } catch {
        throw new ProjectError(file + " is not valid font configuration JSON.");
      }
      base = dirname(file);
      label = file;
    }
    if (settings.fonts !== undefined) {
      if (!Array.isArray(settings.fonts)
        || settings.fonts.some(path => typeof path !== "string" || !path.trim())) {
        throw new ProjectError('The "fonts" setting in ' + label + " must be a list of font file paths.");
      }
      return { fonts: settings.fonts.map(path => resolve(base, path)) };
    }
    if (settings.font !== undefined) {
      if (typeof settings.font !== "string" || !settings.font.trim()) {
        throw new ProjectError('The "font" setting in ' + label + " must be a font file path.");
      }
      return { font: resolve(base, settings.font) };
    }
    return {};
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
      engine: resolve(home, settings.engine ?? findEngine(home) ?? join(ternleaf, engines[1])),
      ...fontConfig(settings),
      loseProposalReplyOnce: settings.verification?.loseProposalReplyOnce === true,
      captureWordComparison: settings.verification?.captureWordComparison === true,
      // With "chat": false, Copilot works only on what the author sends
      // from the canvas. It cannot read the document for a chat request.
      chat: settings.chat !== false,
      // A save to the Word file also writes <file>.docx.md, a text copy for
      // diffs, and adds to <file>.docx.changes.md. Each can be turned off.
      textCopy: settings.textCopy !== false,
      changeLog: settings.changeLog !== false,
    };
    if (!existsSync(result.engine)) {
      throw new ProjectError(settings.engine
        ? `No OpenDoc engine at ${result.engine}, the "engine" path in .ternleaf/canvas.json. Correct the path, or remove "engine" to use the engine that comes with Ternleaf.`
        : `The OpenDoc engine is missing: no folder ${result.engine}. Install Ternleaf again with "node scripts/install.mjs <repository>" from a Ternleaf release or clone, or set "engine" in .ternleaf/canvas.json.`);
    }
    let source;
    if (document !== undefined && document !== "") source = locate(document);
    else {
      for (const candidate of [remembered().last, settings.source, introductionFor(home)]) {
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
        throw new ProjectError(`No document to open: the introduction ${introductionFor(home)} is missing. Open Ternleaf with the path of a .docx file of this project, for example docs/brief.docx, or install Ternleaf again with "node scripts/install.mjs <repository>".`);
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

  // Editions: a document can be an edition of another document of the
  // project, its reference. The record holds the reference and the revision
  // of the reference that the author last checked this edition against.
  const editionsFile = join(home, ".ternleaf", "editions.json");
  function editions() {
    try {
      const value = JSON.parse(readFileSync(editionsFile, "utf8"));
      return value && typeof value === "object" ? value : {};
    } catch { return {}; }
  }
  function edition(source) {
    const record = editions()[key(source)];
    if (!record || typeof record.reference !== "string" || !Number.isSafeInteger(record.checked)) return null;
    try {
      return { reference: key(locate(record.reference)), checked: record.checked,
        ...(Array.isArray(record.carried) && record.carried.length ? { carried: validPassages(record.carried) } : {}),
        ...(record.lost === true ? { lost: true } : {}),
        ...(Object.keys(validLinks(record.links)).length ? { links: validLinks(record.links) } : {}) };
    } catch { return null; }
  }
  const isNode = value => typeof value === "string" && /^[a-f0-9]{32}$/.test(value);
  const validLinks = links => Object.fromEntries(Object.entries(links && typeof links === "object" ? links : {})
    .filter(([from, to]) => isNode(from) && isNode(to)).slice(0, 500));
  const writeEditions = all => {
    try {
      mkdirSync(dirname(editionsFile), { recursive: true });
      writeFileSync(editionsFile, JSON.stringify(all, null, 2) + "\n");
    } catch (error) { throw new ProjectError("The edition could not be saved: " + error.code); }
  };
  // Set, change or (with no reference) remove the record of one document.
  function setEdition(source, reference, checked = 0) {
    const all = editions();
    if (reference === null) delete all[key(source)];
    else {
      const target = locate(reference);
      if (target === source) throw new ProjectError("A document cannot be an edition of itself.");
      if (editions()[key(target)]) throw new ProjectError("That document is an edition itself. Choose its reference.");
      // The links between passages stay while the reference stays.
      const links = all[key(source)]?.reference === key(target) ? validLinks(all[key(source)].links) : {};
      all[key(source)] = { reference: key(target), checked, ...(Object.keys(links).length ? { links } : {}) };
    }
    writeEditions(all);
    return edition(source);
  }
  // The author accepted a change of the edition that answers a change of a
  // paragraph of the reference. The host calls this from the accepted
  // review, never from Copilot's word alone. A newer link for the same
  // paragraph of the reference replaces the older one.
  function linkEdition(source, referenceNode, editionNode) {
    const all = editions();
    const record = all[key(source)];
    if (!record || !isNode(referenceNode) || !isNode(editionNode)) return null;
    const links = validLinks(record.links);
    delete links[referenceNode];
    record.links = validLinks({ [referenceNode]: editionNode, ...links });
    writeEditions(all);
    return edition(source);
  }
  // A save to the file starts a new history for a document, at revision 0.
  // An edition of it was checked against a revision of the old history, so
  // it starts again at 0 too. The passages that changed in the old history
  // after that check are not in the new one, so the record keeps them as
  // text (`carried`), and the Review pane shows them with the later changes.
  // A list of text is the simplest record that is still correct: the old
  // history is in the archive, but the paragraph IDs of the saved file are
  // new, so a comparison across the two histories cannot pair passages by
  // ID. The editor of the reference makes the list before the save, because
  // only the engine can read a revision. `carried` is [{ edition, checked,
  // changes }]. An edition without a list, with changes after its check,
  // gets `lost`, so the author is told to compare it by hand.
  // `renamed` pairs the paragraph IDs of the last revision with the IDs that
  // the saved file gets, so that the links between passages stay: as keys in
  // the editions of this document, and as values in its own record.
  function restartEditionsOf(source, { head = 0, carried = [], renamed = null } = {}) {
    const all = editions();
    const mine = key(source);
    const names = new Map((Array.isArray(renamed) ? renamed : []).filter(pair => Array.isArray(pair) && isNode(pair[0]) && isNode(pair[1])));
    const rename = (links, side) => Object.fromEntries(Object.entries(validLinks(links)).flatMap(([from, to]) => {
      const value = side === "from" ? names.get(from) : names.get(to);
      return value ? [side === "from" ? [value, to] : [from, value]] : [];
    }));
    let changed = false;
    if (Array.isArray(renamed) && all[mine]?.links) {
      all[mine].links = rename(all[mine].links, "to");
      changed = true;
    }
    for (const [path, record] of Object.entries(all)) {
      if (record?.reference !== mine) continue;
      if (Array.isArray(renamed) && record.links) record.links = rename(record.links, "from");
      const given = (Array.isArray(carried) ? carried : []).find(item => item?.edition === path && item.checked === record.checked);
      if (given) {
        const changes = validPassages(given.changes);
        if (changes.length) record.carried = changes;
        else delete record.carried;
      } else if (record.checked !== head || record.carried?.length) record.lost = true;
      record.checked = 0;
      changed = true;
    }
    if (changed) writeEditions(all);
  }
  // The editions of a reference, for the editor before a save.
  function editionsOf(source) {
    const mine = key(source);
    return Object.entries(editions()).filter(([, record]) => record?.reference === mine && Number.isSafeInteger(record.checked))
      .map(([path, record]) => ({ edition: path, checked: record.checked, carried: validPassages(record.carried) }));
  }
  // The passages of a reference as text, in the form of passageChanges.
  function validPassages(list) {
    return (Array.isArray(list) ? list : []).slice(0, 200).filter(item => item && ["added", "changed", "removed"].includes(item.change)
      && ["before", "after"].every(side => item[side] === undefined || typeof item[side] === "string"))
      .map(({ change, before, after, node: at }) => ({ change, ...(before !== undefined ? { before: before.slice(0, 4000) } : {}),
        ...(after !== undefined ? { after: after.slice(0, 4000) } : {}), ...(isNode(at) ? { node: at } : {}) }));
  }
  // The reference as the editor needs it to compare two of its revisions:
  // the source file and the saved edits, read without a change to them.
  function referenceState(reference) {
    const target = resolveDocument(reference);
    if (!existsSync(target.state)) return { source: readFileSync(target.source), frames: [] };
    const db = new DatabaseSync(target.state, { readOnly: true });
    try {
      const project = db.prepare("SELECT source FROM project").get();
      const frames = db.prepare("SELECT record FROM commits ORDER BY revision").all().map(row => JSON.parse(row.record).frame);
      return { source: project ? Buffer.from(project.source) : readFileSync(target.source), frames: project ? frames : [] };
    } finally { db.close(); }
  }

  // The house rules of the project: what a document here must follow, in
  // the team's own words. Copilot gets them with every read. The file is
  // ternleaf.rules.md in the project folder, or the "rules" path of
  // .ternleaf/canvas.json.
  function rules() {
    const named = config().rules;
    for (const candidate of [named, "ternleaf.rules.md", ".github/ternleaf.rules.md"]) {
      if (typeof candidate !== "string" || !candidate) continue;
      try {
        const file = realpathSync(resolve(home, candidate));
        if (!roots.some(root => inside(root, file)) || !statSync(file).isFile()) continue;
        const text = readFileSync(file, "utf8").trim();
        if (text) return { path: key(file), text: text.slice(0, 20_000), checks: parseChecks(text), stamp: `${file}:${statSync(file).mtimeMs}` };
      } catch { /* No rules file at this path. */ }
    }
    return null;
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

  return { resolve: resolveDocument, documents, remember, create, exportFile, rules, edition, setEdition, linkEdition, editionsOf, restartEditionsOf, referenceState, key, project: home, welcome: introductionFor(home), rulesExample: rulesExampleFor(home), port };
}

// The settings for one canvas. See createWorkspace.
export function resolveProject({ project, workingDirectory, document }) {
  return createWorkspace({ project, workingDirectory }).resolve(document);
}

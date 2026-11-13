import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { basename, extname, isAbsolute, join, relative, resolve, sep } from "node:path";

export class ProjectError extends Error {}

const inside = (root, path) => path === root || path.startsWith(root + sep);

// Find the DOCX, its project file, the engine and the fonts for one canvas.
//
// `.ternleaf/canvas.json` is optional. Without it, the canvas uses the engine
// that comes with the project and opens the example document.
//
// With `document`, the canvas opens that DOCX. The path is relative to the
// session's working directory or to the project. It must be an existing
// .docx file inside one of them. Each document has its own project file in
// `.ternleaf/`, so its revisions stay with it.
const engines = ["opendoc", "engine/prebuilt/webapp"];
const example = "examples/harbour-library-brief.docx";

export function resolveProject({ project, workingDirectory, document }) {
  const file = join(project, ".ternleaf", "canvas.json");
  let config = {};
  if (existsSync(file)) {
    try { config = JSON.parse(readFileSync(file, "utf8")); }
    catch { throw new ProjectError(".ternleaf/canvas.json is not valid JSON."); }
  }
  const settings = {
    engine: resolve(project, config.engine ?? engines.find(path => existsSync(join(project, path))) ?? engines[0]),
    font: config.font ? resolve(project, config.font) : undefined,
    fonts: config.fonts?.map(path => resolve(project, path)),
    loseProposalReplyOnce: config.verification?.loseProposalReplyOnce === true,
    captureWordComparison: config.verification?.captureWordComparison === true,
  };
  if (!existsSync(settings.engine)) {
    throw new ProjectError("The OpenDoc engine is missing. Set \"engine\" in .ternleaf/canvas.json. See docs/Install.md.");
  }
  const configured = config.source ? resolve(project, config.source) : undefined;
  if ((document === undefined || document === "") && !configured && existsSync(join(project, example))) document = example;
  if (document === undefined || document === "") {
    if (!configured || !config.state) {
      throw new ProjectError("No document is set. Open Ternleaf with a document path, or set \"source\" and \"state\" in .ternleaf/canvas.json.");
    }
    if (!existsSync(configured)) throw new ProjectError("The document in .ternleaf/canvas.json does not exist: " + config.source);
    return { ...settings, source: configured, state: resolve(project, config.state) };
  }
  if (typeof document !== "string" || document.length > 1024 || extname(document).toLowerCase() !== ".docx") {
    throw new ProjectError("Give the path of a .docx file.");
  }
  const roots = [...new Set([workingDirectory, project].filter(Boolean).map(root => realpathSync(root)))];
  let source;
  for (const root of roots) {
    const candidate = isAbsolute(document) ? document : resolve(root, document);
    let physical;
    try { physical = realpathSync(candidate); } catch { continue; }
    if (roots.some(allowed => inside(allowed, physical)) && statSync(physical).isFile()) { source = physical; break; }
  }
  if (!source) throw new ProjectError("No .docx file at that path inside this project: " + document);
  if (configured && existsSync(configured) && realpathSync(configured) === source && config.state) {
    return { ...settings, source, state: resolve(project, config.state) };
  }
  const key = relative(realpathSync(project), source).replaceAll("\\", "/");
  const stem = basename(source, extname(source)).replace(/[^A-Za-z0-9._-]+/g, "-").slice(0, 48) || "document";
  const id = createHash("sha256").update(key).digest("hex").slice(0, 10);
  return { ...settings, source, state: join(project, ".ternleaf", `${stem}-${id}.sqlite`) };
}

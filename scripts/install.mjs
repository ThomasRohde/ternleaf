// Install, update, check or remove Ternleaf in another repository.
//
//   node scripts/install.mjs <repository>            install, or update
//   node scripts/install.mjs --check <repository>    report, change nothing
//   node scripts/install.mjs --remove <repository>   remove what was installed
//   add --force to replace or remove installed files that were changed there
//
// Run it from a clone of Ternleaf or from an unpacked release. It has no
// dependencies. Everything goes into .github/extensions/ternleaf, except the
// skill, which Copilot finds only in .github/skills/ternleaf. A manifest in
// the extension folder lists each installed file with its hash. With it, an
// update replaces only files that Ternleaf wrote and that nobody changed,
// and a removal removes only those files.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync,
  rmdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const extension = ".github/extensions/ternleaf";
export const skill = ".github/skills/ternleaf/SKILL.md";
export const manifestPath = `${extension}/ternleaf-install.json`;
const gitignoreLines = [".ternleaf/", "exports/"];

// What goes where: a path in the Ternleaf source (a clone or a release), and
// its path in the repository. A release has the same layout as a clone, so
// this one list serves both, and scripts/package-canvas.mjs uses it too.
export const layout = [
  { from: `${extension}/extension.mjs`, to: `${extension}/extension.mjs` },
  { from: `${extension}/start-check.mjs`, to: `${extension}/start-check.mjs` },
  { from: `${extension}/package.json`, to: `${extension}/package.json` },
  { from: `${extension}/package-lock.json`, to: `${extension}/package-lock.json` },
  { from: `${extension}/icon.svg`, to: `${extension}/icon.svg` },
  { from: skill, to: skill },
  { from: "apps/agent", to: `${extension}/apps/agent` },
  { from: "apps/editor", to: `${extension}/apps/editor` },
  { from: "apps/host", to: `${extension}/apps/host` },
  { from: "packages/session", to: `${extension}/packages/session` },
  { from: "examples", to: `${extension}/examples` },
  { from: "engine/prebuilt", to: `${extension}/engine/prebuilt` },
  { from: "engine/notices", to: `${extension}/engine/notices`, optional: true },
  { from: "notices", to: `${extension}/notices`, optional: true },
  { from: "LICENSE", to: `${extension}/LICENSE` },
];
// The source also needs these to install, so a release copies them too.
export const tools = ["scripts/install.mjs", "package.json"];

// Files that a test, Word or an operating system leaves behind.
const junk = name => name.startsWith("~$") || /\.sqlite(-shm|-wal|-journal)?$/.test(name)
  || [".DS_Store", "Thumbs.db", "desktop.ini"].includes(name);

const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const posix = path => path.replaceAll("\\", "/");
const megabytes = bytes => (bytes / 1024 / 1024).toFixed(1) + " MB";
const inside = (root, path) => path === root || path.startsWith(root + sep);

export class InstallError extends Error {}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (junk(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : entry.isFile() ? [path] : [];
  });
}

// Every file that the source gives, as { from, to } with paths from the
// source and from the repository.
export function sourceFiles(source) {
  const files = [];
  for (const item of layout) {
    const from = join(source, item.from);
    if (!existsSync(from)) {
      if (item.optional) continue;
      throw new InstallError(`The Ternleaf source ${source} has no ${item.from}. Run this script from a complete clone or release of Ternleaf.`);
    }
    if (statSync(from).isDirectory()) {
      for (const file of walk(from)) {
        const path = posix(relative(from, file));
        files.push({ from: posix(join(item.from, path)), to: `${item.to}/${path}` });
      }
    } else files.push({ from: item.from, to: item.to });
  }
  return files;
}

function version(source) {
  try { return JSON.parse(readFileSync(join(source, "package.json"), "utf8")).version ?? "unknown"; }
  catch { return "unknown"; }
}

// A short note in the extension folder for the team that finds it.
const readme = release => `# Ternleaf

This folder holds Ternleaf ${release}, a GitHub Copilot canvas for Word documents.
scripts/install.mjs from Ternleaf wrote it. Do not edit the files here: the
next update cannot replace a file that you changed.

- Update: node scripts/install.mjs <this repository>, from a newer Ternleaf clone or release.
- Check: node scripts/install.mjs --check <this repository>
- Remove: node scripts/install.mjs --remove <this repository>

Your documents stay where they are. Ternleaf keeps its project files in
.ternleaf/ and writes exports into exports/ at the root of the repository.
The files in ternleaf-install.json are the files that Ternleaf installed.
`;

function hashOf(file) {
  try {
    const stat = statSync(file);
    if (!stat.isFile()) return "not-a-file";
    return sha256(readFileSync(file));
  } catch { return null; }
}

function readManifest(target) {
  const file = join(target, manifestPath);
  if (!existsSync(file)) return null;
  try {
    const value = JSON.parse(readFileSync(file, "utf8"));
    if (value && typeof value.files === "object") return value;
  } catch { /* Reported below. */ }
  throw new InstallError(`The manifest ${manifestPath} in ${target} is not valid. Restore it from version control, or move the folder ${extension} away and install again.`);
}

const normalize = line => line.trim().replace(/^\//, "").replace(/\/\*{1,2}$/, "").replace(/\/$/, "");

function gitignorePlan(target) {
  const file = join(target, ".gitignore");
  const text = existsSync(file) ? readFileSync(file, "utf8") : null;
  const present = new Set((text ?? "").split(/\r?\n/).map(normalize));
  const missing = gitignoreLines.filter(line => !present.has(normalize(line)));
  if (!missing.length) return { file, text, missing, appended: "" };
  const eol = text?.includes("\r\n") ? "\r\n" : "\n";
  const lead = text && !text.endsWith("\n") ? eol : "";
  const gap = text && text.trim() ? eol : "";
  const appended = lead + gap + ["# Ternleaf: project files and exports", ...missing].join(eol) + eol;
  return { file, text, missing, appended };
}

// Compare the source with the repository. Nothing is written here.
export function plan(source, target, { force = false } = {}) {
  source = realpathSync(resolve(source));
  if (!existsSync(target) || !statSync(target).isDirectory()) {
    throw new InstallError(`There is no folder ${target}. Give the path of the repository that gets Ternleaf.`);
  }
  target = realpathSync(resolve(target));
  if (target === source) {
    throw new InstallError("That is the Ternleaf source itself. Give the path of another repository.");
  }
  if (inside(join(target, extension), source)) {
    throw new InstallError(`The source ${source} is inside ${extension} of the repository. Run the script from a separate clone or release.`);
  }
  const manifest = readManifest(target);
  const recorded = manifest?.files ?? {};
  const release = version(source);
  const wanted = new Map(sourceFiles(source).map(file => {
    const bytes = readFileSync(join(source, file.from));
    return [file.to, { from: join(source, file.from), bytes: bytes.length, hash: sha256(bytes) }];
  }));
  const note = Buffer.from(readme(release));
  wanted.set(`${extension}/README.md`, { content: note, bytes: note.length, hash: sha256(note) });

  const steps = [];
  for (const [path, file] of wanted) {
    const current = hashOf(join(target, path));
    const before = recorded[path];
    let action;
    if (current === null) action = "add";
    else if (current === file.hash) action = "same";
    else if (current === "not-a-file") action = "foreign";
    else if (!before) action = "foreign";
    else if (current === before) action = "update";
    else action = force ? "replace" : "changed";
    steps.push({ path, action, ...file });
  }
  for (const [path, before] of Object.entries(recorded)) {
    if (wanted.has(path)) continue;
    const current = hashOf(join(target, path));
    if (current === null) continue;
    steps.push({ path, action: current === before ? "delete" : force ? "delete" : "changed-old", hash: before });
  }
  return { source, target, release, manifest, steps, gitignore: gitignorePlan(target),
    blocked: steps.filter(step => ["foreign", "changed", "changed-old"].includes(step.action)) };
}

const count = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function explainBlocked(blocked, print) {
  for (const step of blocked) {
    if (step.action === "foreign") print(`  ${step.path} exists, and Ternleaf did not write it.`);
    else print(`  ${step.path} was changed after Ternleaf installed it.`);
  }
}

// Remove the files that the manifest lists, the lines that the install added
// to .gitignore and the folders that it made. Nothing else.
function removeAll(target, { force, print }) {
  target = realpathSync(resolve(target));
  const manifest = readManifest(target);
  if (!manifest) {
    print(`Ternleaf is not installed in ${target}: there is no ${manifestPath}. Nothing was removed.`);
    return 1;
  }
  const files = Object.entries(manifest.files).map(([path, hash]) => ({ path, hash, current: hashOf(join(target, path)) }));
  const changed = files.filter(file => file.current !== null && file.current !== file.hash);
  if (changed.length && !force) {
    print(`Ternleaf was not removed. ${count(changed.length, "installed file")} changed after the install:`);
    for (const file of changed.slice(0, 20)) print(`  ${file.path}`);
    print("Keep a copy of your changes, then run the command again with --force to remove them too.");
    return 1;
  }
  let removed = 0;
  for (const file of files) {
    if (file.current === null || file.current === "not-a-file") continue;
    rmSync(join(target, file.path));
    removed++;
  }
  const ignore = join(target, ".gitignore");
  const appended = manifest.gitignore?.appended ?? [];
  if (appended.length && existsSync(ignore)) {
    let text = readFileSync(ignore, "utf8");
    for (const block of [...appended].reverse()) {
      if (text.endsWith(block)) text = text.slice(0, -block.length);
      else print(`The Ternleaf lines in .gitignore changed after the install. They stay. Remove them by hand if you do not need them.`);
    }
    if (manifest.gitignore.created && !text.trim()) rmSync(ignore);
    else writeFileSync(ignore, text);
  }
  rmSync(join(target, manifestPath));
  const kept = [];
  for (const folder of [...(manifest.directories ?? [])].sort((a, b) => b.length - a.length)) {
    try { rmdirSync(join(target, folder)); }
    catch (error) { if (error.code !== "ENOENT") kept.push(folder); }
  }
  print(`Ternleaf is removed from ${target}: ${count(removed, "file")} and the lines that it added to .gitignore.`);
  for (const folder of kept) print(`The folder ${folder} stays, because it holds files that Ternleaf did not install.`);
  print("Your documents, the project files in .ternleaf/ and the files in exports/ did not change. Delete them yourself if you do not need them.");
  return 0;
}

// Run one command. Return the exit code. `print` gets one line at a time.
export function run({ source = fileURLToPath(new URL("..", import.meta.url)), target, check = false, remove = false,
  force = false, print = line => console.log(line) }) {
  try {
    if (remove) return removeAll(target, { force, print });
    const result = plan(source, target, { force });
    const by = action => result.steps.filter(step => step.action === action);
    const adds = by("add"), updates = [...by("update"), ...by("replace")], deletes = by("delete");
    const copies = [...adds, ...updates];
    const work = copies.length + deletes.length + (result.gitignore.missing.length ? 1 : 0);
    const installed = result.manifest ? `Ternleaf ${result.manifest.ternleaf} is installed in ${result.target}.`
      : `Ternleaf is not installed in ${result.target}.`;

    if (check) {
      print(installed);
      if (result.blocked.length) {
        print("These files stop an install or an update:");
        explainBlocked(result.blocked, print);
      }
      if (!work && !result.blocked.length) {
        print(`It is the same as the source, Ternleaf ${result.release}. Nothing needs to change.`);
        return 0;
      }
      if (work) {
        print(`An install from ${result.source} (Ternleaf ${result.release}) would add ${count(adds.length, "file")}, `
          + `update ${count(updates.length, "file")} and remove ${count(deletes.length, "file")}`
          + (result.gitignore.missing.length ? `, and add ${result.gitignore.missing.join(" and ")} to .gitignore.` : "."));
        print(`Run "node ${posix(relative(process.cwd(), fileURLToPath(import.meta.url)))} ${result.target}" to do it.`);
      }
      return 1;
    }

    if (result.blocked.length) {
      print(`Nothing was changed in ${result.target}. These files are in the way:`);
      explainBlocked(result.blocked, print);
      if (result.blocked.some(step => step.action === "foreign")) {
        print("Ternleaf never replaces a file that it did not write. Move or rename these files, then run the command again.");
      }
      if (result.blocked.some(step => step.action !== "foreign")) {
        print("Keep a copy of your changes, then run the command again with --force to replace the changed files.");
      }
      return 1;
    }
    if (!work) {
      print(`${installed} It is the same as the source, Ternleaf ${result.release}. Nothing was changed.`);
      return 0;
    }

    const bytes = copies.reduce((sum, step) => sum + step.bytes, 0);
    const engine = copies.filter(step => step.path.startsWith(`${extension}/engine/prebuilt/`));
    const largest = engine.reduce((big, step) => (step.bytes > (big?.bytes ?? 0) ? step : big), null);
    print(`${result.manifest ? "Updating" : "Installing"} Ternleaf ${result.release} in ${result.target}.`);
    if (copies.length) {
      print(`The copy is ${megabytes(bytes)} in ${count(copies.length, "file")}.`
        + (engine.length ? ` The document engine is ${megabytes(engine.reduce((sum, step) => sum + step.bytes, 0))} of it.` : "")
        + (largest ? ` Its largest file, ${largest.path.split("/").pop()}, is ${megabytes(largest.bytes)}.` : ""));
    }

    // Folders that the install makes are removed again by --remove.
    const directories = new Set(result.manifest?.directories ?? []);
    const makeFolder = path => {
      const parts = path.split("/").slice(0, -1);
      for (let depth = 1; depth <= parts.length; depth++) {
        const folder = parts.slice(0, depth).join("/");
        if (!existsSync(join(result.target, folder))) {
          mkdirSync(join(result.target, folder));
          directories.add(folder);
        }
      }
    };
    for (const step of copies) {
      const file = join(result.target, step.path);
      makeFolder(step.path);
      // Write next to the file, then rename, so a stopped copy never leaves half a file.
      const temporary = file + ".ternleaf-new";
      if (step.content) writeFileSync(temporary, step.content);
      else copyFileSync(step.from, temporary);
      renameSync(temporary, file);
    }
    for (const step of deletes) rmSync(join(result.target, step.path));

    const appended = [...(result.manifest?.gitignore?.appended ?? [])];
    let created = result.manifest?.gitignore?.created ?? false;
    if (result.gitignore.missing.length) {
      if (result.gitignore.text === null) created = true;
      writeFileSync(result.gitignore.file, (result.gitignore.text ?? "") + result.gitignore.appended);
      appended.push(result.gitignore.appended);
    }
    const files = Object.fromEntries(result.steps.filter(step => !["delete", "changed-old"].includes(step.action))
      .map(step => [step.path, step.hash]).sort(([a], [b]) => a.localeCompare(b)));
    writeFileSync(join(result.target, manifestPath), JSON.stringify({
      ternleaf: result.release, files, gitignore: { created, appended },
      directories: [...directories].sort(),
    }, null, 2) + "\n");

    print(`Ternleaf added ${count(adds.length, "file")}, updated ${count(updates.length, "file")} and removed ${count(deletes.length, "file")}.`
      + " The extension and its parts are in " + extension + ", and the skill is " + skill + ".");
    for (const step of by("replace")) print(`Replaced ${step.path}, which was changed after the install.`);
    if (result.gitignore.missing.length) {
      print(`Added ${result.gitignore.missing.join(" and ")} to .gitignore. They hold the saved revisions and the exports of each author.`);
    }
    if (!existsSync(join(result.target, ".git"))) print(`${result.target} is not a Git repository. The Copilot app finds a repository extension only in a Git repository, so run "git init" in it first.`);
    print("Next:");
    print(`  1. Open ${result.target} in the GitHub Copilot app and start a new session. An open session does not see the change.`);
    print("  2. Choose + > Canvas > Ternleaf, or ask Copilot to open the Ternleaf canvas. It opens a short introduction.");
    print(`  3. Commit ${extension} and ${skill} if your team must get Ternleaf from the repository.`);
    print(`If the canvas is not in the list, run "npm ci --prefix ${extension}" in the repository and start a new session.`);
    return 0;
  } catch (error) {
    if (!(error instanceof InstallError)) throw error;
    print(error.message);
    return 1;
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const options = { check: false, remove: false, force: false };
  const targets = [];
  for (const argument of process.argv.slice(2)) {
    if (argument === "--check") options.check = true;
    else if (argument === "--remove") options.remove = true;
    else if (argument === "--force") options.force = true;
    else if (argument.startsWith("--")) targets.push(null);
    else targets.push(argument);
  }
  if (targets.length !== 1 || targets[0] === null || (options.check && options.remove)) {
    console.error("Usage: node scripts/install.mjs [--check | --remove] [--force] <path of the repository>");
    process.exitCode = 2;
  } else process.exitCode = run({ ...options, target: resolve(targets[0]) });
}

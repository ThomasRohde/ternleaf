// Save to the file: the author's .docx gets the text of the current revision.
//
// A save changes several files: the .docx, its text copy, its change log and
// the project file in .ternleaf. A crash can stop the host between any two
// of these steps. So the save has exactly one step that decides: the rename
// of the new .docx over the old one. Everything before it only writes
// temporary files and a marker. Everything after it can be done again.
//
//   1. Write every new file as a temporary file in the folder of its target.
//   2. Write the marker next to the project file: the hash of the new .docx
//      and the list of temporary files with their targets.
//   3. Rename the temporary .docx over the .docx. This is the commit.
//   4. Rename the other temporary files over their targets.
//   5. The host archives the old project file and starts a new history
//      from the new .docx. Then it removes the marker.
//
// When the host opens a document and finds a marker, `settleSave` looks at
// the .docx on disk. If its hash is the hash in the marker, step 3 was done,
// and the host does steps 4 and 5. If not, step 3 was not done, and the
// temporary files and the marker are removed. Either way the result is the
// old state or the new state, and no revision is lost: the old project
// file goes to the archive, not away.
import { createHash } from "node:crypto";
import { closeSync, existsSync, fsyncSync, openSync, readFileSync, renameSync, rmSync, writeSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const marker = state => state + ".save.json";
// The workspace does not list files whose names start with a dot.
const temporary = path => join(dirname(path), "." + basename(path) + ".ternleaf-save");

// Write a file and flush it to the disk, so that a rename after this cannot
// point at a file that is still empty after a power loss.
function durable(path, bytes) {
  const handle = openSync(path, "w");
  try {
    writeSync(handle, bytes);
    fsyncSync(handle);
  } finally { closeSync(handle); }
}

// A Word document is a ZIP package with a main document part. The names of
// the parts are stored without compression, so a search finds them.
export function isDocx(bytes) {
  if (!bytes || bytes.length < 22 || bytes[0] !== 0x50 || bytes[1] !== 0x4b || bytes[2] !== 3 || bytes[3] !== 4) return false;
  const text = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("latin1");
  return text.includes("[Content_Types].xml") && text.includes("word/document.xml");
}

export const sameFile = (path, hash) => existsSync(path) && digest(readFileSync(path)) === hash;

// Steps 1 and 2. `files` are the other files of the save: { path, text }.
export function prepareSave({ source, state, bytes, files = [] }) {
  const moves = [[temporary(source), source], ...files.map(file => [temporary(file.path), file.path])];
  try {
    durable(moves[0][0], bytes);
    for (const [index, file] of files.entries()) durable(moves[index + 1][0], Buffer.from(file.text, "utf8"));
    durable(marker(state) + ".tmp", JSON.stringify({ hash: digest(bytes), moves }));
    renameSync(marker(state) + ".tmp", marker(state));
  } catch (error) {
    for (const [from] of moves) rmSync(from, { force: true });
    rmSync(marker(state) + ".tmp", { force: true });
    throw error;
  }
}

// Step 3. If the rename fails, for example because Word holds the file
// open, the save is undone and the error goes to the caller.
export function commitSave({ source, state }) {
  try { renameSync(temporary(source), source); }
  catch (error) { rollBack(state); throw error; }
}

function read(state) {
  try { return JSON.parse(readFileSync(marker(state), "utf8")); }
  catch { return null; }
}

function rollBack(state) {
  for (const [from] of read(state)?.moves ?? []) rmSync(from, { force: true });
  rmSync(marker(state), { force: true });
}

// Step 4. It can run more than once: a file that was moved is not there.
// A temporary .docx that is still there has the same bytes as the .docx
// (the hash says so), for example after a save of an unchanged document.
export function finishSave({ state }) {
  const [first, ...rest] = read(state)?.moves ?? [];
  if (first) rmSync(first[0], { force: true });
  for (const [from, to] of rest) {
    if (existsSync(from)) renameSync(from, to);
  }
}

// The last part of step 5.
export const clearSave = ({ state }) => rmSync(marker(state), { force: true });

// After a crash: "committed" when the host must finish the save, "undone"
// when the save did not happen, and null when no save was in progress.
export function settleSave({ source, state }) {
  if (!existsSync(marker(state))) return null;
  const saved = read(state);
  if (saved && sameFile(source, saved.hash)) {
    finishSave({ state });
    return "committed";
  }
  rollBack(state);
  return "undone";
}

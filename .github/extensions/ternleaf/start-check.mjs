// What the extension needs before it can open a canvas. This file imports
// nothing from Ternleaf, so it works when the other parts are missing. Each
// problem is one sentence for the author: what is missing and what to do.
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

// The parts that the extension imports. scripts/install.mjs copies them.
export const parts = ["apps/agent/actions.mjs", "apps/agent/context.mjs", "apps/agent/guide.mjs",
  "apps/host/project.mjs", "apps/host/serve.mjs", "packages/session/store.mjs", "packages/session/messages.mjs"];

const again = "Install Ternleaf again with \"node scripts/install.mjs <repository>\" from a Ternleaf release or clone, then start a new session.";

// The folder that holds apps/ and packages/. In an installed copy it is the
// extension folder. In the Ternleaf repository it is the repository root,
// three folders above the extension.
export function partsFolder(extensionFolder) {
  return existsSync(join(extensionFolder, "apps/host/serve.mjs")) ? extensionFolder : resolve(extensionFolder, "../../..");
}

// The project folder is the repository that holds .github/extensions/ternleaf.
export function projectFolder(extensionFolder) {
  return dirname(dirname(dirname(resolve(extensionFolder))));
}

// Return null when the extension can start, or one sentence for the author.
export async function startProblem(folder, { load = name => import(name), version = process.versions.node } = {}) {
  try { await load("node:sqlite"); }
  catch {
    return `Ternleaf cannot start: Node.js ${version} has no node:sqlite module, and Ternleaf needs Node.js 24 or later. Update the GitHub Copilot app, or install Node.js 24 or later, then start a new session.`;
  }
  const missing = parts.filter(path => !existsSync(join(folder, path)));
  if (missing.length) {
    return `Ternleaf cannot start: ${missing.length} of its files are missing in ${folder}, for example ${missing[0]}. ${again}`;
  }
  return null;
}

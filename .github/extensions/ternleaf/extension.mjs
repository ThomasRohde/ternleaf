// The Copilot side of Ternleaf. This file joins the Copilot session and
// connects it to the parts in apps/:
//   - the canvas: one loopback host per open canvas instance
//   - the actions that Copilot calls on a canvas (apps/agent/actions.mjs)
//   - the hooks that give Copilot the state of the canvas with each prompt
//     and keep it from working around the canvas (apps/agent/context.mjs)
// The guide for Copilot is also a skill: .github/skills/ternleaf/SKILL.md.
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CanvasError, createCanvas, joinSession } from "@github/copilot-sdk/extension";
import { partsFolder, projectFolder, startProblem } from "./start-check.mjs";

// The same file runs in the Ternleaf repository and in a repository where
// scripts/install.mjs installed Ternleaf. The parts are found from this
// folder, and the project is always the repository that holds
// .github/extensions/ternleaf. The parts are imported only after the check,
// so a missing part or an old Node.js gives the author one sentence, and the
// canvas does not simply stay absent.
const here = dirname(fileURLToPath(import.meta.url));
const root = partsFolder(here);
const project = projectFolder(here);
let problem = await startProblem(root);
let modules = [{ actions: [] }, {}, {}, {}, {}, {}, {}];
if (!problem) {
  const load = path => import(pathToFileURL(join(root, path)).href);
  try {
    modules = await Promise.all(["apps/agent/actions.mjs", "apps/agent/context.mjs", "apps/agent/guide.mjs",
      "apps/host/project.mjs", "apps/host/serve.mjs", "packages/session/store.mjs", "packages/session/messages.mjs"].map(load));
  } catch (error) {
    problem = `Ternleaf cannot start: a part in ${root} did not load (${error.message}). Install Ternleaf again with "node scripts/install.mjs <repository>" from a Ternleaf release or clone, then start a new session.`;
  }
}
const [{ actions }, { promptContext, toolAdvice }, { canvasPrompt }, { ProjectError, createWorkspace },
  { startHost }, { Rejected }, { refusalForAgent }] = modules;

const canvasId = "ternleaf";
const instances = new Map();   // Canvas instance ID → loopback host.
const opening = new Set();     // Instances inside an open call.
const state = { briefed: false, advised: false };
let session;
// Not Promise.withResolvers: an old Node.js must reach the start check.
let sessionJoined;
const sessionReady = { promise: new Promise(accept => { sessionJoined = accept; }), resolve: value => sessionJoined(value) };
const joined = async () => session ?? sessionReady.promise;

// A refusal becomes one sentence that tells Copilot what to do next.
function refuse(error) {
  if (error instanceof CanvasError) return error;
  if (ProjectError && error instanceof ProjectError) return new CanvasError("project", error.message);
  if (Rejected && error instanceof Rejected) return new CanvasError(error.code, refusalForAgent(error));
  return error;
}

// Run one action against its canvas instance.
const handler = run => async ({ instanceId, input }) => {
  const host = instances.get(instanceId);
  if (!host) throw new CanvasError("canvas-closed", refusalForAgent({ code: "canvas-closed" }));
  try { return await run(host, input ?? {}); }
  catch (error) { throw refuse(error); }
};

// The canvas tab shows the name of the document. When the author opens
// another document in the canvas, ask Copilot to open the same instance
// again: that updates the title and changes nothing else.
function retitle(instanceId) {
  if (opening.has(instanceId)) return;
  void joined().then(joinedSession => joinedSession.rpc.canvas.open({ canvasId, instanceId }))
    .catch(() => { /* The title is a convenience. */ });
}

const canvas = createCanvas({
  id: canvasId,
  displayName: "Ternleaf",
  description: "Write, review and revise a Word document (.docx) with the author: read the current text, look at pages, propose changes that the author accepts or discards, and export files. Call the ternleaf_guide action first.",
  icon: "icon.svg",
  // Copilot often opens a canvas with no input at all, so null is valid too.
  inputSchema: {
    type: ["object", "null"], additionalProperties: false,
    properties: {
      document: {
        type: "string",
        description: "Optional path of a .docx file inside the project, for example docs/brief.docx. Omit it to return to the document that was open last.",
      },
    },
  },
  actions: actions.map(({ name, description, inputSchema, run }) => ({ name, description, inputSchema, handler: handler(run) })),
  async open({ instanceId, input, session: context }) {
    if (problem) throw new CanvasError("ternleaf-unavailable", problem);
    let host = instances.get(instanceId);
    opening.add(instanceId);
    try {
      if (host) {
        // The canvas is open already. A path asks it to show that document.
        if (input?.document) host.openDocument(input.document);
      } else {
        const workspace = createWorkspace({ project, workingDirectory: context?.workingDirectory });
        const start = (settings, restart = false) => startHost({
          ...settings, workspace, restart, port: workspace.port,
          askAgent: async (id, scope) => (await joined()).send({ prompt: canvasPrompt(instanceId, id, scope) }),
          onDocument: () => retitle(instanceId),
        });
        if (input?.document) host = await start(workspace.resolve(input.document));
        else {
          try { host = await start(workspace.resolve()); }
          catch (error) {
            if (!(error instanceof Rejected) || error.code !== "source-already-set") throw error;
            // The document to return to changed on disk. Show the
            // introduction. The author can open the changed document from
            // the canvas, which asks before it starts a new history.
            host = await start(workspace.resolve(workspace.welcome), true);
          }
        }
        instances.set(instanceId, host);
      }
    } catch (error) { throw refuse(error); }
    finally { opening.delete(instanceId); }
    return { title: host.name, url: host.url };
  },
  async onClose({ instanceId }) {
    const host = instances.get(instanceId);
    instances.delete(instanceId);
    await host?.close();
  },
});

// A hook must never break a prompt or a tool call.
const safely = run => async input => {
  try { return await run(input); } catch { return undefined; }
};

session = await joinSession({
  canvases: [canvas],
  hooks: {
    // Copilot learns what the canvas shows with every prompt, so it does not
    // have to search for it.
    onUserPromptSubmitted: safely(() => {
      if (problem) return { additionalContext: "The Ternleaf canvas cannot open. Tell the author: " + problem };
      const additionalContext = promptContext(instances, state);
      return additionalContext ? { additionalContext } : undefined;
    }),
    onPreToolUse: safely(input => problem ? undefined : toolAdvice(input, { project, instances, state })),
  },
});
sessionReady.resolve(session);
if (problem) void session.log(problem, { level: "error" }).catch(() => { /* The canvas says it too. */ });
// A turn that ends without an answer leaves the author waiting. Tell each
// open canvas, so the editor can say so.
session.on("session.idle", () => { for (const host of instances.values()) host.agentIdle(); });

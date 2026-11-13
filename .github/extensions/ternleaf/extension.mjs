import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CanvasError, createCanvas, joinSession } from "@github/copilot-sdk/extension";
import { ProjectError, resolveProject } from "../../../apps/host/project.mjs";
import { startHost } from "../../../apps/host/serve.mjs";
import { Rejected } from "../../../packages/session/store.mjs";
import { forAgent } from "../../../packages/session/messages.mjs";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const instances = new Map();
const requestId = { type: "string", format: "uuid", description: "The request ID from the Ternleaf prompt." };
let session;
const sessionReady = Promise.withResolvers();

// Run one action against the canvas instance. A refusal from the session
// store becomes an instruction that the agent can act on.
function action(run) {
  return ({ instanceId, input }) => {
    const host = instances.get(instanceId);
    if (!host) throw new CanvasError("canvas-closed", "This Ternleaf canvas is closed. Tell the author to open it again.");
    try { return run(host, input); }
    catch (error) {
      if (error instanceof Rejected) throw new CanvasError(error.code, forAgent(error.code));
      throw error;
    }
  };
}

// The prompt is visible in the chat, so it is short. The rules for the answer
// come back from ternleaf_read.
const prompt = (instanceId, id, scope) => [
  scope === "document"
    ? "Ternleaf: the author shares the document text and asks for a review with suggestions."
    : "Ternleaf: the author shares a selected passage and asks for a revision.",
  `Call ternleaf_read with invoke_canvas_action on canvas instance ${JSON.stringify(instanceId)}, requestId ${JSON.stringify(id)}. Then follow the reply field of the result.`,
].join("\n");

const rules = {
  passage: [
    "Write the replacement for exactly the returned text. Keep its language, facts and voice unless the instructions say otherwise.",
    "Give plain text for one paragraph: no line breaks, tabs, markup or surrounding quotation marks, at most 4,000 characters.",
    "Call ternleaf_propose with the replacement and a rationale of one sentence. When the instructions leave real choices open, add one or two alternatives that differ in a useful way.",
    "If the text needs no change, or the instructions cannot apply to it, call ternleaf_decline with the reason.",
    "The author accepts or discards the proposal in the canvas. Never apply an edit yourself. Then reply in the chat with one short sentence.",
  ].join(" "),
  document: [
    "Review the paragraphs against the instructions. Call ternleaf_suggest once with the changes that matter, at most 60, in document order.",
    "Each suggestion names a paragraph number, a find text and a replacement. Copy the find text exactly from that paragraph. Make it short, a few words to one sentence, and long enough to occur only once in the paragraph. Keep it inside text with the same formatting when you can. No line breaks or tabs.",
    "Give each suggestion a rationale of one short sentence.",
    "If the instructions ask a question and not for changes, answer in the chat and call ternleaf_decline with the reason 'Answered in the chat.' If nothing needs to change, call ternleaf_decline and say so.",
    "The author reviews each suggestion in the canvas. Never apply an edit yourself. Then reply in the chat with one short sentence.",
  ].join(" "),
};

const canvas = createCanvas({
  id: "ternleaf",
  displayName: "Ternleaf",
  description: "Write and revise a local Word document (DOCX). The author shares a selected passage or the document text and asks for changes, then reviews each proposal before it changes the document.",
  icon: "icon.svg",
  inputSchema: {
    type: "object", additionalProperties: false,
    properties: {
      document: {
        type: "string",
        description: "Optional path of a .docx file inside the project, for example docs/brief.docx. Omit it to open the project's default document.",
      },
    },
  },
  actions: [
    {
      name: "ternleaf_read",
      description: "Read what the author shared from this Ternleaf canvas for one request: a selected passage or the document text, with the author's instructions and the rules for the answer.",
      inputSchema: { type: "object", properties: { requestId }, required: ["requestId"], additionalProperties: false },
      handler: action((host, input) => {
        const shared = host.readReview(input.requestId);
        return { ...shared, reply: shared.scope === "document" ? rules.document : rules.passage };
      }),
    },
    {
      name: "ternleaf_propose",
      description: "Submit replacement text for the shared passage. The author reviews it in the canvas. This action cannot apply an edit.",
      inputSchema: {
        type: "object", additionalProperties: false,
        properties: {
          requestId,
          replacement: { type: "string", description: "The full replacement for the shared text. Plain text, one paragraph." },
          rationale: { type: "string", maxLength: 600, description: "One sentence for the author: what changed and why." },
          alternatives: {
            type: "array", maxItems: 2, items: { type: "string" },
            description: "Optional. One or two other full replacements for the author to choose from.",
          },
        },
        required: ["requestId", "replacement"],
      },
      handler: action((host, input) => ({
        ...host.submitProposal(input.requestId, input.replacement, input.rationale, input.alternatives),
        next: "The proposal is in the canvas for the author's review. Do not apply it. Reply in the chat with one short sentence.",
      })),
    },
    {
      name: "ternleaf_suggest",
      description: "Answer a whole-document request with a list of suggested changes. The author reviews each one in the canvas. This action cannot apply an edit.",
      inputSchema: {
        type: "object", additionalProperties: false,
        properties: {
          requestId,
          suggestions: {
            type: "array", minItems: 1, maxItems: 60,
            items: {
              type: "object", additionalProperties: false,
              properties: {
                paragraph: { type: "integer", minimum: 1, description: "The paragraph number from ternleaf_read." },
                find: { type: "string", description: "Text to replace, copied exactly from that paragraph. It must occur once." },
                replacement: { type: "string", description: "The new text for the find text." },
                rationale: { type: "string", maxLength: 600, description: "One short sentence for the author." },
              },
              required: ["paragraph", "find", "replacement"],
            },
          },
        },
        required: ["requestId", "suggestions"],
      },
      handler: action((host, input) => ({
        ...host.submitSuggestions(input.requestId, input.suggestions),
        next: "The kept suggestions are in the canvas for the author's review. Do not apply them. Reply in the chat with one short sentence.",
      })),
    },
    {
      name: "ternleaf_decline",
      description: "Answer that nothing needs to change, that the instructions cannot apply, or that the answer is in the chat. The author sees the reason.",
      inputSchema: {
        type: "object", additionalProperties: false,
        properties: { requestId, reason: { type: "string", maxLength: 600, description: "One or two sentences for the author." } },
        required: ["requestId", "reason"],
      },
      handler: action((host, input) => host.declineProposal(input.requestId, input.reason)),
    },
  ],
  async open({ instanceId, input, session: context }) {
    let host = instances.get(instanceId);
    if (!host) {
      let settings;
      try {
        settings = resolveProject({ project, workingDirectory: context?.workingDirectory, document: input?.document });
      } catch (error) {
        if (error instanceof ProjectError) throw new CanvasError("project", error.message);
        throw error;
      }
      try {
        host = await startHost({
          ...settings,
          askAgent: async (id, scope) => (session ?? await sessionReady.promise).send({ prompt: prompt(instanceId, id, scope) }),
        });
      } catch (error) {
        if (error instanceof Rejected) throw new CanvasError(error.code, forAgent(error.code));
        throw error;
      }
      instances.set(instanceId, host);
    }
    return { title: host.name, url: host.url };
  },
  async onClose({ instanceId }) {
    const host = instances.get(instanceId);
    instances.delete(instanceId);
    await host?.close();
  },
});

session = await joinSession({ canvases: [canvas] });
sessionReady.resolve(session);
// A turn that ends without an answer leaves the author waiting. Tell each
// open canvas, so the editor can say so.
session.on("session.idle", () => { for (const host of instances.values()) host.agentIdle(); });

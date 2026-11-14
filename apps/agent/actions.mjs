// The actions that Copilot can call on an open Ternleaf canvas. Each action
// is data (name, description, input schema) and one function of the host.
// The Copilot extension adds the canvas instance and the error handling.
import { Rejected } from "../../packages/session/store.mjs";
import { guide, rules } from "./guide.mjs";

const requestId = { type: "string", format: "uuid",
  description: "The request ID from the Ternleaf prompt or from ternleaf_status. Give it to answer a request that the author sent from the canvas. Omit it when the author asked in the chat." };
const instructions = { type: "string", minLength: 1, maxLength: 2000,
  description: "Without a requestId only: the author's request from the chat, in one or two sentences. The author sees it next to your answer." };
const rationale = { type: "string", maxLength: 600, description: "One sentence for the author: what changed and why." };
const object = (properties, required = []) => ({ type: "object", additionalProperties: false, properties, required });
const none = { type: ["object", "null"], additionalProperties: false, properties: {} };

const after = {
  proposal: "The proposal is in the canvas for the author's review. Do not apply it. Reply in the chat with one short sentence.",
  suggestions: "The kept suggestions are in the canvas for the author's review. Do not apply them. Reply in the chat with one short sentence.",
};

export const actions = [
  {
    name: "ternleaf_guide",
    description: "How to work with the Ternleaf canvas: the rules, what to call for each kind of request, and the limits. Read it once before other Ternleaf actions.",
    inputSchema: none,
    run: () => ({ guide }),
  },
  {
    name: "ternleaf_status",
    description: "The state of the canvas now: the open document and its revision, the text that the author has selected, a request from the canvas that waits for your answer, and a review that the author has not finished. Call it first, and again when a call is refused.",
    inputSchema: none,
    run: host => {
      const status = host.status();
      if (status.canvas.selection) host.tellAuthor("Copilot read the selected text.");
      const next = status.request
        ? `A request from the canvas waits. Call ternleaf_read with requestId ${status.request.requestId}.`
        : !status.chatAccess ? "In this project you work only on requests that the author sends from the canvas. Tell the author to send the request from the Review pane."
        : status.review ? "The author has a review open in the canvas. Wait for the author's decision before you send more."
        : !status.canvas.ready ? "The canvas is still loading. Call ternleaf_status again in a few seconds."
        : status.canvas.selection ? "To change the selected text, call ternleaf_propose with text, instructions and replacement. To work on the whole document, call ternleaf_read."
        : "No text is selected. To work on the whole document, call ternleaf_read. To change one passage, ask the author to select it.";
      return { ...status, next };
    },
  },
  {
    name: "ternleaf_read",
    description: "Read the document. With a requestId: what the author shared from the canvas for that request, with the instructions and the rules for the answer. Without a requestId: the text of the current revision in numbered paragraphs, for a question or a request from the chat. The result has the house rules of the project, if it has any. The author is told that you read it.",
    inputSchema: { ...object({
      requestId,
      from: { type: "integer", minimum: 1, description: "Without a requestId only: the first paragraph number to return. Use the next field of an earlier result to continue a long document." },
    }), type: ["object", "null"] },
    run: async (host, input) => {
      if (input?.requestId) {
        const shared = host.readReview(input.requestId);
        const { edition } = host.status();
        return { ...shared, houseRules: host.houseRules(),
          ...(edition ? { edition: { ...edition, note: "This document is an edition of the reference. If the instructions ask for an update, call ternleaf_reference_changes for the changed passages of the reference." } } : {}),
          reply: shared.scope === "document" ? rules.document : rules.passage };
      }
      const text = await host.read({ from: input?.from });
      return { ...text, reply: rules.chat(text.revision) };
    },
  },
  {
    name: "ternleaf_propose",
    description: "Propose replacement text for one passage. The author reviews it in the canvas: this action cannot apply an edit. With a requestId it answers that request. Without one it proposes a change to the text that the author has selected now, for a request from the chat.",
    inputSchema: object({
      requestId,
      replacement: { type: "string", description: "The full replacement for the passage. Plain text, at most 4,000 characters, different from the original. A line break starts a new paragraph. No tabs." },
      rationale,
      alternatives: { type: "array", maxItems: 2, items: { type: "string" },
        description: "Optional. One or two other full replacements for the author to choose from." },
      text: { type: "string", description: "Without a requestId only: the selected text that you replace, copied exactly from ternleaf_status." },
      instructions,
    }, ["replacement"]),
    run: (host, input) => {
      if (input.requestId) {
        return { ...host.submitProposal(input.requestId, input.replacement, input.rationale, input.alternatives), next: after.proposal };
      }
      return { ...host.proposeFromChat(input), next: after.proposal };
    },
  },
  {
    name: "ternleaf_suggest",
    description: "Send a list of suggested changes and remarks on the document text. A suggestion replaces text. A remark points at text and says what you noticed, without a replacement. The author reviews each one in the canvas: this action cannot apply an edit. With a requestId it answers that request. Without one it answers a request from the chat, for the text that you read with ternleaf_read.",
    inputSchema: object({
      requestId,
      suggestions: {
        type: "array", minItems: 1, maxItems: 60,
        description: "The changes and remarks, in document order. Each item has a replacement or a remark, not both.",
        items: object({
          paragraph: { type: "integer", minimum: 1, description: "The paragraph number from ternleaf_read." },
          find: { type: "string", description: "Text to replace or to remark on, copied exactly from that paragraph. It must occur once in the paragraph. No line breaks or tabs." },
          replacement: { type: "string", description: "For a change: the new text for the find text. An empty text removes the find text. A line break in it starts a new paragraph." },
          rationale: { type: "string", maxLength: 600, description: "For a change: one short sentence for the author." },
          remark: { type: "string", minLength: 1, maxLength: 600, description: "For a remark: what you noticed about the find text and what the author can do, in one or two sentences. Use it when no replacement text can solve the problem, for example a claim without a source, a contradiction, a missing owner or date, or a breach of the house rules that needs the author's knowledge." },
        }, ["paragraph", "find"]),
      },
      revision: { type: "integer", minimum: 0, description: "Without a requestId only: the revision number from the ternleaf_read result that the paragraph numbers come from." },
      instructions,
    }, ["suggestions"]),
    run: (host, input) => {
      for (const item of input.suggestions ?? []) {
        if ((item.replacement === undefined) === (item.remark === undefined)) {
          throw new Rejected("invalid-suggestions", "Each suggestion needs a replacement or a remark, and not both.");
        }
      }
      if (input.requestId) return { ...host.submitSuggestions(input.requestId, input.suggestions), next: after.suggestions };
      return { ...host.suggestFromChat(input), next: after.suggestions };
    },
  },
  {
    name: "ternleaf_decline",
    description: "Answer a request from the canvas without a change: nothing needs to change, the instructions cannot apply, or the answer is in the chat. The author sees the reason.",
    inputSchema: object({
      requestId: { ...requestId, description: "The request ID from the Ternleaf prompt or from ternleaf_status." },
      reason: { type: "string", minLength: 1, maxLength: 600, description: "One or two sentences for the author." },
    }, ["requestId", "reason"]),
    run: (host, input) => host.declineProposal(input.requestId, input.reason),
  },
  {
    name: "ternleaf_view_page",
    description: "Look at one page of the document as the author sees it. Returns a picture of the page. Use it for questions about layout, tables, charts, pictures, headers and page breaks. For the text, use ternleaf_read.",
    inputSchema: object({ page: { type: "integer", minimum: 1, description: "The page number, from 1." } }, ["page"]),
    run: async (host, input) => {
      const { page, pages, revision, png, width, height } = await host.viewPage(input.page);
      return {
        textResultForLlm: JSON.stringify({ page, pages, revision, width, height }),
        binaryResultsForLlm: [{ type: "image", mimeType: "image/png", data: png, description: `Page ${page} of ${pages}, revision ${revision}` }],
        resultType: "success",
      };
    },
  },
  {
    name: "ternleaf_export",
    description: "Write the current revision of the document as a file into the exports folder of the project, and get its path. Use it when the author asks for a file, or when another tool needs the document. Never copy or convert the .docx file on disk: it does not have the saved revisions.",
    inputSchema: object({
      format: { type: "string", enum: ["docx", "pdf", "markdown", "html", "text", "changes"], description: "docx is a Word file. markdown keeps headings, lists and tables as text. changes is the change record: a Markdown file with every change that the author accepted, the request, the reason and the author's note." },
    }, ["format"]),
    run: async (host, input) => input.format === "changes" ? host.exportRecord() : ({ ...await host.exportDocument(input.format),
      next: "The file is in the project folder at the path. It is a copy: a change to it does not change the document in the canvas." }),
  },
  {
    name: "ternleaf_measure",
    description: "Find out how long the document would be if the author accepted a list of changes. The engine lays out a copy with the changes and returns the real number of pages and words, now and after. Nothing is saved and the author sees nothing. Use it to fit a document to a length, and to check that your changes can be applied, before you call ternleaf_suggest.",
    inputSchema: object({
      revision: { type: "integer", minimum: 0, description: "The revision number from the ternleaf_read result that the paragraph numbers come from." },
      suggestions: {
        type: "array", minItems: 1, maxItems: 60,
        description: "The changes to try, in the same form as for ternleaf_suggest.",
        items: object({
          paragraph: { type: "integer", minimum: 1, description: "The paragraph number from ternleaf_read." },
          find: { type: "string", description: "Text to replace, copied exactly from that paragraph. It must occur once in the paragraph." },
          replacement: { type: "string", description: "The new text for the find text. An empty text removes the find text." },
        }, ["paragraph", "find", "replacement"]),
      },
    }, ["revision", "suggestions"]),
    run: async (host, input) => {
      const result = await host.measure(input);
      return { ...result, next: result.cannotApply.length
        ? "Some changes cannot be applied. Leave them out or change them before you call ternleaf_suggest."
        : "To propose these changes to the author, call ternleaf_suggest with the same suggestions." };
    },
  },
  {
    name: "ternleaf_reference_changes",
    description: "For a document that is an edition of another document: the passages of the reference document that changed since the author last checked this edition, with the text before and after. Use it to bring the edition up to date. ternleaf_status says whether the open document is an edition.",
    inputSchema: none,
    run: async host => {
      const result = await host.referenceChanges();
      return { ...result, next: result.changes.length
        ? "Read this edition with ternleaf_read. For each change, find the passage of the edition that says the same thing, and propose its update with ternleaf_suggest. That two passages say the same thing is your judgement: name the changed passage of the reference in the rationale, so that the author can check it. Where the edition must change and you cannot write the text, send a remark. Leave out a change that the edition does not cover."
        : "The reference did not change since the author last checked this edition. Tell the author." };
    },
  },
  {
    name: "ternleaf_documents",
    description: "List the Word documents (.docx) of the project folder, with the one that the canvas shows now.",
    inputSchema: none,
    run: host => host.documents(),
  },
  {
    name: "ternleaf_open_document",
    description: "Show another Word document of the project in this canvas. Every revision of the open document is saved, so nothing is lost. The canvas needs a few seconds to load.",
    inputSchema: object({
      document: { type: "string", description: "The path of a .docx file inside the project, from ternleaf_documents, for example docs/brief.docx." },
    }, ["document"]),
    run: (host, input) => {
      host.openDocument(input.document);
      return { opened: host.name, next: "The canvas loads the document now. Call ternleaf_status until the canvas is ready, then continue." };
    },
  },
  {
    name: "ternleaf_history",
    description: "The changes that the author accepted in this document: what was asked, the text before and after, and the author's note. Use it to see what was decided, and to avoid a proposal that the author already had.",
    inputSchema: none,
    run: host => host.history(),
  },
];

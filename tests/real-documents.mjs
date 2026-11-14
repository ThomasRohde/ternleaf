// Ternleaf on documents with the structure that a team really writes.
//
// The corpus (tests/real/make-corpus.py) has numbered headings, merged
// table cells, lists, footnotes, cross-references, headers and footers, a
// landscape section, comments, tracked changes, a table of contents and
// content controls. For each document this test, with the real engine:
// opens it, exports it unchanged, makes text changes through Copilot's
// actions and the author's acceptance in the Review pane, exports again,
// reopens the export in a fresh engine document and lists the source
// structures of both files with an independent reader (tests/real/constructs.py).
//
//   node tests/real-documents.mjs <playwright> <chrome> <engine> <out> <font> [<font> ...]
//
// It writes real-documents.json and real-documents.md into <out>. It fails
// when a result that is in EXPECT changes, so a fixed defect or a new one
// is seen at once.
import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { actions } from "../apps/agent/actions.mjs";
import { validateDocxExport } from "../apps/editor/export-policy.mjs";
import { createWorkspace } from "../apps/host/project.mjs";
import { startHost } from "../apps/host/serve.mjs";
import { refusalForAgent } from "../packages/session/messages.mjs";

const [playwright, chrome, engine, out, font, ...additionalFonts] = process.argv.slice(2);
const fonts = [font, ...additionalFonts].filter(Boolean);
const here = fileURLToPath(new URL(".", import.meta.url));
const run = randomUUID().slice(0, 8);
const corpus = join(out, "real-corpus-" + run);
await mkdir(corpus, { recursive: true });
execFileSync("python3", ["-I", join(here, "real", "make-corpus.py"), corpus]);
const { chromium } = await import(pathToFileURL(playwright));
const browser = await chromium.launch({ executablePath: chrome });
const act = name => actions.find(item => item.name === name).run;
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const until = async (check, what, tries = 150) => {
  for (let attempt = 0; attempt < tries; attempt++) {
    const value = await check();
    if (value) return value;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Timed out: " + what);
};

// The changes for each document: which paragraph (a text that it contains),
// what Copilot finds in it and its replacement. `kind` says what the
// paragraph is. The replacements have Danish letters, so that UTF-8 offsets
// are tested too.
const CHANGES = {
  "adr-event-streaming.docx": [
    { kind: "body", in: "The current queues lose messages", find: "manual reconciliation", replacement: "manuel afstemning" },
    { kind: "list", in: "DORA requires that we can show", find: "critical services", replacement: "critical services and their owners" },
    { kind: "heading", in: "Options that we rejected", find: "rejected", replacement: "did not choose" },
    { kind: "link paragraph", in: "The platform guidelines are in the", find: "Ask the integration team", replacement: "Ask the integrationsteam" },
    { kind: "styled run", in: "event backbone", find: "point-to-point queues", replacement: "point-to-point køer" },
    { kind: "across a link", in: "The platform guidelines are in the", find: "the integration handbook", replacement: "the handbook" },
    { kind: "new list item", in: "The integration team gives each domain", find: "a new topic.", replacement: "a new topic.\nThe template is in the catalogue.", adds: ["numberedParagraphs", "numberingLevels"] },
  ],
  "da-brief-identity.docx": [
    { kind: "body", in: "Which identity platform", find: "cannot be extended", replacement: "kan ikke forlænges" },
    { kind: "table cell", in: "Move to a new identity provider", find: "federation", replacement: "føderation" },
    { kind: "merged cell", in: "High: two platforms", find: "two platforms", replacement: "to platforme" },
    { kind: "header row cell", in: "Description", find: "Description", replacement: "Beskrivelse" },
    { kind: "list", in: "Approve option B as the target", find: "target identity platform", replacement: "target platform for identity" },
    { kind: "heading", in: "Recommendation", find: "Recommendation", replacement: "Anbefaling" },
  ],
  "standard-api.docx": [
    { kind: "body", in: "This standard makes our APIs", find: "one meeting", replacement: "ét møde" },
    { kind: "list", in: "problem details format", find: "problem details format", replacement: "problem details format (RFC 9457)" },
    { kind: "list bold keyword", in: "require OAuth 2.0", find: "MUST", replacement: "SHALL" },
    { kind: "heading", in: "Naming and versions", find: "versions", replacement: "versioner" },
    { kind: "tab paragraph", in: "Contact:", find: "design authority secretary", replacement: "sekretær for design authority" },
    { kind: "across a tab", in: "Contact:", find: "Contact:\tEnterprise", replacement: "Kontakt:\tEnterprise" },
  ],
  "minutes-eada.docx": [
    { kind: "body", in: "ADR-014 blev godkendt", find: "næste møde", replacement: "mødet i november" },
    { kind: "table cell", in: "Tjek kontrakten", find: "dataplacering", replacement: "placering af data" },
    { kind: "second paragraph in cell", in: "Inddrag juridisk", find: "uklar", replacement: "uklar på dette punkt" },
    { kind: "list", in: "Mette Ørsted", find: "Mette Ørsted", replacement: "Mette Ørsted (økonomi)" },
    { kind: "heading", in: "Beslutninger", find: "Beslutninger", replacement: "Beslutninger og godkendelser" },
    { kind: "whole cell text", in: "4. november", find: "4. november", replacement: "11. november", table: true },
    { kind: "remove cell text", in: "Søren Kjær", find: "Søren Kjær", replacement: "", table: true },
  ],
  "notes-crossref.docx": [
    { kind: "body", in: "Sletning af data", find: "aldrig", replacement: "ikke" },
    { kind: "footnote paragraph", in: "This paper covers events", find: "own standard", replacement: "own logging standard" },
    { kind: "field paragraph", in: "lists them", find: "legal minimum", replacement: "lovens minimum" },
    { kind: "table cell", in: "Card scheme rules", find: "Card scheme rules", replacement: "Kortreglerne" },
    { kind: "heading", in: "Retention periods", find: "periods", replacement: "perioder" },
    { kind: "footnote text", in: "logging standard, version 3", find: "version 3", replacement: "version 4", story: "footnote" },
    { kind: "across a field result", in: "lists them", find: "Table 1 lists", replacement: "Tabel 1 viser" },
  ],
  "layout-landscape.docx": [
    { kind: "body", in: "The payment hub is the only system", find: "clearing houses", replacement: "clearingcentralerne" },
    { kind: "landscape table cell", in: "Financial crime", find: "Financial crime", replacement: "Økonomisk kriminalitet" },
    { kind: "landscape body", in: "The landscape page lets", find: "readable size", replacement: "læsbar størrelse" },
    { kind: "heading", in: "Next steps", find: "Next steps", replacement: "Næste skridt" },
    { kind: "header", in: "Target architecture: payments", find: "payments", replacement: "betalinger", story: "header" },
    { kind: "caption", in: "Figure 1:", find: "the events between them", replacement: "the events" },
    { kind: "footer beside a field", in: "of", find: "Page", replacement: "Side", story: "footer" },
    { kind: "remove a header paragraph", in: "Internal. Draft", find: "Internal. Draft for the design authority.", replacement: "", story: "header" },
  ],
  "review-comments.docx": [
    { kind: "body", in: "Each service owner writes", find: "first quarter", replacement: "første kvartal" },
    { kind: "commented paragraph", in: "DORA requires a documented", find: "third party", replacement: "tredjepart" },
    { kind: "paragraph with insertion", in: "The strategy must be tested", find: "updated when", replacement: "opdateret når" },
    { kind: "inside an insertion", in: "The strategy must be tested", find: "once a year", replacement: "twice a year" },
    { kind: "paragraph with deletion", in: "copies of the data", find: "second provider", replacement: "anden leverandør" },
    { kind: "across an insertion edge", in: "The strategy must be tested", find: "tested at least", replacement: "checked at least" },
    { kind: "heading", in: "Options for exit", find: "Options", replacement: "Muligheder" },
  ],
  "toc-controls.docx": [
    { kind: "body", in: "This handbook says how", find: "first week", replacement: "første uge" },
    { kind: "heading", in: "Assessments", find: "Assessments", replacement: "Vurderinger", heading: true },
    { kind: "content control", in: "Document owner:", find: "Søren Kjær", replacement: "Mette Ørsted" },
    { kind: "beside a content control", in: "Document owner:", find: "Document owner", replacement: "Dokumentejer" },
    { kind: "across a content control edge", in: "Dokumentejer:", find: ": Mette", replacement: " - Jens" },
    { kind: "drop-down text that is not a choice", in: "Status:", find: "Draft", replacement: "Godkendt" },
    { kind: "drop-down choice", in: "Status:", find: "Draft", replacement: "Approved" },
    { kind: "block content control", in: "Summary: the handbook", find: "Opdateres hvert halvår", replacement: "Opdateres hvert år" },
    { kind: "table of contents entry", in: "Design authority", find: "Design authority", replacement: "Designmyndighed", toc: true },
  ],
};

// What the corpus must keep giving. A result that passes is asserted here,
// so that a later change that breaks it fails this test. A known defect is
// asserted too, with its current result, so that a fix is noticed and this
// table is updated. See docs/Word-Fidelity.md, "Documents with real structure".
const EXPECT = JSON.parse(await readFile(join(here, "real", "expected.json"), "utf8").catch(() => "{}"));

const results = [];
try {
  for (const file of Object.keys(CHANGES)) {
    console.log("--", file);
    results.push(await prove(file));
  }
} finally {
  await browser.close();
}

// A second reader of the exported files. It is not Word: it only shows that
// the package opens and how many pages LibreOffice lays out.
const soffice = ["/usr/bin/soffice", "/usr/local/bin/soffice"].find(existsSync);
const converted = results.flatMap(result => [result.files.unchanged, result.files.edited].filter(Boolean));
if (soffice && converted.length) {
  const files = results.flatMap(result => [result.files.unchanged, result.files.edited].filter(Boolean));
  const pdf = join(corpus, "libreoffice");
  try {
    execFileSync(soffice, ["--headless", "--convert-to", "pdf", "--outdir", pdf, ...files], { stdio: "ignore", timeout: 240_000 });
  } catch { /* A file that does not convert has no PDF, which the result says. */ }
  for (const result of results) {
    for (const which of ["unchanged", "edited"]) {
      const path = result.files[which];
      if (!path) continue;
      const target = join(pdf, path.split("/").pop().replace(/\.docx$/, ".pdf"));
      let pages = null;
      if (existsSync(target)) {
        const text = (await readFile(target)).toString("latin1");
        pages = (text.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
      }
      result.libreOffice[which] = pages;
    }
  }
}

const json = join(out, "real-documents.json");
await writeFile(json, JSON.stringify({ corpus, engine, fonts, results }, null, 1));
await writeFile(join(out, "real-documents.md"), table(results));
console.log(table(results));

// ---- Compare with EXPECT ---------------------------------------------------
const found = Object.fromEntries(results.map(result => [result.file, summary(result)]));
await writeFile(join(out, "real-documents-summary.json"), JSON.stringify(found, null, 1) + "\n");
const differences = [];
let checks = 0;
for (const [file, expected] of Object.entries(EXPECT)) {
  for (const [key, value] of Object.entries(expected)) {
    checks++;
    const actual = found[file]?.[key];
    if (JSON.stringify(actual) !== JSON.stringify(value)) differences.push(`${file} ${key}: expected ${JSON.stringify(value)}, found ${JSON.stringify(actual)}`);
  }
}
if (!Object.keys(EXPECT).length) console.log("No tests/real/expected.json: write it from " + join(out, "real-documents-summary.json"));
if (differences.length) {
  console.error(differences.join("\n"));
  console.error(`Real documents: ${differences.length} of ${checks} checks differ from tests/real/expected.json.`);
  process.exit(1);
}
console.log(`Real documents: ${checks} checks of ${results.length} documents passed.`);

// ---- One document ---------------------------------------------------------
async function prove(file) {
  const folder = join(out, "real-" + run, file.replace(/\.docx$/, ""));
  await mkdir(join(folder, "docs"), { recursive: true });
  await mkdir(join(folder, ".ternleaf"), { recursive: true });
  const sourceBytes = await readFile(join(corpus, file));
  await writeFile(join(folder, "docs", file), sourceBytes);
  await writeFile(join(folder, ".ternleaf", "canvas.json"), JSON.stringify({ engine, source: "docs/" + file, state: ".ternleaf/state.sqlite", fonts }));
  const workspace = createWorkspace({ project: folder });
  const result = { file, files: {}, libreOffice: {}, errors: [], changes: [] };
  const host = await startHost({ ...workspace.resolve(), workspace, askAgent: () => {} });
  const page = await browser.newPage({ viewport: { width: 1450, height: 1050 } });
  page.on("pageerror", error => result.errors.push(String(error.message)));
  const base = new URL(host.url).origin;
  await page.route("**/*", route => route.request().url().startsWith(base + "/") ? route.continue() : route.abort());
  try {
    await page.goto(host.url, { waitUntil: "domcontentloaded" });
    await page.locator("#ternleaf-panel[data-ready=true] [data-part=name]").filter({ hasText: file }).waitFor({ timeout: 90_000 });
    await until(() => host.status().canvas.ready, "the canvas reports to the host");
    const head = async () => (await page.evaluate(() => window.ternleafSession.state())).head;

    // Open: the counts and the engine's own import findings.
    Object.assign(result, await page.evaluate(() => {
      const doc = window.ternleafEditor.doc;
      const stats = doc.documentStats();
      const counts = { pages: doc.pageCount, words: stats.words, paragraphs: stats.paragraphs };
      stats.free();
      const report = JSON.parse(doc.importReportJson);
      return { opened: counts, importReport: report };
    }));

    // An unchanged export must be the source, byte for byte.
    const unchanged = await exportInPage(page, "exact_if_unchanged");
    result.unchanged = { identical: sha(unchanged.bytes) === sha(sourceBytes), bytes: unchanged.bytes.length, sourceBytes: sourceBytes.length,
      notRetained: notRetained(unchanged.report), refused: refusedBy(unchanged.report) };
    result.files.unchanged = join(folder, file.replace(/\.docx$/, "-unchanged.docx"));
    await writeFile(result.files.unchanged, unchanged.bytes);
    result.unchanged.action = await exportAction(host, folder, sourceBytes);

    // Text changes through Copilot's actions and the author's acceptance.
    for (const change of CHANGES[file]) result.changes.push(await change1(page, host, change, head));
    result.revision = await head();
    // What the preview's check of fields and controls in the export cost.
    result.checkMs = await page.evaluate(() => window.ternleafSession.checkMs());

    // Export after the changes, with the same mode as the editor.
    const edited = await exportInPage(page, result.revision ? "preserve_when_safe" : "exact_if_unchanged");
    result.edited = { bytes: edited.bytes.length, notRetained: notRetained(edited.report), refused: refusedBy(edited.report) };
    result.files.edited = join(folder, file.replace(/\.docx$/, "-edited.docx"));
    await writeFile(result.files.edited, edited.bytes);
    result.edited.action = await exportAction(host, folder);

    // Reopen the export in a fresh engine document. The text must be the
    // text in the editor.
    result.reopen = await page.evaluate(async encoded => {
      const wasm = await import("/pkg/casual_doc_wasm.js");
      const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
      const live = JSON.parse(window.ternleafEditor.doc.searchableText()).map(([, text]) => text);
      let copy;
      try { copy = wasm.open(bytes); } catch (error) { return { opened: false, error: String(error.message ?? error) }; }
      try {
        const again = JSON.parse(copy.searchableText()).map(([, text]) => text);
        const differ = [];
        for (let index = 0; index < Math.max(live.length, again.length); index++) {
          if (live[index] !== again[index]) differ.push({ index, editor: live[index] ?? null, reopened: again[index] ?? null });
        }
        return { opened: true, paragraphs: again.length, sameText: differ.length === 0, differ: differ.slice(0, 6) };
      } finally { copy.free(); }
    }, Buffer.from(edited.bytes).toString("base64"));

    // The source structures, read from both files without the engine.
    const listed = JSON.parse(execFileSync("python3", ["-I", join(here, "real", "constructs.py"), join(corpus, file), result.files.edited], { encoding: "utf8" }));
    const before = listed[join(corpus, file)];
    const after = listed[result.files.edited];
    result.constructs = {};
    const allowed = new Set(CHANGES[file].filter(change => result.changes.find(item => item.kind === change.kind)?.result === "accepted")
      .flatMap(change => change.adds ?? []));
    result.package = { source: before.package, export: after.package };
    for (const key of Object.keys(before)) {
      if (["bodyText", "nonAsciiCharacters", "package"].includes(key)) continue;
      if (allowed.has(key)) { result.constructs[key] = { changedByEdit: true, source: before[key], export: after[key] }; continue; }
      const kept = JSON.stringify(before[key]) === JSON.stringify(after[key]);
      if (!isEmpty(before[key]) || !kept) result.constructs[key] = kept ? "kept" : { source: before[key], export: after[key] };
    }
    // Losses in the export that the engine reported, against those that the
    // independent reader found: a loss that only the reader found is silent.
    result.silent = result.edited.refused.length ? [] : Object.entries(result.constructs)
      .filter(([, value]) => value !== "kept" && !value.changedByEdit).map(([key]) => key);
  } catch (error) {
    result.errors.push("harness: " + String(error.stack ?? error));
  } finally {
    await page.goto("about:blank").catch(() => {});
    await page.close().catch(() => {});
    await host.close();
  }
  return result;
}

async function exportInPage(page, mode) {
  const { bytes, report } = await page.evaluate(policy => {
    const output = window.ternleafEditor.doc.exportAs("org.openxmlformats.wordprocessingml.document", policy);
    try {
      const content = output.bytes;
      let binary = "";
      for (let at = 0; at < content.length; at += 0x8000) binary += String.fromCharCode(...content.subarray(at, at + 0x8000));
      return { bytes: btoa(binary), report: output.reportJson };
    } finally { output.free(); }
  }, mode);
  return { bytes: Buffer.from(bytes, "base64"), report };
}

function notRetained(report) {
  return JSON.parse(report).entries.filter(entry => entry.retentionOutcome === "not_retained").map(entry => entry.feature);
}
function refusedBy(report) {
  try { validateDocxExport(report); return []; } catch (error) { return error.features ?? [String(error.message)]; }
}

// Copilot's own export: the same check, and the sentence that Copilot gets.
async function exportAction(host, folder, compare) {
  try {
    const exported = await act("ternleaf_export")(host, { format: "docx" });
    const bytes = await readFile(join(folder, exported.path));
    const listed = JSON.parse(execFileSync("python3", ["-I", join(here, "real", "constructs.py"), join(folder, exported.path)], { encoding: "utf8" }));
    return { written: true, revision: exported.revision, bytes: bytes.length, stored: Object.values(listed)[0].package.stored.length > 0,
      ...(compare ? { identical: sha(bytes) === sha(compare) } : {}) };
  } catch (error) {
    return { written: false, code: error.code ?? null, sentence: refusalForAgent(error) };
  }
}

// One change: read, suggest, review and accept in the pane.
async function change1(page, host, change, head) {
  const outcome = { kind: change.kind, find: change.find, replacement: change.replacement };
  try {
    const text = await act("ternleaf_read")(host, {});
    const all = [];
    for (let part = text; ; ) {
      all.push(...part.paragraphs);
      if (!part.next) break;
      part = await act("ternleaf_read")(host, { from: part.next });
    }
    const matching = all.filter(item => item.text.includes(change.in) && item.text.includes(change.find));
    const stories = await page.evaluate(numbers => {
      const doc = window.ternleafEditor.doc;
      const list = JSON.parse(doc.searchableText()).filter(([, item]) => item.trim());
      return numbers.map(number => doc.storyKind(list[number - 1][0]));
    }, matching.map(item => item.paragraph));
    const candidates = matching.filter((item, index) => stories[index] === (change.story ?? "body"));
    const tables = await page.evaluate(numbers => {
      const doc = window.ternleafEditor.doc;
      const list = JSON.parse(doc.searchableText()).filter(([, item]) => item.trim());
      return numbers.map(number => doc.inTable(list[number - 1][0]));
    }, candidates.map(item => item.paragraph));
    const paragraph = change.heading ? candidates.find(item => item.heading) : change.toc ? candidates.find(item => !item.heading)
      : change.table ? candidates.find((item, index) => tables[index]) : candidates[0];
    if (!paragraph) {
      outcome.result = "not read";
      outcome.detail = "No paragraph of ternleaf_read has this text.";
      return outcome;
    }
    outcome.read = { paragraph: paragraph.paragraph, heading: paragraph.heading ?? null, text: paragraph.text };
    outcome.where = await page.evaluate(([number]) => {
      const doc = window.ternleafEditor.doc;
      const [node, value] = JSON.parse(doc.searchableText()).filter(([, item]) => item.trim())[number - 1];
      return { node, story: doc.storyKind(node), inTable: doc.inTable(node), listLevel: doc.listLevelAt(node),
        style: doc.paragraphStyleAt(node), length: doc.paragraphLength(node), utf8: new TextEncoder().encode(value).length,
        runs: JSON.parse(doc.copyRichRuns(node, 0, node, doc.paragraphLength(node))).map(run => Object.keys(run).filter(key => key !== "text").join("+") || "plain") };
    }, [paragraph.paragraph]);
    const revision = await head();
    let sent;
    try {
      sent = await act("ternleaf_suggest")(host, { instructions: "Apply the editor's wording.", revision: text.revision,
        suggestions: [{ paragraph: paragraph.paragraph, find: change.find, replacement: change.replacement, rationale: "Wording from the review." }] });
    } catch (error) {
      outcome.result = "refused by ternleaf_suggest";
      outcome.detail = refusalForAgent(error);
      return outcome;
    }
    if (sent.refused.length) { outcome.result = "refused by ternleaf_suggest"; outcome.detail = sent.refused; return outcome; }
    const row = page.locator("#ternleaf-panel [data-part=queue-list] li").first();
    await until(async () => ["open", "blocked"].includes(await row.getAttribute("data-state").catch(() => null)), "the suggestion in the pane");
    if (await row.getAttribute("data-state") === "blocked") {
      outcome.result = "blocked in the pane";
      outcome.detail = await row.locator(".tl-blocked").textContent();
      await row.locator("[data-action=skip]").click();
      await until(async () => await row.getAttribute("data-state").catch(() => null) === "skipped", "the skipped suggestion");
      return outcome;
    }
    await row.locator("[data-action=adopt]").click();
    const panel = page.locator("#ternleaf-panel");
    const mode = await until(async () => {
      const value = await panel.getAttribute("data-mode");
      return ["proposal", "problem"].includes(value) && value;
    }, "the proposal or a problem");
    if (mode === "problem") {
      outcome.result = "refused in the review";
      outcome.detail = await panel.locator("[data-part=notice-text]").textContent();
      await panel.locator("[data-part=notice] [data-action=discard]").click();
      await until(async () => await panel.getAttribute("data-mode") === "compose", "the discarded proposal");
      return outcome;
    }
    outcome.warning = await panel.locator("[data-part=mixed]").isVisible() ? await panel.locator("[data-part=mixed]").textContent() : null;
    outcome.notice = await panel.locator("[data-part=removes]").isVisible() ? await panel.locator("[data-part=removes]").textContent() : null;
    await panel.getByRole("button", { name: "Accept change" }).click();
    try {
      await until(async () => await head() === revision + 1, "the accepted change", 100);
    } catch {
      outcome.result = "accept failed";
      outcome.detail = await panel.locator("[role=status]").first().textContent();
      if (await panel.getAttribute("data-mode") !== "compose") await panel.locator("[data-action=discard]:visible").first().click().catch(() => {});
      return outcome;
    }
    // The paragraph as it is now, and the paragraphs that a line break in
    // the replacement made after it.
    const lines = paragraph.text.replace(change.find, change.replacement).split("\n");
    const now = await page.evaluate(([node, count]) => {
      const doc = window.ternleafEditor.doc;
      const list = JSON.parse(doc.searchableText());
      const at = list.findIndex(([id]) => id === node);
      if (at < 0) return { gone: true };
      return { text: list.slice(at, at + count).map(([, value]) => value),
        listLevels: list.slice(at, at + count).map(([id]) => doc.listLevelAt(id)),
        inTable: doc.inTable(node) };
    }, [outcome.where.node, lines.length]);
    // A removal takes the paragraph away only when the review says so.
    // Otherwise the paragraph stays, empty.
    const removed = change.replacement === "" && change.find === paragraph.text;
    const wanted = removed ? (/removes the whole paragraph/.test(outcome.notice ?? "") ? null : [""]) : lines;
    if (now.gone) outcome.result = wanted === null ? "accepted" : "accepted, paragraph gone";
    else outcome.result = JSON.stringify(now.text) === JSON.stringify(wanted) ? "accepted" : "accepted, wrong text";
    if (outcome.result !== "accepted") outcome.detail = { expected: wanted, actual: now };
    if (lines.length > 1) outcome.newParagraphListLevels = now.listLevels;

    return outcome;
  } catch (error) {
    outcome.result = "exception";
    outcome.detail = String(error.message ?? error);
    return outcome;
  }
}

function isEmpty(value) {
  return value === 0 || (Array.isArray(value) && !value.length) || (value && typeof value === "object" && !Array.isArray(value) && !Object.keys(value).length);
}

// The facts that EXPECT asserts.
function summary(result) {
  return {
    pages: result.opened?.pages ?? null,
    unchangedIdentical: result.unchanged?.identical ?? null,
    unchangedAction: result.unchanged?.action?.written ? (result.unchanged.action.identical ? "identical" : "written, differs") : result.unchanged?.action?.code ?? null,
    changes: (result.changes ?? []).map(change => `${change.kind}: ${change.result}`),
    editedRefused: result.edited?.refused ?? null,
    editedAction: result.edited?.action?.written ? "written" : result.edited?.action?.code ?? null,
    // What Ternleaf writes: the engine stores the entries of an edited
    // export, and the editor compresses them (apps/editor/zip.mjs).
    editedActionStored: result.edited?.action?.written ? result.edited.action.stored : null,
    editedActionSentence: result.edited?.action?.sentence ?? null,
    reopenSameText: result.reopen?.sameText ?? null,
    lost: Object.entries(result.constructs ?? {}).filter(([, value]) => value !== "kept" && !value.changedByEdit).map(([key]) => key).sort(),
    silent: result.silent ? [...result.silent].sort() : null,
    newParagraphListLevels: (result.changes ?? []).filter(change => change.newParagraphListLevels).map(change => change.newParagraphListLevels),
    // What the author or Copilot is told: the reason of each refusal, and
    // the review's notice about a removed paragraph.
    reasons: (result.changes ?? []).filter(change => change.result !== "accepted" && change.detail)
      .map(change => `${change.kind}: ${typeof change.detail === "string" ? change.detail : JSON.stringify(change.detail)}`),
    notices: (result.changes ?? []).filter(change => change.notice).map(change => `${change.kind}: ${change.notice}`),
    editedStored: (result.package?.export?.stored?.length ?? 0) > 0,
    errors: result.errors.length,
  };
}

function table(list) {
  const cell = value => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
  const lines = ["| Document | Pages | Words | Unchanged export | Changes accepted | Refused or blocked changes | Edited export | Reopen text | Lost constructs | LibreOffice pages |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"];
  for (const result of list) {
    const accepted = result.changes.filter(change => change.result === "accepted").map(change => change.kind);
    const other = result.changes.filter(change => change.result !== "accepted")
      .map(change => `${change.kind}: ${change.result}${change.detail ? " (" + (typeof change.detail === "string" ? change.detail : JSON.stringify(change.detail)) + ")" : ""}`);
    const lost = Object.entries(result.constructs ?? {}).filter(([, value]) => value !== "kept" && !value.changedByEdit)
      .map(([key]) => key + (result.silent?.includes(key) ? " (silent)" : ""));
    lines.push("| " + [result.file, result.opened?.pages, result.opened?.words,
      result.unchanged ? (result.unchanged.identical ? "byte-identical" : "differs") : "-",
      accepted.join(", ") || "none", other.join("; ") || "none",
      result.edited ? (result.edited.refused.length ? "refused: " + result.edited.refused.join(", ") : "allowed") : "-",
      result.reopen ? (result.reopen.sameText ? "same" : "differs") : "-",
      lost.join(", ") || "none",
      `${result.libreOffice.unchanged ?? "-"} / ${result.libreOffice.edited ?? "-"}`,
    ].map(cell).join(" | ") + " |");
    if (result.checkMs?.length) lines.push(`| ${cell(result.file)} export check | ${result.checkMs.length} previews, ${Math.round(Math.min(...result.checkMs))} to ${Math.round(Math.max(...result.checkMs))} ms | | | | | | | | |`);
    if (result.errors.length) lines.push(`| ${cell(result.file)} errors | ${cell(result.errors.join(" / ").slice(0, 400))} | | | | | | | | |`);
  }
  return lines.join("\n") + "\n";
}

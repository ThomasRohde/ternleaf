// Make docs/assets/ternleaf-tour.gif, the moving picture in the README, from
// screenshots of the real editor.
//
//   node scripts/make-tour-gif.mjs <playwright> <chrome> [out] [font ...]
//
//   playwright  The path of the Playwright module, for example
//               /opt/npm-tools/node_modules/playwright/index.mjs
//   chrome      The path of a Chrome or Chromium executable.
//   out         Optional. The GIF to write. The default is
//               docs/assets/ternleaf-tour.gif in the repository.
//   font ...    Optional. Font files to load, for example the four faces of
//               Liberation Sans, which has the same metrics as Arial.
//
// The script needs Python 3 with Pillow, which puts the frames together.
// It opens examples/welcome-to-ternleaf.docx in a scratch project, acts as
// Copilot through the canvas actions (as tests/browser.mjs does), and holds
// each important frame long enough to read. Nothing in the repository
// changes, except the GIF.
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { actions } from "../apps/agent/actions.mjs";
import { createWorkspace } from "../apps/host/project.mjs";
import { startHost } from "../apps/host/serve.mjs";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [playwright, chrome, target = join(repo, "docs/assets/ternleaf-tour.gif"), ...fonts] = process.argv.slice(2);
if (!playwright || !chrome) {
  console.error("Usage: node scripts/make-tour-gif.mjs <playwright> <chrome> [out] [font ...]");
  process.exit(2);
}
const { chromium } = await import(pathToFileURL(playwright));
const act = name => actions.find(item => item.name === name).run;
const width = 1200, height = 800;

// A scratch project with the two examples. The rules come later.
const folder = await mkdtemp(join(tmpdir(), "ternleaf-gif-"));
const frames = join(folder, "frames");
await mkdir(join(folder, "examples"), { recursive: true });
await mkdir(join(folder, ".ternleaf"));
await mkdir(frames);
for (const name of ["welcome-to-ternleaf.docx", "house-rules-tour.docx"]) {
  await copyFile(join(repo, "examples", name), join(folder, "examples", name));
}
await writeFile(join(folder, ".ternleaf", "canvas.json"), JSON.stringify({
  engine: join(repo, "engine/prebuilt/webapp"), ...(fonts.length ? { fonts } : {}),
  source: "examples/welcome-to-ternleaf.docx", state: ".ternleaf/welcome.sqlite" }));

const workspace = createWorkspace({ project: folder });
let requestId;
const host = await startHost({ ...workspace.resolve(), workspace, askAgent: id => { requestId = id; } });
const browser = await chromium.launch({ executablePath: chrome });
const shots = [];
try {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on("pageerror", error => console.error(error.message));
  await page.goto(host.url, { waitUntil: "domcontentloaded" });
  await page.locator("#ternleaf-panel [role=status]").filter({ hasText: /^Saved at revision / }).waitFor({ timeout: 60_000 });
  const until = async (check, what) => {
    for (let attempt = 0; attempt < 150; attempt++) {
      if (await check()) return;
      await new Promise(done => setTimeout(done, 100));
    }
    throw new Error("Timed out: " + what);
  };
  // A caption at the top of the frame says what happens in it.
  const caption = text => page.evaluate(value => {
    let box = document.querySelector("#tour-caption");
    if (!box) {
      box = document.createElement("div");
      box.id = "tour-caption";
      box.style.cssText = "position:fixed;left:37%;top:96px;transform:translateX(-50%);z-index:99999;"
        + "background:#1b2a6b;color:#fff;font:600 17px/1.3 system-ui,sans-serif;padding:9px 18px;border-radius:8px;"
        + "box-shadow:0 4px 18px rgba(0,0,0,.25);pointer-events:none;white-space:nowrap";
      document.body.append(box);
    }
    box.textContent = value;
    box.hidden = !value;
  }, text);
  const shoot = async hold => {
    await page.waitForTimeout(400);
    const file = join(frames, String(shots.length).padStart(3, "0") + ".png");
    await page.screenshot({ path: file });
    shots.push([file, hold]);
  };
  // The screen position of a byte offset in a paragraph.
  const point = (text, offset) => page.evaluate(([wanted, at]) => {
    const doc = window.ternleafEditor.doc;
    const [node, value] = JSON.parse(doc.searchableText()).find(([, paragraph]) => paragraph.startsWith(wanted));
    const bytes = at < 0 ? new TextEncoder().encode(value).length : at;
    const [index, x, y, , h] = doc.caretRect(node, bytes);
    const canvas = document.querySelectorAll(".page-wrap canvas.page")[index - 1];  // Pages count from 1.
    const box = canvas.getBoundingClientRect();
    const scale = box.width / (210 / 25.4 * 1440);
    return { x: box.left + x * scale, y: box.top + (y + h / 2) * scale };
  }, [text, offset]);

  await page.waitForTimeout(1500);
  globalThis.tourPage = page;
  await caption("A Word document in the Copilot canvas");
  await shoot(2200);

  // 1. Select a sentence. The bubble appears.
  const wordy = "In order to be able to make a decision";
  const start = await point(wordy, 0);
  const end = await point(wordy, -1);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move((start.x + end.x) / 2, end.y, { steps: 4 });
  await caption("Select a sentence");
  await shoot(700);
  await page.mouse.move(end.x, end.y, { steps: 4 });
  await page.mouse.up();
  await page.locator("#ternleaf-bubble").waitFor({ state: "visible" });
  await caption("A bubble offers quick requests. Choose Shorten.");
  await shoot(2200);

  // 2. The request goes to Copilot, and a proposal comes back.
  await page.locator("#ternleaf-bubble").getByRole("button", { name: "Shorten" }).click();
  await page.getByText("Waiting for Copilot").first().waitFor();
  await caption("Copilot gets only the selected text");
  await shoot(1300);
  host.submitProposal(requestId, "To make a decision, the committee asks each member to read the report before the meeting.",
    "Removed the filler words. The request and the reason stay.");
  const panel = page.locator("#ternleaf-panel");
  await panel.locator("ins").first().waitFor();
  await caption("The proposal: the changed words and the reason");
  await shoot(3000);
  await panel.locator("[data-part=page]").scrollIntoViewIfNeeded();
  await caption("The page after the change, before you accept");
  await shoot(2400);
  await panel.locator(".tl-body").evaluate(body => { body.scrollTop = 0; });

  // 3. Accept. The document changes, as one revision.
  await panel.getByRole("button", { name: "Accept change" }).click();
  await page.getByText("Saved at revision 1").first().waitFor();
  await caption("Accept. Only your acceptance changes the document.");
  await shoot(2400);

  // 4. House rules: the project gets the example rules, and the tour opens.
  await copyFile(join(repo, "examples/ternleaf.rules.example.md"), join(folder, "ternleaf.rules.md"));
  host.openDocument("examples/house-rules-tour.docx");
  await panel.locator("[data-part=name]").filter({ hasText: "house-rules-tour.docx" }).waitFor({ timeout: 60_000 });
  await panel.locator("[data-part=checks-title]").filter({ hasText: /House rules: 4 of 5 checks fail/ }).waitFor({ timeout: 30_000 });
  await until(() => host.status().canvas.ready, "the canvas shows the tour");
  // Show the paper on page 2, which breaks the rules.
  const paper = await point("A shared review checklist", 0);
  await page.mouse.move(paper.x + 200, 500);
  await page.mouse.wheel(0, paper.y - 260);
  await caption("House rules: Ternleaf checks some rules itself, as you write");
  await shoot(3000);

  // 5. A review against the house rules: a suggestion and a remark.
  const text = await act("ternleaf_read")(host, {});
  const find = start => text.paragraphs.find(item => item.text.startsWith(start)).paragraph;
  await act("ternleaf_suggest")(host, { instructions: "Review this document against the house rules.", revision: text.revision, suggestions: [
    { paragraph: find("Two other teams"), find: "utilize", replacement: "use", rationale: "The house rules say use, not utilize." },
    { paragraph: find("Last year, a review"), find: "14 working days", remark: "This number has no source. Name the source and the date." },
    { paragraph: find("The pilot starts"), find: "1 April", remark: "The section Our view says 1 March. Which date is correct?" },
  ] });
  await page.getByText("1 suggestion and 2 remarks to review").waitFor();
  await caption("Copilot suggests a fix, and leaves a remark where only you have the facts");
  await shoot(3600);

  await panel.locator("li[data-kind=remark]").first().getByRole("button", { name: "Add as comment" }).click();
  await page.getByText("The remark is now a comment in the document.").waitFor();
  await panel.locator("[data-part=queue-list]").getByRole("button", { name: "Review" }).first().click();
  await panel.locator("[data-part=rationale-text]").filter({ hasText: "use, not utilize" }).waitFor();
  await panel.getByRole("button", { name: "Accept change" }).click();
  await panel.locator("[data-part=checks-title]").filter({ hasText: /House rules: 3 of 5 checks fail/ }).waitFor();
  await panel.locator(".tl-body").evaluate(body => { body.scrollTop = 0; });
  await caption("A remark becomes a Word comment. The fixed check leaves the list.");
  await shoot(3400);
} catch (error) {
  // A picture of the failure helps more than the message alone.
  await globalThis.tourPage?.screenshot({ path: join(folder, "failure.png") }).catch(() => {});
  console.error("See " + join(folder, "failure.png"));
  throw error;
} finally {
  await browser.close();
  await host.close();
}

// Put the frames together. Each frame has its own hold, in milliseconds.
const list = join(folder, "frames.json");
await writeFile(list, JSON.stringify(shots));
execFileSync("python3", ["-c", `
import json, sys
from PIL import Image
shots = json.load(open(sys.argv[1]))
images = [Image.open(path).convert("RGB") for path, _ in shots]
# One shared palette keeps the colours steady from frame to frame.
sheet = Image.new("RGB", (images[0].width, images[0].height * len(images)))
for index, image in enumerate(images):
    sheet.paste(image, (0, index * image.height))
palette = sheet.quantize(colors=255, method=Image.Quantize.MEDIANCUT)
frames = [image.quantize(palette=palette, dither=Image.Dither.NONE) for image in images]
frames[0].save(sys.argv[2], save_all=True, append_images=frames[1:], duration=[hold for _, hold in shots],
               loop=0, optimize=True, disposal=1)
`, list, target], { stdio: "inherit" });
console.log(target, shots.length + " frames", shots.reduce((sum, [, hold]) => sum + hold, 0) / 1000 + " s");

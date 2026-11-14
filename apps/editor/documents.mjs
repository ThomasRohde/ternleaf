// The documents of the project: open one, make a new one, or add a copy of a
// file from the author's computer. The host does the work (apps/host). This
// module is the two dialogs and the rules for what the editor's own File
// commands mean inside a Ternleaf project.
import { open as parse } from "/pkg/casual_doc_wasm.js";
import { DOCUMENT_TEMPLATES, templateBytes, templateName } from "/src/blank_document.mjs";
import { ago } from "./time.mjs";

const escape = text => String(text).replace(/[&<>"]/g, mark => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[mark]);
const base64 = bytes => {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(binary);
};
const size = bytes => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function dialog(id, label, html) {
  const element = document.createElement("dialog");
  element.id = id;
  element.className = "tl-dialog";
  element.setAttribute("aria-label", label);
  element.innerHTML = html;
  document.body.append(element);
  // A click on the backdrop closes the dialog, as Escape does.
  element.addEventListener("click", event => { if (event.target === element) element.close(); });
  // Typing in a dialog must not reach the document's shortcut handlers.
  element.addEventListener("keydown", event => { if (event.key !== "Escape") event.stopPropagation(); });
  return element;
}

// Ask the author a yes-or-no question. Resolves to true for yes.
export function confirmDialog({ title, paragraphs, yes, no = "Cancel" }) {
  const element = dialog("ternleaf-confirm", title, `
    <header><h2>${escape(title)}</h2></header>
    <div class="tl-confirm">${paragraphs.map(text => `<p>${escape(text)}</p>`).join("")}</div>
    <footer>
      <button type="button" class="tl-button tl-primary" data-do="yes">${escape(yes)}</button>
      <button type="button" class="tl-button" data-do="no">${escape(no)}</button>
    </footer>`);
  return new Promise(resolve => {
    let answer = false;
    element.addEventListener("click", event => {
      const choice = event.target.closest("[data-do]")?.dataset.do;
      if (!choice) return;
      answer = choice === "yes";
      element.close();
    });
    element.addEventListener("close", () => { element.remove(); resolve(answer); });
    element.showModal();
    element.querySelector('[data-do="yes"]').focus();
  });
}

// A window with a text for the author to copy, for example a commit
// message. Resolves when the author closes it.
export function copyDialog({ title, paragraphs, label, text, copy, done = "Close" }) {
  const element = dialog("ternleaf-copy", title, `
    <header><h2>${escape(title)}</h2></header>
    <div class="tl-confirm">${paragraphs.map(line => `<p>${escape(line)}</p>`).join("")}
      <label class="tl-field"><span>${escape(label)}</span>
        <textarea data-part="text" rows="${Math.min(12, text.split("\n").length + 1)}" readonly spellcheck="false">${escape(text)}</textarea>
      </label>
      <p class="tl-help" data-part="copied" role="status"></p>
    </div>
    <footer>
      <button type="button" class="tl-button tl-primary" data-do="copy">${escape(copy)}</button>
      <button type="button" class="tl-button" data-do="done">${escape(done)}</button>
    </footer>`);
  const field = element.querySelector('[data-part="text"]');
  return new Promise(resolve => {
    element.addEventListener("click", async event => {
      const choice = event.target.closest("[data-do]")?.dataset.do;
      if (choice === "done") element.close();
      if (choice !== "copy") return;
      let copied = false;
      try { await navigator.clipboard.writeText(text); copied = true; }
      catch {
        // A canvas can refuse the clipboard. The selected text is the way out.
        field.select();
        try { copied = document.execCommand("copy"); } catch { /* The text stays selected. */ }
      }
      element.querySelector('[data-part="copied"]').textContent = copied
        ? "Copied." : "Ternleaf could not copy. The text is selected: press Ctrl+C.";
    });
    element.addEventListener("close", () => { element.remove(); resolve(); });
    element.showModal();
    element.querySelector('[data-do="copy"]').focus();
  });
}

// A window with one choice from a list. Resolves to the chosen value, or to
// undefined when the author cancels.
export function selectDialog({ title, paragraphs, label, options, value, yes, no = "Cancel" }) {
  const element = dialog("ternleaf-select", title, `
    <header><h2>${escape(title)}</h2></header>
    <div class="tl-confirm">${paragraphs.map(text => `<p>${escape(text)}</p>`).join("")}
      <label class="tl-field"><span>${escape(label)}</span>
        <select data-part="choice">${options.map(option =>
          `<option value="${escape(option.value)}"${option.value === value ? " selected" : ""}>${escape(option.label)}</option>`).join("")}</select>
      </label>
    </div>
    <footer>
      <button type="button" class="tl-button tl-primary" data-do="yes">${escape(yes)}</button>
      <button type="button" class="tl-button" data-do="no">${escape(no)}</button>
    </footer>`);
  return new Promise(resolve => {
    let answer;
    element.addEventListener("click", event => {
      const choice = event.target.closest("[data-do]")?.dataset.do;
      if (!choice) return;
      if (choice === "yes") answer = element.querySelector('[data-part="choice"]').value;
      element.close();
    });
    element.addEventListener("close", () => { element.remove(); resolve(answer); });
    element.showModal();
    element.querySelector('[data-part="choice"]').focus();
  });
}

export function createDocuments({ api, upload, toast, reload }) {
  let listing = { documents: [], folders: [""], current: null };
  let busy = false;

  // ---- Open ---------------------------------------------------------------
  const picker = dialog("ternleaf-documents", "Open a document", `
    <header><h2>Open a document</h2>
      <button type="button" class="tl-icon" data-do="close" aria-label="Close">×</button></header>
    <input type="search" data-part="search" placeholder="Search the documents in this project"
      aria-label="Search the documents in this project" autocomplete="off" spellcheck="false">
    <p class="tl-dialog-status" data-part="status" role="status"></p>
    <div class="tl-doc-list" data-part="list" role="listbox" aria-label="Documents"></div>
    <div class="tl-confirm" data-part="confirm" hidden>
      <h3>This file changed outside Ternleaf</h3>
      <p><span data-part="confirm-name"></span> is different from the file that Ternleaf opened before. Its saved revisions belong to the earlier file.</p>
      <p>You can start a new history from the file as it is now. Ternleaf keeps the earlier history in the folder .ternleaf/archive.</p>
      <div class="tl-actions">
        <button type="button" class="tl-button tl-primary" data-do="restart">Start a new history</button>
        <button type="button" class="tl-button" data-do="back">Cancel</button>
      </div>
    </div>
    <footer>
      <button type="button" class="tl-button" data-do="new">New document…</button>
      <button type="button" class="tl-button" data-do="browse">Add a file from this computer…</button>
    </footer>`);
  const part = (root, name) => root.querySelector(`[data-part="${name}"]`);
  const search = part(picker, "search");
  const list = part(picker, "list");
  let changed = null;

  function renderList() {
    const words = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const shown = listing.documents.filter(item => words.every(word => item.path.toLowerCase().includes(word)));
    part(picker, "status").textContent = listing.single ? "This canvas shows one document."
      : !listing.documents.length ? "This project has no Word documents yet. Make a new one, or add a file."
      : !shown.length ? "No document matches the search."
      : listing.more ? "The project has many documents. Search to find the others." : "";
    list.innerHTML = shown.map(item => {
      const now = item.path === listing.current;
      const meta = now ? "Open now"
        : item.opened ? `${item.revisions ?? 0} ${item.revisions === 1 ? "revision" : "revisions"}, opened ${ago(item.opened)}`
        : `Not opened yet, changed ${ago(item.modified)}`;
      return `<button type="button" role="option" class="tl-doc" data-path="${escape(item.path)}" aria-selected="${now}" ${now ? 'data-current="true"' : ""}>
        <span class="ms" aria-hidden="true">description</span>
        <span class="tl-doc-name"><strong>${escape(item.name.replace(/\.docx$/i, ""))}</strong>
          <span>${escape(item.folder || "Project folder")}, ${size(item.bytes)}</span></span>
        <span class="tl-doc-meta">${escape(meta)}</span></button>`;
    }).join("");
  }

  async function openPath(path, restart = false) {
    if (busy) return;
    busy = true;
    part(picker, "status").textContent = "Opening…";
    try {
      await api("open", { path, restart });
      reload();
    } catch (error) {
      busy = false;
      if (error.code === "source-already-set" && !restart) {
        changed = path;
        part(picker, "confirm-name").textContent = path;
        part(picker, "confirm").hidden = false;
        list.hidden = search.hidden = true;
        part(picker, "status").textContent = "";
        picker.querySelector('[data-do="restart"]').focus();
      } else part(picker, "status").textContent = error.message;
    }
  }

  async function open() {
    part(picker, "confirm").hidden = true;
    list.hidden = search.hidden = false;
    search.value = "";
    part(picker, "status").textContent = "Looking for documents…";
    list.innerHTML = "";
    if (!picker.open) picker.showModal();
    search.focus();
    try {
      listing = await api("documents", {});
      for (const control of picker.querySelectorAll('[data-do="new"], [data-do="browse"]')) control.hidden = Boolean(listing.single);
      renderList();
    } catch (error) { part(picker, "status").textContent = error.message; }
  }

  search.addEventListener("input", renderList);
  picker.addEventListener("keydown", event => {
    const rows = [...list.querySelectorAll(".tl-doc")];
    if (!rows.length || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;
    event.preventDefault();
    const at = rows.indexOf(document.activeElement);
    rows[Math.max(0, Math.min(rows.length - 1, at + (event.key === "ArrowDown" ? 1 : -1)))].focus();
  });
  search.addEventListener("keydown", event => {
    if (event.key === "Enter") list.querySelector(".tl-doc:not([data-current])")?.click();
  });
  picker.addEventListener("click", event => {
    const row = event.target.closest(".tl-doc");
    if (row) {
      if (row.dataset.current) picker.close();
      else void openPath(row.dataset.path);
      return;
    }
    switch (event.target.closest("[data-do]")?.dataset.do) {
      case "close": picker.close(); break;
      case "new": picker.close(); void create(); break;
      case "browse": picker.close(); document.querySelector("#file")?.click(); break;
      case "restart": void openPath(changed, true); break;
      case "back": void open(); break;
    }
  });

  // ---- New ----------------------------------------------------------------
  const maker = dialog("ternleaf-new", "New document", `
    <form method="dialog">
      <header><h2>New document</h2>
        <button type="button" class="tl-icon" data-do="close" aria-label="Close">×</button></header>
      <div class="tl-templates" data-part="templates" role="radiogroup" aria-label="Start from"></div>
      <label class="tl-field">Name
        <input type="text" data-part="name" maxlength="100" required autocomplete="off" spellcheck="false"></label>
      <label class="tl-field">Folder
        <select data-part="folder"></select></label>
      <p class="tl-dialog-status" data-part="status" role="status"></p>
      <footer>
        <button type="submit" class="tl-button tl-primary" data-do="create">Create document</button>
        <button type="button" class="tl-button" data-do="close">Cancel</button>
      </footer>
    </form>`);
  let preset = null;

  function describe() {
    const folder = part(maker, "folder").value;
    const name = part(maker, "name").value.trim();
    part(maker, "status").textContent = name ? `Ternleaf writes ${folder ? folder + "/" : ""}${name}.docx in this project.` : "";
  }

  async function create(from = null) {
    preset = from;
    const templates = part(maker, "templates");
    templates.hidden = Boolean(from);
    templates.innerHTML = DOCUMENT_TEMPLATES.map((template, index) => `
      <label class="tl-template"><input type="radio" name="template" value="${escape(template.id)}" ${index === 0 ? "checked" : ""}>
        <span class="ms" aria-hidden="true">${escape(template.icon)}</span>
        <strong>${escape(template.label)}</strong><span>${escape(template.description)}</span></label>`).join("");
    part(maker, "name").value = from ? from.name : "Untitled document";
    part(maker, "status").textContent = "";
    if (!maker.open) maker.showModal();
    part(maker, "name").select();
    try {
      listing = await api("documents", {});
      const folders = [...new Set(["documents", ...listing.folders])].filter(folder => !folder.startsWith("examples") && !folder.startsWith("tests"));
      const current = listing.current?.includes("/") ? listing.current.slice(0, listing.current.lastIndexOf("/")) : "";
      part(maker, "folder").innerHTML = folders.map(folder =>
        `<option value="${escape(folder)}">${folder ? escape(folder) : "Project folder"}</option>`).join("");
      part(maker, "folder").value = folders.includes(current) && current ? current : "documents";
      describe();
    } catch (error) { part(maker, "status").textContent = error.message; }
  }

  maker.addEventListener("input", describe);
  maker.addEventListener("click", event => {
    if (event.target.closest('[data-do="close"]')) maker.close();
  });
  maker.querySelector("form").addEventListener("submit", async event => {
    event.preventDefault();
    if (busy) return;
    busy = true;
    part(maker, "status").textContent = "Creating the document…";
    try {
      const bytes = preset?.bytes ?? templateBytes(maker.querySelector('input[name="template"]:checked')?.value ?? "blank");
      await api("new", { name: part(maker, "name").value, folder: part(maker, "folder").value, bytes: base64(bytes) });
      reload();
    } catch (error) {
      busy = false;
      part(maker, "status").textContent = error.message;
    }
  });

  // ---- Other bytes --------------------------------------------------------
  // The editor calls this for everything that would replace the document on
  // screen: a template from its New page, a picked file, a dropped file.
  const templates = new Map(DOCUMENT_TEMPLATES.map(template => [templateName(template.id), template]));
  async function receive(bytes, name) {
    const template = templates.get(name);
    if (template) {
      await create({ bytes, name: template.id === "blank" ? "Untitled document" : template.label });
      return;
    }
    if (!/\.docx$/i.test(name ?? "")) {
      toast("Ternleaf opens Word documents (.docx). Save the file as DOCX first.", "problem");
      return;
    }
    if (busy) return;
    busy = true;
    try {
      // Read the file with the engine first, so that a broken file never
      // becomes a document of the project.
      try { parse(bytes).free(); }
      catch { throw new Error(`${name} could not be read as a Word document.`); }
      toast(`Adding a copy of ${name} to the documents folder…`);
      await upload("import", bytes, name);
      reload();
    } catch (error) {
      busy = false;
      toast(error.message, "problem");
    }
  }

  return { open, create, receive };
}

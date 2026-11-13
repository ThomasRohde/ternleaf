// The Ternleaf shell: the review pane, the launcher and the selection bubble.
// This module only builds markup. editor.mjs owns the behaviour.

// The Ternleaf mark is the author's artwork in mark.svg: three pages that fan
// from one spine. The one-colour form is for a mark on the brand colour.
export const icon = {
  mark: `<img class="tl-mark" src="/ternleaf/mark.svg" alt="" width="28" height="28">`,
  markMono: `<svg class="tl-mark" viewBox="96 72 880 880" fill="currentColor" aria-hidden="true">
    <path opacity="0.55" d="M128 896V360C128 324 142 300 172 278L420 110C452 88 482 91 502 112C519 130 524 153 522 182L511 309C509 331 504 340 484 351L453 369C410 394 397 414 387 453L318 706C314 722 304 735 289 751L128 896Z"/>
    <path opacity="0.78" d="M140 902L320 733C336 717 344 697 350 670L403 470C414 432 434 411 468 390L641 281C675 260 705 267 725 291C742 312 745 337 740 368L718 479C715 500 709 513 693 522L653 546C616 568 600 590 589 626L540 764C533 782 519 794 504 803L140 902Z"/>
    <path d="M154 909L509 816C546 798 566 779 576 749L621 629C631 598 652 578 683 564L799 515C835 497 861 504 887 526L927 574C949 601 957 628 949 662L905 823C894 876 854 909 791 909H154Z"/></svg>`,
  close: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  send: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  download: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v8M4.5 7.5L8 11l3.5-3.5M3 13.5h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

export const quickActions = [
  { id: "improve", label: "Improve", instruction: "Improve the clarity and the flow. Keep the meaning, the facts and about the same length." },
  { id: "shorten", label: "Shorten", instruction: "Shorten this. Keep the meaning and every fact." },
  { id: "clarify", label: "Clarify", instruction: "Make this clearer and more direct. Keep the meaning." },
  { id: "proofread", label: "Proofread", instruction: "Correct spelling, grammar and punctuation only. Change nothing else." },
  { id: "formal", label: "More formal", instruction: "Make the tone more formal. Keep the meaning." },
  { id: "plain", label: "Plain language", instruction: "Rewrite this in plain language for a general reader. Keep every fact." },
];

// Requests that read the text of the whole document and return suggestions.
export const documentActions = [
  { id: "doc-proofread", label: "Proofread", instruction: "Find spelling, grammar and punctuation errors. Change nothing else." },
  { id: "doc-tighten", label: "Tighten", instruction: "Find wordy sentences and suggest shorter ones. Keep the meaning and every fact." },
  { id: "doc-consistency", label: "Check consistency", instruction: "Find inconsistent terms, names, numbers, capitalisation and tense. Suggest one consistent form." },
  { id: "doc-plain", label: "Plain language", instruction: "Find jargon and long sentences. Suggest plain-language replacements. Keep every fact." },
];

const chip = item =>
  `<button type="button" class="tl-chip" data-action="quick" data-quick="${item.id}" title="${item.instruction}">${item.label}</button>`;
const chips = ids => quickActions.filter(item => !ids || ids.includes(item.id)).map(chip).join("");

export function layout() {
  const panel = document.createElement("aside");
  panel.id = "ternleaf-panel";
  panel.className = "side-panel tl-pane";
  panel.tabIndex = -1;
  panel.setAttribute("aria-label", "Ternleaf");
  panel.innerHTML = `
    <header class="tl-head">
      ${icon.mark}
      <div class="tl-title">
        <h2 data-part="name">Ternleaf</h2>
        <p role="status">Opening the project…</p>
      </div>
      <button type="button" class="tl-icon" data-action="close" aria-label="Close Ternleaf pane" title="Close">${icon.close}</button>
    </header>
    <div class="tl-alert">
      <button type="button" class="tl-button" data-action="reload" aria-label="Reload saved revision" hidden>Reload</button>
    </div>
    <div class="tl-tabs" role="tablist" aria-label="Ternleaf views">
      <button type="button" role="tab" data-action="tab" data-view="review" id="tl-tab-review" aria-controls="tl-view-review">Review</button>
      <button type="button" role="tab" data-action="tab" data-view="history" id="tl-tab-history" aria-controls="tl-view-history">History <span class="tl-count" data-part="history-count"></span></button>
    </div>
    <div class="tl-body">
      <section role="tabpanel" id="tl-view-review" data-view="review" aria-labelledby="tl-tab-review">
        <div data-part="compose" class="tl-stack">
          <section class="tl-queue" data-part="queue" hidden>
            <header>
              <h3 data-part="queue-title"></h3>
              <button type="button" class="tl-link" data-action="discard-batch">Dismiss all</button>
            </header>
            <p class="tl-asked" data-part="queue-prompt"></p>
            <p class="tl-queue-reason" data-part="queue-reason" hidden></p>
            <ol data-part="queue-list"></ol>
          </section>
          <div class="tl-segment tl-scope" role="group" aria-label="What Copilot reads">
            <button type="button" data-action="scope" data-scope="selection" aria-pressed="true">Selection</button>
            <button type="button" data-action="scope" data-scope="document" aria-pressed="false">Whole document</button>
          </div>
          <figure class="tl-passage" data-part="passage" data-empty="true">
            <blockquote class="tl-quote" data-part="passage-text"></blockquote>
            <figcaption data-part="passage-meta">Select a passage in the document.</figcaption>
          </figure>
          <p class="tl-doc-note" data-part="doc-note" hidden>Copilot reads the text of the whole document for this request and returns suggestions. You review each one before it changes the document.</p>
          <div class="tl-chips" role="group" aria-label="Quick requests" data-part="chips-selection">${chips()}</div>
          <div class="tl-chips" role="group" aria-label="Quick document reviews" data-part="chips-document" hidden>${documentActions.map(chip).join("")}</div>
          <div class="tl-chips tl-recent" role="group" aria-label="Recent instructions" data-part="recent" hidden></div>
          <div class="tl-composer">
            <textarea data-field="prompt" rows="3" maxlength="2000" aria-label="Instructions for selected text"
              placeholder="Tell Copilot what to change in the selected text"></textarea>
            <button type="button" class="tl-button tl-primary" data-action="request" disabled
              title="Send to Copilot (Ctrl+Enter)">${icon.send}<span data-part="request-label">Ask Copilot</span></button>
          </div>
          <p class="tl-help" data-part="compose-help">Copilot reads only the passage you select. You review each proposal before it changes the document.</p>
        </div>
        <div data-part="waiting" class="tl-stack" hidden>
          <p class="tl-asked" data-part="waiting-prompt"></p>
          <blockquote class="tl-quote tl-quote-card" data-part="waiting-text"></blockquote>
          <p class="tl-progress"><span class="tl-pulse" aria-hidden="true"></span><span data-part="waiting-status"></span></p>
          <div class="tl-actions">
            <button type="button" class="tl-button tl-primary" data-action="resend" hidden>Send again</button>
            <button type="button" class="tl-button" data-action="discard">Cancel request</button>
          </div>
        </div>
        <div data-part="proposal" class="tl-stack" hidden>
          <p class="tl-step" data-part="step" hidden></p>
          <p class="tl-asked" data-part="asked"></p>
          <div class="tl-segment" role="group" aria-label="Options from Copilot" data-part="options" hidden></div>
          <div class="tl-slip-frame">
            <p class="tl-slip" data-part="diff"></p>
            <div data-part="edit" hidden>
              <textarea data-field="edit" rows="4" maxlength="4000" aria-label="Edit the proposed text"></textarea>
              <div class="tl-actions">
                <button type="button" class="tl-button tl-primary" data-action="apply-edit">Apply edit</button>
                <button type="button" class="tl-button" data-action="cancel-edit">Cancel</button>
              </div>
            </div>
            <p class="tl-slip-meta"><span data-part="count"></span>
              <button type="button" class="tl-link" data-action="edit">Edit the text</button></p>
          </div>
          <p class="tl-rationale" data-part="rationale" hidden><span>Copilot</span> <span data-part="rationale-text"></span></p>
          <div class="tl-preview">
            <div class="tl-preview-bar">
              <div class="tl-segment" role="group" aria-label="Page preview">
                <button type="button" data-action="view-before" aria-pressed="false">Before</button>
                <button type="button" data-action="view-after" aria-pressed="true">After</button>
              </div>
              <button type="button" class="tl-link" data-action="whole" aria-pressed="false">Show whole page</button>
            </div>
            <canvas data-part="page" aria-label="Proposed page"></canvas>
            <p class="tl-help" data-part="pages"></p>
          </div>
          <label class="tl-field">Edition note <span>optional, saved with this revision</span>
            <textarea data-field="note" rows="2" maxlength="2000" aria-label="Edition note"></textarea>
          </label>
          <div class="tl-actions">
            <button type="button" class="tl-button tl-primary" data-action="accept">${icon.check}<span>Accept change</span></button>
            <button type="button" class="tl-button" data-action="discard">Discard</button>
            <button type="button" class="tl-link" data-action="save-note" hidden>Save note</button>
            <button type="button" class="tl-link tl-push" data-action="again">Ask again</button>
            <button type="button" class="tl-link tl-push" data-action="back" hidden>Back to the list</button>
          </div>
        </div>
        <div data-part="notice" class="tl-stack" hidden>
          <div class="tl-notice">
            <h3 data-part="notice-title"></h3>
            <p data-part="notice-text"></p>
          </div>
          <blockquote class="tl-quote tl-quote-card" data-part="notice-passage"></blockquote>
          <div class="tl-actions">
            <button type="button" class="tl-button tl-primary" data-action="again">Ask again</button>
            <button type="button" class="tl-button" data-action="discard">Discard</button>
          </div>
        </div>
      </section>
      <section role="tabpanel" id="tl-view-history" data-view="history" aria-labelledby="tl-tab-history" hidden>
        <p class="tl-help" data-part="history-empty">No saved changes yet. Each edit and each accepted proposal becomes a revision.</p>
        <ol class="tl-history" data-part="history"></ol>
        <button type="button" class="tl-link" data-action="retry" hidden
          title="Check that the last accepted change is saved. It is not applied a second time.">Retry last acceptance</button>
      </section>
    </div>
    <footer class="tl-foot">
      <button type="button" class="tl-button" data-action="export">${icon.download}<span>Export DOCX</span></button>
      <button type="button" class="tl-link" data-action="word-evidence" hidden>Download Word comparison data</button>
      <details><summary>Save details</summary><output></output></details>
    </footer>`;

  const launcher = document.createElement("button");
  launcher.type = "button";
  launcher.id = "ternleaf-launcher";
  launcher.dataset.action = "open";
  launcher.hidden = true;
  launcher.title = "Open Ternleaf (Ctrl+Shift+Space)";
  launcher.innerHTML = `${icon.mark}${icon.markMono}<span data-part="launcher-label">Ternleaf</span>`;

  const bubble = document.createElement("div");
  bubble.id = "ternleaf-bubble";
  bubble.hidden = true;
  bubble.setAttribute("role", "toolbar");
  bubble.setAttribute("aria-label", "Ask Copilot about the selection");
  bubble.innerHTML = `<button type="button" class="tl-bubble-main" data-action="compose"
      title="Write an instruction (Ctrl+Shift+Space)">${icon.markMono}<span>Ask Copilot</span></button>
    ${chips(["shorten", "clarify", "proofread"])}`;
  return { panel, launcher, bubble };
}

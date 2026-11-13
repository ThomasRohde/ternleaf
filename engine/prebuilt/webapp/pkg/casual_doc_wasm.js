/* @ts-self-types="./casual_doc_wasm.d.ts" */

/**
 * A caret position returned by navigation (no edit): node id + byte offset.
 */
export class Caret {
    static __wrap(ptr) {
        const obj = Object.create(Caret.prototype);
        obj.__wbg_ptr = ptr;
        CaretFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CaretFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_caret_free(ptr, 0);
    }
    /**
     * The caret's paragraph node id (32-hex string).
     * @returns {string}
     */
    get node() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.caret_node(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The caret's byte offset within the node.
     * @returns {number}
     */
    get offset() {
        const ret = wasm.caret_offset(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) Caret.prototype[Symbol.dispose] = Caret.prototype.free;

/**
 * The normalised rectangle of a table-cell selection, for the frontend: the grid
 * rectangle, how many cells are in it, whether it had to grow around a merged
 * cell, and — when it could not be produced — the reason, so a refusal is
 * sayable rather than silent.
 */
export class CellRangeInfo {
    static __wrap(ptr) {
        const obj = Object.create(CellRangeInfo.prototype);
        obj.__wbg_ptr = ptr;
        CellRangeInfoFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CellRangeInfoFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cellrangeinfo_free(ptr, 0);
    }
    /**
     * Cells in the rectangle, counting a merged cell once — so a 1 here means
     * merging is unavailable and the reason is *"Select two or more cells before
     * merging"*.
     * @returns {number}
     */
    get cells() {
        const ret = wasm.cellrangeinfo_cells(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Grid columns covered.
     * @returns {number}
     */
    get columnCount() {
        const ret = wasm.cellrangeinfo_columnCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Whether the rectangle grew past the dragged cells to contain a merged cell.
     * The UI says so rather than appearing to select more than was dragged.
     * @returns {boolean}
     */
    get expanded() {
        const ret = wasm.cellrangeinfo_expanded(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * First GRID column, inclusive — not a cell index.
     * @returns {number}
     */
    get firstColumn() {
        const ret = wasm.cellrangeinfo_firstColumn(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * First row index, inclusive.
     * @returns {number}
     */
    get firstRow() {
        const ret = wasm.cellrangeinfo_firstRow(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Whether a rectangle was produced. `false` carries a [`reason`](Self::reason).
     * @returns {boolean}
     */
    get found() {
        const ret = wasm.cellrangeinfo_found(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Last GRID column, inclusive — not a cell index.
     * @returns {number}
     */
    get lastColumn() {
        const ret = wasm.cellrangeinfo_lastColumn(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Last row index, inclusive.
     * @returns {number}
     */
    get lastRow() {
        const ret = wasm.cellrangeinfo_lastRow(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * The stable code for [`reason`](Self::reason), for a host that routes it
     * through its own catalogue so a non-English reader gets the specific
     * reason rather than a generic one. `""` when there is none.
     * @returns {string}
     */
    get reasonCode() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cellrangeinfo_reasonCode(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Why no rectangle was produced, as a sentence for the reader; `""` when
     * [`found`](Self::found).
     * @returns {string}
     */
    get reason() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cellrangeinfo_reason(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Rows covered.
     * @returns {number}
     */
    get rowCount() {
        const ret = wasm.cellrangeinfo_rowCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * The table the rectangle is in, or `""`.
     * @returns {string}
     */
    get table() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cellrangeinfo_table(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) CellRangeInfo.prototype[Symbol.dispose] = CellRangeInfo.prototype.free;

/**
 * A model-owned contiguous text range for one table cell.
 */
export class CellTextRange {
    static __wrap(ptr) {
        const obj = Object.create(CellTextRange.prototype);
        obj.__wbg_ptr = ptr;
        CellTextRangeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CellTextRangeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_celltextrange_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get endNode() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.celltextrange_endNode(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get endOffset() {
        const ret = wasm.celltextrange_endOffset(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    get found() {
        const ret = wasm.celltextrange_found(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    get startNode() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.celltextrange_startNode(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get startOffset() {
        const ret = wasm.celltextrange_startOffset(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) CellTextRange.prototype[Symbol.dispose] = CellTextRange.prototype.free;

/**
 * Document statistics for the status footer.
 */
export class DocStats {
    static __wrap(ptr) {
        const obj = Object.create(DocStats.prototype);
        obj.__wbg_ptr = ptr;
        DocStatsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DocStatsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_docstats_free(ptr, 0);
    }
    /**
     * Character count excluding whitespace (Word's "Characters (no spaces)").
     * @returns {number}
     */
    get characters() {
        const ret = wasm.docstats_characters(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Character count including spaces (Word's "Characters (with spaces)").
     * @returns {number}
     */
    get charactersWithSpaces() {
        const ret = wasm.docstats_characters_with_spaces(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Page count.
     * @returns {number}
     */
    get pages() {
        const ret = wasm.docstats_pages(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Paragraph count (body + table cells + content controls).
     * @returns {number}
     */
    get paragraphs() {
        const ret = wasm.docstats_paragraphs(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Whitespace-delimited word count across every paragraph.
     * @returns {number}
     */
    get words() {
        const ret = wasm.docstats_words(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) DocStats.prototype[Symbol.dispose] = DocStats.prototype.free;

/**
 * The result of an edit: the new caret, the revision, the page count, and the
 * **dirty page indices** (0-based) whose layout changed — the only pages the
 * frontend must re-raster.
 */
export class EditResult {
    static __wrap(ptr) {
        const obj = Object.create(EditResult.prototype);
        obj.__wbg_ptr = ptr;
        EditResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EditResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_editresult_free(ptr, 0);
    }
    /**
     * The 0-based indices of pages whose layout changed — re-raster only these.
     * @returns {Uint32Array}
     */
    get dirtyPages() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.editresult_dirtyPages(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The caret anchor node id (32-hex string).
     * @returns {string}
     */
    get node() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.editresult_node(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The caret byte offset within the node.
     * @returns {number}
     */
    get offset() {
        const ret = wasm.editresult_offset(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * The page count after the edit (so the frontend can add/remove pages).
     * @returns {number}
     */
    get pageCount() {
        const ret = wasm.editresult_pageCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Families of content this edit could not carry faithfully, as stable keys
     * (`bookmark`, `comment`, `note`, `fieldRange`, `trackedMove`) — empty when
     * nothing was degraded.
     *
     * The host maps each key to its own localized noun phrase and **must say
     * something**: a structured paste that quietly drops a comment anchor is the
     * silent loss `AGENTS.md` forbids. `casual_doc_edit::clone` documents why each
     * family cannot be duplicated inside one document.
     * @returns {string[]}
     */
    get pasteLoss() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.editresult_pasteLoss(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The object this edit placed for the host to select (a dragged copy), or
     * `""` when it placed none.
     * @returns {string}
     */
    get placedObject() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.editresult_placedObject(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The model revision after the edit.
     * @returns {number}
     */
    get revision() {
        const ret = wasm.editresult_revision(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) EditResult.prototype[Symbol.dispose] = EditResult.prototype.free;

/**
 * The uniform run-format state of a selection (each `true` only when every
 * covered run sets that toggle) — for a formatting toolbar.
 */
export class Format {
    static __wrap(ptr) {
        const obj = Object.create(Format.prototype);
        obj.__wbg_ptr = ptr;
        FormatFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FormatFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_format_free(ptr, 0);
    }
    /**
     * Bold state: 0 off, 1 on, 2 mixed.
     * @returns {number}
     */
    get boldState() {
        const ret = wasm.format_boldState(this.__wbg_ptr);
        return ret;
    }
    /**
     * Every covered run is bold.
     * @returns {boolean}
     */
    get bold() {
        const ret = wasm.format_bold(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Italic state: 0 off, 1 on, 2 mixed.
     * @returns {number}
     */
    get italicState() {
        const ret = wasm.format_italicState(this.__wbg_ptr);
        return ret;
    }
    /**
     * Every covered run is italic.
     * @returns {boolean}
     */
    get italic() {
        const ret = wasm.format_italic(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Strike-through state: 0 off, 1 on, 2 mixed.
     * @returns {number}
     */
    get strikeState() {
        const ret = wasm.format_strikeState(this.__wbg_ptr);
        return ret;
    }
    /**
     * Every covered run is struck through.
     * @returns {boolean}
     */
    get strike() {
        const ret = wasm.format_strike(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Underline state: 0 off, 1 on, 2 mixed.
     * @returns {number}
     */
    get underlineState() {
        const ret = wasm.format_underlineState(this.__wbg_ptr);
        return ret;
    }
    /**
     * Every covered run is underlined.
     * @returns {boolean}
     */
    get underline() {
        const ret = wasm.format_underline(this.__wbg_ptr);
        return ret !== 0;
    }
}
if (Symbol.dispose) Format.prototype[Symbol.dispose] = Format.prototype.free;

/**
 * The model anchor a point resolved to (doc 58 §2 `TextCaret`/`Outside`): a
 * `NodeId` (32-hex string), a node-relative UTF-8 byte offset, and whether the
 * point was inside content or snapped in from outside.
 */
export class HitPayload {
    static __wrap(ptr) {
        const obj = Object.create(HitPayload.prototype);
        obj.__wbg_ptr = ptr;
        HitPayloadFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        HitPayloadFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_hitpayload_free(ptr, 0);
    }
    /**
     * The anchor node id (32-hex string; compare/pass back, never arithmetic).
     * @returns {string}
     */
    get node() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.hitpayload_node(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The node-relative UTF-8 byte offset.
     * @returns {number}
     */
    get offset() {
        const ret = wasm.hitpayload_offset(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * `"content"` (inside a line) or `"outside"` (snapped from a margin).
     * @returns {string}
     */
    get zone() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.hitpayload_zone(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) HitPayload.prototype[Symbol.dispose] = HitPayload.prototype.free;

/**
 * A paragraph's indentation (twips), for the ruler markers.
 */
export class Indents {
    static __wrap(ptr) {
        const obj = Object.create(Indents.prototype);
        obj.__wbg_ptr = ptr;
        IndentsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IndentsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_indents_free(ptr, 0);
    }
    /**
     * Right (end) indent in twips.
     * @returns {number}
     */
    get endTwip() {
        const ret = wasm.indents_endTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * First-line indent in twips (relative to the left indent).
     * @returns {number}
     */
    get firstLineTwip() {
        const ret = wasm.indents_firstLineTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * Hanging indent in twips (mutually exclusive with first-line).
     * @returns {number}
     */
    get hangingTwip() {
        const ret = wasm.indents_hangingTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * Left (start) indent in twips.
     * @returns {number}
     */
    get startTwip() {
        const ret = wasm.indents_startTwip(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) Indents.prototype[Symbol.dispose] = Indents.prototype.free;

/**
 * A hyperlink resolved at a page-local point. The runtime reports both the
 * authored target and, for internal links, the resolved bookmark caret/page;
 * the embedding host decides whether and how navigation is allowed.
 */
export class LinkHit {
    static __wrap(ptr) {
        const obj = Object.create(LinkHit.prototype);
        obj.__wbg_ptr = ptr;
        LinkHitFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LinkHitFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_linkhit_free(ptr, 0);
    }
    /**
     * Internal bookmark name, or empty for an external target.
     * @returns {string}
     */
    get anchor() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.linkhit_anchor(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Paragraph node ending the linked range (currently identical to startNode).
     * @returns {string}
     */
    get endNode() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.linkhit_endNode(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * End byte offset of the linked range.
     * @returns {number}
     */
    get endOffset() {
        const ret = wasm.linkhit_endOffset(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * `"external"` or `"internal"`.
     * @returns {string}
     */
    get kind() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.linkhit_kind(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Paragraph node containing the linked range.
     * @returns {string}
     */
    get startNode() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.linkhit_startNode(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Start byte offset of the linked range.
     * @returns {number}
     */
    get startOffset() {
        const ret = wasm.linkhit_startOffset(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Resolved internal-bookmark paragraph node, or empty if unresolved/external.
     * @returns {string}
     */
    get targetNode() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.linkhit_targetNode(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Resolved internal-bookmark byte offset.
     * @returns {number}
     */
    get targetOffset() {
        const ret = wasm.linkhit_targetOffset(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Resolved internal-bookmark 1-based page, or 0 if unresolved/external.
     * @returns {number}
     */
    get targetPage() {
        const ret = wasm.linkhit_targetPage(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Optional authored screen tip (empty when absent).
     * @returns {string}
     */
    get tooltip() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.linkhit_tooltip(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * External target URL, or empty for an internal target.
     * @returns {string}
     */
    get url() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.linkhit_url(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) LinkHit.prototype[Symbol.dispose] = LinkHit.prototype.free;

/**
 * A selectable object resolved at a page-local point (docs/85 §3.1): its model
 * `NodeId` (32-hex), an `ObjectKind`-style tag, the 1-based page, placed rect
 * `[page, x, y, w, h]` in twips, and structural capability truth.
 */
export class ObjectHitPayload {
    static __wrap(ptr) {
        const obj = Object.create(ObjectHitPayload.prototype);
        obj.__wbg_ptr = ptr;
        ObjectHitPayloadFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ObjectHitPayloadFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_objecthitpayload_free(ptr, 0);
    }
    /**
     * Whether this reference's root owns a floating anchor. For a group-of-one,
     * `subject` remains the leaf while movement and wrapping target `root`.
     * @returns {boolean}
     */
    get anchored() {
        const ret = wasm.objecthitpayload_anchored(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether this exact node owns mutable alternative-text metadata.
     * @returns {boolean}
     */
    get canAltText() {
        const ret = wasm.objecthitpayload_canAltText(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether this exact node owns a mutable picture crop rectangle.
     * @returns {boolean}
     */
    get canCrop() {
        const ret = wasm.objecthitpayload_canCrop(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether this reference's root can be deleted with an exact inverse.
     * @returns {boolean}
     */
    get canDelete() {
        const ret = wasm.objecthitpayload_canDelete(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether this exact node contains an editable text-box surface.
     * @returns {boolean}
     */
    get canEditText() {
        const ret = wasm.objecthitpayload_canEditText(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether this exact node owns mutable shape fill properties.
     * @returns {boolean}
     */
    get canFill() {
        const ret = wasm.objecthitpayload_canFill(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether this object sits directly in the text and can be dragged to
     * another place in it (`moveInlineObject`, `docs/109` UX-OB-02).
     * @returns {boolean}
     */
    get canMoveInText() {
        const ret = wasm.objecthitpayload_canMoveInText(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether this reference's root owns a movable anchor position.
     * @returns {boolean}
     */
    get canMove() {
        const ret = wasm.objecthitpayload_canMove(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether this reference supports an exact, undoable extent mutation.
     * @returns {boolean}
     */
    get canResize() {
        const ret = wasm.objecthitpayload_canResize(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether this reference models an `a:xfrm` rotation that the layout paints,
     * so a rotation handle on it would change something the user can see.
     * @returns {boolean}
     */
    get canRotate() {
        const ret = wasm.objecthitpayload_canRotate(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether this exact node owns mutable shape stroke properties.
     * @returns {boolean}
     */
    get canStroke() {
        const ret = wasm.objecthitpayload_canStroke(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether this reference's root owns a mutable text-wrapping mode.
     * @returns {boolean}
     */
    get canWrap() {
        const ret = wasm.objecthitpayload_canWrap(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Why each unavailable capability is unavailable, as a JSON object mapping
     * the capability's own name to a marked refusal
     * (`refused: <sentence>\u{1f}<code>`) — the exact string
     * `webapp/src/edit_errors.mjs` already renders verbatim, so the host reads a
     * reason with `editRefusalMessage({ message: reasons.canMove })` and needs
     * no catalogue of its own.
     *
     * Only the `false` ones appear: a capability that is available has nothing
     * to explain, and publishing a reason for it would invite a host to show one.
     * A JSON string rather than ten getters because the set is open — a
     * capability added to the engine must reach the host without the host
     * shipping a new field — and because `wasm_bindgen` cannot hand back a map.
     *
     * See `capability_refusals` for why a `false` had to learn to explain
     * itself at all. (Plain code text, not a link: it is private, and a public
     * doc comment that links to a private item fails the `cargo doc` gate —
     * `SKILL` §3's third trap.)
     * @returns {string}
     */
    get capabilityReasons() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.objecthitpayload_capabilityReasons(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The object kind: `"image"`, `"textbox"`, or `"shape"` (docs/85 `ObjectKind`).
     * @returns {string}
     */
    get kind() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.objecthitpayload_kind(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Whether a resize of this reference's root must keep its aspect ratio:
     * DrawingML's `noChangeAspect` on the object's frame or on the object, as
     * the file (or this editor's own insert, which writes Word's lock) states it
     * (`Definitions::locks_aspect_ratio`, `docs/109` FID-AT-09).
     *
     * This is Word's "Lock aspect ratio", and Word honours it both ways: a
     * corner drag of a locked object keeps its proportions, and a corner drag of
     * an unlocked one — a picture whose file states no lock included — does not
     * unless Shift is held. An ABSENT flag is therefore unlocked, whatever the
     * kind: that is how Word reads the same file.
     * @returns {boolean}
     */
    get locksAspectRatio() {
        const ret = wasm.objecthitpayload_locksAspectRatio(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Compatibility alias for [`subject`](Self::subject).
     * @returns {string}
     */
    get node() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.objecthitpayload_node(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The 1-based page the object sits on.
     * @returns {number}
     */
    get page() {
        const ret = wasm.objecthitpayload_page(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * The bounded child-index path from `root` to `subject`.
     * @returns {Uint32Array}
     */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.objecthitpayload_path(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The placed rect `[page, xTwip, yTwip, wTwip, hTwip]` (page-local).
     * @returns {Int32Array}
     */
    get rect() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.objecthitpayload_rect(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The removable/movable top-level object carrier (32-hex string).
     * @returns {string}
     */
    get root() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.objecthitpayload_root(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The exact leaf whose kind-specific properties or text are edited.
     * @returns {string}
     */
    get subject() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.objecthitpayload_subject(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The owning document story. Object selection is body-only in this slice.
     * @returns {string}
     */
    get surface() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.objecthitpayload_surface(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) ObjectHitPayload.prototype[Symbol.dispose] = ObjectHitPayload.prototype.free;

/**
 * A rasterized page: RGBA8888 premultiplied pixels plus their device dimensions
 * (doc 57 §5.1). Blit with `new ImageData(rgba, widthPx, heightPx)`.
 */
export class PageBitmap {
    static __wrap(ptr) {
        const obj = Object.create(PageBitmap.prototype);
        obj.__wbg_ptr = ptr;
        PageBitmapFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PageBitmapFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pagebitmap_free(ptr, 0);
    }
    /**
     * Bitmap height in device pixels.
     * @returns {number}
     */
    get heightPx() {
        const ret = wasm.pagebitmap_heightPx(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * The premultiplied RGBA8888 pixels, row-major, as a `Uint8ClampedArray` —
     * the exact backing an `ImageData` takes. Copies out of the surface.
     * @returns {Uint8ClampedArray}
     */
    get rgba() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.pagebitmap_rgba(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getClampedArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Bitmap width in device pixels.
     * @returns {number}
     */
    get widthPx() {
        const ret = wasm.pagebitmap_widthPx(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) PageBitmap.prototype[Symbol.dispose] = PageBitmap.prototype.free;

/**
 * A page box size in twips (doc 57 §4.2).
 */
export class PageSize {
    static __wrap(ptr) {
        const obj = Object.create(PageSize.prototype);
        obj.__wbg_ptr = ptr;
        PageSizeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PageSizeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pagesize_free(ptr, 0);
    }
    /**
     * Page box height in twips (1/1440 in).
     * @returns {number}
     */
    get heightTwip() {
        const ret = wasm.pagesize_heightTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * Page box width in twips (1/1440 in).
     * @returns {number}
     */
    get widthTwip() {
        const ret = wasm.pagesize_widthTwip(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) PageSize.prototype[Symbol.dispose] = PageSize.prototype.free;

/**
 * A paragraph's line-and-page-break flags, for the paragraph-properties inspector.
 */
export class ParagraphFlags {
    static __wrap(ptr) {
        const obj = Object.create(ParagraphFlags.prototype);
        obj.__wbg_ptr = ptr;
        ParagraphFlagsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ParagraphFlagsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_paragraphflags_free(ptr, 0);
    }
    /**
     * Keep all lines of this paragraph on one page (`w:keepLines`).
     * @returns {boolean}
     */
    get keepLines() {
        const ret = wasm.paragraphflags_keepLines(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Keep this paragraph on the same page as the next (`w:keepNext`).
     * @returns {boolean}
     */
    get keepNext() {
        const ret = wasm.paragraphflags_keepNext(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Force a page break before this paragraph (`w:pageBreakBefore`).
     * @returns {boolean}
     */
    get pageBreakBefore() {
        const ret = wasm.paragraphflags_pageBreakBefore(this.__wbg_ptr);
        return ret !== 0;
    }
}
if (Symbol.dispose) ParagraphFlags.prototype[Symbol.dispose] = ParagraphFlags.prototype.free;

/**
 * A paragraph's **effective** spacing, for the toolbar's line-&-paragraph-spacing
 * menu.
 *
 * Effective, not direct: real documents put spacing in a style (a Word document
 * whose body text is 1.15 lines says so once, in `Normal`), so reading
 * `w:pPr/w:spacing` off the paragraph answers "nothing set" for almost every
 * paragraph the user will ever click in. The menu then ticks no preset and the
 * value box has nothing to show. The three `*FromStyle` flags keep the
 * distinction the direct read used to carry: the value is real either way, and
 * the flag says whether the paragraph wrote it or inherited it — so a host can
 * still offer "clear the direct override" without guessing.
 */
export class ParagraphSpacing {
    static __wrap(ptr) {
        const obj = Object.create(ParagraphSpacing.prototype);
        obj.__wbg_ptr = ptr;
        ParagraphSpacingFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ParagraphSpacingFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_paragraphspacing_free(ptr, 0);
    }
    /**
     * Whether `afterTwip` comes from the style cascade rather than from the
     * paragraph's own `w:pPr` (false when unset everywhere).
     * @returns {boolean}
     */
    get afterFromStyle() {
        const ret = wasm.paragraphspacing_afterFromStyle(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Space after the paragraph in twips, or `-1` when unset.
     * @returns {number}
     */
    get afterTwip() {
        const ret = wasm.paragraphspacing_afterTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * Whether `beforeTwip` comes from the style cascade rather than from the
     * paragraph's own `w:pPr` (false when unset everywhere).
     * @returns {boolean}
     */
    get beforeFromStyle() {
        const ret = wasm.paragraphspacing_beforeFromStyle(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Space before the paragraph in twips, or `-1` when unset.
     * @returns {number}
     */
    get beforeTwip() {
        const ret = wasm.paragraphspacing_beforeTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * Whether the line spacing (`linePercent`/`lineRule`/`lineTwip`) comes from
     * the style cascade rather than from the paragraph's own `w:pPr` (false when
     * unset everywhere).
     * @returns {boolean}
     */
    get lineFromStyle() {
        const ret = wasm.paragraphspacing_lineFromStyle(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Line-spacing percentage for the `auto` rule (0 when unset or a fixed rule).
     * @returns {number}
     */
    get linePercent() {
        const ret = wasm.paragraphspacing_linePercent(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Line rule: `0` auto (percent), `1` atLeast, `2` exact (twips).
     * @returns {number}
     */
    get lineRule() {
        const ret = wasm.paragraphspacing_lineRule(this.__wbg_ptr);
        return ret;
    }
    /**
     * Fixed line height in twips for the atLeast/exact rules (0 for auto).
     * @returns {number}
     */
    get lineTwip() {
        const ret = wasm.paragraphspacing_lineTwip(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) ParagraphSpacing.prototype[Symbol.dispose] = ParagraphSpacing.prototype.free;

/**
 * Uniform paragraph properties over every paragraph touched by a selection.
 *
 * Values carry explicit mixed flags so the host never has to infer
 * disagreement from a sentinel. Boolean states are 0=off, 1=on, 2=mixed.
 */
export class ParagraphState {
    static __wrap(ptr) {
        const obj = Object.create(ParagraphState.prototype);
        obj.__wbg_ptr = ptr;
        ParagraphStateFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ParagraphStateFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_paragraphstate_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    get afterMixed() {
        const ret = wasm.paragraphstate_afterMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get afterTwip() {
        const ret = wasm.paragraphstate_afterTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get alignmentMixed() {
        const ret = wasm.paragraphstate_alignmentMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    get alignment() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.paragraphstate_alignment(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {boolean}
     */
    get beforeMixed() {
        const ret = wasm.paragraphstate_beforeMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get beforeTwip() {
        const ret = wasm.paragraphstate_beforeTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * top=1, bottom=2, start=4, end=8.
     * @returns {number}
     */
    get borderEdges() {
        const ret = wasm.paragraphstate_borderEdges(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get bordersMixed() {
        const ret = wasm.paragraphstate_bordersMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get count() {
        const ret = wasm.paragraphstate_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    get endMixed() {
        const ret = wasm.paragraphstate_endMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get endTwip() {
        const ret = wasm.paragraphstate_endTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get firstLineMixed() {
        const ret = wasm.paragraphstate_firstLineMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get firstLineTwip() {
        const ret = wasm.paragraphstate_firstLineTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get hangingMixed() {
        const ret = wasm.paragraphstate_hangingMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get hangingTwip() {
        const ret = wasm.paragraphstate_hangingTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get keepLinesState() {
        const ret = wasm.paragraphstate_keepLinesState(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get keepNextState() {
        const ret = wasm.paragraphstate_keepNextState(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get lineMixed() {
        const ret = wasm.paragraphstate_lineMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get linePercent() {
        const ret = wasm.paragraphstate_linePercent(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get pageBreakBeforeState() {
        const ret = wasm.paragraphstate_pageBreakBeforeState(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get shadingMixed() {
        const ret = wasm.paragraphstate_shadingMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Packed `0xRRGGBB`, or `-1` when uniformly unset.
     * @returns {number}
     */
    get shading() {
        const ret = wasm.paragraphstate_shading(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get startMixed() {
        const ret = wasm.paragraphstate_startMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get startTwip() {
        const ret = wasm.paragraphstate_startTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get styleMixed() {
        const ret = wasm.paragraphstate_styleMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    get style() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.paragraphstate_style(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) ParagraphState.prototype[Symbol.dispose] = ParagraphState.prototype.free;

/**
 * A pasted picture: PNG bytes plus their pixel size and the resolution they were
 * painted at, so the host can size the picture at its true physical size
 * (`widthPx * 96 / dpi` CSS pixels).
 */
export class PictureRaster {
    static __wrap(ptr) {
        const obj = Object.create(PictureRaster.prototype);
        obj.__wbg_ptr = ptr;
        PictureRasterFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PictureRasterFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pictureraster_free(ptr, 0);
    }
    /**
     * The resolution the picture was painted at, in device pixels per inch.
     * @returns {number}
     */
    get dpi() {
        const ret = wasm.pictureraster_dpi(this.__wbg_ptr);
        return ret;
    }
    /**
     * Height in device pixels.
     * @returns {number}
     */
    get heightPx() {
        const ret = wasm.pictureraster_heightPx(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * The PNG bytes.
     * @returns {Uint8Array}
     */
    get png() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.pictureraster_png(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Width in device pixels.
     * @returns {number}
     */
    get widthPx() {
        const ret = wasm.pictureraster_widthPx(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) PictureRaster.prototype[Symbol.dispose] = PictureRaster.prototype.free;

/**
 * A page's ruler geometry (twips).
 */
export class RulerGeometry {
    static __wrap(ptr) {
        const obj = Object.create(RulerGeometry.prototype);
        obj.__wbg_ptr = ptr;
        RulerGeometryFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RulerGeometryFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rulergeometry_free(ptr, 0);
    }
    /**
     * Right (end) margin in twips.
     * @returns {number}
     */
    get marginEndTwip() {
        const ret = wasm.rulergeometry_marginEndTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * Left (start) margin in twips.
     * @returns {number}
     */
    get marginStartTwip() {
        const ret = wasm.rulergeometry_marginStartTwip(this.__wbg_ptr);
        return ret;
    }
    /**
     * Page width in twips.
     * @returns {number}
     */
    get widthTwip() {
        const ret = wasm.rulergeometry_widthTwip(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) RulerGeometry.prototype[Symbol.dispose] = RulerGeometry.prototype.free;

/**
 * The uniform run styling of a selection, for reflecting current values in the
 * toolbar. Values and explicit mixed flags are separate so a uniformly unset
 * property is never conflated with disagreement across the selection.
 */
export class RunStyle {
    static __wrap(ptr) {
        const obj = Object.create(RunStyle.prototype);
        obj.__wbg_ptr = ptr;
        RunStyleFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RunStyleFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_runstyle_free(ptr, 0);
    }
    /**
     * Whether the selection contains more than one effective text color.
     * @returns {boolean}
     */
    get colorMixed() {
        const ret = wasm.runstyle_colorMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Common text color as `#rrggbb` (empty if mixed/unset or a theme color).
     * @returns {string}
     */
    get color() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.runstyle_color(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Whether the selection contains more than one effective font family.
     * @returns {boolean}
     */
    get fontMixed() {
        const ret = wasm.runstyle_fontMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Common font family (empty if mixed/unset).
     * @returns {string}
     */
    get font() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.runstyle_font(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Whether the selection contains more than one effective highlight value.
     * @returns {boolean}
     */
    get highlightMixed() {
        const ret = wasm.runstyle_highlightMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Common highlight name, `"none"` when uniformly clear, or empty when mixed.
     * @returns {string}
     */
    get highlight() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.runstyle_highlight(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Whether the selection contains more than one effective font size.
     * @returns {boolean}
     */
    get sizeMixed() {
        const ret = wasm.runstyle_sizeMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Common font size in points (0 if mixed/unset).
     * @returns {number}
     */
    get sizePoints() {
        const ret = wasm.runstyle_sizePoints(this.__wbg_ptr);
        return ret;
    }
    /**
     * Every covered run is subscript.
     * @returns {boolean}
     */
    get subscript() {
        const ret = wasm.runstyle_subscript(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Every covered run is superscript.
     * @returns {boolean}
     */
    get superscript() {
        const ret = wasm.runstyle_superscript(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether the selection contains more than one effective underline color.
     * @returns {boolean}
     */
    get underlineColorMixed() {
        const ret = wasm.runstyle_underlineColorMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Common explicit underline color as `#rrggbb`; empty means automatic/text
     * color, or mixed when [`underline_color_mixed`](Self::underline_color_mixed)
     * is true.
     * @returns {string}
     */
    get underlineColor() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.runstyle_underlineColor(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Whether the selection contains more than one effective underline style.
     * @returns {boolean}
     */
    get underlineStyleMixed() {
        const ret = wasm.runstyle_underlineStyleMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Common underline line style (`single`, `double`, `thick`, `dotted`,
     * `dashed`, `dotDash`, `wavy`, or `words`), or empty when mixed/unset.
     * @returns {string}
     */
    get underlineStyle() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.runstyle_underlineStyle(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Whether the selection mixes baseline, superscript, or subscript.
     * @returns {boolean}
     */
    get verticalAlignMixed() {
        const ret = wasm.runstyle_verticalAlignMixed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Common vertical alignment: `super`, `sub`, `baseline`, or empty when mixed.
     * @returns {string}
     */
    get verticalAlign() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.runstyle_verticalAlign(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) RunStyle.prototype[Symbol.dispose] = RunStyle.prototype.free;

/**
 * A position resolved inside a page's running content: the same `NodeId` +
 * offset pair any body position uses, plus which band it came from. The
 * position needs no sub-document address because header, footer and note
 * content already live in the document's single id space.
 */
export class RunningHitPayload {
    static __wrap(ptr) {
        const obj = Object.create(RunningHitPayload.prototype);
        obj.__wbg_ptr = ptr;
        RunningHitPayloadFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RunningHitPayloadFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_runninghitpayload_free(ptr, 0);
    }
    /**
     * `"header"` or `"footer"`.
     * @returns {string}
     */
    get band() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.runninghitpayload_band(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The anchor node id (32-hex string; compare/pass back, never arithmetic).
     * @returns {string}
     */
    get node() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.runninghitpayload_node(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The node-relative UTF-8 byte offset.
     * @returns {number}
     */
    get offset() {
        const ret = wasm.runninghitpayload_offset(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) RunningHitPayload.prototype[Symbol.dispose] = RunningHitPayload.prototype.free;

/**
 * Maps a highlight name (case-insensitive) to a [`HighlightColor`]; unknown
 * names fall back to `Yellow`, `"none"`/`""` clear the highlight.
 * Parses a `#rrggbb` (or `rrggbb`) hex color, or `None` if malformed.
 * What [`shapeFormat`](WasmDocument::shape_format) reports to the host: the
 * shape's own fill and outline, each `#rrggbb` or `undefined` for none.
 */
export class ShapeFormat {
    static __wrap(ptr) {
        const obj = Object.create(ShapeFormat.prototype);
        obj.__wbg_ptr = ptr;
        ShapeFormatFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ShapeFormatFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_shapeformat_free(ptr, 0);
    }
    /**
     * The fill color, or `undefined` when the shape has no fill.
     * @returns {string | undefined}
     */
    get fill() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_shapeformat_fill(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The start line end's token (`none` when bare), when it has an outline.
     * @returns {string | undefined}
     */
    get headEnd() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_shapeformat_headEnd(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The outline's dash token (`solid` when unpatterned), when it has an
     * outline — what Shape Outline ▸ Dashes checks (`docs/109` RM-30).
     * @returns {string | undefined}
     */
    get outlineDash() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_shapeformat_outlineDash(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The outline width in EMU, when the shape has an outline. `f64` rather than
     * `i64` so JS receives a plain number: a `BigInt` cannot be handed straight
     * back to `setShapeOutline`, which is exactly what the host does with it.
     * @returns {number | undefined}
     */
    get outlineWidthEmu() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_shapeformat_outlineWidthEmu(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r2 = getDataViewMemory0().getFloat64(retptr + 8 * 1, true);
            return r0 === 0 ? undefined : r2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The outline color, or `undefined` when the shape has no outline.
     * @returns {string | undefined}
     */
    get outline() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_shapeformat_outline(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The end line end's token (`none` when bare), when it has an outline.
     * @returns {string | undefined}
     */
    get tailEnd() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_shapeformat_tailEnd(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The fill color, or `undefined` when the shape has no fill.
     * @param {string | null} [arg0]
     */
    set fill(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_shapeformat_fill(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The start line end's token (`none` when bare), when it has an outline.
     * @param {string | null} [arg0]
     */
    set headEnd(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_shapeformat_headEnd(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The outline's dash token (`solid` when unpatterned), when it has an
     * outline — what Shape Outline ▸ Dashes checks (`docs/109` RM-30).
     * @param {string | null} [arg0]
     */
    set outlineDash(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_shapeformat_outlineDash(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The outline width in EMU, when the shape has an outline. `f64` rather than
     * `i64` so JS receives a plain number: a `BigInt` cannot be handed straight
     * back to `setShapeOutline`, which is exactly what the host does with it.
     * @param {number | null} [arg0]
     */
    set outlineWidthEmu(arg0) {
        wasm.__wbg_set_shapeformat_outlineWidthEmu(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? 0 : arg0);
    }
    /**
     * The outline color, or `undefined` when the shape has no outline.
     * @param {string | null} [arg0]
     */
    set outline(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_shapeformat_outline(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The end line end's token (`none` when bare), when it has an outline.
     * @param {string | null} [arg0]
     */
    set tailEnd(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_shapeformat_tailEnd(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) ShapeFormat.prototype[Symbol.dispose] = ShapeFormat.prototype.free;

/**
 * The resolved visual preview of a paragraph style — what a paragraph carrying
 * only that style renders with. The Styles gallery draws each card in its own
 * style from these fields (Word's Styles gallery).
 */
export class StylePreview {
    static __wrap(ptr) {
        const obj = Object.create(StylePreview.prototype);
        obj.__wbg_ptr = ptr;
        StylePreviewFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StylePreviewFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stylepreview_free(ptr, 0);
    }
    /**
     * The paragraph alignment: `start`, `center`, `end`, or `justify`.
     * @returns {string}
     */
    get alignment() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stylepreview_alignment(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Whether the style renders bold.
     * @returns {boolean}
     */
    get bold() {
        const ret = wasm.stylepreview_bold(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * The text color as `#rrggbb`, or empty for automatic/theme colors.
     * @returns {string}
     */
    get color() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stylepreview_color(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The requested (authored) font family — never a physical fallback. Empty
     * when the style is unknown.
     * @returns {string}
     */
    get fontFamily() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stylepreview_fontFamily(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Whether the style renders italic.
     * @returns {boolean}
     */
    get italic() {
        const ret = wasm.stylepreview_italic(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * The font size in points (0 when unknown/unset).
     * @returns {number}
     */
    get sizePoints() {
        const ret = wasm.stylepreview_sizePoints(this.__wbg_ptr);
        return ret;
    }
    /**
     * The spacing a paragraph carrying only this style renders with — the same
     * shape [`paragraphSpacing`](WasmDocument::paragraph_spacing) returns, so
     * the menu that ticks a preset for the caret can tick the same preset for a
     * style card without a second encoding.
     *
     * Every `*FromStyle` flag is false here: this *is* the style's value, so
     * "inherited from the style" is not a question the card can ask.
     * @returns {ParagraphSpacing}
     */
    get spacing() {
        const ret = wasm.stylepreview_spacing(this.__wbg_ptr);
        return ParagraphSpacing.__wrap(ret);
    }
    /**
     * Whether the style renders underlined.
     * @returns {boolean}
     */
    get underline() {
        const ret = wasm.stylepreview_underline(this.__wbg_ptr);
        return ret !== 0;
    }
}
if (Symbol.dispose) StylePreview.prototype[Symbol.dispose] = StylePreview.prototype.free;

/**
 * Current table context for editor table-selection and table-property controls.
 */
export class TableInfo {
    static __wrap(ptr) {
        const obj = Object.create(TableInfo.prototype);
        obj.__wbg_ptr = ptr;
        TableInfoFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TableInfoFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_tableinfo_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get alignment() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.tableinfo_alignment(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get caption() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.tableinfo_caption(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get cellMarginTwips() {
        const ret = wasm.tableinfo_cellMarginTwips(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get cellSpacingTwips() {
        const ret = wasm.tableinfo_cellSpacingTwips(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get columnWidthTwips() {
        const ret = wasm.tableinfo_columnWidthTwips(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get column() {
        const ret = wasm.tableinfo_column(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get columns() {
        const ret = wasm.tableinfo_columns(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {string}
     */
    get description() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.tableinfo_description(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {boolean}
     */
    get fixedLayout() {
        const ret = wasm.tableinfo_fixedLayout(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    get found() {
        const ret = wasm.tableinfo_found(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * The grid column the caret's cell starts at.
     *
     * [`column`](Self::column) is an index into the row's cells, and the two
     * differ the moment any earlier cell in the row carries `w:gridSpan`.
     * @returns {number}
     */
    get gridColumn() {
        const ret = wasm.tableinfo_gridColumn(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    get headerRow() {
        const ret = wasm.tableinfo_headerRow(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Grid columns the caret's merged region covers; 1 for an unmerged cell.
     * @returns {number}
     */
    get mergeColumns() {
        const ret = wasm.tableinfo_mergeColumns(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Grid column of the top-left cell of the caret's merged region.
     * @returns {number}
     */
    get mergeFirstColumn() {
        const ret = wasm.tableinfo_mergeFirstColumn(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Row index of the top-left cell of the caret's merged region — where an
     * unmerge has to run from.
     * @returns {number}
     */
    get mergeFirstRow() {
        const ret = wasm.tableinfo_mergeFirstRow(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Rows the caret's merged region covers; 1 for an unmerged cell.
     * @returns {number}
     */
    get mergeRows() {
        const ret = wasm.tableinfo_mergeRows(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Whether the caret's own cell is part of a merged region (`docs/141`
     * TBL-20).
     *
     * Not the same question as [`regular`](Self::regular), which is true of the
     * whole table and answers "does a merge exist ANYWHERE in it". Unmerge was
     * enabled off that whole-table answer, so it was offered on every cell of a
     * table with one merge in it and refused per cell on click — a control that
     * looks live and is not.
     * @returns {boolean}
     */
    get merged() {
        const ret = wasm.tableinfo_merged(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    get regular() {
        const ret = wasm.tableinfo_regular(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * The column boundaries of this table that no cell straddles, by the grid
     * column on their leading side — the boundaries a column-resize zone may
     * arm (`docs/141` TBL-20).
     *
     * A merged table used to disarm the resize zone entirely. Only a boundary a
     * single cell covers BOTH sides of is genuinely ambiguous; every other one
     * resizes exactly as it does in a regular table, and
     * `moveTableColumnBoundary` accepts precisely this set. It is a MODEL
     * answer, not a page one, so a table split across pages arms the same
     * boundaries on its continuation as on its first page — the residual case
     * where a merge on page two silently disarmed page one.
     * @returns {Uint32Array}
     */
    get resizableColumnBoundaries() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.tableinfo_resizableColumnBoundaries(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {string}
     */
    get rowHeightRule() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.tableinfo_rowHeightRule(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get rowHeightTwips() {
        const ret = wasm.tableinfo_rowHeightTwips(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get row() {
        const ret = wasm.tableinfo_row(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get rows() {
        const ret = wasm.tableinfo_rows(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get tableIndentTwips() {
        const ret = wasm.tableinfo_tableIndentTwips(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get tableWidthTwips() {
        const ret = wasm.tableinfo_tableWidthTwips(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {string}
     */
    get table() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.tableinfo_table(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) TableInfo.prototype[Symbol.dispose] = TableInfo.prototype.free;

/**
 * A find result: either no match, or a same-node byte range that can become the
 * editor selection and feed replaceSelection.
 */
export class TextMatch {
    static __wrap(ptr) {
        const obj = Object.create(TextMatch.prototype);
        obj.__wbg_ptr = ptr;
        TextMatchFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TextMatchFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_textmatch_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get endNode() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.textmatch_endNode(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get endOffset() {
        const ret = wasm.textmatch_endOffset(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    get found() {
        const ret = wasm.textmatch_found(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    get startNode() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.textmatch_startNode(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get startOffset() {
        const ret = wasm.textmatch_startOffset(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) TextMatch.prototype[Symbol.dispose] = TextMatch.prototype.free;

/**
 * An open document: the imported model, its current pagination, and the shaper
 * (and its font registry) that produced it, plus the media bytes rendering needs.
 *
 * Held together because rendering must serve the faces the shaper actually
 * resolved during pagination — [`ParleyShaper::registry`] is only complete after
 * [`casual_doc_layout::document_layout::paginate_document`] has shaped every paragraph.
 */
export class WasmDocument {
    static __wrap(ptr) {
        const obj = Object.create(WasmDocument.prototype);
        obj.__wbg_ptr = ptr;
        WasmDocumentFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmDocumentFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmdocument_free(ptr, 0);
    }
    /**
     * The body's text that is hard to read against what is behind it, as a
     * JSON array of `{node, offset, text, foreground, background, ratio,
     * large}` — the accessibility checker's contrast rule (`docs/109` HF-064).
     * What is and is not graded is this module's comment. O(body inlines).
     * @returns {string}
     */
    accessibilityContrastFindings() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_accessibilityContrastFindings(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * A WINDOW of the accessibility projection: at most `count` blocks starting
     * at `start`, plus the document's total block count so the host can report
     * position and rebuild the window as the caret moves.
     *
     * The whole-document projection is why a large document could not be opened
     * in a browser at all. Every block was serialized to JSON, marshalled across
     * the wasm boundary, parsed, and turned into a DOM node — for a 16,000
     * paragraph document that was 16,384 nodes and 87% of the open time (6.9 s
     * of 7.9 s), and a 65,000 paragraph one exhausted wasm32 memory and aborted
     * the module (`docs/104` HF-158). Page canvases were virtualized for exactly
     * this reason; the mirror never was.
     *
     * The returned JSON is `{ "total": n, "start": i, "blocks": [...] }`.
     * @param {number} start
     * @param {number} count
     * @returns {string}
     */
    accessibilityTreeWindow(start, count) {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_accessibilityTreeWindow(retptr, this.__wbg_ptr, start, count);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The document's structure as a **read-only** JSON array of
     * `A11yBlockJson` nodes in document order — headings (with a 1-based
     * level), paragraphs, list items (with an `ordered` flag), and tables
     * (a grid of cell plain-text). A host renders this into an off-screen
     * ARIA tree so assistive technology can read the canvas document, which
     * otherwise exposes nothing to a screen reader (docs/67 row 9). The model
     * stays the source of truth: this is a projection, never an editing
     * surface (docs/67 Open Risks — "Accessibility bridges cannot become
     * hidden DOM editors"). Empty paragraphs are omitted as reading noise;
     * content controls flatten into their blocks; a paragraph inside a table
     * cell contributes to that cell's text, not a top-level node.
     *
     * A paragraph also contributes one `image` node per drawing it holds, so a
     * figure paragraph — which has no plain text at all, and which the
     * empty-text skip above used to drop whole — reaches the reader; the block
     * content of every text box it holds, a text box inside a DrawingML group
     * included (`109` HF-169); and one `checkbox` node per `w14:checkbox` form
     * control, with the role, the checked state and the name that control's
     * private-use glyph cannot carry (`docs/120`).
     * @returns {string}
     */
    accessibilityTree() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_accessibilityTree(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the current host-supplied review identity as JSON
     * (`{"name":..., "initials":..., "id":...}`), or the JSON literal `null`
     * when no identity has been set (initial state, or after
     * `setActiveAuthor("")`).
     * @returns {string}
     */
    activeAuthor() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_activeAuthor(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * [`add_comment`](Self::add_comment) with `@` mentions (`docs/175` §7.3): `mentions` is a
     * JSON array of `{start, end, link?}`, offsets in UTF-16 code units of `text` — what the
     * composer measured — and each linked span becomes a hyperlink run to the directory
     * entry's link. A mention that cannot be placed exactly is refused, never guessed at.
     * @param {string} start_node
     * @param {number} start
     * @param {string} end_node
     * @param {number} end
     * @param {string} text
     * @param {string} mentions
     * @param {string | null} [author]
     * @param {string | null} [initials]
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    addCommentMentioning(start_node, start, end_node, end, text, mentions, author, initials, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(mentions, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            var ptr5 = isLikeNone(initials) ? 0 : passStringToWasm0(initials, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len5 = WASM_VECTOR_LEN;
            var ptr6 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len6 = WASM_VECTOR_LEN;
            wasm.wasmdocument_addCommentMentioning(retptr, this.__wbg_ptr, ptr0, len0, start, ptr1, len1, end, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Creates a comment over a selection that may span multiple paragraphs.
     * The `CommentRangeStart` marker lands in `start_node` at `start`, the
     * `CommentRangeEnd` marker and the `CommentReference` in `end_node` at
     * `end`, all keyed to the same [`CommentId`]; when `start_node == end_node`
     * this is a single-paragraph span and behaves exactly as before. The
     * endpoints are expected in document order (the editor's `selectionEdge`).
     * The marker and definition changes are one undoable review transaction.
     * @param {string} start_node
     * @param {number} start
     * @param {string} end_node
     * @param {number} end
     * @param {string} text
     * @param {string | null} [author]
     * @param {string | null} [initials]
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    addComment(start_node, start, end_node, end, text, author, initials, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(initials) ? 0 : passStringToWasm0(initials, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            var ptr5 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len5 = WASM_VECTOR_LEN;
            wasm.wasmdocument_addComment(retptr, this.__wbg_ptr, ptr0, len0, start, ptr1, len1, end, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Marks every paragraph the selection `start..end` touches at contents
     * level `level` (1..=9) without restyling it, or — with `-1` — as "Do not
     * show in table of contents" (ONLYOFFICE's References ▸ Add text). One
     * undoable action. **O(document)** for the walks that find them.
     *
     * # Errors
     * A level outside -1 and 1..=9, a paragraph outside the body, or nothing
     * to change.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} level
     * @returns {EditResult}
     */
    addParagraphsToContents(start_node, start_offset, end_node, end_offset, level) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_addParagraphsToContents(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, level);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Add Text / Edit Text on a shape: gives the shape `node` a text
     * body it keeps its geometry behind, as one undoable action. The returned
     * caret is the new body's paragraph, so the host focuses it and the user
     * types straight into the shape.
     *
     * OOXML has one element for both — a `wps:wsp` with a `wps:txbx` IS a
     * shape with text — so this is not a wrapper or an overlay: the shape
     * becomes a text-bearing shape, keeping its id, its preset, its
     * adjustment guides, its fill and its outline. A star stays a star and
     * gets words inside it.
     *
     * Calling it on a shape that already has text is a no-op reporting
     * success, so a host can bind it to a double-click without tracking
     * state.
     *
     * # Errors
     *
     * When `node` is not a shape inside a group, or when it is a FREEFORM
     * (`a:custGeom`) shape: `GroupTextBox` models no custom path, so giving
     * one text would silently flatten it to its bounding rectangle. It is
     * refused with that reason rather than quietly reshaped.
     *
     * **O(document), ONE walk.**
     * @param {string} node
     * @returns {EditResult}
     */
    addTextToShape(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_addTextToShape(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Next / Previous Footnote (or Endnote): the first reference of
     * `kind` after (`forward`) or before the caret at `node`/`offset`, as JSON
     * `{node, offset}`, or `null` when there is none that way. A caret outside
     * the body (in a header, or inside a note) starts from the document's top
     * going forward and its end going back. O(blocks).
     *
     * # Errors
     *
     * An unknown `kind`.
     * @param {string} kind
     * @param {string} node
     * @param {number} offset
     * @param {boolean} forward
     * @returns {string}
     */
    adjacentNote(kind, node, offset, forward) {
        let deferred4_0;
        let deferred4_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(kind, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_adjacentNote(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, offset, forward);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr3 = r0;
            var len3 = r1;
            if (r3) {
                ptr3 = 0; len3 = 0;
                throw takeObject(r2);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * Adjusts the left (start) indent by `delta_twips` (positive indents,
     * negative outdents, clamped at 0) over the selection's paragraphs.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} delta_twips
     * @returns {EditResult}
     */
    adjustIndent(start_node, start_offset, end_node, end_offset, delta_twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_adjustIndent(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, delta_twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Promotes or demotes list paragraphs by one numbering level, preserving
     * their list instance. Non-list paragraphs are rejected so the host can
     * retain ordinary indentation behavior.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} delta
     * @returns {EditResult}
     */
    adjustListLevel(start_node, start_offset, end_node, end_offset, delta) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_adjustListLevel(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, delta);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Narrows this replica to the capabilities the room granted this participant —
     * `152` §10 Q4, the engine half.
     *
     * The host calls this after it has **verified** the grant, with the capability set that
     * came out of the verification. The engine does not parse a token, does not check a
     * signature and does not read an expiry: it reads no clock and holds no key, which is
     * the same rule that makes `WasmDocument::adopt_participant_identity` take a number
     * rather than mint one. ADR-060 records where the signature profile belongs.
     *
     * # It can only ever narrow
     *
     * The new value is **intersected** with what this replica already holds, so a second
     * call cannot widen access and a host that re-applies a stale grant cannot restore a
     * right the room revoked. A participant who needs more than they were granted rejoins;
     * `143` §10's "losing edit permission leaves the document readable and preserves unsent
     * local work" is exactly this direction.
     *
     * **A document with no session must not call it, and does not need to.** Until it is
     * called this replica holds every capability, which is the standalone mode: no grant,
     * nobody to issue one, and the reader holds the bytes (ADR-052, `152` §2a). Local-first
     * is unchanged by the existence of this seam.
     *
     * # What a client may assume from this
     *
     * That the relay will refuse what this refuses. **Not** that this is the authority: the
     * relay keeps its own copy from the grant it verified and judges every submission against
     * it, so a modified client that skipped this call still cannot write above its level.
     * What this buys is a chrome that can disable a control *with a reason* instead of
     * offering a gesture the network will reject.
     *
     * # Errors
     *
     * An unknown capability name. Unknown names are refused rather than ignored: a host that
     * misspells `"suggest"` must hear about it, because silently granting less is a bug that
     * looks like a working read-only mode.
     *
     * O(1).
     * @param {string[]} granted
     */
    adoptParticipantCapabilities(granted) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(granted, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_adoptParticipantCapabilities(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Moves this replica's minting into the space a relay's participant number implies.
     *
     * The host calls this **once**, with the participant number the room assigned it,
     * before the first edit it intends to share. Everything the editor mints afterwards —
     * runs, paragraphs, table nodes, comments, bookmarks, notes, header/footer bodies,
     * numbering, media — lands in a space no other participant can mint in, so two people
     * editing one document never produce the same id for two different nodes.
     *
     * **A document with no session must not call it, and does not need to.** Minting works
     * with no server and no participant number at all: until this is called the editor
     * mints in the reserved offline space, which is a space this function can never return.
     * Local-first is unchanged by the existence of this seam.
     *
     * # What it deliberately does not do
     *
     * It does **not** re-map ids already minted. An id *is* the identity here, so rewriting
     * one would leave two replicas disagreeing about the name of a node and make a
     * byte-comparable snapshot impossible for ever (`150` §9.3). Ids minted before the call
     * stay where they were; only future ones move.
     *
     * # Complexity
     *
     * One O(document) walk, to guarantee the counter starts above anything the document
     * already holds in the space being entered — which is what makes rejoining under a
     * number this replica held before safe. Called once per join, never per keystroke.
     *
     * # Errors
     *
     * The two participant numbers that would alias a reserved space (`u64::MAX` and
     * `u64::MAX - 1`) are refused rather than silently aliased.
     * @param {bigint} participant
     */
    adoptParticipantIdentity(participant) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_adoptParticipantIdentity(retptr, this.__wbg_ptr, participant);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Accepts the preview `id`: commits exactly its operations as one undo
     * step through the editor's choke point. Refused when it is gone, stale,
     * or the engine refuses it. **O(operations)** plus the re-layout.
     * @param {number} id
     * @returns {EditResult}
     */
    aiAccept(id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_aiAccept(retptr, this.__wbg_ptr, id);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Discards the preview `id`. Nothing it compiled is kept. O(1).
     * @param {number} id
     * @returns {boolean}
     */
    aiDiscard(id) {
        const ret = wasm.wasmdocument_aiDiscard(this.__wbg_ptr, id);
        return ret !== 0;
    }
    /**
     * `aiPreview` for an ADD-IN (`docs/183` §17): the same compile, authored
     * `"<add-in name> (add-in)"` rather than "Casual AI", so a reviewer can tell
     * LanguageTool's suggestion from the assistant's. The editor passes the name
     * from the add-in's manifest; the engine adds the suffix itself, so no add-in
     * can sign its changes as a person. An empty name is "Casual AI".
     * **O(document)**, as `aiPreview`.
     * @param {string} plan
     * @param {string} access
     * @param {boolean} direct
     * @param {string} date
     * @param {string} add_in
     * @returns {string}
     */
    aiPreviewFrom(plan, access, direct, date, add_in) {
        let deferred5_0;
        let deferred5_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(plan, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(access, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(add_in, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len3 = WASM_VECTOR_LEN;
            wasm.wasmdocument_aiPreviewFrom(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, direct, ptr2, len2, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred5_0 = r0;
            deferred5_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred5_0, deferred5_1, 1);
        }
    }
    /**
     * Compiles an edit plan privately (`docs/181` §4.4): returns the redline
     * of every affected block, each edit's refusal, the mode and the author,
     * and a `previewId` when it could be accepted. Changes nothing. `date` is
     * the suggestion date (ISO 8601). **O(document)** for the clone plus
     * O(affected blocks).
     * @param {string} plan
     * @param {string} access
     * @param {boolean} direct
     * @param {string} date
     * @returns {string}
     */
    aiPreview(plan, access, direct, date) {
        let deferred4_0;
        let deferred4_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(plan, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(access, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_aiPreview(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, direct, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred4_0 = r0;
            deferred4_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * The assistant's reads (`docs/178` §4.1), over the live document:
     * `request` is `{"tool": "outline" | "read" | "search" | "trackedChanges"
     * | "comments", ...}` with that read's arguments. Returns `{ok, value}` or
     * `{ok: false, error}` as JSON. **O(document)**: a clone plus the read.
     * @param {string} request
     * @param {string} access
     * @returns {string}
     */
    aiRead(request, access) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(request, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(access, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_aiRead(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred3_0 = r0;
            deferred3_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * Accepts every suggestion the turn made, as one undo step (direct: no edit).
     * @param {number} turn
     * @returns {EditResult}
     */
    aiTurnAccept(turn) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_aiTurnAccept(retptr, this.__wbg_ptr, turn);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The insertion point mapped to now: `{"node","offset"}` JSON. O(commits since).
     * @param {number} turn
     * @returns {string}
     */
    aiTurnAnchor(turn) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_aiTurnAnchor(retptr, this.__wbg_ptr, turn);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Opens a Casual AI turn (`docs/183` §23): `mode` is `"direct"` or `"suggest"` (the
     * host's EFFECTIVE mode), `date` the suggestions' ISO date. Ends any open turn. Returns
     * the turn id. O(1).
     * @param {string} mode
     * @param {string} date
     * @returns {number}
     */
    aiTurnBegin(mode, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(mode, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_aiTurnBegin(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return r0 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * A comment authored "Casual AI" on `[start, end)` of paragraph `node`, in the turn.
     * @param {number} turn
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @param {string} text
     * @returns {EditResult}
     */
    aiTurnComment(turn, node, start, end, text) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_aiTurnComment(retptr, this.__wbg_ptr, turn, ptr0, len0, start, end, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Deletes a range that may cross paragraphs; the anchor goes to its start.
     * @param {number} turn
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @returns {EditResult}
     */
    aiTurnDeleteRange(turn, start_node, start_offset, end_node, end_offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_aiTurnDeleteRange(retptr, this.__wbg_ptr, turn, ptr0, len0, start_offset, ptr1, len1, end_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Closes the turn's writing: `{"turn","mode","commits","group","revisions":[ids]}`.
     * The turn stays decidable. O(document) for the revision list.
     * @param {number} turn
     * @returns {string}
     */
    aiTurnEnd(turn) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_aiTurnEnd(retptr, this.__wbg_ptr, turn);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Inserts an empty `rows` x `columns` table after paragraph `after` (tracked in
     * suggest mode); `aiTurnTableCells` names its cells.
     * @param {number} turn
     * @param {string} after
     * @param {number} rows
     * @param {number} columns
     * @param {boolean} header
     * @returns {EditResult}
     */
    aiTurnInsertTable(turn, after, rows, columns, header) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(after, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_aiTurnInsertTable(retptr, this.__wbg_ptr, turn, ptr0, len0, rows, columns, header);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts an empty paragraph after the top-level block holding `block` (a paragraph or
     * a table id); the anchor goes to it.
     * @param {number} turn
     * @param {string} block
     * @returns {EditResult}
     */
    aiTurnParagraphAfter(turn, block) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(block, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_aiTurnParagraphAfter(retptr, this.__wbg_ptr, turn, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Removes `table`: a tracked whole-table deletion (suggest) or `DeleteTable` (direct).
     * @param {number} turn
     * @param {string} table
     * @returns {EditResult}
     */
    aiTurnRemoveTable(turn, table) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(table, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_aiTurnRemoveTable(retptr, this.__wbg_ptr, turn, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Removes `[start, end)` of paragraph `node` before a replacement is written: a
     * tracked deletion, the anchor where the editor's own Suggesting type-over continues
     * (the replacement then shows beside the struck text), or a direct one (the anchor at
     * `start`).
     * @param {number} turn
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @returns {EditResult}
     */
    aiTurnReplace(turn, node, start, end) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_aiTurnReplace(retptr, this.__wbg_ptr, turn, ptr0, len0, start, end);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Reverts the whole turn as one step, sparing the person's own edits. `forget`: a
     * safety rollback that leaves no undo entry for the turn or the revert.
     * @param {number} turn
     * @param {boolean} forget
     * @returns {EditResult}
     */
    aiTurnRevert(turn, forget) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_aiTurnRevert(retptr, this.__wbg_ptr, turn, forget);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets where the turn writes next (no edit). O(1) plus the paragraph lookup.
     * @param {number} turn
     * @param {string} node
     * @param {number} offset
     */
    aiTurnSetAnchor(turn, node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_aiTurnSetAnchor(retptr, this.__wbg_ptr, turn, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * `{"open","mode","group","commits","anchor": {"node","offset"} | null}`.
     * @param {number} turn
     * @returns {string}
     */
    aiTurnState(turn) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_aiTurnState(retptr, this.__wbg_ptr, turn);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * `{"table": id | null, "cells": [[paragraphId | null, …], …]}` for the turn's table.
     * @param {number} turn
     * @returns {string}
     */
    aiTurnTableCells(turn) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_aiTurnTableCells(retptr, this.__wbg_ptr, turn);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Writes `text` at the turn's anchor (`\n` = paragraph break) and advances it.
     * The result's caret is the AI's new insertion point, not the person's.
     * @param {number} turn
     * @param {string} text
     * @returns {EditResult}
     */
    aiTurnWrite(turn, text) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_aiTurnWrite(retptr, this.__wbg_ptr, turn, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's and ONLYOFFICE's Arrange ▸ Align and Distribute, over the
     * floating objects named by `nodes` (a JSON array of node ids), as ONE
     * undoable action.
     *
     * `how` is `left`, `center`, `right`, `top`, `middle`, `bottom`,
     * `distributeHorizontally` or `distributeVertically`; `relative_to` is
     * `page`, `margin` or `selected`. See the module documentation for what
     * each writes.
     *
     * # Errors
     *
     * With a marked refusal when nothing is named, an object is not floating
     * or not placed, objects aligned to each other lie on different pages, an
     * alignment to each other names fewer than two objects, a distribution
     * fewer than three, or a token is unknown.
     *
     * **O(objects × document)**; see the module documentation.
     * @param {string} nodes
     * @param {string} how
     * @param {string} relative_to
     * @returns {EditResult}
     */
    alignObjects(nodes, how, relative_to) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(nodes, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(how, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(relative_to, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_alignObjects(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The alignment of the first paragraph the selection touches (`"start"`,
     * `"center"`, `"end"`, `"justify"`), or `"start"` if unset — for toolbar
     * state.
     * @param {string} node
     * @param {number} offset
     * @returns {string}
     */
    alignmentAt(node, offset) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_alignmentAt(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Applies a comparison sidecar to this document as tracked changes
     * (**ADR-061**).
     *
     * `sidecar` is `VersionDiff`'s JSON (`casual-doc-diff` `DIFF_SCHEMA` 1)
     * produced by comparing `left` = the other document against `right` = THIS
     * document's own exported bytes — `beginVersionDiff`'s orientation,
     * which is review's. Each `DiffChange` becomes an `InlineNode::Revision`
     * authored to `author`/`date`, and the lot is applied as **one**
     * `Operation::UpdateReviewState` under `HistoryKind::Review`: a single undo
     * step, after which every existing review surface reads the comparison with
     * no further change — `listRevisions`, the author-coloured underline and
     * strikethrough on the canvas, `setShowChanges`, `decideRevision` and
     * `decideAllRevisions`, next/previous, and `w:ins`/`w:del` on export. The
     * open document *becomes* the merged document, so "save the result as a new
     * version" is an ordinary save.
     *
     * Refuses, rather than silently merging, when this document already carries
     * tracked changes: one `reviewType` cannot hold both "a person suggested
     * this" and "a comparison computed this" without the two deciding each
     * other. ONLYOFFICE resolves it by accepting every existing change first;
     * destroying a reviewer's suggestions to run a comparison is the loss
     * `docs/158` §2.4 puts first, so this refuses with its own sentence.
     *
     * What a tracked change cannot say is **reported** through
     * `EditResult::pasteLoss` — a whole block the other document has and this
     * one does not, a move's far half, a
     * formatting/style/section/definition/resource/comment/metadata difference
     * (our four `RevisionKind`s have no form for them), a story outside the
     * body, removed text the record carries only as an excerpt, and a path that
     * no longer resolves. The field's name reads oddly for a comparison and is
     * used anyway: its own contract is that the next path to degrade something
     * must not invent a second channel.
     *
     * Complexity: **O(changes + the paragraphs they touch)**, plus the one
     * paragraph index the review operation builds. Not O(document) per change.
     *
     * # Errors
     *
     * Throws when the sidecar is unreadable or carries another schema, when the
     * author name is missing or too long, and when this document already
     * carries tracked changes.
     * @param {string} sidecar
     * @param {string} author
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    applyDiffAsRevisions(sidecar, author, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sidecar, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_applyDiffAsRevisions(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets what this participant may do to what the **room** last said, bounded by the host's
     * ceiling — `ServerMessage::Welcome`, `Resumed` and `AccessChanged`.
     *
     * # Why this is not `adopt_participant_capabilities`
     *
     * Because the two inputs are different authorities and composing them the same way is wrong
     * in one direction each. A host grant may only narrow, so adoption intersects. A room's word
     * may move a participant **either way** inside what the host allowed — that is the whole of
     * what a rights change is — so intersecting with the value already held would make every
     * demotion permanent, and a promotion the relay has already accepted would leave this
     * replica refusing edits the network would take.
     *
     * What is still impossible is widening past the host: the result is intersected with
     * `host_ceiling`, which only [`WasmDocument::adopt_participant_capabilities`] writes. So a
     * relay — or anything pretending to be one — can redistribute inside the host's grant and
     * cannot exceed it, which is the invariant ADR-063 states for the wire value.
     *
     * This replica's copy is not an authority in either case, and never was: the relay keeps its
     * own and judges every submission against it (`casual_doc_edit::access`'s header says so in
     * as many words). What it buys is a control that disables itself with a reason instead of
     * offering a gesture the network will refuse.
     *
     * # Errors
     *
     * An unknown capability name, refused rather than ignored, for the reason adoption gives.
     *
     * O(the names).
     * @param {string[]} granted
     */
    applyRoomAccess(granted) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(granted, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_applyRoomAccess(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Applies the Borders and Shading dialog in ONE undoable step. `patch` is
     * JSON: `{"scope":"cells"|"table","edges":{"top":"on"|"off",…},"style",
     * "size","color","shading":"none"|"#rrggbb"}`; a line not named is left as
     * it is. "On" lines are drawn with the pen; "off" lines go (an explicit
     * `nil` where the table, a style or a neighbour would still draw one).
     * `"table"` sets `w:tblBorders` and drops the cells' own overrides of the
     * lines it changes, which is Word's Apply to: Table.
     *
     * # Errors
     * When the settings are malformed, the line style is not one the renderer
     * draws, the range refuses, or nothing would change.
     * @param {string} anchor
     * @param {string} focus
     * @param {string} patch
     * @returns {EditResult}
     */
    applyTableBorders(anchor, focus, patch) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(anchor, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(focus, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(patch, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_applyTableBorders(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Applies the table-properties inspector draft as one undoable action.
     *
     * Only fields present in the JSON patch are changed, so opening and applying
     * the inspector does not materialize model defaults that were previously
     * absent. Table-, active-row-, and active-column-level values are committed
     * together through one [`Operation::ReplaceTable`].
     * @param {string} node
     * @param {string} properties_json
     * @returns {EditResult}
     */
    applyTableProperties(node, properties_json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(properties_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_applyTableProperties(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Applies a named table style, or clears the table style when `name` is empty.
     * @param {string} node
     * @param {string} name
     * @returns {EditResult}
     */
    applyTableStyle(node, name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_applyTableStyle(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Converts the paragraph `node`, whose text starts with a typed list marker
     * of `marker_bytes` UTF-8 bytes (`"1. "`, `"- "`), into a `"numbered"` or
     * `"bullet"` list item: the marker is removed and the paragraph joins the
     * editor's shared list of that kind, as ONE undoable action whose Undo
     * restores the literal marker. The caret lands where it was, less the marker
     * (`caret_offset` is the caret's byte offset before the conversion).
     *
     * Refused, changing nothing, when the paragraph is already a list item, when
     * `marker_bytes` is not a character boundary inside the paragraph's text,
     * when the caret is before the marker's end, and while Track Changes is on (a
     * tracked conversion would need the deletion and the property change tracked
     * together; the host does not ask then, and the engine does not guess).
     * @param {string} node
     * @param {number} marker_bytes
     * @param {number} caret_offset
     * @param {string} kind
     * @returns {EditResult}
     */
    autoFormatList(node, marker_bytes, caret_offset, kind) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(kind, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_autoFormatList(retptr, this.__wbg_ptr, ptr0, len0, marker_bytes, caret_offset, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns stable format identifiers currently available for export.
     * @returns {string[]}
     */
    availableExportFormats() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_availableExportFormats(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Which running band `(x, y)` is in on `page` — `"header"`, `"footer"`, or
     * `""` for the content area.
     *
     * The host asked this question from its own copy of the page setup, which
     * is document-level: in a document whose sections have different margins,
     * the host and the engine disagreed about where a page's header ends. One
     * rule, owned by the layout that defines it.
     * @param {number} page
     * @param {number} x_twip
     * @param {number} y_twip
     * @returns {string}
     */
    bandAt(page, x_twip, y_twip) {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_bandAt(retptr, this.__wbg_ptr, page, x_twip, y_twip);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The 0-based index, among the document's top-level blocks, of the block
     * containing `node` — what the host anchors the accessibility window to, so
     * the window follows the caret instead of being pinned to the start.
     * `-1` when the node is not in the body.
     * @param {string} node
     * @returns {number}
     */
    blockIndexOf(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_blockIndexOf(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * The **node id** of the top-level body block containing `node`, or `""`
     * when it is not in the body.
     *
     * [`Self::block_index_of`]'s answer as an identity rather than a position,
     * and that difference is the point: an index is invalidated by anything that
     * filters the list it indexes into, and since ADR-049 the accessibility
     * projection omits the blocks inside a collapsed heading's range. The
     * projection reports the owning block of every node it emits, so a host that
     * has to find "the caret's table" among them matches an id instead of doing
     * arithmetic that a fold — or a paragraph projecting more than one node —
     * silently breaks.
     *
     * `O(document)`, the same walk `block_index_of` makes, and for the same
     * reason: it is asked once per mirror rebuild, not once per node.
     * @param {string} node
     * @returns {string}
     */
    blockNodeOf(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_blockNodeOf(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Every bookmark as `id\tname`, in ascending id order — the id-bearing
     * accessor a manager surface needs to target [`renameBookmark`](Self::rename_bookmark)
     * and [`deleteBookmark`](Self::delete_bookmark) unambiguously (names are not
     * unique). The id is the 32-hex bookmark id; a fresh [`createBookmark`](Self::create_bookmark)
     * appears here on the next read.
     * @returns {string[]}
     */
    bookmarkEntries() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_bookmarkEntries(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Resolves an authored bookmark to `node\toffset`, or an empty string.
     * @param {string} name
     * @returns {string}
     */
    bookmarkPosition(name) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_bookmarkPosition(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Calculates a bounded table formula and writes its numeric result into the
     * active cell. Supported forms are `=SUM|AVERAGE|MIN|MAX(ABOVE|LEFT)`.
     * @param {string} node
     * @param {string} formula
     * @returns {EditResult}
     */
    calculateTableFormula(node, formula) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(formula, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_calculateTableFormula(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Whether [`align_objects`](Self::align_objects) would act, as
     * `{"can":true}` or `{"can":false,"reason":"…"}`, so a host disables the
     * row WITH the sentence instead of offering a command that refuses.
     * Nothing is written. O(objects × document).
     * @param {string} nodes
     * @param {string} how
     * @param {string} relative_to
     * @returns {string}
     */
    canAlignObjects(nodes, how, relative_to) {
        let deferred4_0;
        let deferred4_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(nodes, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(how, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(relative_to, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_canAlignObjects(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred4_0 = r0;
            deferred4_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * Whether [`continue_list`](Self::continue_list) would succeed at `node`: the
     * paragraph is a numbered list item with an earlier numbered list at the same
     * level (a different instance) to resume. Drives the toolbar button's enabled
     * state so it is offered only when there is actually a list to continue.
     * @param {string} node
     * @returns {boolean}
     */
    canContinueList(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_canContinueList(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * Whether the objects named by `nodes` (a JSON array of node ids) can be
     * grouped, as `{"can":true}` or `{"can":false,"reason":"…"}`.
     *
     * The reason exists so a host ships a DISABLED Group command carrying why
     * rather than a dead button (SKILL §10: never a dead control).
     *
     * **O(document), ONE walk.**
     * @param {string} nodes
     * @returns {string}
     */
    canGroupObjects(nodes) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(nodes, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_canGroupObjects(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Whether the document has at least one undone action available to redo.
     * @returns {boolean}
     */
    get canRedo() {
        const ret = wasm.wasmdocument_canRedo(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether the document has at least one user action available to undo.
     * @returns {boolean}
     */
    get canUndo() {
        const ret = wasm.wasmdocument_canUndo(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Every caption in the document as `"{node}\t{label}\t{number}\t{text}"`
     * rows in document order — what the cross-reference picker lists and what a
     * table of figures will enumerate.
     *
     * **O(document), ONE walk.**
     * @returns {string[]}
     */
    captionEntries() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_captionEntries(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Every caption label the document uses, unioned with Word's built-ins
     * (`Figure`, `Table`, `Equation`), sorted — the Insert Caption dialog's label
     * list. A label is a `SEQ` sequence name, so a document another producer
     * wrote teaches us its labels without any configuration.
     *
     * **O(document), ONE walk.**
     * @returns {string[]}
     */
    captionLabels() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_captionLabels(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The run formatting a collapsed caret inherits — what new typing there would
     * carry (the run to the caret's left, Word's rule). Drives the toolbar's active
     * state at a caret and the "type bold" toggle direction, where `formatAt` on an
     * empty range reports all-false.
     * @param {string} node
     * @param {number} offset
     * @returns {Format}
     */
    caretFormat(node, offset) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_caretFormat(this.__wbg_ptr, ptr0, len0, offset);
        return Format.__wrap(ret);
    }
    /**
     * The caret box for a model anchor, as `[page, xTwip, yTwip, wTwip, hTwip]`
     * (page-local; `w` is 0). Empty if the anchor resolves to no line (e.g. a
     * stale position) or `node` is malformed.
     * @param {string} node
     * @param {number} offset
     * @returns {Int32Array}
     */
    caretRect(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_caretRect(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The effective run styling a **collapsed caret** inherits — size / authored
     * font / color / super-sub after document defaults and style inheritance.
     * Renderer substitutions and glyph-coverage fallbacks are intentionally not
     * exposed as authored formatting.
     * @param {string} node
     * @param {number} offset
     * @returns {RunStyle}
     */
    caretRunStyle(node, offset) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_caretRunStyle(this.__wbg_ptr, ptr0, len0, offset);
        return RunStyle.__wrap(ret);
    }
    /**
     * Whether the text at the caret is laid out but not painted
     * (`w14:textFill/w14:noFill`): the host's gate before an edit there, so
     * an unedited image-text line box is made editable first
     * ([`edit_image_text`](Self::edit_image_text)). The cost of
     * `caretFormat`: the caret's run, no document walk.
     * @param {string} node
     * @param {number} offset
     * @returns {boolean}
     */
    caretTextUnpainted(node, offset) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_caretTextUnpainted(this.__wbg_ptr, ptr0, len0, offset);
        return ret !== 0;
    }
    /**
     * The cell's border edges as a bitmask (top=1, bottom=2, left=4, right=8) — for
     * reflecting the active cell-border presets.
     * @param {string} node
     * @returns {number}
     */
    cellBorderEdges(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_cellBorderEdges(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * The canonical line style of the cell's first set border edge (top, then bottom, then
     * left, then right), or `""` when the cell has no border at all.
     *
     * Without this a style dropdown would be write-only: Word's Borders control shows the
     * style already in force, and a control that cannot reflect its own state is the
     * half-dead version of the dead control the working contract forbids. The token is
     * canonicalised through `border_style_token`, so a document carrying `dashSmallGap`
     * reflects as `dashed` and the host has one spelling per rendering to match against;
     * a style the renderer cannot draw apart reports `"single"`, which is what it paints.
     *
     * O(1) — it reads the cell's own properties and walks nothing.
     * @param {string} node
     * @returns {string}
     */
    cellBorderStyle(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_cellBorderStyle(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The active cell's border box as a flat `[page, x, y, w, h]` in page-local
     * twips (empty when the caret is not in a table) — the geometry the frontend
     * draws the active-cell highlight from.
     * @param {string} node
     * @returns {Int32Array}
     */
    cellRect(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_cellRect(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The shading fill of the cell containing `node` as packed `0xRRGGBB`, or `-1`.
     * @param {string} node
     * @returns {number}
     */
    cellShadingAt(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_cellShadingAt(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * The text direction of the cell holding `node`: `horizontal`,
     * `rotateDown` or `rotateUp`; empty outside a table. **O(document).**
     * @param {string} node
     * @returns {string}
     */
    cellTextDirectionAt(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_cellTextDirectionAt(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The ordered text bounds of the innermost table cell containing `node`.
     *
     * Cell ownership is model state: the browser must not infer these bounds
     * from canvas geometry or the accessibility mirror. A cell containing an
     * embedded text-box story deliberately returns `found = false`; such a
     * story is a separate editing surface and a single contiguous model range
     * would cross that boundary.
     * @param {string} node
     * @returns {CellTextRange}
     */
    cellTextRange(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_cellTextRange(this.__wbg_ptr, ptr0, len0);
        return CellTextRange.__wrap(ret);
    }
    /**
     * The vertical alignment of the cell containing `node`: `"top"`/`"center"`/
     * `"bottom"` (defaults to `"top"`); `""` when not in a cell.
     * @param {string} node
     * @returns {string}
     */
    cellVerticalAlignAt(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_cellVerticalAlignAt(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Word's Shape Format ▸ Edit Shape ▸ Change Shape and ONLYOFFICE's Change
     * shape (`web-apps/apps/documenteditor/main/app/view/ShapeSettings.js`,
     * `btnChangeShape`): swaps the shape `node`'s outline for the preset
     * `geometry` — the same `a:prstGeom@prst` tokens `insertShape` takes — as
     * one undoable action, keeping everything else the shape has: its size and
     * position, fill and outline, text, rotation and flips (`docs/109` RM-30).
     *
     * The old preset's adjust values and any custom path are dropped: they are
     * parameters OF the old outline (a rounded rectangle's corner radius means
     * nothing to a star), which is also what Word does.
     *
     * # Errors
     *
     * An unknown token, or a `node` that is not a shape or a grouped text box.
     *
     * **O(document), ONE walk.**
     * @param {string} node
     * @param {string} geometry
     * @returns {EditResult}
     */
    changeShape(node, geometry) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(geometry, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_changeShape(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The authoring view of the chart anchored at `node`, as JSON, or `""` when
     * `node` is not a chart object.
     *
     * `""` rather than an error because the data editor asks this of whatever
     * object is selected, and "the selection is a picture" is not a failure —
     * it is the answer that tells the panel to hide its chart section.
     *
     * The payload's shape is `ChartDataView`: the family and the gallery, the
     * title and legend, the series names, the row labels, the cells as
     * `cells[row][column]`, the model's own ceilings, and — when the data may not
     * be changed — `editable: false` with the reader's sentence and a routing
     * code. See this module's header for the four conditions.
     *
     * # Complexity
     *
     * O(charts) to find the projection plus O(series × rows) to build the view.
     * Nothing walks the document.
     * @param {string} node
     * @returns {string}
     */
    chartData(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_chartData(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Checks `password` against the restriction's verifier without changing
     * anything: `"match"`, `"mismatch"`, `"unverifiable"`, or `"none"` when
     * there is no password. The dialog asks first so a wrong password is said
     * beside the field rather than after the dialog closes. O(spin count).
     * @param {string} password
     * @returns {string}
     */
    checkProtectionPassword(password) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(password, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_checkProtectionPassword(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The checked state of the checklist item at `node`: `1` checked, `0`
     * unchecked, `-1` when the paragraph is not a checklist item.
     * @param {string} node
     * @returns {number}
     */
    checkboxStateAt(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_checkboxStateAt(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * The clickable checkbox markers for every checklist item, as a JSON array of
     * `{ node, page, x, y, w, h, checked }` (page-local twips). The host paints a
     * transparent click target over each (the checkbox glyph itself is baked into
     * the page raster) and calls [`toggle_checklist_item`](Self::toggle_checklist_item)
     * on click. The rect is the hanging gutter just left of the item's text — where
     * the marker sits — sized from the line height so it scales with the font.
     * @returns {string}
     */
    checklistMarkers() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_checklistMarkers(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Clears direct character formatting over a range while preserving the
     * paragraph's named style. The selection remains intact in the host.
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @returns {EditResult}
     */
    clearFormatting(node, start, end) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_clearFormatting(retptr, this.__wbg_ptr, ptr0, len0, start, end);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Clears direct paragraph presentation, preserving style, list, section and review structure.
     * Complexity: O(document + selected paragraphs).
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @returns {EditResult}
     */
    clearParagraphFormatting(sn, so, en, eo) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_clearParagraphFormatting(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Clears every explicit tab stop over the selection.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @returns {EditResult}
     */
    clearTabStops(start_node, start_offset, end_node, end_offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_clearTabStops(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * An acknowledged-only checkpoint: pending optimistic work is rolled back on a clone.
     * @returns {Uint8Array}
     */
    collabCheckpoint() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_collabCheckpoint(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The opening frame: a `Join` this replica's transport writes first and nothing before.
     *
     * `identity` is the host's opaque name for the person, `resume_key` the disambiguator this
     * tab holds for its life, and `revision` the ordered position to be caught up from.
     *
     * **The key travels on every join, including the first**, and that is the protocol rather
     * than a precaution: a key is recorded only by the join that presented it, so a client
     * which withheld it on its first connection cannot be recognised on its second — it is
     * handed a fresh `Welcome` and a new participant number, and whatever it had not had
     * acknowledged is gone with no refusal naming the loss. So this takes the key
     * unconditionally and the caller cannot forget it.
     *
     * `grant` is the host-signed JWT the host's provider handed out **for this join**
     * (`docs/175` §3.3): carried and never read, stored or logged here. `profile` is a JSON
     * `{"id","name","initials"?,"color"?,"avatarUrl"?}` the participant **claims**; a room that
     * requires a grant ignores it and shows the grant's, and an open room shows it marked
     * unverified with its colour and avatar dropped.
     *
     * # Errors
     *
     * An empty identity, a resume key over its 128-character bound, a grant over its 8 KiB
     * bound, or a profile that is not JSON of that shape or breaks a bound (the field is named,
     * `identity-invalid`). Refused rather than trimmed: these are the host's values, and a
     * silently altered identity is a participant nobody can match.
     *
     * O(1).
     * @param {string} identity
     * @param {string} resume_key
     * @param {number} revision
     * @param {string | null} [grant]
     * @param {string | null} [profile]
     * @returns {Uint8Array}
     */
    collabJoinFrame(identity, resume_key, revision, grant, profile) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(identity, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(resume_key, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(grant) ? 0 : passStringToWasm0(grant, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(profile) ? 0 : passStringToWasm0(profile, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            wasm.wasmdocument_collabJoinFrame(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, revision, ptr2, len2, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v5 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 1, 1);
            return v5;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * A `Leave` frame: departing deliberately rather than by disconnecting.
     *
     * Worth sending even though a disconnect is detected anyway, because the two reach the
     * other participants differently — a deliberate leave is a clean close the relay answers
     * at once, and a dropped socket waits on the operating system.
     *
     * O(1).
     * @returns {Uint8Array}
     */
    collabLeaveFrame() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_collabLeaveFrame(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Carries the reader's selection across everything merged since the last call, and
     * returns it as `{anchor: {node, offset}, focus: {node, offset}, moved}` JSON — `107` P-4.
     *
     * The host calls this **synchronously, once per frame that changed the document**,
     * before it paints and before the next keystroke can read the selection. Without it a
     * remote insertion earlier in the reader's paragraph left their caret at the old offset,
     * so two people typing in one paragraph produced the later typist's word reversed on
     * both screens, and a reader whose paragraph somebody typed into typed into the wrong
     * place.
     *
     * # The boundary rule — where a caret goes when somebody types exactly at it
     *
     * A collapsed caret maps with `Affinity::Before`: text another person inserts at the
     * reader's caret appears *after* the caret, and the reader's next keystroke goes before
     * it. That keeps each typist's word in one piece when both type at one spot — with
     * `After` the two words interleave a character at a time. A range maps its earlier end
     * `After` and its later end `Before`, so text inserted at either edge stays outside the
     * selection, which is what Word and Google Docs do with a remote insertion at the edge of
     * your selection.
     *
     * A selection end whose paragraph was destroyed moves to the start of the block that now
     * stands where the removed band began, when that was the body; otherwise it is returned
     * unmapped with `removed: true` and the host places it (its own fallback validates every
     * adopted position).
     *
     * # Complexity
     *
     * O(steps merged since the last call) — one step per arriving keystroke — and **never
     * O(document)**; plus O(1) to place a caret whose paragraph was removed from the body.
     *
     * # Errors
     *
     * An end that is not a position this build can read.
     * @param {string} anchor_node
     * @param {number} anchor_offset
     * @param {string} focus_node
     * @param {number} focus_offset
     * @returns {string}
     */
    collabMapSelection(anchor_node, anchor_offset, focus_node, focus_offset) {
        let deferred4_0;
        let deferred4_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(anchor_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(focus_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_collabMapSelection(retptr, this.__wbg_ptr, ptr0, len0, anchor_offset, ptr1, len1, focus_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr3 = r0;
            var len3 = r1;
            if (r3) {
                ptr3 = 0; len3 = 0;
                throw takeObject(r2);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * The next chunk of this replica's own work to send, or `None` when there is nothing to
     * send or no room to send it.
     *
     * `None` is **not** a fault and the transport must not treat it as one: the session has
     * stopped, it has desynced, it is waiting for an ordered position a refusal named, 32
     * chunks are already in flight, or there is simply nothing new. The last of those is the
     * common case, which is why this is a poll rather than an event.
     *
     * O(the chunk).
     * @returns {Uint8Array | undefined}
     */
    collabNextChunk() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_collabNextChunk(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getArrayU8FromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Begins a new room whose seed is this exact document. Call only after host persistence.
     * @param {number} revision
     */
    collabPrepare(revision) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_collabPrepare(retptr, this.__wbg_ptr, revision);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Feeds one frame from the relay to the session, and applies whatever it carried.
     *
     * Returns an `Outcome` as JSON — named in code text and not as a link, because the type
     * is private and `RUSTDOCFLAGS="-D warnings"` refuses a public item linking to one.
     * A **refusal is not an error**: it is an outcome with a
     * code, because the connection survives one and a transport that caught it as an exception
     * would have to decide what to do with a `StaleBase` — which is exactly the decision this
     * module exists to keep. The only errors are a frame that could not be read and an arrival
     * this replica could not merge.
     *
     * # Errors
     *
     * `ODC-7007` for a frame the codec refused, and the session's own `ODC-7xxx` code for an
     * arrival that could not be merged, both carrying a sentence a reader can act on.
     *
     * O(bytes), plus one `RevisionLog::apply` on the uncontended path.
     * @param {Uint8Array} frame
     * @returns {string}
     */
    collabReceiveFrame(frame) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(frame, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_collabReceiveFrame(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * Atomically reloads a checked snapshot and replays safely anchored pending text edits.
     * Uncertain work remains downloadable through `collabRecoveryDocument`.
     * @param {Uint8Array} snapshot
     * @param {number} revision
     * @returns {string}
     */
    collabRecover(snapshot, revision) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(snapshot, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_collabRecover(retptr, this.__wbg_ptr, ptr0, len0, revision);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * Number of preserved local document snapshots, each directly reopenable.
     * @returns {number}
     */
    collabRecoveryCount() {
        const ret = wasm.wasmdocument_collabRecoveryCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * A retained original document and its resources in a reopenable snapshot package.
     * @param {number} index
     * @returns {Uint8Array}
     */
    collabRecoveryDocument(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_collabRecoveryDocument(retptr, this.__wbg_ptr, index);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * A `SetAccess` frame: change what **another** participant may do.
     *
     * `target` is the participant number a `welcome`'s or `resumed`'s membership list reported,
     * and `granted` the capability names they should hold. There is deliberately **no actor
     * argument**: the message has no field for one, and the relay attaches the participant
     * number of the connection the frame arrived on — so claiming to be somebody else is
     * unexpressible rather than merely rejected (`152` §2b).
     *
     * # What this does NOT do
     *
     * Check anything. Building a frame is not a decision, and pretending otherwise here would
     * put a second implementation of the ceiling rule in the one place that cannot hold it: this
     * replica knows the ceiling only because a relay told it. The decision is
     * `ServerSession::set_access`, over `casual_doc_edit::access::refuse_access_change`, and a
     * request outside the ceiling comes back `ODC-7011`. What the chrome's surface does with the
     * ceiling is offer the roles that will be accepted, which is a courtesy and not a boundary.
     *
     * # Errors
     *
     * A capability name this build does not know, and a non-integral or negative participant
     * number — both refused rather than coerced, for the reason `collab_join_frame` gives about
     * a guessed position.
     *
     * O(the names).
     * @param {number} target
     * @param {string[]} granted
     * @returns {Uint8Array}
     */
    collabSetAccessFrame(target, granted) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(granted, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_collabSetAccessFrame(retptr, this.__wbg_ptr, target, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 1, 1);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Current normalized document with its image and font resources, bounded for sharing.
     * @returns {Uint8Array}
     */
    collabSnapshot() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_collabSnapshot(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The session's state, as JSON, for a chrome that shows it.
     *
     * Always answerable, including before a join and after a stop, so the chrome has one thing
     * to ask rather than three. O(1).
     * @returns {string}
     */
    get collabState() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_collabState(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * One comment thread — the identified comment plus every descendant
     * reply, ordered root-first by creation order — as a typed JSON array of
     * `ReviewCommentSummaryJson` (docs/81 REVIEW-GAP-022; docs/68
     * `commentThread`). Passing a reply's id resolves to that reply's thread
     * root first, mirroring [`delete_comment`](Self::delete_comment)'s
     * existing parent-chain walk (matching by either the parent's node id or
     * its `para_id` join key). Errs if `comment` is not a known comment id.
     * @param {string} comment
     * @returns {string}
     */
    commentThread(comment) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(comment, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_commentThread(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * The innermost content control at a caret position (a paragraph and a
     * byte offset, as a hit test returns), or `undefined`. An inline control
     * counts from its start to its end inclusive; a paragraph inside a block
     * control is in it. O(the paragraph's inlines), plus one body walk when no
     * inline control holds the caret.
     * @param {string} node
     * @param {number} offset
     * @returns {string | undefined}
     */
    contentControlAt(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_contentControlAt(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v2;
            if (r0 !== 0) {
                v2 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Every content control in the document, in document order, as a JSON
     * array (`ControlJson`: id, scope, kind, title, tag, lock, list entries,
     * date format, checked state, text, where it is, its role and whether the
     * reader may fill it). O(document).
     * @returns {string}
     */
    contentControls() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_contentControls(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * This document's **content identity** — the digest that is equal exactly
     * when a comparison of two states would report nothing.
     *
     * The host stores it beside a version checkpoint and compares it to decide
     * whether a save has anything new in it. It exists because the
     * checkpoint's own id cannot answer that question: that id is a SHA-256 of
     * the **source-format bytes**, and one unchanged document has two different
     * byte layouts depending on which export mode produced it — the import row
     * is the original file verbatim, and `source_unchanged` is `revision == 0`,
     * a monotonic watermark, so after any edit at all (including one that is
     * immediately undone) every later checkpoint is a `preserve_when_safe`
     * re-export. Two hashes, one document, and a version row with nothing in it.
     *
     * Deliberately **not** a second notion of sameness: the digest is folded
     * from the same semantic projection the comparison aligns on plus the same
     * definition values it compares, so this and Compare cannot come to
     * disagree. See `casual_doc_diff::identity`.
     *
     * Complexity: **O(blocks + text bytes + definitions)**. Call it at SAVE, not
     * per edit — per-interaction work stays O(1) in document size (`docs/107`
     * §4), and no editing path calls this.
     * @returns {string}
     */
    contentDigest() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_contentDigest(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The contents level the paragraph `node` is listed at (1..=9), or `-1`
     * when a table of contents would not list it — what checks the Add text
     * menu's current row. **O(document)** for the paragraph lookup plus
     * O(style chain); called when the menu opens, never per keystroke.
     * @param {string} node
     * @returns {number}
     */
    contentsLevelAt(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_contentsLevelAt(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Continues the caret's numbered list from the nearest **preceding** numbered
     * list at the same level — the inverse of [`restart_list`](Self::restart_list).
     * Counters are keyed by `(instance, level)`, so adopting that earlier list's
     * instance resumes its sequence (e.g. an item restarted at `1.` rejoins the
     * list above it and renumbers `4.`, `5.`, …). The adopted instance is carried
     * through the contiguous following items that shared the caret paragraph's
     * current instance and level, so an entire restarted run rejoins at once.
     *
     * Bullets and non-list paragraphs are rejected; so is a paragraph that has no
     * distinct preceding numbered list at its level (nothing to continue from) or
     * one already contiguous with the list above it (already continuous).
     * @param {string} node
     * @returns {EditResult}
     */
    continueList(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_continueList(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Convert Notes: `conversion` is `footnotesToEndnotes`,
     * `endnotesToFootnotes` or `swap`; with `start_node`/`end_node` only the
     * notes inside that selection convert. One undoable step.
     *
     * # Errors
     *
     * An unknown conversion, nothing to convert, or the choke point refusing.
     * @param {string} conversion
     * @param {string | null | undefined} start_node
     * @param {number} start_offset
     * @param {string | null | undefined} end_node
     * @param {number} end_offset
     * @returns {EditResult}
     */
    convertNotes(conversion, start_node, start_offset, end_node, end_offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(conversion, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(start_node) ? 0 : passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(end_node) ? 0 : passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_convertNotes(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, start_offset, ptr2, len2, end_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Converts the table holding `node` to text (Table ▸ Convert to Text):
     * `separator` and `character` as above, `nested` converting nested tables
     * too. One undoable step.
     *
     * # Errors
     * Not in a body table, or an unknown or empty separator.
     * @param {string} node
     * @param {string} separator
     * @param {string} character
     * @param {boolean} nested
     * @returns {EditResult}
     */
    convertTableToText(node, separator, character, nested) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(separator, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(character, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_convertTableToText(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, nested);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Converts the paragraphs `from..=to` into a table (Insert ▸ Table ▸
     * Convert Text to Table): `separator` and `character` as for
     * [`textToTableColumns`](Self::text_to_table_columns), `columns` (`0` =
     * what the text needs), `autofit` `fixed` / `contents` / `window`. The
     * caret goes to the first cell. One undoable step.
     *
     * # Errors
     * The paragraphs are not consecutive in one container, the separator is
     * unknown or empty, or the table would be too wide.
     * @param {string} from
     * @param {string} to
     * @param {string} separator
     * @param {string} character
     * @param {number} columns
     * @param {string} autofit
     * @returns {EditResult}
     */
    convertTextToTable(from, to, separator, character, columns, autofit) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(from, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(to, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(separator, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(character, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passStringToWasm0(autofit, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len4 = WASM_VECTOR_LEN;
            wasm.wasmdocument_convertTextToTable(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, columns, ptr4, len4);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The block structure of a copied range as JSON: one `OutlineEntry` per
     * paragraph [`copy_rich_runs`](Self::copy_rich_runs) walks for the same
     * range, in the same order. `"[]"` when either endpoint is unknown. See the
     * module documentation for how the host zips the two. O(document).
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @returns {string}
     */
    copyBlockOutline(start_node, start_offset, end_node, end_offset) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_copyBlockOutline(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred3_0 = r0;
            deferred3_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * The selection as a rich-run clipboard fragment, serialized as JSON (the
     * internal payload doc 67's "rich clipboard" row calls for): paragraph
     * breaks, run formatting (bold/italic/underline/strike/size/color/
     * highlight/vertAlign/font), and hyperlink targets. Scoped to paragraph
     * text — a `Table` block or any exotic inline (field, content control,
     * drawing, …) intersecting the range falls back to its existing plain-text
     * extraction, unstyled, so nothing is silently dropped, only unstyled.
     * Returns `"[]"` if either anchor is unknown.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @returns {string}
     */
    copyRichRuns(start_node, start_offset, end_node, end_offset) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_copyRichRuns(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred3_0 = r0;
            deferred3_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * The selection as a **structured** clipboard fragment (JSON), for internal
     * OpenDoc-to-OpenDoc paste that must survive block structure the flat
     * [`copy_rich_runs`](Self::copy_rich_runs) fragment flattens: whole tables and
     * list paragraphs (their `numbering` reference). Returns the top-level body
     * blocks the selection touches, but **only** when at least one is a table or a
     * list item and every touched block is a paragraph or table (SDT/AltChunk
     * bail); otherwise returns `""` so the caller keeps the flat rich-run path for
     * ordinary prose. Whole blocks are captured even on a partial selection — Word
     * copies the whole table when a selection crosses it. Cross-document remapping
     * (numbering/media) is out of scope; this is the internal same-document payload.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @returns {string}
     */
    copyStructured(start_node, start_offset, end_node, end_offset) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_copyStructured(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred3_0 = r0;
            deferred3_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * The plain text a selection covers — the first (read-only) action of the
     * interaction pipeline (doc 58 §4). Walks the model between the two anchors
     * in document order, slicing each node's shaped text at the byte offsets and
     * joining paragraphs with `\n`. Empty if either anchor is unknown.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @returns {string}
     */
    copyText(start_node, start_offset, end_node, end_offset) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_copyText(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred3_0 = r0;
            deferred3_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * Creates a bookmark named `name` over the current selection (which may span
     * two paragraphs), inserting its start/end markers and registering the name
     * under a fresh id. One undoable action. The new id is discoverable via
     * [`bookmarkEntries`](Self::bookmark_entries). Rejects an empty or oversized
     * (> 255-byte) name, or a selection whose endpoints do not resolve.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} name
     * @returns {EditResult}
     */
    createBookmark(start_node, start_offset, end_node, end_offset, name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_createBookmark(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Creates an empty header or footer for the section the given page belongs
     * to, and links that section's applicable variant to it, as one undoable
     * action. Returns the `EditResult` whose caret is the new body's first
     * paragraph, so the host can enter the context it just created.
     *
     * `Edit header` on a document that has none previously had to refuse: the
     * ops to make one (docs/85 §8.3) exist but nothing called them. The body is
     * created carrying ONE empty paragraph rather than no blocks, because an
     * empty `Vec<BlockNode>` has nowhere to put a caret — the user would enter a
     * header they could not type in.
     *
     * The section comes from `page`, not from `sections.first()`: on a document
     * whose later section changed orientation, linking the first section meant
     * "add a header" on page 5 created one for pages 1-4 and left page 5 — the
     * page the user asked about — with nothing (docs/104 T-01). The variant is
     * the one that page applies, so adding a header to the first page of a
     * section with `w:titlePg` fills THAT page's band, as Word does.
     *
     * This is also the "shall create a new blank header" half of ECMA-376
     * §17.10.6, and it is why creation happens on ENTRY rather than on the first
     * keystroke: a caret is a model position, so until the paragraph exists there
     * is nothing for the caret — or the toolbar's property read, an arrow key, or
     * a click — to resolve against. Deferring would mean a second, phantom caret
     * representation that every geometry read had to know about. Word creates the
     * part on entry too, and this is one undoable step.
     *
     * Fails closed when the page's variant already resolves to a body with a
     * caret in it — including one it INHERITS from an earlier section, where
     * writing a reference onto this section would break the "Link to Previous"
     * chain and leave the band the user sees no longer following the one they
     * edited.
     * @param {string} region
     * @param {number} page
     * @returns {EditResult}
     */
    createRunningContent(region, page) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(region, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_createRunningContent(retptr, this.__wbg_ptr, ptr0, len0, page);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Creates a new paragraph style `name` from the current selection's
     * formatting (based on the selection's current paragraph style) and applies
     * it to every selected paragraph — Word's "Create a Style". Errors if a
     * paragraph style with that name already exists or the name is blank.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} name
     * @returns {EditResult}
     */
    createStyleFromSelection(start_node, start_offset, end_node, end_offset, name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_createStyleFromSelection(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {boolean} accept
     * @returns {EditResult}
     */
    decideAllRevisions(accept) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_decideAllRevisions(retptr, this.__wbg_ptr, accept);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Accepts or rejects one imported tracked move as an atomic source /
     * destination pair. The exact marker identities prevent an opaque or
     * producer-reused revision id from joining unrelated move ranges.
     * @param {string} from_start
     * @param {string} to_start
     * @param {boolean} accept
     * @returns {EditResult}
     */
    decideMovePair(from_start, to_start, accept) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(from_start, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(to_start, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_decideMovePair(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, accept);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Accepts or rejects every editor-authored revision in one logical group.
     * Replacements are deletion/insertion pairs; formatting groups contain one
     * or more standard run-property changes without duplicating text.
     * @param {string} group
     * @param {boolean} accept
     * @returns {EditResult}
     */
    decideRevisionGroup(group, accept) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(group, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_decideRevisionGroup(retptr, this.__wbg_ptr, ptr0, len0, accept);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Accepts or rejects a tracked revision by inline node id.
     * @param {string} revision
     * @param {boolean} accept
     * @returns {EditResult}
     */
    decideRevision(revision, accept) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(revision, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_decideRevision(retptr, this.__wbg_ptr, ptr0, len0, accept);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Decoration rectangles ([`decorationRects`](Self::decoration_rects)) for
     * many single-paragraph ranges on pages `first_page..=last_page`, answered
     * from one build of those pages' line boxes (`docs/architecture/180` E2, `109`
     * HF-411).
     *
     * `ranges_json` is `[[node, start, end], …]`. The result is flat: for each
     * range in order, its rectangle count `n`, then `n` five-tuples
     * `[page, x, y, w, h]` in page-local twips. A range off the window, or one
     * naming no paragraph, answers `0`.
     *
     * `decorationRects` builds the whole document's line boxes per call, so a
     * host marking every misspelling on screen paid `O(document)` per mark.
     * This is `O(window + marks)`.
     * @param {number} first_page
     * @param {number} last_page
     * @param {string} ranges_json
     * @returns {Int32Array}
     */
    decorationRectsOnPages(first_page, last_page, ranges_json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(ranges_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_decorationRectsOnPages(retptr, this.__wbg_ptr, first_page, last_page, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Rectangles for a mark that HANGS OFF THE TEXT'S BASELINE over a range —
     * a spelling or grammar squiggle, a tracked-change or comment underline —
     * flattened as `[page, x, y, w, h, …]` (page-local twips), one 5-tuple per
     * covered line-fragment.
     *
     * Horizontally identical to [`selectionRects`](Self::selection_rects);
     * vertically it is the marked run's own text box (its painted baseline
     * bracketed by its own ascent and descent) rather than the line box. A
     * host that hangs a decoration off the bottom of a selection rect puts it
     * at the bottom of the LINE, which walks away from the text as line
     * spacing grows — measured at 23.3 px below the baseline on a
     * double-spaced 11pt paragraph against 3.9 px at single. Use
     * `selectionRects` for a region fill (the selection, a find highlight) and
     * this for anything anchored to the glyphs.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @returns {Int32Array}
     */
    decorationRects(start_node, start_offset, end_node, end_offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_decorationRects(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v3 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Document default tab interval in twips. Complexity: O(1).
     * @returns {number}
     */
    defaultTabStop() {
        const ret = wasm.wasmdocument_defaultTabStop(this.__wbg_ptr);
        return ret;
    }
    /**
     * Backspace at a collapsed caret: deletes the character before `offset`, or —
     * at a paragraph start — joins this paragraph into the previous one.
     * @param {string} node
     * @param {number} offset
     * @returns {EditResult}
     */
    deleteBackward(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteBackward(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Deletes the bookmark with the 32-hex `id`, removing its definition and both
     * markers. One undoable action. Rejects an unknown id or a bookmark whose
     * markers do not resolve at paragraph top level.
     * @param {string} id
     * @returns {EditResult}
     */
    deleteBookmark(id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteBookmark(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Deletes the column(s) the caret's cell covers — for a merged cell, every
     * grid column it spans, as Word does — refusing a table's last column. A
     * cell in another row that only partly covers them shrinks. The caret lands
     * in the cell now at that spot in the caret's row.
     * @param {string} node
     * @returns {EditResult}
     */
    deleteColumn(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteColumn(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Removes a comment thread and all of its range/reference markers.
     * @param {string} comment
     * @returns {EditResult}
     */
    deleteComment(comment) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(comment, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteComment(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Forward-delete at a collapsed caret: deletes the character at `offset`, or —
     * at a paragraph end — joins the next paragraph into this one.
     * @param {string} node
     * @param {number} offset
     * @returns {EditResult}
     */
    deleteForward(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteForward(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Delete on a shape or picture selected INSIDE a group: removes that
     * one member and keeps the rest of the group exactly where it was, as one
     * undoable action.
     *
     * The host used to send every Delete to the selection's ROOT, so deleting
     * one of two grouped logos deleted both (`docs/109` HF-214: "cannot be
     * removed" was the mild reading — the picture was removed along with
     * everything grouped with it). The remaining members keep their child-space
     * offsets, so nothing else moves. Deleting the LAST member deletes the group
     * itself, because a group with nothing in it is not an object anyone can
     * see or select; a nested group emptied by the removal goes with it.
     *
     * # Errors
     *
     * When `node` is not a member of a group (`object.not-group-child`).
     *
     * **O(document), ONE walk** to resolve the group, then O(its members).
     * @param {string} node
     * @returns {EditResult}
     */
    deleteGroupMember(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteGroupMember(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Removes the object `node` (an inline or floating drawing, text box, or group)
     * as one undoable action (`DeleteObject`); undo restores it verbatim at its
     * original position. Errors if `node` is not a removable object or removing it
     * would leave the model invalid (it is a wrapper's sole child, or would leave
     * two mergeable runs adjacent — the host handles those before deleting).
     * @param {string} node
     * @returns {EditResult}
     */
    deleteObject(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteObject(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Deletes the text range `[start, end)` within one paragraph.
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @returns {EditResult}
     */
    deleteRange(node, start, end) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteRange(retptr, this.__wbg_ptr, ptr0, len0, start, end);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Deletes a single reply — and any nested replies beneath it — from a
     * comment thread as one undoable review action (docs/81 REVIEW-GAP-011),
     * leaving the thread root and every sibling reply intact. Errs if
     * `reply` is unknown, or if it is a thread root (no `parent_para_id`):
     * deleting a whole thread is [`delete_comment`](Self::delete_comment)'s
     * job, so this fails closed rather than silently removing an entire
     * anchored thread when handed a root id. A reply carries no body range
     * markers (only the anchored root does), so this touches the comment map
     * only and never rewrites body paragraphs.
     * @param {string} reply
     * @returns {EditResult}
     */
    deleteReply(reply) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(reply, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteReply(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Deletes the table row containing the caret's paragraph. Refuses to delete a
     * table's only row (a table's rows are non-empty — delete the table instead).
     * The caret lands in an adjacent surviving row. Errors if not inside a table.
     *
     * **Merged cells** (`docs/171`): when the row is the top of a vertically
     * merged cell that continues below, the merged cell's content and
     * properties move to its first surviving row instead of leaving an orphan
     * continuation and losing the text.
     * @param {string} node
     * @returns {EditResult}
     */
    deleteRow(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteRow(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Deletes a selection that may span paragraphs (a selection + Backspace/
     * Delete). Same-paragraph → one delete; cross-paragraph → delete the end
     * pieces + join, as one undoable action. Caret lands at the selection start.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @returns {EditResult}
     */
    deleteSelection(start_node, start_offset, end_node, end_offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteSelection(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Removes an unused, non-default style. Referenced styles are refused by
     * model validation, preserving content rather than silently changing it.
     * @param {string} name
     * @returns {EditResult}
     */
    deleteStyle(name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteStyle(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Deletes the cells of the range between `anchor` and `focus` with
     * `shift` `left` or `up` (Word's Delete Cells). One undoable step.
     *
     * # Errors
     * Not in a table, a merged table, another shift, or a delete that would
     * leave no cells.
     * @param {string} anchor
     * @param {string} focus
     * @param {string} shift
     * @returns {EditResult}
     */
    deleteTableCells(anchor, focus, shift) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(anchor, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(focus, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(shift, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteTableCells(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Deletes the whole table the caret is in (the innermost table for a nested
     * one). Refuses when the table is a cell's only content. The caret lands on the
     * first top-level body paragraph. Errors if the caret is not inside a table.
     * @param {string} node
     * @returns {EditResult}
     */
    deleteTable(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteTable(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Deletes the Unicode word before a collapsed caret as one undoable edit.
     * At a paragraph boundary this has the same safe join behavior as ordinary
     * Backspace.
     * @param {string} node
     * @param {number} offset
     * @returns {EditResult}
     */
    deleteWordBackward(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteWordBackward(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Deletes the Unicode word after a collapsed caret as one undoable edit.
     * At a paragraph boundary this has the same safe join behavior as ordinary
     * Delete.
     * @param {string} node
     * @param {number} offset
     * @returns {EditResult}
     */
    deleteWordForward(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_deleteWordForward(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Distributes the current preferred width evenly across every regular
     * table column, preserving the total width as one undoable resize.
     * @param {string} node
     * @returns {EditResult}
     */
    distributeTableColumns(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_distributeTableColumns(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Distributes explicit row heights evenly across every regular table row.
     * Auto-height rows are refused because assigning an arbitrary height can
     * clip content without a deterministic layout measurement.
     * @param {string} node
     * @returns {EditResult}
     */
    distributeTableRows(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_distributeTableRows(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * All modeled DOCX metadata (`docProps/core.xml`, `app.xml`, and
     * `custom.xml`) as one read-only JSON object. This complements
     * [`document_properties`](Self::document_properties), whose core-only
     * payload remains the stable mutation shape used by
     * [`set_document_properties`](Self::set_document_properties).
     * @returns {string}
     */
    documentMetadata() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_documentMetadata(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The document's heading outline as flat
     * `"{level}\t{node}\t{collapsed}\t{text}"` rows (in document order) — what
     * the left Outline panel renders, navigates from, and now FOLDS from. A
     * paragraph is a heading if it carries an `outlineLvl` or a Title/Heading N
     * style; `level` is 1-based (1 = top); `collapsed` is `1` when this viewer
     * has that heading folded and `0` otherwise. Empty-text headings are
     * skipped.
     *
     * The text is last and carries no tab (any tab in it becomes a space), so a
     * row parses unambiguously however long the heading is.
     * @returns {string[]}
     */
    documentOutline() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_documentOutline(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The document's core properties (`docProps/core.xml` — title, author,
     * subject, …) as a JSON object matching the model's own camelCase field
     * names (e.g. `{"title":"...","creator":"...","lastModifiedBy":null,...}`).
     * A field is `null` when unset. Empty (`{}`) when the document carries no
     * core properties at all.
     * @returns {string}
     */
    documentProperties() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_documentProperties(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The document's editing restriction (`w:documentProtection`), for the host's
     * Restrict Editing surface, as JSON.
     *
     * `{"edit":null}` when there is no restriction at all; otherwise `edit` is one
     * of `none`, `readOnly`, `comments`, `trackedChanges`, `forms` and the two
     * flags say whether it is being applied and whether style formatting is locked
     * too. `edit: "none"` with no enforcement is a real state Word round-trips — a
     * restriction the author set up and switched off — and it is deliberately
     * distinguishable from `null`, which is the element being absent.
     *
     * `password` says whether the file carries a Word password verifier with the
     * restriction. It is kept and saved, never checked (ADR-052), so a host can
     * tell the reader that lifting or changing the restriction here removes it.
     *
     * O(1).
     * @returns {string}
     */
    documentProtection() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_documentProtection(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Document statistics for the status footer: word count (whitespace-delimited
     * tokens across every paragraph, body + table cells + content controls),
     * paragraph count, and page count.
     * @returns {DocStats}
     */
    documentStats() {
        const ret = wasm.wasmdocument_documentStats(this.__wbg_ptr);
        return DocStats.__wrap(ret);
    }
    /**
     * Draw Table's pencil inside a table: `line` is `[page, x0, y0, x1, y1]` in
     * page-local twips, and `node` a paragraph of the table. Mostly horizontal
     * splits the row it crosses at the line (a new row; cells not crossed stay
     * whole); mostly vertical splits the column at the line's x (a new grid
     * column; cells not crossed stay whole). Drawn along an existing line, it
     * splits the merged cells across it. One undoable step.
     *
     * # Errors
     * When the line is too short, crosses no cell, or lies on a line already
     * there.
     * @param {string} node
     * @param {Int32Array} line
     * @returns {EditResult}
     */
    drawTableLine(node, line) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray32ToWasm0(line, wasm.__wbindgen_export);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_drawTableLine(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Draw Table's rectangle: a 1 x 1 table of the drawn size, inserted after
     * the block holding paragraph `node` (where the drag began) and floating at
     * the drawn place on the page. `rect` is `[x, y, width, height]` in
     * page-local twips. One undoable step.
     *
     * # Errors
     * When `rect` is not four numbers, or ids run out.
     * @param {string} node
     * @param {Int32Array} rect
     * @returns {EditResult}
     */
    drawTable(node, rect) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray32ToWasm0(rect, wasm.__wbindgen_export);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_drawTable(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The drop cap at `node`, in the shape [`set_drop_cap`](Self::set_drop_cap)
     * accepts: `{"mode":"none"|"drop"|"margin","lines":N}`.
     *
     * A drop cap is a PAIR of paragraphs, exactly as Word writes one: a
     * one-character paragraph carrying `w:framePr/@w:dropCap`, immediately
     * followed by the body it belongs to. So this answers for the pair, whichever
     * half the caret is in — a reader who clicks in the body and opens the menu
     * must see the drop cap that is plainly on screen, not "none".
     * @param {string} node
     * @returns {string}
     */
    dropCap(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_dropCap(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Makes the line box holding `paragraph` editable, or gives an edited
     * one another fill: erases the picture's ink under the box by `mode`
     * (`fill`, `blur` or `pixelate`) in a patch picture placed under the
     * box, and paints the box's text in the ink's colour, height and weight
     * (`docs/182` §20b). The picture itself is never changed. One undoable
     * action; the caret is left at `paragraph`/`offset`. O(document) to find
     * the box, plus O(box pixels).
     *
     * # Errors
     *
     * A catalogue key: `imageText.refused.notImageText`,
     * `imageText.refused.pictureUnreadable` or `imageText.refused.unknownMode`.
     * @param {string} paragraph
     * @param {number} offset
     * @param {string} mode
     * @returns {EditResult}
     */
    editImageText(paragraph, offset, mode) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(paragraph, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_editImageText(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Why this document cannot be edited, or the empty string when it can be.
     *
     * One document in the product is read-only: one too large to lay out
     * whole, which the viewer opens one page-window at a time (`docs/113`).
     * Every edit is refused at the atomic choke point, with this sentence.
     *
     * It is a getter rather than only an error because a host must be able to
     * **show a disabled control with a reason** instead of a control that
     * looks live and then refuses — `SKILL.md` §10, "never a dead control".
     * The host does not read it yet; `docs/113` §8 records that as the work
     * this seam exists for, rather than leaving it to be discovered.
     * @returns {string}
     */
    get editingUnavailableReason() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_editingUnavailableReason(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Enable host admission at the real pre-publication editing boundary.
     */
    enableDurableAdmission() {
        wasm.wasmdocument_enableDurableAdmission(this.__wbg_ptr);
    }
    /**
     * The document's page count, or — while it is being measured — an
     * ESTIMATE scaled from the prefix measured so far.
     *
     * Equal to [`page_count`](Self::page_count) once
     * [`page_count_is_exact`](Self::page_count_is_exact) is true. Show it
     * only with a marker that says it is approximate.
     * @returns {number}
     */
    get estimatedPageCount() {
        const ret = wasm.wasmdocument_estimatedPageCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Exports through one explicitly selected format and mode.
     *
     * Accepted modes are `semantic`, `preserve_when_safe`, and
     * `exact_if_unchanged`.
     * @param {string} format_id
     * @param {string} mode
     * @returns {WasmExportArtifact}
     */
    exportAs(format_id, mode) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(format_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_exportAs(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return WasmExportArtifact.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Serializes the current (edited) document to a `.docx` package the host can
     * save. Uses the semantic writer (`v1::Document` → WordprocessingML), so all
     * modeled content and edits are written; unmodeled opaque parts from the
     * original import are not carried through in this first cut (a follow-up wires
     * `write_document_with_retained_parts`).
     *
     * Authorship is written as Word writes it (`docs/175` §6): `w:author`, `w:initials` and
     * `w:date` on each comment, `w:author` and `w:date` on each tracked change. When the host
     * opted in with `setAuthorPersistence`, the active author also gets a `word/people.xml`
     * `w15:person` with `w15:presenceInfo`; without it, no id of any kind is written.
     * @returns {Uint8Array}
     */
    exportDocx() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_exportDocx(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Measures the next `blocks` top-level blocks of a document opened on a
     * prefix, and returns whether it is now measured whole.
     *
     * The host drives this from idle time between frames, sizing `blocks` to
     * the slice of main thread it is willing to spend (`docs/116` §7). Cheap
     * and `true` for a document that was never partial, so a host can call it
     * unconditionally rather than branch on how the document opened.
     *
     * Pages already reported do not move: pagination is a forward fill and a
     * windowable document has nothing that can reach back past a page
     * boundary, which `extending_a_prefix_never_moves_a_page_it_already_reported`
     * asserts in the layout crate.
     * @param {number} blocks
     * @returns {boolean}
     */
    extendMeasures(blocks) {
        const ret = wasm.wasmdocument_extendMeasures(this.__wbg_ptr, blocks);
        return ret !== 0;
    }
    /**
     * Every **paragraph-spanning** complex field as `id\tinstruction`, in ascending
     * id order.
     *
     * The host-facing name for what `docs/128` calls a field range: a complex field
     * whose `w:fldChar` markers sit in different paragraphs, which is the only way a
     * table of contents — one paragraph per entry — can be a field at all. A field
     * that fits inside one paragraph is an inline field and does NOT appear here;
     * `parseCommonField` and the field commands cover those.
     *
     * A host needs this to know a document HOLDS such a field before it can offer to
     * act on one (Word's "Update Table"). Generating and updating are not in this
     * layer, so there is deliberately no command here yet — an affordance backed by
     * nothing would be a dead control.
     *
     * O(field ranges), not O(document): it reads the definition map and never walks
     * the body. Shaped exactly like [`bookmarkEntries`](Self::bookmark_entries), for
     * the same reason — one mechanism for one kind of question.
     * @returns {string[]}
     */
    fieldRangeEntries() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_fieldRangeEntries(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Every paragraph-spanning complex field with **the paragraphs it covers**,
     * as `id\tinstruction\tnode node …` (the node ids space-separated, in
     * document order), in ascending id order.
     *
     * [`fieldRangeEntries`](Self::field_range_entries) says a document HOLDS a
     * table of contents; this says WHICH paragraphs are inside it, which is the
     * question a host actually has to answer — "is the caret in the contents
     * field?" decides whether Update Table is offered, and whether a click on
     * this line should follow an entry. Without it the only signal available was
     * the `TOC 1`..`TOC 9` / `Contents 1`..`Contents 10` paragraph style, which
     * is a real marking but only the one Word and ODF happen to write. That
     * style-based path stays correct and stays necessary: a hand-built table of
     * contents has no field at all, and this accessor reports nothing for it.
     * The two are complementary — field first, style as the fallback.
     *
     * A range's covered set is every paragraph from the one holding its
     * `FieldRangeStart` to the one holding its `FieldRangeEnd`, inclusive,
     * including paragraphs nested in tables, content controls and text boxes
     * inside that span. A range whose markers are missing reports an empty span
     * rather than being dropped, so a host is never told a field does not exist
     * when the definition says it does.
     *
     * **Complexity: O(document)** — one walk of every block surface, carrying
     * each paragraph (never a by-id lookup per id; see `docs/116`). This is not
     * a keystroke-path accessor: call it once per document revision and keep the
     * membership set, which then answers each click in O(1).
     * @returns {string[]}
     */
    fieldRangeSpans() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_fieldRangeSpans(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Fills the control `id` with a chosen or typed value — a list entry, a
     * date (`fullDate`, ISO, and the `text` the host formatted from the
     * control's date format), or the first keystroke over a placeholder — as
     * one undoable action. Allowed under forms protection, because it IS the
     * filling of a form field.
     *
     * # Errors
     * No such control, a kind that is not filled with text, a content lock, or
     * a role that is not the reader's.
     * @param {string} id
     * @param {string} value
     * @returns {EditResult}
     */
    fillContentControl(id, value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(value, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_fillContentControl(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Replaces a picture control's picture with `bytes`, as one undoable action
     * that is allowed under forms protection.
     *
     * # Errors
     * No such picture control, a content lock, a role that is not the
     * reader's, or an image the engine cannot hold.
     * @param {string} id
     * @param {Uint8Array} bytes
     * @param {number} width_emu
     * @param {number} height_emu
     * @param {string} mime
     * @returns {EditResult}
     */
    fillPictureContentControl(id, bytes, width_emu, height_emu, mime) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(mime, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_fillPictureContentControl(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, width_emu, height_emu, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Finds the next/previous literal text match from a model position. Matches
     * are constrained to one text-bearing node; cross-paragraph phrases remain a
     * later text-layer search increment.
     * @param {string} query
     * @param {string} start_node
     * @param {number} start_offset
     * @param {boolean} forward
     * @param {boolean} match_case
     * @returns {TextMatch}
     */
    findText(query, start_node, start_offset, forward, match_case) {
        const ptr0 = passStringToWasm0(query, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_findText(this.__wbg_ptr, ptr0, len0, ptr1, len1, start_offset, forward, match_case);
        return TextMatch.__wrap(ret);
    }
    /**
     * The first paragraph inside the body block `node` — where Go to puts the
     * caret for a finding about a table or a block content control — or
     * `undefined` when `node` is not a body block. O(body blocks).
     * @param {string} node
     * @returns {string | undefined}
     */
    firstParagraphIn(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_firstParagraphIn(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v2;
            if (r0 !== 0) {
                v2 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The first caret position of the BODY (Ctrl+Home / select-all anchor).
     *
     * The body's, never another story's: the flat paragraph order appends
     * headers, footers and notes after the body, so its first and last entries
     * are not the document's edges (`story.rs`, `docs/109` UX-057).
     * @returns {Caret}
     */
    firstPosition() {
        const ret = wasm.wasmdocument_firstPosition(this.__wbg_ptr);
        return Caret.__wrap(ret);
    }
    /**
     * Fold every heading in the document, returning the new fold state as JSON.
     *
     * Word's "Collapse All". It is `foldToLevel(1)` — see there for why the
     * three commands are one mechanism. `O(document)`, and a gesture.
     * @returns {string}
     */
    foldAll() {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_foldAll(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The current fold state as JSON — `{ "folded": ["<node>", ...],
     * "available": bool, "withheldReason": "<why not>" }`.
     *
     * A host renders its own control state from this rather than from a shadow
     * copy that can drift out of step with the engine, which is the same rule
     * `layoutView()` follows. `withheldReason` is the empty string when folding
     * is available, and a sentence when it is not — so a control can be
     * disabled *with a reason* and never be a dead control.
     * @returns {string}
     */
    foldState() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_foldState(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Fold every heading at outline level `level` **or deeper**, so only levels
     * `1..level` stay expanded — Word's "Show Level N" on the outline-level
     * picker.
     *
     * `level` is 1-based, as `documentOutline`'s is. `0` means "show every
     * level", which folds nothing and is exactly `unfoldAll`; `1` folds every
     * heading in the document and is exactly `foldAll`. So the three commands
     * are ONE mechanism with three entry points rather than three
     * implementations that can disagree. Levels above 9 clamp, because Word's
     * outline has nine.
     * @param {number} level
     * @returns {string}
     */
    foldToLevel(level) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_foldToLevel(retptr, this.__wbg_ptr, level);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The **form checkbox** (`w14:checkbox` content control) at the caret
     * position `node`/`offset`, or `undefined`.
     *
     * A position is a PARAGRAPH and a byte offset into its text — the same
     * pair a hit test returns — so the host asks this about wherever the
     * pointer or the caret landed and never has to know where content
     * controls are. Asking by node id alone was wrong: the id a hit test
     * hands back is the paragraph's, which is not inside the control.
     *
     * Distinct from `checkboxStateAt` above, which is a CHECKLIST list item —
     * a bullet whose marker happens to be a box. This is Word's content
     * control: a form field with its own checked flag and its own pair of
     * glyphs (`docs/118` §2).
     * @param {string} node
     * @param {number} offset
     * @returns {string | undefined}
     */
    formCheckboxAt(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_formCheckboxAt(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v2;
            if (r0 !== 0) {
                v2 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Whether the form checkbox `node` is ticked: `1` ticked, `0` not, `-1`
     * when `node` is not a form checkbox.
     * @param {string} node
     * @returns {number}
     */
    formCheckboxChecked(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_formCheckboxChecked(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * The form-roles sidecar as JSON: `{roles: [{name, color}], assignments:
     * {"<w:id>": "<role>"}, fillingAs?}`. Not part of the document (this
     * module's comment says why): the host persists it. O(roles + assignments).
     * @returns {string}
     */
    formRoles() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_formRoles(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The uniform format state of a range (each toggle `true` only when every
     * covered run sets it) — drives a toolbar's active state and toggle direction.
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @returns {Format}
     */
    formatAt(node, start, end) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_formatAt(this.__wbg_ptr, ptr0, len0, start, end);
        return Format.__wrap(ret);
    }
    /**
     * Like [`format_text`](Self::format_text) but across a selection that may span
     * paragraphs — each covered paragraph's sub-range is formatted, as one
     * undoable action.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {boolean | null} [bold]
     * @param {boolean | null} [italic]
     * @param {boolean | null} [underline]
     * @param {boolean | null} [strike]
     * @returns {EditResult}
     */
    formatSelection(start_node, start_offset, end_node, end_offset, bold, italic, underline, strike) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_formatSelection(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, isLikeNone(bold) ? 0xFFFFFF : bold ? 1 : 0, isLikeNone(italic) ? 0xFFFFFF : italic ? 1 : 0, isLikeNone(underline) ? 0xFFFFFF : underline ? 1 : 0, isLikeNone(strike) ? 0xFFFFFF : strike ? 1 : 0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Applies a run-property change (bold/italic/underline/strike) over a range
     * within one paragraph. Each argument is a tri-state: `true`/`false` sets the
     * toggle, `undefined` leaves it unchanged. Runs straddling the range split so
     * the change lands exactly on the selection. The selection is preserved by
     * the frontend (formatting does not collapse it).
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @param {boolean | null} [bold]
     * @param {boolean | null} [italic]
     * @param {boolean | null} [underline]
     * @param {boolean | null} [strike]
     * @returns {EditResult}
     */
    formatText(node, start, end, bold, italic, underline, strike) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_formatText(retptr, this.__wbg_ptr, ptr0, len0, start, end, isLikeNone(bold) ? 0xFFFFFF : bold ? 1 : 0, isLikeNone(italic) ? 0xFFFFFF : italic ? 1 : 0, isLikeNone(underline) ? 0xFFFFFF : underline ? 1 : 0, isLikeNone(strike) ? 0xFFFFFF : strike ? 1 : 0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Which non-printing characters `renderPage` is painting, as JSON:
     * `{"paragraph":bool,"tab":bool,"space":bool,"lineBreak":bool,
     * "pageBreak":bool,"color":"#rrggbbaa"|null,"any":bool}`.
     *
     * `any` is the state of the ¶ button — true when at least one mark is on.
     * @returns {string}
     */
    get formattingMarks() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_formattingMarks(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Exact glyph origins in twips from the display list used to paint the page.
     * @param {number} index
     * @returns {string}
     */
    glyphOrigins(index) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_glyphOrigins(retptr, this.__wbg_ptr, index);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Word's Arrange ▸ Group: replaces the floating objects named by `nodes` (a
     * JSON array of node ids) with one `wpg:wgp` containing them, as one
     * undoable action.
     *
     * The group's box is the union of where layout ACTUALLY PLACED the
     * members, and each child keeps its position relative to that union — so
     * grouping moves nothing on the page, which is the whole guarantee.
     * Children are carried in the order they occur in the paragraph, which is
     * their paint order both before and after, so grouping does not restack
     * them either. An identity child transform (`a:chOff` = 0, `a:chExt` =
     * the group extent) means resizing the group scales its children, which is
     * what Word's group handles do.
     *
     * Members must be floating, top-level, in the same paragraph, and on the
     * same page. Word imposes the first three; the fourth is ours, and it is
     * honest rather than arbitrary — a group has ONE anchor, so members that
     * laid out on different pages cannot all keep their positions, and quietly
     * moving one is worse than declining.
     *
     * # Errors
     *
     * With the reason [`can_group_objects`](Self::can_group_objects) reports.
     *
     * **O(document), ONE walk**, then O(members).
     * @param {string} nodes
     * @returns {EditResult}
     */
    groupObjects(nodes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(nodes, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_groupObjects(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Resolves a page-local point (twips) on 1-based `page` to the nearest caret
     * anchor. Returns `undefined` if the page has no lines. `zone` is `"content"`
     * (inside a line) or `"outside"` (snapped in from a margin).
     * @param {number} page
     * @param {number} x_twip
     * @param {number} y_twip
     * @returns {HitPayload | undefined}
     */
    hitTest(page, x_twip, y_twip) {
        const ret = wasm.wasmdocument_hitTest(this.__wbg_ptr, page, x_twip, y_twip);
        return ret === 0 ? undefined : HitPayload.__wrap(ret);
    }
    /**
     * Whether a hyperlink already covers `[start, end)` of paragraph `node`
     * (see `hyperlink_touches_inner`). AutoCorrect asks before it links a
     * typed URL, so it never re-targets a link the user is typing inside.
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @returns {boolean}
     */
    hyperlinkTouches(node, start, end) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_hyperlinkTouches(this.__wbg_ptr, ptr0, len0, start, end);
        return ret !== 0;
    }
    /**
     * The namespace this replica currently mints in, as 16 lowercase hex digits.
     *
     * Host-visible so an integration can assert its replicas are partitioned rather than
     * assume it, and so a support report can say which space a node id came from.
     * @returns {string}
     */
    get identitySpace() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_identitySpace(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The state of the image-text line box holding `paragraph`:
     * `"unedited"` (its text unpainted over the picture's pixels),
     * `"edited"` (a patch under it, its text painted), or `""` when the
     * paragraph is in no such box. What enables the Picture text commands.
     * O(document).
     * @param {string} paragraph
     * @returns {string}
     */
    imageTextState(paragraph) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(paragraph, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_imageTextState(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Returns the deterministic import compatibility report as JSON.
     * @returns {string}
     */
    get importReportJson() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_importReportJson(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Whether the caret's paragraph is inside a table cell — drives the table
     * controls' enabled state.
     * @param {string} node
     * @returns {boolean}
     */
    inTable(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_inTable(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * Inserts two page breaks at the caret, leaving one empty intervening page.
     * One undoable action; the host retains selection at the insertion site.
     * @param {string} node
     * @param {number} offset
     * @returns {EditResult}
     */
    insertBlankPage(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertBlankPage(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Ctrl+Enter / Ctrl+Shift+Enter: an explicit **page** or **column** break at
     * the caret — the first two items of both Word's and ONLYOFFICE's Breaks menu
     * (`docs/130` 4.3, OO-022). `kind` is `"page"` or `"column"`.
     *
     * **No new operation**, and no new layout code either. `w:br` is an inline
     * node, so this is the `InsertInlineObject`/`RemoveInlineObject` pair
     * [`Self::insert_line_break`] already uses, and `casual-doc-layout` has always
     * paginated an *imported* page break: flow turns a trailing `BreakKind::Page`
     * into `LineBreak::Page` with `page_break_after`, and the column paginator
     * answers that with a new page and `LineBreak::Column` with the next column.
     * The gap `docs/130` found was authoring, not capability.
     *
     * Refuses, naming the container, where a forced break would be stored and then
     * ignored — a table cell, a text box, a content control, a header or footer, a
     * note, a comment — because only the body's paginator consumes one, and
     * storing an ignored break is silent loss. This is stricter than Word inside a
     * table cell, deliberately: refusing with a reason is honest, and paginating
     * row-internal breaks is engine work this does not do.
     *
     * Complexity: the site check is one non-recursive pass over the body's
     * top-level blocks (O(top-level blocks)); the operation itself costs what
     * `InsertInlineObject` costs, and this adds no new `find_paragraph_mut` call
     * site (HF-184).
     * @param {string} node
     * @param {number} offset
     * @param {string} kind
     * @returns {EditResult}
     */
    insertBreak(node, offset, kind) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(kind, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertBreak(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts a caption paragraph above or below the block that holds
     * `target_node`, and renumbers the captions of the same label that follow it
     * — Word's Insert Caption, as one undoable action.
     *
     * The paragraph is `Caption`-styled; the style is created first when the
     * document has not got one, which is what Word does and is the difference
     * between a caption and a line of body text that happens to hold a number.
     *
     * `position` is `"above"`/`"below"`, `number_format` and `separator` take the
     * wire names from `casual_doc_edit::references`, and `chapter_level` is `0`
     * for "do not include a chapter number" or a 1-based heading level.
     *
     * **O(document)**: two walks — one to number and enumerate, one to locate the
     * target block — plus O(captions after the insertion point) renumbering
     * operations. Never a lookup by id inside a loop.
     * @param {string} target_node
     * @param {string} label
     * @param {string} text
     * @param {string} position
     * @param {boolean} exclude_label
     * @param {string} number_format
     * @param {number} chapter_level
     * @param {string} separator
     * @returns {EditResult}
     */
    insertCaption(target_node, label, text, position, exclude_label, number_format, chapter_level, separator) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(target_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(label, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(position, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passStringToWasm0(number_format, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len4 = WASM_VECTOR_LEN;
            const ptr5 = passStringToWasm0(separator, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len5 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertCaption(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, exclude_label, ptr4, len4, chapter_level, ptr5, len5);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Insert ▸ Chart: an inline chart at the caret `(node, offset)`, with
     * Word's own sample data, as one undoable action.
     *
     * `kind` is one of `bar`, `column`, `line`, `area`, `scatter`, `pie`,
     * `doughnut` — **the seven families this build paints** (tier 1A #744 and
     * tier 1B #753). A family that is modeled but not painted, or not modeled at
     * all, is refused with a sentence rather than inserted: a chart with no
     * drawable projection paints a labelled placeholder by design, so inserting
     * one would put an object on the page whose whole content is the words
     * `[chart]`.
     *
     * # Two operations, in this order
     *
     * A chart is an `InlineNode::EmbeddedObject` **and** a
     * `Definitions::charts` projection anchored to it; the node alone paints the
     * placeholder. The node is inserted first so the projection is never
     * momentarily anchored to nothing, and both land in one transaction, so one
     * undo removes both. (`Document::validate` no longer *refuses* a projection
     * whose anchor is absent — `109` HF-257 made that state tolerated, because a
     * positional removal cannot carry the sidecar entry out with the node. The
     * order here is therefore hygiene rather than a requirement, and the
     * requirement it replaced is recorded in `validate_charts`.)
     *
     * # Saving
     *
     * The DOCX chart part IS written. `casual-doc-export`'s `chart` module
     * generates `word/charts/chartN.xml` — plus its content-type `Override` and,
     * when the chart names a workbook the package contains, its own `_rels` —
     * for a chart object whose part is not in the retained side table and whose
     * projection is [`ChartCoverage::Complete`](casual_doc_model::v1::ChartCoverage::Complete), which is exactly the flag
     * `ChartCoverage::permits_regeneration` gates on. That closes `109` HF-256;
     * before it, saving an inserted chart emitted a relationship pointing at a
     * part the package did not contain.
     *
     * Every family `chart_group_for_kind` admits is a family that writer can
     * emit. The property is held by the writer's own `match` on
     * `ChartGroupKind` (`write_group` and `group_element` in
     * `casual-doc-export`'s `chart` module), so a seventh variant stops the
     * EXPORTER compiling rather than quietly producing an insertable chart that
     * cannot be saved — and by a `family_token` match in
     * `chart_part_writer.rs`, which is what makes its family sweep cover the
     * enum. This comment used to credit the sweep alone; the sweep is an array
     * of struct literals and a new variant compiles it unchanged, so that was
     * a property nothing held.
     *
     * # Errors
     *
     * When `kind` names no painted family, when `node`/`offset` is not a valid
     * caret, or when the id space is exhausted.
     * @param {string} node
     * @param {number} offset
     * @param {string} kind
     * @returns {EditResult}
     */
    insertChart(node, offset, kind) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(kind, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertChart(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts an empty column left or right of the caret's cell (`after` = to its
     * right), adding a grid column. The caret moves to the new cell in its own
     * row. Errors if the caret is not inside a table.
     *
     * **Merged cells** (`docs/171`): the column goes at the caret cell's GRID
     * edge, so "right of" a merged cell is right of all of it; a cell in another
     * row that straddles that edge grows to cover the new column. A regular
     * table still commits the fine-grained `InsertColumn`, which a concurrent
     * edit transforms against; a merged one commits the whole-table replacement
     * the grid map computed.
     * @param {string} node
     * @param {boolean} after
     * @returns {EditResult}
     */
    insertColumn(node, after) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertColumn(retptr, this.__wbg_ptr, ptr0, len0, after);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts a content control of `kind` (`richText`, `plainText`,
     * `comboBox`, `dropDownList`, `date`, `picture`, `checkbox`) over the
     * selection `start..end` in paragraph `node`, as one undoable action.
     *
     * A text kind wraps the selection; with none it holds `placeholder`
     * (Word's localised prompt, which the host supplies) flagged as showing its
     * placeholder. A check box or a picture is inserted at the selection's end
     * and leaves the selected text alone.
     *
     * # Errors
     * An unknown kind, a range outside the paragraph, a selection whose ends
     * fall inside a link, a field or another control, or a picture without a
     * placeholder image.
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @param {string} kind
     * @param {string} placeholder
     * @returns {EditResult}
     */
    insertContentControl(node, start, end, kind, placeholder) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(kind, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(placeholder, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertContentControl(retptr, this.__wbg_ptr, ptr0, len0, start, end, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts a cross-reference field at the caret, pointing at `target_node` —
     * Word's Cross-reference, as one undoable action.
     *
     * The target is bookmarked first when it is not already: Word names its own
     * automatic bookmarks `_Ref` plus a decimal, and we reuse that prefix and
     * reuse an existing `_Ref` bookmark on the same target, so a document with
     * ten references to one figure carries one bookmark rather than ten.
     *
     * `reference_to` takes the wire names from `casual_doc_edit::references`
     * (`"entireCaption"`, `"pageNumber"`, `"aboveBelow"`, …); `hyperlink` writes
     * the `\h` switch, which is Word's *Insert as hyperlink*.
     *
     * `include_above_below` is Word's *Include above/below* checkbox, and it is
     * **two fields, one action**: the reference, then a space, then a second
     * ` REF … \p ` naming the same bookmark — which is exactly what Word writes
     * for it. It is ignored for a reference that already IS the above/below word.
     * Taking it as an argument rather than leaving the checkbox disabled is
     * deliberate: a control that cannot run is a dead control (`SKILL.md` §10),
     * and the alternative was shipping one.
     *
     * **O(document)** — one walk for the target's text and document order, plus,
     * for `"pageNumber"` only, one layout query for the page the target is on.
     * That query is the single hard coupling to layout in this feature, and it is
     * why a page reference is the one result that can go stale after a reflow,
     * exactly as it does in Word.
     * @param {string} caret_node
     * @param {number} caret_offset
     * @param {string} target_node
     * @param {string} reference_to
     * @param {boolean} hyperlink
     * @param {boolean} include_above_below
     * @returns {EditResult}
     */
    insertCrossReference(caret_node, caret_offset, target_node, reference_to, hyperlink, include_above_below) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(caret_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(target_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(reference_to, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertCrossReference(retptr, this.__wbg_ptr, ptr0, len0, caret_offset, ptr1, len1, ptr2, len2, hyperlink, include_above_below);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts the body of the document in `bytes` at the collapsed caret
     * `(node, offset)`, which must sit in a top-level body paragraph.
     * `format_id` selects the importer (`"text.markdown"` for a `.md`); empty
     * detects it from the bytes, as Open does. One undoable action; what could
     * not be carried is in the result's `pasteLoss`.
     * @param {string} node
     * @param {number} offset
     * @param {Uint8Array} bytes
     * @param {string} format_id
     * @returns {EditResult}
     */
    insertDocumentFile(node, offset, bytes, format_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(format_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertDocumentFile(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts an endnote at the caret, the endnote counterpart of
     * [`Self::insert_footnote`]: the note is created in the endnotes collection
     * and its reference spliced at the caret. Same [`EditResult`] contract — the
     * caret lands in the new endnote body.
     * @param {string} node
     * @param {number} offset
     * @returns {EditResult}
     */
    insertEndnote(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertEndnote(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts a common field at the caret (`node`, `offset`). `kind` is one of
     * `"page"`, `"numpages"`, `"date"`, `"time"`, `"filename"`, `"author"`
     * (case-insensitive). `PAGE`/`NUMPAGES` recompute at pagination and ignore
     * `result_text`; the clock/context kinds cache `result_text` as their display
     * value (this engine reads no clock or filesystem, so the caller supplies the
     * already-formatted string). One undoable action. Rejects an unknown kind or a
     * caret that does not resolve to an editable paragraph position.
     * @param {string} node
     * @param {number} offset
     * @param {string} kind
     * @param {string | null} [result_text]
     * @returns {EditResult}
     */
    insertField(node, offset, kind, result_text) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(kind, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(result_text) ? 0 : passStringToWasm0(result_text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertField(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts a footnote at the caret (paragraph `node`, byte `offset`): creates
     * an empty, ready-to-type footnote body and splices its reference mark into
     * the paragraph as one undoable action. The reference's displayed number is
     * derived at render — this only creates the reference and the body. The
     * returned [`EditResult`]'s caret (`node`/`offset`) is the model position of
     * the new note body's first paragraph, so the host can focus it for typing.
     * @param {string} node
     * @param {number} offset
     * @returns {EditResult}
     */
    insertFootnote(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertFootnote(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts a picture at the caret `(node, offset)`. The host supplies the
     * decoded `bytes`, its natural size in EMU, and the `mime` (the engine owns
     * no image codec — see docs/85 §Q8). The bytes are registered as a media
     * part and referenced by a fresh inline `Drawing`, inserted as one undoable
     * action. Rejects an unsupported image type. `mime` is one of image/png,
     * image/jpeg, image/gif, image/bmp, image/tiff, image/webp.
     * @param {string} node
     * @param {number} offset
     * @param {Uint8Array} bytes
     * @param {number} width_emu
     * @param {number} height_emu
     * @param {string} mime
     * @returns {EditResult}
     */
    insertImage(node, offset, bytes, width_emu, height_emu, mime) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(mime, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertImage(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1, width_emu, height_emu, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Shift+Enter: a soft line break inside the current paragraph.
     *
     * Distinct from [`Self::split_paragraph`] in exactly the way users expect and
     * the editor previously did not: the text stays in ONE paragraph, so it keeps
     * that paragraph's list membership, style, numbering and spacing. Shift+Enter
     * used to fall through to a paragraph split, which in a bulleted list produced
     * a second bullet and at the end of a heading dropped the next line into body
     * text — the opposite of what the gesture means in Word and Docs.
     *
     * No new operation: `w:br` is an inline node, so this is
     * [`Operation::InsertInlineObject`] carrying [`InlineNode::Break`], and its
     * inverse is the existing `RemoveInlineObject`. The closed op set (ADR-030,
     * invariant I2) stays closed, and undo/redo, review tracking and the
     * transaction log all work without knowing this gesture exists.
     *
     * The caret lands after the break, which is the start of the new visual line.
     * @param {string} node
     * @param {number} offset
     * @returns {EditResult}
     */
    insertLineBreak(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertLineBreak(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts a picture content control holding `bytes` as its placeholder
     * picture, at `offset` in paragraph `node`. One undoable action, the media
     * registration included.
     *
     * # Errors
     * As [`Self::insert_content_control`], or an image the engine cannot hold.
     * @param {string} node
     * @param {number} offset
     * @param {Uint8Array} bytes
     * @param {number} width_emu
     * @param {number} height_emu
     * @param {string} mime
     * @returns {EditResult}
     */
    insertPictureContentControl(node, offset, bytes, width_emu, height_emu, mime) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(mime, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertPictureContentControl(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1, width_emu, height_emu, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The same atomic plain-text command with a closed semantic history kind.
     * The host may distinguish paste and paragraph-break gestures, but cannot
     * inject arbitrary history labels.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} text
     * @param {string} action_kind
     * @returns {EditResult}
     */
    insertPlainTextAs(start_node, start_offset, end_node, end_offset, text, action_kind) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(action_kind, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len3 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertPlainTextAs(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Replaces a selection (which may be collapsed) with normalized plain text
     * as one atomic user action. Newlines become paragraph splits inside the
     * same operation group, so paste, IME commit, and replace-with-Enter each
     * consume exactly one undo step.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} text
     * @returns {EditResult}
     */
    insertPlainText(start_node, start_offset, end_node, end_offset, text) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertPlainText(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts an empty table row above or below the row containing the caret's
     * paragraph (`below` = after it). The new row mirrors the anchor row's column
     * structure (spans, widths, cell formatting) with empty cells, and the caret
     * lands in its first cell. Errors if the caret is not inside a table.
     *
     * **Merged cells** (`docs/171`): a vertically merged cell the new row lands
     * inside grows to cover it; one it lands above or below is untouched. The
     * row is resolved through `casual_doc_edit::table_structure::insert_row`,
     * the one place that rule lives.
     * @param {string} node
     * @param {boolean} below
     * @returns {EditResult}
     */
    insertRow(node, below) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertRow(retptr, this.__wbg_ptr, ptr0, len0, below);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Puts a page number in the band `region` on `page`, aligned `left`,
     * `center` or `right` — the six top/bottom position presets of Word's and
     * ONLYOFFICE's Page Number gallery. Creates the band when the page has
     * none, and keeps whatever the band already holds (where both references
     * clear it — `casual_doc_command::sections::insert_page_number`). The caret
     * lands after the number, in the band. One undoable action.
     *
     * `before`, `between` and `after`, when any is given, make it Word's "Page
     * X of Y": `before`, the page number, `between`, the page count, `after`.
     * They are the host's words in the document's language ("Page " / " of " /
     * ""), because they become document text.
     *
     * # Errors
     * An unknown region or alignment, a band whose edge is a table, or a
     * refusal from the choke point.
     * @param {string} region
     * @param {number} page
     * @param {string} align
     * @param {string | null} [before]
     * @param {string | null} [between]
     * @param {string | null} [after]
     * @returns {EditResult}
     */
    insertRunningPageNumber(region, page, align, before, between, after) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(region, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(align, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(before) ? 0 : passStringToWasm0(before, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(between) ? 0 : passStringToWasm0(between, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(after) ? 0 : passStringToWasm0(after, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertRunningPageNumber(retptr, this.__wbg_ptr, ptr0, len0, page, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * A **section break** at the caret. `start` is the new section's start type —
     * `"nextPage"`, `"continuous"`, `"evenPage"` or `"oddPage"` — the four entries
     * of both products' section submenu.
     *
     * The caret's section keeps its identity and keeps the content *before* the
     * break; the content *after* it becomes a new section inheriting the caret
     * section's geometry, running-content references and watermark, with page
     * numbering deliberately **not** restarted. `casual_doc_edit::breaks` states
     * the full inheritance table and why each exception exists.
     *
     * The three operations this applies — splice the new boundary, retarget the
     * section's old terminator, split the caret's paragraph — go through one
     * `apply_action_caret_as` group, so they are **one history entry and undo in
     * one step**. A break that undid in two would be a defect.
     *
     * Refuses with a reason unless the caret is on a top-level body paragraph:
     * layout charges a section break to a section only there
     * (`document_layout::section_break_points` does not recurse), so anywhere else
     * the break would be stored and ignored.
     *
     * Complexity: one forward pass over the body's top-level blocks from the
     * caret, short-circuited to O(1) in a single-section document; plus
     * O(sections) to resolve the boundary being inherited from. No id is resolved
     * inside a loop and no `find_paragraph_mut` call site is added.
     * @param {string} node
     * @param {number} offset
     * @param {string} start
     * @returns {EditResult}
     */
    insertSectionBreak(node, offset, start) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(start, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertSectionBreak(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Insert ▸ Shapes: a floating preset shape at the caret, filled and
     * outlined in the default accent, as one undoable action.
     *
     * `geometry` is the OOXML `a:prstGeom@prst` token — `rect`, `roundRect`,
     * `ellipse`, `triangle`, `rtTriangle`, `diamond`, `line`, `pentagon`,
     * `hexagon`, `octagon`, `star5`, `star4`, `rightArrow`, `leftArrow`,
     * `upArrow`, `downArrow`, `leftRightArrow`, `parallelogram`, `trapezoid`,
     * `chevron`, `homePlate`, `plus` — resolved through
     * `ShapeGeometry::from_preset_token`, the same table import and export
     * use. That is deliberate: a gallery built from one hand-written list and
     * a model built from another drift, and the drift shows up as a preset
     * this build can READ but cannot OFFER. Asking for the token makes every
     * modeled preset insertable the moment it is modeled.
     *
     * The historical camelCase spellings (`rectangle`, `roundRectangle`,
     * `rightTriangle`) are still accepted, because a host already shipped
     * against them.
     *
     * The shape is wrapped in a group-of-one because that is the only shape a
     * shape takes in this model — a lone autoshape imports the same way.
     *
     * # Errors
     *
     * When `geometry` names no typed preset. It is refused rather than
     * silently drawn as a rectangle, which is what a caller would otherwise
     * see and mistake for a rendering bug.
     * @param {string} node
     * @param {number} offset
     * @param {string} geometry
     * @returns {EditResult}
     */
    insertShape(node, offset, geometry) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(geometry, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertShape(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Additive typed-underline counterpart of [`insert_styled_text`](Self::insert_styled_text).
     * The extra optional tokens preserve an armed underline style/color without
     * changing the established host signature.
     * @param {string} node
     * @param {number} offset
     * @param {string} text
     * @param {boolean | null} [bold]
     * @param {boolean | null} [italic]
     * @param {boolean | null} [underline]
     * @param {boolean | null} [strike]
     * @param {number | null} [size_half_points]
     * @param {string | null} [color]
     * @param {string | null} [highlight]
     * @param {string | null} [vert_align]
     * @param {string | null} [font]
     * @param {string | null} [underline_style]
     * @param {string | null} [underline_color]
     * @returns {EditResult}
     */
    insertStyledTextWithUnderline(node, offset, text, bold, italic, underline, strike, size_half_points, color, highlight, vert_align, font, underline_style, underline_color) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(color) ? 0 : passStringToWasm0(color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(highlight) ? 0 : passStringToWasm0(highlight, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(vert_align) ? 0 : passStringToWasm0(vert_align, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            var ptr5 = isLikeNone(font) ? 0 : passStringToWasm0(font, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len5 = WASM_VECTOR_LEN;
            var ptr6 = isLikeNone(underline_style) ? 0 : passStringToWasm0(underline_style, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len6 = WASM_VECTOR_LEN;
            var ptr7 = isLikeNone(underline_color) ? 0 : passStringToWasm0(underline_color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len7 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertStyledTextWithUnderline(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1, isLikeNone(bold) ? 0xFFFFFF : bold ? 1 : 0, isLikeNone(italic) ? 0xFFFFFF : italic ? 1 : 0, isLikeNone(underline) ? 0xFFFFFF : underline ? 1 : 0, isLikeNone(strike) ? 0xFFFFFF : strike ? 1 : 0, isLikeNone(size_half_points) ? Number.MAX_SAFE_INTEGER : (size_half_points) >>> 0, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts `text` at a collapsed caret carrying explicit run formatting — typing
     * while Bold/Italic/… is *armed* at the caret. Inserts the text, then formats
     * exactly the inserted range, as one atomic single-undo action; the caret lands
     * after the inserted text. A toggle left `undefined` inherits the surrounding
     * run, so this equals `insertText` when nothing is armed. Consecutive armed
     * typing coalesces into one run (the second char inserts into the run the first
     * created).
     * @param {string} node
     * @param {number} offset
     * @param {string} text
     * @param {boolean | null} [bold]
     * @param {boolean | null} [italic]
     * @param {boolean | null} [underline]
     * @param {boolean | null} [strike]
     * @param {number | null} [size_half_points]
     * @param {string | null} [color]
     * @param {string | null} [highlight]
     * @param {string | null} [vert_align]
     * @param {string | null} [font]
     * @returns {EditResult}
     */
    insertStyledText(node, offset, text, bold, italic, underline, strike, size_half_points, color, highlight, vert_align, font) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(color) ? 0 : passStringToWasm0(color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(highlight) ? 0 : passStringToWasm0(highlight, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(vert_align) ? 0 : passStringToWasm0(vert_align, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            var ptr5 = isLikeNone(font) ? 0 : passStringToWasm0(font, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len5 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertStyledText(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1, isLikeNone(bold) ? 0xFFFFFF : bold ? 1 : 0, isLikeNone(italic) ? 0xFFFFFF : italic ? 1 : 0, isLikeNone(underline) ? 0xFFFFFF : underline ? 1 : 0, isLikeNone(strike) ? 0xFFFFFF : strike ? 1 : 0, isLikeNone(size_half_points) ? Number.MAX_SAFE_INTEGER : (size_half_points) >>> 0, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts cells at the range between `anchor` and `focus` (`""` = the
     * anchor's cell) with `shift` `right` or `down` (Word's Insert Cells). One
     * undoable step.
     *
     * # Errors
     * Not in a table, a merged table, or another shift.
     * @param {string} anchor
     * @param {string} focus
     * @param {string} shift
     * @returns {EditResult}
     */
    insertTableCells(anchor, focus, shift) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(anchor, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(focus, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(shift, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertTableCells(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts a table of contents — or, with `caption` set, a table of
     * figures — with the settings dialog's answers, a JSON object of
     * `TocSettings` (`levels`, `pageNumbers`, `rightAlign`, `leader`,
     * `hyperlinks`, `styles`, `caption`, `includeLabel`, `format`). With the
     * caret inside an existing table it REPLACES that table, which is how
     * Word's dialog changes a table's settings.
     *
     * One undoable action. **O(document)**, plus O(new bookmarks × document)
     * the first time a hyperlinked table is generated
     * (`casual_doc_command::references` contents note).
     *
     * # Errors
     * Unreadable settings, and every refusal of
     * [`insertTableOfContents`](Self::insert_table_of_contents).
     * @param {string} node
     * @param {string} settings
     * @returns {EditResult}
     */
    insertTableOfContentsWith(node, settings) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(settings, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertTableOfContentsWith(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts a table of contents at the caret's top-level block, listing every
     * heading down to `max_level` (1..=9; Word's "Show levels", defaulting to 3
     * when `0` is passed).
     *
     * Each entry is a `TOC n`-styled paragraph holding the heading's own text, a
     * right-aligned dot-leader tab, and the page label that page actually
     * prints. The whole run of entries is one paragraph-spanning complex field,
     * so it is a live field an update can find again — not frozen text.
     *
     * The caret lands at the start of the first entry. One undoable action under
     * `HistoryKind::FieldChange`.
     *
     * **Complexity: O(document)** — see the module note. Never call this from a
     * keystroke path.
     *
     * # Errors
     * When the caret is not in the document body, when the document has no
     * headings (there is nothing to list, and an empty table is not an answer),
     * or when the body is laid out one window at a time.
     * @param {string} node
     * @param {number} max_level
     * @returns {EditResult}
     */
    insertTableOfContents(node, max_level) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertTableOfContents(retptr, this.__wbg_ptr, ptr0, len0, max_level);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts a fresh `rows`×`cols` table right after the caret's paragraph,
     * with equal columns spanning the width available there and a thin
     * single-line grid so it is visible. The caret lands in the first cell.
     *
     * From a paragraph directly in a table cell the table is NESTED in that
     * cell, sized to the cell, as Word and ONLYOFFICE nest it (`docs/153`
     * `table.nested`); from anywhere else it goes after the caret's top-level
     * body block, as it always has (`table_tools::table_insertion_point`).
     * @param {string} node
     * @param {number} rows
     * @param {number} cols
     * @returns {EditResult}
     */
    insertTable(node, rows, cols) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertTable(retptr, this.__wbg_ptr, ptr0, len0, rows, cols);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Insert ▸ Text Box: a floating, square-wrapped text box at the caret,
     * sized 3" × 1" with one empty paragraph, as one undoable action. The caret
     * is left in the new box's paragraph (the host enters it), which is where
     * Word leaves it too.
     *
     * Floating rather than inline because that is what both Word and this
     * editor's own object chrome expect: an anchored box can be dragged,
     * wrapped and resized, and there is no inline↔floating conversion.
     * @param {string} node
     * @param {number} offset
     * @returns {EditResult}
     */
    insertTextBox(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertTextBox(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Inserts `text` at a caret anchor. Returns the new caret + revision.
     * @param {string} node
     * @param {number} offset
     * @param {string} text
     * @returns {EditResult}
     */
    insertText(node, offset, text) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_insertText(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The effective `w:lang` (the Latin `w:val`) shared by every run the range
     * covers, or `""` when the range sets no language or mixes several.
     *
     * Read-only, and the only thing that exposes the language a document
     * declares to a host. The model has carried `Language { value, east_asia,
     * bidi }` since the importer started reading `w:lang`, and the style
     * cascade has carried it through `overlay_run`, but nothing exported it —
     * so a host spell checker had no way to ask what language to check in
     * (`docs/114` §4.1, `docs/109` HF-035).
     *
     * `""` for a mixed range is deliberate rather than "the first one wins":
     * a caller that gets a tag may apply it to the whole range, and a caller
     * that gets `""` knows it has to ask again more narrowly or fall back.
     * That makes the intended calling convention cheap — one call per
     * paragraph over its whole range, and a second pass per word only on the
     * rare paragraph that really does mix languages.
     *
     * Complexity: one style-cascade resolution per run the range covers, i.e.
     * O(runs in the range) plus the paragraph lookup. It is not O(document)
     * and it is never called per word on a uniform paragraph.
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @returns {string}
     */
    languageAt(node, start, end) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_languageAt(retptr, this.__wbg_ptr, ptr0, len0, start, end);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The paragraph's same-language spans as JSON
     * `[{ "start", "end", "language" }]`, byte offsets in editing text; `[]`
     * for an unknown node or an empty paragraph. See `language_spans_inner`
     * for the rule and its cost.
     * @param {string} node
     * @returns {string}
     */
    languageSpans(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_languageSpans(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The last caret position of the BODY (Ctrl+End / select-all focus) — never
     * a footer's, which is where the flat order's last paragraph lives and
     * where Ctrl+End used to put the caret (audit CRITIC-01).
     * @returns {Caret}
     */
    lastPosition() {
        const ret = wasm.wasmdocument_lastPosition(this.__wbg_ptr);
        return Caret.__wrap(ret);
    }
    /**
     * The current layout view as JSON — `{ "reflow": bool, "contentWidthTwip":
     * n|null, "tileHeightTwip": n|null, "gutterTwip": n|null, "approximations":
     * [string] }` — so a host can render its own toggle state from the engine
     * rather than from a shadow copy that can drift out of step with it.
     * @returns {string}
     */
    get layoutView() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_layoutView(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The line numbering (`w:lnNumType`) of the section holding `node`, plus
     * whether that paragraph is itself excluded from the count — everything the
     * Line Numbers menu needs to show which way it is set.
     *
     * `null` when the document has no section. `countBy: null` means the section
     * numbers nothing: the empty rule is how numbering is off, which is the
     * interpretation import, layout and export already share
     * (`casual-doc-layout/src/line_number.rs`).
     *
     * `suppressed` reads the paragraph's EFFECTIVE value through the style
     * cascade, not its direct `w:pPr`, because a pleading template declares the
     * flag on its caption style — the same resolution
     * `line_number::suppressed_paragraphs` uses to decide what to count.
     * @param {string} node
     * @returns {string}
     */
    lineNumbering(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_lineNumbering(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The **effective** line-spacing percentage of the paragraph at `node` (0
     * when no `auto`-rule line spacing is in effect anywhere in its cascade) —
     * what the toolbar's spacing dropdown ticks.
     *
     * Resolved through the style cascade for the reason on
     * [`paragraphSpacing`](Self::paragraph_spacing): a paragraph that inherits
     * 1.15 lines from `Normal` used to answer `0` here, so no preset was ever
     * ticked on a real document.
     *
     * **Complexity: O(document)** — the same paragraph lookup
     * `paragraphSpacing` does. One call per selection change.
     * @param {string} node
     * @returns {number}
     */
    lineSpacingAt(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_lineSpacingAt(this.__wbg_ptr, ptr0, len0);
        return ret >>> 0;
    }
    /**
     * Resolves a direct content click to the hyperlink painted at that point.
     * External targets are returned verbatim for the host to policy-check before
     * opening. Internal targets additionally resolve their bookmark marker to a
     * model caret and 1-based target page, enabling TOC/page navigation without
     * making the runtime own browser navigation policy.
     * @param {number} page
     * @param {number} x_twip
     * @param {number} y_twip
     * @returns {LinkHit | undefined}
     */
    linkAt(page, x_twip, y_twip) {
        const ret = wasm.wasmdocument_linkAt(this.__wbg_ptr, page, x_twip, y_twip);
        return ret === 0 ? undefined : LinkHit.__wrap(ret);
    }
    /**
     * Authored bookmark names, sorted for host navigation surfaces.
     * @returns {string[]}
     */
    listBookmarks() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_listBookmarks(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * All comments and threaded replies, in stable id order, as a typed JSON
     * array of `ReviewCommentSummaryJson`. This is the typed, single-purpose
     * replacement for `reviewSummary`'s nested `comments` array (docs/81
     * REVIEW-GAP-022; docs/68 `listComments`); `reviewSummary` keeps working
     * unchanged for existing callers. Use [`comment_thread`](Self::comment_thread)
     * to fetch just one thread instead of filtering this list by hand.
     * @returns {string}
     */
    listComments() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_listComments(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The marker format of the caret paragraph's own list level, as a compact
     * token the toolbar's bullet/number gallery highlights the current choice
     * with: a numbered level returns its `ST_NumberFormat` token
     * (`"decimal"`, `"lowerLetter"`, `"upperLetter"`, `"lowerRoman"`,
     * `"upperRoman"`, `"decimalZero"`, `"ordinal"`, `"cardinalText"`,
     * `"ordinalText"`, `"none"`, or a verbatim `Other` token); a bullet level
     * returns `"bullet:"` followed by its glyph (the `w:lvlText`). Returns `""`
     * when the paragraph is not a list item. The same tokens are accepted back
     * by [`set_list_format`](Self::set_list_format).
     * @param {string} node
     * @returns {string}
     */
    listFormatAt(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_listFormatAt(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The paragraph's numbering level (0 for a top-level item), or `-1` when
     * the paragraph is not part of a list. The host uses this to apply the
     * Word-style Backspace/Enter boundary rule without inspecting model data.
     * @param {string} node
     * @returns {number}
     */
    listLevelAt(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_listLevelAt(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * All tracked-change and formatting revisions, in document order, as a
     * typed JSON array of `ReviewRevisionSummaryJson`. This is the typed,
     * single-purpose replacement for `reviewSummary`'s nested `revisions`
     * array (docs/81 REVIEW-GAP-022; docs/68 `listRevisions`), using the exact
     * same final-with-markup anchor projection; `reviewSummary` keeps working
     * unchanged for existing callers.
     * @returns {string}
     */
    listRevisions() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_listRevisions(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The effective caret level, including instance overrides. O(1) levels
     * after the paragraph lookup; the dialog writes this same shape back.
     * @param {string} node
     * @returns {string}
     */
    listSettings(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_listSettings(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The list kind the paragraph belongs to: `"bullet"`, `"numbered"`, or `""` —
     * drives the toolbar's list-button active state.
     * @param {string} node
     * @returns {string}
     */
    listStyleAt(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_listStyleAt(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The paragraph style names defined in the document (for a style dropdown),
     * sorted and de-duplicated.
     * @returns {string[]}
     */
    listStyles() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_listStyles(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The named table styles defined by the document, sorted for a gallery.
     * @returns {string[]}
     */
    listTableStyles() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_listTableStyles(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Merges the rectangle of cells between `anchor_node` and `focus_node`.
     *
     * The engine already accepted an arbitrary rectangle: this calls
     * `merge_regular_table_selection(original, r0, r1, c0, c1, …)` unchanged, with
     * the rectangle the selection derives instead of one of the three degenerate
     * ones a mode string can name (`docs/141` §1.5, row TBL-17). No new operation
     * — a range is a selection, not an operation (ADR-030 I2).
     *
     * # Errors
     * When either endpoint is not in a table, the two are in different tables, the
     * rectangle is a single cell (*select two or more cells before merging*), or
     * the table already carries a merge.
     * @param {string} anchor_node
     * @param {string} focus_node
     * @returns {EditResult}
     */
    mergeTableCellRange(anchor_node, focus_node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(anchor_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(focus_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_mergeTableCellRange(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Merges the active table selection mode (`"row"`, `"column"`, `"table"`).
     * Selected-cell content is preserved by moving it into the top-left merged
     * cell in reading order.
     *
     * **Merged cells** (`docs/171`): the mode's rectangle is the caret's row (or
     * grid column) expanded until it contains every merged cell it touches — the
     * same rule a dragged range uses — so a table that already holds a merge
     * merges again, which it used to refuse outright.
     * @param {string} node
     * @param {string} mode
     * @returns {EditResult}
     */
    mergeTableSelection(node, mode) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_mergeTableSelection(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Whether inside/outside margins swap on facing pages.
     * @returns {boolean}
     */
    mirroredMargins() {
        const ret = wasm.wasmdocument_mirroredMargins(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * The code points the last pagination could **not** cover with any available
     * face — i.e. what renders as `.notdef` tofu (▯). Returned as `u32` scalar
     * values. A host queries this to decide which fallback fonts to fetch
     * (typically CJK / complex scripts absent from the bundled Latin faces).
     * @returns {Uint32Array}
     */
    missingCoverage() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_missingCoverage(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Move a contiguous range of body blocks, preserving their source ownership.
     * The destination is the insertion index after removing the source range.
     * @param {number} start
     * @param {number} count
     * @param {number} destination
     * @returns {EditResult}
     */
    moveBodyBlocks(start, count, destination) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_moveBodyBlocks(retptr, this.__wbg_ptr, start, count, destination);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Moves a caret by one step in `dir` (`"left"`, `"right"`, `"up"`, `"down"`),
     * crossing line, paragraph, and page boundaries. Pure navigation — no edit.
     *
     * `goalX` is the vertical goal column in page-local twips — the x a run of
     * Up/Down presses is aiming at, as `caretRect` reports it. Pass it on every
     * vertical move of a run and the column survives a short line; pass
     * `undefined` and the move aims at the caret's own x, which is what sets the
     * column on the first press. Ignored for the horizontal directions. The host
     * owns it because only the host sees the gestures that clear it — a
     * horizontal move, a click, or an edit (HF-164).
     * @param {string} node
     * @param {number} offset
     * @param {string} dir
     * @param {number | null} [goal_x]
     * @returns {Caret}
     */
    moveCaret(node, offset, dir, goal_x) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(dir, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_moveCaret(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1, isLikeNone(goal_x) ? Number.MAX_SAFE_INTEGER : (goal_x) >> 0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Caret.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Moves a shape INSIDE a group by a page-space delta, as one undoable
     * action.
     *
     * The gesture is the same drag a top-level object gets, and until now it
     * silently moved the whole group: both the drag and the arrow-nudge call
     * `setObjectAnchorPosition(root, …)`, which is the only move that existed
     * (`docs/109` HF-173). `ObjectCapabilities::group_child` advertised
     * `can_move: true` the whole time, so the capability was a promise the
     * engine could not keep.
     *
     * The delta arrives in PAGE space, because that is what a pointer
     * produces, and is converted into the group's child space here — a group
     * scales its children by `extent / child_extent`, so a 40-twip drag on a
     * half-scale group is an 80-twip change to the child's own offset. Doing
     * that arithmetic in the host would put the group's coordinate system in
     * two places.
     *
     * Expressed through `SetInlines`, so the closed operation set is
     * unchanged and this composes with undo and OT like any other edit.
     *
     * A group of ONE is the exception, and it is the common case rather than a
     * corner: every inserted shape and every lone autoshape Word writes is one,
     * so this entry point is what a plain shape drag reaches. There the group
     * itself moves — see `move_lone_group_by`, which is where the reasoning
     * lives — because moving only the leaf left the object's wrap exclusion and
     * its exported anchor behind.
     *
     * # Errors
     *
     * When `node` is not a shape inside a group, so a host cannot wire the
     * gesture to an arbitrary object and quietly move something else; and, for
     * a group of one, when the delta or the resulting position is not a
     * bounded EMU measurement.
     * @param {string} node
     * @param {number} dx_emu
     * @param {number} dy_emu
     * @returns {EditResult}
     */
    moveGroupChildBy(node, dx_emu, dy_emu) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_moveGroupChildBy(retptr, this.__wbg_ptr, ptr0, len0, dx_emu, dy_emu);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Moves the in-line object `node` to the caret position `(targetNode,
     * targetOffset)` in the text — or, with `copy`, leaves it where it is and
     * inserts a copy there — as ONE undoable action (Word's and Docs' drag of an
     * in-line picture; Ctrl-drag copies). The object keeps its id, so it stays
     * selected across the move.
     *
     * The result's caret is the drop position and, for a copy, `placedObject`
     * names the new object. An object dropped back on its own position is
     * reported as the document UNCHANGED — the same revision, no dirty pages,
     * nothing on the undo stack — the way an empty review comparison or a
     * no-op drop-cap removal already is, rather than as an empty edit that
     * would mark the document changed.
     *
     * # Errors
     *
     * A marked refusal (`refused: <sentence>\u{1f}<code>`) when the object is not
     * directly in the text (floating, or part of a link, field, content control
     * or tracked change), when the drop point is not ordinary text or is in
     * another story, when the insertion there is refused, or when a copy of this
     * kind of object would lose part of what it is. The document is unchanged on
     * every error.
     *
     * **O(document)**, once per gesture; see the module documentation.
     * @param {string} node
     * @param {string} target_node
     * @param {number} target_offset
     * @param {boolean} copy
     * @returns {EditResult}
     */
    moveInlineObject(node, target_node, target_offset, copy) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(target_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_moveInlineObject(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, target_offset, copy);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Moves the tab stop at `from_twips` to `to_twips` (keeping its alignment) over
     * the selection — one undoable action, for a ruler drag.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} from_twips
     * @param {number} to_twips
     * @returns {EditResult}
     */
    moveTabStop(start_node, start_offset, end_node, end_offset, from_twips, to_twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_moveTabStop(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, from_twips, to_twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Moves the caret to the next/previous editable cell in the current innermost
     * table. Pure navigation: no edit and no row creation at table boundaries.
     * @param {string} node
     * @param {boolean} forward
     * @returns {Caret}
     */
    moveTableCell(node, forward) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_moveTableCell(retptr, this.__wbg_ptr, ptr0, len0, forward);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Caret.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Moves one column boundary of a regular table by `delta_twips`, as one
     * undoable resize.
     *
     * `mode` decides what absorbs the delta, and the distinction is the whole
     * reason this exists beside `setTableColumnWidthAt`:
     *
     * - `"border"` — column `boundary` grows by the delta and column
     *   `boundary + 1` shrinks by exactly as much, so **the table's total width
     *   does not change**. This is what dragging an INTERNAL border means in Word
     *   and Google Docs, and `setTableColumnWidthAt` could not express it: it set
     *   one column's absolute width and let the width solver decide the rest, so
     *   dragging column 1's right border widened the whole table.
     * - `"table"` — column `boundary` grows by the delta and the table grows with
     *   it. The right answer for the table's own trailing edge, and what
     *   `setTableColumnWidthAt` already did.
     *
     * Both columns are clamped at `MIN_COLUMN_TWIPS` (72 twips, 0.05 in); a delta
     * that would push the shrinking neighbour below it is reduced to the delta
     * that lands it exactly there, rather than refused, because a drag that stops
     * moving is better feedback than a drag that fails on release.
     *
     * Writes `grid[i].width_twips` and every row's `cells[i].properties.width`,
     * exactly as `setTableColumnWidthAt` does, and commits one
     * `Operation::ReplaceTable` under `HistoryKind::TableResize` — so one drag is
     * one undo entry. No new engine operation (ADR-030 I2).
     * @param {string} node
     * @param {number} boundary
     * @param {number} delta_twips
     * @param {string} mode
     * @returns {EditResult}
     */
    moveTableColumnBoundary(node, boundary, delta_twips, mode) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_moveTableColumnBoundary(retptr, this.__wbg_ptr, ptr0, len0, boundary, delta_twips, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Moves the column at `from` so that it ends up at column index `to` — the
     * column half of [`moveTableRow`](Self::move_table_row), with the same
     * contract: `node` anchors the table, `to` is the post-move index, and the
     * whole drag commits as one [`Operation::ReplaceTable`].
     *
     * Every row's cell at `from` moves together with the shared `w:tblGrid`
     * entry, so column widths travel with the column instead of staying behind.
     *
     * **Merged cells.** A vertical merge (`w:vMerge`) lives entirely inside one
     * column, so the whole `restart`/`continue` run travels with the column and
     * vertically merged tables are moved normally. A **horizontal** merge
     * (`w:gridSpan` greater than 1) makes one cell occupy several grid columns,
     * so the grid index a drag reports does not identify a cell at all; such a
     * table is refused with a reason naming the row, rather than moved by an
     * index that means something different in every row. A row whose cell count
     * disagrees with the grid width is refused for the same reason.
     *
     * **Complexity: O(rows)** — one clone plus a `remove`/`insert` per row.
     * @param {string} node
     * @param {number} from
     * @param {number} to
     * @returns {EditResult}
     */
    moveTableColumn(node, from, to) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_moveTableColumn(retptr, this.__wbg_ptr, ptr0, len0, from, to);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Moves the row at `from` so that it ends up at row index `to` — the commit
     * behind a drag on the row gutter (`docs/141` §4.2.3). One undoable
     * [`Operation::ReplaceTable`] under `HistoryKind::TableStructure`, so a drag
     * is one undo step and no new engine operation is needed.
     *
     * `node` is any node inside the table (the gutter's anchor cell). Both
     * indices are 0-based, and `to` is the index the row occupies **after** the
     * move — what a drop target reads directly, with no off-by-one for the
     * caller to get wrong when dragging downwards.
     *
     * **Merged cells.** A horizontal merge (`w:gridSpan`) lives entirely inside
     * one row, so a row move can never tear one and horizontally merged tables
     * are moved normally. A **vertical** merge (`w:vMerge`) spans rows, and a
     * move would tear one in two ways: lifting a row out of a merge run, or
     * dropping a row into the middle of one. Both are refused with a reason
     * naming the row — a torn `restart`/`continue` pair silently changes which
     * cells are one cell, which is exactly the corruption this must not write.
     *
     * **Complexity: O(rows + cells)** — one clone of the table plus a `remove`
     * and an `insert` on the row vector. No walk of the document and no walk of
     * cell content, so a drag stays O(1) in document size.
     * @param {string} node
     * @param {number} from
     * @param {number} to
     * @returns {EditResult}
     */
    moveTableRow(node, from, to) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_moveTableRow(retptr, this.__wbg_ptr, ptr0, len0, from, to);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The **NodeId in THIS document** that a change record's story + path names
     * — the one coordinate a comparison carries that survives into a live
     * editing session.
     *
     * # Why a host cannot do this itself, and why it must not try
     *
     * `DiffAnchor` has a `node`, and it is a trap: both sides of a comparison
     * are parsed by the diff facade and ids are minted per import, so that id
     * addresses a throwaway parse whose counter restarted at 1. The editor's
     * own `navigateToReviewAnchor` takes `{node, start, end}` — a byte-for-byte
     * match for `DiffAnchor` — so handing it one scrolls silently to an
     * unrelated paragraph that happens to hold the same ordinal id. Wrong
     * destination, no error, and nothing to tell the reader from.
     *
     * `DiffAnchor::path` is the coordinate that survives, and resolving it is
     * not a walk a host should write: the projection's block sequence is not the
     * model's block list (a table contributes rows and cells, which are not
     * `BlockNode`s; a block-level content control contributes itself *and* is
     * descended into). `casual_doc_diff::projection::block_at_path` reuses the
     * walk that PRODUCED the path, so producer and resolver cannot disagree —
     * and `apply_diff_as_revisions` already goes through it. This is that
     * resolver, exposed, which is all that was ever missing.
     *
     * `story` and `path` are the JSON of the anchor's own two fields.
     *
     * `None` — never a guess — when either argument is unreadable, when the path
     * names a row or a cell rather than a block, when it leaves this document's
     * shape (a stale path against a document edited since the comparison), when
     * the story is one this document does not have, and when the block it names
     * is not a paragraph. A caller that gets `None` must decline to navigate;
     * that is the whole reason this returns an option rather than a best guess.
     *
     * Complexity: **O(depth)**. One call per click, so navigation is O(1) in
     * document size (`docs/107` §4).
     * @param {string} story
     * @param {string} path
     * @returns {string | undefined}
     */
    nodeAtStoryPath(story, path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(story, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(path, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_nodeAtStoryPath(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v3;
            if (r0 !== 0) {
                v3 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Every footnote and endnote reference in the body, in document order, as
     * JSON `[{kind, node, offset}]`. O(blocks).
     * @returns {string}
     */
    noteReferences() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_noteReferences(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The footnote (`kind` `"footnote"`) or endnote (`"endnote"`) options the
     * section holding paragraph `node` resolves to, as JSON:
     * `{position, numberFormat, start, restart, sections}`, with the model's
     * own tokens (`pageBottom`, `lowerRoman`, `eachSection`, …). O(blocks) to
     * find the section.
     *
     * # Errors
     *
     * An unknown `kind`.
     * @param {string} kind
     * @param {string} node
     * @returns {string}
     */
    noteSettings(kind, node) {
        let deferred4_0;
        let deferred4_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(kind, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_noteSettings(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr3 = r0;
            var len3 = r1;
            if (r3) {
                ptr3 = 0; len3 = 0;
                throw takeObject(r2);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {number} page
     * @param {number} x_twip
     * @param {number} y_twip
     * @returns {ObjectHitPayload | undefined}
     */
    objectAt(page, x_twip, y_twip) {
        const ret = wasm.wasmdocument_objectAt(this.__wbg_ptr, page, x_twip, y_twip);
        return ret === 0 ? undefined : ObjectHitPayload.__wrap(ret);
    }
    /**
     * Returns the current source crop as normalized edge fractions. A zero
     * vector means the whole source is visible; `None` means the identity is
     * not a croppable picture. The lookup walks every supported document
     * surface so the host never resets an imported crop just because the
     * picture lives in a table, text box, header, or footer.
     * @param {string} node
     * @returns {Float64Array | undefined}
     */
    objectCrop(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_objectCrop(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v2;
            if (r0 !== 0) {
                v2 = getArrayF64FromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 8, 8);
            }
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Resolves the deepest painted descendant of multi-child group `root` at a
     * page-local point. Ordinary `objectAt` deliberately returns the group root
     * so initial selection is a unit; double-click uses this bounded second
     * query to descend without the host reconstructing group geometry.
     * @param {string} root
     * @param {number} page
     * @param {number} x_twip
     * @param {number} y_twip
     * @returns {ObjectHitPayload | undefined}
     */
    objectDescendantAt(root, page, x_twip, y_twip) {
        const ptr0 = passStringToWasm0(root, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_objectDescendantAt(this.__wbg_ptr, ptr0, len0, page, x_twip, y_twip);
        return ret === 0 ? undefined : ObjectHitPayload.__wrap(ret);
    }
    /**
     * The paint-ordered leaf references inside multi-child group `root`, as
     * JSON entries with the same identity/capability schema as `objectOrder`.
     * Keyboard Enter uses the first entry to descend into a selected group.
     * @param {string} root
     * @returns {string}
     */
    objectDescendants(root) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(root, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_objectDescendants(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Sets or clears an object's alt text (`wp:docPr@descr`) as one undoable action
     * (`SetObjectDescr`). `descr` is the new text, or `None` to clear it. Errors if
     * `node` is not an alt-text-bearing object (an inline or floating drawing), or
     * the text is empty / longer than the model's byte bound.
     * The object `node`'s current alt text (`wp:docPr@descr`), or `None` when it
     * has none or does not resolve to a drawing. Lets a host prefill an alt-text
     * editor with the existing description instead of blind-overwriting it.
     * @param {string} node
     * @returns {string | undefined}
     */
    objectDescr(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_objectDescr(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v2;
            if (r0 !== 0) {
                v2 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The current authored extent of the object `node` as `[widthEmu, heightEmu]`
     * (EMU), or the *placed* size (converted from the twip rect) when the object
     * has no authored extent — the base a drag-resize scales from. Empty if
     * `node` is not a currently placed selectable object.
     * @param {string} node
     * @returns {Float64Array}
     */
    objectExtent(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_objectExtent(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 8, 8);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The object `node`'s own UNROTATED frame plus the angle painted about its
     * centre: `[page, xTwip, yTwip, wTwip, hTwip, rotationMilliDegrees]`.
     * Empty if `node` is not a currently placed selectable object.
     *
     * This is [`object_rect`](Self::object_rect) plus the one fact a host
     * cannot derive from a rectangle. It exists because chrome for a rotated
     * object needs BOTH: the frame says how big the object is in its own space
     * (which is what a resize drag computes in, exactly as ONLYOFFICE's
     * `hitToHandles` inverts the transform before hit-testing), and the angle
     * says where that space sits on the page.
     *
     * The angle is in THOUSANDTHS of a degree rather than OOXML's 60000ths
     * because the vector is `i32` — the same flat-integer shape as every other
     * geometry getter here — and a thousandth of a degree moves a grip on a
     * 10-inch object by about 0.0001 inch, well under a device pixel.
     *
     * **O(objects) over the placed layout**, one pass, same as `objectRect`.
     * @param {string} node
     * @returns {Int32Array}
     */
    objectFrame(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_objectFrame(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The supported resize-handle centers of the selected object `node`, as a
     * flat `[page, cxTwip, cyTwip, kind]` per handle (docs/85 §3.3
     * `objectHandles`), in the order NW, N, NE, E, SE, S, SW, W (`kind` = that
     * index). Every resizable object — inline or floating — offers all eight,
     * which is what Word, Google Docs and ONLYOFFICE offer and what a user
     * reaches for. The carrier decides what the COMMIT writes, not which grips
     * exist: a float updates anchor and extent together, an inline updates its
     * extent and keeps the flow origin the paragraph gave it (so a north or
     * west drag previews with the opposite edge pinned and lands as a pure
     * size change). A ROTATED object gets its eight too, turned with it: the
     * centers below are computed on the object's own unrotated frame and then
     * rotated about that frame's centre, so a grip is drawn on the corner the
     * user sees. The set is empty only for a group whose members cannot be
     * scaled exactly.
     *
     * An object that can be rotated also gets a NINTH entry, `kind` 8 — the
     * rotation grip, anchored on the (rotated) midpoint of its top edge. It is
     * offered independently of resize, so an object that can be turned but not
     * resized still gets it. `objectFrame` publishes the angle the host needs to
     * push it out along the object's own axis and to turn the grip cursors.
     *
     * The frontend paints a fixed screen-size grip
     * centered at each — engine-drawn chrome from the object's placed rect, so
     * it matches the raster with zero drift (docs/58). Empty if `node` is not
     * placed or its reference has neither a compatible exact-inverse resize
     * command nor a painted rotation.
     * @param {string} node
     * @returns {Int32Array}
     */
    objectHandles(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_objectHandles(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Every selectable object in the document, in paint order, as JSON. Each
     * entry carries the stable `{surface, root, subject, path}` reference,
     * compatibility alias `node = subject`, `kind`, `page`, legacy `anchored`,
     * and the explicit structural capability bits consumed by the host
     * (docs/101 UXOBJ-001/002).
     *
     * Floating objects are otherwise reachable only by pointing at them:
     * `objectAt` needs a coordinate, so a keyboard user cannot select an image
     * or text box at all, and a screen reader cannot find a text box while
     * reading body text because it floats above the text layer. This is the
     * ordered list Tab / Shift+Tab traversal walks (docs/85 §8d, Q1) — Word
     * cycles floating objects with Tab once one is selected, and Word for the
     * web moves between graphics the same way.
     * @returns {string}
     */
    objectOrder() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_objectOrder(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The full OOXML position of the object `node`, as the JSON a Layout ▸
     * Position dialog is drawn from — or `""` if `node` is not an object.
     *
     * ```json
     * {"floating":true,
     *  "horizontal":{"relativeFrom":"column","offsetEmu":0},
     *  "vertical":{"relativeFrom":"paragraph","align":"top"},
     *  "wrap":"square","behindDoc":false,
     *  "wrapDistances":{"topEmu":0,"bottomEmu":0,"startEmu":114300,"endEmu":114300},
     *  "zOrder":3}
     * ```
     *
     * An inline object answers `{"floating":false}` and nothing else, because
     * an inline object HAS no anchor — reporting a position for it would
     * invent one. Every token is the OOXML token (`ST_RelFromH`,
     * `ST_RelFromV`, `ST_AlignH`, `ST_AlignV`), so a host never has to
     * translate and a value read here can be written straight back.
     *
     * **O(document), ONE walk.**
     * @param {string} node
     * @returns {string}
     */
    objectPosition(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_objectPosition(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The placed rectangle of the object `node`, as `[page, xTwip, yTwip,
     * wTwip, hTwip]` — the geometry the frontend paints the selection outline
     * from (docs/85 §3.3 `objectRect`). Empty if `node` is not a currently
     * placed selectable object.
     * @param {string} node
     * @returns {Int32Array}
     */
    objectRect(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_objectRect(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The rotation and flips of the object `node`, as
     * `{"rotationDegrees":45.0,"flipH":false,"flipV":false}` — or `""` if
     * `node` is not an object that models them.
     *
     * Degrees rather than the 60000ths OOXML stores, because a host draws a
     * rotation handle in degrees and doing the division in JS would put the
     * unit conversion in two places.
     *
     * **O(document), ONE walk.**
     * @param {string} node
     * @returns {string}
     */
    objectTransform(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_objectTransform(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The current wrap mode of a floating object as one of the
     * [`set_object_wrap`](Self::set_object_wrap) tokens, or `""` if `node` is not
     * a floating object — drives the context bar's active-wrap reflection.
     * @param {string} node
     * @returns {string}
     */
    objectWrap(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_objectWrap(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The page borders of the section holding `node` — the Page Borders dialog's
     * read side (HF-193) — as JSON:
     * `{"section": id, "sections": [every section id, in order], "borders": {…}}`,
     * where `borders` is the model's own camelCase `PageBorders` shape (`display`,
     * `offsetFrom`, and `top`/`bottom`/`start`/`end` edges, each absent when unset).
     * `null` only when the document has no section at all.
     *
     * O(document): resolving `node` to its section is a document walk
     * (`section_of`). Call it when the dialog opens, not per frame.
     * @param {string} node
     * @returns {string}
     */
    pageBorders(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_pageBorders(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Page background as #rrggbb; empty means automatic white.
     * @returns {string}
     */
    pageColor() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_pageColor(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Whether [`page_count`](Self::page_count) is the whole document's, or
     * only of the prefix measured so far.
     *
     * The one flag every surface that shows or uses a total reads: the page
     * indicator, `NUMPAGES`, printing and the scrollbar. `AGENTS.md` — a
     * number that is not exact is never presented as though it were.
     * @returns {boolean}
     */
    get pageCountIsExact() {
        const ret = wasm.wasmdocument_pageCountIsExact(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * The number of laid-out pages.
     *
     * A windowed body takes it from the measure tier, which `docs/113` §6.4
     * measured as identical to `paginate_document`'s (29,621 pages on the
     * owner's file) — reporting the resident window's length here would tell
     * a host with 29,621 pages that it had five, and every page past the
     * fifth would simply not exist as far as the viewer, the scrollbar,
     * printing and `NUMPAGES` were concerned.
     *
     * These pages are always real pages, never estimates. While a long
     * document is still being measured in the background (`docs/116` §7) this
     * is the count of the part measured so far, and
     * [`page_count_is_exact`](Self::page_count_is_exact) is `false`; a host
     * that shows a total to the reader must ask that too, and
     * [`estimated_page_count`](Self::estimated_page_count) for the number to
     * show beside a `~`.
     * @returns {number}
     */
    get pageCount() {
        const ret = wasm.wasmdocument_pageCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * One PAGE's geometry (width + side margins, in twips) — what the horizontal
     * ruler draws its scale and margin zones from.
     *
     * Takes the page because the answer differs per page, and the ruler has to
     * describe the page the caret is on. This replaced a `pageGeometry()` that
     * returned `default_config` — the document's OPENING section — for every
     * page. On a document whose second section turns landscape, the ruler kept
     * the portrait width and the portrait margins: the scale was wrong, so the
     * inch ticks were wrong, and the shaded margin zones did not line up with
     * the paper underneath them. The neighbouring [`pageSetup`](Self::page_setup)
     * already carried a warning that it "is not the answer to any question about
     * a page the user is looking at"; the ruler was asking exactly that question
     * of exactly that kind of accessor.
     *
     * Complexity: O(1). The section list is short and indexed by the page's own
     * `section` id, so this is safe to call on every zoom and scroll — which the
     * ruler does. Deliberately NOT keyed by a node id: `section_of` builds a
     * paragraph index and walks the document, and per-interaction work must be
     * O(1) in document size (`docs/107` §4).
     *
     * # Errors
     * When `index` is not a page of this document.
     * @param {number} index
     * @returns {RulerGeometry}
     */
    pageRulerGeometry(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_pageRulerGeometry(retptr, this.__wbg_ptr, index);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return RulerGeometry.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * All section geometries plus the section containing `node` as the current
     * selection context. The host uses this to make Page Setup explicitly
     * section-aware instead of silently editing only the first section.
     * @param {string} node
     * @returns {string}
     */
    pageSetupSections(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_pageSetupSections(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The first section's full page-setup geometry (page size, margins, and
     * orientation) as a JSON object — the document's OPENING geometry. `null` if
     * the document has no section (should not occur for an imported DOCX, which
     * always carries at least one).
     *
     * Not the answer to any question about a page the user is looking at: on a
     * document whose later section changes orientation or margins this describes
     * pages the user may never see. Use
     * [`pageSetupSections`](Self::page_setup_sections) for the dialog and
     * [`runningBands`](Self::running_bands) for a page's own bands.
     * @returns {string}
     */
    pageSetup() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_pageSetup(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The page box size of page `index` (0-based), in twips, resolved against
     * that page's own section (`w:sectPr`) so multi-section documents report
     * per-section geometry.
     *
     * Throws if `index` is out of range.
     * @param {number} index
     * @returns {PageSize}
     */
    pageSize(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_pageSize(retptr, this.__wbg_ptr, index);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return PageSize.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns effective paragraph advanced settings as JSON. Complexity: O(document).
     * @param {string} node
     * @returns {string}
     */
    paragraphAdvanced(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_paragraphAdvanced(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The paragraph's border edges as a bitmask — top=1, bottom=2, left=4, right=8 —
     * for reflecting which edge presets are active in the paragraph menu.
     * @param {string} node
     * @returns {number}
     */
    paragraphBorderEdges(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_paragraphBorderEdges(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Returns all effective border properties as JSON. Complexity: O(document).
     * @param {string} node
     * @returns {string}
     */
    paragraphBorders(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_paragraphBorders(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The paragraph's line-and-page-break flags (keep-with-next, keep-lines,
     * page-break-before) for reflecting the paragraph-properties inspector.
     * @param {string} node
     * @returns {ParagraphFlags}
     */
    paragraphFlags(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_paragraphFlags(this.__wbg_ptr, ptr0, len0);
        return ParagraphFlags.__wrap(ret);
    }
    /**
     * The paragraph's indentation (left/right/first-line/hanging, in twips; 0 when
     * unset) — for positioning the ruler's indent markers.
     * @param {string} node
     * @returns {Indents}
     */
    paragraphIndent(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_paragraphIndent(this.__wbg_ptr, ptr0, len0);
        return Indents.__wrap(ret);
    }
    /**
     * The byte length of paragraph `node`'s text (triple-click paragraph select).
     * @param {string} node
     * @returns {number}
     */
    paragraphLength(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_paragraphLength(this.__wbg_ptr, ptr0, len0);
        return ret >>> 0;
    }
    /**
     * The paragraph's shading fill as a packed `0xRRGGBB` int, or `-1` when unset —
     * for the paragraph-properties inspector's shading swatch.
     * @param {string} node
     * @returns {number}
     */
    paragraphShadingAt(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_paragraphShadingAt(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * The paragraph's **effective** spacing (space before/after in twips, and
     * line spacing) — for the toolbar's line-&-paragraph-spacing menu to tick a
     * preset and fill its value boxes. `-1` means unset for before/after;
     * `line_rule` is `0` auto (percent), `1` atLeast, `2` exact (twips); the
     * `*FromStyle` flags say whether the value was inherited.
     *
     * Resolved through the style cascade, not read off `w:pPr`. A direct read
     * reports "nothing set" for every paragraph of a document that puts its
     * spacing in `Normal`, which is most of them — see [`ParagraphSpacing`].
     *
     * **Complexity: O(document)** because resolving `node` to its paragraph is a
     * block-surface walk (`paragraph_properties`), plus O(style chain) to
     * cascade. Call it once per selection change, never in a loop over nodes.
     * @param {string} node
     * @returns {ParagraphSpacing}
     */
    paragraphSpacing(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_paragraphSpacing(this.__wbg_ptr, ptr0, len0);
        return ParagraphSpacing.__wrap(ret);
    }
    /**
     * The name of the paragraph style applied at `node` (empty if none) — for
     * reflecting the current style in a dropdown.
     * @param {string} node
     * @returns {string}
     */
    paragraphStyleAt(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_paragraphStyleAt(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Returns position/alignment/leader triples. Complexity: O(document + tabs).
     * @param {string} node
     * @returns {Int32Array}
     */
    paragraphTabsWithLeaders(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_paragraphTabsWithLeaders(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The paragraph's explicit tab stops as a flat `[pos0, code0, pos1, code1, …]`
     * (position in twips, alignment code 0 start / 1 center / 2 end / 3 decimal /
     * 4 bar) — what the ruler renders its tab glyphs from.
     * @param {string} node
     * @returns {Int32Array}
     */
    paragraphTabs(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_paragraphTabs(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * What this participant is allowed to do, as the capability names a host passes to
     * `WasmDocument::adopt_participant_capabilities`, sorted.
     *
     * Host-visible so chrome can disable a control and *say why*, rather than discovering the
     * refusal by sending the gesture. Empty means read-only.
     * @returns {string[]}
     */
    get participantCapabilities() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_participantCapabilities(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Editing-mode paste of **externally**-parsed structure (foreign HTML: an
     * Excel/Word/Google-Docs/web `<table>` or `<ul>`/`<ol>`), reconstructed as
     * real tables and bullet/numbered list paragraphs at a **collapsed caret in a
     * body paragraph**, as one undoable action. Distinct from
     * [`paste_structured`](Self::paste_structured) (the model-native round-trip of
     * an *internal* OpenDoc copy): the fragment is a small JS-built contract
     * (`ExternalFragment`) so the clipboard bridge never hand-writes model node
     * ids or numbering instances — run formatting rides the same `ClipboardRun`
     * the flat rich paste already uses, and each list paragraph names a
     * `{ ordered, level }` bound to a real numbering instance here via
     * `ensure_list`. Rejects a non-collapsed selection or a
     * caret outside a top-level body paragraph (the caller falls back to the flat
     * rich-run paste), matching `paste_structured`'s target contract. Text,
     * formatting, links, tables, and list levels survive; merged cells and deep
     * nesting degrade gracefully to a valid rectangular table / flat levels.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} fragment_json
     * @returns {EditResult}
     */
    pasteExternalStructured(start_node, start_offset, end_node, end_offset, fragment_json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(fragment_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_pasteExternalStructured(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Replaces the selection (if any) with a rich-run clipboard fragment — the
     * paste counterpart of [`copy_rich_runs`](Self::copy_rich_runs). Builds one
     * `InsertText`/`FormatText`/`SetHyperlink`/`SplitParagraph` op per run or
     * paragraph-break marker and commits them as a single undoable action (the
     * same atomic multi-op batching `replaceSelection` and `insertStyledText`
     * already use). `runs_json` must be a JSON array in the shape
     * `copyRichRuns` produces.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} runs_json
     * @returns {EditResult}
     */
    pasteRichRuns(start_node, start_offset, end_node, end_offset, runs_json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(runs_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_pasteRichRuns(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Pastes a [`copy_structured`](Self::copy_structured) fragment at a **collapsed
     * caret in a body paragraph**, reconstructing the copied paragraphs and tables
     * with fresh ids as one undoable action. Rejects a non-collapsed selection or a
     * caret inside a table cell / SDT (the caller falls back to the flat rich-run
     * paste for those), so the reconstruction target is always the document body.
     * Inline content is carried **whole**: text and formatting, hyperlinks,
     * pictures and anchored pictures, fields, text boxes, groups, embedded
     * objects, inline content controls, tracked changes, math, symbols, rules,
     * hyphens and positional tabs, each with a fresh id. The five reference
     * families a same-document copy cannot duplicate — bookmark markers, comment
     * reference/range markers, note references, paragraph-spanning field-range
     * markers, and tracked-move markers — are dropped and **reported** through
     * [`EditResult::paste_loss`](EditResult::paste_loss) so the host can say so;
     * `casual_doc_edit::clone` documents why each one cannot be carried. Nothing
     * is discarded silently.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} fragment_json
     * @returns {EditResult}
     */
    pasteStructured(start_node, start_offset, end_node, end_offset, fragment_json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(fragment_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_pasteStructured(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * How this PDF-origin session was opened: `"flowing"` (the default open)
     * or `"fixed"` ("Keep exact page layout"); empty for a session that is
     * not PDF-origin. O(1).
     * @returns {string}
     */
    get pdfLayout() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_pdfLayout(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * What OCR did when the PDF this session came from was imported, as JSON
     * (`rasterPages`, `hybridPages`, `regionsRecognized`, `regionsSkipped`,
     * `wordsKept`, `provider`); empty for a session not opened from a PDF.
     * O(1).
     * @returns {string}
     */
    get pdfOcrSummaryJson() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_pdfOcrSummaryJson(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Whether this session was opened from a PDF and keeps its original:
     * what "Convert to flowing document" and "Recognise text in scanned
     * pages" are enabled by. O(1).
     * @returns {boolean}
     */
    get pdfOrigin() {
        const ret = wasm.wasmdocument_pdfOrigin(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * The PDF this session was opened from, byte for byte, for the PDF
     * module to import again (to reflow it, or to read its scans).
     * `undefined` when the session is not PDF-origin. O(original): a copy.
     * @returns {Uint8Array | undefined}
     */
    pdfOriginal() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_pdfOriginal(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getArrayU8FromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's and ONLYOFFICE's Save as Picture (`DocumentHolder.js`
     * `textSaveAsPicture`), for a picture: the picture's image file exactly as
     * the package holds it — the original bytes, uncropped, at full
     * resolution, which is what Word saves — or `undefined` when `node` is not
     * a standalone picture or its bytes are not in the package (`docs/109`
     * RM-29). Its type is [`picture_media_type`](Self::picture_media_type).
     *
     * **O(document)** for the walk, plus one copy of the image.
     * @param {string} node
     * @returns {Uint8Array | undefined}
     */
    pictureBytes(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_pictureBytes(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v2;
            if (r0 !== 0) {
                v2 = getArrayU8FromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The MIME type of [`picture_bytes`](Self::picture_bytes) (`image/png`,
     * `image/jpeg`, …), or `undefined` with it. O(document).
     * @param {string} node
     * @returns {string | undefined}
     */
    pictureMediaType(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_pictureMediaType(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v2;
            if (r0 !== 0) {
                v2 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The natural size of the picture `node`'s WHOLE source image, as
     * `[widthEmu, heightEmu]` at 96 DPI (9525 EMU per pixel, the rate
     * `insertImage` places a picture at), or an empty vector when the size is
     * not known: `node` is not a standalone picture (a group member's size is in
     * group coordinates), its bytes are not in the package, or the format
     * states no size in its header (TIFF, WebP need a decoder this engine does
     * not carry).
     *
     * The read face of Reset size (ONLYOFFICE's Actual Size, `ImageSettings.js`
     * `setOriginalSize` over `asc_getCropOriginalImageSize`) and of Crop to Fit
     * and Crop to Fill (`asc_cropFit` / `asc_cropFill`), which need the source's
     * proportions (`docs/109` RM-29). The size is read from the image header on
     * each call rather than stored at insert, so it is right for an imported
     * picture as well as for one inserted here.
     *
     * **O(document)** for the one walk that finds the picture, plus O(header).
     * @param {string} node
     * @returns {Float64Array}
     */
    pictureNaturalSize(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_pictureNaturalSize(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 8, 8);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The body paragraphs with content on pages `first_page..=last_page`
     * (1-based), in document order, as a JSON array of
     * `{"node": id, "text": plain text, "language": shared w:lang or ""}` —
     * everything a proofing pass reads about the visible pages, in **one**
     * call (`docs/architecture/180` E2, `109` HF-411).
     *
     * It replaces a host walk that made about five engine calls per paragraph
     * (`hitTest`, `moveCaret`, `caretRect`, `paragraphLength`, `copyText`,
     * `languageAt`), most of them `O(document)` each: `caretRect` built the
     * line boxes of the whole document to answer which page a paragraph was
     * on, and measured 466 ms per keystroke at 20,000 paragraphs.
     *
     * Pattern: a **finger search** — memoization with validation on use, the
     * same shape as `casual_doc_model::v1::locate`'s route hint. The pages
     * name their paragraphs (`O(window)`), and the model blocks that hold them
     * are found by searching outward from where the previous call found its
     * window. A stale finger costs a longer search, never a wrong answer: a
     * block is accepted only if it really holds a paragraph from the window.
     * Proofing asks about the same pages after every keystroke, so the
     * search is `O(window)` on the path that runs per keystroke, and
     * `O(distance scrolled)` once after a jump.
     *
     * Body only, as before: header, footer, note and text-box stories are
     * proofed by nothing yet (`docs/146` §8).
     * @param {number} first_page
     * @param {number} last_page
     * @returns {string}
     */
    proofWindow(first_page, last_page) {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_proofWindow(retptr, this.__wbg_ptr, first_page, last_page);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Installs, changes or lifts the editing restriction with Word's password
     * semantics, as one undoable action (Word's Restrict Editing and Stop
     * Protection; ONLYOFFICE's `asc_setDocumentProtection`).
     *
     * `edit`, `enforcement` and `formatting` are
     * [`set_document_protection`](WasmDocument::set_document_protection)'s.
     *
     * * When the current restriction carries a password this editor can check,
     *   `current_password` must match it, or the call is refused with
     *   `document.protection-wrong-password` and nothing changes — that is Word's
     *   Stop Protection asking for the password.
     * * `new_password`, when non-empty and a restriction is being installed, is
     *   stored as the verifier Word 2013+ writes, salted with `salt` (16 bytes,
     *   which the host draws from `crypto.getRandomValues`). Empty means no
     *   password.
     *
     * # Errors
     *
     * The refusal above, an unknown `edit` token, a salt of the wrong length, or
     * the choke point refusing the operation. O(spin count) once.
     * @param {string | null | undefined} edit
     * @param {boolean} enforcement
     * @param {boolean} formatting
     * @param {string | null} [current_password]
     * @param {string | null} [new_password]
     * @param {Uint8Array | null} [salt]
     * @returns {EditResult}
     */
    protectDocument(edit, enforcement, formatting, current_password, new_password, salt) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = isLikeNone(edit) ? 0 : passStringToWasm0(edit, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(current_password) ? 0 : passStringToWasm0(current_password, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(new_password) ? 0 : passStringToWasm0(new_password, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(salt) ? 0 : passArray8ToWasm0(salt, wasm.__wbindgen_export);
            var len3 = WASM_VECTOR_LEN;
            wasm.wasmdocument_protectDocument(retptr, this.__wbg_ptr, ptr0, len0, enforcement, formatting, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Whether the restriction carries a password, and whether this editor can
     * check it: `{"present":bool,"verifiable":bool}`. A password that is present
     * and not verifiable (an algorithm or spin count this build does not check)
     * is the one case where a change here removes it without asking — the
     * dialog says so before Apply. O(16).
     * @returns {string}
     */
    protectionPassword() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_protectionPassword(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Paste as picture: lays `runs_json` (the `pasteRichRuns` payload) out at the
     * width of the column holding `node`, with this document's styles and fonts,
     * and returns it painted at `dpi` as a PNG trimmed to its ink. Does not
     * change the document; insert the result with `insertImage`.
     *
     * Throws (with a refusal code) when the clipboard has nothing visible
     * (`paste.picture-empty`) or would make a picture too large to allocate
     * (`paste.picture-too-large`).
     * @param {string} node
     * @param {string} runs_json
     * @param {number} dpi
     * @returns {PictureRaster}
     */
    rasterizeClipboard(node, runs_json, dpi) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(runs_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_rasterizeClipboard(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, dpi);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return PictureRaster.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * User-facing label for the next redoable action, or an empty string when
     * the redo stack is empty.
     * @returns {string}
     */
    get redoLabel() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_redoLabel(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Redoes the last undone action.
     *
     * All-or-nothing on the same terms as [`Self::undo`]: a group that cannot
     * apply leaves the document untouched and the redo step where it was.
     * @returns {EditResult}
     */
    redo() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_redo(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The cross-reference targets of one reference type, as `"{node}\t{text}"`
     * rows in document order.
     *
     * `kind` is `"heading"`, `"bookmark"`, `"footnote"`, `"endnote"`, or a
     * caption label (`"Figure"`, `"Table"`, or any label the document uses) —
     * Word's *Reference type* list. An unknown label is not an error, so a host
     * offering a label the document has since stopped using gets an empty list
     * and says so, instead of throwing.
     *
     * **O(document), ONE walk.**
     * @param {string} kind
     * @returns {string[]}
     */
    referenceTargets(kind) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(kind, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_referenceTargets(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The over-wide tables on reflow tile `index`, as JSON:
     * `[{ "table": id, "topTwip", "heightTwip", "scrollWidthTwip",
     * "viewportTwip", "offsetTwip" }]`, top to bottom (`docs/151` §6.3d).
     *
     * In a reflowed column a top-level table keeps the width its document
     * declares (`MeasureFit::Scroll`), and the part past the tile is reached the
     * way Google Docs' pageless view reaches it: a horizontal scroller of the
     * table's own. This is what a host needs to put one there — the band the
     * table occupies on this tile, the width the scroller spans, the width it
     * shows, and where it is scrolled to now. `[]` on paper, and for a tile whose
     * tables all fit.
     *
     * Complexity: `O(fragments on the tile)`, plus each over-wide table's own
     * rows to find its widest — never the document.
     * @param {number} index
     * @returns {string}
     */
    reflowTableOverflows(index) {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_reflowTableOverflows(retptr, this.__wbg_ptr, index);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Registers a host-provided font (e.g. a network-fetched Noto face) as a
     * **coverage fallback** for the given ISO-15924 scripts (`"Hani"`, `"Hira"`,
     * `"Kana"`, `"Hang"`, …), then re-paginates so runs the bundled faces miss now
     * shape and render with it. This is the browser half of the font-provisioning
     * strategy — the single host-populatable seam.
     *
     * `scripts` may be empty to register the face without wiring script fallback
     * (see [`WasmDocument::register_font`]).
     * @param {Uint8Array} bytes
     * @param {string[]} scripts
     */
    registerFallbackFont(bytes, scripts) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(scripts, wasm.__wbindgen_export);
        const len1 = WASM_VECTOR_LEN;
        wasm.wasmdocument_registerFallbackFont(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    }
    /**
     * Registers a host-provided font by family (no script-fallback wiring), then
     * re-paginates. Use when a document names a face the host can supply directly;
     * for CJK / complex-script coverage prefer
     * [`register_fallback_font`](Self::register_fallback_font).
     * @param {Uint8Array} bytes
     */
    registerFont(bytes) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.wasmdocument_registerFont(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Registers a bounded batch of host-provided named-family fonts and
     * re-paginates exactly once. `bytes` is the concatenation of every font blob;
     * `lengths` gives each blob's byte length in the same order.
     *
     * The packed form keeps the JS↔WASM ABI simple and avoids one complete
     * document reflow per face when the browser provisions the Roboto/Noto
     * families before first paint.
     * @param {Uint8Array} bytes
     * @param {Uint32Array} lengths
     */
    registerFonts(bytes, lengths) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray32ToWasm0(lengths, wasm.__wbindgen_export);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_registerFonts(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Remove Content Control: the control goes and its content stays,
     * as one undoable action.
     *
     * # Errors
     * No such control, or one locked against deletion.
     * @param {string} id
     * @returns {EditResult}
     */
    removeContentControl(id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_removeContentControl(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Removes the hyperlink wrapper occupying exactly the supplied selection,
     * preserving its linked text and formatting.
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @returns {EditResult}
     */
    removeHyperlink(node, start, end) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_removeHyperlink(retptr, this.__wbg_ptr, ptr0, len0, start, end);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Removes the header or footer the page shows (Word's Remove Header,
     * ONLYOFFICE's `asc_RemoveHeader`), from this section's pages and the
     * sections linked to it, never from an earlier section's — see
     * `casual_doc_command::sections::remove_running_content`. One undoable
     * action; `(node, offset)` is the caret to keep, normally the body position
     * the host returns to.
     *
     * # Errors
     * When the page shows no such band, or the choke point refuses.
     * @param {string} region
     * @param {number} page
     * @param {string} node
     * @param {number} offset
     * @returns {EditResult}
     */
    removeRunningContent(region, page, node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(region, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_removeRunningContent(retptr, this.__wbg_ptr, ptr0, len0, page, ptr1, len1, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Removes the tab stop at exactly `position_twips` over the selection.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} position_twips
     * @returns {EditResult}
     */
    removeTabStop(start_node, start_offset, end_node, end_offset, position_twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_removeTabStop(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, position_twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Removes a table of contents or figures as a unit: its field definition
     * and every entry paragraph, one undoable action. `id` as for
     * [`updateTableOfContents`](Self::update_table_of_contents).
     *
     * # Errors
     * No such table; several and `id` was empty.
     * @param {string} id
     * @returns {EditResult}
     */
    removeTableOfContents(id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_removeTableOfContents(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Renames the bookmark with the 32-hex `id` to `name`. One undoable action.
     * Rejects an unknown id or an empty/oversized name.
     * @param {string} id
     * @param {string} name
     * @returns {EditResult}
     */
    renameBookmark(id, name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_renameBookmark(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Rasterizes page `index` (0-based) at `dpi` device pixels per inch and
     * returns raw premultiplied RGBA8888 the frontend blits via `putImageData`.
     *
     * Throws if `index` is out of range or the surface size is invalid.
     * @param {number} index
     * @param {number} dpi
     * @returns {PageBitmap}
     */
    renderPage(index, dpi) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_renderPage(retptr, this.__wbg_ptr, index, dpi);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return PageBitmap.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Rasterises over-wide table `table`'s band on tile `index` at its FULL
     * width and at offset zero — `scrollWidthTwip` by `heightTwip` from
     * `reflowTableOverflows` — so a host can put it in a native scroll container
     * and let the compositor scroll it. A scroll gesture then costs no raster at
     * all; only an edit to the table, which repaints its tile, re-rasterises it.
     *
     * Same pixels as `renderPage` would paint for those rows, from the same
     * composer and the same layout (the markup one while changes are shown).
     *
     * Throws when the tile has no such over-wide table.
     * @param {number} index
     * @param {string} table
     * @param {number} dpi
     * @returns {PageBitmap}
     */
    renderReflowTableStrip(index, table, dpi) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(table, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_renderReflowTableStrip(retptr, this.__wbg_ptr, index, ptr0, len0, dpi);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return PageBitmap.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's **Change Picture** and Docs' **Replace image**: swaps the picture
     * `node`'s image for `bytes` (a `mime` of the kinds `insertImage` takes,
     * whose natural size is `width_emu` x `height_emu`) as ONE undoable action,
     * keeping everything the user set on the object.
     *
     * Kept: the anchor and the position, the text wrap, the stacking order, the
     * rotation and flips, the border, the hyperlink and the alt text — every
     * field but the three below, because the picture node itself is kept and
     * only those three are rewritten. The workaround this replaces (delete, then
     * insert) lost all of them (`docs/109` HF-252).
     *
     * Rewritten, each deliberately:
     *
     * * the media reference, to a newly registered part (the old part stays in
     *   the package until nothing references it, which is export's rule);
     * * the extent, to the new image FITTED INSIDE the old frame at the new
     *   image's own proportions, so a portrait photo replacing a landscape one is
     *   neither stretched nor allowed to grow the layout — Word's behaviour;
     * * the crop, cleared: it is a fraction of the OLD image's pixels and means
     *   nothing about the new one.
     *
     * The registration and the rewrite are one transaction, registration first,
     * for the reason `insertImage` gives: an operation must never be ordered
     * before the thing it references.
     *
     * # Errors
     *
     * An unsupported `mime`, empty bytes, a non-positive size, or a `node` that
     * is not a picture.
     *
     * **O(document), ONE walk** to resolve the paragraph, then O(its inlines).
     * @param {string} node
     * @param {Uint8Array} bytes
     * @param {number} width_emu
     * @param {number} height_emu
     * @param {string} mime
     * @returns {EditResult}
     */
    replacePicture(node, bytes, width_emu, height_emu, mime) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(mime, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_replacePicture(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, width_emu, height_emu, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Replaces MANY ranges, each with its own text, as ONE undoable action:
     * regular-expression Replace All, where `$1` expands differently per
     * match. The arrays are parallel and the ranges must arrive in DESCENDING
     * document order (last match first), the contract `replaceRanges` has, so
     * applying one never shifts a range not yet applied.
     * @param {string[]} start_nodes
     * @param {Uint32Array} start_offsets
     * @param {string[]} end_nodes
     * @param {Uint32Array} end_offsets
     * @param {string[]} texts
     * @returns {EditResult}
     */
    replaceRangesEach(start_nodes, start_offsets, end_nodes, end_offsets, texts) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(start_nodes, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray32ToWasm0(start_offsets, wasm.__wbindgen_export);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArrayJsValueToWasm0(end_nodes, wasm.__wbindgen_export);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArray32ToWasm0(end_offsets, wasm.__wbindgen_export);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passArrayJsValueToWasm0(texts, wasm.__wbindgen_export);
            const len4 = WASM_VECTOR_LEN;
            wasm.wasmdocument_replaceRangesEach(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Replaces MANY ranges with the same text as ONE undoable action (Replace
     * All). The caller supplies the match ranges as four parallel arrays and must
     * pass them in DESCENDING document order (last match first), so applying each
     * replacement in turn never shifts an earlier, not-yet-applied range's
     * offsets. Every range's delete+insert ops are concatenated into a single
     * action, so one Ctrl+Z undoes the whole Replace All (matching Word/Docs).
     * @param {string[]} start_nodes
     * @param {Uint32Array} start_offsets
     * @param {string[]} end_nodes
     * @param {Uint32Array} end_offsets
     * @param {string} text
     * @returns {EditResult}
     */
    replaceRanges(start_nodes, start_offsets, end_nodes, end_offsets, text) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(start_nodes, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray32ToWasm0(start_offsets, wasm.__wbindgen_export);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArrayJsValueToWasm0(end_nodes, wasm.__wbindgen_export);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArray32ToWasm0(end_offsets, wasm.__wbindgen_export);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len4 = WASM_VECTOR_LEN;
            wasm.wasmdocument_replaceRanges(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Replaces a selection with `text` (type-over) as one undoable action.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} text
     * @returns {EditResult}
     */
    replaceSelection(start_node, start_offset, end_node, end_offset, text) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_replaceSelection(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Replay a frame from this session's trusted journal before enabling edits.
     * @param {string} json
     */
    replayDurableFrame(json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_replayDurableFrame(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * [`reply_to_comment`](Self::reply_to_comment) with `@` mentions, as
     * [`add_comment_mentioning`](Self::add_comment_mentioning) takes them.
     * @param {string} parent
     * @param {string} text
     * @param {string} mentions
     * @param {string | null} [author]
     * @param {string | null} [initials]
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    replyMentioning(parent, text, mentions, author, initials, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(parent, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(mentions, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(initials) ? 0 : passStringToWasm0(initials, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            var ptr5 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len5 = WASM_VECTOR_LEN;
            wasm.wasmdocument_replyMentioning(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Adds a reply to an existing comment thread.
     * @param {string} parent
     * @param {string} text
     * @param {string | null} [author]
     * @param {string | null} [initials]
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    replyToComment(parent, text, author, initials, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(parent, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(initials) ? 0 : passStringToWasm0(initials, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            wasm.wasmdocument_replyToComment(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Commits the final page-local rectangle of one handle drag as a single
     * exact-inverse history action (`UXOBJ-003`, doc 101 §7.3). Inline objects
     * replace extent only and therefore accept rectangles whose top-left did
     * not move. Floating drawings/text boxes replace extent plus a canonical
     * page-relative anchor. Eligible groups additionally scale their outer
     * `wp:extent` and the scale-bearing `a:xfrm` fields while retaining child
     * coordinates. The host previews freely but calls this exactly once on
     * pointer-up.
     * @param {string} root
     * @param {number} left_emu
     * @param {number} top_emu
     * @param {number} width_emu
     * @param {number} height_emu
     * @returns {EditResult}
     */
    resizeObject(root, left_emu, top_emu, width_emu, height_emu) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(root, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_resizeObject(retptr, this.__wbg_ptr, ptr0, len0, left_emu, top_emu, width_emu, height_emu);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Resolves a click at `(x, y)` on `page` to a caret AND the story it lands
     * in, honouring the story currently open.
     *
     * This is the whole entry/exit rule in one place, which is why it exists:
     * the host used to infer "the user left the header" from a hit-test that
     * found no glyph, so clicking the empty right-hand end of a header line
     * threw the user out of the context they were typing in. Geometry decides
     * the story; content decides only the offset within it.
     *
     * Returns the caret plus `band` — `""` for the body — so the host applies
     * the answer instead of deriving it.
     * @param {number} page
     * @param {number} x_twip
     * @param {number} y_twip
     * @returns {RunningHitPayload | undefined}
     */
    resolveClick(page, x_twip, y_twip) {
        const ret = wasm.wasmdocument_resolveClick(this.__wbg_ptr, page, x_twip, y_twip);
        return ret === 0 ? undefined : RunningHitPayload.__wrap(ret);
    }
    /**
     * Restarts a numbered list at the caret's paragraph and carries the new
     * numbering instance through the contiguous following items at the same
     * level. Bullets and non-list paragraphs are rejected.
     * @param {string} node
     * @returns {EditResult}
     */
    restartList(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_restartList(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Restores the original pixels under an edited line box: removes its
     * patch and makes its text the recognised line again, unpainted. One
     * undoable action. O(document).
     *
     * # Errors
     *
     * `imageText.refused.notImageText` when the box was never edited.
     * @param {string} paragraph
     * @returns {EditResult}
     */
    restoreImageText(paragraph) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(paragraph, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_restoreImageText(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Restores the definition saved when this document was opened. Imported
     * template definitions remain authoritative; no fabricated factory defaults.
     * @param {string} name
     * @returns {EditResult}
     */
    restoreStyleDefault(name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_restoreStyleDefault(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Review inventory for the margin UI. Anchors use the same final-with-markup
     * byte projection as layout/editing, including collapsed deleted ranges.
     * @returns {string}
     */
    reviewSummary() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_reviewSummary(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The comments that overlap one tracked-change/formatting revision —
     * the typed data (a `ReviewCommentSummaryJson` array, the same shape
     * [`comment_thread`](Self::comment_thread) returns) backing a review UI
     * that threads a comment card beneath the change it discusses (docs/81
     * REVIEW-GAP-012, "comment-to-revision overlap mapping"). A comment
     * overlaps a revision when their resolved anchor ranges lie in the same
     * paragraph and intersect in the shared final-with-markup byte space
     * that both [`list_comments`](Self::list_comments) and
     * [`list_revisions`](Self::list_revisions) already report. Ordered by
     * stable comment id. Errs if `revision` is not a known revision id.
     *
     * This is the read/overlap half of REVIEW-GAP-012 and changes no DOCX
     * comment-ownership semantics: it invents no model link between a
     * comment and a revision, it only reports where their existing anchor
     * ranges coincide. Authoring a reply *to* a revision is `addComment`
     * over that revision's own anchor range (available from
     * [`list_revisions`](Self::list_revisions)); the new comment then
     * appears here. A pure deletion revision is zero-width in the
     * final-with-markup projection, so it cannot itself carry a new
     * same-range comment anchor — that authoring case remains deferred
     * (docs/81 REVIEW-GAP-012).
     * @param {string} revision
     * @returns {string}
     */
    revisionThread(revision) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(revision, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_revisionThread(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * One page's own running-content context, as JSON
     * `{section, sectionCount, headerTwips, footerTwips, headerLinked, footerLinked}`:
     * the margin bands to draw the header/footer boundary in, the 1-based section
     * the page belongs to, and whether each band is inherited.
     *
     * The host used to derive the bands from [`page_setup`](Self::page_setup),
     * which is the FIRST section's geometry — so on a document whose later
     * section changes orientation or margins the dashed header boundary was drawn
     * in the wrong place on every page of that section, and the label could not
     * say which section's header was open.
     * @param {number} page
     * @returns {string}
     */
    runningBands(page) {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_runningBands(retptr, this.__wbg_ptr, page);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Resolves the first caret in the header/footer body **the given page
     * shows** — the model-side answer to "which running story am I editing".
     * This is deliberately model-based: a missed geometry probe must never be
     * interpreted as permission to replace an existing running story.
     *
     * `page` is not decoration. Running content is per SECTION, and a document
     * whose page 5 changed orientation has more than one: resolving the body from
     * `sections.first()` meant every header command edited section 1 no matter
     * which page the user was on, so the edit landed on pages the user was not
     * looking at and the page they WERE looking at never changed (the
     * body-vs-surface defect class, docs/104 T-01).
     *
     * There is deliberately **no fall-back to `default`** when the page's variant
     * is absent. The layout does not fall back either — `HeaderFooter::select`
     * returns the switched-on variant even when it is empty, because ECMA-376
     * §17.10.6 says `w:titlePg` with no `first` reference "shall create a new
     * blank header" rather than show the odd-page one. Falling back here returned
     * the `default` body's position for a page that paints its `first` variant,
     * and that position has no geometry on that page: the context opened,
     * `data-running-edit` was set, and NO CARET PAINTED, so the near-universal
     * "no header on page 1" document had a header the user could not type in.
     * `None` is the honest answer, and it is what routes the host to
     * [`createRunningContent`](Self::create_running_content) — the "shall create"
     * half of the same spec sentence.
     * @param {string} region
     * @param {number} page
     * @returns {HitPayload | undefined}
     */
    runningContentCaret(region, page) {
        const ptr0 = passStringToWasm0(region, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_runningContentCaret(this.__wbg_ptr, ptr0, len0, page);
        return ret === 0 ? undefined : HitPayload.__wrap(ret);
    }
    /**
     * @param {number} page
     * @param {number} x_twip
     * @param {number} y_twip
     * @returns {RunningHitPayload | undefined}
     */
    runningHitTest(page, x_twip, y_twip) {
        const ret = wasm.wasmdocument_runningHitTest(this.__wbg_ptr, page, x_twip, y_twip);
        return ret === 0 ? undefined : RunningHitPayload.__wrap(ret);
    }
    /**
     * The Link to Previous state of one band on one page, as JSON
     * `{"section":2,"kind":"default","linked":true,"shown":true}`.
     *
     * `linked` is `null` on the first section's pages — there is no previous
     * section, which is the state ONLYOFFICE disables the control in
     * (`controller/HeaderFooterTab.js:247`) — and otherwise whether this
     * section declares the page's variant itself. `kind` is the variant the
     * page applies (first page, even page, or default), because linkage is per
     * variant (`docs/85` §8d Q7). `shown` says whether the band holds anything
     * visible, which is what Remove needs to be offered.
     *
     * O(sections).
     * @param {string} region
     * @param {number} page
     * @returns {string}
     */
    runningLinkState(region, page) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(region, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_runningLinkState(retptr, this.__wbg_ptr, ptr0, len0, page);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The caret nearest `(x, y)` inside `band` on `page`, snapping from any
     * point in the band — the resolution to use while that band is open, where
     * empty space still belongs to the header. `None` if the band has no
     * content on that page.
     * @param {number} page
     * @param {number} x_twip
     * @param {number} y_twip
     * @param {string} band
     * @returns {RunningHitPayload | undefined}
     */
    runningSnap(page, x_twip, y_twip, band) {
        const ptr0 = passStringToWasm0(band, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_runningSnap(this.__wbg_ptr, page, x_twip, y_twip, ptr0, len0);
        return ret === 0 ? undefined : RunningHitPayload.__wrap(ret);
    }
    /**
     * Whether the first page of the section owning `page` uses its own
     * header/footer, and whether even pages do, as JSON `{ firstPage, evenOdd }`
     * — the read side of Word's two running-content toggles (docs/85 Q6).
     *
     * `w:titlePg` is per SECTION, so the answer depends on which page the user is
     * on; `w:evenAndOddHeaders` is document-scoped, as OOXML carries it.
     * @param {number} page
     * @returns {string}
     */
    runningVariants(page) {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_runningVariants(retptr, this.__wbg_ptr, page);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Every text-bearing paragraph as JSON `[[node, text], …]`, in the order
     * `findText` scans them (every surface: body, headers, footers, notes,
     * text boxes). Offsets into `text` are UTF-8 bytes, the unit every
     * position in this API uses. O(document).
     * @returns {string}
     */
    searchableText() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_searchableText(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * EVERY section's page-layout properties — vertical alignment and page
     * numbering — plus the section holding `node` as the current one. `null` only
     * when the document has no section at all.
     *
     * Shaped like [`pageSetupSections`](Self::page_setup_sections) and not like
     * [`lineNumbering`](Self::line_numbering) on purpose. The surfaces that show
     * these carry a Section dropdown, so a caret-only answer would paint the
     * caret's alignment under a dropdown reading "Section 2" — the exact defect
     * (one section's values shown while another's are written) that made
     * `pageSetupSections` a list in the first place. Line numbering and the
     * watermark can be caret-only because their surfaces have no such dropdown.
     *
     * Each value comes back in its ABSENT form when the section does not carry it
     * (`verticalAlignment: null` = top, `pageNumberStart: null` = continue from
     * the previous section), so a host reflecting this never has to hold a second
     * idea of what a default is.
     *
     * O(document): resolving `node` to its section is a document walk
     * (`section_of`). Call it when a surface opens, not per frame.
     * @param {string} node
     * @returns {string}
     */
    sectionLayout(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_sectionLayout(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Effective uniform properties, with mixed values listed separately.
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @returns {string}
     */
    selectionCharacterFormat(sn, so, en, eo) {
        let deferred4_0;
        let deferred4_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_selectionCharacterFormat(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr3 = r0;
            var len3 = r1;
            if (r3) {
                ptr3 = 0; len3 = 0;
                throw takeObject(r2);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * A new document holding only the selection `[start, end)`, laid out and
     * ready for `printDocument`. The caller frees it after printing. The live
     * document is not changed.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @returns {WasmDocument}
     */
    selectionDocument(start_node, start_offset, end_node, end_offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_selectionDocument(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return WasmDocument.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the ordered start or end edge of a selection. Selection ordering
     * belongs to the engine because anchors in different paragraphs cannot be
     * compared correctly by the browser host.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {boolean} toward_end
     * @returns {Caret}
     */
    selectionEdge(start_node, start_offset, end_node, end_offset, toward_end) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_selectionEdge(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, toward_end);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Caret.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The uniform format state across a (possibly multi-paragraph) selection — a
     * toggle is `true` only when every covered run in every covered paragraph sets
     * it.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @returns {Format}
     */
    selectionFormat(start_node, start_offset, end_node, end_offset) {
        const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_selectionFormat(this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset);
        return Format.__wrap(ret);
    }
    /**
     * Reflects effective paragraph settings; flag states are 0 off, 1 on, 2 mixed.
     * Complexity: O(document + selected paragraphs), using one property index.
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @returns {string}
     */
    selectionParagraphAdvanced(sn, so, en, eo) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_selectionParagraphAdvanced(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred3_0 = r0;
            deferred3_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * Uniform paragraph properties over every paragraph touched by the model
     * selection. Each value has an explicit mixed flag; booleans use state
     * 0=off, 1=on, 2=mixed.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @returns {ParagraphState}
     */
    selectionParagraphState(start_node, start_offset, end_node, end_offset) {
        const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_selectionParagraphState(this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset);
        return ParagraphState.__wrap(ret);
    }
    /**
     * Highlight rectangles for a selection, flattened as `[page, x, y, w, h, …]`
     * (page-local twips), one 5-tuple per covered line-fragment. The range may
     * span nodes and pages and be given in either direction (a backward/upward
     * drag) — the endpoints are ordered in document order first.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @returns {Int32Array}
     */
    selectionRects(start_node, start_offset, end_node, end_offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_selectionRects(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v3 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The uniform effective run styling of the selection
     * (size/color/authored-font/vert-align) for reflecting the current values in
     * the toolbar. Blank/zero means mixed or unset.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @returns {RunStyle}
     */
    selectionRunStyle(start_node, start_offset, end_node, end_offset) {
        const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_selectionRunStyle(this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset);
        return RunStyle.__wrap(ret);
    }
    /**
     * Sets or updates the host-supplied review identity that `addComment`,
     * `replyToComment`, and the `suggest*` tracked-change calls fall back to
     * when their own `author`/`initials` arguments are omitted. This is the
     * explicit host identity seam described in docs/68 and docs/82: the
     * engine has no built-in concept of "current user," never reads DOM
     * state, and never invents an author — the host calls this once (or
     * again whenever its active user changes) instead.
     *
     * `name` is required and trimmed; passing an empty/whitespace-only name
     * clears the active identity, after which authoring calls must supply an
     * explicit `author` or fail their existing empty-author validation.
     * `initials` is used as given (trimmed) when non-empty, otherwise derived
     * from up to the first two words of `name`. `id` is an opaque,
     * host-defined stable identifier (for example for deterministic per-author
     * coloring); OpenDoc never serializes it into the document or interprets it.
     * @param {string} name
     * @param {string | null} [initials]
     * @param {string | null} [id]
     */
    setActiveAuthor(name, initials, id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(initials) ? 0 : passStringToWasm0(initials, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(id) ? 0 : passStringToWasm0(id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setActiveAuthor(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets paragraph alignment over every paragraph the selection touches:
     * `"start"`, `"center"`, `"end"`, or `"justify"`.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} align
     * @returns {EditResult}
     */
    setAlignment(start_node, start_offset, end_node, end_offset, align) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(align, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setAlignment(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Opts the active author in to `word/people.xml` presence info (`docs/175` §6.2): with a
     * provider and a user id, a saved DOCX names this author's `w15:person` with
     * `w15:presenceInfo w15:providerId w15:userId`, which is how Word itself links a signed-in
     * author to an account. Both empty, or either absent, opts out again.
     *
     * **Without this call no id of any kind enters a saved file** — the `68` §1 guarantee,
     * kept as the default. The host decides, because the file can leave the organisation.
     *
     * # Errors
     *
     * No active author to attach it to, or a value over its 255-byte bound (a refusal naming
     * the field, `identity-invalid`, never a truncation).
     * @param {string | null} [provider_id]
     * @param {string | null} [user_id]
     */
    setAuthorPersistence(provider_id, user_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = isLikeNone(provider_id) ? 0 : passStringToWasm0(provider_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(user_id) ? 0 : passStringToWasm0(user_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setAuthorPersistence(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Applies a border `edges` preset to EVERY cell in the range
     * `anchor_node`..`focus_node`, in one edit and one undo entry. The presets are
     * [`setCellBorder`](Self::set_cell_border)'s, and so is `style`.
     *
     * # Errors
     * When the range refuses (see [`tableCellRange`](Self::table_cell_range)), or when
     * `style` is not one of the six line styles.
     * @param {string} anchor_node
     * @param {string} focus_node
     * @param {string} edges
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} size_eighth_points
     * @param {string | null} [style]
     * @returns {EditResult}
     */
    setCellBorderRange(anchor_node, focus_node, edges, r, g, b, size_eighth_points, style) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(anchor_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(focus_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(edges, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(style) ? 0 : passStringToWasm0(style, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setCellBorderRange(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, r, g, b, size_eighth_points, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Applies a border `edges` preset to the cell containing `node`: `"none"`/`"box"`
     * clear-or-set the four cell edges; `"top"`/`"bottom"`/`"left"`/`"right"` toggle
     * one edge. Set edges use a line of `size_eighth_points` in the RGB, drawn in
     * `style`.
     *
     * `style` is one of `single`, `double`, `dotted`, `dashed`, `dotDash`, `dotDotDash` —
     * the six renderings `casual_doc_layout::flow` can actually draw apart (see
     * `border_style_token`). Omitting it means `single`, which is what this method did
     * before it took a style at all, so an existing host keeps working unchanged.
     *
     * # Errors
     * When the cell refuses, or when `style` is not one of the six.
     * @param {string} node
     * @param {string} edges
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} size_eighth_points
     * @param {string | null} [style]
     * @returns {EditResult}
     */
    setCellBorder(node, edges, r, g, b, size_eighth_points, style) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(edges, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(style) ? 0 : passStringToWasm0(style, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setCellBorder(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, r, g, b, size_eighth_points, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets or clears the background shading of EVERY cell in the range
     * `anchor_node`..`focus_node`, in one edit.
     *
     * This is the payoff of the cell range and the fix for `docs/109` HF-219:
     * select two cells, shade them, and both shade. Passing the same node twice
     * is a one-cell range, so this is a superset of
     * [`setCellShading`](Self::set_cell_shading).
     *
     * One action, therefore ONE undo entry for the whole block — not one per
     * cell.
     *
     * # Errors
     * When the range refuses (see [`tableCellRange`](Self::table_cell_range)).
     * @param {string} anchor_node
     * @param {string} focus_node
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {boolean} clear
     * @returns {EditResult}
     */
    setCellShadingRange(anchor_node, focus_node, r, g, b, clear) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(anchor_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(focus_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setCellShadingRange(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, r, g, b, clear);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets or clears the background shading fill of the cell containing `node`.
     * @param {string} node
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {boolean} clear
     * @returns {EditResult}
     */
    setCellShading(node, r, g, b, clear) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setCellShading(retptr, this.__wbg_ptr, ptr0, len0, r, g, b, clear);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the text direction (`horizontal`, `rotateDown`, `rotateUp`) of
     * every cell in the range between `anchor` and `focus` (`""` = the
     * anchor's cell), each merged cell once. One undoable step.
     *
     * # Errors
     * Not in a table, or an unknown direction.
     * @param {string} anchor
     * @param {string} focus
     * @param {string} direction
     * @returns {EditResult}
     */
    setCellTextDirection(anchor, focus, direction) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(anchor, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(focus, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(direction, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setCellTextDirection(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the vertical text alignment of EVERY cell in the range
     * `anchor_node`..`focus_node` (`"top"` | `"center"` | `"bottom"`), in one
     * edit and one undo entry.
     *
     * # Errors
     * When the range refuses (see [`tableCellRange`](Self::table_cell_range)).
     * @param {string} anchor_node
     * @param {string} focus_node
     * @param {string} align
     * @returns {EditResult}
     */
    setCellVerticalAlignRange(anchor_node, focus_node, align) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(anchor_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(focus_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(align, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setCellVerticalAlignRange(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the cell's vertical text alignment: `"top"` | `"center"` | `"bottom"`.
     * @param {string} node
     * @param {string} align
     * @returns {EditResult}
     */
    setCellVerticalAlign(node, align) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(align, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setCellVerticalAlign(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Apply an advanced character patch across paragraphs as one undo action.
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @param {string} json
     * @returns {EditResult}
     */
    setCharacterFormat(sn, so, en, eo, json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setCharacterFormat(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Writes the chart anchored at `node` from the data editor's payload, as one
     * undoable action.
     *
     * `patch` is a `ChartDataView`-shaped JSON object carrying `kind`, `title`,
     * `legend`, `series`, `labels` and `cells`. Every field is authoritative —
     * the grid names the whole chart, because "row 3 changed" cannot express a
     * deleted row — and everything the grid does not show is carried across from
     * the existing projection rather than reset.
     *
     * One `SetChartDefinition` in one transaction, which is what makes the whole
     * change one undo entry and puts it behind the protection, review-mode and
     * windowed-layout gates every other edit goes through.
     *
     * # Errors
     *
     * When `node` is not a chart object; when this chart's data may not be
     * authored (a partial projection or a combination chart — each with its own
     * sentence and code);
     * when a cell is not a number; when a name or the title is longer than the
     * model can hold; when the grid is empty or past the model's ceilings; or
     * when the family named is one this build does not paint.
     *
     * # Complexity
     *
     * O(charts) to find the projection, O(series × rows) to build the new one,
     * plus the one `validate` the operation pays. Independent of document size,
     * so typing in a cell does not walk the document (`docs/107` §4).
     * @param {string} node
     * @param {string} patch
     * @returns {EditResult}
     */
    setChartData(node, patch) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(patch, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setChartData(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Resolves or reopens an existing comment as one undoable review action.
     * @param {string} comment
     * @param {boolean} done
     * @returns {EditResult}
     */
    setCommentResolved(comment, done) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(comment, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setCommentResolved(retptr, this.__wbg_ptr, ptr0, len0, done);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Applies the properties dialog's `patch` (JSON: `title`, `tag`, `color`,
     * `temporary`, `lockControl`, `lockContent`, `placeholder`, `items`,
     * `dateFormat`, `role`) to the control `id`, as one undoable action. A
     * control without a `w:id` is given one, so a role can name it. The role
     * goes to the sidecar (`form_roles.rs`), not the document.
     *
     * # Errors
     * No such control, a value over its bound, list entries on a control that
     * has none, a date format on one that is not a date picker, or an unknown
     * role.
     * @param {string} id
     * @param {string} patch
     * @returns {EditResult}
     */
    setContentControlProperties(id, patch) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(patch, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setContentControlProperties(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the document-wide default tab interval in one undoable transaction.
     * Complexity: O(document) for relayout.
     * @param {string} node
     * @param {number} offset
     * @param {number} position_twips
     * @returns {EditResult}
     */
    setDefaultTabStop(node, offset, position_twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setDefaultTabStop(retptr, this.__wbg_ptr, ptr0, len0, offset, position_twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Replaces the document's core properties from a JSON object in the same
     * shape [`document_properties`](Self::document_properties) returns — an
     * absent/`null` field clears that property. One undoable action.
     * @param {string} properties_json
     * @returns {EditResult}
     */
    setDocumentProperties(properties_json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(properties_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setDocumentProperties(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Installs or lifts the document's editing restriction (Word's
     * Review ▸ Restrict Editing), as one undoable action — ADR-059.
     *
     * `edit` is `none`, `readOnly`, `comments`, `trackedChanges` or `forms`;
     * passing `null`/`undefined` removes `w:documentProtection` entirely, which is
     * Word's "Stop Protection". `enforcement` is Word's "Yes, Start Enforcing
     * Protection" and is ignored when `edit` is `null`.
     *
     * **This can always lift a restriction, including `readOnly`** — the operation
     * is exempt from the protection check for the reason
     * `casual_doc_edit::protection::refuse_if_protected` records: a batch is judged
     * on its worst operation, so without the exemption `readOnly` would be a
     * one-way door and the feature would be worse than not having it.
     *
     * **Who may do this: the local reader, and nobody else is checked.** There is
     * no participant grant yet (`152` §10 Q4), so any host that can open the
     * document can lift its restriction — which is exactly what Word does with an
     * **unpassworded** restriction. A password the file carries is kept and saved
     * but never asked for or verified: ADR-052 records that this is policy rather
     * than security, and verifying `w:hash`/`w:salt` would advertise a boundary
     * that does not exist (the legacy hash is removable by editing one XML
     * attribute). The value installed here carries NO verifier, so lifting or
     * changing a passworded restriction removes the password — what Word leaves
     * after its own Stop Protection — and Undo restores the old value, verifier
     * and all. `documentProtection().password` lets the host say so first.
     *
     * # Errors
     *
     * A refusal when `edit` is not one of the five tokens. O(1).
     * @param {string | null | undefined} edit
     * @param {boolean} enforcement
     * @param {boolean} formatting
     * @returns {EditResult}
     */
    setDocumentProtection(edit, enforcement, formatting) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = isLikeNone(edit) ? 0 : passStringToWasm0(edit, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setDocumentProtection(retptr, this.__wbg_ptr, ptr0, len0, enforcement, formatting);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Applies or removes a drop cap on the paragraph at `node` — Word's
     * Insert ▸ Drop Cap. One undoable action.
     *
     * `mode` is `"none"`, `"drop"` (in the text column) or `"margin"`. `lines` is
     * how many body lines the initial occupies (Word's range is 1..=10).
     *
     * Applying SPLITS the paragraph after its first character and frames the
     * leading half; removing JOINS the pair back together. That is what a drop cap
     * is in OOXML, and doing it any other way would produce a frame layout does
     * not recognise — `flow.rs` requires a framed paragraph of exactly one
     * character followed by another paragraph.
     * @param {string} node
     * @param {string} mode
     * @param {number} lines
     * @returns {EditResult}
     */
    setDropCap(node, mode, lines) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setDropCap(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, lines);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Resolves a page-local point inside a page's HEADER or FOOTER content, as
     * `{ node, offset, band }`, or `None` if the point is in neither band.
     *
     * Deliberately separate from [`hit_test`]: the body walk must keep
     * answering exactly as it does today — a click in the top margin still
     * snaps to the nearest body line — so entering a header stays a gesture the
     * host asks for rather than a side effect of clicking near the top of a
     * page. The host tries this first only when it means to (a double-click in
     * the margin band, or the header marker), and falls back to `hitTest`.
     *
     * The position it returns is an ordinary `NodeId` + offset, which the edit
     * ops already resolve wherever it lives (the surface resolution in
     * `casual-doc-edit`), so nothing downstream needs a sub-document address.
     *
     * [`hit_test`]: WasmDocument::hit_test
     * Declares the story the editor is in: `band` is `"header"`/`"footer"` with
     * the page whose copy is open, or `None` for the page body.
     *
     * Held once, as the editing context it is, rather than threaded through
     * every geometry call — where a single missed argument silently restores
     * the caret-on-the-wrong-page defect.
     * @param {string | null} [band]
     * @param {number | null} [page]
     */
    setEditContext(band, page) {
        var ptr0 = isLikeNone(band) ? 0 : passStringToWasm0(band, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.wasmdocument_setEditContext(this.__wbg_ptr, ptr0, len0, isLikeNone(page) ? Number.MAX_SAFE_INTEGER : (page) >>> 0);
    }
    /**
     * Turns distinct even/odd headers and footers on or off (Word's "Different
     * Odd & Even Pages"). Document-scoped, as OOXML carries it.
     * @param {boolean} enabled
     * @returns {EditResult}
     */
    setEvenOddVariant(enabled) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_setEvenOddVariant(retptr, this.__wbg_ptr, enabled);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the first-line indent (relative to the left indent) to `twips` — the
     * ruler's top marker drag. Positive is a first-line indent; negative becomes a
     * hanging indent (mutually exclusive, as in Word); zero clears both.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} twips
     * @returns {EditResult}
     */
    setFirstLineIndent(start_node, start_offset, end_node, end_offset, twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setFirstLineIndent(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Turns the distinct first-page header/footer on or off for the section that
     * owns `page` (Word's "Different First Page", which is per section — it used
     * to always flip the first section, so on a multi-section document the toggle
     * changed a page the user was not looking at).
     * @param {boolean} enabled
     * @param {number} page
     * @returns {EditResult}
     */
    setFirstPageVariant(enabled, page) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_setFirstPageVariant(retptr, this.__wbg_ptr, enabled, page);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Replace the whole fold set at once, from a JSON array of node ids,
     * returning the new fold state as JSON.
     *
     * The restore half of [`fold_state`](Self::fold_state): a host that has to
     * expand a document for a moment — printing and export are the ones that
     * must (`print.mjs`, `AGENTS.md`'s no-silent-data-loss rule) — reads the
     * set, unfolds, does its work, and hands the same array back here.
     *
     * It exists rather than leaving the host to loop over
     * [`set_fold`](Self::set_fold) because that loop costs ONE re-layout per
     * heading: a reader who collapsed two hundred headings would pay two
     * hundred `O(document)` passes to get them back, which is the
     * lookup-in-a-loop shape `docs/116` names, one level up. This is one pass.
     *
     * Ids that are not headings **any more**, or not in the document at all,
     * are skipped rather than refused: the only caller is restoring a set this
     * engine itself produced, and a refusal would land inside its `finally`
     * and strand the reader on an expanded document. What was actually set
     * comes back in the returned state, so a skip is observable rather than
     * silent. A malformed payload IS refused — that is a host bug, not a
     * document change.
     *
     * Complexity: one document walk to resolve the heading set, then one
     * re-layout. `O(document)`, once, for a gesture — not per id.
     *
     * # Errors
     *
     * The payload is not a JSON array of strings, or folding is unavailable
     * (a windowed body — [`fold_state`](Self::fold_state)'s `withheldReason`
     * says so).
     * @param {string} nodes_json
     * @returns {string}
     */
    setFoldSet(nodes_json) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(nodes_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setFoldSet(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * Fold or unfold the heading `node`, returning the new fold state as JSON.
     *
     * `node` must be a heading (a paragraph carrying `w:outlineLvl` or a
     * `Title`/`Heading N` style); anything else is refused by name rather than
     * silently ignored, because a host that asked to fold a body paragraph has a
     * defect and a no-op would hide it.
     *
     * Complexity: one full re-layout, which is `O(document)`. A fold is a
     * **gesture**, not an interaction — a host must run it the way it runs a
     * view change, and it is deliberately not on the keystroke path (`docs/107`
     * §4). Typing while folded stays `O(edit)`: the fold set is a generation
     * input to the galley cache, not a cache bypass.
     * @param {string} node
     * @param {boolean} collapsed
     * @returns {string}
     */
    setFold(node, collapsed) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setFold(retptr, this.__wbg_ptr, ptr0, len0, collapsed);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * Sets the font size over the selection, in **points**.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} points
     * @returns {EditResult}
     */
    setFontSize(start_node, start_offset, end_node, end_offset, points) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setFontSize(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, points);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the font family over the selection (`w:rFonts`).
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} family
     * @returns {EditResult}
     */
    setFont(start_node, start_offset, end_node, end_offset, family) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(family, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setFont(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Fills as `role` from now on, or as nobody in particular with `None`.
     *
     * # Errors
     * When `role` is not defined.
     * @param {string | null} [role]
     */
    setFormFillRole(role) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = isLikeNone(role) ? 0 : passStringToWasm0(role, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setFormFillRole(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Replaces the form-roles sidecar.
     *
     * # Errors
     * Malformed JSON, or what `FormRoles::validated` refuses.
     * @param {string} json
     */
    setFormRoles(json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setFormRoles(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Chooses which non-printing characters `renderPage` paints — Word's ¶
     * button and its *Display* options, ONLYOFFICE's `mniHiddenChars`.
     *
     * `patch` is a JSON object. Every key is optional and an omitted key is
     * **left as it was**, so the five individual toggles of Word's *Display*
     * pane and the one ¶ button are the same call:
     *
     * | key | meaning |
     * | --- | --- |
     * | `all` | all five marks at once — the ¶ button. Applied first, so `{"all":true,"space":false}` is "everything except the space dots" |
     * | `paragraph` | the pilcrow at each paragraph mark |
     * | `tab` | the arrow inside each tab's advance |
     * | `space` | the middle dot at each space |
     * | `lineBreak` | the return arrow at each hard line break |
     * | `pageBreak` | the rule at each page or column break |
     * | `color` | `"#rrggbb"` / `"#rrggbbaa"`, or `null` to take **the line's own ink** |
     *
     * `color: null` is the default and should normally stay that way: it is what
     * keeps a mark visible on a dark page, and it is the ONLYOFFICE defect this
     * deliberately does not reproduce — they hard-code black for the tab and
     * break marks, so those vanish in their dark theme.
     *
     * Returns the resulting state as JSON (the same shape
     * [`formatting_marks`](Self::formatting_marks) returns), so a host can bind
     * its toggles to what actually took effect rather than to what it asked for.
     *
     * # This is a repaint, never a repagination
     *
     * The flags reach `compose_page_with` and nothing else, and composition is
     * handed a page that is already laid out. So the marks move no line, no page
     * boundary and no caret. What the host must do to see the change is
     * therefore exactly what it does after any other view change: re-raster the
     * pages, keyed off the `revision` this bumps. Nothing needs re-measuring,
     * no page count changes, and `undo` is unaffected — no `Operation` is
     * issued and the document revision (`log.head()`) does not move.
     *
     * Idempotent: a patch that resolves to the state already held bumps no
     * revision, so a host may call it on every render.
     *
     * Complexity: O(1). The marks are collected while a page is composed, which
     * costs O(visible glyphs) when the space dots are on and O(visible lines)
     * otherwise — per page painted, never a function of document size.
     *
     * # Errors
     *
     * Throws, rather than silently ignoring the call, for JSON that is not an
     * object, an unknown key (a misspelled toggle is a dead control otherwise),
     * and a colour that is not `#rrggbb` or `#rrggbbaa`.
     * @param {string} patch
     * @returns {string}
     */
    setFormattingMarks(patch) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(patch, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setFormattingMarks(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * Sets the highlight over the selection to a named color (`"yellow"`,
     * `"green"`, … or `"none"` to clear).
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} name
     * @returns {EditResult}
     */
    setHighlight(start_node, start_offset, end_node, end_offset, name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setHighlight(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Creates or updates a hyperlink over a non-empty same-paragraph selection.
     * A target beginning with `#` is an internal bookmark anchor; all other
     * targets are retained as external URLs. Activation policy remains host-owned.
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @param {string} target
     * @param {string | null} [tooltip]
     * @returns {EditResult}
     */
    setHyperlink(node, start, end, target, tooltip) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(target, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(tooltip) ? 0 : passStringToWasm0(tooltip, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setHyperlink(retptr, this.__wbg_ptr, ptr0, len0, start, end, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets or clears the source-rectangle crop (`a:srcRect`) of the picture `node`
     * as one undoable action (`SetImageCrop`). `insets` is `[left, top, right,
     * bottom]`, each the fraction (0..=1) of that source edge to hide; `None` (or
     * an all-zero inset set) clears the crop so the whole source fills the box.
     * Out-of-range edges are clamped. Errors if `node` is not a croppable picture
     * (an inline or floating drawing) or `insets` is not exactly four values.
     * @param {string} node
     * @param {Float64Array | null} [insets]
     * @returns {EditResult}
     */
    setImageCrop(node, insets) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(insets) ? 0 : passArrayF64ToWasm0(insets, wasm.__wbindgen_export);
            var len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setImageCrop(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets "keep lines together" (`w:keepLines`) over the selection's paragraphs.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {boolean} on
     * @returns {EditResult}
     */
    setKeepLinesTogether(start_node, start_offset, end_node, end_offset, on) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setKeepLinesTogether(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, on);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets "keep with next" (`w:keepNext`) over the selection's paragraphs.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {boolean} on
     * @returns {EditResult}
     */
    setKeepWithNext(start_node, start_offset, end_node, end_offset, on) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setKeepWithNext(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, on);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Lays the body out as a **reflowed column** of `content_width_twip` instead
     * of on the document's paper, cutting the result into tiles
     * `tile_height_twip` tall with `gutter_twip` of padding on each side
     * (ADR-046, `docs/151`). `contentWidthTwip <= 0` returns to `Paged`.
     *
     * A phone cannot show a 6.5in text column at 390px and stay readable, and
     * the two alternatives are a ~31% zoom (which `view_zoom.mjs` already
     * computes and refuses) or a sideways pan. This is the third answer. Pass
     * `0` for `tileHeightTwip` to take the engine's default (11in).
     *
     * **It is a view, never an edit.** No `Operation` is issued, the revision is
     * not bumped, nothing reaches the export path, and the document's own
     * `w:sectPr` is untouched. `setPageSetup` would produce a similar picture
     * today and must not be used for this: it would pollute undo, dirty
     * autosave, and persist a 390px-wide "page" into the user's DOCX.
     *
     * Returns a JSON object: `{ "reflow": bool, "approximations": [string] }`.
     * The approximations are **reported, not hidden**, and they are derived from
     * **this document at this measure** rather than recited: a top-level table
     * wider than the reading column keeps its widths and scrolls sideways
     * (`docs/151` §6.3d), an image wider than it has been fitted to it
     * (`docs/166` R-1), a page- or
     * margin-anchored drawing keeps its paper-relative position (`docs/151` §8
     * item 1 is still open), a footnote lands at a tile bottom rather than a page
     * bottom, and a `PAGE`/`NUMPAGES` field prints a refusal because a tile index
     * is not a page number (`docs/151` §6.5). A document with none of these gets
     * an empty list, which is the point: the old fixed list told every reader
     * about footnotes whether or not the document had any.
     *
     * Complexity: `O(document)`. Entering or leaving reflow is a full re-shape —
     * the galley cache is width-scoped, so nothing in it survives a width change
     * — which makes this a **mode change, not an interaction**. A host must drive
     * it the way it drives an open (off the main thread where it can be,
     * cancellable, showing progress) and must never drive it straight off a
     * resize event: an un-quantised, un-debounced resize handler here is an
     * `O(document)` pass per animation frame on the slowest device we support
     * (`docs/151` §5).
     *
     * # Errors
     *
     * Throws, rather than silently doing nothing, for:
     *
     * - geometry that is not a reading column (a column under 1in or over 22in, a
     *   tile under 2in or over 33in, a gutter that is negative or wider than the
     *   column it pads). The bounds catch an unconverted CSS pixel value — 390
     *   twips is a quarter of an inch — and an inverted argument order, at the
     *   seam rather than in a layout nobody can read;
     * - a document laid out one page-window at a time. Reflow's defining promise
     *   is that the document stays EDITABLE in it, which is where we diverge from
     *   ONLYOFFICE's read-only reader mode — and a windowed body is already
     *   read-only (`apply_group` refuses every mutation on one). So reflow cannot
     *   keep its promise there, and `docs/151` §4.5 row 7's "make it a windowed
     *   variant" is answered as an honest refusal instead.
     * @param {number} content_width_twip
     * @param {number} tile_height_twip
     * @param {number} gutter_twip
     * @returns {string}
     */
    setLayoutView(content_width_twip, tile_height_twip, gutter_twip) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_setLayoutView(retptr, this.__wbg_ptr, content_width_twip, tile_height_twip, gutter_twip);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Sets the left (start) indent to an absolute `twips` (clamped ≥ 0) — the
     * ruler's left-indent marker drag.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} twips
     * @returns {EditResult}
     */
    setLeftIndent(start_node, start_offset, end_node, end_offset, twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setLeftIndent(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Installs a section's line numbering from a JSON object in the shape
     * [`line_numbering`](Self::line_numbering) returns — the menu's write side.
     * One undoable action.
     *
     * An all-null payload installs the EMPTY rule, which is how numbering is
     * turned off. `suppressed` is ignored here: it is a paragraph property and
     * has its own entry point, so one call never silently edits both scopes.
     * @param {string} line_numbering_json
     * @returns {EditResult}
     */
    setLineNumbering(line_numbering_json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(line_numbering_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setLineNumbering(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets a fixed line height in twips over the selection's paragraphs: `at_least`
     * true → `w:lineRule="atLeast"` (grows for tall content), false → `"exact"`
     * (clipped). Clears the `auto` percentage.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} twips
     * @param {boolean} at_least
     * @returns {EditResult}
     */
    setLineSpacingExact(start_node, start_offset, end_node, end_offset, twips, at_least) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setLineSpacingExact(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, twips, at_least);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets multiple line spacing (`w:lineRule="auto"`) as a percentage of single
     * (100 = single, 150 = 1.5×, 200 = double) over the selection's paragraphs. Per
     * the model, the `auto` rule leaves `line_rule` `None` and rides `line_percent`,
     * so exact/atLeast values are cleared.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} percent
     * @returns {EditResult}
     */
    setLineSpacing(start_node, start_offset, end_node, end_offset, percent) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setLineSpacing(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, percent);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the marker format of the caret paragraph's list — the bullet glyph
     * (for a bullet list) or the number format (for a numbered list) — matching
     * the picker in Word/Docs, as one undoable action. `spec` is a token from
     * [`list_format_at`](Self::list_format_at): `"bullet:<glyph>"` sets a bullet
     * list whose marker is `<glyph>`; a bare `ST_NumberFormat` token
     * (`"decimal"`, `"lowerLetter"`, `"upperLetter"`, `"lowerRoman"`,
     * `"upperRoman"`, `"decimalZero"`) sets a numbered list to that numeral
     * system.
     *
     * The change is scoped to the caret's list only: a fresh abstract definition
     * (cloned from the current one, with the caret level's `w:numFmt`/`w:lvlText`
     * retargeted) and a fresh instance are minted, and every paragraph in the
     * contiguous run that shares the caret's list instance is repointed at the
     * new instance — so other lists sharing the editor's reusable definition are
     * untouched. Only single-level marker formatting is handled here; authoring a
     * full multilevel list is a separate follow-up.
     *
     * Errors when the caret is not a list item, or when `spec` is empty or names
     * no supported format.
     * @param {string} node
     * @param {string} spec
     * @returns {EditResult}
     */
    setListFormat(node, spec) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(spec, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setListFormat(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Starts the caret item at `value`, retaining nested descendants in the same
     * list instance. One transaction; O(P) with a single paragraph index.
     * @param {string} node
     * @param {number} value
     * @returns {EditResult}
     */
    setListNumberingValue(node, value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setListNumberingValue(retptr, this.__wbg_ptr, ptr0, len0, value);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Authors a picture marker for the caret's list level. Media registration,
     * replacement definition and list references share one undoable transaction.
     * @param {string} node
     * @param {Uint8Array} bytes
     * @param {number} width_twips
     * @param {number} height_twips
     * @param {string} mime
     * @returns {EditResult}
     */
    setListPictureBullet(node, bytes, width_twips, height_twips, mime) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(mime, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setListPictureBullet(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, width_twips, height_twips, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Edits one list level's marker, indentation and suffix atomically. The
     * replacement definition preserves all other effective levels and overrides.
     * @param {string} node
     * @param {string} json
     * @returns {EditResult}
     */
    setListSettings(node, json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setListSettings(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Changes document-wide facing-page margins transactionally.
     * @param {boolean} enabled
     * @returns {EditResult}
     */
    setMirroredMargins(enabled) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_setMirroredMargins(retptr, this.__wbg_ptr, enabled);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Applies a nine-level gallery scheme to the caret's contiguous list as one
     * undoable action. The caret must already be a list item.
     * @param {string} node
     * @param {string} preset
     * @returns {EditResult}
     */
    setMultilevelList(node, preset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(preset, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setMultilevelList(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Footnote and Endnote dialog, Apply: `properties_json` (the model's
     * `NoteProperties`: `position`, `numberFormat`, `numberStart`,
     * `numberRestart`) for `kind`, written to the section holding `node`
     * (`scope` `"section"`) or to every section and the document default
     * (`"document"`), as one undoable step.
     *
     * # Errors
     *
     * An unknown kind or scope, malformed options, or a value the model refuses.
     * @param {string} kind
     * @param {string} node
     * @param {string} scope
     * @param {string} properties_json
     * @returns {EditResult}
     */
    setNoteSettings(kind, node, scope, properties_json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(kind, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(scope, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(properties_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len3 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setNoteSettings(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's "In line with text" versus every other wrap: converts the object
     * `node` between the run flow and the float layer, as one undoable action.
     *
     * `kind` is `"inline"` or `"floating"`. Making an object inline drops its
     * anchor and its stacking key — those describe a position the flow now
     * decides, so keeping them would be keeping a claim the document no longer
     * makes. Floating an inline object gives it Word's default for the
     * conversion: square wrap, at rest against its column and its paragraph.
     *
     * The conversion is real, not a flag: an inline picture is a `wp:inline`
     * and a floating one is a `wp:anchor`, two different nodes, so this
     * rewrites the node. Calling it for the kind the object already has is a
     * no-op that still reports success, so a host can bind it to a radio group
     * without tracking state.
     *
     * `wrap`, when given with `"floating"`, is the wrap the conversion lands
     * in — the host's wrap vocabulary (`square`, `tight`, `through`,
     * `topAndBottom`, `behind`, `front`) — in the SAME action. Choosing
     * "Tight" on an in-line picture is one gesture, so it is one undo step and
     * one damage set; as two calls (float, then wrap) the host repainted only
     * the second call's pages, and the text did not reflow until the picture
     * was dragged (`docs/109` OL-04). It applies to a conversion only: an
     * object that already floats takes `setObjectWrap`.
     *
     * # Errors
     *
     * When `node` is not a top-level object, `kind` is not one of the two
     * tokens, or `wrap` is not a wrap token.
     *
     * **O(document), ONE walk.**
     * @param {string} node
     * @param {string} kind
     * @param {string | null} [wrap]
     * @returns {EditResult}
     */
    setObjectAnchorKind(node, kind, wrap) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(kind, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(wrap) ? 0 : passStringToWasm0(wrap, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setObjectAnchorKind(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Moves a **floating** object to an absolute page position: `left_emu` /
     * `top_emu` are page-local EMU (the top-left of the object measured from the
     * page edge — a free drag positions relative to the page). Commits one
     * undoable `SetAnchor` (docs/85 §5.3): the anchor's position becomes
     * `page`-relative `posOffset`s while wrap, wrap distances, and z-order are
     * preserved. Errors if `node` is not a currently floating object. Object
     * geometry is untracked, so the host blocks this in Suggesting/Viewing mode.
     * @param {string} node
     * @param {number} left_emu
     * @param {number} top_emu
     * @returns {EditResult}
     */
    setObjectAnchorPosition(node, left_emu, top_emu) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setObjectAnchorPosition(retptr, this.__wbg_ptr, ptr0, len0, left_emu, top_emu);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string} node
     * @param {string | null} [descr]
     * @returns {EditResult}
     */
    setObjectDescr(node, descr) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(descr) ? 0 : passStringToWasm0(descr, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setObjectDescr(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Resizes an inline drawing / text box to `width_emu` × `height_emu`
     * (`wp:extent`, EMU) as one undoable action — the commit of a handle
     * drag-resize (docs/85 §5.3, `SetExtent`). A drag previews as host chrome and
     * commits exactly once here on release, so a resize is one undo step. Object
     * geometry has no tracked-revision representation, so the host blocks this in
     * Suggesting/Viewing mode before calling. Errors if `node` is not a resizable
     * inline object.
     * @param {string} node
     * @param {number} width_emu
     * @param {number} height_emu
     * @returns {EditResult}
     */
    setObjectExtent(node, width_emu, height_emu) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setObjectExtent(retptr, this.__wbg_ptr, ptr0, len0, width_emu, height_emu);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Flip Horizontal / Flip Vertical: mirrors the object `node` about
     * its own axes, as one undoable action.
     *
     * Both flags are absolute rather than toggles, so a host binds two
     * checkboxes to this and the engine never disagrees with what they show.
     *
     * # Errors
     *
     * When `node` is not an object whose model carries flips.
     *
     * **O(document), ONE walk.**
     * @param {string} node
     * @param {boolean} flip_h
     * @param {boolean} flip_v
     * @returns {EditResult}
     */
    setObjectFlip(node, flip_h, flip_v) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setObjectFlip(retptr, this.__wbg_ptr, ptr0, len0, flip_h, flip_v);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the object `node`'s position in the OOXML model, as one undoable
     * `SetAnchor` — the commit of Word's Layout ▸ Position dialog.
     *
     * `position` is the JSON [`object_position`](Self::object_position)
     * returns, with every field optional: an omitted field keeps what the
     * object already has, so a dialog that changes one control does not
     * restate (and thereby overwrite) the rest. An unknown key, an unknown
     * token, or an alignment and an offset on the same axis is an ERROR, not
     * a value quietly ignored.
     *
     * # Errors
     *
     * When `node` is not a floating object (an inline one has no anchor to
     * position — [`set_object_anchor_kind`](Self::set_object_anchor_kind)
     * floats it first), when the JSON does not parse, or when a token or a
     * magnitude is out of range.
     *
     * **O(document), ONE walk.**
     * @param {string} node
     * @param {string} position
     * @returns {EditResult}
     */
    setObjectPosition(node, position) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(position, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setObjectPosition(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Rotate: sets the object `node`'s clockwise rotation in degrees
     * about its own centre, as one undoable action. `None` clears it.
     *
     * Stored as OOXML's 60000ths of a degree and normalised into
     * `[0, 360)`, so a handle dragged round three times does not author a
     * rotation no other producer will read back the same way.
     *
     * # Errors
     *
     * When `node` is not an object whose model carries a rotation — which a
     * top-level text box's does not, so a host rotates one by grouping it
     * first. The refusal SAYS that rather than succeeding and doing nothing.
     *
     * **O(document), ONE walk.**
     * @param {string} node
     * @param {number | null} [degrees]
     * @returns {EditResult}
     */
    setObjectRotation(node, degrees) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setObjectRotation(retptr, this.__wbg_ptr, ptr0, len0, !isLikeNone(degrees), isLikeNone(degrees) ? 0 : degrees);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Changes a **floating** object's text-wrap mode (docs/85 §5.3), committing
     * one undoable `SetAnchor`. Accepts `"square"`, `"tight"`, `"through"`,
     * `"topAndBottom"`, `"behind"` (wrap-none behind the text), and `"front"`
     * (wrap-none over the text); everything else is ignored. Errors if `node` is
     * not a floating object. Blocked in Suggesting/Viewing mode by the host.
     * @param {string} node
     * @param {string} mode
     * @returns {EditResult}
     */
    setObjectWrap(node, mode) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setObjectWrap(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Arrange ▸ Bring Forward / Send Backward: restacks the object
     * `node` as one undoable action. `order` is `"front"`, `"back"`,
     * `"forward"` or `"backward"`.
     *
     * The mechanism depends on where the object sits, because OOXML stacks the
     * two cases differently and pretending otherwise would restack the wrong
     * thing. A **top-level** floating object is ordered by
     * `wp:anchor@relativeHeight` against the other floats in its own band —
     * `@behindDoc` decides whether an object is below or above the text layer,
     * and this orders WITHIN that band, so restacking never silently moves an
     * object through the text. A **group child** is ordered by its index among
     * its siblings, because a group paints its children in document order.
     *
     * Bringing to front assigns one more than the highest key in the band
     * rather than renumbering everything, so the action touches one object.
     *
     * # Errors
     *
     * When `node` is not a restackable object, or `order` is not one of the
     * four tokens.
     *
     * **O(document), ONE walk.**
     * @param {string} node
     * @param {string} order
     * @returns {EditResult}
     */
    setObjectZOrder(node, order) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(order, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setObjectZOrder(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Installs page borders on every section `sections` names, from
     * `{"sections": [ids], "borders": {…}}` in [`page_borders`](Self::page_borders)'s
     * shape — the dialog's Apply, to "This section" or "Whole document". ONE undoable
     * action however many sections it covers. An empty `borders` object removes
     * them.
     *
     * Rejected, with the document left exactly as it was, when an id names no
     * section or an edge falls outside the model's domain (an empty style token, a
     * width over 1024 eighth-points, a spacing over 31 points).
     * @param {string} payload_json
     * @returns {EditResult}
     */
    setPageBorders(payload_json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(payload_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setPageBorders(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets "page break before" (`w:pageBreakBefore`) over the selection's paragraphs.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {boolean} on
     * @returns {EditResult}
     */
    setPageBreakBefore(start_node, start_offset, end_node, end_offset, on) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setPageBreakBefore(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, on);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets a solid page background, or clears it with an empty string.
     * @param {string} color
     * @returns {EditResult}
     */
    setPageColor(color) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setPageColor(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Installs a new page-setup geometry from a JSON object in the shape
     * [`page_setup`](Self::page_setup) returns — the dialog's write side. One
     * undoable action.
     * @param {string} page_setup_json
     * @returns {EditResult}
     */
    setPageSetup(page_setup_json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(page_setup_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setPageSetup(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets border edges explicitly, including between-paragraph rules and padding.
     * Complexity: O(document + selected paragraphs).
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @param {string} edges
     * @param {string} style
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} size
     * @param {number} padding
     * @returns {EditResult}
     */
    setParagraphBorderAdvanced(sn, so, en, eo, edges, style, r, g, b, size, padding) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(edges, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(style, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len3 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setParagraphBorderAdvanced(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo, ptr2, len2, ptr3, len3, r, g, b, size, padding);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Applies a paragraph border `edges` preset over the selection: `"none"` clears
     * all four edges; `"box"` sets all four; `"top"`/`"bottom"`/`"left"`/`"right"`
     * toggle that single edge (start = left, end = right). Set edges use a single
     * line of `size_eighth_points` (eighth-points) in the given RGB.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} edges
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} size_eighth_points
     * @returns {EditResult}
     */
    setParagraphBorder(start_node, start_offset, end_node, end_offset, edges, r, g, b, size_eighth_points) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(edges, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setParagraphBorder(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2, r, g, b, size_eighth_points);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets spacing suppression between same-style paragraphs.
     * Complexity: O(document + selected paragraphs).
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @param {boolean} on
     * @returns {EditResult}
     */
    setParagraphContextualSpacing(sn, so, en, eo, on) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setParagraphContextualSpacing(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo, on);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets paragraph reading direction in one undoable selection transaction.
     * Complexity: O(document + selected paragraphs), through the shared property index.
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @param {boolean} rtl
     * @returns {EditResult}
     */
    setParagraphDirection(sn, so, en, eo, rtl) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setParagraphDirection(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo, rtl);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets outline level independently (0..8 headings; 9 body text).
     * Complexity: O(document + selected paragraphs).
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @param {number} level
     * @returns {EditResult}
     */
    setParagraphOutlineLevel(sn, so, en, eo, level) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setParagraphOutlineLevel(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo, level);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets widow control, same-style spacing and outline level (9 means body text).
     * Complexity: O(document + selected paragraphs).
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @param {boolean} widow
     * @param {boolean} contextual
     * @param {number} outline
     * @returns {EditResult}
     */
    setParagraphPagination(sn, so, en, eo, widow, contextual, outline) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setParagraphPagination(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo, widow, contextual, outline);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the paragraph background shading (`w:shd` fill) over the selection to
     * an RGB, or clears it when `clear` is true.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {boolean} clear
     * @returns {EditResult}
     */
    setParagraphShading(start_node, start_offset, end_node, end_offset, r, g, b, clear) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setParagraphShading(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, r, g, b, clear);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the paragraph style (`w:pStyle`) over the selection's paragraphs to the
     * style with the given name (e.g. `"Heading 1"`, `"Title"`, `"Normal"`), or
     * clears it when `style_name` is empty. Throws if no such paragraph style
     * exists in the document.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} style_name
     * @returns {EditResult}
     */
    setParagraphStyle(start_node, start_offset, end_node, end_offset, style_name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(style_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setParagraphStyle(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Scopes paragraph-formatting tracking to the commands that follow, until it
     * is cleared: `enabled` with the change's `date` while Suggesting, then
     * `false`. The host wraps ONE command in set/clear (docs/108 phase 2), so the
     * flag cannot leak into Editing mode or into a review decision.
     * @param {boolean} enabled
     * @param {string | null} [date]
     */
    setParagraphTracking(enabled, date) {
        var ptr0 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.wasmdocument_setParagraphTracking(this.__wbg_ptr, enabled, ptr0, len0);
    }
    /**
     * Sets widow/orphan control without changing other paragraph properties.
     * Complexity: O(document + selected paragraphs).
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @param {boolean} on
     * @returns {EditResult}
     */
    setParagraphWidowControl(sn, so, en, eo, on) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setParagraphWidowControl(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo, on);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Scrolls over-wide table `table` (on tile `index`, or any tile it spans)
     * sideways to `offsetTwip`, and returns the offset applied — clamped to the
     * table's range — or `-1` when there is no such over-wide table there.
     *
     * **A view, never an edit**, like `setLayoutView`: no `Operation`, no
     * revision, nothing on the export path. The offset is written onto the
     * placed rows themselves, so the raster, `hitTest`, the caret and every
     * selection rectangle agree about which column is where without one of them
     * having to remember to ask (`casual_doc_layout::reflow_scroll`). It is
     * remembered across a relayout — typing, a width step, a font arriving — and
     * forgotten on leaving reflow.
     *
     * Complexity: `O(rows of the table)`. A scroll gesture is an interaction and
     * must not cost the document (`docs/107` §4); this never walks it.
     * @param {number} index
     * @param {string} table
     * @param {number} offset_twip
     * @returns {number}
     */
    setReflowTableScroll(index, table, offset_twip) {
        const ptr0 = passStringToWasm0(table, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_setReflowTableScroll(this.__wbg_ptr, index, ptr0, len0, offset_twip);
        return ret;
    }
    /**
     * Sets the right (end) indent to an absolute `twips` (clamped ≥ 0) — the ruler's
     * right-indent marker drag.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} twips
     * @returns {EditResult}
     */
    setRightIndent(start_node, start_offset, end_node, end_offset, twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setRightIndent(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Links the band `region` on `page` to the previous section's, or unlinks
     * it (Word's and ONLYOFFICE's "Link to previous"), as one undoable action.
     *
     * Unlinking copies the band the page was showing into the section — every
     * inline kind, the page number and the logo included, with fresh ids
     * (`docs/129` §2) — so nothing on the page changes until the user edits it,
     * and then only this section changes. `(node, offset)` is the caret; when it
     * was in the band, the result's caret is the same place in the band the page
     * shows afterwards. Asking for the state the band is already in is reported
     * UNCHANGED (same revision, nothing on the undo stack).
     *
     * The result's `pasteLoss` names any marker family the copy could not carry
     * (a bookmark or a comment anchor cannot exist twice in one document).
     *
     * # Errors
     * On the first section's pages (nothing to link to), an unknown region, or
     * a refusal from the choke point.
     * @param {string} region
     * @param {number} page
     * @param {boolean} linked
     * @param {string} node
     * @param {number} offset
     * @returns {EditResult}
     */
    setRunningLinked(region, page, linked, node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(region, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setRunningLinked(retptr, this.__wbg_ptr, ptr0, len0, page, linked, ptr1, len1, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Installs a section's vertical alignment and page numbering from a JSON
     * object in the shape [`section_layout`](Self::section_layout) returns.
     * ONE undoable action covering both, because they are one dialog's Apply and
     * two history entries would make the user press undo twice to reverse one
     * press of one button.
     *
     * Each field's ABSENT form clears the corresponding property rather than
     * leaving it alone, which is what makes this a write of the whole payload
     * and not a patch: `verticalAlignment: null` removes `w:vAlign` (top), and a
     * null format with a null start removes `w:pgNumType`. A caller therefore
     * sends back what it read, with the fields it changed replaced — the same
     * contract [`set_watermark`](Self::set_watermark) and
     * [`set_line_numbering`](Self::set_line_numbering) already have.
     *
     * Rejected, with the document left exactly as it was, if `pageNumberStart`
     * falls outside the model's domain.
     * @param {string} section_layout_json
     * @returns {EditResult}
     */
    setSectionLayout(section_layout_json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(section_layout_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setSectionLayout(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Edit Points, written: replaces the shape's geometry with the edited
     * commands (the JSON [`shape_edit_points`](Self::shape_edit_points) returns,
     * points moved) as one undoable action.
     *
     * Throws on a malformed or unbounded payload (`shape.points-invalid`) or a
     * shape that cannot be found.
     * @param {string} shape
     * @param {string} points_json
     * @returns {EditResult}
     */
    setShapeEditPoints(shape, points_json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(shape, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(points_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setShapeEditPoints(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Shape Fill: sets a shape's fill to a solid colour, or clears it.
     * `rgba` is `#rrggbb`; `None` removes the fill.
     * @param {string} shape
     * @param {string | null} [rgba]
     * @returns {EditResult}
     */
    setShapeFill(shape, rgba) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(shape, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(rgba) ? 0 : passStringToWasm0(rgba, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setShapeFill(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Shape Fill ▸ Gradient: fills a shape with a two-stop gradient from
     * `from` to `to` (`#rrggbb`), linear along `angle_degrees` clockwise from
     * the positive x-axis, or radial from the centre when it is omitted — one
     * undoable action (`docs/109` RM-30).
     *
     * # Errors
     *
     * A malformed colour, or a `shape` that is not a shape (a picture has no
     * fill to set).
     * @param {string} shape
     * @param {string} from
     * @param {string} to
     * @param {number | null} [angle_degrees]
     * @returns {EditResult}
     */
    setShapeGradient(shape, from, to, angle_degrees) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(shape, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(from, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(to, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setShapeGradient(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, !isLikeNone(angle_degrees), isLikeNone(angle_degrees) ? 0 : angle_degrees);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Shape Outline ▸ Dashes and ▸ Arrows, and ONLYOFFICE's line type and
     * begin / end arrow styles: sets the dash pattern and the two line ends of
     * a shape's outline or a picture's border, as one undoable action that keeps
     * the colour and the weight (`docs/109` RM-30).
     *
     * `dash` is a `DashStyle` token (`dot`, `dash`, `largeDash`, `dashDot`,
     * `largeDashDot`, `largeDashDotDot`, `systemDash`, `systemDot`, …) or
     * `solid` to clear the pattern; `head_end` / `tail_end` are a
     * `LineEndKind` token (`triangle`, `stealth`, `diamond`, `oval`, `arrow`)
     * or `none`. An omitted argument keeps what the outline has.
     *
     * # Errors
     *
     * An unknown token, or a `shape` that is not a shape or a picture.
     * @param {string} shape
     * @param {string | null} [dash]
     * @param {string | null} [head_end]
     * @param {string | null} [tail_end]
     * @returns {EditResult}
     */
    setShapeOutlineStyle(shape, dash, head_end, tail_end) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(shape, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(dash) ? 0 : passStringToWasm0(dash, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(head_end) ? 0 : passStringToWasm0(head_end, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(tail_end) ? 0 : passStringToWasm0(tail_end, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setShapeOutlineStyle(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Shape Outline: sets a shape's outline colour and width (EMU), or
     * clears the outline entirely with `rgba = None`.
     *
     * Whatever the caller leaves out is INHERITED from the outline the shape
     * already has — colour, width, and equally the dash pattern and the
     * head/tail line ends, which no control exposes yet. Rebuilding the stroke
     * from scratch would silently straighten a dashed callout's leader the
     * moment someone recoloured it.
     * @param {string} shape
     * @param {string | null} [rgba]
     * @param {number | null} [width_emu]
     * @returns {EditResult}
     */
    setShapeOutline(shape, rgba, width_emu) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(shape, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(rgba) ? 0 : passStringToWasm0(rgba, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setShapeOutline(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, !isLikeNone(width_emu), isLikeNone(width_emu) ? 0 : width_emu);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Shape Effects ▸ Shadow: sets (`options` is the JSON
     * [`shape_shadow`](Self::shape_shadow) reads, every field optional) or
     * removes (`options` omitted or `"null"`) the outer shadow of the shape or
     * text box `node`, as ONE undoable action.
     *
     * # Errors
     *
     * When `node` is not a shape or a text box, the JSON does not parse, or a
     * value is out of Word's range.
     * @param {string} node
     * @param {string | null} [options]
     * @returns {EditResult}
     */
    setShapeShadow(node, options) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(options) ? 0 : passStringToWasm0(options, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setShapeShadow(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Toggles the read-only "show changes" markup view (docs/93). When on, a
     * separate markup layout is built (struck deletions, author-colored/
     * underlined insertions, highlighted comment ranges) and `renderPage` /
     * `pageCount` render from it; caret/selection/hit-test always use the editing
     * layout, so this is a pure read-only preview. Toggling off drops it. Idempotent.
     *
     * # Errors
     *
     * Throws for a document laid out one window at a time: the markup view is
     * a **second** whole-document layout, which is the peak `docs/113` §6.4
     * measured at 4.14 GiB on the owner's file. Silently leaving the preview
     * off would be worse — the host's toggle would read "on" while nothing on
     * screen had changed.
     * @param {boolean} on
     */
    setShowChanges(on) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_setShowChanges(retptr, this.__wbg_ptr, on);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets space after the paragraph (`w:spacing w:after`) in twips over the
     * selection; a negative value clears it. Setting an explicit value also turns
     * off `afterAutospacing`.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} twips
     * @returns {EditResult}
     */
    setSpaceAfter(start_node, start_offset, end_node, end_offset, twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setSpaceAfter(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets space before the paragraph (`w:spacing w:before`) in twips over the
     * selection; a negative value clears it (back to the style default). Setting an
     * explicit value also turns off `beforeAutospacing`.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} twips
     * @returns {EditResult}
     */
    setSpaceBefore(start_node, start_offset, end_node, end_offset, twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setSpaceBefore(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the following-paragraph style in one undoable registry transaction.
     * @param {string} name
     * @param {string} next_name
     * @returns {EditResult}
     */
    setStyleNext(name, next_name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(next_name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setStyleNext(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Takes the selection's paragraphs out of the line count, or puts them back
     * (`w:suppressLineNumbers`) — Word's "Suppress for Current Paragraph".
     *
     * Suppression removes a paragraph from the COUNT, not just from the display:
     * a pleading's caption block must not shift every numbered line below it.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {boolean} on
     * @returns {EditResult}
     */
    setSuppressLineNumbers(start_node, start_offset, end_node, end_offset, on) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setSuppressLineNumbers(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, on);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets a tab stop and its leader (0 none, 1 dot, 2 hyphen, 3 underscore,
     * 4 middle dot, 5 heavy). Complexity: O(document + selected tab stops).
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @param {number} position
     * @param {number} alignment
     * @param {number} leader
     * @returns {EditResult}
     */
    setTabStopWithLeader(sn, so, en, eo, position, alignment, leader) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTabStopWithLeader(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo, position, alignment, leader);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Adds or replaces a tab stop at `position_twips` (from the leading margin) with
     * alignment `align_code` (0 start, 1 center, 2 end, 3 decimal) over the
     * selection's paragraphs. Any existing stop at the same position is replaced;
     * stops stay sorted by position.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} position_twips
     * @param {number} align_code
     * @returns {EditResult}
     */
    setTabStop(start_node, start_offset, end_node, end_offset, position_twips, align_code) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTabStop(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, position_twips, align_code);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the table's horizontal alignment on the page: `"left"`/`"center"`/
     * `"right"` (the table containing `node`).
     * @param {string} node
     * @param {string} align
     * @returns {EditResult}
     */
    setTableAlignment(node, align) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(align, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTableAlignment(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Applies a border `edges` preset to the whole table containing `node`:
     * `"none"` clears all; `"box"` sets the four outer edges; `"all"` sets outer +
     * inside gridlines; `"top"`/`"bottom"`/`"left"`/`"right"` toggle one outer edge.
     * `style` is [`setCellBorder`](Self::set_cell_border)'s.
     *
     * # Errors
     * When `node` is not in a table, or when `style` is not one of the six line styles.
     * @param {string} node
     * @param {string} edges
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} size_eighth_points
     * @param {string | null} [style]
     * @returns {EditResult}
     */
    setTableBorder(node, edges, r, g, b, size_eighth_points, style) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(edges, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(style) ? 0 : passStringToWasm0(style, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTableBorder(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, r, g, b, size_eighth_points, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets uniform default cell margins on the active table; a negative value
     * clears the table-level default margins.
     * @param {string} node
     * @param {number} margin_twips
     * @returns {EditResult}
     */
    setTableCellMargins(node, margin_twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTableCellMargins(retptr, this.__wbg_ptr, ptr0, len0, margin_twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets default cell spacing on the active table; a negative value clears it.
     * @param {string} node
     * @param {number} spacing_twips
     * @returns {EditResult}
     */
    setTableCellSpacing(node, spacing_twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTableCellSpacing(retptr, this.__wbg_ptr, ptr0, len0, spacing_twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets a specific regular-table column's preferred width in twips.
     * @param {string} node
     * @param {number} column
     * @param {number} width_twips
     * @returns {EditResult}
     */
    setTableColumnWidthAt(node, column, width_twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTableColumnWidthAt(retptr, this.__wbg_ptr, ptr0, len0, column, width_twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the active regular table column's preferred width in twips. Updates
     * the shared grid and each cell in that visual column so DOCX round-tripping
     * and layout stay in agreement.
     * @param {string} node
     * @param {number} width_twips
     * @returns {EditResult}
     */
    setTableColumnWidth(node, width_twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTableColumnWidth(retptr, this.__wbg_ptr, ptr0, len0, width_twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Switches table layout between fixed-width and AutoFit-style behavior.
     * @param {string} node
     * @param {boolean} fixed
     * @returns {EditResult}
     */
    setTableFixedLayout(node, fixed) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTableFixedLayout(retptr, this.__wbg_ptr, ptr0, len0, fixed);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Changes the table's text wrapping and position (`w:tblpPr`,
     * `w:tblOverlap`) in one undoable step. `patch` is JSON with any of
     * [`tableFloatPosition`](Self::table_float_position)'s fields; a field not
     * named is left as it is. `wrap: "none"` removes the positioning.
     *
     * # Errors
     * When the settings are malformed, the table cannot float (it is nested),
     * or nothing would change.
     * @param {string} node
     * @param {string} patch
     * @returns {EditResult}
     */
    setTableFloatPosition(node, patch) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(patch, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTableFloatPosition(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets or clears the current row's repeat-header flag.
     * @param {string} node
     * @param {boolean} enabled
     * @returns {EditResult}
     */
    setTableHeaderRow(node, enabled) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTableHeaderRow(retptr, this.__wbg_ptr, ptr0, len0, enabled);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the table leading indent in twips.
     * @param {string} node
     * @param {number} indent_twips
     * @returns {EditResult}
     */
    setTableIndent(node, indent_twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTableIndent(retptr, this.__wbg_ptr, ptr0, len0, indent_twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Turns one table style option (`w:tblLook`) on or off for the table
     * holding `node`. One undoable step.
     *
     * # Errors
     * Not in a table, or an unknown option name.
     * @param {string} node
     * @param {string} option
     * @param {boolean} on
     * @returns {EditResult}
     */
    setTableLookOption(node, option, on) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(option, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTableLookOption(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, on);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the active row height: `"auto"` clears the explicit value,
     * `"atLeast"` stores a minimum, and `"exact"` stores an exact height.
     * @param {string} node
     * @param {number} height_twips
     * @param {string} rule
     * @returns {EditResult}
     */
    setTableRowHeight(node, height_twips, rule) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(rule, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTableRowHeight(retptr, this.__wbg_ptr, ptr0, len0, height_twips, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the table's preferred width in twips, or clears it when negative.
     * @param {string} node
     * @param {number} width_twips
     * @returns {EditResult}
     */
    setTableWidth(node, width_twips) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTableWidth(retptr, this.__wbg_ptr, ptr0, len0, width_twips);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Replaces a text box's complete body-property record in one undoable edit.
     * @param {string} node
     * @param {string} properties
     * @returns {EditResult}
     */
    setTextBoxBodyProperties(node, properties) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(properties, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTextBoxBodyProperties(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the text color over the selection to an explicit RGB.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @returns {EditResult}
     */
    setTextColor(start_node, start_offset, end_node, end_offset, r, g, b) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTextColor(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, r, g, b);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets direct RTL run formatting over a text selection. Complexity: O(selected text).
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @param {boolean} rtl
     * @returns {EditResult}
     */
    setTextDirection(sn, so, en, eo, rtl) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTextDirection(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo, rtl);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Turns the document's Track Changes setting on or off as one undoable edit
     * (`SetTrackRevisions`), so a save writes it and a reopen honours it. The
     * host calls it when the reader switches between Editing and Suggesting.
     *
     * `(node, offset)` is the caret to keep: a setting has no place in the text,
     * and moving the reader's caret because they changed mode would be a defect.
     * A request for the value the document already has is reported UNCHANGED —
     * same revision, nothing on the undo stack — rather than as an empty edit.
     *
     * # Errors
     *
     * A refusal when the choke point refuses the operation — a `trackedChanges`
     * restriction locks Track Changes, as Word does — or `node` is not an id.
     * @param {boolean} enabled
     * @param {string} node
     * @param {number} offset
     * @returns {EditResult}
     */
    setTrackRevisions(enabled, node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setTrackRevisions(retptr, this.__wbg_ptr, enabled, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets an explicit underline RGB color over the selection. Empty/`"auto"`
     * clears the direct color so the underline follows the text color. Choosing
     * an explicit color also turns underline on.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} color
     * @returns {EditResult}
     */
    setUnderlineColor(start_node, start_offset, end_node, end_offset, color) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setUnderlineColor(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the underline line style over the selection. `"none"` removes the
     * underline and its direct style/color; the remaining canonical tokens turn
     * underline on. `"single"` clears the direct style because a single line is
     * the model default.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} style
     * @returns {EditResult}
     */
    setUnderlineStyle(start_node, start_offset, end_node, end_offset, style) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(style, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setUnderlineStyle(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Sets the baseline alignment over the selection: `"super"`, `"sub"`, or
     * `"baseline"`.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} which
     * @returns {EditResult}
     */
    setVertAlign(start_node, start_offset, end_node, end_offset, which) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(which, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setVertAlign(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Installs, replaces, or removes a section's watermark — the dialog's write
     * side. One undoable action.
     *
     * `kind: "none"` removes it. An empty or over-long text, or a picture naming
     * media the document does not hold, is refused by the engine and the section
     * is left exactly as it was.
     * @param {string} watermark_json
     * @returns {EditResult}
     */
    setWatermark(watermark_json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(watermark_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_setWatermark(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Word's Edit Points, read: the shape's geometry as literal commands in its
     * own EMU box, as JSON (`{widthEmu, heightEmu, flipH, flipV, rotation,
     * paths: [{fill, stroke, commands: [{type, points}]}]}`). A preset is
     * converted at its current size and adjust values.
     *
     * Throws when `shape` is not a shape, or its geometry has no answer at its
     * size (`shape.points-unavailable`).
     * @param {string} shape
     * @returns {string}
     */
    shapeEditPoints(shape) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(shape, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_shapeEditPoints(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * The selected shape's current fill and outline, so the host reflects what
     * the shape HAS rather than what was last applied: `{fill, outline,
     * outlineWidthEmu}`, each `#rrggbb` or null. A gradient reports its flat
     * color — the picker applies solids, and reporting null would read as "no
     * fill" on a shape that plainly has one. `null` if `shape` is not a shape.
     * @param {string} shape
     * @returns {ShapeFormat | undefined}
     */
    shapeFormat(shape) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(shape, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_shapeFormat(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return r0 === 0 ? undefined : ShapeFormat.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The shadow of the shape or text box `node`, as
     * `{"shadow":{"color":"#000000","transparency":0.6,"angle":45,"distancePt":3,"blurPt":4}}`,
     * or `{"shadow":null}` when it has none. An empty string when `node` is
     * not a shape or a text box, so a host can tell "no shadow" from "cannot
     * have one" and disable the control with a reason.
     *
     * **O(document)**, one walk.
     * @param {string} node
     * @returns {string}
     */
    shapeShadow(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_shapeShadow(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Turns THIS handle — which must be a throwaway copy — into Word's Original
     * view: every tracked change rejected, any editing restriction lifted
     * first. Returns whether there was anything to reject.
     *
     * # Errors
     *
     * When Reject All itself refuses (an incomplete tracked move), with its
     * sentence; the host then stays on the live document and says why.
     * @returns {boolean}
     */
    showAsOriginal() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_showAsOriginal(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return r0 !== 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Paints a FINISHED comparison into this document as a read-only redline
     * (**ADR-065**) and returns a JSON summary (see `ComparisonView`).
     *
     * This handle must be a throwaway copy holding exactly `comparison`'s newer
     * side — opened by the host from the same bytes for this purpose. Every
     * change becomes a tracked change authored to `author`/`date`: an insertion
     * or a move's destination is marked where it is, removed text inside a
     * paragraph is put back struck at its offset, and a whole paragraph that is
     * gone — deleted, or moved away from here — is put back struck at the
     * position it had. Formatting, table-structure, section and definition
     * differences have no mark and are reported as `unmarked`, with their
     * paragraphs in `anchors` so a host can still take the reader there.
     *
     * Unlike `applyDiffAsRevisions` it does **not** refuse a document that
     * already carries tracked changes: nothing here is ever decided, so a
     * version's own suggestions and the comparison's marks cannot decide each
     * other, and a reader of a version with suggestions in it is exactly who
     * should see both.
     *
     * Complexity: **O(document)** once, for the digest that proves this is the
     * comparison's newer side, plus O(changes + the paragraphs they touch).
     * Called once per view, never per interaction.
     *
     * # Errors
     *
     * Throws when the comparison has not finished, when this document is not
     * its newer side, or when the author name is missing or too long.
     * @param {WasmVersionDiff} comparison
     * @param {string} author
     * @param {string | null} [date]
     * @returns {string}
     */
    showComparison(comparison, author, date) {
        let deferred4_0;
        let deferred4_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(comparison, WasmVersionDiff);
            const ptr0 = passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_showComparison(retptr, this.__wbg_ptr, comparison.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr3 = r0;
            var len3 = r1;
            if (r3) {
                ptr3 = 0; len3 = 0;
                throw takeObject(r2);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * Whether the read-only markup view is currently shown.
     * @returns {boolean}
     */
    get showingChanges() {
        const ret = wasm.wasmdocument_showingChanges(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Sorts regular-table rows by a chosen column's plain text as one undoable
     * edit. `column` is a 0-based column index; a negative value sorts by the
     * caret's own column. Out-of-range indices clamp to the last column.
     * @param {string} node
     * @param {string} direction
     * @param {number} column
     * @returns {EditResult}
     */
    sortTable(node, direction, column) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(direction, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_sortTable(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, column);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the stable format identifier detected for the open source.
     * @returns {string}
     */
    get sourceFormat() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_sourceFormat(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Splits the active merged cell in the current regularized merged table back
     * into normal cells. The top-left cell keeps the merged content; recreated
     * cells are empty but valid.
     *
     * `0, 0` UNMERGES (`docs/171`): from any row of the merged cell, not only
     * its top-left — a merged cell is one cell to the reader wherever the caret
     * sits in it — through `casual_doc_edit::table_structure::unmerge`. Other
     * counts split the cell the caret's merged cell anchors into a grid.
     * @param {string} node
     * @param {number | null} [requested_rows]
     * @param {number | null} [requested_columns]
     * @returns {EditResult}
     */
    splitMergedCell(node, requested_rows, requested_columns) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_splitMergedCell(retptr, this.__wbg_ptr, ptr0, len0, isLikeNone(requested_rows) ? Number.MAX_SAFE_INTEGER : (requested_rows) >>> 0, isLikeNone(requested_columns) ? Number.MAX_SAFE_INTEGER : (requested_columns) >>> 0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Splits the paragraph at the caret into two (Enter). The caret lands at the
     * start of the new trailing paragraph.
     * @param {string} node
     * @param {number} offset
     * @returns {EditResult}
     */
    splitParagraph(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_splitParagraph(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Splits the table holding `node` so the caret's row starts a second
     * table (Word's Split Table, Ctrl/Cmd+Shift+Enter); in the first row, an
     * empty paragraph goes above the table instead. The caret goes to the
     * paragraph between, as Word's does. One undoable step.
     *
     * # Errors
     * Not in a body table.
     * @param {string} node
     * @returns {EditResult}
     */
    splitTable(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_splitTable(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Every caption whose `SEQ` field **shows** a number that disagrees with the
     * number the document would resolve now, as `"{node}\t{shown}\t{correct}"`.
     *
     * # Dirty, not silently stale — and why this exists at all
     *
     * Word caches a field's result and leaves it stale until the reader presses
     * F9; nothing in the document says it is stale, and nothing in the UI says so
     * either. We diverge deliberately: inserting a caption renumbers what follows
     * in the same undoable action, so this engine never *creates* staleness. But
     * two things still produce it and neither is ours to prevent:
     *
     * 1. a caption paragraph deleted with Backspace, which is ordinary text
     *    editing and must not trigger a document-wide renumber (that would make a
     *    keystroke O(document) — see
     *    `a_keystroke_costs_a_bounded_number_of_document_scans`);
     * 2. a document another producer wrote, which arrives with whatever its last
     *    reader cached.
     *
     * So the answer is not "always correct" and not "silently wrong": it is
     * **reportable**. This is the read a host uses to say so, and
     * [`updateCaptionNumbers`](Self::update_caption_numbers) is how a reader fixes
     * it. An empty result means every caption shows the right number.
     *
     * **O(document), ONE walk.**
     * @returns {string[]}
     */
    staleCaptionNumbers() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_staleCaptionNumbers(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The first (`toward_end = false`) or last caret position of the story
     * `node` is in — a header's own end while that header is open for editing,
     * a note's end while the caret is in the note. The host asks this only for
     * an OPEN story; the document's edges are `firstPosition`/`lastPosition`,
     * which are always the body's. An unknown node answers the body's edge.
     * @param {string} node
     * @param {boolean} toward_end
     * @returns {Caret}
     */
    storyEdge(node, toward_end) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_storyEdge(this.__wbg_ptr, ptr0, len0, toward_end);
        return Caret.__wrap(ret);
    }
    /**
     * Which story `node` belongs to: `"body"`, `"header"`, `"footer"`,
     * `"footnote"`, `"endnote"` or `"textBox"`, or `""` for a node that is no
     * paragraph. The host uses it to keep navigation in the body unless a
     * header or footer is deliberately open.
     * @param {string} node
     * @returns {string}
     */
    storyKind(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_storyKind(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Name of the following-paragraph style; empty means keep this style.
     * @param {string} name
     * @returns {string}
     */
    styleNext(name) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_styleNext(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The resolved visual preview of paragraph style `name` — the font family,
     * size, weight, slant, underline, text color, alignment, and paragraph
     * spacing a paragraph carrying *only* that style would render with. Powers the Styles gallery,
     * where each card is drawn in its own style (Word's Styles gallery). Returns
     * a default (empty family, zero size) when the style is unknown, so the
     * gallery degrades gracefully instead of throwing.
     * @param {string} name
     * @returns {StylePreview}
     */
    stylePreview(name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_stylePreview(this.__wbg_ptr, ptr0, len0);
        return StylePreview.__wrap(ret);
    }
    /**
     * Advanced character formatting tracked across paragraphs in one revision group.
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @param {string} json
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    suggestCharacterFormat(sn, so, en, eo, json, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            wasm.wasmdocument_suggestCharacterFormat(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo, ptr2, len2, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Delete at a paragraph's end, or Backspace at the start of the next, while
     * Suggesting: marks `node`'s paragraph mark as a tracked deletion (HF-130).
     *
     * The author's own pending break is removed outright instead — the paragraph
     * mark counterpart of docs/86 decision 2. A break another reviewer inserted is
     * refused: the model holds one revision per mark, and replacing theirs would
     * silently erase their suggestion. A mark already suggested for deletion moves
     * the caret and changes nothing.
     * @param {string} node
     * @param {string | null} [author]
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    suggestDeleteParagraphMark(node, author, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_suggestDeleteParagraphMark(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * A deletion across paragraphs while Suggesting (HF-130).
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string | null} [author]
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    suggestDeleteRange(start_node, start_offset, end_node, end_offset, author, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            wasm.wasmdocument_suggestDeleteRange(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @param {string | null} [author]
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    suggestDelete(node, start, end, author, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_suggestDelete(retptr, this.__wbg_ptr, ptr0, len0, start, end, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Tracks a character-formatting change as standard `w:rPrChange` metadata:
     * each selected run exists once, carries its current properties, and retains
     * the complete prior snapshot for Reject.
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @param {boolean | null} [bold]
     * @param {boolean | null} [italic]
     * @param {boolean | null} [underline]
     * @param {boolean | null} [strike]
     * @param {number | null} [size_half_points]
     * @param {string | null} [color]
     * @param {string | null} [highlight]
     * @param {string | null} [vert_align]
     * @param {string | null} [font]
     * @param {string | null} [author]
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    suggestFormat(node, start, end, bold, italic, underline, strike, size_half_points, color, highlight, vert_align, font, author, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(color) ? 0 : passStringToWasm0(color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(highlight) ? 0 : passStringToWasm0(highlight, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(vert_align) ? 0 : passStringToWasm0(vert_align, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(font) ? 0 : passStringToWasm0(font, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            var ptr5 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len5 = WASM_VECTOR_LEN;
            var ptr6 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len6 = WASM_VECTOR_LEN;
            wasm.wasmdocument_suggestFormat(retptr, this.__wbg_ptr, ptr0, len0, start, end, isLikeNone(bold) ? 0xFFFFFF : bold ? 1 : 0, isLikeNone(italic) ? 0xFFFFFF : italic ? 1 : 0, isLikeNone(underline) ? 0xFFFFFF : underline ? 1 : 0, isLikeNone(strike) ? 0xFFFFFF : strike ? 1 : 0, isLikeNone(size_half_points) ? Number.MAX_SAFE_INTEGER : (size_half_points) >>> 0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Adds a tracked insertion at a same-paragraph caret.
     * @param {string} node
     * @param {number} offset
     * @param {string} text
     * @param {string | null} [author]
     * @param {string | null} [date]
     * @param {number | null} [typing_session]
     * @returns {EditResult}
     */
    suggestInsert(node, offset, text, author, date, typing_session) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            wasm.wasmdocument_suggestInsert(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1, ptr2, len2, ptr3, len3, isLikeNone(typing_session) ? Number.MAX_SAFE_INTEGER : (typing_session) >>> 0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Typing over a selection that spans paragraphs while Suggesting (HF-130): the
     * cross-paragraph deletion plus the typed text as an insertion at its start, in
     * one undo step.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} text
     * @param {string | null} [author]
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    suggestReplaceRange(start_node, start_offset, end_node, end_offset, text, author, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            wasm.wasmdocument_suggestReplaceRange(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2, ptr3, len3, ptr4, len4);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Replaces a selected range with a tracked deletion plus tracked insertion.
     * @param {string} node
     * @param {number} start
     * @param {number} end
     * @param {string} text
     * @param {string | null} [author]
     * @param {string | null} [date]
     * @param {number | null} [typing_session]
     * @returns {EditResult}
     */
    suggestReplace(node, start, end, text, author, date, typing_session) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            wasm.wasmdocument_suggestReplace(retptr, this.__wbg_ptr, ptr0, len0, start, end, ptr1, len1, ptr2, len2, ptr3, len3, isLikeNone(typing_session) ? Number.MAX_SAFE_INTEGER : (typing_session) >>> 0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Enter while Suggesting (docs/108 phase 2, HF-130): splits the paragraph and
     * marks the LEADING half's paragraph mark as a tracked insertion, as Word does
     * — the trailing half keeps the original mark. Rejecting it later joins the two
     * halves back with the original properties.
     * @param {string} node
     * @param {number} offset
     * @param {string | null} [author]
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    suggestSplit(node, offset, author, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_suggestSplit(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Adds a tracked insertion carrying the typing format armed at the caret.
     * @param {string} node
     * @param {number} offset
     * @param {string} text
     * @param {boolean | null} [bold]
     * @param {boolean | null} [italic]
     * @param {boolean | null} [underline]
     * @param {boolean | null} [strike]
     * @param {number | null} [size_half_points]
     * @param {string | null} [color]
     * @param {string | null} [highlight]
     * @param {string | null} [vert_align]
     * @param {string | null} [font]
     * @param {string | null} [author]
     * @param {string | null} [date]
     * @param {number | null} [typing_session]
     * @returns {EditResult}
     */
    suggestStyledInsert(node, offset, text, bold, italic, underline, strike, size_half_points, color, highlight, vert_align, font, author, date, typing_session) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(color) ? 0 : passStringToWasm0(color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(highlight) ? 0 : passStringToWasm0(highlight, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(vert_align) ? 0 : passStringToWasm0(vert_align, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            var ptr5 = isLikeNone(font) ? 0 : passStringToWasm0(font, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len5 = WASM_VECTOR_LEN;
            var ptr6 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len6 = WASM_VECTOR_LEN;
            var ptr7 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len7 = WASM_VECTOR_LEN;
            wasm.wasmdocument_suggestStyledInsert(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1, isLikeNone(bold) ? 0xFFFFFF : bold ? 1 : 0, isLikeNone(italic) ? 0xFFFFFF : italic ? 1 : 0, isLikeNone(underline) ? 0xFFFFFF : underline ? 1 : 0, isLikeNone(strike) ? 0xFFFFFF : strike ? 1 : 0, isLikeNone(size_half_points) ? Number.MAX_SAFE_INTEGER : (size_half_points) >>> 0, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7, isLikeNone(typing_session) ? Number.MAX_SAFE_INTEGER : (typing_session) >>> 0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * [`convertTextToTable`](Self::convert_text_to_table) in Suggesting mode
     * (`docs/183` §24): the table is a tracked insertion before the paragraphs,
     * which stay struck through until a reviewer decides, so Reject restores
     * them exactly. `author` and `date` as for the other `suggest*` calls. One
     * undoable step.
     *
     * # Errors
     * As `convertTextToTable`, and paragraphs that already carry tracked
     * changes or hold objects other than text and tabs.
     * @param {string} from
     * @param {string} to
     * @param {string} separator
     * @param {string} character
     * @param {number} columns
     * @param {string} autofit
     * @param {string | null} [author]
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    suggestTextToTable(from, to, separator, character, columns, autofit, author, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(from, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(to, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(separator, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(character, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passStringToWasm0(autofit, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len4 = WASM_VECTOR_LEN;
            var ptr5 = isLikeNone(author) ? 0 : passStringToWasm0(author, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len5 = WASM_VECTOR_LEN;
            var ptr6 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len6 = WASM_VECTOR_LEN;
            wasm.wasmdocument_suggestTextToTable(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, columns, ptr4, len4, ptr5, len5, ptr6, len6);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * A tracked underline STYLE or COLOUR change over a range — Suggesting mode's
     * half of the underline menu (HF-255). The tracked-format delta already
     * carries both (`FormatDelta::underline_style` / `underline_color`, which
     * `typeCharacterText` uses when typing); this is the range entry point the
     * menu was missing, so the chrome stops refusing an edit the review model
     * can record.
     *
     * `style` is an `ST_Underline` token the menu offers (`single`, `double`,
     * `thick`, `dotted`, `dashed`, `dotDash`, `wavy`, `words`) or `none`, which
     * turns the underline off; `color` is `#rrggbb`, or `""`/`auto` for the
     * automatic colour. Either may be absent. A colour implies an underline, as
     * the editing path's menu does. One revision group, one undo step.
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @param {string | null} [style]
     * @param {string | null} [color]
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    suggestUnderline(sn, so, en, eo, style, color, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(style) ? 0 : passStringToWasm0(style, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(color) ? 0 : passStringToWasm0(color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            wasm.wasmdocument_suggestUnderline(retptr, this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo, ptr2, len2, ptr3, len3, ptr4, len4);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The Borders and Shading dialog's state, as JSON: for `scope` `"cells"`
     * (the range `anchor..focus`, `""` = the anchor's cell) or `"table"`, each of
     * the six lines (`top`, `bottom`, `left`, `right`, `insideH`, `insideV`) as
     * `"on"`, `"off"`, `"mixed"` or `"unavailable"` (no inside line in a single
     * row or column), what a reader SEES there — a cell's own edge, else the
     * table's; the pen of the first line drawn (`style`, `size` in
     * eighth-points, `color`); and the shading (`#rrggbb`, `""` or `"mixed"`).
     *
     * **O(document)** for the lookup, then O(cells of the table).
     *
     * # Errors
     * When the node is not in a table or the range refuses.
     * @param {string} anchor
     * @param {string} focus
     * @param {string} scope
     * @returns {string}
     */
    tableBorderState(anchor, focus, scope) {
        let deferred5_0;
        let deferred5_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(anchor, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(focus, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(scope, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_tableBorderState(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr4 = r0;
            var len4 = r1;
            if (r3) {
                ptr4 = 0; len4 = 0;
                throw takeObject(r2);
            }
            deferred5_0 = ptr4;
            deferred5_1 = len4;
            return getStringFromWasm0(ptr4, len4);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred5_0, deferred5_1, 1);
        }
    }
    /**
     * One anchor paragraph node id per cell of the range — what a caller passes to
     * a per-cell command. A merged cell appears once.
     *
     * Complexity: O(document) for the table lookup, then O(cells in the range).
     * @param {string} anchor_node
     * @param {string} focus_node
     * @returns {string[]}
     */
    tableCellRangeAnchorNodes(anchor_node, focus_node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(anchor_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(focus_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_tableCellRangeAnchorNodes(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v3 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Cell rectangles for the cell range `anchor_node`..`focus_node`, flattened as
     * `[page, x, y, w, h, …]` in page-local twips — the same stride
     * [`tableSelectionRects`](Self::table_selection_rects) uses, so the painter is
     * unchanged. One rectangle per cell, and a merged cell contributes ONE
     * rectangle covering its whole footprint.
     *
     * Empty when the range refuses; call [`tableCellRange`](Self::table_cell_range)
     * for the reason.
     *
     * Complexity: O(document) for the table lookup, then O(cells in the range).
     * @param {string} anchor_node
     * @param {string} focus_node
     * @returns {Int32Array}
     */
    tableCellRangeRects(anchor_node, focus_node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(anchor_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(focus_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_tableCellRangeRects(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v3 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The normalised rectangle two cell endpoints describe, as
     * [`CellRangeInfo`] — what a drag gesture calls on every pointer-move to
     * learn what it has selected. `anchor_node` and `focus_node` are PARAGRAPH
     * (or cell) node ids; the innermost table containing them is used, so a
     * nested table selects within itself.
     *
     * This never throws: a range that cannot be produced comes back with
     * `found === false` and a `reason`, because the caller is a pointer handler
     * and a refusal must be sayable rather than thrown away.
     *
     * `expanded === true` means the rectangle grew past what was dragged to
     * contain a merged cell, so the UI can say so instead of appearing to select
     * more than the gesture covered (`docs/141` §4.3.5).
     *
     * Complexity: O(document) to locate the table — the same cost every table
     * facade query already pays, and row TBL-15 is the one that fixes it for all
     * of them — then O(cells of the table) for the rectangle. Nothing here is
     * quadratic in the document and it adds no `find_paragraph` scan (HF-184).
     * @param {string} anchor_node
     * @param {string} focus_node
     * @returns {CellRangeInfo}
     */
    tableCellRange(anchor_node, focus_node) {
        const ptr0 = passStringToWasm0(anchor_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(focus_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_tableCellRange(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return CellRangeInfo.__wrap(ret);
    }
    /**
     * Every table painted on page `page_number` (1-based) with its column and row
     * boundaries, as JSON — the geometry a pointer-driven table chrome layer
     * resolves a hover against (`docs/141` D-1).
     *
     * JSON rather than the flat-`Vec<i32>` convention the other geometry calls
     * use, because the payload must carry table **NodeIds** and a caret anchor
     * per boundary, which flat ints cannot express. `applyTableProperties`
     * already establishes JSON as this facade's structured-payload idiom.
     *
     * Shape: `{"tables":[{"node","regular","rows","columns","x","y","w","h",
     * "colEdges":[{"i","x","y","h","width","outer","anchor"}],
     * "rowEdges":[{"i","x","y","w","height","outer","anchor"}]}]}` — all
     * coordinates page-local twips. `i` is the grid position on the leading side
     * of the boundary, `outer` marks the table's own trailing edge, `anchor` is a
     * paragraph inside the band so a resize needs no second query to name what it
     * grabbed, and `width`/`height` are the painted extent of the band the
     * boundary closes (the row axis needs it because `setTableRowHeight` takes an
     * absolute height rather than a delta).
     *
     * **Complexity: O(fragments on `page_number`)** for the geometry — one walk
     * of that page's fragment tree — plus one document walk per table painted on
     * the page to read whether it is *regular*, which is a model question the
     * layout cannot answer and which decides whether a column boundary may be
     * dragged at all. That replaces the `R × (C−1)` whole-layout scans
     * `tableColumnResizeHandles` paid (`109` HF-222): a 20×5 table cost 80 of
     * them, inside a repaint that runs on every caret move, and a hover fires far
     * more often than a caret move. The frontend memoises the answer per page
     * between repaints, so a pointer-move costs nothing at all.
     * @param {number} page_number
     * @returns {string}
     */
    tableChromeOnPage(page_number) {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_tableChromeOnPage(retptr, this.__wbg_ptr, page_number);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Internal column-resize edges for the active regular table, flattened as
     * `[page, x, y, h, column, …]` in page-local twips. `column` is the column to
     * the left of the edge; resizing it preserves the rest of the table.
     * @param {string} node
     * @returns {Int32Array}
     */
    tableColumnResizeHandles(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_tableColumnResizeHandles(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Preferred width for a specific regular-table column, or `-1` when unset.
     * @param {string} node
     * @param {number} column
     * @returns {number}
     */
    tableColumnWidthAt(node, column) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_tableColumnWidthAt(this.__wbg_ptr, ptr0, len0, column);
        return ret;
    }
    /**
     * The table's text wrapping and position, as JSON: `wrap` (`none` |
     * `around`), `floatable`, `hAlign` (`left|center|right|inside|outside|offset`),
     * `hOffsetTwips`, `hRelative` (`column|margin|page`), `vAlign`
     * (`top|center|bottom|inside|outside|inline|offset`), `vOffsetTwips`,
     * `vRelative` (`paragraph|margin|page`), the four distances from text
     * (`topTwips` …) and `allowOverlap`. A table that does not float reports the
     * position Around would start from.
     *
     * **O(document)** for the lookup.
     *
     * # Errors
     * When the node is not in a table.
     * @param {string} node
     * @returns {string}
     */
    tableFloatPosition(node) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_tableFloatPosition(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * Metadata about the innermost table containing `node`, used by the editor's
     * table-selection affordances. Returns an empty/not-found object when the
     * node is outside a table.
     *
     * Carries per-cell merge state as well as the whole-table `regular` flag
     * (`docs/141` TBL-20): [`TableInfo::merged`] and the `merge*` rectangle
     * answer "is THIS cell merged, and which region", and
     * [`TableInfo::resizable_column_boundaries`] answers "which boundaries may
     * be dragged" — the two questions the UI was previously guessing at from
     * `regular` alone.
     *
     * **Complexity: O(document) for the three id lookups it already made, plus
     * O(cells of THIS table) for the merge geometry** — one pass over the
     * table's own rows, which is why the merge work is computed from the table
     * already in hand and never by resolving a cell id per cell. This is the
     * caret path (`docs/107` §4), so the added cost must not grow with the
     * document, and `table_info_is_linear_in_the_table_not_the_document` holds
     * it by doubling.
     * @param {string} node
     * @returns {TableInfo}
     */
    tableInfo(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_tableInfo(this.__wbg_ptr, ptr0, len0);
        return TableInfo.__wrap(ret);
    }
    /**
     * The table style options on for the table holding `node`, by name
     * (`headerRow`, `firstColumn`, `totalRow`, `lastColumn`, `bandedRows`,
     * `bandedColumns`); empty outside a table. **O(document)** for the lookup.
     * @param {string} node
     * @returns {string[]}
     */
    tableLookOptions(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_tableLookOptions(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The settings of a table of contents or figures, as the JSON
     * `TocSettings` the dialog opens on: its instruction's switches plus its
     * entries' tab format. `id` as for
     * [`updateTableOfContents`](Self::update_table_of_contents); empty means
     * the only one. **O(body blocks).**
     *
     * # Errors
     * No such table, or several and `id` was empty.
     * @param {string} id
     * @returns {string}
     */
    tableOfContentsSettings(id) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_tableOfContentsSettings(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * One anchor paragraph node id per cell of the `"row"` / `"column"` /
     * `"table"` selection around `node` — the query the cell-format commands need
     * to stop applying to exactly one cell (`docs/141` §1.16, `docs/109` HF-219).
     *
     * This exposes `table_selection_anchors`, which
     * [`tableSelectionRects`](Self::table_selection_rects) already computes and
     * then throws away in favour of rectangles. Deriving the same list again in JS
     * would be a second implementation of one rule.
     *
     * Complexity: O(document) for the table lookup, then O(cells in the
     * selection).
     * @param {string} node
     * @param {string} mode
     * @returns {string[]}
     */
    tableSelectionAnchorNodes(node, mode) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_tableSelectionAnchorNodes(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v3 = getArrayJsValueFromWasm0(r0, r1);
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Cell rectangles for a table selection mode (`"row"`, `"column"`, `"table"`)
     * around `node`, flattened as `[page, x, y, w, h, …]`. This deliberately
     * reports cell boxes, not text ranges: table column selection is not a
     * contiguous document text range.
     * @param {string} node
     * @param {string} mode
     * @returns {Int32Array}
     */
    tableSelectionRects(node, mode) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_tableSelectionRects(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v3 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string} node
     * @returns {string}
     */
    tableStyleAt(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_tableStyleAt(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Returns authored text-box body properties from any document surface.
     * @param {string} node
     * @returns {string}
     */
    textBoxBodyProperties(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_textBoxBodyProperties(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Returns a text-box's first model caret without requiring a shaped line
     * box. This keeps entry into empty/newly-created boxes deterministic.
     * @param {string} node
     * @returns {HitPayload | undefined}
     */
    textBoxCaret(node) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_textBoxCaret(this.__wbg_ptr, ptr0, len0);
        return ret === 0 ? undefined : HitPayload.__wrap(ret);
    }
    /**
     * The selectable object (drawing/image/text box) under a page-local point
     * (twips) on 1-based `page`, or `undefined` if the point hits no object —
     * the object-selection counterpart of [`hit_test`](Self::hit_test) (docs/85
     * §3.1 `HitTarget::InlineObject`). The frontend calls this *before* text
     * hit-testing: a hit selects the object as a unit (`Selection::Object`,
     * docs/58 §3), a miss falls through to a text caret. Read-only; no mutation.
     *
     * Scope: inline images/text boxes in top-level body paragraphs
     * (`P1G-OBJ-SELECT`) **and** top-level floating/anchored images and text
     * boxes (`P1G-OBJ-ANCHOR-SELECT`; `anchored` = true). Group children,
     * table-cell and header/footer objects remain later slices.
     * Resolves a page-local point inside an inline TEXT BOX's content, as
     * `{ node, offset, zone }`, or `None` if the point is in no text box.
     *
     * Separate from [`hit_test`] for the same reason `runningHitTest` is: a
     * single click on a text box selects the OBJECT (docs/85 §4), so ordinary
     * clicks keep resolving against the body. The host asks for this only once
     * it has entered the box's text.
     *
     * [`hit_test`]: WasmDocument::hit_test
     * @param {number} page
     * @param {number} x_twip
     * @param {number} y_twip
     * @returns {HitPayload | undefined}
     */
    textBoxHitTest(page, x_twip, y_twip) {
        const ret = wasm.wasmdocument_textBoxHitTest(this.__wbg_ptr, page, x_twip, y_twip);
        return ret === 0 ? undefined : HitPayload.__wrap(ret);
    }
    /**
     * Reflects effective selected run direction: 0 LTR, 1 RTL, 2 mixed.
     * Complexity: O(document + selected text), with one paragraph index.
     * @param {string} sn
     * @param {number} so
     * @param {string} en
     * @param {number} eo
     * @returns {number}
     */
    textDirectionState(sn, so, en, eo) {
        const ptr0 = passStringToWasm0(sn, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(en, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_textDirectionState(this.__wbg_ptr, ptr0, len0, so, ptr1, len1, eo);
        return ret;
    }
    /**
     * The Convert Text to Table dialog's suggested column count for the
     * paragraphs `from..=to` at `separator` (`paragraph`, `tab`, `comma`,
     * `semicolon`, `other` with `character`), or `-1` when they cannot be
     * converted. **O(document)** to resolve.
     * @param {string} from
     * @param {string} to
     * @param {string} separator
     * @param {string} character
     * @returns {number}
     */
    textToTableColumns(from, to, separator, character) {
        const ptr0 = passStringToWasm0(from, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(to, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(separator, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(character, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdocument_textToTableColumns(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        return ret;
    }
    /**
     * Toggles the checked state of the checklist item at `node` — the interaction
     * behind a click on the checkbox marker. Swaps the item's numbering between the
     * unchecked (`☐`) and checked (`☑`) checklist definitions, preserving its
     * level, as one undoable action. Errors if `node` is not a checklist item, so
     * the host only wires it to a checklist marker.
     * @param {string} node
     * @returns {EditResult}
     */
    toggleChecklistItem(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_toggleChecklistItem(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Ticks or unticks the form checkbox at `node`, as one undoable action.
     *
     * Both competitors agree on this interaction, so none of it is invented
     * (`docs/118` §2). ONLYOFFICE's `CInlineLevelSdt.ToggleCheckBox` flips the
     * flag and then **rewrites the control's content** to the checked or
     * unchecked symbol — the glyph is content, not decoration — and Word does
     * the same on a click or on Space. So does this: the flag moves and the
     * run inside the control is replaced with the glyph the document itself
     * declared in `w14:checkedState` / `w14:uncheckedState`, keeping that
     * run's formatting so a 16pt teal box stays 16pt and teal.
     *
     * # Errors
     *
     * When `node` is not inside a form checkbox, so a host cannot wire this to
     * an arbitrary click and silently corrupt a paragraph.
     * @param {string} node
     * @returns {EditResult}
     */
    toggleFormCheckbox(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_toggleFormCheckbox(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Toggles a `"bullet"` or `"numbered"` list over the selection's paragraphs, as
     * one undoable action. The shared list definition is created on first use and
     * reused after; the toggle direction (on vs off) is decided by the first
     * selected paragraph — if it already belongs to this list it is turned off,
     * else every selected paragraph is turned on. Pressing Enter in a list item
     * continues the list automatically (split copies the paragraph properties).
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} kind
     * @returns {EditResult}
     */
    toggleList(start_node, start_offset, end_node, end_offset, kind) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(kind, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_toggleList(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Whether the document's Track Changes setting is on (`w:trackRevisions`,
     * `docs/165` M7): the flag Word saves a document with while tracking is on,
     * and opens it with. The host opens such a document in Suggesting mode. O(1).
     * @returns {boolean}
     */
    get trackRevisions() {
        const ret = wasm.wasmdocument_trackRevisions(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Armed typing with additive character formatting and typed underline.
     * @param {string} node
     * @param {number} offset
     * @param {string} text
     * @param {boolean | null | undefined} bold
     * @param {boolean | null | undefined} italic
     * @param {boolean | null | undefined} underline
     * @param {boolean | null | undefined} strike
     * @param {number | null | undefined} size
     * @param {string | null | undefined} color
     * @param {string | null | undefined} highlight
     * @param {string | null | undefined} vert
     * @param {string | null | undefined} font
     * @param {number} session
     * @param {string | null | undefined} underline_style
     * @param {string | null | undefined} underline_color
     * @param {string} json
     * @param {boolean} suggesting
     * @param {string | null} [date]
     * @returns {EditResult}
     */
    typeCharacterText(node, offset, text, bold, italic, underline, strike, size, color, highlight, vert, font, session, underline_style, underline_color, json, suggesting, date) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(color) ? 0 : passStringToWasm0(color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(highlight) ? 0 : passStringToWasm0(highlight, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(vert) ? 0 : passStringToWasm0(vert, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            var ptr5 = isLikeNone(font) ? 0 : passStringToWasm0(font, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len5 = WASM_VECTOR_LEN;
            var ptr6 = isLikeNone(underline_style) ? 0 : passStringToWasm0(underline_style, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len6 = WASM_VECTOR_LEN;
            var ptr7 = isLikeNone(underline_color) ? 0 : passStringToWasm0(underline_color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len7 = WASM_VECTOR_LEN;
            const ptr8 = passStringToWasm0(json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len8 = WASM_VECTOR_LEN;
            var ptr9 = isLikeNone(date) ? 0 : passStringToWasm0(date, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len9 = WASM_VECTOR_LEN;
            wasm.wasmdocument_typeCharacterText(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1, isLikeNone(bold) ? 0xFFFFFF : bold ? 1 : 0, isLikeNone(italic) ? 0xFFFFFF : italic ? 1 : 0, isLikeNone(underline) ? 0xFFFFFF : underline ? 1 : 0, isLikeNone(strike) ? 0xFFFFFF : strike ? 1 : 0, isLikeNone(size) ? Number.MAX_SAFE_INTEGER : (size) >>> 0, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, session, ptr6, len6, ptr7, len7, ptr8, len8, suggesting, ptr9, len9);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Additive typed-underline counterpart of [`type_styled_text`](Self::type_styled_text),
     * retaining the same gesture-grouped undo behavior.
     * @param {string} node
     * @param {number} offset
     * @param {string} text
     * @param {boolean | null | undefined} bold
     * @param {boolean | null | undefined} italic
     * @param {boolean | null | undefined} underline
     * @param {boolean | null | undefined} strike
     * @param {number | null | undefined} size_half_points
     * @param {string | null | undefined} color
     * @param {string | null | undefined} highlight
     * @param {string | null | undefined} vert_align
     * @param {string | null | undefined} font
     * @param {number} session
     * @param {string | null} [underline_style]
     * @param {string | null} [underline_color]
     * @returns {EditResult}
     */
    typeStyledTextWithUnderline(node, offset, text, bold, italic, underline, strike, size_half_points, color, highlight, vert_align, font, session, underline_style, underline_color) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(color) ? 0 : passStringToWasm0(color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(highlight) ? 0 : passStringToWasm0(highlight, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(vert_align) ? 0 : passStringToWasm0(vert_align, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            var ptr5 = isLikeNone(font) ? 0 : passStringToWasm0(font, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len5 = WASM_VECTOR_LEN;
            var ptr6 = isLikeNone(underline_style) ? 0 : passStringToWasm0(underline_style, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len6 = WASM_VECTOR_LEN;
            var ptr7 = isLikeNone(underline_color) ? 0 : passStringToWasm0(underline_color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len7 = WASM_VECTOR_LEN;
            wasm.wasmdocument_typeStyledTextWithUnderline(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1, isLikeNone(bold) ? 0xFFFFFF : bold ? 1 : 0, isLikeNone(italic) ? 0xFFFFFF : italic ? 1 : 0, isLikeNone(underline) ? 0xFFFFFF : underline ? 1 : 0, isLikeNone(strike) ? 0xFFFFFF : strike ? 1 : 0, isLikeNone(size_half_points) ? Number.MAX_SAFE_INTEGER : (size_half_points) >>> 0, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, session, ptr6, len6, ptr7, len7);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Styled counterpart of [`type_text`](Self::type_text): preserves an armed
     * run format while allowing adjacent keyboard calls in the same host typing
     * session to undo/redo as one user action.
     * @param {string} node
     * @param {number} offset
     * @param {string} text
     * @param {boolean | null | undefined} bold
     * @param {boolean | null | undefined} italic
     * @param {boolean | null | undefined} underline
     * @param {boolean | null | undefined} strike
     * @param {number | null | undefined} size_half_points
     * @param {string | null | undefined} color
     * @param {string | null | undefined} highlight
     * @param {string | null | undefined} vert_align
     * @param {string | null | undefined} font
     * @param {number} session
     * @returns {EditResult}
     */
    typeStyledText(node, offset, text, bold, italic, underline, strike, size_half_points, color, highlight, vert_align, font, session) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(color) ? 0 : passStringToWasm0(color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(highlight) ? 0 : passStringToWasm0(highlight, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len3 = WASM_VECTOR_LEN;
            var ptr4 = isLikeNone(vert_align) ? 0 : passStringToWasm0(vert_align, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len4 = WASM_VECTOR_LEN;
            var ptr5 = isLikeNone(font) ? 0 : passStringToWasm0(font, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len5 = WASM_VECTOR_LEN;
            wasm.wasmdocument_typeStyledText(retptr, this.__wbg_ptr, ptr0, len0, offset, ptr1, len1, isLikeNone(bold) ? 0xFFFFFF : bold ? 1 : 0, isLikeNone(italic) ? 0xFFFFFF : italic ? 1 : 0, isLikeNone(underline) ? 0xFFFFFF : underline ? 1 : 0, isLikeNone(strike) ? 0xFFFFFF : strike ? 1 : 0, isLikeNone(size_half_points) ? Number.MAX_SAFE_INTEGER : (size_half_points) >>> 0, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, session);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Incremental keyboard typing with explicit host gesture identity. Each call
     * still edits/reflows immediately; adjacent calls with the same `session`
     * coalesce into one history entry only when the previous caret exactly
     * matches this insertion start.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} text
     * @param {number} session
     * @returns {EditResult}
     */
    typeText(start_node, start_offset, end_node, end_offset, text, session) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_typeText(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2, session);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * User-facing label for the next undoable action, or an empty string when
     * history is empty. The engine owns this vocabulary so the host never has to
     * reverse-engineer a command from its inverse operations.
     * @returns {string}
     */
    get undoLabel() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_undoLabel(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Undoes the last user action (one or many ops), returning the restored
     * caret + revision.
     *
     * All-or-nothing (HF-045). The entry is popped first so the group is not
     * borrowed from the stack it is about to change, but it is **put back
     * unchanged** if the group cannot apply, and `apply_group` has already
     * restored the document by then. So a refused undo costs the user nothing:
     * the document is what they were looking at, the step is still on the
     * stack, and the error says so. Before this, the entry was popped and
     * dropped whatever happened, and a group that failed on its third of five
     * ops left the document two ops into a state nobody ever saw — with the
     * only route back thrown away.
     * @returns {EditResult}
     */
    undo() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_undo(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Unfold everything, returning the new fold state as JSON.
     *
     * `foldToLevel(0)` — "show every level".
     * @returns {string}
     */
    unfoldAll() {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_unfoldAll(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Word's Arrange ▸ Ungroup: replaces the group `node` with its children as
     * independent floating objects, each anchored where it was already
     * painted, as one undoable action.
     *
     * The group's transform is APPLIED, not discarded: a child of a group
     * scaled to half size comes out at the size it was drawn at, because that
     * is what the reader was looking at. A nested group comes out as a group,
     * which is what makes ungrouping a nest peel one layer at a time the way
     * Word does. Nothing is dropped — see
     * `out_of_group_child` for the two children that come back wrapped in a
     * group of one rather than losing a property `InlineNode` cannot model.
     *
     * # Errors
     *
     * When `node` is not a top-level floating group, or it has no children.
     *
     * **O(document), ONE walk**, then O(children).
     * @param {string} node
     * @returns {EditResult}
     */
    ungroupObject(node) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_ungroupObject(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Rewrites every caption's `SEQ` result to the number the document resolves
     * now — Word's F9 over the caption sequences, as ONE undoable action.
     *
     * Refuses with a reason when nothing is stale, rather than pushing an empty
     * history entry a user would then have to undo twice.
     *
     * **O(document)** — one walk, then one operation per caption that actually
     * changed. A caption already showing the right number produces no operation,
     * so updating a correct document costs no history.
     * @returns {EditResult}
     */
    updateCaptionNumbers() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmdocument_updateCaptionNumbers(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Replaces the body text of a comment or reply as one undoable review
     * action (docs/81 REVIEW-GAP-011). Works on a thread root or any reply;
     * only the target's own body text changes — its threading
     * (`para_id`/`parent_para_id`, so a reply stays a reply and export's
     * `w14:paraId`/`w15:paraIdParent` join keys survive reopen), resolved
     * state, author identity, and any anchor markers are preserved
     * untouched. Reviewer edit permission ("edit your own comment") is host
     * policy per the identity seam (docs/68), so the engine trusts the
     * caller and does not enforce authorship here.
     * @param {string} comment
     * @param {string} text
     * @returns {EditResult}
     */
    updateComment(comment, text) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(comment, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_updateComment(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Redefines paragraph style `name` so its run and paragraph formatting match
     * the current selection — Word's "Update `<style>` to Match Selection". Every
     * paragraph that references the style reflows. Round-trip safe (the style
     * registry is regenerated on export). Errors if no paragraph style with that
     * name exists.
     * @param {string} start_node
     * @param {number} start_offset
     * @param {string} end_node
     * @param {number} end_offset
     * @param {string} name
     * @returns {EditResult}
     */
    updateStyleFromSelection(start_node, start_offset, end_node, end_offset, name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(start_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(end_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmdocument_updateStyleFromSelection(retptr, this.__wbg_ptr, ptr0, len0, start_offset, ptr1, len1, end_offset, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Updates a table of contents. `mode` is `"pageNumbers"` (re-read the
     * pagination, keep the entries) or `"entire"` (rebuild the entries from the
     * heading outline) — the split Word and ONLYOFFICE both offer.
     *
     * `id` is the 32-hex field-range id from
     * [`fieldRangeSpans`](Self::field_range_spans); passing an empty string
     * means "the document's only table of contents", which is refused rather
     * than guessed when there is not exactly one.
     *
     * One undoable action under `HistoryKind::FieldChange`; the caret does not
     * move, because an update is not a place the user asked to go.
     *
     * **Complexity: O(document)** — see the module note.
     *
     * # Errors
     * When `id` names no field range, when no (or more than one) contents field
     * exists and `id` was empty, when `mode` is neither of the two, when the
     * range's markers are not at body top level, or — for `"pageNumbers"` — when
     * the number of entries no longer matches the number of headings, which is
     * the case that needs a whole rebuild rather than new numbers on the wrong
     * rows.
     * @param {string} id
     * @param {string} mode
     * @returns {EditResult}
     */
    updateTableOfContents(id, mode) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmdocument_updateTableOfContents(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EditResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The watermark of the section holding `node`, in the shape
     * [`set_watermark`](Self::set_watermark) accepts. `kind` is `"none"` when the
     * section has none, which is also what the dialog opens on.
     *
     * `null` only when the document has no section at all.
     * @param {string} node
     * @returns {string}
     */
    watermark(node) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_watermark(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * The byte range `[start, end]` of the word at `offset` (double-click select),
     * as `[start, end]`; empty if the offset is not within a word.
     * @param {string} node
     * @param {number} offset
     * @returns {Uint32Array}
     */
    wordAt(node, offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmdocument_wordAt(retptr, this.__wbg_ptr, ptr0, len0, offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayU32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
if (Symbol.dispose) WasmDocument.prototype[Symbol.dispose] = WasmDocument.prototype.free;

/**
 * A format-neutral export result returned across the JS/WASM boundary.
 */
export class WasmExportArtifact {
    static __wrap(ptr) {
        const obj = Object.create(WasmExportArtifact.prototype);
        obj.__wbg_ptr = ptr;
        WasmExportArtifactFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmExportArtifactFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmexportartifact_free(ptr, 0);
    }
    /**
     * Returns a copy of the encoded file bytes.
     * @returns {Uint8Array}
     */
    get bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmexportartifact_bytes(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the stable emitted format identifier.
     * @returns {string}
     */
    get format() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmexportartifact_format(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the emitted MIME type.
     * @returns {string}
     */
    get mimeType() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmexportartifact_mimeType(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the deterministic export compatibility report as JSON.
     * @returns {string}
     */
    get reportJson() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmexportartifact_reportJson(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the suggested filename extension without a leading dot.
     * @returns {string}
     */
    get suggestedExtension() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmexportartifact_suggestedExtension(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the emitted format profile/version, when known.
     * @returns {string | undefined}
     */
    get version() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmexportartifact_version(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
if (Symbol.dispose) WasmExportArtifact.prototype[Symbol.dispose] = WasmExportArtifact.prototype.free;

/**
 * Everyone in the room, and where they are looking.
 *
 * Created on joining a room and **dropped when the connection ends** — presence
 * does not outlive its transport. Holds no document, issues no `Operation`, and
 * reaches no revision log.
 */
export class WasmRoster {
    static __wrap(ptr) {
        const obj = Object.create(WasmRoster.prototype);
        obj.__wbg_ptr = ptr;
        WasmRosterFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmRosterFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmroster_free(ptr, 0);
    }
    /**
     * `caretFrame` while this participant's assistant is writing at `agent_node` /
     * `agent_offset` (`docs/178` §10): every other replica draws a "Casual AI" caret
     * there. An empty `agent_node` is no assistant, exactly `caretFrame`.
     * @param {WasmDocument} document
     * @param {string} anchor
     * @param {number} anchor_offset
     * @param {string} head
     * @param {number} head_offset
     * @param {string} agent_node
     * @param {number} agent_offset
     * @returns {Uint8Array | undefined}
     */
    caretFrameWithAgent(document, anchor, anchor_offset, head, head_offset, agent_node, agent_offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(document, WasmDocument);
            const ptr0 = passStringToWasm0(anchor, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(head, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(agent_node, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmroster_caretFrameWithAgent(retptr, this.__wbg_ptr, document.__wbg_ptr, ptr0, len0, anchor_offset, ptr1, len1, head_offset, ptr2, len2, agent_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            let v4;
            if (r0 !== 0) {
                v4 = getArrayU8FromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Builds a typed, bounded caret frame. Unchanged positions produce no frame.
     * @param {WasmDocument} document
     * @param {string} anchor
     * @param {number} anchor_offset
     * @param {string} head
     * @param {number} head_offset
     * @returns {Uint8Array | undefined}
     */
    caretFrame(document, anchor, anchor_offset, head, head_offset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(document, WasmDocument);
            const ptr0 = passStringToWasm0(anchor, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(head, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmroster_caretFrame(retptr, this.__wbg_ptr, document.__wbg_ptr, ptr0, len0, anchor_offset, ptr1, len1, head_offset);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            let v3;
            if (r0 !== 0) {
                v3 = getArrayU8FromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Clears transient membership and resends the current position after reconnect.
     */
    clear() {
        wasm.wasmroster_clear(this.__wbg_ptr);
    }
    /**
     * Forgets `client` — it left, or its connection dropped. Returns whether
     * anything was held.
     *
     * A host calls this on a leave frame **and** on a connection-state change,
     * which is what ONLYOFFICE's `Remove_ForeignCursor` does: a caret that
     * outlives its owner is worse than no caret, because the reader believes
     * somebody is there.
     * @param {bigint} client
     * @returns {boolean}
     */
    forget(client) {
        const ret = wasm.wasmroster_forget(this.__wbg_ptr, client);
        return ret !== 0;
    }
    /**
     * Whether nobody is held — a room this replica is alone in, which under
     * "one doc, one room" is the ordinary state of a shared document on its
     * first open rather than an error.
     * @returns {boolean}
     */
    get isEmpty() {
        const ret = wasm.wasmroster_isEmpty(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * This replica's own row of [`participants`](Self::participants) as JSON
     * (`{client, profile?, attested}`), or `null` before the room has welcomed it.
     * @returns {string}
     */
    get me() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmroster_me(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * How many participants are held.
     * @returns {number}
     */
    get participantCount() {
        const ret = wasm.wasmroster_participantCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Everyone held, in participant-number order, as JSON:
     * `[{"client":n,"clock":n,"payloadBytes":n}]`.
     *
     * Participant-number order, not map-iteration order, so two replicas list
     * the room identically and a reader's sidebar does not reshuffle itself on
     * every update.
     *
     * The payload itself is **not** in this JSON, and that is deliberate: it is
     * opaque bytes, and the only lossless way to put arbitrary bytes in JSON is
     * to invent an encoding at the boundary. `payloadBytes` is its length, so a
     * host can render a participant chip without touching the payload at all,
     * and [`payload_of`](Self::payload_of) hands back the bytes unchanged for the
     * ones it wants to draw.
     *
     * Complexity: O(participants), capped at [`max_participants`].
     *
     * Since `docs/175` §4.3 the list is **everyone present**, not only everyone who has sent a
     * caret: the relay's participant list joins the caret roster, and each row carries
     * `profile` (`{id, name, initials?, color?, avatarUrl?}`, when anybody named the person)
     * and `attested` (whether the host vouched for it). A participant present but caretless has
     * no `clock` or `payloadBytes`. This replica is included; [`me`](Self::me) says which row
     * it is.
     * @returns {string}
     */
    get participants() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmroster_participants(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * One participant's payload, exactly as it arrived, or `undefined` if that
     * participant is not held.
     *
     * Bytes, not text: the engine never interprets the payload and this boundary
     * does not either. A host that put UTF-8 JSON in decodes it itself and knows
     * what it put there.
     * @param {bigint} client
     * @returns {Uint8Array | undefined}
     */
    payloadOf(client) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmroster_payloadOf(retptr, this.__wbg_ptr, client);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getArrayU8FromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Records `client`'s presence, replacing whatever that client had.
     *
     * `client` is the participant number **the relay assigned**, which the host
     * takes from the session the frame arrived on and never from the frame's
     * contents — there is no identity field in a presence frame for a sender to
     * put a claim in, and this argument is where the receiver supplies the
     * answer instead.
     *
     * `clock` is the sender's own monotonic count of the updates it has sent. It
     * is not a document revision and is not ordered against edits: presence
     * merges with nothing, so it needs no position in the total order. An update
     * whose clock is not newer than the one already held is **ignored** and
     * reported as `"stale"` — the defect ONLYOFFICE guards with
     * `participantsTimestamp`, where a roster arriving out of order moves a caret
     * backwards and leaves it there.
     *
     * Returns what happened, so a host repaints only when something moved:
     * `"joined"`, `"moved"` or `"stale"`.
     *
     * Complexity: O(log participants). Nothing about the document is read.
     *
     * # Errors
     *
     * Throws when the payload is above [`max_presence_bytes`], and when a **new**
     * participant would take the room past [`max_participants`]. Neither changes
     * the roster, and a participant already in a full room may still move — the
     * cap is on membership, not on movement, or every caret in a busy room would
     * freeze.
     * @param {bigint} client
     * @param {bigint} clock
     * @param {Uint8Array} payload
     * @returns {string}
     */
    presenceUpdate(client, clock, payload) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmroster_presenceUpdate(retptr, this.__wbg_ptr, client, clock, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * Reads awareness and departures through the engine codec. No browser wire parsing.
     * @param {Uint8Array} frame
     */
    receiveFrame(frame) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(frame, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmroster_receiveFrame(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Maps the roster across edits and returns geometry from the document engine.
     * A participant whose assistant is writing also carries `agent: {caret}`, the AI
     * caret's rectangle (`docs/178` §10).
     * @param {WasmDocument} document
     * @returns {string}
     */
    remoteSelections(document) {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(document, WasmDocument);
            wasm.wasmroster_remoteSelections(retptr, this.__wbg_ptr, document.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmRoster.prototype[Symbol.dispose] = WasmRoster.prototype.free;

/**
 * A resumable comparison of two checkpoints.
 *
 * Owns both parsed sides, so it references nothing in the live editing session
 * and can be created, driven and dropped without touching it.
 */
export class WasmVersionDiff {
    static __wrap(ptr) {
        const obj = Object.create(WasmVersionDiff.prototype);
        obj.__wbg_ptr = ptr;
        WasmVersionDiffFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmVersionDiffFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmversiondiff_free(ptr, 0);
    }
    /**
     * The projected text of one block on one SIDE of this comparison — the
     * **context** a unified diff puts around a change.
     *
     * `side` is `"left"` (the older state) or `"right"` (the newer), matching
     * [`begin_version_diff`]'s orientation. `story` and `path` are the JSON of a
     * change record's `DiffAnchor.story` and `DiffAnchor.path`, which is what a
     * JS host already holds — so a caller walks a path's last index ±1, ±2 to
     * ask for the neighbours, and the `None` at the end of a sibling list is
     * what tells it where the document stops.
     *
     * # Why this and not a wider sidecar
     *
     * A change record names only what CHANGED. GitHub's unified diff is
     * recognisable because of the lines around each change, and those lines are
     * unchanged blocks: there is nothing in the sidecar to render them from, and
     * putting them there would mean emitting K neighbours per change for a
     * reader who expands none of them. This is the pull half of the same data,
     * and the engine is where it is cheap: the two parsed sides are already
     * resident.
     *
     * `None` when the side is not `"left"`/`"right"`, when either argument is
     * not readable as its type, when the path names a row or a cell rather than
     * a block, when it leaves the document's shape — which is exactly how a
     * caller discovers it has reached the first or last sibling — and when the
     * block it names is not a paragraph. Every one of those is a legitimate
     * answer to "is there a block here", so none of them throws.
     *
     * Complexity: **O(depth + the block's inlines)** per call. Deliberately not
     * O(document) and deliberately not cached: a reader expanding context is an
     * interaction, and `docs/107` §4 holds per-interaction work to O(1) in
     * document size.
     * @param {string} side
     * @param {string} story
     * @param {string} path
     * @returns {string | undefined}
     */
    blockTextAt(side, story, path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(side, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(story, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(path, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmversiondiff_blockTextAt(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v4;
            if (r0 !== 0) {
                v4 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Blocks projected so far. Real progress: it counts work actually done.
     * @returns {number}
     */
    blocksProjected() {
        const ret = wasm.wasmversiondiff_blocksProjected(this.__wbg_ptr);
        return ret;
    }
    /**
     * Blocks to project in total, or 0 while the second side is still being
     * parsed. A host shows an indeterminate bar until this is non-zero and a
     * determinate one after — rather than a bar that pretends to know.
     * @returns {number}
     */
    blocksTotal() {
        const ret = wasm.wasmversiondiff_blocksTotal(this.__wbg_ptr);
        return ret;
    }
    /**
     * Stops the job. Takes effect immediately; no result is produced.
     *
     * A half-finished diff is worse than none, because a reader cannot tell it
     * is half-finished.
     */
    cancel() {
        wasm.wasmversiondiff_cancel(this.__wbg_ptr);
    }
    /**
     * The sidecar JSON, once the state is `"complete"`. `undefined` before that,
     * after a cancellation, and on a second call.
     * @returns {string | undefined}
     */
    result() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmversiondiff_result(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Does at most `budget` blocks of work and returns the new state:
     * `"parsing"`, `"working"`, `"complete"` or `"cancelled"`.
     *
     * A `"parsing"` slice costs one whole document parse and cannot be cut
     * short; every later slice honours the budget. Pass
     * [`DEFAULT_DIFF_SLICE`] until the host has measured what its frame affords.
     *
     * # Errors
     *
     * Throws when either checkpoint fails admission or import — a corrupt or
     * oversized checkpoint is reported, not silently compared as if empty.
     * @param {number} budget
     * @returns {string}
     */
    step(budget) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmversiondiff_step(retptr, this.__wbg_ptr, budget);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
}
if (Symbol.dispose) WasmVersionDiff.prototype[Symbol.dispose] = WasmVersionDiff.prototype.free;

/**
 * Starts a comparison of two checkpoints. Nothing is parsed yet.
 *
 * The older state is `left` and the newer is `right`; insertions are what the
 * right side has and the left does not, which is the same orientation review
 * uses.
 *
 * **O(bytes copied)** — the two byte arrays cross the boundary once and are held
 * until the job's phases consume them.
 * @param {Uint8Array} left
 * @param {Uint8Array} right
 * @returns {WasmVersionDiff}
 */
export function beginVersionDiff(left, right) {
    const ptr0 = passArray8ToWasm0(left, wasm.__wbindgen_export);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(right, wasm.__wbindgen_export);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.beginVersionDiff(ptr0, len0, ptr1, len1);
    return WasmVersionDiff.__wrap(ret);
}

/**
 * The bytes of a face this module ships, for the PDF module's standard-14
 * resolver (`casual-doc-pdf-read` `provision`): `Liberation Sans`, `Serif` or
 * `Mono` in any style. `None` for anything else. O(face bytes): a copy.
 *
 * Read through the layout crate's own functions (`fonts::family_name`,
 * `fonts::face_bytes`), never by naming a `fonts` constant here: a `const`
 * holding `include_bytes!` (or a table of them, `FAMILIES`) is emitted again
 * in every crate that names it. Naming the twelve `LIBERATION_*` constants
 * linked a second 4.35 MB copy; naming `FAMILIES` a second copy of every face
 * (measured, `docs/182` §17a).
 * @param {string} family
 * @param {boolean} bold
 * @param {boolean} italic
 * @returns {Uint8Array | undefined}
 */
export function bundledFace(family, bold, italic) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(family, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.bundledFace(retptr, ptr0, len0, bold, italic);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        let v2;
        if (r0 !== 0) {
            v2 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 1, 1);
        }
        return v2;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * The decimal separator a BCP-47 language tag implies, as the literal character
 * `"."` or `","`, for a host that has a locale but no separator preference.
 *
 * Coarse by construction, and documented as such in the engine: it keys off the
 * language subtag alone, so `es-ES` (comma) and `es-MX` (dot) both report the
 * language's majority convention. A host with CLDR data already knows better
 * and should pass its own answer to [`format_measurement`] instead of calling
 * this.
 *
 * Parsing accepts both separators regardless of this; only formatting needs to
 * choose one, because its output is read rather than parsed.
 * @param {string} language_tag
 * @returns {string}
 */
export function decimalSeparatorForLanguage(language_tag) {
    let deferred2_0;
    let deferred2_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(language_tag, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.decimalSeparatorForLanguage(retptr, ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        deferred2_0 = r0;
        deferred2_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
    }
}

/**
 * [`DEFAULT_DIFF_SLICE`], for a host that would otherwise hardcode it.
 *
 * A number typed into `version_panel.mjs` is a number with no committed
 * artifact behind it, which is the `105` EV-002 shape. The engine owns the
 * starting slice because the engine knows what a unit of its own work is.
 * @returns {number}
 */
export function defaultDiffSlice() {
    const ret = wasm.defaultDiffSlice();
    return ret >>> 0;
}

/**
 * The unit to default to before anyone has chosen, from a region code or a full
 * BCP-47 tag. Returns an id from [`measurement_units`].
 *
 * Inches for the United States and Canada, centimetres everywhere else — the
 * rule ONLYOFFICE applies and the two countries whose paper sizes are imperial.
 * `"us"`, `"en-US"` and `"en_us"` all give `"inch"`.
 *
 * This is a **default**, not a lock: a host stores what the person chose and
 * only falls back here on a first run.
 * @param {string} region
 * @returns {string}
 */
export function defaultMeasurementUnit(region) {
    let deferred2_0;
    let deferred2_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(region, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.defaultMeasurementUnit(retptr, ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        deferred2_0 = r0;
        deferred2_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
    }
}

/**
 * Compares two checkpoints in one blocking call and returns the sidecar JSON.
 *
 * **Blocking and O(document).** For a Worker, a native host, or a headless
 * caller. A host on a UI thread must use [`begin_version_diff`] and drive
 * [`WasmVersionDiff::step`]; this is here so those callers do not each write
 * their own driver loop, not as a shortcut past the budget.
 *
 * # Errors
 *
 * Throws when either side fails admission or import.
 * @param {Uint8Array} left
 * @param {Uint8Array} right
 * @returns {string}
 */
export function diffVersions(left, right) {
    let deferred4_0;
    let deferred4_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray8ToWasm0(left, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(right, wasm.__wbindgen_export);
        const len1 = WASM_VECTOR_LEN;
        wasm.diffVersions(retptr, ptr0, len0, ptr1, len1);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
        var ptr3 = r0;
        var len3 = r1;
        if (r3) {
            ptr3 = 0; len3 = 0;
            throw takeObject(r2);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export4(deferred4_0, deferred4_1, 1);
    }
}

/**
 * The engine's version, taken from the crate manifest at compile time.
 *
 * The About dialog needs a version to show, and a string typed into the HTML
 * would be a number on a user-facing surface that no committed artifact backs
 * — the failure mode `105` EV-002 exists for, where a page claimed 19
 * construct families against 26 in the data. `CARGO_PKG_VERSION` cannot drift
 * from the manifest, because it IS the manifest.
 * @returns {string}
 */
export function engineVersion() {
    let deferred1_0;
    let deferred1_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.engineVersion(retptr);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        deferred1_0 = r0;
        deferred1_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
    }
}

/**
 * Writes a twip value for a person to read, in `unit_id`, to that unit's
 * display precision.
 *
 * `separator` is `"."` or `","` (the words `"dot"` and `"comma"` are accepted
 * too, for a host that would rather not pass punctuation). It is explicit
 * because the engine holds no locale of its own and must not infer one from the
 * host process — `docs/124` is where the chrome resolves one.
 *
 * `format` then `parse` is a fixed point for every displayable value, which the
 * engine holds with an exhaustive guard: what a host shows is what it reads
 * back.
 *
 * # Errors
 *
 * Throws for an unknown `unit_id` or an unknown `separator`, rather than quietly
 * falling back to inches and a dot — a silently substituted unit is a wrong
 * number presented as a right one.
 * @param {number} twips
 * @param {string} unit_id
 * @param {string} separator
 * @returns {string}
 */
export function formatMeasurement(twips, unit_id, separator) {
    let deferred4_0;
    let deferred4_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(unit_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(separator, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        wasm.formatMeasurement(retptr, twips, ptr0, len0, ptr1, len1);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
        var ptr3 = r0;
        var len3 = r1;
        if (r3) {
            ptr3 = 0; len3 = 0;
            throw takeObject(r2);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export4(deferred4_0, deferred4_1, 1);
    }
}

/**
 * The most participants one room's roster will hold, for the same reason.
 *
 * Past this a participant is refused rather than the roster growing without
 * limit: the roster is fanned out to everyone, so the cost of the *n*-th
 * participant is paid *n* times.
 * @returns {number}
 */
export function maxParticipants() {
    const ret = wasm.maxParticipants();
    return ret >>> 0;
}

/**
 * The most bytes one participant's presence payload may carry, for a host that
 * would otherwise hardcode it.
 *
 * Published rather than written into the chrome because the engine owns the
 * bound: a number typed into a JS file is a number with no committed artifact
 * behind it (`105` EV-002). A host that composes a payload checks it against
 * this before sending, so an oversized caret is caught where it can be fixed
 * instead of refused at the far end.
 * @returns {number}
 */
export function maxPresenceBytes() {
    const ret = wasm.maxPresenceBytes();
    return ret >>> 0;
}

/**
 * Every unit a chooser should offer, in order, as JSON.
 *
 * `[{"id","suffix","decimalPlaces","stepTwip"}]` — the stable id to persist and
 * pass back, the abbreviation to show, how many decimals a field in this unit
 * displays, and the twip value of one of those decimal steps (a spinner's
 * `step`).
 *
 * The order is the engine's — metric coarse to fine, then imperial, then
 * typographic — and is **not** ONLYOFFICE's (`cm`, `pt`, `inch`, with no
 * millimetre or pica at all) nor Word's (inches first). It carries no index,
 * because an index is the thing a host must never persist.
 *
 * `decimalPlaces` is not a taste choice: it is the largest precision for which
 * one display step is still at least one whole twip, so a field built from it
 * never shows a digit that cannot survive a round trip. Millimetres get one
 * decimal for that reason, not out of neglect.
 * @returns {string}
 */
export function measurementUnits() {
    let deferred1_0;
    let deferred1_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.measurementUnits(retptr);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        deferred1_0 = r0;
        deferred1_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
    }
}

/**
 * An empty roster, for a host that has just joined a room.
 *
 * A document in mode 1 — a file opened with no link and no embedding host — does
 * not call this and needs nothing from it.
 * @returns {WasmRoster}
 */
export function newRoster() {
    const ret = wasm.newRoster();
    return WasmRoster.__wrap(ret);
}

/**
 * Auto-detects a registered document format, imports it, and paginates it.
 *
 * Errors (bad ZIP, admission failure, import failure) throw a JS `Error`.
 * @param {Uint8Array} bytes
 * @returns {WasmDocument}
 */
export function open(bytes) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.open(retptr, ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return WasmDocument.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * Imports bytes through one explicitly selected stable format identifier.
 * @param {Uint8Array} bytes
 * @param {string} format_id
 * @returns {WasmDocument}
 */
export function openAs(bytes, format_id) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(format_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        wasm.openAs(retptr, ptr0, len0, ptr1, len1);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return WasmDocument.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * Opens the PDF module's finished import as an editing session. `original`
 * is the file that was imported; it is retained for the exact save.
 *
 * O(document): the snapshot parse and the layout, the cost of any open.
 *
 * # Errors
 *
 * A malformed package, an original that is not the imported file, or a
 * document the snapshot importer refuses.
 * @param {Uint8Array} _package
 * @param {Uint8Array} original
 * @returns {WasmDocument}
 */
export function openPdfImport(_package, original) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray8ToWasm0(_package, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(original, wasm.__wbindgen_export);
        const len1 = WASM_VECTOR_LEN;
        wasm.openPdfImport(retptr, ptr0, len0, ptr1, len1);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return WasmDocument.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * Opens the PDF module's flowing package (the default open, and "Convert to
 * flowing document") as a flowing document. `original`, when given, must be
 * the PDF the package was made from; it is kept so the editor can open the
 * PDF again (in its exact layout, or with OCR), never written back: saved as
 * PDF the document is the semantic writer, reported. Without it the session
 * is not PDF-origin. Its import report is the whole import's, with
 * `pdf.import.layout_inferred`. O(document).
 *
 * # Errors
 *
 * A malformed package, an original that is not the converted file, or a
 * document the snapshot importer refuses.
 * @param {Uint8Array} _package
 * @param {Uint8Array | null} [original]
 * @returns {WasmDocument}
 */
export function openPdfReflow(_package, original) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray8ToWasm0(_package, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(original) ? 0 : passArray8ToWasm0(original, wasm.__wbindgen_export);
        var len1 = WASM_VECTOR_LEN;
        wasm.openPdfReflow(retptr, ptr0, len0, ptr1, len1);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return WasmDocument.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * Reads what a person typed into a measurement field, in twips.
 *
 * `unit_id` is the id of the unit the field is **labelled** in, and is used only
 * when the text carries no suffix of its own: `"2.5"` in a centimetre field is
 * 2.5 cm, while `"2.5 in"` is 2.5 inches whatever the field is labelled. Both
 * `.` and `,` are accepted as the decimal separator, so a German user typing
 * `2,54` into a field a host formatted as `2.54` is understood.
 *
 * Exact: the amount is kept as a scaled integer and converted by exact rational
 * arithmetic, so `"2.54"` cm is 1440 twips and not 1439.9997 rounded.
 *
 * # Errors
 *
 * Throws, with the engine's message, for an empty field, a value that is not a
 * number (a group separator — `1,234.5` — lands here rather than being guessed
 * at), an unknown unit suffix, more significant digits than the exact conversion
 * accepts, and a value outside the twip grid. **A refusal, never a zero**: a
 * field that quietly reads an unparseable entry as 0 applies a margin nobody
 * asked for.
 * @param {string} text
 * @param {string} unit_id
 * @returns {number}
 */
export function parseMeasurement(text, unit_id) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(unit_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        wasm.parseMeasurement(retptr, ptr0, len0, ptr1, len1);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return r0;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * Registers the PDF module's half of the byte-preserving save.
 * @param {any} host
 */
export function setPdfSavePlanner(host) {
    wasm.setPdfSavePlanner(addHeapObject(host));
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_30c8987f7c2ed4e2: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbg___wbindgen_string_get_0380ccaa2f57f0d9: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_41e9ee4f547fc59a: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_planSave_55c7f05e3e05fb9f: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            const ret = getObject(arg1).planSave(getArrayU8FromWasm0(arg2, arg3), getArrayU8FromWasm0(arg4, arg5), getArrayU8FromWasm0(arg6, arg7));
            const ptr1 = passArray8ToWasm0(ret, wasm.__wbindgen_export);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_set_code_eef454fbf1915b7e: function(arg0, arg1, arg2) {
            getObject(arg0).code = getStringFromWasm0(arg1, arg2);
        },
        __wbg_ternleafAdmit_a95895a309978203: function() { return handleError(function (arg0, arg1) {
            const ret = globalThis.ternleafAdmit(getStringFromWasm0(arg0, arg1));
            return ret;
        }, arguments); },
        __wbindgen_generic_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_object_drop_ref: function(arg0) {
            takeObject(arg0);
        },
    };
    return {
        __proto__: null,
        "./casual_doc_wasm_bg.js": import0,
    };
}

const CaretFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_caret_free(ptr, 1));
const CellRangeInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cellrangeinfo_free(ptr, 1));
const CellTextRangeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_celltextrange_free(ptr, 1));
const DocStatsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_docstats_free(ptr, 1));
const EditResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_editresult_free(ptr, 1));
const FormatFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_format_free(ptr, 1));
const HitPayloadFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_hitpayload_free(ptr, 1));
const IndentsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_indents_free(ptr, 1));
const LinkHitFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_linkhit_free(ptr, 1));
const ObjectHitPayloadFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_objecthitpayload_free(ptr, 1));
const PageBitmapFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pagebitmap_free(ptr, 1));
const PageSizeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pagesize_free(ptr, 1));
const ParagraphFlagsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_paragraphflags_free(ptr, 1));
const ParagraphSpacingFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_paragraphspacing_free(ptr, 1));
const ParagraphStateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_paragraphstate_free(ptr, 1));
const PictureRasterFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pictureraster_free(ptr, 1));
const RulerGeometryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rulergeometry_free(ptr, 1));
const RunStyleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_runstyle_free(ptr, 1));
const RunningHitPayloadFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_runninghitpayload_free(ptr, 1));
const ShapeFormatFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_shapeformat_free(ptr, 1));
const StylePreviewFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_stylepreview_free(ptr, 1));
const TableInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_tableinfo_free(ptr, 1));
const TextMatchFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_textmatch_free(ptr, 1));
const WasmDocumentFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmdocument_free(ptr, 1));
const WasmExportArtifactFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmexportartifact_free(ptr, 1));
const WasmRosterFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmroster_free(ptr, 1));
const WasmVersionDiffFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmversiondiff_free(ptr, 1));

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function dropObject(idx) {
    if (idx < 1028) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(takeObject(mem.getUint32(i, true)));
    }
    return result;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function getClampedArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ClampedArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

let cachedInt32ArrayMemory0 = null;
function getInt32ArrayMemory0() {
    if (cachedInt32ArrayMemory0 === null || cachedInt32ArrayMemory0.byteLength === 0) {
        cachedInt32ArrayMemory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedUint8ClampedArrayMemory0 = null;
function getUint8ClampedArrayMemory0() {
    if (cachedUint8ClampedArrayMemory0 === null || cachedUint8ClampedArrayMemory0.byteLength === 0) {
        cachedUint8ClampedArrayMemory0 = new Uint8ClampedArray(wasm.memory.buffer);
    }
    return cachedUint8ClampedArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export3(addHeapObject(e));
    }
}

let heap = new Array(1024).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getDataViewMemory0();
    for (let i = 0; i < array.length; i++) {
        mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedInt32ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    cachedUint8ClampedArrayMemory0 = null;
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('casual_doc_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };

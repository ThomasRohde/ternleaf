# The document engine

Ternleaf does not have its own document engine. It uses [OpenDoc](https://github.com/CasualOffice/opendoc), an Apache-2.0 document engine in Rust that runs in the browser as WebAssembly, with a small maintained patch.

## Why OpenDoc

Ternleaf needs an engine that it can ship in full, that keeps a Word document intact through an edit, and that lets every change pass one checkpoint. OpenDoc fits for these reasons:

- **Permissive licence.** The engine, its dependencies and its fonts can be redistributed with their notices.
- **A real page model.** OpenDoc paginates and renders pages, and it models, lays out and exports native objects such as charts.
- **Exact unchanged export.** A document that was not edited exports byte for byte.
- **Revisioned edits.** Every mutation goes through a transaction log with inverse operations. That gives Ternleaf a single place to admit or refuse a change.
- **Honest export.** The exporter reports what it could not keep, so Ternleaf can refuse a lossy file.

Its main limit is the preservation of source XML that it does not model. Ternleaf handles that limit by refusing an export that would lose content.

## The pin and the patch

| File | Purpose |
| --- | --- |
| [`engine/opendoc.lock`](../engine/opendoc.lock) | The OpenDoc commit that Ternleaf builds from. |
| [`engine/opendoc.patch`](../engine/opendoc.patch) | The Ternleaf changes to that commit. |
| [`engine/prebuilt`](../engine/prebuilt) | The built web application, ready to serve, with its notices. |

The patch does these things:

- **Admission.** The engine calls the host page before it publishes a revision and rolls the edit back on refusal. It can replay a saved frame when a project opens.
- **Editor hooks.** The editor exposes its document, selection and refresh functions to the Ternleaf shell and sends its save path through the Ternleaf export check. Its command registry passes through a Ternleaf hook, and every path that would replace the open document hands the bytes to Ternleaf instead. In a project, the editor does not ask about unsaved changes, because every revision is saved.
- **Paragraph identity.** Word paragraph IDs (`w14:paraId`) have one owner through split, join, move and undo. Text version IDs (`w14:textId`) follow their paragraph.
- **Source retention.** A bounded extension property and the `w:noProof` override survive on their runs.
- **Layout.** Text baselines in exact-height lines match Word, and an inline chart shares the baseline of the text around it.
- **Charts.** The chart painter handles varied column fills and overlay legends.

Keep the patch small. Every hunk is a cost at the next OpenDoc update.

## The prebuilt engine

`engine/prebuilt/webapp` is the output of the build below, so that a clone runs without a Rust toolchain. [`engine/prebuilt/BUILD.json`](../engine/prebuilt/BUILD.json) records the OpenDoc commit, the hash of the patch, the hash of the WebAssembly module and the build profile.

It is the optimized build: the release profile with OpenDoc's own size settings, then `wasm-opt -Oz`. OpenDoc keeps full speed optimization for the crates that decide editing speed, such as layout and rendering. The module is 28.7 MB. An unoptimized development build is 118 MB.

The WebAssembly module is stored as `casual_doc_wasm_bg.wasm.gz` (12.9 MB) to keep the repository small. The host serves it with `Content-Encoding: gzip` and the browser inflates it.

`engine/prebuilt/notices` holds OpenDoc's licence and notice, the font licences, the Cargo lockfile, the licence texts of the Rust crates in the build, the Rust standard library notices and the patch.

## Build the engine

You need Git, Rust 1.97.1 with the `wasm32-unknown-unknown` target, [wasm-bindgen 0.2.129](https://github.com/wasm-bindgen/wasm-bindgen/releases/tag/0.2.129) and `wasm-opt` from [Binaryen](https://github.com/WebAssembly/binaryen/releases). The script is PowerShell. The same commands work on any system with these tools.

```powershell
rustup toolchain install 1.97.1 --profile minimal
rustup target add --toolchain 1.97.1 wasm32-unknown-unknown

$engine = Join-Path $PWD '.build/opendoc'
$bindgen = 'C:/path/to/wasm-bindgen.exe'
$wasmopt = 'C:/path/to/wasm-opt.exe'
& scripts/build-engine.ps1 -Checkout $engine -WasmBindgen $bindgen -WasmOpt $wasmopt -NativeTests
```

The script fetches the pinned commit, applies the patch, builds the WebAssembly module in the release profile, runs `wasm-opt` on it and, with `-NativeTests`, runs the engine's native tests. The web application is in `.build/opendoc/webapp`.

For work on the engine itself, add `-Dev`. That build is fast to make, large and slow to run. Do not use it as the prebuilt engine.

To try a new build, point `engine` in `.ternleaf/canvas.json` at that folder. To make it the prebuilt engine, run:

```powershell
node scripts/update-prebuilt.mjs $engine
```

Run the [tests](Development.md) and the [Word comparisons](Word-Fidelity.md) before you commit a new prebuilt engine.

## Update OpenDoc

1. Check out the new OpenDoc commit and apply `engine/opendoc.patch`. Resolve what no longer applies.
2. Write the new commit to `engine/opendoc.lock` and the new diff to `engine/opendoc.patch`.
3. Build, run every test and every Word comparison, and update the prebuilt engine.

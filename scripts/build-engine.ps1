# Build the pinned OpenDoc engine with the Ternleaf patch.
#
# The default is the optimized build that engine/prebuilt holds: the release
# profile with OpenDoc's size settings, then wasm-opt when -WasmOpt names the
# Binaryen tool. -Dev makes a fast, large, unoptimized build for engine work.
param([string]$Checkout, [Parameter(Mandatory)][string]$WasmBindgen, [string]$WasmOpt,
    [switch]$Dev, [switch]$NativeTests)
$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$pin = (Get-Content (Join-Path $project 'engine/opendoc.lock') -Raw).Trim()
if (!$Checkout) { $Checkout = Join-Path $project '.build/opendoc' }
$patch = Join-Path $project 'engine/opendoc.patch'
function Check-Native {
    if ($LASTEXITCODE -ne 0) { throw "Command exited with code $LASTEXITCODE" }
}

if (!(Test-Path -LiteralPath $Checkout)) {
    New-Item -Force -ItemType Directory (Split-Path -Parent $Checkout) | Out-Null
    git init $Checkout
    Check-Native
    git -C $Checkout fetch --depth 1 https://github.com/CasualOffice/opendoc.git $pin
    Check-Native
    git -C $Checkout checkout --detach FETCH_HEAD
    Check-Native
}
if ((git -C $Checkout rev-parse HEAD).Trim() -ne $pin) { throw 'OpenDoc checkout does not match the lock' }
git -C $Checkout apply --reverse --check $patch 2>$null
if ($LASTEXITCODE -ne 0) {
    git -C $Checkout apply --check $patch
    Check-Native
    git -C $Checkout apply $patch
    Check-Native
}
$env:CARGO_PROFILE_DEV_DEBUG = '0'
$env:CARGO_INCREMENTAL = '0'
# OpenDoc's own browser build asks for size here. Its Cargo.toml keeps
# opt-level 3 for the crates that decide editing speed.
$env:CARGO_PROFILE_RELEASE_OPT_LEVEL = 'z'
$flavour = if ($Dev) { 'debug' } else { 'release' }
$release = if ($Dev) { @() } else { @('--release') }
Push-Location $Checkout
try {
    cargo +1.97.1 build @release --locked --target wasm32-unknown-unknown -p casual-doc-wasm --features web-host-fonts
    Check-Native
    & $WasmBindgen --target web --out-dir webapp/pkg "target/wasm32-unknown-unknown/$flavour/casual_doc_wasm.wasm"
    Check-Native
    if ($WasmOpt -and !$Dev) {
        $module = 'webapp/pkg/casual_doc_wasm_bg.wasm'
        & $WasmOpt -Oz --enable-bulk-memory --enable-sign-ext --enable-nontrapping-float-to-int $module -o $module
        Check-Native
    }
    if ($NativeTests) {
        cargo +1.97.1 test --locked -p casual-doc-layout --lib exact_text_baseline_depends_on_pitch_and_not_the_face_ascent
        Check-Native
        cargo +1.97.1 test --locked -p casual-doc-transaction --lib a_refused_group_rolls_the_document_back_and_appends_nothing
        Check-Native
    }
} finally { Pop-Location }

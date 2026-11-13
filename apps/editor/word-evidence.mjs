// A disposable, one-page reference capture from the same WebView and
// document instance that produced the downloaded DOCX.
export async function captureWordEvidence(doc, bytes, revision) {
  if (doc.pageCount !== 1) throw new Error("The Word reference capture requires one page");
  const dpi = 360;
  const logical = [JSON.parse(doc.glyphOrigins(0))];
  const bitmap = doc.renderPage(0, dpi);
  try {
    const canvas = document.createElement("canvas");
    const { widthPx: width, heightPx: height } = bitmap;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").putImageData(new ImageData(bitmap.rgba, width, height), 0, 0);
    const png = canvas.toDataURL("image/png").split(",")[1];
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    const docxSha256 = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
    return { revision, docxSha256, dpi, logical, width, height, png };
  } finally {
    bitmap.free();
  }
}

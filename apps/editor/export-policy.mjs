const refreshedBookkeeping = new Set([
  "docx.export.stale.statistics",
  "docx.export.stale.thumbnail",
  "docx.rsid",
]);

export function validateDocxExport(reportJson) {
  const entries = JSON.parse(reportJson).entries;
  const unsupported = entries.filter(entry => entry.retentionOutcome === "not_retained"
    && !refreshedBookkeeping.has(entry.feature));
  if (unsupported.length) {
    throw new Error("DOCX export would lose unsupported source data (" + unsupported[0].feature + ")");
  }
  return entries;
}

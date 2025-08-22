import { diff as dmpDiff, diffCleanupSemantic as dmpCleanup } from "diff-match-patch-es";

type Op = -1 | 0 | 1;
type DiffTuple = [Op, string];

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

function prettyHtmlLocal(diffs: DiffTuple[]) {
  let html = "";
  for (const [op, text] of diffs) {
    const safe = escapeHtml(text);
    if (op === 1) html += `<ins>${safe}</ins>`;
    else if (op === -1) html += `<del>${safe}</del>`;
    else html += `<span>${safe}</span>`;
  }
  return html;
}

/** Constrói HTML de diff (com cleanup) usando diff-match-patch-es */
export function buildDiffHtml(a: string, b: string): string {
  const diffs = dmpDiff(a, b) as DiffTuple[];
  if (typeof dmpCleanup === "function"){
    dmpCleanup(diffs);
  }
  return prettyHtmlLocal(diffs);
}
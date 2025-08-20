export function getSelectionRanges(textarea) {
  const el = textarea;
  return { start: el.selectionStart, end: el.selectionEnd, text: el.value.slice(el.selectionStart, el.selectionEnd) };
}
export function replaceSelection(textarea, text) {
  const el = textarea;
  const start = el.selectionStart, end = el.selectionEnd;
  const before = el.value.slice(0, start), after = el.value.slice(end);
  el.value = before + text + after;
  el.focus(); el.selectionStart = el.selectionEnd = start + text.length;
}
export function toList(textarea) {
  const sel = getSelectionRanges(textarea);
  let text = sel.text;
  if (!text) {
    const v = textarea.value;
    let s = v.lastIndexOf('\n', sel.start - 1) + 1; if (s < 0) s = 0;
    let e = v.indexOf('\n', sel.start); if (e < 0) e = v.length;
    text = v.slice(s, e); textarea.selectionStart = s; textarea.selectionEnd = e;
  }
  const lines = text.split(/\r?\n/).map(l => l.trim() ? (/^[-*] +/.test(l) ? l : '- ' + l) : l);
  replaceSelection(textarea, lines.join('\n'));
}
export function toCode(textarea, lang = '') {
  const sel = getSelectionRanges(textarea);
  const text = sel.text || (() => { const v = textarea.value; let s = v.lastIndexOf('\n', sel.start - 1) + 1; if (s < 0) s = 0; let e = v.indexOf('\n', sel.start); if (e < 0) e = v.length; return v.slice(s, e) })();
  replaceSelection(textarea, `\n\`\`\`${lang}\n${text}\n\`\`\`\n`);
}

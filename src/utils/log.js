let LOG = [];
export function log(...args) {
  const line = args.map(x => { try { return typeof x === 'string' ? x : JSON.stringify(x) } catch { return String(x) } }).join(' ');
  const ts = new Date().toISOString().slice(11, 19);
  LOG.push(`[${ts}] ${line}`);
  const panel = document.getElementById('dbgPanel');
  const toggle = document.getElementById('showDbg');
  if (panel && toggle?.checked) {
    panel.hidden = false;
    panel.textContent = LOG.join('\n');
    panel.scrollTop = panel.scrollHeight;
  }
  console.log('[README-STUDIO]', ...args);
}
export const getLogText = () => LOG.join('\n');

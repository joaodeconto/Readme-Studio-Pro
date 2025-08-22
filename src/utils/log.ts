const LOG: string[] = [];
export function log(...args: unknown[]): void {
  const line = args
    .map((x) => {
      try {
        return typeof x === 'string' ? x : JSON.stringify(x);
      } catch {
        return String(x);
      }
    })
    .join(' ');
  const ts = new Date().toISOString().slice(11, 19);
  LOG.push(`[${ts}] ${line}`);
  if (typeof document !== 'undefined') {
    const panel = document.getElementById('dbgPanel') as HTMLElement | null;
    const toggle = document.getElementById('showDbg') as HTMLInputElement | null;
    if (panel && toggle?.checked) {
      panel.hidden = false;
      panel.textContent = LOG.join('\n');
      panel.scrollTop = panel.scrollHeight;
    }
  }
  console.log('[README-STUDIO]', ...args);
}
export const getLogText = (): string => LOG.join('\n');

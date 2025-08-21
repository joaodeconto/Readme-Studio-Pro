import { log } from './utils/log';
import { createRoot } from 'react-dom/client';
import { App } from '@ui/EditorWorkspace';

log('Env', {
  protocol: location.protocol,
  host: location.host,
  href: location.href,
});

const rootEl = document.getElementById('app');
if (rootEl) {
  createRoot(rootEl).render(<App />);
}

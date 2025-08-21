import { bindUI as bindUIImported } from '@ui/bindToolbar.js';
import { log as logImported } from './utils/log.js';

const bindUI: () => void = bindUIImported;
const log: (...args: unknown[]) => void = logImported;

log('Env', {
  protocol: location.protocol,
  host: location.host,
  href: location.href,
});
bindUI();

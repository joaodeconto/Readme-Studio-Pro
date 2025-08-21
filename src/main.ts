
import { bindUI as bindUIImported } from '@ui/bindToolbar';
import { log as logImported } from './utils/log';

const bindUI: () => void = bindUIImported;
const log: (...args: unknown[]) => void = logImported;

log('Env', {
  protocol: location.protocol,
  host: location.host,
  href: location.href,
});
bindUI();
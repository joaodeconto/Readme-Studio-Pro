import { bindUI } from '@ui/bindToolbar.js';
import { log } from './utils/log';
log('Env', { protocol: location.protocol, host: location.host, href: location.href });
bindUI();

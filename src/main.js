import { bindUI } from '@ui/bindToolbar.js';
import { log } from './utils/log.js';
log('Env', { protocol: location.protocol, host: location.host, href: location.href });
bindUI();

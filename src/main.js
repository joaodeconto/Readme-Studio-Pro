import { bindUI } from '@ui/binding';
import { log } from './utils/log.js';
log('Env', { protocol: location.protocol, host: location.host, href: location.href });
bindUI();

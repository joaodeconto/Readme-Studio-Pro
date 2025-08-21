
import { bindToolbar } from '@ui/bindToolbar';
import { log } from './utils/log';

log('Env', {
  protocol: location.protocol,
  host: location.host,
  href: location.href,
});
bindToolbar();
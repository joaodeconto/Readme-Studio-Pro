import { bindUI } from './ui/bindToolbar.js';
import { log } from './utils/log.js';

// Informações de ambiente básicas no console e painel de debug
log('Env', { protocol: location.protocol, host: location.host, href: location.href });
if (location.protocol === 'http:') log('Aviso: HTTP sem TLS — algumas APIs podem bloquear. Prefira HTTPS.');
if (location.hostname.endsWith('.github.io')) log('Rodando em GitHub Pages — CORS deve permitir chamadas à API GitHub.');

// Inicializa a interface vinculando eventos ao DOM
bindUI();
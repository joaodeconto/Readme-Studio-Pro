// src/github/config.js
// Troque a URL abaixo pelo endereço público do seu backend quando subir (Render/CF Workers).
// Em dev, pode apontar para o túnel ngrok (https://xxxxx.ngrok.app) ou localhost se abrir local.
const DEFAULT_BACKEND_URL = 'http://127.0.0.1:3000';
export const BACKEND_URL =
  typeof window !== 'undefined'
    ? window.localStorage.getItem('READMESTUDIO_BACKEND_URL') ||
      DEFAULT_BACKEND_URL
    : DEFAULT_BACKEND_URL;

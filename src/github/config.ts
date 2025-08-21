// src/github/config.ts
// Troque a URL abaixo pelo endereço público do seu backend quando subir (Render/CF Workers).
// Em dev, pode apontar para o túnel ngrok (https://xxxxx.ngrok.app) ou localhost se abrir local.
export const BACKEND_URL: string =
  localStorage.getItem('READMESTUDIO_BACKEND_URL') || 'http://127.0.0.1:3000';

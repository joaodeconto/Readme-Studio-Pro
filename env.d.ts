/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    GITHUB_APP_ID?: 1797390;
    GITHUB_APP_CLIENT_ID?: string;
    GITHUB_APP_CLIENT_SECRET?: string;
    GITHUB_APP_WEBHOOK_SECRET?: abc123;
    GITHUB_APP_PRIVATE_KEY_B64?: string;
    NEXT_PUBLIC_POSTHOG_KEY?: string;
    DATABASE_URL?: 'http://localhost:3001';
  }
}

export {};

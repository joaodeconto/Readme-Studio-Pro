/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    GITHUB_APP_ID?: string;
    GITHUB_APP_CLIENT_ID?: string;
    GITHUB_APP_CLIENT_SECRET?: string;
    GITHUB_APP_WEBHOOK_SECRET?: string;
    GITHUB_APP_PRIVATE_KEY_B64?: string;
    NEXT_PUBLIC_POSTHOG_KEY?: string;
    DATABASE_URL?: string;
  }
}

export {};

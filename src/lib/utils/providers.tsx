"use client";
import { useEffect, useState, type ReactNode, type ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

declare global {
  interface Window {
    __PHInitialized?: boolean;
  }
}

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  const [posthog, setPosthog] = useState<any>(null);
  const [PostHogProvider, setPostHogProvider] =
    useState<ComponentType<{ client: any }> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.__PHInitialized) return;

    Promise.all([import("posthog-js"), import("posthog-js/react")]).then(
      ([ph, react]) => {
        const client = ph.default;
        const token = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        if (token) {
          client.init(token, {
            api_host:
              process.env.NEXT_PUBLIC_POSTHOG_HOST ||
              "https://app.posthog.com",
            capture_pageview: true,
            capture_pageleave: true,
          });
          window.__PHInitialized = true;
        }
        setPosthog(client);
        setPostHogProvider(() => react.PostHogProvider);
      }
    );
  }, []);

  const content = (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </I18nextProvider>
  );

  if (!PostHogProvider || !posthog) return content;

  return <PostHogProvider client={posthog}>{content}</PostHogProvider>;
}
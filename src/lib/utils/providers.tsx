"use client";
import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

declare global {
  interface Window {
    __PHInitialized?: boolean;
  }
}

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__PHInitialized) return;

    const token = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (token) {
      posthog.init(token, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        capture_pageview: true,
        capture_pageleave: true,
      });
      window.__PHInitialized = true;
    }
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </I18nextProvider>
    </PostHogProvider>
  );
}
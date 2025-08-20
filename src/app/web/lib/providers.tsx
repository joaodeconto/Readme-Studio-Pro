"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { PostHogProvider } from 'posthog-js/react';
import posthog from 'posthog-js';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

if (typeof window !== 'undefined') {
  const token = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (token) {
    posthog.init(token, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
    });
  }
}

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <PostHogProvider client={posthog}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </I18nextProvider>
    </PostHogProvider>
  );
}
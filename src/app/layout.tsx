"use client"
import '@ui/styles/globals.css';
import { PostHogProvider as PHRaw } from 'posthog-js/react'
import type { PostHog } from 'posthog-js'
import posthog from 'posthog-js'
type PHProviderType = React.ComponentType<React.PropsWithChildren<{ client: PostHog }>>
const PostHogProvider = PHRaw as unknown as PHProviderType
import AppSidebar from '@ui/components/shell/AppSidebar';

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <div className="flex h-dvh">
        <AppSidebar />
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </PostHogProvider>
  );
}
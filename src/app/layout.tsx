import { PostHogProvider as PHRaw } from 'posthog-js/react'
type PHProviderType = React.ComponentType<React.PropsWithChildren<{ client: unknown }>>
const PostHogProvider = PHRaw as unknown as PHProviderType
import AppSidebar from '@ui/components/shell/AppSidebar';

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={children}>
      <div className="flex h-dvh">
        <AppSidebar />
        <div className="flex-1 flex flex-col">{children}</div>    
      </div>
    </PostHogProvider >
  );
}

import Providers from './lib/providers';
import AppSidebar from '@ui/components/shell/AppSidebar';
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex h-dvh">
        <AppSidebar />
        <div className="flex-1 flex flex-col">{children}</div>        
        <SpeedInsights />
      </div>
    </Providers>
  );
}

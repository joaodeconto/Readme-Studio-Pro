import Providers from './lib/providers';
import AppSidebar from '@ui/components/shell/AppSidebar';

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex h-dvh">
        <AppSidebar />
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </Providers>
  );
}

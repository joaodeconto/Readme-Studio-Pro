'use client';

import '@ui/styles/globals.css';
import { usePathname } from 'next/navigation';
import AppSidebar from '@ui/components/shell/AppSidebar';
import { Providers } from '@/lib/utils/providers';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const content =
    pathname === '/pages' ? (
      <>{children}</>
    ) : (
      <div className="flex h-dvh">
        <AppSidebar />
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    );

  return <Providers>{content}</Providers>;
}
'use client';

import '@ui/styles/globals.css';
import { usePathname } from 'next/navigation';
import AppSidebar from '@ui/components/shell/AppSidebar';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/pages') {
    return <>{children}</>;
  }
  return (
    <div className="flex h-dvh">
      <AppSidebar />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
import '../styles/globals.css';
import '../styles/tokens.css';
import Providers from './lib/providers';
import AppSidebar from '@ui/components/shell/AppSidebar';

export const metadata = { title: 'README Studio • Pro' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex h-dvh">
            <AppSidebar />
            <div className="flex-1 flex flex-col">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
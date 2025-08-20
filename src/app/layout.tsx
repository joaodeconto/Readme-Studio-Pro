import '../ui/styles/globals.css';
import '../ui/styles/tokens.css';

export const metadata = { title: 'README Studio • Pro' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

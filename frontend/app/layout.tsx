import './globals.css';
import { QueryClientProvider } from '@/app/providers/QueryClientProvider';
import { LayoutContent } from './LayoutContent';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <QueryClientProvider>
          <LayoutContent>{children}</LayoutContent>
        </QueryClientProvider>
      </body>
    </html>
  );
}

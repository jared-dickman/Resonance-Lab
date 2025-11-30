import type { Metadata } from 'next';
import './globals.css';
import { QueryClientProvider } from '@/app/providers/QueryClientProvider';
import { LayoutContent } from '@/app/LayoutContent';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LogRocketInit } from '@/app/components/analytics/LogRocketInit';

export const metadata: Metadata = {
  title: 'Jamium',
  description: 'AI-powered music creation platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LogRocketInit />
        <ErrorBoundary
          fallbackTitle="Application Error"
          fallbackMessage="The application encountered an unexpected error. Please reload the page."
        >
          <QueryClientProvider>
            <LayoutContent>{children}</LayoutContent>
          </QueryClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

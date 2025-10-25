import './globals.css';
import { QueryClientProvider } from '@/app/providers/QueryClientProvider';
import { LayoutContent } from '@/app/LayoutContent';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
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

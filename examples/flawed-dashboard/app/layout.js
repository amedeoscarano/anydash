import './globals.css';
import { Shell } from '@/components/shell';
import { ToastProvider } from '@/components/toast';

export const metadata = { description: 'Demo shipping admin for Acme Store.' };

export default function RootLayout({ children }) {
  return (
    <html lang="en-US">
      <body>
        <ToastProvider>
          <Shell>{children}</Shell>
        </ToastProvider>
      </body>
    </html>
  );
}

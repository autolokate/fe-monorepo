import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import '@autolokate/design-system/theme.css';
import './styles/globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { ThemedToaster } from '@/providers/ThemedToaster';
import { VehiclePreferenceSync } from '@/components/shared/VehiclePreferenceSync';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Autolokate FE',
  description: 'Next 15 + React 19 + TypeScript + Tailwind 4 + Radix UI starter.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fafafa',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${inter.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
          <VehiclePreferenceSync />
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

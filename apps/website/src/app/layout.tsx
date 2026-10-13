import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import '@autolokate/design-system/theme.css';
import './styles/globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { ThemedToaster } from '@/providers/ThemedToaster';
import { VehiclePreferenceSync } from '@/components/shared/VehiclePreferenceSync';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  DEFAULT_SHARE_IMAGE,
  IS_INDEXABLE_SITE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo';

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

const DEFAULT_TITLE = `${SITE_NAME} – ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'Autolokate',
    'crash detection app',
    'vehicle safety India',
    'emergency SOS',
    'smart QR sticker for car',
    'roadside assistance',
    'accident alert family',
  ],
  category: 'automotive safety',
  referrer: 'origin-when-cross-origin',
  formatDetection: { telephone: false, email: false, address: false },
  robots: IS_INDEXABLE_SITE
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      }
    : { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
    images: [DEFAULT_SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_SHARE_IMAGE.url],
  },
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
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <ThemeProvider>
          {children}
          <VehiclePreferenceSync />
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

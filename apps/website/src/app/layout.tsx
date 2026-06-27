import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "@autolokate/design-system/theme.css";
import "./styles/globals.css";
import { ThemeProvider, themeBootstrapScript } from "@/providers/theme-provider";
import { ThemedToaster } from "@/providers/ThemedToaster";
import { PreferenceFinderProvider } from "@/providers/PreferenceFinderProvider";
import { VehiclePreferenceSync } from "@/components/shared/VehiclePreferenceSync";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Autolokate FE",
  description:
    "Next 15 + React 19 + TypeScript + Tailwind 4 + Radix UI starter.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Synchronous: runs before <body> paints so the chosen theme is on <html>
            immediately and there is no light/dark flash on reload. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <PreferenceFinderProvider>{children}</PreferenceFinderProvider>
          <VehiclePreferenceSync />
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

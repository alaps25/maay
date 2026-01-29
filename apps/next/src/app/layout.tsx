import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Maay',
  description: 'A calm, beautiful companion for your journey into parenthood. Track contractions with breathing guidance, log feedings, and navigate each phase with clarity.',
  keywords: ['pregnancy', 'contractions', 'contraction timer', 'feeding tracker', 'newborn', 'parenting', 'birth', 'labor'],
  authors: [{ name: 'Maay' }],
  applicationName: 'Maay',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Maay',
  },
  openGraph: {
    title: 'Maay',
    description: 'A calm, beautiful companion for your journey into parenthood.',
    type: 'website',
    siteName: 'Maay',
  },
  twitter: {
    card: 'summary',
    title: 'Maay',
    description: 'A calm, beautiful companion for your journey into parenthood.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FDFBF7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Maay" />
      </head>
      <body>
        {/* Skip link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

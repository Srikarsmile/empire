import type { Metadata, Viewport } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import PageTransition from '@/components/PageTransition';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://empirecarsosua.com'),
  title: 'Empire Cars Sosua | Airport Pickup and Daily Rentals',
  description: 'Premium car rentals in Sosua and Puerto Plata. Straightforward pricing, airport delivery, and a well-maintained fleet of cars, SUVs, and vans.',
  keywords: 'sosua car rental, puerto plata car rental, dominican republic rent a car, cabarete car rental',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [{ url: '/icon.png', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://empirecarsosua.com',
    title: 'Empire Cars Sosua | Airport Pickup and Daily Rentals',
    description: 'Premium car rentals in Sosua with transparent pricing and airport delivery.',
    siteName: 'Empire Cars Sosua',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Empire Cars Sosua',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Empire Cars Sosua | Airport Pickup and Daily Rentals',
    description: 'Reserve SUVs, compact cars, convertibles, and group vans in Sosua with airport pickup and transparent daily pricing.',
    images: ['/icon.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
      </head>
      <body className="bg-white text-[#1C2B3A] antialiased" suppressHydrationWarning>
        <a href="#app-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-bold focus:text-sm">
          Skip to main content
        </a>
        <AuthProvider>
          <Header />
          <main id="app-content" className="min-h-screen flex flex-col">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer currentYear={currentYear} />
          <LoginModal />
        </AuthProvider>
      </body>
    </html>
  );
}

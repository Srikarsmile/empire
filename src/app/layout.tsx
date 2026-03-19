import type { Metadata, Viewport } from 'next';
import { Inter, Caveat } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import PageTransition from '@/components/PageTransition';
import { getSiteContent } from '@/lib/siteContent';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-caveat',
  display: 'swap',
});

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
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();
  const siteContent = await getSiteContent();

  return (
    <html lang="en">
      <head />
      <body className={`${inter.variable} ${caveat.variable} bg-white text-[#1C2B3A] antialiased`} suppressHydrationWarning>
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
          <Footer currentYear={currentYear} footerData={siteContent.footer} />
          <LoginModal />
        </AuthProvider>
      </body>
    </html>
  );
}

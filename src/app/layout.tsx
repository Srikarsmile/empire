import type { Metadata } from 'next';
import { Manrope, Cormorant_Garamond } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GenieAssistant from '@/components/GenieAssistant';
import { getGenieProperties } from '@/lib/propertyData';
import '@phosphor-icons/web/regular';
import '@phosphor-icons/web/fill';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Empire Residential Apartments | Curated Stays',
  description: 'Discover premium apartments with a smoother booking experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const genieProperties = getGenieProperties();
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${cormorant.variable}`} suppressHydrationWarning>
        <Header />
        <main id="app-content">{children}</main>
        <Footer currentYear={currentYear} />
        <GenieAssistant properties={genieProperties} />
      </body>
    </html>
  );
}

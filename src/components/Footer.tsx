'use client';

import { usePathname } from 'next/navigation';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

interface FooterData {
  description: string;
  instagram: string;
  twitter: string;
  facebook: string;
  columns: Array<{ title: string; links: Array<{ title: string; url: string }> }>;
}

interface FooterProps {
  currentYear: number;
  footerData?: FooterData;
}

export default function Footer({ currentYear, footerData }: FooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <FlickeringFooter currentYear={currentYear} data={footerData} />;
}

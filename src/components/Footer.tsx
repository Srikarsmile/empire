'use client';

import { usePathname } from 'next/navigation';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

interface FooterProps {
  currentYear: number;
}

export default function Footer({ currentYear }: FooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <FlickeringFooter currentYear={currentYear} />;
}

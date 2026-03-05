'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { href: '/', label: 'Homes' },
  { href: '/bookings', label: 'Trips' },
  { href: '/how-it-works', label: 'How it works' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setIsScrolled((prev) => {
          if (y > 32) return true;
          if (y < 8) return false;
          return prev;
        });
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="shell header-shell">
        <Link href="/" className="brand-mark logo-surface" aria-label="Empire Residential homepage">
          <Image src="/logo.png" alt="Empire Residential" width={720} height={300} priority />
        </Link>

        <nav className="main-nav" aria-label="Primary navigation">
          {NAV_LINKS.map((item) => (
            <Link key={item.label} href={item.href} className="main-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link href="/bookings" className="btn-outline">
            My Bookings
          </Link>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            <i className={`ph ${menuOpen ? 'ph-x' : 'ph-list'}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="shell mobile-nav-inner">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="mobile-nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

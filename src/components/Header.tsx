'use client';

import Link from 'next/link';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

const NAV_LINKS = [
  { href: '/#fleet', label: 'Fleet' },
  { href: '/reservations', label: 'Reservations' },
  { href: '/how-to-rent', label: 'How it works' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const { openAuth, user, logout } = useAuth();

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

   return (
    <motion.header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-out",
        isScrolled ? "py-2" : "py-3 md:py-5"
      )}
      initial={false}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={cn(
        "mx-auto max-w-6xl transition-all duration-500",
        isScrolled ? "px-3" : "px-4 sm:px-6"
      )}>
        <div className={cn(
          "flex items-center justify-between rounded-2xl border px-5 py-2.5 backdrop-blur-xl transition-all duration-500",
          isScrolled
            ? "border-black/[0.08] bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)]"
            : "border-black/[0.04] bg-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        )}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className={cn(
              "flex w-auto items-center justify-center transition-all duration-500 group-hover:scale-105",
              isScrolled ? "h-[32px]" : "h-[36px]"
            )}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Empire Cars" className="h-full w-auto object-contain" />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative px-4 py-2 text-[13px] font-semibold tracking-wide uppercase text-neutral-500 transition-colors hover:text-neutral-900 rounded-lg"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {hoveredIndex === index && (
                  <motion.div
                    layoutId="nav-hover"
                    className="absolute inset-0 -z-10 rounded-lg bg-neutral-100/80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="hidden sm:flex items-center gap-3 mr-1">
                {user.isAdmin && (
                   <Link 
                     href="/admin" 
                     className="text-xs font-bold tracking-wide uppercase text-blue-600 hover:text-blue-800 transition-colors"
                   >
                     Admin
                   </Link>
                )}
                <button
                  onClick={logout}
                  className="text-xs font-semibold tracking-wide uppercase text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={openAuth}
                className="hidden sm:flex h-9 items-center justify-center rounded-lg px-4 text-[13px] font-semibold tracking-wide text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80 transition-all"
              >
                Log in
              </button>
            )}
            
            <Link
              href="/reservations"
              className="hidden sm:flex h-9 items-center justify-center rounded-lg bg-neutral-900 px-5 text-[13px] font-bold tracking-wide text-white transition-all hover:bg-black hover:shadow-md active:scale-[0.97] duration-200"
            >
              Reserve
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-200 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={menuOpen ? "close" : "menu"}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-x-4 top-[4.5rem] p-2 md:hidden origin-top"
          >
            <div className="rounded-2xl border border-[#E5E5E5] bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95 overflow-hidden">
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -15, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-4 py-3.5 text-base font-semibold text-[#111] transition-colors hover:bg-[#F5F5F5]"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                
                {/* Mobile Auth Actions */}
                <motion.div
                  initial={{ opacity: 0, x: -15, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  transition={{ delay: NAV_LINKS.length * 0.05, duration: 0.2 }}
                  className="mt-2 border-t border-gray-100 pt-2"
                >
                  {user ? (
                    <>
                      {user.isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="block w-full text-left rounded-xl px-4 py-3 text-base font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="block w-full text-left rounded-xl px-4 py-3 text-base font-semibold text-gray-500 transition-colors hover:bg-gray-50"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        openAuth();
                      }}
                      className="block w-full text-left rounded-xl px-4 py-3.5 text-base font-semibold text-[#111] transition-colors hover:bg-[#F5F5F5]"
                    >
                      Log in
                    </button>
                  )}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -15, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  transition={{ delay: (NAV_LINKS.length + 1) * 0.05, duration: 0.2 }}
                  className="mt-3"
                >
                  <Link
                    href="/reservations"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center justify-center rounded-xl bg-[#111] px-4 py-3.5 text-base font-bold text-white transition-colors hover:bg-[#333]"
                  >
                    Reserve Now
                  </Link>
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

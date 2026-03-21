'use client';

import Link from 'next/link';
import Image from 'next/image';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LayoutDashboard } from 'lucide-react';
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
          "flex items-center justify-between rounded-[1.75rem] border px-4 py-3 sm:px-5 sm:py-2.5 transition-all duration-500",
          isScrolled
            ? "border-[var(--border)] bg-[rgba(255,251,245,0.97)] shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
            : "border-[var(--border)] bg-[rgba(255,251,245,0.97)] shadow-[0_6px_18px_rgba(0,0,0,0.06)]"
        )}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className={cn(
              "relative flex w-auto items-center justify-center transition-all duration-500 group-hover:scale-[1.02]",
              isScrolled ? "h-[40px] sm:h-[42px]" : "h-[44px] sm:h-[48px]"
            )}>
              <Image
                src="/logo.png"
                alt="Empire Cars"
                width={3168}
                height={1344}
                priority
                className="h-full w-auto object-contain mix-blend-multiply"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((item, index) => {
              const isActive = item.href.startsWith('/#')
                ? pathname === '/'
                : pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    "relative px-4 py-2 text-[13px] tracking-wide uppercase rounded-lg transition-colors",
                    isActive
                      ? "nav-link--active"
                      : "font-semibold text-[var(--ink-500)] hover:text-[var(--ink-900)]"
                  )}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {hoveredIndex === index && !isActive && (
                    <motion.div
                      layoutId="nav-hover"
                      className="absolute inset-0 -z-10 rounded-lg bg-[var(--accent-surface)]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="hidden sm:flex items-center gap-3 mr-1">
                {user.isAdmin && (
                   <Link
                     href="/admin"
                     className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg hover:bg-black transition-colors"
                   >
                     <LayoutDashboard className="w-3 h-3" />
                     Admin
                   </Link>
                )}
                <button
                  onClick={logout}
                  className="text-xs font-semibold tracking-wide uppercase text-[var(--ink-500)] hover:text-[var(--ink-700)] transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={openAuth}
                className="hidden sm:flex h-9 items-center justify-center rounded-lg px-4 text-[13px] font-semibold tracking-wide text-[var(--ink-500)] hover:text-[var(--ink-900)] hover:bg-[var(--accent-surface)] transition-all"
              >
                Log in
              </button>
            )}
            
            <Link
              href="/reservations"
              className="hidden sm:flex h-9 items-center justify-center rounded-lg bg-[var(--accent)] px-5 text-[13px] font-bold tracking-wide text-white transition-all hover:bg-[var(--accent-light)] hover:shadow-md active:scale-[0.97] duration-200"
            >
              Reserve
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] text-neutral-700 transition-colors hover:bg-[var(--surface-soft)] md:hidden"
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
            <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,251,245,0.97)] p-4 shadow-xl backdrop-blur-xl overflow-hidden">
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((item, i) => {
                  const isActive = item.href.startsWith('/#')
                    ? pathname === '/'
                    : pathname === item.href;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -15, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                      transition={{ delay: i * 0.05, duration: 0.2 }}
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "block rounded-xl px-4 py-3.5 text-base font-semibold transition-colors",
                          isActive
                            ? "text-[var(--accent-strong)] bg-[var(--accent-surface)]"
                            : "text-[var(--ink-900)] hover:bg-[var(--accent-surface)]"
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
                
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
                          className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-500" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="block w-full text-left rounded-xl px-4 py-3 text-base font-semibold text-[var(--ink-500)] transition-colors hover:bg-[var(--surface-soft)]"
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
                      className="block w-full text-left rounded-xl px-4 py-3.5 text-base font-semibold text-[var(--ink-900)] transition-colors hover:bg-[var(--accent-surface)]"
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
                    className="flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-3.5 text-base font-bold text-white transition-colors hover:bg-[var(--accent-light)]"
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

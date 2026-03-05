'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '@/components/Toast';

interface FooterProps {
  currentYear: number;
}

export default function Footer({ currentYear }: FooterProps) {
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubscribe = useCallback(() => {
    if (!email.trim()) {
      setToast({ message: 'Enter your email address first.', type: 'error' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setToast({ message: 'That email format looks invalid.', type: 'error' });
      return;
    }

    setEmail('');
    setToast({ message: 'Subscribed. We will send new stay drops weekly.', type: 'success' });
  }, [email]);

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand-col">
          <div className="footer-logo-wrap logo-surface">
            <Image src="/logo.png" alt="Empire Residential" className="footer-logo" width={720} height={300} />
          </div>
          <p>Premium apartments with a fast, low-friction booking journey.</p>
          <div className="footer-socials" aria-label="Social links">
            <a href="#" aria-label="Instagram">
              <i className="ph-fill ph-instagram-logo" />
            </a>
            <a href="#" aria-label="X">
              <i className="ph-fill ph-x-logo" />
            </a>
            <a href="#" aria-label="Facebook">
              <i className="ph-fill ph-facebook-logo" />
            </a>
          </div>
        </div>

        <div>
          <h4>Support</h4>
          <a href="#">Help center</a>
          <a href="#">Safety</a>
          <a href="#">Cancellation options</a>
        </div>

        <div>
          <h4>Hosting</h4>
          <a href="#">Become a partner</a>
          <a href="#">Property standards</a>
          <a href="#">Resource center</a>
        </div>

        <div>
          <h4>Stay Updated</h4>
          <p>Get fresh listings and local tips in your inbox.</p>
          <div className="newsletter-row">
            <input
              suppressHydrationWarning
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
            />
            <button className="btn-primary" onClick={handleSubscribe}>
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="shell footer-bottom">
        <p>&copy; {currentYear} Empire Residential Apartments</p>
        <div className="footer-legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Sitemap</a>
        </div>
      </div>

      <AnimatePresence>
        {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
      </AnimatePresence>
    </footer>
  );
}

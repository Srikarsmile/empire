'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="page-shell">
      <div className="shell" style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '6rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '28rem', marginInline: 'auto' }}>
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <a href="/" className="btn-outline">
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}

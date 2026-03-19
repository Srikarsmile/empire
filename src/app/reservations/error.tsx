'use client';

import { AlertCircle } from 'lucide-react';

export default function ReservationsError({ reset }: { reset: () => void }) {
  return (
    <div className="page-shell">
      <div className="shell error-state" style={{ minHeight: '60vh' }}>
        <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
        <h2>Unable to load reservations</h2>
        <p>Something went wrong. Please try again.</p>
        <button className="btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}

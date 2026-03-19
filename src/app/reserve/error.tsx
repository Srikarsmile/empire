'use client';

import { AlertCircle } from 'lucide-react';

export default function ReserveError({ reset }: { reset: () => void }) {
  return (
    <div className="page-shell">
      <div className="shell error-state" style={{ minHeight: '60vh' }}>
        <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
        <h2>Booking unavailable right now</h2>
        <p>We could not load this booking page. Please retry once.</p>
        <button className="btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}

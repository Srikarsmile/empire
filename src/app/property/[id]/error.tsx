'use client';

export default function PropertyError({ reset }: { reset: () => void }) {
  return (
    <div className="page-shell">
      <div className="shell error-state" style={{ minHeight: '60vh' }}>
        <i className="ph ph-warning-circle" />
        <h2>Property unavailable right now</h2>
        <p>We could not load this stay. Please retry once.</p>
        <button className="btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}

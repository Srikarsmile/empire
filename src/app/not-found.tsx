import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-shell">
      <div className="shell" style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '6rem' }}>
        <div style={{ fontSize: '4rem', fontWeight: 900, color: '#E5E5E5', marginBottom: '0.5rem' }}>
          404
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Page not found
        </h1>
        <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '28rem', marginInline: 'auto' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}

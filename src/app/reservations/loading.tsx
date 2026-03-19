export default function Loading() {
  return (
    <div className="page-shell">
      <div className="shell loading-stack" style={{ paddingTop: '7rem' }}>
        <div className="skeleton" style={{ height: '2rem', width: '16rem' }} />
        <div className="skeleton" style={{ height: '14rem', width: '100%', borderRadius: '1.5rem' }} />
        <div className="skeleton" style={{ height: '14rem', width: '100%', borderRadius: '1.5rem' }} />
        <div className="skeleton" style={{ height: '14rem', width: '100%', borderRadius: '1.5rem' }} />
      </div>
    </div>
  );
}

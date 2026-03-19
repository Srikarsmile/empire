export default function Loading() {
  return (
    <div className="page-shell">
      <div className="shell loading-stack" style={{ paddingTop: '7rem' }}>
        <div className="skeleton" style={{ height: '2rem', width: '12rem' }} />
        <div className="skeleton" style={{ height: '26rem', width: '100%', borderRadius: '1.5rem' }} />
        <div className="skeleton" style={{ height: '18rem', width: '100%', borderRadius: '1.5rem' }} />
      </div>
    </div>
  );
}

export default function PropertyLoading() {
  return (
    <div className="page-shell">
      <div className="shell loading-stack" style={{ paddingTop: '7rem' }}>
        <div className="skeleton" style={{ height: '1.4rem', width: '10rem' }} />
        <div className="skeleton" style={{ height: '3.2rem', width: '55%' }} />
        <div className="skeleton" style={{ height: '26rem', width: '100%', borderRadius: '1.5rem' }} />
        <div className="skeleton" style={{ height: '12rem', width: '100%', borderRadius: '1.5rem' }} />
      </div>
    </div>
  );
}

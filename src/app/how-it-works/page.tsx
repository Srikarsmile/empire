import Link from 'next/link';

const STEPS = [
  {
    icon: 'ph-fill ph-magnifying-glass',
    title: '1. Explore verified stays',
    body: 'Use location, dates, and amenities to shortlist apartments that match your plan and budget.',
  },
  {
    icon: 'ph-fill ph-sliders-horizontal',
    title: '2. Refine in seconds',
    body: 'Adjust guests, nightly budget, and essentials like WiFi or parking to narrow the best options quickly.',
  },
  {
    icon: 'ph-fill ph-check-circle',
    title: '3. Book with confidence',
    body: 'See transparent totals, live availability, and minimum-stay rules before you confirm your booking.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page-shell how-page">
      <section className="how-section">
        <div className="shell">
          <div className="how-head">
            <span className="hero-kicker">How it works</span>
            <h1>From search to stay in 3 simple steps</h1>
            <p>
              Empire Residential is built to keep booking clear and fast. Browse verified apartments, compare quickly, and
              reserve in minutes.
            </p>
          </div>

          <div className="how-grid">
            {STEPS.map((step) => (
              <article key={step.title} className="how-card">
                <i className={step.icon} />
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>

          <div className="how-cta-row">
            <Link href="/#stays" className="btn-primary">
              Browse all stays
            </Link>
            <Link href="/bookings" className="btn-outline">
              View trips
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

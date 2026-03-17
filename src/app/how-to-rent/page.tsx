import Link from 'next/link';
import { Car, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { ReactNode } from 'react';
import { getSiteContent } from '@/lib/siteContent';

const STEP_ICONS: ReactNode[] = [
  <Car key="car" className="w-5 h-5" />,
  <CalendarCheck key="cal" className="w-5 h-5" />,
  <CheckCircle2 key="check" className="w-5 h-5" />,
];

export default async function HowItWorksPage() {
  const content = await getSiteContent();
  const { headline, description, steps } = content.howToRent;

  return (
    <div className="page-shell how-page">
      <section className="how-section">
        <div className="shell">
          <div className="how-head">
            <span className="hero-kicker">How it works</span>
            <h1>{headline}</h1>
            <p>{description}</p>
          </div>

          <div className="how-grid">
            {steps.map((step, i) => (
              <article key={i} className="how-card">
                <div className="flex h-[2.1rem] w-[2.1rem] items-center justify-center rounded-[0.72rem] bg-[var(--accent-surface)] text-[var(--accent)]">
                  {STEP_ICONS[i] ?? STEP_ICONS[0]}
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>

          <div className="how-cta-row">
            <Link href="/#fleet" className="btn-primary">
              Browse the fleet
            </Link>
            <Link href="/reservations" className="btn-outline">
              View reservations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

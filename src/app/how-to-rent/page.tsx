import Link from 'next/link';
import { Car, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { ReactNode } from 'react';

const STEPS: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <Car className="w-5 h-5" />,
    title: '1. Choose the right vehicle',
    body: 'Browse compact cars, SUVs, convertibles, and group vans based on seats, daily price, and airport pickup options.',
  },
  {
    icon: <CalendarCheck className="w-5 h-5" />,
    title: '2. Lock in your dates',
    body: 'Select pickup and return days, review availability, and confirm the rental window that fits your flight or villa check-in.',
  },
  {
    icon: <CheckCircle2 className="w-5 h-5" />,
    title: '3. Arrive and drive',
    body: 'Review clear totals, submit your driver details, and meet the Empire team at the airport, hotel, villa, or agreed pickup point for handoff.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page-shell how-page">
      <section className="how-section">
        <div className="shell">
          <div className="how-head">
            <span className="hero-kicker">How it works</span>
            <h1>From landing to driving in 3 simple steps</h1>
            <p>
              Empire Car Rental keeps the Sosua rental process direct. Choose the right car, confirm dates, and get a clean
              handoff without the usual airport scramble.
            </p>
          </div>

          <div className="how-grid">
            {STEPS.map((step) => (
              <article key={step.title} className="how-card">
                <div className="flex h-[2.1rem] w-[2.1rem] items-center justify-center rounded-[0.72rem] bg-[var(--accent-surface)] text-[var(--accent)]">
                  {step.icon}
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

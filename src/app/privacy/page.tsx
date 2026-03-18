import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Empire Cars',
  description: 'How Empire Cars collects, uses, and protects your personal information.',
};

const LAST_UPDATED = 'March 18, 2026';

export default function PrivacyPolicyPage() {
  return (
    <div className="page-shell">
      <div className="shell">
        <div className="max-w-3xl mx-auto">

          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--ink-500)] hover:text-[var(--ink-900)] transition-colors mb-8">
            ← Back to home
          </Link>

          <h1 className="text-4xl font-bold text-[var(--ink-900)] mb-2">Privacy Policy</h1>
          <p className="text-sm text-[var(--ink-500)] mb-10">Last updated: {LAST_UPDATED}</p>

          <div className="space-y-8 text-[var(--ink-700)] leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">1. Who we are</h2>
              <p>
                Empire Cars (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a car rental company based in Sosua, Dominican Republic.
                We operate the website <strong>empirerentcar.com</strong> and the associated booking platform.
                This Privacy Policy explains what personal data we collect, how we use it, and your rights regarding that data.
              </p>
              <p className="mt-3">
                For any privacy-related questions, please contact us at{' '}
                <a href="mailto:info@empirerentcar.com" className="text-[var(--accent)] hover:underline">info@empirerentcar.com</a>.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">2. Data we collect</h2>
              <p className="mb-3">When you make a reservation or interact with our platform, we collect:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong>Identity data:</strong> first name, last name</li>
                <li><strong>Contact data:</strong> email address, phone number</li>
                <li><strong>Booking data:</strong> vehicle selected, pick-up and return dates, rental duration, drop-off location preference</li>
                <li><strong>Payment data:</strong> payment is processed entirely by Stripe — we never store your card number or CVV. We retain only the Stripe session ID for record-keeping.</li>
                <li><strong>Usage data:</strong> pages visited, browser type, and IP address (via standard server logs)</li>
              </ul>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">3. How we use your data</h2>
              <p className="mb-3">We use your personal data to:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Process and manage your reservation</li>
                <li>Send booking confirmation and receipt emails</li>
                <li>Contact you 24 hours before pickup to coordinate handoff details</li>
                <li>Respond to customer service enquiries</li>
                <li>Improve the website and booking experience</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="mt-3">We do <strong>not</strong> sell your personal data to third parties or use it for advertising.</p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">4. Third-party processors</h2>
              <p className="mb-3">We share data only with the processors necessary to deliver our service:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong>Stripe</strong> (stripe.com) — secure payment processing.
                  Stripe&rsquo;s privacy policy is available at{' '}
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">stripe.com/privacy</a>.
                </li>
                <li>
                  <strong>Resend</strong> (resend.com) — transactional email delivery for booking confirmations.
                  Resend&rsquo;s privacy policy is at{' '}
                  <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">resend.com/legal/privacy-policy</a>.
                </li>
              </ul>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">5. Data retention</h2>
              <p>
                We retain reservation records (including personal data) for <strong>3 years</strong> from the date of the booking.
                This period allows us to address disputes, comply with accounting requirements, and respond to legal requests.
                After this period, records are permanently deleted.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">6. Your rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
                <li><strong>Correction</strong> — ask us to correct inaccurate or incomplete data</li>
                <li><strong>Deletion</strong> — request that we delete your data, subject to legal retention obligations</li>
                <li><strong>Objection</strong> — object to processing of your data in certain circumstances</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, email us at{' '}
                <a href="mailto:info@empirerentcar.com" className="text-[var(--accent)] hover:underline">info@empirerentcar.com</a>.
                We will respond within 30 days.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">7. Security</h2>
              <p>
                We use industry-standard technical measures to protect your data, including HTTPS encryption for all data in transit
                and secure, access-controlled database storage. Payment data is handled exclusively by Stripe and never passes through our servers.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">8. Changes to this policy</h2>
              <p>
                We may update this Privacy Policy from time to time. When we do, we will update the &ldquo;Last updated&rdquo; date at the top of this page.
                Continued use of our service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-[var(--border)]">
            <Link href="/terms" className="text-sm text-[var(--ink-500)] hover:text-[var(--ink-900)] transition-colors">
              Read our Terms of Service →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

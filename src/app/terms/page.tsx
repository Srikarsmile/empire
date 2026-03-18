import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Empire Cars',
  description: 'Terms and conditions for renting a vehicle from Empire Cars in Sosua, Dominican Republic.',
};

const LAST_UPDATED = 'March 18, 2026';

export default function TermsOfServicePage() {
  return (
    <div className="page-shell">
      <div className="shell">
        <div className="max-w-3xl mx-auto">

          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--ink-500)] hover:text-[var(--ink-900)] transition-colors mb-8">
            ← Back to home
          </Link>

          <h1 className="text-4xl font-bold text-[var(--ink-900)] mb-2">Terms of Service</h1>
          <p className="text-sm text-[var(--ink-500)] mb-10">Last updated: {LAST_UPDATED}</p>

          <div className="space-y-8 text-[var(--ink-700)] leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">1. Agreement to terms</h2>
              <p>
                By accessing our website at <strong>empirerentcar.com</strong> or completing a vehicle reservation, you agree
                to be bound by these Terms of Service and all applicable laws and regulations.
                If you do not agree with any part of these terms, please do not use our service.
              </p>
              <p className="mt-3">
                These terms apply to all visitors, customers, and renters of Empire Cars, located in Sosua, Dominican Republic.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">2. Reservations and payment</h2>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>All reservations are confirmed only upon successful payment through our secure checkout (powered by Stripe).</li>
                <li>Prices shown on the platform include the base rental rate, applicable taxes, and any optional fees you have selected (airport drop-off, insurance).</li>
                <li>All prices are displayed and charged in <strong>US Dollars (USD)</strong>.</li>
                <li>You will receive a booking confirmation email at the address provided. Keep this for reference — it includes your booking reference number.</li>
                <li>We reserve the right to correct pricing errors. If a significant error is discovered after payment, we will contact you to confirm or cancel the booking.</li>
              </ul>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">3. Cancellation and refunds</h2>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong>More than 48 hours before pickup:</strong> Full refund minus any processing fees charged by Stripe.</li>
                <li><strong>24–48 hours before pickup:</strong> 50% refund.</li>
                <li><strong>Less than 24 hours before pickup:</strong> No refund.</li>
                <li>To request a cancellation, email us at{' '}
                  <a href="mailto:info@empirerentcar.com" className="text-[var(--accent)] hover:underline">info@empirerentcar.com</a> with your booking reference.</li>
                <li>Refunds are processed back to the original payment method within 5–10 business days.</li>
              </ul>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">4. Driver requirements</h2>
              <p className="mb-3">The following are required at the time of vehicle pickup. Failure to present these will result in the vehicle not being released and no refund will be issued.</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>A <strong>valid driver&rsquo;s licence</strong> in the renter&rsquo;s name (minimum 2 years of driving experience)</li>
                <li>A <strong>valid passport or national ID</strong></li>
                <li>The <strong>payment card used to make the booking</strong></li>
                <li>Minimum age: <strong>21 years</strong></li>
              </ul>
              <p className="mt-3">
                International licences are accepted. If your licence is not in Spanish or English, an International Driving Permit (IDP) is also required.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">5. Vehicle use</h2>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Vehicles must be returned on or before the agreed return date. Late returns may incur additional daily charges.</li>
                <li>Vehicles must be returned with the same fuel level as at pickup.</li>
                <li>Vehicles must not be driven off-road unless the specific vehicle was rented with that permission.</li>
                <li>Smoking inside vehicles is strictly prohibited. A cleaning fee will be charged if this rule is violated.</li>
                <li>Vehicles may not be taken outside the Dominican Republic.</li>
                <li>The renter is responsible for all traffic fines incurred during the rental period.</li>
              </ul>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">6. Damage and liability</h2>
              <p>
                The renter accepts full financial responsibility for any damage, loss, or theft of the vehicle during the rental period.
                You are required to report any accident or damage to Empire Cars immediately, and to file a police report where applicable.
              </p>
              <p className="mt-3">
                Optional insurance coverage can be added during booking. If insurance is not purchased, the renter bears the full cost of repairs up to the vehicle&rsquo;s market value.
              </p>
              <p className="mt-3">
                Empire Cars is not liable for personal belongings left in the vehicle, nor for indirect or consequential losses arising from vehicle breakdowns or accidents.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">7. Airport and location drop-off</h2>
              <p>
                If you have selected an airport or specific drop-off location at the time of booking, an additional fee applies as shown during checkout.
                Our team will contact you before pickup to confirm the exact handoff time and location.
              </p>
              <p className="mt-3">
                Empire Cars is not responsible for delays caused by flight schedule changes, traffic, or circumstances outside our control.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">8. Governing law</h2>
              <p>
                These terms are governed by and construed in accordance with the laws of the <strong>Dominican Republic</strong>.
                Any disputes shall be subject to the exclusive jurisdiction of the courts of the Dominican Republic.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">9. Changes to these terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will update the &ldquo;Last updated&rdquo; date at the top of this page.
                Continued use of our service after changes are made constitutes your acceptance of the new terms.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">10. Contact</h2>
              <p>
                Questions about these terms? Email us at{' '}
                <a href="mailto:info@empirerentcar.com" className="text-[var(--accent)] hover:underline">info@empirerentcar.com</a>{' '}
                or call/WhatsApp us during business hours (Mo–Su, 08:00–20:00 AST).
              </p>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-[var(--border)]">
            <Link href="/privacy" className="text-sm text-[var(--ink-500)] hover:text-[var(--ink-900)] transition-colors">
              Read our Privacy Policy →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

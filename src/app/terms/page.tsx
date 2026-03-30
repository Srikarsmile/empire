import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Empire Cars',
  description: 'Terms and conditions for renting a vehicle from Empire Cars in Sosua, Dominican Republic.',
};

const LAST_UPDATED = 'March 19, 2026';

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
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">1. Agreement to Terms</h2>
              <p>
                By accessing or using the website at <strong>empirerentcar.com</strong> (the &ldquo;Platform&rdquo;) or completing
                a vehicle reservation, you (&ldquo;Renter&rdquo;, &ldquo;you&rdquo;, &ldquo;your&rdquo;) agree to be legally bound by
                these Terms of Service (&ldquo;Terms&rdquo;), our{' '}
                <Link href="/privacy" className="text-[var(--accent)] hover:underline">Privacy Policy</Link>, and all
                applicable laws and regulations of the Dominican Republic.
              </p>
              <p className="mt-3">
                If you do not agree with any provision of these Terms, you must discontinue use of the Platform immediately.
                These Terms constitute a binding agreement between you and Empire Cars (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;),
                a car rental business operating in Sosua, Puerto Plata, Dominican Republic.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">2. Eligibility &amp; Driver Requirements</h2>
              <p className="mb-3">To rent a vehicle from Empire Cars, you must meet the following criteria:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Be at least <strong>21 years of age</strong> at the time of pickup.</li>
                <li>Hold a <strong>valid, full driving licence</strong> issued at least 2 years prior to the rental date.</li>
                <li>Present a <strong>valid passport or government-issued photo ID</strong> at pickup.</li>
                <li>If your licence is not issued in English or Spanish, you must also carry an <strong>International Driving Permit (IDP)</strong>.</li>
                <li>Present the <strong>payment card used to complete the booking</strong> at the time of pickup.</li>
              </ul>
              <p className="mt-3">
                Failure to present any of the above documents at the time of vehicle collection will result in the vehicle not
                being released and <strong>no refund</strong> will be issued.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">3. Reservations &amp; Pricing</h2>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>All reservations are confirmed only upon successful payment through our secure checkout (powered by <strong>Stripe</strong>).</li>
                <li>Prices displayed on the Platform include the base daily rental rate. Applicable taxes, optional insurance, and delivery fees are itemised separately at checkout.</li>
                <li>All prices are displayed and charged in <strong>US Dollars (USD)</strong>. Your bank may apply its own currency conversion fees if you are paying from a non-USD account.</li>
                <li>You will receive a confirmation email containing your booking reference number, rental summary, and pickup instructions. Please retain this for your records.</li>
                <li>We reserve the right to correct obvious pricing errors. If a material error is discovered after payment, we will contact you to confirm or cancel the booking, offering a full refund if you choose not to proceed.</li>
                <li>Quoted prices are valid only at the time of booking. We do not retrospectively honour expired promotional rates.</li>
              </ul>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">4. Cancellation &amp; Refund Policy</h2>
              <p className="mb-3">Cancellation charges are determined by the time remaining before the scheduled pickup:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-[var(--border)] rounded-lg overflow-hidden">
                  <thead className="bg-[var(--surface-raised)]">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-semibold text-[var(--ink-900)]">Notice Period</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-[var(--ink-900)]">Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-2.5">More than 48 hours before pickup</td>
                      <td className="px-4 py-2.5">Full refund (minus Stripe processing fees)</td>
                    </tr>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-2.5">24–48 hours before pickup</td>
                      <td className="px-4 py-2.5">50% refund</td>
                    </tr>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-2.5">Less than 24 hours before pickup</td>
                      <td className="px-4 py-2.5">No refund</td>
                    </tr>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-2.5">No-show (failure to collect)</td>
                      <td className="px-4 py-2.5">No refund</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ul className="list-disc list-inside space-y-2 pl-2 mt-4">
                <li>To request a cancellation, email <a href="mailto:nicolas@cometsports.co.uk" className="text-[var(--accent)] hover:underline">nicolas@cometsports.co.uk</a> with your booking reference number.</li>
                <li>Approved refunds are processed back to the original payment method within <strong>5–10 business days</strong>.</li>
                <li>If Empire Cars cancels a booking due to vehicle unavailability or force majeure, you will receive a <strong>full refund</strong> or the option to rebook at no additional cost.</li>
              </ul>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">5. Vehicle Pickup &amp; Return</h2>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Vehicles are available for pickup during our operating hours: <strong>Monday–Sunday, 08:00–20:00 (AST)</strong>.</li>
                <li>If airport or hotel delivery has been selected at checkout, our team will contact you prior to your arrival to confirm the handoff time and location.</li>
                <li>A <strong>vehicle condition report</strong> will be completed jointly at the time of pickup. Both parties must acknowledge and sign the report. You are encouraged to take photographs of the vehicle before departing.</li>
                <li>Vehicles must be returned at the agreed date, time, and location. A <strong>grace period of 1 hour</strong> is permitted. Beyond that, an additional full-day charge will apply.</li>
                <li>We are not responsible for delays caused by flight cancellations, traffic, adverse weather, or other circumstances beyond our control.</li>
              </ul>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">6. Fuel Policy</h2>
              <p>
                Vehicles are provided with a specific fuel level recorded at pickup. You must return the vehicle with the
                <strong> same fuel level</strong>. If the vehicle is returned with less fuel than at pickup, a refuelling charge
                will apply based on local fuel prices plus a <strong>service fee of $15 USD</strong>.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">7. Vehicle Use &amp; Restrictions</h2>
              <p className="mb-3">During the rental period, the following rules apply to all renters:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Only the <strong>named renter</strong> (and any pre-approved additional drivers) may operate the vehicle.</li>
                <li>Vehicles must not be driven off-road unless the specific vehicle was rented with explicit off-road permission.</li>
                <li><strong>Smoking</strong> inside the vehicle is strictly prohibited. A cleaning fee of <strong>$150 USD</strong> will be charged for violations.</li>
                <li>Vehicles may <strong>not</strong> be taken outside the Dominican Republic under any circumstances.</li>
                <li>Vehicles may not be used for commercial purposes, racing, towing, or transporting hazardous materials.</li>
                <li>The renter is responsible for all <strong>traffic fines, toll charges, and parking violations</strong> incurred during the rental period.</li>
                <li>Pets are permitted only with prior written approval. An additional cleaning fee may apply.</li>
                <li>The renter must comply with all traffic laws of the Dominican Republic at all times.</li>
              </ul>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">8. Insurance &amp; Damage Liability</h2>
              <p className="mb-3">
                Basic third-party liability is included with every rental. Optional Collision Damage Waiver (CDW) coverage is available at checkout
                and is strongly recommended.
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong>Without CDW:</strong> The renter is fully responsible for the cost of repairs or replacement for any damage, loss, or theft during the rental period, up to the full market value of the vehicle.</li>
                <li><strong>With CDW:</strong> The renter&rsquo;s liability is reduced to the stated excess amount shown at checkout. CDW does not cover damage to tyres, windscreen, undercarriage, interior, or loss of keys.</li>
                <li>All accidents, damage, or theft <strong>must be reported to Empire Cars immediately</strong> by phone or WhatsApp. A police report must be filed for all incidents involving third parties.</li>
                <li>Insurance does not cover damage resulting from negligence, intoxication, reckless driving, or use of the vehicle in violation of these Terms.</li>
              </ul>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">9. Security Deposit</h2>
              <p>
                A <strong>security deposit</strong> may be required at the time of pickup, depending on the vehicle category.
                The deposit amount will be communicated prior to pickup. The deposit is held as a pre-authorisation on your card
                and released within <strong>7–14 business days</strong> after the vehicle is returned in satisfactory condition.
                The deposit may be used to cover unpaid fines, fuel shortages, damage, or excessive cleaning requirements.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">10. Breakdowns &amp; Roadside Assistance</h2>
              <p>
                In the event of a mechanical breakdown that is not caused by driver negligence, Empire Cars will arrange a replacement
                vehicle or repair at no additional charge. Contact us immediately by phone or WhatsApp. We are not liable for
                indirect losses, missed flights, accommodation costs, or any consequential damages arising from breakdowns or delays.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">11. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Empire Cars shall not be liable for any indirect, incidental, special,
                or consequential damages arising out of or in connection with your rental. Our total aggregate liability shall not exceed
                the total rental amount paid for the booking in question. Empire Cars is not responsible for personal belongings left in the vehicle.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">12. Intellectual Property</h2>
              <p>
                All content on the Platform — including text, graphics, logos, images, and software — is the property of Empire Cars
                or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or
                create derivative works from any content without our prior written consent.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">13. Governing Law &amp; Dispute Resolution</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of the <strong>Dominican Republic</strong>.
                Any dispute arising out of these Terms or your use of our services shall first be addressed through good-faith negotiation.
                If unresolved within 30 days, the dispute shall be submitted to the exclusive jurisdiction of the courts of
                Puerto Plata, Dominican Republic.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">14. Modifications to These Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Material changes will be reflected by updating the
                &ldquo;Last updated&rdquo; date at the top of this page. Your continued use of the Platform or services after
                such changes constitutes your acceptance of the revised Terms. We encourage you to review this page periodically.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">15. Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding these Terms of Service, please contact us:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 mt-3">
                <li><strong>Email:</strong>{' '}
                  <a href="mailto:nicolas@cometsports.co.uk" className="text-[var(--accent)] hover:underline">nicolas@cometsports.co.uk</a>
                </li>
                <li><strong>WhatsApp:</strong>{' '}
                  <a href="https://wa.me/18495360261" className="text-[var(--accent)] hover:underline">+1(849) 536-0261</a>
                </li>
                <li><strong>Business hours:</strong> Monday–Sunday, 08:00–20:00 (AST)</li>
              </ul>
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

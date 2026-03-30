import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Empire Cars',
  description: 'How Empire Cars collects, uses, and protects your personal information.',
};

const LAST_UPDATED = 'March 19, 2026';

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
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">1. Who We Are</h2>
              <p>
                Empire Cars (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a vehicle rental company based in Sosua, Puerto Plata,
                Dominican Republic. We operate the website <strong>empirerentcar.com</strong> (the &ldquo;Platform&rdquo;) and the
                associated booking system.
              </p>
              <p className="mt-3">
                This Privacy Policy explains what personal data we collect, how we process and protect it, who we share it with,
                and what rights you have. It applies to all visitors, customers, and users of the Platform.
              </p>
              <p className="mt-3">
                For any privacy-related enquiries, please contact us at{' '}
                <a href="mailto:nicolas@cometsports.co.uk" className="text-[var(--accent)] hover:underline">nicolas@cometsports.co.uk</a>.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">2. Data We Collect</h2>
              <p className="mb-3">We collect personal data in the following categories when you interact with our Platform:</p>

              <h3 className="text-base font-semibold text-[var(--ink-900)] mt-4 mb-2">a) Information you provide directly</h3>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong>Identity data:</strong> first name, last name, date of birth (where applicable)</li>
                <li><strong>Contact data:</strong> email address, phone number</li>
                <li><strong>Booking data:</strong> vehicle selected, pickup and return dates, rental duration, delivery location preference, special requests</li>
                <li><strong>Driver documentation:</strong> driving licence number and issuing country (collected at pickup for verification purposes only)</li>
              </ul>

              <h3 className="text-base font-semibold text-[var(--ink-900)] mt-4 mb-2">b) Information collected automatically</h3>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong>Device data:</strong> browser type, operating system, screen resolution</li>
                <li><strong>Usage data:</strong> pages visited, time spent on pages, referral source</li>
                <li><strong>Network data:</strong> IP address, approximate geolocation (country/city level only)</li>
              </ul>

              <h3 className="text-base font-semibold text-[var(--ink-900)] mt-4 mb-2">c) Payment information</h3>
              <p>
                All payments are processed securely by <strong>Stripe</strong>. We <strong>never</strong> receive, store, or
                have access to your full card number, expiration date, or CVV. We retain only the Stripe payment session ID
                and transaction status for our records.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">3. How We Use Your Data</h2>
              <p className="mb-3">We process your personal data for the following purposes:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-[var(--border)] rounded-lg overflow-hidden">
                  <thead className="bg-[var(--surface-raised)]">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-semibold text-[var(--ink-900)]">Purpose</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-[var(--ink-900)]">Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-2.5">Processing and managing your reservation</td>
                      <td className="px-4 py-2.5">Contractual necessity</td>
                    </tr>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-2.5">Sending booking confirmations and receipts</td>
                      <td className="px-4 py-2.5">Contractual necessity</td>
                    </tr>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-2.5">Coordinating vehicle pickup and return</td>
                      <td className="px-4 py-2.5">Contractual necessity</td>
                    </tr>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-2.5">Responding to customer service enquiries</td>
                      <td className="px-4 py-2.5">Legitimate interest</td>
                    </tr>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-2.5">Improving the Platform and user experience</td>
                      <td className="px-4 py-2.5">Legitimate interest</td>
                    </tr>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-2.5">Fraud prevention and security</td>
                      <td className="px-4 py-2.5">Legitimate interest</td>
                    </tr>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-2.5">Complying with legal and tax obligations</td>
                      <td className="px-4 py-2.5">Legal obligation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4">We do <strong>not</strong> sell, rent, or trade your personal data to any third party for marketing or advertising purposes.</p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">4. Third-Party Service Providers</h2>
              <p className="mb-3">We share data only with trusted third-party processors that are necessary to deliver our service:</p>
              <ul className="list-disc list-inside space-y-3 pl-2">
                <li>
                  <strong>Stripe</strong> (stripe.com) — secure payment processing. Stripe is PCI DSS Level 1 certified.
                  <br />
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline text-sm">View Stripe&rsquo;s Privacy Policy →</a>
                </li>
                <li>
                  <strong>Resend</strong> (resend.com) — transactional email delivery for booking confirmations and receipts.
                  <br />
                  <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline text-sm">View Resend&rsquo;s Privacy Policy →</a>
                </li>
              </ul>
              <p className="mt-3">
                These providers process data solely on our behalf and are contractually obligated to protect your information.
                We do not share your data with any other third parties.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">5. Cookies &amp; Tracking Technologies</h2>
              <p>
                Our Platform uses <strong>essential cookies only</strong> — these are strictly necessary for the website to function
                correctly (e.g., maintaining your session during the booking process). We do <strong>not</strong> use advertising cookies,
                tracking pixels, or third-party analytics services that profile your behaviour across websites.
              </p>
              <p className="mt-3">
                Because we use only essential cookies, separate cookie consent is not required under most data protection regulations.
                If this changes in the future, we will update this policy and implement a consent mechanism.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">6. Data Retention</h2>
              <p>We retain your personal data for the following periods:</p>
              <ul className="list-disc list-inside space-y-2 pl-2 mt-3">
                <li><strong>Booking records</strong> (including identity and contact data): <strong>3 years</strong> from the date of the rental — to address disputes, meet accounting requirements, and respond to legal requests.</li>
                <li><strong>Payment records</strong> (Stripe session IDs and transaction references): <strong>7 years</strong> — to comply with financial record-keeping obligations.</li>
                <li><strong>Usage data</strong> (server logs, IP addresses): <strong>90 days</strong> — for security and debugging purposes.</li>
              </ul>
              <p className="mt-3">After the applicable retention period, records are permanently and irreversibly deleted or anonymised.</p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">7. Your Privacy Rights</h2>
              <p className="mb-3">
                Depending on your location, you may have one or more of the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong>Right of Access</strong> — request a copy of the personal data we hold about you.</li>
                <li><strong>Right to Rectification</strong> — ask us to correct any inaccurate or incomplete data.</li>
                <li><strong>Right to Erasure</strong> — request that we delete your personal data, subject to any legal retention obligations.</li>
                <li><strong>Right to Restriction</strong> — ask us to limit the processing of your data in certain circumstances.</li>
                <li><strong>Right to Data Portability</strong> — receive your data in a structured, machine-readable format.</li>
                <li><strong>Right to Object</strong> — object to the processing of your data where it is based on legitimate interest.</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, email us at{' '}
                <a href="mailto:nicolas@cometsports.co.uk" className="text-[var(--accent)] hover:underline">nicolas@cometsports.co.uk</a>.
                We will respond within <strong>30 calendar days</strong>. We may ask you to verify your identity before
                processing your request.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">8. International Data Transfers</h2>
              <p>
                Our servers are hosted in data centres that may be located outside the Dominican Republic. When your data is
                transferred internationally, we ensure appropriate safeguards are in place, including using service providers
                that comply with recognised data protection frameworks. By using our Platform, you consent to the transfer of
                your data to these locations for the purposes described in this policy.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">9. Data Security</h2>
              <p>
                We implement industry-standard technical and organisational measures to protect your personal data, including:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 mt-3">
                <li><strong>HTTPS encryption</strong> for all data transmitted between your browser and our servers.</li>
                <li><strong>Secure, access-controlled database storage</strong> with regular backups.</li>
                <li><strong>PCI-compliant payment processing</strong> through Stripe — card details never touch our servers.</li>
                <li><strong>Role-based access controls</strong> limiting staff access to personal data on a need-to-know basis.</li>
              </ul>
              <p className="mt-3">
                While we take every reasonable precaution, no method of transmission over the internet or electronic storage is
                100% secure. We cannot guarantee absolute security but are committed to protecting your data to the best of our ability.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">10. Children&rsquo;s Privacy</h2>
              <p>
                Our Platform and services are not intended for individuals under the age of 18. We do not knowingly collect
                personal data from children. If you believe we have inadvertently collected data from a minor, please
                contact us immediately and we will take steps to delete it.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements,
                or services. When we make material changes, we will update the &ldquo;Last updated&rdquo; date at the top of this page.
                Your continued use of the Platform after any changes constitutes your acceptance of the revised policy.
                We encourage you to review this page periodically.
              </p>
            </section>

            <div className="border-t border-[var(--border)]" />

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink-900)] mb-3">12. Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data,
                please get in touch:
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
            <Link href="/terms" className="text-sm text-[var(--ink-500)] hover:text-[var(--ink-900)] transition-colors">
              Read our Terms of Service →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

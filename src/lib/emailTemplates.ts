/**
 * Empire Cars Sosua — Professional HTML Email Templates
 */

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface BookingEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleTitle: string;
  vehicleImage: string;
  checkIn: string;
  checkOut: string;
  nights: string | number;
  subtotal: string | number;
  taxes: string | number;
  airportFee?: string | number;
  insuranceFee?: string | number;
  dropoffLocation?: string;
  total: string | number;
  bookingRef: string;
  appUrl: string;
  adminPhone?: string | null;
}

export function buildConfirmationEmail(data: BookingEmailData): { subject: string; html: string } {
  const {
    firstName,
    vehicleTitle,
    vehicleImage,
    checkIn,
    checkOut,
    nights,
    subtotal,
    taxes,
    airportFee,
    insuranceFee,
    dropoffLocation,
    total,
    bookingRef,
    appUrl,
    adminPhone,
  } = data;

  const airportFeeNum = Number(airportFee ?? 0);
  const insuranceFeeNum = Number(insuranceFee ?? 0);

  const subject = `Booking confirmed — ${vehicleTitle} · Ref #${bookingRef}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px 16px 0 0;padding:28px 32px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">🚗 Empire Cars Sosua</p>
                    <p style="margin:6px 0 0;font-size:13px;color:#999999;letter-spacing:0.5px;text-transform:uppercase;">Booking Confirmation</p>
                  </td>
                  <td align="right">
                    <p style="margin:0;background:#27272a;border-radius:8px;padding:8px 14px;font-size:12px;color:#a1a1aa;display:inline-block;">
                      Ref <strong style="color:#ffffff;">#${bookingRef}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero vehicle image -->
          ${vehicleImage ? `
          <tr>
            <td style="padding:0;">
              <img
                src="${vehicleImage}"
                alt="${vehicleTitle}"
                width="600"
                style="width:100%;max-width:600px;display:block;object-fit:cover;height:240px;"
              />
            </td>
          </tr>` : ''}

          <!-- Main card -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-radius:${vehicleImage ? '0' : '16px 16px'} 16px 16px;">

              <!-- Greeting -->
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#111111;letter-spacing:-0.5px;">
                Your rental is confirmed ✓
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                Hi ${firstName}, great news! Your booking for <strong>${vehicleTitle}</strong> is confirmed and all set. See all the details below.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e4e4e7;margin:0 0 28px;" />

              <!-- Booking details table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td colspan="2" style="padding-bottom:12px;">
                    <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">Rental Details</p>
                  </td>
                </tr>
                <tr style="background:#f9f9fb;">
                  <td style="padding:12px 14px;border-radius:8px 0 0 0;font-size:13px;color:#71717a;font-weight:500;">Vehicle</td>
                  <td style="padding:12px 14px;border-radius:0 8px 0 0;font-size:14px;color:#111111;font-weight:600;">${vehicleTitle}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;font-size:13px;color:#71717a;font-weight:500;border-top:1px solid #f1f1f3;">Pickup date</td>
                  <td style="padding:12px 14px;font-size:14px;color:#111111;font-weight:600;border-top:1px solid #f1f1f3;">${formatDate(checkIn)}</td>
                </tr>
                <tr style="background:#f9f9fb;">
                  <td style="padding:12px 14px;font-size:13px;color:#71717a;font-weight:500;">Return date</td>
                  <td style="padding:12px 14px;font-size:14px;color:#111111;font-weight:600;">${formatDate(checkOut)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;font-size:13px;color:#71717a;font-weight:500;border-top:1px solid #f1f1f3;">Duration</td>
                  <td style="padding:12px 14px;font-size:14px;color:#111111;font-weight:600;border-top:1px solid #f1f1f3;">${nights} day${Number(nights) !== 1 ? 's' : ''}</td>
                </tr>
                ${dropoffLocation ? `
                <tr style="background:#f9f9fb;">
                  <td style="padding:12px 14px;font-size:13px;color:#71717a;font-weight:500;">Drop-off</td>
                  <td style="padding:12px 14px;font-size:14px;color:#111111;font-weight:600;">${dropoffLocation}</td>
                </tr>` : ''}
              </table>

              <!-- Price breakdown -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9fb;border-radius:12px;padding:20px;margin-bottom:28px;">
                <tr>
                  <td colspan="2" style="padding-bottom:12px;">
                    <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">Price Breakdown</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#52525b;">Vehicle rental (${nights} days)</td>
                  <td align="right" style="padding:6px 0;font-size:13px;color:#111111;font-weight:500;">$${subtotal}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#52525b;">Taxes &amp; fees</td>
                  <td align="right" style="padding:6px 0;font-size:13px;color:#111111;font-weight:500;">$${taxes}</td>
                </tr>
                ${airportFeeNum > 0 ? `
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#52525b;">Airport drop-off</td>
                  <td align="right" style="padding:6px 0;font-size:13px;color:#111111;font-weight:500;">$${airportFeeNum}</td>
                </tr>` : ''}
                ${insuranceFeeNum > 0 ? `
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#52525b;">Insurance</td>
                  <td align="right" style="padding:6px 0;font-size:13px;color:#111111;font-weight:500;">$${insuranceFeeNum}</td>
                </tr>` : ''}
                <tr>
                  <td colspan="2" style="padding-top:12px;border-top:1px solid #e4e4e7;"></td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:16px;font-weight:700;color:#111111;">Total paid</td>
                  <td align="right" style="padding:4px 0;font-size:18px;font-weight:800;color:#111111;">$${total}</td>
                </tr>
              </table>

              <!-- What to bring -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbf5;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:28px;">
                <tr>
                  <td>
                    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#92400e;">📋 What to bring at pickup</p>
                    <p style="margin:4px 0;font-size:13px;color:#78350f;">🪪 &nbsp;Valid driving licence</p>
                    <p style="margin:4px 0;font-size:13px;color:#78350f;">📘 &nbsp;Passport or national ID</p>
                    <p style="margin:4px 0;font-size:13px;color:#78350f;">💳 &nbsp;Payment card used for booking</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/reservations"
                       style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.2px;">
                      View My Booking →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Contact note -->
              <p style="margin:0;font-size:13px;color:#71717a;line-height:1.7;text-align:center;">
                Our team will contact you 24 hours before pickup to confirm the exact location and time.<br />
                ${adminPhone
                  ? `Questions? Call or WhatsApp us at <a href="tel:${adminPhone}" style="color:#111111;font-weight:600;">${adminPhone}</a>.`
                  : 'Questions? Reply to this email.'}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 16px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                Empire Cars Sosua &nbsp;·&nbsp; Sosua, Puerto Plata, Dominican Republic<br />
                <a href="${appUrl}" style="color:#a1a1aa;">${appUrl}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  return { subject, html };
}

/* ─────────────────────────────────────────────
   Cancellation Email
   ───────────────────────────────────────────── */

interface CancellationEmailData {
  firstName: string;
  vehicleTitle: string;
  checkIn: string;
  checkOut: string;
  bookingRef: string;
  appUrl: string;
  adminPhone?: string | null;
}

export function buildCancellationEmail(data: CancellationEmailData): { subject: string; html: string } {
  const { firstName, vehicleTitle, checkIn, checkOut, bookingRef, appUrl, adminPhone } = data;

  const subject = `Booking cancelled — ${vehicleTitle} · Ref #${bookingRef}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px 16px 0 0;padding:28px 32px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">🚗 Empire Cars Sosua</p>
                    <p style="margin:6px 0 0;font-size:13px;color:#999999;letter-spacing:0.5px;text-transform:uppercase;">Booking Cancellation</p>
                  </td>
                  <td align="right">
                    <p style="margin:0;background:#27272a;border-radius:8px;padding:8px 14px;font-size:12px;color:#a1a1aa;display:inline-block;">
                      Ref <strong style="color:#ffffff;">#${bookingRef}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;">

              <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#111111;letter-spacing:-0.5px;">
                Your booking has been cancelled
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                Hi ${firstName}, we're sorry to let you know that your reservation for <strong>${vehicleTitle}</strong> has been cancelled.
              </p>

              <hr style="border:none;border-top:1px solid #e4e4e7;margin:0 0 28px;" />

              <!-- Booking details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td colspan="2" style="padding-bottom:12px;">
                    <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">Cancelled Reservation</p>
                  </td>
                </tr>
                <tr style="background:#f9f9fb;">
                  <td style="padding:12px 14px;border-radius:8px 0 0 0;font-size:13px;color:#71717a;font-weight:500;">Vehicle</td>
                  <td style="padding:12px 14px;border-radius:0 8px 0 0;font-size:14px;color:#111111;font-weight:600;">${vehicleTitle}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;font-size:13px;color:#71717a;font-weight:500;border-top:1px solid #f1f1f3;">Pickup date</td>
                  <td style="padding:12px 14px;font-size:14px;color:#111111;font-weight:600;border-top:1px solid #f1f1f3;">${formatDate(checkIn)}</td>
                </tr>
                <tr style="background:#f9f9fb;">
                  <td style="padding:12px 14px;font-size:13px;color:#71717a;font-weight:500;">Return date</td>
                  <td style="padding:12px 14px;font-size:14px;color:#111111;font-weight:600;">${formatDate(checkOut)}</td>
                </tr>
              </table>

              <!-- Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:28px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6;">
                      If you paid online, any applicable refund will be processed according to our cancellation policy. Please allow 5–10 business days for the refund to appear.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Contact note -->
              <p style="margin:0;font-size:13px;color:#71717a;line-height:1.7;text-align:center;">
                If you have questions or believe this was a mistake, please contact us.<br />
                ${adminPhone
                  ? `Call or WhatsApp: <a href="tel:${adminPhone}" style="color:#111111;font-weight:600;">${adminPhone}</a>`
                  : 'Reply to this email and we\'ll be happy to help.'}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 16px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                Empire Cars Sosua &nbsp;·&nbsp; Sosua, Puerto Plata, Dominican Republic<br />
                <a href="${appUrl}" style="color:#a1a1aa;">${appUrl}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  return { subject, html };
}

/* ─────────────────────────────────────────────
   Pickup Reminder Email
   ───────────────────────────────────────────── */

interface ReminderEmailData {
  firstName: string;
  vehicleTitle: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  bookingRef: string;
  appUrl: string;
  adminPhone?: string | null;
}

export function buildReminderEmail(data: ReminderEmailData): { subject: string; html: string } {
  const { firstName, vehicleTitle, checkIn, checkOut, nights, bookingRef, appUrl, adminPhone } = data;

  const subject = `Reminder: Your ${vehicleTitle} rental starts tomorrow — Ref #${bookingRef}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px 16px 0 0;padding:28px 32px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">🚗 Empire Cars Sosua</p>
                    <p style="margin:6px 0 0;font-size:13px;color:#999999;letter-spacing:0.5px;text-transform:uppercase;">Pickup Reminder</p>
                  </td>
                  <td align="right">
                    <p style="margin:0;background:#27272a;border-radius:8px;padding:8px 14px;font-size:12px;color:#a1a1aa;display:inline-block;">
                      Ref <strong style="color:#ffffff;">#${bookingRef}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;">

              <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#111111;letter-spacing:-0.5px;">
                Your rental starts tomorrow!
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                Hi ${firstName}, just a reminder that your <strong>${vehicleTitle}</strong> rental starts tomorrow. We look forward to seeing you!
              </p>

              <hr style="border:none;border-top:1px solid #e4e4e7;margin:0 0 28px;" />

              <!-- Booking details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td colspan="2" style="padding-bottom:12px;">
                    <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">Rental Details</p>
                  </td>
                </tr>
                <tr style="background:#f9f9fb;">
                  <td style="padding:12px 14px;border-radius:8px 0 0 0;font-size:13px;color:#71717a;font-weight:500;">Vehicle</td>
                  <td style="padding:12px 14px;border-radius:0 8px 0 0;font-size:14px;color:#111111;font-weight:600;">${vehicleTitle}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;font-size:13px;color:#71717a;font-weight:500;border-top:1px solid #f1f1f3;">Pickup date</td>
                  <td style="padding:12px 14px;font-size:14px;color:#111111;font-weight:600;border-top:1px solid #f1f1f3;">${formatDate(checkIn)}</td>
                </tr>
                <tr style="background:#f9f9fb;">
                  <td style="padding:12px 14px;font-size:13px;color:#71717a;font-weight:500;">Return date</td>
                  <td style="padding:12px 14px;font-size:14px;color:#111111;font-weight:600;">${formatDate(checkOut)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;font-size:13px;color:#71717a;font-weight:500;border-top:1px solid #f1f1f3;">Duration</td>
                  <td style="padding:12px 14px;font-size:14px;color:#111111;font-weight:600;border-top:1px solid #f1f1f3;">${nights} day${nights !== 1 ? 's' : ''}</td>
                </tr>
              </table>

              <!-- What to bring -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbf5;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:28px;">
                <tr>
                  <td>
                    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#92400e;">📋 What to bring at pickup</p>
                    <p style="margin:4px 0;font-size:13px;color:#78350f;">🪪 &nbsp;Valid driving licence</p>
                    <p style="margin:4px 0;font-size:13px;color:#78350f;">📘 &nbsp;Passport or national ID</p>
                    <p style="margin:4px 0;font-size:13px;color:#78350f;">💳 &nbsp;Payment card used for booking</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/reservations"
                       style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.2px;">
                      View My Booking →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Contact note -->
              <p style="margin:0;font-size:13px;color:#71717a;line-height:1.7;text-align:center;">
                Our team will contact you to confirm the exact pickup location and time.<br />
                ${adminPhone
                  ? `Questions? Call or WhatsApp us at <a href="tel:${adminPhone}" style="color:#111111;font-weight:600;">${adminPhone}</a>.`
                  : 'Questions? Reply to this email.'}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 16px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                Empire Cars Sosua &nbsp;·&nbsp; Sosua, Puerto Plata, Dominican Republic<br />
                <a href="${appUrl}" style="color:#a1a1aa;">${appUrl}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  return { subject, html };
}

/* ─────────────────────────────────────────────
   Payment Request Email
   ───────────────────────────────────────────── */

interface PaymentRequestEmailData {
  firstName: string;
  vehicleTitle: string;
  vehicleImage: string;
  checkIn: string;
  checkOut: string;
  nights: string | number;
  total: string | number;
  paymentUrl: string;
  bookingRef: string;
  appUrl: string;
  adminPhone?: string | null;
}

export function buildPaymentRequestEmail(data: PaymentRequestEmailData): { subject: string; html: string } {
  const { firstName, vehicleTitle, vehicleImage, checkIn, checkOut, nights, total, paymentUrl, bookingRef, appUrl, adminPhone } = data;

  const subject = `Action required: Complete payment for ${vehicleTitle} · Ref #${bookingRef}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px 16px 0 0;padding:28px 32px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">🚗 Empire Cars Sosua</p>
                    <p style="margin:6px 0 0;font-size:13px;color:#999999;letter-spacing:0.5px;text-transform:uppercase;">Payment Required</p>
                  </td>
                  <td align="right">
                    <p style="margin:0;background:#27272a;border-radius:8px;padding:8px 14px;font-size:12px;color:#a1a1aa;display:inline-block;">
                      Ref <strong style="color:#ffffff;">#${bookingRef}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${vehicleImage ? `
          <tr>
            <td style="padding:0;">
              <img src="${vehicleImage}" alt="${vehicleTitle}" width="600"
                style="width:100%;max-width:600px;display:block;object-fit:cover;height:240px;" />
            </td>
          </tr>` : ''}

          <!-- Main card -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-radius:${vehicleImage ? '0' : '16px 16px'} 16px 16px;">

              <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#111111;letter-spacing:-0.5px;">
                Your booking is reserved — pay to confirm
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                Hi ${firstName}, we've reserved <strong>${vehicleTitle}</strong> for you. Complete your payment below to lock in your dates.
              </p>

              <hr style="border:none;border-top:1px solid #e4e4e7;margin:0 0 28px;" />

              <!-- Booking details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td colspan="2" style="padding-bottom:12px;">
                    <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">Reservation Details</p>
                  </td>
                </tr>
                <tr style="background:#f9f9fb;">
                  <td style="padding:12px 14px;border-radius:8px 0 0 0;font-size:13px;color:#71717a;font-weight:500;">Vehicle</td>
                  <td style="padding:12px 14px;border-radius:0 8px 0 0;font-size:14px;color:#111111;font-weight:600;">${vehicleTitle}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;font-size:13px;color:#71717a;font-weight:500;border-top:1px solid #f1f1f3;">Pickup date</td>
                  <td style="padding:12px 14px;font-size:14px;color:#111111;font-weight:600;border-top:1px solid #f1f1f3;">${formatDate(checkIn)}</td>
                </tr>
                <tr style="background:#f9f9fb;">
                  <td style="padding:12px 14px;font-size:13px;color:#71717a;font-weight:500;">Return date</td>
                  <td style="padding:12px 14px;font-size:14px;color:#111111;font-weight:600;">${formatDate(checkOut)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;font-size:13px;color:#71717a;font-weight:500;border-top:1px solid #f1f1f3;">Duration</td>
                  <td style="padding:12px 14px;font-size:14px;color:#111111;font-weight:600;border-top:1px solid #f1f1f3;">${nights} day${Number(nights) !== 1 ? 's' : ''}</td>
                </tr>
                <tr style="background:#f9f9fb;">
                  <td style="padding:12px 14px;font-size:13px;color:#71717a;font-weight:500;">Total due</td>
                  <td style="padding:12px 14px;font-size:16px;color:#111111;font-weight:800;">$${total}</td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${paymentUrl}"
                       style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:18px 48px;border-radius:12px;font-size:16px;font-weight:700;letter-spacing:0.2px;">
                      Pay Now — $${total} →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:12px;color:#a1a1aa;text-align:center;">
                This link is secure and takes you directly to our payment page. Your dates will be confirmed immediately after payment.
              </p>

              <!-- Contact note -->
              <p style="margin:0;font-size:13px;color:#71717a;line-height:1.7;text-align:center;">
                Questions about your booking?<br />
                ${adminPhone
                  ? `Call or WhatsApp us at <a href="tel:${adminPhone}" style="color:#111111;font-weight:600;">${adminPhone}</a>.`
                  : 'Reply to this email and we\'ll be happy to help.'}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 16px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                Empire Cars Sosua &nbsp;·&nbsp; Sosua, Puerto Plata, Dominican Republic<br />
                <a href="${appUrl}" style="color:#a1a1aa;">${appUrl}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  return { subject, html };
}

/* ─────────────────────────────────────────────
   OTP / Login Code Email
   ───────────────────────────────────────────── */

interface OtpEmailData {
  code: string;
  appUrl: string;
  expiresInMinutes?: number;
}

export function buildOtpEmail(data: OtpEmailData): { subject: string; html: string } {
  const { code, appUrl, expiresInMinutes = 5 } = data;

  const subject = `${code} is your Empire Cars login code`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px 16px 0 0;padding:28px 32px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">🚗 Empire Cars Sosua</p>
                    <p style="margin:6px 0 0;font-size:13px;color:#999999;letter-spacing:0.5px;text-transform:uppercase;">Login Verification</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;padding:36px 32px 32px;border-radius:0 0 16px 16px;">

              <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111111;letter-spacing:-0.4px;">
                Your login code
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                Use the code below to sign in to your Empire Cars account.
              </p>

              <!-- OTP Code Display -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:#f4f4f5;border:2px dashed #d4d4d8;border-radius:14px;padding:20px 40px;">
                      <p style="margin:0;font-size:42px;font-weight:900;color:#111111;letter-spacing:10px;font-variant-numeric:tabular-nums;">
                        ${code}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:#0369a1;">
                      ⏱ &nbsp;This code expires in <strong>${expiresInMinutes} minutes</strong>. Do not share it with anyone.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security notice -->
              <p style="margin:0 0 24px;font-size:13px;color:#71717a;line-height:1.6;text-align:center;">
                If you didn't request this code, you can safely ignore this email.<br />
                Someone may have entered your email address by mistake.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}"
                       style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:14px;font-weight:700;">
                      Go to Empire Cars →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 16px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                Empire Cars Sosua &nbsp;·&nbsp; Sosua, Puerto Plata, Dominican Republic<br />
                <a href="${appUrl}" style="color:#a1a1aa;">${appUrl}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  return { subject, html };
}

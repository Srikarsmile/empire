import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { findBySessionId, addReservation } from '@/lib/reservationStore';
import { buildConfirmationEmail, buildAdminBookingAlert } from '@/lib/emailTemplates';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ status: 'pending' }, { status: 402 });
    }

    // Deduplication guard — don't write twice on refresh
    const existing = await findBySessionId(sessionId);
    if (existing) {
      // If this was a payment_pending manual booking, upgrade it now
      if (existing.status === 'payment_pending') {
        await prisma.reservation.update({ where: { id: existing.id }, data: { status: 'upcoming' } });
        const veh = await prisma.vehicle.findUnique({ where: { id: existing.vehicleId } });
        if (veh) {
          const ranges = (veh.bookedRanges as unknown as { start: string; end: string }[]) ?? [];
          await prisma.vehicle.update({
            where: { id: existing.vehicleId },
            data: { bookedRanges: JSON.parse(JSON.stringify([...ranges, { start: existing.checkIn, end: existing.checkOut }])) },
          });
        }
        const appUrlPending = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empirerentcar.com';
        const scPending = await prisma.siteContent.findFirst();
        const scDataPending = (scPending?.data as Record<string, unknown>) ?? {};
        const adminPhonePending = (scDataPending.companyPhone as string) || (process.env.ADMIN_PHONE ? `+${process.env.ADMIN_PHONE}` : null);
        const bookingRefPending = existing.id.slice(-8).toUpperCase();
        const resendPending = new Resend(process.env.RESEND_API_KEY);
        const { subject: subPending, html: htmlPending } = buildConfirmationEmail({
          firstName: existing.firstName,
          lastName: existing.lastName,
          email: existing.email,
          phone: existing.phone,
          vehicleTitle: existing.vehicleTitle,
          vehicleImage: existing.vehicleImage,
          checkIn: existing.checkIn,
          checkOut: existing.checkOut,
          nights: existing.nights,
          subtotal: existing.subtotal,
          taxes: existing.taxes,
          airportFee: existing.airportFee,
          insuranceFee: existing.insuranceFee,
          dropoffLocation: existing.dropoffLocation,
          total: existing.total,
          bookingRef: bookingRefPending,
          appUrl: appUrlPending,
          adminPhone: adminPhonePending,
        });
        try {
          await resendPending.emails.send({
            from: 'Empire Cars <noreply@empirerentcar.com>',
            to: existing.email,
            subject: subPending,
            html: htmlPending,
          });
          const adminEmailPending = process.env.ADMIN_EMAIL;
          if (adminEmailPending) {
            const { subject: aSubject, html: aHtml } = buildAdminBookingAlert({
              firstName: existing.firstName,
              lastName: existing.lastName,
              email: existing.email,
              phone: existing.phone,
              vehicleTitle: existing.vehicleTitle,
              checkIn: existing.checkIn,
              checkOut: existing.checkOut,
              nights: existing.nights,
              total: existing.total,
              bookingRef: bookingRefPending,
              adminUrl: `${appUrlPending}/admin/reservations`,
            });
            await resendPending.emails.send({
              from: 'Empire Cars <noreply@empirerentcar.com>',
              to: adminEmailPending,
              subject: aSubject,
              html: aHtml,
            });
          }
        } catch (err) {
          console.error('Confirm: failed to send confirmation for payment_pending upgrade:', err);
        }
        return NextResponse.json({ ...existing, status: 'upcoming' });
      }
      return NextResponse.json(existing);
    }

    const meta = session.metadata ?? {};
    const reservation = await addReservation({
      stripeSessionId: sessionId,
      vehicleId: meta.vehicleId,
      vehicleTitle: meta.vehicleTitle,
      vehicleImage: meta.vehicleImage,
      checkIn: meta.checkIn,
      checkOut: meta.checkOut,
      nights: Number(meta.nights),
      price: Number(meta.price),
      subtotal: Number(meta.subtotal),
      taxes: Number(meta.taxes),
      airportFee: Number(meta.airportFee ?? 0),
      dropoffLocation: meta.dropoffLocation ?? '',
      insuranceFee: Number(meta.insuranceFee ?? 0),
      total: Number(meta.total),
      firstName: meta.firstName,
      lastName: meta.lastName,
      email: meta.email,
      phone: meta.phone,
    });

    // Best-effort: send confirmation email in case webhook is delayed or missed
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empirerentcar.com';
      const sc = await prisma.siteContent.findFirst();
      const scData = (sc?.data as Record<string, unknown>) ?? {};
      const adminPhone = (scData.companyPhone as string) || (process.env.ADMIN_PHONE ? `+${process.env.ADMIN_PHONE}` : null);
      const bookingRef = reservation.id.slice(-8).toUpperCase();
      const { subject, html } = buildConfirmationEmail({
        firstName: meta.firstName,
        lastName: meta.lastName,
        email: meta.email,
        phone: meta.phone,
        vehicleTitle: meta.vehicleTitle,
        vehicleImage: meta.vehicleImage,
        checkIn: meta.checkIn,
        checkOut: meta.checkOut,
        nights: meta.nights,
        subtotal: meta.subtotal,
        taxes: meta.taxes,
        airportFee: meta.airportFee,
        insuranceFee: meta.insuranceFee,
        dropoffLocation: meta.dropoffLocation,
        total: meta.total,
        bookingRef,
        appUrl,
        adminPhone,
      });
      await resend.emails.send({
        from: 'Empire Cars <noreply@empirerentcar.com>',
        to: meta.email,
        subject,
        html,
      });

      // Admin notification (best-effort)
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        try {
          const { subject: adminSubject, html: adminHtml } = buildAdminBookingAlert({
            firstName: meta.firstName,
            lastName: meta.lastName,
            email: meta.email,
            phone: meta.phone,
            vehicleTitle: meta.vehicleTitle,
            checkIn: meta.checkIn,
            checkOut: meta.checkOut,
            nights: meta.nights,
            total: meta.total,
            bookingRef,
            adminUrl: `${appUrl}/admin/reservations`,
          });
          await resend.emails.send({
            from: 'Empire Cars <noreply@empirerentcar.com>',
            to: adminEmail,
            subject: adminSubject,
            html: adminHtml,
          });
        } catch (adminErr) {
          console.error('Confirm route: failed to send admin notification:', adminErr);
        }
      }
    } catch (err) {
      console.error('Confirm route: failed to send confirmation email:', err);
    }

    return NextResponse.json(reservation);
  } catch (err) {
    console.error('Stripe confirm error:', err);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}

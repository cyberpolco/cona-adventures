'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { getBooking, clearBookingSession } from '../../lib/bookingSession';

export default function SuccessPage() {
  const router = useRouter();
  const { t }  = useApp();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    setBooking(getBooking());
  }, []);

  const ref      = booking?.ref      ?? 'CNA-00000';
  const email    = booking?.email    ?? 'your@email.com';
  const username = booking?.username ?? '';

  function goHome() {
    clearBookingSession();
    router.push('/');
  }

  return (
    <div className="page-shell success-wrap">
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div className="success-icon">🎉</div>

        <h2 className="cinzel" style={{ fontSize: '1.7rem', marginBottom: 8, color: 'var(--gold)' }}>
          {t('bookConfirmed')}
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: '0.875rem' }}>
          {t('bookConfirmedSub')}
        </p>

        <div className="ref-box">
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 4, fontFamily: "'Cinzel', serif", letterSpacing: '0.12em' }}>
            {t('bookRef')}
          </div>
          <div className="ref-num">{ref}</div>
        </div>

        <div className="email-toast">
          📧 <span>Confirmation &amp; itinerary sent to {email}</span>
        </div>

        {username && (
          <div className="credentials-box">
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 12 }}>
              YOUR PORTAL ACCESS
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 6 }}>Username</div>
            <div style={{ fontWeight: 700, color: 'var(--sand)', marginBottom: 12, fontFamily: "'Cinzel', serif" }}>
              @{username}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              A temporary password has been sent to your email. Login to track your booking, documents and itinerary.
            </div>
          </div>
        )}

        {/* Booking summary */}
        {booking?.tripData && (
          <div style={{
            background: 'var(--card)', borderRadius: 10, padding: 20,
            border: '1px solid var(--border)', textAlign: 'left', margin: '14px 0',
          }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 12 }}>TRIP SUMMARY</div>
            {[
              { label: 'Destination', value: { congo: '🌿 DR Congo', namibia: '🏜 Namibia', both: '✦ Both' }[booking.tripData.country] },
              { label: 'Travelers',   value: `${booking.tripData.adults} adult${booking.tripData.adults > 1 ? 's' : ''}${booking.tripData.children > 0 ? ` + ${booking.tripData.children} children` : ''}` },
              { label: 'Dates',       value: booking.tripData.arrival ? `${booking.tripData.arrival} → ${booking.tripData.departure}` : 'TBD' },
              { label: 'Paid',        value: `$${(booking.dueNow || 0).toLocaleString()} ${booking.payType === 'deposit' ? '(40% deposit)' : '(full)'}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={goHome}>{t('backHome')}</button>
          <button className="btn btn-outline" onClick={() => router.push('/dashboard')}>{t('viewDash')}</button>
        </div>
      </div>
    </div>
  );
}

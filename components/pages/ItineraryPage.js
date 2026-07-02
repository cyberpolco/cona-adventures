'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { estimatePrice } from '../../lib/pricing';
import { getTripData, setBooking } from '../../lib/bookingSession';

function buildDays(tripData) {
  if (!tripData) return [];
  const { country, experiences = [], accommodation, transport } = tripData;

  const days = [];
  let dayNum = 1;

  days.push({ day: dayNum++, icon: '✈️', title: 'Arrival & Transfer', desc: `Arrival at ${country === 'namibia' ? 'Windhoek (WDH)' : 'Kinshasa (FIH)'}. Airport transfer to ${accommodation || 'your lodge'}.` });

  experiences.forEach((exp) => {
    days.push({ day: dayNum++, icon: '🌟', title: exp, desc: `Full-day guided ${exp.toLowerCase()} experience with your expert guide and ${transport || 'private transport'}.` });
  });

  if (country === 'both') {
    days.push({ day: dayNum++, icon: '🛫', title: 'Inter-Country Transfer', desc: 'Flight between DR Congo and Namibia. Brief rest and orientation at new base.' });
  }

  days.push({ day: dayNum++, icon: '🏡', title: 'Departure Day', desc: 'Check-out and airport transfer. End of your CoNa Adventure.' });

  return days;
}

export default function ItineraryPage() {
  const { t, lang } = useApp();
  const router = useRouter();
  const [tripData, setTripData] = useState(null);

  useEffect(() => {
    setTripData(getTripData());
  }, []);

  if (tripData === null) return null; // waiting for hydration

  const days  = buildDays(tripData);
  const price = estimatePrice(tripData);

  function handleProceed() {
    setBooking({ tripData, price, days });
    router.push(`/${lang}/plan/payment`);
  }

  if (!tripData?.country) {
    return (
      <main id="main-content" className="page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', marginBottom: 16 }}>No itinerary yet — start by planning your trip.</p>
          <button className="btn btn-primary" onClick={() => router.push(`/${lang}/plan`)}>Plan My Adventure</button>
        </div>
      </main>
    );
  }

  const countryLabel = { congo: '🌿 DR Congo', namibia: '🏜 Namibia', both: '✦ Both Countries' }[tripData.country] || '';

  return (
    <main id="main-content" className="page-shell">
      <div className="itin-wrap">
        {/* Header */}
        <div className="itin-header">
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.12em', fontFamily: "var(--font-cinzel), serif", marginBottom: 6 }}>
              {t('yourItin')}
            </div>
            <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--sand)', marginBottom: 4 }}>
              {countryLabel} {t('adventure')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              {tripData.adults} adult{tripData.adults > 1 ? 's' : ''}
              {tripData.children > 0 ? ` · ${tripData.children} child${tripData.children > 1 ? 'ren' : ''}` : ''}
              {tripData.arrival ? ` · ${tripData.arrival}` : ''}
              {tripData.departure ? ` → ${tripData.departure}` : ''}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 4 }}>ESTIMATED TOTAL</div>
            <div className="price-total">${price.toLocaleString()}</div>
          </div>
        </div>

        {/* Experience highlights */}
        {tripData.experiences?.length > 0 && (
          <div style={{ marginBottom: 16, padding: '14px 18px', background: 'var(--card2)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 8, fontFamily: "var(--font-cinzel), serif", letterSpacing: '0.08em' }}>INCLUDED EXPERIENCES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tripData.experiences.map((exp) => <span key={exp} className="tag tag-g">{exp}</span>)}
            </div>
          </div>
        )}

        {/* Day cards */}
        {days.map((d) => (
          <div key={d.day} className="day-card">
            <div className="day-num">D{d.day}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span aria-hidden="true">{d.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sand)' }}>{d.title}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6 }}>{d.desc}</p>
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="step-nav" style={{ marginTop: 24 }}>
          <button className="btn-back" onClick={() => router.push(`/${lang}/plan`)}>{t('editTrip')}</button>
          <button className="btn-next" onClick={handleProceed}>{t('proceedBook')}</button>
        </div>
      </div>
    </main>
  );
}

// components/pages/ItineraryPage.js
import { useApp } from '../../context/AppContext';

function buildDays(tripData) {
  if (!tripData) return [];
  const { country, experiences = [], arrival, departure, accommodation, transport } = tripData;

  const days = [];
  let dayNum = 1;

  // Arrival day
  days.push({ day: dayNum++, icon: '✈️', title: 'Arrival & Transfer', desc: `Arrival at ${country === 'namibia' ? 'Windhoek (WDH)' : 'Kinshasa (FIH)'}. Airport transfer to ${accommodation || 'your lodge'}.` });

  // Experience days
  experiences.forEach((exp) => {
    days.push({ day: dayNum++, icon: '🌟', title: exp, desc: `Full-day guided ${exp.toLowerCase()} experience with your expert guide and ${transport || 'private transport'}.` });
  });

  // Rest / buffer day if multi-country
  if (country === 'both') {
    days.push({ day: dayNum++, icon: '🛫', title: 'Inter-Country Transfer', desc: 'Flight between DR Congo and Namibia. Brief rest and orientation at new base.' });
  }

  // Departure
  days.push({ day: dayNum++, icon: '🏡', title: 'Departure Day', desc: `Check-out and airport transfer. End of your CoNa Adventure.` });

  return days;
}

function estimatePrice(tripData) {
  if (!tripData) return 0;
  const { adults = 1, children = 0, experiences = [], country, accommodation } = tripData;
  const basePP  = country === 'both' ? 3800 : 1400;
  const expCost = experiences.length * 280;
  const luxMult = accommodation === 'Luxury Lodge' ? 1.4 : accommodation === 'Eco Camp' ? 1.1 : 1;
  return Math.round((basePP + expCost) * luxMult * (adults + children * 0.7));
}

export default function ItineraryPage() {
  const { t, tripData, showPage, setBooking } = useApp();

  const days  = buildDays(tripData);
  const price = estimatePrice(tripData);

  function handleProceed() {
    setBooking({ tripData, price, days });
    showPage('payment');
  }

  if (!tripData) {
    return (
      <div className="page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', marginBottom: 16 }}>No itinerary yet — start by planning your trip.</p>
          <button className="btn btn-primary" onClick={() => showPage('planner')}>Plan My Adventure</button>
        </div>
      </div>
    );
  }

  const countryLabel = { congo: '🌿 DR Congo', namibia: '🏜 Namibia', both: '✦ Both Countries' }[tripData.country] || '';

  return (
    <div className="page-shell">
      <div className="itin-wrap">
        {/* Header */}
        <div className="itin-header">
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.12em', fontFamily: "'Cinzel', serif", marginBottom: 6 }}>
              {t('yourItin')}
            </div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--sand)', marginBottom: 4 }}>
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
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 8, fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}>INCLUDED EXPERIENCES</div>
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
                <span>{d.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sand)' }}>{d.title}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6 }}>{d.desc}</p>
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="step-nav" style={{ marginTop: 24 }}>
          <button className="btn-back" onClick={() => showPage('planner')}>{t('editTrip')}</button>
          <button className="btn-next" onClick={handleProceed}>{t('proceedBook')}</button>
        </div>
      </div>
    </div>
  );
}

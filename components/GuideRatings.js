'use client';
// components/GuideRatings.js
import { useState } from 'react';
import { useApp } from '../context/AppContext';

const GUIDES = [
  { id: 1, name: 'Emmanuel Kabila', country: '🌿 Congo', specialty: 'Rainforest & River', initials: 'EK', color: '#163026', textColor: '#2C7A70' },
  { id: 2, name: 'Chloe Mwamba',    country: '🌿 Congo', specialty: 'Zipline & Canopy',   initials: 'CM', color: '#0a1208', textColor: '#7ab87a' },
  { id: 3, name: 'Petrus Nghitila', country: '🏜 Namibia', specialty: 'Safari & Etosha',  initials: 'PN', color: '#2a1200', textColor: '#e07050' },
  { id: 4, name: 'Anika Swartz',    country: '🏜 Namibia', specialty: 'Desert & Self-Drive', initials: 'AS', color: '#1a0800', textColor: '#E5A23C' },
];

function StarRating({ guideId, value, onChange, submitted }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="stars" aria-label={`Rating for guide ${guideId}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star${(hovered || value) >= n ? ' lit' : ''}`}
          role="button"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          tabIndex={submitted ? -1 : 0}
          onClick={() => !submitted && onChange(n)}
          onMouseEnter={() => !submitted && setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onKeyDown={(e) => e.key === 'Enter' && !submitted && onChange(n)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function GuideRatings() {
  const { t, showToast } = useApp();
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState({});

  function handleRate(guideId, value) {
    setRatings((r) => ({ ...r, [guideId]: value }));
  }

  function handleSubmit(guideId) {
    if (!ratings[guideId]) {
      showToast('Please select a star rating first.');
      return;
    }
    setSubmitted((s) => ({ ...s, [guideId]: true }));
    showToast(t('thankYou'));
  }

  return (
    <div className="rating-section">
      {GUIDES.map((g) => (
        <div key={g.id} className="guide-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              className="guide-avatar"
              style={{ background: g.color, color: g.textColor, border: `1px solid ${g.textColor}40` }}
            >
              {g.initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sand)', marginBottom: 2 }}>
                {g.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                {g.country} · {g.specialty}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            {submitted[g.id] ? (
              <div className="rated-badge">✓ RATED {ratings[g.id]}/5</div>
            ) : (
              <>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 4 }}>
                  {t('rateThis')}
                </div>
                <StarRating
                  guideId={g.id}
                  value={ratings[g.id] || 0}
                  onChange={(v) => handleRate(g.id, v)}
                  submitted={!!submitted[g.id]}
                />
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '0.72rem', padding: '6px 14px', marginTop: 4 }}
                  onClick={() => handleSubmit(g.id)}
                >
                  {t('submitRating')}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

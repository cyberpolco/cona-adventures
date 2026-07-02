'use client';
// components/pages/TripPlannerPage.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { getTripData, setTripData } from '../../lib/bookingSession';

const TOTAL_STEPS = 8;

const NATIONALITIES = [
  { flag: '🌍', name: 'Congolese (DRC)' }, { flag: '🇳🇦', name: 'Namibian' },
  { flag: '🇺🇸', name: 'American' }, { flag: '🇬🇧', name: 'British' },
  { flag: '🇫🇷', name: 'French' }, { flag: '🇩🇪', name: 'German' },
  { flag: '🇿🇦', name: 'South African' }, { flag: '🇰🇪', name: 'Kenyan' },
  { flag: '🇳🇬', name: 'Nigerian' }, { flag: '🇨🇦', name: 'Canadian' },
  { flag: '🇧🇪', name: 'Belgian' }, { flag: '🇳🇱', name: 'Dutch' },
  { flag: '🇮🇹', name: 'Italian' }, { flag: '🇪🇸', name: 'Spanish' },
  { flag: '🇵🇹', name: 'Portuguese' }, { flag: '🇯🇵', name: 'Japanese' },
  { flag: '🇦🇺', name: 'Australian' }, { flag: '🇧🇷', name: 'Brazilian' },
  { flag: '🇮🇳', name: 'Indian' }, { flag: '🇨🇳', name: 'Chinese' },
];

function NatSelect({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = NATIONALITIES.filter((n) => n.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="nat-select-wrap">
      <input
        className="nat-input"
        type="text"
        readOnly
        value={value}
        placeholder={placeholder || 'Select nationality'}
        onClick={() => setOpen((o) => !o)}
        style={{ cursor: 'pointer' }}
      />
      <div className={`nat-dropdown${open ? ' open' : ''}`}>
        <div className="nat-search">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        </div>
        {filtered.map((n) => (
          <div
            key={n.name}
            className="nat-option"
            onClick={() => { onChange(n.name); setOpen(false); setSearch(''); }}
          >
            <span>{n.flag}</span> {n.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function TravelerForm({ index, isLead, isChild, data, onChange }) {
  const { t } = useApp();
  return (
    <div className="traveler-card">
      <div className="traveler-card-header">
        <h4>
          {isLead ? t('leadTraveler') : `${t('traveler')} ${index + 1}`}
        </h4>
        <div>
          {isLead && <span className="badge badge-lead">LEAD</span>}
          {!isChild && !isLead && <span className="badge badge-adult">{t('adultLabel')}</span>}
          {isChild && <span className="badge badge-child">{t('childLabel')}</span>}
        </div>
      </div>
      <div className="three-col">
        <div>
          <label className="form-label">{t('firstName')}</label>
          <input type="text" value={data.firstName || ''} onChange={(e) => onChange('firstName', e.target.value)} />
        </div>
        <div>
          <label className="form-label">{t('middleName')}</label>
          <input type="text" value={data.middleName || ''} onChange={(e) => onChange('middleName', e.target.value)} />
        </div>
        <div>
          <label className="form-label">{t('lastName')}</label>
          <input type="text" value={data.lastName || ''} onChange={(e) => onChange('lastName', e.target.value)} />
        </div>
      </div>
      <div className="two-col">
        <div>
          <label className="form-label">{t('email')}</label>
          <input type="email" value={data.email || ''} onChange={(e) => onChange('email', e.target.value)} />
        </div>
        <div>
          <label className="form-label">{t('phone')}</label>
          <input type="tel" value={data.phone || ''} onChange={(e) => onChange('phone', e.target.value)} />
        </div>
      </div>
      <div className="two-col">
        <div>
          <label className="form-label">{t('dob')}</label>
          <input type="date" value={data.dob || ''} onChange={(e) => onChange('dob', e.target.value)} />
        </div>
        <div>
          <label className="form-label">{t('nationality')}</label>
          <NatSelect value={data.nationality || ''} onChange={(v) => onChange('nationality', v)} />
        </div>
      </div>
      <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(46,138,138,0.06)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text)' }}>
          <input
            type="checkbox"
            checked={data.consentGiven || false}
            onChange={(e) => onChange('consentGiven', e.target.checked)}
            style={{ marginTop: 2, cursor: 'pointer', accentColor: 'var(--gold)' }}
          />
          <span>
            I consent to CoNa Adventures collecting and processing my personal data (name, contact, date of birth, nationality) for booking confirmation, visa assistance, and travel arrangements. Data is securely stored and deleted 12 months after the trip (3 months for minors). You may request deletion at info@conaadventures.com.
          </span>
        </label>
      </div>
    </div>
  );
}

export default function TripPlannerPage() {
  const { t, showToast, lang } = useApp();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [country, setCountry]   = useState(null);
  const [experiences, setExps]  = useState([]);
  const [adults, setAdults]     = useState(2);
  const [children, setChildren] = useState(0);
  const [arrival, setArrival]   = useState('');
  const [departure, setDeparture] = useState('');
  const [flexible, setFlexible] = useState(false);
  const [accommodation, setAccommodation] = useState(null);
  const [transport, setTransport] = useState(null);
  const [services, setServices] = useState([]);
  const [travelers, setTravelers] = useState([{}]);

  // Hydrate pre-selected country from sessionStorage (set by map/exp card on home).
  useEffect(() => {
    const saved = getTripData();
    if (saved?.country) setCountry(saved.country);
  }, []);

  const EXPERIENCES_BY_COUNTRY = {
    congo:   ['Kasai Jungle Camp', 'Congo River Expedition', 'Rainforest Zipline', 'Gorilla Trek', 'Cultural Village Visit'],
    namibia: ['Etosha Safari', 'Sossusvlei Desert Trek', 'Self-Drive 4WD', 'Skeleton Coast Tour', 'Namib Naukluft Hike'],
    both:    ['Kasai Jungle Camp', 'Congo River Expedition', 'Etosha Safari', 'Sossusvlei Desert Trek', 'Grand Africa Journey'],
  };

  const availableExps = EXPERIENCES_BY_COUNTRY[country] || [];

  function toggleExp(exp) {
    setExps((e) => e.includes(exp) ? e.filter((x) => x !== exp) : [...e, exp]);
  }
  function toggleService(svc) {
    setServices((s) => s.includes(svc) ? s.filter((x) => x !== svc) : [...s, svc]);
  }

  function updateTraveler(idx, field, value) {
    setTravelers((ts) => {
      const copy = [...ts];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  const totalTravelers = adults + children;
  function syncTravelers(a, c) {
    const total = a + c;
    setTravelers((ts) => {
      const copy = [...ts];
      while (copy.length < total) copy.push({});
      return copy.slice(0, total);
    });
  }

  function canAdvance() {
    if (step === 1) return !!country;
    if (step === 2) return experiences.length > 0;
    if (step === 4) return !!arrival && !!departure;
    if (step === 5) return !!accommodation;
    if (step === 6) return !!transport;
    if (step === 8) {
      for (const traveler of travelers) {
        if (!traveler.firstName || !traveler.lastName) return false;
        if (!traveler.consentGiven) return false;
      }
      return true;
    }
    return true;
  }

  function handleNext() {
    if (!canAdvance()) {
      if (step === 8) { showToast('All travelers must complete their details and consent before continuing.'); return; }
      showToast('Please complete this step before continuing.');
      return;
    }
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else buildItinerary();
  }

  function buildItinerary() {
    const data = { country, experiences, adults, children, arrival, departure, flexible, accommodation, transport, services, travelers, consent: true };
    setTripData(data);
    router.push(`/${lang}/plan/itinerary`);
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const stepTitles = ['s1t','s2t','s3t','s4t','s5t','s6t','s7t','s8t'].map(t);
  const stepSubs   = ['s1s','s2s','',   '',   '',   '',   '',   's8s'].map(t);

  return (
    <main id="main-content" className="page-shell">
      <div className="planner-wrap">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="step-header">
          <div className="step-num">{step}</div>
          <div>
            <div className="step-title">{stepTitles[step - 1]}</div>
            {stepSubs[step - 1] && <div className="step-sub">{stepSubs[step - 1]}</div>}
          </div>
        </div>

        {/* STEP 1 — DESTINATION */}
        {step === 1 && (
          <div className="radio-group">
            {[
              { id: 'congo',   label: '🌿 DR Congo',     sub: 'Rainforests & Rivers' },
              { id: 'namibia', label: '🏜 Namibia',      sub: 'Desert & Safari' },
              { id: 'both',    label: '✦ Both Countries', sub: 'Grand Africa Journey' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                className={`radio-item${country === c.id ? ' sel' : ''}`}
                onClick={() => setCountry(c.id)}
                aria-pressed={country === c.id}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: 4 }} aria-hidden="true">{c.label.split(' ')[0]}</div>
                <div style={{ fontWeight: 700 }}>{c.label.replace(/^[^ ]+ /, '')}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>{c.sub}</div>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 — EXPERIENCES */}
        {step === 2 && (
          <div className="check-grid">
            {availableExps.map((exp) => (
              <div
                key={exp}
                className={`check-item${experiences.includes(exp) ? ' sel' : ''}`}
                onClick={() => toggleExp(exp)}
                role="checkbox"
                aria-checked={experiences.includes(exp)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleExp(exp)}
              >
                <span>{experiences.includes(exp) ? '✓' : '○'}</span>
                {exp}
              </div>
            ))}
          </div>
        )}

        {/* STEP 3 — TRAVELER COUNT */}
        {step === 3 && (
          <div>
            {[
              { label: 'Adults (18+)', value: adults, set: (v) => { setAdults(v); syncTravelers(v, children); } },
              { label: 'Children (under 18)', value: children, set: (v) => { setChildren(v); syncTravelers(adults, v); } },
            ].map(({ label, value, set }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '14px 18px', background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600 }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button
                    onClick={() => set(Math.max(label.includes('Adult') ? 1 : 0, value - 1))}
                    style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: '1.1rem', cursor: 'pointer' }}
                  >−</button>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: 24, textAlign: 'center' }}>{value}</span>
                  <button
                    onClick={() => set(value + 1)}
                    style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--gold)', background: 'var(--card2)', color: 'var(--gold)', fontSize: '1.1rem', cursor: 'pointer' }}
                  >+</button>
                </div>
              </div>
            ))}
            {children > 0 && (
              <div className="guardian-note">
                ⚠️ {t('guardianNote')}
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — DATES */}
        {step === 4 && (
          <div>
            <div className="date-row">
              <div>
                <label className="form-label">{t('arrival')}</label>
                <input type="date" value={arrival} onChange={(e) => setArrival(e.target.value)} />
              </div>
              <div>
                <label className="form-label">{t('departure')}</label>
                <input type="date" value={departure} onChange={(e) => setDeparture(e.target.value)} />
              </div>
            </div>
            <div
              className={`check-item${flexible ? ' sel' : ''}`}
              style={{ marginBottom: 0 }}
              onClick={() => setFlexible((f) => !f)}
              role="checkbox"
              aria-checked={flexible}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setFlexible((f) => !f)}
            >
              <span>{flexible ? '✓' : '○'}</span> {t('flexible')}
            </div>
          </div>
        )}

        {/* STEP 5 — ACCOMMODATION */}
        {step === 5 && (
          <div className="check-grid">
            {['Luxury Lodge', 'Eco Camp', 'Boutique Hotel', 'Budget Guesthouse', 'Camping', 'Mix of Options'].map((opt) => (
              <div
                key={opt}
                className={`check-item${accommodation === opt ? ' sel' : ''}`}
                onClick={() => setAccommodation(opt)}
                role="radio"
                aria-checked={accommodation === opt}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setAccommodation(opt)}
              >
                <span>{accommodation === opt ? '✓' : '○'}</span> {opt}
              </div>
            ))}
          </div>
        )}

        {/* STEP 6 — TRANSPORT */}
        {step === 6 && (
          <div className="check-grid">
            {['Private 4WD + Driver', 'Shared Shuttle', 'Self-Drive Rental', 'Guided Group Van', 'Charter Flight', 'Mixed'].map((opt) => (
              <div
                key={opt}
                className={`check-item${transport === opt ? ' sel' : ''}`}
                onClick={() => setTransport(opt)}
                role="radio"
                aria-checked={transport === opt}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setTransport(opt)}
              >
                <span>{transport === opt ? '✓' : '○'}</span> {opt}
              </div>
            ))}
          </div>
        )}

        {/* STEP 7 — ADDITIONAL SERVICES */}
        {step === 7 && (
          <div className="check-grid">
            {['Airport Transfers', 'Visa Assistance', 'Travel Insurance', 'Photography Guide', 'Meal Plan (Full Board)', 'Porter Services'].map((svc) => (
              <div
                key={svc}
                className={`check-item${services.includes(svc) ? ' sel' : ''}`}
                onClick={() => toggleService(svc)}
                role="checkbox"
                aria-checked={services.includes(svc)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleService(svc)}
              >
                <span>{services.includes(svc) ? '✓' : '○'}</span> {svc}
              </div>
            ))}
          </div>
        )}

        {/* STEP 8 — TRAVELER DETAILS */}
        {step === 8 && (
          <div>
            {travelers.map((traveler, idx) => (
              <TravelerForm
                key={idx}
                index={idx}
                isLead={idx === 0}
                isChild={idx >= adults}
                data={traveler}
                onChange={(field, value) => updateTraveler(idx, field, value)}
              />
            ))}
          </div>
        )}

        {/* NAV BUTTONS */}
        <div className="step-nav">
          {step > 1 && (
            <button className="btn-back" onClick={() => setStep((s) => s - 1)}>
              {t('back')}
            </button>
          )}
          <button className="btn-next" onClick={handleNext}>
            {step < TOTAL_STEPS ? t('cont') : t('buildItin')}
          </button>
        </div>
      </div>
    </main>
  );
}

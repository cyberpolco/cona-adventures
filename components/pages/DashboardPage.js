'use client';
// components/pages/DashboardPage.js
import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// ─── Static data ──────────────────────────────────────────────────────────────

const BOOKINGS_MOCK = [
  { ref: 'CNA-8821', guest: 'Marie Dupont',  dest: '🌿 Congo',   dates: 'Jul 14–21', status: 's-active',  label: 'Active',   amount: '$1,800', pax: 2 },
  { ref: 'CNA-8820', guest: 'Jakub Novak',   dest: '🏜 Namibia', dates: 'Jul 12–19', status: 's-active',  label: 'Active',   amount: '$2,100', pax: 1 },
  { ref: 'CNA-8819', guest: 'Amina Diallo',  dest: '✦ Both',    dates: 'Jul 10–24', status: 's-pending', label: 'Deposit',  amount: '$5,800', pax: 4 },
  { ref: 'CNA-8818', guest: 'Tom Eriksen',   dest: '🏜 Namibia', dates: 'Jul 8–15',  status: 's-done',    label: 'Complete', amount: '$2,100', pax: 3 },
  { ref: 'CNA-8817', guest: 'Lena Fischer',  dest: '🌿 Congo',   dates: 'Jul 5–12',  status: 's-done',    label: 'Complete', amount: '$1,400', pax: 2 },
  { ref: 'CNA-8816', guest: 'Carlos Ortega', dest: '🌿 Congo',   dates: 'Jun 28–Jul 4', status: 's-done', label: 'Complete', amount: '$1,800', pax: 1 },
];

const TOURS_TODAY = [
  { name: 'Kasai River Circuit',  guide: 'Emmanuel K.', driver: 'David S.',  pax: 6, time: '08:00', color: 'var(--teal)' },
  { name: 'Rainforest Zipline',   guide: 'Chloe M.',    driver: 'Joseph M.', pax: 4, time: '09:30', color: 'var(--teal)' },
  { name: 'Etosha Safari Day 2',  guide: 'Petrus N.',   driver: 'Marcus T.', pax: 8, time: '06:00', color: 'var(--terra)' },
];

const CATALOGUE = [
  { tour: 'Kasai Jungle Circuit',   country: '🌿 Congo',   days: 7,  price: '$1,800', slots: 6,  booked: 4 },
  { tour: 'Congo River Expedition', country: '🌿 Congo',   days: 5,  price: '$1,400', slots: 8,  booked: 3 },
  { tour: 'Etosha Safari Classic',  country: '🏜 Namibia', days: 6,  price: '$2,100', slots: 10, booked: 7 },
  { tour: 'Sossusvlei Desert',      country: '🏜 Namibia', days: 3,  price: '$780',   slots: 12, booked: 5 },
  { tour: 'Grand Africa Journey',   country: '✦ Both',    days: 18, price: '$5,800', slots: 3,  booked: 2 },
];

const REVENUE_BY_MONTH = [
  { month: 'Feb', amount: 6400  },
  { month: 'Mar', amount: 9200  },
  { month: 'Apr', amount: 14800 },
  { month: 'May', amount: 22400 },
  { month: 'Jun', amount: 31600 },
  { month: 'Jul', amount: 48200 },
];

const STAFF_ROLES_INFO = [
  { role: 'Super Admin',   color: 'var(--gold)',  bg: '#E5A23C20', desc: 'All platform features, user creation, financial access', icon: '👑' },
  { role: 'Ops Manager',   color: 'var(--teal)',  bg: '#2C7A7020', desc: 'Tours, bookings, payments, staff scheduling',           icon: '⚙️' },
  { role: 'Tour Guide',    color: '#7ab87a',      bg: '#3E6B4A20', desc: 'Assigned tours, customer list, photo upload',           icon: '🧭' },
  { role: 'Driver',        color: 'var(--terra)', bg: '#C0532F20', desc: 'Routes, passengers, vehicle checklist',                 icon: '🚗' },
  { role: 'Hotel Partner', color: '#a08060',      bg: '#241B1220', desc: 'Room management, bookings, invoices',                   icon: '🏨' },
  { role: 'Immigration',   color: '#9a7ac0',      bg: '#2a1a3020', desc: 'Visa, arrival/departure, passport verification',        icon: '🛂' },
];

const INIT_USERS = [
  { id: 1, name: 'Alice K.',  email: 'admin@cona.com',  username: 'alice_k',  role: 'Super Admin',        active: true },
  { id: 2, name: 'Bruno M.',  email: 'ops@cona.com',    username: 'bruno_m',  role: 'Operations Manager', active: true },
  { id: 3, name: 'Chloe M.',  email: 'guide@cona.com',  username: 'chloe_m',  role: 'Tour Guide',         active: true },
  { id: 4, name: 'Petrus N.', email: 'petrus@cona.com', username: 'petrus_n', role: 'Tour Guide',         active: true },
  { id: 5, name: 'David S.',  email: 'driver@cona.com', username: 'david_s',  role: 'Driver',             active: true },
];

const ROLE_OPTIONS = ['Operations Manager', 'Tour Guide', 'Driver', 'Immigration Officer'];

const INIT_PARTNERS = [
  { id: 1, name: 'Okapi Eco Lodge',           type: 'Hotel',     country: '🌿 Congo',   email: 'info@okapilodge.cd',   status: 'pending'  },
  { id: 2, name: 'Namib Desert Camp',          type: 'Hotel',     country: '🏜 Namibia', email: 'stay@namibcamp.na',    status: 'pending'  },
  { id: 3, name: 'Kinshasa Airport Transfers', type: 'Transport', country: '🌿 Congo',   email: 'ops@kinstransfers.cd', status: 'pending'  },
  { id: 4, name: 'Etosha Luxury Tents',        type: 'Hotel',     country: '🏜 Namibia', email: 'book@etoshatents.na',  status: 'approved' },
];

const GUIDES_POOL = [
  { id: 1, name: 'Emmanuel K.', rating: 4.9, zone: '🌿 Congo',   available: true  },
  { id: 2, name: 'Chloe M.',    rating: 4.7, zone: '✦ Both',    available: true  },
  { id: 3, name: 'Petrus N.',   rating: 4.8, zone: '🏜 Namibia', available: false },
  { id: 4, name: 'Aisha B.',    rating: 4.5, zone: '🌿 Congo',   available: true  },
];

const DRIVERS_POOL = [
  { id: 1, name: 'David S.',  rating: 4.9, zone: '🌿 Congo',   available: true,  vehicle: 'Land Cruiser · KIN-082' },
  { id: 2, name: 'Marcus T.', rating: 4.6, zone: '🏜 Namibia', available: true,  vehicle: 'Safari Van · WIN-441'   },
  { id: 3, name: 'Joseph M.', rating: 4.4, zone: '🌿 Congo',   available: false, vehicle: 'Minibus · KIN-204'      },
];

const INIT_PENDING = [
  { id: 1, ref: 'CNA-8825', tour: 'Kasai Jungle Circuit',  zone: '🌿 Congo',   date: 'Jul 20', pax: 6, guide: null, driver: null },
  { id: 2, ref: 'CNA-8826', tour: 'Etosha Safari Classic', zone: '🏜 Namibia', date: 'Jul 22', pax: 4, guide: null, driver: null },
  { id: 3, ref: 'CNA-8827', tour: 'Sossusvlei Desert',     zone: '🏜 Namibia', date: 'Jul 25', pax: 3, guide: null, driver: null },
];

const GUIDE_TOURS = [
  {
    ref: 'CNA-8825', tour: 'Kasai River Circuit',  date: 'Jul 20', time: '08:00', pax: 6,
    country: '🌿 Congo',   status: 'upcoming',
    customers: ['Marie Dupont', 'Jean Blancard', 'Sophie Martin', 'Paul Dubois', 'Claire Bernard', 'Luc Fontaine'],
    notes: 'Bring extra rain gear. River level is high. Depart from Kinshasa Central terminal gate 4.',
  },
  {
    ref: 'CNA-8819', tour: 'Rainforest Zipline',   date: 'Jul 24', time: '09:30', pax: 4,
    country: '🌿 Congo',   status: 'confirmed',
    customers: ['Amina Diallo', 'Kwame Mensah', 'Fatou Ba', 'Seun Kuti'],
    notes: 'Safety briefing mandatory before departure. Harness checks done by Emmanuel K.',
  },
  {
    ref: 'CNA-8818', tour: 'Kasai Jungle Circuit', date: 'Jul 8',  time: '07:00', pax: 8,
    country: '🌿 Congo',   status: 'complete',
    customers: ['Tom Eriksen', 'Ana Hansen', 'Lars Berg', 'Ida Vik', 'Per Holm', 'Kari Dahl', 'Jon Lie', 'Eva Møller'],
    notes: 'Completed without incident. Guest feedback: excellent.',
  },
];

const DRIVER_TRIPS = [
  {
    ref: 'CNA-8825', route: 'Kinshasa → Kasai Forest', date: 'Jul 20', time: '06:00',
    pax: 6, guide: 'Emmanuel K.', vehicle: 'Land Cruiser · KIN-082', status: 'upcoming',
    manifest: ['Marie Dupont', 'Jean Blancard', 'Sophie Martin', 'Paul Dubois', 'Claire Bernard', 'Luc Fontaine'],
    distance: '340 km',
  },
  {
    ref: 'CNA-8826', route: 'Windhoek → Etosha NP',    date: 'Jul 22', time: '05:30',
    pax: 4, guide: 'Petrus N.',   vehicle: 'Land Cruiser · KIN-082', status: 'confirmed',
    manifest: ['Amina Diallo', 'Kwame Mensah', 'Fatou Ba', 'Seun Kuti'],
    distance: '430 km',
  },
  {
    ref: 'CNA-8818', route: 'Kinshasa → Kasai Forest', date: 'Jul 8',  time: '06:00',
    pax: 8, guide: 'Emmanuel K.', vehicle: 'Land Cruiser · KIN-082', status: 'complete',
    manifest: ['Tom Eriksen', 'Ana Hansen', 'Lars Berg', 'Ida Vik', 'Per Holm', 'Kari Dahl', 'Jon Lie', 'Eva Møller'],
    distance: '340 km',
  },
];

const VEHICLE_CHECKLIST = [
  'Tyre pressure checked',
  'Fuel tank topped up',
  'Engine oil level OK',
  'First-aid kit on board',
  'Fire extinguisher present',
  'Spare tyre present',
  'Communication radio tested',
  'Passenger water supply loaded',
  'Vehicle logbook signed',
  'Emergency contacts posted',
];

const ACTIVITY_LOG = [
  { time: '11:42', action: 'Booking CNA-8821 confirmed',                  actor: 'Bruno M.',  type: 'booking' },
  { time: '10:15', action: 'Partner Okapi Eco Lodge applied',              actor: 'System',    type: 'partner' },
  { time: '09:33', action: 'Guide Emmanuel K. assigned to CNA-8825',       actor: 'Alice K.',  type: 'staff'   },
  { time: '08:50', action: 'Payment received for CNA-8820 — $2,100',       actor: 'System',    type: 'payment' },
  { time: '08:01', action: 'User @petrus_n account created',               actor: 'Alice K.',  type: 'user'    },
  { time: '07:30', action: 'Booking CNA-8819 deposit received — $2,900',   actor: 'System',    type: 'payment' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bestFor(pool, zone) {
  return pool
    .filter(p => p.available && (p.zone === zone || p.zone === '✦ Both'))
    .sort((a, b) => b.rating - a.rating)[0] || null;
}

const STATUS_MAP = {
  active: 's-active', upcoming: 's-active',
  confirmed: 's-pending', pending: 's-pending',
  complete: 's-done', done: 's-done',
};

// ─── UI atoms ─────────────────────────────────────────────────────────────────

function Pill({ children, cls = '' }) {
  return <span className={`status ${cls}`}>{children}</span>;
}

function Card({ title, children, style, action }) {
  return (
    <div className="dash-card" style={style}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Toast system ─────────────────────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, msg, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3200);
  }, []);
  return { toasts, toast };
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 600, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'error' ? '#2a0e08' : 'var(--acacia)',
          border: `1px solid ${t.type === 'error' ? 'var(--terra)' : 'var(--teal)'}`,
          borderRadius: 8, padding: '10px 16px', fontSize: '0.82rem',
          maxWidth: 320, animation: 'slideUp 0.3s ease',
          display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)',
        }}>
          <span style={{ color: t.type === 'error' ? 'var(--terra)' : 'var(--teal)', fontWeight: 700 }}>
            {t.type === 'error' ? '✕' : '✓'}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Mini SVG bar chart ───────────────────────────────────────────────────────

function MiniBarChart({ data }) {
  const max = Math.max(...data.map(d => d.amount));
  const W = 300, H = 72, barW = 32;
  const gap = (W - barW * data.length) / (data.length + 1);
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} style={{ width: '100%', display: 'block' }}>
      {data.map((d, i) => {
        const barH = Math.max(5, (d.amount / max) * H);
        const x    = gap + i * (barW + gap);
        const y    = H - barH;
        const isLast = i === data.length - 1;
        return (
          <g key={d.month}>
            <rect x={x} y={y} width={barW} height={barH} rx={4}
              fill={isLast ? 'var(--gold)' : '#2C7A7030'}
              style={{ transition: 'fill 0.2s' }} />
            <text x={x + barW / 2} y={H + 14} textAnchor="middle"
              fill="var(--muted)" fontSize={9} fontFamily="Archivo, sans-serif">
              {d.month}
            </text>
            {isLast && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle"
                fill="var(--gold)" fontSize={9} fontWeight={700} fontFamily="Archivo, sans-serif">
                ${(d.amount / 1000).toFixed(1)}k
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Booking detail modal ─────────────────────────────────────────────────────

function BookingModal({ booking, onClose, toast }) {
  if (!booking) return null;
  const rows = [
    ['Guest',        booking.guest],
    ['Destination',  booking.dest],
    ['Travel Dates', booking.dates],
    ['Amount',       booking.amount || '—'],
    ['Passengers',   booking.pax ? `${booking.pax} pax` : '—'],
  ];
  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 'min(500px, 94vw)' }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="cinzel" style={{ color: 'var(--gold)', fontSize: '0.68rem', letterSpacing: '0.15em', marginBottom: 6 }}>
          BOOKING DETAIL
        </div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 3 }}>{booking.ref}</h2>
        <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginBottom: 18 }}>
          {booking.dest} · {booking.dates}
        </div>
        {rows.map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--muted)' }}>{label}</span>
            <strong style={{ color: 'var(--sand)' }}>{val}</strong>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--muted)' }}>Status</span>
          <Pill cls={booking.status}>{booking.label}</Pill>
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.78rem' }}
            onClick={() => { toast(`Confirmation resent to ${booking.guest}`); onClose(); }}>
            Resend Confirmation
          </button>
          <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.78rem' }}
            onClick={() => { toast('Edit booking — connect to API for production'); onClose(); }}>
            Edit Booking
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GUIDE VIEW ───────────────────────────────────────────────────────────────

function GuideView({ name, toast }) {
  const [expanded, setExpanded]     = useState(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [submitted, setSubmitted]   = useState(false);
  const [ratings, setRatings]       = useState({});

  const upcoming  = GUIDE_TOURS.filter(t => t.status !== 'complete').length;
  const completed = GUIDE_TOURS.filter(t => t.status === 'complete').length;

  function submitPhoto() {
    if (!photoCaption.trim()) { toast('Add a caption before submitting', 'error'); return; }
    setSubmitted(true);
    toast('Photo submitted for admin review');
    setPhotoCaption('');
    setTimeout(() => setSubmitted(false), 3000);
  }

  const inputSt = {
    width: '100%', padding: '10px 13px', borderRadius: 7,
    border: '1px solid var(--border)', background: 'var(--card2)',
    color: 'var(--text)', fontSize: '0.875rem', fontFamily: 'inherit', marginBottom: 10,
  };

  return (
    <>
      {/* Welcome banner */}
      <div style={{ background: 'var(--card)', border: '1px solid #3E6B4A50', borderRadius: 10, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #3E6B4A, #163026)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
          🧭
        </div>
        <div style={{ flex: 1 }}>
          <div className="cinzel" style={{ color: 'var(--sand)', fontWeight: 700 }}>
            Welcome back, {name.split(' ')[0] || 'Guide'}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.74rem', marginTop: 3 }}>
            Tour Guide · Zone: <span style={{ color: '#7ab87a' }}>🌿 Congo</span>
            {' '}· Rating: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★ 4.7</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>NEXT TOUR</div>
          <div className="cinzel" style={{ color: 'var(--teal)', fontWeight: 700, fontSize: '1.05rem', marginTop: 2 }}>20 days</div>
        </div>
      </div>

      {/* KPI widgets */}
      <div className="widget-grid">
        {[
          { icon: '📅', val: String(upcoming),  label: 'Upcoming',       color: 'var(--teal)',  border: '#2C7A7040' },
          { icon: '✅', val: String(completed), label: 'Completed',      color: '#7ab87a',      border: '#3E6B4A40' },
          { icon: '⭐', val: '4.7',             label: 'Avg Rating',     color: 'var(--gold)',  border: '#E5A23C40' },
          { icon: '👥', val: '26',              label: 'Pax This Month', color: 'var(--teal)',  border: '#2C7A7040' },
        ].map(({ icon, val, label, color, border }) => (
          <div key={label} className="widget" style={{ borderColor: border }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{icon}</div>
            <div className="widget-val" style={{ color }}>{val}</div>
            <div className="widget-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Tour list */}
      <div className="cinzel" style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 10, marginTop: 4 }}>
        MY ASSIGNED TOURS
      </div>
      {GUIDE_TOURS.map(t => (
        <div key={t.ref} style={{ marginBottom: 10 }}>
          <div className="dash-card" style={{ borderLeft: `3px solid ${t.status === 'complete' ? 'var(--border)' : 'var(--teal)'}`, cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setExpanded(expanded === t.ref ? null : t.ref)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sand)' }}>{t.tour}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.73rem', marginTop: 2 }}>
                  {t.country} · {t.date} · {t.time} · {t.pax} pax
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Pill cls={STATUS_MAP[t.status] || 's-pending'}>
                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </Pill>
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem', lineHeight: 1 }}>
                  {expanded === t.ref ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {expanded === t.ref && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 12 }}
                onClick={e => e.stopPropagation()}>

                {/* Passenger list */}
                <div className="cinzel" style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 8 }}>
                  PASSENGER MANIFEST ({t.customers.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {t.customers.map(c => (
                    <span key={c} style={{ background: '#2C7A7015', border: '1px solid #2C7A7030', color: 'var(--teal)', borderRadius: 6, padding: '3px 9px', fontSize: '0.71rem' }}>
                      {c}
                    </span>
                  ))}
                </div>

                {/* Guide notes */}
                <div className="cinzel" style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 6 }}>NOTES</div>
                <div style={{ background: 'var(--card2)', borderRadius: 7, padding: '9px 12px', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 12, lineHeight: 1.55 }}>
                  {t.notes}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '5px 12px' }}
                    onClick={() => toast(`Contact sheet downloaded for ${t.ref}`)}>
                    Download Contacts
                  </button>
                  {t.status !== 'complete' && (
                    <button className="btn btn-primary" style={{ fontSize: '0.72rem', padding: '5px 12px' }}
                      onClick={() => toast(`Briefing notes sent for ${t.ref}`)}>
                      Send Briefing
                    </button>
                  )}
                  {t.status === 'complete' && (
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', marginRight: 4 }}>Rate this tour:</span>
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s}
                          style={{ cursor: 'pointer', fontSize: '1rem', color: (ratings[t.ref] || 0) >= s ? 'var(--gold)' : 'var(--border)', transition: 'color 0.15s' }}
                          onClick={() => { setRatings(r => ({ ...r, [t.ref]: s })); toast(`Rated ${t.ref}: ${s} stars`); }}>
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Photo submission */}
      <div className="cinzel" style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 10, marginTop: 18 }}>
        PHOTO SUBMISSION
      </div>
      <Card>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 14 }}>
          Upload tour photos — approved images appear in the public gallery.
        </div>
        <div className="gallery-upload-area" style={{ marginBottom: 14 }}
          onClick={() => toast('File picker — connect a real input for production')}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Click to select photos</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 4 }}>JPG / PNG · max 10 MB each</div>
        </div>
        <label className="form-label">Caption</label>
        <input style={inputSt} type="text"
          placeholder="e.g. Sunrise over Kasai River — Jul 2026"
          value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} />
        <button className="btn btn-primary" style={{ width: '100%', fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}
          onClick={submitPhoto}>
          {submitted ? '✓ Submitted for Review' : '✦ Submit Photo'}
        </button>
      </Card>
    </>
  );
}

// ─── DRIVER VIEW ──────────────────────────────────────────────────────────────

function DriverView({ name, toast }) {
  const [expanded, setExpanded]         = useState(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklist, setChecklist]         = useState({});

  const upcoming  = DRIVER_TRIPS.filter(t => t.status !== 'complete').length;
  const completed = DRIVER_TRIPS.filter(t => t.status === 'complete').length;
  const checkCount = Object.values(checklist).filter(Boolean).length;
  const allChecked = checkCount === VEHICLE_CHECKLIST.length;

  function toggleCheck(item) {
    setChecklist(c => {
      const next = { ...c, [item]: !c[item] };
      if (Object.values(next).filter(Boolean).length === VEHICLE_CHECKLIST.length) {
        toast('All checks complete — vehicle cleared for departure');
      }
      return next;
    });
  }

  return (
    <>
      {/* Welcome banner */}
      <div style={{ background: 'var(--card)', border: '1px solid #C0532F40', borderRadius: 10, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #6b2a10, #2a1000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
          🚗
        </div>
        <div style={{ flex: 1 }}>
          <div className="cinzel" style={{ color: 'var(--sand)', fontWeight: 700 }}>
            Welcome back, {name.split(' ')[0] || 'Driver'}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.74rem', marginTop: 3 }}>
            Vehicle: <span style={{ color: 'var(--terra)', fontWeight: 600 }}>Land Cruiser · KIN-082</span>
            {' '}· Rating: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★ 4.9</span>
          </div>
        </div>
        <button className="btn btn-outline" style={{ fontSize: '0.72rem', borderColor: allChecked ? 'var(--teal)' : 'var(--terra)', color: allChecked ? 'var(--teal)' : 'var(--terra)', flexShrink: 0 }}
          onClick={() => setChecklistOpen(true)}>
          {allChecked ? '✓ Vehicle Ready' : 'Pre-Departure Check'}
        </button>
      </div>

      {/* Checklist modal */}
      {checklistOpen && (
        <div className="modal-overlay open" onClick={() => setChecklistOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setChecklistOpen(false)}>✕</button>
            <div className="cinzel" style={{ color: 'var(--terra)', fontSize: '0.68rem', letterSpacing: '0.15em', marginBottom: 6 }}>
              PRE-DEPARTURE CHECKLIST
            </div>
            <h2 style={{ marginBottom: 2 }}>Vehicle Inspection</h2>
            <div className="modal-sub">Land Cruiser · KIN-082</div>

            {/* Progress bar */}
            <div style={{ background: 'var(--card2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 7, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(checkCount / VEHICLE_CHECKLIST.length) * 100}%`,
                  background: allChecked ? '#7ab87a' : 'var(--terra)',
                  borderRadius: 4, transition: 'width 0.3s, background 0.3s',
                }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: allChecked ? '#7ab87a' : 'var(--terra)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {checkCount}/{VEHICLE_CHECKLIST.length}
              </span>
            </div>

            {VEHICLE_CHECKLIST.map(item => (
              <div key={item}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                onClick={() => toggleCheck(item)}>
                <div style={{
                  width: 22, height: 22, flexShrink: 0, borderRadius: 5,
                  border: `2px solid ${checklist[item] ? '#7ab87a' : 'var(--border)'}`,
                  background: checklist[item] ? '#3E6B4A' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {checklist[item] && <span style={{ color: '#7ab87a', fontSize: '0.8rem', fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: '0.83rem', color: checklist[item] ? 'var(--muted)' : 'var(--text)', textDecoration: checklist[item] ? 'line-through' : 'none', transition: 'color 0.15s' }}>
                  {item}
                </span>
              </div>
            ))}

            <button className="btn btn-primary" style={{ width: '100%', marginTop: 18, fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}
              onClick={() => { toast('Checklist saved — vehicle signed off for departure'); setChecklistOpen(false); }}>
              Sign Off &amp; Save
            </button>
          </div>
        </div>
      )}

      {/* KPI widgets */}
      <div className="widget-grid">
        {[
          { icon: '🗓', val: String(upcoming),  label: 'Upcoming Trips', color: 'var(--terra)', border: '#C0532F40' },
          { icon: '✅', val: String(completed), label: 'Completed',      color: '#7ab87a',      border: '#3E6B4A40' },
          { icon: '⭐', val: '4.9',             label: 'Avg Rating',     color: 'var(--gold)',  border: '#E5A23C40' },
          { icon: '👥', val: '18',              label: 'Pax This Month', color: 'var(--teal)',  border: '#2C7A7040' },
        ].map(({ icon, val, label, color, border }) => (
          <div key={label} className="widget" style={{ borderColor: border }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{icon}</div>
            <div className="widget-val" style={{ color }}>{val}</div>
            <div className="widget-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Trip list */}
      <div className="cinzel" style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 10, marginTop: 4 }}>
        MY ASSIGNED TRIPS
      </div>
      {DRIVER_TRIPS.map(t => (
        <div key={t.ref} style={{ marginBottom: 10 }}>
          <div className="dash-card"
            style={{ borderLeft: `3px solid ${t.status === 'complete' ? 'var(--border)' : 'var(--terra)'}`, cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setExpanded(expanded === t.ref ? null : t.ref)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sand)' }}>{t.route}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.73rem', marginTop: 2 }}>
                  {t.date} · Depart {t.time} · {t.pax} passengers · {t.distance}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Pill cls={STATUS_MAP[t.status] || 's-pending'}>
                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </Pill>
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem', lineHeight: 1 }}>
                  {expanded === t.ref ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {expanded === t.ref && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 12 }}
                onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span>Guide: <strong style={{ color: 'var(--text)' }}>{t.guide}</strong></span>
                  <span>Vehicle: <strong style={{ color: 'var(--text)' }}>{t.vehicle}</strong></span>
                  <span>Ref: <strong style={{ color: 'var(--text)' }}>{t.ref}</strong></span>
                </div>
                <div className="cinzel" style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 8 }}>
                  PASSENGER MANIFEST ({t.manifest.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                  {t.manifest.map(p => (
                    <span key={p} style={{ background: '#C0532F15', border: '1px solid #C0532F30', color: 'var(--terra)', borderRadius: 6, padding: '2px 8px', fontSize: '0.71rem' }}>
                      {p}
                    </span>
                  ))}
                </div>
                {t.status !== 'complete' && (
                  <button className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '5px 12px', borderColor: 'var(--terra)', color: 'var(--terra)' }}
                    onClick={() => setChecklistOpen(true)}>
                    Run Pre-Departure Check
                  </button>
                )}
                {t.status === 'complete' && (
                  <span style={{ fontSize: '0.72rem', color: '#7ab87a' }}>✓ Trip completed</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

// ─── ADMIN / OPS MAIN DASHBOARD ───────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toasts, toast } = useToast();

  const role     = session?.user?.role || 'Operations Manager';
  const name     = session?.user?.name || '';
  const isAdmin  = role === 'Super Admin';
  const isGuide  = role === 'Tour Guide';
  const isDriver = role === 'Driver';

  // Clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Refresh indicator
  const [refreshed, setRefreshed]   = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const doRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshed(new Date());
      setRefreshing(false);
      toast('Dashboard refreshed');
    }, 800);
  }, [toast]);
  useEffect(() => {
    const t = setInterval(doRefresh, 60000);
    return () => clearInterval(t);
  }, [doRefresh]);

  const timeStr   = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr   = now.toLocaleDateString('en-GB',  { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const roleColor = {
    'Super Admin': 'var(--gold)', 'Operations Manager': 'var(--teal)',
    'Tour Guide': '#7ab87a',      'Driver': 'var(--terra)',
  }[role] || 'var(--gold)';

  // Bookings
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dbBookings, setDbBookings] = useState(null);
  useEffect(() => {
    fetch('/api/bookings')
      .then(r => r.json())
      .then(d => { if (d.bookings) setDbBookings(d.bookings); })
      .catch(() => {});
  }, []);

  const liveBookings = (dbBookings
    ? dbBookings.map(b => ({
        ref:    b.ref,
        pax:    b.travelers?.length || 1,
        guest:  b.travelers?.[0] ? `${b.travelers[0].firstName} ${b.travelers[0].lastName}`.trim() : '—',
        dest:   { drc: '🌿 Congo', namibia: '🏜 Namibia', both: '✦ Both' }[b.country] ?? b.country,
        dates:  new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: b.status === 'paid' ? 's-active' : b.status === 'pending' ? 's-pending' : 's-done',
        label:  b.status.charAt(0).toUpperCase() + b.status.slice(1),
        amount: '—',
      }))
    : BOOKINGS_MOCK
  ).filter(b => {
    const q = bookingSearch.toLowerCase();
    const matchQ = !q || [b.ref, b.guest, b.dest].some(v => v.toLowerCase().includes(q));
    const matchS = statusFilter === 'all' || b.status === statusFilter;
    return matchQ && matchS;
  });

  // Users
  const [users,      setUsers]      = useState(INIT_USERS);
  const [userSearch, setUserSearch] = useState('');
  const [newRole,    setNewRole]    = useState(ROLE_OPTIONS[0]);
  const [newName,    setNewName]    = useState('');
  const [newEmail,   setNewEmail]   = useState('');

  function createUser() {
    if (!newName.trim() || !newEmail.trim()) { toast('Name and email are required', 'error'); return; }
    const handle   = newEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = `${handle}_${newRole.toLowerCase().replace(/\s/g, '').slice(0, 3)}`;
    setUsers(u => [...u, { id: Date.now(), name: newName, email: newEmail, username, role: newRole, active: true }]);
    toast(`@${username} created — credentials sent to ${newEmail}`);
    setNewName(''); setNewEmail('');
  }

  function toggleUser(id) {
    const u = users.find(x => x.id === id);
    setUsers(us => us.map(x => x.id === id ? { ...x, active: !x.active } : x));
    toast(`@${u.username} ${u.active ? 'deactivated' : 'reactivated'}`);
  }

  const filteredUsers = users.filter(u =>
    !userSearch || [u.username, u.email, u.role, u.name].some(v => v.toLowerCase().includes(userSearch.toLowerCase()))
  );

  // Partners
  const [partners, setPartners] = useState(INIT_PARTNERS);
  function updatePartner(id, status) {
    const p = partners.find(x => x.id === id);
    setPartners(ps => ps.map(x => x.id === id ? { ...x, status } : x));
    toast(`${p.name} ${status}`);
  }

  // Tour assignments
  const [pending, setPending] = useState(INIT_PENDING);
  function autoAssign(id) {
    const booking = pending.find(p => p.id === id);
    if (!booking) return;
    const guide  = bestFor(GUIDES_POOL,  booking.zone);
    const driver = bestFor(DRIVERS_POOL, booking.zone);
    setPending(ps => ps.map(p => p.id === id
      ? { ...p, guide: guide  ? `${guide.name}  ★${guide.rating}`  : '—',
               driver: driver ? `${driver.name} ★${driver.rating}` : '—' }
      : p
    ));
    toast(`${booking.ref} assigned — ${guide?.name || '—'} / ${driver?.name || '—'}`);
  }
  const pendingCount = pending.filter(p => !p.guide).length;

  // Tabs
  const adminTabs = [
    { id: 'overview', label: 'Overview'  },
    { id: 'bookings', label: 'Bookings'  },
    { id: 'tours',    label: 'Tours'     },
    { id: 'staff',    label: 'Staff'     },
    { id: 'users',    label: 'Users'     },
    { id: 'partners', label: 'Partners'  },
  ];
  const opsTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'tours',    label: 'Tours'    },
  ];
  const tabs = isAdmin ? adminTabs : opsTabs;
  const [tab, setTab] = useState('overview');

  const inputSt = {
    width: '100%', padding: '10px 13px', borderRadius: 7,
    border: '1px solid var(--border)', background: 'var(--card2)',
    color: 'var(--text)', fontSize: '0.875rem', fontFamily: 'inherit', marginBottom: 10,
  };

  // ── Shared header ──────────────────────────────────────────────────────────
  function Header() {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="cinzel" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--sand)' }}>
            CoNa Adventures — Operations
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>
            {dateStr} · <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{timeStr}</span>
            {' '}· <span style={{ color: roleColor, fontWeight: 700 }}>{role}</span>
            {name && <span style={{ color: 'var(--muted)' }}> · {name}</span>}
            <span style={{ marginLeft: 10, fontSize: '0.68rem', color: refreshing ? 'var(--gold)' : 'var(--muted)' }}>
              {refreshing ? '↻ refreshing…' : `↻ ${refreshed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-outline" style={{ fontSize: '0.75rem' }} onClick={() => router.push('/')}>Public Site</button>
          <button className="btn btn-outline" style={{ fontSize: '0.75rem' }} onClick={doRefresh}>↻ Refresh</button>
          <button className="btn btn-outline" style={{ fontSize: '0.75rem' }} onClick={() => signOut({ callbackUrl: '/' })}>⚑ Logout</button>
        </div>
      </div>
    );
  }

  // ── Guide / Driver short-circuit ──────────────────────────────────────────
  if (isGuide) return (
    <div className="page-shell">
      <div className="dash-wrap">
        <Header />
        <GuideView name={name} toast={toast} />
        <ToastContainer toasts={toasts} />
      </div>
    </div>
  );

  if (isDriver) return (
    <div className="page-shell">
      <div className="dash-wrap">
        <Header />
        <DriverView name={name} toast={toast} />
        <ToastContainer toasts={toasts} />
      </div>
    </div>
  );

  // ── Admin / Ops layout ────────────────────────────────────────────────────
  return (
    <div className="page-shell">
      <div className="dash-wrap">
        <Header />

        {/* Tab bar */}
        <div className="tab-bar">
          {tabs.map(tb => (
            <div key={tb.id}
              className={`tab${tab === tb.id ? ' active' : ''}`}
              onClick={() => setTab(tb.id)}
              role="tab" aria-selected={tab === tb.id} tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setTab(tb.id)}>
              {tb.label}
              {tb.id === 'bookings' && pendingCount > 0 && (
                <span style={{ marginLeft: 5, background: 'var(--terra)', color: '#fff', borderRadius: 8, padding: '0 5px', fontSize: '0.6rem', fontWeight: 700 }}>
                  {pendingCount}
                </span>
              )}
              {tb.id === 'partners' && isAdmin && partners.filter(p => p.status === 'pending').length > 0 && (
                <span style={{ marginLeft: 5, background: 'var(--gold)', color: 'var(--bark)', borderRadius: 8, padding: '0 5px', fontSize: '0.6rem', fontWeight: 700 }}>
                  {partners.filter(p => p.status === 'pending').length}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <>
            {/* KPI row */}
            <div className="widget-grid">
              {(isAdmin ? [
                { icon: '💰', val: '$48.2k', label: 'Revenue MTD',      color: 'var(--gold)',  border: '#E5A23C40' },
                { icon: '📋', val: '34',      label: 'Total Bookings',   color: 'var(--teal)',  border: '#2C7A7040' },
                { icon: '🧭', val: '8',       label: 'Active Tours',     color: '#7ab87a',      border: '#3E6B4A40' },
                { icon: '👥', val: '5',       label: 'Staff Active',     color: 'var(--teal)',  border: '#2C7A7040' },
                { icon: '⏳', val: '$9.4k',   label: 'Pending Deposits', color: 'var(--terra)', border: '#C0532F40' },
                { icon: '🤝', val: String(partners.filter(p => p.status === 'pending').length), label: 'Partner Requests', color: 'var(--gold)', border: '#E5A23C40' },
              ] : [
                { icon: '📋', val: '34',                   label: 'Total Bookings',   color: 'var(--teal)',  border: '#2C7A7040' },
                { icon: '🧭', val: '8',                    label: 'Active Tours',     color: '#7ab87a',      border: '#3E6B4A40' },
                { icon: '🚗', val: '3',                    label: 'Drivers On Duty',  color: 'var(--gold)',  border: '#E5A23C40' },
                { icon: '⏳', val: String(pendingCount),   label: 'Unassigned Tours', color: 'var(--terra)', border: '#C0532F40' },
              ]).map(({ icon, val, label, color, border }) => (
                <div key={label} className="widget" style={{ borderColor: border }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: 8 }}>{icon}</div>
                  <div className="widget-val" style={{ color }}>{val}</div>
                  <div className="widget-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Main grid */}
            <div className="dash-grid">
              {/* Bookings table */}
              <Card title="Recent Bookings"
                action={<button className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '4px 10px' }} onClick={() => setTab('bookings')}>View All</button>}>
                <table>
                  <thead><tr><th>REF</th><th>GUEST</th><th>DEST</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
                  <tbody>
                    {BOOKINGS_MOCK.slice(0, 4).map(b => (
                      <tr key={b.ref} style={{ cursor: 'pointer' }} onClick={() => setSelectedBooking(b)}>
                        <td style={{ fontWeight: 600 }}>{b.ref}</td>
                        <td>{b.guest}</td>
                        <td>{b.dest}</td>
                        <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{b.amount}</td>
                        <td><Pill cls={b.status}>{b.label}</Pill></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 8, fontSize: '0.71rem', color: 'var(--muted)' }}>Click a row to view details.</div>
              </Card>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {isAdmin && (
                  <Card title="Revenue Trend">
                    <MiniBarChart data={REVENUE_BY_MONTH} />
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 4 }}>Monthly · USD · highlighted = current</div>
                  </Card>
                )}
                <Card title="Today's Tours">
                  {TOURS_TODAY.map(t => (
                    <div key={t.name} style={{ padding: '9px 12px', background: 'var(--card2)', borderRadius: 8, borderLeft: `2px solid ${t.color}`, marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>{t.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.72rem', marginTop: 2 }}>
                        {t.guide} · {t.driver} · {t.pax} pax · {t.time}
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>

            {/* Activity log — admin only */}
            {isAdmin && (
              <Card title="Activity Log" style={{ marginTop: 14 }}>
                {ACTIVITY_LOG.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'baseline', padding: '8px 0', borderBottom: i < ACTIVITY_LOG.length - 1 ? '1px solid var(--border)' : 'none', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: '0.7rem', flexShrink: 0, letterSpacing: '0.04em' }}>{a.time}</span>
                    <span style={{ flex: 1, color: 'var(--text)' }}>{a.action}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '0.7rem', flexShrink: 0 }}>{a.actor}</span>
                  </div>
                ))}
              </Card>
            )}

            {/* Unassigned tours alert */}
            {pendingCount > 0 && (
              <Card
                title={
                  <span>
                    Unassigned Tours{' '}
                    <span style={{ background: '#C0532F20', color: 'var(--terra)', border: '1px solid #C0532F40', borderRadius: 8, padding: '1px 7px', fontSize: '0.62rem', fontFamily: 'inherit', fontWeight: 700, marginLeft: 8 }}>
                      {pendingCount} pending
                    </span>
                  </span>
                }
                style={{ marginTop: 14 }}>
                <div style={{ fontSize: '0.71rem', color: 'var(--muted)', marginBottom: 12 }}>
                  Auto-assign suggests the highest-rated available staff for each zone.
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ minWidth: 560 }}>
                    <thead><tr><th>REF</th><th>TOUR</th><th>DATE</th><th>PAX</th><th>SUGGESTED GUIDE</th><th>SUGGESTED DRIVER</th><th></th></tr></thead>
                    <tbody>
                      {pending.map(p => {
                        const sg   = bestFor(GUIDES_POOL,  p.zone);
                        const sd   = bestFor(DRIVERS_POOL, p.zone);
                        const done = p.guide && p.driver;
                        return (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 600 }}>{p.ref}</td>
                            <td>{p.zone} {p.tour}</td>
                            <td>{p.date}</td>
                            <td>{p.pax}</td>
                            <td style={{ color: done ? '#7ab87a' : 'var(--muted)', fontSize: '0.75rem', fontWeight: done ? 700 : 400 }}>
                              {done ? p.guide  : (sg ? `${sg.name}  ★${sg.rating}`  : '—')}
                            </td>
                            <td style={{ color: done ? '#7ab87a' : 'var(--muted)', fontSize: '0.75rem', fontWeight: done ? 700 : 400 }}>
                              {done ? p.driver : (sd ? `${sd.name} ★${sd.rating}` : '—')}
                            </td>
                            <td>
                              {done
                                ? <Pill cls="s-active">Assigned</Pill>
                                : <button className="btn btn-primary" style={{ fontSize: '0.68rem', padding: '4px 10px' }} onClick={() => autoAssign(p.id)}>Auto-Assign</button>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}

        {/* ══ BOOKINGS ══ */}
        {tab === 'bookings' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <div className="search-bar" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
                <input type="text" placeholder="Search by name, ref, destination…"
                  value={bookingSearch} onChange={e => setBookingSearch(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {[['all', 'All'], ['s-active', 'Active'], ['s-pending', 'Deposit'], ['s-done', 'Complete']].map(([val, lbl]) => (
                  <button key={val} onClick={() => setStatusFilter(val)}
                    style={{
                      padding: '8px 13px', borderRadius: 7, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                      border: `1px solid ${statusFilter === val ? 'var(--gold)' : 'var(--border)'}`,
                      background: statusFilter === val ? '#E5A23C15' : 'var(--card2)',
                      color: statusFilter === val ? 'var(--gold)' : 'var(--muted)',
                      fontFamily: 'inherit', transition: 'all 0.15s',
                    }}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <Card>
              <table>
                <thead><tr><th>REF</th><th>GUEST</th><th>DEST</th><th>DATES</th><th>AMOUNT</th><th>PAX</th><th>STATUS</th></tr></thead>
                <tbody>
                  {liveBookings.map(b => (
                    <tr key={b.ref} style={{ cursor: 'pointer' }} onClick={() => setSelectedBooking(b)}>
                      <td style={{ fontWeight: 600 }}>{b.ref}</td>
                      <td>{b.guest}</td>
                      <td>{b.dest}</td>
                      <td>{b.dates}</td>
                      <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{b.amount}</td>
                      <td>{b.pax}</td>
                      <td><Pill cls={b.status}>{b.label}</Pill></td>
                    </tr>
                  ))}
                  {liveBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 28, fontSize: '0.82rem' }}>
                        No bookings match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div style={{ marginTop: 8, fontSize: '0.71rem', color: 'var(--muted)' }}>Click a row to view full details and actions.</div>
            </Card>
          </>
        )}

        {/* ══ TOURS ══ */}
        {tab === 'tours' && (
          <div className="dash-grid">
            <Card title="Tour Catalogue">
              <table>
                <thead><tr><th>TOUR</th><th>COUNTRY</th><th>DAYS</th><th>PRICE</th><th>AVAILABILITY</th></tr></thead>
                <tbody>
                  {CATALOGUE.map(c => (
                    <tr key={c.tour}>
                      <td style={{ fontWeight: 600 }}>{c.tour}</td>
                      <td>{c.country}</td>
                      <td style={{ color: 'var(--muted)' }}>{c.days}d</td>
                      <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{c.price}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 52, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${(c.booked / c.slots) * 100}%`,
                              background: (c.booked / c.slots) >= 0.8 ? 'var(--terra)' : 'var(--teal)',
                              borderRadius: 3, transition: 'width 0.3s',
                            }} />
                          </div>
                          <span style={{ fontSize: '0.71rem', color: 'var(--muted)' }}>{c.slots - c.booked} left</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Card title="Staff Assignments">
                <div style={{ fontSize: '0.71rem', color: 'var(--muted)', marginBottom: 12 }}>
                  Auto-assigns highest-rated available staff by zone.
                </div>
                {pending.map(p => {
                  const done = p.guide && p.driver;
                  return (
                    <div key={p.id} style={{ background: 'var(--card2)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, borderLeft: `2px solid ${done ? 'var(--teal)' : 'var(--terra)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{p.ref}</div>
                          <div style={{ color: 'var(--muted)', fontSize: '0.71rem' }}>{p.zone} · {p.date} · {p.pax} pax</div>
                        </div>
                        {done
                          ? <Pill cls="s-active">Assigned</Pill>
                          : <button className="btn btn-primary" style={{ fontSize: '0.68rem', padding: '4px 10px' }} onClick={() => autoAssign(p.id)}>Auto-Assign</button>
                        }
                      </div>
                      {done && (
                        <div style={{ marginTop: 6, fontSize: '0.71rem', color: '#7ab87a' }}>
                          Guide: {p.guide} · Driver: {p.driver}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card>

              <Card title="Staff Availability">
                {[{ title: 'Guides', pool: GUIDES_POOL }, { title: 'Drivers', pool: DRIVERS_POOL }].map(({ title, pool }) => (
                  <div key={title} style={{ marginBottom: 14 }}>
                    <div className="cinzel" style={{ fontSize: '0.63rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 8 }}>{title.toUpperCase()}</div>
                    {pool.map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '0.74rem' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                          <span style={{ color: 'var(--muted)', marginLeft: 6, fontSize: '0.68rem' }}>{p.zone || p.vehicle}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★{p.rating}</span>
                          <Pill cls={p.available ? 's-active' : 's-done'}>{p.available ? 'Free' : 'Busy'}</Pill>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* ══ STAFF & ROLES — Admin only ══ */}
        {tab === 'staff' && isAdmin && (
          <div className="role-grid">
            {STAFF_ROLES_INFO.map(({ role: r, color, bg, desc, icon }) => (
              <div key={r} className="role-card">
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>
                <span className="role-badge" style={{ background: bg, color }}>{r}</span>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* ══ USER MANAGEMENT — Admin only ══ */}
        {tab === 'users' && isAdmin && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card title="Users & Roles">
              <div className="search-bar" style={{ marginBottom: 12 }}>
                <input type="text" placeholder="Search username, email, role…"
                  value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </div>
              {filteredUsers.map(u => (
                <div key={u.id} className="user-row">
                  <div>
                    <div className="uname">@{u.username}</div>
                    <div className="urole">{u.role} · {u.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Pill cls={u.active ? 's-active' : 's-done'}>{u.active ? 'Active' : 'Inactive'}</Pill>
                    {u.role !== 'Super Admin' && (
                      <button onClick={() => toggleUser(u.id)}
                        style={{
                          background: 'none', borderRadius: 5, padding: '2px 7px', fontSize: '0.67rem', cursor: 'pointer', fontFamily: 'inherit',
                          border: `1px solid ${u.active ? 'var(--terra)' : 'var(--teal)'}`,
                          color: u.active ? 'var(--terra)' : 'var(--teal)',
                          transition: 'all 0.15s',
                        }}>
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </Card>

            <Card title="Create Staff Account">
              <label className="form-label" style={{ marginTop: 6 }}>Role</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} style={inputSt}>
                {ROLE_OPTIONS.map(r => <option key={r}>{r}</option>)}
              </select>
              <label className="form-label">Full Name</label>
              <input style={inputSt} type="text" placeholder="e.g. Amara Nzinga"
                value={newName} onChange={e => setNewName(e.target.value)} />
              <label className="form-label">Email</label>
              <input style={{ ...inputSt, marginBottom: 18 }} type="email" placeholder="email@conaadventures.com"
                value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              <button className="btn btn-primary" onClick={createUser}
                style={{ width: '100%', fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}>
                ✦ Create Account &amp; Send Credentials
              </button>
            </Card>
          </div>
        )}

        {/* ══ PARTNERS — Admin only ══ */}
        {tab === 'partners' && isAdmin && (
          <Card title="Hotel & Partner Applications">
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 16 }}>
              Only Super Admin can approve or reject partner access.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: 540 }}>
                <thead><tr><th>NAME</th><th>TYPE</th><th>COUNTRY</th><th>EMAIL</th><th>STATUS</th><th>ACTION</th></tr></thead>
                <tbody>
                  {partners.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.type}</td>
                      <td>{p.country}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>{p.email}</td>
                      <td>
                        <Pill cls={p.status === 'approved' ? 's-active' : p.status === 'rejected' ? 's-done' : 's-pending'}>
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </Pill>
                      </td>
                      <td>
                        {p.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 5 }}>
                            <button className="btn btn-primary"
                              style={{ fontSize: '0.68rem', padding: '4px 10px' }}
                              onClick={() => updatePartner(p.id, 'approved')}>
                              Approve
                            </button>
                            <button className="btn btn-outline"
                              style={{ fontSize: '0.68rem', padding: '4px 10px', borderColor: 'var(--terra)', color: 'var(--terra)' }}
                              onClick={() => updatePartner(p.id, 'rejected')}>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <BookingModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} toast={toast} />
        <ToastContainer toasts={toasts} />
      </div>
    </div>
  );
}

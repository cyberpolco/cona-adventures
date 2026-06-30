// components/pages/DashboardPage.js
// Live, role-aware operations dashboard. getServerSideProps in pages/dashboard.js
// already verified auth, so session is always present here — no loading gate needed.
import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

// ─── Static data ─────────────────────────────────────────────────────────────

const BOOKINGS_MOCK = [
  { ref: 'CNA-8821', guest: 'Marie Dupont',  dest: '🌿 Congo',   dates: 'Jul 14–21', status: 's-active',  label: 'Active' },
  { ref: 'CNA-8820', guest: 'Jakub Novak',   dest: '🏜 Namibia', dates: 'Jul 12–19', status: 's-active',  label: 'Active' },
  { ref: 'CNA-8819', guest: 'Amina Diallo',  dest: '✦ Both',    dates: 'Jul 10–24', status: 's-pending', label: 'Deposit' },
  { ref: 'CNA-8818', guest: 'Tom Eriksen',   dest: '🏜 Namibia', dates: 'Jul 8–15',  status: 's-done',    label: 'Complete' },
  { ref: 'CNA-8817', guest: 'Lena Fischer',  dest: '🌿 Congo',   dates: 'Jul 5–12',  status: 's-done',    label: 'Complete' },
];

const TOURS_TODAY = [
  { name: 'Kasai River Circuit',  guide: 'Emmanuel K.', driver: 'David S.',  pax: 6, time: '08:00', color: 'var(--teal)' },
  { name: 'Rainforest Zipline',   guide: 'Chloe M.',    driver: 'Joseph M.', pax: 4, time: '09:30', color: 'var(--teal)' },
  { name: 'Etosha Safari Day 2',  guide: 'Petrus N.',   driver: 'Marcus T.', pax: 8, time: '06:00', color: 'var(--terra)' },
];

const CATALOGUE = [
  { tour: 'Kasai Jungle Circuit',   country: '🌿 Congo',   days: 7,  price: '$1,800', slots: 6 },
  { tour: 'Congo River Expedition', country: '🌿 Congo',   days: 5,  price: '$1,400', slots: 8 },
  { tour: 'Etosha Safari Classic',  country: '🏜 Namibia', days: 6,  price: '$2,100', slots: 10 },
  { tour: 'Sossusvlei Desert',      country: '🏜 Namibia', days: 3,  price: '$780',   slots: 12 },
  { tour: 'Grand Africa Journey',   country: '✦ Both',    days: 18, price: '$5,800', slots: 3 },
];

const STAFF_ROLES_INFO = [
  { role: 'Super Admin',   color: 'var(--gold)',  bg: '#E5A23C20', desc: 'All platform features, user creation, financial access' },
  { role: 'Ops Manager',   color: 'var(--teal)',  bg: '#2C7A7020', desc: 'Tours, bookings, payments, staff scheduling' },
  { role: 'Tour Guide',    color: '#7ab87a',      bg: '#3E6B4A20', desc: 'Assigned tours, customer list, photo upload' },
  { role: 'Driver',        color: 'var(--terra)', bg: '#C0532F20', desc: 'Routes, passengers, vehicle checklist' },
  { role: 'Hotel Partner', color: '#a08060',      bg: '#241B1220', desc: 'Room management, bookings, invoices' },
  { role: 'Immigration',   color: '#9a7ac0',      bg: '#2a1a3020', desc: 'Visa, arrival/departure, passport verification' },
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
  { id: 1, name: 'Okapi Eco Lodge',            type: 'Hotel',     country: '🌿 Congo',   email: 'info@okapilodge.cd',  status: 'pending' },
  { id: 2, name: 'Namib Desert Camp',           type: 'Hotel',     country: '🏜 Namibia', email: 'stay@namibcamp.na',   status: 'pending' },
  { id: 3, name: 'Kinshasa Airport Transfers',  type: 'Transport', country: '🌿 Congo',   email: 'ops@kinstransfers.cd', status: 'pending' },
  { id: 4, name: 'Etosha Luxury Tents',         type: 'Hotel',     country: '🏜 Namibia', email: 'book@etoshatents.na', status: 'approved' },
];

// ─── Tour assignment pool ─────────────────────────────────────────────────────

const GUIDES_POOL = [
  { id: 1, name: 'Emmanuel K.', rating: 4.9, zone: '🌿 Congo',   available: true  },
  { id: 2, name: 'Chloe M.',    rating: 4.7, zone: '✦ Both',    available: true  },
  { id: 3, name: 'Petrus N.',   rating: 4.8, zone: '🏜 Namibia', available: false },
  { id: 4, name: 'Aisha B.',    rating: 4.5, zone: '🌿 Congo',   available: true  },
];

const DRIVERS_POOL = [
  { id: 1, name: 'David S.',  rating: 4.9, zone: '🌿 Congo',   available: true,  vehicle: 'Land Cruiser · KIN-082' },
  { id: 2, name: 'Marcus T.', rating: 4.6, zone: '🏜 Namibia', available: true,  vehicle: 'Safari Van · WIN-441' },
  { id: 3, name: 'Joseph M.', rating: 4.4, zone: '🌿 Congo',   available: false, vehicle: 'Minibus · KIN-204' },
];

const INIT_PENDING = [
  { id: 1, ref: 'CNA-8825', tour: 'Kasai Jungle Circuit',  zone: '🌿 Congo',   date: 'Jul 20', pax: 6, guide: null, driver: null },
  { id: 2, ref: 'CNA-8826', tour: 'Etosha Safari Classic', zone: '🏜 Namibia', date: 'Jul 22', pax: 4, guide: null, driver: null },
  { id: 3, ref: 'CNA-8827', tour: 'Sossusvlei Desert',     zone: '🏜 Namibia', date: 'Jul 25', pax: 3, guide: null, driver: null },
];

function bestFor(pool, zone) {
  return pool
    .filter(p => p.available && (p.zone === zone || p.zone === '✦ Both'))
    .sort((a, b) => b.rating - a.rating)[0] || null;
}

// ─── Personal data (guide / driver) ──────────────────────────────────────────

const GUIDE_TOURS = [
  { ref: 'CNA-8825', tour: 'Kasai River Circuit',  date: 'Jul 20', time: '08:00', pax: 6, country: '🌿 Congo',   status: 'upcoming',  customers: 'Marie Dupont, Jean Blancard +4' },
  { ref: 'CNA-8819', tour: 'Rainforest Zipline',   date: 'Jul 24', time: '09:30', pax: 4, country: '🌿 Congo',   status: 'confirmed', customers: 'Amina Diallo +3' },
  { ref: 'CNA-8818', tour: 'Kasai Jungle Circuit', date: 'Jul 8',  time: '07:00', pax: 8, country: '🌿 Congo',   status: 'complete',  customers: 'Tom Eriksen +7' },
];

const DRIVER_TRIPS = [
  { ref: 'CNA-8825', route: 'Kinshasa → Kasai Forest', date: 'Jul 20', time: '06:00', pax: 6, guide: 'Emmanuel K.', vehicle: 'Land Cruiser · KIN-082', status: 'upcoming' },
  { ref: 'CNA-8826', route: 'Windhoek → Etosha NP',    date: 'Jul 22', time: '05:30', pax: 4, guide: 'Petrus N.',   vehicle: 'Land Cruiser · KIN-082', status: 'confirmed' },
  { ref: 'CNA-8818', route: 'Kinshasa → Kasai Forest', date: 'Jul 8',  time: '06:00', pax: 8, guide: 'Emmanuel K.', vehicle: 'Land Cruiser · KIN-082', status: 'complete' },
];

// ─── Shared UI pieces ─────────────────────────────────────────────────────────

const STATUS_MAP = { active: 's-active', upcoming: 's-active', confirmed: 's-pending', pending: 's-pending', complete: 's-done', done: 's-done' };

function Pill({ children, cls = '' }) {
  return <span className={`status ${cls}`}>{children}</span>;
}

function Card({ title, children, style }) {
  return (
    <div className="dash-card" style={style}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Role — server already verified auth so session arrives quickly; fallback is safe
  const role    = session?.user?.role || 'Operations Manager';
  const name    = session?.user?.name || '';
  const isAdmin  = role === 'Super Admin';
  const isGuide  = role === 'Tour Guide';
  const isDriver = role === 'Driver';

  // Live clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Last-refreshed indicator (simulates live polling)
  const [refreshed, setRefreshed] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const doRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => { setRefreshed(new Date()); setRefreshing(false); }, 800);
  }, []);
  useEffect(() => {
    const t = setInterval(doRefresh, 60000);
    return () => clearInterval(t);
  }, [doRefresh]);

  // Tabs
  const adminTabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'bookings',  label: 'Bookings' },
    { id: 'staff',     label: 'Staff & Roles' },
    { id: 'tours',     label: 'Tours' },
    { id: 'users',     label: 'User Management' },
    { id: 'partners',  label: 'Partners' },
  ];
  const opsTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'tours',    label: 'Tours' },
  ];
  const tabs = isAdmin ? adminTabs : opsTabs;

  const [tab, setTab] = useState('overview');

  // Booking search
  const [bookingSearch, setBookingSearch] = useState('');
  const [dbBookings, setDbBookings] = useState(null);
  useEffect(() => {
    fetch('/api/bookings')
      .then(r => r.json())
      .then(d => { if (d.bookings) setDbBookings(d.bookings); })
      .catch(() => {});
  }, []);

  const liveBookings = (dbBookings
    ? dbBookings.map(b => ({
        ref: b.ref,
        guest: b.travelers?.[0] ? `${b.travelers[0].firstName} ${b.travelers[0].lastName}`.trim() : '—',
        dest: { drc: '🌿 Congo', namibia: '🏜 Namibia', both: '✦ Both' }[b.country] ?? b.country,
        dates: new Date(b.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }),
        status: b.status === 'paid' ? 's-active' : b.status === 'pending' ? 's-pending' : 's-done',
        label: b.status.charAt(0).toUpperCase() + b.status.slice(1),
      }))
    : BOOKINGS_MOCK
  ).filter(b => !bookingSearch || [b.ref, b.guest, b.dest].some(v => v.toLowerCase().includes(bookingSearch.toLowerCase())));

  // User management
  const [users, setUsers] = useState(INIT_USERS);
  const [userSearch, setUserSearch] = useState('');
  const [newRole, setNewRole] = useState(ROLE_OPTIONS[0]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [createMsg, setCreateMsg] = useState(null);
  function createUser() {
    if (!newName || !newEmail) { setCreateMsg({ ok: false, text: 'Name and email are required.' }); return; }
    const handle = newEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = `${handle}_${newRole.toLowerCase().replace(/\s/g, '').slice(0, 3)}`;
    setUsers(u => [...u, { id: Date.now(), name: newName, email: newEmail, username, role: newRole, active: true }]);
    setCreateMsg({ ok: true, text: `✓ @${username} created — credentials sent to ${newEmail}` });
    setNewName(''); setNewEmail('');
  }
  const filteredUsers = users.filter(u => !userSearch || [u.username, u.email, u.role, u.name].some(v => v.toLowerCase().includes(userSearch.toLowerCase())));

  // Partners
  const [partners, setPartners] = useState(INIT_PARTNERS);

  // Tour assignments
  const [pending, setPending] = useState(INIT_PENDING);
  function autoAssign(id) {
    const booking = pending.find(p => p.id === id);
    if (!booking) return;
    const guide  = bestFor(GUIDES_POOL,  booking.zone);
    const driver = bestFor(DRIVERS_POOL, booking.zone);
    setPending(ps => ps.map(p => p.id === id
      ? { ...p, guide: guide  ? `${guide.name} ★${guide.rating}` : '—', driver: driver ? `${driver.name} ★${driver.rating}` : '—' }
      : p
    ));
  }
  const pendingCount = pending.filter(p => !p.guide).length;

  // ── Shared header ──
  const timeStr  = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr  = now.toLocaleDateString('en-GB',  { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const roleColor = { 'Super Admin': 'var(--gold)', 'Operations Manager': 'var(--teal)', 'Tour Guide': '#7ab87a', 'Driver': 'var(--terra)' }[role] || 'var(--gold)';

  const headerStyle = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 };
  const inputStyle  = { width: '100%', padding: '10px 13px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', marginBottom: 4 };

  function Header() {
    return (
      <div style={headerStyle}>
        <div>
          <div className="cinzel" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--sand)' }}>
            CoNa Adventures — Operations
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>
            {dateStr} · <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{timeStr}</span>
            {' '}· <span style={{ color: roleColor, fontWeight: 700 }}>{role}</span>
            {name && <span style={{ color: 'var(--muted)' }}> · {name}</span>}
            <span style={{ marginLeft: 10, fontSize: '0.68rem', color: refreshing ? 'var(--gold)' : 'var(--muted)' }}>
              {refreshing ? '↻ refreshing…' : `↻ ${refreshed.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}`}
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

  // ══════════════════════════════════════════
  // GUIDE VIEW
  // ══════════════════════════════════════════
  if (isGuide) {
    const upcoming  = GUIDE_TOURS.filter(t => t.status !== 'complete').length;
    const completed = GUIDE_TOURS.filter(t => t.status === 'complete').length;
    return (
      <div className="page-shell">
        <div className="dash-wrap">
          <Header />
          <div style={{ background: 'var(--card)', border: '1px solid #3E6B4A40', borderRadius: 10, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '1.6rem' }}>🧭</span>
            <div>
              <div className="cinzel" style={{ color: 'var(--sand)', fontWeight: 700 }}>Welcome back, {name.split(' ')[0] || 'Guide'}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.74rem', marginTop: 2 }}>
                Tour Guide portal · Rating: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★ 4.7</span>
              </div>
            </div>
          </div>
          <div className="widget-grid">
            {[
              { icon: '📅', val: String(upcoming),  label: 'Upcoming Tours', color: 'var(--teal)',  border: '#2C7A7040' },
              { icon: '✅', val: String(completed), label: 'Completed',      color: '#7ab87a',      border: '#3E6B4A40' },
              { icon: '⭐', val: '4.7',             label: 'Your Rating',    color: 'var(--gold)',  border: '#E5A23C40' },
              { icon: '👥', val: '26',              label: 'Pax This Month', color: 'var(--teal)',  border: '#2C7A7040' },
            ].map(({ icon, val, label, color, border }) => (
              <div key={label} className="widget" style={{ borderColor: border }}>
                <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{icon}</div>
                <div className="widget-val" style={{ color }}>{val}</div>
                <div className="widget-label">{label}</div>
              </div>
            ))}
          </div>
          <div className="cinzel" style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 12, marginTop: 8 }}>MY ASSIGNED TOURS</div>
          {GUIDE_TOURS.map(t => (
            <div key={t.ref} className="dash-card" style={{ marginBottom: 10, borderLeft: `3px solid ${t.status === 'complete' ? 'var(--border)' : 'var(--teal)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sand)' }}>{t.tour}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.73rem', marginTop: 2 }}>
                    {t.country} · {t.date} · {t.time} · {t.pax} pax
                  </div>
                </div>
                <Pill cls={STATUS_MAP[t.status] || 's-pending'}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</Pill>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Customers: {t.customers}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 2 }}>Ref: {t.ref}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // DRIVER VIEW
  // ══════════════════════════════════════════
  if (isDriver) {
    const upcoming  = DRIVER_TRIPS.filter(t => t.status !== 'complete').length;
    const completed = DRIVER_TRIPS.filter(t => t.status === 'complete').length;
    return (
      <div className="page-shell">
        <div className="dash-wrap">
          <Header />
          <div style={{ background: 'var(--card)', border: '1px solid #C0532F40', borderRadius: 10, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '1.6rem' }}>🚗</span>
            <div>
              <div className="cinzel" style={{ color: 'var(--sand)', fontWeight: 700 }}>Welcome back, {name.split(' ')[0] || 'Driver'}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.74rem', marginTop: 2 }}>
                Vehicle: <span style={{ color: 'var(--terra)', fontWeight: 600 }}>Land Cruiser · KIN-082</span>
                {' '}· Rating: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★ 4.9</span>
              </div>
            </div>
          </div>
          <div className="widget-grid">
            {[
              { icon: '🗓', val: String(upcoming),  label: 'Upcoming Trips', color: 'var(--terra)', border: '#C0532F40' },
              { icon: '✅', val: String(completed), label: 'Completed',      color: '#7ab87a',      border: '#3E6B4A40' },
              { icon: '⭐', val: '4.9',             label: 'Your Rating',    color: 'var(--gold)',  border: '#E5A23C40' },
              { icon: '👥', val: '18',              label: 'Pax This Month', color: 'var(--teal)',  border: '#2C7A7040' },
            ].map(({ icon, val, label, color, border }) => (
              <div key={label} className="widget" style={{ borderColor: border }}>
                <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{icon}</div>
                <div className="widget-val" style={{ color }}>{val}</div>
                <div className="widget-label">{label}</div>
              </div>
            ))}
          </div>
          <div className="cinzel" style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 12, marginTop: 8 }}>MY ASSIGNED TRIPS</div>
          {DRIVER_TRIPS.map(t => (
            <div key={t.ref} className="dash-card" style={{ marginBottom: 10, borderLeft: `3px solid ${t.status === 'complete' ? 'var(--border)' : 'var(--terra)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sand)' }}>{t.route}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.73rem', marginTop: 2 }}>
                    {t.date} · Departure {t.time} · {t.pax} passengers
                  </div>
                </div>
                <Pill cls={STATUS_MAP[t.status] || 's-pending'}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</Pill>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span>Guide: <strong style={{ color: 'var(--text)' }}>{t.guide}</strong></span>
                <span>Vehicle: <strong style={{ color: 'var(--text)' }}>{t.vehicle}</strong></span>
                <span>Ref: {t.ref}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // ADMIN + OPS VIEW
  // ══════════════════════════════════════════
  return (
    <div className="page-shell">
      <div className="dash-wrap">
        <Header />

        {/* Tab bar */}
        <div className="tab-bar">
          {tabs.map(tb => (
            <div
              key={tb.id}
              className={`tab${tab === tb.id ? ' active' : ''}`}
              onClick={() => setTab(tb.id)}
              role="tab" aria-selected={tab === tb.id} tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setTab(tb.id)}
            >
              {tb.label}
              {tb.id === 'overview' && isAdmin && pendingCount > 0 && (
                <span style={{ marginLeft: 5, background: 'var(--terra)', color: '#fff', borderRadius: 8, padding: '0 5px', fontSize: '0.6rem', fontWeight: 700 }}>
                  {pendingCount}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <div className="widget-grid">
              {(isAdmin
                ? [
                    { icon: '💰', val: '$48,200', label: 'Revenue',         color: 'var(--gold)',  border: '#E5A23C40' },
                    { icon: '📋', val: '34',       label: 'Total Bookings', color: 'var(--teal)',  border: '#2C7A7040' },
                    { icon: '🧭', val: '8',        label: 'Active Tours',   color: '#7ab87a',      border: '#3E6B4A40' },
                    { icon: '🚗', val: '12',       label: 'Vehicles',       color: 'var(--gold)',  border: '#E5A23C40' },
                    { icon: '👤', val: '7',        label: 'Guides',         color: 'var(--teal)',  border: '#2C7A7040' },
                    { icon: '⏳', val: '$9,400',   label: 'Pending Deps.',  color: 'var(--terra)', border: '#C0532F40' },
                  ]
                : [
                    { icon: '📋', val: '34',       label: 'Total Bookings', color: 'var(--teal)',  border: '#2C7A7040' },
                    { icon: '🧭', val: '8',        label: 'Active Tours',   color: '#7ab87a',      border: '#3E6B4A40' },
                    { icon: '🚗', val: '12',       label: 'Vehicles',       color: 'var(--gold)',  border: '#E5A23C40' },
                    { icon: '👤', val: '7',        label: 'Guides',         color: 'var(--teal)',  border: '#2C7A7040' },
                  ]
              ).map(({ icon, val, label, color, border }) => (
                <div key={label} className="widget" style={{ borderColor: border }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: 8 }}>{icon}</div>
                  <div className="widget-val" style={{ color }}>{val}</div>
                  <div className="widget-label">{label}</div>
                </div>
              ))}
            </div>

            <div className="dash-grid">
              <Card title="Recent Bookings">
                <table><thead><tr><th>REF</th><th>GUEST</th><th>DEST</th><th>DATES</th><th>STATUS</th></tr></thead>
                  <tbody>
                    {BOOKINGS_MOCK.map(b => (
                      <tr key={b.ref}>
                        <td>{b.ref}</td><td>{b.guest}</td><td>{b.dest}</td><td>{b.dates}</td>
                        <td><Pill cls={b.status}>{b.label}</Pill></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <Card title="Today's Tours">
                {TOURS_TODAY.map(t => (
                  <div key={t.name} style={{ padding: 10, background: 'var(--card2)', borderRadius: 8, borderLeft: `2px solid ${t.color}`, marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>{t.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.72rem', marginTop: 1 }}>
                      {t.guide} · {t.driver} · {t.pax} pax · {t.time}
                    </div>
                  </div>
                ))}
              </Card>
            </div>

            {/* Tour Assignment — Super Admin only */}
            {isAdmin && (
              <Card title={
                <span>
                  Tour Assignments{' '}
                  {pendingCount > 0 && (
                    <span style={{ marginLeft: 8, background: '#C0532F20', color: 'var(--terra)', border: '1px solid #C0532F40', borderRadius: 8, padding: '1px 7px', fontSize: '0.62rem', fontFamily: 'inherit', fontWeight: 700 }}>
                      {pendingCount} pending
                    </span>
                  )}
                </span>
              } style={{ marginTop: 14 }}>
                <div style={{ fontSize: '0.71rem', color: 'var(--muted)', marginBottom: 14 }}>
                  System suggests highest-rated available guide/driver per destination. Click Auto-Assign to confirm.
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ minWidth: 580 }}>
                    <thead><tr><th>REF</th><th>TOUR</th><th>DATE</th><th>PAX</th><th>GUIDE</th><th>DRIVER</th><th>ACTION</th></tr></thead>
                    <tbody>
                      {pending.map(p => {
                        const sg = bestFor(GUIDES_POOL,  p.zone);
                        const sd = bestFor(DRIVERS_POOL, p.zone);
                        const done = p.guide && p.driver;
                        return (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 600 }}>{p.ref}</td>
                            <td>{p.zone} {p.tour}</td>
                            <td>{p.date}</td>
                            <td>{p.pax}</td>
                            <td style={{ color: done ? '#7ab87a' : 'var(--muted)', fontWeight: done ? 700 : 400, fontSize: '0.75rem' }}>
                              {done ? p.guide : (sg ? `${sg.name} ★${sg.rating}` : '—')}
                            </td>
                            <td style={{ color: done ? '#7ab87a' : 'var(--muted)', fontWeight: done ? 700 : 400, fontSize: '0.75rem' }}>
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

                <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[{ title: 'GUIDE AVAILABILITY', pool: GUIDES_POOL }, { title: 'DRIVER AVAILABILITY', pool: DRIVERS_POOL }].map(({ title, pool }) => (
                    <div key={title}>
                      <div className="cinzel" style={{ fontSize: '0.63rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 8 }}>{title}</div>
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
                </div>
              </Card>
            )}
          </>
        )}

        {/* ── BOOKINGS ── */}
        {tab === 'bookings' && (
          <>
            <div className="search-bar">
              <input type="text" placeholder="Search by name, ref, destination…" value={bookingSearch} onChange={e => setBookingSearch(e.target.value)} />
              <button className="btn btn-primary" style={{ fontSize: '0.78rem' }}>Search</button>
            </div>
            <Card title="All Bookings">
              <table><thead><tr><th>REF</th><th>GUEST</th><th>DEST</th><th>DATES</th><th>STATUS</th></tr></thead>
                <tbody>
                  {liveBookings.map(b => (
                    <tr key={b.ref}>
                      <td>{b.ref}</td><td>{b.guest}</td><td>{b.dest}</td><td>{b.dates}</td>
                      <td><Pill cls={b.status}>{b.label}</Pill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {/* ── STAFF & ROLES — Admin only ── */}
        {tab === 'staff' && isAdmin && (
          <div className="role-grid">
            {STAFF_ROLES_INFO.map(({ role: r, color, bg, desc }) => (
              <div key={r} className="role-card">
                <span className="role-badge" style={{ background: bg, color }}>{r}</span>
                <h4 style={{ marginBottom: 4, fontSize: '0.85rem' }}>
                  {r === 'Super Admin' ? 'Full Access' : r === 'Ops Manager' ? 'Operations' : r === 'Immigration' ? 'Read Only' : `${r} View`}
                </h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── TOURS ── */}
        {tab === 'tours' && (
          <Card title="Tour Catalogue">
            <table><thead><tr><th>TOUR</th><th>COUNTRY</th><th>DAYS</th><th>PRICE</th><th>SLOTS</th></tr></thead>
              <tbody>
                {CATALOGUE.map(c => (
                  <tr key={c.tour}><td>{c.tour}</td><td>{c.country}</td><td>{c.days}</td><td>{c.price}</td><td>{c.slots}</td></tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* ── USER MANAGEMENT — Admin only ── */}
        {tab === 'users' && isAdmin && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card title="Users & Roles">
              <div className="search-bar" style={{ marginBottom: 14 }}>
                <input type="text" placeholder="Search username, email, role…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </div>
              {filteredUsers.map(u => (
                <div key={u.id} className="user-row">
                  <div>
                    <div className="uname">@{u.username}</div>
                    <div className="urole">{u.role} · {u.email}</div>
                  </div>
                  <Pill cls={u.active ? 's-active' : 's-done'}>{u.active ? 'Active' : 'Inactive'}</Pill>
                </div>
              ))}
            </Card>
            <Card title="Create Staff Account">
              <label className="form-label" style={{ marginTop: 8 }}>Role</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }}>
                {ROLE_OPTIONS.map(r => <option key={r}>{r}</option>)}
              </select>
              <label className="form-label">Full Name</label>
              <input style={{ ...inputStyle, marginBottom: 10 }} type="text" placeholder="e.g. Amara Nzinga" value={newName} onChange={e => setNewName(e.target.value)} />
              <label className="form-label">Email</label>
              <input style={{ ...inputStyle, marginBottom: 16 }} type="email" placeholder="email@conaadventures.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              <button className="btn btn-primary" onClick={createUser} style={{ width: '100%', fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}>
                ✦ Create Account &amp; Send Credentials
              </button>
              {createMsg && (
                <div style={{ marginTop: 10, fontSize: '0.78rem', color: createMsg.ok ? 'var(--teal)' : 'var(--terra)' }}>
                  {createMsg.text}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── PARTNERS — Admin only ── */}
        {tab === 'partners' && isAdmin && (
          <Card title="Hotel & Partner Applications">
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 14 }}>
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
                            <button className="btn btn-primary" style={{ fontSize: '0.68rem', padding: '4px 10px' }} onClick={() => setPartners(ps => ps.map(x => x.id === p.id ? { ...x, status: 'approved' } : x))}>Approve</button>
                            <button className="btn btn-outline"  style={{ fontSize: '0.68rem', padding: '4px 10px', borderColor: 'var(--terra)', color: 'var(--terra)' }} onClick={() => setPartners(ps => ps.map(x => x.id === p.id ? { ...x, status: 'rejected' } : x))}>Reject</button>
                          </div>
                        ) : <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

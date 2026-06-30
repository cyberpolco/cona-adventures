// components/pages/DashboardPage.js
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useApp } from '../../context/AppContext';

// ─── Shared mock data ────────────────────────────────────────────────────────

const BOOKINGS_MOCK = [
  { ref: 'CNA-8821', guest: 'Marie Dupont',  dest: '🌿 Congo',   dates: 'Jul 14–21', status: 's-active',  statusLabel: 'Active' },
  { ref: 'CNA-8820', guest: 'Jakub Novak',   dest: '🏜 Namibia', dates: 'Jul 12–19', status: 's-active',  statusLabel: 'Active' },
  { ref: 'CNA-8819', guest: 'Amina Diallo',  dest: '✦ Both',    dates: 'Jul 10–24', status: 's-pending', statusLabel: 'Deposit' },
  { ref: 'CNA-8818', guest: 'Tom Eriksen',   dest: '🏜 Namibia', dates: 'Jul 8–15',  status: 's-done',    statusLabel: 'Complete' },
];

const TOURS_TODAY = [
  { name: 'Kasai River Circuit',  guide: 'Emmanuel K.', pax: 6, time: '08:00', color: 'var(--teal)' },
  { name: 'Rainforest Zipline',   guide: 'Chloe M.',    pax: 4, time: '09:30', color: 'var(--teal)' },
  { name: 'Etosha Safari Day 2',  guide: 'Petrus N.',   pax: 8, time: '06:00', color: 'var(--terra)' },
];

const STAFF_ROLES_INFO = [
  { role: 'Super Admin',    color: 'var(--gold)',  bg: '#E5A23C20', desc: 'All platform features, user creation, financial access' },
  { role: 'Ops Manager',    color: 'var(--teal)',  bg: '#2C7A7020', desc: 'Tours, bookings, payments, staff scheduling' },
  { role: 'Tour Guide',     color: '#7ab87a',      bg: '#3E6B4A20', desc: 'Assigned tours, customer list, photo upload' },
  { role: 'Driver',         color: 'var(--terra)', bg: '#C0532F20', desc: 'Routes, passengers, vehicle checklist' },
  { role: 'Hotel Partner',  color: '#a08060',      bg: '#241B1220', desc: 'Room management, bookings, invoices' },
  { role: 'Immigration',    color: '#9a7ac0',      bg: '#2a1a3020', desc: 'Visa, arrival/departure, passport verification' },
];

const CATALOGUE = [
  { tour: 'Kasai Jungle Circuit',   country: '🌿 Congo',   days: 7,  price: '$1,800', slots: 6 },
  { tour: 'Congo River Expedition', country: '🌿 Congo',   days: 5,  price: '$1,400', slots: 8 },
  { tour: 'Etosha Safari Classic',  country: '🏜 Namibia', days: 6,  price: '$2,100', slots: 10 },
  { tour: 'Sossusvlei Desert',      country: '🏜 Namibia', days: 3,  price: '$780',   slots: 12 },
  { tour: 'Grand Africa Journey',   country: '✦ Both',    days: 18, price: '$5,800', slots: 3 },
];

const INIT_USERS = [
  { id: 1, name: 'Alice K.',  email: 'alice@cona.com',  username: 'alice_k',  role: 'Super Admin', active: true },
  { id: 2, name: 'Bruno M.',  email: 'bruno@cona.com',  username: 'bruno_m',  role: 'Ops Manager', active: true },
  { id: 3, name: 'Chloe M.',  email: 'chloe@cona.com',  username: 'chloe_m',  role: 'Tour Guide',  active: true },
  { id: 4, name: 'Petrus N.', email: 'petrus@cona.com', username: 'petrus_n', role: 'Tour Guide',  active: true },
  { id: 5, name: 'David S.',  email: 'david@cona.com',  username: 'david_s',  role: 'Driver',      active: true },
];

const ROLE_OPTIONS = ['Operations Manager', 'Tour Guide', 'Driver', 'Immigration Officer'];

const INIT_PARTNERS = [
  { id: 1, name: 'Okapi Eco Lodge',           type: 'Hotel',             country: '🌿 Congo',   email: 'info@okapilodge.cd',  status: 'pending' },
  { id: 2, name: 'Namib Desert Camp',          type: 'Hotel',             country: '🏜 Namibia', email: 'stay@namibcamp.na',   status: 'pending' },
  { id: 3, name: 'Kinshasa Airport Transfers', type: 'Transport Partner', country: '🌿 Congo',   email: 'ops@kinstransfers.cd', status: 'pending' },
  { id: 4, name: 'Etosha Luxury Tents',        type: 'Hotel',             country: '🏜 Namibia', email: 'book@etoshatents.na', status: 'approved' },
];

// ─── Tour Assignment data (Super Admin) ──────────────────────────────────────

const GUIDES_POOL = [
  { id: 1, name: 'Emmanuel K.', rating: 4.9, zone: '🌿 Congo',   available: true,  activeTours: 2 },
  { id: 2, name: 'Chloe M.',    rating: 4.7, zone: '✦ Both',    available: true,  activeTours: 3 },
  { id: 3, name: 'Petrus N.',   rating: 4.8, zone: '🏜 Namibia', available: false, activeTours: 4 },
  { id: 4, name: 'Aisha B.',    rating: 4.5, zone: '🌿 Congo',   available: true,  activeTours: 1 },
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
    .filter((p) => p.available && (p.zone === zone || p.zone === '✦ Both'))
    .sort((a, b) => b.rating - a.rating)[0] || null;
}

// ─── Guide personal data ─────────────────────────────────────────────────────

const GUIDE_TOURS = [
  { ref: 'CNA-8825', tour: 'Kasai River Circuit',  date: 'Jul 20, 2026', time: '08:00', pax: 6, country: '🌿 Congo',   status: 'upcoming',  customers: ['Marie Dupont', 'Jean Blancard', '+4 more'] },
  { ref: 'CNA-8819', tour: 'Rainforest Zipline',   date: 'Jul 24, 2026', time: '09:30', pax: 4, country: '🌿 Congo',   status: 'confirmed', customers: ['Amina Diallo', '+3 more'] },
  { ref: 'CNA-8818', tour: 'Kasai Jungle Circuit', date: 'Jul 8, 2026',  time: '07:00', pax: 8, country: '🌿 Congo',   status: 'complete',  customers: ['Tom Eriksen', '+7 more'] },
];

// ─── Driver personal data ────────────────────────────────────────────────────

const DRIVER_TRIPS = [
  { ref: 'CNA-8825', route: 'Kinshasa → Kasai Forest', date: 'Jul 20, 2026', time: '06:00', pax: 6, vehicle: 'Land Cruiser · KIN-082', guide: 'Emmanuel K.', status: 'upcoming' },
  { ref: 'CNA-8826', route: 'Windhoek → Etosha NP',    date: 'Jul 22, 2026', time: '05:30', pax: 4, vehicle: 'Land Cruiser · KIN-082', guide: 'Petrus N.',   status: 'confirmed' },
  { ref: 'CNA-8818', route: 'Kinshasa → Kasai Forest', date: 'Jul 8, 2026',  time: '06:00', pax: 8, vehicle: 'Land Cruiser · KIN-082', guide: 'Emmanuel K.', status: 'complete' },
];

// ─── Shared helpers ──────────────────────────────────────────────────────────

function statusClass(s) {
  if (s === 'upcoming' || s === 'Active') return 's-active';
  if (s === 'confirmed' || s === 'Deposit') return 's-pending';
  return 's-done';
}

function DashHeader({ name, role, roleColor, router }) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <div className="cinzel" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--sand)' }}>
          CoNa Adventures · Operations
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>
          {today} · <span style={{ color: roleColor, fontWeight: 700 }}>{role}</span>
          {name && <span style={{ color: 'var(--muted)' }}> · {name}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={() => router.push('/')} style={{ fontSize: '0.75rem' }}>Public Site</button>
        <button className="btn btn-outline" onClick={() => signOut({ callbackUrl: '/' })} style={{ fontSize: '0.75rem' }}>⚑ Logout</button>
      </div>
    </div>
  );
}

// ─── Guide personal dashboard ─────────────────────────────────────────────────

function GuideDashboard({ session, router }) {
  const name = session?.user?.name || 'Guide';
  const first = name.split(' ')[0];
  const upcoming = GUIDE_TOURS.filter((t) => t.status !== 'complete').length;
  const completed = GUIDE_TOURS.filter((t) => t.status === 'complete').length;

  return (
    <div className="page-shell">
      <div className="dash-wrap">
        <DashHeader name={name} role="Tour Guide" roleColor="#7ab87a" router={router} />

        {/* Personal stats */}
        <div style={{ background: 'var(--card)', border: '1px solid #3E6B4A40', borderRadius: 10, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ fontSize: '1.3rem' }}>🧭</div>
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", color: 'var(--sand)', fontWeight: 700 }}>Welcome back, {first}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Your assigned tours are below. Rating: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★ 4.9</span></div>
          </div>
        </div>

        <div className="widget-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          {[
            { icon: '📅', val: String(upcoming),  label: 'Upcoming Tours',  color: 'var(--teal)',  border: '#2C7A7040' },
            { icon: '✅', val: String(completed), label: 'Completed',       color: '#7ab87a',      border: '#3E6B4A40' },
            { icon: '⭐', val: '4.9',             label: 'Your Rating',     color: 'var(--gold)',  border: '#E5A23C40' },
            { icon: '👥', val: '26',              label: 'Pax This Month',  color: 'var(--teal)',  border: '#2C7A7040' },
          ].map(({ icon, val, label, color, border }) => (
            <div key={label} className="widget" style={{ borderColor: border }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{icon}</div>
              <div className="widget-val" style={{ color, fontSize: '1.4rem' }}>{val}</div>
              <div className="widget-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="cinzel" style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 12, marginTop: 8 }}>MY ASSIGNED TOURS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {GUIDE_TOURS.map((t) => (
            <div key={t.ref} className="dash-card" style={{ borderLeft: `3px solid ${t.status === 'complete' ? 'var(--border)' : 'var(--teal)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sand)' }}>{t.tour}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.73rem', marginTop: 2 }}>
                    {t.country} · {t.date} · {t.time} · {t.pax} pax
                  </div>
                </div>
                <span className={`status ${statusClass(t.status)}`}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                Customers: {t.customers.join(', ')}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 4 }}>Ref: {t.ref}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Driver personal dashboard ────────────────────────────────────────────────

function DriverDashboard({ session, router }) {
  const name = session?.user?.name || 'Driver';
  const first = name.split(' ')[0];
  const upcoming = DRIVER_TRIPS.filter((t) => t.status !== 'complete').length;
  const completed = DRIVER_TRIPS.filter((t) => t.status === 'complete').length;

  return (
    <div className="page-shell">
      <div className="dash-wrap">
        <DashHeader name={name} role="Driver" roleColor="var(--terra)" router={router} />

        <div style={{ background: 'var(--card)', border: '1px solid #C0532F40', borderRadius: 10, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ fontSize: '1.3rem' }}>🚗</div>
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", color: 'var(--sand)', fontWeight: 700 }}>Welcome back, {first}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
              Vehicle: <span style={{ color: 'var(--terra)', fontWeight: 600 }}>Land Cruiser · KIN-082</span> · Rating: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★ 4.9</span>
            </div>
          </div>
        </div>

        <div className="widget-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          {[
            { icon: '🗓', val: String(upcoming),  label: 'Upcoming Trips',  color: 'var(--terra)', border: '#C0532F40' },
            { icon: '✅', val: String(completed), label: 'Completed',       color: '#7ab87a',      border: '#3E6B4A40' },
            { icon: '⭐', val: '4.9',             label: 'Your Rating',     color: 'var(--gold)',  border: '#E5A23C40' },
            { icon: '👥', val: '18',              label: 'Pax This Month',  color: 'var(--teal)',  border: '#2C7A7040' },
          ].map(({ icon, val, label, color, border }) => (
            <div key={label} className="widget" style={{ borderColor: border }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{icon}</div>
              <div className="widget-val" style={{ color, fontSize: '1.4rem' }}>{val}</div>
              <div className="widget-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="cinzel" style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 12, marginTop: 8 }}>MY ASSIGNED TRIPS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DRIVER_TRIPS.map((t) => (
            <div key={t.ref} className="dash-card" style={{ borderLeft: `3px solid ${t.status === 'complete' ? 'var(--border)' : 'var(--terra)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sand)' }}>{t.route}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.73rem', marginTop: 2 }}>
                    {t.date} · Departure {t.time} · {t.pax} passengers
                  </div>
                </div>
                <span className={`status ${statusClass(t.status)}`}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span>
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
    </div>
  );
}

// ─── Admin / Ops dashboard ────────────────────────────────────────────────────

function AdminOpsDashboard({ session, router }) {
  const role = session?.user?.role || 'Operations Manager';
  const isAdmin = role === 'Super Admin';

  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState(INIT_USERS);
  const [partners, setPartners] = useState(INIT_PARTNERS);
  const [pending, setPending] = useState(INIT_PENDING);
  const [bookingSearch, setBookingSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [newRole, setNewRole] = useState(ROLE_OPTIONS[0]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [createMsg, setCreateMsg] = useState(null);
  const [dbBookings, setDbBookings] = useState(null);

  useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((d) => { if (d.bookings) setDbBookings(d.bookings); })
      .catch(() => {});
  }, []);

  const liveBookings = dbBookings
    ? dbBookings.map((b) => ({
        ref: b.ref,
        guest: b.travelers?.[0] ? `${b.travelers[0].firstName} ${b.travelers[0].lastName}`.trim() : '—',
        dest: b.country === 'drc' ? '🌿 Congo' : b.country === 'namibia' ? '🏜 Namibia' : b.country === 'both' ? '✦ Both' : b.country,
        dates: new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: b.status === 'paid' ? 's-active' : b.status === 'pending' ? 's-pending' : 's-done',
        statusLabel: b.status.charAt(0).toUpperCase() + b.status.slice(1),
      }))
    : BOOKINGS_MOCK;

  const filteredBookings = liveBookings.filter((b) =>
    !bookingSearch || [b.ref, b.guest, b.dest].some((v) => v.toLowerCase().includes(bookingSearch.toLowerCase()))
  );
  const filteredUsers = users.filter((u) =>
    !userSearch || [u.username, u.email, u.role, u.name].some((v) => v.toLowerCase().includes(userSearch.toLowerCase()))
  );

  function createUser() {
    if (!newName || !newEmail) { setCreateMsg({ ok: false, text: 'Name and email are required.' }); return; }
    const handle = newEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = handle + '_' + newRole.toLowerCase().replace(/\s/g, '').slice(0, 3);
    setUsers((u) => [...u, { id: Date.now(), name: newName, email: newEmail, username, role: newRole, active: true }]);
    setCreateMsg({ ok: true, text: `✓ Account created: @${username}. Credentials sent to ${newEmail}` });
    setNewName(''); setNewEmail('');
  }

  function autoAssign(id) {
    const booking = pending.find((p) => p.id === id);
    if (!booking) return;
    const guide  = bestFor(GUIDES_POOL,  booking.zone);
    const driver = bestFor(DRIVERS_POOL, booking.zone);
    setPending((ps) => ps.map((p) => p.id === id
      ? { ...p, guide: guide ? `${guide.name} ★${guide.rating}` : 'No guide available', driver: driver ? `${driver.name} ★${driver.rating}` : 'No driver available' }
      : p
    ));
  }

  function approvePartner(id) { setPartners((ps) => ps.map((p) => p.id === id ? { ...p, status: 'approved' } : p)); }
  function rejectPartner(id)  { setPartners((ps) => ps.map((p) => p.id === id ? { ...p, status: 'rejected' } : p)); }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'bookings', label: 'Bookings' },
    ...(isAdmin ? [{ id: 'staff',   label: 'Staff & Roles' }] : []),
    { id: 'tours',    label: 'Tours' },
    ...(isAdmin ? [{ id: 'users',   label: 'User Management' }] : []),
    ...(isAdmin ? [{ id: 'partners', label: 'Partners' }] : []),
  ];

  const validIds = tabs.map((tb) => tb.id);
  const activeTab = validIds.includes(tab) ? tab : 'overview';
  const pendingCount = pending.filter((p) => !p.guide && !p.driver).length;
  const roleColor = isAdmin ? 'var(--gold)' : 'var(--teal)';

  return (
    <div className="page-shell">
      <div className="dash-wrap">
        <DashHeader name={session?.user?.name} role={role} roleColor={roleColor} router={router} />

        {/* Tab bar */}
        <div className="tab-bar">
          {tabs.map((tb) => (
            <div
              key={tb.id}
              className={`tab${activeTab === tb.id ? ' active' : ''}`}
              onClick={() => setTab(tb.id)}
              role="tab" aria-selected={activeTab === tb.id} tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setTab(tb.id)}
            >
              {tb.label}
              {tb.id === 'overview' && isAdmin && pendingCount > 0 && (
                <span style={{ marginLeft: 5, background: 'var(--terra)', color: '#fff', borderRadius: 8, padding: '0 5px', fontSize: '0.62rem', fontWeight: 700 }}>
                  {pendingCount}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <>
            <div className="widget-grid">
              {[
                { icon: '💰', val: '$48,200', label: 'Revenue',       color: 'var(--gold)',  border: '#E5A23C40' },
                { icon: '📋', val: '34',       label: 'Bookings',      color: 'var(--teal)',  border: '#2C7A7040' },
                { icon: '🧭', val: '8',        label: 'Active Tours',  color: '#7ab87a',      border: '#3E6B4A40' },
                { icon: '🚗', val: '12',       label: 'Vehicles',      color: 'var(--gold)',  border: '#E5A23C40' },
                { icon: '👤', val: '7',        label: 'Guides',        color: 'var(--teal)',  border: '#2C7A7040' },
                { icon: '⏳', val: '$9,400',   label: 'Pending Deps.', color: 'var(--terra)', border: '#C0532F40' },
              ].map(({ icon, val, label, color, border }) => (
                <div key={label} className="widget" style={{ borderColor: border }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: 8 }}>{icon}</div>
                  <div className="widget-val" style={{ color }}>{val}</div>
                  <div className="widget-label">{label}</div>
                </div>
              ))}
            </div>

            <div className="dash-grid">
              <div className="dash-card">
                <h3>Recent Bookings</h3>
                <table>
                  <thead><tr><th>REF</th><th>GUEST</th><th>DEST</th><th>DATES</th><th>STATUS</th></tr></thead>
                  <tbody>
                    {BOOKINGS_MOCK.map((b) => (
                      <tr key={b.ref}>
                        <td>{b.ref}</td><td>{b.guest}</td><td>{b.dest}</td><td>{b.dates}</td>
                        <td><span className={`status ${b.status}`}>{b.statusLabel}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="dash-card">
                <h3>Today's Tours</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {TOURS_TODAY.map((tour) => (
                    <div key={tour.name} style={{ padding: 10, background: 'var(--card2)', borderRadius: 8, borderLeft: `2px solid ${tour.color}` }}>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>{tour.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.72rem', marginTop: 1 }}>
                        {tour.guide} · {tour.pax} pax · {tour.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Tour Assignment panel — Super Admin only ── */}
            {isAdmin && (
              <div className="dash-card" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                  <h3 style={{ margin: 0 }}>
                    Tour Assignments
                    {pendingCount > 0 && (
                      <span style={{ marginLeft: 8, background: '#C0532F30', color: 'var(--terra)', border: '1px solid #C0532F40', borderRadius: 8, padding: '1px 7px', fontSize: '0.65rem' }}>
                        {pendingCount} pending
                      </span>
                    )}
                  </h3>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                    System ranks by guide/driver rating · Auto-Assign picks top available
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ minWidth: 600 }}>
                    <thead>
                      <tr><th>REF</th><th>TOUR</th><th>DATE</th><th>PAX</th><th>GUIDE</th><th>DRIVER</th><th>ACTION</th></tr>
                    </thead>
                    <tbody>
                      {pending.map((p) => {
                        const assigned = p.guide && p.driver;
                        const sugGuide  = bestFor(GUIDES_POOL,  p.zone);
                        const sugDriver = bestFor(DRIVERS_POOL, p.zone);
                        return (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 600 }}>{p.ref}</td>
                            <td>{p.zone} {p.tour}</td>
                            <td>{p.date}</td>
                            <td>{p.pax}</td>
                            <td>
                              {assigned
                                ? <span style={{ color: '#7ab87a', fontWeight: 600, fontSize: '0.75rem' }}>{p.guide}</span>
                                : <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                                    {sugGuide ? `${sugGuide.name} ★${sugGuide.rating}` : '—'}
                                  </span>
                              }
                            </td>
                            <td>
                              {assigned
                                ? <span style={{ color: '#7ab87a', fontWeight: 600, fontSize: '0.75rem' }}>{p.driver}</span>
                                : <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                                    {sugDriver ? `${sugDriver.name} ★${sugDriver.rating}` : '—'}
                                  </span>
                              }
                            </td>
                            <td>
                              {assigned
                                ? <span className="status s-active">Assigned</span>
                                : (
                                  <button
                                    className="btn btn-primary"
                                    style={{ fontSize: '0.68rem', padding: '4px 10px' }}
                                    onClick={() => autoAssign(p.id)}
                                  >
                                    Auto-Assign
                                  </button>
                                )
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Guide + Driver availability reference */}
                <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div className="cinzel" style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 8 }}>GUIDE AVAILABILITY</div>
                    {GUIDES_POOL.map((g) => (
                      <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.75rem' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{g.name}</span>
                          <span style={{ color: 'var(--muted)', marginLeft: 6 }}>{g.zone}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★{g.rating}</span>
                          <span className={`status ${g.available ? 's-active' : 's-done'}`}>{g.available ? 'Free' : 'Busy'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="cinzel" style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 8 }}>DRIVER AVAILABILITY</div>
                    {DRIVERS_POOL.map((d) => (
                      <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.75rem' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{d.name}</span>
                          <span style={{ color: 'var(--muted)', marginLeft: 6, fontSize: '0.68rem' }}>{d.vehicle}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★{d.rating}</span>
                          <span className={`status ${d.available ? 's-active' : 's-done'}`}>{d.available ? 'Free' : 'Busy'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Bookings ── */}
        {activeTab === 'bookings' && (
          <>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by name, ref, destination..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
              />
              <button className="btn btn-primary" style={{ fontSize: '0.78rem' }}>Search</button>
            </div>
            <div className="dash-card">
              <h3>All Bookings</h3>
              <table>
                <thead><tr><th>REF</th><th>GUEST</th><th>DEST</th><th>DATES</th><th>STATUS</th></tr></thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.ref}>
                      <td>{b.ref}</td><td>{b.guest}</td><td>{b.dest}</td><td>{b.dates}</td>
                      <td><span className={`status ${b.status}`}>{b.statusLabel}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Staff & Roles — Admin only ── */}
        {activeTab === 'staff' && isAdmin && (
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

        {/* ── Tours ── */}
        {activeTab === 'tours' && (
          <div className="dash-card">
            <h3>Tour Catalogue</h3>
            <table>
              <thead><tr><th>TOUR</th><th>COUNTRY</th><th>DAYS</th><th>PRICE</th><th>SLOTS</th></tr></thead>
              <tbody>
                {CATALOGUE.map((c) => (
                  <tr key={c.tour}><td>{c.tour}</td><td>{c.country}</td><td>{c.days}</td><td>{c.price}</td><td>{c.slots}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── User Management — Admin only ── */}
        {activeTab === 'users' && isAdmin && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="dash-card">
              <h3>Search Users &amp; Roles</h3>
              <div className="search-bar" style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Search by username, email, role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              {filteredUsers.map((u) => (
                <div key={u.id} className="user-row">
                  <div>
                    <div className="uname">@{u.username}</div>
                    <div className="urole">{u.role} · {u.email}</div>
                  </div>
                  <span className={`status ${u.active ? 's-active' : 's-done'}`}>{u.active ? 'Active' : 'Inactive'}</span>
                </div>
              ))}
            </div>

            <div className="dash-card">
              <h3>Create New Staff Account</h3>
              <label className="form-label" style={{ marginTop: 8 }}>Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ marginBottom: 10 }}>
                {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
              <label className="form-label">Full Name</label>
              <input type="text" placeholder="e.g. Amara Nzinga" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ marginBottom: 10 }} />
              <label className="form-label">Email</label>
              <input type="email" placeholder="email@conaadventures.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} style={{ marginBottom: 16 }} />
              <button
                className="btn btn-primary"
                onClick={createUser}
                style={{ width: '100%', fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}
              >
                ✦ Create Account &amp; Send Credentials
              </button>
              {createMsg && (
                <div style={{ marginTop: 10, fontSize: '0.78rem', color: createMsg.ok ? 'var(--teal)' : 'var(--terra)' }}>
                  {createMsg.text}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Partners — Admin only ── */}
        {activeTab === 'partners' && isAdmin && (
          <div className="dash-card">
            <h3>Hotel &amp; Partner Applications</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 16 }}>
              Only Super Admin can approve or reject partner access.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: 560 }}>
                <thead><tr><th>NAME</th><th>TYPE</th><th>COUNTRY</th><th>EMAIL</th><th>STATUS</th><th>ACTION</th></tr></thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.type}</td>
                      <td>{p.country}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>{p.email}</td>
                      <td>
                        <span className={p.status === 'approved' ? 'status s-active' : p.status === 'rejected' ? 'status s-done' : 'status s-pending'}>
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {p.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-primary" style={{ fontSize: '0.68rem', padding: '4px 10px' }} onClick={() => approvePartner(p.id)}>Approve</button>
                            <button className="btn btn-outline" style={{ fontSize: '0.68rem', padding: '4px 10px', borderColor: 'var(--terra)', color: 'var(--terra)' }} onClick={() => rejectPartner(p.id)}>Reject</button>
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
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export — branches by role ─────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = session?.user?.role;

  if (role === 'Tour Guide') return <GuideDashboard session={session} router={router} />;
  if (role === 'Driver')     return <DriverDashboard session={session} router={router} />;
  return <AdminOpsDashboard session={session} router={router} />;
}

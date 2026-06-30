// components/pages/DashboardPage.js
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useApp } from '../../context/AppContext';

const BOOKINGS = [
  { ref: 'CNA-8821', guest: 'Marie Dupont',  dest: '🌿 Congo',   dates: 'Jul 14–21', status: 's-active',  statusLabel: 'Active' },
  { ref: 'CNA-8820', guest: 'Jakub Novak',   dest: '🏜 Namibia', dates: 'Jul 12–19', status: 's-active',  statusLabel: 'Active' },
  { ref: 'CNA-8819', guest: 'Amina Diallo',  dest: '✦ Both',    dates: 'Jul 10–24', status: 's-pending', statusLabel: 'Deposit' },
  { ref: 'CNA-8818', guest: 'Tom Eriksen',   dest: '🏜 Namibia', dates: 'Jul 8–15',  status: 's-done',    statusLabel: 'Complete' },
];

const TOURS = [
  { name: 'Kasai River Circuit',  guide: 'Emmanuel K.', pax: 6, time: '08:00', color: 'var(--teal)' },
  { name: 'Rainforest Zipline',   guide: 'Chloe M.',    pax: 4, time: '09:30', color: 'var(--teal)' },
  { name: 'Etosha Safari Day 2',  guide: 'Petrus N.',   pax: 8, time: '06:00', color: 'var(--terra)' },
];

const STAFF_ROLES = [
  { role: 'Super Admin',       color: 'var(--gold)',  bg: '#E5A23C20', desc: 'All platform features, user creation, financial access' },
  { role: 'Ops Manager',       color: 'var(--teal)',  bg: '#2C7A7020', desc: 'Tours, bookings, payments, staff scheduling' },
  { role: 'Tour Guide',        color: '#7ab87a',      bg: '#3E6B4A20', desc: 'Assigned tours, customer list, photo upload' },
  { role: 'Driver',            color: 'var(--terra)', bg: '#C0532F20', desc: 'Routes, passengers, vehicle checklist' },
  { role: 'Hotel Partner',     color: '#a08060',      bg: '#241B1220', desc: 'Room management, bookings, invoices' },
  { role: 'Immigration',       color: '#9a7ac0',      bg: '#2a1a3020', desc: 'Visa, arrival/departure, passport verification' },
];

const CATALOGUE = [
  { tour: 'Kasai Jungle Circuit',  country: '🌿 Congo',   days: 7,  price: '$1,800', slots: 6 },
  { tour: 'Congo River Expedition',country: '🌿 Congo',   days: 5,  price: '$1,400', slots: 8 },
  { tour: 'Etosha Safari Classic', country: '🏜 Namibia', days: 6,  price: '$2,100', slots: 10 },
  { tour: 'Sossusvlei Desert',     country: '🏜 Namibia', days: 3,  price: '$780',   slots: 12 },
  { tour: 'Grand Africa Journey',  country: '✦ Both',    days: 18, price: '$5,800', slots: 3 },
];

const INIT_USERS = [
  { id: 1, name: 'Alice K.',   email: 'alice@cona.com',  username: 'alice_k',   role: 'Super Admin',   active: true },
  { id: 2, name: 'Bruno M.',   email: 'bruno@cona.com',  username: 'bruno_m',   role: 'Ops Manager',   active: true },
  { id: 3, name: 'Chloe M.',   email: 'chloe@cona.com',  username: 'chloe_m',   role: 'Tour Guide',    active: true },
  { id: 4, name: 'Petrus N.',  email: 'petrus@cona.com', username: 'petrus_n',  role: 'Tour Guide',    active: true },
  { id: 5, name: 'David S.',   email: 'david@cona.com',  username: 'david_s',   role: 'Driver',        active: true },
];

const ROLE_OPTIONS = ['Operations Manager', 'Tour Guide', 'Driver', 'Hotel Partner', 'Immigration Officer'];

export default function DashboardPage() {
  const router = useRouter();
  const { t, showPage } = useApp();
  const [tab, setTab] = useState('overview');
  const [role, setRole] = useState('Super Admin');
  const [users, setUsers] = useState(INIT_USERS);
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
        guest: b.travelers?.[0]
          ? `${b.travelers[0].firstName} ${b.travelers[0].lastName}`.trim()
          : '—',
        dest: b.country === 'drc' ? '🌿 Congo' : b.country === 'namibia' ? '🏜 Namibia' : b.country === 'both' ? '✦ Both' : b.country,
        dates: new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: b.status === 'paid' ? 's-active' : b.status === 'pending' ? 's-pending' : 's-done',
        statusLabel: b.status.charAt(0).toUpperCase() + b.status.slice(1),
      }))
    : BOOKINGS;

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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'staff',    label: 'Staff & Roles' },
    { id: 'tours',    label: 'Tours' },
    { id: 'users',    label: 'User Management' },
  ];

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page-shell">
      <div className="dash-wrap">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="cinzel" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--sand)' }}>{t('opsDash')}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>
              CoNa Adventures · {today} · <span style={{ color: 'var(--gold)' }}>{role}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => router.push('/')} style={{ fontSize: '0.75rem' }}>
              {t('publicSite')}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{ fontSize: '0.75rem' }}
            >
              ⚑ Logout
            </button>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: '0.75rem', fontFamily: "'Archivo', sans-serif" }}
            >
              {['Super Admin', 'Operations Manager', 'Tour Guide', 'Driver', 'Hotel Partner'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab bar */}
        <div className="tab-bar">
          {tabs.map((tb) => (
            <div
              key={tb.id}
              className={`tab${tab === tb.id ? ' active' : ''}`}
              onClick={() => setTab(tb.id)}
              role="tab"
              aria-selected={tab === tb.id}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setTab(tb.id)}
            >
              {tb.label}
            </div>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <>
            <div className="widget-grid">
              {[
                { icon: '💰', val: '$48,200', label: t('wRevenue'),  color: 'var(--gold)',  border: '#E5A23C40' },
                { icon: '📋', val: '34',      label: t('wBookings'), color: 'var(--teal)',  border: '#2C7A7040' },
                { icon: '🧭', val: '8',       label: t('wTours'),    color: '#7ab87a',      border: '#3E6B4A40' },
                { icon: '🚗', val: '12',      label: t('wVehicles'), color: 'var(--gold)',  border: '#E5A23C40' },
                { icon: '👤', val: '7',       label: t('wGuides'),   color: 'var(--teal)',  border: '#2C7A7040' },
                { icon: '⏳', val: '$9,400',  label: t('wDeposits'), color: 'var(--terra)', border: '#C0532F40' },
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
                <h3>{t('recentBook')}</h3>
                <table>
                  <thead>
                    <tr><th>REF</th><th>GUEST</th><th>DEST</th><th>DATES</th><th>STATUS</th></tr>
                  </thead>
                  <tbody>
                    {BOOKINGS.map((b) => (
                      <tr key={b.ref}>
                        <td>{b.ref}</td><td>{b.guest}</td><td>{b.dest}</td><td>{b.dates}</td>
                        <td><span className={`status ${b.status}`}>{b.statusLabel}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="dash-card">
                <h3>{t('todayTours')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {TOURS.map((tour) => (
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
          </>
        )}

        {/* Bookings */}
        {tab === 'bookings' && (
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
                <thead>
                  <tr><th>REF</th><th>GUEST</th><th>DEST</th><th>DATES</th><th>STATUS</th></tr>
                </thead>
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

        {/* Staff */}
        {tab === 'staff' && (
          <div className="role-grid">
            {STAFF_ROLES.map(({ role: r, color, bg, desc }) => (
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

        {/* Tours */}
        {tab === 'tours' && (
          <div className="dash-card">
            <h3>Tour Catalogue</h3>
            <table>
              <thead>
                <tr><th>TOUR</th><th>COUNTRY</th><th>DAYS</th><th>PRICE</th><th>SLOTS</th></tr>
              </thead>
              <tbody>
                {CATALOGUE.map((c) => (
                  <tr key={c.tour}>
                    <td>{c.tour}</td><td>{c.country}</td><td>{c.days}</td><td>{c.price}</td><td>{c.slots}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
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
              <div>
                {filteredUsers.map((u) => (
                  <div key={u.id} className="user-row">
                    <div>
                      <div className="uname">@{u.username}</div>
                      <div className="urole">{u.role} · {u.email}</div>
                    </div>
                    <span className={`status ${u.active ? 's-active' : 's-done'}`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
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
      </div>
    </div>
  );
}

// components/LoginModal.js
import { useState } from 'react';
import { useApp } from '../context/AppContext';

const ROLE_NAMES = {
  client:  'Client',
  guide:   'Tour Guide',
  driver:  'Driver',
  partner: 'Partner',
  ops:     'Operations Manager',
  admin:   'Super Admin',
};

function LoginHome({ onRole, onSignup }) {
  const roles = [
    { id: 'client',  emoji: '🌍', label: 'CLIENT',       sub: 'Book & track trips' },
    { id: 'guide',   emoji: '🧭', label: 'TOUR GUIDE',   sub: 'Manage your tours' },
    { id: 'driver',  emoji: '🚗', label: 'DRIVER',       sub: 'Routes & passengers' },
    { id: 'partner', emoji: '🏨', label: 'PARTNER',      sub: 'Hotels & lodges' },
    { id: 'ops',     emoji: '📋', label: 'OPS MANAGER',  sub: 'Operations access' },
    { id: 'admin',   emoji: '⚡', label: 'SUPER ADMIN',  sub: 'Full system access', gold: true },
  ];

  return (
    <>
      <div className="role-select-grid">
        {roles.map((r) => (
          <button
            key={r.id}
            className="role-select-btn"
            onClick={() => onRole(r.id)}
            style={r.gold ? { borderColor: 'var(--gold)' } : {}}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{r.emoji}</div>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.72rem',
                letterSpacing: '0.08em',
                color: r.gold ? 'var(--gold)' : undefined,
              }}
            >
              {r.label}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 3 }}>{r.sub}</div>
          </button>
        ))}
      </div>
      <hr className="divider" />
      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>
        New client?{' '}
        <span
          style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}
          onClick={onSignup}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSignup()}
        >
          Create an account →
        </span>
      </div>
    </>
  );
}

function LoginForm({ role, onBack, onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const { showToast } = useApp();

  function submit() {
    if (!user) { showToast('Please enter your credentials.'); return; }
    onLogin(role, user);
  }

  return (
    <>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.78rem', marginBottom: 16 }}
      >
        ← Back
      </button>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 16 }}>
        {ROLE_NAMES[role]?.toUpperCase()} LOGIN
      </div>
      <label className="form-label">Username or Email</label>
      <input type="text" placeholder="your@email.com" value={user} onChange={(e) => setUser(e.target.value)} style={{ marginBottom: 10 }} />
      <label className="form-label">Password</label>
      <input type="password" placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)} style={{ marginBottom: 18 }} />
      <button className="btn-next" style={{ width: '100%', fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }} onClick={submit}>
        ✦ Sign In
      </button>
      {role === 'client' && (
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.72rem', color: 'var(--muted)' }}>
          No account?{' '}
          <span style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}>Sign up →</span>
        </div>
      )}
      {role !== 'client' && (
        <div style={{ marginTop: 12, fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center' }}>
          Staff accounts are created by Super Admin. Check your email for credentials.
        </div>
      )}
    </>
  );
}

function SignupForm({ onBack, onSignup }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const { showToast } = useApp();

  function submit() {
    if (!name || !email) { showToast('Please fill in all fields.'); return; }
    const handle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const uname  = handle + '_' + Math.floor(100 + Math.random() * 900);
    onSignup({ name, email, username: uname });
  }

  return (
    <>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.78rem', marginBottom: 16 }}
      >
        ← Back
      </button>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 16 }}>
        CREATE CLIENT ACCOUNT
      </div>
      <label className="form-label">Full Name</label>
      <input type="text" placeholder="First Last" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 10 }} />
      <label className="form-label">Email</label>
      <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 10 }} />
      <label className="form-label">Password</label>
      <input type="password" placeholder="Min. 8 characters" value={pass} onChange={(e) => setPass(e.target.value)} style={{ marginBottom: 18 }} />
      <button className="btn-next" style={{ width: '100%', fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }} onClick={submit}>
        ✦ Create Account
      </button>
    </>
  );
}

export default function LoginModal() {
  const { loginOpen, closeLogin, setLoginUser, showPage, showToast, t } = useApp();
  const [view, setView] = useState('home'); // home | form | signup
  const [role, setRole] = useState(null);

  function handleRole(r) { setRole(r); setView('form'); }
  function handleBack()  { setView('home'); }

  function handleLogin(r, user) {
    const username = user.includes('@') ? user.split('@')[0] : user;
    setLoginUser({ username, role: ROLE_NAMES[r] });
    closeLogin();
    if (r === 'admin' || r === 'ops') {
      showPage('dashboard');
    } else {
      showToast(`Welcome back! Logged in as ${ROLE_NAMES[r]}.`);
    }
    setView('home');
  }

  function handleSignup({ name, email, username }) {
    setLoginUser({ username, role: 'Client' });
    closeLogin();
    showToast(`Account created! Username @${username} sent to ${email}`);
    setView('home');
  }

  if (!loginOpen) return null;

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && closeLogin()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
        <button className="modal-close" onClick={closeLogin} aria-label="Close login">✕</button>
        <h2 id="loginTitle">{t('loginTitle')}</h2>
        <p className="modal-sub">{t('loginSub')}</p>

        {view === 'home'   && <LoginHome  onRole={handleRole} onSignup={() => setView('signup')} />}
        {view === 'form'   && <LoginForm  role={role} onBack={handleBack} onLogin={handleLogin} />}
        {view === 'signup' && <SignupForm onBack={handleBack} onSignup={handleSignup} />}
      </div>
    </div>
  );
}

// components/LoginModal.js
// SECURE login: credentials are verified on the server (NextAuth), and the
// role comes back FROM the server inside the session. The old role-picker
// (which let anyone click "Super Admin") has been removed — that was the
// privilege-escalation hole (OWASP A01).
import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useApp } from '../context/AppContext';

// Demo staff accounts (seed in lib/users.server.js) — password: ChangeMe!2026
//   admin@cona.com (Super Admin) · ops@cona.com (Operations Manager)
//   guide@cona.com (Tour Guide)  · driver@cona.com (Driver)

function SignInForm({ onSignup }) {
  const router = useRouter();
  const { closeLogin, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email || !pass) { showToast('Please enter your email and password.'); return; }
    setBusy(true);
    const res = await signIn('credentials', { redirect: false, email, password: pass });
    setBusy(false);
    if (!res || res.error) { showToast('Invalid email or password.'); return; }

    const session = await getSession();          // role is decided by the server
    const role = session?.user?.role;
    closeLogin();
    if (role === 'Super Admin' || role === 'Operations Manager') {
      router.push('/dashboard');                 // staff → real, guarded route
    } else {
      showToast(`Welcome back, ${session?.user?.name?.split(' ')[0] || ''}.`);
    }
  }

  return (
    <>
      <label className="form-label">Email</label>
      <input
        type="email" placeholder="your@email.com" value={email}
        onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 10 }}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <label className="form-label">Password</label>
      <input
        type="password" placeholder="••••••••" value={pass}
        onChange={(e) => setPass(e.target.value)} style={{ marginBottom: 18 }}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <button
        className="btn-next" disabled={busy}
        style={{ width: '100%', fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}
        onClick={submit}
      >
        {busy ? '…' : '✦ Sign In'}
      </button>
      <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.72rem', color: 'var(--muted)' }}>
        New client?{' '}
        <span
          style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}
          onClick={onSignup} role="button" tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSignup()}
        >
          Create an account →
        </span>
      </div>
      <div style={{ marginTop: 12, fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center' }}>
        Staff accounts are provisioned by an administrator.
      </div>
    </>
  );
}

function SignupForm({ onBack }) {
  const { closeLogin, showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  function submit() {
    if (!name || !email || !pass) { showToast('Please fill in all fields.'); return; }
    // PHASE 2 SWAP-POINT: POST to /api/register (create hashed user), then signIn().
    closeLogin();
    showToast('Client sign-up goes live with the Phase 2 backend.');
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
  const { loginOpen, closeLogin, t } = useApp();
  const [view, setView] = useState('signin'); // signin | signup

  if (!loginOpen) return null;

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && closeLogin()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
        <button className="modal-close" onClick={closeLogin} aria-label="Close login">✕</button>
        <h2 id="loginTitle">{t('loginTitle')}</h2>
        <p className="modal-sub">{t('loginSub')}</p>

        {view === 'signin' && <SignInForm onSignup={() => setView('signup')} />}
        {view === 'signup' && <SignupForm onBack={() => setView('signin')} />}
      </div>
    </div>
  );
}

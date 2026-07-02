'use client';
import { useSession } from 'next-auth/react';
import { useRouter }  from 'next/navigation';
import { useApp }     from '../context/AppContext';
import LogoSeal       from './LogoSeal';

const STAFF_ROLES = ['Super Admin', 'Operations Manager', 'Tour Guide', 'Driver'];

export default function Footer() {
  const { openLogin, lang } = useApp();
  const { data: session } = useSession();
  const router  = useRouter();
  const isStaff = STAFF_ROLES.includes(session?.user?.role);

  const handleDashboard = () => {
    if (isStaff) router.push('/dashboard');
    else         openLogin();
  };

  return (
    <footer className="footer">
      <div className="footer-logo">
        <LogoSeal size={32} />
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.9rem', color: 'var(--sand)', letterSpacing: '0.1em' }}>
          CONA<br />
          <span style={{ fontSize: '0.5rem', color: 'var(--gold)', letterSpacing: '0.2em' }}>ADVENTURES</span>
        </div>
      </div>

      <div className="footer-links">
        <button type="button" onClick={() => router.push(`/${lang}`)}>Home</button>
        <button type="button" onClick={() => router.push(`/${lang}/gallery`)}>Gallery</button>
        <button type="button" onClick={() => router.push(`/${lang}/plan`)}>Plan Trip</button>
        <button type="button" onClick={() => router.push(`/${lang}/contact`)}>Contact</button>
        <button
          type="button"
          onClick={handleDashboard}
          style={isStaff ? { color: 'var(--gold)', fontWeight: 700 } : {}}
        >
          {isStaff ? <><span aria-hidden="true">⚡</span> Dashboard</> : 'Dashboard'}
        </button>
      </div>

      <div className="footer-social">
        <a href="#" aria-label="YouTube"><span aria-hidden="true">▶</span> YouTube</a>
        <a href="#" aria-label="X / Twitter"><span aria-hidden="true">𝕏</span> Twitter</a>
        <a href="#" aria-label="Instagram"><span aria-hidden="true">📷</span> Instagram</a>
        <a href="#" aria-label="Facebook"><span aria-hidden="true">📘</span> Facebook</a>
      </div>

      <div className="footer-copy-full cinzel">
        © 2026 CONA ADVENTURES · ALL RIGHTS RESERVED · FROM THE CONGO TO THE NAMIB
      </div>
    </footer>
  );
}

'use client';
import { useSession } from 'next-auth/react';
import { useRouter }  from 'next/navigation';
import { useApp }     from '../context/AppContext';
import LogoSeal       from './LogoSeal';

const STAFF_ROLES = ['Super Admin', 'Operations Manager', 'Tour Guide', 'Driver'];

export default function Footer() {
  const { openLogin } = useApp();
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
        <a onClick={() => router.push('/')}       role="button" tabIndex={0}>Home</a>
        <a onClick={() => router.push('/gallery')} role="button" tabIndex={0}>Gallery</a>
        <a onClick={() => router.push('/plan')}   role="button" tabIndex={0}>Plan Trip</a>
        <a onClick={() => router.push('/contact')} role="button" tabIndex={0}>Contact</a>
        <a
          onClick={handleDashboard}
          role="button"
          tabIndex={0}
          style={isStaff ? { color: 'var(--gold)', fontWeight: 700 } : {}}
        >
          {isStaff ? '⚡ Dashboard' : 'Dashboard'}
        </a>
      </div>

      <div className="footer-social">
        <a role="button" tabIndex={0}>▶ YouTube</a>
        <a role="button" tabIndex={0}>𝕏 Twitter</a>
        <a role="button" tabIndex={0}>📷 Instagram</a>
        <a role="button" tabIndex={0}>📘 Facebook</a>
      </div>

      <div className="footer-copy-full cinzel">
        © 2026 CONA ADVENTURES · ALL RIGHTS RESERVED · FROM THE CONGO TO THE NAMIB
      </div>
    </footer>
  );
}

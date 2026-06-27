// components/Footer.js
import { useApp } from '../context/AppContext';
import LogoSeal from './LogoSeal';

export default function Footer() {
  const { showPage, openLogin } = useApp();

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
        <a onClick={() => showPage('home')} role="button" tabIndex={0}>Home</a>
        <a onClick={() => showPage('gallery')} role="button" tabIndex={0}>Gallery</a>
        <a onClick={() => showPage('planner')} role="button" tabIndex={0}>Plan Trip</a>
        <a onClick={() => showPage('contact')} role="button" tabIndex={0}>Contact</a>
        <a onClick={openLogin} role="button" tabIndex={0}>Login</a>
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

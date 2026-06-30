// components/Nav.js
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useApp } from '../context/AppContext';
import LogoSeal from './LogoSeal';

export default function Nav() {
  const { t, lang, setLang, page, showPage, openLogin } = useApp();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  const links = [
    {
      label: t('navHome'),
      action: () => { showPage('home'); close(); },
      active: page === 'home',
    },
    {
      label: t('navExp'),
      action: () => {
        showPage('home'); close();
        setTimeout(() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' }), 50);
      },
    },
    {
      label: t('navGallery'),
      action: () => { showPage('gallery'); close(); },
      active: page === 'gallery',
    },
    {
      label: t('navPlan'),
      action: () => { showPage('planner'); close(); },
      active: page === 'planner',
    },
    {
      label: t('navContact'),
      action: () => { showPage('contact'); close(); },
      active: page === 'contact',
    },
  ];

  return (
    <>
      <nav className="nav">
        <button
          className="logo-wrap"
          onClick={() => showPage('home')}
          aria-label="CoNa Adventures — go home"
          style={{ background: 'none', border: 'none' }}
        >
          <LogoSeal size={44} />
          <div className="logo-text cinzel">
            CONA<span>ADVENTURES</span>
          </div>
        </button>

        <div className="nav-links">
          {links.map((lk) => (
            <a
              key={lk.label}
              onClick={lk.action}
              className={lk.active ? 'active' : ''}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && lk.action()}
            >
              {lk.label}
            </a>
          ))}
        </div>

        <div className="nav-right">
          <div className="lang-toggle">
            <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-btn${lang === 'fr' ? ' active' : ''}`} onClick={() => setLang('fr')}>FR</button>
          </div>
          {session ? (
            <button className="btn-login" onClick={() => signOut({ callbackUrl: '/' })}>
              ⚑ {session.user?.name?.split(' ')[0] || 'Sign out'} · Logout
            </button>
          ) : (
            <button className="btn-login" onClick={openLogin}>⚑ Login</button>
          )}
          <button
            className="hamburger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={menuOpen ? 'open' : ''} />
            <span className={menuOpen ? 'open' : ''} />
            <span className={menuOpen ? 'open' : ''} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-label="Navigation menu">
          <div className="mobile-menu-inner">
            {links.map((lk) => (
              <a
                key={lk.label}
                onClick={lk.action}
                className={lk.active ? 'active' : ''}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && lk.action()}
              >
                {lk.label}
              </a>
            ))}
            <hr className="mobile-divider" />
            <div className="mobile-lang">
              <button
                className={`lang-btn${lang === 'en' ? ' active' : ''}`}
                style={{ flex: 1, borderRadius: 6, border: '1px solid var(--border)' }}
                onClick={() => setLang('en')}
              >EN</button>
              <button
                className={`lang-btn${lang === 'fr' ? ' active' : ''}`}
                style={{ flex: 1, borderRadius: 6, border: '1px solid var(--border)' }}
                onClick={() => setLang('fr')}
              >FR</button>
            </div>
            {session ? (
              <button
                className="btn-login"
                style={{ width: '100%', textAlign: 'center' }}
                onClick={() => { signOut({ callbackUrl: '/' }); close(); }}
              >
                ⚑ Logout
              </button>
            ) : (
              <button
                className="btn-login"
                style={{ width: '100%', textAlign: 'center' }}
                onClick={() => { openLogin(); close(); }}
              >
                ⚑ Login
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

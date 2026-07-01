'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import LogoSeal from './LogoSeal';

const STAFF_ROLES = ['Super Admin', 'Operations Manager', 'Tour Guide', 'Driver'];

export default function Nav() {
  const { t, lang, openLogin } = useApp();
  const { data: session } = useSession();
  const router   = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef  = useRef(null);

  const isStaff = STAFF_ROLES.includes(session?.user?.role);

  // Close menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(e) { if (e.key === 'Escape') setMenuOpen(false); }
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [menuOpen]);

  function close() { setMenuOpen(false); }

  function handleLink(href) {
    close();
    if (href === '#experiences') {
      if (!pathname.match(/^\/(en|fr)\/?$/)) {
        router.push(`/${lang}/`);
        setTimeout(() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' }), 300);
      } else {
        document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    router.push(`/${lang}${href}`);
  }

  function switchLang(newLang) {
    // /en/gallery → /fr/gallery; /en → /fr
    const newPath = pathname.replace(/^\/(en|fr)/, `/${newLang}`);
    router.push(newPath.startsWith(`/${newLang}`) ? newPath : `/${newLang}`);
  }

  function isActive(href) {
    const base = `/${lang}${href}`;
    if (href === '/') return pathname === `/${lang}` || pathname === `/${lang}/`;
    return pathname.startsWith(base);
  }

  const links = [
    { label: t('navHome'),    href: '/' },
    { label: t('navExp'),     href: '#experiences' },
    { label: t('navGallery'), href: '/gallery' },
    { label: t('navPlan'),    href: '/plan' },
    { label: t('navContact'), href: '/contact' },
  ];

  return (
    <div ref={menuRef}>
      <nav className="nav">
        <button
          className="logo-wrap"
          onClick={() => router.push(`/${lang}/`)}
          aria-label="CoNa Adventures — go home"
          style={{ background: 'none', border: 'none' }}
        >
          <LogoSeal size={44} />
          <div className="logo-text cinzel">CONA<span>ADVENTURES</span></div>
        </button>

        <div className="nav-links">
          {links.map((lk) => (
            <a
              key={lk.label}
              onClick={() => handleLink(lk.href)}
              className={isActive(lk.href) ? 'active' : ''}
              role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleLink(lk.href)}
            >
              {lk.label}
            </a>
          ))}
          {isStaff && (
            <a
              onClick={() => router.push('/dashboard')}
              role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && router.push('/dashboard')}
              style={{ color: 'var(--gold)', fontWeight: 700 }}
            >
              ⚡ Dashboard
            </a>
          )}
        </div>

        <div className="nav-right">
          <div className="lang-toggle">
            <button
              className={`lang-btn${lang === 'en' ? ' active' : ''}`}
              onClick={() => switchLang('en')}
              aria-label="English"
            >EN</button>
            <button
              className={`lang-btn${lang === 'fr' ? ' active' : ''}`}
              onClick={() => switchLang('fr')}
              aria-label="Français"
            >FR</button>
          </div>
          {session ? (
            <button className="btn-login" onClick={() => signOut({ callbackUrl: `/${lang}/` })}>
              ⚑ {session.user?.name?.split(' ')[0] || 'Sign out'} · Logout
            </button>
          ) : (
            <button className="btn-login" onClick={openLogin}>⚑ Login</button>
          )}
          <button
            className="hamburger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={menuOpen ? 'open' : ''} />
            <span className={menuOpen ? 'open' : ''} />
            <span className={menuOpen ? 'open' : ''} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-nav" className="mobile-menu" role="dialog" aria-label="Navigation menu">
          <div className="mobile-menu-inner">
            {links.map((lk) => (
              <a
                key={lk.label}
                onClick={() => handleLink(lk.href)}
                className={isActive(lk.href) ? 'active' : ''}
                role="button" tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleLink(lk.href)}
              >
                {lk.label}
              </a>
            ))}
            {isStaff && (
              <a
                onClick={() => { router.push('/dashboard'); close(); }}
                role="button" tabIndex={0}
                style={{ color: 'var(--gold)', fontWeight: 700 }}
              >
                ⚡ Dashboard
              </a>
            )}
            <hr className="mobile-divider" />
            <div className="mobile-lang">
              <button
                className={`lang-btn${lang === 'en' ? ' active' : ''}`}
                style={{ flex: 1, borderRadius: 6, border: '1px solid var(--border)' }}
                onClick={() => { switchLang('en'); close(); }}
              >EN — English</button>
              <button
                className={`lang-btn${lang === 'fr' ? ' active' : ''}`}
                style={{ flex: 1, borderRadius: 6, border: '1px solid var(--border)' }}
                onClick={() => { switchLang('fr'); close(); }}
              >FR — Français</button>
            </div>
            {session ? (
              <button className="btn-login" style={{ width: '100%', textAlign: 'center' }}
                onClick={() => { signOut({ callbackUrl: `/${lang}/` }); close(); }}>
                ⚑ Logout
              </button>
            ) : (
              <button className="btn-login" style={{ width: '100%', textAlign: 'center' }}
                onClick={() => { openLogin(); close(); }}>
                ⚑ Login
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

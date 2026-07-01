'use client';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import LogoSeal from './LogoSeal';

const STAFF_ROLES = ['Super Admin', 'Operations Manager', 'Tour Guide', 'Driver'];

export default function Nav() {
  const { t, lang, setLang, openLogin } = useApp();
  const { data: session } = useSession();
  const router   = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isStaff = STAFF_ROLES.includes(session?.user?.role);
  const close = () => setMenuOpen(false);

  const links = [
    { label: t('navHome'),    href: '/' },
    { label: t('navExp'),     href: '/#experiences' },
    { label: t('navGallery'), href: '/gallery' },
    { label: t('navPlan'),    href: '/plan' },
    { label: t('navContact'), href: '/contact' },
  ];

  function handleLink(href) {
    close();
    if (href.startsWith('/#')) {
      if (pathname !== '/') {
        router.push('/');
        setTimeout(() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' }), 300);
      } else {
        document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    router.push(href);
  }

  function isActive(href) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      <nav className="nav">
        <button
          className="logo-wrap"
          onClick={() => router.push('/')}
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
              <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} style={{ flex: 1, borderRadius: 6, border: '1px solid var(--border)' }} onClick={() => setLang('en')}>EN</button>
              <button className={`lang-btn${lang === 'fr' ? ' active' : ''}`} style={{ flex: 1, borderRadius: 6, border: '1px solid var(--border)' }} onClick={() => setLang('fr')}>FR</button>
            </div>
            {session ? (
              <button className="btn-login" style={{ width: '100%', textAlign: 'center' }} onClick={() => { signOut({ callbackUrl: '/' }); close(); }}>
                ⚑ Logout
              </button>
            ) : (
              <button className="btn-login" style={{ width: '100%', textAlign: 'center' }} onClick={() => { openLogin(); close(); }}>
                ⚑ Login
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

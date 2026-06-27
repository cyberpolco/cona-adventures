// components/Nav.js
import { useApp } from '../context/AppContext';
import LogoSeal from './LogoSeal';

export default function Nav() {
  const { t, lang, setLang, page, showPage, openLogin, loginUser } = useApp();

  return (
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
        <a
          onClick={() => showPage('home')}
          className={page === 'home' ? 'active' : ''}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && showPage('home')}
        >
          {t('navHome')}
        </a>
        <a
          onClick={() => {
            showPage('home');
            setTimeout(() => {
              document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && showPage('home')}
        >
          {t('navExp')}
        </a>
        <a
          onClick={() => showPage('gallery')}
          className={page === 'gallery' ? 'active' : ''}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && showPage('gallery')}
        >
          {t('navGallery')}
        </a>
        <a
          onClick={() => showPage('planner')}
          className={page === 'planner' ? 'active' : ''}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && showPage('planner')}
        >
          {t('navPlan')}
        </a>
        <a
          onClick={() => showPage('contact')}
          className={page === 'contact' ? 'active' : ''}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && showPage('contact')}
        >
          {t('navContact')}
        </a>
      </div>

      <div className="nav-right">
        <div className="lang-toggle">
          <button
            className={`lang-btn${lang === 'en' ? ' active' : ''}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            className={`lang-btn${lang === 'fr' ? ' active' : ''}`}
            onClick={() => setLang('fr')}
          >
            FR
          </button>
        </div>
        <button className="btn-login" onClick={openLogin}>
          {loginUser ? `⚑ ${loginUser.username}` : '⚑ Login'}
        </button>
      </div>
    </nav>
  );
}

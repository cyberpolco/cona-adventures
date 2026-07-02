'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { mergeTripData } from '../../lib/bookingSession';
import AfricaMap from '../AfricaMap';
import GuideRatings from '../GuideRatings';

const EXPERIENCES = [
  { key: 'exp1', price: 'From $890',   emoji: '🏕', country: 'congo',   bg: 'linear-gradient(135deg,#0a2010,#163026)' },
  { key: 'exp2', price: 'From $1,200', emoji: '🚤', country: 'congo',   bg: 'linear-gradient(135deg,#0a1020,#0e2030)' },
  { key: 'exp3', price: 'From $450',   emoji: '🪂', country: 'congo',   bg: 'linear-gradient(135deg,#102010,#1a3a0a)' },
  { key: 'exp4', price: 'From $1,600', emoji: '🐘', country: 'namibia', bg: 'linear-gradient(135deg,#2a1000,#4a1a00)' },
  { key: 'exp5', price: 'From $780',   emoji: '🏜', country: 'namibia', bg: 'linear-gradient(135deg,#2a1800,#4a2800)' },
  { key: 'exp6', price: 'From $1,100', emoji: '🚗', country: 'namibia', bg: 'linear-gradient(135deg,#181820,#28283a)' },
];

export default function HomePage() {
  const { t, lang } = useApp();
  const router = useRouter();

  function selectCountry(country: string) {
    mergeTripData({ country });
    router.push(`/${lang}/plan`);
  }

  return (
    <main id="main-content" className="page-shell">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge cinzel">✦ Africa Awaits ✦</div>
          <h1 className="hero-title">
            <span className="line-c">{t('heroLine1')}</span>
            <br />
            <span className="line-n">{t('heroLine2')}</span>
          </h1>
          <div className="hero-tagline cinzel">{t('tagline')}</div>
          <p className="hero-sub">{t('heroSub')}</p>

          <div className="hero-cta">
            <button
              className="btn btn-primary cinzel"
              style={{ padding: '13px 30px', fontSize: '0.82rem' }}
              onClick={() => router.push(`/${lang}/plan`)}
            >
              ✦ {t('planAdventure')}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => document.getElementById('mapSection')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('exploreMap')}
            </button>
          </div>

          <div id="mapSection">
            <AfricaMap onCountrySelect={selectCountry} />
          </div>
        </div>
      </section>

      {/* EXPERIENCES */}
      <div className="section-head" id="experiences">
        <h2>{t('sigExp')}</h2>
        <p className="subtitle">{t('sigExpSub')}</p>
        <div className="section-divider" />
      </div>

      <div className="exp-grid">
        {EXPERIENCES.map((exp) => (
          <button
            key={exp.key}
            type="button"
            className="exp-card"
            onClick={() => selectCountry(exp.country)}
          >
            <div className="exp-img" style={{ background: exp.bg }} aria-hidden="true">{exp.emoji}</div>
            <div className="exp-body">
              <h4>{t(exp.key)}</h4>
              <p>{t(`${exp.key}d`)}</p>
              <div className="exp-price">{exp.price}</div>
            </div>
          </button>
        ))}
      </div>

      {/* GUIDE RATINGS */}
      <div className="section-head">
        <h2>{t('rateGuides')}</h2>
        <p className="subtitle">{t('rateGuidesSub')}</p>
        <div className="section-divider" />
      </div>
      <GuideRatings />

      {/* COUNTRY CARDS */}
      <div className="section-head">
        <h2>{t('whereGo')}</h2>
        <div className="section-divider" />
      </div>
      <div className="country-grid">
        <button
          type="button"
          className="c-card c-card-congo"
          onClick={() => selectCountry('congo')}
        >
          <h3 style={{ color: 'var(--teal)', marginBottom: 8, fontFamily: "'Cinzel', serif", fontSize: '0.9rem', letterSpacing: '0.1em' }}>
            <span aria-hidden="true">🌿</span> DR CONGO
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 14, lineHeight: 1.6 }}>{t('congoDesc')}</p>
          <span className="tag tag-t">Rainforest</span>
          <span className="tag tag-t">River</span>
          <span className="tag tag-t">Culture</span>
          <span className="tag tag-t">Mountains</span>
        </button>

        <button
          type="button"
          className="c-card c-card-namibia"
          onClick={() => selectCountry('namibia')}
        >
          <h3 style={{ color: '#e07050', marginBottom: 8, fontFamily: "'Cinzel', serif", fontSize: '0.9rem', letterSpacing: '0.1em' }}>
            <span aria-hidden="true">🏜</span> NAMIBIA
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 14, lineHeight: 1.6 }}>{t('namDesc')}</p>
          <span className="tag tag-o">Safari</span>
          <span className="tag tag-o">Self Drive</span>
          <span className="tag tag-o">Desert</span>
          <span className="tag tag-o">Wildlife</span>
        </button>
      </div>
    </main>
  );
}

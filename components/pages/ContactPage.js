'use client';
// components/pages/ContactPage.js
import { useApp } from '../../context/AppContext';

export default function ContactPage() {
  const { t } = useApp();

  return (
    <div className="page-shell contact-page-wrap">
      <div className="section-head" style={{ paddingTop: 40 }}>
        <h2>{t('contactUs')}</h2>
        <p className="subtitle">{t('contactSub')}</p>
        <div className="section-divider" />
      </div>

      <div className="contact-grid" style={{ padding: '0 24px 60px', maxWidth: 900, margin: '0 auto' }}>
        {/* Congo Base */}
        <div className="contact-card">
          <h3>🌿 CONGO BASE</h3>
          <div className="contact-row">
            <span className="contact-icon">📍</span>
            <div>Avenue Kasa-Vubu, Mbuji-Mayi<br />Kasaï-Oriental, DR Congo</div>
          </div>
          <div className="contact-row">
            <span className="contact-icon">📞</span>
            <div>+243 81 55 19 000</div>
          </div>
          <div className="contact-row">
            <span className="contact-icon">✉️</span>
            <div>congo@conaadventures.com</div>
          </div>
          <div className="map-placeholder">📍 Mbuji-Mayi, Kasaï-Oriental</div>
        </div>

        {/* Namibia Base */}
        <div className="contact-card">
          <h3>🏜 NAMIBIA BASE</h3>
          <div className="contact-row">
            <span className="contact-icon">📍</span>
            <div>14 Independence Avenue<br />Windhoek, Namibia</div>
          </div>
          <div className="contact-row">
            <span className="contact-icon">📞</span>
            <div>+264 61 22 04 000</div>
          </div>
          <div className="contact-row">
            <span className="contact-icon">✉️</span>
            <div>namibia@conaadventures.com</div>
          </div>
          <div className="map-placeholder">📍 Windhoek, Namibia</div>
        </div>

        {/* Social / General */}
        <div className="contact-card" style={{ gridColumn: '1 / -1' }}>
          <h3>CONNECT WITH US</h3>
          <div className="contact-row">
            <span className="contact-icon">✉️</span>
            <div>hello@conaadventures.com · bookings@conaadventures.com</div>
          </div>
          <div className="contact-row">
            <span className="contact-icon">🌐</span>
            <div>www.conaadventures.com</div>
          </div>
          <div className="social-links">
            <a className="social-btn" href="#" aria-label="YouTube">▶ YouTube @CoNaAdventures</a>
            <a className="social-btn" href="#" aria-label="X / Twitter">𝕏 @cona.adventures</a>
            <a className="social-btn" href="#" aria-label="Instagram">📷 @cona.adventures</a>
            <a className="social-btn" href="#" aria-label="Facebook">📘 CoNa Adventures</a>
          </div>
        </div>
      </div>
    </div>
  );
}

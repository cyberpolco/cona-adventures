'use client';
// components/pages/GalleryPage.js
import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';

// Placeholder gallery items using emoji covers
const INITIAL_GALLERY = [
  { id: 1, emoji: '🌿', label: 'Congo Rainforest', author: 'Emmanuel K.', approved: true },
  { id: 2, emoji: '🚤', label: 'River Expedition',  author: 'Chloe M.',    approved: true },
  { id: 3, emoji: '🏜', label: 'Sossusvlei Dunes',  author: 'Petrus N.',   approved: true },
  { id: 4, emoji: '🐘', label: 'Etosha Safari',     author: 'Anika S.',    approved: true },
  { id: 5, emoji: '🪂', label: 'Zipline View',      author: 'Jules M.',    approved: true },
  { id: 6, emoji: '🌅', label: 'Namib Sunrise',     author: 'Sarah T.',    approved: true },
];

export default function GalleryPage() {
  const { t, showToast } = useApp();
  const fileInputRef = useRef(null);
  const [gallery, setGallery] = useState(INITIAL_GALLERY);

  function handleFileSubmit(e) {
    const file = e.target.files[0];
    if (!file) return;
    const newItem = {
      id: Date.now(),
      emoji: '📸',
      label: file.name.replace(/\.[^.]+$/, ''),
      author: 'You (pending review)',
      approved: false,
      src: URL.createObjectURL(file),
    };
    setGallery((g) => [newItem, ...g]);
    showToast('Photo submitted! It will appear publicly after admin review.');
    e.target.value = '';
  }

  const approved = gallery.filter((i) => i.approved);

  return (
    <main id="main-content" className="page-shell gallery-page-wrap">
      <div className="section-head" style={{ paddingTop: 40 }}>
        <h2>{t('gallery')}</h2>
        <p className="subtitle">{t('gallerySub')}</p>
        <div className="section-divider" />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        {/* Upload area */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSubmit}
        />
        <button
          type="button"
          className="gallery-upload-area"
          onClick={() => fileInputRef.current?.click()}
          style={{ marginBottom: 30 }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 8 }} aria-hidden="true">📷</div>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '0.82rem',
              color: 'var(--gold)',
              letterSpacing: '0.08em',
              marginBottom: 6,
            }}
          >
            {t('submitPhoto')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{t('submitPhotoSub')}</div>
        </button>

        {/* Gallery grid */}
        <div className="gallery-grid">
          {approved.map((item) => (
            <div key={item.id} className="gallery-item">
              {item.src ? (
                <img src={item.src} alt={item.label} />
              ) : (
                <div style={{ fontSize: '4rem' }}>{item.emoji}</div>
              )}
              <div className="overlay">
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--sand)' }}>{item.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}><span aria-hidden="true">📷</span> {item.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

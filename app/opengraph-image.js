import { ImageResponse } from 'next/og';

export const runtime     = 'edge';
export const alt         = 'CoNa Adventures — Guided Expeditions in DR Congo & Namibia';
export const size        = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0e1a12',
        fontFamily: 'Georgia, serif',
        padding: '0 80px',
        position: 'relative',
      }}
    >
      {/* Corner accents */}
      <div style={{ position: 'absolute', top: 32, left: 40, width: 60, height: 2, background: '#E5A23C', display: 'flex' }} />
      <div style={{ position: 'absolute', top: 32, left: 40, width: 2, height: 60, background: '#E5A23C', display: 'flex' }} />
      <div style={{ position: 'absolute', bottom: 32, right: 40, width: 60, height: 2, background: '#E5A23C', display: 'flex' }} />
      <div style={{ position: 'absolute', bottom: 32, right: 40, width: 2, height: 60, background: '#E5A23C', display: 'flex' }} />

      {/* Badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        color: '#E5A23C', fontSize: 18, letterSpacing: 6,
        marginBottom: 28, textTransform: 'uppercase',
      }}>
        <div style={{ width: 32, height: 1, background: '#E5A23C', display: 'flex' }} />
        Africa Awaits
        <div style={{ width: 32, height: 1, background: '#E5A23C', display: 'flex' }} />
      </div>

      {/* Main title */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
      }}>
        <span style={{
          fontSize: 88, fontWeight: 900, letterSpacing: 12,
          color: '#2C7A70', lineHeight: 1,
        }}>
          CONA
        </span>
        <span style={{
          fontSize: 36, fontWeight: 400, letterSpacing: 22,
          color: '#C8B48C', lineHeight: 1.2,
        }}>
          ADVENTURES
        </span>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
        <div style={{ width: 120, height: 1, background: '#2a3f2e', display: 'flex' }} />
        <div style={{ width: 6, height: 6, background: '#E5A23C', borderRadius: 1, transform: 'rotate(45deg)', display: 'flex' }} />
        <div style={{ width: 120, height: 1, background: '#2a3f2e', display: 'flex' }} />
      </div>

      {/* Tagline */}
      <div style={{
        fontSize: 22, color: '#8aaa8a', letterSpacing: 2,
        marginBottom: 40, display: 'flex',
      }}>
        Guided Expeditions Through Wild Africa
      </div>

      {/* Destination pills */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 24px', borderRadius: 4,
          border: '1px solid #2C7A70', background: 'rgba(44,122,112,0.12)',
          color: '#2C7A70', fontSize: 20, letterSpacing: 3,
        }}>
          🌿  DR CONGO
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 24px', borderRadius: 4,
          border: '1px solid #C0532F', background: 'rgba(192,83,47,0.12)',
          color: '#e07050', fontSize: 20, letterSpacing: 3,
        }}>
          🏜  NAMIBIA
        </div>
      </div>
    </div>,
    size,
  );
}

import { ImageResponse } from 'next/og';

export const runtime     = 'edge';
export const size        = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#163026',
        }}
      >
        <div
          style={{
            width: '86%',
            height: '86%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: '6px solid #E5A23C',
          }}
        >
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 96,
              fontWeight: 700,
              color: '#E5A23C',
            }}
          >
            C
          </span>
        </div>
      </div>
    ),
    size,
  );
}

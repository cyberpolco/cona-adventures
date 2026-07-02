import { ImageResponse } from 'next/og';

export const runtime     = 'edge';
export const size        = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '50%',
          border: '2px solid #E5A23C',
        }}
      >
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 20,
            fontWeight: 700,
            color: '#E5A23C',
          }}
        >
          C
        </span>
      </div>
    ),
    size,
  );
}

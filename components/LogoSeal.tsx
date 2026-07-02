// components/LogoSeal.tsx
export default function LogoSeal({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="22" cy="22" r="21" fill="#163026" stroke="#E5A23C" strokeWidth="1.5" />
      <circle cx="22" cy="22" r="17" fill="none" stroke="#E5A23C" strokeWidth=".6" strokeDasharray="2 2" />
      {/* Sun */}
      <circle cx="22" cy="14" r="5" fill="#E5A23C" />
      <line x1="22" y1="7" x2="22" y2="5" stroke="#E5A23C" strokeWidth="1.2" />
      <line x1="27" y1="9" x2="28.5" y2="7.5" stroke="#E5A23C" strokeWidth="1.2" />
      <line x1="17" y1="9" x2="15.5" y2="7.5" stroke="#E5A23C" strokeWidth="1.2" />
      {/* Dune layers */}
      <path d="M8 30 Q15 22 22 26 Q29 30 36 22 L36 36 L8 36Z" fill="#C0532F" opacity=".7" />
      <path d="M6 34 Q14 27 22 31 Q30 35 38 28 L38 38 L6 38Z" fill="#2C7A70" opacity=".5" />
      {/* Acacia tree */}
      <line x1="22" y1="36" x2="22" y2="26" stroke="#3E6B4A" strokeWidth="1.5" />
      <ellipse cx="22" cy="24" rx="5" ry="3" fill="#3E6B4A" />
      <ellipse cx="19" cy="26" rx="3" ry="2" fill="#3E6B4A" />
      <ellipse cx="25" cy="26" rx="3" ry="2" fill="#3E6B4A" />
    </svg>
  );
}

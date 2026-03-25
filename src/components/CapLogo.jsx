export default function CapLogo({ size = 64 }) {
  return (
    <svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cap board */}
      <polygon
        points="60,10 110,35 60,58 10,35"
        stroke="#7fff00"
        strokeWidth="3"
        fill="none"
      />
      {/* Cap body */}
      <path
        d="M30 42 L30 68 Q60 80 90 68 L90 42"
        stroke="#7fff00"
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Tassel string */}
      <line x1="110" y1="35" x2="110" y2="60" stroke="#7fff00" strokeWidth="2.5" />
      {/* Tassel end */}
      <circle cx="110" cy="63" r="4" fill="#7fff00" />
      {/* Year label */}
      <text
        x="60"
        y="46"
        textAnchor="middle"
        fill="#7fff00"
        fontSize="12"
        fontFamily="'Fredoka', sans-serif"
        fontWeight="600"
      >
        2026
      </text>
    </svg>
  );
}
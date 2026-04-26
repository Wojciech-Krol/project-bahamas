export default function HeroAurora() {
  return (
    <div
      className="hero-aurora absolute inset-0 overflow-hidden pointer-events-none -z-10"
      aria-hidden
    >
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />
      <div className="hero-orb hero-orb-4" />
      <div className="hero-orb hero-orb-5" />
      <svg className="hero-grain" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <filter id="hero-grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain-filter)" />
      </svg>
    </div>
  );
}

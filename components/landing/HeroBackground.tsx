// Server Component — Pure CSS GPU-composited volumetric light rays
// Replaces the heavy WebGL (ogl) shader loop that blocked the main thread.

export default function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 w-full h-full overflow-hidden pointer-events-none select-none"
    >
      {/* Top-center ambient spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% -10%, rgba(226, 232, 240, 0.22) 0%, rgba(147, 197, 253, 0.11) 42%, rgba(30, 64, 175, 0.04) 68%, transparent 85%)",
        }}
      />

      {/* Primary volumetric light ray fan */}
      <div className="hero-rays-primary absolute inset-0" />

      {/* Secondary soft interlaced ray fan */}
      <div className="hero-rays-secondary absolute inset-0" />

      {/* Subtle bottom vignette to preserve contrast & depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 45%, rgba(2, 6, 23, 0.72) 100%)",
        }}
      />
    </div>
  );
}

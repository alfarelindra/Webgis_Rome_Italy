import { useEffect, useState, useRef } from "react";

interface LoadingScreenProps {
  onDone: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

const LATIN_PHRASES = [
  "Romam Petimus...",
  "Alea Iacta Est",
  "Carpe Diem",
  "SPQR — Senatus Populusque Romanus",
  "Caricamento dei Dati...",
];

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [helmetGlow, setHelmetGlow] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const particleIdRef = useRef(0);

  // Phrase cycling
  useEffect(() => {
    const t = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % LATIN_PHRASES.length);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  // Helmet glow pulse
  useEffect(() => {
    const t = setInterval(() => setHelmetGlow((g) => !g), 900);
    return () => clearInterval(t);
  }, []);

  // Progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setExiting(true);
          setTimeout(onDone, 900);
          return 100;
        }
        return Math.min(p + Math.random() * 5 + 2, 100);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onDone]);

  // Fire particle system on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const fireColors = [
      "#ff6a00", "#ff3d00", "#ff9800", "#ffcc02",
      "#c0623a", "#e8490d", "#ffd600",
    ];

    let localParticles: Array<{
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; size: number; color: string;
    }> = [];

    const spawnFire = () => {
      // Two torch positions (left & right columns)
      const torches = [
        { x: canvas.width * 0.18, y: canvas.height * 0.72 },
        { x: canvas.width * 0.82, y: canvas.height * 0.72 },
      ];
      torches.forEach((torch) => {
        for (let i = 0; i < 4; i++) {
          localParticles.push({
            x: torch.x + (Math.random() - 0.5) * 20,
            y: torch.y,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -(Math.random() * 3 + 1.5),
            life: 0,
            maxLife: Math.random() * 60 + 40,
            size: Math.random() * 8 + 4,
            color: fireColors[Math.floor(Math.random() * fireColors.length)],
          });
        }
      });
    };

    let frameCount = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      frameCount++;
      if (frameCount % 3 === 0) spawnFire();

      localParticles = localParticles.filter((p) => p.life < p.maxLife);
      localParticles.forEach((p) => {
        const ratio = p.life / p.maxLife;
        const alpha = (1 - ratio) * 0.85;
        const currentSize = p.size * (1 - ratio * 0.6);

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize);
        grad.addColorStop(0, p.color + "ff");
        grad.addColorStop(1, p.color + "00");
        ctx.beginPath();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.15;
        p.life++;
      });

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const pct = Math.min(Math.round(progress), 100);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden ${
        exiting ? "loading-spartan-exit" : "loading-spartan-enter"
      }`}
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #1e0f00 0%, #0a0600 55%, #000000 100%)",
      }}
      data-testid="loading-screen"
    >
      {/* Canvas fire */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Roman column silhouettes — left */}
      <svg
        className="absolute bottom-0 left-0 pointer-events-none spartan-column-left"
        width="140"
        height="380"
        viewBox="0 0 140 380"
        fill="none"
      >
        <rect x="55" y="20" width="30" height="320" rx="3" fill="rgba(80,40,10,0.55)" />
        {[0, 40, 80, 120, 160, 200, 240, 280].map((y, i) => (
          <rect key={i} x="52" y={y + 20} width="36" height="6" rx="2" fill="rgba(120,60,15,0.4)" />
        ))}
        <rect x="40" y="10" width="60" height="16" rx="3" fill="rgba(100,50,12,0.6)" />
        <rect x="35" y="0" width="70" height="12" rx="2" fill="rgba(120,65,15,0.55)" />
        <rect x="38" y="334" width="64" height="20" rx="3" fill="rgba(90,45,10,0.7)" />
        <rect x="30" y="352" width="80" height="28" rx="2" fill="rgba(80,38,8,0.8)" />
      </svg>

      {/* Roman column silhouettes — right */}
      <svg
        className="absolute bottom-0 right-0 pointer-events-none spartan-column-right"
        width="140"
        height="380"
        viewBox="0 0 140 380"
        fill="none"
      >
        <rect x="55" y="20" width="30" height="320" rx="3" fill="rgba(80,40,10,0.55)" />
        {[0, 40, 80, 120, 160, 200, 240, 280].map((y, i) => (
          <rect key={i} x="52" y={y + 20} width="36" height="6" rx="2" fill="rgba(120,60,15,0.4)" />
        ))}
        <rect x="40" y="10" width="60" height="16" rx="3" fill="rgba(100,50,12,0.6)" />
        <rect x="35" y="0" width="70" height="12" rx="2" fill="rgba(120,65,15,0.55)" />
        <rect x="38" y="334" width="64" height="20" rx="3" fill="rgba(90,45,10,0.7)" />
        <rect x="30" y="352" width="80" height="28" rx="2" fill="rgba(80,38,8,0.8)" />
      </svg>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-7 px-8 spartan-main-enter">

        {/* Spartan Helmet SVG */}
        <div
          className="relative spartan-helmet-float"
          style={{
            filter: helmetGlow
              ? "drop-shadow(0 0 28px #ff6a00cc) drop-shadow(0 0 60px #c0623a88)"
              : "drop-shadow(0 0 14px #c0623a66) drop-shadow(0 0 32px #ff6a0044)",
            transition: "filter 0.9s ease",
          }}
        >
          <svg
            width="120"
            height="130"
            viewBox="0 0 120 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Plume/crest */}
            <path
              d="M60 5 C55 2 42 8 35 15 C28 22 30 30 38 28 C44 26 50 20 60 18 C70 20 76 26 82 28 C90 30 92 22 85 15 C78 8 65 2 60 5Z"
              fill="url(#plumeGrad)"
              opacity="0.95"
            />
            <path
              d="M60 18 C52 22 44 30 42 40 L60 36 L78 40 C76 30 68 22 60 18Z"
              fill="url(#plumeGrad2)"
            />
            {/* Plume center line */}
            <line x1="60" y1="6" x2="60" y2="38" stroke="#ff9800" strokeWidth="1.5" opacity="0.7" />

            {/* Helmet body */}
            <path
              d="M20 60 C20 35 38 18 60 18 C82 18 100 35 100 60 L100 85 C100 95 92 103 80 106 L80 115 C80 120 72 124 60 124 C48 124 40 120 40 115 L40 106 C28 103 20 95 20 85 Z"
              fill="url(#helmetGrad)"
              stroke="#8b4a1a"
              strokeWidth="1.5"
            />

            {/* Cheek guards */}
            <path
              d="M20 72 C14 75 12 85 14 95 C16 103 24 108 32 106 L40 106 L40 72 Z"
              fill="url(#cheekGrad)"
              stroke="#7a3f15"
              strokeWidth="1"
            />
            <path
              d="M100 72 C106 75 108 85 106 95 C104 103 96 108 88 106 L80 106 L80 72 Z"
              fill="url(#cheekGrad)"
              stroke="#7a3f15"
              strokeWidth="1"
            />

            {/* Nose guard */}
            <rect x="54" y="55" width="12" height="40" rx="3" fill="url(#noseGrad)" stroke="#7a3f15" strokeWidth="1" />

            {/* Eye opening */}
            <path
              d="M28 58 C28 52 34 48 44 48 L54 48 L54 68 C54 72 50 74 44 74 C34 74 28 70 28 64 Z"
              fill="#0a0500"
              stroke="#5a3010"
              strokeWidth="1"
            />
            <path
              d="M92 58 C92 52 86 48 76 48 L66 48 L66 68 C66 72 70 74 76 74 C86 74 92 70 92 64 Z"
              fill="#0a0500"
              stroke="#5a3010"
              strokeWidth="1"
            />

            {/* Eye glow */}
            <ellipse cx="42" cy="60" rx="7" ry="5" fill="#ff4400" opacity="0.55" />
            <ellipse cx="78" cy="60" rx="7" ry="5" fill="#ff4400" opacity="0.55" />
            <ellipse cx="42" cy="60" rx="3" ry="2.5" fill="#ffaa00" opacity="0.8" />
            <ellipse cx="78" cy="60" rx="3" ry="2.5" fill="#ffaa00" opacity="0.8" />

            {/* Helmet ridge */}
            <path
              d="M35 35 Q60 28 85 35"
              stroke="#d4a843"
              strokeWidth="2.5"
              fill="none"
              opacity="0.8"
            />

            {/* Decorative side bands */}
            <line x1="22" y1="72" x2="38" y2="72" stroke="#d4a843" strokeWidth="1.5" opacity="0.6" />
            <line x1="82" y1="72" x2="98" y2="72" stroke="#d4a843" strokeWidth="1.5" opacity="0.6" />

            {/* Shine */}
            <path
              d="M38 30 Q50 26 56 36"
              stroke="rgba(255,220,150,0.35)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            <defs>
              <linearGradient id="plumeGrad" x1="35" y1="5" x2="85" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#cc0000" />
                <stop offset="50%" stopColor="#ff3300" />
                <stop offset="100%" stopColor="#990000" />
              </linearGradient>
              <linearGradient id="plumeGrad2" x1="42" y1="18" x2="78" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#aa0000" />
                <stop offset="100%" stopColor="#660000" />
              </linearGradient>
              <linearGradient id="helmetGrad" x1="20" y1="18" x2="100" y2="124" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#b05c1a" />
                <stop offset="40%" stopColor="#7a3e10" />
                <stop offset="100%" stopColor="#3d1c06" />
              </linearGradient>
              <linearGradient id="cheekGrad" x1="0" y1="72" x2="0" y2="115" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8b4a1a" />
                <stop offset="100%" stopColor="#3d1c06" />
              </linearGradient>
              <linearGradient id="noseGrad" x1="54" y1="55" x2="66" y2="95" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a05520" />
                <stop offset="100%" stopColor="#4a2208" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="flex items-center gap-3 justify-center">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-600/60" />
            <span
              className="text-xs tracking-[0.35em] uppercase font-semibold"
              style={{ color: "#c0623a" }}
            >
              SPQR · WebGIS
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-600/60" />
          </div>
          <h1
            className="text-5xl font-black tracking-[0.18em] uppercase"
            style={{
              color: "#f0e6d0",
              textShadow: "0 0 30px rgba(192,98,58,0.5), 0 2px 4px rgba(0,0,0,0.8)",
              fontFamily: "'Georgia', serif",
            }}
          >
            ROME
          </h1>
          <p
            className="text-sm tracking-[0.22em] uppercase"
            style={{ color: "#7a6050", fontFamily: "'Georgia', serif" }}
          >
            Aeterna Urbs
          </p>
        </div>

        {/* Animated phrase */}
        <div
          className="spartan-phrase text-xs text-center tracking-[0.2em] uppercase px-4"
          style={{ color: "#c0623a", minHeight: "1.5em", fontFamily: "'Georgia', serif" }}
          key={phraseIdx}
        >
          {LATIN_PHRASES[phraseIdx]}
        </div>

        {/* SPQR shield divider */}
        <svg width="220" height="24" viewBox="0 0 220 24" fill="none">
          <line x1="0" y1="12" x2="88" y2="12" stroke="url(#lineL)" strokeWidth="1" />
          <path d="M94 4 L110 12 L94 20 Z" fill="#c0623a" opacity="0.7" />
          <text x="110" y="17" textAnchor="middle" fontSize="10" letterSpacing="3" fill="#d4a843" fontFamily="Georgia, serif" opacity="0.9">SPQR</text>
          <path d="M126 4 L110 12 L126 20 Z" fill="#c0623a" opacity="0.7" />
          <line x1="132" y1="12" x2="220" y2="12" stroke="url(#lineR)" strokeWidth="1" />
          <defs>
            <linearGradient id="lineL" x1="0" y1="0" x2="88" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="#c0623a" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="lineR" x1="132" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c0623a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        {/* Progress bar */}
        <div className="w-72 flex flex-col gap-2">
          <div
            className="w-full overflow-hidden"
            style={{
              height: "4px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "2px",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            <div
              className="h-full transition-all duration-200 ease-out"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #7a2e0a 0%, #c0623a 45%, #d4a843 100%)",
                borderRadius: "2px",
                boxShadow: "0 0 10px rgba(192,98,58,0.7)",
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: "#6b5045", fontFamily: "'Georgia', serif" }}
            >
              {pct < 35
                ? "Initium..."
                : pct < 65
                ? "Caricamento GeoJSON..."
                : pct < 90
                ? "Parata Roma..."
                : "Ave Roma!"}
            </span>
            <span
              className="text-xs font-mono font-bold"
              style={{ color: "#c0623a", textShadow: "0 0 8px rgba(192,98,58,0.5)" }}
            >
              {pct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

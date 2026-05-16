import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onDone: () => void;
}

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setExiting(true);
          setTimeout(onDone, 500);
          return 100;
        }
        return p + Math.random() * 18 + 5;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center ${exiting ? "loading-screen-exit" : ""}`}
      style={{ background: "linear-gradient(160deg, #1a1410 0%, #0f0c08 60%, #1a1210 100%)" }}
      data-testid="loading-screen"
    >
      {/* Decorative arches */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute opacity-5"
          style={{
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            border: "80px solid #c0623a",
          }}
        />
        <div
          className="absolute opacity-5"
          style={{
            bottom: "-15%",
            right: "-10%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            border: "60px solid #d4a843",
          }}
        />
      </div>

      <div className="loading-screen-enter relative z-10 flex flex-col items-center gap-8 px-8">
        {/* Colosseum icon */}
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="36" cy="42" rx="32" ry="22" stroke="#c0623a" strokeWidth="2.5" fill="none" opacity="0.9" />
          <ellipse cx="36" cy="42" rx="22" ry="13" stroke="#d4a843" strokeWidth="1.5" fill="none" opacity="0.7" />
          <line x1="4" y1="42" x2="68" y2="42" stroke="#c0623a" strokeWidth="1.5" opacity="0.5" />
          <line x1="36" y1="20" x2="36" y2="64" stroke="#c0623a" strokeWidth="1.5" opacity="0.3" />
          {[15, 22, 29, 36, 43, 50, 57].map((x, i) => (
            <rect key={i} x={x} y={27} width={3} height={15} rx={1} fill="#c0623a" opacity={0.6} />
          ))}
        </svg>

        <div className="text-center">
          <h1
            className="text-4xl font-bold tracking-widest uppercase mb-2"
            style={{ color: "#e8ddd0", letterSpacing: "0.25em" }}
          >
            WebGIS Roma
          </h1>
          <p className="text-sm tracking-[0.2em] uppercase" style={{ color: "#8a7060" }}>
            Caricamento della mappa
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 flex flex-col gap-2">
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: "3px", background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: "linear-gradient(90deg, #c0623a, #d4a843)",
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: "#6b5e52" }}>
              {progress < 40 ? "Inizializzazione mappa..." : progress < 75 ? "Caricamento dati GeoJSON..." : "Pronto"}
            </span>
            <span className="text-xs font-mono" style={{ color: "#c0623a" }}>
              {Math.min(Math.round(progress), 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

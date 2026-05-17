import { useState, useRef, useEffect, useCallback } from "react";
import { Music, Volume2, VolumeX, Volume1, Play, Pause, ChevronUp, ChevronDown, GripVertical } from "lucide-react";

const BASE_PATH = import.meta.env.BASE_URL;
const MUSIC_SRC = `${BASE_PATH}background.mp3`.replace(/\/\//g, "/");
const STORAGE_KEY = "webgis-rome-music-position";
const PLAYER_W = 196;
const PLAYER_H_COLLAPSED = 44;

type Position = { x: number; y: number };

function loadPosition(): Position | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Position;
    if (typeof p.x !== "number" || typeof p.y !== "number") return null;
    // Posisi lama (kiri, menutupi panel) — pakai default kanan bawah
    if (p.x < window.innerWidth * 0.45) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return p;
  } catch {
    /* ignore */
  }
  return null;
}

function defaultPosition(): Position {
  const margin = 16;
  const bottomClear = 88;
  return {
    x: Math.max(margin, window.innerWidth - PLAYER_W - margin),
    y: Math.max(margin, window.innerHeight - PLAYER_H_COLLAPSED - bottomClear),
  };
}

function clampPosition(x: number, y: number, expanded: boolean): Position {
  const h = expanded ? 140 : PLAYER_H_COLLAPSED;
  const margin = 8;
  return {
    x: Math.min(Math.max(margin, x), window.innerWidth - PLAYER_W - margin),
    y: Math.min(Math.max(margin, y), window.innerHeight - h - margin),
  };
}

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [position, setPosition] = useState<Position | null>(() => loadPosition());
  const [dragging, setDragging] = useState(false);
  const prevVolRef = useRef(0.35);

  const resolvedPos = position ?? defaultPosition();

  useEffect(() => {
    const onResize = () => {
      setPosition((p) => {
        const base = p ?? defaultPosition();
        return clampPosition(base.x, base.y, expanded);
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [expanded]);

  useEffect(() => {
    if (position) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }
  }, [position]);

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = volume;
    audio.preload = "metadata";
    audio.addEventListener("canplay", () => setLoaded(true));
    audio.addEventListener("error", () => setLoaded(false));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [playing]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (!m) prevVolRef.current = volume;
      return !m;
    });
  }, [volume]);

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (muted && v > 0) setMuted(false);
  };

  const onPointerDownDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, input")) return;
    e.preventDefault();
    const start = position ?? defaultPosition();
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: start.x, origY: start.y };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMoveDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition(clampPosition(dragRef.current.origX + dx, dragRef.current.origY + dy, expanded));
  };

  const onPointerUpDrag = (e: React.PointerEvent) => {
    dragRef.current = null;
    setDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const volumeIcon = muted || volume === 0
    ? <VolumeX size={13} />
    : volume < 0.4
    ? <Volume1 size={13} />
    : <Volume2 size={13} />;

  const volPct = muted ? 0 : Math.round(volume * 100);

  return (
    <div
      className="absolute z-[1000] select-none"
      style={{
        left: resolvedPos.x,
        top: resolvedPos.y,
        width: PLAYER_W,
        cursor: dragging ? "grabbing" : undefined,
      }}
      data-testid="music-player"
    >
      <div
        className="rounded-xl overflow-hidden transition-all"
        style={{
          background: "rgba(14,11,8,0.93)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: playing
            ? "1px solid rgba(212,168,67,0.35)"
            : "1px solid rgba(255,255,255,0.07)",
          boxShadow: playing
            ? "0 8px 32px rgba(212,168,67,0.15)"
            : "0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="flex items-center gap-2 px-2 py-2 touch-none"
          onPointerDown={onPointerDownDrag}
          onPointerMove={onPointerMoveDrag}
          onPointerUp={onPointerUpDrag}
          onPointerCancel={onPointerUpDrag}
          title="Seret untuk memindahkan"
        >
          <div className="flex-shrink-0 p-0.5 rounded cursor-grab active:cursor-grabbing" style={{ color: "#4a3e36" }} aria-hidden>
            <GripVertical size={14} />
          </div>

          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: playing
                ? "linear-gradient(135deg,#c0623a,#d4a843)"
                : "rgba(255,255,255,0.06)",
            }}
          >
            {playing ? (
              <div className="flex items-end gap-0.5 h-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-0.5 rounded-full"
                    style={{
                      background: "white",
                      height: "100%",
                      animation: `music-bar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <Music size={12} style={{ color: "#6b5e52" }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold truncate" style={{ color: playing ? "#d4a843" : "#8a7060" }}>
              Taste of Italy
            </div>
            <div className="text-[9px]" style={{ color: "#4a3e36" }}>
              Geoff Harvey
            </div>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-0.5 rounded transition-colors"
            style={{ color: "#4a3e36" }}
            data-testid="button-music-expand"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        </div>

        {expanded && (
          <div className="px-3 pb-2.5 flex flex-col gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={togglePlay}
                disabled={!loaded}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: playing
                    ? "linear-gradient(135deg,rgba(192,98,58,0.3),rgba(212,168,67,0.3))"
                    : "rgba(255,255,255,0.06)",
                  color: playing ? "#d4a843" : "#8a7060",
                  border: playing ? "1px solid rgba(212,168,67,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  opacity: loaded ? 1 : 0.4,
                }}
                data-testid="button-music-play"
              >
                {playing ? <Pause size={11} /> : <Play size={11} />}
                {playing ? "Pause" : "Play"}
              </button>

              <button
                onClick={toggleMute}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  background: muted ? "rgba(192,98,58,0.15)" : "rgba(255,255,255,0.05)",
                  color: muted ? "#c0623a" : "#6b5e52",
                  border: muted ? "1px solid rgba(192,98,58,0.3)" : "1px solid rgba(255,255,255,0.06)",
                }}
                title={muted ? "Unmute" : "Mute"}
                data-testid="button-music-mute"
              >
                {volumeIcon}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <VolumeX size={10} style={{ color: "#3a3028", flexShrink: 0 }} />
              <div className="relative flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all"
                  style={{
                    width: `${volPct}%`,
                    background: muted
                      ? "rgba(192,98,58,0.4)"
                      : "linear-gradient(90deg,#c0623a,#d4a843)",
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  onChange={handleVolume}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  data-testid="slider-volume"
                />
              </div>
              <Volume2 size={10} style={{ color: "#3a3028", flexShrink: 0 }} />
            </div>

            <div className="text-center text-[9px]" style={{ color: "#3a3028" }}>
              {muted ? "🔇 Muted" : `🔊 ${volPct}%`}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes music-bar {
          from { transform: scaleY(0.2); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

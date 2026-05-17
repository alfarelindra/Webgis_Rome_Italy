import { useState, useRef, useEffect, useCallback } from "react";
import { Music, Volume2, VolumeX, Volume1, Play, Pause, ChevronUp, ChevronDown } from "lucide-react";

const BASE_PATH = import.meta.env.BASE_URL;
const MUSIC_SRC = `${BASE_PATH}background.mp3`.replace(/\/\//g, "/");

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const prevVolRef = useRef(0.35);

  // Init audio element
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

  // Sync volume to audio
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

  const volumeIcon = muted || volume === 0
    ? <VolumeX size={13} />
    : volume < 0.4
    ? <Volume1 size={13} />
    : <Volume2 size={13} />;

  const volPct = muted ? 0 : Math.round(volume * 100);

  return (
    <div
      className="absolute bottom-[72px] left-4 z-[1000]"
      style={{ width: "200px" }}
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
        {/* Main bar */}
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Music icon / play indicator */}
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: playing
                ? "linear-gradient(135deg,#c0623a,#d4a843)"
                : "rgba(255,255,255,0.06)",
            }}
          >
            {playing ? (
              // Animated bars when playing
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

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold truncate" style={{ color: playing ? "#d4a843" : "#8a7060" }}>
              Taste of Italy
            </div>
            <div className="text-[9px]" style={{ color: "#4a3e36" }}>
              Geoff Harvey
            </div>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-0.5 rounded transition-colors"
            style={{ color: "#4a3e36" }}
            data-testid="button-music-expand"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        </div>

        {/* Expanded controls */}
        {expanded && (
          <div
            className="px-3 pb-2.5 flex flex-col gap-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            {/* Play / Pause */}
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

              {/* Mute toggle */}
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

            {/* Volume slider */}
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

            {/* Volume percentage */}
            <div className="text-center text-[9px]" style={{ color: "#3a3028" }}>
              {muted ? "🔇 Muted" : `🔊 ${volPct}%`}
            </div>
          </div>
        )}
      </div>

      {/* CSS for animated bars */}
      <style>{`
        @keyframes music-bar {
          from { transform: scaleY(0.2); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

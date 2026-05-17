import { X, Navigation, MapPin } from "lucide-react";
import { LAYER_CONFIG, type LayerKey } from "./LayerControl";

export interface NearbyResult {
  id: string;
  name: string;
  category: LayerKey;
  distance: number;
  lat: number;
  lng: number;
}

interface NearbyPanelProps {
  results: NearbyResult[];
  radius: number;
  onRadiusChange: (r: number) => void;
  onSelect: (item: NearbyResult) => void;
  onClose: () => void;
}

const RADIUS_OPTIONS = [
  { value: 200, label: "200m" },
  { value: 500, label: "500m" },
  { value: 1000, label: "1km" },
  { value: 2000, label: "2km" },
  { value: 5000, label: "5km" },
];

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

function getDistanceColor(m: number): string {
  if (m < 200) return "#7c9e6a";
  if (m < 500) return "#d4a843";
  if (m < 1000) return "#c0623a";
  return "#8a7060";
}

export default function NearbyPanel({ results, radius, onRadiusChange, onSelect, onClose }: NearbyPanelProps) {
  return (
    <div
      className="absolute right-4 top-4 bottom-4 z-[1000] w-72 flex flex-col slide-in-right"
      data-testid="nearby-panel"
    >
      <div
        className="flex flex-col h-full rounded-xl overflow-hidden"
        style={{
          background: "rgba(20, 16, 12, 0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(192,98,58,0.3)",
          boxShadow: "0 12px 48px rgba(0,0,0,0.75)",
        }}
      >
        {/* Header */}
        <div className="p-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Navigation size={14} style={{ color: "#c0623a" }} />
              <span className="text-sm font-semibold" style={{ color: "#e0d8cc" }}>Lokasi Terdekat</span>
            </div>
            <button onClick={onClose} style={{ color: "#6b5e52" }} data-testid="button-close-nearby">
              <X size={15} />
            </button>
          </div>

          {/* Result count */}
          <div className="text-xs mb-3" style={{ color: "#8a7060" }}>
            <span style={{ color: "#d4a843", fontWeight: 600 }}>{results.length}</span> lokasi dalam radius{" "}
            <span style={{ color: "#c0623a", fontWeight: 600 }}>{formatDistance(radius)}</span>
          </div>

          {/* Radius selector */}
          <div className="flex gap-1.5">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onRadiusChange(opt.value)}
                data-testid={`button-radius-${opt.value}`}
                className="flex-1 py-1 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: radius === opt.value ? "rgba(192,98,58,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${radius === opt.value ? "rgba(192,98,58,0.5)" : "rgba(255,255,255,0.06)"}`,
                  color: radius === opt.value ? "#c0623a" : "#6b5e52",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto" data-testid="nearby-results">
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(192,98,58,0.08)", border: "1px solid rgba(192,98,58,0.15)" }}
              >
                <MapPin size={18} style={{ color: "#c0623a", opacity: 0.5 }} />
              </div>
              <p className="text-xs" style={{ color: "#6b5e52" }}>
                Tidak ada lokasi dalam radius ini. Coba perbesar jangkauan.
              </p>
            </div>
          ) : (
            results.map((item, i) => {
              const cfg = LAYER_CONFIG[item.category];
              const distColor = getDistanceColor(item.distance);
              return (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(192,98,58,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => onSelect(item)}
                  data-testid={`nearby-result-${i}`}
                >
                  {/* Rank */}
                  <span
                    className="text-[10px] font-bold w-5 text-center flex-shrink-0"
                    style={{ color: i < 3 ? "#d4a843" : "#3a3028" }}
                  >
                    {i + 1}
                  </span>

                  {/* Category dot */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}66` }}
                  />

                  {/* Name + category */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: "#c8bfb2" }}>{item.name}</div>
                    <div className="text-[10px]" style={{ color: "#4a3e36" }}>{cfg.label}</div>
                  </div>

                  {/* Distance badge */}
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: distColor + "18", color: distColor }}
                  >
                    {formatDistance(item.distance)}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[10px]" style={{ color: "#3a3028" }}>
            Klik lokasi lain di peta untuk pindah titik pusat
          </p>
        </div>
      </div>
    </div>
  );
}

import { X, MapPin, Clock, Train, Landmark, HelpCircle, Star } from "lucide-react";
import { LAYER_CONFIG, type LayerKey } from "./LayerControl";

interface LocationProperties {
  name?: string | null;
  tourism?: string | null;
  railway?: string | null;
  highway?: string | null;
  amenity?: string | null;
  opening_hours?: string | null;
  operator?: string | null;
  surface?: string | null;
  capacity?: string | null;
  [key: string]: string | number | null | undefined;
}

interface LocationPanelProps {
  feature: { properties: LocationProperties } | null;
  category: LayerKey | null;
  onClose: () => void;
  isBookmarked?: boolean;
  onBookmark?: () => void;
}

function getCategoryIcon(category: LayerKey | null) {
  switch (category) {
    case "tourism": return <Landmark size={16} />;
    case "railway": return <Train size={16} />;
    case "amenity": return <MapPin size={16} />;
    default: return <HelpCircle size={16} />;
  }
}

const SKIP_KEYS = new Set([
  "osm_id", "osm_type", "rooms", "beds", "width", "building", "oneway",
  "tunnel", "bridge", "barrier", "parking", "aeroway", "smoothness", "layer",
  "public_transport"
]);

const KEY_LABELS: Record<string, string> = {
  name: "Nama",
  tourism: "Wisata",
  railway: "Transportasi",
  highway: "Jalan",
  amenity: "Fasilitas",
  opening_hours: "Jam Buka",
  operator: "Operator",
  surface: "Permukaan",
  capacity: "Kapasitas",
};

export default function LocationPanel({ feature, category, onClose, isBookmarked, onBookmark }: LocationPanelProps) {
  if (!feature) return null;

  const props = feature.properties;
  const name = props.name || "Lokasi Tidak Bernama";
  const config = category ? LAYER_CONFIG[category] : LAYER_CONFIG.default;

  const details = Object.entries(props).filter(
    ([key, val]) => !SKIP_KEYS.has(key) && val !== null && val !== undefined && val !== ""
  );

  return (
    <div
      className="absolute right-4 top-4 bottom-4 z-[1000] w-72 slide-in-right flex flex-col"
      data-testid="location-panel"
    >
      <div
        className="flex flex-col h-full rounded-xl overflow-hidden"
        style={{
          background: "rgba(20, 16, 12, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(192, 98, 58, 0.2)",
          boxShadow: "0 12px 48px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div className="p-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: config.color }}>
                {getCategoryIcon(category)}
                {config.label}
              </div>
              <h2 className="text-base font-semibold leading-tight" style={{ color: "#e8ddd0" }} data-testid="text-location-name">
                {name}
              </h2>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {onBookmark && (
                <button
                  onClick={onBookmark}
                  className="p-1.5 rounded-lg transition-all"
                  style={{
                    color: isBookmarked ? "#d4a843" : "#6b5e52",
                    background: isBookmarked ? "rgba(212,168,67,0.12)" : "rgba(255,255,255,0.04)",
                  }}
                  title={isBookmarked ? "Hapus dari favorit" : "Simpan ke favorit"}
                  data-testid="button-bookmark"
                >
                  <Star size={15} fill={isBookmarked ? "#d4a843" : "none"} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "#6b5e52", background: "rgba(255,255,255,0.04)" }}
                data-testid="button-close-panel"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            {details.length === 0 ? (
              <p className="text-sm italic" style={{ color: "#6b5e52" }}>Tidak ada informasi tambahan</p>
            ) : (
              details.map(([key, val]) => (
                <div key={key} className="flex flex-col gap-0.5 p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }} data-testid={`text-prop-${key}`}>
                  <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "#6b5e52" }}>
                    {KEY_LABELS[key] || key}
                  </span>
                  <span className="text-sm" style={{ color: "#c8bfb2" }}>
                    {key === "opening_hours" ? (
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} style={{ color: "#c0623a" }} />
                        {String(val)}
                      </span>
                    ) : String(val)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: config.color, boxShadow: `0 0 6px ${config.color}` }} />
            <span className="text-xs" style={{ color: "#6b5e52" }}>Data dari OpenStreetMap</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Layers, ChevronUp, ChevronDown } from "lucide-react";

export type LayerKey = "shop" | "tourism" | "railway" | "amenity" | "default";

export const LAYER_CONFIG: Record<LayerKey, { label: string; color: string; description: string }> = {
  shop: { label: "Toko & Tiket", color: "#d4a843", description: "Toko, tiket" },
  tourism: { label: "Wisata", color: "#4caf7d", description: "Tempat wisata, viewpoint" },
  railway: { label: "Transportasi", color: "#5b9bd5", description: "Kereta, jalan" },
  amenity: { label: "Fasilitas", color: "#a07ed6", description: "Fasilitas umum" },
  default: { label: "Lainnya", color: "#8a7060", description: "Titik lain" },
};

interface LayerControlProps {
  layers: Record<LayerKey, boolean>;
  onToggle: (key: LayerKey) => void;
}

export default function LayerControl({ layers, onToggle }: LayerControlProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="absolute bottom-20 left-4 z-[1000] w-52"
      data-testid="layer-control"
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "rgba(20, 16, 12, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(192, 98, 58, 0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        <button
          className="w-full flex items-center justify-between px-3 py-2.5 transition-colors"
          style={{ borderBottom: expanded ? "1px solid rgba(255,255,255,0.06)" : "none" }}
          onClick={() => setExpanded(!expanded)}
          data-testid="button-layer-toggle"
        >
          <div className="flex items-center gap-2">
            <Layers size={14} style={{ color: "#c0623a" }} />
            <span className="text-xs font-medium tracking-wider uppercase" style={{ color: "#e0d8cc" }}>
              Layer
            </span>
          </div>
          {expanded ? (
            <ChevronDown size={14} style={{ color: "#6b5e52" }} />
          ) : (
            <ChevronUp size={14} style={{ color: "#6b5e52" }} />
          )}
        </button>

        {expanded && (
          <div className="p-2 flex flex-col gap-1">
            {(Object.keys(LAYER_CONFIG) as LayerKey[]).map((key) => {
              const config = LAYER_CONFIG[key];
              const active = layers[key];
              return (
                <button
                  key={key}
                  onClick={() => onToggle(key)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all w-full text-left"
                  style={{
                    background: active ? "rgba(255,255,255,0.04)" : "transparent",
                    opacity: active ? 1 : 0.45,
                  }}
                  data-testid={`button-layer-${key}`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      background: config.color,
                      boxShadow: active ? `0 0 8px ${config.color}80` : "none",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: "#e0d8cc" }}>
                      {config.label}
                    </div>
                  </div>
                  <div
                    className="w-7 h-4 rounded-full relative transition-colors flex-shrink-0"
                    style={{ background: active ? config.color : "rgba(255,255,255,0.1)" }}
                  >
                    <div
                      className="absolute top-0.5 w-3 h-3 rounded-full transition-transform"
                      style={{
                        background: "white",
                        transform: active ? "translateX(15px)" : "translateX(2px)",
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

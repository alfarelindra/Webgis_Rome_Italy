import { useState } from "react";
import { Layers, ChevronUp, ChevronDown, ChevronRight } from "lucide-react";

export type LayerKey = "tourism" | "railway" | "amenity" | "default";

export const LAYER_CONFIG: Record<LayerKey, { label: string; color: string; description: string }> = {
  tourism: { label: "Wisata & Hotel", color: "#4caf7d", description: "Museum, hotel, galeri" },
  railway: { label: "Transportasi", color: "#5b9bd5", description: "Stasiun, metro, tram" },
  amenity: { label: "Kuliner & Fasilitas", color: "#a07ed6", description: "Restoran, kafe, bar" },
  default: { label: "Lainnya", color: "#8a7060", description: "Titik lain" },
};

export const SUB_CATEGORIES: Partial<Record<LayerKey, { key: string; label: string }[]>> = {
  amenity: [
    { key: "restaurant", label: "Restoran" },
    { key: "cafe", label: "Kafe" },
    { key: "fast_food", label: "Fast Food" },
    { key: "bar", label: "Bar" },
    { key: "pub", label: "Pub" },
    { key: "ice_cream", label: "Es Krim" },
    { key: "place_of_worship", label: "Ibadah" },
    { key: "marketplace", label: "Pasar" },
    { key: "pharmacy", label: "Apotek" },
    { key: "fountain", label: "Air Mancur" },
  ],
  tourism: [
    { key: "hotel", label: "Hotel" },
    { key: "museum", label: "Museum" },
    { key: "artwork", label: "Karya Seni" },
    { key: "attraction", label: "Atraksi" },
    { key: "viewpoint", label: "Viewpoint" },
    { key: "gallery", label: "Galeri" },
    { key: "hostel", label: "Hostel" },
    { key: "information", label: "Info" },
  ],
  railway: [
    { key: "subway_entrance", label: "Metro / Subway" },
    { key: "tram_stop", label: "Tram" },
    { key: "station", label: "Stasiun" },
    { key: "stop", label: "Halte" },
    { key: "bus_stop", label: "Bus Stop" },
    { key: "platform", label: "Platform" },
    { key: "crossing", label: "Penyeberangan" },
  ],
};

interface LayerControlProps {
  layers: Record<LayerKey, boolean>;
  onToggle: (key: LayerKey) => void;
  subLayers: Record<string, boolean>;
  onSubToggle: (subKey: string) => void;
}

export default function LayerControl({ layers, onToggle, subLayers, onSubToggle }: LayerControlProps) {
  const [panelOpen, setPanelOpen] = useState(true);
  const [expanded, setExpanded] = useState<Partial<Record<LayerKey, boolean>>>({});

  const toggleExpand = (key: LayerKey) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      className="absolute bottom-20 left-4 z-[1000] w-56"
      data-testid="layer-control"
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "rgba(20, 16, 12, 0.93)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(192, 98, 58, 0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <button
          className="w-full flex items-center justify-between px-3 py-2.5 transition-colors"
          style={{ borderBottom: panelOpen ? "1px solid rgba(255,255,255,0.06)" : "none" }}
          onClick={() => setPanelOpen(!panelOpen)}
          data-testid="button-layer-panel-toggle"
        >
          <div className="flex items-center gap-2">
            <Layers size={14} style={{ color: "#c0623a" }} />
            <span className="text-xs font-medium tracking-wider uppercase" style={{ color: "#e0d8cc" }}>
              Layer
            </span>
          </div>
          {panelOpen ? (
            <ChevronDown size={14} style={{ color: "#6b5e52" }} />
          ) : (
            <ChevronUp size={14} style={{ color: "#6b5e52" }} />
          )}
        </button>

        {panelOpen && (
          <div className="p-2 flex flex-col gap-0.5">
            {(Object.keys(LAYER_CONFIG) as LayerKey[]).map((key) => {
              const config = LAYER_CONFIG[key];
              const active = layers[key];
              const subs = SUB_CATEGORIES[key];
              const isExpanded = expanded[key];

              return (
                <div key={key}>
                  {/* Main layer row */}
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all"
                    style={{
                      background: active ? "rgba(255,255,255,0.04)" : "transparent",
                      opacity: active ? 1 : 0.45,
                    }}
                  >
                    {/* Expand button (only if has sub-categories and layer is active) */}
                    <button
                      className="flex-shrink-0 transition-transform"
                      style={{
                        color: subs && active ? "#6b5e52" : "transparent",
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                        width: 14,
                        height: 14,
                      }}
                      onClick={() => subs && active && toggleExpand(key)}
                      tabIndex={subs && active ? 0 : -1}
                      data-testid={`button-expand-${key}`}
                    >
                      {subs && <ChevronRight size={12} />}
                    </button>

                    {/* Color dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        background: config.color,
                        boxShadow: active ? `0 0 6px ${config.color}80` : "none",
                      }}
                    />

                    {/* Label */}
                    <button
                      className="flex-1 min-w-0 text-left"
                      onClick={() => onToggle(key)}
                      data-testid={`button-layer-${key}`}
                    >
                      <div className="text-xs font-medium truncate" style={{ color: "#e0d8cc" }}>
                        {config.label}
                      </div>
                    </button>

                    {/* Toggle switch */}
                    <button
                      onClick={() => onToggle(key)}
                      className="w-7 h-4 rounded-full relative transition-colors flex-shrink-0"
                      style={{ background: active ? config.color : "rgba(255,255,255,0.1)" }}
                      data-testid={`switch-layer-${key}`}
                    >
                      <div
                        className="absolute top-0.5 w-3 h-3 rounded-full transition-transform"
                        style={{
                          background: "white",
                          transform: active ? "translateX(15px)" : "translateX(2px)",
                        }}
                      />
                    </button>
                  </div>

                  {/* Sub-categories */}
                  {subs && active && isExpanded && (
                    <div
                      className="ml-7 mr-1 mb-1 mt-0.5 rounded-lg overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      {subs.map((sub) => {
                        const subKey = `${key}:${sub.key}`;
                        const subActive = subLayers[subKey] !== false;
                        return (
                          <button
                            key={sub.key}
                            onClick={() => onSubToggle(subKey)}
                            className="w-full flex items-center gap-2 px-2.5 py-1 transition-colors text-left"
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.03)",
                              opacity: subActive ? 1 : 0.4,
                            }}
                            data-testid={`button-sub-${subKey}`}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all"
                              style={{
                                background: subActive ? config.color : "#4a4040",
                              }}
                            />
                            <span className="text-[11px] flex-1 truncate" style={{ color: "#b0a898" }}>
                              {sub.label}
                            </span>
                            <div
                              className="w-5 h-3 rounded-full relative flex-shrink-0"
                              style={{ background: subActive ? `${config.color}80` : "rgba(255,255,255,0.08)" }}
                            >
                              <div
                                className="absolute top-0.5 w-2 h-2 rounded-full transition-transform"
                                style={{
                                  background: subActive ? config.color : "#6b5e52",
                                  transform: subActive ? "translateX(11px)" : "translateX(1px)",
                                }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

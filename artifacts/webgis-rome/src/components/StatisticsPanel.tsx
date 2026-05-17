import { X, BarChart2, TrendingUp } from "lucide-react";
import { LAYER_CONFIG, type LayerKey } from "./LayerControl";

export interface CategoryStat {
  key: LayerKey;
  count: number;
  percentage: number;
  topSubs: Array<{ label: string; count: number; pct: number }>;
}

interface StatisticsPanelProps {
  stats: CategoryStat[];
  total: number;
  onClose: () => void;
}

const POPULARITY_WEIGHTS: Record<string, number> = {
  // tourism
  attraction: 1.0, museum: 0.95, viewpoint: 0.9, hotel: 0.75, hostel: 0.6,
  gallery: 0.7, artwork: 0.65, information: 0.5,
  // amenity
  restaurant: 0.9, cafe: 0.85, fast_food: 0.7, bar: 0.75, pharmacy: 0.5,
  bank: 0.45, atm: 0.4, hospital: 0.35, place_of_worship: 0.8,
  // railway/transport
  station: 1.0, stop_position: 0.6, tram_stop: 0.55,
};

function getPopularityScore(subLabel: string): number {
  const key = subLabel.toLowerCase().replace(/\s+/g, "_");
  return POPULARITY_WEIGHTS[key] ?? 0.5;
}

function getPopularityLabel(pct: number): { label: string; color: string } {
  if (pct >= 80) return { label: "Sangat Ramai", color: "#c0623a" };
  if (pct >= 60) return { label: "Ramai", color: "#d4a843" };
  if (pct >= 40) return { label: "Sedang", color: "#7c9e6a" };
  if (pct >= 20) return { label: "Sepi", color: "#5b8fa8" };
  return { label: "Jarang", color: "#6b5e52" };
}

export default function StatisticsPanel({ stats, total, onClose }: StatisticsPanelProps) {
  return (
    <div
      className="absolute left-4 z-[1000] w-72 slide-in-right"
      style={{ bottom: "88px" }}
      data-testid="statistics-panel"
    >
      <div
        className="rounded-xl overflow-hidden flex flex-col"
        style={{
          maxHeight: "440px",
          background: "rgba(20, 16, 12, 0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(192,98,58,0.25)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div
          className="px-3 py-2.5 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <BarChart2 size={13} style={{ color: "#c0623a" }} />
            <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: "#e0d8cc" }}>
              Statistik Populeritas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(192,98,58,0.15)", color: "#c0623a" }}>
              {total} lokasi
            </span>
            <button onClick={onClose} style={{ color: "#6b5e52" }} data-testid="button-close-stats">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-4">
          {/* Overall popularity by category */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <TrendingUp size={11} style={{ color: "#d4a843" }} />
              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#6b5e52" }}>
                Distribusi Kategori
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {stats
                .filter((s) => s.count > 0)
                .sort((a, b) => b.count - a.count)
                .map((stat) => {
                  const cfg = LAYER_CONFIG[stat.key];
                  return (
                    <div key={stat.key} data-testid={`stat-category-${stat.key}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                          <span className="text-xs font-medium" style={{ color: "#c8bfb2" }}>{cfg.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px]" style={{ color: "#6b5e52" }}>{stat.count}</span>
                          <span className="text-xs font-bold" style={{ color: cfg.color }}>{stat.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      {/* Bar */}
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${stat.percentage}%`,
                            background: `linear-gradient(90deg, ${cfg.color}cc, ${cfg.color})`,
                            boxShadow: `0 0 6px ${cfg.color}66`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Top sub-categories with popularity */}
          {stats
            .filter((s) => s.count > 0 && s.topSubs.length > 0)
            .sort((a, b) => b.count - a.count)
            .map((stat) => {
              const cfg = LAYER_CONFIG[stat.key];
              return (
                <div key={`subs-${stat.key}`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                    <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: cfg.color }}>
                      {cfg.label} — Terpopuler
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {stat.topSubs.slice(0, 5).map((sub) => {
                      const popPct = Math.round(getPopularityScore(sub.label) * 100);
                      const { label: popLabel, color: popColor } = getPopularityLabel(popPct);
                      return (
                        <div
                          key={sub.label}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.03)" }}
                          data-testid={`stat-sub-${sub.label}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="text-xs truncate" style={{ color: "#c8bfb2" }}>{sub.label}</span>
                              <span className="text-[10px] flex-shrink-0" style={{ color: "#6b5e52" }}>{sub.count}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${sub.pct}%`,
                                    background: cfg.color + "99",
                                  }}
                                />
                              </div>
                              <span
                                className="text-[9px] flex-shrink-0 px-1 rounded"
                                style={{ background: popColor + "18", color: popColor }}
                              >
                                {popLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          {/* Bottom legend */}
          <div className="pt-1 pb-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[9px] leading-relaxed" style={{ color: "#4a3e36" }}>
              Popularitas diestimasi dari tipe lokasi berdasarkan data OSM. Distribusi dihitung dari lokasi yang aktif pada filter saat ini.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

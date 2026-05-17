import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Navigation, X, Search, ArrowRight, RotateCcw, Clock, Ruler, ChevronDown, Footprints, Car, Bike, AlertCircle } from "lucide-react";
import { LAYER_CONFIG, type LayerKey } from "./LayerControl";

export interface RoutingPoint {
  name: string;
  lat: number;
  lng: number;
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

export interface RouteResult {
  distance: number;   // metres
  duration: number;   // seconds
  steps: RouteStep[];
  geometry: [number, number][]; // [lat, lng] pairs
}

export type TravelMode = "driving" | "walking" | "cycling";

interface RoutingPanelProps {
  suggestions: { name: string; category: LayerKey; lat: number; lng: number }[];
  onRouteResult: (route: RouteResult | null, from: RoutingPoint | null, to: RoutingPoint | null) => void;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
}

const MODE_CONFIG: Record<TravelMode, { label: string; icon: React.ReactNode; osrm: string; color: string }> = {
  driving:  { label: "Mengemudi", icon: <Car size={13} />,        osrm: "driving",  color: "#c0623a" },
  walking:  { label: "Jalan Kaki", icon: <Footprints size={13} />, osrm: "walking",  color: "#5b8fa8" },
  cycling:  { label: "Bersepeda",  icon: <Bike size={13} />,       osrm: "cycling",  color: "#7c9e6a" },
};

const OSRM_BASE = "https://router.project-osrm.org/route/v1";

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

function formatDuration(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} jam ${m} mnt`;
  if (m > 0) return `${m} mnt`;
  return `${Math.round(s)} dtk`;
}

function cleanInstruction(raw: string): string {
  // OSRM sometimes gives "Head north on ...", translate key phrases
  return raw
    .replace(/^Head /i, "Menuju ")
    .replace(/^Turn left/i, "Belok kiri")
    .replace(/^Turn right/i, "Belok kanan")
    .replace(/^Keep left/i, "Tetap kiri")
    .replace(/^Keep right/i, "Tetap kanan")
    .replace(/^Continue/i, "Lanjutkan")
    .replace(/^Merge/i, "Gabung")
    .replace(/^Take/i, "Ambil")
    .replace(/^Arrive/i, "Tiba");
}

interface PlaceSearchInputProps {
  label: string;
  placeholder: string;
  value: RoutingPoint | null;
  suggestions: { name: string; category: LayerKey; lat: number; lng: number }[];
  onSelect: (p: RoutingPoint) => void;
  onClear: () => void;
  pinColor: string;
  testId: string;
}

function PlaceSearchInput({ label, placeholder, value, suggestions, onSelect, onClear, pinColor, testId }: PlaceSearchInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    const starts: typeof suggestions = [];
    const contains: typeof suggestions = [];
    for (const s of suggestions) {
      const n = s.name.toLowerCase();
      if (n.startsWith(q)) starts.push(s);
      else if (n.includes(q)) contains.push(s);
      if (starts.length + contains.length >= 8) break;
    }
    return [...starts.slice(0, 6), ...contains.slice(0, Math.max(0, 6 - starts.length))];
  }, [query, suggestions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (filtered.length > 0 && query) setOpen(true);
    else setOpen(false);
  }, [filtered, query]);

  // sync display when value cleared externally
  useEffect(() => {
    if (!value) setQuery("");
  }, [value]);

  const handleSelect = (item: typeof suggestions[0]) => {
    setQuery(item.name);
    setOpen(false);
    onSelect({ name: item.name, lat: item.lat, lng: item.lng });
  };

  const handleClear = () => {
    setQuery("");
    setOpen(false);
    onClear();
  };

  return (
    <div ref={containerRef} className="relative" data-testid={testId}>
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: pinColor }}>
        {label}
      </div>
      <div
        className="flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: open ? `1px solid ${pinColor}88` : "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: pinColor }} />
        <input
          type="text"
          placeholder={value ? value.name : placeholder}
          value={value ? (query || value.name) : query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value && e.target.value !== value.name) onClear();
          }}
          onFocus={() => { if (filtered.length > 0) setOpen(true); }}
          className="flex-1 bg-transparent outline-none text-xs min-w-0"
          style={{ color: "#e0d8cc" }}
          autoComplete="off"
        />
        {(value || query) && (
          <button onClick={handleClear} className="flex-shrink-0" style={{ color: "#6b5e52" }}>
            <X size={11} />
          </button>
        )}
        {!value && !query && <Search size={11} style={{ color: "#4a3e36", flexShrink: 0 }} />}
      </div>

      {open && filtered.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-0.5 z-50 rounded-lg overflow-hidden"
          style={{
            background: "rgba(18,14,10,0.98)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${pinColor}55`,
            boxShadow: "0 12px 32px rgba(0,0,0,0.8)",
          }}
        >
          {filtered.map((item, i) => {
            const cfg = LAYER_CONFIG[item.category];
            return (
              <button
                key={`${item.lat}-${item.lng}`}
                className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/5"
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate" style={{ color: "#c8bfb2" }}>{item.name}</div>
                  <div className="text-[10px]" style={{ color: "#4a3e36" }}>{cfg.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RoutingPanel({ suggestions, onRouteResult, onClose, userLocation }: RoutingPanelProps) {
  const [from, setFrom] = useState<RoutingPoint | null>(null);
  const [to, setTo] = useState<RoutingPoint | null>(null);
  const [mode, setMode] = useState<TravelMode>("driving");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const canRoute = from && to;

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setRoute(null);
    onRouteResult(null, null, null);
  };

  const handleUseMyLocation = () => {
    if (!userLocation) return;
    setFrom({ name: "Lokasi Saya", lat: userLocation.lat, lng: userLocation.lng });
  };

  const handleRoute = useCallback(async () => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    setRoute(null);
    onRouteResult(null, from, to);

    try {
      const url = `${OSRM_BASE}/${MODE_CONFIG[mode].osrm}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true&annotations=false`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.code !== "Ok" || !data.routes?.length) {
        throw new Error("Rute tidak ditemukan. Coba mode transportasi lain.");
      }

      const r = data.routes[0];
      const coords: [number, number][] = (r.geometry.coordinates as [number, number][]).map(
        ([lng, lat]) => [lat, lng]
      );

      // Flatten all steps from all legs
      const steps: RouteStep[] = [];
      for (const leg of r.legs) {
        for (const step of leg.steps) {
          if (step.maneuver?.instruction || step.name) {
            steps.push({
              instruction: cleanInstruction(
                step.maneuver?.instruction || `Lanjutkan di ${step.name || "jalan ini"}`
              ),
              distance: step.distance,
              duration: step.duration,
            });
          }
        }
      }

      const result: RouteResult = {
        distance: r.distance,
        duration: r.duration,
        steps,
        geometry: coords,
      };

      setRoute(result);
      onRouteResult(result, from, to);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal mendapatkan rute";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [from, to, mode, onRouteResult]);

  // Auto-route when both points set
  useEffect(() => {
    if (from && to) handleRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, mode]);

  const handleClear = () => {
    setFrom(null);
    setTo(null);
    setRoute(null);
    setError(null);
    onRouteResult(null, null, null);
  };

  const modeColor = MODE_CONFIG[mode].color;

  return (
    <div
      className="absolute left-4 z-[1000]"
      style={{
        top: "72px",
        width: "300px",
        background: "rgba(14,11,8,0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
        animation: "fade-in-up 0.25s ease",
      }}
      data-testid="routing-panel"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <Navigation size={14} style={{ color: modeColor }} />
          <span className="text-sm font-semibold" style={{ color: "#e8ddd0" }}>
            Navigasi Rute
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/8"
          style={{ color: "#6b5e52" }}
          data-testid="button-routing-close"
        >
          <X size={13} />
        </button>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3">
        {/* Travel mode selector */}
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
          {(Object.entries(MODE_CONFIG) as [TravelMode, typeof MODE_CONFIG[TravelMode]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-medium transition-all"
              style={{
                background: mode === key ? `${cfg.color}22` : "transparent",
                color: mode === key ? cfg.color : "#4a3e36",
                border: mode === key ? `1px solid ${cfg.color}44` : "1px solid transparent",
              }}
              data-testid={`button-mode-${key}`}
            >
              {cfg.icon}
              <span className="hidden sm:inline">{cfg.label}</span>
            </button>
          ))}
        </div>

        {/* From / To inputs */}
        <div className="flex flex-col gap-2 relative">
          <PlaceSearchInput
            label="Dari"
            placeholder="Cari titik awal..."
            value={from}
            suggestions={suggestions}
            onSelect={setFrom}
            onClear={() => { setFrom(null); setRoute(null); onRouteResult(null, null, null); }}
            pinColor="#5b8fa8"
            testId="routing-from"
          />

          {/* Swap + use my location */}
          <div className="flex items-center justify-between px-0.5">
            <button
              onClick={handleUseMyLocation}
              disabled={!userLocation}
              className="text-[10px] px-2 py-0.5 rounded transition-colors"
              style={{
                color: userLocation ? "#5b8fa8" : "#3a3028",
                background: "transparent",
                border: "1px solid rgba(91,143,168,0.2)",
              }}
            >
              📍 Gunakan lokasi saya
            </button>
            <button
              onClick={handleSwap}
              disabled={!from && !to}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#8a7060",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              title="Tukar asal & tujuan"
              data-testid="button-swap"
            >
              <RotateCcw size={11} />
            </button>
          </div>

          <PlaceSearchInput
            label="Ke"
            placeholder="Cari tujuan..."
            value={to}
            suggestions={suggestions}
            onSelect={setTo}
            onClear={() => { setTo(null); setRoute(null); onRouteResult(null, null, null); }}
            pinColor="#c0623a"
            testId="routing-to"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleRoute}
            disabled={!canRoute || loading}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: canRoute && !loading
                ? `linear-gradient(135deg, ${modeColor}cc, ${modeColor}88)`
                : "rgba(255,255,255,0.04)",
              color: canRoute && !loading ? "#fff5e0" : "#3a3028",
              border: `1px solid ${canRoute && !loading ? `${modeColor}66` : "rgba(255,255,255,0.06)"}`,
              boxShadow: canRoute && !loading ? `0 4px 16px ${modeColor}33` : "none",
            }}
            data-testid="button-get-route"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${modeColor}88`, borderTopColor: "transparent" }} />
                Mencari rute...
              </>
            ) : (
              <>
                <Navigation size={13} />
                Cari Rute
              </>
            )}
          </button>
          {(from || to || route) && (
            <button
              onClick={handleClear}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: "rgba(255,255,255,0.04)", color: "#6b5e52", border: "1px solid rgba(255,255,255,0.06)" }}
              title="Hapus rute"
              data-testid="button-clear-route"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ background: "rgba(192,98,58,0.1)", border: "1px solid rgba(192,98,58,0.25)", color: "#c0623a" }}
          >
            <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Route result summary */}
        {route && !loading && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: `1px solid ${modeColor}33`, background: `${modeColor}0a` }}
          >
            {/* Summary */}
            <div className="px-3 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Ruler size={11} style={{ color: modeColor }} />
                  <span className="text-xs font-semibold" style={{ color: "#e0d8cc" }}>
                    {formatDistance(route.distance)}
                  </span>
                </div>
                <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.08)" }} />
                <div className="flex items-center gap-1.5">
                  <Clock size={11} style={{ color: modeColor }} />
                  <span className="text-xs font-semibold" style={{ color: "#e0d8cc" }}>
                    {formatDuration(route.duration)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5" style={{ color: modeColor }}>
                {MODE_CONFIG[mode].icon}
                <span className="text-[10px]">{MODE_CONFIG[mode].label}</span>
              </div>
            </div>

            {/* From → To labels */}
            <div className="px-3 pb-2 flex items-center gap-1.5 text-[10px]" style={{ color: "#6b5e52" }}>
              <span className="truncate max-w-[100px]" style={{ color: "#5b8fa8" }}>{from?.name}</span>
              <ArrowRight size={9} />
              <span className="truncate max-w-[100px]" style={{ color: "#c0623a" }}>{to?.name}</span>
            </div>

            {/* Step-by-step toggle */}
            {route.steps.length > 0 && (
              <>
                <button
                  onClick={() => setShowSteps((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-medium transition-colors hover:bg-white/4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "#8a7060" }}
                  data-testid="button-toggle-steps"
                >
                  <span>Panduan Langkah ({route.steps.length})</span>
                  <ChevronDown
                    size={11}
                    style={{ transform: showSteps ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                  />
                </button>

                {showSteps && (
                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: "220px", borderTop: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    {route.steps.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 px-3 py-2"
                        style={{ borderBottom: i < route.steps.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}
                      >
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5"
                          style={{ background: `${modeColor}22`, color: modeColor, border: `1px solid ${modeColor}44` }}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] leading-snug" style={{ color: "#c8bfb2" }}>
                            {step.instruction}
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: "#4a3e36" }}>
                            {formatDistance(step.distance)} · {formatDuration(step.duration)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import {
  Cloud, Sun, CloudRain, CloudSnow, CloudLightning,
  Wind, Droplets, Thermometer, Eye, RefreshCw,
} from "lucide-react";

// Open-Meteo API — gratis, tanpa API key
// Roma coordinates: 41.9028°N, 12.4964°E
const API_URL =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=41.9028&longitude=12.4964" +
  "&current=temperature_2m,relative_humidity_2m,apparent_temperature," +
  "precipitation,weather_code,wind_speed_10m,wind_direction_10m,visibility" +
  "&timezone=Europe%2FRome&wind_speed_unit=kmh";

interface WeatherData {
  temp: number;         // °C
  feelsLike: number;
  humidity: number;     // %
  windSpeed: number;    // km/h
  windDir: number;      // degrees
  precipitation: number; // mm
  weatherCode: number;
  visibility: number;   // metres
  time: string;
}

// WMO weather interpretation codes → label & emoji
function decodeWeather(code: number): { label: string; emoji: string; color: string } {
  if (code === 0)              return { label: "Cerah",           emoji: "☀️",  color: "#d4a843" };
  if (code <= 2)               return { label: "Sebagian Berawan", emoji: "🌤️", color: "#a89060" };
  if (code === 3)              return { label: "Mendung",          emoji: "☁️",  color: "#7a8a9a" };
  if (code <= 48)              return { label: "Berkabut",         emoji: "🌫️", color: "#7a8a9a" };
  if (code <= 55)              return { label: "Gerimis",          emoji: "🌦️", color: "#5b8fa8" };
  if (code <= 65)              return { label: "Hujan",            emoji: "🌧️", color: "#4a7090" };
  if (code <= 77)              return { label: "Salju",            emoji: "❄️",  color: "#a8c8e0" };
  if (code <= 82)              return { label: "Hujan Lebat",      emoji: "⛈️", color: "#3a6080" };
  if (code <= 86)              return { label: "Salju Lebat",      emoji: "🌨️", color: "#8ab8d0" };
  if (code === 95)             return { label: "Badai Petir",      emoji: "⚡",  color: "#c0623a" };
  if (code <= 99)              return { label: "Petir + Hujan",    emoji: "🌩️", color: "#c0623a" };
  return                              { label: "Tidak Diketahui",  emoji: "🌡️", color: "#6b5e52" };
}

function windDirLabel(deg: number): string {
  const dirs = ["U", "TL", "T", "TG", "S", "BD", "B", "BL"];
  return dirs[Math.round(deg / 45) % 8];
}

function visibilityLabel(m: number): string {
  if (m >= 10000) return "> 10 km";
  if (m >= 1000)  return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

interface WeatherWidgetProps {
  locationOpen?: boolean;
}

export default function WeatherWidget({ locationOpen = false }: WeatherWidgetProps) {
  const [weather, setWeather]   = useState<WeatherData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // LocationPanel = w-72 (288px) + right-4 (16px) = 304px from right + 8px gap
  const rightOffset = locationOpen ? 312 : 16;

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(API_URL, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const c = data.current;
      setWeather({
        temp:          Math.round(c.temperature_2m),
        feelsLike:     Math.round(c.apparent_temperature),
        humidity:      c.relative_humidity_2m,
        windSpeed:     Math.round(c.wind_speed_10m),
        windDir:       c.wind_direction_10m,
        precipitation: c.precipitation,
        weatherCode:   c.weather_code,
        visibility:    c.visibility ?? 10000,
      });
      setLastUpdate(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 10 minutes
  useEffect(() => {
    fetchWeather();
    const id = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchWeather]);

  const decoded = weather ? decodeWeather(weather.weatherCode) : null;

  return (
    <div
      className="absolute top-16 z-[1000]"
      style={{
        width: "200px",
        right: `${rightOffset}px`,
        transition: "right 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      data-testid="weather-widget"
    >
      <div
        className="rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: "rgba(14,11,8,0.93)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: decoded
            ? `1px solid ${decoded.color}44`
            : "1px solid rgba(255,255,255,0.07)",
          boxShadow: decoded
            ? `0 8px 28px rgba(0,0,0,0.55), 0 0 12px ${decoded.color}18`
            : "0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        {/* ── Header bar ── */}
        <button
          className="w-full flex items-center justify-between px-3 py-2 transition-colors"
          onClick={() => setExpanded((v) => !v)}
          data-testid="button-weather-toggle"
        >
          <div className="flex items-center gap-2">
            {/* Location pin */}
            <div
              className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: "rgba(192,98,58,0.15)", color: "#c0623a", border: "1px solid rgba(192,98,58,0.25)" }}
            >
              📍 Roma
            </div>
          </div>

          {loading ? (
            <RefreshCw size={11} className="animate-spin" style={{ color: "#4a3e36" }} />
          ) : error ? (
            <span className="text-[10px]" style={{ color: "#c0623a" }}>Gagal</span>
          ) : null}
        </button>

        {/* ── Main weather display ── */}
        {!loading && !error && weather && decoded && (
          <>
            {/* Compact view — always visible */}
            <div
              className="flex items-center justify-between px-3 pb-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              {/* Big emoji + temp */}
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none select-none">{decoded.emoji}</span>
                <div>
                  <div className="text-xl font-bold leading-none" style={{ color: "#e8ddd0" }}>
                    {weather.temp}°
                  </div>
                  <div className="text-[10px]" style={{ color: decoded.color }}>
                    {decoded.label}
                  </div>
                </div>
              </div>

              {/* Wind + Humidity quick stats */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <Wind size={9} style={{ color: "#5b8fa8" }} />
                  <span className="text-[10px]" style={{ color: "#8a7060" }}>
                    {weather.windSpeed} km/h {windDirLabel(weather.windDir)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets size={9} style={{ color: "#5b8fa8" }} />
                  <span className="text-[10px]" style={{ color: "#8a7060" }}>
                    {weather.humidity}%
                  </span>
                </div>
              </div>
            </div>

            {/* ── Expanded detail ── */}
            {expanded && (
              <div
                className="px-3 pb-3 flex flex-col gap-1.5"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="pt-2 grid grid-cols-2 gap-1.5">
                  {/* Feels like */}
                  <div
                    className="flex flex-col gap-0.5 px-2 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center gap-1">
                      <Thermometer size={9} style={{ color: "#c0623a" }} />
                      <span className="text-[9px] uppercase tracking-wide" style={{ color: "#4a3e36" }}>Terasa</span>
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: "#c8bfb2" }}>
                      {weather.feelsLike}°C
                    </span>
                  </div>

                  {/* Humidity */}
                  <div
                    className="flex flex-col gap-0.5 px-2 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center gap-1">
                      <Droplets size={9} style={{ color: "#5b8fa8" }} />
                      <span className="text-[9px] uppercase tracking-wide" style={{ color: "#4a3e36" }}>Kelembapan</span>
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: "#c8bfb2" }}>
                      {weather.humidity}%
                    </span>
                  </div>

                  {/* Wind */}
                  <div
                    className="flex flex-col gap-0.5 px-2 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center gap-1">
                      <Wind size={9} style={{ color: "#7c9e6a" }} />
                      <span className="text-[9px] uppercase tracking-wide" style={{ color: "#4a3e36" }}>Angin</span>
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: "#c8bfb2" }}>
                      {weather.windSpeed} <span className="text-[9px]">km/h {windDirLabel(weather.windDir)}</span>
                    </span>
                  </div>

                  {/* Visibility */}
                  <div
                    className="flex flex-col gap-0.5 px-2 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center gap-1">
                      <Eye size={9} style={{ color: "#a07ed6" }} />
                      <span className="text-[9px] uppercase tracking-wide" style={{ color: "#4a3e36" }}>Jarak Pandang</span>
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: "#c8bfb2" }}>
                      {visibilityLabel(weather.visibility)}
                    </span>
                  </div>
                </div>

                {/* Precipitation */}
                {weather.precipitation > 0 && (
                  <div
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                    style={{ background: "rgba(91,143,168,0.1)", border: "1px solid rgba(91,143,168,0.2)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <CloudRain size={10} style={{ color: "#5b8fa8" }} />
                      <span className="text-[10px]" style={{ color: "#8ab8d0" }}>Curah Hujan</span>
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color: "#5b8fa8" }}>
                      {weather.precipitation} mm
                    </span>
                  </div>
                )}

                {/* Refresh + timestamp */}
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[9px]" style={{ color: "#3a3028" }}>
                    {lastUpdate ? `Update: ${lastUpdate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : ""}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); fetchWeather(); }}
                    className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded transition-colors"
                    style={{ color: "#4a3e36", background: "rgba(255,255,255,0.04)" }}
                    data-testid="button-weather-refresh"
                  >
                    <RefreshCw size={8} />
                    Refresh
                  </button>
                </div>

                <div className="text-center text-[8px]" style={{ color: "#2a2018" }}>
                  Sumber: Open-Meteo · WMO Code {weather.weatherCode}
                </div>
              </div>
            )}
          </>
        )}

        {/* Loading state */}
        {loading && (
          <div className="px-3 pb-3 flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border-2 animate-spin flex-shrink-0"
              style={{ borderColor: "rgba(192,98,58,0.2)", borderTopColor: "#c0623a" }}
            />
            <span className="text-[11px]" style={{ color: "#4a3e36" }}>Memuat cuaca Roma...</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="px-3 pb-3 flex items-center gap-2">
            <Cloud size={14} style={{ color: "#4a3e36" }} />
            <div>
              <div className="text-[10px]" style={{ color: "#6b5e52" }}>Gagal memuat cuaca</div>
              <button
                onClick={(e) => { e.stopPropagation(); fetchWeather(); }}
                className="text-[10px] underline"
                style={{ color: "#c0623a" }}
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

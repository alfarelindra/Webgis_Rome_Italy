import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "leaflet.heat";
import LoadingScreen from "@/components/LoadingScreen";
import SearchBar from "@/components/SearchBar";
import LayerControl, { LAYER_CONFIG, SUB_CATEGORIES, type LayerKey } from "@/components/LayerControl";
import LocationPanel from "@/components/LocationPanel";
import BookmarkPanel, { type BookmarkItem } from "@/components/BookmarkPanel";
import StatisticsPanel, { type CategoryStat } from "@/components/StatisticsPanel";
import ChatPanel from "@/components/ChatPanel";
import romeGeoJsonRaw from "@assets/rome_filtered.geojson?raw";
import {
  MapPin, ZoomIn, ZoomOut, Locate, Download,
  Maximize2, Minimize2, Home, Share2, Star, Sun, Moon, Satellite,
  Flame, BarChart2,
} from "lucide-react";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --- Tile styles ---
const TILE_STYLES = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    subdomains: undefined,
  },
} as const;
type MapStyle = keyof typeof TILE_STYLES;

// --- GeoJSON types ---
interface GeoFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: Record<string, string | number | null>;
}

function getCategoryForFeature(props: Record<string, string | number | null>): LayerKey {
  if (props.tourism) return "tourism";
  if (props.railway || props.highway) return "railway";
  if (props.amenity) return "amenity";
  return "default";
}

function getSubKeyForFeature(category: LayerKey, props: Record<string, string | number | null>): string | null {
  const subs = SUB_CATEGORIES[category];
  if (!subs) return null;
  const value = props.amenity ?? props.tourism ?? props.highway ?? props.railway;
  if (!value) return null;
  const found = subs.find((s) => s.key === String(value));
  return found ? `${category}:${found.key}` : null;
}

function getSubLabel(category: LayerKey, subKey: string | null): string {
  if (!subKey) return LAYER_CONFIG[category].label;
  const sub = SUB_CATEGORIES[category]?.find((s) => s.key === subKey.split(":")[1]);
  return sub?.label ?? LAYER_CONFIG[category].label;
}

function buildDefaultSubLayers(): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  (Object.keys(SUB_CATEGORIES) as LayerKey[]).forEach((cat) => {
    SUB_CATEGORIES[cat]?.forEach((sub) => { result[`${cat}:${sub.key}`] = true; });
  });
  return result;
}

function createSvgMarker(color: string, size = 20): L.DivIcon {
  return L.divIcon({
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="${color}" fill-opacity="0.9" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.6)"/>
    </svg>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createClusterIcon(color: string) {
  return (cluster: L.MarkerCluster) => {
    const count = cluster.getChildCount();
    const size = count < 10 ? 34 : count < 50 ? 40 : 48;
    return L.divIcon({
      html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};opacity:0.92;border:2px solid rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center;font-size:${count < 10 ? 12 : 11}px;font-weight:700;color:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.5);">${count}</div>`,
      className: "",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };
}

function createGpsMarker(): L.DivIcon {
  return L.divIcon({
    html: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#c0623a" fill-opacity="0.3" stroke="#c0623a" stroke-width="1.5"/>
      <circle cx="10" cy="10" r="4" fill="#c0623a"/>
      <circle cx="10" cy="10" r="2" fill="white"/>
    </svg>`,
    className: "gps-pulse",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const ROME_CENTER: [number, number] = [41.8875, 12.4892];
const BOOKMARKS_KEY = "webgis_rome_bookmarks";

interface MarkerEntry {
  marker: L.Marker;
  feature: GeoFeature;
  category: LayerKey;
  subKey: string | null;
}

// Shared panel button style
const toolBtn = {
  background: "rgba(20,16,12,0.9)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
  color: "#c8bfb2",
} as const;

export default function MapPage() {
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const clustersRef = useRef<Map<LayerKey, L.MarkerClusterGroup>>(new Map());
  const markersRef = useRef<MarkerEntry[]>([]);
  const gpsMarkerRef = useRef<L.Marker | null>(null);
  const heatLayerRef = useRef<L.HeatLayer | null>(null);
  const heatPointsRef = useRef<[number, number, number][]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    tourism: true, railway: true, amenity: true, default: true,
  });
  const [subLayers, setSubLayers] = useState<Record<string, boolean>>(buildDefaultSubLayers);
  const [selectedFeature, setSelectedFeature] = useState<{ feature: GeoFeature; category: LayerKey } | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [gpsActive, setGpsActive] = useState(false);

  // New feature states
  const [mapStyle, setMapStyle] = useState<MapStyle>("dark");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) ?? "[]"); } catch { return []; }
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [statsData, setStatsData] = useState<CategoryStat[]>([]);
  const [heatRevision, setHeatRevision] = useState(0);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: ROME_CENTER, zoom: 14, zoomControl: false, attributionControl: true,
    });

    const style = TILE_STYLES.dark;
    const tile = L.tileLayer(style.url, { attribution: style.attr, subdomains: style.subdomains ?? "abc", maxZoom: 20 });
    tile.addTo(map);
    tileLayerRef.current = tile;

    // Cluster groups per category
    (Object.keys(LAYER_CONFIG) as LayerKey[]).forEach((key) => {
      const group = (L as unknown as { markerClusterGroup: (o: unknown) => L.MarkerClusterGroup }).markerClusterGroup({
        maxClusterRadius: 60,
        iconCreateFunction: createClusterIcon(LAYER_CONFIG[key].color),
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        animate: true,
        chunkedLoading: true,
      });
      group.addTo(map);
      clustersRef.current.set(key, group);
    });

    // Mouse coords
    map.on("mousemove", (e) => setCoords({ lat: e.latlng.lat, lng: e.latlng.lng }));
    map.on("mouseout", () => setCoords(null));

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; clustersRef.current.clear(); };
  }, []);

  // Load features
  useEffect(() => {
    if (!mapRef.current || clustersRef.current.size === 0) return;
    const { features } = JSON.parse(romeGeoJsonRaw) as { features: GeoFeature[] };
    const pts = features.filter((f) => f.geometry?.type === "Point");
    setTotalCount(pts.length);
    setVisibleCount(pts.length);

    pts.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const category = getCategoryForFeature(feature.properties);
      const subKey = getSubKeyForFeature(category, feature.properties);
      const config = LAYER_CONFIG[category];
      const subLabel = getSubLabel(category, subKey);
      const name = feature.properties.name || "Lokasi Tidak Bernama";

      const marker = L.marker([lat, lng], { icon: createSvgMarker(config.color) });
      marker.bindPopup(
        `<div style="min-width:170px;padding:4px 2px">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${config.color};margin-bottom:5px;">${subLabel}</div>
          <div style="font-size:13px;font-weight:600;color:#e8ddd0;line-height:1.3;">${name}</div>
          ${feature.properties.opening_hours ? `<div style="font-size:11px;color:#8a7060;margin-top:4px;">${feature.properties.opening_hours}</div>` : ""}
        </div>`,
        { closeButton: true, autoClose: true }
      );
      marker.on("click", () => setSelectedFeature({ feature, category }));
      clustersRef.current.get(category)?.addLayer(marker);
      markersRef.current.push({ marker, feature, category, subKey });
    });
  }, []);

  // Update visibility
  const updateVisibility = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    clustersRef.current.forEach((g) => g.clearLayers());
    let visible = 0;
    const heatPts: [number, number, number][] = [];
    const catSubCounts: Partial<Record<LayerKey, Record<string, number>>> = {};

    markersRef.current.forEach(({ marker, feature, category, subKey }) => {
      const name = String(feature.properties.name || "").toLowerCase();
      const ok = (!searchQuery || name.includes(searchQuery.toLowerCase()))
        && layers[category]
        && (subKey ? subLayers[subKey] !== false : true);
      if (ok) {
        clustersRef.current.get(category)?.addLayer(marker);
        visible++;
        // Heat intensity by category
        const intensity = category === "tourism" ? 0.9 : category === "amenity" ? 0.7 : category === "railway" ? 0.5 : 0.4;
        const [lng, lat] = feature.geometry.coordinates;
        heatPts.push([lat, lng, intensity]);
        // Sub-category counts for stats
        const sk = subKey?.split(":")[1] ?? "__other__";
        if (!catSubCounts[category]) catSubCounts[category] = {};
        catSubCounts[category]![sk] = (catSubCounts[category]![sk] ?? 0) + 1;
      }
    });

    clustersRef.current.forEach((g, key) => {
      if (layers[key]) { if (!map.hasLayer(g)) g.addTo(map); }
      else { if (map.hasLayer(g)) map.removeLayer(g); }
    });
    setVisibleCount(visible);

    // Compute stats
    const newStats: CategoryStat[] = (Object.keys(LAYER_CONFIG) as LayerKey[]).map((key) => {
      const subs = catSubCounts[key] ?? {};
      const count = Object.values(subs).reduce((a, b) => a + b, 0);
      const percentage = visible > 0 ? (count / visible) * 100 : 0;
      const topSubs = Object.entries(subs)
        .map(([sk, cnt]) => {
          const subDef = SUB_CATEGORIES[key]?.find((s) => s.key === sk);
          return { label: subDef?.label ?? sk, count: cnt, pct: count > 0 ? (cnt / count) * 100 : 0 };
        })
        .sort((a, b) => b.count - a.count);
      return { key, count, percentage, topSubs };
    });
    setStatsData(newStats);

    // Update heatmap data
    heatPointsRef.current = heatPts;
    setHeatRevision((r) => r + 1);
  }, [searchQuery, layers, subLayers]);

  useEffect(() => { updateVisibility(); }, [updateVisibility]);

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Heatmap management
  useEffect(() => {
    if (!mapRef.current) return;
    if (showHeatmap) {
      const pts = heatPointsRef.current;
      if (!heatLayerRef.current) {
        heatLayerRef.current = L.heatLayer(pts, {
          radius: 28,
          blur: 22,
          maxZoom: 17,
          max: 1.0,
          minOpacity: 0.35,
          gradient: { 0.2: "#3b4fa8", 0.4: "#5b8fa8", 0.6: "#7c9e6a", 0.75: "#d4a843", 0.9: "#c0623a", 1.0: "#fff5e0" },
        }).addTo(mapRef.current);
      } else {
        heatLayerRef.current.setLatLngs(pts);
      }
    } else {
      if (heatLayerRef.current && mapRef.current.hasLayer(heatLayerRef.current)) {
        mapRef.current.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    }
  }, [showHeatmap, heatRevision]);

  // --- Handlers ---
  const handleSearch = useCallback((q: string) => setSearchQuery(q), []);
  const handleLayerToggle = useCallback((k: LayerKey) => setLayers((p) => ({ ...p, [k]: !p[k] })), []);
  const handleSubToggle = useCallback((sk: string) => setSubLayers((p) => ({ ...p, [sk]: p[sk] === false })), []);

  const handleStyleChange = useCallback((style: MapStyle) => {
    if (!mapRef.current || !tileLayerRef.current) return;
    mapRef.current.removeLayer(tileLayerRef.current);
    const s = TILE_STYLES[style];
    const tile = L.tileLayer(s.url, { attribution: s.attr, subdomains: s.subdomains ?? "abc", maxZoom: 20 });
    tile.addTo(mapRef.current);
    tileLayerRef.current = tile;
    setMapStyle(style);
    // Light mode: adjust html background
    document.documentElement.classList.toggle("dark", style !== "light");
  }, []);

  const handleHome = useCallback(() => {
    mapRef.current?.flyTo(ROME_CENTER, 14, { animate: true, duration: 1.2 });
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  const handleShare = useCallback(() => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    const zoom = mapRef.current.getZoom();
    const url = `${window.location.origin}${window.location.pathname}?lat=${center.lat.toFixed(5)}&lng=${center.lng.toFixed(5)}&z=${zoom}&style=${mapStyle}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    });
  }, [mapStyle]);

  const handleGps = useCallback(() => {
    if (!mapRef.current || !navigator.geolocation) return;
    setGpsActive(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        gpsMarkerRef.current?.remove();
        const m = L.marker([latitude, longitude], { icon: createGpsMarker() });
        if (mapRef.current) { m.addTo(mapRef.current); mapRef.current.flyTo([latitude, longitude], 16, { animate: true }); }
        gpsMarkerRef.current = m;
        setGpsActive(false);
      },
      () => setGpsActive(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleExport = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    const visible = markersRef.current
      .filter(({ feature, category, subKey }) => {
        const [lng, lat] = feature.geometry.coordinates;
        if (!bounds.contains([lat, lng])) return false;
        const name = String(feature.properties.name || "").toLowerCase();
        return (!searchQuery || name.includes(searchQuery.toLowerCase()))
          && layers[category]
          && (subKey ? subLayers[subKey] !== false : true);
      })
      .map(({ feature }) => feature);
    if (!visible.length) return;
    const blob = new Blob([JSON.stringify({ type: "FeatureCollection", features: visible }, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `roma_${visible.length}_lokasi.geojson` });
    a.click();
    URL.revokeObjectURL(a.href);
  }, [searchQuery, layers, subLayers]);

  const handleBookmark = useCallback(() => {
    if (!selectedFeature) return;
    const { feature, category } = selectedFeature;
    const [lng, lat] = feature.geometry.coordinates;
    const id = `${lat}_${lng}`;
    const subKey = getSubKeyForFeature(category, feature.properties);
    setBookmarks((prev) => {
      if (prev.find((b) => b.id === id)) return prev.filter((b) => b.id !== id);
      return [...prev, {
        id, lat, lng, category,
        name: String(feature.properties.name || "Lokasi Tidak Bernama"),
        subLabel: getSubLabel(category, subKey),
      }];
    });
  }, [selectedFeature]);

  const isCurrentBookmarked = selectedFeature
    ? !!bookmarks.find((b) => {
        const [lng, lat] = selectedFeature.feature.geometry.coordinates;
        return b.id === `${lat}_${lng}`;
      })
    : false;

  const handleZoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => mapRef.current?.zoomOut(), []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" data-testid="map-container" />

      {!loading && (
        <>
          <SearchBar onSearch={handleSearch} resultCount={visibleCount} totalCount={totalCount} />

          {/* Map style switcher — top right */}
          <div
            className="absolute top-4 right-4 z-[1000] flex gap-1 p-1 rounded-xl"
            style={{ background: "rgba(20,16,12,0.88)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}
            data-testid="style-switcher"
          >
            {([
              { key: "dark" as MapStyle, icon: <Moon size={13} />, label: "Gelap" },
              { key: "light" as MapStyle, icon: <Sun size={13} />, label: "Terang" },
              { key: "satellite" as MapStyle, icon: <Satellite size={13} />, label: "Satelit" },
            ]).map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => handleStyleChange(key)}
                title={label}
                data-testid={`button-style-${key}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: mapStyle === key ? "rgba(192,98,58,0.25)" : "transparent",
                  color: mapStyle === key ? "#c0623a" : "#6b5e52",
                  border: mapStyle === key ? "1px solid rgba(192,98,58,0.35)" : "1px solid transparent",
                }}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <LayerControl layers={layers} onToggle={handleLayerToggle} subLayers={subLayers} onSubToggle={handleSubToggle} />

          {/* Floating left panels — only one shown at a time */}
          {showStats && (
            <StatisticsPanel
              stats={statsData}
              total={visibleCount}
              onClose={() => setShowStats(false)}
            />
          )}
          {showBookmarks && !showStats && (
            <BookmarkPanel
              bookmarks={bookmarks}
              onFlyTo={(lat, lng) => { mapRef.current?.flyTo([lat, lng], 17, { animate: true }); setShowBookmarks(false); }}
              onRemove={(id) => setBookmarks((p) => p.filter((b) => b.id !== id))}
              onClose={() => setShowBookmarks(false)}
            />
          )}

          {selectedFeature && (
            <LocationPanel
              feature={selectedFeature.feature}
              category={selectedFeature.category}
              onClose={() => setSelectedFeature(null)}
              isBookmarked={isCurrentBookmarked}
              onBookmark={handleBookmark}
            />
          )}

          <ChatPanel />

          {/* Right toolbar: Zoom + Fullscreen + Home + Share + Heatmap */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
            {([
              { fn: handleZoomIn, icon: <ZoomIn size={15} />, id: "button-zoom-in", title: "Zoom In" },
              { fn: handleZoomOut, icon: <ZoomOut size={15} />, id: "button-zoom-out", title: "Zoom Out" },
              { fn: handleHome, icon: <Home size={15} />, id: "button-home", title: "Kembali ke Roma" },
              { fn: handleFullscreen, icon: isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />, id: "button-fullscreen", title: "Layar Penuh" },
              { fn: handleShare, icon: <Share2 size={15} />, id: "button-share", title: "Bagikan tampilan ini" },
            ] as const).map(({ fn, icon, id, title }) => (
              <button key={id} onClick={fn} title={title} data-testid={id}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:border-[rgba(192,98,58,0.3)]"
                style={toolBtn}
              >
                {icon}
              </button>
            ))}
            {/* Heatmap toggle — highlighted when active */}
            <button
              onClick={() => setShowHeatmap((v) => !v)}
              title="Toggle Heatmap Kepadatan"
              data-testid="button-heatmap"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: showHeatmap ? "linear-gradient(135deg,#c0623a88,#d4a84388)" : "rgba(20,16,12,0.9)",
                backdropFilter: "blur(12px)",
                border: showHeatmap ? "1px solid rgba(192,98,58,0.55)" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: showHeatmap ? "0 4px 14px rgba(192,98,58,0.35)" : "0 4px 12px rgba(0,0,0,0.5)",
                color: showHeatmap ? "#fff5e0" : "#c8bfb2",
              }}
            >
              <Flame size={15} />
            </button>
          </div>

          {/* GPS */}
          <button onClick={handleGps} data-testid="button-gps"
            className="absolute bottom-6 left-4 z-[1000] w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: gpsActive ? "linear-gradient(135deg,#c0623a,#d4a843)" : "rgba(20,16,12,0.9)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${gpsActive ? "rgba(192,98,58,0.5)" : "rgba(255,255,255,0.08)"}`,
              boxShadow: gpsActive ? "0 4px 16px rgba(192,98,58,0.4)" : "0 4px 12px rgba(0,0,0,0.5)",
              color: gpsActive ? "white" : "#c8bfb2",
            }}>
            <Locate size={16} className={gpsActive ? "animate-spin" : ""} />
          </button>

          {/* Bottom bar: Stats + Export + Bookmarks */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2" data-testid="stats-bar">
            {/* Stats */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl"
              style={{ background: "rgba(20,16,12,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
              <MapPin size={12} style={{ color: "#c0623a" }} />
              <span className="text-xs" style={{ color: "#8a7060" }}>
                <span style={{ color: "#d4a843" }}>{visibleCount}</span> lokasi
              </span>
              {coords && (
                <>
                  <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.08)" }} />
                  <span className="text-[10px] font-mono" style={{ color: "#6b5e52" }}>
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </span>
                </>
              )}
              {!coords && (
                <>
                  <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.08)" }} />
                  <span className="text-xs font-medium tracking-wider uppercase" style={{ color: "#6b5e52" }}>Roma, Italia</span>
                </>
              )}
            </div>

            {/* Export */}
            <button onClick={handleExport} data-testid="button-export" title="Unduh lokasi di area ini"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all"
              style={{ background: "rgba(20,16,12,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(192,98,58,0.2)", boxShadow: "0 4px 16px rgba(0,0,0,0.5)", color: "#c8bfb2" }}>
              <Download size={13} style={{ color: "#c0623a" }} />
              <span className="text-xs font-medium">Export</span>
            </button>

            {/* Bookmarks */}
            <button onClick={() => { setShowBookmarks(!showBookmarks); setShowStats(false); }} data-testid="button-bookmarks"
              title="Favorit tersimpan"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all"
              style={{
                background: showBookmarks && !showStats ? "rgba(212,168,67,0.12)" : "rgba(20,16,12,0.85)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${showBookmarks && !showStats ? "rgba(212,168,67,0.35)" : "rgba(255,255,255,0.06)"}`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                color: showBookmarks && !showStats ? "#d4a843" : "#c8bfb2",
              }}>
              <Star size={13} fill={showBookmarks && !showStats ? "#d4a843" : "none"} style={{ color: showBookmarks && !showStats ? "#d4a843" : "#c8bfb2" }} />
              <span className="text-xs font-medium">{bookmarks.length > 0 ? bookmarks.length : "Favorit"}</span>
            </button>

            {/* Statistics */}
            <button onClick={() => { setShowStats((v) => !v); setShowBookmarks(false); }} data-testid="button-stats"
              title="Statistik popularitas lokasi"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all"
              style={{
                background: showStats ? "rgba(192,98,58,0.12)" : "rgba(20,16,12,0.85)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${showStats ? "rgba(192,98,58,0.35)" : "rgba(255,255,255,0.06)"}`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                color: showStats ? "#c0623a" : "#c8bfb2",
              }}>
              <BarChart2 size={13} style={{ color: showStats ? "#c0623a" : "#c8bfb2" }} />
              <span className="text-xs font-medium">Statistik</span>
            </button>
          </div>

          {/* Share toast */}
          {shareToast && (
            <div
              className="absolute top-16 left-1/2 -translate-x-1/2 z-[2000] px-4 py-2 rounded-xl text-sm font-medium"
              style={{
                background: "rgba(20,16,12,0.96)",
                border: "1px solid rgba(192,98,58,0.4)",
                color: "#e0d8cc",
                boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                animation: "fade-in-up 0.3s ease",
              }}
            >
              ✓ Link berhasil disalin ke clipboard
            </div>
          )}
        </>
      )}
    </div>
  );
}

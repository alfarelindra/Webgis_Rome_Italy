import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LoadingScreen from "@/components/LoadingScreen";
import SearchBar from "@/components/SearchBar";
import LayerControl, { LAYER_CONFIG, SUB_CATEGORIES, type LayerKey } from "@/components/LayerControl";
import LocationPanel from "@/components/LocationPanel";
import ChatPanel from "@/components/ChatPanel";
import romeGeoJsonRaw from "@assets/rome_filtered.geojson?raw";
import { MapPin, ZoomIn, ZoomOut, Locate } from "lucide-react";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

/** Returns the sub-category key, e.g. "amenity:restaurant" */
function getSubKeyForFeature(
  category: LayerKey,
  props: Record<string, string | number | null>
): string | null {
  const subs = SUB_CATEGORIES[category];
  if (!subs) return null;
  const value =
    props.amenity ?? props.tourism ?? props.shop ?? props.highway ?? props.railway;
  if (!value) return null;
  const found = subs.find((s) => s.key === String(value));
  if (found) return `${category}:${found.key}`;
  return null;
}

function buildDefaultSubLayers(): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  (Object.keys(SUB_CATEGORIES) as LayerKey[]).forEach((cat) => {
    SUB_CATEGORIES[cat]?.forEach((sub) => {
      result[`${cat}:${sub.key}`] = true;
    });
  });
  return result;
}

function createSvgMarker(color: string, size = 22): L.DivIcon {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" fill="${color}" fill-opacity="0.9" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.6)"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createGpsMarker(): L.DivIcon {
  const svg = `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8" fill="#c0623a" fill-opacity="0.3" stroke="#c0623a" stroke-width="1.5"/>
    <circle cx="10" cy="10" r="4" fill="#c0623a"/>
    <circle cx="10" cy="10" r="2" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "gps-pulse",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

type LayerState = Record<LayerKey, boolean>;

export default function MapPage() {
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<
    Map<string, { marker: L.Marker; feature: GeoFeature; category: LayerKey; subKey: string | null }>
  >(new Map());
  const gpsMarkerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [layers, setLayers] = useState<LayerState>({
    tourism: true,
    railway: true,
    amenity: true,
    default: true,
  });
  const [subLayers, setSubLayers] = useState<Record<string, boolean>>(buildDefaultSubLayers);

  const [selectedFeature, setSelectedFeature] = useState<{
    feature: GeoFeature;
    category: LayerKey;
  } | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [gpsActive, setGpsActive] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [41.887806, 12.48967],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Load GeoJSON features
  useEffect(() => {
    if (!mapRef.current) return;

    const romeGeoJson = JSON.parse(romeGeoJsonRaw) as { features: GeoFeature[] };
    const features = romeGeoJson.features.filter((f) => f.geometry?.type === "Point");
    setTotalCount(features.length);
    setVisibleCount(features.length);

    features.forEach((feature, idx) => {
      const [lng, lat] = feature.geometry.coordinates;
      const category = getCategoryForFeature(feature.properties);
      const subKey = getSubKeyForFeature(category, feature.properties);
      const config = LAYER_CONFIG[category];
      const marker = L.marker([lat, lng], {
        icon: createSvgMarker(config.color),
      });

      const name = feature.properties.name || "Lokasi Tidak Bernama";
      const subLabel =
        subKey
          ? SUB_CATEGORIES[category]?.find((s) => s.key === subKey.split(":")[1])?.label ?? config.label
          : config.label;

      const popupHtml = `
        <div style="min-width:180px;padding:4px 2px">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${config.color};margin-bottom:6px;">${subLabel}</div>
          <div style="font-size:14px;font-weight:600;color:#e8ddd0;line-height:1.3;">${name}</div>
          ${feature.properties.opening_hours ? `<div style="font-size:11px;color:#8a7060;margin-top:4px;">${feature.properties.opening_hours}</div>` : ""}
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        autoClose: true,
        className: "rome-popup",
      });

      marker.on("click", () => {
        setSelectedFeature({ feature, category });
      });

      if (mapRef.current) {
        marker.addTo(mapRef.current);
      }

      markersRef.current.set(`${idx}`, { marker, feature, category, subKey });
    });
  }, []);

  // Update markers based on search, layers, and sub-layers
  const updateMarkersVisibility = useCallback(() => {
    if (!mapRef.current) return;
    let visible = 0;
    markersRef.current.forEach(({ marker, feature, category, subKey }) => {
      const name = String(feature.properties.name || "").toLowerCase();
      const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase());
      const layerOn = layers[category];
      // Sub-layer check: if a subKey exists and the category has sub-categories, check subLayers state
      const subOn = subKey ? subLayers[subKey] !== false : true;

      if (matchesSearch && layerOn && subOn) {
        if (!mapRef.current!.hasLayer(marker)) marker.addTo(mapRef.current!);
        visible++;
      } else {
        if (mapRef.current!.hasLayer(marker)) mapRef.current!.removeLayer(marker);
      }
    });
    setVisibleCount(visible);
  }, [searchQuery, layers, subLayers]);

  useEffect(() => {
    updateMarkersVisibility();
  }, [updateMarkersVisibility]);

  const handleSearch = useCallback((q: string) => setSearchQuery(q), []);

  const handleLayerToggle = useCallback((key: LayerKey) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSubToggle = useCallback((subKey: string) => {
    setSubLayers((prev) => ({ ...prev, [subKey]: prev[subKey] === false ? true : false }));
  }, []);

  const handleGps = useCallback(() => {
    if (!mapRef.current || !navigator.geolocation) return;
    setGpsActive(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (gpsMarkerRef.current) gpsMarkerRef.current.remove();
        const marker = L.marker([latitude, longitude], { icon: createGpsMarker() });
        if (mapRef.current) {
          marker.addTo(mapRef.current);
          mapRef.current.setView([latitude, longitude], 16, { animate: true });
        }
        gpsMarkerRef.current = marker;
        setGpsActive(false);
      },
      () => setGpsActive(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleZoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => mapRef.current?.zoomOut(), []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}

      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" data-testid="map-container" />

      {!loading && (
        <>
          {/* Search bar */}
          <SearchBar onSearch={handleSearch} resultCount={visibleCount} totalCount={totalCount} />

          {/* Layer control with sub-filters */}
          <LayerControl
            layers={layers}
            onToggle={handleLayerToggle}
            subLayers={subLayers}
            onSubToggle={handleSubToggle}
          />

          {/* Location panel */}
          {selectedFeature && (
            <LocationPanel
              feature={selectedFeature.feature}
              category={selectedFeature.category}
              onClose={() => setSelectedFeature(null)}
            />
          )}

          {/* Chat panel */}
          <ChatPanel />

          {/* Custom zoom controls */}
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2"
            data-testid="zoom-controls"
          >
            {[
              { fn: handleZoomIn, icon: <ZoomIn size={16} />, testId: "button-zoom-in" },
              { fn: handleZoomOut, icon: <ZoomOut size={16} />, testId: "button-zoom-out" },
            ].map(({ fn, icon, testId }) => (
              <button
                key={testId}
                onClick={fn}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: "rgba(20, 16, 12, 0.9)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                  color: "#c8bfb2",
                }}
                data-testid={testId}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* GPS button */}
          <button
            onClick={handleGps}
            className="absolute bottom-6 left-4 z-[1000] w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: gpsActive
                ? "linear-gradient(135deg, #c0623a, #d4a843)"
                : "rgba(20, 16, 12, 0.9)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: `1px solid ${gpsActive ? "rgba(192,98,58,0.5)" : "rgba(255,255,255,0.08)"}`,
              boxShadow: gpsActive ? "0 4px 16px rgba(192,98,58,0.4)" : "0 4px 12px rgba(0,0,0,0.5)",
              color: gpsActive ? "white" : "#c8bfb2",
            }}
            data-testid="button-gps"
          >
            <Locate size={16} className={gpsActive ? "animate-spin" : ""} />
          </button>

          {/* Stats bar */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded-xl flex items-center gap-3"
            style={{
              background: "rgba(20, 16, 12, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            }}
            data-testid="stats-bar"
          >
            <MapPin size={12} style={{ color: "#c0623a" }} />
            <span className="text-xs" style={{ color: "#8a7060" }}>
              <span style={{ color: "#d4a843" }}>{visibleCount}</span> lokasi ditampilkan
            </span>
            <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.08)" }} />
            <span className="text-xs font-medium tracking-wider uppercase" style={{ color: "#6b5e52" }}>
              Roma, Italia
            </span>
          </div>
        </>
      )}
    </div>
  );
}

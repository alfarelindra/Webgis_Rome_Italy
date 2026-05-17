import { X, MapPin, Clock, Train, Landmark, HelpCircle, Star, Info, Lightbulb, BedDouble } from "lucide-react";
import { LAYER_CONFIG, type LayerKey } from "./LayerControl";
import { getPlaceDescription } from "@/lib/placeDescriptions";
import { findListingByOsmName } from "@/lib/hotelListings";
import { findAttractionByOsmName } from "@/lib/attractionListings";
import { getPlaceImage, PLACE_IMAGE_FALLBACK } from "@/lib/placeImages";
import HotelImage from "@/components/HotelImage";

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
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  addr_street?: string | null;
  "addr:street"?: string | null;
  "addr:housenumber"?: string | null;
  wheelchair?: string | null;
  fee?: string | null;
  [key: string]: string | number | null | undefined;
}

interface LocationPanelProps {
  feature: { properties: LocationProperties } | null;
  category: LayerKey | null;
  onClose: () => void;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onOpenHotelDetail?: (listingId: string) => void;
  onOpenAttractionDetail?: (listingId: string) => void;
}

function getCategoryIcon(category: LayerKey | null) {
  switch (category) {
    case "tourism": return <Landmark size={15} />;
    case "railway": return <Train size={15} />;
    case "amenity": return <MapPin size={15} />;
    default: return <HelpCircle size={15} />;
  }
}

// Keys to hide from the raw details section (handled specially or irrelevant)
const SKIP_KEYS = new Set([
  "osm_id", "osm_type", "rooms", "beds", "width", "building", "oneway",
  "tunnel", "bridge", "barrier", "parking", "aeroway", "smoothness", "layer",
  "public_transport", "name",
]);

// Human-readable key labels
const KEY_LABELS: Record<string, string> = {
  tourism:       "Kategori Wisata",
  railway:       "Jenis Transportasi",
  highway:       "Jenis Jalan",
  amenity:       "Jenis Fasilitas",
  opening_hours: "Jam Buka",
  operator:      "Operator",
  surface:       "Permukaan",
  capacity:      "Kapasitas",
  website:       "Website",
  phone:         "Telepon",
  email:         "Email",
  wheelchair:    "Akses Kursi Roda",
  fee:           "Biaya Masuk",
  "addr:street": "Jalan",
  "addr:housenumber": "Nomor",
};

// Friendly value translations
const VALUE_TRANSLATE: Record<string, string> = {
  yes: "Ya",
  no: "Tidak",
  limited: "Terbatas",
  designated: "Diizinkan",
  permissive: "Diperbolehkan",
  asphalt: "Aspal",
  cobblestone: "Batu Bulat",
  paving_stones: "Batu Paving",
  gravel: "Kerikil",
  dirt: "Tanah",
  grass: "Rumput",
};

const STAY_TYPES = new Set(["hotel", "hostel", "guest_house", "apartment", "motel", "chalet"]);
const ATTRACTION_TYPES = new Set(["museum", "attraction", "viewpoint", "gallery", "theme_park", "artwork", "information"]);

export default function LocationPanel({ feature, category, onClose, isBookmarked, onBookmark, onOpenHotelDetail, onOpenAttractionDetail }: LocationPanelProps) {
  if (!feature) return null;

  const props = feature.properties;
  const name = props.name || "Lokasi Tidak Bernama";
  const config = category ? LAYER_CONFIG[category] : LAYER_CONFIG.default;
  const hotelListing = findListingByOsmName(props.name);
  const attractionListing = findAttractionByOsmName(props.name);
  const isStay =
    (props.tourism && STAY_TYPES.has(String(props.tourism))) ||
    props.amenity === "hotel";
  const isAttraction =
    category === "tourism" &&
    props.tourism &&
    ATTRACTION_TYPES.has(String(props.tourism)) &&
    !STAY_TYPES.has(String(props.tourism));

  // Get auto-generated description & image
  const desc = getPlaceDescription(props as Record<string, string | number | null>);
  const placeImage = getPlaceImage(props as Record<string, string | number | null>, category, name);

  // Filter details — skip name and skipped keys, show only non-null values
  const details = Object.entries(props).filter(
    ([key, val]) =>
      !SKIP_KEYS.has(key) &&
      val !== null &&
      val !== undefined &&
      val !== "" &&
      key !== "name"
  );

  // Separate important fields from the rest
  const PRIORITY_KEYS = ["opening_hours", "operator", "website", "phone", "fee", "wheelchair", "addr:street", "addr:housenumber", "capacity"];
  const priorityDetails = details.filter(([k]) => PRIORITY_KEYS.includes(k));
  const otherDetails = details.filter(([k]) => !PRIORITY_KEYS.includes(k));

  return (
    <div
      className="absolute right-4 top-4 bottom-4 z-[1000] w-72 slide-in-right flex flex-col"
      data-testid="location-panel"
    >
      <div
        className="flex flex-col h-full rounded-xl overflow-hidden"
        style={{
          background: "rgba(14, 11, 8, 0.97)",
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
              <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.color }}>
                {getCategoryIcon(category)}
                {config.label}
              </div>
              <h2
                className="text-[15px] font-semibold leading-tight"
                style={{ color: "#e8ddd0" }}
                data-testid="text-location-name"
              >
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
                  <Star size={14} fill={isBookmarked ? "#d4a843" : "none"} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "#6b5e52", background: "rgba(255,255,255,0.04)" }}
                data-testid="button-close-panel"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {placeImage && (
            <div className="px-4 pt-3" data-testid="place-image-hero">
              <div
                className="relative rounded-xl overflow-hidden aspect-[16/10]"
                style={{ border: `1px solid ${config.color}33` }}
              >
                <HotelImage
                  src={placeImage.url}
                  alt={placeImage.alt}
                  fallback={PLACE_IMAGE_FALLBACK}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(to top, rgba(14,11,8,0.75) 0%, transparent 55%)",
                  }}
                />
                {(placeImage.source === "listing" || placeImage.source === "dataset") && (
                  <span
                    className="absolute bottom-2 left-2 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{ background: "rgba(0,0,0,0.55)", color: "#c8bfb2" }}
                  >
                    {placeImage.source === "listing" ? "Foto asli lokasi" : "Foto tempat"}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Description Card ── */}
          <div className="px-4 pt-3 pb-2">
            <div
              className="rounded-xl p-3 flex gap-3"
              style={{
                background: `${config.color}10`,
                border: `1px solid ${config.color}28`,
              }}
            >
              {/* Emoji */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: `${config.color}1a`, border: `1px solid ${config.color}33` }}
              >
                {desc.emoji}
              </div>
              {/* Summary */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Info size={10} style={{ color: config.color }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: config.color }}>
                    Tentang Tempat Ini
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: "#c8bfb2" }}>
                  {desc.summary}
                </p>
              </div>
            </div>
          </div>

          {isAttraction && attractionListing && onOpenAttractionDetail && (
            <div className="px-4 pb-2">
              <button
                type="button"
                onClick={() => onOpenAttractionDetail(attractionListing.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, rgba(76,175,125,0.22), rgba(46,125,82,0.12))",
                  border: "1px solid rgba(76,175,125,0.4)",
                  color: "#9fdfb8",
                }}
                data-testid="button-open-attraction-detail"
              >
                <Landmark size={14} />
                Lihat detail destinasi
                <span className="text-[10px] font-normal opacity-80">· {attractionListing.entryFee}</span>
              </button>
            </div>
          )}

          {/* ── Airbnb-style stay detail ── */}
          {isStay && hotelListing && onOpenHotelDetail && (
            <div className="px-4 pb-2">
              <button
                type="button"
                onClick={() => onOpenHotelDetail(hotelListing.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, rgba(76,175,125,0.2), rgba(192,98,58,0.15))",
                  border: "1px solid rgba(76,175,125,0.35)",
                  color: "#9fdfb8",
                }}
                data-testid="button-open-hotel-detail"
              >
                <BedDouble size={14} />
                Lihat detail penginapan
                <span className="text-[10px] font-normal opacity-80">· €{hotelListing.pricePerNight}/malam</span>
              </button>
            </div>
          )}

          {/* ── Tips Card (if available) ── */}
          {desc.tips && (
            <div className="px-4 pb-2">
              <div
                className="rounded-xl p-3 flex gap-2.5"
                style={{
                  background: "rgba(212,168,67,0.07)",
                  border: "1px solid rgba(212,168,67,0.2)",
                }}
              >
                <Lightbulb size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#d4a843" }} />
                <p className="text-[11px] leading-relaxed" style={{ color: "#b8a878" }}>
                  {desc.tips}
                </p>
              </div>
            </div>
          )}

          {/* ── Priority Details ── */}
          {priorityDetails.length > 0 && (
            <div className="px-4 pb-2">
              <div className="flex flex-col gap-1.5">
                {priorityDetails.map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-start gap-2 px-2.5 py-2 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                    data-testid={`text-prop-${key}`}
                  >
                    <span
                      className="text-[10px] uppercase tracking-wider font-medium flex-shrink-0 mt-0.5 w-20"
                      style={{ color: "#5a4e46" }}
                    >
                      {KEY_LABELS[key] || key}
                    </span>
                    <span className="text-[12px] flex-1" style={{ color: "#c8bfb2" }}>
                      {key === "opening_hours" ? (
                        <span className="flex items-center gap-1.5">
                          <Clock size={11} style={{ color: "#c0623a" }} />
                          {String(val)}
                        </span>
                      ) : key === "website" ? (
                        <a
                          href={String(val).startsWith("http") ? String(val) : `https://${val}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline truncate block"
                          style={{ color: "#5b9bd5" }}
                        >
                          {String(val)}
                        </a>
                      ) : (
                        VALUE_TRANSLATE[String(val)] ?? String(val)
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Other Details (collapsed style) ── */}
          {otherDetails.length > 0 && (
            <div className="px-4 pb-3">
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div
                  className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-semibold"
                  style={{ color: "#4a3e36", background: "rgba(255,255,255,0.02)" }}
                >
                  Data Tambahan
                </div>
                {otherDetails.map(([key, val], i) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 px-3 py-1.5"
                    style={{
                      borderTop: i > 0 ? "1px solid rgba(255,255,255,0.03)" : "none",
                    }}
                    data-testid={`text-prop-${key}`}
                  >
                    <span className="text-[10px] w-20 flex-shrink-0" style={{ color: "#4a3e36" }}>
                      {KEY_LABELS[key] || key}
                    </span>
                    <span className="text-[11px] flex-1 truncate" style={{ color: "#8a7060" }}>
                      {VALUE_TRANSLATE[String(val)] ?? String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No details at all */}
          {priorityDetails.length === 0 && otherDetails.length === 0 && (
            <div className="px-4 pb-4">
              <p className="text-[11px] italic" style={{ color: "#4a3e36" }}>
                Tidak ada data tambahan dari OpenStreetMap.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: config.color, boxShadow: `0 0 5px ${config.color}` }}
            />
            <span className="text-[10px]" style={{ color: "#4a3e36" }}>
              Data dari OpenStreetMap · Roma, Italia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

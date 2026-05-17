import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  X,
  ChevronLeft,
  Star,
  MapPin,
  Clock,
  Ticket,
  Footprints,
  ChevronRight,
  Share2,
  Compass,
  Sun,
  Accessibility,
  Globe,
} from "lucide-react";
import {
  ATTRACTION_LISTINGS,
  ATTRACTION_CATEGORY_LABELS,
  ATTRACTION_IMAGE_FALLBACK,
  type AttractionCategory,
  type AttractionListing,
} from "@/lib/attractionListings";
import HotelImage from "@/components/HotelImage";

interface AttractionsPanelProps {
  onClose: () => void;
  onSelectListing: (listing: AttractionListing) => void;
  initialListingId?: string | null;
}

type SortKey = "rating" | "name";

const panelShell: React.CSSProperties = {
  background: "rgba(14, 11, 8, 0.97)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(76, 175, 125, 0.25)",
  boxShadow: "0 12px 48px rgba(0,0,0,0.7)",
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#4caf7d" }}>
      {children}
    </h3>
  );
}

export default function AttractionsPanel({ onClose, onSelectListing, initialListingId }: AttractionsPanelProps) {
  const [selected, setSelected] = useState<AttractionListing | null>(
    () => ATTRACTION_LISTINGS.find((a) => a.id === initialListingId) ?? null,
  );
  const [catFilter, setCatFilter] = useState<AttractionCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("rating");
  const [imageIndex, setImageIndex] = useState(0);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  const listings = useMemo(() => {
    let list = [...ATTRACTION_LISTINGS];
    if (catFilter !== "all") list = list.filter((a) => a.category === catFilter);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [catFilter, sort]);

  const openDetail = (listing: AttractionListing) => {
    setSelected(listing);
    setImageIndex(0);
  };

  useEffect(() => {
    if (!selected || !thumbStripRef.current) return;
    const active = thumbStripRef.current.querySelector<HTMLElement>(`[data-thumb-index="${imageIndex}"]`);
    active?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [imageIndex, selected?.id]);

  if (selected) {
    const imageCount = selected.images.length;
    const safeIndex = imageCount > 0 ? ((imageIndex % imageCount) + imageCount) % imageCount : 0;
    const currentImage = selected.images[safeIndex];
    const goPrev = () => setImageIndex((i) => (i - 1 + imageCount) % imageCount);
    const goNext = () => setImageIndex((i) => (i + 1) % imageCount);

    return (
      <div
        className="absolute left-4 top-4 bottom-4 z-[1000] w-[min(100%,24rem)] sm:w-[26rem] flex flex-col"
        data-testid="attractions-detail-panel"
      >
        <div className="flex flex-col h-full rounded-xl overflow-hidden" style={panelShell}>
          <div className="relative flex-shrink-0">
            <div className="h-56 relative">
              <HotelImage
                key={`${selected.id}-${safeIndex}-${currentImage?.url}`}
                src={currentImage?.url ?? ATTRACTION_IMAGE_FALLBACK}
                fallback={ATTRACTION_IMAGE_FALLBACK}
                alt={currentImage?.caption ?? selected.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />
              <div className="absolute top-3 left-3 right-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="p-2 rounded-full"
                  style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}
                  data-testid="button-attraction-back"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="p-2 rounded-full"
                  style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }}
                >
                  <Share2 size={16} />
                </button>
              </div>
              {imageCount > 1 && (
                <>
                  <button type="button" className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }} onClick={goPrev}>
                    <ChevronLeft size={16} />
                  </button>
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }} onClick={goNext}>
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-[11px] font-medium leading-snug mb-1.5" style={{ color: "#f0ebe3" }}>
                  {currentImage?.caption}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.55)", color: "#ccc" }}>
                    {safeIndex + 1} / {imageCount} foto
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(76,175,125,0.85)", color: "#fff" }}>
                    {ATTRACTION_CATEGORY_LABELS[selected.category]}
                  </span>
                </div>
              </div>
            </div>
            <div ref={thumbStripRef} className="flex gap-1.5 p-2 overflow-x-auto scroll-smooth" style={{ background: "rgba(0,0,0,0.4)" }}>
              {selected.images.map((img, i) => (
                <button
                  key={`${selected.id}-thumb-${i}`}
                  type="button"
                  data-thumb-index={i}
                  onClick={() => setImageIndex(i)}
                  className="flex-shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: i === safeIndex ? "#4caf7d" : "transparent",
                    opacity: i === safeIndex ? 1 : 0.55,
                  }}
                >
                  <HotelImage src={img.url} fallback={ATTRACTION_IMAGE_FALLBACK} alt={img.caption} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-[16px] font-semibold leading-snug mb-1" style={{ color: "#e8ddd0" }}>{selected.title}</h2>
              <div className="flex items-center gap-2 flex-wrap text-[12px] mt-2">
                <span className="flex items-center gap-1 font-semibold" style={{ color: "#e8ddd0" }}>
                  <Star size={12} fill="#d4a843" style={{ color: "#d4a843" }} />
                  {selected.rating.toFixed(2)}
                </span>
                <span style={{ color: "#6b5e52" }}>({selected.reviewCount.toLocaleString()} ulasan)</span>
              </div>
              <p className="text-[11px] mt-2 flex items-start gap-1.5" style={{ color: "#8a7060" }}>
                <MapPin size={12} className="flex-shrink-0 mt-0.5" />
                {selected.address}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selected.tags.map((tag) => (
                  <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: "rgba(76,175,125,0.15)", color: "#7dcea0" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="px-4 py-3 grid grid-cols-2 gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <InfoChip icon={<Ticket size={13} />} label="Tiket" value={selected.entryFee} />
              <InfoChip icon={<Clock size={13} />} label="Jam buka" value={selected.openingHours} />
              <InfoChip icon={<Footprints size={13} />} label="Durasi" value={selected.duration} />
              <InfoChip icon={<Sun size={13} />} label="Waktu terbaik" value={selected.bestTime} />
            </div>

            <div className="px-4 py-3">
              <SectionTitle>Tentang destinasi</SectionTitle>
              <p className="text-[12px] leading-relaxed mb-2" style={{ color: "#c8bfb2" }}>{selected.description}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: "#9a8b7a" }}>{selected.longDescription}</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {selected.highlights.map((h) => (
                  <li key={h} className="text-[11px] flex gap-2" style={{ color: "#b8a878" }}>
                    <span style={{ color: "#4caf7d" }}>★</span> {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-4 pb-3">
              <SectionTitle>Tips kunjungan</SectionTitle>
              <ul className="flex flex-col gap-2">
                {selected.visitTips.map((tip) => (
                  <li key={tip} className="text-[11px] flex gap-2 px-2.5 py-2 rounded-lg" style={{ background: "rgba(212,168,67,0.08)", color: "#b8a878" }}>
                    <Compass size={12} className="flex-shrink-0 mt-0.5" style={{ color: "#d4a843" }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-4 pb-4 flex flex-col gap-2 text-[11px]">
              <span className="flex items-center gap-2" style={{ color: "#8a7060" }}>
                <Accessibility size={12} /> {selected.wheelchair}
              </span>
              {selected.website && (
                <span className="flex items-center gap-2" style={{ color: "#7dcea0" }}>
                  <Globe size={12} /> {selected.website}
                </span>
              )}
            </div>
          </div>

          <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.25)" }}>
            <button
              type="button"
              onClick={() => onSelectListing(selected)}
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #4caf7d, #2e7d52)",
                color: "#f0fff4",
                boxShadow: "0 4px 16px rgba(76,175,125,0.35)",
              }}
              data-testid="button-attraction-show-map"
            >
              Lihat di peta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute left-4 top-4 bottom-4 z-[1000] w-[min(100%,22rem)] sm:w-80 flex flex-col slide-in-left" data-testid="attractions-panel">
      <div className="flex flex-col h-full rounded-xl overflow-hidden" style={panelShell}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h2 className="text-[15px] font-semibold" style={{ color: "#e8ddd0" }}>Destinasi Wisata</h2>
            <p className="text-[11px] mt-0.5" style={{ color: "#6b5e52" }}>{listings.length} tempat · Roma, Italia</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "#6b5e52", background: "rgba(255,255,255,0.04)" }} data-testid="button-close-attractions">
            <X size={15} />
          </button>
        </div>

        <div className="px-3 py-2 flex flex-col gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex gap-1 flex-wrap">
            {(["all", "attraction", "museum", "viewpoint", "gallery"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setCatFilter(t)}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium"
                style={{
                  background: catFilter === t ? "rgba(76,175,125,0.25)" : "rgba(255,255,255,0.04)",
                  color: catFilter === t ? "#4caf7d" : "#6b5e52",
                  border: catFilter === t ? "1px solid rgba(76,175,125,0.4)" : "1px solid transparent",
                }}
              >
                {t === "all" ? "Semua" : ATTRACTION_CATEGORY_LABELS[t]}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-full text-[11px] rounded-lg px-2 py-1.5"
            style={{ background: "rgba(255,255,255,0.04)", color: "#c8bfb2", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <option value="rating">Rating tertinggi</option>
            <option value="name">Nama A–Z</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {listings.map((listing) => (
            <button
              key={listing.id}
              type="button"
              onClick={() => openDetail(listing)}
              className="text-left rounded-xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              data-testid={`attraction-card-${listing.id}`}
            >
              <div className="relative h-32">
                <HotelImage src={listing.images[0]?.url ?? ATTRACTION_IMAGE_FALLBACK} fallback={ATTRACTION_IMAGE_FALLBACK} alt={listing.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 right-2 text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.65)", color: "#e0d8cc" }}>
                  {listing.images.length} foto
                </span>
              </div>
              <div className="p-3">
                <div className="flex justify-between gap-2 mb-1">
                  <h3 className="text-[13px] font-medium leading-tight" style={{ color: "#e0d8cc" }}>{listing.title}</h3>
                  <span className="flex items-center gap-0.5 text-[11px] flex-shrink-0">
                    <Star size={10} fill="#d4a843" style={{ color: "#d4a843" }} />
                    {listing.rating.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] mb-1" style={{ color: "#6b5e52" }}>{listing.neighborhood}</p>
                <p className="text-[10px] line-clamp-2" style={{ color: "#8a7060" }}>{listing.description}</p>
                <p className="text-[10px] mt-1.5" style={{ color: "#4caf7d" }}>{listing.entryFee} · {listing.duration}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoChip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="px-2.5 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="flex items-center gap-1 mb-0.5 text-[9px] uppercase tracking-wider" style={{ color: "#5a4e46" }}>
        {icon} {label}
      </div>
      <p className="text-[11px] leading-snug" style={{ color: "#c8bfb2" }}>{value}</p>
    </div>
  );
}

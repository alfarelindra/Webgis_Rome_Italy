import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  X,
  ChevronLeft,
  Star,
  MapPin,
  Users,
  BedDouble,
  Bath,
  ShieldCheck,
  Zap,
  Heart,
  Share2,
  ChevronRight,
  Phone,
  Mail,
  Globe,
  Clock,
  Footprints,
  Home,
  Ban,
  CreditCard,
} from "lucide-react";
import {
  HOTEL_LISTINGS,
  STAY_TYPE_LABELS,
  estimateTotal,
  type HotelListing,
  type StayType,
} from "@/lib/hotelListings";
import HotelImage from "@/components/HotelImage";
import HotelBookingPanel from "@/components/HotelBookingPanel";

interface HotelsPanelProps {
  onClose: () => void;
  onSelectListing: (listing: HotelListing) => void;
  initialListingId?: string | null;
}

type SortKey = "price_asc" | "price_desc" | "rating";

const panelShell: React.CSSProperties = {
  background: "rgba(14, 11, 8, 0.97)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(192, 98, 58, 0.2)",
  boxShadow: "0 12px 48px rgba(0,0,0,0.7)",
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#c0623a" }}>
      {children}
    </h3>
  );
}

export default function HotelsPanel({ onClose, onSelectListing, initialListingId }: HotelsPanelProps) {
  const [selected, setSelected] = useState<HotelListing | null>(
    () => HOTEL_LISTINGS.find((h) => h.id === initialListingId) ?? null,
  );
  const [typeFilter, setTypeFilter] = useState<StayType | "all">("all");
  const [sort, setSort] = useState<SortKey>("rating");
  const [imageIndex, setImageIndex] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [nights, setNights] = useState(2);
  const [showBooking, setShowBooking] = useState(false);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  const listings = useMemo(() => {
    let list = [...HOTEL_LISTINGS];
    if (typeFilter !== "all") list = list.filter((h) => h.type === typeFilter);
    if (sort === "price_asc") list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    else if (sort === "price_desc") list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    else list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [typeFilter, sort]);

  const openDetail = (listing: HotelListing) => {
    setSelected(listing);
    setImageIndex(0);
    setNights(2);
  };

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!selected || !thumbStripRef.current) return;
    const active = thumbStripRef.current.querySelector<HTMLElement>(`[data-thumb-index="${imageIndex}"]`);
    active?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [imageIndex, selected?.id]);

  if (selected && showBooking) {
    return (
      <HotelBookingPanel
        listing={selected}
        onClose={() => { setShowBooking(false); setSelected(null); }}
        onBack={() => setShowBooking(false)}
      />
    );
  }

  if (selected) {
    const total = estimateTotal(selected, nights);
    const imageCount = selected.images.length;
    const safeIndex = imageCount > 0 ? ((imageIndex % imageCount) + imageCount) % imageCount : 0;
    const currentImage = selected.images[safeIndex];

    const goPrev = () => setImageIndex((i) => (i - 1 + imageCount) % imageCount);
    const goNext = () => setImageIndex((i) => (i + 1) % imageCount);

    return (
      <div
        className="absolute left-4 top-4 bottom-4 z-[1000] w-[min(100%,24rem)] sm:w-[26rem] flex flex-col"
        data-testid="hotels-detail-panel"
      >
        <div className="flex flex-col h-full rounded-xl overflow-hidden" style={panelShell}>
          {/* Gallery */}
          <div className="relative flex-shrink-0">
            <div className="h-56 relative">
              <HotelImage
                key={`${selected.id}-${safeIndex}-${currentImage?.url}`}
                src={currentImage?.url ?? ""}
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
                  data-testid="button-hotel-back"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2">
                  <IconBtn onClick={() => toggleSave(selected.id)} active={saved.has(selected.id)}>
                    <Heart size={16} fill={saved.has(selected.id) ? "#ff5a5f" : "none"} color="#fff" />
                  </IconBtn>
                  <IconBtn onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                    <Share2 size={16} color="#fff" />
                  </IconBtn>
                </div>
              </div>
              {selected.images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full"
                    style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }}
                    onClick={goPrev}
                    aria-label="Foto sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full"
                    style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }}
                    onClick={goNext}
                    aria-label="Foto berikutnya"
                  >
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
                  <div className="flex gap-2">
                    {selected.instantBook && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "rgba(76,175,80,0.9)", color: "#fff" }}>
                        <Zap size={10} /> Instan
                      </span>
                    )}
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.55)", color: "#e0d8cc" }}>
                      {STAY_TYPE_LABELS[selected.type]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Thumbnails */}
            <div
              ref={thumbStripRef}
              className="flex gap-1.5 p-2 overflow-x-auto scroll-smooth"
              style={{ background: "rgba(0,0,0,0.4)" }}
            >
              {selected.images.map((img, i) => (
                <button
                  key={`${selected.id}-thumb-${i}`}
                  type="button"
                  data-thumb-index={i}
                  onClick={() => setImageIndex(i)}
                  className="flex-shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: i === safeIndex ? "#c0623a" : "transparent",
                    opacity: i === safeIndex ? 1 : 0.55,
                    transform: i === safeIndex ? "scale(1.05)" : "scale(1)",
                  }}
                  aria-label={`Foto ${i + 1}: ${img.caption}`}
                  aria-current={i === safeIndex ? "true" : undefined}
                >
                  <HotelImage src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-[16px] font-semibold leading-snug mb-1" style={{ color: "#e8ddd0" }}>
                {selected.title}
              </h2>
              <p className="text-[11px] mb-2" style={{ color: "#8a7060" }}>{selected.osmName}</p>
              <div className="flex items-center gap-2 flex-wrap text-[12px] mb-2">
                <span className="flex items-center gap-1 font-semibold" style={{ color: "#e8ddd0" }}>
                  <Star size={12} fill="#d4a843" style={{ color: "#d4a843" }} />
                  {selected.rating.toFixed(2)}
                </span>
                <span style={{ color: "#6b5e52" }}>({selected.reviewCount} ulasan)</span>
              </div>
              <p className="text-[11px] flex items-start gap-1.5" style={{ color: "#8a7060" }}>
                <MapPin size={12} className="flex-shrink-0 mt-0.5" />
                <span>{selected.address}</span>
              </p>
            </div>

            {/* Host */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#c0623a,#d4a843)", color: "#fff" }}
                >
                  {selected.host.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-medium" style={{ color: "#e0d8cc" }}>
                    Host: {selected.host.name}
                    {selected.host.superhost && (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-[11px]" style={{ color: "#d4a843" }}>
                        <ShieldCheck size={11} /> Superhost
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#6b5e52" }}>
                    {selected.host.yearsHosting} tahun hosting
                  </p>
                  <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: "#9a8b7a" }}>
                    {selected.host.bio}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 grid grid-cols-3 gap-2 text-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <CapacityItem icon={<Users size={14} />} label={`${selected.guests} tamu`} />
              <CapacityItem icon={<BedDouble size={14} />} label={`${selected.beds} tempat tidur`} />
              <CapacityItem icon={<Bath size={14} />} label={`${selected.baths} kamar mandi`} />
            </div>

            {/* Description */}
            <div className="px-4 py-3">
              <SectionTitle>Tentang penginapan</SectionTitle>
              <p className="text-[12px] leading-relaxed mb-2" style={{ color: "#c8bfb2" }}>
                {selected.description}
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: "#9a8b7a" }}>
                {selected.longDescription}
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {selected.highlights.map((h) => (
                  <li key={h} className="text-[11px] flex items-start gap-2" style={{ color: "#b8a878" }}>
                    <span style={{ color: "#4caf7d" }}>✓</span> {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rooms */}
            {selected.rooms.length > 0 && (
              <div className="px-4 pb-3">
                <SectionTitle>Tipe kamar</SectionTitle>
                <div className="flex flex-col gap-3">
                  {selected.rooms.map((room) => (
                    <div
                      key={room.name}
                      className="rounded-xl overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <HotelImage src={room.image} alt={room.name} className="w-full h-28 object-cover" />
                      <div className="p-3">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p className="text-[13px] font-medium" style={{ color: "#e0d8cc" }}>{room.name}</p>
                          <p className="text-[12px] font-semibold flex-shrink-0" style={{ color: "#d4a843" }}>
                            €{room.pricePerNight}
                          </p>
                        </div>
                        <p className="text-[10px] mb-2" style={{ color: "#6b5e52" }}>
                          {room.beds} · {room.size}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {room.features.map((f) => (
                            <span
                              key={f}
                              className="text-[9px] px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(255,255,255,0.05)", color: "#8a7060" }}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="px-4 pb-3">
              <SectionTitle>Fasilitas</SectionTitle>
              <div className="grid grid-cols-2 gap-1.5">
                {selected.amenities.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px]"
                    style={{ background: "rgba(255,255,255,0.03)", color: "#c8bfb2" }}
                  >
                    <span style={{ color: "#4caf7d" }}>✓</span>
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby */}
            <div className="px-4 pb-3">
              <SectionTitle>Lokasi terdekat</SectionTitle>
              <div className="flex flex-col gap-2">
                {selected.nearby.map((place) => (
                  <div
                    key={place.name}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-[11px]"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <span style={{ color: "#c8bfb2" }}>{place.name}</span>
                    <span className="flex items-center gap-2 flex-shrink-0" style={{ color: "#6b5e52" }}>
                      <span>{place.distance}</span>
                      <span className="flex items-center gap-0.5">
                        <Footprints size={10} /> {place.walkMin} mnt
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="px-4 pb-3">
              <SectionTitle>
                Ulasan tamu ({selected.reviewCount})
              </SectionTitle>
              <div className="flex flex-col gap-3">
                {selected.reviews.map((review) => (
                  <div
                    key={`${review.author}-${review.date}`}
                    className="p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium" style={{ color: "#e0d8cc" }}>{review.author}</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Star size={10} fill="#d4a843" style={{ color: "#d4a843" }} />
                        {review.rating}
                      </span>
                    </div>
                    <p className="text-[10px] mb-1.5" style={{ color: "#5a4e46" }}>{review.date}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: "#b8a898" }}>{review.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="px-4 pb-3">
              <SectionTitle>Kontak</SectionTitle>
              <div className="flex flex-col gap-2 text-[11px]">
                <a href={`tel:${selected.phone}`} className="flex items-center gap-2" style={{ color: "#9fdfb8" }}>
                  <Phone size={12} /> {selected.phone}
                </a>
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2" style={{ color: "#9fdfb8" }}>
                  <Mail size={12} /> {selected.email}
                </a>
                {selected.website && (
                  <span className="flex items-center gap-2" style={{ color: "#8a7060" }}>
                    <Globe size={12} /> {selected.website}
                  </span>
                )}
              </div>
            </div>

            {/* House rules & policies */}
            <div className="px-4 pb-3">
              <SectionTitle>Peraturan</SectionTitle>
              <ul className="mb-3 flex flex-col gap-1">
                {selected.houseRules.map((rule) => (
                  <li key={rule} className="text-[11px] flex items-start gap-2" style={{ color: "#8a7060" }}>
                    <Home size={11} className="flex-shrink-0 mt-0.5" style={{ color: "#6b5e52" }} />
                    {rule}
                  </li>
                ))}
              </ul>
              <div className="rounded-xl p-3 flex flex-col gap-2 text-[10px]" style={{ background: "rgba(255,255,255,0.03)" }}>
                <PolicyRow label="Pembatalan" value={selected.policies.cancellation} />
                <PolicyRow label="Hewan" value={selected.policies.pets} />
                <PolicyRow label="Merokok" value={selected.policies.smoking} />
                {selected.policies.minStay && <PolicyRow label="Min. menginap" value={selected.policies.minStay} />}
              </div>
            </div>

            <div className="px-4 pb-4 flex gap-4 text-[11px]" style={{ color: "#8a7060" }}>
              <span className="flex items-center gap-1">
                <Clock size={11} /> Check-in <strong style={{ color: "#c8bfb2" }}>{selected.checkIn}</strong>
              </span>
              <span>
                Check-out <strong style={{ color: "#c8bfb2" }}>{selected.checkOut}</strong>
              </span>
            </div>
          </div>

          {/* Footer booking */}
          <div className="p-4 flex-shrink-0 flex flex-col gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.25)" }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold" style={{ color: "#e8ddd0" }}>€{selected.pricePerNight}</span>
                  <span className="text-[11px]" style={{ color: "#6b5e52" }}>/ malam</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px]" style={{ color: "#6b5e52" }}>Malam</label>
                <select
                  value={nights}
                  onChange={(e) => setNights(Number(e.target.value))}
                  className="text-xs rounded-lg px-2 py-1"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#e0d8cc", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {[1, 2, 3, 5, 7].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-[10px] mb-2 space-y-0.5" style={{ color: "#6b5e52" }}>
              <div className="flex justify-between">
                <span>€{selected.pricePerNight} × {nights} malam</span>
                <span>€{selected.pricePerNight * nights}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya pembersihan</span>
                <span>€{selected.cleaningFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya layanan</span>
                <span>€{selected.serviceFee}</span>
              </div>
            </div>
            <p className="text-[12px] mb-2 text-right font-semibold" style={{ color: "#d4a843" }}>
              Total: €{estimateTotal(selected, nights)}
            </p>
            {/* Tombol Pesan Sekarang */}
            <button
              type="button"
              onClick={() => setShowBooking(true)}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #c0623a, #d4a843)",
                color: "#1a1208",
                boxShadow: "0 4px 16px rgba(192,98,58,0.4)",
              }}
              data-testid="button-hotel-book"
            >
              <CreditCard size={15} />
              Pesan Sekarang
            </button>
            {/* Tombol Lihat di Peta */}
            <button
              type="button"
              onClick={() => onSelectListing(selected)}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "#8a9070",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              data-testid="button-hotel-show-map"
            >
              Lihat di peta
            </button>
            <p className="text-[9px] text-center" style={{ color: "#4a3e36" }}>
              Harga ilustratif · bukan reservasi nyata
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute left-4 top-4 bottom-4 z-[1000] w-[min(100%,22rem)] sm:w-80 flex flex-col slide-in-left"
      data-testid="hotels-panel"
    >
      <div className="flex flex-col h-full rounded-xl overflow-hidden" style={panelShell}>
        <div className="p-4 flex-shrink-0 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h2 className="text-[15px] font-semibold" style={{ color: "#e8ddd0" }}>Penginapan Roma</h2>
            <p className="text-[11px] mt-0.5" style={{ color: "#6b5e52" }}>
              {listings.length} tempat · foto & detail lengkap
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "#6b5e52", background: "rgba(255,255,255,0.04)" }} data-testid="button-close-hotels">
            <X size={15} />
          </button>
        </div>

        <div className="px-3 py-2 flex-shrink-0 flex flex-col gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex gap-1 flex-wrap">
            {(["all", "hotel", "apartment", "hostel", "guest_house"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium"
                style={{
                  background: typeFilter === t ? "rgba(192,98,58,0.25)" : "rgba(255,255,255,0.04)",
                  color: typeFilter === t ? "#c0623a" : "#6b5e52",
                  border: typeFilter === t ? "1px solid rgba(192,98,58,0.35)" : "1px solid transparent",
                }}
              >
                {t === "all" ? "Semua" : STAY_TYPE_LABELS[t]}
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
            <option value="price_asc">Harga terendah</option>
            <option value="price_desc">Harga tertinggi</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {listings.map((listing) => (
            <button
              key={listing.id}
              type="button"
              onClick={() => openDetail(listing)}
              className="text-left rounded-xl overflow-hidden transition-all hover:scale-[1.01]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              data-testid={`hotel-card-${listing.id}`}
            >
              <div className="relative h-36">
                <HotelImage src={listing.images[0]?.url ?? ""} alt={listing.title} className="w-full h-full object-cover" />
                <span
                  className="absolute bottom-2 right-2 text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(0,0,0,0.65)", color: "#e0d8cc" }}
                >
                  {listing.images.length} foto
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleSave(listing.id); }}
                  className="absolute top-2 right-2 p-1.5 rounded-full"
                  style={{ background: "rgba(0,0,0,0.45)" }}
                >
                  <Heart size={14} fill={saved.has(listing.id) ? "#ff5a5f" : "none"} color="#fff" />
                </button>
                {listing.host.superhost && (
                  <span className="absolute bottom-2 left-2 text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(212,168,67,0.9)", color: "#1a1208" }}>
                    Superhost
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="text-[13px] font-medium leading-tight flex-1" style={{ color: "#e0d8cc" }}>{listing.title}</h3>
                  <span className="flex items-center gap-0.5 text-[11px] flex-shrink-0" style={{ color: "#e8ddd0" }}>
                    <Star size={10} fill="#d4a843" style={{ color: "#d4a843" }} />
                    {listing.rating.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] mb-1 line-clamp-2" style={{ color: "#6b5e52" }}>{listing.description}</p>
                <p className="text-[10px] mb-2 truncate" style={{ color: "#5a4e46" }}>
                  {listing.neighborhood} · {listing.rooms.length} tipe kamar
                </p>
                <p className="text-[12px] font-semibold" style={{ color: "#d4a843" }}>
                  €{listing.pricePerNight} <span className="font-normal text-[10px]" style={{ color: "#6b5e52" }}>/ malam</span>
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PolicyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <Ban size={10} className="flex-shrink-0 mt-0.5" style={{ color: "#6b5e52" }} />
      <span><strong style={{ color: "#8a7060" }}>{label}:</strong> <span style={{ color: "#6b5e52" }}>{value}</span></span>
    </div>
  );
}

function IconBtn({ children, onClick, active }: { children: ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} className="p-2 rounded-full" style={{ background: active ? "rgba(255,90,95,0.5)" : "rgba(0,0,0,0.45)" }}>
      {children}
    </button>
  );
}

function CapacityItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      <span style={{ color: "#c0623a" }}>{icon}</span>
      <span className="text-[10px] text-center" style={{ color: "#8a7060" }}>{label}</span>
    </div>
  );
}
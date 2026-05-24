import { useMemo, useState, type ReactNode } from "react";
import {
  X,
  ChevronLeft,
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  Heart,
  Share2,
  ChevronRight,
  Utensils,
  Award,
  Tag,
} from "lucide-react";
import {
  RESTAURANT_LISTINGS,
  CUISINE_TYPE_LABELS,
  type RestaurantListing,
  type CuisineType,
  type RestaurantSortKey,
} from "@/lib/restaurantListings";
import HotelImage from "@/components/HotelImage";

interface RestaurantsPanelProps {
  onClose: () => void;
  onSelectListing: (listing: RestaurantListing) => void;
  initialListingId?: string | null;
}

const panelShell: React.CSSProperties = {
  background: "rgba(10, 8, 5, 0.97)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(212, 168, 67, 0.2)",
  boxShadow: "0 12px 48px rgba(0,0,0,0.7)",
};

const PRICE_COLOR: Record<string, string> = {
  "€": "#4caf7d",
  "€€": "#d4a843",
  "€€€": "#c0623a",
  "€€€€": "#9b59b6",
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3
      className="text-[11px] font-semibold uppercase tracking-wider mb-2"
      style={{ color: "#d4a843" }}
    >
      {children}
    </h3>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={10}
          fill={i <= Math.round(rating) ? "#d4a843" : "none"}
          style={{ color: "#d4a843", opacity: i <= Math.round(rating) ? 1 : 0.3 }}
        />
      ))}
    </div>
  );
}

export default function RestaurantsPanel({
  onClose,
  onSelectListing,
  initialListingId,
}: RestaurantsPanelProps) {
  const [selected, setSelected] = useState<RestaurantListing | null>(
    () => RESTAURANT_LISTINGS.find((r) => r.id === initialListingId) ?? null
  );
  const [cuisineFilter, setCuisineFilter] = useState<CuisineType | "all">("all");
  const [sort, setSort] = useState<RestaurantSortKey>("rating");
  const [imageIndex, setImageIndex] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [activeDishIndex, setActiveDishIndex] = useState(0);

  const listings = useMemo(() => {
    let list = [...RESTAURANT_LISTINGS];
    if (cuisineFilter !== "all") list = list.filter((r) => r.cuisine === cuisineFilter);
    if (sort === "price_asc")
      list.sort((a, b) => a.priceRange.length - b.priceRange.length);
    else if (sort === "price_desc")
      list.sort((a, b) => b.priceRange.length - a.priceRange.length);
    else if (sort === "reviews") list.sort((a, b) => b.reviewCount - a.reviewCount);
    else list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [cuisineFilter, sort]);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openDetail = (listing: RestaurantListing) => {
    setSelected(listing);
    setImageIndex(0);
    setActiveDishIndex(0);
  };

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────────
  if (selected) {
    const imgCount = selected.images.length;
    const safeIdx = imgCount > 0 ? ((imageIndex % imgCount) + imgCount) % imgCount : 0;
    const currentImage = selected.images[safeIdx];
    const goPrev = () => setImageIndex((i) => (i - 1 + imgCount) % imgCount);
    const goNext = () => setImageIndex((i) => (i + 1) % imgCount);

    return (
      <div
        className="absolute left-4 top-4 bottom-4 z-[1000] w-[min(100%,24rem)] sm:w-[26rem] flex flex-col"
        data-testid="restaurants-detail-panel"
      >
        <div className="flex flex-col h-full rounded-xl overflow-hidden" style={panelShell}>
          {/* Gallery */}
          <div className="relative flex-shrink-0">
            <div className="h-52 relative">
              <HotelImage
                key={`${selected.id}-${safeIdx}`}
                src={currentImage?.url ?? ""}
                alt={currentImage?.caption ?? selected.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />
              {/* Top controls */}
              <div className="absolute top-3 left-3 right-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="p-2 rounded-full"
                  style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
                  data-testid="button-restaurant-back"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSave(selected.id)}
                    className="p-2 rounded-full"
                    style={{
                      background: saved.has(selected.id)
                        ? "rgba(255,90,95,0.5)"
                        : "rgba(0,0,0,0.45)",
                    }}
                  >
                    <Heart
                      size={16}
                      fill={saved.has(selected.id) ? "#ff5a5f" : "none"}
                      color="#fff"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(window.location.href)}
                    className="p-2 rounded-full"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                  >
                    <Share2 size={16} color="#fff" />
                  </button>
                </div>
              </div>
              {/* Nav arrows */}
              {imgCount > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full"
                    style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }}
                    onClick={goPrev}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full"
                    style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }}
                    onClick={goNext}
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
              {/* Bottom info */}
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-[11px] font-medium leading-snug mb-1.5" style={{ color: "#f0ebe3" }}>
                  {currentImage?.caption}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(0,0,0,0.55)", color: "#ccc" }}
                  >
                    {safeIdx + 1} / {imgCount} foto
                  </span>
                  <div className="flex gap-2">
                    {selected.michelin && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: "rgba(192,98,58,0.9)", color: "#fff" }}
                      >
                        <Award size={10} /> {selected.michelin}
                      </span>
                    )}
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(0,0,0,0.55)", color: PRICE_COLOR[selected.priceRange] }}
                    >
                      {selected.priceRange}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Thumbnail strip */}
            <div
              className="flex gap-1.5 p-2 overflow-x-auto scroll-smooth"
              style={{ background: "rgba(0,0,0,0.45)" }}
            >
              {selected.images.map((img, i) => (
                <button
                  key={`${selected.id}-thumb-${i}`}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  className="flex-shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: i === safeIdx ? "#d4a843" : "transparent",
                    opacity: i === safeIdx ? 1 : 0.5,
                    transform: i === safeIdx ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  <HotelImage src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* Header info */}
            <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-[17px] font-semibold leading-snug mb-1" style={{ color: "#e8ddd0" }}>
                {selected.title}
              </h2>
              <p className="text-[11px] mb-2" style={{ color: "#8a7060" }}>
                {CUISINE_TYPE_LABELS[selected.cuisine]} · {selected.neighborhood}
              </p>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={selected.rating} />
                  <span className="text-[12px] font-semibold" style={{ color: "#e8ddd0" }}>
                    {selected.rating.toFixed(2)}
                  </span>
                  <span className="text-[11px]" style={{ color: "#6b5e52" }}>
                    ({selected.reviewCount} ulasan)
                  </span>
                </div>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(212,168,67,0.12)",
                    color: PRICE_COLOR[selected.priceRange],
                    border: `1px solid ${PRICE_COLOR[selected.priceRange]}40`,
                  }}
                >
                  {selected.priceRange}
                </span>
              </div>
              <p className="text-[11px] flex items-start gap-1.5" style={{ color: "#8a7060" }}>
                <MapPin size={12} className="flex-shrink-0 mt-0.5" />
                <span>{selected.address}</span>
              </p>
            </div>

            {/* Tags */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex flex-wrap gap-1.5">
                {selected.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{
                      background: "rgba(212,168,67,0.08)",
                      color: "#d4a843",
                      border: "1px solid rgba(212,168,67,0.2)",
                    }}
                  >
                    <Tag size={8} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <SectionTitle>Tentang Restoran</SectionTitle>
              <p className="text-[12px] leading-relaxed mb-2" style={{ color: "#c8bfb2" }}>
                {selected.description}
              </p>
              <p className="text-[11px] leading-relaxed mb-3" style={{ color: "#9a8b7a" }}>
                {selected.longDescription}
              </p>
              <ul className="flex flex-col gap-1.5">
                {selected.highlights.map((h) => (
                  <li key={h} className="text-[11px] flex items-start gap-2" style={{ color: "#b8a878" }}>
                    <span style={{ color: "#d4a843" }}>✦</span> {h}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-4 mt-3 text-[11px]" style={{ color: "#6b5e52" }}>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {selected.openingHours}
                </span>
              </div>
              {selected.founded && (
                <p className="text-[10px] mt-1" style={{ color: "#5a4e46" }}>
                  Berdiri sejak {selected.founded}
                </p>
              )}
            </div>

            {/* Signature Dishes */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <SectionTitle>
                <span className="flex items-center gap-1.5">
                  <Utensils size={10} />
                  Hidangan Andalan
                </span>
              </SectionTitle>
              {/* Dish tab selector */}
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                {selected.signatureDishes.map((dish, i) => (
                  <button
                    key={dish.name}
                    type="button"
                    onClick={() => setActiveDishIndex(i)}
                    className="text-[10px] px-2.5 py-1 rounded-full flex-shrink-0 transition-all"
                    style={{
                      background:
                        activeDishIndex === i
                          ? "rgba(212,168,67,0.2)"
                          : "rgba(255,255,255,0.04)",
                      color: activeDishIndex === i ? "#d4a843" : "#6b5e52",
                      border:
                        activeDishIndex === i
                          ? "1px solid rgba(212,168,67,0.35)"
                          : "1px solid transparent",
                    }}
                  >
                    {dish.name.split(" ").slice(0, 3).join(" ")}
                  </button>
                ))}
              </div>
              {selected.signatureDishes[activeDishIndex] && (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <HotelImage
                    src={selected.signatureDishes[activeDishIndex].image}
                    alt={selected.signatureDishes[activeDishIndex].name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="text-[13px] font-semibold" style={{ color: "#e0d8cc" }}>
                        {selected.signatureDishes[activeDishIndex].name}
                      </p>
                      <span
                        className="text-[12px] font-bold flex-shrink-0"
                        style={{ color: "#d4a843" }}
                      >
                        {selected.signatureDishes[activeDishIndex].price}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: "#8a7060" }}>
                      {selected.signatureDishes[activeDishIndex].description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <SectionTitle>Ulasan Tamu ({selected.reviewCount})</SectionTitle>
              <div className="flex flex-col gap-3">
                {selected.reviews.map((review) => (
                  <div
                    key={`${review.author}-${review.date}`}
                    className="p-3 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium" style={{ color: "#e0d8cc" }}>
                        {review.author}
                      </span>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-[10px] mb-1.5" style={{ color: "#5a4e46" }}>
                      {review.date}
                    </p>
                    <p className="text-[11px] leading-relaxed" style={{ color: "#b8a898" }}>
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="px-4 py-3">
              <SectionTitle>Kontak & Info</SectionTitle>
              <div className="flex flex-col gap-2 text-[11px]">
                <a href={`tel:${selected.phone}`} className="flex items-center gap-2" style={{ color: "#9fdfb8" }}>
                  <Phone size={12} /> {selected.phone}
                </a>
                {selected.website && (
                  <span className="flex items-center gap-2" style={{ color: "#8a7060" }}>
                    <Globe size={12} /> {selected.website}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div
            className="p-4 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.25)" }}
          >
            <button
              type="button"
              onClick={() => onSelectListing(selected)}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #d4a843, #c0623a)",
                color: "#1a1208",
                boxShadow: "0 4px 16px rgba(212,168,67,0.35)",
              }}
              data-testid="button-restaurant-show-map"
            >
              Lihat di Peta
            </button>
            <p className="text-[9px] text-center mt-2" style={{ color: "#4a3e36" }}>
              Data ilustratif · bukan reservasi nyata
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="absolute left-4 top-4 bottom-4 z-[1000] w-[min(100%,22rem)] sm:w-80 flex flex-col slide-in-left"
      data-testid="restaurants-panel"
    >
      <div className="flex flex-col h-full rounded-xl overflow-hidden" style={panelShell}>
        {/* Header */}
        <div
          className="p-4 flex-shrink-0 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Utensils size={14} style={{ color: "#d4a843" }} />
              <h2 className="text-[15px] font-semibold" style={{ color: "#e8ddd0" }}>
                Restauran Roma
              </h2>
            </div>
            <p className="text-[11px]" style={{ color: "#6b5e52" }}>
              {listings.length} restoran ikonik · Kota Abadi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ color: "#6b5e52", background: "rgba(255,255,255,0.04)" }}
            data-testid="button-close-restaurants"
          >
            <X size={15} />
          </button>
        </div>

        {/* Filters */}
        <div
          className="px-3 py-2 flex-shrink-0 flex flex-col gap-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex gap-1 flex-wrap">
            {(["all", "roman", "pizza", "fine_dining", "trattoria", "osteria"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setCuisineFilter(t)}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-all"
                style={{
                  background:
                    cuisineFilter === t
                      ? "rgba(212,168,67,0.22)"
                      : "rgba(255,255,255,0.04)",
                  color: cuisineFilter === t ? "#d4a843" : "#6b5e52",
                  border:
                    cuisineFilter === t
                      ? "1px solid rgba(212,168,67,0.35)"
                      : "1px solid transparent",
                }}
              >
                {t === "all" ? "Semua" : CUISINE_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as RestaurantSortKey)}
            className="w-full text-[11px] rounded-lg px-2 py-1.5"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "#c8bfb2",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <option value="rating">Rating tertinggi</option>
            <option value="reviews">Ulasan terbanyak</option>
            <option value="price_asc">Harga terendah (€ dulu)</option>
            <option value="price_desc">Harga tertinggi (€€€€ dulu)</option>
          </select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {listings.map((listing) => (
            <button
              key={listing.id}
              type="button"
              onClick={() => openDetail(listing)}
              className="text-left rounded-xl overflow-hidden transition-all hover:scale-[1.01]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              data-testid={`restaurant-card-${listing.id}`}
            >
              {/* Card image */}
              <div className="relative h-32">
                <HotelImage
                  src={listing.images[0]?.url ?? ""}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {/* Save button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(listing.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full"
                  style={{ background: "rgba(0,0,0,0.45)" }}
                >
                  <Heart
                    size={13}
                    fill={saved.has(listing.id) ? "#ff5a5f" : "none"}
                    color="#fff"
                  />
                </button>
                {/* Michelin badge */}
                {listing.michelin && (
                  <span
                    className="absolute bottom-2 left-2 text-[9px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5"
                    style={{ background: "rgba(192,98,58,0.9)", color: "#fff" }}
                  >
                    <Award size={8} /> {listing.michelin}
                  </span>
                )}
                {/* Price badge */}
                <span
                  className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(0,0,0,0.65)",
                    color: PRICE_COLOR[listing.priceRange],
                  }}
                >
                  {listing.priceRange}
                </span>
              </div>

              {/* Card body */}
              <div className="p-3">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3
                    className="text-[13px] font-medium leading-tight flex-1"
                    style={{ color: "#e0d8cc" }}
                  >
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star size={10} fill="#d4a843" style={{ color: "#d4a843" }} />
                    <span className="text-[11px]" style={{ color: "#e8ddd0" }}>
                      {listing.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] mb-1.5 flex items-center gap-1" style={{ color: "#6b5e52" }}>
                  <MapPin size={9} />
                  {listing.neighborhood}
                  <span className="mx-1">·</span>
                  {CUISINE_TYPE_LABELS[listing.cuisine]}
                </p>
                <p
                  className="text-[10px] mb-2 line-clamp-2 leading-relaxed"
                  style={{ color: "#5a4e46" }}
                >
                  {listing.description}
                </p>
                {/* Tags preview */}
                <div className="flex flex-wrap gap-1">
                  {listing.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(212,168,67,0.08)", color: "#8a7060" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

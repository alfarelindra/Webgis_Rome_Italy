import { useState, useEffect, type ReactNode } from "react";
import {
  X,
  ChevronLeft,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Lock,
  ShieldCheck,
  AlertCircle,
  BedDouble,
  Calendar,
  Users,
  Moon,
  Plus,
  Minus,
  Zap,
  Star,
  LogIn,
} from "lucide-react";
import HotelImage from "@/components/HotelImage";
import { HOTEL_IMAGE_FALLBACK, estimateTotal, type HotelListing, type HotelRoom } from "@/lib/hotelListings";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";

interface HotelBookingPanelProps {
  listing: HotelListing;
  onClose: () => void;
  onBack: () => void;
}

type PaymentMethod = "card" | "qris";
type BookingStep = "room" | "summary" | "payment" | "success";

const EURO_TO_IDR = 17_500;

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  color: "#e8ddd0",
  padding: "10px 12px",
  fontSize: "13px",
  width: "100%",
  outline: "none",
  transition: "border-color 0.2s",
};

const panelShell: React.CSSProperties = {
  background: "rgba(12, 9, 6, 0.97)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(192, 98, 58, 0.25)",
  boxShadow: "0 16px 60px rgba(0,0,0,0.8)",
};

function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  maxLength,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#6b5e52" }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(192,98,58,0.6)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
      />
    </div>
  );
}

function QrisCode({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-3">
      <div className="p-3 rounded-2xl" style={{ background: "#fff", border: `3px solid ${accent}` }}>
        <svg width="150" height="150" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="42" height="42" rx="4" fill="#111" />
          <rect x="16" y="16" width="30" height="30" rx="2" fill="#fff" />
          <rect x="22" y="22" width="18" height="18" rx="1" fill="#111" />
          <rect x="108" y="10" width="42" height="42" rx="4" fill="#111" />
          <rect x="114" y="16" width="30" height="30" rx="2" fill="#fff" />
          <rect x="120" y="22" width="18" height="18" rx="1" fill="#111" />
          <rect x="10" y="108" width="42" height="42" rx="4" fill="#111" />
          <rect x="16" y="114" width="30" height="30" rx="2" fill="#fff" />
          <rect x="22" y="120" width="18" height="18" rx="1" fill="#111" />
          {[60,68,76,84,92,100].flatMap((x) =>
            [10,18,26,34,42,58,66,74,82,90,106,114,122,130,138].map((y) =>
              (x + y) % 3 === 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1" fill="#111" /> : null
            )
          )}
          {[10,18,26,34,42,58,66,74,82,90,106,114,122,130,138].flatMap((x) =>
            [60,68,76,84,92,100,108,116,124,132].map((y) =>
              (x * y) % 5 !== 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1" fill="#111" /> : null
            )
          )}
          <rect x="62" y="62" width="36" height="36" rx="4" fill="#fff" />
          <text x="80" y="85" textAnchor="middle" fontSize="16" fill={accent} fontWeight="bold">Q</text>
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[12px] font-semibold" style={{ color: "#e0d8cc" }}>Scan dengan e-wallet</p>
        <p className="text-[10px] mt-0.5" style={{ color: "#6b5e52" }}>GoPay · OVO · Dana · BCA · Mandiri</p>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(192,98,58,0.1)", border: "1px solid rgba(192,98,58,0.25)" }}>
        <ShieldCheck size={11} style={{ color: accent }} />
        <span className="text-[10px]" style={{ color: accent }}>Kode berlaku 10 menit</span>
      </div>
    </div>
  );
}

export default function HotelBookingPanel({ listing, onClose, onBack }: HotelBookingPanelProps) {
  const ACCENT = "#c0623a";
  const ACCENT2 = "#d4a843";
  const { user, addOrder } = useAuth();

  const [step, setStep] = useState<BookingStep>("room");
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(
    listing.rooms.length === 1 ? listing.rooms[0] : null
  );
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(1);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [showLogin, setShowLogin] = useState(false);

  /* Card form */
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [paying, setPaying] = useState(false);
  const [successTimer, setSuccessTimer] = useState(3);

  const room = selectedRoom ?? listing.rooms[0];
  const pricePerNight = room?.pricePerNight ?? listing.pricePerNight;
  const cleaningFee = listing.cleaningFee;
  const serviceFee = listing.serviceFee;
  const roomTotal = pricePerNight * nights;
  const grandTotalEuro = roomTotal + cleaningFee + serviceFee;
  const grandTotalIDR = grandTotalEuro * EURO_TO_IDR;

  /* Card formatting */
  const handleCardNum = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 16);
    setCardNum(d.replace(/(.{4})/g, "$1 ").trim());
  };
  const handleExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    setCardExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };
  const cardValid = cardNum.replace(/\s/g, "").length === 16 && cardName.length > 2 && cardExpiry.length === 5 && cardCvv.length >= 3;

  const handlePay = () => {
    if (method === "card" && !cardValid) return;
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      if (user) {
        addOrder({
          type: "hotel",
          title: listing.title,
          detail: `${room?.name ?? "-"} · ${nights} malam · ${guests} tamu`,
          totalIDR: grandTotalIDR,
          totalEuro: grandTotalEuro,
          method,
        });
      }
      setStep("success");
    }, 2200);
  };

  useEffect(() => {
    if (step !== "success") return;
    const t = setInterval(() => setSuccessTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [step]);
  useEffect(() => { if (successTimer <= 0) onClose(); }, [successTimer, onClose]);

  /* Login gate */
  if (showLogin) {
    return (
      <LoginModal
        reason="untuk menyimpan pemesanan ke akun Anda"
        onClose={() => setShowLogin(false)}
        onSuccess={() => { setShowLogin(false); setStep("payment"); }}
      />
    );
  }

  /* ── SUCCESS ── */
  if (step === "success") {
    return (
      <div className="absolute left-4 top-4 bottom-4 z-[1100] w-[min(100%,26rem)] sm:w-[28rem] flex flex-col">
        <div className="flex flex-col h-full rounded-2xl overflow-hidden items-center justify-center gap-5 px-6" style={panelShell}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(192,98,58,0.15)", border: `2px solid ${ACCENT}` }}>
            <CheckCircle2 size={40} style={{ color: ACCENT }} />
          </div>
          <div className="text-center">
            <h2 className="text-[18px] font-bold" style={{ color: "#e8ddd0" }}>Pemesanan Berhasil!</h2>
            <p className="text-[12px] mt-1" style={{ color: "#6b5e52" }}>Konfirmasi dikirim ke email Anda</p>
          </div>

          {/* Ringkasan booking */}
          <div className="w-full rounded-xl p-4 flex flex-col gap-2.5" style={{ background: "rgba(192,98,58,0.07)", border: "1px solid rgba(192,98,58,0.2)" }}>
            <Row label="Penginapan" value={listing.osmName} accent={ACCENT2} />
            <Row label="Kamar" value={room?.name ?? "-"} accent={ACCENT2} />
            <Row label="Menginap" value={`${nights} malam · ${guests} tamu`} accent={ACCENT2} />
            <Row label="Check-in" value={listing.checkIn} accent={ACCENT2} />
            <Row label="Check-out" value={listing.checkOut} accent={ACCENT2} />
            <Row label="Metode" value={method === "card" ? "Kartu Kredit/Debit" : "QRIS"} accent={ACCENT2} />
            <div className="pt-2 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <Row label="Total dibayar" value={formatIDR(grandTotalIDR)} accent={ACCENT} bold />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <BedDouble size={13} style={{ color: ACCENT2 }} />
            <p className="text-[11px]" style={{ color: ACCENT2 }}>Voucher dikirim dalam 5 menit</p>
          </div>

          <button type="button" onClick={onClose} className="w-full py-3 rounded-xl text-[13px] font-semibold"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: "#1a1208" }}>
            Selesai ({successTimer}s)
          </button>
        </div>
      </div>
    );
  }

  /* ── PAYMENT ── */
  if (step === "payment") {
    return (
      <div className="absolute left-4 top-4 bottom-4 z-[1100] w-[min(100%,26rem)] sm:w-[28rem] flex flex-col">
        <div className="flex flex-col h-full rounded-2xl overflow-hidden" style={panelShell}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button type="button" onClick={() => setStep("summary")} className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "#8a7060" }}>
              <ChevronLeft size={16} />
            </button>
            <div className="flex-1">
              <h2 className="text-[14px] font-semibold" style={{ color: "#e8ddd0" }}>Metode Pembayaran</h2>
              <p className="text-[10px]" style={{ color: "#6b5e52" }}>Pilih cara bayar</p>
            </div>
            <Lock size={13} style={{ color: ACCENT }} />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
            {/* Total ringkas */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(192,98,58,0.08)", border: "1px solid rgba(192,98,58,0.18)" }}>
              <div>
                <p className="text-[10px]" style={{ color: "#8a7060" }}>{room?.name} · {nights} malam</p>
                <p className="text-[11px]" style={{ color: "#c8bfb2" }}>{listing.title}</p>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold" style={{ color: ACCENT }}>{formatIDR(grandTotalIDR)}</p>
                <p className="text-[9px]" style={{ color: "#6b5e52" }}>≈ €{grandTotalEuro}</p>
              </div>
            </div>

            {/* Pilih metode */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5a4e46" }}>Pilih metode</p>
              <div className="grid grid-cols-2 gap-2">
                {(["card", "qris"] as PaymentMethod[]).map((m) => (
                  <button key={m} type="button" onClick={() => setMethod(m)}
                    className="flex flex-col items-center gap-2 py-3 rounded-xl transition-all"
                    style={{
                      background: method === m ? "rgba(192,98,58,0.15)" : "rgba(255,255,255,0.03)",
                      border: method === m ? `1.5px solid rgba(192,98,58,0.55)` : "1px solid rgba(255,255,255,0.07)",
                    }}>
                    {m === "card"
                      ? <CreditCard size={22} style={{ color: method === m ? ACCENT : "#5a4e46" }} />
                      : <Smartphone size={22} style={{ color: method === m ? ACCENT : "#5a4e46" }} />
                    }
                    <span className="text-[10px] font-medium" style={{ color: method === m ? ACCENT : "#6b5e52" }}>
                      {m === "card" ? "Kartu Kredit/Debit" : "QRIS"}
                    </span>
                    {m === "card" && (
                      <div className="flex gap-1">
                        {["VISA","MC","JCB"].map(b => (
                          <span key={b} className="text-[7px] px-1 rounded" style={{ background: "rgba(255,255,255,0.08)", color: "#8a7060" }}>{b}</span>
                        ))}
                      </div>
                    )}
                    {m === "qris" && <span className="text-[8px]" style={{ color: "#4a3e36" }}>GoPay · OVO · Dana</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Card form */}
            {method === "card" && (
              <div className="flex flex-col gap-3">
                <FormInput label="Nomor Kartu" placeholder="0000 0000 0000 0000" value={cardNum} onChange={handleCardNum} maxLength={19} />
                <FormInput label="Nama Pemegang Kartu" placeholder="Nama sesuai kartu" value={cardName} onChange={setCardName} />
                <div className="grid grid-cols-2 gap-3">
                  <FormInput label="Masa Berlaku" placeholder="MM/YY" value={cardExpiry} onChange={handleExpiry} maxLength={5} />
                  <FormInput label="CVV" placeholder="•••" value={cardCvv} onChange={setCardCvv} type="password" maxLength={4} />
                </div>
                {!cardValid && cardNum.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle size={11} style={{ color: "#c0623a" }} />
                    <span className="text-[10px]" style={{ color: "#c0623a" }}>Lengkapi data kartu dengan benar</span>
                  </div>
                )}
              </div>
            )}

            {method === "qris" && <QrisCode accent={ACCENT} />}

            {/* Keamanan */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: "rgba(212,168,67,0.05)", border: "1px solid rgba(212,168,67,0.12)" }}>
              <ShieldCheck size={13} style={{ color: ACCENT2 }} />
              <p className="text-[10px]" style={{ color: "#8a7060" }}>Transaksi dienkripsi 256-bit SSL · Aman & terpercaya</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button type="button" onClick={handlePay}
              disabled={paying || (method === "card" && !cardValid)}
              className="w-full py-3.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-opacity"
              style={{
                background: paying ? "rgba(192,98,58,0.4)" : `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT2} 100%)`,
                color: "#1a1208",
                boxShadow: paying ? "none" : "0 6px 20px rgba(192,98,58,0.4)",
                opacity: method === "card" && !cardValid ? 0.5 : 1,
              }}>
              {paying ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-[#1a1208] border-t-transparent animate-spin" style={{ display: "inline-block" }} />
                  Memproses...
                </>
              ) : (
                <>
                  <Lock size={13} />
                  Bayar {formatIDR(grandTotalIDR)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── SUMMARY ── */
  if (step === "summary") {
    return (
      <div className="absolute left-4 top-4 bottom-4 z-[1100] w-[min(100%,26rem)] sm:w-[28rem] flex flex-col">
        <div className="flex flex-col h-full rounded-2xl overflow-hidden" style={panelShell}>
          {/* Hero */}
          <div className="relative h-32 flex-shrink-0">
            <HotelImage
              src={room?.image ?? listing.images[0]?.url ?? HOTEL_IMAGE_FALLBACK}
              fallback={HOTEL_IMAGE_FALLBACK}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,9,6,0.95) 0%, rgba(0,0,0,0.15) 100%)" }} />
            <div className="absolute top-3 left-3 right-3 flex justify-between">
              <button type="button" onClick={() => setStep("room")} className="p-2 rounded-full" style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={onClose} className="p-2 rounded-full" style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>
                <X size={15} />
              </button>
            </div>
            <div className="absolute bottom-2.5 left-4">
              <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: ACCENT }}>Ringkasan Pemesanan</p>
              <h2 className="text-[14px] font-bold" style={{ color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>{listing.title}</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
            {/* Detail kamar */}
            <div className="rounded-xl p-3" style={{ background: "rgba(192,98,58,0.07)", border: "1px solid rgba(192,98,58,0.18)" }}>
              <div className="flex items-start gap-3">
                <BedDouble size={18} style={{ color: ACCENT, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: "#e0d8cc" }}>{room?.name ?? listing.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#6b5e52" }}>{room?.beds} · {room?.size}</p>
                  {room?.features && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {room.features.map(f => (
                        <span key={f} className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "#8a7060" }}>{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tanggal & tamu */}
            <div className="flex flex-col gap-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#5a4e46" }}>Detail menginap</p>

              {/* Jumlah malam */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                  <Moon size={14} style={{ color: ACCENT }} />
                  <div>
                    <p className="text-[12px] font-medium" style={{ color: "#e0d8cc" }}>Jumlah malam</p>
                    <p className="text-[9px]" style={{ color: "#5a4e46" }}>€{pricePerNight} / malam</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setNights(n => Math.max(n - 1, 1))}
                    disabled={nights <= 1}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: nights <= 1 ? "rgba(255,255,255,0.04)" : "rgba(192,98,58,0.2)", color: nights <= 1 ? "#3a3228" : ACCENT, border: "1px solid rgba(192,98,58,0.2)" }}>
                    <Minus size={12} />
                  </button>
                  <span className="text-[14px] font-bold w-5 text-center" style={{ color: "#e8ddd0" }}>{nights}</span>
                  <button type="button" onClick={() => setNights(n => Math.min(n + 1, 30))}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(192,98,58,0.25)", color: ACCENT, border: "1px solid rgba(192,98,58,0.3)" }}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Jumlah tamu */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                  <Users size={14} style={{ color: ACCENT }} />
                  <div>
                    <p className="text-[12px] font-medium" style={{ color: "#e0d8cc" }}>Jumlah tamu</p>
                    <p className="text-[9px]" style={{ color: "#5a4e46" }}>Maks {listing.guests} tamu</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setGuests(g => Math.max(g - 1, 1))}
                    disabled={guests <= 1}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: guests <= 1 ? "rgba(255,255,255,0.04)" : "rgba(192,98,58,0.2)", color: guests <= 1 ? "#3a3228" : ACCENT, border: "1px solid rgba(192,98,58,0.2)" }}>
                    <Minus size={12} />
                  </button>
                  <span className="text-[14px] font-bold w-5 text-center" style={{ color: "#e8ddd0" }}>{guests}</span>
                  <button type="button" onClick={() => setGuests(g => Math.min(g + 1, listing.guests))}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(192,98,58,0.25)", color: ACCENT, border: "1px solid rgba(192,98,58,0.3)" }}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Check-in / check-out */}
            <div className="grid grid-cols-2 gap-2">
              {[["Check-in", listing.checkIn], ["Check-out", listing.checkOut]].map(([label, val]) => (
                <div key={label} className="px-3 py-2 rounded-xl flex items-center gap-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Calendar size={12} style={{ color: ACCENT, flexShrink: 0 }} />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: "#5a4e46" }}>{label}</p>
                    <p className="text-[12px] font-semibold" style={{ color: "#c8bfb2" }}>{val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rincian harga */}
            <div className="rounded-xl p-3 flex flex-col gap-2"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#5a4e46" }}>Rincian harga</p>
              <PriceRow label={`€${pricePerNight} × ${nights} malam`} euro={roomTotal} idr={roomTotal * EURO_TO_IDR} />
              <PriceRow label="Biaya pembersihan" euro={cleaningFee} idr={cleaningFee * EURO_TO_IDR} />
              <PriceRow label="Biaya layanan" euro={serviceFee} idr={serviceFee * EURO_TO_IDR} />
              <div className="flex justify-between pt-2 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="text-[12px] font-semibold" style={{ color: "#e0d8cc" }}>Total</span>
                <div className="text-right">
                  <p className="text-[14px] font-bold" style={{ color: ACCENT }}>{formatIDR(grandTotalIDR)}</p>
                  <p className="text-[9px]" style={{ color: "#5a4e46" }}>≈ €{grandTotalEuro}</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="text-[10px] flex flex-col gap-1" style={{ color: "#5a4e46" }}>
              <p>• Harga IDR berdasarkan kurs estimasi (1€ ≈ Rp17.500)</p>
              <p>• {listing.policies.cancellation}</p>
              <p>• Voucher dikirim via email setelah pembayaran berhasil</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => { if (user) setStep("payment"); else setShowLogin(true); }}
                className="w-full py-3.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT2} 100%)`, color: "#1a1208", boxShadow: "0 6px 20px rgba(192,98,58,0.4)" }}>
                <CreditCard size={15} />
                Lanjut ke Pembayaran — {formatIDR(grandTotalIDR)}
              </button>
              {!user && (
                <p className="text-center text-[10px] flex items-center justify-center gap-1" style={{ color: "#5a4e46" }}>
                  <LogIn size={10} /> Login untuk menyimpan pesanan ke akun
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── ROOM SELECTION ── */
  return (
    <div className="absolute left-4 top-4 bottom-4 z-[1100] w-[min(100%,26rem)] sm:w-[28rem] flex flex-col">
      <div className="flex flex-col h-full rounded-2xl overflow-hidden" style={panelShell}>
        {/* Hero */}
        <div className="relative h-36 flex-shrink-0">
          <HotelImage
            src={listing.images[0]?.url ?? HOTEL_IMAGE_FALLBACK}
            fallback={HOTEL_IMAGE_FALLBACK}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,9,6,0.95) 0%, rgba(0,0,0,0.2) 100%)" }} />
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            <button type="button" onClick={onBack} className="p-2 rounded-full" style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={onClose} className="p-2 rounded-full" style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>
              <X size={15} />
            </button>
          </div>
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: ACCENT }}>Pesan Kamar</p>
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold leading-tight" style={{ color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>
                {listing.title}
              </h2>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <Star size={10} fill={ACCENT2} style={{ color: ACCENT2 }} />
                <span className="text-[11px] font-bold" style={{ color: ACCENT2 }}>{listing.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#5a4e46" }}>
              Pilih tipe kamar ({listing.rooms.length} tersedia)
            </p>
            <div className="flex flex-col gap-3">
              {listing.rooms.map((room) => {
                const isSelected = selectedRoom?.name === room.name;
                return (
                  <button key={room.name} type="button" onClick={() => setSelectedRoom(room)}
                    className="text-left rounded-xl overflow-hidden w-full transition-all"
                    style={{
                      border: isSelected ? `1.5px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)",
                      background: isSelected ? "rgba(192,98,58,0.08)" : "rgba(255,255,255,0.02)",
                      transform: isSelected ? "scale(1.01)" : "scale(1)",
                    }}>
                    <HotelImage src={room.image ?? ""} fallback={HOTEL_IMAGE_FALLBACK} alt={room.name} className="w-full object-cover" style={{ height: "90px" }} />
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-[13px] font-semibold" style={{ color: isSelected ? "#e8ddd0" : "#c8bfb2" }}>{room.name}</p>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[14px] font-bold" style={{ color: ACCENT2 }}>€{room.pricePerNight}</p>
                          <p className="text-[9px]" style={{ color: "#5a4e46" }}>/malam</p>
                        </div>
                      </div>
                      <p className="text-[10px] mb-1.5" style={{ color: "#6b5e52" }}>{room.beds} · {room.size}</p>
                      <div className="flex flex-wrap gap-1">
                        {room.features.map(f => (
                          <span key={f} className="text-[8px] px-1.5 py-0.5 rounded"
                            style={{ background: isSelected ? "rgba(192,98,58,0.15)" : "rgba(255,255,255,0.05)", color: isSelected ? ACCENT : "#6b5e52" }}>
                            {f}
                          </span>
                        ))}
                      </div>
                      {isSelected && (
                        <div className="mt-2 flex items-center gap-1">
                          <CheckCircle2 size={12} style={{ color: ACCENT }} />
                          <span className="text-[10px] font-semibold" style={{ color: ACCENT }}>Dipilih</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {listing.instantBook && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.2)" }}>
              <Zap size={12} style={{ color: "#4caf50" }} />
              <p className="text-[10px]" style={{ color: "#6baf6b" }}>Instant Book — konfirmasi langsung tanpa perlu persetujuan host</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
          {!selectedRoom ? (
            <p className="text-center text-[11px]" style={{ color: "#5a4e46" }}>Pilih tipe kamar untuk melanjutkan</p>
          ) : (
            <button type="button" onClick={() => setStep("summary")}
              className="w-full py-3.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT2} 100%)`, color: "#1a1208", boxShadow: "0 6px 20px rgba(192,98,58,0.4)" }}>
              <BedDouble size={15} />
              Lanjut — {selectedRoom.name} · €{selectedRoom.pricePerNight}/malam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent, bold }: { label: string; value: string; accent: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-[11px]">
      <span style={{ color: "#8a7060" }}>{label}</span>
      <span className={bold ? "font-bold text-[13px]" : "font-medium"} style={{ color: bold ? accent : "#c8bfb2", textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

function PriceRow({ label, euro, idr }: { label: string; euro: number; idr: number }) {
  return (
    <div className="flex justify-between text-[11px]">
      <span style={{ color: "#8a7060" }}>{label}</span>
      <div className="text-right">
        <span style={{ color: "#c8bfb2" }}>€{euro}</span>
        <span className="ml-1.5 text-[9px]" style={{ color: "#5a4e46" }}>≈ {formatIDR(idr)}</span>
      </div>
    </div>
  );
}


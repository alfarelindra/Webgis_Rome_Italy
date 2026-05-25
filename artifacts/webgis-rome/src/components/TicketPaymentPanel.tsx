import { useState, useEffect, type ReactNode } from "react";
import {
  X,
  ChevronLeft,
  CreditCard,
  Smartphone,
  Plus,
  Minus,
  CheckCircle2,
  Lock,
  Users,
  Baby,
  ShieldCheck,
  AlertCircle,
  Ticket,
  LogIn,
} from "lucide-react";
import HotelImage from "@/components/HotelImage";
import { ATTRACTION_IMAGE_FALLBACK, type AttractionListing } from "@/lib/attractionListings";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";

interface TicketPaymentPanelProps {
  listing: AttractionListing;
  onClose: () => void;
  onBack: () => void;
}

type PaymentMethod = "card" | "qris";
type PaymentStep = "summary" | "payment" | "success";

const EURO_TO_IDR = 17_500;

function parseEuroPrice(fee: string): number | null {
  const match = fee.match(/€([\d,.]+)/);
  if (!match) return null;
  return parseFloat(match[1].replace(",", "."));
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

function formatEuro(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

/* ── Shared input style ── */
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
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(76,175,125,0.6)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
      />
    </div>
  );
}

function TicketCounter({
  icon,
  label,
  sub,
  count,
  onInc,
  onDec,
  pricePerTicket,
}: {
  icon: ReactNode;
  label: string;
  sub: string;
  count: number;
  onInc: () => void;
  onDec: () => void;
  pricePerTicket: number | null;
}) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2.5 rounded-xl"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2.5">
        <span style={{ color: "#4caf7d" }}>{icon}</span>
        <div>
          <p className="text-[12px] font-medium" style={{ color: "#e0d8cc" }}>{label}</p>
          <p className="text-[10px]" style={{ color: "#6b5e52" }}>
            {pricePerTicket !== null ? formatEuro(pricePerTicket) : "Gratis"} / orang
          </p>
          <p className="text-[9px]" style={{ color: "#4a3e36" }}>{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDec}
          disabled={count === 0}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity"
          style={{
            background: count === 0 ? "rgba(255,255,255,0.04)" : "rgba(76,175,125,0.2)",
            color: count === 0 ? "#3a3228" : "#4caf7d",
            border: "1px solid rgba(76,175,125,0.2)",
          }}
        >
          <Minus size={12} />
        </button>
        <span className="text-[14px] font-bold w-5 text-center" style={{ color: "#e8ddd0" }}>{count}</span>
        <button
          type="button"
          onClick={onInc}
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "rgba(76,175,125,0.25)", color: "#4caf7d", border: "1px solid rgba(76,175,125,0.3)" }}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── QRIS placeholder SVG ── */
function QrisCode() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div
        className="p-3 rounded-2xl"
        style={{ background: "#fff", border: "3px solid #4caf7d" }}
      >
        {/* Simple QR-like SVG pattern */}
        <svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
          {/* finder patterns */}
          <rect x="10" y="10" width="42" height="42" rx="4" fill="#111" />
          <rect x="16" y="16" width="30" height="30" rx="2" fill="#fff" />
          <rect x="22" y="22" width="18" height="18" rx="1" fill="#111" />

          <rect x="108" y="10" width="42" height="42" rx="4" fill="#111" />
          <rect x="114" y="16" width="30" height="30" rx="2" fill="#fff" />
          <rect x="120" y="22" width="18" height="18" rx="1" fill="#111" />

          <rect x="10" y="108" width="42" height="42" rx="4" fill="#111" />
          <rect x="16" y="114" width="30" height="30" rx="2" fill="#fff" />
          <rect x="22" y="120" width="18" height="18" rx="1" fill="#111" />

          {/* data pattern dots */}
          {[60,68,76,84,92,100].map((x) =>
            [10,18,26,34,42,50,58,66,74,82,90,98,106,114,122,130,138].map((y) =>
              Math.random() > 0.5 ? <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1" fill="#111" /> : null
            )
          )}
          {[10,18,26,34,42,50,58,66,74,82,90,98,106,114,122,130,138].map((x) =>
            [60,68,76,84,92,100,108,116,124,132,140].map((y) =>
              Math.random() > 0.5 ? <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1" fill="#111" /> : null
            )
          )}

          {/* center logo area */}
          <rect x="62" y="62" width="36" height="36" rx="4" fill="#fff" />
          <text x="80" y="85" textAnchor="middle" fontSize="18" fill="#4caf7d" fontWeight="bold">Q</text>
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[12px] font-semibold" style={{ color: "#e0d8cc" }}>Scan dengan aplikasi e-wallet</p>
        <p className="text-[10px] mt-0.5" style={{ color: "#6b5e52" }}>
          GoPay · OVO · Dana · BCA · Mandiri · dan lainnya
        </p>
      </div>
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ background: "rgba(76,175,125,0.1)", border: "1px solid rgba(76,175,125,0.25)" }}
      >
        <ShieldCheck size={11} style={{ color: "#4caf7d" }} />
        <span className="text-[10px]" style={{ color: "#4caf7d" }}>Kode berlaku 10 menit</span>
      </div>
    </div>
  );
}

export default function TicketPaymentPanel({ listing, onClose, onBack }: TicketPaymentPanelProps) {
  const { user, addOrder } = useAuth();
  const [step, setStep] = useState<PaymentStep>("summary");
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [showLogin, setShowLogin] = useState(false);

  /* Card form */
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [paying, setPaying] = useState(false);
  const [successTimer, setSuccessTimer] = useState(3);

  const baseEuro = parseEuroPrice(listing.entryFee);
  const childDiscount = 0.5;
  const adultPrice = baseEuro ?? 0;
  const childPrice = baseEuro !== null ? baseEuro * childDiscount : 0;

  const totalEuro = adultPrice * adults + childPrice * children;
  const totalIDR = totalEuro * EURO_TO_IDR;

  const canCheckout = adults + children > 0;

  /* Card number formatting */
  const handleCardNum = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    setCardNum(digits.replace(/(.{4})/g, "$1 ").trim());
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
      // Simpan order ke akun jika user login
      if (user) {
        addOrder({
          type: "ticket",
          title: listing.title,
          detail: `${adults} Dewasa${children > 0 ? ` + ${children} Anak` : ""}`,
          totalIDR: totalIDR,
          totalEuro: totalEuro,
          method,
        });
      }
      setStep("success");
    }, 2000);
  };

  /* success countdown */
  useEffect(() => {
    if (step !== "success") return;
    const t = setInterval(() => setSuccessTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [step]);

  useEffect(() => {
    if (successTimer <= 0) onClose();
  }, [successTimer, onClose]);

  const panelShell: React.CSSProperties = {
    background: "rgba(12, 9, 6, 0.97)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(76,175,125,0.2)",
    boxShadow: "0 16px 60px rgba(0,0,0,0.8)",
  };

  /* Login modal sebelum pembayaran */
  if (showLogin) {
    return (
      <LoginModal
        reason="untuk menyimpan tiket ke akun Anda"
        onClose={() => setShowLogin(false)}
        onSuccess={() => { setShowLogin(false); setStep("payment"); }}
      />
    );
  }

  /* ── SUCCESS ── */
  if (step === "success") {
    return (
      <div className="absolute left-4 top-4 bottom-4 z-[1100] w-[min(100%,26rem)] sm:w-[28rem] flex flex-col">
        <div className="flex flex-col h-full rounded-2xl overflow-hidden items-center justify-center gap-6 px-6" style={panelShell}>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(76,175,125,0.15)", border: "2px solid #4caf7d" }}
          >
            <CheckCircle2 size={40} style={{ color: "#4caf7d" }} />
          </div>
          <div className="text-center">
            <h2 className="text-[18px] font-bold" style={{ color: "#e8ddd0" }}>Pembayaran Berhasil!</h2>
            <p className="text-[12px] mt-1" style={{ color: "#6b5e52" }}>Tiket telah dikirim ke email Anda</p>
          </div>

          <div
            className="w-full rounded-xl p-4 flex flex-col gap-2"
            style={{ background: "rgba(76,175,125,0.07)", border: "1px solid rgba(76,175,125,0.2)" }}
          >
            <div className="flex justify-between text-[12px]">
              <span style={{ color: "#8a7060" }}>Destinasi</span>
              <span className="font-medium text-right max-w-[60%]" style={{ color: "#e0d8cc" }}>{listing.title}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span style={{ color: "#8a7060" }}>Tiket</span>
              <span style={{ color: "#e0d8cc" }}>{adults} Dewasa {children > 0 ? `+ ${children} Anak` : ""}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span style={{ color: "#8a7060" }}>Total</span>
              <span className="font-bold" style={{ color: "#4caf7d" }}>{formatIDR(totalIDR)}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span style={{ color: "#8a7060" }}>Metode</span>
              <span style={{ color: "#e0d8cc" }}>{method === "card" ? "Kartu Kredit/Debit" : "QRIS"}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Ticket size={13} style={{ color: "#d4a843" }} />
            <p className="text-[11px]" style={{ color: "#d4a843" }}>
              E-tiket dikirim dalam 5 menit
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl text-[13px] font-semibold"
            style={{ background: "linear-gradient(135deg, #4caf7d, #2e7d52)", color: "#f0fff4" }}
          >
            Selesai ({successTimer}s)
          </button>
        </div>
      </div>
    );
  }

  /* ── PAYMENT FORM ── */
  if (step === "payment") {
    return (
      <div className="absolute left-4 top-4 bottom-4 z-[1100] w-[min(100%,26rem)] sm:w-[28rem] flex flex-col">
        <div className="flex flex-col h-full rounded-2xl overflow-hidden" style={panelShell}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button type="button" onClick={() => setStep("summary")} className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "#8a7060" }}>
              <ChevronLeft size={16} />
            </button>
            <div className="flex-1">
              <h2 className="text-[14px] font-semibold" style={{ color: "#e8ddd0" }}>Metode Pembayaran</h2>
              <p className="text-[10px]" style={{ color: "#6b5e52" }}>Pilih cara bayar Anda</p>
            </div>
            <Lock size={13} style={{ color: "#4caf7d" }} />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">

            {/* Total ringkas */}
            <div
              className="flex items-center justify-between px-3 py-2 rounded-xl"
              style={{ background: "rgba(76,175,125,0.08)", border: "1px solid rgba(76,175,125,0.18)" }}
            >
              <span className="text-[11px]" style={{ color: "#8aaa90" }}>
                {adults} Dewasa {children > 0 ? `+ ${children} Anak` : ""}
              </span>
              <div className="text-right">
                <p className="text-[13px] font-bold" style={{ color: "#4caf7d" }}>{formatIDR(totalIDR)}</p>
                <p className="text-[9px]" style={{ color: "#5a6e5a" }}>≈ {formatEuro(totalEuro)}</p>
              </div>
            </div>

            {/* Pilih metode */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5a4e46" }}>Pilih metode</p>
              <div className="grid grid-cols-2 gap-2">
                {(["card", "qris"] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className="flex flex-col items-center gap-2 py-3 rounded-xl transition-all"
                    style={{
                      background: method === m ? "rgba(76,175,125,0.15)" : "rgba(255,255,255,0.03)",
                      border: method === m ? "1.5px solid rgba(76,175,125,0.55)" : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {m === "card"
                      ? <CreditCard size={22} style={{ color: method === m ? "#4caf7d" : "#5a4e46" }} />
                      : <Smartphone size={22} style={{ color: method === m ? "#4caf7d" : "#5a4e46" }} />
                    }
                    <span className="text-[10px] font-medium" style={{ color: method === m ? "#4caf7d" : "#6b5e52" }}>
                      {m === "card" ? "Kartu Kredit/Debit" : "QRIS"}
                    </span>
                    {m === "card" && (
                      <div className="flex gap-1">
                        {["VISA","MC","JCB"].map(b => (
                          <span key={b} className="text-[7px] px-1 rounded" style={{ background: "rgba(255,255,255,0.08)", color: "#8a7060" }}>{b}</span>
                        ))}
                      </div>
                    )}
                    {m === "qris" && (
                      <span className="text-[8px]" style={{ color: "#4a3e36" }}>GoPay · OVO · Dana</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Form kartu */}
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

            {/* QRIS */}
            {method === "qris" && <QrisCode />}

            {/* Keamanan */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(212,168,67,0.05)", border: "1px solid rgba(212,168,67,0.12)" }}>
              <ShieldCheck size={13} style={{ color: "#d4a843" }} />
              <p className="text-[10px]" style={{ color: "#8a7060" }}>Transaksi dienkripsi 256-bit SSL · Aman & terpercaya</p>
            </div>
          </div>

          {/* Footer bayar */}
          <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              type="button"
              onClick={handlePay}
              disabled={paying || (method === "card" && !cardValid) || (method === "qris" && false)}
              className="w-full py-3.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-opacity"
              style={{
                background: paying ? "rgba(76,175,125,0.4)" : "linear-gradient(135deg, #4caf7d 0%, #2e7d52 100%)",
                color: "#f0fff4",
                boxShadow: paying ? "none" : "0 6px 20px rgba(76,175,125,0.4)",
                opacity: method === "card" && !cardValid ? 0.5 : 1,
              }}
            >
              {paying ? (
                <>
                  <span
                    className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                    style={{ display: "inline-block" }}
                  />
                  Memproses...
                </>
              ) : (
                <>
                  <Lock size={13} />
                  Bayar {formatIDR(totalIDR)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── SUMMARY (default step) ── */
  return (
    <div className="absolute left-4 top-4 bottom-4 z-[1100] w-[min(100%,26rem)] sm:w-[28rem] flex flex-col">
      <div className="flex flex-col h-full rounded-2xl overflow-hidden" style={panelShell}>

        {/* ── Hero image header ── */}
        <div className="relative h-36 flex-shrink-0">
          <HotelImage
            src={listing.images[0]?.url ?? ATTRACTION_IMAGE_FALLBACK}
            fallback={ATTRACTION_IMAGE_FALLBACK}
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
          <div className="absolute bottom-3 left-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#4caf7d" }}>Beli Tiket</p>
            <h2 className="text-[15px] font-bold leading-tight" style={{ color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>
              {listing.title}
            </h2>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

          {/* Harga referensi */}
          <div
            className="rounded-xl px-3 py-3 flex items-center gap-3"
            style={{ background: "rgba(76,175,125,0.07)", border: "1px solid rgba(76,175,125,0.18)" }}
          >
            <Ticket size={20} style={{ color: "#4caf7d" }} />
            <div>
              <p className="text-[10px]" style={{ color: "#6b5e52" }}>Harga resmi</p>
              <p className="text-[13px] font-semibold" style={{ color: "#e0d8cc" }}>{listing.entryFee}</p>
            </div>
          </div>

          {/* Pilih jumlah tiket */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5a4e46" }}>Pilih jumlah tiket</p>
            <div className="flex flex-col gap-2">
              <TicketCounter
                icon={<Users size={15} />}
                label="Dewasa"
                sub="Usia 18+"
                count={adults}
                pricePerTicket={adultPrice}
                onInc={() => setAdults((n) => Math.min(n + 1, 10))}
                onDec={() => setAdults((n) => Math.max(n - 1, 0))}
              />
              <TicketCounter
                icon={<Baby size={15} />}
                label="Anak-anak"
                sub="Usia 6–17 · Diskon 50%"
                count={children}
                pricePerTicket={baseEuro !== null ? childPrice : null}
                onInc={() => setChildren((n) => Math.min(n + 1, 10))}
                onDec={() => setChildren((n) => Math.max(n - 1, 0))}
              />
            </div>
          </div>

          {/* Breakdown harga */}
          {canCheckout && (
            <div
              className="rounded-xl p-3 flex flex-col gap-2"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#5a4e46" }}>Rincian harga</p>
              {adults > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span style={{ color: "#8a7060" }}>{adults}x Dewasa</span>
                  <div className="text-right">
                    <span style={{ color: "#c8bfb2" }}>{formatEuro(adultPrice * adults)}</span>
                    <span className="ml-1.5 text-[9px]" style={{ color: "#5a4e46" }}>≈ {formatIDR(adultPrice * adults * EURO_TO_IDR)}</span>
                  </div>
                </div>
              )}
              {children > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span style={{ color: "#8a7060" }}>{children}x Anak</span>
                  <div className="text-right">
                    <span style={{ color: "#c8bfb2" }}>{formatEuro(childPrice * children)}</span>
                    <span className="ml-1.5 text-[9px]" style={{ color: "#5a4e46" }}>≈ {formatIDR(childPrice * children * EURO_TO_IDR)}</span>
                  </div>
                </div>
              )}
              <div
                className="flex justify-between pt-2 mt-1"
                style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
              >
                <span className="text-[12px] font-semibold" style={{ color: "#e0d8cc" }}>Total</span>
                <div className="text-right">
                  <p className="text-[14px] font-bold" style={{ color: "#4caf7d" }}>{formatIDR(totalIDR)}</p>
                  <p className="text-[9px]" style={{ color: "#5a6e5a" }}>≈ {formatEuro(totalEuro)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Keterangan */}
          <div className="flex flex-col gap-1.5 text-[10px]" style={{ color: "#5a4e46" }}>
            <p>• Harga dalam IDR berdasarkan kurs estimasi (1€ ≈ Rp17.500)</p>
            <p>• Tiket dikirim via email setelah pembayaran berhasil</p>
            <p>• Tidak dapat dikembalikan dalam 24 jam sebelum kunjungan</p>
          </div>
        </div>

        {/* ── Footer checkout ── */}
        <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
          {!canCheckout ? (
            <p className="text-center text-[11px]" style={{ color: "#5a4e46" }}>Pilih minimal 1 tiket untuk melanjutkan</p>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => { if (user) setStep("payment"); else setShowLogin(true); }}
                className="w-full py-3.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #4caf7d 0%, #2e7d52 100%)",
                  color: "#f0fff4",
                  boxShadow: "0 6px 20px rgba(76,175,125,0.4)",
                }}
              >
                <CreditCard size={15} />
                Lanjut ke Pembayaran — {formatIDR(totalIDR)}
              </button>
              {!user && (
                <p className="text-center text-[10px] flex items-center justify-center gap-1" style={{ color: "#5a4e46" }}>
                  <LogIn size={10} /> Login untuk menyimpan tiket ke akun
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

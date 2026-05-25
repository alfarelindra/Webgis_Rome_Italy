import { useEffect, useState } from "react";
import {
  X, Ticket, BedDouble, CheckCircle2, Clock, CreditCard,
  Smartphone, MapPin, Calendar, Users, Moon, QrCode, Download, Share2,
  AlertTriangle,
} from "lucide-react";
import type { Order } from "@/context/AuthContext";

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const EURO_TO_IDR = 17_500;

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}
function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString("id-ID", opts ?? {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

/* SVG QR pattern yang deterministik berdasarkan bookingCode */
function QRPattern({ code, accent }: { code: string; accent: string }) {
  const seed = code.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (i: number) => ((seed * (i + 1) * 2654435761) >>> 0) % 100;

  return (
    <div className="p-2.5 rounded-xl" style={{ background: "#fff", border: `3px solid ${accent}` }}>
      <svg width="130" height="130" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
        {/* Finder patterns */}
        <rect x="4" y="4" width="34" height="34" rx="3" fill="#111" />
        <rect x="8" y="8" width="26" height="26" rx="2" fill="#fff" />
        <rect x="12" y="12" width="18" height="18" rx="1" fill="#111" />

        <rect x="92" y="4" width="34" height="34" rx="3" fill="#111" />
        <rect x="96" y="8" width="26" height="26" rx="2" fill="#fff" />
        <rect x="100" y="12" width="18" height="18" rx="1" fill="#111" />

        <rect x="4" y="92" width="34" height="34" rx="3" fill="#111" />
        <rect x="8" y="96" width="26" height="26" rx="2" fill="#fff" />
        <rect x="12" y="100" width="18" height="18" rx="1" fill="#111" />

        {/* Data dots */}
        {Array.from({ length: 12 }, (_, row) =>
          Array.from({ length: 12 }, (_, col) => {
            const x = 44 + col * 8;
            const y = 4 + row * 8;
            if (x > 120 || y > 120) return null;
            const skip = (x < 40 && y < 40) || (x > 90 && y < 40) || (x < 40 && y > 90);
            if (skip) return null;
            return rng(row * 12 + col) > 45 ? (
              <rect key={`${row}-${col}`} x={x} y={y} width="6" height="6" rx="1" fill="#111" />
            ) : null;
          })
        )}
        {/* Center logo */}
        <rect x="50" y="50" width="30" height="30" rx="4" fill="#fff" stroke={accent} strokeWidth="2" />
        <text x="65" y="70" textAnchor="middle" fontSize="14" fill={accent} fontWeight="bold">✈</text>
      </svg>
    </div>
  );
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const isTicket = order.type === "ticket";
  const isExpired = order.status === "expired";
  const ACCENT = isTicket ? "#4caf7d" : "#c0623a";
  const ACCENT2 = isTicket ? "#2e7d52" : "#d4a843";

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(order.bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Prevent scroll behind modal */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-xs rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "rgba(10,7,4,0.98)",
          border: `1px solid ${isExpired ? "rgba(90,78,70,0.4)" : `rgba(${isTicket ? "76,175,125" : "192,98,58"},0.35)`}`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(${isTicket ? "76,175,125" : "192,98,58"},0.1)`,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="relative px-5 py-4 text-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, rgba(${isTicket ? "76,175,125" : "192,98,58"},0.12), rgba(${isTicket ? "46,125,82" : "212,168,67"},0.06))`, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button type="button" onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.06)", color: "#6b5e52" }}>
            <X size={13} />
          </button>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl mx-auto mb-2 flex items-center justify-center"
            style={{ background: `rgba(${isTicket ? "76,175,125" : "192,98,58"},0.15)`, border: `1.5px solid rgba(${isTicket ? "76,175,125" : "192,98,58"},0.35)` }}>
            {isTicket
              ? <Ticket size={26} style={{ color: ACCENT }} />
              : <BedDouble size={26} style={{ color: ACCENT }} />
            }
          </div>
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: ACCENT }}>
            {isTicket ? "E-Tiket Wisata" : "Bukti Pemesanan Hotel"}
          </p>
          <h2 className="text-[15px] font-bold leading-tight" style={{ color: "#e8ddd0" }}>{order.title}</h2>
          {order.subtitle && <p className="text-[11px] mt-0.5" style={{ color: "#6b5e52" }}>{order.subtitle}</p>}

          {/* Status badge */}
          <div className="flex justify-center mt-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold"
              style={{
                background: isExpired ? "rgba(90,78,70,0.3)" : "rgba(76,175,80,0.12)",
                color: isExpired ? "#8a7060" : "#4caf7d",
                border: `1px solid ${isExpired ? "rgba(90,78,70,0.4)" : "rgba(76,175,80,0.3)"}`,
              }}>
              {isExpired ? <AlertTriangle size={9} /> : <CheckCircle2 size={9} />}
              {isExpired ? "Kadaluarsa" : "Terkonfirmasi"}
            </span>
          </div>
        </div>

        {/* Booking code + QR */}
        <div className="px-5 py-4 flex flex-col items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <QRPattern code={order.bookingCode} accent={isExpired ? "#5a4e46" : ACCENT} />
          {/* Booking code */}
          <button type="button" onClick={handleCopy}
            className="flex flex-col items-center gap-0.5 transition-opacity"
            title="Klik untuk salin kode">
            <p className="text-[9px] uppercase tracking-widest" style={{ color: "#5a4e46" }}>Kode Booking</p>
            <p className="text-[20px] font-mono font-black tracking-widest" style={{ color: isExpired ? "#5a4e46" : ACCENT }}>
              {order.bookingCode}
            </p>
            <p className="text-[9px]" style={{ color: copied ? "#4caf7d" : "#4a3e36" }}>
              {copied ? "✓ Disalin!" : "Ketuk untuk salin"}
            </p>
          </button>
        </div>

        {/* Detail info */}
        <div className="px-5 py-4 flex flex-col gap-2.5">
          {/* Tanggal pembelian */}
          <DetailRow
            icon={<Clock size={12} />}
            label="Dibeli"
            value={formatDateTime(order.date)}
            accent={ACCENT}
          />

          {/* Tanggal kunjungan/visitDate */}
          {order.visitDate && (
            <DetailRow
              icon={<Calendar size={12} />}
              label={isTicket ? "Tanggal Kunjungan" : "Check-in"}
              value={formatDate(order.visitDate)}
              accent={ACCENT}
            />
          )}

          {/* Detail tiket */}
          <DetailRow
            icon={isTicket ? <Users size={12} /> : <Moon size={12} />}
            label={isTicket ? "Tiket" : "Menginap"}
            value={order.detail}
            accent={ACCENT}
          />

          {/* Metode bayar */}
          <DetailRow
            icon={order.method === "card" ? <CreditCard size={12} /> : <Smartphone size={12} />}
            label="Pembayaran"
            value={order.method === "card" ? "Kartu Kredit / Debit" : "QRIS"}
            accent={ACCENT}
          />

          {/* Harga */}
          <div className="flex justify-between items-center pt-2 mt-1"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-[11px]" style={{ color: "#6b5e52" }}>Total Dibayar</span>
            <div className="text-right">
              <p className="text-[16px] font-black" style={{ color: isExpired ? "#6b5e52" : ACCENT }}>{formatIDR(order.totalIDR)}</p>
              <p className="text-[9px]" style={{ color: "#4a3e36" }}>≈ €{order.totalEuro}</p>
            </div>
          </div>
        </div>

        {/* Expired warning */}
        {isExpired && (
          <div className="mx-5 mb-4 px-3 py-2 rounded-xl flex items-center gap-2"
            style={{ background: "rgba(90,78,70,0.15)", border: "1px solid rgba(90,78,70,0.3)" }}>
            <AlertTriangle size={12} style={{ color: "#8a7060", flexShrink: 0 }} />
            <p className="text-[10px]" style={{ color: "#8a7060" }}>
              Tiket/pemesanan ini telah kadaluarsa dan tidak dapat digunakan.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col gap-2 flex-shrink-0">
          <button type="button" onClick={handleCopy}
            className="w-full py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2"
            style={{
              background: isExpired ? "rgba(255,255,255,0.04)" : `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT2} 100%)`,
              color: isExpired ? "#6b5e52" : (isTicket ? "#f0fff4" : "#1a1208"),
              boxShadow: isExpired ? "none" : `0 4px 16px rgba(${isTicket ? "76,175,125" : "192,98,58"},0.35)`,
            }}>
            <Download size={13} />
            Simpan sebagai Gambar
          </button>
          <button type="button" onClick={() => navigator.share?.({ title: "Tiket WebGIS Roma", text: `Kode: ${order.bookingCode}` })}
            className="w-full py-2.5 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2"
            style={{ background: "rgba(255,255,255,0.04)", color: "#6b5e52", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Share2 size={12} />
            Bagikan
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex-shrink-0" style={{ color: accent }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] uppercase tracking-wider" style={{ color: "#4a3e46" }}>{label}</p>
        <p className="text-[12px] font-medium" style={{ color: "#c8bfb2" }}>{value}</p>
      </div>
    </div>
  );
}

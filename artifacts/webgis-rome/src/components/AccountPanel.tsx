import { useState, type FormEvent } from "react";
import {
  X, Ticket, BedDouble, LogOut, Edit3, Save, CheckCircle2,
  Clock, CreditCard, Smartphone, User, Phone, Mail,
  AlertTriangle, ChevronRight, Calendar,
} from "lucide-react";
import { useAuth, type Order } from "@/context/AuthContext";
import OrderDetailModal from "@/components/OrderDetailModal";

interface AccountPanelProps {
  onClose: () => void;
}

const panelShell: React.CSSProperties = {
  background: "rgba(10,7,4,0.97)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(192,98,58,0.22)",
  boxShadow: "0 16px 60px rgba(0,0,0,0.85)",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "#e8ddd0",
  padding: "8px 12px",
  fontSize: "12px",
  width: "100%",
  outline: "none",
};

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const isTicket = order.type === "ticket";
  const isExpired = order.status === "expired";
  const accent = isExpired ? "#5a4e46" : (isTicket ? "#4caf7d" : "#c0623a");

  return (
    <button type="button" onClick={onClick}
      className="text-left w-full rounded-xl p-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
      style={{
        background: isExpired ? "rgba(255,255,255,0.02)" : (isTicket ? "rgba(76,175,125,0.05)" : "rgba(192,98,58,0.05)"),
        border: `1px solid ${isExpired ? "rgba(90,78,70,0.2)" : `rgba(${isTicket ? "76,175,125" : "192,98,58"},0.15)`}`,
      }}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `rgba(${isExpired ? "90,78,70" : isTicket ? "76,175,125" : "192,98,58"},0.12)` }}>
          {isTicket
            ? <Ticket size={16} style={{ color: accent }} />
            : <BedDouble size={16} style={{ color: accent }} />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1.5">
            <p className="text-[12px] font-semibold leading-tight line-clamp-1" style={{ color: isExpired ? "#6b5e52" : "#e0d8cc" }}>
              {order.title}
            </p>
            <ChevronRight size={12} className="flex-shrink-0 mt-0.5" style={{ color: "#4a3e36" }} />
          </div>
          <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: "#5a4e46" }}>{order.detail}</p>

          <div className="flex items-center justify-between mt-2">
            {/* Date + status */}
            <div className="flex items-center gap-1.5">
              <span className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full ${isExpired ? "" : ""}`}
                style={{
                  background: isExpired ? "rgba(90,78,70,0.2)" : "rgba(76,175,80,0.1)",
                  color: isExpired ? "#6b5e52" : "#4caf7d",
                  border: `1px solid ${isExpired ? "rgba(90,78,70,0.3)" : "rgba(76,175,80,0.2)"}`,
                }}>
                {isExpired ? <AlertTriangle size={7} /> : <CheckCircle2 size={7} />}
                {isExpired ? "Kadaluarsa" : "Aktif"}
              </span>
            </div>
            {/* Total */}
            <div className="flex items-center gap-1">
              {order.method === "card"
                ? <CreditCard size={9} style={{ color: "#4a3e36" }} />
                : <Smartphone size={9} style={{ color: "#4a3e36" }} />
              }
              <span className="text-[11px] font-bold" style={{ color: accent }}>{formatIDR(order.totalIDR)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-1">
            <Clock size={8} style={{ color: "#3a3228" }} />
            <span className="text-[9px]" style={{ color: "#3a3228" }}>{formatDateTime(order.date)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function AccountPanel({ onClose }: AccountPanelProps) {
  const { user, orders, logout, updateUser } = useAuth();
  const [tab, setTab] = useState<"all" | "ticket" | "hotel">("all");
  const [editMode, setEditMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /* Edit form state */
  const [editName, setEditName] = useState(user?.name ?? "");
  const [editPhone, setEditPhone] = useState(user?.phone ?? "");
  const [editBio, setEditBio] = useState(user?.bio ?? "");
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await updateUser({ name: editName.trim(), phone: editPhone.trim(), bio: editBio.trim() });
      setEditMode(false);
      setSaveMsg("Profil berhasil diperbarui!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = tab === "all" ? orders
    : orders.filter((o) => o.type === (tab === "ticket" ? "ticket" : "hotel"));

  const ticketCount = orders.filter((o) => o.type === "ticket").length;
  const hotelCount = orders.filter((o) => o.type === "hotel").length;
  const activeCount = orders.filter((o) => o.status === "confirmed").length;
  const expiredCount = orders.filter((o) => o.status === "expired").length;
  const totalSpent = orders.reduce((s, o) => s + o.totalIDR, 0);

  const avatarLetter = user.name.charAt(0).toUpperCase();

  return (
    <>
      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      <div className="absolute left-4 top-4 bottom-4 z-[1200] w-[min(100%,22rem)] sm:w-80 flex flex-col slide-in-left"
        data-testid="account-panel">
        <div className="flex flex-col h-full rounded-xl overflow-hidden" style={panelShell}>

          {/* ── Header ── */}
          <div className="px-4 pt-4 pb-3 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(192,98,58,0.03)" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold" style={{ color: "#e8ddd0" }}>Akun Saya</h2>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => { setEditMode((v) => !v); setEditName(user.name); setEditPhone(user.phone ?? ""); setEditBio(user.bio ?? ""); }}
                  className="p-1.5 rounded-lg flex items-center gap-1 text-[10px]"
                  style={{ background: editMode ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.05)", color: editMode ? "#d4a843" : "#6b5e52", border: editMode ? "1px solid rgba(212,168,67,0.3)" : "1px solid transparent" }}
                  title={editMode ? "Batal edit" : "Edit profil"}>
                  <Edit3 size={11} />
                  {editMode ? "Batal" : "Edit"}
                </button>
                <button type="button"
                  onClick={async () => { await logout(); onClose(); }}
                  className="p-1.5 rounded-lg flex items-center gap-1 text-[10px]"
                  style={{ background: "rgba(192,98,58,0.1)", color: "#c0623a", border: "1px solid rgba(192,98,58,0.2)" }}>
                  <LogOut size={11} />
                  Keluar
                </button>
                <button type="button" onClick={onClose}
                  className="p-1.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#6b5e52" }}>
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Avatar + info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#c0623a,#d4a843)", color: "#1a1208", boxShadow: "0 4px 12px rgba(192,98,58,0.35)" }}>
                {avatarLetter}
              </div>
              <div className="flex-1 min-w-0">
                {editMode ? (
                  <p className="text-[11px]" style={{ color: "#6b5e52" }}>Mode Edit Profil</p>
                ) : (
                  <>
                    <p className="text-[14px] font-semibold truncate" style={{ color: "#e0d8cc" }}>{user.name}</p>
                    <p className="text-[11px] truncate" style={{ color: "#6b5e52" }}>{user.email}</p>
                    {user.phone && <p className="text-[10px]" style={{ color: "#5a4e46" }}>{user.phone}</p>}
                    {user.bio && <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: "#4a3e36" }}>{user.bio}</p>}
                    {user.joinDate && (
                      <p className="text-[9px] mt-0.5" style={{ color: "#3a3228" }}>
                        Bergabung {new Date(user.joinDate).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ── Edit form ── */}
            {editMode && (
              <form onSubmit={handleSave} className="mt-3 flex flex-col gap-2">
                <div>
                  <label className="text-[9px] uppercase tracking-wider" style={{ color: "#5a4e46" }}>Nama</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)}
                    style={inputStyle} placeholder="Nama lengkap"
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,168,67,0.5)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider" style={{ color: "#5a4e46" }}>No. HP</label>
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                    style={inputStyle} placeholder="+62..." type="tel"
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,168,67,0.5)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider" style={{ color: "#5a4e46" }}>Bio</label>
                  <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)}
                    rows={2} style={{ ...inputStyle, resize: "none" }} placeholder="Ceritakan sedikit tentang diri Anda..."
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,168,67,0.5)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} />
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5"
                  style={{ background: saving ? "rgba(192,98,58,0.4)" : "linear-gradient(135deg,#c0623a,#d4a843)", color: "#1a1208", opacity: saving ? 0.7 : 1 }}>
                  {saving
                    ? <><span className="w-3 h-3 rounded-full border-2 border-[#1a1208] border-t-transparent animate-spin inline-block" />Menyimpan...</>
                    : <><Save size={12} /> Simpan Perubahan</>
                  }
                </button>
                {saveError && (
                  <p className="text-[10px] text-center" style={{ color: "#c0623a" }}>{saveError}</p>
                )}
              </form>
            )}

            {saveMsg && (
              <div className="mt-2 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                style={{ background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.2)" }}>
                <CheckCircle2 size={11} style={{ color: "#4caf7d" }} />
                <p className="text-[10px]" style={{ color: "#4caf7d" }}>{saveMsg}</p>
              </div>
            )}

            {/* Stats */}
            {!editMode && (
              <div className="grid grid-cols-4 gap-1.5 mt-3">
                {[
                  { label: "Tiket", value: ticketCount, color: "#4caf7d" },
                  { label: "Hotel", value: hotelCount, color: "#c0623a" },
                  { label: "Aktif", value: activeCount, color: "#d4a843" },
                  { label: "Lewat", value: expiredCount, color: "#5a4e46" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-[13px] font-bold" style={{ color }}>{value}</p>
                    <p className="text-[8px]" style={{ color: "#4a3e36" }}>{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Tab filter ── */}
          {!editMode && (
            <>
              <div className="flex gap-1 px-3 py-2 flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {(["all", "ticket", "hotel"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setTab(t)}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all"
                    style={{
                      background: tab === t
                        ? t === "ticket" ? "rgba(76,175,125,0.18)" : t === "hotel" ? "rgba(192,98,58,0.18)" : "rgba(212,168,67,0.12)"
                        : "rgba(255,255,255,0.03)",
                      color: tab === t
                        ? t === "ticket" ? "#4caf7d" : t === "hotel" ? "#c0623a" : "#d4a843"
                        : "#5a4e46",
                      border: tab === t
                        ? `1px solid ${t === "ticket" ? "rgba(76,175,125,0.3)" : t === "hotel" ? "rgba(192,98,58,0.3)" : "rgba(212,168,67,0.25)"}`
                        : "1px solid transparent",
                    }}>
                    {t === "ticket" && <Ticket size={9} />}
                    {t === "hotel" && <BedDouble size={9} />}
                    {t === "all" ? "Semua" : t === "ticket" ? "Tiket" : "Hotel"}
                  </button>
                ))}
              </div>

              {/* Total spent banner */}
              {orders.length > 0 && (
                <div className="mx-3 mt-2 px-3 py-2 rounded-xl flex items-center justify-between"
                  style={{ background: "rgba(192,98,58,0.06)", border: "1px solid rgba(192,98,58,0.12)" }}>
                  <p className="text-[10px]" style={{ color: "#6b5e52" }}>Total pengeluaran</p>
                  <p className="text-[12px] font-bold" style={{ color: "#d4a843" }}>{formatIDR(totalSpent)}</p>
                </div>
              )}

              {/* ── Order list ── */}
              <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.03)" }}>
                      {tab === "ticket" ? <Ticket size={20} style={{ color: "#2a2220" }} />
                        : tab === "hotel" ? <BedDouble size={20} style={{ color: "#2a2220" }} />
                        : <User size={20} style={{ color: "#2a2220" }} />
                      }
                    </div>
                    <p className="text-[11px] text-center" style={{ color: "#3a3228" }}>
                      {tab === "all" ? "Belum ada riwayat pembelian"
                        : tab === "ticket" ? "Belum ada tiket yang dibeli"
                        : "Belum ada kamar yang dipesan"}
                    </p>
                    <p className="text-[10px] text-center" style={{ color: "#2a2220" }}>
                      Ketuk tiket atau pesanan untuk melihat detail
                    </p>
                  </div>
                ) : (
                  filtered.map((order) => (
                    <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

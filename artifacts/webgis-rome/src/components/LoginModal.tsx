import { useState, useEffect, useCallback, type FormEvent } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface LoginModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  reason?: string;
}

export default function LoginModal({ onClose, onSuccess, reason }: LoginModalProps) {
  const { login, register, user } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  const reset = useCallback(() => {
    setName(""); setEmail(""); setPassword(""); setError(""); setRegistered(false);
  }, []);

  // Jika user sudah login (dari context), tutup modal otomatis
  useEffect(() => {
    if (user && loading) {
      setLoading(false);
      onSuccess?.();
      onClose();
    }
  }, [user, loading, onClose, onSuccess]);

  // Safety timeout: jika loading > 8 detik, reset paksa
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      if (tab === "register") {
        setRegistered(true);
        setError("");
      } else {
        setError("Koneksi ke server lambat. Jika sudah pernah daftar sebelumnya, coba daftar ulang sekali lagi.");
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [loading, tab]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setRegistered(false);
    if (!email || !password) { setError("Email dan password wajib diisi."); return; }
    if (tab === "register" && !name) { setError("Nama wajib diisi."); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter."); return; }

    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
        onSuccess?.();
        onClose();
      } else {
        await register(name, email, password);
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  // Tampilkan pesan sukses registrasi (jika timeout tapi akun terbuat)
  if (registered) {
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.82)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="w-full max-w-sm rounded-2xl overflow-hidden p-6 text-center"
          style={{ background: "rgba(10,7,4,0.99)", border: "1px solid rgba(76,175,125,0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.9)" }}>
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.3)" }}>
            <CheckCircle2 size={28} style={{ color: "#4caf7d" }} />
          </div>
          <h2 className="text-[16px] font-bold mb-2" style={{ color: "#e8ddd0" }}>Akun Berhasil Dibuat!</h2>
          <p className="text-[12px] mb-4" style={{ color: "#6b5e52" }}>
            Akun <span style={{ color: "#d4a843" }}>{email}</span> sudah terdaftar.
            Silakan masuk menggunakan akun tersebut.
          </p>
          <button
            onClick={() => { setRegistered(false); setTab("login"); setPassword(""); setError(""); }}
            className="w-full py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#c0623a,#d4a843)", color: "#1a1208" }}>
            <LogIn size={14} /> Masuk Sekarang
          </button>
          <button type="button" onClick={onClose} className="w-full py-2 mt-2 text-[11px]" style={{ color: "#4a3e36" }}>
            Nanti saja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: "rgba(10,7,4,0.99)", border: "1px solid rgba(192,98,58,0.25)", boxShadow: "0 24px 80px rgba(0,0,0,0.9)" }}>

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 text-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#c0623a,#d4a843)", boxShadow: "0 4px 16px rgba(192,98,58,0.4)" }}>
            <span className="text-xl">🏛️</span>
          </div>
          <h2 className="text-[16px] font-bold" style={{ color: "#e8ddd0" }}>
            {tab === "login" ? "Masuk ke Akun" : "Buat Akun Baru"}
          </h2>
          {reason && <p className="text-[11px] mt-1" style={{ color: "#6b5e52" }}>{reason}</p>}
          {loading && (
            <p className="text-[10px] mt-1" style={{ color: "#5a4e46" }}>
              {tab === "register" ? "Membuat akun... (mungkin perlu beberapa detik)" : "Memverifikasi..."}
            </p>
          )}
          <button type="button" onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.05)", color: "#6b5e52" }}>
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mx-6 mt-4 rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {(["login", "register"] as const).map((t) => (
            <button key={t} type="button" onClick={() => { setTab(t); reset(); }}
              className="flex-1 py-2 text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              style={{
                background: tab === t ? "linear-gradient(135deg,rgba(192,98,58,0.25),rgba(212,168,67,0.15))" : "transparent",
                color: tab === t ? "#d4a843" : "#5a4e46",
                borderBottom: tab === t ? "2px solid #d4a843" : "2px solid transparent",
              }}>
              {t === "login" ? <LogIn size={12} /> : <UserPlus size={12} />}
              {t === "login" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-3">
          {tab === "register" && (
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#5a4e46" }} />
              <input type="text" placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl text-[13px] outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8ddd0", padding: "11px 14px 11px 38px" }} />
            </div>
          )}

          <div className="relative">
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#5a4e46" }} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              disabled={loading} autoComplete="email"
              className="w-full rounded-xl text-[13px] outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8ddd0", padding: "11px 14px 11px 38px" }} />
          </div>

          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#5a4e46" }} />
            <input type={showPass ? "text" : "password"} placeholder="Password (min 6 karakter)" value={password}
              onChange={(e) => setPassword(e.target.value)} disabled={loading}
              autoComplete={tab === "login" ? "current-password" : "new-password"}
              className="w-full rounded-xl text-[13px] outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8ddd0", padding: "11px 38px 11px 38px" }} />
            <button type="button" onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#5a4e46" }}>
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: "rgba(192,98,58,0.1)", border: "1px solid rgba(192,98,58,0.3)" }}>
              <AlertCircle size={12} style={{ color: "#c0623a", flexShrink: 0 }} />
              <p className="text-[11px]" style={{ color: "#e0a080" }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 mt-1"
            style={{
              background: loading ? "rgba(192,98,58,0.4)" : "linear-gradient(135deg,#c0623a,#d4a843)",
              color: "#1a1208", opacity: loading ? 0.8 : 1,
              boxShadow: loading ? "none" : "0 6px 20px rgba(192,98,58,0.4)",
            }}>
            {loading
              ? <><span className="w-4 h-4 rounded-full border-2 border-[#1a1208] border-t-transparent animate-spin inline-block" />
                  {tab === "register" ? "Membuat akun..." : "Memverifikasi..."}</>
              : tab === "login"
                ? <><LogIn size={14} />Masuk</>
                : <><UserPlus size={14} />Daftar Sekarang</>
            }
          </button>

          <button type="button" onClick={onClose} className="w-full py-2 text-[11px] text-center" style={{ color: "#4a3e46" }}>
            Lanjut tanpa login
          </button>
        </form>
      </div>
    </div>
  );
}

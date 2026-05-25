/* ─────────────────────────────────────────────
   AuthContext.tsx — Local Auth + Supabase Sync
   ───────────────────────────────────────────── */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase, SUPABASE_DIRECT_URL, SUPABASE_KEY } from "@/lib/supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  joinDate: string;
}

export type OrderType = "ticket" | "hotel";
export type OrderStatus = "confirmed" | "expired";

export interface Order {
  id: string;
  type: OrderType;
  date: string;
  visitDate?: string;
  title: string;
  subtitle?: string;
  detail: string;
  totalIDR: number;
  totalEuro: number;
  method: "card" | "qris";
  status: OrderStatus;
  bookingCode: string;
  nights?: number;
  guests?: number;
  adults?: number;
  children?: number;
}

interface AuthContextValue {
  user: User | null;
  orders: Order[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<Omit<User, "id" | "joinDate">>) => Promise<void>;
  addOrder: (order: Omit<Order, "id" | "date" | "status" | "bookingCode">) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const LS_USER = "webgis_user";
const LS_ORDERS = "webgis_orders";
const LS_ACCOUNTS = "webgis_accounts"; // {email: {id, name, joinDate, passHash}}

/* ── Helpers ── */
function computeStatus(o: Pick<Order, "date" | "visitDate">): OrderStatus {
  const now = new Date();
  if (o.visitDate) return new Date(o.visitDate) < now ? "expired" : "confirmed";
  const d = new Date(o.date); d.setDate(d.getDate() + 30);
  return d < now ? "expired" : "confirmed";
}

function generateBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/** Simple hash untuk verifikasi lokal (bukan untuk keamanan tinggi) */
async function simpleHash(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function loadLocalOrders(userId: string): Order[] {
  try {
    const all = JSON.parse(localStorage.getItem(LS_ORDERS) ?? "{}") as Record<string, Order[]>;
    return (all[userId] ?? []).map(o => ({ ...o, status: computeStatus(o) }));
  } catch { return []; }
}

function saveLocalOrders(userId: string, orders: Order[]) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_ORDERS) ?? "{}") as Record<string, Order[]>;
    all[userId] = orders;
    localStorage.setItem(LS_ORDERS, JSON.stringify(all));
  } catch { /* ignore */ }
}

function mapSupabaseOrder(row: Record<string, unknown>): Order {
  const o = {
    id: String(row.id ?? ""), type: String(row.type ?? "ticket") as OrderType,
    date: String(row.date ?? new Date().toISOString()),
    visitDate: row.visit_date ? String(row.visit_date) : undefined,
    title: String(row.title ?? ""), subtitle: row.subtitle ? String(row.subtitle) : undefined,
    detail: String(row.detail ?? ""), totalIDR: Number(row.total_idr ?? 0),
    totalEuro: Number(row.total_euro ?? 0), method: String(row.method ?? "card") as "card" | "qris",
    status: "confirmed" as OrderStatus, bookingCode: String(row.booking_code ?? ""),
    nights: row.nights ? Number(row.nights) : undefined,
    guests: row.guests ? Number(row.guests) : undefined,
    adults: row.adults ? Number(row.adults) : undefined,
    children: row.children_count ? Number(row.children_count) : undefined,
  };
  return { ...o, status: computeStatus(o) };
}

/** Coba sync orders dari Supabase, gunakan lokal jika gagal */
async function fetchSupabaseOrders(userId: string): Promise<Order[] | null> {
  try {
    const { data } = await supabase.from("orders").select("*").eq("user_id", userId).order("date", { ascending: false });
    if (data && data.length >= 0) return (data as Record<string, unknown>[]).map(mapSupabaseOrder);
  } catch { /* ignore */ }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  /* Restore session dari localStorage saat mount */
  useEffect(() => {
    const raw = localStorage.getItem(LS_USER);
    if (raw) {
      try {
        const u = JSON.parse(raw) as User;
        setUser(u);
        const localOrders = loadLocalOrders(u.id);
        setOrders(localOrders);
        // Coba sync dari Supabase di background
        fetchSupabaseOrders(u.id).then(sbOrders => {
          if (sbOrders && sbOrders.length > 0) {
            setOrders(sbOrders);
            saveLocalOrders(u.id, sbOrders);
          }
        });
      } catch { localStorage.removeItem(LS_USER); }
    }
    setLoading(false);
  }, []);

  /* ── REGISTER ── */
  const register = async (name: string, email: string, password: string) => {
    if (password.length < 6) throw new Error("Password minimal 6 karakter.");

    // Cek apakah email sudah ada di akun lokal
    const accounts = JSON.parse(localStorage.getItem(LS_ACCOUNTS) ?? "{}") as Record<string, { id: string; name: string; joinDate: string; passHash: string }>;
    if (accounts[email.toLowerCase()]) throw new Error("Email sudah terdaftar. Silakan login.");

    const passHash = await simpleHash(email + ":" + password);
    const userId = crypto.randomUUID();
    const joinDate = new Date().toISOString();

    // Simpan ke akun lokal DULU agar login bisa langsung bekerja
    accounts[email.toLowerCase()] = { id: userId, name, joinDate, passHash };
    localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));

    const newUser: User = { id: userId, name, email, joinDate };
    localStorage.setItem(LS_USER, JSON.stringify(newUser));
    setUser(newUser);
    setOrders([]);

    // Coba register ke Supabase di background (tidak blocking)
    supabase.auth.signUp({ email, password }).then(({ data, error }) => {
      if (error) { console.warn("Supabase signUp background failed:", error.message); return; }
      if (data.user) {
        // Update userId di akun lokal dengan ID dari Supabase
        const u = { ...newUser, id: data.user.id };
        accounts[email.toLowerCase()].id = data.user.id;
        localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
        localStorage.setItem(LS_USER, JSON.stringify(u));
        setUser(u);
        supabase.from("profiles").upsert({ id: data.user.id, name, join_date: joinDate }, { onConflict: "id" }).catch(console.warn);
      }
    }).catch(console.warn);
  };

  /* ── LOGIN ── */
  const login = async (email: string, password: string) => {
    const passHash = await simpleHash(email + ":" + password);

    // Verifikasi dari akun lokal dulu
    const accounts = JSON.parse(localStorage.getItem(LS_ACCOUNTS) ?? "{}") as Record<string, { id: string; name: string; joinDate: string; passHash: string }>;
    const localAccount = accounts[email.toLowerCase()];

    if (localAccount && localAccount.passHash === passHash) {
      // Login berhasil via lokal
      const u: User = { id: localAccount.id, name: localAccount.name, email, joinDate: localAccount.joinDate };
      localStorage.setItem(LS_USER, JSON.stringify(u));
      setUser(u);
      const localOrders = loadLocalOrders(localAccount.id);
      setOrders(localOrders);

      // Sync ke Supabase di background
      fetch(`${SUPABASE_DIRECT_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(10000),
      }).then(async res => {
        if (!res.ok) return;
        const data = await res.json();
        if (data.access_token) {
          await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
          fetchSupabaseOrders(localAccount.id).then(sbOrders => {
            if (sbOrders && sbOrders.length > 0) {
              setOrders(sbOrders);
              saveLocalOrders(localAccount.id, sbOrders);
            }
          });
        }
      }).catch(() => { /* Supabase tidak bisa diakses, login lokal tetap berjalan */ });

      return; // Login lokal berhasil
    }

    // Tidak ada akun lokal — coba Supabase langsung dengan timeout 12 detik
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(`${SUPABASE_DIRECT_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error_description ?? data?.message ?? "";
        if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("credentials"))
          throw new Error("Email atau password salah.");
        throw new Error(msg || "Login gagal.");
      }
      // Supabase login berhasil — simpan lokal
      const u2 = data.user;
      if (u2) {
        const newPassHash = await simpleHash(email + ":" + password);
        accounts[email.toLowerCase()] = { id: u2.id, name: u2.user_metadata?.name ?? email.split("@")[0], joinDate: u2.created_at, passHash: newPassHash };
        localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
        const userObj: User = { id: u2.id, name: u2.user_metadata?.name ?? email.split("@")[0], email, joinDate: u2.created_at };
        localStorage.setItem(LS_USER, JSON.stringify(userObj));
        setUser(userObj);
        await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
        const sbOrders = await fetchSupabaseOrders(u2.id);
        if (sbOrders) { setOrders(sbOrders); saveLocalOrders(u2.id, sbOrders); }
      }
    } catch (e) {
      clearTimeout(timer);
      if ((e as Error).name === "AbortError")
        throw new Error("Akun belum tersimpan secara lokal. Daftar ulang dari tab Daftar.");
      throw e;
    }
  };

  /* ── LOGOUT ── */
  const logout = async () => {
    localStorage.removeItem(LS_USER);
    setUser(null);
    setOrders([]);
    supabase.auth.signOut().catch(console.warn);
  };

  /* ── UPDATE USER ── */
  const updateUser = async (data: Partial<Omit<User, "id" | "joinDate">>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem(LS_USER, JSON.stringify(updated));

    // Sync ke Supabase di background
    supabase.from("profiles").update({
      ...(data.name && { name: data.name }),
      ...(data.phone && { phone: data.phone }),
      ...(data.bio && { bio: data.bio }),
    }).eq("id", user.id).catch(console.warn);
  };

  /* ── ADD ORDER ── */
  const addOrder = async (order: Omit<Order, "id" | "date" | "status" | "bookingCode">) => {
    if (!user) return;
    const now = new Date().toISOString();
    const bookingCode = generateBookingCode();
    const newOrder: Order = {
      id: crypto.randomUUID(), ...order, date: now,
      status: computeStatus({ date: now, visitDate: order.visitDate }), bookingCode,
    };

    // Update state dan localStorage LANGSUNG
    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveLocalOrders(user.id, updated);

    // Sync ke Supabase di background
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      supabase.from("orders").insert({
        user_id: session.user.id, type: order.type, date: now,
        visit_date: order.visitDate ?? null, title: order.title,
        subtitle: order.subtitle ?? null, detail: order.detail,
        total_idr: order.totalIDR, total_euro: order.totalEuro, method: order.method,
        booking_code: bookingCode, nights: order.nights ?? null,
        guests: order.guests ?? null, adults: order.adults ?? null,
        children_count: order.children ?? null,
      }).then(({ error }) => { if (error) console.warn("Order sync failed:", error.message); });
    }
  };

  return (
    <AuthContext.Provider value={{ user, orders, loading, login, register, logout, updateUser, addOrder }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

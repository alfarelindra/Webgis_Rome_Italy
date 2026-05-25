import { createClient } from "@supabase/supabase-js";

// Gunakan proxy Vite saat development untuk bypass firewall/ISP
const IS_DEV = import.meta.env.DEV;
const SUPABASE_URL = IS_DEV ? "" : "https://yodebssxstvjjsfcclyb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvZGVic3N4c3R2ampzZmNjbHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTYzMzksImV4cCI6MjA5NTI5MjMzOX0.mjwuUuRTAj2NQrFb0gejmHV46ouc4z7uTccX-7yT0Tg";

// Direct URL untuk keperluan direct fetch (selalu pakai proxy di dev)
export const SUPABASE_DIRECT_URL = IS_DEV
  ? "/supabase"
  : "https://yodebssxstvjjsfcclyb.supabase.co";
export const SUPABASE_KEY = SUPABASE_ANON_KEY;

export const supabase = createClient(
  IS_DEV ? "https://yodebssxstvjjsfcclyb.supabase.co" : "https://yodebssxstvjjsfcclyb.supabase.co",
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      // Route semua fetch melalui proxy Vite saat development
      fetch: IS_DEV
        ? (url: RequestInfo | URL, options?: RequestInit) => {
            const urlStr = url.toString();
            const proxied = urlStr.replace(
              "https://yodebssxstvjjsfcclyb.supabase.co",
              "/supabase"
            );
            return fetch(proxied, options);
          }
        : undefined,
    },
  }
);

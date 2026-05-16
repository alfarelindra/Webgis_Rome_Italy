# WebGIS Roma

Aplikasi peta interaktif WebGIS untuk kota Roma, Italia — menampilkan titik-titik menarik dari data OpenStreetMap dengan UI bertema Roman gelap, AI chatbot, dan fitur GIS lengkap.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/webgis-rome run dev` — run the WebGIS frontend (port 25482)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit OpenAI integration

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Leaflet + Tailwind CSS + TanStack Query + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- AI: Replit OpenAI integration (GPT-5.4, streaming SSE)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/webgis-rome/` — React/Vite WebGIS frontend
  - `src/pages/MapPage.tsx` — main map page with Leaflet integration
  - `src/components/LoadingScreen.tsx` — animated Roman-themed loading screen
  - `src/components/SearchBar.tsx` — location search bar
  - `src/components/LayerControl.tsx` — toggle GeoJSON layers by category
  - `src/components/LocationPanel.tsx` — slide-in info panel on marker click
  - `src/components/ChatPanel.tsx` — AI chatbot panel (SSE streaming)
  - `src/index.css` — dark Roman terracotta/gold theme variables
- `artifacts/api-server/` — Express API server
  - `src/routes/openai/index.ts` — OpenAI chat endpoints with streaming
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle ORM schema (conversations, messages)
- `attached_assets/italy_rome_1778926773573.geojson` — Rome GeoJSON data

## Architecture decisions

- GeoJSON imported as `?raw` string and parsed client-side (Vite doesn't handle `.geojson` as JSON natively).
- AI chat uses raw `fetch` SSE on the frontend (not generated hooks) because Orval doesn't generate streaming clients.
- Map uses CartoDB dark tiles to match the dark Roman aesthetic.
- Markers are custom SVG `DivIcon` per category (no default Leaflet icons).
- Layer filtering is done client-side by hiding/showing markers on the existing `L.Map` instance.

## Product

- Interactive Leaflet map centered on Rome, Italy
- 5 location categories: Toko/Tiket (amber), Wisata (green), Transportasi (blue), Fasilitas (purple), Lainnya (gray)
- Search locations by name; layer toggle controls per category
- Click a marker to open a slide-in info panel with OSM properties
- GPS/My Location button with animated position marker
- AI chatbot (Rome tourism assistant, Indonesian language) with SSE streaming
- Beautiful dark Roman aesthetic: terracotta (#c0623a) and gold (#d4a843) accents

## User preferences

- Language: Indonesian (Bahasa Indonesia) for UI text and AI responses
- Theme: Dark Roman aesthetic with terracotta and gold accents
- Map tiles: CartoDB dark_all

## Gotchas

- GeoJSON must be imported with `?raw` suffix in Vite, then `JSON.parse()`
- API server must be rebuilt (`restart_workflow`) after code changes — it doesn't hot-reload
- Always test via `localhost:80` (proxy), not direct port addresses
- `pnpm run typecheck` passes clean; trust it over editor LSP if they disagree

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

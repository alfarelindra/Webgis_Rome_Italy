import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, X, MapPin } from "lucide-react";
import { LAYER_CONFIG, type LayerKey } from "./LayerControl";

export interface LocationSuggestion {
  name: string;
  category: LayerKey;
  lat: number;
  lng: number;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSelect?: (item: LocationSuggestion) => void;
  suggestions?: LocationSuggestion[];
  resultCount: number;
  totalCount: number;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: "#d4a843", fontWeight: 600 }}>{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchBar({ onSearch, onSelect, suggestions = [], resultCount, totalCount }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions
  const filtered = useMemo(() => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    const starts: LocationSuggestion[] = [];
    const contains: LocationSuggestion[] = [];
    for (const s of suggestions) {
      const n = s.name.toLowerCase();
      if (n.startsWith(q)) starts.push(s);
      else if (n.includes(q)) contains.push(s);
      if (starts.length + contains.length >= 10) break;
    }
    return [...starts.slice(0, 8), ...contains.slice(0, Math.max(0, 8 - starts.length))];
  }, [query, suggestions]);

  useEffect(() => { onSearch(query); }, [query, onSearch]);
  useEffect(() => { setActiveIdx(-1); }, [filtered]);
  useEffect(() => { if (filtered.length > 0 && query) setOpen(true); else setOpen(false); }, [filtered, query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback((item: LocationSuggestion) => {
    setQuery(item.name);
    setOpen(false);
    inputRef.current?.blur();
    onSelect?.(item);
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0) { e.preventDefault(); handleSelect(filtered[activeIdx]); }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
    }
  }, [open, filtered, activeIdx, handleSelect]);

  const handleClear = () => {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-80"
      data-testid="search-bar"
    >
      {/* Input */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
        style={{
          background: "rgba(20, 16, 12, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: open && filtered.length > 0
            ? "1px solid rgba(192, 98, 58, 0.5)"
            : "1px solid rgba(192, 98, 58, 0.25)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          borderRadius: open && filtered.length > 0 ? "12px 12px 0 0" : "12px",
        }}
      >
        <Search size={16} style={{ color: "#c0623a", flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Cari lokasi di Roma..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (filtered.length > 0) setOpen(true); }}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "#e0d8cc" }}
          autoComplete="off"
          data-testid="input-search"
        />
        {query && (
          <button
            onClick={handleClear}
            className="p-0.5 rounded transition-colors"
            style={{ color: "#6b5e52" }}
            data-testid="button-search-clear"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown suggestions */}
      {open && filtered.length > 0 && (
        <div
          className="overflow-hidden"
          style={{
            background: "rgba(20, 16, 12, 0.96)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(192,98,58,0.5)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "0 0 12px 12px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.7)",
          }}
          data-testid="search-suggestions"
        >
          {filtered.map((item, i) => {
            const cfg = LAYER_CONFIG[item.category];
            const isActive = i === activeIdx;
            return (
              <button
                key={`${item.lat}-${item.lng}-${item.name}`}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                style={{
                  background: isActive ? "rgba(192,98,58,0.12)" : "transparent",
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                onMouseEnter={() => setActiveIdx(i)}
                data-testid={`suggestion-${i}`}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: cfg.color, boxShadow: `0 0 4px ${cfg.color}88` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate" style={{ color: "#c8bfb2" }}>
                    {highlight(item.name, query)}
                  </div>
                  <div className="text-[10px]" style={{ color: "#4a3e36" }}>
                    {cfg.label}
                  </div>
                </div>
                <MapPin size={10} style={{ color: "#3a3028", flexShrink: 0 }} />
              </button>
            );
          })}
          <div
            className="px-3 py-1.5 text-[10px] flex items-center justify-between"
            style={{ color: "#3a3028", borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span>↑↓ navigasi · Enter pilih · Esc tutup</span>
            <span>{filtered.length} hasil</span>
          </div>
        </div>
      )}

      {/* Result count pill */}
      {query && !open && (
        <div
          className="mt-1.5 px-3 py-1 rounded-lg text-xs"
          style={{
            background: "rgba(20, 16, 12, 0.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#8a7060",
          }}
          data-testid="search-result-count"
        >
          Menampilkan{" "}
          <span style={{ color: "#d4a843" }}>{resultCount}</span> dari{" "}
          <span style={{ color: "#d4a843" }}>{totalCount}</span> lokasi
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  resultCount: number;
  totalCount: number;
}

export default function SearchBar({ onSearch, resultCount, totalCount }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-80"
      data-testid="search-bar"
    >
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{
          background: "rgba(20, 16, 12, 0.9)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(192, 98, 58, 0.25)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        <Search size={16} style={{ color: "#c0623a", flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="search"
          placeholder="Cari lokasi di Roma..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "#e0d8cc" }}
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
      {query && (
        <div
          className="mt-1.5 px-3 py-1 rounded-lg text-xs"
          style={{
            background: "rgba(20, 16, 12, 0.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#8a7060",
          }}
        >
          Menampilkan{" "}
          <span style={{ color: "#d4a843" }}>{resultCount}</span> dari{" "}
          <span style={{ color: "#d4a843" }}>{totalCount}</span> lokasi
        </div>
      )}
    </div>
  );
}

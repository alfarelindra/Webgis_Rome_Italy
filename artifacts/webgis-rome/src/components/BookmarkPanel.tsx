import { Bookmark, X, MapPin, Trash2, Star } from "lucide-react";
import { LAYER_CONFIG, type LayerKey } from "./LayerControl";

export interface BookmarkItem {
  id: string;
  name: string;
  category: LayerKey;
  subLabel: string;
  lat: number;
  lng: number;
}

interface BookmarkPanelProps {
  bookmarks: BookmarkItem[];
  onFlyTo: (lat: number, lng: number) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export default function BookmarkPanel({ bookmarks, onFlyTo, onRemove, onClose }: BookmarkPanelProps) {
  return (
    <div
      className="absolute left-4 z-[1000] w-64 slide-in-right"
      style={{ bottom: "88px" }}
      data-testid="bookmark-panel"
    >
      <div
        className="rounded-xl overflow-hidden flex flex-col"
        style={{
          maxHeight: "360px",
          background: "rgba(20, 16, 12, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(212, 168, 67, 0.25)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div
          className="px-3 py-2.5 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <Star size={13} style={{ color: "#d4a843" }} />
            <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: "#e0d8cc" }}>
              Favorit
            </span>
            {bookmarks.length > 0 && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(212,168,67,0.15)", color: "#d4a843" }}
              >
                {bookmarks.length}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ color: "#6b5e52" }} data-testid="button-close-bookmarks">
            <X size={14} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.15)" }}
              >
                <Star size={18} style={{ color: "#d4a843", opacity: 0.5 }} />
              </div>
              <p className="text-xs" style={{ color: "#6b5e52" }}>
                Belum ada favorit. Klik bintang di panel info lokasi untuk menyimpan.
              </p>
            </div>
          ) : (
            bookmarks.map((bm) => {
              const config = LAYER_CONFIG[bm.category];
              return (
                <div
                  key={bm.id}
                  className="flex items-center gap-2.5 px-3 py-2 transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  data-testid={`bookmark-${bm.id}`}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: config.color }}
                  />
                  <button
                    className="flex-1 min-w-0 text-left"
                    onClick={() => onFlyTo(bm.lat, bm.lng)}
                    data-testid={`button-fly-${bm.id}`}
                  >
                    <div className="text-xs font-medium truncate" style={{ color: "#e0d8cc" }}>
                      {bm.name}
                    </div>
                    <div className="text-[10px] truncate" style={{ color: "#6b5e52" }}>
                      {bm.subLabel}
                    </div>
                  </button>
                  <button
                    onClick={() => onRemove(bm.id)}
                    className="flex-shrink-0 transition-colors"
                    style={{ color: "#6b5e52" }}
                    data-testid={`button-remove-bookmark-${bm.id}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

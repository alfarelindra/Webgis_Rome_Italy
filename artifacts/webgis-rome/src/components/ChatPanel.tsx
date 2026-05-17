import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Trash2, ChevronDown, Bot, Wifi, WifiOff } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const OLLAMA_API = "http://localhost:5000";

// Cek apakah chatbot server berjalan
async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_API}/health`, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      return data.ollama_running === true;
    }
    return false;
  } catch {
    return false;
  }
}

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null); // null = belum dicek
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cek status server saat panel dibuka
  useEffect(() => {
    if (open) {
      setOnline(null);
      checkHealth().then(setOnline);
    }
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSending(true);

    // Tambah pesan user
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    // Tambah placeholder balasan AI
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      // Kirim ke Flask/Ollama
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${OLLAMA_API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: AbortSignal.timeout(120_000), // 2 menit timeout
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply: string = data.reply || "Maaf, tidak ada respons dari model.";

      // Tampilkan balasan dengan efek typing
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "", streaming: true };
        return updated;
      });

      // Simulate streaming effect character by character
      let i = 0;
      const chunkSize = 3;
      const interval = setInterval(() => {
        i += chunkSize;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: reply.slice(0, i),
            streaming: i < reply.length,
          };
          return updated;
        });
        if (i >= reply.length) clearInterval(interval);
      }, 12);

    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Terjadi kesalahan";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `❌ ${errMsg}\n\nPastikan chatbot server berjalan:\n\`$env:PYTHONUTF8="1"; python chatbot.py\``,
          streaming: false,
        };
        return updated;
      });
      setOnline(false);
    } finally {
      setSending(false);
    }
  }, [input, sending, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([]);

  const QUICK_QUESTIONS = [
    "Tempat wisata wajib di Roma?",
    "Rekomendasi restoran Italia terbaik?",
    "Cara naik Metro di Roma?",
    "Tips berkunjung ke Colosseum?",
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`absolute bottom-6 right-4 z-[1000] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${open ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"}`}
        style={{
          background: "linear-gradient(135deg, #c0623a, #d4a843)",
          boxShadow: "0 4px 20px rgba(192, 98, 58, 0.5)",
        }}
        data-testid="button-open-chat"
        title="Asisten Roma (Ollama AI)"
      >
        <MessageCircle size={20} color="white" />
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="absolute bottom-4 right-4 z-[1001] w-80 flex flex-col slide-in-up"
          style={{ height: "480px" }}
          data-testid="chat-panel"
        >
          <div
            className="flex flex-col h-full rounded-xl overflow-hidden"
            style={{
              background: "rgba(14, 11, 8, 0.97)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(192, 98, 58, 0.25)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between flex-shrink-0"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(192, 98, 58, 0.08)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #c0623a, #d4a843)" }}
                >
                  <Bot size={14} color="white" />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#e8ddd0" }}>
                    Asisten Roma
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    {online === null ? (
                      <span style={{ color: "#6b5e52" }}>Memeriksa koneksi...</span>
                    ) : online ? (
                      <>
                        <Wifi size={9} style={{ color: "#4caf7d" }} />
                        <span style={{ color: "#4caf7d" }}>Ollama llama3.2 · Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff size={9} style={{ color: "#c0623a" }} />
                        <span style={{ color: "#c0623a" }}>Server tidak aktif</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                    style={{ color: "#6b5e52" }}
                    title="Hapus percakapan"
                    data-testid="button-clear-chat"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: "#6b5e52" }}
                  data-testid="button-close-chat"
                >
                  <ChevronDown size={15} />
                </button>
              </div>
            </div>

            {/* Offline banner */}
            {online === false && (
              <div
                className="px-3 py-2 text-[11px] flex items-start gap-2"
                style={{ background: "rgba(192,98,58,0.1)", borderBottom: "1px solid rgba(192,98,58,0.15)" }}
              >
                <WifiOff size={11} className="flex-shrink-0 mt-0.5" style={{ color: "#c0623a" }} />
                <div style={{ color: "#c0623a" }}>
                  Jalankan chatbot server terlebih dahulu:
                  <code
                    className="block mt-1 px-2 py-1 rounded text-[10px] break-all"
                    style={{ background: "rgba(0,0,0,0.3)", color: "#e0d8cc" }}
                  >
                    $env:PYTHONUTF8="1"; python "attached_assets\chatbot_1778926777859.py"
                  </code>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(192, 98, 58, 0.1)", border: "1px solid rgba(192,98,58,0.2)" }}
                  >
                    <Bot size={22} style={{ color: "#c0623a" }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: "#c8bfb2" }}>
                      Tanya tentang Roma 🇮🇹
                    </div>
                    <div className="text-xs" style={{ color: "#6b5e52" }}>
                      Ditenagai Ollama · llama3.2 · Gratis & lokal
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full mt-1">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); inputRef.current?.focus(); }}
                        className="text-xs px-3 py-1.5 rounded-lg text-left transition-colors hover:bg-white/5"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          color: "#a89880",
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`message-${msg.role}-${i}`}
                >
                  {msg.role === "assistant" && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mr-1.5 mt-1"
                      style={{ background: "rgba(192,98,58,0.15)", border: "1px solid rgba(192,98,58,0.2)" }}
                    >
                      <Bot size={10} style={{ color: "#c0623a" }} />
                    </div>
                  )}
                  <div
                    className="max-w-[82%] px-3 py-2 rounded-xl text-[13px] leading-relaxed whitespace-pre-wrap"
                    style={
                      msg.role === "user"
                        ? {
                            background: "linear-gradient(135deg, rgba(192,98,58,0.25), rgba(212,168,67,0.15))",
                            border: "1px solid rgba(192,98,58,0.2)",
                            color: "#e0d8cc",
                            borderBottomRightRadius: "4px",
                          }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            color: "#c8bfb2",
                            borderBottomLeftRadius: "4px",
                          }
                    }
                  >
                    {msg.content || (msg.streaming ? "" : "...")}
                    {msg.streaming && (
                      <span
                        className="inline-block w-1.5 h-3.5 ml-0.5 align-middle rounded-sm"
                        style={{
                          background: "#c0623a",
                          animation: "rome-pulse 0.7s ease infinite",
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="p-3 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="flex items-end gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tanya tentang Roma..."
                  rows={1}
                  className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed"
                  style={{ color: "#e0d8cc", maxHeight: "80px" }}
                  data-testid="input-chat"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="p-1.5 rounded-lg flex-shrink-0 transition-all"
                  style={{
                    background: input.trim() && !sending
                      ? "linear-gradient(135deg, #c0623a, #d4a843)"
                      : "rgba(255,255,255,0.06)",
                    color: input.trim() && !sending ? "white" : "#6b5e52",
                  }}
                  data-testid="button-send-chat"
                >
                  {sending ? (
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                      style={{ borderColor: "#c0623a44", borderTopColor: "#c0623a" }}
                    />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
              <div className="mt-1.5 text-center text-[9px]" style={{ color: "#3a3028" }}>
                Enter kirim · Shift+Enter baris baru · Ollama llama3.2
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Trash2, Bot, Sparkles, Key, Eye, EyeOff, ExternalLink, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface ChatPanelProps {
  onClose: () => void;
}

const LS_KEY = "webgis_groq_key";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant"; // Model gratis Groq

const SYSTEM_PROMPT = `Kamu adalah Asisten Roma, panduan wisata ahli untuk kota Roma, Italia. 
Jawab pertanyaan dalam Bahasa Indonesia dengan ramah, informatif, dan berformat rapi menggunakan emoji.
Fokus pada: atraksi wisata, kuliner, transportasi, akomodasi, tips perjalanan, sejarah Roma, dan budaya Italia.
Berikan informasi praktis seperti harga tiket, jam buka, lokasi, dan tips insider.
Jika ditanya di luar topik Roma/Italia, arahkan kembali ke topik wisata Roma dengan sopan.
Gunakan format yang mudah dibaca dengan poin-poin atau bagian yang jelas.`;

const QUICK_QUESTIONS = [
  "Tempat wisata wajib di Roma?",
  "Kuliner khas Roma yang harus dicoba?",
  "Tips hemat wisata di Roma?",
  "Cara naik Metro di Roma?",
];

/* ── API Call ── */
async function askGroq(apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 1024,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message ?? "";
    if (res.status === 401) throw new Error("API key tidak valid. Periksa kembali.");
    if (res.status === 429) throw new Error("Batas permintaan tercapai. Tunggu sebentar.");
    throw new Error(msg || `Error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Maaf, tidak ada respons.";
}

/* ── API Key Setup Screen ── */
function KeySetup({ onSave }: { onSave: (key: string) => void }) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);

  const handleSave = async () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith("gsk_")) {
      setError("API key Groq dimulai dengan 'gsk_'. Periksa kembali.");
      return;
    }
    setTesting(true);
    setError("");
    try {
      await askGroq(trimmed, [{ role: "user", content: "Halo!" }]);
      onSave(trimmed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "API key tidak valid.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center px-5 py-4 gap-4">
      <div className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: "rgba(192,98,58,0.1)", border: "1px solid rgba(192,98,58,0.25)" }}>
        <Key size={24} style={{ color: "#c0623a" }} />
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold mb-1" style={{ color: "#e8ddd0" }}>Hubungkan AI ke Chatbot</p>
        <p className="text-[11px] leading-relaxed" style={{ color: "#5a4e46" }}>
          Gunakan <strong style={{ color: "#d4a843" }}>Groq API</strong> gratis untuk chatbot pintar tanpa batas. Daftar 1 menit, gratis selamanya.
        </p>
      </div>

      {/* Steps */}
      <div className="w-full space-y-2">
        {[
          { n: "1", text: "Buka", link: "https://console.groq.com", label: "console.groq.com" },
          { n: "2", text: "Daftar dengan Google / GitHub (gratis)" },
          { n: "3", text: "Klik API Keys → Create API Key" },
          { n: "4", text: "Copy & paste di bawah ini" },
        ].map((s) => (
          <div key={s.n} className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5"
              style={{ background: "rgba(192,98,58,0.15)", color: "#c0623a", border: "1px solid rgba(192,98,58,0.25)" }}>
              {s.n}
            </span>
            <span className="text-[11px] leading-relaxed" style={{ color: "#8a7a6a" }}>
              {s.text}{" "}
              {s.link && (
                <a href={s.link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 underline"
                  style={{ color: "#d4a843" }}>
                  {s.label} <ExternalLink size={9} />
                </a>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="w-full">
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(""); }}
            className="w-full rounded-xl text-[12px] outline-none pr-9"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${error ? "rgba(192,98,58,0.5)" : "rgba(255,255,255,0.1)"}`,
              color: "#e8ddd0", padding: "10px 36px 10px 12px",
            }}
          />
          <button type="button" onClick={() => setShow((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
            style={{ color: "#5a4e46" }}>
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1.5 rounded-lg"
            style={{ background: "rgba(192,98,58,0.1)", border: "1px solid rgba(192,98,58,0.2)" }}>
            <AlertCircle size={11} style={{ color: "#c0623a", flexShrink: 0 }} />
            <p className="text-[10px]" style={{ color: "#e0a080" }}>{error}</p>
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={!key.trim() || testing}
        className="w-full py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2"
        style={{
          background: key.trim() && !testing ? "linear-gradient(135deg,#c0623a,#d4a843)" : "rgba(255,255,255,0.06)",
          color: key.trim() && !testing ? "#1a1208" : "#5a4e46",
        }}>
        {testing
          ? <><div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "#1a120844", borderTopColor: "#1a1208" }} /> Memverifikasi...</>
          : <><Sparkles size={14} /> Aktifkan Chatbot AI</>
        }
      </button>

      <p className="text-[9px] text-center" style={{ color: "#3a3028" }}>
        API key disimpan di browser Anda saja, tidak dikirim ke server lain
      </p>
    </div>
  );
}

/* ── Main Chat Component ── */
export default function ChatPanel({ onClose }: ChatPanelProps) {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(LS_KEY) ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSaveKey = (key: string) => {
    localStorage.setItem(LS_KEY, key);
    setApiKey(key);
  };

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending || !apiKey) return;
    setInput("");
    setSending(true);
    setError("");

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const reply = await askGroq(apiKey, history);

      // Typing animation
      let i = 0;
      const chunkSize = 5;
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          i += chunkSize;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: reply.slice(0, i), streaming: i < reply.length };
            return updated;
          });
          if (i >= reply.length) { clearInterval(interval); resolve(); }
        }, 8);
      });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Terjadi kesalahan";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: `❌ ${errMsg}`, streaming: false };
        return updated;
      });
      setError(errMsg);
      // Hapus key jika tidak valid
      if (errMsg.includes("tidak valid") || errMsg.includes("401")) {
        localStorage.removeItem(LS_KEY);
        setApiKey("");
      }
    } finally {
      setSending(false);
    }
  }, [input, sending, messages, apiKey]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="fixed bottom-20 right-4 z-[1500] w-80 flex flex-col"
      style={{ height: apiKey ? "500px" : "560px" }} data-testid="chat-panel">
      <div className="flex flex-col h-full rounded-xl overflow-hidden"
        style={{ background: "rgba(10,7,4,0.98)", border: "1px solid rgba(192,98,58,0.25)", boxShadow: "0 20px 60px rgba(0,0,0,0.85)" }}>

        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(192,98,58,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#c0623a,#d4a843)" }}>
              <Bot size={14} color="white" />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "#e8ddd0" }}>Asisten Roma AI</div>
              <div className="flex items-center gap-1 text-[10px]">
                {apiKey
                  ? <><Sparkles size={8} style={{ color: "#4caf7d" }} /><span style={{ color: "#4caf7d" }}>Groq · Llama 3.1 · Gratis</span></>
                  : <span style={{ color: "#6b5e52" }}>Perlu API key</span>
                }
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {apiKey && (
              <button type="button" onClick={(e) => { e.stopPropagation(); localStorage.removeItem(LS_KEY); setApiKey(""); setMessages([]); }}
                className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "#6b5e52" }} title="Ganti API key">
                <Key size={12} />
              </button>
            )}
            {messages.length > 0 && apiKey && (
              <button type="button" onClick={(e) => { e.stopPropagation(); setMessages([]); }} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "#6b5e52" }} title="Hapus percakapan">
                <Trash2 size={13} />
              </button>
            )}
            <button type="button" onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "#6b5e52" }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!apiKey ? (
          <div className="flex-1 overflow-y-auto">
            <KeySetup onSave={handleSaveKey} />
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(192,98,58,0.1)", border: "1px solid rgba(192,98,58,0.2)" }}>
                    <Bot size={26} style={{ color: "#c0623a" }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: "#c8bfb2" }}>Tanya apa saja tentang Roma 🇮🇹</div>
                    <div className="text-[11px]" style={{ color: "#5a4e46" }}>Ditenagai Groq Llama 3.1 — jawaban cepat & akurat</div>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full mt-1">
                    {QUICK_QUESTIONS.map((q) => (
                      <button key={q} onClick={() => sendMessage(q)}
                        className="text-xs px-3 py-1.5 rounded-lg text-left hover:bg-white/5 transition-colors"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#9a8870" }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mr-1.5 mt-1"
                      style={{ background: "rgba(192,98,58,0.15)", border: "1px solid rgba(192,98,58,0.2)" }}>
                      <Bot size={10} style={{ color: "#c0623a" }} />
                    </div>
                  )}
                  <div className="max-w-[82%] px-3 py-2 rounded-xl text-[12px] leading-relaxed whitespace-pre-wrap"
                    style={msg.role === "user"
                      ? { background: "linear-gradient(135deg,rgba(192,98,58,0.25),rgba(212,168,67,0.15))", border: "1px solid rgba(192,98,58,0.2)", color: "#e0d8cc", borderBottomRightRadius: "4px" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#c8bfb2", borderBottomLeftRadius: "4px" }
                    }>
                    {msg.content || (msg.streaming ? "" : "...")}
                    {msg.streaming && (
                      <span className="inline-block w-1.5 h-3 ml-0.5 align-middle rounded-sm"
                        style={{ background: "#c0623a", animation: "rome-pulse 0.7s ease infinite" }} />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {error && (
                <div className="flex items-center gap-1.5 mb-2 px-2 py-1.5 rounded-lg"
                  style={{ background: "rgba(192,98,58,0.1)", border: "1px solid rgba(192,98,58,0.2)" }}>
                  <AlertCircle size={10} style={{ color: "#c0623a", flexShrink: 0 }} />
                  <p className="text-[10px]" style={{ color: "#e0a080" }}>{error}</p>
                </div>
              )}
              <div className="flex items-end gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <textarea
                  ref={inputRef} value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tanya apa saja tentang Roma..."
                  rows={1}
                  className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed"
                  style={{ color: "#e0d8cc", maxHeight: "80px" }}
                />
                <button onClick={() => sendMessage()} disabled={!input.trim() || sending}
                  className="p-1.5 rounded-lg flex-shrink-0 transition-all"
                  style={{
                    background: input.trim() && !sending ? "linear-gradient(135deg,#c0623a,#d4a843)" : "rgba(255,255,255,0.06)",
                    color: input.trim() && !sending ? "white" : "#6b5e52",
                  }}>
                  {sending
                    ? <div className="w-3.5 h-3.5 rounded-full border-2 animate-spin" style={{ borderColor: "#c0623a44", borderTopColor: "#c0623a" }} />
                    : <Send size={14} />
                  }
                </button>
              </div>
              <div className="mt-1 text-center text-[9px]" style={{ color: "#3a3028" }}>
                Enter kirim · Shift+Enter baris baru · Groq Llama 3.1
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Trash2, ChevronDown } from "lucide-react";
import { useCreateOpenaiConversation, useListOpenaiConversations, useDeleteOpenaiConversation, getListOpenaiConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const BASE = import.meta.env.BASE_URL;

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const createConversation = useCreateOpenaiConversation();
  const deleteConversation = useDeleteOpenaiConversation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ensureConversation = useCallback(async (): Promise<number> => {
    if (conversationId) return conversationId;
    const conv = await createConversation.mutateAsync({
      data: { title: "Roma WebGIS Chat" },
    });
    setConversationId(conv.id);
    queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
    return conv.id;
  }, [conversationId, createConversation, queryClient]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSending(true);

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const convId = await ensureConversation();
      const apiBase = BASE.endsWith("/") ? BASE.slice(0, -1) : BASE;
      const response = await fetch(
        `${apiBase}/api/openai/conversations/${convId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to send message");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: fullContent,
                    streaming: true,
                  };
                  return updated;
                });
              }
              if (data.done) {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: fullContent,
                    streaming: false,
                  };
                  return updated;
                });
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
          streaming: false,
        };
        return updated;
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    if (conversationId) {
      try {
        await deleteConversation.mutateAsync({ id: conversationId });
      } catch {
        // ignore
      }
    }
    setConversationId(null);
    setMessages([]);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`absolute bottom-6 right-4 z-[1000] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${open ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
        style={{
          background: "linear-gradient(135deg, #c0623a, #d4a843)",
          boxShadow: "0 4px 20px rgba(192, 98, 58, 0.5)",
        }}
        data-testid="button-open-chat"
      >
        <MessageCircle size={20} color="white" />
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="absolute bottom-4 right-4 z-[1001] w-80 flex flex-col slide-in-up"
          style={{ height: "460px" }}
          data-testid="chat-panel"
        >
          <div
            className="flex flex-col h-full rounded-xl overflow-hidden"
            style={{
              background: "rgba(18, 14, 10, 0.97)",
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
                  <MessageCircle size={14} color="white" />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#e8ddd0" }}>
                    Asisten Roma
                  </div>
                  <div className="text-[10px]" style={{ color: "#6b5e52" }}>
                    Panduan wisata Roma
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: "#6b5e52" }}
                    title="Hapus percakapan"
                    data-testid="button-clear-chat"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "#6b5e52" }}
                  data-testid="button-close-chat"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(192, 98, 58, 0.1)", border: "1px solid rgba(192,98,58,0.2)" }}
                  >
                    <MessageCircle size={20} style={{ color: "#c0623a" }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: "#c8bfb2" }}>
                      Tanya tentang Roma
                    </div>
                    <div className="text-xs" style={{ color: "#6b5e52" }}>
                      Restoran, tempat wisata, sejarah, atau cara menggunakan peta ini
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full mt-1">
                    {["Restoran terbaik di Roma?", "Wisata wajib di Roma?", "Cara filter lokasi di peta?"].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); inputRef.current?.focus(); }}
                        className="text-xs px-3 py-1.5 rounded-lg text-left transition-colors"
                        style={{
                          background: "rgba(255,255,255,0.04)",
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
                  <div
                    className="max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed"
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
                    {msg.content}
                    {msg.streaming && (
                      <span
                        className="inline-block w-1 h-4 ml-0.5 align-middle rounded-sm"
                        style={{
                          background: "#c0623a",
                          animation: "rome-pulse 0.8s ease infinite",
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
                    background: input.trim() && !sending ? "linear-gradient(135deg, #c0623a, #d4a843)" : "rgba(255,255,255,0.06)",
                    color: input.trim() && !sending ? "white" : "#6b5e52",
                  }}
                  data-testid="button-send-chat"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { X, Send, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME: Msg = {
  role: "assistant",
  content:
    "হ্যালো! 👋 আমি TOP-UP EXPRESS এর AI সাপোর্ট। ডায়মন্ড টপআপ, পেমেন্ট, অর্ডার, ওয়ালেট — যেকোনো প্রশ্ন করুন, instant উত্তর পাবেন।",
};

const QUICK = [
  "কিভাবে টপআপ করব?",
  "পেমেন্ট মেথড কী কী?",
  "ডেলিভারি কতক্ষণে?",
  "Wallet এ টাকা যোগ করব কিভাবে?",
];

export function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/livechat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== WELCOME) }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? "দুঃখিত, এখন উত্তর দিতে পারছি না। একটু পরে চেষ্টা করুন।" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network problem। আবার চেষ্টা করুন।" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating launcher - always visible above bottom nav */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="TOP-UP EXPRESS AI"
          className="fixed right-3 z-[9999] group"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 84px)" }}
        >
          <span className="absolute inset-0 rounded-full bg-rose-500/50 blur-2xl animate-pulse" />
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-400 via-red-500 to-rose-600 opacity-70 blur-md animate-pulse" />
          <span className="relative flex items-center gap-2 rounded-full bg-gradient-to-br from-rose-500 to-red-600 pl-2 pr-3.5 py-2 shadow-[0_12px_32px_-6px_rgba(244,63,94,.85)] ring-2 ring-white/40">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-rose-600 shadow-inner">
              <Sparkles size={15} strokeWidth={2.7} />
            </span>
            <span className="flex flex-col leading-none text-left">
              <span className="text-[8px] font-bold text-white/85 tracking-[0.15em]">TOP-UP EXPRESS</span>
              <span className="text-[12px] font-extrabold text-white tracking-wide mt-0.5">AI · 24/7</span>
            </span>
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-[70] sm:inset-auto sm:bottom-6 sm:right-6 flex sm:block items-end justify-center bg-black/40 sm:bg-transparent">
          <div
            className="relative w-full sm:w-[360px] h-[78vh] sm:h-[540px] max-h-[640px] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden bg-white shadow-2xl border border-rose-200"
            style={{
              boxShadow:
                "0 20px 60px -10px rgba(244,63,94,.45), 0 0 0 1px rgba(244,63,94,.15)",
            }}
          >
            {/* Header */}
            <div className="relative px-3.5 py-3 bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 text-white">
              <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
              <div className="relative flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-rose-600 shadow">
                  <Sparkles size={16} strokeWidth={2.5} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px] leading-tight tracking-wide">TOP-UP EXPRESS AI</div>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-white/90">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online · Instant AI Reply
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/15 hover:bg-white/25 transition"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-gradient-to-b from-rose-50/40 to-white"
            >
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role} content={m.content} />
              ))}
              {loading && (
                <div className="flex items-center gap-1.5 pl-2">
                  <Dot /><Dot delay="0.15s" /><Dot delay="0.3s" />
                </div>
              )}
              {messages.length <= 1 && !loading && (
                <div className="pt-1">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-rose-500/80 font-bold mb-1.5 pl-1">
                    Quick Questions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-[11.5px] font-medium px-2.5 py-1.5 rounded-full bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 transition shadow-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-rose-100 bg-white p-2.5 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="আপনার প্রশ্ন লিখুন…"
                className="flex-1 text-[13px] px-3 py-2.5 rounded-full bg-rose-50 border border-rose-100 outline-none focus:border-rose-300 focus:bg-white transition"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md disabled:opacity-50 hover:scale-105 transition"
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          isUser
            ? "max-w-[82%] rounded-2xl rounded-br-md bg-gradient-to-br from-rose-500 to-red-600 text-white px-3 py-2 text-[12.5px] leading-relaxed shadow-md"
            : "max-w-[85%] rounded-2xl rounded-bl-md bg-white border border-rose-100 text-foreground px-3 py-2 text-[12.5px] leading-relaxed shadow-sm whitespace-pre-wrap"
        }
      >
        {content}
      </div>
    </div>
  );
}

function Dot({ delay = "0s" }: { delay?: string }) {
  return (
    <span
      className="h-2 w-2 rounded-full bg-rose-400"
      style={{ animation: "lc-bounce 1s infinite", animationDelay: delay }}
    />
  );
}

// keyframes injected once
if (typeof document !== "undefined" && !document.getElementById("lc-style")) {
  const s = document.createElement("style");
  s.id = "lc-style";
  s.innerHTML = `@keyframes lc-bounce {0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-4px);opacity:1}}`;
  document.head.appendChild(s);
}

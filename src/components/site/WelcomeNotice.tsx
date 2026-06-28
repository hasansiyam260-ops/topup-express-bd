import { useEffect, useState } from "react";
import { X, AlertTriangle, MessageCircle, Send } from "lucide-react";

export function WelcomeNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show once per session/tab visit. Closing tab and reopening = shows again.
    if (typeof window === "undefined") return;
    const shown = sessionStorage.getItem("tue_notice_shown");
    if (!shown) {
      const t = setTimeout(() => setOpen(true), 350);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    sessionStorage.setItem("tue_notice_shown", "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: "rgba(8,10,20,0.72)", backdropFilter: "blur(6px)" }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(180deg,#fff,#fff5f6)",
          boxShadow:
            "0 0 0 1px rgba(239,68,68,0.25), 0 30px 80px -20px rgba(239,68,68,0.55), 0 0 60px rgba(59,130,246,0.25)",
          animation: "notice-pop .35s cubic-bezier(.2,.9,.3,1.2)",
        }}
      >
        {/* Header */}
        <div
          className="relative px-5 py-4 text-center"
          style={{
            background:
              "linear-gradient(135deg,#0b1020 0%,#1a0b1f 50%,#1b0610 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 0%, rgba(239,68,68,.35), transparent 60%), radial-gradient(80% 60% at 50% 100%, rgba(59,130,246,.25), transparent 60%)",
            }}
          />
          <div className="relative flex items-center justify-center gap-2">
            <AlertTriangle size={20} className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <h2
              className="text-[20px] font-black tracking-wide text-white"
              style={{ textShadow: "0 0 12px rgba(239,68,68,0.7)" }}
            >
              ⚡ গুরুত্বপূর্ণ নোটিশ ⚡
            </h2>
            <AlertTriangle size={20} className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
          </div>
          <p className="relative mt-1 text-[11px] font-semibold tracking-wider text-white/80">
            TOP-UP EXPRESS • অফিসিয়াল ঘোষণা
          </p>

          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-slate-800 shadow-md transition hover:scale-110 hover:bg-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 text-[13px] leading-[1.7] text-slate-800">
          <p className="text-center text-[15px] font-extrabold text-rose-600">
            আমাদের সাইট ২৪ ঘন্টাই চালু ✅
          </p>

          <ul className="mt-3 space-y-2">
            <li className="flex gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
              <span>
                <b className="text-rose-600">১০ সেকেন্ডে</b> অটো ডেলিভারি সিস্টেম —
                পেমেন্ট কনফার্ম হলেই সাথে সাথে ডায়মন্ড পৌঁছে যাবে।
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
              <span>
                যেকোনো সমস্যা হলে অবশ্যই{" "}
                <b className="text-rose-600">মেসেঞ্জারে যোগাযোগ</b> করুন।
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
              <span>
                ট্রানজেকশন ID সমস্যা হলে{" "}
                <b className="text-rose-600">৫ মিনিট পর</b> আবার চেষ্টা করুন।
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
              <span>
                পরিবারের ফোন থেকে না বলে টাকা নিয়ে অর্ডার করলে{" "}
                <b className="text-rose-600">গেম আইডি ব্যান</b> করা হবে।
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
              <span>
                নতুন <b className="text-sky-600">ইভেন্ট ও অফার</b> পেতে আমাদের
                টেলিগ্রাম চ্যানেলে জয়েন করুন।
              </span>
            </li>
          </ul>

          {/* Social row */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              href="https://t.me/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold text-white shadow-md transition hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg,#229ED9,#0f6fa8)",
                boxShadow: "0 6px 18px -6px rgba(34,158,217,.7)",
              }}
            >
              <Send size={14} /> Telegram
            </a>
            <a
              href="https://m.me/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold text-white shadow-md transition hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg,#0084FF,#0057b8)",
                boxShadow: "0 6px 18px -6px rgba(0,132,255,.7)",
              }}
            >
              <MessageCircle size={14} /> Messenger
            </a>
          </div>

          <button
            onClick={close}
            className="relative mt-4 w-full overflow-hidden rounded-xl py-3 text-[14px] font-extrabold tracking-wide text-white"
            style={{
              background: "linear-gradient(135deg,#ef4444,#b91c1c)",
              boxShadow:
                "0 10px 24px -8px rgba(239,68,68,.7), inset 0 1px 0 rgba(255,255,255,.25)",
            }}
          >
            <span className="relative z-10">বুঝেছি, কন্টিনিউ করুন →</span>
            <span
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-20deg]"
              style={{
                background:
                  "linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent)",
                animation: "notice-sheen 2.2s linear infinite",
              }}
            />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes notice-pop {
          0% { opacity: 0; transform: translateY(14px) scale(.94); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes notice-sheen {
          0% { left: -60%; } 100% { left: 120%; }
        }
      `}</style>
    </div>
  );
}

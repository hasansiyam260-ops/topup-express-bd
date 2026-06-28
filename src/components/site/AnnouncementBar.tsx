import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";

export function AnnouncementBar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Re-shows on every fresh visit (new tab/session). Hides only within the same session after close.
    const dismissed = sessionStorage.getItem("tue_ann_dismissed");
    if (!dismissed) setOpen(true);
  }, []);

  if (!open) return null;

  const close = () => {
    sessionStorage.setItem("tue_ann_dismissed", "1");
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-3 pt-2">
      <div
        className="relative overflow-hidden rounded-xl px-3 py-2 pr-9"
        style={{
          background:
            "linear-gradient(135deg,#ff5757 0%,#ef2b2b 55%,#c81818 100%)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,.18) inset, 0 10px 26px -10px rgba(239,68,68,.7), 0 0 22px rgba(239,68,68,.45)",
          animation: "ann-glow 2.4s ease-in-out infinite",
        }}
      >
        {/* glossy top sheen */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              "linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,0))",
          }}
        />
        {/* moving shine */}
        <span
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg]"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)",
            animation: "ann-sheen 3.6s linear infinite",
          }}
        />

        <div className="relative flex items-center gap-2">
          <span
            className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/95 text-rose-600 shadow"
            aria-hidden
          >
            <Info size={11} strokeWidth={3} />
          </span>
          <p
            className="flex-1 text-center text-[12.5px] sm:text-[13.5px] font-bold leading-[1.4] text-white line-clamp-2"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,.3)" }}

          >
            ২৪ ঘন্টাই টপআপ চালু • ১০ সেকেন্ডে অটো ডেলিভারি।
            <br />
            সমস্যায় <span className="underline decoration-white/80">মেসেঞ্জারে যোগাযোগ</span> করুন।
          </p>
        </div>

        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white/95 text-rose-600 shadow transition hover:scale-110"
        >
          <X size={11} strokeWidth={3} />
        </button>
      </div>

      <style>{`
        @keyframes ann-glow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,255,255,.18) inset, 0 10px 26px -10px rgba(239,68,68,.7), 0 0 18px rgba(239,68,68,.4); }
          50% { box-shadow: 0 0 0 1px rgba(255,255,255,.25) inset, 0 12px 30px -8px rgba(239,68,68,.85), 0 0 32px rgba(239,68,68,.7); }
        }
        @keyframes ann-sheen {
          0% { left: -40%; } 100% { left: 120%; }
        }
      `}</style>
    </div>
  );
}

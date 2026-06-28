import { useState } from "react";
import { Info, X } from "lucide-react";

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="mx-auto max-w-3xl px-3 pt-2">
      <div
        className="relative overflow-hidden rounded-xl px-3 py-2.5 pr-9"
        style={{
          background:
            "linear-gradient(135deg,#ff4d4d 0%,#ef2b2b 55%,#d11b1b 100%)",
          boxShadow:
            "0 10px 24px -10px rgba(239,68,68,.55), inset 0 1px 0 rgba(255,255,255,.28), inset 0 -1px 0 rgba(0,0,0,.18)",
        }}
      >
        {/* subtle glossy sheen */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              "linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,0))",
          }}
        />
        <div className="relative flex items-start gap-2">
          <span
            className="mt-[2px] grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/95 text-rose-600 shadow"
            aria-hidden
          >
            <Info size={12} strokeWidth={3} />
          </span>
          <p
            className="text-[12px] sm:text-[12.5px] font-bold leading-[1.45] text-white"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,.25)" }}
          >
            এখানে ২৪ ঘন্টাই টপআপ চালু থাকে। ১০ সেকেন্ডে অটো ডেলিভারি সিস্টেম।
            <br />
            যেকোনো সমস্যায় <span className="underline decoration-white/70">মেসেঞ্জারে যোগাযোগ</span> করুন।
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/95 text-rose-600 shadow transition hover:scale-110"
        >
          <X size={12} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

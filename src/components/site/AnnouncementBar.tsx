import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";

const THEME_BG: Record<string, string> = {
  rose: "linear-gradient(135deg,#ff5757 0%,#ef2b2b 55%,#c81818 100%)",
  emerald: "linear-gradient(135deg,#34d399 0%,#10b981 55%,#047857 100%)",
  amber: "linear-gradient(135deg,#fbbf24 0%,#f59e0b 55%,#b45309 100%)",
  sky: "linear-gradient(135deg,#38bdf8 0%,#0ea5e9 55%,#075985 100%)",
};
const THEME_GLOW: Record<string, string> = {
  rose: "rgba(239,68,68,.6)", emerald: "rgba(16,185,129,.6)", amber: "rgba(245,158,11,.6)", sky: "rgba(14,165,233,.6)",
};

export function AnnouncementBar() {
  const s = useSiteSettings();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = sessionStorage.getItem("tue_ann_dismissed");
    if (!dismissed) setOpen(true);
  }, []);

  if (!s.announcement_enabled || !s.announcement_text?.trim() || !open) return null;

  const close = () => { sessionStorage.setItem("tue_ann_dismissed", "1"); setOpen(false); };
  const bg = THEME_BG[s.announcement_theme] ?? THEME_BG.rose;
  const glow = THEME_GLOW[s.announcement_theme] ?? THEME_GLOW.rose;

  return (
    <div className="mx-auto max-w-3xl px-3 pt-2">
      <div className="relative overflow-hidden rounded-xl px-3 py-2 pr-9"
        style={{ background: bg, boxShadow: `0 0 0 1px rgba(255,255,255,.18) inset, 0 10px 26px -10px ${glow}, 0 0 22px ${glow}` }}>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2" style={{ background: "linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,0))" }} />
        <div className="relative flex items-center gap-2">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/95 text-slate-700 shadow"><Info size={11} strokeWidth={3} /></span>
          <p className="flex-1 text-center text-[12.5px] sm:text-[13.5px] font-bold leading-[1.4] text-white whitespace-pre-line"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,.3)" }}>{s.announcement_text}</p>
        </div>
        <button onClick={close} aria-label="Close" className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white/95 text-slate-700 shadow hover:scale-110 transition">
          <X size={11} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

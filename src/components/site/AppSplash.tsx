import { useEffect, useState } from "react";

export function AppSplash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    if (!standalone) return;
    // Only on first paint of this session
    if (sessionStorage.getItem("tue_splash_shown")) return;
    sessionStorage.setItem("tue_splash_shown", "1");
    setShow(true);
    const t = setTimeout(() => setShow(false), 1600);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0b0b14] animate-[splashFade_1.6s_ease-in-out_forwards]">
      <style>{`
        @keyframes splashFade { 0%,75%{opacity:1} 100%{opacity:0; visibility:hidden} }
        @keyframes splashGlow { 0%,100%{box-shadow:0 0 40px 8px rgba(244,63,94,0.55), 0 0 90px 20px rgba(244,63,94,0.25)} 50%{box-shadow:0 0 60px 14px rgba(244,63,94,0.85), 0 0 130px 30px rgba(244,63,94,0.35)} }
        @keyframes splashRing { 0%{transform:scale(0.9); opacity:0.9} 100%{transform:scale(1.6); opacity:0} }
        @keyframes splashPop { 0%{transform:scale(0.7); opacity:0} 60%{transform:scale(1.05); opacity:1} 100%{transform:scale(1); opacity:1} }
      `}</style>
      <div className="relative">
        <div className="absolute inset-0 rounded-full border border-red-400/60 animate-[splashRing_1.4s_ease-out_infinite]" />
        <div className="absolute inset-0 rounded-full border border-pink-400/40 animate-[splashRing_1.4s_ease-out_infinite] [animation-delay:.4s]" />
        <div
          className="relative h-28 w-28 overflow-hidden rounded-full bg-[#0b0b14] animate-[splashPop_.6s_ease-out,splashGlow_1.6s_ease-in-out_infinite]"
        >
          <img src="/icon-512.png" alt="TOP-UP EXPRESS" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}

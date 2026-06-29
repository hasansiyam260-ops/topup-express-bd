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
    if (sessionStorage.getItem("tue_splash_shown")) return;
    sessionStorage.setItem("tue_splash_shown", "1");
    setShow(true);
    const t = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0b0b14] animate-[splashFade_3s_ease-in-out_forwards]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@500;600;700&display=swap');
        @keyframes splashFade { 0%,88%{opacity:1} 100%{opacity:0; visibility:hidden} }
        @keyframes logoGlow {
          0%,100%{ box-shadow: 0 0 30px 4px rgba(244,63,94,0.45), 0 0 70px 14px rgba(244,63,94,0.20), inset 0 0 20px rgba(244,63,94,0.10); }
          50%{ box-shadow: 0 0 50px 10px rgba(244,63,94,0.70), 0 0 110px 26px rgba(244,63,94,0.30), inset 0 0 28px rgba(244,63,94,0.18); }
        }
        @keyframes splashRing { 0%{transform:scale(0.95); opacity:0.7} 100%{transform:scale(1.5); opacity:0} }
        @keyframes splashPop { 0%{transform:scale(0.75); opacity:0} 60%{transform:scale(1.04); opacity:1} 100%{transform:scale(1); opacity:1} }
        @keyframes salamRise { 0%{opacity:0; transform:translateY(14px) scale(.96); letter-spacing:.02em} 100%{opacity:1; transform:translateY(0) scale(1); letter-spacing:.08em} }
        @keyframes salamShine { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes dotPulse { 0%,80%,100%{opacity:.25; transform:scale(.85)} 40%{opacity:1; transform:scale(1)} }
      `}</style>

      <div className="relative">
        <div className="absolute inset-0 rounded-[28%] border border-red-400/50 animate-[splashRing_1.6s_ease-out_infinite]" />
        <div className="absolute inset-0 rounded-[28%] border border-pink-400/35 animate-[splashRing_1.6s_ease-out_infinite] [animation-delay:.5s]" />
        <div
          className="relative h-32 w-32 overflow-hidden rounded-[28%] bg-[#0b0b14] animate-[splashPop_.7s_ease-out,logoGlow_2.2s_ease-in-out_infinite]"
        >
          <img src="/icon-512.png" alt="TOP-UP EXPRESS" className="h-full w-full object-cover" />
        </div>
      </div>

      <div
        className="mt-8 animate-[salamRise_.9s_cubic-bezier(.2,.7,.2,1)_forwards]"
        style={{ fontFamily: "'Hind Siliguri', system-ui, sans-serif" }}
      >
        <div
          className="bg-clip-text text-transparent text-[22px] font-bold tracking-wide"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #ffd5dc 0%, #ffffff 25%, #ff6b81 50%, #ffffff 75%, #ffd5dc 100%)",
            backgroundSize: "200% 100%",
            animation: "salamShine 3s linear infinite",
            textShadow: "0 0 18px rgba(244,63,94,0.35)",
          }}
        >
          আসসালামু আলাইকুম
        </div>
      </div>

      <div className="mt-5 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-[dotPulse_1.2s_ease-in-out_infinite]" />
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-[dotPulse_1.2s_ease-in-out_infinite] [animation-delay:.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-[dotPulse_1.2s_ease-in-out_infinite] [animation-delay:.3s]" />
      </div>
    </div>
  );
}

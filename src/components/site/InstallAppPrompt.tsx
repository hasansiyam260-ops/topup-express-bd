import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "tue_install_dismissed_at";
const DISMISS_DAYS = 7;

function recentlyDismissed() {
  if (typeof window === "undefined") return false;
  const v = window.localStorage.getItem(DISMISS_KEY);
  if (!v) return false;
  const t = Number(v);
  if (!t) return false;
  return Date.now() - t < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export function InstallAppPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed?
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    if (standalone) return;
    if (recentlyDismissed()) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // iOS Safari fallback (no beforeinstallprompt)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
    if (isIOS && isSafari) {
      setIosHint(true);
      setShow(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setShow(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-3 z-[60] mx-auto flex max-w-[420px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0f0f1aef] px-3 py-2.5 shadow-[0_10px_40px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-[0_0_18px_rgba(244,63,94,0.55)]">
        <Download className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-white">Install TOP-UP EXPRESS</div>
        <div className="truncate text-[11px] text-white/70">
          {iosHint ? "Share → Add to Home Screen" : "Phone e app hisebe install korun"}
        </div>
      </div>
      {!iosHint && (
        <button
          onClick={install}
          className="rounded-lg bg-gradient-to-r from-red-500 to-pink-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_0_14px_rgba(244,63,94,0.45)] active:scale-95"
        >
          Install
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Close"
        className="rounded-md p-1 text-white/60 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

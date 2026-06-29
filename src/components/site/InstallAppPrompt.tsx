import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    if (standalone) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

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

  const dismiss = () => setShow(false);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  };

  return (
    <div className="fixed bottom-2 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-[#0f0f1aee] py-1 pl-1 pr-1.5 shadow-[0_6px_24px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-600 shadow-[0_0_10px_rgba(244,63,94,0.55)]">
        <Download className="h-3 w-3 text-white" />
      </div>
      {!iosHint ? (
        <button
          onClick={install}
          className="rounded-full bg-gradient-to-r from-red-500 to-pink-600 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-[0_0_10px_rgba(244,63,94,0.45)] active:scale-95"
        >
          Install App
        </button>
      ) : (
        <span className="px-1 text-[10px] font-medium text-white/85">Share → Add to Home Screen</span>
      )}
      <button
        onClick={dismiss}
        aria-label="Close"
        className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

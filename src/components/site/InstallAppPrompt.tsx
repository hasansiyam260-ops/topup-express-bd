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
    <div className="fixed bottom-3 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#0f0f1aee] py-2 pl-2 pr-2.5 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-600 shadow-[0_0_16px_rgba(244,63,94,0.6)]">
        <Download className="h-5 w-5 text-white" />
      </div>
      {!iosHint ? (
        <button
          onClick={install}
          className="rounded-full bg-gradient-to-r from-red-500 to-pink-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_16px_rgba(244,63,94,0.5)] active:scale-95"
        >
          Install App
        </button>
      ) : (
        <span className="px-2 text-[13px] font-medium text-white/85">Share → Add to Home Screen</span>
      )}
      <button
        onClick={dismiss}
        aria-label="Close"
        className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
      >
        <X className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}

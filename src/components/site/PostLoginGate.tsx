import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Renders children only after:
 *  1. User is logged in
 *  2. App splash has finished (3s) — or splash never showed
 */
export function PostLoginGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setAuthed(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    const splashWillShow =
      standalone && !sessionStorage.getItem("tue_splash_done");
    if (!splashWillShow) {
      setSplashDone(true);
      return;
    }
    const onDone = () => setSplashDone(true);
    window.addEventListener("tue:splash-done", onDone);
    // Safety fallback
    const t = setTimeout(onDone, 3500);
    return () => {
      window.removeEventListener("tue:splash-done", onDone);
      clearTimeout(t);
    };
  }, []);

  if (!authed || !splashDone) return null;
  return <>{children}</>;
}

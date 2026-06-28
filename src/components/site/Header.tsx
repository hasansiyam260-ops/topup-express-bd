import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setAuthed(event !== "SIGNED_OUT");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/85 border-b border-border">
      <div className="mx-auto max-w-7xl px-3 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center min-w-0 group" aria-label="TOP-UP EXPRESS">
          <span className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#0b0b14] to-[#15101f] ring-1 ring-white/10 shadow-[0_0_24px_-6px_rgba(236,72,153,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <span aria-hidden className="absolute -inset-[2px] rounded-xl bg-[conic-gradient(from_0deg,#ec4899,#a855f7,#06b6d4,#ec4899)] opacity-60 blur-md -z-10 animate-pulse" />
            <span
              className="font-display font-black tracking-[0.14em] text-[15px] sm:text-[17px] leading-none bg-clip-text text-transparent bg-[linear-gradient(180deg,#fff_0%,#ffe9f5_45%,#ff7ac6_100%)]"
              style={{ textShadow: "0 0 10px rgba(236,72,153,0.65), 0 0 22px rgba(168,85,247,0.45)" }}
            >
              TOP-UP
            </span>
            <span
              className="font-display font-black tracking-[0.14em] text-[15px] sm:text-[17px] leading-none bg-clip-text text-transparent bg-[linear-gradient(180deg,#fff_0%,#e0f7ff_45%,#22d3ee_100%)]"
              style={{ textShadow: "0 0 10px rgba(34,211,238,0.7), 0 0 22px rgba(6,182,212,0.45)" }}
            >
              EXPRESS
            </span>
            <span aria-hidden className="absolute inset-x-2 top-[3px] h-[6px] rounded-full bg-white/15 blur-[2px]" />
          </span>
        </Link>

        <nav className="flex items-center gap-2 shrink-0">
          {authed ? (
            <Link
              to="/profile"
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-border bg-card text-foreground hover:border-neon-violet/50"
            >
              Profile
            </Link>
          ) : (
            <>
              <button
                onClick={() => navigate({ to: "/auth", search: { mode: "register" } })}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-secondary text-foreground hover:bg-muted transition"
              >
                Register
              </button>
              <button
                onClick={() => navigate({ to: "/auth", search: { mode: "login" } })}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-foreground text-background hover:opacity-90 transition"
              >
                Login
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

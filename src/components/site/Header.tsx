import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-uid.png";

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
    <header
      className="sticky top-0 z-40 backdrop-blur-xl bg-background/85 border-b border-rose-200/60"
      style={{
        boxShadow:
          "0 8px 24px -10px rgba(244,63,94,0.28), 0 0 28px -6px rgba(244,63,94,0.18), inset 0 -1px 0 rgba(244,63,94,0.12)",
        backgroundImage:
          "radial-gradient(120% 80% at 50% 0%, rgba(244,63,94,0.10), transparent 60%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-3 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center min-w-0" aria-label="TOP-UP EXPRESS">
          <img
            src={logo}
            alt="TOP-UP EXPRESS"
              width={360}
              height={144}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-16 sm:h-20 w-auto drop-shadow-[0_0_14px_rgba(236,72,153,0.35)]"
          />
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

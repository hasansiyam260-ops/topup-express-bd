import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crown } from "lucide-react";

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
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-onyx/70 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="relative grid place-items-center h-10 w-10 rounded-lg card-luxe">
            <Crown className="h-5 w-5 text-gold" />
          </span>
          <div className="leading-none">
            <div className="font-display text-2xl gold-text">UID TOPUP</div>
            <div className="text-[10px] tracking-[0.25em] text-muted-foreground -mt-0.5">PREMIUM • FREE FIRE</div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          {authed ? (
            <Link
              to="/profile"
              className="px-4 py-2 rounded-md text-sm font-semibold gold-border text-gold-soft hover:bg-gold/10"
            >
              Profile
            </Link>
          ) : (
            <>
              <button
                onClick={() => navigate({ to: "/auth", search: { mode: "register" } })}
                className="px-3 py-2 rounded-md text-sm font-semibold text-foreground/80 hover:text-gold-soft"
              >
                Register
              </button>
              <button
                onClick={() => navigate({ to: "/auth", search: { mode: "login" } })}
                className="btn-gold px-5 py-2 rounded-md text-sm"
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

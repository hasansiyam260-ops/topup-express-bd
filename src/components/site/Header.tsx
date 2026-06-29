import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-uid.png";

export function Header() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setUserId(data.session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setAuthed(event !== "SIGNED_OUT");
        setUserId(session?.user?.id ?? null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) { setBalance(null); return; }
    let active = true;
    const load = async () => {
      const { data } = await supabase.from("profiles").select("balance").eq("id", userId).maybeSingle();
      if (active) setBalance(Number(data?.balance ?? 0));
    };
    load();
    const ch = supabase
      .channel(`profile-balance-${userId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` }, (payload: any) => {
        if (active) setBalance(Number(payload.new?.balance ?? 0));
      })
      .subscribe();
    const iv = setInterval(load, 15000);
    return () => { active = false; clearInterval(iv); supabase.removeChannel(ch); };
  }, [userId]);

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
              to="/wallet"
              aria-label="My Balance"
              className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white shadow-[0_8px_22px_-8px_rgba(244,63,94,0.55)] ring-1 ring-white/20 overflow-hidden"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #f43f5e 0%, #ec4899 55%, #a21caf 100%)",
              }}
            >
              <span className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.45),transparent_55%)]" />
              <span className="relative grid place-items-center h-6 w-6 rounded-lg bg-white/20 ring-1 ring-white/40 shrink-0">
                <Wallet className="h-3.5 w-3.5" />
              </span>
              <span className="relative flex flex-col leading-none">
                <span className="text-[8px] tracking-[0.22em] uppercase text-white/85 font-bold">Balance</span>
                <span className="text-[14px] font-display mt-0.5 font-bold">
                  ৳{balance == null ? "—" : Math.round(balance).toLocaleString()}
                </span>
              </span>
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

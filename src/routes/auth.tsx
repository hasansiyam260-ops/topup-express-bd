import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AppShell } from "@/components/site/AppShell";
import { toast } from "sonner";
import { Mail, Lock, User2 } from "lucide-react";

const searchSchema = z.object({ mode: z.enum(["login", "register"]).optional(), ref: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Login or Register — TOP-UP EXPRESS" }, { name: "description", content: "Sign in to your TOP-UP EXPRESS account to purchase Free Fire diamonds and memberships." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "login", ref } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">(mode);
  useEffect(() => setTab(mode), [mode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/profile" });
    });
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "register") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success("Account created! You can now login.");
        setTab("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error("Google sign-in failed");
    else if (!result.redirected) navigate({ to: "/" });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-10">
        <div className="card-luxe rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="font-display text-4xl gold-text">{tab === "login" ? "WELCOME BACK" : "JOIN TOP-UP EXPRESS"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === "login" ? "Sign in to continue topping up" : "Create your premium account"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-elevated mb-6">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition-all ${
                  tab === t ? "btn-gold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {tab === "register" && (
              <Field icon={<User2 className="h-4 w-4" />}>
                <input
                  required value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={80}
                  placeholder="Full name" className="flex-1 bg-transparent outline-none text-sm py-3"
                />
              </Field>
            )}
            <Field icon={<Mail className="h-4 w-4" />}>
              <input
                required type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120}
                placeholder="Email" className="flex-1 bg-transparent outline-none text-sm py-3"
              />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />}>
              <input
                required type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} maxLength={72}
                placeholder="Password (min 6 chars)" className="flex-1 bg-transparent outline-none text-sm py-3"
              />
            </Field>

            <button disabled={loading} className="w-full btn-gold py-3 rounded-lg disabled:opacity-50">
              {loading ? "Please wait..." : tab === "login" ? "Login" : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={google}
            className="w-full py-3 rounded-lg gold-border bg-onyx text-foreground hover:bg-gold/10 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <GoogleIcon /> Continue with Google
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 rounded-lg bg-input border border-border focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30">
      <span className="text-gold">{icon}</span>
      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
  );
}

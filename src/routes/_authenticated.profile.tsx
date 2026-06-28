import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/site/AppShell";
import { toast } from "sonner";
import { LogOut, Wallet, User, ShoppingBag, CheckCircle2, XCircle, Timer, TrendingUp, Gamepad2, Hash } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My Profile — UIDTOPUP.COM" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, refetch } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (error) throw error;
      return { ...data, email: u.user.email };
    },
  });

  const { data: orderStats } = useQuery({
    queryKey: ["my-order-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("amount,status,player_uid,player_name,product_name,created_at,updated_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = data ?? [];
      const total = rows.length;
      const completed = rows.filter((o) => o.status === "completed");
      const cancelled = rows.filter((o) => o.status === "cancelled" || o.status === "failed");
      const pending = rows.filter((o) => o.status === "pending" || o.status === "processing");
      const spent = completed.reduce((s, o) => s + Number(o.amount || 0), 0);
      const times = completed
        .map((o) => (new Date(o.updated_at).getTime() - new Date(o.created_at).getTime()) / 60000)
        .filter((m) => m > 0 && m < 60 * 24);
      const avgMin = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
      const last = rows.find((o) => o.player_uid);
      return { total, completed: completed.length, cancelled: cancelled.length, pending: pending.length, spent, avgMin, last };
    },
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setAddress(profile.address ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return setSaving(false);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName.trim().slice(0, 100),
      phone: phone.trim().slice(0, 20),
      address: address.trim().slice(0, 300),
      avatar_url: avatarUrl.trim().slice(0, 500),
    }).eq("id", u.user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    refetch();
  };

  const logout = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-3 pt-4 space-y-4">
        {/* Profile header */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 px-4 py-3 text-white shadow-[0_10px_30px_-14px_rgba(192,38,211,0.55)]">
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="h-11 w-11 rounded-full ring-2 ring-white/40 bg-white/15 grid place-items-center overflow-hidden shrink-0">
              {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : <User className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <div className="font-display text-lg leading-tight truncate">{fullName || "Welcome"}</div>
              <div className="text-[11px] text-white/85 truncate">{profile?.email}</div>
            </div>
          </div>
        </div>

        {/* Wallet */}
        <div className="rounded-2xl card-soft p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid place-items-center h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-rose-600 text-white shrink-0"><Wallet className="h-5 w-5" /></span>
            <div className="min-w-0">
              <div className="text-[10px] tracking-widest uppercase text-muted-foreground">Wallet Balance</div>
              <div className="font-display text-3xl text-primary leading-none">৳{Number(profile?.balance ?? 0).toFixed(0)}</div>
            </div>
          </div>
          <button onClick={() => navigate({ to: "/wallet" })} className="btn-red px-4 py-2.5 rounded-xl text-sm shrink-0">Add Money</button>
        </div>

        {/* Stats overview */}
        <div className="relative isolate rounded-2xl bg-white p-4 ring-1 ring-rose-300 shadow-[0_8px_26px_-12px_rgba(239,68,68,0.45)]">
          <div className="pointer-events-none absolute -top-2 -left-2 -z-10 h-14 w-14 rounded-full bg-red-500/55 blur-2xl" />
          <div className="pointer-events-none absolute -top-2 -right-2 -z-10 h-14 w-14 rounded-full bg-red-500/55 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-2 -left-2 -z-10 h-14 w-14 rounded-full bg-red-500/55 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-2 -right-2 -z-10 h-14 w-14 rounded-full bg-red-500/55 blur-2xl" />
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl shadow-[0_0_22px_3px_rgba(239,68,68,0.42),0_0_46px_8px_rgba(248,113,113,0.24)]" />
          <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-rose-300/45 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-rose-300/35 blur-3xl" />
          <div className="relative flex items-center gap-2 mb-3">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-sky-500 text-white ring-1 ring-white shadow-[0_4px_14px_-2px_rgba(244,63,94,0.5)]"><TrendingUp className="h-4 w-4" /></span>
            <div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-slate-500 leading-none">Activity</div>
              <h2 className="font-display text-base leading-tight mt-0.5 text-slate-900">MY STATS</h2>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-2">
            <StatTile icon={<ShoppingBag className="h-3.5 w-3.5" />} label="Total Orders" value={String(orderStats?.total ?? 0)} accent="sky" />
            <StatTile icon={<Wallet className="h-3.5 w-3.5" />} label="Total Spent" value={`৳${Number(orderStats?.spent ?? 0).toLocaleString()}`} accent="rose" />
            <StatTile icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Completed" value={String(orderStats?.completed ?? 0)} accent="sky" />
            <StatTile icon={<XCircle className="h-3.5 w-3.5" />} label="Cancelled" value={String(orderStats?.cancelled ?? 0)} accent="rose" />
            <StatTile icon={<Timer className="h-3.5 w-3.5" />} label="Avg Delivery" value={orderStats?.avgMin ? `${orderStats.avgMin}m` : "—"} accent="sky" />
            <StatTile icon={<ShoppingBag className="h-3.5 w-3.5" />} label="Pending" value={String(orderStats?.pending ?? 0)} accent="rose" />
          </div>
        </div>

        {/* Game identity */}
        {orderStats?.last && (
          <div className="relative rounded-2xl overflow-hidden p-4 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-[0_10px_30px_-14px_rgba(37,99,235,0.5)]">
            <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <span className="grid place-items-center h-11 w-11 rounded-xl bg-white/15 ring-1 ring-white/30 shrink-0">
                <Gamepad2 className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] tracking-[0.3em] uppercase text-white/70 leading-none">Last Topup Account</div>
                <div className="font-display text-base leading-tight mt-1 truncate">
                  {orderStats.last.player_name || "Free Fire Player"}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-white/85 font-mono">
                  <Hash className="h-3 w-3" /> {orderStats.last.player_uid}
                </div>
              </div>
            </div>
          </div>
        )}


        <form onSubmit={save} className="rounded-2xl card-soft p-5 space-y-3">
          <h2 className="font-display text-2xl mb-2">Account Details</h2>
          <Input label="Full name" value={fullName} onChange={setFullName} max={100} />
          <Input label="Phone" value={phone} onChange={setPhone} max={20} />
          <Input label="Avatar URL" value={avatarUrl} onChange={setAvatarUrl} max={500} />
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Address</label>
            <textarea
              value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} rows={3}
              className="w-full px-3 py-2 rounded-lg bg-input border-2 border-border focus:border-neon-violet focus:outline-none text-sm"
            />
          </div>
          <button disabled={saving} className="btn-red w-full py-3 rounded-xl disabled:opacity-50">
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </form>

        <button onClick={logout} className="w-full py-3 rounded-xl border-2 border-destructive/40 text-destructive font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-destructive/10">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </AppShell>
  );
}

function Input({ label, value, onChange, max }: { label: string; value: string; onChange: (v: string) => void; max: number }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</label>
      <input
        value={value} onChange={(e) => onChange(e.target.value)} maxLength={max}
        className="w-full px-3 py-2 rounded-lg bg-input border-2 border-border focus:border-neon-violet focus:outline-none text-sm"
      />
    </div>
  );
}

function StatTile({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: "rose" | "sky" }) {
  const styles = accent === "rose"
    ? { bg: "bg-gradient-to-br from-rose-50 to-white", ring: "ring-rose-200", chip: "bg-rose-500 text-white", value: "text-rose-600", shadow: "shadow-[0_6px_18px_-8px_rgba(244,63,94,0.5)]" }
    : { bg: "bg-gradient-to-br from-sky-50 to-white", ring: "ring-sky-200", chip: "bg-sky-500 text-white", value: "text-sky-600", shadow: "shadow-[0_6px_18px_-8px_rgba(14,165,233,0.5)]" };
  return (
    <div className={`relative overflow-hidden rounded-xl p-2.5 ${styles.bg} ring-1 ${styles.ring} ${styles.shadow}`}>
      <div className="flex items-center gap-1.5 text-slate-600 text-[9px] tracking-[0.2em] uppercase font-semibold">
        <span className={`grid place-items-center h-5 w-5 rounded-md ${styles.chip} shadow-sm`}>{icon}</span>
        {label}
      </div>
      <div className={`font-display text-xl leading-tight mt-1 ${styles.value}`}>{value}</div>
    </div>
  );
}

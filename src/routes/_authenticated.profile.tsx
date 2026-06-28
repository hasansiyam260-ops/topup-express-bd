import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/site/AppShell";
import { getFFPlayerName } from "@/lib/ff.functions";
import { LogOut, Wallet, User, ShoppingBag, CheckCircle2, XCircle, Timer, TrendingUp, Gamepad2, Hash, Trophy, Heart, Globe2 } from "lucide-react";


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

        {/* Wallet — medium compact */}
        <div className="rounded-xl card-soft px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid place-items-center h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-rose-600 text-white shrink-0"><Wallet className="h-4 w-4" /></span>
            <div className="min-w-0">
              <div className="text-[9px] tracking-widest uppercase text-muted-foreground leading-none">Wallet Balance</div>
              <div className="font-display text-xl text-primary leading-tight mt-0.5">৳{Number(profile?.balance ?? 0).toFixed(0)}</div>
            </div>
          </div>
          <button onClick={() => navigate({ to: "/wallet" })} className="btn-red px-3 py-1.5 rounded-lg text-xs shrink-0">Add Money</button>
        </div>


        {/* Stats overview */}
        <div className="relative isolate overflow-visible rounded-2xl bg-[linear-gradient(135deg,rgba(255,241,245,0.98),rgba(255,255,255,0.98)_50%,rgba(255,232,240,0.96))] p-3 ring-1 ring-rose-300/80 shadow-[0_0_22px_4px_rgba(244,63,94,0.35),0_0_55px_10px_rgba(244,63,94,0.22),inset_0_0_18px_rgba(244,63,94,0.10)]">
          <div className="relative flex items-center gap-2 mb-2.5">
            <span className="grid place-items-center h-7 w-7 rounded-lg bg-gradient-to-br from-rose-500 to-sky-500 text-white ring-1 ring-white shadow-[0_4px_14px_-2px_rgba(244,63,94,0.5)]"><TrendingUp className="h-3.5 w-3.5" /></span>
            <div>
              <div className="text-[8px] tracking-[0.3em] uppercase text-slate-500 leading-none">Activity</div>
              <h2 className="font-display text-sm leading-tight mt-0.5 text-slate-900">MY STATS</h2>
            </div>
          </div>
          <div className="relative grid grid-cols-3 gap-1.5">
            <StatTile icon={<ShoppingBag className="h-3 w-3" />} label="Orders" value={String(orderStats?.total ?? 0)} accent="sky" />
            <StatTile icon={<Wallet className="h-3 w-3" />} label="Spent" value={`৳${Number(orderStats?.spent ?? 0).toLocaleString()}`} accent="rose" />
            <StatTile icon={<CheckCircle2 className="h-3 w-3" />} label="Done" value={String(orderStats?.completed ?? 0)} accent="sky" />
            <StatTile icon={<XCircle className="h-3 w-3" />} label="Cancel" value={String(orderStats?.cancelled ?? 0)} accent="rose" />
            <StatTile icon={<Timer className="h-3 w-3" />} label="Avg" value={orderStats?.avgMin ? `${orderStats.avgMin}m` : "—"} accent="sky" />
            <StatTile icon={<ShoppingBag className="h-3 w-3" />} label="Pending" value={String(orderStats?.pending ?? 0)} accent="rose" />
          </div>
        </div>


        {/* Game Account — fetched live from FF API */}
        {orderStats?.last?.player_uid && (
          <GameAccountCard uid={orderStats.last.player_uid} fallbackName={orderStats.last.player_name} />
        )}


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

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string; accent?: "rose" | "sky" }) {
  return (
    <div className="relative overflow-hidden rounded-lg p-1.5 bg-[linear-gradient(135deg,rgba(255,224,232,0.98),rgba(255,248,250,0.98)_55%,rgba(255,232,238,0.96))] ring-1 ring-rose-300 shadow-[0_4px_14px_-6px_rgba(225,29,72,0.55),inset_0_0_14px_rgba(244,63,94,0.10)]">
      <div className="flex items-center gap-1 text-red-600 text-[8px] tracking-[0.15em] uppercase font-semibold leading-none">
        <span className="grid place-items-center h-4 w-4 rounded bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-[0_3px_8px_-2px_rgba(225,29,72,0.75)]">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <div className="font-display text-base leading-tight mt-1 text-red-600">{value}</div>
    </div>
  );
}

function GameAccountCard({ uid, fallbackName }: { uid: string; fallbackName?: string | null }) {
  const fetchInfo = useServerFn(getFFPlayerName);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["ff-player-info", uid],
    queryFn: () => fetchInfo({ data: { uid } }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const name = data?.name || fallbackName || "Free Fire Player";
  return (
    <div className="relative rounded-xl overflow-hidden p-3 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-[0_8px_24px_-12px_rgba(37,99,235,0.55)]">
      <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-white/15 blur-2xl" />
      <div className="relative flex items-center gap-2.5 mb-2.5">
        <span className="grid place-items-center h-9 w-9 rounded-lg bg-white/15 ring-1 ring-white/30 shrink-0">
          <Gamepad2 className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[8px] tracking-[0.3em] uppercase text-white/70 leading-none">Game Account</div>
          <div className="font-display text-sm leading-tight mt-1 truncate">{name}</div>
        </div>
        {data?.region && (
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/15 ring-1 ring-white/30 uppercase tracking-wider">
            {data.region}
          </span>
        )}
      </div>
      <div className="relative grid grid-cols-2 gap-1.5">
        <GameStat icon={<Hash className="h-3 w-3" />} label="UID" value={uid} mono />
        <GameStat icon={<User className="h-3 w-3" />} label="Name" value={isLoading ? "…" : (isError ? "—" : name)} />
        <GameStat icon={<Trophy className="h-3 w-3" />} label="Level" value={isLoading ? "…" : (data?.level != null ? String(data.level) : "—")} />
        <GameStat icon={<Heart className="h-3 w-3" />} label="Likes" value={isLoading ? "…" : (data?.likes != null ? Number(data.likes).toLocaleString() : "—")} />
      </div>
      {isError && (
        <div className="relative mt-2 text-[10px] text-white/80 flex items-center gap-1">
          <Globe2 className="h-3 w-3" /> Live info unavailable
        </div>
      )}
    </div>
  );
}

function GameStat({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg p-2 bg-white/12 ring-1 ring-white/25 backdrop-blur-sm">
      <div className="flex items-center gap-1 text-[8px] tracking-[0.2em] uppercase text-white/75 leading-none">
        <span className="grid place-items-center h-4 w-4 rounded bg-white/20">{icon}</span>
        {label}
      </div>
      <div className={`mt-1 text-sm font-semibold text-white leading-tight truncate ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}


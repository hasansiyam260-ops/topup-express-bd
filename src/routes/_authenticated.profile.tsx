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

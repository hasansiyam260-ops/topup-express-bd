import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/site/AppShell";
import { toast } from "sonner";
import { LogOut, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My Profile — UID Topup" }] }),
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
      <div className="mx-auto max-w-3xl px-4 pt-6 space-y-5">
        <div className="card-luxe rounded-2xl p-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full gold-border bg-gold/10 grid place-items-center overflow-hidden">
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : <span className="font-display text-3xl gold-text">{(fullName || profile?.email || "U")[0]?.toUpperCase()}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-2xl truncate">{fullName || "Welcome"}</div>
            <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
          </div>
        </div>

        <div className="card-luxe rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-10 w-10 rounded-md bg-gold/10 gold-border"><Wallet className="h-5 w-5 text-gold" /></span>
            <div>
              <div className="text-xs tracking-widest uppercase text-muted-foreground">Wallet Balance</div>
              <div className="font-display text-3xl gold-text">৳{Number(profile?.balance ?? 0).toFixed(0)}</div>
            </div>
          </div>
          <button onClick={() => navigate({ to: "/wallet" })} className="btn-gold px-4 py-2 rounded-md text-sm">Add Money</button>
        </div>

        <form onSubmit={save} className="card-luxe rounded-2xl p-5 space-y-3">
          <h2 className="font-display text-2xl mb-2">Account Details</h2>
          <Input label="Full name" value={fullName} onChange={setFullName} max={100} />
          <Input label="Phone" value={phone} onChange={setPhone} max={20} />
          <Input label="Avatar URL" value={avatarUrl} onChange={setAvatarUrl} max={500} />
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Address</label>
            <textarea
              value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} rows={3}
              className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:border-gold focus:outline-none text-sm"
            />
          </div>
          <button disabled={saving} className="btn-gold w-full py-3 rounded-lg disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <button onClick={logout} className="w-full py-3 rounded-lg border border-destructive/40 text-destructive font-semibold flex items-center justify-center gap-2 hover:bg-destructive/10">
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
        className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:border-gold focus:outline-none text-sm"
      />
    </div>
  );
}

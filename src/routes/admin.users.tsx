import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListUsers, adminUpdateUserBalance, adminToggleRole } from "@/lib/admin.functions";
import { Shield, ShieldOff, Search, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListUsers);
  const balFn = useServerFn(adminUpdateUserBalance);
  const roleFn = useServerFn(adminToggleRole);
  const { data } = useSuspenseQuery({ queryKey: ["admin", "users"], queryFn: () => listFn() });
  const [search, setSearch] = useState("");

  const balM = useMutation({
    mutationFn: (v: { userId: string; balance: number }) => balFn({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("Balance updated"); },
    onError: (e: any) => toast.error(e.message),
  });
  const roleM = useMutation({
    mutationFn: (v: { userId: string; role: "admin" | "user"; grant: boolean }) => roleFn({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("Role updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = data.filter((u: any) => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.game_uid?.includes(search));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-slate-900">Users ({data.length})</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input placeholder="Search email, name, or UID…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm focus:border-rose-500 focus:outline-none" />
      </div>

      <div className="space-y-3">
        {filtered.map((u: any) => <UserCard key={u.id} u={u} onSaveBalance={(b) => balM.mutate({ userId: u.id, balance: b })} onToggleRole={(grant) => roleM.mutate({ userId: u.id, role: "admin", grant })} />)}
        {filtered.length === 0 && <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-400">No users found</div>}
      </div>
    </div>
  );
}

function UserCard({ u, onSaveBalance, onToggleRole }: { u: any; onSaveBalance: (b: number) => void; onToggleRole: (grant: boolean) => void }) {
  const isAdmin = u.roles.includes("admin");
  const [bal, setBal] = useState(String(u.balance ?? 0));
  const dirty = Number(bal) !== Number(u.balance ?? 0);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-black text-slate-900">{u.full_name || "—"}</div>
          <div className="truncate text-xs text-slate-500">{u.email}</div>
          {u.game_uid && <div className="mt-0.5 font-mono text-[11px] text-slate-600">UID: {u.game_uid}</div>}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${isAdmin ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{isAdmin ? "ADMIN" : "USER"}</span>
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Wallet Balance (৳)</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={bal}
            onChange={(e) => setBal(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-mono focus:border-rose-500 focus:outline-none"
          />
          <button
            onClick={() => onSaveBalance(Number(bal))}
            disabled={!dirty}
            className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2.5 text-xs font-bold text-white active:scale-95 disabled:opacity-30"
          >
            <Check className="h-3.5 w-3.5" /> Save
          </button>
        </div>
      </div>

      <button
        onClick={() => onToggleRole(!isAdmin)}
        className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-bold active:scale-95 ${
          isAdmin ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-rose-600 text-white hover:bg-rose-700"
        }`}
      >
        {isAdmin ? <><ShieldOff className="h-4 w-4" /> Remove Admin</> : <><Shield className="h-4 w-4" /> Make Admin</>}
      </button>
    </div>
  );
}

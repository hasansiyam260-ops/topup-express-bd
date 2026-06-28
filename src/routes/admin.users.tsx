import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListUsers, adminUpdateUserBalance, adminToggleRole } from "@/lib/admin.functions";
import { Shield, ShieldOff } from "lucide-react";
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

  const filtered = data.filter((u: any) => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-slate-900">Users ({data.length})</h1>
        <input placeholder="Search email or name" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-md border px-3 py-1.5 text-xs focus:border-rose-500 focus:outline-none" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase text-slate-600">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Game UID</th>
              <th className="px-3 py-2">Balance</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((u: any) => {
              const isAdmin = u.roles.includes("admin");
              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <div className="font-bold text-slate-900">{u.full_name || "—"}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{u.game_uid || "—"}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      defaultValue={u.balance}
                      onBlur={(e) => { const v = Number(e.target.value); if (v !== Number(u.balance)) balM.mutate({ userId: u.id, balance: v }); }}
                      className="w-24 rounded border px-2 py-1 text-xs focus:border-rose-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isAdmin ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{isAdmin ? "ADMIN" : "USER"}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => roleM.mutate({ userId: u.id, role: "admin", grant: !isAdmin })} className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-bold ${isAdmin ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-rose-600 text-white hover:bg-rose-700"}`}>
                      {isAdmin ? <><ShieldOff className="h-3 w-3" /> Demote</> : <><Shield className="h-3 w-3" /> Promote</>}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

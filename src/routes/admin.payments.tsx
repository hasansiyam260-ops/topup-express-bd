import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListPayments, adminUpsertPayment, adminDeletePayment } from "@/lib/admin.functions";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EditorModal, Field, ToggleRow } from "./admin.categories";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPayments,
});

type PM = { id?: string; name: string; number: string; account_type: string; instructions?: string | null; brand_color?: string | null; logo_url?: string | null; is_active: boolean; sort_order: number };
const empty: PM = { name: "", number: "", account_type: "personal", instructions: "", brand_color: "#E2136E", logo_url: "", is_active: true, sort_order: 0 };

function AdminPayments() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListPayments);
  const upsertFn = useServerFn(adminUpsertPayment);
  const delFn = useServerFn(adminDeletePayment);
  const { data } = useSuspenseQuery({ queryKey: ["admin", "payments"], queryFn: () => listFn() });
  const [editing, setEditing] = useState<PM | null>(null);

  const upsertM = useMutation({
    mutationFn: (p: PM) => upsertFn({ data: { payment: p } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "payments"] }); qc.invalidateQueries({ queryKey: ["payment_methods"] }); setEditing(null); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "payments"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-black text-slate-900">Payment Methods</h1>
        <button onClick={() => setEditing({ ...empty })} className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow active:scale-95">
          <Plus className="h-4 w-4" /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.map((p: any) => (
          <div key={p.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="h-2" style={{ background: p.brand_color || "#475569" }} />
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-base font-black text-slate-900">{p.name}</div>
                  <div className="truncate font-mono text-sm text-slate-700">{p.number}</div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase text-slate-500">{p.account_type}</div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${p.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{p.is_active ? "ON" : "OFF"}</span>
              </div>
              {p.instructions && <p className="mt-2 line-clamp-2 text-xs text-slate-600">{p.instructions}</p>}
              <div className="mt-3 flex gap-2">
                <button onClick={() => setEditing(p)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2.5 text-sm font-bold text-white active:scale-95">
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) delM.mutate(p.id); }} className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2.5 text-sm font-bold text-rose-600 active:scale-95">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditorModal title={editing.id ? "Edit Payment Method" : "Add Payment Method"} onClose={() => setEditing(null)} onSave={() => upsertM.mutate(editing)} saving={upsertM.isPending}>
          <Field label="Name" hint="e.g. bKash, Nagad, Rocket"><input className="adm-input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
          <Field label="Account Number"><input className="adm-input" value={editing.number} onChange={(e) => setEditing({ ...editing, number: e.target.value })} /></Field>
          <Field label="Account Type">
            <select className="adm-input" value={editing.account_type} onChange={(e) => setEditing({ ...editing, account_type: e.target.value })}>
              <option value="personal">Personal</option>
              <option value="agent">Agent</option>
              <option value="merchant">Merchant</option>
            </select>
          </Field>
          <Field label="Brand Color">
            <div className="flex gap-2">
              <input type="color" value={editing.brand_color ?? "#E2136E"} onChange={(e) => setEditing({ ...editing, brand_color: e.target.value })} className="h-12 w-16 cursor-pointer rounded-lg border border-slate-200" />
              <input className="adm-input flex-1" value={editing.brand_color ?? ""} onChange={(e) => setEditing({ ...editing, brand_color: e.target.value })} placeholder="#E2136E" />
            </div>
          </Field>
          <Field label="Logo URL"><input className="adm-input" value={editing.logo_url ?? ""} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} /></Field>
          <Field label="Instructions" hint="Shown to user during payment"><textarea rows={3} className="adm-input" value={editing.instructions ?? ""} onChange={(e) => setEditing({ ...editing, instructions: e.target.value })} /></Field>
          <Field label="Sort Order"><input type="number" className="adm-input" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
          <ToggleRow label="Active (visible to users)" checked={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
        </EditorModal>
      )}
    </div>
  );
}

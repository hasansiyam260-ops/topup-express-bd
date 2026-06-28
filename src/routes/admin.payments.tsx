import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListPayments, adminUpsertPayment, adminDeletePayment } from "@/lib/admin.functions";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
        <h1 className="text-2xl font-black text-slate-900">Payment Methods</h1>
        <button onClick={() => setEditing(empty)} className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-rose-700">
          <Plus className="h-3.5 w-3.5" /> Add Method
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.map((p: any) => (
          <div key={p.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="h-2" style={{ background: p.brand_color || "#475569" }} />
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-black text-slate-900">{p.name}</div>
                  <div className="font-mono text-sm text-slate-700">{p.number}</div>
                  <div className="mt-1 text-[11px] font-bold uppercase text-slate-500">{p.account_type}</div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{p.is_active ? "ACTIVE" : "OFF"}</span>
              </div>
              {p.instructions && <p className="mt-2 text-xs text-slate-600">{p.instructions}</p>}
              <div className="mt-3 flex justify-end gap-1">
                <button onClick={() => setEditing(p)} className="rounded p-1.5 text-sky-600 hover:bg-sky-50"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => { if (confirm("Delete?")) delM.mutate(p.id); }} className="rounded p-1.5 text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h2 className="mb-4 text-lg font-black">{editing.id ? "Edit" : "Add"} Payment Method</h2>
            <div className="space-y-3">
              <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Field label="Number" value={editing.number} onChange={(v) => setEditing({ ...editing, number: v })} />
              <Field label="Account Type (personal/agent/merchant)" value={editing.account_type} onChange={(v) => setEditing({ ...editing, account_type: v })} />
              <Field label="Brand Color (hex)" value={editing.brand_color ?? ""} onChange={(v) => setEditing({ ...editing, brand_color: v })} />
              <Field label="Logo URL" value={editing.logo_url ?? ""} onChange={(v) => setEditing({ ...editing, logo_url: v })} />
              <Field label="Sort Order" type="number" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) })} />
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Instructions</label>
                <textarea value={editing.instructions ?? ""} onChange={(e) => setEditing({ ...editing, instructions: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-rose-500 focus:outline-none" />
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
              <button disabled={upsertM.isPending} onClick={() => upsertM.mutate(editing)} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50">{upsertM.isPending ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none" />
    </div>
  );
}

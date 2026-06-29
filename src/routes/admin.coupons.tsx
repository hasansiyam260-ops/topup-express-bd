import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListCoupons, adminUpsertCoupon, adminDeleteCoupon } from "@/lib/coupons.functions";
import { Plus, Edit2, Trash2, Tag, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCoupons,
});

function AdminCoupons() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListCoupons);
  const upFn = useServerFn(adminUpsertCoupon);
  const delFn = useServerFn(adminDeleteCoupon);
  const { data } = useSuspenseQuery({ queryKey: ["admin", "coupons"], queryFn: () => listFn() });
  const [editing, setEditing] = useState<any | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { refresh(); toast.success("Coupon deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">Coupons ({data.length})</h1>
        <button onClick={() => setEditing({ code: "", discount_type: "percent", discount_value: 10, min_order: 0, max_discount: null, usage_limit: null, per_user_limit: 1, expires_at: null, is_active: true })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-rose-700">
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>

      <div className="space-y-2">
        {data.map((c: any) => (
          <div key={c.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-rose-600" />
                  <span className="font-mono text-base font-black tracking-wider text-slate-900">{c.code}</span>
                  {!c.is_active && <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">DISABLED</span>}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                  <span><b className="text-emerald-600">{c.discount_type === "percent" ? `${c.discount_value}% OFF` : `৳${c.discount_value} OFF`}</b></span>
                  {Number(c.min_order) > 0 && <span>Min: ৳{c.min_order}</span>}
                  {c.max_discount && <span>Max: ৳{c.max_discount}</span>}
                  <span>Used: {c.used_count}{c.usage_limit ? `/${c.usage_limit}` : ""}</span>
                  {c.expires_at && <span>Exp: {new Date(c.expires_at).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => setEditing(c)} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"><Edit2 className="h-3 w-3" /> Edit</button>
                <button onClick={() => confirm(`Delete ${c.code}?`) && delM.mutate(c.id)} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"><Trash2 className="h-3 w-3" /> Delete</button>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-400">No coupons yet. Click "New Coupon" to create your first.</div>}
      </div>

      {editing && <CouponEditor coupon={editing} onClose={() => setEditing(null)} onSave={async (c) => {
        try { await upFn({ data: { coupon: c } }); toast.success("Saved"); setEditing(null); refresh(); }
        catch (e: any) { toast.error(e.message); }
      }} />}
    </div>
  );
}

function CouponEditor({ coupon, onClose, onSave }: { coupon: any; onClose: () => void; onSave: (c: any) => void }) {
  const [c, setC] = useState(coupon);
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 sm:place-items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl bg-white sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="font-black text-slate-900">{c.id ? "Edit Coupon" : "New Coupon"}</div>
          <button onClick={onClose}><X className="h-4 w-4 text-slate-500" /></button>
        </div>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
          <Field label="Code (uppercase)" hint="e.g. WELCOME20"><input value={c.code || ""} onChange={(e) => setC({ ...c, code: e.target.value.toUpperCase() })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono uppercase" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type"><select value={c.discount_type} onChange={(e) => setC({ ...c, discount_type: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="percent">Percent (%)</option><option value="flat">Flat (৳)</option></select></Field>
            <Field label="Value"><input type="number" value={c.discount_value ?? ""} onChange={(e) => setC({ ...c, discount_value: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min order (৳)"><input type="number" value={c.min_order ?? 0} onChange={(e) => setC({ ...c, min_order: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></Field>
            <Field label="Max discount (৳)" hint="empty = no cap"><input type="number" value={c.max_discount ?? ""} onChange={(e) => setC({ ...c, max_discount: e.target.value ? Number(e.target.value) : null })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total usage limit" hint="empty = unlimited"><input type="number" value={c.usage_limit ?? ""} onChange={(e) => setC({ ...c, usage_limit: e.target.value ? Number(e.target.value) : null })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></Field>
            <Field label="Per-user limit"><input type="number" value={c.per_user_limit ?? 1} onChange={(e) => setC({ ...c, per_user_limit: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></Field>
          </div>
          <Field label="Expires at" hint="leave empty for never">
            <input type="datetime-local" value={c.expires_at ? new Date(c.expires_at).toISOString().slice(0, 16) : ""} onChange={(e) => setC({ ...c, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </Field>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={!!c.is_active} onChange={(e) => setC({ ...c, is_active: e.target.checked })} /> Active
          </label>
        </div>
        <div className="flex gap-2 border-t bg-slate-50 px-4 py-3">
          <button onClick={onClose} className="flex-1 rounded-lg bg-white border px-4 py-2.5 text-sm font-bold text-slate-700">Cancel</button>
          <button onClick={() => onSave(c)} className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-rose-700">Save</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">{label}</div>
      {children}
      {hint && <div className="mt-1 text-[10px] text-slate-400">{hint}</div>}
    </label>
  );
}

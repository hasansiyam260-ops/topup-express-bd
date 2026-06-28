import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListCategories, adminUpsertCategory, adminDeleteCategory } from "@/lib/admin.functions";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

type Cat = {
  id?: string; key: string; name_en: string; name_bn?: string | null;
  image_url?: string | null; banner_url?: string | null; description?: string | null;
  sort_order: number; is_active: boolean;
};
const empty: Cat = { key: "", name_en: "", name_bn: "", image_url: "", banner_url: "", description: "", sort_order: 0, is_active: true };

function AdminCategories() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListCategories);
  const upsertFn = useServerFn(adminUpsertCategory);
  const deleteFn = useServerFn(adminDeleteCategory);
  const { data } = useSuspenseQuery({ queryKey: ["admin", "categories"], queryFn: () => listFn() });
  const [editing, setEditing] = useState<Cat | null>(null);

  const upsertM = useMutation({
    mutationFn: (c: Cat) => upsertFn({ data: { category: c } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "categories"] }); qc.invalidateQueries({ queryKey: ["categories"] }); setEditing(null); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "categories"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-slate-900">Categories</h1>
        <button onClick={() => setEditing(empty)} className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-rose-700">
          <Plus className="h-3.5 w-3.5" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((c: any) => (
          <div key={c.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-mono text-slate-500">{c.key}</div>
                <div className="text-lg font-black text-slate-900">{c.name_en}</div>
                {c.name_bn && <div className="text-sm text-rose-600">{c.name_bn}</div>}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{c.is_active ? "ACTIVE" : "OFF"}</span>
            </div>
            {c.image_url && <img src={c.image_url} alt="" className="mt-3 h-24 w-full rounded-lg object-cover" />}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Order: {c.sort_order}</span>
              <div className="flex gap-1">
                <button onClick={() => setEditing(c)} className="rounded p-1.5 text-sky-600 hover:bg-sky-50"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => { if (confirm("Delete category?")) deleteM.mutate(c.id); }} className="rounded p-1.5 text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h2 className="mb-4 text-lg font-black">{editing.id ? "Edit" : "Add"} Category</h2>
            <div className="space-y-3">
              <Input label="Key (e.g. diamond)" value={editing.key} onChange={(v) => setEditing({ ...editing, key: v })} />
              <Input label="Name (EN)" value={editing.name_en} onChange={(v) => setEditing({ ...editing, name_en: v })} />
              <Input label="Name (BN)" value={editing.name_bn ?? ""} onChange={(v) => setEditing({ ...editing, name_bn: v })} />
              <Input label="Image URL" value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} />
              <Input label="Banner URL" value={editing.banner_url ?? ""} onChange={(v) => setEditing({ ...editing, banner_url: v })} />
              <Input label="Description" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} />
              <Input label="Sort Order" type="number" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) })} />
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

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none" />
    </div>
  );
}

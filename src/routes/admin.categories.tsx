import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListCategories, adminUpsertCategory, adminDeleteCategory } from "@/lib/admin.functions";
import { Plus, Pencil, Trash2, X, Save, ImageIcon } from "lucide-react";
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
        <h1 className="text-xl font-black text-slate-900">Categories</h1>
        <button onClick={() => setEditing({ ...empty })} className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow active:scale-95">
          <Plus className="h-4 w-4" /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((c: any) => (
          <div key={c.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
            {c.image_url ? (
              <img src={c.image_url} alt="" className="h-28 w-full object-cover" />
            ) : (
              <div className="grid h-28 w-full place-items-center bg-slate-100 text-slate-400"><ImageIcon className="h-8 w-8" /></div>
            )}
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] text-slate-500">{c.key}</div>
                  <div className="truncate text-base font-black text-slate-900">{c.name_en}</div>
                  {c.name_bn && <div className="truncate text-sm text-rose-600">{c.name_bn}</div>}
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${c.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{c.is_active ? "ON" : "OFF"}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setEditing(c)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2.5 text-sm font-bold text-white active:scale-95">
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => { if (confirm(`Delete "${c.name_en}"?`)) deleteM.mutate(c.id); }} className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2.5 text-sm font-bold text-rose-600 active:scale-95">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditorModal title={editing.id ? "Edit Category" : "Add Category"} onClose={() => setEditing(null)} onSave={() => upsertM.mutate(editing)} saving={upsertM.isPending}>
          <Field label="Key (slug)" hint="e.g. diamond, likes — used internally"><input className="adm-input" value={editing.key} onChange={(e) => setEditing({ ...editing, key: e.target.value })} /></Field>
          <Field label="Name (English)"><input className="adm-input" value={editing.name_en} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} /></Field>
          <Field label="Name (Bangla)"><input className="adm-input" value={editing.name_bn ?? ""} onChange={(e) => setEditing({ ...editing, name_bn: e.target.value })} /></Field>
          <Field label="Image URL" hint="Square thumbnail shown on home"><input className="adm-input" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></Field>
          <Field label="Banner URL" hint="Wide banner shown on category page"><input className="adm-input" value={editing.banner_url ?? ""} onChange={(e) => setEditing({ ...editing, banner_url: e.target.value })} /></Field>
          <Field label="Description"><textarea rows={3} className="adm-input" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
          <Field label="Sort Order"><input type="number" className="adm-input" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
          <ToggleRow label="Active (visible to users)" checked={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
        </EditorModal>
      )}
    </div>
  );
}

export function EditorModal({ title, onClose, onSave, saving, children }: { title: string; onClose: () => void; onSave: () => void; saving: boolean; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 sm:items-center sm:justify-center sm:p-4">
      <div className="flex h-full w-full flex-col bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-black text-slate-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">{children}</div>
        <footer className="sticky bottom-0 flex gap-2 border-t bg-white px-4 py-3">
          <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 active:scale-95">Cancel</button>
          <button disabled={saving} onClick={onSave} className="flex flex-[2] items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </footer>
      </div>
      <style>{`.adm-input{width:100%;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;font-size:15px;background:white;color:#0f172a;}.adm-input:focus{outline:none;border-color:#f43f5e;box-shadow:0 0 0 3px rgba(244,63,94,0.12);}`}</style>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

export function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-rose-600" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      </span>
    </label>
  );
}

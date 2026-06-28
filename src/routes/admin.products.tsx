import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListProducts, adminUpsertProduct, adminDeleteProduct, adminListCategories } from "@/lib/admin.functions";
import { Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { EditorModal, Field, ToggleRow } from "./admin.categories";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type Product = {
  id?: string;
  category: string;
  pack_type: string;
  name_en: string;
  name_bn?: string | null;
  image_url?: string | null;
  price: number;
  original_price?: number | null;
  server: string;
  badge?: string | null;
  sort_order: number;
  is_active: boolean;
};

const empty: Product = {
  category: "free_fire", pack_type: "diamond", name_en: "", name_bn: "",
  image_url: "", price: 0, original_price: null, server: "BD", badge: "",
  sort_order: 0, is_active: true,
};

function AdminProducts() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListProducts);
  const upsertFn = useServerFn(adminUpsertProduct);
  const deleteFn = useServerFn(adminDeleteProduct);
  const catsFn = useServerFn(adminListCategories);

  const { data: products } = useSuspenseQuery({ queryKey: ["admin", "products"], queryFn: () => listFn() });
  const { data: cats } = useSuspenseQuery({ queryKey: ["admin", "categories"], queryFn: () => catsFn() });

  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Product | null>(null);

  const upsertM = useMutation({
    mutationFn: (product: Product) => upsertFn({ data: { product } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "products"] }); qc.invalidateQueries({ queryKey: ["products"] }); setEditing(null); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "products"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = filter === "all" ? products : products.filter((p: any) => p.pack_type === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-black text-slate-900">Products</h1>
        <button onClick={() => setEditing({ ...empty })} className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow active:scale-95">
          <Plus className="h-4 w-4" /> Add New
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={`All (${products.length})`} />
        {cats.map((c: any) => (
          <FilterChip key={c.id} active={filter === c.key} onClick={() => setFilter(c.key)} label={c.name_en} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p: any) => (
          <div key={p.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="flex gap-3 p-3">
              {p.image_url ? (
                <img src={p.image_url} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400"><ImageIcon className="h-6 w-6" /></div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 truncate text-sm font-black text-slate-900">{p.name_en}</div>
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${p.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{p.is_active ? "ON" : "OFF"}</span>
                </div>
                {p.name_bn && <div className="truncate text-xs text-slate-600">{p.name_bn}</div>}
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base font-black text-rose-600">৳{p.price}</span>
                  {p.original_price && <span className="text-[11px] text-slate-400 line-through">৳{p.original_price}</span>}
                  <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-600">{p.pack_type}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 border-t bg-slate-50/50 px-3 py-2">
              <button onClick={() => setEditing(p)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-sm font-bold text-white active:scale-95">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button onClick={() => { if (confirm(`Delete "${p.name_en}"?`)) deleteM.mutate(p.id); }} className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600 active:scale-95">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full rounded-xl border bg-white p-8 text-center text-sm text-slate-400">No products in this category</div>}
      </div>

      {editing && (
        <EditorModal title={editing.id ? "Edit Product" : "Add Product"} onClose={() => setEditing(null)} onSave={() => upsertM.mutate({ ...editing, category: editing.category || "free_fire" })} saving={upsertM.isPending}>
          <Field label="Product Name (English)"><input className="adm-input" value={editing.name_en} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} /></Field>
          <Field label="Product Name (Bangla)"><input className="adm-input" value={editing.name_bn ?? ""} onChange={(e) => setEditing({ ...editing, name_bn: e.target.value })} /></Field>
          <Field label="Category" hint="Which section it shows in">
            <select className="adm-input" value={editing.pack_type} onChange={(e) => setEditing({ ...editing, pack_type: e.target.value })}>
              {cats.map((c: any) => <option key={c.id} value={c.key}>{c.name_en}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (৳)"><input type="number" className="adm-input" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></Field>
            <Field label="Original Price" hint="Optional, shows strike-through"><input type="number" className="adm-input" value={editing.original_price ?? ""} onChange={(e) => setEditing({ ...editing, original_price: e.target.value ? Number(e.target.value) : null })} /></Field>
          </div>
          <Field label="Image URL"><input className="adm-input" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Server"><input className="adm-input" value={editing.server} onChange={(e) => setEditing({ ...editing, server: e.target.value })} /></Field>
            <Field label="Badge" hint="e.g. HOT, BEST"><input className="adm-input" value={editing.badge ?? ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} /></Field>
          </div>
          <Field label="Sort Order"><input type="number" className="adm-input" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
          <ToggleRow label="Active (visible to users)" checked={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
        </EditorModal>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${active ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>{label}</button>
  );
}

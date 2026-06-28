import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListProducts, adminUpsertProduct, adminDeleteProduct, adminListCategories } from "@/lib/admin.functions";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/products")({
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "products"] }); setEditing(null); toast.success("Saved"); },
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-slate-900">Products</h1>
        <button onClick={() => setEditing(empty)} className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-rose-700">
          <Plus className="h-3.5 w-3.5" /> Add Product
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setFilter("all")} className={`rounded-md px-3 py-1.5 text-xs font-bold ${filter === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}>All ({products.length})</button>
        {cats.map((c: any) => (
          <button key={c.id} onClick={() => setFilter(c.key)} className={`rounded-md px-3 py-1.5 text-xs font-bold ${filter === c.key ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}>
            {c.name_en}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase text-slate-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  <div className="font-bold text-slate-900">{p.name_en}</div>
                  {p.name_bn && <div className="text-[11px] text-slate-500">{p.name_bn}</div>}
                </td>
                <td className="px-3 py-2 text-xs"><span className="rounded bg-slate-100 px-2 py-0.5 font-mono">{p.pack_type}</span></td>
                <td className="px-3 py-2">
                  <span className="font-bold text-rose-600">৳{p.price}</span>
                  {p.original_price && <span className="ml-1 text-[11px] text-slate-400 line-through">৳{p.original_price}</span>}
                </td>
                <td className="px-3 py-2 text-xs">{p.sort_order}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{p.is_active ? "YES" : "NO"}</span>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setEditing(p)} className="rounded p-1.5 text-sky-600 hover:bg-sky-50"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { if (confirm("Delete this product?")) deleteM.mutate(p.id); }} className="rounded p-1.5 text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-400">No products</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductDialog
          product={editing}
          cats={cats}
          onCancel={() => setEditing(null)}
          onSave={(p) => upsertM.mutate(p)}
          saving={upsertM.isPending}
        />
      )}
    </div>
  );
}

function ProductDialog({ product, cats, onCancel, onSave, saving }: { product: Product; cats: any[]; onCancel: () => void; onSave: (p: Product) => void; saving: boolean }) {
  const [p, setP] = useState<Product>(product);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <h2 className="mb-4 text-lg font-black text-slate-900">{p.id ? "Edit" : "Add"} Product</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name (EN)" full><input className="input" value={p.name_en} onChange={(e) => setP({ ...p, name_en: e.target.value })} /></Field>
          <Field label="Name (BN)" full><input className="input" value={p.name_bn ?? ""} onChange={(e) => setP({ ...p, name_bn: e.target.value })} /></Field>
          <Field label="Category">
            <select className="input" value={p.pack_type} onChange={(e) => setP({ ...p, pack_type: e.target.value })}>
              {cats.map((c) => <option key={c.id} value={c.key}>{c.name_en}</option>)}
            </select>
          </Field>
          <Field label="Server"><input className="input" value={p.server} onChange={(e) => setP({ ...p, server: e.target.value })} /></Field>
          <Field label="Price"><input type="number" className="input" value={p.price} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} /></Field>
          <Field label="Original Price"><input type="number" className="input" value={p.original_price ?? ""} onChange={(e) => setP({ ...p, original_price: e.target.value ? Number(e.target.value) : null })} /></Field>
          <Field label="Image URL" full><input className="input" value={p.image_url ?? ""} onChange={(e) => setP({ ...p, image_url: e.target.value })} /></Field>
          <Field label="Badge"><input className="input" value={p.badge ?? ""} onChange={(e) => setP({ ...p, badge: e.target.value })} /></Field>
          <Field label="Sort Order"><input type="number" className="input" value={p.sort_order} onChange={(e) => setP({ ...p, sort_order: Number(e.target.value) })} /></Field>
          <Field label="Active" full>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.is_active} onChange={(e) => setP({ ...p, is_active: e.target.checked })} /> Active</label>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button disabled={saving} onClick={() => onSave({ ...p, category: p.category || "free_fire" })} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-size:13px;background:white;}.input:focus{outline:none;border-color:#f43f5e;}`}</style>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">{label}</label>
      {children}
    </div>
  );
}

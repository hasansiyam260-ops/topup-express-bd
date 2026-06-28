import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListOrders, adminUpdateOrder } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["all", "pending", "completed", "cancelled"] as const;

function AdminOrders() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListOrders);
  const updFn = useServerFn(adminUpdateOrder);
  const { data } = useSuspenseQuery({ queryKey: ["admin", "orders"], queryFn: () => listFn() });
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const updM = useMutation({
    mutationFn: (v: { id: string; status: string }) => updFn({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "orders"] }); toast.success("Updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = data
    .filter((o: any) => filter === "all" || o.status === filter)
    .filter((o: any) => !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.player_uid?.includes(search));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-slate-900">Orders</h1>

      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-md px-3 py-1.5 text-xs font-bold capitalize ${filter === s ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}>{s}</button>
        ))}
        <input placeholder="Search order# or UID" value={search} onChange={(e) => setSearch(e.target.value)} className="ml-auto rounded-md border px-3 py-1.5 text-xs focus:border-rose-500 focus:outline-none" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase text-slate-600">
            <tr>
              <th className="px-3 py-2">Order #</th>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">UID / Player</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Method</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((o: any) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-mono text-xs">{o.order_number}</td>
                <td className="px-3 py-2 font-bold">{o.product_name}</td>
                <td className="px-3 py-2 text-xs">
                  <div className="font-mono">{o.player_uid}</div>
                  {o.player_name && <div className="text-slate-500">{o.player_name}</div>}
                </td>
                <td className="px-3 py-2 font-bold text-rose-600">৳{o.amount}</td>
                <td className="px-3 py-2 text-xs">{o.payment_method}</td>
                <td className="px-3 py-2">
                  <select value={o.status} onChange={(e) => updM.mutate({ id: o.id, status: e.target.value })} className={`rounded px-2 py-1 text-[11px] font-bold ${o.status === "completed" ? "bg-green-100 text-green-700" : o.status === "cancelled" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                    <option value="pending">PENDING</option>
                    <option value="completed">COMPLETED</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                </td>
                <td className="px-3 py-2 text-[11px] text-slate-500">{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-400">No orders</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

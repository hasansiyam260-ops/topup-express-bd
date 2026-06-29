import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListOrders, adminUpdateOrder } from "@/lib/admin.functions";
import { Search, User, Hash, CreditCard, Calendar, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["all", "pending", "completed", "cancelled"] as const;

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

function AdminOrders() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListOrders);
  const updFn = useServerFn(adminUpdateOrder);
  const { data } = useSuspenseQuery({ queryKey: ["admin", "orders"], queryFn: () => listFn() });
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const updM = useMutation({
    mutationFn: (v: { id: string; status: string }) => updFn({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "orders"] }); toast.success("Status updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = data
    .filter((o: any) => filter === "all" || o.status === filter)
    .filter((o: any) => !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.player_uid?.includes(search) || o.product_name?.toLowerCase().includes(search.toLowerCase()));

  const exportCSV = () => {
    const rows = [["Order #", "Date", "Product", "UID", "Player", "Amount", "Payment", "Status"]];
    filtered.forEach((o: any) => rows.push([
      o.order_number ?? "", new Date(o.created_at).toISOString(), o.product_name ?? "",
      o.player_uid ?? "", o.player_name ?? "", String(o.amount ?? ""),
      o.payment_method ?? "", o.status ?? "",
    ]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} orders`);
  };

  const totals = filtered.reduce((acc: any, o: any) => {
    acc.count += 1;
    if (o.status === "completed") acc.revenue += Number(o.amount || 0);
    if (o.status === "pending") acc.pending += 1;
    return acc;
  }, { count: 0, revenue: 0, pending: 0 });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-black text-slate-900">Orders ({data.length})</h1>
        <button onClick={exportCSV} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Showing" value={totals.count} tone="slate" />
        <Stat label="Revenue" value={`৳${totals.revenue}`} tone="emerald" />
        <Stat label="Pending" value={totals.pending} tone="amber" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input placeholder="Search order #, UID, or product…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm focus:border-rose-500 focus:outline-none" />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold capitalize ${filter === s ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>{s}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((o: any) => (
          <div key={o.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-base font-black text-slate-900">{o.product_name}</div>
                <div className="font-mono text-[11px] text-slate-500">#{o.order_number}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-black text-rose-600">৳{o.amount}</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <Row icon={Hash} label="UID">{o.player_uid}{o.player_name && <span className="text-slate-500"> · {o.player_name}</span>}</Row>
              <Row icon={CreditCard} label="Paid via">{o.payment_method || "—"}</Row>
              <Row icon={Calendar} label="Date">{new Date(o.created_at).toLocaleString()}</Row>
              {o.user_id && <Row icon={User} label="User">{String(o.user_id).slice(0, 8)}…</Row>}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {(["pending", "completed", "cancelled"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updM.mutate({ id: o.id, status: s })}
                  className={`rounded-lg border px-2 py-2 text-[11px] font-bold uppercase active:scale-95 ${
                    o.status === s ? statusStyles[s] : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-400">No orders found</div>}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span className="font-bold text-slate-500">{label}:</span>
      <span className="min-w-0 truncate font-mono">{children}</span>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: any; tone: "slate" | "emerald" | "amber" }) {
  const tones = {
    slate: "bg-white text-slate-900 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  } as const;
  return (
    <div className={`rounded-xl border p-3 shadow-sm ${tones[tone]}`}>
      <div className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</div>
      <div className="mt-0.5 text-lg font-black">{value}</div>
    </div>
  );
}

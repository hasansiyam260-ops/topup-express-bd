import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminStats } from "@/lib/admin.functions";
import { ShoppingBag, Users, Package, Clock, CheckCircle2, XCircle, DollarSign } from "lucide-react";

export const Route = createFileRoute("/_admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetchStats = useServerFn(adminStats);
  const { data } = useSuspenseQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => fetchStats(),
  });

  const cards = [
    { label: "Total Revenue", value: `৳${data.revenue.toFixed(0)}`, icon: DollarSign, color: "from-emerald-500 to-emerald-700" },
    { label: "Total Orders", value: data.totalOrders, icon: ShoppingBag, color: "from-sky-500 to-sky-700" },
    { label: "Completed", value: data.completedOrders, icon: CheckCircle2, color: "from-green-500 to-green-700" },
    { label: "Pending", value: data.pendingOrders, icon: Clock, color: "from-amber-500 to-amber-700" },
    { label: "Cancelled", value: data.cancelledOrders, icon: XCircle, color: "from-rose-500 to-rose-700" },
    { label: "Total Users", value: data.totalUsers, icon: Users, color: "from-purple-500 to-purple-700" },
    { label: "Active Products", value: data.activeProducts, icon: Package, color: "from-indigo-500 to-indigo-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Welcome back, admin. Here's what's happening.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="overflow-hidden rounded-xl border bg-white p-4 shadow-sm">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.color} text-white shadow`}>
              <c.icon className="h-4 w-4" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{c.label}</div>
            <div className="mt-1 text-2xl font-black text-slate-900">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

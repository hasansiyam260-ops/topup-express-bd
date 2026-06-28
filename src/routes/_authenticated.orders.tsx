import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/site/AppShell";
import { Package, Receipt } from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My Orders — UIDTOPUP.COM" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-3 pt-4 space-y-4">
        <div className="relative rounded-2xl overflow-hidden glow-violet sweep-shine bg-gradient-to-br from-rose-600 via-red-600 to-orange-500 p-5 text-white">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-12 w-12 rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/30">
              <Receipt className="h-6 w-6" />
            </span>
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-white/70">History</div>
              <h1 className="font-display text-3xl leading-none">MY ORDERS</h1>
            </div>
          </div>
        </div>

        {isLoading && <div className="text-center text-muted-foreground py-10">Loading...</div>}

        {!isLoading && (!orders || orders.length === 0) && (
          <div className="rounded-2xl card-soft p-10 text-center">
            <Package className="h-12 w-12 text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">No orders yet.</p>
            <Link to="/" className="btn-red inline-block mt-4 px-5 py-2.5 rounded-xl">Start Shopping</Link>
          </div>
        )}

        <div className="space-y-3">
          {orders?.map((o) => (
            <div key={o.id} className="rounded-2xl card-soft p-4 flex items-center justify-between gap-3 hover-lift">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] tracking-widest text-primary uppercase font-bold">{o.order_number}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="font-display text-xl truncate">{o.product_name}</div>
                <div className="text-xs text-muted-foreground">UID: {o.player_uid} · {new Date(o.created_at).toLocaleDateString()}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-2xl text-primary">৳{Number(o.amount).toFixed(0)}</div>
                <div className="text-[10px] tracking-widest text-muted-foreground uppercase">{o.payment_method}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-rose-100 text-rose-700",
    cancelled: "bg-muted text-muted-foreground",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${cls[status] ?? ""}`}>{status}</span>;
}

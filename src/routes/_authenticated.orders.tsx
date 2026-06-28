import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/site/AppShell";
import { Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My Orders — UID Topup" }] }),
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
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <h1 className="font-display text-4xl gold-text mb-6">MY ORDERS</h1>

        {isLoading && <div className="text-center text-muted-foreground py-10">Loading...</div>}

        {!isLoading && (!orders || orders.length === 0) && (
          <div className="card-luxe rounded-2xl p-10 text-center">
            <Package className="h-12 w-12 text-gold mx-auto mb-3" />
            <p className="text-muted-foreground">No orders yet.</p>
            <Link to="/" className="btn-gold inline-block mt-4 px-5 py-2 rounded-md">Start Shopping</Link>
          </div>
        )}

        <div className="space-y-3">
          {orders?.map((o) => (
            <div key={o.id} className="card-luxe rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] tracking-widest text-gold uppercase">{o.order_number}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="font-display text-xl truncate">{o.product_name}</div>
                <div className="text-xs text-muted-foreground">UID: {o.player_uid} · {new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl gold-text">৳{Number(o.amount).toFixed(0)}</div>
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
    pending: "bg-gold/20 text-gold-soft",
    processing: "bg-blue-500/20 text-blue-300",
    completed: "bg-emerald-500/20 text-emerald-300",
    failed: "bg-destructive/20 text-destructive-foreground",
    cancelled: "bg-muted text-muted-foreground",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${cls[status] ?? ""}`}>{status}</span>;
}

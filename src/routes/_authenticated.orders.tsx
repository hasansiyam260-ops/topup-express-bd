import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/site/AppShell";
import {
  Package,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Gem,
  Hash,
  User2,
  Calendar,
  CreditCard,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My Orders — UIDTOPUP.COM" }] }),
  component: OrdersPage,
});

type Order = {
  id: string;
  order_number: string;
  product_name: string;
  player_uid: string;
  player_name?: string | null;
  amount: number | string;
  status: string;
  payment_method: string;
  payment_reference?: string | null;
  created_at: string;
  _demo?: boolean;
};

// Demo / fake orders — only used so you can preview the premium look.
const DEMO_ORDERS: Order[] = [
  {
    id: "demo-1",
    order_number: "UID260628A91X",
    product_name: "Free Fire [BD] — 1015 Diamond 💎",
    player_uid: "3204376534",
    player_name: "FF・LegendKing",
    amount: 670,
    status: "completed",
    payment_method: "bKash",
    payment_reference: "8A3K9M2P1Q",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    _demo: true,
  },
  {
    id: "demo-2",
    order_number: "UID260626BL44",
    product_name: "Free Fire — Weekly Membership",
    player_uid: "7821094553",
    player_name: "PRO・ShadowX",
    amount: 159,
    status: "completed",
    payment_method: "Nagad",
    payment_reference: "5N7Q2L8K1B",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    _demo: true,
  },
  {
    id: "demo-3",
    order_number: "UID260624XK02",
    product_name: "Free Fire — 500 Likes Pack",
    player_uid: "5532108899",
    player_name: "FF・NinjaBoy",
    amount: 80,
    status: "cancelled",
    payment_method: "Rocket",
    payment_reference: "—",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    _demo: true,
  },
];

function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });

  const merged: Order[] = [...DEMO_ORDERS, ...(orders ?? [])];

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-3 pt-4 pb-6 space-y-4">
        {/* Premium banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-rose-600 via-red-600 to-orange-500 px-4 py-3 text-white shadow-[0_10px_30px_-14px_rgba(225,29,72,0.55)]">
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-yellow-300/20 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/30 shrink-0">
              <Receipt className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] tracking-[0.3em] uppercase text-white/70 leading-none">Order History</div>
              <h1 className="font-display text-lg leading-tight mt-0.5">MY ORDERS</h1>
            </div>
            <span className="flex items-center gap-1 text-[9px] tracking-wider uppercase bg-white/15 backdrop-blur text-white px-2 py-0.5 rounded-full border border-white/25">
              <Sparkles className="h-2.5 w-2.5" /> {merged.length}
            </span>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-2xl card-soft p-10 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" /> Loading orders…
          </div>
        )}

        {!isLoading && merged.length === 0 && (
          <div className="rounded-2xl card-soft p-10 text-center">
            <Package className="h-12 w-12 text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">No orders yet.</p>
            <Link to="/" className="btn-red inline-block mt-4 px-5 py-2.5 rounded-xl">Start Shopping</Link>
          </div>
        )}

        <div className="space-y-3">
          {merged.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

/* ===================== Premium Order Card ===================== */

function OrderCard({ order }: { order: Order }) {
  const s = (order.status || "pending").toLowerCase();
  const theme = statusTheme(s);
  const dateStr = new Date(order.created_at).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.35)] hover:-translate-y-0.5 transition-transform">
      {/* Status accent bar (left) */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ background: theme.bar }}
      />
      {/* Soft glow halo */}
      <span
        aria-hidden
        className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl pointer-events-none"
        style={{ background: theme.halo }}
      />

      {/* Header strip */}
      <div
        className="relative px-4 py-3 flex items-center justify-between gap-2 border-b border-slate-100"
        style={{ background: theme.headerBg }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="grid place-items-center h-8 w-8 rounded-lg shadow-sm shrink-0"
            style={{ background: theme.iconBg, color: theme.iconFg }}
          >
            {theme.icon}
          </span>
          <div className="min-w-0">
            <div className="text-[9px] tracking-[0.25em] uppercase text-slate-500 leading-none">Order</div>
            <div className="font-mono font-bold text-slate-800 text-[13px] leading-tight mt-0.5 flex items-center gap-1.5">
              <Hash className="h-3 w-3 text-slate-400" />
              {order.order_number}
            </div>
          </div>
        </div>

        {/* Premium status pill */}
        <span
          className="flex items-center gap-1 text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border shadow-sm"
          style={{
            background: theme.pillBg,
            color: theme.pillFg,
            borderColor: theme.pillBorder,
            boxShadow: `0 0 0 3px ${theme.pillRing}`,
          }}
        >
          {theme.icon}
          {theme.label}
        </span>

        {order._demo && (
          <span className="absolute top-1 right-1 text-[8px] tracking-widest uppercase bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
            Demo
          </span>
        )}
      </div>

      {/* Body */}
      <div className="relative p-4 space-y-3">
        {/* Product row */}
        <div className="flex items-start gap-3">
          <span
            className="grid place-items-center h-12 w-12 rounded-xl shrink-0 shadow-inner"
            style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)" }}
          >
            <Gem className="h-5 w-5 text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-base font-bold text-red-600 leading-snug line-clamp-2">
              {order.product_name}
            </div>
            <div className="mt-1.5 flex items-center gap-1 flex-nowrap">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-slate-900 to-slate-700 text-white text-[9px] font-mono font-semibold tracking-wider shadow-sm ring-1 ring-white/10 shrink-0">
                <User2 className="h-2.5 w-2.5 text-cyan-300" />
                {order.player_uid}
              </span>
              {order.player_name && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 text-[9px] font-bold tracking-wide border border-amber-200 shadow-sm min-w-0 truncate">
                  <Sparkles className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{order.player_name}</span>
                </span>
              )}
            </div>


          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] tracking-[0.25em] uppercase text-slate-400">Total</div>
            <div className="font-display text-2xl text-primary leading-none mt-0.5">
              ৳{Number(order.amount).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-dashed border-slate-200">
          <MetaCell icon={<Calendar className="h-3 w-3" />} label="Date" value={dateStr} tone={theme.metaTone} />
          <MetaCell icon={<CreditCard className="h-3 w-3" />} label="Method" value={order.payment_method} tone={theme.metaTone} />
          <MetaCell
            icon={<ShieldCheck className="h-3 w-3" />}
            label="TXID"
            value={order.payment_reference || "—"}
            mono
            tone={theme.metaTone}
          />
        </div>

        {/* Footer status note */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-medium"
          style={{ background: theme.noteBg, color: theme.noteFg }}
        >
          {theme.icon}
          <span>{theme.note}</span>
        </div>
      </div>
    </div>
  );
}

const META_TONES = {
  green: {
    border: "border-emerald-300",
    bg: "bg-emerald-50/70",
    text: "text-emerald-700",
    shadow: "shadow-[0_2px_8px_-4px_rgba(16,185,129,0.35)]",
  },
  red: {
    border: "border-red-300",
    bg: "bg-red-50/70",
    text: "text-red-600",
    shadow: "shadow-[0_2px_8px_-4px_rgba(225,29,72,0.35)]",
  },
  blue: {
    border: "border-sky-300",
    bg: "bg-sky-50/70",
    text: "text-sky-700",
    shadow: "shadow-[0_2px_8px_-4px_rgba(2,132,199,0.35)]",
  },
  amber: {
    border: "border-amber-300",
    bg: "bg-amber-50/70",
    text: "text-amber-700",
    shadow: "shadow-[0_2px_8px_-4px_rgba(217,119,6,0.35)]",
  },
  slate: {
    border: "border-slate-300",
    bg: "bg-slate-50/70",
    text: "text-slate-700",
    shadow: "shadow-[0_2px_8px_-4px_rgba(71,85,105,0.3)]",
  },
} as const;

function MetaCell({
  icon,
  label,
  value,
  mono,
  tone = "red",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  tone?: keyof typeof META_TONES;
}) {
  const t = META_TONES[tone];
  return (
    <div className={`min-w-0 rounded-lg border ${t.border} ${t.bg} px-2 py-1.5 ${t.shadow}`}>
      <div className={`flex items-center gap-1 text-[8px] font-bold tracking-[0.2em] uppercase ${t.text}`}>
        {icon}
        {label}
      </div>
      <div className={`text-[10px] font-bold ${t.text} mt-0.5 whitespace-normal break-words leading-tight ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}

/* ===================== Status themes ===================== */

function statusTheme(status: string) {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        bar: "linear-gradient(180deg,#34d399,#059669)",
        halo: "radial-gradient(closest-side, rgba(16,185,129,0.35), transparent 70%)",
        headerBg: "linear-gradient(90deg, rgba(16,185,129,0.10), rgba(16,185,129,0) 70%)",
        iconBg: "linear-gradient(135deg,#34d399,#059669)",
        iconFg: "#fff",
        pillBg: "linear-gradient(180deg,#10b981,#047857)",
        pillFg: "#fff",
        pillBorder: "rgba(255,255,255,0.4)",
        pillRing: "rgba(16,185,129,0.18)",
        noteBg: "rgba(16,185,129,0.08)",
        noteFg: "#047857",
        note: "টপআপ সফলভাবে সম্পন্ন হয়েছে — Diamonds delivered to your account ✓",
        icon: <CheckCircle2 className="h-3 w-3" />,
        metaTone: "green" as const,
      };
    case "processing":
      return {
        label: "Processing",
        bar: "linear-gradient(180deg,#60a5fa,#2563eb)",
        halo: "radial-gradient(closest-side, rgba(37,99,235,0.3), transparent 70%)",
        headerBg: "linear-gradient(90deg, rgba(37,99,235,0.10), rgba(37,99,235,0) 70%)",
        iconBg: "linear-gradient(135deg,#60a5fa,#2563eb)",
        iconFg: "#fff",
        pillBg: "linear-gradient(180deg,#3b82f6,#1d4ed8)",
        pillFg: "#fff",
        pillBorder: "rgba(255,255,255,0.4)",
        pillRing: "rgba(37,99,235,0.18)",
        noteBg: "rgba(37,99,235,0.08)",
        noteFg: "#1d4ed8",
        note: "Order processing চলছে — সাধারণত ১–৫ মিনিটে delivery হয়।",
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
        metaTone: "blue" as const,
      };
    case "pending":
      return {
        label: "Pending",
        bar: "linear-gradient(180deg,#fbbf24,#d97706)",
        halo: "radial-gradient(closest-side, rgba(217,119,6,0.3), transparent 70%)",
        headerBg: "linear-gradient(90deg, rgba(217,119,6,0.10), rgba(217,119,6,0) 70%)",
        iconBg: "linear-gradient(135deg,#fbbf24,#d97706)",
        iconFg: "#fff",
        pillBg: "linear-gradient(180deg,#f59e0b,#b45309)",
        pillFg: "#fff",
        pillBorder: "rgba(255,255,255,0.4)",
        pillRing: "rgba(217,119,6,0.18)",
        noteBg: "rgba(217,119,6,0.08)",
        noteFg: "#92400e",
        note: "Payment verification এর জন্য অপেক্ষা করুন।",
        icon: <Clock className="h-3 w-3" />,
        metaTone: "amber" as const,
      };
    case "failed":
    case "cancelled":
      return {
        label: status === "failed" ? "Failed" : "Cancelled",
        bar: "linear-gradient(180deg,#f87171,#dc2626)",
        halo: "radial-gradient(closest-side, rgba(220,38,38,0.3), transparent 70%)",
        headerBg: "linear-gradient(90deg, rgba(220,38,38,0.10), rgba(220,38,38,0) 70%)",
        iconBg: "linear-gradient(135deg,#f87171,#dc2626)",
        iconFg: "#fff",
        pillBg: "linear-gradient(180deg,#ef4444,#b91c1c)",
        pillFg: "#fff",
        pillBorder: "rgba(255,255,255,0.4)",
        pillRing: "rgba(220,38,38,0.18)",
        noteBg: "rgba(220,38,38,0.08)",
        noteFg: "#991b1b",
        note:
          status === "failed"
            ? "Order failed — payment verify হয়নি। Support এ যোগাযোগ করুন।"
            : "Order cancelled হয়েছে। Refund (যদি প্রযোজ্য হয়) ওয়ালেটে যোগ হবে।",
        icon: <XCircle className="h-3 w-3" />,
        metaTone: "red" as const,
      };
    default:
      return {
        label: status,
        bar: "linear-gradient(180deg,#94a3b8,#475569)",
        halo: "radial-gradient(closest-side, rgba(71,85,105,0.25), transparent 70%)",
        headerBg: "linear-gradient(90deg, rgba(71,85,105,0.10), rgba(71,85,105,0) 70%)",
        iconBg: "linear-gradient(135deg,#94a3b8,#475569)",
        iconFg: "#fff",
        pillBg: "linear-gradient(180deg,#64748b,#334155)",
        pillFg: "#fff",
        pillBorder: "rgba(255,255,255,0.4)",
        pillRing: "rgba(71,85,105,0.18)",
        noteBg: "rgba(71,85,105,0.08)",
        noteFg: "#334155",
        note: "Status update পাবেন শীঘ্রই।",
        icon: <Clock className="h-3 w-3" />,
        metaTone: "slate" as const,
      };
  }
}

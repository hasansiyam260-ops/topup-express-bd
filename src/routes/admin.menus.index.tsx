import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, PlusCircle, Package, Gift, User } from "lucide-react";

export const Route = createFileRoute("/admin/menus/")({ component: Page });

const MENUS = [
  { to: "/admin/menus/home", label: "Home", desc: "Banner, announcement, categories, hero", icon: Home, accent: "from-rose-500 to-rose-700" },
  { to: "/admin/menus/wallet", label: "Add Money", desc: "Wallet rules, presets, payment methods", icon: PlusCircle, accent: "from-emerald-500 to-emerald-700" },
  { to: "/admin/menus/orders", label: "My Orders", desc: "Orders page text, empty state, statuses", icon: Package, accent: "from-sky-500 to-sky-700" },
  { to: "/admin/menus/refer", label: "Refer", desc: "Cashback %, bonus, refer page text", icon: Gift, accent: "from-violet-500 to-violet-700" },
  { to: "/admin/menus/profile", label: "Profile", desc: "Profile page text & support links", icon: User, accent: "from-amber-500 to-amber-700" },
];

function Page() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Menu Sections</h1>
        <p className="mt-1 text-xs text-slate-500">5 ta main menu — proti tar a to z edit korar jonno hub.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MENUS.map((it) => (
          <Link key={it.to} to={it.to} className="group flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${it.accent} text-white shadow`}>
              <it.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black text-slate-900">{it.label}</div>
              <div className="text-[11px] text-slate-500">{it.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

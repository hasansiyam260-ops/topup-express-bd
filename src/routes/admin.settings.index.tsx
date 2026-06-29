import { createFileRoute, Link } from "@tanstack/react-router";
import { Palette, ImageIcon, Megaphone, Share2, Sparkles, Wallet, Construction, Search } from "lucide-react";

export const Route = createFileRoute("/admin/settings/")({ component: SettingsIndex });

const ITEMS = [
  { to: "/admin/settings/branding", label: "Branding", desc: "Site name, logo, footer", icon: Palette, accent: "from-violet-500 to-violet-700" },
  { to: "/admin/settings/hero", label: "Hero Banner", desc: "Home page banner", icon: ImageIcon, accent: "from-rose-500 to-rose-700" },
  { to: "/admin/settings/announcement", label: "Announcement", desc: "Top notice bar", icon: Megaphone, accent: "from-amber-500 to-amber-700" },
  { to: "/admin/settings/social", label: "Social Links", desc: "Telegram, FB, YouTube...", icon: Share2, accent: "from-sky-500 to-sky-700" },
  { to: "/admin/settings/chat", label: "AI Live Chat", desc: "Prompt, welcome, model", icon: Sparkles, accent: "from-violet-500 to-fuchsia-600" },
  { to: "/admin/settings/wallet", label: "Wallet Rules", desc: "Min/max + quick chips", icon: Wallet, accent: "from-emerald-500 to-emerald-700" },
  { to: "/admin/settings/maintenance", label: "Maintenance", desc: "Site on/off", icon: Construction, accent: "from-amber-600 to-orange-700" },
  { to: "/admin/settings/seo", label: "SEO Defaults", desc: "Meta tags + share image", icon: Search, accent: "from-sky-600 to-blue-700" },
];

function SettingsIndex() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Settings</h1>
        <p className="mt-1 text-xs text-slate-500">Everything you can control from one place.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ITEMS.map((it) => (
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

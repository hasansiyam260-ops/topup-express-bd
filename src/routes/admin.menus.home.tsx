import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageIcon, Megaphone, Tags, Package, Sparkles } from "lucide-react";
import { SettingsCard, TextField, ToggleField, useSettingsEditor, useLocalState } from "@/components/admin/SettingsUI";
import { DEFAULTS } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/menus/home")({ component: Page });

const LINKS = [
  { to: "/admin/settings/hero", label: "Hero Banner", icon: ImageIcon },
  { to: "/admin/settings/announcement", label: "Announcement Bar", icon: Megaphone },
  { to: "/admin/categories", label: "Categories (6 boxes)", icon: Tags },
  { to: "/admin/products", label: "Products in each category", icon: Package },
];

function Page() {
  const ed = useSettingsEditor();
  const [title, setTitle] = useLocalState<string>(ed.get("hero_title", DEFAULTS.hero_title));
  const [subtitle, setSubtitle] = useLocalState<string>(ed.get("hero_subtitle", DEFAULTS.hero_subtitle));
  const [annText, setAnnText] = useLocalState<string>(ed.get("announcement_text", DEFAULTS.announcement_text));
  const [annOn, setAnnOn] = useLocalState<boolean>(ed.get("announcement_enabled", true) !== false);
  const [sectionTitle, setSectionTitle] = useLocalState<string>(ed.get("home_categories_title", "সব সার্ভিস"));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Home Menu</h1>
        <p className="mt-1 text-xs text-slate-500">Home page er sob kichu ekhane control koro.</p>
      </div>

      <SettingsCard title="Quick Edit" subtitle="Hero + Announcement + section heading" icon={<Sparkles className="h-5 w-5" />} accent="rose"
        onSave={() => ed.saveMany([
          { key: "hero_title", value: title },
          { key: "hero_subtitle", value: subtitle },
          { key: "announcement_text", value: annText },
          { key: "announcement_enabled", value: annOn },
          { key: "home_categories_title", value: sectionTitle },
        ])} saving={ed.saving}>
        <TextField label="Hero Title" value={title} onChange={setTitle} />
        <TextField label="Hero Subtitle" value={subtitle} onChange={setSubtitle} />
        <ToggleField label="Show Announcement Bar" value={annOn} onChange={setAnnOn} />
        <TextField label="Announcement Text" value={annText} onChange={setAnnText} multiline />
        <TextField label="Categories Section Heading" value={sectionTitle} onChange={setSectionTitle} />
      </SettingsCard>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LINKS.map((it) => (
          <Link key={it.to} to={it.to} className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-3 hover:border-rose-300">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-rose-50 text-rose-700"><it.icon className="h-5 w-5" /></div>
            <div className="text-sm font-black text-slate-900">{it.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { SettingsCard, TextField, ToggleField, useSettingsEditor, useLocalState } from "@/components/admin/SettingsUI";
import { DEFAULTS } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/settings/announcement")({ component: Page });

const THEMES: Array<{ id: string; label: string; bg: string }> = [
  { id: "rose", label: "Red", bg: "bg-rose-500" },
  { id: "emerald", label: "Green", bg: "bg-emerald-500" },
  { id: "amber", label: "Amber", bg: "bg-amber-500" },
  { id: "sky", label: "Blue", bg: "bg-sky-500" },
];

function Page() {
  const ed = useSettingsEditor();
  const [text, setText] = useLocalState<string>(ed.get("announcement_text", DEFAULTS.announcement_text));
  const [enabled, setEnabled] = useLocalState<boolean>(ed.get("announcement_enabled", true) !== false);
  const [theme, setTheme] = useLocalState<string>(ed.get("announcement_theme", "rose"));
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Announcement Bar</h1>
        <p className="mt-1 text-xs text-slate-500">Home page er upor notice — offer, alert, etc.</p>
      </div>
      <SettingsCard title="Notice" icon={<Megaphone className="h-5 w-5" />} accent="amber"
        onSave={() => ed.saveMany([
          { key: "announcement_text", value: text }, { key: "announcement_enabled", value: enabled },
          { key: "announcement_theme", value: theme },
        ])} saving={ed.saving}>
        <ToggleField label="Show Announcement" value={enabled} onChange={setEnabled} />
        <TextField label="Notice Text" value={text} onChange={setText} multiline hint="HTML noy — plain text" />
        <div>
          <div className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-700">Color Theme</div>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => setTheme(t.id)} className={`rounded-lg p-3 text-xs font-bold text-white ${t.bg} ${theme === t.id ? "ring-4 ring-offset-2 ring-slate-900" : "opacity-70"}`}>{t.label}</button>
            ))}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

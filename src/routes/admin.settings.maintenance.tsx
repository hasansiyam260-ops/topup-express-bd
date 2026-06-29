import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { SettingsCard, TextField, ToggleField, useSettingsEditor, useLocalState } from "@/components/admin/SettingsUI";
import { DEFAULTS } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/settings/maintenance")({ component: Page });

function Page() {
  const ed = useSettingsEditor();
  const [enabled, setEnabled] = useLocalState<boolean>(!!ed.get("maintenance_enabled", false));
  const [msg, setMsg] = useLocalState<string>(ed.get("maintenance_message", DEFAULTS.maintenance_message));
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Maintenance Mode</h1>
        <p className="mt-1 text-xs text-slate-500">On korle admin chara keu site e dhukte parbe na.</p>
      </div>
      <SettingsCard title="Site Status" icon={<Construction className="h-5 w-5" />} accent="amber"
        onSave={() => ed.saveMany([
          { key: "maintenance_enabled", value: enabled },
          { key: "maintenance_message", value: msg },
        ])} saving={ed.saving}>
        <ToggleField label="Maintenance Mode" hint="On korle user maintenance screen dekhbe" value={enabled} onChange={setEnabled} />
        <TextField label="Message" value={msg} onChange={setMsg} multiline />
        {enabled && (
          <div className="rounded-lg bg-amber-100 p-3 text-[11px] font-bold text-amber-800">
            ⚠️ Maintenance mode ON ache. Save korar pore user shob page e maintenance screen dekhbe (admin chara).
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { SettingsCard, TextField, ToggleField, useSettingsEditor, useLocalState } from "@/components/admin/SettingsUI";
import { DEFAULTS } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/settings/wallet")({ component: Page });

function Page() {
  const ed = useSettingsEditor();
  const [min, setMin] = useLocalState<string>(String(ed.get("wallet_min", DEFAULTS.wallet_min)));
  const [max, setMax] = useLocalState<string>(String(ed.get("wallet_max", DEFAULTS.wallet_max)));
  const [presets, setPresets] = useLocalState<string>(((ed.get("wallet_presets", DEFAULTS.wallet_presets) || []) as number[]).join(", "));
  const [manual, setManual] = useLocalState<boolean>(ed.get("wallet_manual_enabled", true) !== false);

  const parsePresets = () => presets.split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Wallet Rules</h1>
        <p className="mt-1 text-xs text-slate-500">Add money limits + quick amount chips.</p>
      </div>
      <SettingsCard title="Add Money" icon={<Wallet className="h-5 w-5" />} accent="emerald"
        onSave={() => ed.saveMany([
          { key: "wallet_min", value: Number(min) || DEFAULTS.wallet_min },
          { key: "wallet_max", value: Number(max) || DEFAULTS.wallet_max },
          { key: "wallet_presets", value: parsePresets() },
          { key: "wallet_manual_enabled", value: manual },
        ])} saving={ed.saving}>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Minimum (৳)" value={min} onChange={setMin} type="number" suffix="৳" />
          <TextField label="Maximum (৳)" value={max} onChange={setMax} type="number" suffix="৳" />
        </div>
        <TextField label="Quick Amount Chips" value={presets} onChange={setPresets} hint="Comma-separated, e.g. 100, 500, 1000, 2000" />
        <div className="flex flex-wrap gap-2">
          {parsePresets().map((n) => (
            <span key={n} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">৳{n.toLocaleString()}</span>
          ))}
        </div>
        <ToggleField label="Allow Manual Amount" hint="Off korle user shudhu chips theke choose korte parbe" value={manual} onChange={setManual} />
      </SettingsCard>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, CreditCard, Sparkles } from "lucide-react";
import { SettingsCard, TextField, ToggleField, useSettingsEditor, useLocalState } from "@/components/admin/SettingsUI";
import { DEFAULTS } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/menus/wallet")({ component: Page });

function Page() {
  const ed = useSettingsEditor();
  const [title, setTitle] = useLocalState<string>(ed.get("wallet_page_title", "Add Money"));
  const [subtitle, setSubtitle] = useLocalState<string>(ed.get("wallet_page_subtitle", "Instant top-up — bKash / Nagad / Rocket"));
  const [min, setMin] = useLocalState<string>(String(ed.get("wallet_min", DEFAULTS.wallet_min)));
  const [max, setMax] = useLocalState<string>(String(ed.get("wallet_max", DEFAULTS.wallet_max)));
  const [presets, setPresets] = useLocalState<string>(((ed.get("wallet_presets", DEFAULTS.wallet_presets) as number[]) || []).join(", "));
  const [manual, setManual] = useLocalState<boolean>(ed.get("wallet_manual_enabled", true) !== false);
  const [notice, setNotice] = useLocalState<string>(ed.get("wallet_notice", "Transaction ID ভুল হলে টাকা যোগ হবে না।"));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Add Money Menu</h1>
        <p className="mt-1 text-xs text-slate-500">Wallet page er sob kichu ekhane.</p>
      </div>

      <SettingsCard title="Page Text" icon={<Sparkles className="h-5 w-5" />} accent="emerald"
        onSave={() => ed.saveMany([
          { key: "wallet_page_title", value: title },
          { key: "wallet_page_subtitle", value: subtitle },
          { key: "wallet_notice", value: notice },
        ])} saving={ed.saving}>
        <TextField label="Page Title" value={title} onChange={setTitle} />
        <TextField label="Page Subtitle" value={subtitle} onChange={setSubtitle} />
        <TextField label="Notice / Warning" value={notice} onChange={setNotice} multiline />
      </SettingsCard>

      <SettingsCard title="Wallet Rules" subtitle="Min/max + quick chips" icon={<Wallet className="h-5 w-5" />} accent="emerald"
        onSave={() => ed.saveMany([
          { key: "wallet_min", value: Number(min) || DEFAULTS.wallet_min },
          { key: "wallet_max", value: Number(max) || DEFAULTS.wallet_max },
          { key: "wallet_presets", value: presets.split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0) },
          { key: "wallet_manual_enabled", value: manual },
        ])} saving={ed.saving}>
        <TextField label="Minimum Amount" value={min} onChange={setMin} type="number" suffix="৳" />
        <TextField label="Maximum Amount" value={max} onChange={setMax} type="number" suffix="৳" />
        <TextField label="Quick Amount Chips" value={presets} onChange={setPresets} placeholder="100, 500, 1000, 2000, 5000" hint="Comma separated" />
        <ToggleField label="Manual Amount Input" hint="User nij theke amount likhte parbe" value={manual} onChange={setManual} />
      </SettingsCard>

      <Link to="/admin/payments" className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-3 hover:border-emerald-300">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><CreditCard className="h-5 w-5" /></div>
        <div className="text-sm font-black text-slate-900">Payment Methods (bKash / Nagad / Rocket)</div>
      </Link>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, Sparkles } from "lucide-react";
import { SettingsCard, TextField, useSettingsEditor, useLocalState } from "@/components/admin/SettingsUI";

export const Route = createFileRoute("/admin/menus/refer")({ component: Page });

function Page() {
  const ed = useSettingsEditor();
  const [title, setTitle] = useLocalState<string>(ed.get("refer_page_title", "Refer & Earn"));
  const [subtitle, setSubtitle] = useLocalState<string>(ed.get("refer_page_subtitle", "Friend invite koro, lifetime cashback paw"));
  const [howto, setHowto] = useLocalState<string>(ed.get("refer_how_text", "1) Apnar refer link share korun\n2) Friend signup + first order korle bonus paben\n3) Lifetime 2% cashback proti purchase e"));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Refer Menu</h1>
        <p className="mt-1 text-xs text-slate-500">Refer page er text. Cashback % / bonus tk Refer & Earn settings e.</p>
      </div>

      <SettingsCard title="Page Text" icon={<Sparkles className="h-5 w-5" />} accent="violet"
        onSave={() => ed.saveMany([
          { key: "refer_page_title", value: title },
          { key: "refer_page_subtitle", value: subtitle },
          { key: "refer_how_text", value: howto },
        ])} saving={ed.saving}>
        <TextField label="Page Title" value={title} onChange={setTitle} />
        <TextField label="Page Subtitle" value={subtitle} onChange={setSubtitle} />
        <TextField label="How It Works" value={howto} onChange={setHowto} multiline />
      </SettingsCard>

      <Link to="/admin/referrals" className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-3 hover:border-violet-300">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-violet-700"><Gift className="h-5 w-5" /></div>
        <div className="text-sm font-black text-slate-900">Cashback % & Bonus Amount</div>
      </Link>
    </div>
  );
}

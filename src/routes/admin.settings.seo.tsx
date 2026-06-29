import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SettingsCard, TextField, useSettingsEditor, useLocalState } from "@/components/admin/SettingsUI";
import { DEFAULTS } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/settings/seo")({ component: Page });

function Page() {
  const ed = useSettingsEditor();
  const [title, setTitle] = useLocalState<string>(ed.get("seo_title", DEFAULTS.seo_title));
  const [desc, setDesc] = useLocalState<string>(ed.get("seo_description", DEFAULTS.seo_description));
  const [og, setOg] = useLocalState<string>(ed.get("seo_og_image", ""));
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">SEO Defaults</h1>
        <p className="mt-1 text-xs text-slate-500">Google search e site er title/description.</p>
      </div>
      <SettingsCard title="Meta Tags" icon={<Search className="h-5 w-5" />} accent="sky"
        onSave={() => ed.saveMany([
          { key: "seo_title", value: title }, { key: "seo_description", value: desc }, { key: "seo_og_image", value: og },
        ])} saving={ed.saving}>
        <TextField label="Default Title" value={title} onChange={setTitle} hint="< 60 chars best" />
        <TextField label="Meta Description" value={desc} onChange={setDesc} multiline hint="< 160 chars best" />
        <TextField label="OG / Share Image URL" value={og} onChange={setOg} placeholder="https://.../share.png" hint="Social share preview image" />
        {og && <img src={og} alt="og preview" className="h-32 w-full rounded-lg border object-cover" />}
      </SettingsCard>
    </div>
  );
}

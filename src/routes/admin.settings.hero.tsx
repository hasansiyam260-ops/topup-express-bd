import { createFileRoute } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import { SettingsCard, TextField, ToggleField, useSettingsEditor, useLocalState } from "@/components/admin/SettingsUI";
import { DEFAULTS } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/settings/hero")({ component: Page });

function Page() {
  const ed = useSettingsEditor();
  const [title, setTitle] = useLocalState<string>(ed.get("hero_title", DEFAULTS.hero_title));
  const [subtitle, setSubtitle] = useLocalState<string>(ed.get("hero_subtitle", DEFAULTS.hero_subtitle));
  const [image, setImage] = useLocalState<string>(ed.get("hero_image_url", ""));
  const [enabled, setEnabled] = useLocalState<boolean>(ed.get("hero_enabled", true) !== false);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Hero Banner</h1>
        <p className="mt-1 text-xs text-slate-500">Home page er upor banner.</p>
      </div>
      <SettingsCard title="Banner Content" subtitle="Title, subtitle, background image" icon={<ImageIcon className="h-5 w-5" />} accent="rose"
        onSave={() => ed.saveMany([
          { key: "hero_title", value: title }, { key: "hero_subtitle", value: subtitle },
          { key: "hero_image_url", value: image }, { key: "hero_enabled", value: enabled },
        ])} saving={ed.saving}>
        <ToggleField label="Show Banner" hint="Off korle home page e hero banner dekhabe na" value={enabled} onChange={setEnabled} />
        <TextField label="Title" value={title} onChange={setTitle} />
        <TextField label="Subtitle" value={subtitle} onChange={setSubtitle} />
        <TextField label="Background Image URL" value={image} onChange={setImage} placeholder="https://.../banner.jpg" hint="Khali rakhle default image use hobe" />
        {image && <img src={image} alt="hero preview" className="h-32 w-full rounded-lg border object-cover" />}
      </SettingsCard>
    </div>
  );
}

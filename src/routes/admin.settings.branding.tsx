import { createFileRoute } from "@tanstack/react-router";
import { Palette } from "lucide-react";
import { SettingsCard, TextField, useSettingsEditor, useLocalState } from "@/components/admin/SettingsUI";
import { DEFAULTS } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/settings/branding")({ component: Page });

function Page() {
  const ed = useSettingsEditor();
  const [name, setName] = useLocalState<string>(ed.get("site_name", DEFAULTS.site_name));
  const [tagline, setTagline] = useLocalState<string>(ed.get("site_tagline", DEFAULTS.site_tagline));
  const [logo, setLogo] = useLocalState<string>(ed.get("site_logo_url", ""));
  const [favicon, setFavicon] = useLocalState<string>(ed.get("site_favicon_url", ""));
  const [footer, setFooter] = useLocalState<string>(ed.get("footer_text", DEFAULTS.footer_text));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Branding</h1>
        <p className="mt-1 text-xs text-slate-500">Site name, logo, footer — sob ek jaygay.</p>
      </div>
      <SettingsCard title="Identity" subtitle="Site name, tagline, logo, favicon" icon={<Palette className="h-5 w-5" />} accent="violet"
        onSave={() => ed.saveMany([
          { key: "site_name", value: name }, { key: "site_tagline", value: tagline },
          { key: "site_logo_url", value: logo }, { key: "site_favicon_url", value: favicon },
          { key: "footer_text", value: footer },
        ])} saving={ed.saving}>
        <TextField label="Site Name" value={name} onChange={setName} placeholder="TOP-UP EXPRESS" />
        <TextField label="Tagline" value={tagline} onChange={setTagline} placeholder="কম দামে ভালো সার্ভিস" />
        <TextField label="Logo URL" value={logo} onChange={setLogo} placeholder="https://...png" hint="Header e dekha jabe (paste CDN/Imgur link)." />
        {logo && <img src={logo} alt="logo preview" className="h-12 w-auto rounded border bg-white p-1" />}
        <TextField label="Favicon URL" value={favicon} onChange={setFavicon} placeholder="https://.../favicon.ico" hint="Browser tab er icon." />
        <TextField label="Footer Text" value={footer} onChange={setFooter} multiline />
      </SettingsCard>
    </div>
  );
}

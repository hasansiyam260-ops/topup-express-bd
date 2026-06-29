import { createFileRoute } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { SettingsCard, TextField, useSettingsEditor, useLocalState } from "@/components/admin/SettingsUI";
import { DEFAULTS } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/settings/social")({ component: Page });

function Page() {
  const ed = useSettingsEditor();
  const [tg, setTg] = useLocalState<string>(ed.get("contact_telegram", DEFAULTS.contact_telegram));
  const [fb, setFb] = useLocalState<string>(ed.get("contact_facebook", DEFAULTS.contact_facebook));
  const [yt, setYt] = useLocalState<string>(ed.get("contact_youtube", DEFAULTS.contact_youtube));
  const [wa, setWa] = useLocalState<string>(ed.get("contact_whatsapp", DEFAULTS.contact_whatsapp));
  const [me, setMe] = useLocalState<string>(ed.get("contact_messenger", DEFAULTS.contact_messenger));
  const [tt, setTt] = useLocalState<string>(ed.get("contact_tiktok", ""));
  const [em, setEm] = useLocalState<string>(ed.get("contact_email", ""));
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Social Links</h1>
        <p className="mt-1 text-xs text-slate-500">Khali rakhle oi platform site e dekha jabe na.</p>
      </div>
      <SettingsCard title="Channels" icon={<Share2 className="h-5 w-5" />} accent="sky"
        onSave={() => ed.saveMany([
          { key: "contact_telegram", value: tg }, { key: "contact_facebook", value: fb },
          { key: "contact_youtube", value: yt }, { key: "contact_whatsapp", value: wa },
          { key: "contact_messenger", value: me }, { key: "contact_tiktok", value: tt },
          { key: "contact_email", value: em },
        ])} saving={ed.saving}>
        <TextField label="Telegram URL" value={tg} onChange={setTg} placeholder="https://t.me/..." />
        <TextField label="Facebook URL" value={fb} onChange={setFb} placeholder="https://facebook.com/..." />
        <TextField label="YouTube URL" value={yt} onChange={setYt} placeholder="https://youtube.com/@..." />
        <TextField label="WhatsApp URL" value={wa} onChange={setWa} placeholder="https://wa.me/8801..." />
        <TextField label="Messenger URL" value={me} onChange={setMe} placeholder="https://m.me/..." />
        <TextField label="TikTok URL" value={tt} onChange={setTt} placeholder="https://tiktok.com/@..." />
        <TextField label="Contact Email" value={em} onChange={setEm} placeholder="support@example.com" />
      </SettingsCard>
    </div>
  );
}

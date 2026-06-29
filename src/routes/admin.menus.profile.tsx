import { createFileRoute, Link } from "@tanstack/react-router";
import { Share2, Sparkles, Users } from "lucide-react";
import { SettingsCard, TextField, useSettingsEditor, useLocalState } from "@/components/admin/SettingsUI";

export const Route = createFileRoute("/admin/menus/profile")({ component: Page });

function Page() {
  const ed = useSettingsEditor();
  const [title, setTitle] = useLocalState<string>(ed.get("profile_page_title", "Profile"));
  const [subtitle, setSubtitle] = useLocalState<string>(ed.get("profile_page_subtitle", "Apnar account & stats"));
  const [supportText, setSupportText] = useLocalState<string>(ed.get("profile_support_text", "Kono problem? amader Telegram / WhatsApp e message korun — 24/7 support."));
  const [logoutLabel, setLogoutLabel] = useLocalState<string>(ed.get("profile_logout_label", "Log Out"));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Profile Menu</h1>
        <p className="mt-1 text-xs text-slate-500">Profile page er text & support message.</p>
      </div>

      <SettingsCard title="Page Text" icon={<Sparkles className="h-5 w-5" />} accent="amber"
        onSave={() => ed.saveMany([
          { key: "profile_page_title", value: title },
          { key: "profile_page_subtitle", value: subtitle },
          { key: "profile_support_text", value: supportText },
          { key: "profile_logout_label", value: logoutLabel },
        ])} saving={ed.saving}>
        <TextField label="Page Title" value={title} onChange={setTitle} />
        <TextField label="Page Subtitle" value={subtitle} onChange={setSubtitle} />
        <TextField label="Support / Contact Message" value={supportText} onChange={setSupportText} multiline />
        <TextField label="Logout Button Label" value={logoutLabel} onChange={setLogoutLabel} />
      </SettingsCard>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to="/admin/settings/social" className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-3 hover:border-amber-300">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-700"><Share2 className="h-5 w-5" /></div>
          <div className="text-sm font-black text-slate-900">Social / Support Links</div>
        </Link>
        <Link to="/admin/users" className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-3 hover:border-amber-300">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-700"><Users className="h-5 w-5" /></div>
          <div className="text-sm font-black text-slate-900">Manage All Users</div>
        </Link>
      </div>
    </div>
  );
}

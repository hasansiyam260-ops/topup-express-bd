import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { SettingsCard, TextField, ToggleField, useSettingsEditor, useLocalState } from "@/components/admin/SettingsUI";
import { DEFAULTS } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/settings/chat")({ component: Page });

const MODELS = [
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (fast)" },
  { id: "google/gemini-3-pro-preview", label: "Gemini 3 Pro (smart)" },
  { id: "openai/gpt-5-mini", label: "GPT-5 Mini" },
];

function Page() {
  const ed = useSettingsEditor();
  const [enabled, setEnabled] = useLocalState<boolean>(ed.get("live_chat_enabled", true) !== false);
  const [welcome, setWelcome] = useLocalState<string>(ed.get("live_chat_welcome", DEFAULTS.live_chat_welcome));
  const [prompt, setPrompt] = useLocalState<string>(ed.get("live_chat_system_prompt", ""));
  const [model, setModel] = useLocalState<string>(ed.get("live_chat_model", DEFAULTS.live_chat_model));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">AI Live Chat</h1>
        <p className="mt-1 text-xs text-slate-500">Welcome message, AI behavior, model — sob tomar control e.</p>
      </div>
      <SettingsCard title="Chat Bot" icon={<Sparkles className="h-5 w-5" />} accent="violet"
        onSave={() => ed.saveMany([
          { key: "live_chat_enabled", value: enabled }, { key: "live_chat_welcome", value: welcome },
          { key: "live_chat_system_prompt", value: prompt }, { key: "live_chat_model", value: model },
        ])} saving={ed.saving}>
        <ToggleField label="Enable Live Chat" hint="Off korle floating chat button site e dekhabe na" value={enabled} onChange={setEnabled} />
        <TextField label="Welcome Message" value={welcome} onChange={setWelcome} multiline />
        <TextField label="System Prompt (AI er behavior)" value={prompt} onChange={setPrompt} multiline
          hint="Khali rakhle default system prompt use hobe. Edit korle AI ei ভাবে behave korbe." />
        <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
          <div className="text-[11px] font-black uppercase tracking-wide text-slate-700">AI Model</div>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {MODELS.map((m) => (
              <button key={m.id} onClick={() => setModel(m.id)} className={`rounded-lg border-2 p-2.5 text-left text-xs font-bold ${model === m.id ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-white"}`}>
                {m.label}
                <div className="text-[10px] font-normal text-slate-500">{m.id}</div>
              </button>
            ))}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type ReactNode } from "react";
import { adminListContent, adminUpsertContent } from "@/lib/admin.functions";
import { Save } from "lucide-react";
import { toast } from "sonner";

export function useSettingsEditor() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListContent);
  const upsertFn = useServerFn(adminUpsertContent);
  const { data: rows } = useSuspenseQuery({ queryKey: ["admin", "content"], queryFn: () => listFn() });
  const map = new Map<string, any>();
  (rows ?? []).forEach((r: any) => map.set(r.key, r.value));

  const m = useMutation({
    mutationFn: async (entries: Array<{ key: string; value: any }>) => {
      for (const e of entries) await upsertFn({ data: e });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
      qc.invalidateQueries({ queryKey: ["site_content"] });
      toast.success("Saved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { get: (k: string, fallback?: any) => (map.has(k) ? map.get(k) : fallback), saveMany: m.mutate, saving: m.isPending };
}

export function SettingsCard({ title, subtitle, icon, accent = "rose", children, onSave, saving, dirty = true }: {
  title: string; subtitle?: string; icon: ReactNode; accent?: "rose" | "amber" | "emerald" | "sky" | "violet";
  children: ReactNode; onSave: () => void; saving: boolean; dirty?: boolean;
}) {
  const tint: Record<string, string> = {
    rose: "border-rose-200 from-rose-50",
    amber: "border-amber-200 from-amber-50",
    emerald: "border-emerald-200 from-emerald-50",
    sky: "border-sky-200 from-sky-50",
    violet: "border-violet-200 from-violet-50",
  };
  const btn: Record<string, string> = {
    rose: "from-rose-500 to-rose-700",
    amber: "from-amber-500 to-amber-700",
    emerald: "from-emerald-500 to-emerald-700",
    sky: "from-sky-500 to-sky-700",
    violet: "from-violet-500 to-violet-700",
  };
  return (
    <div className={`overflow-hidden rounded-2xl border-2 ${tint[accent]} bg-gradient-to-br to-white shadow-sm`}>
      <div className="flex items-center gap-2 border-b border-white/80 bg-white/70 px-4 py-3">
        <div className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${btn[accent]} text-white shadow`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black text-slate-900">{title}</div>
          {subtitle && <div className="text-[11px] text-slate-500">{subtitle}</div>}
        </div>
      </div>
      <div className="space-y-3 p-3">{children}</div>
      <div className="border-t bg-white/70 p-3">
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          className={`flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-br ${btn[accent]} px-3 py-3 text-sm font-black text-white shadow active:scale-95 disabled:opacity-40`}
        >
          <Save className="h-4 w-4" /> {saving ? "Saving..." : dirty ? "Save Changes" : "Saved"}
        </button>
      </div>
    </div>
  );
}

export function TextField({ label, value, onChange, placeholder, hint, multiline, type = "text", suffix }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; multiline?: boolean; type?: string; suffix?: string;
}) {
  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
      <div className="text-[11px] font-black uppercase tracking-wide text-slate-700">{label}</div>
      <div className="mt-2 flex items-center gap-2">
        {multiline ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4}
            className="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none" />
        ) : (
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className="w-full rounded-lg border-2 border-slate-200 px-3 py-3 text-sm font-semibold focus:border-rose-500 focus:outline-none" />
        )}
        {suffix && <span className="text-sm font-black text-slate-500">{suffix}</span>}
      </div>
      {hint && <div className="mt-1.5 text-[10px] text-slate-500">{hint}</div>}
    </div>
  );
}

export function ToggleField({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-slate-200 bg-white p-3">
      <div className="min-w-0">
        <div className="text-[12px] font-black text-slate-900">{label}</div>
        {hint && <div className="text-[10px] text-slate-500">{hint}</div>}
      </div>
      <button onClick={() => onChange(!value)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${value ? "bg-emerald-500" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export function useLocalState<T>(initial: T) {
  const [val, setVal] = useState<T>(initial);
  useEffect(() => setVal(initial), [JSON.stringify(initial)]);
  return [val, setVal] as const;
}

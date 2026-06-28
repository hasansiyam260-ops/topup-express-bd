import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListContent, adminUpsertContent } from "@/lib/admin.functions";
import { Save, Check, FileJson, Type } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

function AdminContent() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListContent);
  const upsertFn = useServerFn(adminUpsertContent);
  const { data } = useSuspenseQuery({ queryKey: ["admin", "content"], queryFn: () => listFn() });

  const upsertM = useMutation({
    mutationFn: (v: { key: string; value: any }) => upsertFn({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "content"] }); qc.invalidateQueries({ queryKey: ["site_content"] }); toast.success("Content saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Site Content</h1>
        <p className="mt-1 text-xs text-slate-500">Edit any text or content shown on the site. Click Save after each change.</p>
      </div>

      <div className="space-y-3">
        {data.map((row: any) => (
          <ContentEditor key={row.key} row={row} onSave={(v) => upsertM.mutate({ key: row.key, value: v })} saving={upsertM.isPending} />
        ))}
        {data.length === 0 && <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-400">No editable content keys</div>}
      </div>
    </div>
  );
}

function ContentEditor({ row, onSave, saving }: { row: any; onSave: (v: any) => void; saving: boolean }) {
  const isString = typeof row.value === "string";
  const initial = isString ? row.value : JSON.stringify(row.value, null, 2);
  const [val, setVal] = useState<string>(initial);
  const isLong = isString && row.value.length > 80;
  const isJson = !isString;
  const dirty = val !== initial;

  const handleSave = () => {
    if (isJson) {
      try { onSave(JSON.parse(val)); } catch { toast.error("Invalid JSON format"); }
    } else {
      onSave(val);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b bg-slate-50 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {isJson ? <FileJson className="h-4 w-4 shrink-0 text-amber-600" /> : <Type className="h-4 w-4 shrink-0 text-sky-600" />}
          <div className="min-w-0">
            <div className="truncate text-sm font-black text-slate-900">{row.key}</div>
            <div className="text-[10px] font-bold uppercase text-slate-400">{isJson ? "JSON" : isLong ? "Long Text" : "Single Line"}</div>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-white active:scale-95 disabled:opacity-40 ${dirty ? "bg-rose-600" : "bg-slate-400"}`}
        >
          {dirty ? <><Save className="h-3.5 w-3.5" /> Save</> : <><Check className="h-3.5 w-3.5" /> Saved</>}
        </button>
      </div>
      <div className="p-3">
        {isJson || isLong ? (
          <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={isJson ? 8 : 4} className="w-full rounded-lg border border-slate-200 p-3 font-mono text-xs focus:border-rose-500 focus:outline-none" />
        ) : (
          <input value={val} onChange={(e) => setVal(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm focus:border-rose-500 focus:outline-none" />
        )}
      </div>
    </div>
  );
}

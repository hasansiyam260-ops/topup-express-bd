import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListContent, adminUpsertContent } from "@/lib/admin.functions";
import { Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/content")({
  component: AdminContent,
});

function AdminContent() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListContent);
  const upsertFn = useServerFn(adminUpsertContent);
  const { data } = useSuspenseQuery({ queryKey: ["admin", "content"], queryFn: () => listFn() });

  const upsertM = useMutation({
    mutationFn: (v: { key: string; value: any }) => upsertFn({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "content"] }); qc.invalidateQueries({ queryKey: ["site_content"] }); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Site Content</h1>
        <p className="text-sm text-slate-500">Edit all editable text and content on the site.</p>
      </div>

      <div className="space-y-3">
        {data.map((row: any) => (
          <ContentEditor key={row.key} row={row} onSave={(v) => upsertM.mutate({ key: row.key, value: v })} saving={upsertM.isPending} />
        ))}
      </div>
    </div>
  );
}

function ContentEditor({ row, onSave, saving }: { row: any; onSave: (v: any) => void; saving: boolean }) {
  const isString = typeof row.value === "string";
  const [val, setVal] = useState<string>(isString ? row.value : JSON.stringify(row.value, null, 2));
  const isLong = isString && row.value.length > 80;
  const isJson = !isString;

  const handleSave = () => {
    if (isJson) {
      try { onSave(JSON.parse(val)); } catch { toast.error("Invalid JSON"); }
    } else {
      onSave(val);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-sm font-black text-slate-900">{row.key}</div>
          <div className="text-[10px] font-bold uppercase text-slate-400">{isJson ? "JSON" : isLong ? "TEXT" : "STRING"}</div>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50">
          <Save className="h-3 w-3" /> Save
        </button>
      </div>
      {isJson || isLong ? (
        <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={isJson ? 8 : 3} className="w-full rounded-lg border border-slate-200 p-3 font-mono text-xs focus:border-rose-500 focus:outline-none" />
      ) : (
        <input value={val} onChange={(e) => setVal(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none" />
      )}
    </div>
  );
}

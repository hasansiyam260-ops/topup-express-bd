import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  adminListProviders, adminUpsertProvider, adminDeleteProvider,
  adminGetAutoDeliveryConfig, adminSaveAutoDeliveryConfig, adminRetryDelivery,
} from "@/lib/delivery.functions";
import { Plus, Trash2, Save, Rocket, Power } from "lucide-react";

export const Route = createFileRoute("/admin/delivery")({
  component: DeliveryAdmin,
});

const PROVIDER_TYPES = [
  { v: "yokcash", label: "Yokcash (Free Fire / Mobile Legends)" },
  { v: "smileone", label: "Smile.one" },
  { v: "moogold", label: "Moogold" },
  { v: "custom", label: "Custom HTTP API" },
];

function DeliveryAdmin() {
  const qc = useQueryClient();
  const providersQ = useQuery({ queryKey: ["adm", "providers"], queryFn: () => adminListProviders() });
  const cfgQ = useQuery({ queryKey: ["adm", "autoCfg"], queryFn: () => adminGetAutoDeliveryConfig() });

  const [cfg, setCfg] = useState<any>(null);
  const c = cfg ?? cfgQ.data ?? { enabled: false, webhook_url: "", secret: "" };

  const saveCfg = useMutation({
    mutationFn: () => adminSaveAutoDeliveryConfig({ data: { config: c } }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["adm", "autoCfg"] }); setCfg(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const [editing, setEditing] = useState<any | null>(null);
  const upsert = useMutation({
    mutationFn: (p: any) => adminUpsertProvider({ data: { provider: p } }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["adm", "providers"] }); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => adminDeleteProvider({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["adm", "providers"] }); },
  });

  const projectBase = typeof window !== "undefined" ? window.location.origin : "";
  const suggestedUrl = `${projectBase}/api/public/hooks/auto-deliver`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Auto-Delivery</h1>
        <p className="text-sm text-slate-600">Plug-and-play diamond auto-delivery via reseller APIs.</p>
      </div>

      {/* Auto-Delivery Config */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Power className="h-4 w-4 text-rose-600" />
          <h2 className="text-base font-black">Webhook Config</h2>
        </div>
        <div className="grid gap-3">
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={!!c.enabled}
              onChange={(e) => setCfg({ ...c, enabled: e.target.checked })} />
            Enable auto-delivery (new orders auto-dispatch)
          </label>
          <div>
            <label className="text-xs font-bold text-slate-600">Webhook URL</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={c.webhook_url || ""} onChange={(e) => setCfg({ ...c, webhook_url: e.target.value })}
              placeholder={suggestedUrl} />
            <button type="button" className="mt-1 text-xs text-rose-600 underline"
              onClick={() => setCfg({ ...c, webhook_url: suggestedUrl })}>
              Use this site's URL
            </button>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Shared Secret (any random string)</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono"
              value={c.secret || ""} onChange={(e) => setCfg({ ...c, secret: e.target.value })}
              placeholder="e.g. paste a long random string" />
          </div>
          <button onClick={() => saveCfg.mutate()} disabled={saveCfg.isPending}
            className="inline-flex w-fit items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50">
            <Save className="h-4 w-4" /> Save Config
          </button>
        </div>
      </div>

      {/* Providers */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-rose-600" />
            <h2 className="text-base font-black">Providers</h2>
          </div>
          <button onClick={() => setEditing({ name: "", type: "yokcash", api_url: "", credentials: {}, is_enabled: true })}
            className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white">
            <Plus className="h-3.5 w-3.5" /> Add Provider
          </button>
        </div>

        <div className="space-y-2">
          {(providersQ.data ?? []).map((p: any) => (
            <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-bold">{p.name} <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{p.type}</span></div>
                <div className="text-xs text-slate-500">{p.is_enabled ? "Enabled" : "Disabled"} · {p.api_url || "default URL"}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(p)} className="rounded bg-slate-100 px-3 py-1 text-xs font-bold">Edit</button>
                <button onClick={() => del.mutate(p.id)} className="rounded bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                  <Trash2 className="inline h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          {(providersQ.data ?? []).length === 0 && (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-slate-500">
              No providers yet. Add Yokcash / Smile.one / Moogold or a custom API.
            </div>
          )}
        </div>
      </div>

      {/* Help */}
      <div className="rounded-xl border bg-amber-50 p-4 text-xs text-amber-900">
        <p className="font-bold">How to use:</p>
        <ol className="ml-4 list-decimal space-y-1">
          <li>Add a provider above with your API key/credentials.</li>
          <li>Go to <b>Products</b> → edit a product → set <b>delivery_provider</b> = provider name and <b>provider_sku</b> = the SKU/service ID from the provider.</li>
          <li>Enable the webhook config above. New orders will auto-deliver.</li>
          <li>For failed orders, use the retry button on the order page.</li>
        </ol>
      </div>

      {editing && (
        <ProviderModal initial={editing} onClose={() => setEditing(null)} onSave={(p) => upsert.mutate(p)} saving={upsert.isPending} />
      )}
    </div>
  );
}

function ProviderModal({ initial, onClose, onSave, saving }: { initial: any; onClose: () => void; onSave: (p: any) => void; saving: boolean }) {
  const [p, setP] = useState<any>(initial);
  const creds = p.credentials ?? {};
  const setCred = (k: string, v: string) => setP({ ...p, credentials: { ...creds, [k]: v } });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <h3 className="mb-3 text-lg font-black">{p.id ? "Edit" : "Add"} Provider</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold">Name (used in product mapping)</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={p.name || ""} onChange={(e) => setP({ ...p, name: e.target.value })} placeholder="e.g. yokcash-main" />
          </div>
          <div>
            <label className="text-xs font-bold">Type</label>
            <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={p.type} onChange={(e) => setP({ ...p, type: e.target.value, credentials: {} })}>
              {PROVIDER_TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold">API URL (optional — leave blank for default)</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={p.api_url || ""} onChange={(e) => setP({ ...p, api_url: e.target.value })} />
          </div>

          {p.type === "yokcash" && (
            <div>
              <label className="text-xs font-bold">API Key</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono"
                value={creds.api_key || ""} onChange={(e) => setCred("api_key", e.target.value)} />
            </div>
          )}
          {p.type === "smileone" && (
            <>
              <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="UID"
                value={creds.uid || ""} onChange={(e) => setCred("uid", e.target.value)} />
              <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Email"
                value={creds.email || ""} onChange={(e) => setCred("email", e.target.value)} />
              <input className="w-full rounded-md border px-3 py-2 text-sm font-mono" placeholder="Sign / API Secret"
                value={creds.sign || ""} onChange={(e) => setCred("sign", e.target.value)} />
            </>
          )}
          {p.type === "moogold" && (
            <>
              <input className="w-full rounded-md border px-3 py-2 text-sm font-mono" placeholder="Bearer API Key"
                value={creds.api_key || ""} onChange={(e) => setCred("api_key", e.target.value)} />
              <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Server ID (optional)"
                value={creds.server_id || ""} onChange={(e) => setCred("server_id", e.target.value)} />
            </>
          )}
          {p.type === "custom" && (
            <input className="w-full rounded-md border px-3 py-2 text-sm font-mono" placeholder="Bearer API Key (optional)"
              value={creds.api_key || ""} onChange={(e) => setCred("api_key", e.target.value)} />
          )}

          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={!!p.is_enabled} onChange={(e) => setP({ ...p, is_enabled: e.target.checked })} />
            Enabled
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md bg-slate-100 px-4 py-2 text-sm font-bold">Cancel</button>
          <button onClick={() => onSave(p)} disabled={saving}
            className="rounded-md bg-rose-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

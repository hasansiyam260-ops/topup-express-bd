import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, Sparkles } from "lucide-react";
import { SettingsCard, TextField, useSettingsEditor, useLocalState } from "@/components/admin/SettingsUI";

export const Route = createFileRoute("/admin/menus/orders")({ component: Page });

function Page() {
  const ed = useSettingsEditor();
  const [title, setTitle] = useLocalState<string>(ed.get("orders_page_title", "My Orders"));
  const [subtitle, setSubtitle] = useLocalState<string>(ed.get("orders_page_subtitle", "Apnar shob order er real-time status"));
  const [empty, setEmpty] = useLocalState<string>(ed.get("orders_empty_text", "এখনো কোনো অর্ডার নেই — প্রথম অর্ডার দিয়ে শুরু করুন!"));
  const [pendingLabel, setPendingLabel] = useLocalState<string>(ed.get("orders_label_pending", "Processing"));
  const [completedLabel, setCompletedLabel] = useLocalState<string>(ed.get("orders_label_completed", "Delivered"));
  const [cancelledLabel, setCancelledLabel] = useLocalState<string>(ed.get("orders_label_cancelled", "Cancelled"));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">My Orders Menu</h1>
        <p className="mt-1 text-xs text-slate-500">Order history page er text & labels.</p>
      </div>

      <SettingsCard title="Page Text" icon={<Sparkles className="h-5 w-5" />} accent="sky"
        onSave={() => ed.saveMany([
          { key: "orders_page_title", value: title },
          { key: "orders_page_subtitle", value: subtitle },
          { key: "orders_empty_text", value: empty },
        ])} saving={ed.saving}>
        <TextField label="Page Title" value={title} onChange={setTitle} />
        <TextField label="Page Subtitle" value={subtitle} onChange={setSubtitle} />
        <TextField label="Empty State Message" value={empty} onChange={setEmpty} multiline />
      </SettingsCard>

      <SettingsCard title="Status Labels" icon={<ShoppingBag className="h-5 w-5" />} accent="sky"
        onSave={() => ed.saveMany([
          { key: "orders_label_pending", value: pendingLabel },
          { key: "orders_label_completed", value: completedLabel },
          { key: "orders_label_cancelled", value: cancelledLabel },
        ])} saving={ed.saving}>
        <TextField label="Pending Label" value={pendingLabel} onChange={setPendingLabel} />
        <TextField label="Completed Label" value={completedLabel} onChange={setCompletedLabel} />
        <TextField label="Cancelled Label" value={cancelledLabel} onChange={setCancelledLabel} />
      </SettingsCard>

      <Link to="/admin/orders" className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-3 hover:border-sky-300">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-700"><ShoppingBag className="h-5 w-5" /></div>
        <div className="text-sm font-black text-slate-900">Manage All Orders (approve / cancel / export)</div>
      </Link>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { adminListContent, adminUpsertContent } from "@/lib/admin.functions";
import { Gift, Save, Percent, Coins, Power } from "lucide-react";
import { toast } from "sonner";

const KEY = "referral_config";

export const Route = createFileRoute("/admin/referrals")({
  component: AdminReferrals,
});

function AdminReferrals() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListContent);
  const upsertFn = useServerFn(adminUpsertContent);
  const { data } = useSuspenseQuery({ queryKey: ["admin", "content"], queryFn: () => listFn() });

  const row = data.find((r: any) => r.key === KEY);
  const initial = (row?.value ?? {}) as any;

  const [cashback, setCashback] = useState<string>(String(initial?.cashback_rate ?? 2));
  const [bonus, setBonus] = useState<string>(String(initial?.first_purchase_bonus ?? 20));
  const [enabled, setEnabled] = useState<boolean>(initial?.enabled !== false);

  useEffect(() => {
    setCashback(String(initial?.cashback_rate ?? 2));
    setBonus(String(initial?.first_purchase_bonus ?? 20));
    setEnabled(initial?.enabled !== false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.value]);

  const upsertM = useMutation({
    mutationFn: (v: any) => upsertFn({ data: { key: KEY, value: v } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
      qc.invalidateQueries({ queryKey: ["site_content"] });
      qc.invalidateQueries({ queryKey: ["my-referral-info"] });
      toast.success("Referral settings saved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const cashbackNum = Number(cashback);
  const bonusNum = Number(bonus);
  const validCash = !isNaN(cashbackNum) && cashbackNum >= 0 && cashbackNum <= 100;
  const validBonus = !isNaN(bonusNum) && bonusNum >= 0;
  const canSave = validCash && validBonus;

  const handleSave = () => {
    if (!canSave) return toast.error("Check the values");
    upsertM.mutate({ cashback_rate: cashbackNum, first_purchase_bonus: bonusNum, enabled });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Refer & Earn Settings</h1>
        <p className="mt-1 text-xs text-slate-500">Control referral cashback %, first-purchase bonus, and on/off — instantly live.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-rose-100 bg-white/70 px-4 py-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow">
            <Gift className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black text-slate-900">Referral Rewards</div>
            <div className="text-[11px] text-slate-500">Live cashback % + one-time bonus on referee's first purchase</div>
          </div>
          <button
            onClick={() => setEnabled((v) => !v)}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black ${enabled ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"}`}
          >
            <Power className="h-3 w-3" /> {enabled ? "ENABLED" : "DISABLED"}
          </button>
        </div>

        <div className="grid gap-3 p-3 md:grid-cols-2">
          <Field
            icon={<Percent className="h-4 w-4" />}
            label="Lifetime Cashback %"
            hint="Referrer gets this % of every purchase amount from their referees."
            value={cashback}
            onChange={setCashback}
            suffix="%"
            invalid={!validCash}
          />
          <Field
            icon={<Coins className="h-4 w-4" />}
            label="First Purchase Bonus"
            hint="One-time bonus added on top of cashback for the referee's first purchase."
            value={bonus}
            onChange={setBonus}
            suffix="৳"
            invalid={!validBonus}
          />
        </div>

        <div className="border-t border-rose-100 bg-white/70 p-3">
          <div className="mb-2 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600">
            <b>Example:</b> If a friend spends ৳500 on first purchase → referrer gets ৳{Math.round(500 * (cashbackNum / 100))} cashback + ৳{bonusNum} bonus = <b className="text-rose-600">৳{Math.round(500 * (cashbackNum / 100)) + bonusNum}</b>
          </div>
          <button
            onClick={handleSave}
            disabled={!canSave || upsertM.isPending}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 px-3 py-3 text-sm font-black text-white shadow active:scale-95 disabled:opacity-40"
          >
            <Save className="h-4 w-4" /> {upsertM.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, hint, value, onChange, suffix, invalid }: { icon: React.ReactNode; label: string; hint: string; value: string; onChange: (v: string) => void; suffix: string; invalid: boolean }) {
  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-700">
        <span className="text-rose-600">{icon}</span> {label}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg border-2 px-3 py-3 text-lg font-black focus:outline-none ${invalid ? "border-red-400" : "border-slate-200 focus:border-rose-500"}`}
        />
        <span className="text-base font-black text-slate-500">{suffix}</span>
      </div>
      <div className="mt-1.5 text-[10px] text-slate-500">{hint}</div>
    </div>
  );
}

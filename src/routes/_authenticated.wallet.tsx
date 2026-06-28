import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/site/AppShell";
import { Wallet, Info, ShieldCheck, Zap, History, CheckCircle2, Hash, CreditCard, Clock } from "lucide-react";
import { SecureCheckout } from "@/components/site/SecureCheckout";

type AddMoneyEntry = { invoiceId: string; brand: string; amount: number; ts: number };
const HISTORY_KEY = "uidtopup:addmoney:history";

function loadHistory(): AddMoneyEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function pushHistory(e: AddMoneyEntry) {
  try {
    const list = loadHistory();
    list.unshift(e);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {}
}

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({ meta: [{ title: "Add Money — UIDTOPUP.COM" }] }),
  component: WalletPage,
});

function WalletPage() {
  const [amount, setAmount] = useState<string>("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const numeric = Number(amount || 0);
  const valid = numeric >= 10;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-3 pt-3 pb-6 space-y-3">
        {/* Compact Premium Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1140] via-[#3b1a6b] to-[#0f0726] px-4 py-3 text-white shadow-[0_10px_30px_-14px_rgba(99,40,200,0.6)]">
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-fuchsia-500/30 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-indigo-500/30 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-white/10 backdrop-blur ring-1 ring-white/25 shrink-0">
              <Wallet className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] tracking-[0.3em] uppercase text-white/60 leading-none">My Wallet</div>
              <h1 className="font-display text-lg leading-tight mt-0.5">ADD MONEY</h1>
            </div>
            <span className="flex items-center gap-1 text-[9px] tracking-wider uppercase bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 shrink-0">
              <ShieldCheck className="h-2.5 w-2.5" /> Secure
            </span>
          </div>
        </div>

        {/* Step 1 — Manual amount (compact) */}
        <section className="rounded-2xl card-soft p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="grid place-items-center h-7 w-7 rounded-full bg-primary text-primary-foreground font-display text-sm shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand-red)_15%,transparent)]">1</span>
            <h2 className="font-display text-base tracking-wide">ENTER AMOUNT</h2>
          </div>

          <label className="block">
            <div className="relative rounded-xl border-2 border-border focus-within:border-primary focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand-red)_12%,transparent)] bg-gradient-to-br from-white to-muted/30 transition-all overflow-hidden">
              <div className="flex items-center px-3.5 py-2.5">
                <span className="font-display text-2xl text-primary mr-1.5 leading-none">৳</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, "").slice(0, 7))}
                  className="flex-1 bg-transparent outline-none font-display text-2xl text-foreground placeholder:text-muted-foreground/40 tracking-tight w-full min-w-0 leading-none"
                />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground shrink-0">BDT</span>
              </div>
            </div>
          </label>

          <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
            <Info className="h-2.5 w-2.5" /> Min ৳10 · নিজের পছন্দমতো amount লিখুন
          </p>
        </section>

        {/* Step 2 — Payment Method (selection happens in Secure Checkout) */}
        <section className="rounded-2xl card-soft p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="grid place-items-center h-7 w-7 rounded-full bg-primary text-primary-foreground font-display text-sm shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand-red)_15%,transparent)]">2</span>
            <h2 className="font-display text-base tracking-wide">PAYMENT METHOD</h2>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Confirm করার পর <span className="font-semibold text-foreground">bKash · Nagad · Rocket · Upay</span> অপশন থেকে নিরাপদ Secure Checkout এ payment complete করুন।
          </p>
        </section>

        {/* Confirm */}
        <button
          disabled={!valid}
          onClick={() => valid && setCheckoutOpen(true)}
          className="btn-red w-full py-3 rounded-xl text-sm font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--brand-red)_55%,transparent)] flex items-center justify-center gap-2"
        >
          <Zap className="h-4 w-4" />
          {valid ? `ADD ৳${numeric.toLocaleString()} TO WALLET` : "ENTER AMOUNT TO CONTINUE"}
        </button>

        <div className="rounded-xl border border-border bg-card p-3 flex items-start gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            ওয়ালেট ব্যবহার করে যেকোনো প্রোডাক্ট <span className="font-semibold text-foreground">instantly purchase</span> করুন। bKash / Nagad / Rocket দিয়ে নিরাপদে টপআপ করতে পারবেন।
          </p>
        </div>
      </div>

      {checkoutOpen && (
        <SecureCheckout amount={numeric} onClose={() => setCheckoutOpen(false)} onVerified={({ amount: a }) => { try { const prev = Number(localStorage.getItem("uidtopup:wallet") || "0"); localStorage.setItem("uidtopup:wallet", String(prev + a)); } catch {} return true; }} />
      )}
    </AppShell>
  );
}

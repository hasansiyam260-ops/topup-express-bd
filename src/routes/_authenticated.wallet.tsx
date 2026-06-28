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
  head: () => ({ meta: [{ title: "Add Money — TOP-UP EXPRESS" }] }),
  component: WalletPage,
});

function WalletPage() {
  const [amount, setAmount] = useState<string>("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [history, setHistory] = useState<AddMoneyEntry[]>([]);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    try { setBalance(Number(localStorage.getItem("uidtopup:wallet") || "0")); } catch {}
  }, []);

  useEffect(() => { setHistory(loadHistory()); }, []);

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
            <div className="shrink-0 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/15 border border-emerald-300/40 px-2.5 py-1.5 backdrop-blur-md shadow-[0_0_18px_-4px_rgba(16,185,129,0.55)]">
              <div className="text-[8px] tracking-[0.25em] uppercase text-emerald-200/90 leading-none flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5" /> Balance
              </div>
              <div className="font-display text-base leading-none mt-1 text-white drop-shadow-[0_0_6px_rgba(110,231,183,0.6)]">
                ৳{balance.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="rounded-xl bg-gradient-to-br from-white via-rose-50/50 to-sky-50/40 border-2 border-rose-200/70 border-l-4 border-l-rose-500 p-3 shadow-[0_6px_20px_-12px_rgba(244,63,94,0.45)]">
          <ul className="space-y-1.5 text-[11px] leading-snug">
            <li className="flex gap-2"><span className="text-rose-500 mt-0.5">●</span><span><span className="font-bold text-rose-700">Instant Add</span> — bKash · Nagad · Rocket দিয়ে সাথে সাথে wallet এ টাকা যোগ হবে।</span></li>
            <li className="flex gap-2"><span className="text-emerald-500 mt-0.5">●</span><span><span className="font-bold text-emerald-700">100% Secure</span> — সকল transaction encrypted ও নিরাপদভাবে সংরক্ষিত।</span></li>
            <li className="flex gap-2"><span className="text-rose-500 mt-0.5">●</span><span><span className="font-bold text-rose-700">Min ৳10</span> — নিজের পছন্দমতো amount দিয়ে wallet recharge করুন।</span></li>
          </ul>
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

        {/* Add Money History */}
        <section className="rounded-2xl bg-gradient-to-br from-white via-rose-50/40 to-sky-50/40 border-2 border-rose-200/70 p-3 shadow-[0_10px_30px_-18px_rgba(244,63,94,0.45)]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center h-7 w-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-[0_4px_12px_-4px_rgba(244,63,94,0.6)]">
                <History className="h-3.5 w-3.5" />
              </span>
              <div>
                <h2 className="font-display text-sm tracking-wide text-rose-700 leading-none">ADD MONEY HISTORY</h2>
                <p className="text-[9px] text-muted-foreground mt-0.5">সকল add money transaction</p>
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-rose-500/10 text-rose-700 px-2 py-1 rounded-full border border-rose-300/60">
              {history.length} {history.length === 1 ? "Entry" : "Entries"}
            </span>
          </div>

          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-rose-200 bg-white/60 py-6 text-center">
              <Wallet className="h-6 w-6 mx-auto text-rose-300 mb-1.5" />
              <p className="text-[11px] text-muted-foreground">এখনো কোনো add money হয়নি</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">প্রথম টপআপ এর পর এখানে দেখা যাবে</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => {
                const d = new Date(h.ts);
                const brandColor =
                  h.brand === "bkash" ? "from-pink-500 to-pink-600" :
                  h.brand === "nagad" ? "from-orange-500 to-red-600" :
                  h.brand === "rocket" ? "from-purple-500 to-violet-700" :
                  "from-sky-500 to-blue-600";
                return (
                  <li key={h.invoiceId} className="rounded-xl bg-white border border-rose-100 p-2.5 shadow-[0_4px_14px_-10px_rgba(244,63,94,0.35)]">
                    <div className="flex items-center gap-2.5">
                      <span className={`grid place-items-center h-9 w-9 rounded-lg bg-gradient-to-br ${brandColor} text-white shrink-0 shadow-md`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-display text-[15px] leading-none text-emerald-700">
                            +৳{h.amount.toLocaleString()}
                          </div>
                          <span className="text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-300/50">
                            Success
                          </span>
                        </div>
                        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                          <div className="rounded-md border border-rose-100 bg-rose-50/50 px-1.5 py-1">
                            <div className="text-[8px] tracking-wider uppercase text-rose-600 font-bold flex items-center gap-0.5"><CreditCard className="h-2 w-2" />Method</div>
                            <div className="text-[10px] font-semibold text-foreground capitalize truncate">{h.brand}</div>
                          </div>
                          <div className="rounded-md border border-rose-100 bg-rose-50/50 px-1.5 py-1">
                            <div className="text-[8px] tracking-wider uppercase text-rose-600 font-bold flex items-center gap-0.5"><Hash className="h-2 w-2" />TXID</div>
                            <div className="text-[10px] font-semibold text-foreground truncate">{h.invoiceId}</div>
                          </div>
                          <div className="rounded-md border border-rose-100 bg-rose-50/50 px-1.5 py-1">
                            <div className="text-[8px] tracking-wider uppercase text-rose-600 font-bold flex items-center gap-0.5"><Clock className="h-2 w-2" />Date</div>
                            <div className="text-[10px] font-semibold text-foreground truncate">{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {checkoutOpen && (
        <SecureCheckout
          amount={numeric}
          onClose={() => setCheckoutOpen(false)}
          onVerified={({ amount: a, invoiceId, brand }) => {
            try {
              const prev = Number(localStorage.getItem("uidtopup:wallet") || "0");
              const next = prev + a;
              localStorage.setItem("uidtopup:wallet", String(next));
              setBalance(next);
            } catch {}
            const entry: AddMoneyEntry = { invoiceId, brand, amount: a, ts: Date.now() };
            pushHistory(entry);
            setHistory((h) => [entry, ...h]);
            return true;
          }}
        />
      )}
    </AppShell>
  );
}

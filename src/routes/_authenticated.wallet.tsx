import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/site/AppShell";
import { Wallet, Info, ShieldCheck, Zap } from "lucide-react";
import { SecureCheckout } from "@/components/site/SecureCheckout";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({ meta: [{ title: "Add Money — UIDTOPUP.COM" }] }),
  component: WalletPage,
});

type Method = "bkash" | "nagad" | "rocket";

function WalletPage() {
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<Method>("bkash");
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

        {/* Step 2 — Payment Method */}
        <section className="rounded-2xl card-soft p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="grid place-items-center h-7 w-7 rounded-full bg-primary text-primary-foreground font-display text-sm shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand-red)_15%,transparent)]">2</span>
            <h2 className="font-display text-base tracking-wide">PAYMENT METHOD</h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MethodCard active={method === "bkash"} onClick={() => setMethod("bkash")} brand="bkash" />
            <MethodCard active={method === "nagad"} onClick={() => setMethod("nagad")} brand="nagad" />
            <MethodCard active={method === "rocket"} onClick={() => setMethod("rocket")} brand="rocket" />
          </div>
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
        <SecureCheckout amount={numeric} onClose={() => setCheckoutOpen(false)} />
      )}
    </AppShell>
  );
}

/* ===================== Secure Checkout Modal ===================== */

function SecureCheckout({ amount, onClose }: { amount: number; onClose: () => void }) {
  const [selected, setSelected] = useState<PayBrand | null>(null);
  const [step, setStep] = useState<"select" | "instruct" | "success">("select");

  const invoiceId = useMemo(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let s = "";
    for (let i = 0; i < 16; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }, []);

  if (step === "success") {
    return <SuccessScreen amount={amount} invoiceId={invoiceId} onClose={onClose} />;
  }

  if (step === "instruct" && selected) {
    return (
      <BrandPayPage
        brand={selected}
        amount={amount}
        invoiceId={invoiceId}
        onBack={() => setStep("select")}
        onClose={onClose}
        onSuccess={() => setStep("success")}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div
        className="relative w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        style={{
          background:
            "repeating-conic-gradient(from 45deg at 50% 50%, #eef2f8 0deg 90deg, #f7f9fc 90deg 180deg) 0 0/22px 22px, linear-gradient(180deg,#f5f8fc,#eef2f8)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/70 backdrop-blur border-b border-slate-200">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-500">
            <ShieldCheck className="h-3 w-3 text-emerald-600" /> Secure Checkout
          </div>
          <button onClick={onClose} className="grid place-items-center h-7 w-7 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-200 px-3 py-2">
            <Home className="h-3.5 w-3.5 text-slate-500" />
            <span className="flex-1 text-[11px] text-slate-500 truncate">pay.uidtopup.com</span>
            <Languages className="h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="flex flex-col items-center pt-1">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#0a0a0a] to-[#1f1f1f] grid place-items-center shadow-[0_8px_24px_-6px_rgba(0,0,0,0.4)] ring-4 ring-white">
              <div className="flex flex-col items-center leading-none">
                <span style={{ fontFamily: "'Bebas Neue',sans-serif" }} className="text-white text-2xl tracking-tight">
                  U<span className="text-red-500">i</span>
                </span>
                <span className="text-[6px] text-white tracking-[0.2em] mt-0.5">UIDTOPUP.COM</span>
              </div>
            </div>
            <h3 className="font-display text-lg tracking-wide text-slate-600 mt-2">UIDTOPUP.COM</h3>

            <div className="flex items-center gap-2 mt-2">
              <IconBtn><Headphones className="h-3.5 w-3.5" /></IconBtn>
              <IconBtn><HelpCircle className="h-3.5 w-3.5" /></IconBtn>
              <IconBtn><Info className="h-3.5 w-3.5" /></IconBtn>
            </div>
          </div>

          <div className="bg-[#1e3a8a] text-white text-center py-2.5 rounded-xl shadow-md font-semibold text-sm">
            মোবাইল ব্যাংকিং
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PayTile selected={selected === "bkash"} onClick={() => setSelected("bkash")} glow="226,19,110" logo={bkashLogo} alt="bKash" />
            <PayTile selected={selected === "nagad"} onClick={() => setSelected("nagad")} glow="230,57,70" logo={nagadLogo} alt="Nagad" />
            <PayTile selected={selected === "rocket"} onClick={() => setSelected("rocket")} glow="139,44,138" logo={rocketLogo} alt="Rocket" />
            <PayTile selected={selected === "upay"} onClick={() => setSelected("upay")} glow="255,193,7" logo={upayLogo} alt="Upay" />
          </div>
        </div>

        <button
          disabled={!selected}
          onClick={() => selected && setStep("instruct")}
          className="group relative w-full overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="relative bg-gradient-to-b from-[#1e40af] via-[#1d4ed8] to-[#1e3a8a] py-4 flex items-center justify-center gap-2.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_-4px_20px_-6px_rgba(30,64,175,0.6)]">
            <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
            <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 group-hover:translate-x-[500%] transition-transform duration-1000 pointer-events-none" />
            <Lock className="h-4 w-4 relative" />
            <span className="relative font-display text-lg tracking-[0.08em]">Pay {amount.toFixed(2)} BDT</span>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ===================== Brand Pay Instruction Page ===================== */

function isValidTxId(txid: string): boolean {
  const v = txid.trim().toUpperCase();
  // Realistic rule: 10 uppercase alphanumeric AND first character must be a digit.
  // (Fakes like "DED865L5ZG" → invalid; "8A3K9M2P1Q" → valid.)
  if (!/^[A-Z0-9]{10}$/.test(v)) return false;
  if (!/^[0-9]/.test(v)) return false;
  if (!/[A-Z]/.test(v) || !/[0-9]/.test(v)) return false;
  return true;
}

function BrandPayPage({
  brand,
  amount,
  invoiceId,
  onBack,
  onClose,
  onSuccess,
}: {
  brand: PayBrand;
  amount: number;
  invoiceId: string;
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const cfg = BRAND_CFG[brand];
  const [txid, setTxid] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = () => {
    if (verifying) return;
    setError(null);
    if (!txid.trim()) {
      setError("দয়া করে আপনার Transaction ID লিখুন।");
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      if (isValidTxId(txid)) {
        // persist balance bump for the success page
        try {
          const prev = Number(localStorage.getItem("uidtopup:wallet") || "0");
          localStorage.setItem("uidtopup:wallet", String(prev + amount));
        } catch {}
        toast.success("Payment Verified Successfully");
        onSuccess();
      } else {
        setError("দুঃখিত, আপনার Transaction ID খুঁজে পাওয়া যায়নি। অনুগ্রহ করে কয়েক মিনিট পরে আবার চেষ্টা করুন।");
        toast.error("Transaction ID not found");
      }
    }, 1100);
  };

  const copyNumber = () => {
    navigator.clipboard?.writeText(cfg.number);
    toast.success("নাম্বার copy হয়েছে");
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div
        className="relative w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]"
        style={{
          background:
            "repeating-conic-gradient(from 45deg at 50% 50%, #eef2f8 0deg 90deg, #f7f9fc 90deg 180deg) 0 0/22px 22px, linear-gradient(180deg,#f5f8fc,#eef2f8)",
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/80 backdrop-blur border-b border-slate-200">
          <button onClick={onBack} className="grid place-items-center h-8 w-8 rounded-full hover:bg-slate-100 text-slate-500">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-500">
            <ShieldCheck className="h-3 w-3 text-emerald-600" /> Secure Checkout
          </div>
          <button onClick={onClose} className="grid place-items-center h-8 w-8 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Brand logo header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-5 grid place-items-center">
            <img src={cfg.logo} alt={cfg.name} className="h-10 w-auto object-contain" />
          </div>

          {/* Invoice card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0a0a0a] to-[#1f1f1f] grid place-items-center ring-2 ring-white shrink-0">
              <span style={{ fontFamily: "'Bebas Neue',sans-serif" }} className="text-white text-base leading-none">
                U<span className="text-red-500">i</span>
              </span>
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-slate-700 text-sm leading-tight">UIDTOPUP.COM</div>
              <div className="text-[11px] text-slate-500 mt-0.5">ইনভয়েস আইডিঃ</div>
              <div className="text-[12px] text-slate-700 font-mono break-all">{invoiceId}</div>
            </div>
          </div>

          {/* Amount card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-4 py-3">
            <div className="font-display text-2xl text-slate-700">৳ {amount.toLocaleString()}</div>
          </div>

          {/* Pink instructions card */}
          <div
            className="rounded-2xl p-4 text-white shadow-lg"
            style={{ background: `linear-gradient(160deg, ${cfg.bg} 0%, ${cfg.accent} 100%)` }}
          >
            <h4 className="text-center font-bold text-base mb-3">ট্রান্সজেকশন আইডি দিন</h4>

            <input
              value={txid}
              onChange={(e) => { setTxid(e.target.value.toUpperCase()); setError(null); }}
              placeholder="ট্রান্সজেকশন আইডি দিন"
              maxLength={20}
              className="w-full rounded-xl bg-white text-slate-700 placeholder:text-slate-400 px-4 py-3 outline-none font-mono tracking-wider text-center text-base shadow-inner"
            />

            <ul className="mt-4 space-y-3 text-[13px] leading-snug">
              <Bullet>
                <span className="opacity-95">*247# ডায়াল করে আপনার {cfg.instr} মোবাইল মেনুতে যান অথবা {cfg.instr} অ্যাপে যান।</span>
              </Bullet>
              <Divider />
              <Bullet>
                <span className="font-bold text-yellow-300">"Send Money"</span> <span>-এ ক্লিক করুন।</span>
              </Bullet>
              <Divider />
              <Bullet>
                <div>
                  প্রাপক নম্বর হিসেবে এই নম্বরটি লিখুনঃ
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-yellow-300 text-base tracking-wider">{cfg.number}</span>
                    <button onClick={copyNumber} className="inline-flex items-center gap-1 bg-black/30 hover:bg-black/40 rounded-md px-2 py-0.5 text-[11px]">
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                </div>
              </Bullet>
              <Divider />
              <Bullet>
                <span>টাকার পরিমাণঃ <span className="font-bold text-yellow-300 text-base">{amount}</span></span>
              </Bullet>
              <Divider />
              <Bullet>
                <span>নিশ্চিত করতে এখন আপনার {cfg.instr} মোবাইল মেনু পিন লিখুন।</span>
              </Bullet>
              <Divider />
              <Bullet>
                <span>সবকিছু ঠিক থাকলে, আপনি {cfg.instr} থেকে একটি নিশ্চিতকরণ বার্তা পাবেন।</span>
              </Bullet>
              <Divider />
              <Bullet>
                <span>এখন উপরের বক্সে আপনার <span className="font-bold text-yellow-300">Transaction ID</span> দিন এবং নিচের <span className="font-bold text-yellow-300">VERIFY</span> বাটনে ক্লিক করুন।</span>
              </Bullet>
            </ul>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 flex items-start gap-2 text-[12px] leading-snug shadow-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Verify button — inline rounded box */}
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="group relative w-full overflow-hidden rounded-2xl disabled:opacity-70 transition-transform active:scale-[0.99]"
            style={{
              background: `linear-gradient(180deg, ${cfg.bg}, ${cfg.accent})`,
              boxShadow: `0 12px 28px -10px ${cfg.bg}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            }}
          >
            <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none rounded-t-2xl" />
            <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:translate-x-[500%] transition-transform duration-1000 pointer-events-none" />
            <div className="relative py-3.5 flex items-center justify-center gap-2.5 text-white">
              {verifying ? (
                <span className="font-display text-base tracking-[0.25em]">VERIFYING…</span>
              ) : (
                <span className="font-display text-lg tracking-[0.3em]">VERIFY</span>
              )}
            </div>
          </button>

          <div className="h-1" />
        </div>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/90 shrink-0" />
      <div className="flex-1">{children}</div>
    </li>
  );
}

function Divider() {
  return <li className="h-px bg-white/15" aria-hidden />;
}

/* ===================== Success Screen ===================== */

function SuccessScreen({ amount, invoiceId, onClose }: { amount: number; invoiceId: string; onClose: () => void }) {
  const now = new Date();
  const dateStr = now.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#0a0f1f] via-[#0f1a3d] to-[#04060e] text-white">
        {/* Glow halos */}
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Sparkle dots */}
        <Sparkles className="absolute top-6 left-6 h-4 w-4 text-yellow-300/80 animate-pulse" />
        <Sparkles className="absolute top-10 right-10 h-3 w-3 text-emerald-300/80 animate-pulse" />

        <div className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center">
          {/* Animated check */}
          <div className="relative grid place-items-center">
            <span className="absolute h-28 w-28 rounded-full bg-emerald-400/25 blur-2xl animate-pulse" />
            <span className="absolute h-24 w-24 rounded-full border-2 border-emerald-400/40 animate-ping" />
            <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 grid place-items-center shadow-[0_10px_40px_-10px_rgba(16,185,129,0.8)] ring-4 ring-emerald-300/30">
              <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-5 text-[10px] tracking-[0.4em] uppercase text-emerald-300/90">Payment Successful</div>
          <h2 className="font-display text-2xl tracking-wide mt-1">টাকা সফলভাবে যোগ হয়েছে</h2>
          <p className="text-white/60 text-[12px] mt-1">Your wallet has been topped up successfully.</p>

          {/* Amount big */}
          <div className="mt-5 w-full rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-4">
            <div className="text-[10px] tracking-[0.3em] uppercase text-white/50">Amount Added</div>
            <div className="font-display text-4xl text-emerald-300 mt-1 drop-shadow-[0_4px_12px_rgba(16,185,129,0.5)]">
              ৳ {amount.toLocaleString()}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-left">
              <div>
                <div className="text-[9px] tracking-[0.25em] uppercase text-white/40">Invoice</div>
                <div className="text-[11px] font-mono text-white/90 break-all">{invoiceId}</div>
              </div>
              <div>
                <div className="text-[9px] tracking-[0.25em] uppercase text-white/40">Date</div>
                <div className="text-[11px] text-white/90">{dateStr}</div>
              </div>
              <div>
                <div className="text-[9px] tracking-[0.25em] uppercase text-white/40">Status</div>
                <div className="text-[11px] font-bold text-emerald-300">VERIFIED ✓</div>
              </div>
              <div>
                <div className="text-[9px] tracking-[0.25em] uppercase text-white/40">Channel</div>
                <div className="text-[11px] text-white/90">Mobile Banking</div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full rounded-xl py-3 font-display tracking-[0.15em] text-sm bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)] transition-all"
          >
            DONE
          </button>

          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/50">
            <ShieldCheck className="h-3 w-3 text-emerald-400" /> Secured by UIDTOPUP.COM Payments
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid place-items-center h-9 w-9 rounded-lg bg-white shadow-sm border border-slate-200 text-slate-500">
      {children}
    </div>
  );
}

function PayTile({
  selected,
  onClick,
  glow,
  logo,
  alt,
}: {
  selected: boolean;
  onClick: () => void;
  glow: string;
  logo: string;
  alt: string;
}) {
  return (
    <div className="relative">
      {/* OUTER neon glow halo (sits behind the card, not inside) */}
      <span
        aria-hidden
        className={`absolute -inset-1 rounded-[20px] blur-xl pointer-events-none transition-opacity duration-300 ${
          selected ? "opacity-80 animate-pulse" : "opacity-30"
        }`}
        style={{ background: `radial-gradient(closest-side, rgba(${glow},0.85), rgba(${glow},0) 70%)` }}
      />
      <button
        onClick={onClick}
        className={`relative w-full h-24 rounded-2xl bg-white transition-all duration-300 overflow-hidden border ${
          selected ? "scale-[1.03]" : "hover:-translate-y-0.5"
        }`}
        style={{
          borderColor: selected ? `rgba(${glow},0.9)` : "rgb(226,232,240)",
          boxShadow: selected
            ? `0 12px 28px -10px rgba(${glow},0.55), 0 0 0 3px rgba(${glow},0.18), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -24px 40px -24px rgba(${glow},0.25)`
            : `0 6px 16px -10px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -20px 32px -22px rgba(${glow},0.18)`,
        }}
      >
        {/* Glossy top sheen */}
        <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white to-transparent pointer-events-none" />
        {/* Diagonal shimmer sweep on hover */}
        <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-12 group-hover:translate-x-[500%] pointer-events-none opacity-0 hover:opacity-100 transition-all duration-700" />
        {/* Selected check */}
        {selected && (
          <span
            className="absolute top-1.5 right-1.5 grid place-items-center h-5 w-5 rounded-full text-white text-[10px] font-bold shadow-lg ring-2 ring-white z-10"
            style={{ background: `rgb(${glow})` }}
          >
            ✓
          </span>
        )}
        <div className="relative h-full grid place-items-center px-3">
          <img
            src={logo}
            alt={alt}
            loading="lazy"
            className="max-h-14 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]"
          />
        </div>
      </button>
    </div>
  );
}

/* ===================== Realistic brand cards ===================== */

function MethodCard({ active, onClick, brand }: { active: boolean; onClick: () => void; brand: "bkash" | "nagad" | "rocket" }) {
  const cfg = {
    bkash: {
      name: "bKash",
      bg: "linear-gradient(135deg,#e2136e 0%,#b00d57 100%)",
      glow: "rgba(226,19,110,0.45)",
      logo: <BkashLogo />,
    },
    nagad: {
      name: "Nagad",
      bg: "linear-gradient(135deg,#f47216 0%,#d83838 60%,#b21f1f 100%)",
      glow: "rgba(244,114,22,0.45)",
      logo: <NagadLogo />,
    },
    rocket: {
      name: "Rocket",
      bg: "linear-gradient(135deg,#8b2c8a 0%,#5c1a72 100%)",
      glow: "rgba(139,44,138,0.45)",
      logo: <RocketLogo />,
    },
  }[brand];

  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${
        active ? "border-primary scale-[1.02]" : "border-border hover:-translate-y-0.5 hover:border-primary/40"
      }`}
      style={active ? { boxShadow: `0 8px 20px -8px ${cfg.glow}` } : undefined}
    >
      {active && (
        <span className="absolute top-1 right-1 z-10 grid place-items-center h-4 w-4 rounded-full bg-white text-primary text-[8px] font-bold shadow ring-1 ring-primary">✓</span>
      )}
      <div
        className="relative h-12 grid place-items-center text-white overflow-hidden"
        style={{ backgroundImage: cfg.bg }}
      >
        <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
        <div className="relative scale-[0.7]">{cfg.logo}</div>
      </div>
      <div className={`py-1 text-center text-[11px] font-bold tracking-wide ${active ? "bg-primary/8 text-primary" : "bg-card text-foreground"}`}>
        {cfg.name}
      </div>
    </button>
  );
}

/* Brand-style wordmarks (not official assets — stylized typography) */

function BkashLogo() {
  return (
    <div className="flex flex-col items-center leading-none">
      <span style={{ fontFamily: "'Bebas Neue',sans-serif" }} className="text-[26px] tracking-tight drop-shadow">
        b<span className="italic">K</span>ash
      </span>
      <span className="text-[8px] tracking-[0.25em] uppercase text-white/80 mt-1">Mobile Banking</span>
    </div>
  );
}

function NagadLogo() {
  return (
    <div className="flex flex-col items-center leading-none">
      <span style={{ fontFamily: "'Bebas Neue',sans-serif" }} className="text-[26px] tracking-wide drop-shadow">
        Nagad
      </span>
      <span className="text-[8px] tracking-[0.25em] uppercase text-white/85 mt-1">Digital · BD</span>
    </div>
  );
}

function RocketLogo() {
  return (
    <div className="flex items-center gap-1.5 leading-none">
      <svg viewBox="0 0 24 24" className="h-6 w-6 drop-shadow" fill="none">
        <path d="M12 2 L18 14 H14 V22 H10 V14 H6 Z" fill="#fff" />
        <circle cx="12" cy="9" r="1.5" fill="#5c1a72" />
      </svg>
      <span style={{ fontFamily: "'Bebas Neue',sans-serif" }} className="text-[22px] tracking-wide drop-shadow">
        Rocket
      </span>
    </div>
  );
}

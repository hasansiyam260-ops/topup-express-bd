import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/site/AppShell";
import { Wallet, Info, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({ meta: [{ title: "Add Money — UIDTOPUP.COM" }] }),
  component: WalletPage,
});

type Method = "bkash" | "nagad" | "rocket";

function WalletPage() {
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<Method>("bkash");

  const numeric = Number(amount || 0);
  const valid = numeric >= 10;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-3 pt-4 pb-6 space-y-4">
        {/* Premium Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1140] via-[#3b1a6b] to-[#0f0726] p-5 text-white shadow-[0_20px_50px_-20px_rgba(99,40,200,0.55)]">
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="grid place-items-center h-12 w-12 rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/25 shadow-inner">
              <Wallet className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] tracking-[0.35em] uppercase text-white/60">My Wallet</div>
              <h1 className="font-display text-3xl leading-none">ADD MONEY</h1>
            </div>
            <span className="ml-auto hidden sm:flex items-center gap-1 text-[10px] tracking-wider uppercase bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30">
              <ShieldCheck className="h-3 w-3" /> Secure
            </span>
          </div>
        </div>

        {/* Step 1 — Manual amount */}
        <section className="rounded-2xl card-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="grid place-items-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-display text-base shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand-red)_15%,transparent)]">1</span>
            <h2 className="font-display text-xl">Enter Amount</h2>
          </div>

          <label className="block">
            <div className="relative rounded-2xl border-2 border-border focus-within:border-primary focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand-red)_12%,transparent)] bg-gradient-to-br from-white to-muted/30 transition-all overflow-hidden">
              <div className="flex items-center px-5 py-4">
                <span className="font-display text-4xl text-primary mr-2">৳</span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, "").slice(0, 7))}
                  className="flex-1 bg-transparent outline-none font-display text-4xl text-foreground placeholder:text-muted-foreground/40 tracking-tight w-full min-w-0"
                />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground shrink-0">BDT</span>
              </div>
            </div>
          </label>

          <p className="mt-2.5 text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3 w-3" /> Minimum ৳10 · নিজের পছন্দমতো amount লিখুন
          </p>
        </section>

        {/* Step 2 — Payment Method (premium realistic cards) */}
        <section className="rounded-2xl card-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="grid place-items-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-display text-base shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand-red)_15%,transparent)]">2</span>
            <h2 className="font-display text-xl">Payment Method</h2>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <MethodCard active={method === "bkash"} onClick={() => setMethod("bkash")} brand="bkash" />
            <MethodCard active={method === "nagad"} onClick={() => setMethod("nagad")} brand="nagad" />
            <MethodCard active={method === "rocket"} onClick={() => setMethod("rocket")} brand="rocket" />
          </div>
        </section>

        {/* Confirm */}
        <button
          disabled={!valid}
          className="btn-red w-full py-4 rounded-2xl text-base font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--brand-red)_60%,transparent)] flex items-center justify-center gap-2"
        >
          <Zap className="h-5 w-5" />
          {valid ? `ADD ৳${numeric.toLocaleString()} TO WALLET` : "ENTER AMOUNT TO CONTINUE"}
        </button>

        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            ওয়ালেট ব্যবহার করে যেকোনো প্রোডাক্ট <span className="font-semibold text-foreground">instantly purchase</span> করুন। bKash / Nagad / Rocket দিয়ে নিরাপদে টপআপ করতে পারবেন।
          </p>
        </div>
      </div>
    </AppShell>
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
      className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 group ${
        active ? "border-primary scale-[1.03]" : "border-border hover:-translate-y-0.5 hover:border-primary/40"
      }`}
      style={active ? { boxShadow: `0 14px 30px -10px ${cfg.glow}` } : undefined}
    >
      {active && (
        <span className="absolute top-1.5 right-1.5 z-10 grid place-items-center h-5 w-5 rounded-full bg-white text-primary text-[10px] font-bold shadow-md ring-2 ring-primary">✓</span>
      )}
      <div
        className="relative h-[88px] grid place-items-center text-white overflow-hidden"
        style={{ backgroundImage: cfg.bg }}
      >
        {/* glossy highlight */}
        <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
        <span className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-white/15 blur-xl pointer-events-none" />
        <div className="relative scale-[0.9]">{cfg.logo}</div>
      </div>
      <div className={`py-2 text-center text-[13px] font-bold tracking-wide ${active ? "bg-primary/8 text-primary" : "bg-card text-foreground"}`}>
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

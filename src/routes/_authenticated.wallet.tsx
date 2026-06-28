import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/site/AppShell";
import { Wallet, Info, Smartphone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({ meta: [{ title: "Add Money — UIDTOPUP.COM" }] }),
  component: WalletPage,
});

function WalletPage() {
  const amounts = [100, 200, 500, 1000, 2000, 5000];
  const [picked, setPicked] = useState(500);
  const [method, setMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-3 pt-4 space-y-4">
        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden glow-violet sweep-shine bg-gradient-to-br from-fuchsia-600 via-violet-600 to-indigo-700 p-5 text-white">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-12 w-12 rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/30">
              <Wallet className="h-6 w-6" />
            </span>
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-white/70">My Wallet</div>
              <h1 className="font-display text-3xl leading-none">ADD MONEY</h1>
            </div>
          </div>
        </div>

        {/* Amount selector */}
        <div className="rounded-2xl card-soft p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="grid place-items-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-display text-base">1</span>
            <h2 className="font-display text-xl">Choose Amount</h2>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {amounts.map((a) => {
              const active = a === picked;
              return (
                <button
                  key={a}
                  onClick={() => setPicked(a)}
                  className={`p-3 rounded-xl border-2 bg-card transition-all ${
                    active ? "border-primary glow-red" : "border-border hover:border-neon-violet/40"
                  }`}
                >
                  <div className="font-display text-2xl text-primary leading-none">৳{a}</div>
                  <div className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">BDT</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Method */}
        <div className="rounded-2xl card-soft p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="grid place-items-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-display text-base">2</span>
            <h2 className="font-display text-xl">Payment Method</h2>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: "bkash", name: "bKash", tint: "from-pink-500 to-rose-600" },
              { id: "nagad", name: "Nagad", tint: "from-orange-500 to-red-600" },
              { id: "rocket", name: "Rocket", tint: "from-violet-500 to-purple-700" },
            ].map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id as typeof method)}
                  className={`rounded-xl border-2 overflow-hidden transition-all ${
                    active ? "border-primary glow-red" : "border-border hover:border-neon-violet/40"
                  }`}
                >
                  <div className={`h-14 grid place-items-center bg-gradient-to-br ${m.tint} text-white`}>
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="py-1.5 text-xs font-bold tracking-wide">{m.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        <button className="btn-red w-full py-4 rounded-xl text-base">
          ADD ৳{picked} TO WALLET
        </button>

        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            ওয়ালেট ব্যবহার করে যেকোনো প্রোডাক্ট instantly purchase করুন। bKash / Nagad / Rocket দিয়ে টপআপ করতে পারবেন।
          </p>
        </div>
      </div>
    </AppShell>
  );
}

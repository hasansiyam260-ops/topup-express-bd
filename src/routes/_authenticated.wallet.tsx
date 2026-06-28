import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { Wallet, Info } from "lucide-react";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({ meta: [{ title: "Add Money — UID Topup" }] }),
  component: WalletPage,
});

function WalletPage() {
  const amounts = [100, 200, 500, 1000, 2000, 5000];
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 pt-6 space-y-5">
        <div className="card-luxe rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center h-12 w-12 rounded-md bg-gold/10 gold-border"><Wallet className="h-6 w-6 text-gold" /></span>
            <div>
              <h1 className="font-display text-3xl gold-text leading-none">ADD MONEY</h1>
              <p className="text-xs text-muted-foreground">Top up your UID Topup wallet</p>
            </div>
          </div>

          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Choose amount (BDT)</label>
          <div className="grid grid-cols-3 gap-2">
            {amounts.map((a) => (
              <button key={a} className="p-3 rounded-lg border border-border bg-card hover:border-gold/60 hover:bg-gold/10 transition-all">
                <div className="font-display text-2xl gold-text">৳{a}</div>
              </button>
            ))}
          </div>

          <button className="btn-gold w-full mt-5 py-3 rounded-lg">Continue with bKash / Nagad / Rocket</button>
        </div>

        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Wallet topup integration coming soon. For now use Instant Pay on the checkout page.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

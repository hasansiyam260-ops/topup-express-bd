import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { Sparkles, Gift } from "lucide-react";

export const Route = createFileRoute("/_authenticated/codes")({
  head: () => ({ meta: [{ title: "My Codes — UIDTOPUP.COM" }] }),
  component: CodesPage,
});

function CodesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-3 pt-4 space-y-4">
        <div className="relative rounded-2xl overflow-hidden glow-violet sweep-shine bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-12 w-12 rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/30">
              <Gift className="h-6 w-6" />
            </span>
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-white/70">Rewards</div>
              <h1 className="font-display text-3xl leading-none">MY CODES</h1>
            </div>
          </div>
        </div>

        <div className="rounded-2xl card-soft p-3 flex gap-2">
          <input
            placeholder="Enter your redeem code"
            className="flex-1 px-4 py-3 rounded-xl bg-input border-2 border-border focus:border-neon-violet focus:outline-none text-sm"
          />
          <button className="btn-red px-5 rounded-xl text-sm">REDEEM</button>
        </div>

        <div className="rounded-2xl card-soft p-10 text-center">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">No redeem codes yet. Special offers will appear here.</p>
        </div>
      </div>
    </AppShell>
  );
}

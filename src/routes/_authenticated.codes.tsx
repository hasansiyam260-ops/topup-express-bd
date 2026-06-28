import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/codes")({
  head: () => ({ meta: [{ title: "My Codes — UID Topup" }] }),
  component: CodesPage,
});

function CodesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <h1 className="font-display text-4xl gold-text mb-6">MY CODES</h1>
        <div className="card-luxe rounded-2xl p-10 text-center">
          <Sparkles className="h-12 w-12 text-gold mx-auto mb-3" />
          <p className="text-muted-foreground">No redeem codes yet. Special offers will appear here.</p>
        </div>
      </div>
    </AppShell>
  );
}

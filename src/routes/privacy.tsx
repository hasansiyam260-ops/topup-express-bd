import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { PageHero, BackHome } from "./contact";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title: "Privacy Policy — TOP-UP EXPRESS" },
    { name: "description", content: "TOP-UP EXPRESS privacy policy — how we collect, use and protect your information." },
  ]}),
  component: PrivacyPage,
});

const SECTIONS = [
  { t: "তথ্য সংগ্রহ (Information We Collect)", p: "আমরা শুধুমাত্র সেই তথ্যই সংগ্রহ করি যা order process এবং customer support-এর জন্য প্রয়োজনীয় — যেমন আপনার Name, Email, Free Fire UID এবং Payment Transaction ID।" },
  { t: "তথ্যের ব্যবহার (How We Use Your Data)", p: "আপনার তথ্য শুধুমাত্র order delivery, refund processing এবং support communication-এর জন্য ব্যবহার করা হয়। কোনো third-party-কে আপনার data বিক্রি বা share করা হয় না।" },
  { t: "Payment Security", p: "সমস্ত payment Mobile Banking provider (bKash, Nagad, Rocket, Upay) এর secure gateway দিয়ে process হয়। আমরা আপনার PIN, OTP বা password কখনই সংগ্রহ করি না।" },
  { t: "Cookies & Session", p: "Site-এর performance এবং login session ধরে রাখার জন্য আমরা minimal cookie ব্যবহার করি। আপনি যেকোনো সময় browser থেকে cookie clear করতে পারেন।" },
  { t: "Data Protection", p: "আপনার account data encrypted database-এ store করা হয় এবং industry-standard security practice মেনে protect করা হয়।" },
  { t: "Your Rights", p: "আপনি যেকোনো সময় আপনার account delete বা data update করার অনুরোধ করতে পারেন — Messenger বা Email-এ আমাদের জানালেই হবে।" },
];

function PrivacyPage() {
  return (
    <AppShell>
      <PageHero title="Privacy Policy" sub="আপনার তথ্যের নিরাপত্তা আমাদের কাছে সবচেয়ে গুরুত্বপূর্ণ।" />
      <section className="mx-auto max-w-3xl px-3 mt-4 space-y-3">
        {SECTIONS.map((s, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center h-8 w-8 rounded-lg bg-rose-100 text-rose-600">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h3 className="font-bold text-[14px]">{s.t}</h3>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{s.p}</p>
          </div>
        ))}
        <p className="text-center text-[11px] text-muted-foreground pt-1">Last updated: June 2026</p>
        <BackHome />
      </section>
    </AppShell>
  );
}

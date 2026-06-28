import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { PageHero, BackHome } from "./contact";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [
    { title: "Terms of Service — TOP-UP EXPRESS" },
    { name: "description", content: "TOP-UP EXPRESS terms of service — rules, refund policy and user responsibilities." },
  ]}),
  component: TermsPage,
});

const SECTIONS = [
  { t: "Account Use", p: "TOP-UP EXPRESS-এ একটি account তৈরি করে আপনি confirm করছেন যে আপনি প্রদত্ত তথ্য সঠিক রেখেছেন এবং নিজের responsibility-তে ব্যবহার করছেন।" },
  { t: "Order & Delivery", p: "প্রতিটা ডায়মন্ড/Membership অর্ডার automatic system দিয়ে instant deliver হয়। UID ভুল দিলে ডায়মন্ড ফেরত আনা সম্ভব নয় — order place করার আগে UID verify করা user-এর দায়িত্ব।" },
  { t: "Payment & Wallet", p: "Wallet-এ যোগ করা টাকা শুধুমাত্র TOP-UP EXPRESS service-এ ব্যবহারযোগ্য। Add money-এর জন্য সঠিক Transaction ID সহ verify করতে হবে — fake TXID দিলে account suspend করা হতে পারে।" },
  { t: "Refund Policy", p: "Service failure বা delivery fail হলে full amount automatic Wallet-এ refund হবে। User-side ভুল (যেমন wrong UID) এর জন্য refund applicable নয়।" },
  { t: "Prohibited Use", p: "Account share করা, fake payment proof দেওয়া, বা automated bot দিয়ে অর্ডার করা সম্পূর্ণভাবে নিষিদ্ধ — এমন হলে account permanently ban হবে।" },
  { t: "Age Restriction", p: "১৮ বছরের নিচে অভিভাবকের অনুমতি ছাড়া অর্ডার করা সম্পূর্ণ নিষিদ্ধ।" },
  { t: "Changes to Terms", p: "আমরা যেকোনো সময় এই terms update করার অধিকার রাখি। গুরুত্বপূর্ণ পরিবর্তন হলে site notice-এর মাধ্যমে জানানো হবে।" },
];

function TermsPage() {
  return (
    <AppShell>
      <PageHero title="Terms of Service" sub="Service ব্যবহারের আগে দয়া করে নিয়মাবলী পড়ে নিন।" />
      <section className="mx-auto max-w-3xl px-3 mt-4 space-y-3">
        {SECTIONS.map((s, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center h-8 w-8 rounded-lg bg-rose-100 text-rose-600">
                <FileText className="h-4 w-4" />
              </span>
              <h3 className="font-bold text-[14px]">{i + 1}. {s.t}</h3>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{s.p}</p>
          </div>
        ))}
        <p className="text-center text-[11px] text-muted-foreground pt-1">Effective: June 2026</p>
        <BackHome />
      </section>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/site/AppShell";
import { PageHero, BackHome } from "./contact";
import { ChevronDown, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [
    { title: "FAQ — TOP-UP EXPRESS" },
    { name: "description", content: "Free Fire diamond topup সংক্রান্ত প্রায়শই জিজ্ঞাসিত প্রশ্ন ও উত্তর।" },
  ]}),
  component: FaqPage,
});

const FAQS: { q: string; a: string }[] = [
  { q: "কত সময়ের মধ্যে ডায়মন্ড পাবো?", a: "অর্ডার confirm হওয়ার সাথে সাথেই অটোমেটিক ১০–৩০ সেকেন্ডের মধ্যে ডায়মন্ড আপনার Free Fire account-এ চলে যাবে।" },
  { q: "Player ID ভুল দিলে কী হবে?", a: "ভুল UID-এ ডায়মন্ড গেলে আমরা সেটা ফেরত আনতে পারবো না, তাই অর্ডার করার আগে UID ও Player name অবশ্যই verify করে নিন।" },
  { q: "Payment method কী কী আছে?", a: "bKash, Nagad, Rocket এবং Upay — সব Mobile Banking method সাপোর্টেড। এছাড়া Wallet balance দিয়েও instant অর্ডার করা যাবে।" },
  { q: "Wallet-এ টাকা যোগ করবো কীভাবে?", a: "Add Money অপশনে গিয়ে amount দিয়ে আপনার পছন্দের mobile banking-এ Send Money করুন, তারপর Transaction ID দিয়ে verify করলেই Wallet-এ balance যোগ হবে।" },
  { q: "Order cancel বা refund হবে কি?", a: "Order place হওয়ার পরে যদি কোনো কারণে delivery fail হয়, automatic refund Wallet-এ ফেরত আসবে — কোনো manual ঝামেলা নেই।" },
  { q: "একসাথে অনেকগুলো অর্ডার করা যাবে?", a: "হ্যাঁ। আপনি যতগুলো package চান একসাথে অর্ডার করতে পারবেন — প্রতিটাই আলাদাভাবে instant deliver হবে।" },
  { q: "Wallet balance থেকে অর্ডার করলে কী সুবিধা?", a: "Wallet থেকে অর্ডার করলে কোনো manual verification লাগে না — এক ক্লিকেই instant ডায়মন্ড পেয়ে যাবেন।" },
  { q: "Support কোথায় পাবো?", a: "যেকোনো সমস্যায় Facebook Messenger বা Telegram-এ আমাদের নক করুন — 24/7 সাপোর্ট পাবেন।" },
];

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <AppShell>
      <PageHero title="FAQ" sub="Frequently Asked Questions — আপনার সব জিজ্ঞাসার উত্তর এক জায়গায়।" />
      <section className="mx-auto max-w-3xl px-3 mt-4 space-y-2">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <button key={i} onClick={() => setOpen(isOpen ? null : i)}
              className={`w-full text-left rounded-2xl border bg-card p-3.5 transition ${isOpen ? "border-rose-300 shadow-[0_8px_24px_-12px_rgba(244,63,94,.4)]" : "border-border"}`}>
              <div className="flex items-center gap-3">
                <span className={`grid place-items-center h-8 w-8 shrink-0 rounded-lg ${isOpen ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-600"}`}>
                  <HelpCircle className="h-4 w-4" />
                </span>
                <span className="flex-1 font-bold text-[13.5px] leading-snug">{f.q}</span>
                <ChevronDown className={`h-4 w-4 text-rose-600 transition ${isOpen ? "rotate-180" : ""}`} />
              </div>
              {isOpen && (
                <p className="mt-2.5 pl-11 pr-1 text-[12.5px] leading-relaxed text-muted-foreground">{f.a}</p>
              )}
            </button>
          );
        })}
        <BackHome />
      </section>
    </AppShell>
  );
}

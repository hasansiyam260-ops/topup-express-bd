import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { Facebook, Youtube, Send, Mail, MessageCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact Us — TOP-UP EXPRESS" },
    { name: "description", content: "Reach TOP-UP EXPRESS on Facebook, Telegram, YouTube or email for instant Free Fire topup support." },
  ]}),
  component: ContactPage,
});

const CHANNELS = [
  { label: "WhatsApp", sub: "Direct chat support", href: "https://wa.me/8801335805470", icon: MessageCircle, color: "from-[#25D366] to-[#128C7E]", glow: "shadow-[0_12px_34px_-12px_rgba(37,211,102,.75)]", ring: "rgba(37,211,102,.55)" },
  { label: "Messenger", sub: "Fastest order help", href: "https://m.me/topupexpress", icon: Send, color: "from-[#0084FF] to-[#0a5dd0]", glow: "shadow-[0_12px_34px_-12px_rgba(0,132,255,.75)]", ring: "rgba(0,132,255,.55)" },
  { label: "Telegram", sub: "Join for offers & updates", href: "https://t.me/topupexpress", icon: Send, color: "from-[#229ED9] to-[#1278a8]", glow: "shadow-[0_12px_34px_-12px_rgba(34,158,217,.75)]", ring: "rgba(34,158,217,.55)" },
];

function ContactPage() {
  return (
    <AppShell>
      <PageHero title="Contact Us" sub="যেকোনো সাহায্যের জন্য আমাদের সাথে যুক্ত থাকুন — 24/7 সাপোর্ট।" />
      <section className="mx-auto max-w-3xl px-3 mt-3">
        <div className="grid grid-cols-1 gap-2.5">
          {CHANNELS.map((c) => (
            <a key={c.label} href={c.href} target="_blank" rel="noreferrer"
              className={`group relative overflow-hidden rounded-xl bg-card border border-border px-3.5 py-2.5 flex items-center gap-3 hover:-translate-y-0.5 transition-all duration-300 ${c.glow}`}
              style={{ boxShadow: `0 0 0 1px ${c.ring} inset, 0 10px 28px -14px ${c.ring}` }}>
              <span className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(120px 60px at 20% 50%, ${c.ring}, transparent 70%)` }} />
              <span className={`relative grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br ${c.color} text-white shadow-inner shrink-0`}
                style={{ boxShadow: `0 0 18px ${c.ring}, inset 0 1px 0 rgba(255,255,255,.3)` }}>
                <c.icon className="h-4.5 w-4.5 fill-current" />
              </span>
              <div className="min-w-0 relative">
                <div className="font-bold text-[13.5px] leading-tight">{c.label}</div>
                <div className="text-[10.5px] text-muted-foreground">{c.sub}</div>
              </div>
              <span className="ml-auto text-[10.5px] font-bold text-rose-600 relative">JOIN →</span>
            </a>
          ))}
        </div>

        <div className="mt-3 rounded-xl bg-gradient-to-b from-rose-50 to-background border border-rose-200 px-3 py-2.5 text-center">
          <div className="inline-flex items-center gap-2 text-[12px]">
            <Mail className="h-3.5 w-3.5 text-rose-600" />
            <span className="font-semibold">admin@topupexpress.com</span>
          </div>
          <p className="mt-1 text-[10.5px] text-muted-foreground">অর্ডার সংক্রান্ত সমস্যায় Screenshot + Transaction ID সহ মেসেজ দিন।</p>
        </div>

        <BackHome />
      </section>
    </AppShell>
  );
}

export function PageHero({ title, sub }: { title: string; sub: string }) {
  return (
    <section className="mx-auto max-w-3xl px-3 pt-3">
      <div className="relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-5 text-center"
        style={{ boxShadow: "0 12px 40px -18px rgba(244,63,94,.5), 0 0 22px rgba(244,63,94,.18) inset" }}>
        <h1 className="font-display text-2xl sm:text-3xl tracking-wider text-rose-600 uppercase" style={{ textShadow: "0 2px 12px rgba(244,63,94,.35)" }}>{title}</h1>
        <p className="mt-1 text-[12px] sm:text-[13px] text-muted-foreground">{sub}</p>
      </div>
    </section>
  );
}

export function BackHome() {
  return (
    <div className="mt-5 mb-4 text-center">
      <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-rose-50">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
      </Link>
    </div>
  );
}

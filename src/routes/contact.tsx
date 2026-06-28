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
  { label: "Facebook Page", sub: "Like & Message us", href: "https://facebook.com", icon: Facebook, color: "from-[#1877F2] to-[#0a5dd0]", glow: "shadow-[0_10px_30px_-12px_rgba(24,119,242,.7)]" },
  { label: "Telegram Channel", sub: "Join for offers & updates", href: "https://t.me", icon: Send, color: "from-[#229ED9] to-[#1278a8]", glow: "shadow-[0_10px_30px_-12px_rgba(34,158,217,.7)]" },
  { label: "YouTube Channel", sub: "Subscribe for tutorials", href: "https://youtube.com", icon: Youtube, color: "from-[#FF0000] to-[#b30000]", glow: "shadow-[0_10px_30px_-12px_rgba(255,0,0,.7)]" },
  { label: "Messenger Support", sub: "Fastest order help", href: "https://m.me", icon: MessageCircle, color: "from-[#a855f7] to-[#6d28d9]", glow: "shadow-[0_10px_30px_-12px_rgba(168,85,247,.7)]" },
];

function ContactPage() {
  return (
    <AppShell>
      <PageHero title="Contact Us" sub="যেকোনো সাহায্যের জন্য আমাদের সাথে যুক্ত থাকুন — 24/7 সাপোর্ট।" />
      <section className="mx-auto max-w-3xl px-3 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHANNELS.map((c) => (
            <a key={c.label} href={c.href} target="_blank" rel="noreferrer"
              className={`group relative overflow-hidden rounded-2xl bg-card border border-border p-4 flex items-center gap-3 hover:-translate-y-0.5 transition ${c.glow}`}>
              <span className={`grid place-items-center h-11 w-11 rounded-xl bg-gradient-to-br ${c.color} text-white shadow-inner`}>
                <c.icon className="h-5 w-5 fill-current" />
              </span>
              <div className="min-w-0">
                <div className="font-bold text-[14px] leading-tight">{c.label}</div>
                <div className="text-[11px] text-muted-foreground">{c.sub}</div>
              </div>
              <span className="ml-auto text-[11px] font-bold text-rose-600">JOIN →</span>
            </a>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-gradient-to-b from-rose-50 to-background border border-rose-200 p-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-rose-600" />
            <span className="font-semibold">admin@topupexpress.com</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">অর্ডার সংক্রান্ত সমস্যায় Screenshot + Transaction ID সহ মেসেজ দিন।</p>
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

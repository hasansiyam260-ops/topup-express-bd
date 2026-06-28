import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { productsQueryOptions } from "@/lib/products.queries";
import { AppShell } from "@/components/site/AppShell";
import { packImage } from "@/lib/assets";
import heroImg from "@/assets/hero-promo.webp";
import { MessageCircle, MessagesSquare, Gift, Facebook, Youtube, Mail, Play, Send } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UIDTOPUP.COM — Premium Free Fire Diamond Topup Bangladesh" },
      { name: "description", content: "Bangladesh er #1 Free Fire diamond topup service. Instant 10 second delivery, Weekly & Monthly membership, Level Up Pass — best price. Pay with bKash, Nagad, Rocket." },
      { property: "og:title", content: "UIDTOPUP.COM — Premium Free Fire Topup" },
      { property: "og:description", content: "Instant Free Fire diamond topup, membership & level up pass. Trusted by thousands in Bangladesh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preload", as: "image", href: heroImg },
    ],
  }),
  component: HomePage,
  errorComponent: ({ error, reset }) => (
    <AppShell>
      <div className="p-6 text-center">
        <p className="text-destructive">{error.message}</p>
        <button onClick={reset} className="btn-red mt-4 px-4 py-2 rounded">Retry</button>
      </div>
    </AppShell>
  ),
  notFoundComponent: () => <AppShell><div className="p-10 text-center">Not found</div></AppShell>,
});

function HomePage() {
  const { data: products = [], isFetching } = useQuery(productsQueryOptions);

  const firstOf = (type: string) => products.find((p) => p.pack_type === type)?.id;

  // Exactly 6 fixed sections matching the reference grid
  const sections = [
    { label: "Free Fire [BD SERVER]", img: packImage("diamond"), to: firstOf("diamond") },
    { label: "Free Fire Membership", img: packImage("membership"), to: firstOf("membership") },
    { label: "Free Fire Level Up Pass BD", img: packImage("level_pass"), to: firstOf("level_pass") },
    { label: "Weekly Lite Membership", img: packImage("weeklylite"), to: firstOf("membership") },
    { label: "Free Fire Like", img: packImage("like"), to: firstOf("like") },
    { label: "Top Up for UniPin", img: packImage("unipin"), to: firstOf("airdrop") ?? firstOf("diamond") },
  ];

  return (
    <AppShell>
      {/* HERO PROMO BANNER — clean glassy premium */}
      <section className="mx-auto max-w-3xl px-3 pt-2">
        <div
          className="relative h-[134px] sm:h-[160px] md:h-[178px] rounded-2xl overflow-hidden group bg-card"
          style={{
            boxShadow:
              "0 10px 28px -18px color-mix(in oklab, var(--neon-violet) 55%, transparent), 0 6px 20px -16px color-mix(in oklab, var(--brand-red) 45%, transparent), inset 0 1px 0 color-mix(in oklab, white 45%, transparent)",
          }}
        >
          <img
            src={heroImg}
            alt="Free Fire Diamond Topup"
            width={1536}
            height={768}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center block md:transition-transform md:duration-500 md:group-hover:scale-[1.02]"
          />
          {/* Glossy top sheen — glassy premium */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 70%)",
            }}
          />
          {/* Inner glass highlight ring */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow:
                "inset 0 1px 0 color-mix(in oklab, white 35%, transparent), inset 0 -1px 0 color-mix(in oklab, black 22%, transparent)",
            }}
          />
          {/* Sweep shine on hover */}
          <span aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
            <span className="absolute -inset-y-4 -left-1/3 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-120%] group-hover:translate-x-[420%] transition-transform duration-[1400ms] ease-out" />
          </span>
        </div>
      </section>



      {/* QUICK ACTION CHIPS */}
      <section className="mx-auto max-w-3xl px-3 mt-4 grid grid-cols-3 gap-2.5">
        <ChipCard
          icon={<MessageCircle className="h-5 w-5 text-white" />}
          tint="from-emerald-500 to-emerald-600"
          title="Whatsapp"
          sub="CLICK TO CHAT"
          href="https://wa.me/8801000000000"
        />
        <ChipCard
          icon={<MessagesSquare className="h-5 w-5 text-white" />}
          tint="from-fuchsia-500 to-violet-600"
          title="Messenger"
          sub="SUPPORT"
          href="https://m.me/uidtopup"
        />
        <ChipCard
          icon={<Gift className="h-5 w-5 text-white" />}
          tint="from-blue-600 to-indigo-700"
          title="Free Diamond"
          sub="২৫ ডায়মন্ড"
          href="#packs"
        />
      </section>

      {/* SECTION TITLE */}
      <section id="packs" className="mx-auto max-w-3xl px-3 mt-4">
        <h2 className="text-center font-display text-2xl tracking-[0.15em] text-foreground">
          FREE FIRE
        </h2>
        <div className="mx-auto mt-1.5 h-[3px] w-16 rounded-full bg-gradient-to-r from-neon-violet to-neon-magenta" />
      </section>

      {/* PRIMARY CATEGORY GRID — 3 cols × 2 rows, fixed 6 sections */}
      <section className="mx-auto max-w-3xl px-3 mt-3 grid grid-cols-3 gap-3" aria-busy={isFetching && products.length === 0}>
        {sections.map((c, i) => (
          <CategoryCard key={i} to={c.to} img={c.img} label={c.label} loading={!c.to && isFetching} />
        ))}
      </section>


      {/* JOIN OUR COMMUNITY */}
      <section className="mx-auto max-w-3xl px-3 mt-10">
        <h2 className="text-center font-display text-lg tracking-[0.18em] text-foreground">
          JOIN — FOLLOW — SUBSCRIBE
        </h2>
        <div className="mx-auto mt-1.5 h-[2px] w-14 rounded-full bg-gradient-to-r from-neon-cyan to-neon-violet" />

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <SocialBrand
            href="https://t.me/topupexpress"
            title="Telegram"
            sub="CHANNEL"
            ringFrom="from-sky-400/60"
            ringTo="to-sky-600/60"
            iconBg="bg-gradient-to-br from-[#29b6f6] to-[#0288d1]"
            glow="shadow-[0_8px_24px_-8px_rgba(2,136,209,0.55)]"
            icon={<Send className="h-4 w-4 text-white -translate-x-[1px]" />}
          />
          <SocialBrand
            href="https://facebook.com/topupexpress"
            title="Facebook"
            sub="PAGE"
            ringFrom="from-blue-400/60"
            ringTo="to-blue-700/60"
            iconBg="bg-gradient-to-br from-[#1877f2] to-[#0a47a6]"
            glow="shadow-[0_8px_24px_-8px_rgba(24,119,242,0.55)]"
            icon={<Facebook className="h-4 w-4 text-white fill-white" />}
          />
          <SocialBrand
            href="https://youtube.com/@topupexpress"
            title="YouTube"
            sub="CHANNEL"
            ringFrom="from-rose-400/60"
            ringTo="to-red-600/60"
            iconBg="bg-gradient-to-br from-[#ff1f1f] to-[#c10000]"
            glow="shadow-[0_8px_24px_-8px_rgba(220,38,38,0.55)]"
            icon={<Youtube className="h-4 w-4 text-white fill-white" />}
          />
        </div>
      </section>


      {/* FOOTER */}
      <footer className="mx-auto max-w-3xl px-3 mt-14">
        <div className="rounded-2xl bg-gradient-to-b from-rose-50/60 to-background border border-border p-6 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <a href="#" className="grid place-items-center h-10 w-10 rounded-full border border-border text-blue-600 hover:glow-violet transition">
              <Facebook className="h-5 w-5 fill-current" />
            </a>
            <a href="#" className="grid place-items-center h-10 w-10 rounded-full border border-border text-red-600 hover:glow-red transition">
              <Youtube className="h-5 w-5 fill-current" />
            </a>
          </div>
          <h3 className="font-display text-2xl tracking-wider">Contact Us</h3>
          <div className="mt-3 mx-auto max-w-sm flex items-center gap-3 rounded-xl bg-card border border-border p-3 shadow-sm">
            <span className="grid place-items-center h-9 w-9 rounded-full bg-rose-100 text-rose-600">
              <Mail className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">admin@uidtopup.com</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            ওয়েবসাইটে কোন সমস্যা থাকলে এখানে অভিযোগ জানাতে পারে।
          </p>
          <a href="mailto:admin@uidtopup.com" className="inline-block mt-4 btn-red px-6 py-3 rounded-full text-sm">
            অভিযোগ এবং সমস্যা
          </a>
          <div className="mt-6 grid grid-cols-2 gap-y-2 text-sm text-foreground/80 text-left max-w-xs mx-auto">
            <a href="#">Contact Us</a><a href="#">Privacy Policy</a>
            <a href="#">FAQ</a><a href="#">Terms of Service</a>
          </div>
          <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
            ফ্রী ফায়ার ডায়মন্ড টপ আপ কম দামে ভালো সার্ভিস। যেকোনো অর্ডার জনিত সমস্যায় ফেসবুক মেসেঞ্জারে অর্ডারের স্ক্রিনশট এবং পেমেন্টের ট্রানজেকশন আইডি লিখে মেসেজ দিন। ১৮ বছরের নিচে অভিভাবকের অনুমতি ছাড়া অর্ডার করা সম্পূর্ণভাবে নিষিদ্ধ।
          </p>
        </div>
      </footer>
    </AppShell>
  );
}

function ChipCard({
  icon, tint, title, sub, href,
}: { icon: React.ReactNode; tint: string; title: string; sub: string; href: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="card-soft rounded-xl p-2.5 flex items-center gap-2 hover-lift"
    >
      <span className={`grid place-items-center h-9 w-9 rounded-lg bg-gradient-to-br ${tint} shadow-md`}>
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase truncate">{sub}</div>
        <div className="font-display text-base leading-none truncate">{title}</div>
      </div>
    </a>
  );
}

function CategoryCard({ to, img, label, loading = false }: { to?: string; img: string; label: string; loading?: boolean }) {
  const content = (
    <>
      <div className="relative rounded-2xl overflow-hidden card-soft hover-lift sweep-shine">
        {loading && <span className="absolute inset-0 z-10 skeleton-glow" aria-hidden />}
        <img
          src={img}
          alt={label}
          width={768}
          height={768}
          loading="lazy"
          decoding="async"
          className="w-full aspect-square object-cover"
        />
      </div>
      <div className="mt-2 text-center text-sm font-semibold text-foreground/90 leading-tight">
        {label}
      </div>
    </>
  );
  if (!to) return <div>{content}</div>;
  return (
    <Link to="/products/$id" params={{ id: to }} className="block group">
      {content}
    </Link>
  );
}

function SubBrand({
  tint, border, title, sub, iconBg, icon,
}: { tint: string; border: string; title: string; sub: string; iconBg: string; icon: React.ReactNode }) {
  return (
    <div className={`relative rounded-2xl bg-gradient-to-b ${tint} border ${border} p-4 aspect-square flex flex-col items-center justify-center text-center`}>
      <span className={`grid place-items-center h-10 w-10 rounded-lg ${iconBg} shadow-md`}>
        {icon}
      </span>
      <div className="mt-2 font-display text-base leading-tight">{title}</div>
      <div className="text-[10px] tracking-[0.2em] text-muted-foreground mt-0.5">{sub}</div>
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.15em] text-foreground/40">UIDTOPUP.COM</span>
    </div>
  );
}

function SocialBrand({
  href, title, sub, ringFrom, ringTo, iconBg, glow, icon,
}: {
  href: string; title: string; sub: string;
  ringFrom: string; ringTo: string; iconBg: string; glow: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group relative rounded-xl p-[1px] bg-gradient-to-br ${ringFrom} ${ringTo} hover:scale-[1.02] transition-transform`}
    >
      <div className={`relative rounded-[11px] bg-card/95 backdrop-blur px-2.5 py-2.5 flex items-center gap-2 overflow-hidden ${glow}`}>
        <span className="pointer-events-none absolute inset-0 sweep-shine opacity-60" />
        <span className={`relative grid place-items-center h-8 w-8 rounded-lg ${iconBg} shadow-md shrink-0`}>
          {icon}
        </span>
        <div className="relative min-w-0 text-left">
          <div className="font-display text-[13px] leading-none truncate">{title}</div>
          <div className="text-[9px] tracking-[0.18em] text-muted-foreground mt-1 truncate">{sub}</div>
        </div>
      </div>
    </a>
  );
}


import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listProducts } from "@/lib/products.functions";
import { AppShell } from "@/components/site/AppShell";
import { packImage, PACK_LABELS } from "@/lib/assets";
import heroImg from "@/assets/hero-diamond.jpg";
import { Flame, ShieldCheck, Zap, Headphones, MessageCircle, Sparkles } from "lucide-react";

const productsQO = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UID Topup — Premium Free Fire Diamond Topup in Bangladesh" },
      { name: "description", content: "Bangladesh er #1 Free Fire diamond topup service. Instant delivery (10 seconds), Weekly & Monthly membership, Level Up Pass — sob kichu best price e. Pay with bKash, Nagad, Rocket." },
      { property: "og:title", content: "UID Topup — Premium Free Fire Diamond Topup" },
      { property: "og:description", content: "Instant Free Fire diamond topup, membership & level up pass. Trusted by thousands in Bangladesh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQO),
  component: HomePage,
  errorComponent: ({ error, reset }) => (
    <AppShell>
      <div className="p-6 text-center">
        <p className="text-destructive">{error.message}</p>
        <button onClick={reset} className="btn-gold mt-4 px-4 py-2 rounded">Retry</button>
      </div>
    </AppShell>
  ),
  notFoundComponent: () => <AppShell><div className="p-10 text-center">Not found</div></AppShell>,
});

function HomePage() {
  const { data: products } = useSuspenseQuery(productsQO);

  const grouped = products.reduce<Record<string, typeof products>>((acc, p) => {
    (acc[p.pack_type] ||= []).push(p);
    return acc;
  }, {});

  return (
    <AppShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" width={1536} height={896} className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-onyx/20 via-onyx/70 to-background" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:pt-16 sm:pb-20">
          <span className="inline-flex items-center gap-1.5 rounded-full gold-border bg-onyx/60 px-3 py-1 text-[11px] tracking-[0.25em] text-gold-soft uppercase">
            <Sparkles className="h-3 w-3" /> 10 second delivery
          </span>
          <h1 className="mt-4 font-display text-5xl sm:text-7xl leading-[0.95]">
            <span className="block text-foreground">FREE FIRE</span>
            <span className="block gold-text">DIAMOND TOPUP</span>
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Bangladesh er sobcheye trusted Free Fire topup platform. <span className="text-foreground">কম দামে ভালো সার্ভিস</span> — instant delivery, bKash/Nagad/Rocket support, 24/7 live chat.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#packs" className="btn-gold px-6 py-3 rounded-md text-sm">Topup Now</a>
            <a
              href="https://wa.me/8801000000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md gold-border bg-onyx/60 text-foreground hover:bg-gold/10"
            >
              <MessageCircle className="h-4 w-4 text-gold" /> WhatsApp Support
            </a>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            {[
              { k: "50K+", v: "Orders" },
              { k: "10s", v: "Delivery" },
              { k: "24/7", v: "Support" },
            ].map((s) => (
              <div key={s.v} className="card-luxe rounded-lg p-3 text-center">
                <div className="font-display text-2xl gold-text">{s.k}</div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 grid grid-cols-2 sm:grid-cols-4 gap-3 -mt-4">
        {[
          { i: Zap, t: "Instant", s: "10s delivery" },
          { i: ShieldCheck, t: "100% Safe", s: "Trusted seller" },
          { i: Flame, t: "Best Price", s: "Lowest in BD" },
          { i: Headphones, t: "24/7", s: "Live support" },
        ].map(({ i: Icon, t, s }) => (
          <div key={t} className="card-luxe rounded-xl p-4 flex items-center gap-3">
            <span className="grid place-items-center h-10 w-10 rounded-md bg-gold/10 gold-border">
              <Icon className="h-5 w-5 text-gold" />
            </span>
            <div>
              <div className="font-display text-lg leading-none">{t}</div>
              <div className="text-xs text-muted-foreground">{s}</div>
            </div>
          </div>
        ))}
      </section>

      {/* PACK SECTIONS */}
      <section id="packs" className="mx-auto max-w-7xl px-4 mt-12 space-y-12">
        {Object.entries(grouped).map(([type, items]) => {
          const label = PACK_LABELS[type] ?? { en: type, bn: "" };
          return (
            <div key={type}>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="text-[11px] tracking-[0.3em] text-gold uppercase">Free Fire</div>
                  <h2 className="font-display text-3xl sm:text-4xl">
                    <span className="gold-text">{label.en}</span>
                    {label.bn && <span className="text-muted-foreground text-xl ml-3">{label.bn}</span>}
                  </h2>
                </div>
                <div className="hidden sm:block text-xs text-muted-foreground">{items.length} packs</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {items.map((p) => (
                  <Link
                    key={p.id}
                    to="/products/$id"
                    params={{ id: p.id }}
                    className="group relative card-luxe rounded-xl overflow-hidden hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="aspect-square relative overflow-hidden bg-onyx">
                      <img
                        src={packImage(p.pack_type)}
                        alt={p.name_en}
                        width={768}
                        height={768}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {p.badge && (
                        <span className="absolute top-2 left-2 rounded-md bg-gold text-onyx px-2 py-0.5 text-[10px] font-bold tracking-widest">
                          {p.badge}
                        </span>
                      )}
                      <span className="absolute bottom-2 right-2 rounded-md bg-onyx/80 backdrop-blur px-2 py-0.5 text-[10px] font-bold tracking-widest text-gold-soft gold-border">
                        {p.server}
                      </span>
                    </div>
                    <div className="p-3">
                      <div className="font-display text-lg leading-tight truncate">{p.name_en}</div>
                      {p.name_bn && <div className="text-xs text-muted-foreground truncate">{p.name_bn}</div>}
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-display text-2xl gold-text">৳{Number(p.price).toFixed(0)}</span>
                        {p.original_price && Number(p.original_price) > Number(p.price) && (
                          <span className="text-xs text-muted-foreground line-through">৳{Number(p.original_price).toFixed(0)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* FOOTER */}
      <footer className="mx-auto max-w-7xl px-4 mt-16 pb-6">
        <div className="card-luxe rounded-2xl p-8 text-center">
          <div className="font-display text-3xl gold-text">UID TOPUP</div>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            ফ্রী ফায়ার ডায়মন্ড টপ আপ কম দামে ভালো সার্ভিস। যেকোনো অর্ডার জনিত সমস্যায় লাইভ চ্যাট করুন।
          </p>
          <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-gold-soft">Contact</a>
            <a href="#" className="hover:text-gold-soft">Privacy</a>
            <a href="#" className="hover:text-gold-soft">FAQ</a>
            <a href="#" className="hover:text-gold-soft">Terms</a>
          </div>
        </div>
      </footer>
    </AppShell>
  );
}

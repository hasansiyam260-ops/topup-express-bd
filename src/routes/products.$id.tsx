import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getProduct, listProducts } from "@/lib/products.functions";
import { getFFPlayerName } from "@/lib/ff.functions";
import { AppShell } from "@/components/site/AppShell";
import { packImage } from "@/lib/assets";
import heroImg from "@/assets/hero-promo.jpg";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Smartphone, Info, HelpCircle } from "lucide-react";
import { toast } from "sonner";

const productQO = (id: string) =>
  queryOptions({ queryKey: ["product", id], queryFn: () => getProduct({ data: { id } }) });

const allQO = queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });

export const Route = createFileRoute("/products/$id")({
  loader: async ({ params, context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productQO(params.id)),
      context.queryClient.ensureQueryData(allQO),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Free Fire Topup — UIDTOPUP.COM" },
      { name: "description", content: "Select your Free Fire pack, enter Player UID, and pay with bKash/Nagad/Rocket. Instant delivery." },
    ],
  }),
  component: ProductPage,
  errorComponent: ({ error, reset }) => (
    <AppShell><div className="p-6 text-center"><p className="text-destructive">{error.message}</p><button onClick={reset} className="btn-red mt-4 px-4 py-2 rounded">Retry</button></div></AppShell>
  ),
  notFoundComponent: () => <AppShell><div className="p-10 text-center">Product not found</div></AppShell>,
});

function ProductPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();
  const { data: product } = useSuspenseQuery(productQO(id));
  const { data: all } = useSuspenseQuery(allQO);

  const related = all.filter((p) => p.pack_type === product?.pack_type);
  const [selectedId, setSelectedId] = useState(id);
  useEffect(() => setSelectedId(id), [id]);
  const selected = related.find((p) => p.id === selectedId) ?? product;

  const [uid, setUid] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [checking, setChecking] = useState(false);
  const [payment, setPayment] = useState<"wallet" | "instant" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT") setAuthed(e === "SIGNED_IN");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!product || !selected) return null;

  const checkPlayer = async () => {
    if (!/^\d{6,12}$/.test(uid)) {
      toast.error("Please enter a valid Player UID (digits only)");
      return;
    }
    setChecking(true);
    try {
      const res = await getFFPlayerName({ data: { uid, region: "bd" } });
      setPlayerName(res.name);
      toast.success(`Player verified: ${res.name}`);
    } catch (e: any) {
      setPlayerName("");
      toast.error(e?.message || "Could not fetch player name. Check UID.");
    } finally {
      setChecking(false);
    }
  };

  const submitOrder = async () => {
    if (!authed) {
      navigate({ to: "/auth", search: { mode: "login" } });
      return;
    }
    if (!playerName) return toast.error("Please verify your Player UID first");
    if (!payment) return toast.error("Choose a payment method");
    setSubmitting(true);
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) {
      setSubmitting(false);
      navigate({ to: "/auth", search: { mode: "login" } });
      return;
    }
    const { error } = await supabase.from("orders").insert({
      user_id: userId,
      product_id: selected.id,
      product_name: selected.name_en,
      player_uid: uid,
      player_name: playerName,
      amount: Number(selected.price),
      payment_method: payment,
      status: "pending",
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Order placed! Delivery within 10 seconds.");
    router.navigate({ to: "/orders" });
  };

  return (
    <AppShell>
      {/* Product Banner — wide cinematic header like reference */}
      <section className="mx-auto max-w-3xl px-3 pt-4">
        <div className="relative rounded-2xl overflow-hidden glow-violet sweep-shine">
          <img
            src={heroImg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
          <div className="relative flex items-center gap-3 p-3 sm:p-4">
            <img
              src={packImage(product.pack_type)}
              alt={product.name_en}
              width={300}
              height={300}
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl object-cover ring-2 ring-white/20 shadow-2xl shrink-0"
            />
            <div className="min-w-0 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              <h1 className="font-display text-xl sm:text-2xl leading-tight">
                Free Fire <span className="text-white/90">[BD SERVER]</span>
              </h1>
              <div className="text-[11px] tracking-[0.4em] text-white/70 uppercase mt-1">Free Fire</div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-3xl px-3 mt-4 space-y-4">
        {/* Step 1 — Select Recharge */}
        <Step n={1} title="Select Recharge">
          <div className={`grid gap-2.5 ${product.pack_type === "diamond" ? "grid-cols-2" : "grid-cols-1"}`}>
            {related.map((p) => {
              const active = p.id === selected.id;
              const isDiamond = p.pack_type === "diamond";
              const m = /^(\d+)/.exec(p.name_en);
              const qty = m ? m[1] : null;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`relative flex items-center gap-2 px-3 h-12 rounded-xl border-2 bg-card text-left transition-all ${
                    active
                      ? "border-primary glow-red"
                      : "border-border hover:border-neon-violet/40"
                  }`}
                >
                  <span className={`grid place-items-center h-4 w-4 rounded-full border-2 shrink-0 ${
                    active ? "border-primary bg-primary" : "border-muted-foreground/40"
                  }`}>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  {isDiamond ? (
                    <span className="flex-1 min-w-0 font-semibold leading-none text-foreground flex items-baseline gap-1 whitespace-nowrap overflow-hidden">
                      <span className="text-[12px]">{qty ?? p.name_en}</span>
                      {qty && <span className="text-[12px]">Diamond</span>}
                      {qty && <span className="text-[11px] leading-none">💎</span>}
                    </span>
                  ) : (
                    <span className="flex-1 min-w-0 font-semibold text-[13px] leading-tight text-foreground truncate">
                      {p.name_bn || p.name_en}
                    </span>
                  )}
                  <span className="font-display text-[12px] text-primary tracking-wide whitespace-nowrap shrink-0 self-end pb-1">
                    {Number(p.price).toFixed(0)} TK
                  </span>
                </button>
              );

            })}
          </div>
        </Step>

        {/* Step 2 — Account Info */}
        <Step n={2} title="Account Info" rightSlot={
          <a href="#help" className="flex items-center gap-1 text-[11px] font-semibold underline underline-offset-4 decoration-primary">
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            কিভাবে অর্ডার করবেন ?
          </a>
        }>
          <label className="block text-xs font-semibold text-foreground/90 mb-1.5">Player UID</label>
          <input
            inputMode="numeric"
            value={uid}
            onChange={(e) => { setUid(e.target.value.replace(/\D/g, "").slice(0, 12)); setPlayerName(""); }}
            placeholder="Player UID"
            className="w-full px-3 py-2 text-sm rounded-lg bg-card border-2 border-border focus:border-neon-violet focus:outline-none focus:ring-4 focus:ring-neon-violet/15 text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={checkPlayer}
            disabled={checking || !uid}
            className="mt-2 w-full shimmer-orange py-2 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {checking ? "Checking..." : playerName ? `✓ ${playerName}` : "Click to check player name"}
          </button>
        </Step>

        {/* Step 3 — Payment */}
        <Step n={3} title="Payment Methods">
          <div className="grid grid-cols-2 gap-3">
            <PayCard
              active={payment === "wallet"}
              onClick={() => setPayment("wallet")}
              title="Pay With Wallet"
              subtitle="Instant · 0% Fee"
              icon={<Wallet className="h-5 w-5" />}
              brand="TOPUP ওয়ালেট"
              variant="wallet"
            />
            <PayCard
              active={payment === "instant"}
              onClick={() => setPayment("instant")}
              title="Instant Pay"
              subtitle="Mobile Banking"
              icon={<Smartphone className="h-5 w-5" />}
              brand="bKash · নগদ · Rocket"
              variant="instant"
              recommended
            />
          </div>

          {/* Premium price summary */}
          <div className="mt-5 rounded-2xl border border-border bg-gradient-to-br from-card to-muted/40 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Payable</span>
              <span className="text-[11px] tracking-wider uppercase text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Secure</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-4xl text-primary tracking-tight">৳{Number(selected.price).toFixed(0)}</span>
              <span className="text-sm text-muted-foreground">BDT</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>প্রোডাক্ট কিনতে আপনার প্রয়োজন <span className="text-foreground font-semibold">৳{Number(selected.price).toFixed(0)} টাকা</span></span>
            </div>
          </div>

          {!authed && (
            <div className="mt-3 flex items-center gap-2 text-sm text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
              <Info className="h-4 w-4 shrink-0" /> Please login to complete purchase
            </div>
          )}

          <button
            onClick={submitOrder}
            disabled={submitting}
            className="mt-4 w-full btn-red py-4 rounded-2xl text-base font-bold tracking-wide disabled:opacity-60 shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--brand-red)_60%,transparent)]"
          >
            {authed ? (submitting ? "PLACING ORDER..." : `CONFIRM · ৳${Number(selected.price).toFixed(0)}`) : "LOGIN TO CONTINUE"}
          </button>
        </Step>

        {/* Product info */}
        <div id="help" className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-display text-xl">Product Information</h3>
          <div className="mt-2 h-px bg-border" />
          <ul className="mt-3 space-y-2 text-sm text-foreground/80">
            <li>● শুধুমাত্র Bangladesh সার্ভারে ID Code দিয়ে টপ আপ হবে।</li>
            <li>● Diamond পাওয়ার পর Free Fire এ verify করে নিন।</li>
            <li>● কোন সমস্যায় Live Chat এ যোগাযোগ করুন।</li>
          </ul>
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to all packs</Link>
        </div>
      </section>
    </AppShell>
  );
}

function Step({
  n, title, children, rightSlot,
}: { n: number; title: string; children: React.ReactNode; rightSlot?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 card-soft">
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center h-6 w-6 rounded-full bg-primary text-primary-foreground font-display text-xs shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand-red)_15%,transparent)]">{n}</span>
          <h3 className="font-display text-base uppercase tracking-wide">{title}</h3>
        </div>
        {rightSlot}
      </div>
      {children}
    </div>
  );
}

function PayCard({
  active, onClick, title, subtitle, icon, brand, variant, recommended,
}: { active: boolean; onClick: () => void; title: string; subtitle: string; icon: React.ReactNode; brand: string; variant: "wallet" | "instant"; recommended?: boolean }) {
  const styles = variant === "wallet"
    ? { tint: "from-amber-50 via-orange-50 to-amber-100", accent: "text-orange-700", ring: "ring-orange-200", chipBg: "bg-orange-500/10", chipText: "text-orange-700" }
    : { tint: "from-rose-50 via-pink-50 to-rose-100", accent: "text-pink-700", ring: "ring-pink-200", chipBg: "bg-pink-500/10", chipText: "text-pink-700" };
  return (
    <button
      onClick={onClick}
      className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all duration-300 group ${
        active
          ? "border-primary glow-red scale-[1.02] shadow-[0_12px_28px_-12px_color-mix(in_oklab,var(--brand-red)_55%,transparent)]"
          : "border-border hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg"
      }`}
    >
      {recommended && (
        <span className="absolute top-2 right-2 z-10 text-[9px] font-bold tracking-wider uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-md">Popular</span>
      )}
      {active && (
        <span className="absolute top-2 left-2 z-10 grid place-items-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] shadow-md">✓</span>
      )}
      <div className={`relative h-24 grid place-items-center bg-gradient-to-br ${styles.tint} overflow-hidden`}>
        <div className="absolute inset-0 opacity-40 sweep-shine pointer-events-none" />
        <div className="relative flex flex-col items-center gap-1.5 px-2">
          <span className={`grid place-items-center h-9 w-9 rounded-full bg-white/80 backdrop-blur ring-2 ${styles.ring} ${styles.accent} shadow-sm`}>{icon}</span>
          <span className={`font-display text-[15px] leading-none ${styles.accent} text-center`}>{brand}</span>
        </div>
      </div>
      <div className={`px-3 py-2.5 flex items-center justify-between gap-2 ${active ? "bg-primary/8" : "bg-card"}`}>
        <div className="min-w-0">
          <div className={`text-[13px] font-bold truncate ${active ? "text-primary" : "text-foreground"}`}>{title}</div>
          <div className="text-[10px] text-muted-foreground truncate">{subtitle}</div>
        </div>
        <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${styles.chipBg} ${styles.chipText}`}>Fast</span>
      </div>
    </button>
  );
}

import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getProduct, listProducts } from "@/lib/products.functions";
import { getFFPlayerName } from "@/lib/ff.functions";
import { AppShell } from "@/components/site/AppShell";
import { SecureCheckout } from "@/components/site/SecureCheckout";
import { packImage } from "@/lib/assets";
import heroImg from "@/assets/hero-promo.jpg";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Smartphone, Info, HelpCircle, AlertTriangle, X, Plus } from "lucide-react";
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
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [insufficientOpen, setInsufficientOpen] = useState(false);
  const [walletSuccess, setWalletSuccess] = useState<{ amount: number; invoice: string } | null>(null);

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

  const price = Number(selected.price);

  const placeOrder = async (method: "wallet" | "instant"): Promise<boolean> => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) {
      navigate({ to: "/auth", search: { mode: "login" } });
      return false;
    }
    const { error } = await supabase.from("orders").insert({
      user_id: userId,
      product_id: selected.id,
      product_name: selected.name_en,
      player_uid: uid,
      player_name: playerName,
      amount: price,
      payment_method: method,
      status: "pending",
    });
    if (error) { toast.error(error.message); return false; }
    return true;
  };

  const submitOrder = async () => {
    if (!authed) { navigate({ to: "/auth", search: { mode: "login" } }); return; }
    if (!playerName) return toast.error("Please verify your Player UID first");
    if (!payment) return toast.error("Choose a payment method");

    if (payment === "instant") {
      // Open Secure Checkout — order will be placed after Transaction ID is verified
      setCheckoutOpen(true);
      return;
    }

    // Wallet flow: check balance
    let balance = 0;
    try { balance = Number(localStorage.getItem("uidtopup:wallet") || "0"); } catch {}
    if (balance < price) {
      setInsufficientOpen(true);
      return;
    }

    setSubmitting(true);
    const ok = await placeOrder("wallet");
    if (ok) {
      try { localStorage.setItem("uidtopup:wallet", String(balance - price)); } catch {}
      const invoice = Math.random().toString(36).slice(2, 14).toUpperCase();
      setWalletSuccess({ amount: price, invoice });
    }
    setSubmitting(false);
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
          <div className="grid grid-cols-2 gap-2">
            <PayCard
              active={payment === "wallet"}
              onClick={() => setPayment("wallet")}
              title="Pay With Wallet"
              subtitle="Instant · 0% Fee"
              icon={<Wallet className="h-4 w-4" />}
              brand="TOPUP ওয়ালেট"
              variant="wallet"
            />
            <PayCard
              active={payment === "instant"}
              onClick={() => setPayment("instant")}
              title="Instant Pay"
              subtitle="Mobile Banking"
              icon={<Smartphone className="h-4 w-4" />}
              brand="bKash · নগদ · Rocket"
              variant="instant"
              recommended
            />
          </div>

          {/* Premium price summary */}
          <div className="mt-3 rounded-xl border border-border bg-gradient-to-br from-card to-muted/40 p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Payable</span>
              <span className="text-[10px] tracking-wider uppercase text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">Secure</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="font-display text-2xl text-primary tracking-tight">৳{Number(selected.price).toFixed(0)}</span>
              <span className="text-xs text-muted-foreground">BDT</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Info className="h-3 w-3 shrink-0" />
              <span>প্রোডাক্ট কিনতে আপনার প্রয়োজন <span className="text-foreground font-semibold">৳{Number(selected.price).toFixed(0)} টাকা</span></span>
            </div>
          </div>

          {!authed && (
            <div className="mt-2 flex items-center gap-2 text-xs text-primary bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1.5">
              <Info className="h-3.5 w-3.5 shrink-0" /> Please login to complete purchase
            </div>
          )}

          <button
            onClick={submitOrder}
            disabled={submitting}
            className="mt-3 w-full btn-red py-2.5 rounded-xl text-sm font-bold tracking-wide disabled:opacity-60 shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--brand-red)_60%,transparent)]"
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
  active, onClick, title, subtitle, variant, recommended,
}: { active: boolean; onClick: () => void; title: string; subtitle?: string; icon?: React.ReactNode; brand?: string; variant: "wallet" | "instant"; recommended?: boolean }) {
  const isWallet = variant === "wallet";
  return (
    <button
      onClick={onClick}
      className={`group relative text-left rounded-2xl overflow-hidden transition-all duration-300 border-2 ${
        active
          ? isWallet
            ? "border-amber-400 shadow-[0_10px_26px_-10px_rgba(245,158,11,0.55)]"
            : "border-primary shadow-[0_10px_26px_-10px_color-mix(in_oklab,var(--brand-red)_55%,transparent)]"
          : "border-border hover:-translate-y-0.5 hover:shadow-md"
      }`}
      style={{
        background: isWallet
          ? "linear-gradient(180deg,#fff7e6 0%,#fef3d8 55%,#ffffff 100%)"
          : "linear-gradient(180deg,#fff0f3 0%,#ffe1ea 55%,#ffffff 100%)",
      }}
    >
      {/* glossy top sheen */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent" />
      <span className="pointer-events-none absolute -top-8 -left-6 h-16 w-28 rotate-[12deg] bg-white/60 blur-2xl" />

      {recommended && (
        <span className="absolute top-1.5 right-1.5 z-10 text-[8px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-rose-500 to-primary text-white px-2 py-0.5 rounded-full shadow-[0_4px_12px_-2px_rgba(239,68,68,0.5)]">★ Popular</span>
      )}
      {active && (
        <span className="absolute top-1.5 left-1.5 z-10 grid place-items-center h-5 w-5 rounded-full bg-primary text-white text-[10px] shadow-md">✓</span>
      )}

      <div className="relative h-[96px] grid place-items-center px-2 overflow-hidden">
        <div className="absolute inset-0 sweep-shine opacity-30 pointer-events-none" />
        {isWallet ? (
          <div className="relative flex flex-col items-center gap-2">
            <span className="relative grid place-items-center h-11 w-11 rounded-full bg-white ring-1 ring-amber-200 shadow-[0_6px_16px_-4px_rgba(245,158,11,0.45)]">
              <Wallet className="h-5 w-5 text-orange-500" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/80 to-transparent opacity-70" />
            </span>
            <span className="font-display text-[13px] leading-none tracking-wide">
              <span className="text-orange-600">TOPUP</span>{" "}
              <span className="text-purple-600">ওয়ালেট</span>
            </span>
          </div>
        ) : (
          <div className="relative flex flex-col items-center gap-1.5">
            <span className="relative grid place-items-center h-11 w-11 rounded-full bg-white ring-1 ring-rose-200 shadow-[0_6px_16px_-4px_rgba(226,19,110,0.45)]">
              <Smartphone className="h-5 w-5 text-primary" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/80 to-transparent opacity-70" />
            </span>
            <span className="font-display text-[11px] leading-none tracking-wide">
              <span className="text-[#e2136e]">bKash</span>
              <span className="text-foreground/40"> · </span>
              <span className="text-[#f15a29]">Nagad</span>
              <span className="text-foreground/40"> · </span>
              <span className="text-[#8a3ab9]">Rocket</span>
            </span>
          </div>

        )}
      </div>

      <div className="relative px-2.5 py-1.5 bg-white/85 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className={`text-[12px] font-bold truncate ${active ? (isWallet ? "text-orange-700" : "text-primary") : "text-foreground"}`}>{title}</div>
            {subtitle && <div className="text-[9px] text-muted-foreground truncate">{subtitle}</div>}
          </div>
          <span className="shrink-0 text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">Fast</span>
        </div>
      </div>
    </button>
  );
}

function BrandLogo({ brand }: { brand: "bkash" | "nagad" | "rocket" }) {
  const map = {
    bkash: { bg: "linear-gradient(135deg,#e2136e,#a30e52)", text: "bKash", ring: "rgba(226,19,110,0.55)" },
    nagad: { bg: "linear-gradient(135deg,#f15a29,#c43d12)", text: "Nagad", ring: "rgba(241,90,41,0.55)" },
    rocket: { bg: "linear-gradient(135deg,#8a3ab9,#5b2487)", text: "Rocket", ring: "rgba(138,58,185,0.55)" },
  }[brand];
  return (
    <span
      className="relative inline-flex items-center justify-center text-[8px] font-extrabold text-white px-1.5 py-1 rounded-md ring-1 ring-white/40"
      style={{ background: map.bg, boxShadow: `0 4px 10px -2px ${map.ring}, inset 0 1px 0 rgba(255,255,255,0.4)` }}
    >
      <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-md bg-gradient-to-b from-white/40 to-transparent" />
      <span className="relative drop-shadow-sm">{map.text}</span>
    </span>
  );
}


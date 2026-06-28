import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { productQueryOptions, productsQueryOptions } from "@/lib/products.queries";
import { getFFPlayerName } from "@/lib/ff.functions";
import { getSiteValue } from "@/lib/site.functions";
import { AppShell } from "@/components/site/AppShell";
import { SecureCheckout, SuccessScreen } from "@/components/site/SecureCheckout";
import { creditReferralForPurchase } from "@/lib/referrals.functions";
import { packImage } from "@/lib/assets";
import heroImg from "@/assets/hero-promo.webp";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Smartphone, Info, HelpCircle, AlertTriangle, X, Plus, BadgeCheck, Gamepad2, Star, Shield, Clock, MessageCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_META: Record<string, { title: string; sub: string; img?: string }> = {
  diamond: { title: "Free Fire Diamond", sub: "BD Server" },
  membership: { title: "Free Fire Membership", sub: "Weekly · Monthly" },
  level_pass: { title: "Level Up Pass", sub: "Free Fire BD" },
  like: { title: "Free Fire Likes", sub: "Profile Boost" },
  airdrop: { title: "Special Airdrop", sub: "Free Fire BD" },
  unipin: { title: "UniPin Voucher", sub: "Global Topup" },
  weeklylite: { title: "Weekly Lite Membership", sub: "Weekly · 7 Days" },
};
function categoryTitle(c: string) { return CATEGORY_META[c]?.title ?? "Topup Pack"; }
function categorySubtitle(c: string) { return CATEGORY_META[c]?.sub ?? "Premium"; }

export const Route = createFileRoute("/products/$id")({
  validateSearch: (s: Record<string, unknown>) => ({ cat: typeof s.cat === "string" ? s.cat : undefined }),
  loader: ({ params, context }) => {
    void context.queryClient.prefetchQuery(productQueryOptions(params.id));
    void context.queryClient.prefetchQuery(productsQueryOptions);
  },
  head: () => ({
    meta: [
      { title: "Free Fire Topup — TOP-UP EXPRESS" },
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
  const { cat } = Route.useSearch();
  const router = useRouter();
  const navigate = useNavigate();
  const { data: all = [] } = useQuery(productsQueryOptions);
  const cachedProduct = all.find((p) => p.id === id);
  const { data: productData } = useQuery(productQueryOptions(id));
  const product = productData ?? cachedProduct;

  // Determine effective category: explicit ?cat= wins over pack_type
  const effectiveCat = cat ?? product?.pack_type ?? "";
  // For weeklylite: only show the weekly lite variant. Otherwise group by pack_type but exclude weekly lite from generic membership.
  const relatedFromAll = product
    ? cat === "weeklylite"
      ? all.filter((p) => p.pack_type === "membership" && /lite/i.test(p.name_en))
      : cat === "membership"
      ? all.filter((p) => p.pack_type === "membership" && !/lite/i.test(p.name_en))
      : all.filter((p) => p.pack_type === product.pack_type)
    : [];
  const related = relatedFromAll.length ? relatedFromAll : product ? [product] : [];
  const [selectedId, setSelectedId] = useState(id);
  useEffect(() => setSelectedId(id), [id]);
  const selected = related.find((p) => p.id === selectedId) ?? product;

  const [uid, setUid] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerLevel, setPlayerLevel] = useState<number | null>(null);
  const [playerRegion, setPlayerRegion] = useState<string>("");
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

  if (!product || !selected) return <ProductLoadingShell />;

  const checkPlayer = async () => {
    if (!/^\d{6,12}$/.test(uid)) {
      toast.error("Please enter a valid Player UID (digits only)");
      return;
    }
    setChecking(true);
    try {
      const res = await getFFPlayerName({ data: { uid, region: "bd" } });
      setPlayerName(res.name);
      setPlayerLevel(res.level ?? null);
      setPlayerRegion(res.region ?? "");
      toast.success(`Player verified: ${res.name}`);
    } catch (e: any) {
      setPlayerName("");
      setPlayerLevel(null);
      setPlayerRegion("");
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

    // Wallet flow: check real live database balance
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) { navigate({ to: "/auth", search: { mode: "login" } }); return; }
    const { data: walletRow, error: walletError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", userId)
      .maybeSingle();
    if (walletError) return toast.error(walletError.message);
    const balance = Number(walletRow?.balance ?? 0);
    if (balance < price) {
      setInsufficientOpen(true);
      return;
    }

    setSubmitting(true);
    const ok = await placeOrder("wallet");
    if (ok) {
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ balance: balance - price })
        .eq("id", userId);
      if (balanceError) { toast.error(balanceError.message); setSubmitting(false); return; }
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
              width={900}
              height={450}
              decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
          <div className="relative flex items-center gap-3 p-3 sm:p-4">
            <img
              src={packImage(effectiveCat)}
              alt={categoryTitle(effectiveCat)}
              width={300}
              height={300}
              decoding="async"
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl object-cover ring-2 ring-white/20 shadow-2xl shrink-0"
            />
            <div className="min-w-0 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              <h1 className="font-display text-xl sm:text-2xl leading-tight">
                {categoryTitle(effectiveCat)}
              </h1>
              <div className="text-[11px] tracking-[0.4em] text-white/70 uppercase mt-1">{categorySubtitle(effectiveCat)}</div>
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
        <Step n={2} title="Account Info" rightSlot={<OrderHelpLink />}>

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
            {checking ? "Checking..." : playerName ? "✓ Verified — Tap to recheck" : "Click to check player name"}
          </button>
          {playerName && (
            <VerifiedPlayerCard name={playerName} level={playerLevel} region={playerRegion} />
          )}
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

        {/* Product info — per-category */}
        <div id="help">
          <ProductInformation cat={effectiveCat} />
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to all packs</Link>
        </div>
      </section>

      {checkoutOpen && (
        <SecureCheckout
          amount={price}
          onClose={() => { setCheckoutOpen(false); router.navigate({ to: "/orders" }); }}
          onVerified={async () => {
            const ok = await placeOrder("instant");
            if (ok) toast.success("Order placed! Delivery within 10 seconds.");
            return ok;
          }}
          successCopy={{
            badge: "Order Placed",
            title: "অর্ডার সফলভাবে সম্পন্ন হয়েছে",
            subtitle: `${selected.name_en} • UID ${uid}`,
            amountLabel: "Paid Amount",
            channel: "Mobile Banking",
          }}
        />
      )}

      {insufficientOpen && (
        <InsufficientBalanceModal
          required={price}
          onClose={() => setInsufficientOpen(false)}
          onAddMoney={() => { setInsufficientOpen(false); navigate({ to: "/wallet" }); }}
        />
      )}

      {walletSuccess && (
        <WalletPaidSuccess
          amount={walletSuccess.amount}
          invoice={walletSuccess.invoice}
          productName={selected.name_en}
          uid={uid}
          onClose={() => { setWalletSuccess(null); router.navigate({ to: "/orders" }); }}
        />
      )}
    </AppShell>
  );
}

function ProductLoadingShell() {
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-3 pt-4">
        <div className="relative rounded-2xl overflow-hidden glow-violet h-[128px] bg-card">
          <img
            src={heroImg}
            alt=""
            width={900}
            height={450}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
          <div className="relative flex items-center gap-3 p-3 sm:p-4">
            <div className="h-24 w-24 rounded-xl skeleton-glow ring-2 ring-white/20 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-6 w-40 rounded-lg skeleton-glow" />
              <div className="h-3 w-28 rounded-full skeleton-glow" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-3 mt-4 space-y-4" aria-busy="true">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-xl border border-border bg-card p-3 sm:p-3.5 card-soft">
            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-border">
              <span className="grid place-items-center h-6 w-6 rounded-full bg-primary text-primary-foreground font-display text-xs">
                {n}
              </span>
              <div className="h-4 w-28 rounded-full skeleton-glow" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="h-12 rounded-xl skeleton-glow" />
              <div className="h-12 rounded-xl skeleton-glow" />
              {n === 1 && (
                <>
                  <div className="h-12 rounded-xl skeleton-glow" />
                  <div className="h-12 rounded-xl skeleton-glow" />
                </>
              )}
            </div>
          </div>
        ))}
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


function InsufficientBalanceModal({ required, onClose, onAddMoney }: { required: number; onClose: () => void; onAddMoney: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1a0a0a] via-[#2a0f10] to-[#0a0506] text-white">
        <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-rose-500/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <button onClick={onClose} className="absolute top-3 right-3 z-10 grid place-items-center h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80">
          <X className="h-4 w-4" />
        </button>
        <div className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center">
          <div className="relative grid place-items-center">
            <span className="absolute h-24 w-24 rounded-full bg-rose-500/30 blur-2xl animate-pulse" />
            <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 grid place-items-center shadow-[0_10px_40px_-10px_rgba(244,63,94,0.8)] ring-4 ring-rose-300/30">
              <AlertTriangle className="h-10 w-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-5 text-[10px] tracking-[0.4em] uppercase text-rose-300/90">Insufficient Balance</div>
          <h2 className="font-display text-xl tracking-wide mt-1">ওয়ালেটে পর্যাপ্ত টাকা নেই</h2>
          <p className="text-white/60 text-[12px] mt-1.5 leading-relaxed">
            এই অর্ডার সম্পন্ন করতে আপনার <span className="font-bold text-rose-300">৳{required.toLocaleString()}</span> দরকার। অনুগ্রহ করে প্রথমে wallet এ টাকা যোগ করুন।
          </p>
          <div className="mt-5 w-full grid grid-cols-2 gap-2.5">
            <button onClick={onClose} className="rounded-xl py-2.5 text-[12px] font-semibold tracking-wide bg-white/10 hover:bg-white/15 text-white/80 border border-white/15">CANCEL</button>
            <button onClick={onAddMoney} className="rounded-xl py-2.5 text-[12px] font-bold tracking-wide bg-gradient-to-b from-rose-400 to-rose-600 hover:from-rose-300 hover:to-rose-500 shadow-[0_8px_22px_-8px_rgba(244,63,94,0.7)] flex items-center justify-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> ADD MONEY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletPaidSuccess({ amount, invoice, productName, uid, onClose }: { amount: number; invoice: string; productName: string; uid: string; onClose: () => void }) {
  return (
    <SuccessScreen
      amount={amount}
      invoiceId={invoice}
      onClose={onClose}
      copy={{
        badge: "Order Placed",
        title: "অর্ডার সফলভাবে সম্পন্ন হয়েছে",
        subtitle: `${productName} • UID ${uid}`,
        amountLabel: "Paid From Wallet",
        channel: "TOPUP Wallet",
      }}
    />
  );
}

// ──────────────────────────────────────────────────────────────────
// Premium "Verified" player card — shown for every category after UID check
// ──────────────────────────────────────────────────────────────────
function VerifiedPlayerCard({ name, level, region }: { name: string; level: number | null; region: string }) {
  return (
    <div
      className="relative mt-3 rounded-2xl p-[2px] overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(16,185,129,.95), rgba(5,150,105,.85) 45%, rgba(16,185,129,.95))",
        boxShadow:
          "0 12px 30px -14px rgba(16,185,129,.55), 0 0 0 1px rgba(16,185,129,.25)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-60"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,.6), transparent 55%)",
        }}
      />
      <div className="relative rounded-[14px] bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 p-3 flex items-center gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <span className="absolute inset-0 rounded-full bg-emerald-400/40 blur-md animate-pulse" />
          <span className="relative grid place-items-center h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white ring-2 ring-white shadow-[0_6px_18px_-4px_rgba(16,185,129,.65)]">
            <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
          </span>
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-display text-[15px] leading-none text-foreground truncate max-w-[150px]">
              {name}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full ring-1 ring-emerald-200">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Gamepad2 className="h-3 w-3" />
            <span>Free Fire Player{region ? ` · ${region}` : ""}</span>
          </div>
        </div>

        {/* Level badge */}
        {level != null && (
          <div className="relative shrink-0">
            <div
              className="relative grid place-items-center h-14 w-14 rounded-xl text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,.55)] ring-2 ring-white/70"
              style={{ background: "linear-gradient(160deg,#7c3aed,#4f46e5 55%,#2563eb)" }}
            >
              <span className="absolute top-1 right-1 text-[8px]"><Star className="h-2.5 w-2.5 text-amber-300 fill-amber-300" /></span>
              <span className="text-[8px] font-extrabold tracking-widest opacity-80 leading-none mt-1">LEVEL</span>
              <span className="font-display text-lg leading-none">{level}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Per-category Product Information (Bangla, step-by-step)
// ──────────────────────────────────────────────────────────────────
function ProductInformation({ cat }: { cat: string }) {
  const content = getInfoContent(cat);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Premium header strip */}
      <div className="relative px-4 py-3 bg-gradient-to-r from-rose-50 via-white to-violet-50 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-rose-600 text-white shadow-[0_6px_14px_-4px_rgba(244,63,94,.55)]">
            <Info className="h-3.5 w-3.5" />
          </span>
          <h3 className="font-display text-lg tracking-wide">Product Information</h3>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">অর্ডার করার আগে অনুগ্রহ করে ভালোভাবে পড়ে নিন</p>
      </div>

      <div className="p-4 space-y-4 text-sm leading-relaxed text-foreground/90">
        {content.intro && (
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[13px] text-foreground/90">{content.intro}</p>
            </div>
          </div>
        )}

        {content.sections.map((sec, i) => (
          <div key={i}>
            {sec.title && (
              <div className="flex items-center gap-2 mb-2">
                <span className="grid place-items-center h-6 w-6 rounded-md bg-primary/10 text-primary font-display text-xs">{i + 1}</span>
                <h4 className="font-display text-[14px] tracking-wide text-foreground">{sec.title}</h4>
              </div>
            )}
            <ul className="space-y-2 pl-1">
              {sec.items.map((it, j) => (
                <li key={j} className="flex gap-2 text-[13px]">
                  <span className="text-primary mt-1 shrink-0">●</span>
                  <span dangerouslySetInnerHTML={{ __html: it }} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Footer info */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 flex items-start gap-2">
            <Clock className="h-3.5 w-3.5 text-emerald-700 mt-0.5 shrink-0" />
            <div>
              <div className="text-[10px] font-bold tracking-wider uppercase text-emerald-700">Delivery</div>
              <div className="text-[11px] text-foreground/80">{content.delivery}</div>
            </div>
          </div>
          <div className="rounded-lg bg-violet-50 border border-violet-200 p-2.5 flex items-start gap-2">
            <MessageCircle className="h-3.5 w-3.5 text-violet-700 mt-0.5 shrink-0" />
            <div>
              <div className="text-[10px] font-bold tracking-wider uppercase text-violet-700">Support</div>
              <div className="text-[11px] text-foreground/80">9:00 AM – 12:00 AM (BD)</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-r from-rose-50 to-rose-100/60 border border-rose-200 p-2.5 flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-rose-700 shrink-0" />
          <p className="text-[11px] text-rose-900/90"><b>TOP-UP EXPRESS</b> এর সাথে থাকার জন্য আপনাকে অসংখ্য ধন্যবাদ 🥰</p>
        </div>
      </div>
    </div>
  );
}

type InfoContent = {
  intro?: string;
  delivery: string;
  sections: { title?: string; items: string[] }[];
};

function getInfoContent(cat: string): InfoContent {
  switch (cat) {
    case "level_pass":
      return {
        intro: "একটি Free Fire ID তে Level Up Pass শুধুমাত্র একবারই নেওয়া যায়। অর্ডার করার আগে নিশ্চিত হোন।",
        delivery: "১০ সেকেন্ড – ২ মিনিট",
        sections: [
          {
            title: "অর্ডার করার আগে যা জানা জরুরি",
            items: [
              "একটি আইডিতে <b>একবারই</b> Level Up Pass নেওয়া যায়। আগে নিয়ে থাকলে নতুন করে নেওয়া যাবে না।",
              "অর্ডার করার আগে আপনার <b>Free Fire Level</b> ভালোভাবে চেক করুন।",
              "আপনি যে লেভেলের প্যাকেজ অর্ডার করবেন, শুধু সেই লেভেলের ডায়মন্ড পাবেন।",
              "<b>Guest ID</b> বা ভুল UID তে অর্ডার করবেন না।",
            ],
          },
          {
            title: "অর্ডার করার নিয়ম",
            items: [
              "প্রথমে আপনার <b>Player UID</b> দিয়ে \"Check Player Name\" এ ক্লিক করুন।",
              "Player Name এবং Level সঠিক দেখালে নিচ থেকে আপনার Level অনুযায়ী প্যাকেজ সিলেক্ট করুন।",
              "Payment Method সিলেক্ট করে <b>Confirm</b> বাটনে ক্লিক করুন।",
              "অর্ডার Complete হলে My Orders সেকশনে স্ট্যাটাস দেখতে পাবেন।",
            ],
          },
          {
            title: "গুরুত্বপূর্ণ নোটিশ",
            items: [
              "ভুল লেভেল সিলেক্ট করে অর্ডার দিলে এবং ডায়মন্ড না পেলে <b>TOP-UP EXPRESS</b> কর্তৃপক্ষ দায়ী থাকবে না।",
              "আইডিতে Level Up Pass না থাকলেও যদি অর্ডার করেন এবং না পান, দায়ভার গ্রাহকের।",
              "অর্ডার Cancel হলে কারণ My Orders এ দেখানো হবে — সঠিক তথ্য দিয়ে পুনরায় অর্ডার করুন।",
            ],
          },
        ],
      };

    case "like":
      return {
        intro: "ফ্রি ফায়ার Like সার্ভিস ১০০% অটো — একবার অর্ডার দিলেই প্রতিদিন নির্ধারিত পরিমাণ Like অটোমেটিকভাবে আপনার ID তে যুক্ত হবে।",
        delivery: "২৪ ঘণ্টার মধ্যে শুরু হয়",
        sections: [
          {
            title: "অর্ডার করার আগে যা জানা জরুরি",
            items: [
              "❌ <b>ভুল</b> বা <b>Guest ID</b> তে অর্ডার করবেন না।",
              "এক আইডিতে <b>২৪ ঘণ্টায় একবার</b> Like প্যাকেজ নিতে পারবেন।",
              "২৪ ঘণ্টার মধ্যে একই আইডিতে বার বার অর্ডার করলে টাকা ফেরত দেওয়া হবে না।",
              "এক আইডিতে একবার নিলে আবার ২৪ ঘণ্টা পর নতুন প্যাকেজ নিতে পারবেন।",
            ],
          },
          {
            title: "কিভাবে কাজ করে",
            items: [
              "আপনি যদি <b>4 দিন, 10 দিন</b> অথবা <b>30 দিনের</b> Like প্যাকেজ কেনেন, আপনার Free Fire ID তে <b>প্রতিদিন ২০০ Like</b> অটোমেটিকভাবে যুক্ত হবে।",
              "একবার কিনলেই নির্ধারিত দিন পর্যন্ত প্রতিদিন Like আসবে — আপনাকে আলাদা কিছু করতে হবে না।",
            ],
          },
          {
            title: "প্যাকেজ অনুযায়ী মোট Like",
            items: [
              "<b>৪ দিনের প্যাকেজ</b> — মোট <b>৮০০</b> Like",
              "<b>১০ দিনের প্যাকেজ</b> — মোট <b>২,০০০</b> Like",
              "<b>৩০ দিনের প্যাকেজ</b> — মোট <b>৬,০০০</b> Like",
            ],
          },
          {
            title: "অর্ডার করার নিয়ম",
            items: [
              "আপনার <b>Player UID</b> দিয়ে \"Check Player Name\" এ ক্লিক করে যাচাই করুন।",
              "পছন্দের Like প্যাকেজ সিলেক্ট করুন।",
              "Payment Method বেছে নিন এবং <b>Confirm</b> বাটনে ক্লিক করুন।",
              "অর্ডার Complete হওয়ার পরের দিন থেকে অটোমেটিক Like যুক্ত হতে শুরু করবে।",
            ],
          },
        ],
      };

    case "unipin":
      return {
        intro: "Unipin Voucher দিয়ে নিজেই Free Fire Diamond Top-up করতে পারবেন — কোনো তৃতীয় পক্ষ ছাড়াই, মাত্র কয়েক সেকেন্ডেই!",
        delivery: "১ – ৫ মিনিট (Voucher Code)",
        sections: [
          {
            title: "Unipin Voucher কেন ব্যবহার করবেন",
            items: [
              "ইভেন্ট চলাকালে সাধারণ Top-up এ দেরি হতে পারে — Unipin দিয়ে <b>Instant Top-up</b> পাবেন।",
              "কোনো তৃতীয় পক্ষ ছাড়াই <b>নিজেই</b> Diamond টপ-আপ করতে পারবেন।",
              "১০০% নিরাপদ এবং অফিশিয়াল Garena চ্যানেল।",
            ],
          },
          {
            title: "অর্ডার করার নিয়ম",
            items: [
              "আপনার Free Fire <b>Player UID</b> দিয়ে যাচাই করুন।",
              "যে পরিমাণ Unipin Voucher প্রয়োজন সেটি সিলেক্ট করুন।",
              "Payment Method বেছে নিয়ে <b>Confirm</b> বাটনে ক্লিক করুন।",
              "অর্ডার Complete হলে My Codes সেকশন থেকে আপনার <b>Voucher Code</b> পাবেন।",
            ],
          },
          {
            title: "Voucher Code দিয়ে Top-up করার নিয়ম",
            items: [
              "প্রথমে <a href=\"https://shop.garena.my\" target=\"_blank\" rel=\"noreferrer\" class=\"text-primary underline font-semibold\">https://shop.garena.my</a> ওয়েবসাইটে যান।",
              "আপনার <b>Free Fire UID</b> ব্যবহার করে লগইন করুন।",
              "লগইনের পর দুটি অপশন দেখতে পাবেন — <b>Purchase</b> এবং <b>Redeem Code</b>।",
              "<b>Redeem Code</b> অপশন সিলেক্ট করে <b>Proceed to Payment</b> এ ক্লিক করুন।",
              "যে পরিমাণ Diamond টপ-আপ করতে চান, সেই পরিমাণ সিলেক্ট করুন।",
              "Payment Method এ <b>Unipin Voucher</b> সিলেক্ট করে আপনার Voucher Code টি বসিয়ে কনফার্ম করুন।",
              "কয়েক সেকেন্ডের মধ্যে Diamond আপনার ID তে যুক্ত হয়ে যাবে।",
            ],
          },
          {
            title: "গুরুত্বপূর্ণ নোটিশ",
            items: [
              "Voucher Code কারো সাথে <b>শেয়ার করবেন না</b> — একবার ব্যবহার হয়ে গেলে রিফান্ড সম্ভব নয়।",
              "Code Redeem এ সমস্যা হলে সাথে সাথে সাপোর্টে মেসেজ দিন।",
            ],
          },
        ],
      };

    case "membership":
    case "weeklylite":
      return {
        intro: "Free Fire Membership কেনার আগে আপনার UID ভালোভাবে যাচাই করে নিন।",
        delivery: "১০ সেকেন্ড – ২ মিনিট",
        sections: [
          {
            title: "অর্ডার করার নিয়ম",
            items: [
              "আপনার <b>Player UID</b> দিয়ে \"Check Player Name\" এ ক্লিক করুন।",
              "Player Name সঠিক দেখালে Membership প্যাকেজ সিলেক্ট করুন।",
              "Payment Method বেছে নিয়ে <b>Confirm</b> বাটনে ক্লিক করুন।",
              "Membership Active হওয়ার সাথে সাথে in-game notification পাবেন।",
            ],
          },
          {
            title: "গুরুত্বপূর্ণ নোটিশ",
            items: [
              "শুধুমাত্র <b>Bangladesh Server</b> এর জন্য কার্যকর।",
              "<b>Guest ID</b> তে Membership কাজ করবে না।",
              "ভুল UID দিয়ে অর্ডার করলে দায়ভার গ্রাহকের।",
            ],
          },
        ],
      };

    default:
      // diamond + fallback
      return {
        intro: "শুধুমাত্র Bangladesh Server এর Free Fire ID তে ডায়মন্ড টপ-আপ হবে। অর্ডার করার আগে UID যাচাই করুন।",
        delivery: "১০ সেকেন্ডের মধ্যে",
        sections: [
          {
            title: "অর্ডার করার নিয়ম",
            items: [
              "আপনার <b>Free Fire UID</b> দিয়ে \"Check Player Name\" এ ক্লিক করে যাচাই করুন।",
              "Player Name সঠিক দেখালে পছন্দের ডায়মন্ড প্যাকেজ সিলেক্ট করুন।",
              "Payment Method বেছে নিয়ে <b>Confirm</b> বাটনে ক্লিক করুন।",
              "১০ সেকেন্ডের মধ্যে ডায়মন্ড আপনার ID তে যুক্ত হয়ে যাবে।",
            ],
          },
          {
            title: "গুরুত্বপূর্ণ নোটিশ",
            items: [
              "শুধুমাত্র <b>Bangladesh Server</b> এ ID Code দিয়ে টপ-আপ হবে।",
              "Order Complete হওয়ার পরেও ডায়মন্ড না গেলে সাপোর্টে মেসেজ দিন।",
              "ভুল <b>Player ID Code</b> দিয়ে Diamond না পেলে <b>TOP-UP EXPRESS</b> দায়ী নয়।",
              "অর্ডার Cancel হলে কারণ My Orders এ দেখানো হবে — সঠিক তথ্য দিয়ে পুনরায় অর্ডার করুন।",
            ],
          },
        ],
      };
  }
}

function OrderHelpLink() {
  const { data: url } = useQuery({
    queryKey: ["site_content", "order_tutorial_video_url"],
    queryFn: () => getSiteValue({ data: { key: "order_tutorial_video_url" } }) as Promise<string | null>,
    staleTime: 1000 * 60 * 5,
  });
  const href = typeof url === "string" && url.trim() ? url.trim() : null;
  const cls = "flex items-center gap-1 text-[11px] font-semibold underline underline-offset-4 decoration-primary";
  const inner = (<><HelpCircle className="h-3.5 w-3.5 text-primary" />কিভাবে অর্ডার করবেন ?</>);
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>;
  return <a href="#help" className={cls}>{inner}</a>;
}



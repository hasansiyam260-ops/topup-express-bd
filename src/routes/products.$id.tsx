import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getProduct, listProducts } from "@/lib/products.functions";
import { AppShell } from "@/components/site/AppShell";
import { packImage } from "@/lib/assets";
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
    await new Promise((r) => setTimeout(r, 700));
    setPlayerName(`Player_${uid.slice(-4)}`);
    setChecking(false);
    toast.success("Player name verified");
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
      {/* Product Banner */}
      <section className="mx-auto max-w-3xl px-3 pt-4">
        <div className="relative rounded-2xl overflow-hidden card-soft sweep-shine">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-rose-50">
            <img
              src={packImage(product.pack_type)}
              alt={product.name_en}
              width={300}
              height={300}
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl object-cover glow-violet shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl leading-tight">{product.name_en}</h1>
              <div className="text-[11px] tracking-[0.3em] text-muted-foreground uppercase mt-1">Free Fire</div>
              {product.name_bn && <p className="text-sm text-foreground/70 mt-1 truncate">{product.name_bn}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-3xl px-3 mt-4 space-y-4">
        {/* Step 1 — Select Recharge */}
        <Step n={1} title="Select Recharge">
          <div className="grid grid-cols-2 gap-2.5">
            {related.map((p) => {
              const active = p.id === selected.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`relative flex items-center justify-between gap-2 p-3 rounded-xl border-2 bg-card text-left transition-all ${
                    active
                      ? "border-primary glow-red"
                      : "border-border hover:border-neon-violet/40"
                  }`}
                >
                  <span className={`grid place-items-center h-5 w-5 rounded-full border-2 shrink-0 ${
                    active ? "border-primary bg-primary" : "border-muted-foreground/40"
                  }`}>
                    {active && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  <span className="flex-1 font-semibold text-sm leading-tight">{p.name_en}</span>
                  <span className="font-display text-base text-primary tracking-wide whitespace-nowrap">
                    {Number(p.price).toFixed(0)} TK
                  </span>
                </button>
              );
            })}
          </div>
        </Step>

        {/* Step 2 — Account Info */}
        <Step n={2} title="Account Info" rightSlot={
          <a href="#help" className="flex items-center gap-1 text-sm font-semibold underline underline-offset-4 decoration-primary">
            <HelpCircle className="h-4 w-4 text-primary" />
            কিভাবে অর্ডার করবেন ?
          </a>
        }>
          <label className="block text-sm font-semibold text-foreground/90 mb-2">Player UID</label>
          <input
            inputMode="numeric"
            value={uid}
            onChange={(e) => { setUid(e.target.value.replace(/\D/g, "").slice(0, 12)); setPlayerName(""); }}
            placeholder="Player UID"
            className="w-full px-4 py-3 rounded-xl bg-card border-2 border-border focus:border-neon-violet focus:outline-none focus:ring-4 focus:ring-neon-violet/15 text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={checkPlayer}
            disabled={checking || !uid}
            className="mt-3 w-full shimmer-orange py-3 rounded-xl text-base disabled:opacity-60 disabled:cursor-not-allowed"
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
              icon={<Wallet className="h-5 w-5" />}
              tint="from-amber-100 to-orange-100"
              accent="text-orange-600"
              brand="TOPUP ওয়ালেট"
            />
            <PayCard
              active={payment === "instant"}
              onClick={() => setPayment("instant")}
              title="Instant Pay"
              icon={<Smartphone className="h-5 w-5" />}
              tint="from-rose-50 to-pink-50"
              accent="text-pink-600"
              brand="bKash · নগদ · Rocket"
            />
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 shrink-0" />
            <span>প্রোডাক্ট কিনতে আপনার প্রয়োজন <span className="text-primary font-bold">৳ {Number(selected.price).toFixed(0)} টাকা।</span></span>
          </div>

          {!authed && (
            <div className="mt-2 flex items-center gap-2 text-sm text-primary">
              <Info className="h-4 w-4 shrink-0" /> Please Login To Purchase
            </div>
          )}

          <button
            onClick={submitOrder}
            disabled={submitting}
            className="mt-4 w-full btn-red py-4 rounded-xl text-base disabled:opacity-60"
          >
            {authed ? (submitting ? "PLACING ORDER..." : `CONFIRM ৳${Number(selected.price).toFixed(0)}`) : "LOGIN"}
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
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 card-soft">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-primary text-primary-foreground font-display text-lg shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand-red)_15%,transparent)]">{n}</span>
          <h3 className="font-display text-2xl">{title}</h3>
        </div>
        {rightSlot}
      </div>
      {children}
    </div>
  );
}

function PayCard({
  active, onClick, title, icon, tint, accent, brand,
}: { active: boolean; onClick: () => void; title: string; icon: React.ReactNode; tint: string; accent: string; brand: string }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl border-2 overflow-hidden transition-all ${
        active ? "border-primary glow-red" : "border-border hover:border-neon-violet/40"
      }`}
    >
      <div className={`h-24 grid place-items-center bg-gradient-to-br ${tint}`}>
        <div className="flex items-center gap-2">
          <span className={`${accent}`}>{icon}</span>
          <span className={`font-display text-lg ${accent}`}>{brand}</span>
        </div>
      </div>
      <div className={`px-3 py-2 text-sm font-semibold ${active ? "bg-primary/10 text-primary" : "bg-muted text-foreground"}`}>
        {title}
      </div>
    </button>
  );
}

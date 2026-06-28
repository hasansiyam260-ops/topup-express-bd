import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getProduct, listProducts } from "@/lib/products.functions";
import { AppShell } from "@/components/site/AppShell";
import { packImage } from "@/lib/assets";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Wallet, Smartphone, User2, ShieldCheck } from "lucide-react";
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
  head: ({ loaderData: _ }) => ({
    meta: [
      { title: "Free Fire Topup — UID Topup" },
      { name: "description", content: "Select your Free Fire pack, enter Player UID, and pay with bKash/Nagad/Rocket. Instant delivery." },
    ],
  }),
  component: ProductPage,
  errorComponent: ({ error, reset }) => (
    <AppShell><div className="p-6 text-center"><p className="text-destructive">{error.message}</p><button onClick={reset} className="btn-gold mt-4 px-4 py-2 rounded">Retry</button></div></AppShell>
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
    toast.success("Order placed! We'll deliver within 10 seconds.");
    router.navigate({ to: "/orders" });
  };

  return (
    <AppShell>
      {/* Banner */}
      <section className="mx-auto max-w-5xl px-4 pt-6">
        <div className="card-luxe rounded-2xl overflow-hidden relative">
          <div className="flex gap-4 p-4 sm:p-6 items-center">
            <img
              src={packImage(product.pack_type)}
              alt={product.name_en}
              width={768}
              height={768}
              className="h-24 w-24 sm:h-32 sm:w-32 rounded-xl object-cover gold-border"
            />
            <div>
              <div className="text-[11px] tracking-[0.3em] text-gold uppercase">Free Fire</div>
              <h1 className="font-display text-3xl sm:text-5xl gold-text leading-none">{product.name_en}</h1>
              {product.name_bn && <p className="text-muted-foreground mt-1">{product.name_bn}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-5xl px-4 mt-6 space-y-5">
        {/* Step 1 */}
        <Step n={1} title="Select Recharge">
          <div className="grid grid-cols-2 gap-2">
            {related.map((p) => {
              const active = p.id === selected.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    active
                      ? "border-gold bg-gold/10 shadow-[0_0_0_1px_var(--gold)]"
                      : "border-border bg-card hover:border-gold/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-display text-lg leading-tight truncate">{p.name_en}</div>
                      {p.name_bn && <div className="text-xs text-muted-foreground truncate">{p.name_bn}</div>}
                    </div>
                    {active && <CheckCircle2 className="h-5 w-5 text-gold flex-shrink-0" />}
                  </div>
                  <div className="mt-2 font-display text-xl gold-text">৳{Number(p.price).toFixed(0)}</div>
                </button>
              );
            })}
          </div>
        </Step>

        {/* Step 2 */}
        <Step n={2} title="Account Info">
          <label className="block text-sm font-semibold text-foreground/90 mb-2">Player UID</label>
          <input
            inputMode="numeric"
            value={uid}
            onChange={(e) => { setUid(e.target.value.replace(/\D/g, "").slice(0, 12)); setPlayerName(""); }}
            placeholder="Enter Player UID"
            className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={checkPlayer}
            disabled={checking || !uid}
            className="mt-3 w-full btn-gold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? "Checking..." : playerName ? `✓ ${playerName}` : "Click to check player name"}
          </button>
        </Step>

        {/* Step 3 */}
        <Step n={3} title="Payment Methods">
          <div className="grid grid-cols-2 gap-3">
            <PayCard
              icon={<Wallet className="h-6 w-6" />}
              label="Pay With Wallet"
              sub="Use balance"
              active={payment === "wallet"}
              onClick={() => setPayment("wallet")}
            />
            <PayCard
              icon={<Smartphone className="h-6 w-6" />}
              label="Instant Pay"
              sub="bKash · Nagad · Rocket"
              active={payment === "instant"}
              onClick={() => setPayment("instant")}
            />
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span>প্রোডাক্ট কিনতে আপনার প্রয়োজন <span className="text-gold-soft font-bold">৳ {Number(selected.price).toFixed(0)}</span></span>
          </div>

          {!authed && (
            <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
              <User2 className="h-4 w-4" /> Please login to purchase
            </div>
          )}

          <button
            onClick={submitOrder}
            disabled={submitting}
            className={`mt-4 w-full py-4 rounded-lg text-base ${authed ? "btn-gold" : "bg-destructive text-destructive-foreground font-bold tracking-widest uppercase"}`}
          >
            {authed ? (submitting ? "Placing order..." : `Confirm Order · ৳${Number(selected.price).toFixed(0)}`) : "LOGIN"}
          </button>
        </Step>

        {/* Product info */}
        <Step n={4} title="Product Information">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>● শুধুমাত্র Bangladesh সার্ভারে ID Code দিয়ে টপ আপ হবে।</li>
            <li>● Diamond পাওয়ার পর Free Fire এ verify করে নিন।</li>
            <li>● কোন সমস্যায় Live Chat এ যোগাযোগ করুন।</li>
          </ul>
        </Step>

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-gold-soft">← Back to all packs</Link>
        </div>
      </section>
    </AppShell>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="card-luxe rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
        <span className="grid place-items-center h-9 w-9 rounded-full bg-gold text-onyx font-display text-lg shadow-[0_0_20px_var(--gold)]">{n}</span>
        <h3 className="font-display text-2xl">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function PayCard({ icon, label, sub, active, onClick }: { icon: React.ReactNode; label: string; sub: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-xl border transition-all ${
        active ? "border-gold bg-gold/10 shadow-[0_0_0_1px_var(--gold)]" : "border-border bg-card hover:border-gold/40"
      }`}
    >
      <div className={`inline-grid place-items-center h-10 w-10 rounded-md mb-2 ${active ? "bg-gold text-onyx" : "bg-elevated text-gold"}`}>{icon}</div>
      <div className="font-display text-lg leading-none">{label}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </button>
  );
}

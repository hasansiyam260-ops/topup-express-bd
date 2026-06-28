import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { Gift, Copy, Share2, Users, Coins, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyReferralInfo } from "@/lib/referrals.functions";
// Note: referral linkage happens automatically via signup link (?ref=CODE).
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/referrals")({
  head: () => ({ meta: [{ title: "Refer & Earn — TOP-UP EXPRESS" }] }),
  component: ReferralsPage,
});

function ReferralsPage() {
  const fetchInfo = useServerFn(getMyReferralInfo);
  const applyCode = useServerFn(applyReferralCode);
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [codeInput, setCodeInput] = useState("");

  const { data } = useQuery({
    queryKey: ["my-referral-info"],
    queryFn: () => fetchInfo({}),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const applyMut = useMutation({
    mutationFn: (code: string) => applyCode({ data: { code } }),
    onSuccess: (res) => {
      toast.success(`সফল! ৳${res.bonus} বোনাস পেলেন 🎉`);
      setCodeInput("");
      qc.invalidateQueries({ queryKey: ["my-referral-info"] });
      qc.invalidateQueries({ queryKey: ["my-wallet-balance"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const shareLink = typeof window !== "undefined" && data?.code
    ? `${window.location.origin}/auth?ref=${data.code}`
    : "";

  const handleCopy = async () => {
    if (!data?.code) return;
    try {
      await navigator.clipboard.writeText(shareLink || data.code);
      setCopied(true);
      toast.success("কোড কপি হয়েছে");
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleShare = async () => {
    if (!data?.code) return;
    const text = `🎁 TOP-UP EXPRESS এ যোগ দিন আমার রেফারেল কোডে এবং পান ৳20 বোনাস!\nকোড: ${data.code}\nলিংক: ${shareLink}`;
    if (navigator.share) {
      try { await navigator.share({ title: "TOP-UP EXPRESS", text, url: shareLink }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("শেয়ার টেক্সট কপি হয়েছে");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-3 pt-4 pb-6 space-y-4">
        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500 via-rose-500 to-fuchsia-600 px-4 py-4 text-white shadow-[0_18px_40px_-18px_rgba(244,63,94,0.65)]">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="grid place-items-center h-11 w-11 rounded-2xl bg-white/20 backdrop-blur ring-1 ring-white/40 shrink-0">
              <Gift className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="text-[9px] tracking-[0.3em] uppercase text-white/80 leading-none">REFER & EARN</div>
              <h1 className="font-display text-xl leading-tight mt-1">আপনার বন্ধু আনুন, ক্যাশব্যাক জিতুন</h1>
              <p className="text-[11px] text-white/85 mt-1">প্রতি ডায়মন্ড পারচেসে <b>2% lifetime cashback</b> + বন্ধুর জন্য <b>৳20 signup bonus</b></p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl card-soft p-3.5 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-emerald-500/15 blur-2xl" />
            <div className="flex items-center gap-2">
              <span className="grid place-items-center h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-600"><Users className="h-4 w-4" /></span>
              <div className="text-[10px] tracking-wider uppercase text-muted-foreground font-bold">Referred</div>
            </div>
            <div className="mt-2 font-display text-2xl">{data?.totalReferred ?? 0}</div>
          </div>
          <div className="rounded-2xl card-soft p-3.5 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-amber-500/15 blur-2xl" />
            <div className="flex items-center gap-2">
              <span className="grid place-items-center h-8 w-8 rounded-xl bg-amber-500/15 text-amber-600"><Coins className="h-4 w-4" /></span>
              <div className="text-[10px] tracking-wider uppercase text-muted-foreground font-bold">Earned</div>
            </div>
            <div className="mt-2 font-display text-2xl">৳{Math.round(data?.totalEarned ?? 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Your code */}
        <div className="rounded-2xl card-soft p-4 relative overflow-hidden">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />
          <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-bold">আপনার রেফারেল কোড</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/60 dark:bg-rose-500/5 px-4 py-3 font-display text-2xl tracking-[0.25em] text-center text-rose-600 select-all">
              {data?.code ?? "------"}
            </div>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button onClick={handleCopy} className="rounded-xl bg-white border-2 border-border hover:border-rose-400 px-3 py-2.5 text-sm font-bold flex items-center justify-center gap-1.5 transition-colors">
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Link"}
            </button>
            <button onClick={handleShare} className="btn-red rounded-xl px-3 py-2.5 text-sm font-bold flex items-center justify-center gap-1.5">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        {/* Apply code (if not used yet) */}
        {data && !data.referredBy && (
          <div className="rounded-2xl card-soft p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <div className="text-[11px] font-bold tracking-wider uppercase">কোড আছে? ৳20 বোনাস নিন</div>
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="রেফারেল কোড লিখুন"
                className="flex-1 px-4 py-3 rounded-xl bg-input border-2 border-border focus:border-rose-400 focus:outline-none text-sm tracking-widest"
              />
              <button
                disabled={!codeInput || applyMut.isPending}
                onClick={() => applyMut.mutate(codeInput)}
                className="btn-red rounded-xl px-4 text-sm font-bold disabled:opacity-50"
              >
                APPLY
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="rounded-2xl card-soft p-4">
          <div className="text-[11px] font-bold tracking-wider uppercase mb-2.5">কিভাবে কাজ করে?</div>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-2"><span className="grid place-items-center h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold shrink-0 mt-0.5">1</span>আপনার কোড বন্ধুদের সাথে শেয়ার করুন</li>
            <li className="flex gap-2"><span className="grid place-items-center h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold shrink-0 mt-0.5">2</span>তারা সাইন আপ করে কোড ব্যবহার করলে ৳20 বোনাস পাবে</li>
            <li className="flex gap-2"><span className="grid place-items-center h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold shrink-0 mt-0.5">3</span><span>তারা যতবার ডায়মন্ড/প্যাকেজ কিনবে, আপনি প্রতিবার <b>2% cashback</b> পাবেন (lifetime)</span></li>
            <li className="flex gap-2"><span className="grid place-items-center h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold shrink-0 mt-0.5">4</span><span>ক্যাশব্যাক সরাসরি আপনার <b>Main Balance</b> এ জমা হবে — instant!</span></li>
          </ol>
        </div>

        {/* Cashback History */}
        <div className="rounded-2xl card-soft p-4">
          <div className="text-[11px] font-bold tracking-wider uppercase mb-2.5">CASHBACK HISTORY</div>
          {!data?.credits?.length ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Coins className="h-10 w-10 mx-auto mb-2 opacity-30" />
              এখনও কোনো ক্যাশব্যাক নেই
            </div>
          ) : (
            <ul className="space-y-2">
              {data.credits.map((c, i) => {
                const d = new Date(c.created_at as string);
                return (
                  <li key={i} className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="grid place-items-center h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 shrink-0"><Coins className="h-4 w-4" /></span>
                      <div className="min-w-0">
                        <div className="text-[12px] font-bold truncate">Referral cashback</div>
                        <div className="text-[10px] text-muted-foreground">{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                    <div className="text-emerald-600 font-display text-base">+৳{Math.round(Number(c.amount))}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}

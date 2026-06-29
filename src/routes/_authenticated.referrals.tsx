import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { Gift, Copy, Share2, Users, Coins, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyReferralInfo } from "@/lib/referrals.functions";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/referrals")({
  head: () => ({ meta: [{ title: "Refer & Earn — TOP-UP EXPRESS" }] }),
  component: ReferralsPage,
});

function ReferralsPage() {
  const fetchInfo = useServerFn(getMyReferralInfo);
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({
    queryKey: ["my-referral-info"],
    queryFn: () => fetchInfo({}),
    staleTime: 15_000,
    refetchInterval: 30_000,
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
    const text = `🎁 TOP-UP EXPRESS এ যোগ দিন আমার রেফারেল কোডে এবং পান ৳${data?.config?.firstPurchaseBonus ?? 20} বোনাস!\nকোড: ${data.code}\nলিংক: ${shareLink}`;
    if (navigator.share) {
      try { await navigator.share({ title: "TOP-UP EXPRESS", text, url: shareLink }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("শেয়ার টেক্সট কপি হয়েছে");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-3 pt-3 pb-5 space-y-2.5">
        {/* Hero */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-amber-500 via-rose-500 to-fuchsia-600 px-3 py-3 text-white shadow-[0_12px_28px_-14px_rgba(244,63,94,0.6)]">
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-2.5">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-white/20 backdrop-blur ring-1 ring-white/40 shrink-0">
              <Gift className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-[8px] tracking-[0.28em] uppercase text-white/80 leading-none">REFER & EARN</div>
              <h1 className="font-display text-[15px] leading-tight mt-1">আপনার বন্ধু আনুন, ক্যাশব্যাক জিতুন</h1>
              <p className="text-[10px] text-white/85 mt-1 leading-snug">বন্ধুর <b>প্রথম পারচেস</b>-এ পান ৳{data?.config?.firstPurchaseBonus ?? 20} বোনাস + প্রতিবার <b>{data?.config?.cashbackRate ?? 2}% lifetime cashback</b> সরাসরি Main Balance এ</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl card-soft p-2.5 relative overflow-hidden">
            <div className="absolute -top-5 -right-5 h-12 w-12 rounded-full bg-emerald-500/15 blur-2xl" />
            <div className="flex items-center gap-1.5">
              <span className="grid place-items-center h-6 w-6 rounded-lg bg-emerald-500/15 text-emerald-600"><Users className="h-3 w-3" /></span>
              <div className="text-[9px] tracking-wider uppercase text-muted-foreground font-bold">Referred</div>
            </div>
            <div className="mt-1 font-display text-lg">{data?.totalReferred ?? 0}</div>
          </div>
          <div className="rounded-xl card-soft p-2.5 relative overflow-hidden">
            <div className="absolute -top-5 -right-5 h-12 w-12 rounded-full bg-amber-500/15 blur-2xl" />
            <div className="flex items-center gap-1.5">
              <span className="grid place-items-center h-6 w-6 rounded-lg bg-amber-500/15 text-amber-600"><Coins className="h-3 w-3" /></span>
              <div className="text-[9px] tracking-wider uppercase text-muted-foreground font-bold">Earned</div>
            </div>
            <div className="mt-1 font-display text-lg">৳{Math.round(data?.totalEarned ?? 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Your code */}
        <div className="rounded-xl card-soft p-3 relative overflow-hidden">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />
          <div className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground font-bold">আপনার রেফারেল কোড</div>
          <div className="mt-1.5 rounded-lg border-2 border-dashed border-rose-300 bg-rose-50/60 dark:bg-rose-500/5 px-3 py-2 font-display text-lg tracking-[0.22em] text-center text-rose-600 select-all">
            {data?.code ?? "------"}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={handleCopy} className="rounded-lg bg-white border-2 border-border hover:border-rose-400 px-2.5 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Link"}
            </button>
            <button onClick={handleShare} className="btn-red rounded-lg px-2.5 py-2 text-xs font-bold flex items-center justify-center gap-1.5">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-xl card-soft p-3">
          <div className="text-[10px] font-bold tracking-wider uppercase mb-2">কিভাবে কাজ করে?</div>
          <ol className="space-y-1.5 text-[12px] leading-snug">
            <li className="flex gap-1.5"><span className="grid place-items-center h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold shrink-0 mt-0.5">1</span>আপনার রেফারেল লিংক বন্ধুদের সাথে শেয়ার করুন</li>
            <li className="flex gap-1.5"><span className="grid place-items-center h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold shrink-0 mt-0.5">2</span>তারা আপনার লিংক থেকে সাইন আপ করলে অটোমেটিক কানেক্ট হবে</li>
            <li className="flex gap-1.5"><span className="grid place-items-center h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold shrink-0 mt-0.5">3</span><span>বন্ধু প্রথমবার কিনলেই পাবেন <b>৳{data?.config?.firstPurchaseBonus ?? 20} বোনাস</b></span></li>
            <li className="flex gap-1.5"><span className="grid place-items-center h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold shrink-0 mt-0.5">4</span><span>এরপর প্রতিবার <b>{data?.config?.cashbackRate ?? 2}% lifetime cashback</b> পাবেন</span></li>
            <li className="flex gap-1.5"><span className="grid place-items-center h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold shrink-0 mt-0.5">5</span><span>সব রিওয়ার্ড সরাসরি <b>Main Balance</b> এ instant জমা হবে</span></li>
          </ol>
        </div>

        {/* Cashback History */}
        <div className="rounded-xl card-soft p-3">
          <div className="text-[10px] font-bold tracking-wider uppercase mb-2">CASHBACK HISTORY</div>
          {!data?.credits?.length ? (
            <div className="text-center py-4 text-muted-foreground text-xs">
              <Coins className="h-8 w-8 mx-auto mb-1.5 opacity-30" />
              এখনও কোনো ক্যাশব্যাক নেই
            </div>
          ) : (
            <ul className="space-y-1.5">
              {data.credits.map((c, i) => {
                const d = new Date(c.created_at as string);
                return (
                  <li key={i} className="flex items-center justify-between rounded-lg border border-border/70 bg-card px-2.5 py-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="grid place-items-center h-6 w-6 rounded-md bg-emerald-500/15 text-emerald-600 shrink-0"><Coins className="h-3 w-3" /></span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold truncate">Referral cashback</div>
                        <div className="text-[9px] text-muted-foreground">{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                    <div className="text-emerald-600 font-display text-sm">+৳{Math.round(Number(c.amount))}</div>
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

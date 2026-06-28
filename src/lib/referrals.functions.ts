import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CASHBACK_RATE = 0.02; // 2% lifetime cashback to referrer on every purchase
const FIRST_PURCHASE_BONUS = 20; // 20 BDT one-time bonus to referrer on referee's first purchase

export const getMyReferralInfo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code, referred_by, referral_earnings")
      .eq("id", userId)
      .maybeSingle();

    const { data: refereeProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("referred_by", userId);

    const { data: credits } = await supabase
      .from("referral_credits")
      .select("amount, source, created_at, referee_id")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    return {
      code: profile?.referral_code ?? null,
      referredBy: profile?.referred_by ?? null,
      totalEarned: Number(profile?.referral_earnings ?? 0),
      totalReferred: refereeProfiles?.length ?? 0,
      referees: refereeProfiles ?? [],
      credits: credits ?? [],
    };
  });

export const creditReferralForPurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { amount: number }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.amount || data.amount <= 0) return { credited: 0, bonus: 0 };

    const { data: me } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", userId)
      .maybeSingle();

    if (!me?.referred_by) return { credited: 0, bonus: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Check if this is the referee's first purchase credit
    const { data: prior } = await supabaseAdmin
      .from("referral_credits")
      .select("id")
      .eq("referee_id", userId)
      .eq("referrer_id", me.referred_by)
      .limit(1);

    const isFirstPurchase = !prior || prior.length === 0;
    const cashback = Math.round(data.amount * CASHBACK_RATE);
    const bonus = isFirstPurchase ? FIRST_PURCHASE_BONUS : 0;
    const total = cashback + bonus;
    if (total <= 0) return { credited: 0, bonus: 0 };

    const { data: refProfile } = await supabaseAdmin
      .from("profiles")
      .select("balance, referral_earnings")
      .eq("id", me.referred_by)
      .maybeSingle();

    await supabaseAdmin.from("profiles").update({
      balance: Number(refProfile?.balance ?? 0) + total,
      referral_earnings: Number(refProfile?.referral_earnings ?? 0) + total,
    }).eq("id", me.referred_by);

    const rows = [] as Array<{ referrer_id: string; referee_id: string; amount: number; source: string }>;
    if (cashback > 0) rows.push({ referrer_id: me.referred_by, referee_id: userId, amount: cashback, source: "purchase" });
    if (bonus > 0) rows.push({ referrer_id: me.referred_by, referee_id: userId, amount: bonus, source: "first_purchase_bonus" });
    if (rows.length) await supabaseAdmin.from("referral_credits").insert(rows);

    return { credited: cashback, bonus };
  });


import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DEFAULT_CASHBACK_RATE = 2; // percent
const DEFAULT_FIRST_PURCHASE_BONUS = 20; // BDT

async function loadConfig(supabase: any) {
  const { data } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", "referral_config")
    .maybeSingle();
  const v = (data?.value ?? {}) as any;
  return {
    cashbackRate: Number(v?.cashback_rate ?? DEFAULT_CASHBACK_RATE),
    firstPurchaseBonus: Number(v?.first_purchase_bonus ?? DEFAULT_FIRST_PURCHASE_BONUS),
    enabled: v?.enabled !== false,
  };
}

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

    const config = await loadConfig(supabase);

    return {
      code: profile?.referral_code ?? null,
      referredBy: profile?.referred_by ?? null,
      totalEarned: Number(profile?.referral_earnings ?? 0),
      totalReferred: refereeProfiles?.length ?? 0,
      referees: refereeProfiles ?? [],
      credits: credits ?? [],
      config,
    };
  });

export const creditReferralForPurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { amount: number }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.amount || data.amount <= 0) return { credited: 0, bonus: 0 };

    const cfg = await loadConfig(supabase);
    if (!cfg.enabled) return { credited: 0, bonus: 0 };

    const { data: me } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", userId)
      .maybeSingle();

    if (!me?.referred_by) return { credited: 0, bonus: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: prior } = await supabaseAdmin
      .from("referral_credits")
      .select("id")
      .eq("referee_id", userId)
      .eq("referrer_id", me.referred_by)
      .limit(1);

    const isFirstPurchase = !prior || prior.length === 0;
    const cashback = Math.round(data.amount * (cfg.cashbackRate / 100));
    const bonus = isFirstPurchase ? cfg.firstPurchaseBonus : 0;
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

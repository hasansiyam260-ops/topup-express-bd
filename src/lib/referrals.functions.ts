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

export const applyReferralCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { code: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const code = data.code.trim().toUpperCase();
    if (!code) throw new Error("Code required");

    const { data: me } = await supabase
      .from("profiles")
      .select("referred_by, referral_code, balance")
      .eq("id", userId)
      .maybeSingle();

    if (!me) throw new Error("Profile not found");
    if (me.referred_by) throw new Error("আপনি ইতিমধ্যে একটি রেফারেল কোড ব্যবহার করেছেন");
    if (me.referral_code === code) throw new Error("নিজের কোড ব্যবহার করা যাবে না");

    const { data: referrer } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();

    if (!referrer) throw new Error("ভুল রেফারেল কোড");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const newBalance = Number(me.balance ?? 0) + SIGNUP_BONUS;
    await supabaseAdmin
      .from("profiles")
      .update({ referred_by: referrer.id, balance: newBalance })
      .eq("id", userId);

    return { ok: true, bonus: SIGNUP_BONUS };
  });

export const creditReferralForPurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { amount: number }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.amount || data.amount <= 0) return { credited: 0 };

    const { data: me } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", userId)
      .maybeSingle();

    if (!me?.referred_by) return { credited: 0 };

    const credit = Math.round(data.amount * CASHBACK_RATE);
    if (credit <= 0) return { credited: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: refProfile } = await supabaseAdmin
      .from("profiles")
      .select("balance, referral_earnings")
      .eq("id", me.referred_by)
      .maybeSingle();

    await supabaseAdmin.from("profiles").update({
      balance: Number(refProfile?.balance ?? 0) + credit,
      referral_earnings: Number(refProfile?.referral_earnings ?? 0) + credit,
    }).eq("id", me.referred_by);

    await supabaseAdmin.from("referral_credits").insert({
      referrer_id: me.referred_by,
      referee_id: userId,
      amount: credit,
      source: "purchase",
    });

    return { credited: credit };
  });

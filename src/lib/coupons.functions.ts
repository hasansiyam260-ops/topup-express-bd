import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const validateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { code: string; amount: number }) => d)
  .handler(async ({ data, context }) => {
    const code = (data.code || "").trim().toUpperCase();
    if (!code) throw new Error("Coupon code required");
    const amount = Number(data.amount) || 0;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: c, error } = await supabaseAdmin
      .from("coupons").select("*").eq("code", code).maybeSingle();
    if (error) throw new Error(error.message);
    if (!c) throw new Error("Invalid coupon code");
    if (!c.is_active) throw new Error("Coupon is disabled");
    if (c.expires_at && new Date(c.expires_at) < new Date()) throw new Error("Coupon expired");
    if (amount < Number(c.min_order ?? 0)) throw new Error(`Minimum order ৳${c.min_order} required`);
    if (c.usage_limit != null && c.used_count >= c.usage_limit) throw new Error("Coupon usage limit reached");
    if (c.per_user_limit != null) {
      const { count } = await supabaseAdmin
        .from("coupon_redemptions").select("id", { count: "exact", head: true })
        .eq("coupon_id", c.id).eq("user_id", context.userId);
      if ((count ?? 0) >= c.per_user_limit) throw new Error("You've already used this coupon");
    }
    let discount = c.discount_type === "percent"
      ? Math.round((amount * Number(c.discount_value)) / 100)
      : Math.round(Number(c.discount_value));
    if (c.max_discount != null) discount = Math.min(discount, Number(c.max_discount));
    discount = Math.max(0, Math.min(discount, amount));
    return { id: c.id, code: c.code, discount, finalAmount: amount - discount };
  });

export const redeemCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { couponId: string; amountOff: number; orderId?: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("coupon_redemptions").insert({
      coupon_id: data.couponId, user_id: context.userId,
      order_id: data.orderId ?? null, amount_off: data.amountOff,
    });
    const { data: c } = await supabaseAdmin.from("coupons").select("used_count").eq("id", data.couponId).maybeSingle();
    await supabaseAdmin.from("coupons").update({ used_count: Number(c?.used_count ?? 0) + 1 }).eq("id", data.couponId);
    return { ok: true };
  });

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export const adminListCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpsertCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { coupon: any }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const c = { ...data.coupon, code: String(data.coupon.code || "").trim().toUpperCase() };
    if (c.id) {
      const { error } = await supabaseAdmin.from("coupons").update(c).eq("id", c.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("coupons").insert(c);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

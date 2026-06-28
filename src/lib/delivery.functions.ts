import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { userId: string }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export const adminListProviders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("delivery_providers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpsertProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { provider: any }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const p = data.provider;
    if (p.id) {
      const { error } = await supabaseAdmin.from("delivery_providers").update(p).eq("id", p.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("delivery_providers").insert(p);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("delivery_providers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetAutoDeliveryConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", "auto_delivery_config")
      .maybeSingle();
    return (data?.value ?? { enabled: false, webhook_url: "", secret: "" }) as any;
  });

export const adminSaveAutoDeliveryConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { config: { enabled: boolean; webhook_url: string; secret: string } }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("site_content")
      .upsert({ key: "auto_delivery_config", value: data.config });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Manually retry delivery for a specific order
export const adminRetryDelivery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { order_id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders").select("*").eq("id", data.order_id).maybeSingle();
    if (error || !order) throw new Error(error?.message || "Order not found");
    const { data: product } = await supabaseAdmin
      .from("products").select("delivery_provider, provider_sku").eq("id", order.product_id ?? "").maybeSingle();
    const providerName = product?.delivery_provider || order.delivery_provider;
    if (!providerName) throw new Error("No provider mapped to this product");
    const { data: provider } = await supabaseAdmin
      .from("delivery_providers").select("*").eq("name", providerName).eq("is_enabled", true).maybeSingle();
    if (!provider) throw new Error("Provider not configured/enabled");
    const result = await dispatchToProvider(provider, { order, sku: product?.provider_sku });
    await supabaseAdmin.from("orders").update({
      delivery_provider: providerName,
      provider_order_id: result.provider_order_id,
      delivery_status: result.ok ? "delivered" : "failed",
      delivery_response: result.raw,
      delivered_at: result.ok ? new Date().toISOString() : null,
      status: result.ok ? "completed" : order.status,
    }).eq("id", order.id);
    return result;
  });

// Provider dispatcher (server-only)
export async function dispatchToProvider(provider: any, args: { order: any; sku?: string | null }) {
  const { type, api_url, credentials } = provider;
  const { order, sku } = args;
  try {
    if (type === "yokcash") {
      const url = api_url || "https://a-api.yokcash.com/api/order";
      const body = new URLSearchParams({
        api_key: credentials?.api_key ?? "",
        service_id: String(sku ?? ""),
        target: order.player_uid,
        quantity: "1",
      });
      const res = await fetch(url, { method: "POST", body });
      const raw = await res.json().catch(() => ({}));
      return { ok: res.ok && (raw?.status === true || raw?.status === "success"), provider_order_id: raw?.data?.id ?? null, raw };
    }
    if (type === "smileone") {
      const url = api_url || "https://www.smile.one/merchant/freefire";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: credentials?.uid, email: credentials?.email, product: "freefire",
          productid: sku, userid: order.player_uid, sign: credentials?.sign,
        }),
      });
      const raw = await res.json().catch(() => ({}));
      return { ok: res.ok && raw?.status === 200, provider_order_id: raw?.order_id ?? null, raw };
    }
    if (type === "moogold") {
      const url = api_url || "https://moogold.com/wp-json/v1/api/order/create";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${credentials?.api_key ?? ""}` },
        body: JSON.stringify({ product_id: sku, quantity: 1, user_id: order.player_uid, server_id: credentials?.server_id }),
      });
      const raw = await res.json().catch(() => ({}));
      return { ok: res.ok && raw?.success === true, provider_order_id: raw?.order_id ?? null, raw };
    }
    // custom: POST sku + uid + amount as JSON, expect { ok, order_id }
    const url = api_url;
    if (!url) throw new Error("Custom provider: api_url required");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (credentials?.api_key) headers["Authorization"] = `Bearer ${credentials.api_key}`;
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ sku, player_uid: order.player_uid, amount: order.amount, order_number: order.order_number }),
    });
    const raw = await res.json().catch(() => ({}));
    return { ok: res.ok && raw?.ok !== false, provider_order_id: raw?.order_id ?? null, raw };
  } catch (e: any) {
    return { ok: false, provider_order_id: null, raw: { error: e?.message ?? String(e) } };
  }
}

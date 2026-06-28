import { createFileRoute } from "@tanstack/react-router";
import { dispatchToProvider } from "@/lib/delivery.functions";

export const Route = createFileRoute("/api/public/hooks/auto-deliver")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Verify shared secret stored in site_content
        const provided = request.headers.get("x-delivery-secret") ?? "";
        const { data: cfgRow } = await supabaseAdmin
          .from("site_content").select("value").eq("key", "auto_delivery_config").maybeSingle();
        const cfg = (cfgRow?.value ?? {}) as any;
        if (!cfg?.enabled) return new Response("Disabled", { status: 200 });
        if (!cfg?.secret || provided !== cfg.secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const orderId = (body as any)?.order_id;
        if (!orderId) return new Response("Missing order_id", { status: 400 });

        const { data: order } = await supabaseAdmin
          .from("orders").select("*").eq("id", orderId).maybeSingle();
        if (!order) return new Response("Order not found", { status: 404 });

        const { data: product } = await supabaseAdmin
          .from("products").select("delivery_provider, provider_sku").eq("id", order.product_id ?? "").maybeSingle();
        const providerName = product?.delivery_provider;
        if (!providerName || !product?.provider_sku) {
          await supabaseAdmin.from("orders").update({ delivery_status: "skipped" }).eq("id", orderId);
          return Response.json({ ok: false, reason: "no_provider_mapped" });
        }

        const { data: provider } = await supabaseAdmin
          .from("delivery_providers")
          .select("*").eq("name", providerName).eq("is_enabled", true).maybeSingle();
        if (!provider) {
          await supabaseAdmin.from("orders").update({ delivery_status: "failed", delivery_response: { error: "provider_disabled_or_missing" } }).eq("id", orderId);
          return Response.json({ ok: false, reason: "provider_missing" });
        }

        await supabaseAdmin.from("orders").update({ delivery_status: "processing", delivery_provider: providerName }).eq("id", orderId);
        const result = await dispatchToProvider(provider, { order, sku: product.provider_sku });

        await supabaseAdmin.from("orders").update({
          provider_order_id: result.provider_order_id,
          delivery_status: result.ok ? "delivered" : "failed",
          delivery_response: result.raw,
          delivered_at: result.ok ? new Date().toISOString() : null,
          status: result.ok ? "completed" : order.status,
        }).eq("id", orderId);

        return Response.json({ ok: result.ok, provider_order_id: result.provider_order_id });
      },
    },
  },
});

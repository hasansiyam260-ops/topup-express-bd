import { createServerFn } from "@tanstack/react-start";

export const getSiteValue = createServerFn({ method: "GET" })
  .inputValidator((data: { key: string }) => ({ key: String(data.key) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", data.key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row?.value ?? null) as any;
  });

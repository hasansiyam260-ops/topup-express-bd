
-- Enable pg_net for trigger HTTP call
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Orders: delivery tracking
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_provider text,
  ADD COLUMN IF NOT EXISTS provider_order_id text,
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS delivery_response jsonb,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- Products: provider mapping
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS delivery_provider text,
  ADD COLUMN IF NOT EXISTS provider_sku text;

-- Providers table
CREATE TABLE IF NOT EXISTS public.delivery_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type text NOT NULL,                       -- yokcash | smileone | moogold | custom
  api_url text,
  credentials jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_providers TO authenticated;
GRANT ALL ON public.delivery_providers TO service_role;
ALTER TABLE public.delivery_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage delivery providers"
  ON public.delivery_providers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_delivery_providers_updated
  BEFORE UPDATE ON public.delivery_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Site-content store for auto-delivery webhook URL + secret config
-- (URL is stored in site_content so admins can update without redeploy)
INSERT INTO public.site_content (key, value)
VALUES ('auto_delivery_config', '{"webhook_url":"","enabled":false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Trigger: on new order insert, fire HTTP POST to auto-deliver hook
CREATE OR REPLACE FUNCTION public.trigger_auto_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg jsonb;
  hook_url text;
  secret text;
BEGIN
  SELECT value INTO cfg FROM public.site_content WHERE key = 'auto_delivery_config';
  IF cfg IS NULL OR COALESCE((cfg->>'enabled')::boolean, false) = false THEN
    RETURN NEW;
  END IF;
  hook_url := cfg->>'webhook_url';
  secret := cfg->>'secret';
  IF hook_url IS NULL OR length(hook_url) < 10 THEN
    RETURN NEW;
  END IF;
  PERFORM net.http_post(
    url := hook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-delivery-secret', COALESCE(secret, '')
    ),
    body := jsonb_build_object('order_id', NEW.id::text)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_auto_deliver ON public.orders;
CREATE TRIGGER trg_orders_auto_deliver
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auto_delivery();

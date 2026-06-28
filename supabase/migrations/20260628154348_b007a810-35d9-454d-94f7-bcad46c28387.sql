
-- 1. CATEGORIES TABLE
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name_en text NOT NULL,
  name_bn text,
  image_url text,
  banner_url text,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active categories" ON public.categories FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.categories (key, name_en, name_bn, sort_order) VALUES
  ('diamond', 'Diamonds', 'ডায়মন্ড', 1),
  ('membership', 'Membership', 'মেম্বারশিপ', 2),
  ('levelup', 'Level Up Pass', 'লেভেল আপ পাস', 3),
  ('weekly_lite', 'Weekly Lite', 'উইকলি লাইট', 4),
  ('likes', 'Free Fire Likes', 'ফ্রি ফায়ার লাইক', 5),
  ('unipin', 'UniPin Voucher', 'ইউনিপিন ভাউচার', 6);

-- 2. SITE CONTENT TABLE (key/value store)
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins manage site content" ON public.site_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_site_content_updated BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_content (key, value) VALUES
  ('hero_title', '"সবচেয়ে কম দামে ডায়মন্ড টপআপ"'::jsonb),
  ('hero_subtitle', '"১০ সেকেন্ডে ইনস্ট্যান্ট ডেলিভারি — TOP-UP EXPRESS"'::jsonb),
  ('announcement_text', '"🔥 ২৪/৭ ইনস্ট্যান্ট ডেলিভারি — bKash · Nagad · Rocket দিয়ে পেমেন্ট করুন"'::jsonb),
  ('welcome_notice_title', '"স্বাগতম TOP-UP EXPRESS এ"'::jsonb),
  ('welcome_notice_body', '"বাংলাদেশের #১ Free Fire টপআপ সার্ভিস। ১০ সেকেন্ডে ডেলিভারি গ্যারান্টিড।"'::jsonb),
  ('contact_whatsapp', '"+8801700000000"'::jsonb),
  ('contact_messenger', '"https://m.me/topupexpress"'::jsonb),
  ('contact_telegram', '"https://t.me/topupexpress"'::jsonb),
  ('contact_facebook', '"https://facebook.com/topupexpress"'::jsonb),
  ('contact_youtube', '"https://youtube.com/@topupexpress"'::jsonb),
  ('contact_email', '"support@topupexpress.com"'::jsonb),
  ('footer_text', '"© 2026 TOP-UP EXPRESS — All rights reserved. Made by Hridoy Ahmed."'::jsonb),
  ('faq_items', '[
    {"q":"টপআপ পেতে কত সময় লাগে?","a":"পেমেন্ট কনফার্ম হওয়ার সাথে সাথে ১০ সেকেন্ডে ডেলিভারি।"},
    {"q":"কোন পেমেন্ট মাধ্যম সাপোর্ট করে?","a":"bKash, Nagad, Rocket সব সাপোর্টেড।"},
    {"q":"UID ভুল হলে কী হবে?","a":"অর্ডার অটো ক্যান্সেল হবে এবং ওয়ালেট রিফান্ড হবে।"},
    {"q":"কাস্টমার সাপোর্ট কীভাবে পাবো?","a":"WhatsApp, Messenger বা Telegram এ ২৪/৭ আমাদের টিম এক্টিভ।"}
  ]'::jsonb),
  ('privacy_policy', '"আমরা আপনার ব্যক্তিগত তথ্য সংরক্ষণ এবং সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ। আপনার Game UID, payment information এবং transaction history শুধুমাত্র আপনার অর্ডার প্রসেস করার জন্য ব্যবহার করা হয়।"'::jsonb),
  ('terms_of_service', '"TOP-UP EXPRESS ব্যবহার করে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন। সব টপআপ ফাইনাল — ভুল UID দিলে রিফান্ড হবে না।"'::jsonb),
  ('live_chat_system_prompt', '"You are TOP-UP EXPRESS AI, the 24/7 support assistant for TOP-UP EXPRESS — Bangladesh''s #1 Free Fire diamond topup service. Only answer questions related to TOP-UP EXPRESS services: diamonds, memberships, level up pass, weekly lite, likes, unipin vouchers, payments (bKash/Nagad/Rocket), wallet, orders. Never mention other websites or brands. Reply concisely in Bangla or English depending on user language."'::jsonb);

-- 3. PAYMENT METHODS TABLE
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  number text NOT NULL,
  account_type text NOT NULL DEFAULT 'personal',
  instructions text,
  logo_url text,
  brand_color text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_methods TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active payment methods" ON public.payment_methods FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage payment methods" ON public.payment_methods FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_payment_methods_updated BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.payment_methods (name, number, account_type, instructions, brand_color, sort_order) VALUES
  ('bKash', '01700000000', 'personal', 'Send Money করুন এই নাম্বারে এবং TXID দিয়ে verify করুন।', '#E2136E', 1),
  ('Nagad', '01700000000', 'personal', 'Send Money করুন এই নাম্বারে এবং TXID দিয়ে verify করুন।', '#EE1C25', 2),
  ('Rocket', '01700000000-1', 'personal', 'Send Money করুন এই নাম্বারে এবং TXID দিয়ে verify করুন।', '#8B2A8E', 3);

-- 4. ALLOW ADMINS FULL READ/WRITE ON ORDERS, PROFILES, USER_ROLES
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

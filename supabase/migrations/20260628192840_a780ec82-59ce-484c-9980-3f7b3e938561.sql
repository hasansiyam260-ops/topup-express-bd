CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ref_code_input text;
  ref_user_id uuid;
BEGIN
  ref_code_input := upper(COALESCE(NEW.raw_user_meta_data->>'ref_code', ''));
  IF length(ref_code_input) > 0 THEN
    SELECT id INTO ref_user_id FROM public.profiles WHERE referral_code = ref_code_input LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, full_name, phone, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    public.generate_referral_code(),
    ref_user_id
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $function$;

UPDATE public.categories SET key='diamond',    name_en='Free Fire [BD SERVER]',       name_bn='আইডিবেইজড টপআপ',     sort_order=1, is_active=true WHERE key='diamond';
UPDATE public.categories SET key='membership', name_en='Free Fire Membership',         name_bn='উইকলি/মান্থলি কম্বো', sort_order=2, is_active=true WHERE key='membership';
UPDATE public.categories SET key='level_pass', name_en='Free Fire Level Up Pass BD',   name_bn='লেভেল আপ পাস',         sort_order=3, is_active=true WHERE key IN ('levelup','level_pass');
UPDATE public.categories SET key='weeklylite', name_en='Weekly Lite Membership',       name_bn='উইকলি লাইট',           sort_order=4, is_active=true WHERE key IN ('weekly_lite','weeklylite');
UPDATE public.categories SET key='like',       name_en='Free Fire Like',               name_bn='১০০ লাইক ডেইলি',       sort_order=5, is_active=true WHERE key IN ('likes','like');
UPDATE public.categories SET key='unipin',     name_en='Top Up for UniPin',            name_bn='ইউনিপিন টপআপ',         sort_order=6, is_active=true WHERE key='unipin';

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  // Branding
  site_name: string;
  site_tagline: string;
  site_logo_url: string;
  site_favicon_url: string;
  footer_text: string;
  // Hero
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  hero_enabled: boolean;
  // Announcement
  announcement_text: string;
  announcement_enabled: boolean;
  announcement_theme: "rose" | "emerald" | "amber" | "sky";
  // Social
  contact_telegram: string;
  contact_facebook: string;
  contact_youtube: string;
  contact_whatsapp: string;
  contact_messenger: string;
  contact_tiktok: string;
  contact_email: string;
  // AI Live Chat
  live_chat_enabled: boolean;
  live_chat_welcome: string;
  live_chat_system_prompt: string;
  live_chat_model: string;
  // Wallet
  wallet_min: number;
  wallet_max: number;
  wallet_presets: number[];
  wallet_manual_enabled: boolean;
  // Maintenance
  maintenance_enabled: boolean;
  maintenance_message: string;
  // SEO
  seo_title: string;
  seo_description: string;
  seo_og_image: string;
};

export const DEFAULTS: SiteSettings = {
  site_name: "TOP-UP EXPRESS",
  site_tagline: "কম দামে ভালো সার্ভিস",
  site_logo_url: "",
  site_favicon_url: "",
  footer_text: "© TOP-UP EXPRESS — Bangladesh's #1 Free Fire Topup",
  hero_title: "FREE FIRE DIAMOND TOPUP",
  hero_subtitle: "Instant 10 second delivery",
  hero_image_url: "",
  hero_enabled: true,
  announcement_text: "২৪ ঘন্টাই টপআপ চালু • ১০ সেকেন্ডে অটো ডেলিভারি।",
  announcement_enabled: true,
  announcement_theme: "rose",
  contact_telegram: "https://t.me/topupexpress",
  contact_facebook: "https://facebook.com/topupexpress",
  contact_youtube: "https://youtube.com/@topupexpress",
  contact_whatsapp: "https://wa.me/8801000000000",
  contact_messenger: "https://m.me/topupexpress",
  contact_tiktok: "",
  contact_email: "",
  live_chat_enabled: true,
  live_chat_welcome:
    "হ্যালো! 👋 আমি TOP-UP EXPRESS এর AI সাপোর্ট। যেকোনো প্রশ্ন করুন, instant উত্তর পাবেন।",
  live_chat_system_prompt: "",
  live_chat_model: "google/gemini-3-flash-preview",
  wallet_min: 10,
  wallet_max: 50000,
  wallet_presets: [100, 500, 1000, 2000, 5000],
  wallet_manual_enabled: true,
  maintenance_enabled: false,
  maintenance_message: "আমরা সাইট আপডেট করছি। কিছুক্ষণের মধ্যেই ফিরে আসব।",
  seo_title: "TOP-UP EXPRESS — Premium Free Fire Diamond Topup Bangladesh",
  seo_description:
    "Bangladesh er #1 Free Fire diamond topup service. Instant 10 second delivery.",
  seo_og_image: "",
};

function coerce(key: keyof SiteSettings, raw: any): any {
  const def: any = DEFAULTS[key];
  if (raw === undefined || raw === null) return def;
  if (typeof def === "boolean") {
    if (typeof raw === "boolean") return raw;
    if (typeof raw === "string") return raw === "true" || raw === "1";
    return def;
  }
  if (typeof def === "number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : def;
  }
  if (Array.isArray(def)) return Array.isArray(raw) ? raw : def;
  if (typeof def === "string") return typeof raw === "string" ? raw : String(raw ?? def);
  return raw ?? def;
}

export function useSiteSettings() {
  const q = useQuery({
    queryKey: ["site_content"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("key,value");
      const map = new Map<string, any>();
      (data ?? []).forEach((r: any) => map.set(r.key, r.value));
      const out = { ...DEFAULTS } as SiteSettings;
      (Object.keys(DEFAULTS) as Array<keyof SiteSettings>).forEach((k) => {
        if (map.has(k)) (out[k] as any) = coerce(k, map.get(k));
      });
      return out;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  return q.data ?? DEFAULTS;
}

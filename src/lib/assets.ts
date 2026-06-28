import diamond from "@/assets/pack-diamond.webp";
import membership from "@/assets/pack-membership.webp";
import airdrop from "@/assets/pack-airdrop.webp";
import levelpass from "@/assets/pack-levelpass.webp";
import like from "@/assets/pack-like.webp";
import weeklylite from "@/assets/pack-weeklylite.webp";
import unipin from "@/assets/pack-unipin.webp";

export const PACK_IMAGES = {
  diamond,
  membership,
  airdrop,
  level_pass: levelpass,
  like,
  weeklylite,
  unipin,
};

export function packImage(packType: string | null | undefined): string {
  switch (packType) {
    case "membership":
      return membership;
    case "airdrop":
      return airdrop;
    case "level_pass":
      return levelpass;
    case "like":
      return like;
    case "weeklylite":
      return weeklylite;
    case "unipin":
      return unipin;
    case "diamond":
    default:
      return diamond;
  }
}

export const PACK_LABELS: Record<string, { en: string; bn: string }> = {
  diamond: { en: "Diamonds", bn: "ডায়মন্ড" },
  membership: { en: "Membership", bn: "মেম্বারশিপ" },
  level_pass: { en: "Level Up Pass", bn: "লেভেল আপ পাস" },
  airdrop: { en: "Airdrop", bn: "এয়ারড্রপ" },
  like: { en: "Like", bn: "লাইক" },
};

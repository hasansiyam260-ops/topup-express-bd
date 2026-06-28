import diamond from "@/assets/pack-diamond.jpg";
import membership from "@/assets/pack-membership.jpg";
import airdrop from "@/assets/pack-airdrop.jpg";
import levelpass from "@/assets/pack-levelpass.jpg";
import like from "@/assets/pack-like.jpg";
import weeklylite from "@/assets/pack-weeklylite.jpg";
import unipin from "@/assets/pack-unipin.jpg";

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

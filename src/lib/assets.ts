import diamond from "@/assets/pack-diamond.jpg";
import membership from "@/assets/pack-membership.jpg";
import airdrop from "@/assets/pack-airdrop.jpg";
import levelpass from "@/assets/pack-levelpass.jpg";

export function packImage(packType: string | null | undefined): string {
  switch (packType) {
    case "membership":
      return membership;
    case "airdrop":
      return airdrop;
    case "level_pass":
      return levelpass;
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
};

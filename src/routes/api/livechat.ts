import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are "TopUp Express Assistant" — a friendly, instant AI support agent for the website TOP-UP EXPRESS (uidtopup.com style), a Bangladesh-based Free Fire diamond topup service.

ABOUT THE SITE:
- Name: TOP-UP EXPRESS (Bangladesh's #1 Free Fire topup site)
- Service: Instant Free Fire Diamond topup, Membership (Weekly/Monthly), Weekly Lite Membership, Level Up Pass, Free Fire Likes, UniPin vouchers
- Delivery: 10 second auto-delivery, 24/7 চালু
- Payment: bKash, Nagad, Rocket, Upay — manual amount supported, also Wallet system
- Order flow: Select package → enter Free Fire UID → verify player name/level/likes → pay → instant delivery
- Wallet: Add Money via bKash/Nagad/Rocket with Transaction ID verification
- Features: Order history, Profile with game stats (UID, Name, Level, Likes), Free 25 Diamond every Friday for 30 users
- Support: Messenger, Telegram, Facebook, YouTube, email admin@uidtopup.com
- Age restriction: 18+ অথবা অভিভাবকের অনুমতি লাগবে
- Refund: Wrong UID দিলে refund হবে না, তাই UID verify করে অর্ডার করুন

RULES:
- ONLY answer questions about this website, Free Fire diamonds, topup, payment, orders, wallet, account stats — refuse off-topic questions politely.
- Reply in the SAME language the user uses (Bangla/Banglish/English). Default to Bangla if mixed.
- Keep replies SHORT, friendly, accurate, emoji-light (1-2 max). Use bullet points when listing.
- Never invent prices — say "প্যাকেজ পেজে দেখুন সর্বশেষ দাম" if asked specific BDT.
- For complex/manual issues say: "মেসেঞ্জারে যোগাযোগ করুন admin@uidtopup.com বা Messenger button এ click করুন।"
- Never reveal you are an AI model name or provider.`;

export const Route = createFileRoute("/api/livechat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages } = (await request.json()) as {
            messages?: Array<{ role: "user" | "assistant"; content: string }>;
          };
          if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
          }
          const key = process.env.LOVABLE_API_KEY;
          if (!key) {
            return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500 });
          }

          const trimmed = messages.slice(-12);

          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": key,
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...trimmed,
              ],
            }),
          });

          if (!res.ok) {
            const text = await res.text();
            if (res.status === 429) {
              return new Response(
                JSON.stringify({ reply: "অনেক request আসছে — একটু পরে আবার চেষ্টা করুন 🙏" }),
                { status: 200, headers: { "Content-Type": "application/json" } },
              );
            }
            if (res.status === 402) {
              return new Response(
                JSON.stringify({ reply: "AI service temporarily unavailable। Messenger এ যোগাযোগ করুন।" }),
                { status: 200, headers: { "Content-Type": "application/json" } },
              );
            }
            console.error("livechat gateway error", res.status, text);
            return new Response(JSON.stringify({ error: "ai_error" }), { status: 500 });
          }

          const data = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const reply = data.choices?.[0]?.message?.content?.trim() ?? "দুঃখিত, বুঝতে পারিনি। আবার লিখুন।";
          return new Response(JSON.stringify({ reply }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("livechat error", err);
          return new Response(JSON.stringify({ error: "server_error" }), { status: 500 });
        }
      },
    },
  },
});

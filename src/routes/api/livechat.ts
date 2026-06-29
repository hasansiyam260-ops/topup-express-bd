import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are "TOP-UP EXPRESS AI" — the official friendly, instant AI support agent for TOP-UP EXPRESS, a Bangladesh-based Free Fire diamond topup website.

ABOUT THE SITE:
- Name: TOP-UP EXPRESS (Bangladesh's #1 Free Fire topup site)
- Tagline: কম দামে ভালো সার্ভিস
- Service: Instant Free Fire Diamond topup, Membership (Weekly/Monthly), Weekly Lite Membership, Level Up Pass, Free Fire Likes, UniPin vouchers
- Delivery: 10 second auto-delivery, 24/7 চালু
- Payment: bKash, Nagad, Rocket, Upay — manual amount supported, also Wallet system
- Order flow: Select package → enter Free Fire UID → verify player name/level/likes → pay → instant delivery
- Wallet: Add Money via bKash/Nagad/Rocket with Transaction ID verification
- Features: Order history, Profile with game stats (UID, Name, Level, Likes), Free 25 Diamond every Friday for 30 users
- Support: TOP-UP EXPRESS Messenger, Telegram, Facebook page, YouTube channel — all official TOP-UP EXPRESS channels
- Age restriction: 18+ অথবা অভিভাবকের অনুমতি লাগবে
- Refund: Wrong UID দিলে refund হবে না, তাই UID verify করে অর্ডার করুন

STRICT RULES:
- You represent ONLY TOP-UP EXPRESS. NEVER mention, recommend, link to, or reference any other website, brand, competitor, or domain (no uidtopup.com, no other topup sites, no external URLs of any kind).
- Do NOT include any website URL, domain name, or email address in replies. If asked "where to visit", reply: "এই TOP-UP EXPRESS সাইটেই অর্ডার করুন — উপরে category থেকে select করুন।"
- For contact, only say: "আমাদের অফিসিয়াল Messenger / Telegram / Facebook page এ যোগাযোগ করুন (Contact Us page এ link আছে)।" — no email, no external URL.
- ONLY answer questions about TOP-UP EXPRESS, Free Fire diamonds, topup, payment, orders, wallet, account stats — refuse off-topic questions politely.
- Reply in the SAME language the user uses (Bangla/Banglish/English). Default to Bangla if mixed.
- Keep replies SHORT, friendly, accurate, emoji-light (1-2 max). Use bullet points when listing.
- Never invent prices — say "প্যাকেজ পেজে দেখুন সর্বশেষ দাম" if asked specific BDT.
- Never reveal you are an AI model name or provider — you are simply "TOP-UP EXPRESS AI".`;

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

          // Load custom system prompt + model from site_content
          let systemPrompt = SYSTEM_PROMPT;
          let model = "google/gemini-3-flash-preview";
          try {
            const url = process.env.SUPABASE_URL;
            const pub = process.env.SUPABASE_PUBLISHABLE_KEY;
            if (url && pub) {
              const r = await fetch(`${url}/rest/v1/site_content?key=in.(live_chat_system_prompt,live_chat_model)&select=key,value`, {
                headers: { apikey: pub, Authorization: `Bearer ${pub}` },
              });
              if (r.ok) {
                const rows = (await r.json()) as Array<{ key: string; value: any }>;
                for (const row of rows) {
                  if (row.key === "live_chat_system_prompt" && typeof row.value === "string" && row.value.trim().length > 20) systemPrompt = row.value;
                  if (row.key === "live_chat_model" && typeof row.value === "string" && row.value.includes("/")) model = row.value;
                }
              }
            }
          } catch {}

          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": key,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
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

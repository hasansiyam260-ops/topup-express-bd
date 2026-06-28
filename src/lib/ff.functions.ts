import { createServerFn } from "@tanstack/react-start";

// Fetches real Free Fire player nickname from UID using a public info API.
// Override the endpoint by setting FF_INFO_URL secret (must accept ?uid= and ?region=).
// Default uses a community endpoint. Region defaults to BD.
export const getFFPlayerName = createServerFn({ method: "GET" })
  .inputValidator((d: { uid: string; region?: string }) => {
    if (!/^\d{6,12}$/.test(d.uid)) throw new Error("Invalid UID");
    return { uid: d.uid, region: (d.region || "bd").toLowerCase() };
  })
  .handler(async ({ data }) => {
    const endpoints = [
      process.env.FF_INFO_URL,
      `https://ff-info-mu.vercel.app/info?uid=${data.uid}&region=${data.region}`,
    ].filter(Boolean) as string[];

    for (const url of endpoints) {
      try {
        const fullUrl = url.includes("?")
          ? url
          : `${url}?uid=${data.uid}&region=${data.region}`;
        const res = await fetch(fullUrl, {
          headers: { accept: "application/json" },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) continue;
        const json: any = await res.json();
        const ai = json?.AccountInfo ?? json?.basicInfo ?? json?.account_info ?? json?.data ?? json?.player ?? json ?? {};
        const name =
          ai?.AccountName ?? ai?.nickname ?? json?.nickname ?? json?.name ?? null;
        const level = ai?.AccountLevel ?? ai?.level ?? ai?.Level ?? json?.level ?? null;
        const likes = ai?.AccountLikes ?? ai?.liked ?? ai?.likes ?? json?.likes ?? null;
        const region = ai?.AccountRegion ?? ai?.region ?? data.region;
        if (name && typeof name === "string") {
          return {
            name: name as string,
            region: String(region || data.region).toUpperCase(),
            level: level != null ? Number(level) : null,
            likes: likes != null ? Number(likes) : null,
          };
        }
      } catch {
        // try next
      }
    }
    throw new Error("Could not fetch player info. Please check the UID.");
  });


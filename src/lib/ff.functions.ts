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
      `https://aditya-info-v9op.onrender.com/player-info?uid=${data.uid}&region=${data.region}`,
      `https://ff-community-api.vercel.app/api/info?uid=${data.uid}&region=${data.region}`,
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
        const name =
          json?.AccountInfo?.AccountName ??
          json?.basicInfo?.nickname ??
          json?.account_info?.nickname ??
          json?.nickname ??
          json?.name ??
          json?.data?.nickname ??
          json?.player?.nickname ??
          null;
        if (name && typeof name === "string") {
          return { name: name as string, region: data.region };
        }
      } catch {
        // try next
      }
    }
    throw new Error("Could not fetch player name. Please check the UID.");
  });

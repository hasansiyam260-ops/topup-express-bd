import { createServerFn } from "@tanstack/react-start";

type FFInfo = {
  name: string;
  region: string;
  level: number | null;
  likes: number | null;
};

const REGIONS = ["bd", "ind", "sg", "br", "na", "eu", "me", "ru", "id", "vn", "th", "tw", "cis", "pk"];

function parsePayload(json: any, fallbackRegion: string): FFInfo | null {
  if (!json || typeof json !== "object") return null;
  const ai =
    json.AccountInfo ??
    json.basicInfo ??
    json.account_info ??
    json.basic_info ??
    json.data?.basicInfo ??
    json.data?.AccountInfo ??
    json.data ??
    json.player ??
    json;
  const name =
    ai?.AccountName ??
    ai?.nickname ??
    ai?.Nickname ??
    ai?.name ??
    json?.nickname ??
    json?.name ??
    null;
  if (!name || typeof name !== "string") return null;
  const level = ai?.AccountLevel ?? ai?.level ?? ai?.Level ?? json?.level ?? null;
  const likes = ai?.AccountLikes ?? ai?.liked ?? ai?.likes ?? json?.likes ?? null;
  const region = ai?.AccountRegion ?? ai?.region ?? json?.region ?? fallbackRegion;
  return {
    name,
    region: String(region || fallbackRegion).toUpperCase(),
    level: level != null ? Number(level) : null,
    likes: likes != null ? Number(likes) : null,
  };
}

async function tryFetch(url: string, region: string): Promise<FFInfo | null> {
  try {
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 (TopUpExpress/1.0)",
      },
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    let json: any;
    try { json = JSON.parse(text); } catch { return null; }
    if (json?.error) return null;
    return parsePayload(json, region);
  } catch {
    return null;
  }
}

// Fetches real Free Fire player info. Tries multiple endpoints + regions.
export const getFFPlayerName = createServerFn({ method: "GET" })
  .validator((d: { uid: string; region?: string }) => {
    if (!/^\d{6,12}$/.test(d.uid)) throw new Error("Invalid UID");
    return { uid: d.uid, region: (d.region || "bd").toLowerCase() };
  })
  .handler(async ({ data }): Promise<FFInfo> => {
    const custom = process.env.FF_INFO_URL;
    const tryOrder = [data.region, ...REGIONS.filter((r) => r !== data.region)];

    // Custom endpoint first if provided
    if (custom) {
      for (const region of tryOrder) {
        const u = custom.includes("?")
          ? `${custom}${custom.endsWith("&") || custom.endsWith("?") ? "" : "&"}uid=${data.uid}&region=${region}`
          : `${custom}?uid=${data.uid}&region=${region}`;
        const r = await tryFetch(u, region);
        if (r) return r;
      }
    }

    const builders: Array<(uid: string, region: string) => string> = [
      (uid, region) => `https://ff-info-mu.vercel.app/info?uid=${uid}&region=${region}`,
      (uid, region) => `https://info-ffx.vercel.app/info?uid=${uid}&region=${region}`,
      (uid, region) => `https://api-ff-info.vercel.app/info?uid=${uid}&region=${region}`,
    ];

    for (const region of tryOrder) {
      for (const build of builders) {
        const r = await tryFetch(build(data.uid, region), region);
        if (r) return r;
      }
    }

    throw new Error("Could not fetch player info. Please check the UID.");
  });

import { createServerFn } from "@tanstack/react-start";

type FFInfo = {
  name: string;
  region: string;
  level: number | null;
  likes: number | null;
};

function parsePayload(json: any, fallbackRegion: string): FFInfo | null {
  if (!json || typeof json !== "object") return null;
  const sources = [
    json.basicInfo,
    json.AccountInfo,
    json.account_info,
    json.basic_info,
    json.data?.basicInfo,
    json.data?.AccountInfo,
    json.data?.account_info,
    json.data?.basic_info,
    json.data,
    json.player,
    json.profile,
    json,
  ].filter(Boolean);

  const pick = (...keys: string[]) => {
    for (const source of sources) {
      for (const key of keys) {
        const value = source?.[key];
        if (value !== undefined && value !== null && value !== "") return value;
      }
    }
    return null;
  };

  const name =
    pick("AccountName", "nickname", "Nickname", "name", "playerName", "username") ?? null;
  if (!name || typeof name !== "string") return null;
  const level = pick("AccountLevel", "level", "Level", "accountLevel") ?? null;
  const likes = pick("AccountLikes", "liked", "likes", "Likes", "like", "likedCount", "likesCount", "AccountLike") ?? null;
  const region = pick("AccountRegion", "region", "Region", "server") ?? fallbackRegion;
  return {
    name,
    region: String(region || fallbackRegion).toUpperCase(),
    level: level != null ? Number(level) : null,
    likes: likes != null ? Number(likes) : null,
  };
}

async function tryFetch(url: string, region: string, signal: AbortSignal): Promise<FFInfo | null> {
  try {
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 (TopUpExpress/1.0)",
      },
      signal,
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

// Fires all candidate endpoints in parallel and returns the first valid response.
export const getFFPlayerName = createServerFn({ method: "GET" })
  .inputValidator((d: { uid: string; region?: string }) => {
    if (!/^\d{6,12}$/.test(d.uid)) throw new Error("Invalid UID");
    return { uid: d.uid, region: (d.region || "bd").toLowerCase() };
  })
  .handler(async ({ data }): Promise<FFInfo> => {
    const region = data.region;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const urls: Array<[string, string]> = [
      [`https://ff-info-mu.vercel.app/info?uid=${data.uid}&region=${region}`, region],
      [`https://info-ffx.vercel.app/info?uid=${data.uid}&region=${region}`, region],
      [`https://api-ff-info.vercel.app/info?uid=${data.uid}&region=${region}`, region],
    ];
    const custom = process.env.FF_INFO_URL;
    if (custom) {
      const u = custom.includes("?")
        ? `${custom}${custom.endsWith("&") || custom.endsWith("?") ? "" : "&"}uid=${data.uid}&region=${region}`
        : `${custom}?uid=${data.uid}&region=${region}`;
      urls.unshift([u, region]);
    }

    try {
      const result = await new Promise<FFInfo>((resolve, reject) => {
        let remaining = urls.length;
        urls.forEach(([url, reg]) => {
          tryFetch(url, reg, controller.signal).then((r) => {
            if (r) {
              controller.abort();
              resolve(r);
            } else if (--remaining === 0) {
              reject(new Error("Could not fetch player info. Please check the UID."));
            }
          }).catch(() => {
            if (--remaining === 0) reject(new Error("Could not fetch player info. Please check the UID."));
          });
        });
      });
      return result;
    } finally {
      clearTimeout(timeout);
    }
  });

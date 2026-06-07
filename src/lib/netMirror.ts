// ─── Net Mirror Shared Utilities ─────────────────────────────────────────────
// Mirrors the logic from netflix-server.js but as Next.js-compatible helpers.

const COOKIE = `user_token=1b8771d4552c859e7f6dd08c25b95a7d; SE81313283=81702845; 81702845=474%3A3189; ott=nf; 82813816=4689%3A12339; recentplay=82813021-82813816-82698051-SE81313283; t_hash=3085cbee7f35574e827ea0d7d71ee74b%3A%3A1780825333%3A%3Ani; cf_clearance=oPiuwm2u0lKYqeEMu5kSNUHWOcMPZBsbZGbIlY1QFw4-1780825408-1.2.1.1-arefU6CII51YOQVt6oBdK8HDyAC7arzXr_a0cC5.DX8mf7gjCsYMQRhuVhM9Zs3xpgja4j7lzJ18rD4DM3vHfkDFf87P.M3Ju2XrBzXzrHx3DadC3wzYGioyuBRS4X1hvp8SzhUHCEus2dij0omxlf95ZY5NvFKphbncX6iRtAQKxs2yH3E.5Vo_aDOO_c.Or.0wlRXt0lxH74lBZCb1480XT.KNnSt1rbtslAoMucrGbBFvJjbXnjo_m96S5Tdb31nc4PiYe6PKfV2OAuCBaUEXo65IrdSN_R3gC9uzUPBMMWedsazytxZPCYB7b7TQdznTkAWG89Gta8_T5uqYYZOOjgG_Ft12u0dvcvbb6QYrjdsYPpDBbxtlfvnsfppY4T3HJJpV.EuVWxZ4l3LJeie1LWsIGr5YWRYBq1icl2Y; t_hash_p=7e0941e808b8e8809aeb54da663deb03%3A%3Abaaf43abc5b92eddde0f395b1c05c6a4%3A%3A1780825448%3A%3Ani%3A%3Ap`;

export function headers(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "User-Agent": "Mozilla/5.0",
    Cookie: COOKIE,
    ...extra
  };
}

export interface Episode {
  id: string;
  episode: number;
  title: string;
  season: string;
  time: string;
  description: string;
}

export interface Season {
  season: number;
  seasonId: string;
  episodeCount: number;
  episodes: Episode[];
}

export interface PostData {
  status: string;
  error?: string;
  title?: string;
  type?: string;
  content_type?: string;
  episodes?: any[];
  season?: any[];
  nextPageSeason?: string;
  [key: string]: any;
}

export function normalizeEpisodes(postData: PostData): Episode[] {
  if (!postData || !Array.isArray(postData.episodes)) {
    return [];
  }

  return postData.episodes
    .filter(ep => ep && ep.id)
    .map(ep => ({
      id: String(ep.id),
      episode: Number(ep.ep || 0),
      title: ep.t || `Episode ${ep.ep || ""}`,
      season: String(ep.s || "").replace("S", ""),
      time: ep.time || "",
      description: ep.ep_desc || ""
    }))
    .sort((a, b) => a.episode - b.episode);
}

export function normalizeSeries(postData: PostData): Season[] {
  if (!Array.isArray(postData.season)) return [];

  return postData.season.map(s => ({
    season: Number(s.s),
    seasonId: String(s.id),
    episodeCount: Number(s.ep),
    episodes: []
  })).sort((a, b) => a.season - b.season);
}

export async function getPostData(videoId: string): Promise<PostData> {
  const t = Math.floor(Date.now() / 1000);

  const res = await fetch(`https://net11.cc/post.php?id=${videoId}&t=${t}`, {
    headers: headers({
      Referer: "https://net11.cc/home",
      "X-Requested-With": "XMLHttpRequest"
    })
  });

  if (!res.ok) {
    throw new Error(JSON.stringify({
      error: "Upstream request failed",
      status: res.status,
      provider: "net11",
      message: "net11 rejected the request"
    }));
  }

  const data: PostData = await res.json();

  if (data.status !== "y") {
    throw new Error(data.error || "post.php failed");
  }

  return data;
}

export async function getNet52Hls(videoId: string) {
  const postData = await getPostData(videoId);

  const hashRes = await fetch("https://net11.cc/play.php", {
    method: "POST",
    headers: headers({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Referer: "https://net11.cc/home",
      Origin: "https://net11.cc"
    }),
    body: new URLSearchParams({ id: videoId }).toString()
  });

  const hashData = await hashRes.json();

  if (!hashData.h) {
    throw new Error("Missing play hash");
  }

  const playUrl = `https://net52.cc/play.php?id=${videoId}&${hashData.h}`;

  const playRes = await fetch(playUrl, {
    headers: headers({
      Referer: "https://net11.cc/home"
    })
  });

  const html = await playRes.text();

  const time = html.match(/data-time="([^"]+)"/)?.[1];
  const h = html.match(/data-h="([^"]+)"/)?.[1];
  const title =
    html.match(/data-title="([^"]*)"/)?.[1] ||
    postData.title ||
    "Video";

  if (!time || !h) {
    throw new Error("Could not extract data-time/data-h");
  }

  const playlistUrl =
    `https://net52.cc/playlist.php?id=${videoId}` +
    `&t=${encodeURIComponent(title)}` +
    `&tm=${time}` +
    `&h=${encodeURIComponent(h)}`;

  const playlistRes = await fetch(playlistUrl, {
    headers: headers({
      Referer: playUrl
    })
  });

  const playlistData = await playlistRes.json();

  const item = playlistData?.[0];
  const source = item?.sources?.[0];

  if (!source?.file) {
    throw new Error("No playlist source found");
  }

  const tracks = item?.tracks || [];

  return {
    title,
    masterUrl: source.file.startsWith("http")
      ? source.file
      : "https://net52.cc" + source.file,

    sources: (item.sources || []).map((src: any) => ({
      label: src.label || "Auto",
      url: src.file.startsWith("http")
        ? src.file
        : "https://net52.cc" + src.file,
      type: src.type || "application/vnd.apple.mpegurl",
      default: src.default === "true"
    })),

    subtitles: tracks
      .filter((t: any) => t.kind === "captions")
      .map((t: any) => ({
        label: t.label || "Subtitle",
        language: t.language || "en",
        file: t.file.startsWith("//") ? "https:" + t.file : t.file
      })),

    thumbnails: tracks
      .filter((t: any) => t.kind === "thumbnails")
      .map((t: any) => ({
        label: t.label || "Thumbnails",
        language: t.language || "en",
        file: t.file.startsWith("//")
          ? "https:" + t.file
          : t.file
      }))
  };
}

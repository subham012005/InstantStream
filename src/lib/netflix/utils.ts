function randomHex(len = 32) {
  return [...Array(len)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

export function getCookie() {
  const firstPart = randomHex(32);
  return `user_token=1b8ghgfghj771d4s; t_hash_p=${firstPart}%3A%3A058f2af8e0efa33b957d4a931a2bf86c%3A%3A1781760646%3A%3Ani%3A%3Ap;`;
}

export function headers(extra = {}) {
  return {
    "User-Agent": "Mozilla/5.0",
    Cookie: getCookie(),
    ...extra
  };
}

export async function getPostData(videoId: string) {
  const t = Math.floor(Date.now() / 1000);

  const res = await fetch(`https://net11.cc/post.php?id=${videoId}&t=${t}`, {
    signal: AbortSignal.timeout(8000),
    headers: headers({
      Referer: "https://net11.cc/home",
      "X-Requested-With": "XMLHttpRequest"
    })
  });

  const data = await res.json();

  if (data.status !== "y") {
    throw new Error(data.error || "post.php failed");
  }

  return data;
}

export function normalizeEpisodes(postData: any) {
  if (!postData || !Array.isArray(postData.episodes)) {
    return [];
  }

  return postData.episodes
    .filter((ep: any) => ep && ep.id)
    .map((ep: any) => ({
      id: String(ep.id),
      episode: Number(ep.ep || 0),
      title: ep.t || `Episode ${ep.ep || ""}`,
      season: String(ep.s || "").replace("S", ""),
      time: ep.time || "",
      description: ep.ep_desc || ""
    }))
    .sort((a: any, b: any) => a.episode - b.episode);
}

export function normalizeSeries(postData: any) {
  if (!Array.isArray(postData.season)) return [];

  return postData.season.map((s: any) => ({
    season: Number(s.s),
    seasonId: String(s.id),
    episodeCount: Number(s.ep),
    episodes: []
  })).sort((a: any, b: any) => a.season - b.season);
}

export function normalizeCurrentSeason(postData: any) {
  const episodes = normalizeEpisodes(postData);

  if (!episodes.length) return [];

  const seasonNo = Number(episodes[0].season || 1);

  return [{
    season: seasonNo,
    seasonId: postData.nextPageSeason || "",
    episodes
  }];
}

export async function getNet52Hls(videoId: string) {
  const [postDataResult, hashRes] = await Promise.allSettled([
    getPostData(videoId),
    fetch("https://net11.cc/play.php", {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: headers({
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        Referer: "https://net11.cc/home",
        Origin: "https://net11.cc"
      }),
      body: new URLSearchParams({ id: videoId })
    })
  ]);

  const postData = postDataResult.status === "fulfilled" ? postDataResult.value : {};
  const hashResponse = hashRes.status === "fulfilled" ? hashRes.value : null;

  if (!hashResponse) {
    throw new Error("Failed to fetch play hash");
  }

  const hashData = await hashResponse.json();

  if (!hashData.h) {
    throw new Error("Missing play hash");
  }

  const playUrl = `https://net52.cc/play.php?id=${videoId}&${hashData.h}`;

  const playRes = await fetch(playUrl, {
    signal: AbortSignal.timeout(8000),
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
    signal: AbortSignal.timeout(8000),
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

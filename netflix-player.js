import express from "express";

const app = express();
const PORT = 3000;

//only change t_HASH_p cookie becuase only that is important , the expiry date is 3 days from the day it generated

// const COOKIE = `user_token=1c25b95a7d;  t_hash_p=a6838babd566ffb80bcb22f257055cc7%3A%3A1cacebac6c8eeb5eb7dceb51da589187%3A%3A1781759600%3A%3Ani%3A%3Ap;`;


function randomHex(len = 32) {
  return [...Array(len)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

function getCookie() {
  const firstPart = randomHex(32);

  return `user_token=1b8ghgfghj771d4s; t_hash_p=${firstPart}%3A%3A058f2af8e0efa33b957d4a931a2bf86c%3A%3A1781760646%3A%3Ani%3A%3Ap;`;
}



function headers(extra = {}) {
  return {
    "User-Agent": "Mozilla/5.0",
    Cookie: getCookie(),
    ...extra
  };
}

async function getNet52Hls(videoId) {
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

    sources: (item.sources || []).map(src => ({
      label: src.label || "Auto",
      url: src.file.startsWith("http")
        ? src.file
        : "https://net52.cc" + src.file,
      type: src.type || "application/vnd.apple.mpegurl",
      default: src.default === "true"
    })),

    subtitles: tracks
      .filter(t => t.kind === "captions")
      .map(t => ({
        label: t.label || "Subtitle",
        language: t.language || "en",
        file: t.file.startsWith("//") ? "https:" + t.file : t.file
      })),

    thumbnails: tracks
      .filter(t => t.kind === "thumbnails")
      .map(t => ({
        label: t.label || "Thumbnails",
        language: t.language || "en",
        file: t.file.startsWith("//")
          ? "https:" + t.file
          : t.file
      }))
  };
}

async function getPostData(videoId) {
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

function normalizeEpisodes(postData) {
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

function addSubtitles(subtitles) {
  document.querySelectorAll("video track").forEach(t => t.remove());

  subtitleSelect.innerHTML = "<option value='off'>Off</option>";

  if (!subtitles.length) {
    subtitleBox.style.display = "none";
    return;
  }

  subtitleBox.style.display = "block";

  subtitles.forEach((sub, index) => {
    const src = sub.file.endsWith(".srt")
      ? "/api/subtitle?url=" + encodeURIComponent(sub.file)
      : sub.file;

    const track = document.createElement("track");
    track.kind = "subtitles";
    track.label = sub.label || "Subtitle";
    track.srclang = sub.language || "en";
    track.src = src;

    video.appendChild(track);

    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = sub.label || "Subtitle";
    subtitleSelect.appendChild(opt);
  });

  subtitleSelect.value = "off";

  subtitleSelect.onchange = () => {
    const tracks = video.textTracks;

    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = "disabled";
    }

    if (subtitleSelect.value !== "off") {
      const selectedTrack = tracks[Number(subtitleSelect.value)];
      selectedTrack.mode = "showing";
    }
  };
}

function normalizeSeries(postData) {
  if (!Array.isArray(postData.season)) return [];

  return postData.season.map(s => ({
    season: Number(s.s),
    seasonId: String(s.id),
    episodeCount: Number(s.ep),
    episodes: []
  })).sort((a, b) => a.season - b.season);
}


function normalizeCurrentSeason(postData) {
  const episodes = normalizeEpisodes(postData);

  if (!episodes.length) return [];

  const seasonNo = Number(episodes[0].season || 1);

  return [{
    season: seasonNo,
    seasonId: postData.nextPageSeason || "",
    episodes
  }];
}

app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q) {
      return res.status(400).json({ error: "Missing search query" });
    }

    const t = Math.floor(Date.now() / 1000);

    const response = await fetch(
      `https://net11.cc/search.php?s=${encodeURIComponent(q)}&t=${t}`,
      {
        headers: headers({
          Referer: "https://net11.cc/home",
          "X-Requested-With": "XMLHttpRequest"
        })
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/meta/:id", async (req, res) => {
  try {
    const postData = await getPostData(req.params.id);

    const type = String(postData.type || postData.content_type || "m").toLowerCase();
    const isSeries = ["t", "tv", "series", "s"].includes(type);

    const seasons = isSeries ? normalizeSeries(postData) : [];
    const currentEpisodes = normalizeEpisodes(postData);

    const currentSeasonNo = currentEpisodes.length
      ? Number(currentEpisodes[0].season)
      : null;

    if (currentSeasonNo) {
      const currentSeason = seasons.find(s => s.season === currentSeasonNo);
      if (currentSeason) {
        currentSeason.episodes = currentEpisodes;
        currentSeason.isLoaded = true;
      }
    }

    res.json({
      title: postData.title || "Video",
      seriesId: req.params.id,
      type,
      isSeries,
      seasons,
      defaultSeason: currentSeasonNo,
      raw: postData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/season/:id", async (req, res) => {
  try {
    const postData = await getPostData(req.params.id);
    const episodes = normalizeEpisodes(postData);

    res.json({
      title: postData.title || "Season",
      episodes,
      raw: postData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/play/:id", async (req, res) => {
  try {
    const data = await getNet52Hls(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/season/:seriesId/:seasonId", async (req, res) => {
  try {
    const { seriesId, seasonId } = req.params;
    const t = Math.floor(Date.now() / 1000);

    const seasonRes = await fetch(
      `https://net11.cc/episodes.php?s=${seasonId}&series=${seriesId}&t=${t}`,
      {
        headers: headers({
          Referer: "https://net11.cc/home",
          "X-Requested-With": "XMLHttpRequest"
        })
      }
    );

    const seasonData = await seasonRes.json();

    res.json({
      title: seasonData.title || "Season",
      episodes: normalizeEpisodes(seasonData),
      raw: seasonData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/subtitle", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("Missing subtitle url");

    const subRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "*/*",
        Referer: "https://net52.cc/"
      }
    });

    if (!subRes.ok) {
      return res.status(subRes.status).send("Subtitle fetch failed");
    }

    let srt = await subRes.text();

    srt = srt
      .replace(/^\uFEFF/, "")
      .replace(/\r/g, "")
      .trim();

    const vtt =
      "WEBVTT\n\n" +
      srt
        .replace(/^\d+\n/gm, "")
        .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");

    res.setHeader("Content-Type", "text/vtt; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(vtt);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// old /movie/:id support, but use new homepage player
app.get("/movie/:id", (req, res) => {
  res.redirect("/?id=" + encodeURIComponent(req.params.id));
});

app.listen(PORT, () => {
  console.log(`Open: http://localhost:${PORT}`);
});
"use client";

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Script from "next/script";

export default function TestServerPage() {
  const [contentType, setContentType] = useState("movie");
  const [tmdbId, setTmdbId] = useState("299534");
  const [imdbId, setImdbId] = useState("tt29468874");
  const [contentId, setContentId] = useState("");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");
  const [server, setServer] = useState("auto");
  const [language, setLanguage] = useState("");
  
  const [movieData, setMovieData] = useState<any>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [qualities, setQualities] = useState<any[]>([]);
  
  const playerRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  const loadContent = async () => {
    try {
      let url;

      if (contentType === "movie") {
        if (server === "gemma") {
          if (!imdbId) throw new Error("IMDb ID required for Phantom");
          url = `/api/test-server/api/movie/${tmdbId || 0}?server=gemma&imdb=${encodeURIComponent(imdbId)}`;
        } else {
          if (!tmdbId) throw new Error("TMDB ID required");
          url = `/api/test-server/api/movie/${tmdbId}?server=${server}`;
        }
      } else {
        if (!tmdbId) throw new Error("TMDB ID required");
        url = `/api/test-server/api/tv/${tmdbId}/${season}/${episode}?server=${server}`;
      }

      console.log("REQUEST:", url);

      const res = await fetch(url);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Server returned non-JSON:", text);
        throw new Error("Server returned HTML instead of JSON");
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      setMovieData(data);

      if (!data.sources || !data.sources.length) {
        alert("No sources found");
        return;
      }

      const langs = [...new Set(data.sources.map((s: any) => s.language || "Unknown"))] as string[];
      setLanguages(langs);
      
      if (langs.length > 0) {
        setLanguage(langs[0]);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  useEffect(() => {
    if (movieData && language) {
      const filtered = movieData.sources.filter(
        (source: any) => (source.language || "Unknown") === language
      );
      setQualities(filtered);
      
      if (filtered.length > 0) {
        playSource(filtered[0]);
      }
    }
  }, [movieData, language]);

  const buildPlayUrl = (source: any) => {
    const headers = encodeURIComponent(JSON.stringify(source.headers || {}));
    const isHls =
      source.type === "hls" ||
      source.url.includes(".m3u8") ||
      source.url.includes("m3u8-proxy");

    if (isHls) {
      return `/api/test-server/hls-proxy?provider=${source.provider}&url=${encodeURIComponent(source.url)}&headers=${headers}`;
    }

    return `/api/test-server/mp4-proxy?provider=${source.provider}&url=${encodeURIComponent(source.url)}&headers=${headers}`;
  };

  const playSource = (source: any) => {
    const player = playerRef.current;
    if (!player) return;

    const playUrl = buildPlayUrl(source);
    console.log("Playing:", source.provider, source.type, playUrl);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    player.pause();
    player.removeAttribute("src");
    player.load();

    if (source.type === "hls" || playUrl.includes("/hls-proxy")) {
      const Hls = (window as any).Hls;
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hlsRef.current = hls;

        hls.loadSource(playUrl);
        hls.attachMedia(player);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          player.play().catch(console.error);
        });

        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
          console.error("HLS error:", data);
        });
      } else {
        player.src = playUrl;
        player.load();
        player.play().catch(console.error);
      }
    } else {
      player.src = playUrl;
      player.load();
      player.play().catch(console.error);
    }
  };

  return (
    <div style={{ margin: 0, background: "#000", color: "white", fontFamily: "Arial, sans-serif", minHeight: "100vh" }}>
      <Script src="https://cdn.jsdelivr.net/npm/hls.js@latest" strategy="beforeInteractive" />
      
      <video ref={playerRef} controls playsInline preload="auto" style={{ width: "100%", maxHeight: "75vh", background: "black" }}></video>

      <div style={{ padding: "12px" }}>
        <label style={{ display: "block", marginTop: "10px" }}>Type</label>
        <select 
          value={contentType} 
          onChange={(e) => setContentType(e.target.value)}
          style={{ padding: "10px", margin: "5px 0", width: "100%", maxWidth: "420px", boxSizing: "border-box" }}
        >
          <option value="movie">Movie</option>
          <option value="tv">TV Series</option>
        </select>

        <label style={{ display: "block", marginTop: "10px" }}>TMDB ID</label>
        <input 
          value={tmdbId} 
          onChange={(e) => setTmdbId(e.target.value)} 
          style={{ padding: "10px", margin: "5px 0", width: "100%", maxWidth: "420px", boxSizing: "border-box" }}
        />

        <label style={{ display: "block", marginTop: "10px" }}>IMDb ID (Phantom Only)</label>
        <input 
          value={imdbId} 
          onChange={(e) => setImdbId(e.target.value)} 
          style={{ padding: "10px", margin: "5px 0", width: "100%", maxWidth: "420px", boxSizing: "border-box" }}
        />

        <label style={{ display: "block", marginTop: "10px" }}>ID</label>
        <input 
          placeholder="299534 or tt29468874"
          value={contentId}
          onChange={(e) => setContentId(e.target.value)}
          style={{ padding: "10px", margin: "5px 0", width: "100%", maxWidth: "420px", boxSizing: "border-box" }}
        />

        {contentType === "tv" && (
          <div>
            <label style={{ display: "block", marginTop: "10px" }}>Season</label>
            <input 
              type="number" 
              value={season} 
              onChange={(e) => setSeason(e.target.value)} 
              style={{ padding: "10px", margin: "5px 0", width: "100%", maxWidth: "420px", boxSizing: "border-box" }}
            />
            <label style={{ display: "block", marginTop: "10px" }}>Episode</label>
            <input 
              type="number" 
              value={episode} 
              onChange={(e) => setEpisode(e.target.value)} 
              style={{ padding: "10px", margin: "5px 0", width: "100%", maxWidth: "420px", boxSizing: "border-box" }}
            />
          </div>
        )}

        <label style={{ display: "block", marginTop: "10px" }}>Server</label>
        <select 
          value={server} 
          onChange={(e) => setServer(e.target.value)}
          style={{ padding: "10px", margin: "5px 0", width: "100%", maxWidth: "420px", boxSizing: "border-box" }}
        >
          <option value="auto">Shadow Auto</option>
          <option value="moviebox">Ghost</option>
          <option value="holly">Skull</option>
          <option value="air">Wraith</option>
          <option value="net">Demon</option>
          <option value="gemma">Phantom</option>
        </select>

        <button 
          onClick={loadContent}
          style={{ padding: "10px", margin: "5px 0", width: "100%", maxWidth: "420px", boxSizing: "border-box", cursor: "pointer" }}
        >
          Load
        </button>

        {languages.length > 0 && (
          <>
            <label style={{ display: "block", marginTop: "10px" }}>Language</label>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              style={{ padding: "10px", margin: "5px 0", width: "100%", maxWidth: "420px", boxSizing: "border-box" }}
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </>
        )}

        <div style={{ marginTop: "10px" }}>
          {qualities.map((source, index) => (
            <button 
              key={index} 
              onClick={() => playSource(source)}
              style={{ width: "auto", marginRight: "6px", padding: "10px", cursor: "pointer" }}
            >
              {`${source.provider} - ${source.language} - ${source.quality}`}
            </button>
          ))}
        </div>

        <pre style={{ background: "#111", color: "#0f0", padding: "12px", overflow: "auto", maxHeight: "250px" }}>
          {movieData ? JSON.stringify(movieData, null, 2) : "No data yet..."}
        </pre>
      </div>
    </div>
  );
}



"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  X,
  Play,
  AlertTriangle,
  Download,
  Info,
  ExternalLink,
  Send,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { ValidationSteps } from "@/components/ValidationSteps";
import type { ValidationResponse } from "@/types/validation";

const CustomPlayer = dynamic(() => import("@/components/CustomPlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-[#0088cc]" />
    </div>
  ),
});

interface StreamData {
  /** The playable URL (direct CDN, proxy, or transcode stream) */
  videoUrl: string;
  /** The raw original CDN URL (used for pristine downloads) */
  originalCdnUrl: string;
  title: string | null;
  caption: string | null;
  thumbnail: string | null;
  /** Pixel dimensions of the video (if known) */
  width: number | null;
  height: number | null;
  /** Original t.me post URL */
  postUrl: string;
  /** Whether the stream was transcoded or proxied */
  isTranscoded?: boolean;
}

// --- helpers -----------------------------------------------------------

function isTelegramCdnUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return (
      h.endsWith(".cdn-telegram.org") ||
      h.endsWith(".telegram.org") ||
      h.endsWith(".tgcnt.com") ||
      h.endsWith(".telesco.pe")
    );
  } catch {
    return false;
  }
}

function getTelegramPublicPostInfo(url: string): { channel: string; msgId: string } | null {
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    if (h !== "t.me" && h !== "telegram.me" && h !== "telegram.dog") return null;
    const parts = u.pathname.replace(/^\//, "").split("/").filter(Boolean);
    if (parts.length < 2) return null;
    if (["joinchat", "addstickers"].includes(parts[0]) || parts[0].startsWith("+")) return null;

    // Handle /s/channel/123 or regular /channel/123 or /channel/topicId/123
    let channel = parts[0];
    let msgId = parts[1];

    if (channel === "s" && parts.length >= 3) {
      channel = parts[1];
      msgId = parts[2];
    } else if (parts.length >= 3 && /^\d+$/.test(parts[2])) {
      // Forum topic post: /channel/topicId/msgId -> target the msgId
      msgId = parts[2];
    }

    if (!/^\d+$/.test(msgId)) return null;

    return { channel, msgId };
  } catch {
    return null;
  }
}

function isTelegramShareLink(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return h === "t.me" || h === "telegram.me" || h === "telegram.dog";
  } catch {
    return false;
  }
}

function getPlayerDimensions(
  width: number | null,
  height: number | null
): { maxWidth: string; aspectRatio: string; isPortrait: boolean } {
  if (!width || !height || width <= 0 || height <= 0) {
    return { maxWidth: "100%", aspectRatio: "16 / 9", isPortrait: false };
  }

  const ratio = width / height;
  const isPortrait = height > width;

  if (isPortrait) {
    // For 9:16 or tall videos, cap height so it fits within screen viewport without excess black bars
    // On desktop, ~420px max-width gives a great ~600-700px height.
    const maxW = Math.min(Math.round(680 * ratio), 440);
    return {
      maxWidth: `${Math.max(maxW, 320)}px`,
      aspectRatio: `${width} / ${height}`,
      isPortrait: true,
    };
  }

  // Square or slightly tall (e.g. 1:1, 4:5)
  if (ratio < 1.3) {
    const maxW = Math.min(Math.round(640 * ratio), 640);
    return {
      maxWidth: `${maxW}px`,
      aspectRatio: `${width} / ${height}`,
      isPortrait: false,
    };
  }

  // Standard landscape (16:9, 21:9, etc.)
  return { maxWidth: "100%", aspectRatio: `${width} / ${height}`, isPortrait: false };
}

// -----------------------------------------------------------------------

export default function TelegramPlayerClient() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Loading…");
  const [error, setError] = useState("");
  const [validationResponse, setValidationResponse] = useState<ValidationResponse | null>(null);
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [pendingStream, setPendingStream] = useState(false);
  const [shake, setShake] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isTranscodingFallback, setIsTranscodingFallback] = useState(false);

  const isValidInput = url.trim().length > 5 && url.trim().startsWith("http");

  // --- main handler ---------------------------------------------------

  const handleStream = async (rawUrl?: string) => {
    const targetUrl = (typeof rawUrl === "string" ? rawUrl : url).trim();
    if (!targetUrl) return;
    if (typeof rawUrl === "string") setUrl(rawUrl);

    setLoading(true);
    setError("");
    setValidationResponse(null);
    setPendingStream(false);
    setIsTranscodingFallback(false);

    const triggerError = (msg: string) => {
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    };

    // --- Case 1: Direct Telegram CDN URL ---
    if (isTelegramCdnUrl(targetUrl)) {
      setLoadingMsg("Checking codec & format…");
      try {
        // Probe format compatibility
        let isCompatible = true;
        try {
          const probeRes = await fetch(`/api/telegram-transcode?url=${encodeURIComponent(targetUrl)}&check=1`);
          if (probeRes.ok) {
            const probeData = await probeRes.json();
            isCompatible = probeData.isCompatible !== false;
          }
        } catch {
          // Fallback to direct
        }

        const playableUrl = isCompatible
          ? `/api/proxy-video?url=${encodeURIComponent(targetUrl)}`
          : `/api/telegram-transcode?url=${encodeURIComponent(targetUrl)}`;

        const sd: StreamData = {
          videoUrl: playableUrl,
          originalCdnUrl: targetUrl,
          title: "Telegram Video",
          caption: null,
          thumbnail: null,
          width: null,
          height: null,
          postUrl: targetUrl,
          isTranscoded: !isCompatible,
        };

        setValidationResponse({
          valid: true,
          type: "Telegram",
          steps: [
            { step: "format", status: "success", label: "Validating Telegram CDN link" },
            { step: "connection", status: "success", label: "Connecting to Telegram CDN" },
            { step: "filetype", status: "success", label: isCompatible ? "Standard MP4 video" : "Optimizing video codec" },
            { step: "streaming", status: "success", label: "Preparing stream" },
            { step: "preparing", status: "success", label: "Launching player" },
          ],
        });

        setPendingStream(true);
        setTimeout(() => {
          setStreamData(sd);
          setPendingStream(false);
        }, 700);
      } catch {
        triggerError("Failed to access Telegram CDN. The URL might have expired.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- Case 2: Public t.me post link ---
    const postInfo = getTelegramPublicPostInfo(targetUrl);
    if (postInfo) {
      setLoadingMsg("Extracting video from Telegram post…");
      try {
        const res = await fetch("/api/telegram-extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetUrl }),
        });
        const data = await res.json();

        if (!res.ok || !data.videoUrl) {
          triggerError(data.error || "Could not find a video in this Telegram post. The post might be private or contain only text/images.");
          setLoading(false);
          return;
        }

        // Extracted video URL: check codec compatibility
        setLoadingMsg("Analyzing video stream…");
        let isCompatible = true;
        try {
          const probeRes = await fetch(`/api/telegram-transcode?url=${encodeURIComponent(data.videoUrl)}&check=1`);
          if (probeRes.ok) {
            const probeData = await probeRes.json();
            isCompatible = probeData.isCompatible !== false;
          }
        } catch {
          // direct playback fallback
        }

        const playableUrl = isCompatible
          ? `/api/proxy-video?url=${encodeURIComponent(data.videoUrl)}`
          : `/api/telegram-transcode?url=${encodeURIComponent(data.videoUrl)}`;

        const sd: StreamData = {
          videoUrl: playableUrl,
          originalCdnUrl: data.videoUrl,
          title: data.title || `@${postInfo.channel} — Post #${postInfo.msgId}`,
          caption: data.caption,
          thumbnail: data.thumbnail,
          width: data.width,
          height: data.height,
          postUrl: targetUrl,
          isTranscoded: !isCompatible,
        };

        setValidationResponse({
          valid: true,
          type: "Telegram",
          steps: [
            { step: "format", status: "success", label: "Found Telegram post link" },
            { step: "connection", status: "success", label: "Extracted video URL and caption" },
            { step: "filetype", status: "success", label: isCompatible ? "Browser-compatible MP4" : "Transcoding for browser" },
            { step: "streaming", status: "success", label: "Preparing stream" },
            { step: "preparing", status: "success", label: "Launching player" },
          ],
        });

        setPendingStream(true);
        setTimeout(() => {
          setStreamData(sd);
          setPendingStream(false);
        }, 700);
      } catch {
        triggerError("Connection error while extracting Telegram video. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- Case 3: Other t.me link (invite/group/etc.) that isn't a post ---
    if (isTelegramShareLink(targetUrl)) {
      triggerError(
        "Only public channel post links work here (e.g. t.me/channel/123). Invite links and private group links are not supported."
      );
      setLoading(false);
      return;
    }

    // --- Case 4: Generic URL ---
    triggerError("Please paste a valid Telegram post link (e.g. https://t.me/channel/123) or Telegram CDN URL.");
    setLoading(false);
  };

  /**
   * Seamless fallback if direct video proxy encounters playback error in browser
   * (e.g. unusual audio profile, missing moov atom, corrupted atom)
   */
  const handlePlayerError = (type: string, details: string) => {
    if (streamData && !streamData.isTranscoded && !isTranscodingFallback) {
      console.warn("Direct playback failed, switching to live transcoder...", type, details);
      setIsTranscodingFallback(true);
      const transcodeUrl = `/api/telegram-transcode?url=${encodeURIComponent(streamData.originalCdnUrl)}`;
      setStreamData({
        ...streamData,
        videoUrl: transcodeUrl,
        isTranscoded: true,
      });
    } else {
      setError(`Video playback error: ${details}. The Telegram video link may have expired or is unsupported.`);
      setStreamData(null);
    }
  };

  // -----------------------------------------------------------------------
  // RENDER: Input screen
  // -----------------------------------------------------------------------

  if (!streamData) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="input"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-5 w-full max-w-2xl mx-auto"
        >
          {/* Input row */}
          <motion.div
            className="flex flex-col md:flex-row items-center gap-3 w-full"
            animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.35 }}
          >
            <div className="relative w-full group">
              <div className="relative flex items-center rounded-xl px-4 py-3 bg-surface border border-black/10 dark:border-white/10 group-focus-within:border-black/30 dark:group-focus-within:border-white/30 transition-colors z-10">
                {isValidInput ? (
                  <CheckCircle2 className="mr-3 text-emerald-500 w-5 h-5 shrink-0" />
                ) : (
                  <Send className="mr-3 text-on-surface-variant/50 w-5 h-5 shrink-0" />
                )}
                <input
                  className="bg-transparent border-none text-sm sm:text-base text-on-surface focus:ring-0 w-full placeholder:text-on-surface-variant/40 outline-none pr-8 truncate"
                  placeholder="Paste t.me/channel/123 or Telegram CDN URL…"
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                    setValidationResponse(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleStream()}
                />
                <AnimatePresence>
                  {url && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      onClick={() => {
                        setUrl("");
                        setError("");
                        setValidationResponse(null);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"
                    >
                      <X className="w-[17px] h-[17px]" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              onClick={() => handleStream()}
              disabled={loading || !isValidInput}
              className="w-full md:w-auto px-6 py-[13px] rounded-xl font-bold text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 whitespace-nowrap shrink-0 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed min-w-[130px] flex justify-center items-center gap-2 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,#0088cc,#00b4d8)" }}
            >
              <span className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Loading…</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current shrink-0" />
                    <span>Play Video</span>
                  </>
                )}
              </span>
            </button>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation steps */}
          {validationResponse && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
              <ValidationSteps
                isValidating={loading}
                validationResponse={validationResponse}
                isLaunching={pendingStream}
              />
            </motion.div>
          )}

          {/* How-to guide */}
          <div className="border-t border-black/5 dark:border-white/5 pt-4">
            <button
              onClick={() => setShowGuide((v) => !v)}
              className="flex w-full items-center gap-2 text-xs text-on-surface-variant/70 hover:text-[#0088cc] transition-colors"
            >
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">How to get a Telegram video link?</span>
              <span className="ml-auto">{showGuide ? "▲" : "▼"}</span>
            </button>
            <AnimatePresence>
              {showGuide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="mt-3 p-4 rounded-xl text-xs leading-relaxed space-y-3 text-on-surface-variant"
                    style={{ background: "rgba(0,136,204,0.06)", border: "1px solid rgba(0,136,204,0.15)" }}
                  >
                    <p className="font-semibold text-on-surface">Supported formats:</p>
                    <div>
                      <p className="font-medium mb-1">① Public post link</p>
                      <p>
                        Right-click or tap any video post in a public channel and select <strong>Copy Post Link</strong> — e.g.{" "}
                        <code className="bg-black/10 dark:bg-white/10 px-1 rounded">https://t.me/channel/123</code>.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">② Direct CDN URL</p>
                      <p>
                        In Telegram Web, copy video address starting with{" "}
                        <code className="bg-black/10 dark:bg-white/10 px-1 rounded">cdn1.telesco.pe</code> or{" "}
                        <code className="bg-black/10 dark:bg-white/10 px-1 rounded">cdn.telegram.org</code>.
                      </p>
                    </div>
                    <p className="text-on-surface-variant/50 text-[11px]">
                      ⚠️ Note: Private channels, direct messages, and invite links are restricted by Telegram and cannot be streamed.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // -----------------------------------------------------------------------
  // RENDER: Player screen
  // -----------------------------------------------------------------------

  const playerDims = getPlayerDimensions(streamData.width, streamData.height);
  const downloadUrl = `/api/telegram-download?url=${encodeURIComponent(streamData.originalCdnUrl)}&filename=${encodeURIComponent(
    (streamData.title || "telegram-video").replace(/[^a-zA-Z0-9_-]/g, "_") + ".mp4"
  )}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="player"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 1.03 }}
        transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
        className="w-full flex flex-col gap-4"
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setStreamData(null);
              setValidationResponse(null);
              setError("");
              setIsTranscodingFallback(false);
            }}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors group text-sm font-medium"
          >
            <div className="p-1.5 rounded-full bg-surface-container-high group-hover:bg-[#0088cc]/10 group-hover:text-[#0088cc] transition-all">
              <Play className="w-3.5 h-3.5 rotate-180 fill-current" />
            </div>
            New Video
          </button>

          <div className="flex items-center gap-2">
            <a
              href={downloadUrl}
              download
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-105 active:scale-95 shadow-sm"
              style={{
                color: "#0088cc",
                borderColor: "rgba(0,136,204,0.3)",
                background: "rgba(0,136,204,0.08)",
              }}
              title="Download original Telegram video in full quality"
            >
              <Download className="w-3.5 h-3.5" />
              Download Video
            </a>

            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
              style={{
                color: "#0088cc",
                borderColor: "rgba(0,136,204,0.2)",
                background: "rgba(0,136,204,0.08)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#0088cc] animate-pulse" />
              {streamData.isTranscoded ? "Transcoded" : "Telegram Native"}
            </div>
          </div>
        </div>

        {/* ── Video Player (Naturally sized to match video aspect ratio) ── */}
        <div className="mx-auto w-full flex justify-center" style={{ maxWidth: playerDims.maxWidth }}>
          <div className="w-full">
            <CustomPlayer
              src={streamData.videoUrl}
              poster={streamData.thumbnail || undefined}
              title={streamData.title || "Telegram Video"}
              aspectRatio={playerDims.aspectRatio}
              onFatalError={handlePlayerError}
            />
          </div>
        </div>

        {/* ── Caption (Original post text below video player) ── */}
        {streamData.caption && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto w-full"
            style={{ maxWidth: playerDims.maxWidth }}
          >
            <div
              className="px-5 py-4 rounded-xl text-sm text-on-surface leading-relaxed whitespace-pre-line border shadow-sm"
              style={{
                background: "rgba(0,136,204,0.04)",
                borderColor: "rgba(0,136,204,0.15)",
              }}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#0088cc] mb-1.5 flex items-center gap-1">
                <span>Caption</span>
              </div>
              <div className="break-words font-[family-name:var(--font-dm-sans)]">
                {streamData.caption}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Bottom Controls & Download Action Bar ── */}
        <div
          className="mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl border"
          style={{
            maxWidth: playerDims.maxWidth,
            borderColor: "rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div className="min-w-0">
            {streamData.title && (
              <p className="text-sm font-semibold text-on-surface truncate">{streamData.title}</p>
            )}
            <div className="flex items-center gap-3 text-[11px] text-on-surface-variant/60 mt-0.5">
              {streamData.width && streamData.height && (
                <span>
                  {streamData.width} × {streamData.height}
                </span>
              )}
              {streamData.isTranscoded && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Sparkles className="w-3 h-3" /> Transcoded for web compatibility
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Prominent Download Button */}
            <a
              href={downloadUrl}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] active:scale-95 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download Video
            </a>

            <button
              onClick={() => {
                setStreamData(null);
                handleStream(streamData.postUrl);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface border border-black/10 dark:border-white/10 hover:border-white/20 transition-all"
              title="Reload stream"
            >
              <RefreshCw className="w-3 h-3" />
              Reload
            </button>
            <a
              href={streamData.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-[#0088cc] border border-black/10 dark:border-white/10 hover:border-[#0088cc]/30 transition-all"
              title="View original post on Telegram"
            >
              <ExternalLink className="w-3 h-3" />
              Telegram
            </a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

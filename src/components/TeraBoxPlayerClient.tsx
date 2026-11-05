"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  X,
  AlertTriangle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Film,
  HardDrive,
  Sparkles,
  Info,
  ShieldAlert,
} from "lucide-react";
import { isTeraBoxUrl, parseTeraBoxUrl } from "@/lib/streaming/terabox";
import { ValidationSteps } from "@/components/ValidationSteps";
import type { ValidationResponse } from "@/types/validation";

const CustomPlayer = dynamic(() => import("@/components/CustomPlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] flex items-center justify-center bg-black/60 rounded-2xl">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  ),
});

interface TeraBoxStreamResult {
  mode: "direct" | "embed";
  videoUrl?: string;
  embedUrl: string;
  title: string;
  thumbnail?: string | null;
  fileSize?: number | null;
  fileSizeFormatted?: string | null;
  downloadUrl?: string | null;
  rawUrl: string;
  surl?: string;
  notice?: string;
}

export default function TeraBoxPlayerClient() {
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ rawUrl?: string; isPasswordProtected?: boolean; isExpired?: boolean } | null>(null);
  const [streamResult, setStreamResult] = useState<TeraBoxStreamResult | null>(null);
  const [validationResponse, setValidationResponse] = useState<ValidationResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text.trim());
        setError(null);
      }
    } catch {
      // Clipboard access denied
    }
  };

  const handleClear = () => {
    setInputUrl("");
    setError(null);
    setErrorDetails(null);
    setStreamResult(null);
    setValidationResponse(null);
  };

  const triggerError = (msg: string, details?: { rawUrl?: string; isPasswordProtected?: boolean; isExpired?: boolean }) => {
    setError(msg);
    setErrorDetails(details || null);
    setValidationResponse({
      valid: false,
      error: msg,
      steps: [
        { step: "format", status: "success", label: "Validating TeraBox link" },
        { step: "connection", status: "error", message: msg, label: "Connecting to TeraBox" },
      ],
    });
  };

  const handleResolveAndPlay = async (targetUrlOverride?: string) => {
    const targetUrl = (targetUrlOverride || inputUrl).trim();
    if (!targetUrl) {
      triggerError("Please paste a TeraBox share link.");
      return;
    }

    if (!isTeraBoxUrl(targetUrl)) {
      triggerError(
        "Invalid domain. Supported TeraBox links include terabox.com, 1024tera.com, teraboxapp.com, 4funbox.com, mirrobox.com, or freeterabox.com."
      );
      return;
    }

    const parsed = parseTeraBoxUrl(targetUrl);
    if (!parsed.isValid) {
      triggerError(parsed.error || "Could not find a valid TeraBox share key in this link.");
      return;
    }

    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setStreamResult(null);
    setLoadingMsg("Validating TeraBox link format…");

    setValidationResponse({
      valid: true,
      steps: [
        { step: "format", status: "success", label: "Validating TeraBox share link" },
        { step: "connection", status: "checking", label: "Querying TeraBox public gateway" },
        { step: "filetype", status: "pending", label: "Resolving public stream" },
        { step: "streaming", status: "pending", label: "Preparing cloud player" },
        { step: "preparing", status: "pending", label: "Launching player" },
      ],
    });

    try {
      setLoadingMsg("Connecting to TeraBox network…");
      const res = await fetch("/api/terabox-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        triggerError(data.error || "Failed to resolve TeraBox video.", {
          rawUrl: targetUrl,
          isPasswordProtected: data.passwordProtected,
          isExpired: data.expired,
        });
        setLoading(false);
        return;
      }

      setLoadingMsg("Loading stream into browser player…");

      setValidationResponse({
        valid: true,
        steps: [
          { step: "format", status: "success", label: "Validating TeraBox share link" },
          { step: "connection", status: "success", label: "Connected to TeraBox" },
          { step: "filetype", status: "success", label: "Detected video stream" },
          { step: "streaming", status: "success", label: "Stream ready" },
          { step: "preparing", status: "success", label: "Launching player" },
        ],
      });

      setStreamResult(data);
    } catch (err: any) {
      triggerError(err?.message || "Network error while connecting to TeraBox.", { rawUrl: targetUrl });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (streamResult?.rawUrl) {
      navigator.clipboard.writeText(streamResult.rawUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Search / Input Box */}
      <div className="flex flex-col gap-3">
        <div className="relative flex items-center w-full">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleResolveAndPlay()}
            placeholder="Paste TeraBox video link (e.g. https://terabox.com/s/1... or 1024tera.com/s/...)"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl px-5 py-4 text-[15px] font-[family-name:var(--font-dm-sans)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all pr-[120px]"
          />

          <div className="absolute right-3 flex items-center gap-2">
            {inputUrl && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-lg"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {!inputUrl && (
              <button
                type="button"
                onClick={handlePaste}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-500/40 transition-colors font-medium flex items-center gap-1.5"
              >
                <span>Paste</span>
              </button>
            )}

            <button
              type="button"
              disabled={loading || !inputUrl.trim()}
              onClick={() => handleResolveAndPlay()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(37,99,235,0.25)] flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Playing…</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hints & Supported Domains */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Supported: terabox.com, 1024tera.com, teraboxapp.com, freeterabox.com, 4funbox.com</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[var(--text-muted)]">No login required · Free</span>
          </div>
        </div>
      </div>

      {/* Validation progress banner */}
      <AnimatePresence>
        {validationResponse && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <ValidationSteps isValidating={loading} validationResponse={validationResponse} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state card with recovery options */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[15px] text-[var(--text-primary)] mb-1">
                  {errorDetails?.isPasswordProtected
                    ? "Password-Protected File"
                    : errorDetails?.isExpired
                    ? "File Unavailable"
                    : "Playback Notice"}
                </h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {error}
                </p>
                {errorDetails?.isPasswordProtected && (
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    TeraBox protects this file with an extraction code. You can enter the password directly on TeraBox using the button on the right.
                  </p>
                )}
              </div>
            </div>

            {errorDetails?.rawUrl && (
              <a
                href={errorDetails.rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] hover:border-blue-500/40 transition-colors shrink-0"
              >
                <span>Open in TeraBox</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Video Player Container */}
      <AnimatePresence>
        {streamResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 w-full"
          >
            {/* Player Card Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--bg-elevated)] border border-[var(--border)] p-4 rounded-2xl">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-600/30 flex items-center justify-center shrink-0 text-blue-500">
                  <Film className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="font-[family-name:var(--font-sora)] font-bold text-[15px] text-[var(--text-primary)] truncate">
                    {streamResult.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)]">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Active Stream · TeraBox Cloud</span>
                    {streamResult.fileSize && (
                      <>
                        <span>·</span>
                        <span>{(streamResult.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
                  title="Copy share link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Link"}</span>
                </button>

                <button
                  onClick={() => handleResolveAndPlay(streamResult.rawUrl)}
                  className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  title="Reload stream"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                {streamResult.downloadUrl && (
                  <a
                    href={streamResult.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 font-medium text-xs transition-colors flex items-center gap-1.5"
                    title="Direct Download File"
                  >
                    <span>Download</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <a
                  href={streamResult.rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 border border-blue-600/40 text-blue-400 hover:bg-blue-600/30 font-medium text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Open on TeraBox</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Video Viewport: Direct Player or Embed Player */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl">
              {streamResult.mode === "direct" && streamResult.videoUrl ? (
                <CustomPlayer
                  src={streamResult.videoUrl}
                  title={streamResult.title}
                  poster={streamResult.thumbnail}
                />
              ) : (
                <iframe
                  src={streamResult.embedUrl}
                  className="w-full h-full border-0"
                  title={streamResult.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-downloads allow-popups"
                />
              )}
            </div>

            {/* Player Usage Notice & Controls Tip */}
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-start gap-3 text-xs text-[var(--text-secondary)]">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-[var(--text-primary)]">Playback Controls: </span>
                Click the player to start streaming. Full scrubbing, volume, quality resolution (360p–1080p), and fullscreen toggle are accessible directly through the player interface. No login is needed to watch public TeraBox shares.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, Link2, X, History, Play, HardDrive, AlertTriangle 
} from "lucide-react";
import { ValidationSteps } from "@/components/ValidationSteps";
import type { ValidationResponse } from "@/types/validation";

const CustomPlayer = dynamic(() => import("@/components/CustomPlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[40vh] flex items-center justify-center text-white/60">
      Loading player…
    </div>
  ),
});

const FAQSection = dynamic(() => import("@/components/FAQSection"), {
  ssr: false,
});

const FeedbackModal = dynamic(
  () => import("@/components/FeedbackModal").then((m) => ({ default: m.FeedbackModal })),
  { ssr: false }
);

const InlineReportForm = dynamic(
  () => import("@/components/InlineReportForm").then((m) => ({ default: m.InlineReportForm })),
  { ssr: false }
);

interface HomeClientProps {
  // Add any props if needed
}

export default function HomeClient() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationResponse, setValidationResponse] = useState<ValidationResponse | null>(null);
  const [streamData, setStreamData] = useState<{ streamUrl: string, title: string, type: string } | null>(null);
  const [pendingStreamData, setPendingStreamData] = useState<{ streamUrl: string, title: string, type: string } | null>(null);
  const [recentStreams, setRecentStreams] = useState<{ url: string, title: string, type: string, date: number }[]>([]);
  const [shake, setShake] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const homeFaqs = [
    { q: "Is FluxPlays really free?", a: "Yes, completely. No accounts, no subscriptions, no hidden fees." },
    { q: "What video formats are supported?", a: "We support MP4, WEBM, HLS (m3u8), and direct links from Google Drive and Telegram." },
    { q: "Do I need to download anything?", a: "No. Everything happens in your browser using modern web standards." }
  ];

  const isValidUrl = (url.length > 5 && (url.startsWith('http') || url.startsWith('magnet:'))) || url.startsWith('tt');

  useEffect(() => {
    const saved = localStorage.getItem("instantStream_recent");
    if (saved) {
      try {
        setRecentStreams(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  const saveRecentStream = (data: { streamUrl: string, title: string, type: string }) => {
    const newStream = {
      url: data.streamUrl,
      title: data.title,
      type: data.type,
      date: Date.now(),
    };

    setRecentStreams(prev => {
      const filtered = prev.filter(s => s.url !== data.streamUrl);
      return [newStream, ...filtered].slice(0, 4);
    });
  };

  const handleStream = async (urlToStream?: string) => {
    const targetUrl = typeof urlToStream === 'string' ? urlToStream : url;
    if (!targetUrl) return;
    if (typeof urlToStream === 'string') setUrl(urlToStream);
    setLoading(true);
    setError("");
    setValidationResponse(null);
    setShowReportForm(false);
    setReportUrl("");

    if (targetUrl.startsWith('tt')) {
      try {
        setValidationResponse({
          valid: true,
          steps: [{ step: "connection", status: "checking", label: "Finding stream..." }]
        } as unknown as ValidationResponse);

        const res = await fetch(`/api/stream/${targetUrl}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "No demo stream available for this title");
          setValidationResponse({
            valid: false,
            steps: [{ step: "connection", status: "error", label: "Finding stream...", message: data.error || "No demo stream available for this title" }]
          } as unknown as ValidationResponse);
          setShake(true);
          setTimeout(() => setShake(false), 500);
        } else {
          setValidationResponse({
            valid: true,
            steps: [{ step: "connection", status: "success", label: "Finding stream..." }]
          } as unknown as ValidationResponse);
          const resolved = { streamUrl: data.url, title: `IMDb Stream: ${data.imdbId}`, type: data.type };
          setPendingStreamData(resolved);
          saveRecentStream(resolved);
          setTimeout(() => {
            setStreamData(resolved);
            setPendingStreamData(null);
          }, 1400);
        }
      } catch (err) {
        setError("An error occurred connecting to the server.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl })
      });
      const data: ValidationResponse = await res.json();
      setValidationResponse(data);

      if (!res.ok) {
        setError(data.error || "Validation failed");
        setReportUrl(targetUrl);
        setShowReportForm(true);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        const resolved = { streamUrl: data.streamUrl || targetUrl, title: data.title || "", type: data.type || "" };
        setPendingStreamData(resolved);
        saveRecentStream(resolved);
        setTimeout(() => {
          setStreamData(resolved);
          setPendingStreamData(null);
        }, 1400);
      }
    } catch (err) {
      setError("An error occurred connecting to the server.");
      setReportUrl(targetUrl);
      setShowReportForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFatalError = (type: string, details: string) => {
    setError(`Playback error: ${type} — ${details}`);
    setReportUrl(url);
    setShowReportForm(true);
  };

  return (
    <AnimatePresence mode="wait">
      {!streamData ? (
        <motion.div
          key="home"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)", y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex flex-col gap-6 w-full max-w-2xl mx-auto"
        >
          <motion.div
            className="flex flex-col md:flex-row items-center justify-center gap-stack-sm w-full"
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="relative w-full group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-tertiary rounded-xl opacity-20 group-focus-within:opacity-60 transition duration-500 blur-md ${isValidUrl ? 'opacity-50 animate-pulse' : ''}`}></div>
              <div className="relative flex items-center bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 transition-all duration-300 group-focus-within:border-primary/50 group-focus-within:shadow-[0_0_20px_rgba(0,112,243,0.15)] group-hover:border-primary/30 z-10">
                {isValidUrl ? (
                  <CheckCircle2 className="mr-2 transition-colors text-primary w-5 h-5 shrink-0" />
                ) : (
                  <Link2 className="mr-2 transition-colors text-on-surface-variant w-5 h-5 shrink-0" />
                )}
                <input
                  className="bg-transparent border-none text-sm sm:text-base text-on-surface focus:ring-0 w-full placeholder:text-on-surface-variant/40 font-body-md outline-none pr-8 truncate"
                  placeholder="Paste MP4, Drive, Telegram, or video URL…"
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(""); setShowReportForm(false); setReportUrl(""); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleStream()}
                />
                <AnimatePresence>
                  {url && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => { setUrl(""); setError(""); setShowReportForm(false); setReportUrl(""); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors flex items-center justify-center"
                    >
                      <X className="w-[18px] h-[18px]" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <button
              onClick={() => handleStream()}
              disabled={loading}
              className="w-full md:w-auto px-8 py-4 premium-button-gradient button-glow-ring rounded-xl font-bold text-on-primary shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 whitespace-nowrap disabled:opacity-90 disabled:scale-100 cursor-pointer disabled:cursor-not-allowed min-w-[180px] flex justify-center items-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <div className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Validating...</span>
                  </motion.div>
                ) : (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Stream Now</motion.span>
                )}
              </div>
            </button>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full -mt-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm text-left flex items-start gap-2"
            >
              <AlertTriangle className="text-error w-5 h-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {validationResponse && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <ValidationSteps
                isValidating={loading}
                validationResponse={validationResponse}
                isLaunching={!!pendingStreamData}
              />
            </motion.div>
          )}

          <AnimatePresence>
            {showReportForm && (
              <motion.div
                key={reportUrl}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <InlineReportForm
                  key={reportUrl}
                  videoUrl={reportUrl}
                  onDismiss={() => setShowReportForm(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {recentStreams.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mt-2 flex flex-col items-center"
            >
              <div className="flex flex-wrap justify-center gap-2 items-center">
                <span className="w-full md:w-auto text-center justify-center md:justify-start text-xs font-label-sm uppercase tracking-wider text-on-surface-variant flex items-center gap-1 md:mr-2 mb-1 md:mb-0">
                  <History className="w-[14px] h-[14px]" />
                  Recent
                </span>
                {recentStreams.map((stream, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStream(stream.url)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-surface-container-lowest hover:bg-surface-container-low hover:border-primary/30 transition-all group cursor-pointer max-w-[200px]"
                    title={stream.title}
                  >
                    {stream.type === 'Google Drive' ? (
                      <HardDrive className="text-primary w-[14px] h-[14px] shrink-0" />
                    ) : (
                      <Play className="text-primary w-[14px] h-[14px] fill-current shrink-0" />
                    )}
                    <span className="text-xs font-medium text-on-surface truncate">{stream.title}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="player"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="w-full max-w-[1400px] mx-auto px-container-padding-mobile md:px-container-padding-desktop pb-20"
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStreamData(null)}
                className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors group"
              >
                <div className="p-2 rounded-full bg-surface-container-high group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <Play className="w-4 h-4 rotate-180 fill-current" />
                </div>
                <span className="text-sm font-medium">New Stream</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{streamData.type || 'Direct Stream'}</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-video w-full rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
              <CustomPlayer
                src={streamData.streamUrl}
                onFatalError={handleFatalError}
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel rounded-2xl border border-black/5">
              <div>
                <h2 className="text-lg font-bold text-on-surface">{streamData.title || "Unknown Stream"}</h2>
                <p className="text-sm text-on-surface-variant truncate max-w-md">{streamData.streamUrl}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowReportForm(true); setReportUrl(streamData.streamUrl); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-error/10 hover:text-error hover:border-error/20 transition-all text-sm font-medium"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      <FAQSection faqs={homeFaqs} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </AnimatePresence>
  );
}

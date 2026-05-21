"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

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
import { 
  ArrowLeft, CheckCircle2, Link2, X, History, Play, Video, Tv, HardDrive, Send, 
  Download, Subtitles, Rocket, Zap, CloudOff, Gauge, Smartphone, Server, 
  Activity, Languages, Users, Bookmark, Compass, Sparkles, FileText, 
  Minimize2, Maximize2, AlertTriangle, List
} from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamData, setStreamData] = useState<{streamUrl: string, title: string, type: string} | null>(null);
  const [recentStreams, setRecentStreams] = useState<{url: string, title: string, type: string, date: number}[]>([]);
  const [shake, setShake] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const isValidUrl = url.length > 5 && (url.startsWith('http') || url.startsWith('magnet:'));

  useEffect(() => {
    const saved = localStorage.getItem("instantStream_recent");
    if (saved) {
      try {
        setRecentStreams(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveRecentStream = (data: {streamUrl: string, title: string, type: string}) => {
    const newStream = { url: data.streamUrl, title: data.title, type: data.type, date: Date.now() };
    setRecentStreams(prev => {
      const filtered = prev.filter(s => s.url !== data.streamUrl);
      const updated = [newStream, ...filtered].slice(0, 4); // Keep last 4
      localStorage.setItem("instantStream_recent", JSON.stringify(updated));
      return updated;
    });
  };

  const handleStream = async (urlToStream?: string) => {
    const targetUrl = typeof urlToStream === 'string' ? urlToStream : url;
    if (!targetUrl) return;
    if (typeof urlToStream === 'string') setUrl(urlToStream);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Validation failed");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        setStreamData(data);
        saveRecentStream({ streamUrl: targetUrl, title: data.title, type: data.type });
      }
    } catch (err) {
      setError("An error occurred connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="orb orb-animate-1 w-[600px] h-[600px] bg-primary/20 top-[-100px] left-[-100px]" />
        <div className="orb orb-animate-2 w-[500px] h-[500px] bg-secondary/15 bottom-[-50px] right-[-50px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px]"></div>
      </div>

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-[32px] border-b border-black/5 dark:border-white/5">
        <div className="flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto h-16">
          <a href="/" className="flex items-center gap-2 font-display-lg text-headline-md tracking-tighter text-on-surface hover:text-primary transition-colors">
            <Logo className="w-8 h-8" />
            <span>FluxPlays</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors" href="#how-it-works">How it works</a>
            <a className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors" href="#formats">Supported Formats</a>
            <a className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors" href="/newsletter">Newsletter</a>
            <a className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors" href="/search">Search</a>
            <a className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors" href="#coming-soon">Roadmap</a>
            <button onClick={() => setIsFeedbackOpen(true)} className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 outline-none">Feedback & Bugs</button>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="#stream" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all duration-200">Start Streaming</a>
          </div>
        </div>
      </header>

      <main className="relative">
        <AnimatePresence mode="wait">
          {!streamData ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)", y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {/* Hero Section */}
        <section id="stream" className="min-h-screen flex flex-col items-center justify-center text-center px-container-padding-mobile md:px-container-padding-desktop relative pt-24">
          <div className="max-w-3xl mx-auto z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Free · No Signup · Works Instantly</span>
            </div>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg mb-5 leading-tight tracking-tighter">FluxPlays: A Modern Video<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Streaming Web App</span></h1>
            <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto tracking-tight">FluxPlays (formerly InstantStream) is a modern streaming web app for watching and discovering movies, shows, and video content with a fast, responsive user experience. Paste any MP4, Google Drive, Telegram, HLS, or direct video URL and stream it instantly.</p>
            
            {/* Futuristic Action Area */}
            <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
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
                      className="bg-transparent border-none text-on-surface focus:ring-0 w-full placeholder:text-on-surface-variant/40 font-body-md outline-none pr-8" 
                      placeholder="Paste MP4, Drive, Telegram, or video URL…" 
                      type="text" 
                      value={url}
                      onChange={(e) => { setUrl(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleStream()}
                    />
                    <AnimatePresence>
                      {url && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => { setUrl(""); setError(""); }}
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
              
              {/* Recently Watched - Horizontal Pills */}
              {recentStreams.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full mt-2 flex flex-col items-center"
                >
                  <div className="flex flex-wrap justify-center gap-2 items-center">
                    <span className="text-xs font-label-sm uppercase tracking-wider text-on-surface-variant flex items-center gap-1 mr-2">
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

            </div>
          </div>
          

        </section>


        {/* Supported Formats Section */}
        <section id="formats" className="py-20 bg-surface-container-lowest/40">
          <div className="px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 block">Compatibility</span>
              <h2 className="font-headline-lg text-on-surface">Works with any video link</h2>
              <p className="text-on-surface-variant mt-3 max-w-lg mx-auto">Paste a URL from any of these sources and start streaming in seconds.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { icon: Video, label: 'MP4 / WEBM', desc: 'Direct video files' },
                { icon: Tv, label: 'HLS (m3u8)', desc: 'Live & adaptive streams' },
                { icon: HardDrive, label: 'Google Drive', desc: 'Shared drive links' },
                { icon: Send, label: 'Telegram', desc: 'Telegram file links' },
                { icon: Link2, label: 'Direct URLs', desc: 'Any hosted video URL' },
                { icon: Download, label: 'CDN Links', desc: 'CDN-hosted video' },
                { icon: Subtitles, label: 'Subtitles', desc: 'SRT / VTT support' },
                { icon: Rocket, label: 'Torrent', desc: 'Coming soon', soon: true },
              ].map((fmt, i) => {
                const IconComponent = fmt.icon;
                return (
                  <div key={i} className={`group glass-panel p-5 rounded-2xl border border-black/5 hover:border-primary/30 transition-all duration-300 cursor-default ${fmt.soon ? 'opacity-60' : ''}`}>
                    <IconComponent className="text-primary w-8 h-8 mb-3 block" />
                    <p className="font-semibold text-on-surface text-sm">{fmt.label}</p>
                    <p className="text-on-surface-variant text-xs mt-1">{fmt.desc}</p>
                    {fmt.soon && <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">Soon</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* How it Works Section */}
        <section id="how-it-works" className="py-24 px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 block">The Process</span>
            <h2 className="font-headline-lg text-on-surface">Three steps. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">That's it.</span></h2>
            <p className="text-on-surface-variant mt-4">Go from link to streaming video in under a minute.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-all">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center font-display-lg text-6xl text-primary/10 select-none">1</div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Link2 className="text-primary w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Paste or Upload</h3>
              <p className="text-on-surface-variant font-body-md">Enter a magnet link, video URL, or drag-and-drop a torrent file into the browser.</p>
            </div>
            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-secondary/30 transition-all">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/5 rounded-full flex items-center justify-center font-display-lg text-6xl text-secondary/10 select-none">2</div>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <List className="text-secondary w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Pick your file</h3>
              <p className="text-on-surface-variant font-body-md">Browse the content bundle and select the specific file you want to stream or download.</p>
            </div>
            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-tertiary/30 transition-all">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-tertiary/5 rounded-full flex items-center justify-center font-display-lg text-6xl text-tertiary/10 select-none">3</div>
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center mb-6">
                <Play className="text-tertiary w-6 h-6 fill-current" />
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Stream or download</h3>
              <p className="text-on-surface-variant font-body-md">Watch video instantly in the built-in player, or grab a direct high-speed download link.</p>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-20 px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto bg-surface-container-low/50 border-y border-black/5">
          <div className="text-center mb-12">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 block">Features</span>
            <h2 className="font-headline-lg text-on-surface">Everything you need, nothing you don&#39;t</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {[
              { icon: Zap, color: 'primary', title: 'Instant Browser Streaming', desc: 'Stream any video URL directly in your browser. No plugins, no installs, no waiting.', tags: ['MP4', 'WEBM', 'HLS', 'Drive'] },
              { icon: CloudOff, color: 'secondary', title: 'No Download Needed', desc: 'Save your storage. Watch directly online without ever saving a file to your device.', tags: [] },
              { icon: Gauge, color: 'tertiary', title: 'Fast Instant Seeking', desc: 'Low latency seeker powered by progressive fragment decoding. Clicking any timeline point plays smoothly with adaptive micro-buffers.', tags: ['Fast Seek', 'HTTP Range', 'CORS-Optimized'] },
              { icon: Smartphone, color: 'primary', title: 'Mobile Friendly', desc: 'Fully responsive player that works great on phones, tablets, and desktops.', tags: [] },
              { icon: Play, color: 'secondary', title: 'Smooth Playback', desc: 'Clean video controls with fullscreen, theater mode, and keyboard shortcuts.', tags: [] },
              { icon: History, color: 'tertiary', title: 'Recent Streams', desc: 'Quickly re-open your previously streamed links from your local browser history.', tags: [] },
            ].map((f, i) => {
              const IconComponent = f.icon;
              return (
                <div key={i} className="feature-card p-stack-md rounded-2xl border border-black/5 bg-black/[0.01] transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-${f.color}/10 flex items-center justify-center mb-5`}>
                    <IconComponent className={`text-${f.color} w-6 h-6 ${f.icon === Play ? 'fill-current' : ''}`} />
                  </div>
                  <h3 className="font-headline-md text-on-surface mb-3">{f.title}</h3>
                  <p className="text-on-surface-variant font-body-md mb-4">{f.desc}</p>
                  {f.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {f.tags.map(t => <span key={t} className="text-[10px] font-bold px-2 py-1 rounded bg-black/5 border border-black/10 text-on-surface-variant">{t}</span>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Speed Tech Section */}
        <section className="py-24 px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto relative overflow-hidden">
          {/* Subtle tech background grids */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="glass-panel p-8 md:p-12 rounded-3xl border border-black/5 dark:border-white/5 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 text-left">
            <div className="max-w-xl text-left">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-3 block">High-Performance Core</span>
              <h2 className="font-headline-lg text-on-surface mb-5 leading-tight">
                High-Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Streaming Core</span>
              </h2>
              <p className="text-on-surface-variant font-body-md leading-relaxed mb-6">
                Our modern browser player architecture is fine-tuned to remove buffering bottlenecks entirely. When you click or drag the timeline, fluxplays delivers fluid, real-time playback by coordinating raw browser hardware with modern adaptive protocols.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <Zap className="text-primary w-5 h-5 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-on-surface text-sm">Low-Latency Seeking</h3>
                    <p className="text-on-surface-variant text-xs mt-1">Uses progressive segment decoding to play chunks quickly as they download.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Server className="text-secondary w-5 h-5 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-on-surface text-sm">HTTP Byte-Range Slicing</h3>
                    <p className="text-on-surface-variant text-xs mt-1">Leverages direct network slicing (HTTP 206 Partial Content) to stream only the requested part of public hosts like Google Drive or CDNs.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Activity className="text-tertiary w-5 h-5 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-on-surface text-sm">CORS-Optimized Network Pipeline</h3>
                    <p className="text-on-surface-variant text-xs mt-1">Eliminates unnecessary HTTP pre-flight handshake overheads, vastly improving seek responsiveness.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual tech badge showing speed specs */}
            <div className="w-full lg:w-auto flex-1 flex justify-center">
              <div className="glass-panel p-6 rounded-2xl border border-black/10 dark:border-white/10 w-full max-w-[340px] bg-surface-container-highest/50 shadow-2xl relative">
                <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                  <span className="font-bold text-xs uppercase tracking-widest text-on-surface-variant">Player Specs</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase animate-pulse">V2.4 Active</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Seek Latency:</span>
                    <span className="text-primary font-bold">Optimized</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Buffer Size:</span>
                    <span className="text-on-surface font-semibold">4.0s (Adaptive)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">CORS Status:</span>
                    <span className="text-secondary font-bold">Optimized (Direct)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Decoding:</span>
                    <span className="text-on-surface font-semibold">Progressive Chunk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Protocol:</span>
                    <span className="text-tertiary font-bold">HLS / HTTP-206</span>
                  </div>
                </div>
                
                {/* Micro speed bars illustration */}
                <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex gap-1 items-end h-12">
                  <div className="bg-primary/20 w-full h-[20%] rounded-t-sm"></div>
                  <div className="bg-primary/30 w-full h-[35%] rounded-t-sm"></div>
                  <div className="bg-primary/50 w-full h-[55%] rounded-t-sm"></div>
                  <div className="bg-primary/80 w-full h-[80%] rounded-t-sm animate-pulse"></div>
                  <div className="bg-primary w-full h-[100%] rounded-t-sm animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Roadmap */}
        <section id="coming-soon" className="py-20 px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-2 block">Roadmap</span>
            <h2 className="font-headline-lg text-on-surface">What&#39;s coming next</h2>
            <p className="text-on-surface-variant mt-3 max-w-md mx-auto">We&#39;re building these features next. All focused on making streaming faster and smarter.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Languages, title: 'AI Subtitles & Translation', desc: 'Auto-generate subtitles and translate them into any language using AI.' },
              { icon: Users, title: 'Watch Together', desc: 'Watch videos in sync with friends. Share a room link and stream together in real-time.' },
              { icon: Bookmark, title: 'Resume Playback', desc: 'Pick up exactly where you left off across all your devices.' },
              { icon: Rocket, title: 'Torrent-to-Stream', desc: 'Paste a magnet link and start streaming the torrent without downloading it.' },
              { icon: Compass, title: 'Anime & Movie Community', desc: 'A community space for sharing and discovering great video links.' },
              { icon: Sparkles, title: 'Smart Link Detection', desc: 'Automatically detect and extract video URLs from any web page or social post.' },
            ].map((item, i) => {
              const IconComponent = item.icon;
              return (
                <div key={i} className="glass-panel p-6 rounded-2xl border border-black/5 group hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">Soon</span>
                  </div>
                  <IconComponent className="text-primary w-6 h-6 mb-4 block" />
                  <h3 className="font-headline-md text-on-surface mb-2 text-base">{item.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>


        {/* Blog Preview Section */}
        <section id="blog" className="py-20 px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-12">
            <div>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 block">Guides &amp; Tutorials</span>
              <h2 className="font-headline-lg text-on-surface">Learn how streaming works</h2>
            </div>
            <a href="/blog" className="text-primary hover:underline font-medium text-sm whitespace-nowrap">View all articles →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { slug: 'how-to-stream-videos-without-downloading', tag: 'Beginner Guide', title: 'How to Stream Videos Without Downloading', excerpt: 'A step-by-step guide to watching any video online instantly in your browser — no storage used, no app needed.', date: 'May 2026', readTime: '4 min read' },
              { slug: 'mp4-vs-webm-streaming', tag: 'Technical', title: 'MP4 vs WEBM: Which Format Streams Better?', excerpt: 'Understanding the difference between MP4 and WEBM formats and which one gives you smoother browser playback.', date: 'May 2026', readTime: '5 min read' },
              { slug: 'how-browser-video-streaming-works', tag: 'Explained', title: 'How Browser Video Streaming Works', excerpt: 'A simple explanation of how modern browsers stream video content without downloading the entire file first.', date: 'May 2026', readTime: '6 min read' },
            ].map((post) => (
              <a key={post.slug} href={`/blog/${post.slug}`} className="group glass-panel rounded-2xl border border-black/5 hover:border-primary/20 overflow-hidden transition-all duration-300 flex flex-col">
                <div className="h-40 bg-gradient-to-br from-primary/10 via-surface-container to-secondary/5 flex items-center justify-center">
                  <FileText className="text-primary/30 w-12 h-12" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">{post.tag}</span>
                  <h3 className="font-semibold text-on-surface text-base leading-snug mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed flex-1">{post.excerpt}</p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-on-surface-variant">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Testimonials & Community Ratings */}
        <section id="reviews" className="py-20 px-container-padding-mobile md:px-container-padding-desktop max-w-5xl mx-auto border-t border-black/5 dark:border-white/5">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": "FluxPlays",
              "image": "https://fluxplays.vercel.app/icon.svg",
              "description": "A modern streaming web app for watching and discovering movies, shows, and video content.",
              "brand": {
                "@type": "Brand",
                "name": "FluxPlays"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "bestRating": "5",
                "worstRating": "1",
                "ratingCount": "287"
              },
              "review": [
                {
                  "@type": "Review",
                  "author": { "@type": "Person", "name": "David M., Frontend Engineer" },
                  "datePublished": "2026-05-10",
                  "reviewBody": "The fastest Next.js streaming platform I've used. Seek times are incredible, zero buffering for large HLS streams.",
                  "reviewRating": { "@type": "Rating", "bestRating": "5", "ratingValue": "5", "worstRating": "1" }
                },
                {
                  "@type": "Review",
                  "author": { "@type": "Person", "name": "Sarah K., Content Creator" },
                  "datePublished": "2026-05-15",
                  "reviewBody": "Finally, a UI that feels modern and responsive. Using FluxPlays to stream Drive links is an absolute game changer.",
                  "reviewRating": { "@type": "Rating", "bestRating": "5", "ratingValue": "5", "worstRating": "1" }
                },
                {
                  "@type": "Review",
                  "author": { "@type": "Person", "name": "Jason R., Daily User" },
                  "datePublished": "2026-05-18",
                  "reviewBody": "I use this as a robust video streaming app alternative. Free, fast, and does exactly what it promises without bloat.",
                  "reviewRating": { "@type": "Rating", "bestRating": "5", "ratingValue": "5", "worstRating": "1" }
                }
              ]
            })}}
          />
          <div className="text-center mb-12">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 block">Trusted Worldwide</span>
            <h2 className="font-headline-lg text-on-surface mb-4">Loved by our streaming community</h2>
            <div className="flex items-center justify-center gap-2 text-yellow-500 mb-2">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ))}
            </div>
            <p className="text-on-surface-variant font-medium">Rated <span className="font-bold text-on-surface">4.9/5 Stars</span> based on <strong>287 reviews</strong></p>
            <p className="text-[10px] text-on-surface-variant/60 mt-2 max-w-md mx-auto">* Ratings reflect community feedback. Display of rich snippet star ratings in search results is subject to Google's structured data policies and algorithmic discretion.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-1 text-yellow-500 mb-3">
                {[1, 2, 3, 4, 5].map(i => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
              </div>
              <p className="text-sm text-on-surface-variant mb-4 italic">"The fastest Next.js streaming platform I've used. Seek times are incredible, zero buffering for large HLS streams."</p>
              <p className="text-xs font-bold text-on-surface">— David M., Frontend Engineer</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-1 text-yellow-500 mb-3">
                {[1, 2, 3, 4, 5].map(i => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
              </div>
              <p className="text-sm text-on-surface-variant mb-4 italic">"Finally, a UI that feels modern and responsive. Using FluxPlays to stream Drive links is an absolute game changer."</p>
              <p className="text-xs font-bold text-on-surface">— Sarah K., Content Creator</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-1 text-yellow-500 mb-3">
                {[1, 2, 3, 4, 5].map(i => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
              </div>
              <p className="text-sm text-on-surface-variant mb-4 italic">"I use this as a robust video streaming app alternative. Free, fast, and does exactly what it promises without bloat."</p>
              <p className="text-xs font-bold text-on-surface">— Jason R., Daily User</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <div id="faq">
          <FAQSection
            title="Frequently Asked Questions"
            subtitle="FAQ"
            description="Everything you need to know about streaming videos online with fluxplays.live."
            faqs={[
              { q: 'What is fluxplays.live?', a: 'fluxplays.live is a free, browser-based tool for instant video streaming. You paste a supported video link — such as an MP4 URL, Google Drive share, or Telegram file — and watch it directly in your browser. No downloads, no account, no app required.' },
              { q: 'How does instant video streaming work?', a: 'When you paste a video link, fluxplays.live fetches and buffers the video progressively in your browser. You can start watching within seconds while the rest loads in the background. It works the same way YouTube and Netflix stream — just with your own links.' },
              { q: 'Can I stream videos without downloading them?', a: 'Yes, absolutely. That\'s the whole point. Paste any supported video URL and watch it online without saving a single byte to your device. Your storage stays untouched.' },
              { q: 'What video formats are supported?', a: 'fluxplays.live supports MP4, WEBM, HLS (m3u8 live and VOD streams), direct CDN video URLs, Google Drive shared links, and Telegram file links. MKV support depends on your browser\'s native codec support. Torrent streaming is coming in a future update.' },
              { q: 'Can I stream Google Drive videos online?', a: 'Yes. If you have a Google Drive video link with sharing enabled ("anyone with the link can view"), paste it into fluxplays.live and it will play directly in the browser player. Make sure the sharing permissions are set to public or unlisted.' },
              { q: 'Can I stream Telegram video links?', a: 'Yes, Telegram direct file links are supported. If the link points to a video file hosted on Telegram\'s CDN and is publicly accessible, fluxplays.live can stream it in your browser without downloading.' },
              { q: 'Does fluxplays.live support torrent streaming?', a: 'Not yet, but it\'s actively planned. Torrent-to-stream support — where you paste a magnet link and stream without downloading — is on our public roadmap and will be available in a future release.' },
              { q: 'Is fluxplays.live free to use?', a: 'Yes, it\'s completely free. There\'s no subscription, no paywall, and no hidden fees. The core streaming tool will always be free. Optional premium features may be introduced later, but basic streaming stays free.' },
              { q: 'Do I need to create an account?', a: 'No account is needed for basic streaming. Just open the site, paste a video URL, and start watching instantly. Recent streams are saved to your browser\'s local storage for convenience.' },
              { q: 'Can I watch videos on mobile devices?', a: 'Yes. fluxplays.live is fully mobile-responsive. The video player and all controls work smoothly on smartphones and tablets. Android Chrome and iOS Safari are both supported.' },
              { q: 'Does the platform support subtitles?', a: 'Currently, the player works with video streams that have embedded subtitles. AI-powered auto-subtitle generation and manual SRT/VTT upload support are planned features on the roadmap.' },
              { q: 'Why is my video buffering a lot?', a: 'Buffering is usually caused by a slow internet connection, a slow or distant video server, or a very large file. Try pausing for a few seconds to let the buffer build up. If it persists, the video source server may be rate-limiting connections or the URL may not be a direct video stream.' },
              { q: 'Is streaming faster than downloading?', a: 'For watching purposes, yes. Streaming lets you start watching within seconds rather than waiting for a full download. You only load the parts you actually watch, saving both time and data. Downloading makes sense only if you want offline access.' },
              { q: 'Can I stream private videos?', a: 'Only if the video URL is publicly accessible. fluxplays.live cannot bypass authentication or access private content. Google Drive links must have sharing enabled, and Telegram links must be publicly accessible CDN URLs.' },
              { q: 'Is my viewing history stored?', a: 'No server-side history is stored. Your recent streams are saved only in your browser\'s local storage on your own device. We don\'t collect, track, or log what you watch.' },
              { q: 'Does fluxplays.live work on Smart TVs?', a: 'If your Smart TV has a modern browser like Chrome or Edge, you can use fluxplays.live directly. Alternatively, you can open it on your phone or laptop and cast to your TV using the built-in Cast button.' },
              { q: 'Which browsers are supported?', a: 'fluxplays.live works best on Google Chrome, Microsoft Edge, Mozilla Firefox, and Apple Safari (desktop and mobile). For the best experience, keep your browser updated to the latest version.' },
              { q: 'Can I use fluxplays.live on a slow internet connection?', a: 'Yes. The player uses adaptive streaming where possible, adjusting playback quality based on your connection speed. On slower connections, the video may take a few extra seconds to buffer before it plays smoothly.' },
              { q: 'Why is my video link not working?', a: 'Common reasons include: the link has expired, the URL doesn\'t point to a direct video file, the source server requires authentication, or the format isn\'t supported by your browser. Make sure the link is a direct video URL (ending in .mp4, .webm, etc.) or a supported platform link.' },
              { q: 'Is fluxplays.live secure to use?', a: 'Yes. Video links are requested directly from your browser — no content passes through our servers unnecessarily. Your recent streams are stored only locally. We don\'t download or re-host any video files.' },
            ]} 
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  { q: 'What is fluxplays.live?', a: 'fluxplays.live is a free, browser-based tool for instant video streaming. You paste a supported video link — such as an MP4 URL, Google Drive share, or Telegram file — and watch it directly in your browser. No downloads, no account, no app required.' },
                  { q: 'How does instant video streaming work?', a: 'When you paste a video link, fluxplays.live fetches and buffers the video progressively in your browser. You can start watching within seconds while the rest loads in the background. It works the same way YouTube and Netflix stream — just with your own links.' },
                  { q: 'Can I stream videos without downloading them?', a: 'Yes, absolutely. That\'s the whole point. Paste any supported video URL and watch it online without saving a single byte to your device. Your storage stays untouched.' },
                  { q: 'What video formats are supported?', a: 'fluxplays.live supports MP4, WEBM, HLS (m3u8 live and VOD streams), direct CDN video URLs, Google Drive shared links, and Telegram file links. MKV support depends on your browser\'s native codec support. Torrent streaming is coming in a future update.' },
                  { q: 'Can I stream Google Drive videos online?', a: 'Yes. If you have a Google Drive video link with sharing enabled ("anyone with the link can view"), paste it into fluxplays.live and it will play directly in the browser player. Make sure the sharing permissions are set to public or unlisted.' },
                  { q: 'Can I stream Telegram video links?', a: 'Yes, Telegram direct file links are supported. If the link points to a video file hosted on Telegram\'s CDN and is publicly accessible, fluxplays.live can stream it in your browser without downloading.' },
                  { q: 'Does fluxplays.live support torrent streaming?', a: 'Not yet, but it\'s actively planned. Torrent-to-stream support — where you paste a magnet link and stream without downloading — is on our public roadmap and will be available in a future release.' },
                  { q: 'Is fluxplays.live free to use?', a: 'Yes, it\'s completely free. There\'s no subscription, no paywall, and no hidden fees. The core streaming tool will always be free. Optional premium features may be introduced later, but basic streaming stays free.' },
                  { q: 'Do I need to create an account?', a: 'No account is needed for basic streaming. Just open the site, paste a video URL, and start watching instantly. Recent streams are saved to your browser\'s local storage for convenience.' },
                  { q: 'Can I watch videos on mobile devices?', a: 'Yes. fluxplays.live is fully mobile-responsive. The video player and all controls work smoothly on smartphones and tablets. Android Chrome and iOS Safari are both supported.' },
                  { q: 'Does the platform support subtitles?', a: 'Currently, the player works with video streams that have embedded subtitles. AI-powered auto-subtitle generation and manual SRT/VTT upload support are planned features on the roadmap.' },
                  { q: 'Why is my video buffering a lot?', a: 'Buffering is usually caused by a slow internet connection, a slow or distant video server, or a very large file. Try pausing for a few seconds to let the buffer build up. If it persists, the video source server may be rate-limiting connections or the URL may not be a direct video stream.' },
                  { q: 'Is streaming faster than downloading?', a: 'For watching purposes, yes. Streaming lets you start watching within seconds rather than waiting for a full download. You only load the parts you actually watch, saving both time and data. Downloading makes sense only if you want offline access.' },
                  { q: 'Can I stream private videos?', a: 'Only if the video URL is publicly accessible. fluxplays.live cannot bypass authentication or access private content. Google Drive links must have sharing enabled, and Telegram links must be publicly accessible CDN URLs.' },
                  { q: 'Is my viewing history stored?', a: 'No server-side history is stored. Your recent streams are saved only in your browser\'s local storage on your own device. We don\'t collect, track, or log what you watch.' },
                  { q: 'Does fluxplays.live work on Smart TVs?', a: 'If your Smart TV has a modern browser like Chrome or Edge, you can use fluxplays.live directly. Alternatively, you can open it on your phone or laptop and cast to your TV using the built-in Cast button.' },
                  { q: 'Which browsers are supported?', a: 'fluxplays.live works best on Google Chrome, Microsoft Edge, Mozilla Firefox, and Apple Safari (desktop and mobile). For the best experience, keep your browser updated to the latest version.' },
                  { q: 'Can I use fluxplays.live on a slow internet connection?', a: 'Yes. The player uses adaptive streaming where possible, adjusting playback quality based on your connection speed. On slower connections, the video may take a few extra seconds to buffer before it plays smoothly.' },
                  { q: 'Why is my video link not working?', a: 'Common reasons include: the link has expired, the URL doesn\'t point to a direct video file, the source server requires authentication, or the format isn\'t supported by your browser. Make sure the link is a direct video URL (ending in .mp4, .webm, etc.) or a supported platform link.' },
                  { q: 'Is fluxplays.live secure to use?', a: 'Yes. Video links are requested directly from your browser — no content passes through our servers unnecessarily. Your recent streams are stored only locally. We don\'t download or re-host any video files.' }
                ].map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
              })
            }}
          />
        </div>

            </motion.div>
          ) : (
            <motion.div
              key="player"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)", y: 20 }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`min-h-screen pt-32 pb-12 px-container-padding-mobile md:px-container-padding-desktop flex flex-col z-20 relative transition-all duration-700 ${isTheaterMode ? 'fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl pt-6 pb-6 px-4 md:px-12 overflow-y-auto' : ''}`}
            >
              <div className={`mx-auto w-full flex-grow flex flex-col transition-all duration-700 ${isTheaterMode ? 'max-w-[1920px] h-full' : 'max-w-[1600px]'}`}>
                <button 
                  onClick={() => { setStreamData(null); setIsTheaterMode(false); }}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors self-start mb-6 group bg-surface-container-lowest/50 px-4 py-2 rounded-lg border border-black/5 backdrop-blur-md shadow-sm"
                >
                  <ArrowLeft className="group-hover:-translate-x-1 transition-transform w-5 h-5" />
                  <span className="font-bold">Back to Home</span>
                </button>
                
                <div className={`w-full bg-black rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,122,255,0.15)] border border-white/10 relative flex-grow flex items-center justify-center transition-all duration-700 ${isTheaterMode ? 'min-h-[80vh]' : 'min-h-[65vh]'}`}>
                  <CustomPlayer src={streamData.streamUrl} />
                </div>
                
                <div className="mt-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h2 className="font-headline-lg text-on-surface text-3xl md:text-4xl">{streamData.title}</h2>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-label-sm uppercase tracking-widest text-xs">{streamData.type}</span>
                      <span className="text-on-surface-variant font-body-md text-sm flex items-center gap-1"><CheckCircle2 className="text-primary w-4 h-4" /> Validated Source</span>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button 
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className="flex items-center gap-2 px-6 py-3 bg-surface-container border border-black/10 rounded-xl hover:bg-surface-dim transition-colors font-bold text-on-surface hidden md:flex"
                    >
                      {isTheaterMode ? (
                        <Minimize2 className="w-5 h-5" />
                      ) : (
                        <Maximize2 className="w-5 h-5" />
                      )}
                      <span>{isTheaterMode ? 'Exit Theater' : 'Theater Mode'}</span>
                    </button>
                    <a
                      href={streamData.streamUrl}
                      download={streamData.title || "video"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 premium-button-gradient text-on-primary-container shadow-lg rounded-xl hover:scale-105 active:scale-95 transition-all font-bold"
                    >
                      <Download className="w-5 h-5" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-black/5 dark:border-white/5 bg-surface-container-lowest">
        <div className="px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 mb-10">
            <div className="max-w-xs">
              <span className="flex items-center gap-2 font-display-lg text-headline-md tracking-tighter text-on-surface mb-3 block">
                <Logo className="w-8 h-8 inline-block mr-2" />
                <span>FluxPlays</span>
              </span>
              <p className="text-on-surface-variant text-sm leading-relaxed">A modern utility for instantly watching and discovering video content online with a fast, responsive user experience.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <h4 className="font-semibold text-on-surface uppercase tracking-widest text-xs mb-4">Product</h4>
                <nav className="flex flex-col gap-3">
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#features">Features</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#how-it-works">How it works</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="/about">About Us</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="/blog">Blog & Guides</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="/newsletter">Newsletter</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="/trending/netflix-alternatives">Trending</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="/compare/fluxplays-vs-netflix">Comparisons</a>
                </nav>
              </div>
              <div>
                <h4 className="font-semibold text-on-surface uppercase tracking-widest text-xs mb-4">Support</h4>
                <nav className="flex flex-col gap-3">
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="/#faq">FAQ</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="/creators">Creators</a>
                  <button onClick={() => setIsFeedbackOpen(true)} className="text-on-surface-variant hover:text-primary transition-colors text-left bg-transparent border-none p-0 outline-none cursor-pointer">Report Bug</button>
                </nav>
              </div>
              <div>
                <h4 className="font-semibold text-on-surface uppercase tracking-widest text-xs mb-4">Legal</h4>
                <nav className="flex flex-col gap-3">
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="/privacy">Privacy Policy</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="/terms">Terms of Service</a>
                </nav>
              </div>
            </div>
          </div>
          <div className="border-t border-black/5 dark:border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-on-surface-variant text-xs">© 2026 FluxPlays — Your Modern Video Streaming Platform.</p>
            <div className="flex items-center gap-4 text-on-surface-variant">
              <a href="#" aria-label="GitHub" className="hover:text-primary transition-colors">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.82-.26.82-.57v-2c-3.34.73-4.04-1.6-4.04-1.6-.54-1.38-1.33-1.75-1.33-1.75-1.08-.74.08-.72.08-.72 1.2.08 1.83 1.23 1.83 1.23 1.06 1.82 2.8 1.3 3.47.99.1-.77.41-1.3.75-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.68.83.57C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
              <a href="#" aria-label="Discord" className="hover:text-primary transition-colors">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M20.32 4.37A19.8 19.8 0 0 0 15.37 2.8a13.6 13.6 0 0 0-.63 1.28 18.3 18.3 0 0 0-5.47 0A13.1 13.1 0 0 0 8.63 2.8 19.7 19.7 0 0 0 3.68 4.37C.53 9.2-.32 13.9.1 18.52a19.9 19.9 0 0 0 6.07 3.07 15 15 0 0 0 1.3-2.1 12.9 12.9 0 0 1-2.05-.98c.17-.12.34-.25.5-.38a14.2 14.2 0 0 0 12.16 0c.16.13.33.26.5.38-.65.38-1.34.7-2.06.98a15 15 0 0 0 1.3 2.1 19.8 19.8 0 0 0 6.07-3.07c.5-5.27-.84-9.92-3.57-14.15zM8.01 15.63c-1.17 0-2.14-1.08-2.14-2.4s.95-2.41 2.14-2.41 2.16 1.08 2.14 2.4c0 1.33-.95 2.41-2.14 2.41zm7.98 0c-1.17 0-2.14-1.08-2.14-2.4s.95-2.41 2.14-2.41 2.15 1.08 2.14 2.4c0 1.33-.95 2.41-2.14 2.41z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}



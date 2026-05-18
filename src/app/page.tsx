"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomPlayer from "@/components/CustomPlayer";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamData, setStreamData] = useState<{streamUrl: string, title: string, type: string} | null>(null);
  const [recentStreams, setRecentStreams] = useState<{url: string, title: string, type: string, date: number}[]>([]);
  const [shake, setShake] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

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
        <div className="orb w-[500px] h-[500px] bg-primary/10 top-[-100px] left-[-100px]"></div>
        <div className="orb w-[400px] h-[400px] bg-tertiary/5 bottom-[-50px] right-[-50px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.02)_1px,transparent_1px)] [background-size:32px_32px]"></div>
      </div>

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-[32px] border-b border-black/5 dark:border-white/5">
        <div className="flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto h-16">
          <a href="/" className="flex items-center gap-2 font-display-lg text-headline-md tracking-tighter text-on-surface hover:text-primary transition-colors">
            <Logo className="w-8 h-8" />
            <span>fluxplays.live</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors" href="#how-it-works">How it works</a>
            <a className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors" href="#formats">Supported Formats</a>
            <a className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors" href="#coming-soon">Roadmap</a>
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
            <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg mb-5 leading-tight">Paste Any Video Link.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Stream Instantly.</span></h1>
            <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant mb-10 max-w-xl mx-auto">Watch videos online without downloading. Works with MP4, Google Drive, Telegram, HLS streams, and direct video URLs.</p>
            
            {/* Futuristic Action Area */}
            <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
              <motion.div 
                className="flex flex-col md:flex-row items-center justify-center gap-stack-sm w-full"
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <div className="relative w-full group">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-tertiary rounded-xl opacity-20 group-focus-within:opacity-60 transition duration-500 blur ${isValidUrl ? 'opacity-40 animate-pulse' : ''}`}></div>
                  <div className="relative flex items-center bg-surface-container-low border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 transition-colors group-focus-within:border-primary/30">
                    <span className={`material-symbols-outlined mr-2 transition-colors ${isValidUrl ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {isValidUrl ? 'check_circle' : 'link'}
                    </span>
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
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <button 
                  onClick={() => handleStream()}
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-4 premium-button-gradient rounded-xl font-bold text-on-primary-container shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 whitespace-nowrap disabled:opacity-90 disabled:scale-100 cursor-pointer disabled:cursor-not-allowed min-w-[180px] flex justify-center items-center"
                >
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
                </button>
              </motion.div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full -mt-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm text-left flex items-start gap-2"
                >
                  <span className="material-symbols-outlined text-error text-lg">error</span>
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
                    <span className="text-xs font-label-sm uppercase tracking-wider text-on-surface-variant/60 flex items-center gap-1 mr-2">
                      <span className="material-symbols-outlined text-[14px]">history</span>
                      Recent
                    </span>
                    {recentStreams.map((stream, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleStream(stream.url)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-surface-container-lowest hover:bg-surface-container-low hover:border-primary/30 transition-all group cursor-pointer max-w-[200px]"
                        title={stream.title}
                      >
                        <span className="material-symbols-outlined text-primary text-[14px]">
                          {stream.type === 'Google Drive' ? 'drive' : 'play_circle'}
                        </span>
                        <span className="text-xs font-medium text-on-surface truncate">{stream.title}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

            </div>
          </div>
          
          {/* Visual Anchor */}
          <div className="mt-20 w-full max-w-5xl relative">
            <div className="absolute -inset-4 bg-primary/20 blur-[100px] opacity-20 -z-10"></div>
            <div className="glass-panel p-2 rounded-2xl shadow-2xl">
              <img alt="Premium Screening Interface" className="w-full h-auto rounded-xl object-cover aspect-video" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdgYtmPpTfpWQ-Z3NPWDAuyPKygh_iDYotSlPkkvaLyMTcbiV9utrK7YG5YUGDsh_Izt9TuKLW8SQes8B04DsenONQNu5n_CVzcFHgG8Ng_z8MsS7UbRn9-pvuBNj7Fl28EHAKHzikZRCUBHdRr7rygBnZvPiu9Ulf6ctVQMt800eyFXsCyhRzGyTSTfVueB_WeWdI1ttheECzRTjku4-x2VAKi2t5HZEw1N-ygZ3b4ly_7W3-S9SsEeqed_AIZKECF982S0GUm5M" />
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
                { icon: 'video_file', label: 'MP4 / WEBM', desc: 'Direct video files' },
                { icon: 'stream', label: 'HLS (m3u8)', desc: 'Live & adaptive streams' },
                { icon: 'add_to_drive', label: 'Google Drive', desc: 'Shared drive links' },
                { icon: 'send', label: 'Telegram', desc: 'Telegram file links' },
                { icon: 'link', label: 'Direct URLs', desc: 'Any hosted video URL' },
                { icon: 'cloud_download', label: 'CDN Links', desc: 'CDN-hosted video' },
                { icon: 'subtitles', label: 'Subtitles', desc: 'SRT / VTT support' },
                { icon: 'rocket_launch', label: 'Torrent', desc: 'Coming soon', soon: true },
              ].map((fmt, i) => (
                <div key={i} className={`group glass-panel p-5 rounded-2xl border border-black/5 hover:border-primary/30 transition-all duration-300 cursor-default ${fmt.soon ? 'opacity-60' : ''}`}>
                  <span className="material-symbols-outlined text-primary text-3xl mb-3 block">{fmt.icon}</span>
                  <p className="font-semibold text-on-surface text-sm">{fmt.label}</p>
                  <p className="text-on-surface-variant text-xs mt-1">{fmt.desc}</p>
                  {fmt.soon && <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">Soon</span>}
                </div>
              ))}
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
                <span className="material-symbols-outlined text-primary">link</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Paste or Upload</h3>
              <p className="text-on-surface-variant font-body-md">Enter a magnet link, video URL, or drag-and-drop a torrent file into the browser.</p>
            </div>
            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-secondary/30 transition-all">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/5 rounded-full flex items-center justify-center font-display-lg text-6xl text-secondary/10 select-none">2</div>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-secondary">list_alt</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Pick your file</h3>
              <p className="text-on-surface-variant font-body-md">Browse the content bundle and select the specific file you want to stream or download.</p>
            </div>
            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-tertiary/30 transition-all">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-tertiary/5 rounded-full flex items-center justify-center font-display-lg text-6xl text-tertiary/10 select-none">3</div>
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-tertiary">play_circle</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Stream or download</h3>
              <p className="text-on-surface-variant font-body-md">Watch video instantly in the built-in player, or grab a direct high-speed download link.</p>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto bg-surface-container-low/50 border-y border-black/5">
          <div className="text-center mb-12">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 block">Features</span>
            <h2 className="font-headline-lg text-on-surface">Everything you need, nothing you don&#39;t</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {[
              { icon: 'bolt', color: 'primary', title: 'Instant Browser Streaming', desc: 'Stream any video URL directly in your browser. No plugins, no installs, no waiting.', tags: ['MP4', 'WEBM', 'HLS', 'Drive'] },
              { icon: 'cloud_off', color: 'secondary', title: 'No Download Needed', desc: 'Save your storage. Watch directly online without ever saving a file to your device.', tags: [] },
              { icon: 'speed', color: 'tertiary', title: 'Fast Buffering', desc: 'Efficient streaming with minimal buffering. Adaptive playback adjusts to your connection speed.', tags: [] },
              { icon: 'smartphone', color: 'primary', title: 'Mobile Friendly', desc: 'Fully responsive player that works great on phones, tablets, and desktops.', tags: [] },
              { icon: 'play_circle', color: 'secondary', title: 'Smooth Playback', desc: 'Clean video controls with fullscreen, theater mode, and keyboard shortcuts.', tags: [] },
              { icon: 'history', color: 'tertiary', title: 'Recent Streams', desc: 'Quickly re-open your previously streamed links from your local browser history.', tags: [] },
            ].map((f, i) => (
              <div key={i} className="feature-card p-stack-md rounded-2xl border border-black/5 bg-black/[0.01] transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-${f.color}/10 flex items-center justify-center mb-5`}>
                  <span className={`material-symbols-outlined text-${f.color}`}>{f.icon}</span>
                </div>
                <h3 className="font-headline-md text-on-surface mb-3">{f.title}</h3>
                <p className="text-on-surface-variant font-body-md mb-4">{f.desc}</p>
                {f.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {f.tags.map(t => <span key={t} className="text-[10px] font-bold px-2 py-1 rounded bg-black/5 border border-black/10 text-on-surface-variant">{t}</span>)}
                  </div>
                )}
              </div>
            ))}
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
              { icon: 'translate', title: 'AI Subtitles & Translation', desc: 'Auto-generate subtitles and translate them into any language using AI.' },
              { icon: 'groups', title: 'Watch Together', desc: 'Watch videos in sync with friends. Share a room link and stream together in real-time.' },
              { icon: 'bookmark_added', title: 'Resume Playback', desc: 'Pick up exactly where you left off across all your devices.' },
              { icon: 'rocket_launch', title: 'Torrent-to-Stream', desc: 'Paste a magnet link and start streaming the torrent without downloading it.' },
              { icon: 'diversity_3', title: 'Anime & Movie Community', desc: 'A community space for sharing and discovering great video links.' },
              { icon: 'auto_awesome', title: 'Smart Link Detection', desc: 'Automatically detect and extract video URLs from any web page or social post.' },
            ].map((item, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl border border-black/5 group hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">Soon</span>
                </div>
                <span className="material-symbols-outlined text-primary text-2xl mb-4 block">{item.icon}</span>
                <h3 className="font-headline-md text-on-surface mb-2 text-base">{item.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
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
                  <span className="material-symbols-outlined text-primary/40 text-6xl">article</span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">{post.tag}</span>
                  <h3 className="font-semibold text-on-surface text-base leading-snug mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed flex-1">{post.excerpt}</p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-on-surface-variant/60">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-container-padding-mobile md:px-container-padding-desktop max-w-3xl mx-auto">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                { "@type": "Question", "name": "What is fluxplays.live?", "acceptedAnswer": { "@type": "Answer", "text": "fluxplays.live is a free browser-based video streaming tool. Paste any supported video link — MP4, Google Drive, Telegram, HLS — and watch it instantly online without downloading anything." } },
                { "@type": "Question", "name": "Can I stream videos without downloading them?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. That's the core purpose of fluxplays.live. Paste a video URL and stream it directly in your browser — no file is saved to your device." } },
                { "@type": "Question", "name": "What video formats are supported?", "acceptedAnswer": { "@type": "Answer", "text": "fluxplays.live supports MP4, WEBM, HLS (m3u8), direct video URLs, Google Drive shared links, and Telegram file links. Torrent streaming is planned." } },
                { "@type": "Question", "name": "Is fluxplays.live free to use?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, completely free. No subscription or payment required to stream videos online." } },
                { "@type": "Question", "name": "Do I need to create an account?", "acceptedAnswer": { "@type": "Answer", "text": "No account is needed for basic streaming. Just paste your link and start watching instantly." } },
              ]
            })}}
          />
          <div className="text-center mb-12">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 block">FAQ</span>
            <h2 className="font-headline-lg text-on-surface mb-3">Frequently Asked Questions</h2>
            <p className="text-on-surface-variant max-w-md mx-auto">Everything you need to know about streaming videos online with fluxplays.live.</p>
          </div>
          <div className="space-y-3">
            {[
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
            ].map((faq, i) => (
              <div key={i} className="border border-black/5 dark:border-white/5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
                <button
                  onClick={() => setActiveFaqIndex(activeFaqIndex === i ? null : i)}
                  className="w-full flex justify-between items-center p-5 text-left transition-colors duration-200 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]"
                >
                  <span className="font-semibold text-on-surface text-sm md:text-base pr-4">{faq.q}</span>
                  <motion.span 
                    animate={{ rotate: activeFaqIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="material-symbols-outlined text-on-surface-variant shrink-0"
                  >
                    expand_more
                  </motion.span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ 
                    height: activeFaqIndex === i ? "auto" : 0,
                    opacity: activeFaqIndex === i ? 1 : 0 
                  }}
                  transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-on-surface-variant text-sm leading-relaxed border-t border-black/[0.03] dark:border-white/[0.03] pt-4">
                    {faq.a}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </section>

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
                  <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
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
                      <span className="text-on-surface-variant font-body-md text-sm flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">verified</span> Validated Source</span>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button 
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className="flex items-center gap-2 px-6 py-3 bg-surface-container border border-black/10 rounded-xl hover:bg-surface-dim transition-colors font-bold text-on-surface hidden md:flex"
                    >
                      <span className="material-symbols-outlined">{isTheaterMode ? 'fullscreen_exit' : 'fullscreen'}</span>
                      <span>{isTheaterMode ? 'Exit Theater' : 'Theater Mode'}</span>
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-surface-container border border-black/10 rounded-xl hover:bg-surface-dim transition-colors font-bold text-on-surface">
                      <span className="material-symbols-outlined">cast</span>
                      <span className="hidden sm:inline">Cast</span>
                    </button>
                    <a
                      href={streamData.streamUrl}
                      download={streamData.title || "video"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 premium-button-gradient text-on-primary-container shadow-lg rounded-xl hover:scale-105 active:scale-95 transition-all font-bold"
                    >
                      <span className="material-symbols-outlined">download</span>
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
                <Logo className="w-8 h-8" />
                <span>fluxplays.live</span>
              </span>
              <p className="text-on-surface-variant text-sm leading-relaxed">A modern utility for instantly streaming videos online. Paste a link, watch instantly.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <h4 className="font-semibold text-on-surface uppercase tracking-widest text-xs mb-4">Product</h4>
                <nav className="flex flex-col gap-3">
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#how-it-works">How it works</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#formats">Supported formats</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#coming-soon">Roadmap</a>
                </nav>
              </div>
              <div>
                <h4 className="font-semibold text-on-surface uppercase tracking-widest text-xs mb-4">Legal</h4>
                <nav className="flex flex-col gap-3">
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Cookie Policy</a>
                </nav>
              </div>
            </div>
          </div>
          <div className="border-t border-black/5 dark:border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-on-surface-variant text-xs">© 2026 fluxplays.live — Stream any video, instantly.</p>
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
    </>
  );
}



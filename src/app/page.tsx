import Script from "next/script";
import { 
  ArrowRight, CheckCircle2, Video, Tv, HardDrive, Send,
  Download, Subtitles, Rocket, Zap, CloudOff, Gauge, Smartphone, Server,
  Activity, Languages, Users, Bookmark, Compass, Sparkles, FileText,
  Search, Play, List, History as HistoryIcon, Link2
} from "lucide-react";
import HomeClient from "@/components/HomeClient";

export default function Home() {
  return (
    <>
      {/* Background Decoration - Rendered on Server */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="orb orb-animate-1 w-[600px] h-[600px] bg-primary/20 top-[-100px] left-[-100px]" />
        <div className="orb orb-animate-2 w-[500px] h-[500px] bg-secondary/15 bottom-[-50px] right-[-50px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px]"></div>
      </div>

      <main className="relative pt-16">
        {/* Hero Section */}
        <section id="stream" className="min-h-[80vh] md:min-h-[85vh] flex flex-col items-center justify-center text-center px-container-padding-mobile md:px-container-padding-desktop relative pt-8 md:pt-12">
          <div className="max-w-3xl mx-auto z-10 w-full">
            <div className="inline-flex flex-wrap items-center justify-center w-auto max-w-[95%] gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6 mx-auto">
              <span className="w-2 h-2 shrink-0 rounded-full bg-primary animate-pulse mt-0.5"></span>
              <span className="font-label-sm text-[9px] min-[375px]:text-[10px] sm:text-xs text-primary uppercase tracking-wider sm:tracking-widest leading-none text-center sm:whitespace-nowrap">Free · No Signup · Works Instantly</span>
            </div>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg mb-5 leading-tight tracking-tighter">FluxPlays: A Modern Video<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Streaming Web App</span></h1>
            <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto tracking-tight">FluxPlays (formerly InstantStream) is a modern streaming web app for watching and discovering movies, shows, and video content with a fast, responsive user experience. Paste any MP4, Google Drive, Telegram, HLS, or direct video URL and stream it instantly.</p>

            {/* Interactive Client Component handles Input, Player, Recent Streams, FAQ, and Feedback */}
            <div className="min-h-[160px] md:min-h-[180px] w-full flex flex-col items-center">
              <HomeClient />
            </div>
          </div>
        </section>        {/* IMDb Stream Player CTA Section */}
        <section id="imdb-player-cta" className="py-12 md:py-10 px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto">
          <div className="glass-panel p-8 md:p-14 rounded-3xl border border-yellow-500/20 relative overflow-hidden flex flex-col lg:flex-row-reverse items-center gap-12 bg-gradient-to-bl from-surface to-[#f5c518]/[0.05] dark:from-surface-container dark:to-[#f5c518]/[0.03]">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#f5c518]/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

            <div className="flex-1 relative z-10 w-full text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#f5c518]/30 bg-[#f5c518]/10 mb-6">
                <Play className="w-4 h-4 text-[#b58f0b] dark:text-[#f5c518] fill-current" />
                <span className="font-label-sm text-xs font-bold text-[#8a6d07] dark:text-[#f5c518] uppercase tracking-widest">New Feature</span>
              </span>
              <h2 className="font-headline-lg text-4xl md:text-5xl text-on-surface mb-5 leading-tight tracking-tight">Stream movies instantly <br className="hidden lg:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5c518] to-yellow-200">by IMDb ID.</span></h2>
              <p className="text-on-surface-variant font-body-md text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-6">
                Know exactly what movie you want to watch? Skip the search engines and shady sites. Just paste the IMDb ID and watch it right here in Cinema Mode, fully loaded with metadata.
              </p>
              {/* What is IMDb ID explainer */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8 text-sm text-on-surface-variant">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f5c518]/8 border border-[#f5c518]/20">
                  <span className="font-black text-xs text-black dark:text-[#f5c518] bg-[#f5c518] px-1.5 py-0.5 rounded">IMDb</span>
                  <span className="font-mono text-xs text-on-surface font-bold">tt0111161</span>
                  <span className="text-on-surface-variant text-xs">→ The Shawshank Redemption</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f5c518]/8 border border-[#f5c518]/20">
                  <span className="font-black text-xs text-black dark:text-[#f5c518] bg-[#f5c518] px-1.5 py-0.5 rounded">IMDb</span>
                  <span className="font-mono text-xs text-on-surface font-bold">tt0468569</span>
                  <span className="text-on-surface-variant text-xs">→ The Dark Knight</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="/imdb-movie-stream-player"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#f5c518] hover:bg-[#e4b713] text-black shadow-xl rounded-xl transition-all font-bold text-base group"
                >
                  <Search className="w-5 h-5 text-black" />
                  <span>Try IMDb Player</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform text-black" />
                </a>
                <p className="text-xs text-on-surface-variant">Find the IMDb ID on any movie&apos;s IMDb page URL</p>
              </div>
            </div>

            {/* Visual Graphic Representation */}
            <div className="relative z-10 hidden md:flex shrink-0 w-full max-w-[380px] justify-center">
              <div className="relative w-full">
                <div className="absolute inset-0 bg-[#f5c518]/10 blur-2xl rounded-full"></div>
                <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/10 bg-surface-container-lowest/90 backdrop-blur-xl shadow-2xl relative -rotate-3 hover:rotate-0 transition-transform duration-500 cursor-default">
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-surface-container-highest/50 border border-black/5 dark:border-white/5">
                    <div className="w-12 h-10 rounded-lg flex items-center justify-center bg-[#f5c518] shrink-0">
                      <span className="font-black text-black text-xs tracking-tighter">IMDb</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-on-surface-variant">Paste any IMDb ID</div>
                      <div className="text-sm font-bold text-on-surface tracking-widest font-mono">tt0111161</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center w-full aspect-video bg-[#04040a] rounded-lg border border-white/10 overflow-hidden relative gap-2">
                    <span className="bg-[#f5c518] text-black font-black text-sm px-2.5 py-1 rounded tracking-tighter shadow-[0_0_15px_rgba(245,197,24,0.3)]">IMDb</span>
                    <span className="text-white/60 text-xs font-bold">The Shawshank Redemption</span>
                    <span className="text-white/30 text-xs font-mono font-bold tracking-widest uppercase">Stream Ready</span>
                    <div className="absolute bottom-2 left-2 flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f5c518] animate-pulse"></span>
                      <span className="text-[8px] text-[#f5c518] uppercase tracking-widest font-bold">HLS Proxy Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community CTA Section */}
        <section id="community-cta" className="py-12 md:py-20 px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto">
          <div className="glass-panel p-8 md:p-14 rounded-3xl border border-primary/20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-br from-surface to-primary/[0.05] dark:from-surface-container dark:to-primary/[0.03]">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

            <div className="flex-1 relative z-10 w-full text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 mb-6">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-label-sm text-xs font-bold text-primary dark:text-[#8ab8ff] uppercase tracking-widest">Community Directory</span>
              </span>
              <h2 className="font-headline-lg text-4xl md:text-5xl text-on-surface mb-5 leading-tight tracking-tight">Need website links for movies?<br className="hidden lg:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Find them here.</span></h2>
              <p className="text-on-surface-variant font-body-md text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8">
                Don&#39;t have a direct video link? No problem. Browse our community-curated collection of the absolute best streaming websites on the internet.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 mb-10 text-on-surface font-medium text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Movies &amp; TV Shows</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Anime &amp; Sports</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Submit your favorites</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="/community-sites"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 premium-button-gradient hover:shadow-[0_0_30px_rgba(0,112,243,0.4)] shadow-xl rounded-xl transition-all font-bold text-on-primary text-base group"
                >
                  <Compass className="w-5 h-5" />
                  <span>Browse Streaming Sites</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </a>
                <a
                  href="/community-sites#submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-surface-container-highest border border-black/10 dark:border-white/10 hover:bg-surface-dim hover:border-black/20 dark:hover:border-white/20 rounded-xl transition-all font-bold text-on-surface text-base"
                >
                  <span>Submit a Site</span>
                </a>
              </div>
            </div>

            {/* Visual Graphic Representation */}
            <div className="relative z-10 hidden md:block shrink-0 w-full max-w-[380px]">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/10 bg-surface-container-lowest/80 backdrop-blur-xl shadow-2xl relative rotate-3 hover:rotate-0 transition-transform duration-500 cursor-default">
                  <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Top Rated</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-highest/50 border border-black/5 dark:border-white/5 hover:bg-primary/5 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><Tv className="w-5 h-5 text-primary" /></div>
                      <div>
                        <div className="text-sm font-bold text-on-surface">CineStream HD</div>
                        <div className="text-xs text-on-surface-variant">Movies &amp; TV</div>
                      </div>
                      <div className="ml-auto flex gap-0.5 text-yellow-500">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        <span className="text-[10px] ml-1 font-bold text-on-surface">4.9</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-highest/50 border border-black/5 dark:border-white/5 hover:bg-secondary/5 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center"><Zap className="w-5 h-5 text-secondary" /></div>
                      <div>
                        <div className="text-sm font-bold text-on-surface">AnimeFlix</div>
                        <div className="text-xs text-on-surface-variant">Anime</div>
                      </div>
                      <div className="ml-auto flex gap-0.5 text-yellow-500">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        <span className="text-[10px] ml-1 font-bold text-on-surface">4.8</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-highest/50 border border-black/5 dark:border-white/5 hover:bg-tertiary/5 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-tertiary/20 flex items-center justify-center"><Video className="w-5 h-5 text-tertiary" /></div>
                      <div>
                        <div className="text-sm font-bold text-on-surface">SportsLive</div>
                        <div className="text-xs text-on-surface-variant">Live Matches</div>
                      </div>
                      <div className="ml-auto flex gap-0.5 text-yellow-500">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        <span className="text-[10px] ml-1 font-bold text-on-surface">4.7</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
              { icon: HistoryIcon, color: 'tertiary', title: 'Recent Streams', desc: 'Quickly re-open your previously streamed links from your local browser history.', tags: [] },
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

      </main>
      
      {/* Review Schema */}
      <Script
        id="schema-product-reviews"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "FluxPlays",
            "image": "https://fluxplays.live/icon.svg",
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
          })
        }}
      />
    </>
  );
}

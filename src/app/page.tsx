"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomPlayer from "@/components/CustomPlayer";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamData, setStreamData] = useState<{streamUrl: string, title: string, type: string} | null>(null);

  const handleStream = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Validation failed");
      } else {
        setStreamData(data);
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
      <header className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-[32px] border-t border-black/5 shadow-none">
        <div className="flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop max-w-[1920px] mx-auto h-20">
          <div className="flex items-center gap-stack-lg">
            <span className="font-display-lg text-headline-md tracking-tighter text-on-surface">InstantStream</span>
            <nav className="hidden md:flex gap-stack-md">
              <div className="flex items-center gap-2 text-on-surface-variant/50 font-medium font-body-md text-body-md cursor-not-allowed">
                <span>Browse</span>
                <span className="text-[10px] leading-none px-1.5 py-0.5 rounded-full border border-black/5 bg-black/5 uppercase tracking-tighter">Coming Soon</span>
              </div>
              <a className="flex items-center gap-2 text-on-surface-variant font-medium font-body-md text-body-md hover:scale-105 hover:text-primary transition-all duration-300" href="#">
                <span>Movies</span>
                <span className="text-[10px] leading-none px-1.5 py-0.5 rounded-full border border-black/10 bg-black/5 uppercase tracking-tighter text-on-surface-variant/60">Soon</span>
              </a>
              <a className="flex items-center gap-2 text-on-surface-variant font-medium font-body-md text-body-md hover:scale-105 hover:text-primary transition-all duration-300" href="#">
                <span>Series</span>
                <span className="text-[10px] leading-none px-1.5 py-0.5 rounded-full border border-black/10 bg-black/5 uppercase tracking-tighter text-on-surface-variant/60">Soon</span>
              </a>
              <a className="text-on-surface-variant font-medium font-body-md text-body-md hover:scale-105 hover:text-primary transition-all duration-300" href="#">My List</a>
            </nav>
          </div>
          <div className="flex items-center gap-3 md:gap-stack-md">
            <div className="hidden md:flex gap-stack-sm mr-4 items-center">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">search</span>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors mr-2">notifications</span>
              <ThemeToggle />
            </div>
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            <button className="hidden sm:block text-on-surface-variant font-medium hover:text-primary px-4 py-2 transition-all duration-300">Sign In</button>
            <button className="bg-primary-container text-on-primary-container px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-bold hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(0,122,255,0.2)] text-sm md:text-base whitespace-nowrap">Join Pro</button>
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
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-container-padding-mobile md:px-container-padding-desktop relative pt-32">
          <div className="max-w-4xl mx-auto z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 bg-black/5 mb-stack-md">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Now Streaming in 8K</span>
            </div>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg mb-stack-md leading-tight">Your Link, <span className="text-primary">Your Cinema.</span></h1>
            <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant mb-stack-lg max-w-2xl mx-auto">Paste any video URL or magnet link and start watching instantly. No downloads, no storage, just pure cinematic streaming.</p>
            
            {/* Futuristic Action Area */}
            <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-center gap-stack-sm w-full">
                <div className="relative w-full group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-tertiary rounded-xl opacity-20 group-focus-within:opacity-50 transition duration-500 blur"></div>
                  <div className="relative flex items-center bg-surface-container-low border border-black/10 rounded-xl px-4 py-3">
                    <span className="material-symbols-outlined text-on-surface-variant mr-2">link</span>
                    <input 
                      className="bg-transparent border-none text-on-surface focus:ring-0 w-full placeholder:text-on-surface-variant/40 font-body-md outline-none" 
                      placeholder="Paste video link or magnet link here..." 
                      type="text" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleStream()}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleStream}
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
              </div>
              
              {error && (
                <div className="w-full mt-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm text-left flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-lg">error</span>
                  <span>{error}</span>
                </div>
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

        {/* Discovery Carousel */}
        <section className="py-24 bg-surface-container-lowest/30">
          <div className="px-container-padding-mobile md:px-container-padding-desktop max-w-[1920px] mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">explore</span>
                <h2 className="font-headline-md text-on-surface">Trending Now</h2>
              </div>
              <a className="text-on-surface-variant hover:text-primary transition-colors text-sm flex items-center gap-1" href="#">See more <span className="material-symbols-outlined text-sm">chevron_right</span></a>
            </div>
            <div className="flex gap-gutter overflow-x-auto pb-8 hide-scrollbar snap-x">
              {/* Poster items */}
              <div className="flex-none w-48 snap-start group cursor-pointer">
                <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 relative">
                  <img alt="Neon Nights" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz4NhmKjDEk20vy1CkB3GGh_Pezvup22-HeNDdQ0kSmWMYB9Jb3f9ypTzOeP7XC1VLg2rUiEvEwFrCCCFLhaZ8yD-V3PXpeqM7wck5ztgwUtkOO-xGxREAZEcBGeE9_VpLPqxojxQZpy9oquhTbG-bW51kpGzEiCkOjRy7GU8zIM5EhFxN6rPZUd_5xAR9xLB_skBqDO7vfMg1_-H75gO-AoExchGTYihc7sDjMTBUMke66v3w_2b_jnzfWbRT-tXtpj5Ol5wsoRs" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button className="w-full py-2 bg-primary text-on-primary-container rounded-lg text-sm font-bold">Stream</button>
                  </div>
                </div>
                <h3 className="font-body-md font-bold truncate">Neon Nights</h3>
                <p className="text-xs text-on-surface-variant">2024 • 4K</p>
              </div>
              <div className="flex-none w-48 snap-start group cursor-pointer">
                <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 relative">
                  <img alt="The Horizon" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcNWWQuwN0kkh9hfbyppMj8PdR5my2_3fGMFlqrZpybE56r1Ag0gqolIm5QLBntJMCU1slrZtm8ES49JDBVYpTG7aSapyhUg1TOuWVOFnU5RiQvzOvyJCqcNODn5cGKNCWprPhXmbCVCHckdcaSD5h2ZVL6pUEpiizGMbzsFguCfNIEvsZSbvQAKmH5r6X8poHPSNg0LCP2XFyT6T9qb22pZFYT7xV9xSpSjX6INIUCOqeth8-l0Cb7au54FYPVAGG2ftjnGTkCqw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button className="w-full py-2 bg-primary text-on-primary-container rounded-lg text-sm font-bold">Stream</button>
                  </div>
                </div>
                <h3 className="font-body-md font-bold truncate">The Horizon</h3>
                <p className="text-xs text-on-surface-variant">2023 • 8K</p>
              </div>
              <div className="flex-none w-48 snap-start group cursor-pointer">
                <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 relative">
                  <img alt="Abstract Void" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDXysPXN4r54blfBHBVhoVHr7tuOAdgTLgPRCrbXZOsvx81lphN8kvU-yC6pdRSnAQigJRDb30jkyd0vWj5zzdB3USFjX6ZeKmvaowlP7Rdydgpxkgu8qbr3Y_4v-7Kv5UGYeaKmYK-RC-uZfZVYq5L-KRV6lmSiXSENOHDWFeZuCTuR3EIvzoVb8n-2G8mdiZn5oVM44xVEiGSFCRH9uHP3qLulKjyeIdjwTEGhePbzVNpB8-98KSalVsmFA3H7tZWAhBHYPWRYQ" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button className="w-full py-2 bg-primary text-on-primary-container rounded-lg text-sm font-bold">Stream</button>
                  </div>
                </div>
                <h3 className="font-body-md font-bold truncate">Abstract Void</h3>
                <p className="text-xs text-on-surface-variant">2024 • HDR</p>
              </div>
              <div className="flex-none w-48 snap-start group cursor-pointer">
                <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 relative">
                  <img alt="Sonic Echo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA62-03p3quL3H5VZsLhJeBjDueVtjSfzmJl_1OLy7SBHawX87YLxz4CqVj4XH0taeDoU6Xh-FfgfvOgSXF3VPyRcDa8x8H_n4lt_SNSazvrbJohUfT8ktQyJLKbRMq5ZbIctW6A8y4MxnLdRGjL7uw5_GxeBPljTl__c6Jom3lf67TMLO_CyEb2JZie4DJkpXu2WeJKbMEW6RR81p6rxMn_LO24HI1rJ1WgzPV9Rw65Z1VmjSp2rDB0jdibiFzOKdP0eaOAvKf3ek" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button className="w-full py-2 bg-primary text-on-primary-container rounded-lg text-sm font-bold">Stream</button>
                  </div>
                </div>
                <h3 className="font-body-md font-bold truncate">Sonic Echo</h3>
                <p className="text-xs text-on-surface-variant">2022 • 4K</p>
              </div>
              <div className="flex-none w-48 snap-start group cursor-pointer">
                <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 relative">
                  <img alt="Cinematic Depth" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdgYtmPpTfpWQ-Z3NPWDAuyPKygh_iDYotSlPkkvaLyMTcbiV9utrK7YG5YUGDsh_Izt9TuKLW8SQes8B04DsenONQNu5n_CVzcFHgG8Ng_z8MsS7UbRn9-pvuBNj7Fl28EHAKHzikZRCUBHdRr7rygBnZvPiu9Ulf6ctVQMt800eyFXsCyhRzGyTSTfVueB_WeWdI1ttheECzRTjku4-x2VAKi2t5HZEw1N-ygZ3b4ly_7W3-S9SsEeqed_AIZKECF982S0GUm5M" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button className="w-full py-2 bg-primary text-on-primary-container rounded-lg text-sm font-bold">Stream</button>
                  </div>
                </div>
                <h3 className="font-body-md font-bold truncate">Cinematic Depth</h3>
                <p className="text-xs text-on-surface-variant">2024 • 8K</p>
              </div>
              <div className="flex-none w-48 snap-start group cursor-pointer">
                <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 relative">
                  <img alt="Modern Flow" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz4NhmKjDEk20vy1CkB3GGh_Pezvup22-HeNDdQ0kSmWMYB9Jb3f9ypTzOeP7XC1VLg2rUiEvEwFrCCCFLhaZ8yD-V3PXpeqM7wck5ztgwUtkOO-xGxREAZEcBGeE9_VpLPqxojxQZpy9oquhTbG-bW51kpGzEiCkOjRy7GU8zIM5EhFxN6rPZUd_5xAR9xLB_skBqDO7vfMg1_-H75gO-AoExchGTYihc7sDjMTBUMke66v3w_2b_jnzfWbRT-tXtpj5Ol5wsoRs" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button className="w-full py-2 bg-primary text-on-primary-container rounded-lg text-sm font-bold">Stream</button>
                  </div>
                </div>
                <h3 className="font-body-md font-bold truncate">Modern Flow</h3>
                <p className="text-xs text-on-surface-variant">2024 • HDR</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 block">The Process</span>
            <h2 className="font-headline-lg text-on-surface">Three steps. That's it.</h2>
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

        {/* Detailed Feature Grid */}
        <section className="py-24 px-container-padding-mobile md:px-container-padding-desktop max-w-[1920px] mx-auto bg-surface-container-low/50 border-y border-black/5">
          <div className="text-center mb-16">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 block">Performance Engineering</span>
            <h2 className="font-headline-lg text-on-surface">Everything you need, nothing you don't</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            <div className="feature-card p-stack-md rounded-2xl border border-black/5 bg-black/[0.01] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary">bolt</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Instant Streaming</h3>
              <p className="text-on-surface-variant font-body-md mb-6">Watch video natively in the browser. Fully supports HLS live streams and common media types.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-black/5 border border-black/10 text-on-surface-variant">MP4</span>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-black/5 border border-black/10 text-on-surface-variant">WEBM</span>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-black/5 border border-black/10 text-on-surface-variant">HLS (m3u8)</span>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-black/5 border border-black/10 text-on-surface-variant">DRIVE LINKS</span>
              </div>
            </div>
            <div className="feature-card p-stack-md rounded-2xl border border-black/5 bg-black/[0.01] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-secondary">folder_zip</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">ZIP Archive Download</h3>
              <p className="text-on-surface-variant font-body-md">Download the entire content bundle as a single ZIP archive on-the-fly, preserving folder structure.</p>
            </div>
            <div className="feature-card p-stack-md rounded-2xl border border-black/5 bg-black/[0.01] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-tertiary">cloud_done</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Cloud Library</h3>
              <p className="text-on-surface-variant font-body-md">Save streams to your account — movies and series are detected and organized automatically with AI.</p>
            </div>
            <div className="feature-card p-stack-md rounded-2xl border border-black/5 bg-black/[0.01] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed-dim/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary-fixed-dim">speed</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Ultra-Low Latency</h3>
              <p className="text-on-surface-variant font-body-md">Proprietary protocol for sub-second lag, ensuring your stream is perfectly synced with the source.</p>
            </div>
            <div className="feature-card p-stack-md rounded-2xl border border-black/5 bg-black/[0.01] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-on-tertiary-fixed-variant/20 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-tertiary-fixed">smart_display</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Stremio Integration</h3>
              <p className="text-on-surface-variant font-body-md">Watch your library on any smart TV or device running Stremio via our dedicated addon link.</p>
            </div>
            <div className="feature-card p-stack-md rounded-2xl border border-black/5 bg-black/[0.01] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-on-secondary-fixed-variant/20 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-secondary-fixed">shield_lock</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Secure Tunneling</h3>
              <p className="text-on-surface-variant font-body-md">Encrypted viewing tunnels for maximum privacy. No VPN required for high-speed cloud streaming.</p>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-24 bg-surface-container-lowest/50 border-b border-black/5">
          <div className="px-container-padding-mobile md:px-container-padding-desktop max-w-[1920px] mx-auto">
            <div className="text-center mb-16">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-2 block">Critical Acclaim</span>
              <h2 className="font-headline-lg text-on-surface">What Critics are Saying</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div className="glass-panel p-8 rounded-2xl border border-black/5 bg-black/[0.02]">
                <div className="flex items-center gap-4 mb-6">
                  <img alt="Alex Chen" className="w-14 h-14 rounded-full object-cover border-2 border-primary/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxtkgbbuY6jw3lqlGYp2hw_DcyCZWzZYIHoNRK273e56uZxxFxUY2-wzUPxN89fP6Pa1bm6vK3t83eV87vpw0nDMgQ3ErX-aaIOXCO9A5Fz1dBpEYXQCEEWddriaPSx_B_Z-zn307nYwhPpt4pI4_DFVwH__Wy22PrnEe-ACKDlyi5iKRMJqbQIszWLjqRkmnTY4_PxmwbxFW4cZLwgQOXmpKvEAW9sFN8NfpGD8Glz8oYVgQGNVTFzNh-np46mcWl5_Ae3-7JrZI" />
                  <div>
                    <h4 className="font-headline-md text-body-lg text-on-surface">Alex Chen</h4>
                    <p className="text-on-surface-variant text-label-sm">Tech Reviewer, Wired</p>
                  </div>
                </div>
                <p className="text-on-surface-variant italic font-body-md">&quot;InstantStream completely changes the friction of web video. The 8K playback is the smoothest I&apos;ve seen in a browser, bar none.&quot;</p>
              </div>
              <div className="glass-panel p-8 rounded-2xl border border-black/5 bg-black/[0.02]">
                <div className="flex items-center gap-4 mb-6">
                  <img alt="Sarah Jenkins" className="w-14 h-14 rounded-full object-cover border-2 border-primary/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJL30fnGj26B6xUkRLAsR1-nIW8PATd1DSQw_b1CZ2h14AAs6HoJJuXbBWPT-2r0vnlVN4HS0U5KTNP4I97x3lwNMv7bMKlDKx5ceJee2tylnLxwPNVB9L2DGOtJjD9sqbNXvEfSonjyq0tVmK89oyoa1MUmGfv1_71wwHkBrvosnB_34ppPjpeYu6rA8PDq0wCzY4XgzRGiB8nwjxF9IXkRpQoQVu6texC6mPjV0DZ1XlIjFdy3AaAt51Py58YrsIqlV9yvmqiVc" />
                  <div>
                    <h4 className="font-headline-md text-body-lg text-on-surface">Sarah Jenkins</h4>
                    <p className="text-on-surface-variant text-label-sm">Independent Filmmaker</p>
                  </div>
                </div>
                <p className="text-on-surface-variant italic font-body-md">&quot;I use it for remote screening sessions. The color fidelity and low latency make it an indispensable tool for my post-production workflow.&quot;</p>
              </div>
              <div className="glass-panel p-8 rounded-2xl border border-black/5 bg-black/[0.02]">
                <div className="flex items-center gap-4 mb-6">
                  <img alt="Marcus Thorne" className="w-14 h-14 rounded-full object-cover border-2 border-primary/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkEceXfI8ZHSp1EvsYNS7kAQXVHQJICihdQJC5UMuyU8-HczPZ9b8pMoKaFUsp0HCcqoCzbFQSYmu1RBAvC6VOc9N6jOZPQ-TjZPAG9qsZtO5pd_zoH5gHuGeBaSMhdwiNk3GhVlXcKtVnOKNK29Gvr_3NMfbP9IkpoejXhAScm8esgfs7G0Pt5Zl7ePfRmoHUbdIEGMvlA-ZTYD-VWvdYGPsRjSGzCvxYAqe5hGk6Bzg161jC_VoYa3HGeAgwkQN_MildHvw8zPA" />
                  <div>
                    <h4 className="font-headline-md text-body-lg text-on-surface">Marcus Thorne</h4>
                    <p className="text-on-surface-variant text-label-sm">Senior Editor, Digital Trends</p>
                  </div>
                </div>
                <p className="text-on-surface-variant italic font-body-md">&quot;The privacy architecture is what sold me. Streaming high-quality content without a massive data footprint is the future.&quot;</p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Blog Preview Section */}
        <section className="py-24 px-container-padding-mobile md:px-container-padding-desktop max-w-[1920px] mx-auto">
          <div className="flex justify-between items-end mb-stack-lg">
            <div>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 block">Insights</span>
              <h2 className="font-headline-lg text-on-surface">The Stream Journal</h2>
            </div>
            <a className="text-primary hover:underline font-body-md" href="#">View all stories →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <div className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl mb-4 aspect-video">
                <img alt="The Future of Web Streaming" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz4NhmKjDEk20vy1CkB3GGh_Pezvup22-HeNDdQ0kSmWMYB9Jb3f9ypTzOeP7XC1VLg2rUiEvEwFrCCCFLhaZ8yD-V3PXpeqM7wck5ztgwUtkOO-xGxREAZEcBGeE9_VpLPqxojxQZpy9oquhTbG-bW51kpGzEiCkOjRy7GU8zIM5EhFxN6rPZUd_5xAR9xLB_skBqDO7vfMg1_-H75gO-AoExchGTYihc7sDjMTBUMke66v3w_2b_jnzfWbRT-tXtpj5Ol5wsoRs" />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant mb-2 block">March 12, 2024</span>
              <h3 className="font-headline-md text-body-lg text-on-surface group-hover:text-primary transition-colors">The Future of Web Streaming Architecture</h3>
            </div>
            <div className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl mb-4 aspect-video">
                <img alt="Cinematic Color Grading" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcNWWQuwN0kkh9hfbyppMj8PdR5my2_3fGMFlqrZpybE56r1Ag0gqolIm5QLBntJMCU1slrZtm8ES49JDBVYpTG7aSapyhUg1TOuWVOFnU5RiQvzOvyJCqcNODn5cGKNCWprPhXmbCVCHckdcaSD5h2ZVL6pUEpiizGMbzsFguCfNIEvsZSbvQAKmH5r6X8poHPSNg0LCP2XFyT6T9qb22pZFYT7xV9xSpSjX6INIUCOqeth8-l0Cb7au54FYPVAGG2ftjnGTkCqw" />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant mb-2 block">March 08, 2024</span>
              <h3 className="font-headline-md text-body-lg text-on-surface group-hover:text-primary transition-colors">Why 8K HDR is the New Standard for Mobile</h3>
            </div>
            <div className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl mb-4 aspect-video">
                <img alt="Privacy in Streaming" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDXysPXN4r54blfBHBVhoVHr7tuOAdgTLgPRCrbXZOsvx81lphN8kvU-yC6pdRSnAQigJRDb30jkyd0vWj5zzdB3USFjX6ZeKmvaowlP7Rdydgpxkgu8qbr3Y_4v-7Kv5UGYeaKmYK-RC-uZfZVYq5L-KRV6lmSiXSENOHDWFeZuCTuR3EIvzoVb8n-2G8mdiZn5oVM44xVEiGSFCRH9uHP3qLulKjyeIdjwTEGhePbzVNpB8-98KSalVsmFA3H7tZWAhBHYPWRYQ" />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant mb-2 block">March 01, 2024</span>
              <h3 className="font-headline-md text-body-lg text-on-surface group-hover:text-primary transition-colors">Maintaining Privacy in the Age of Instant Play</h3>
            </div>
            <div className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl mb-4 aspect-video">
                <img alt="Spatial Audio Science" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA62-03p3quL3H5VZsLhJeBjDueVtjSfzmJl_1OLy7SBHawX87YLxz4CqVj4XH0taeDoU6Xh-FfgfvOgSXF3VPyRcDa8x8H_n4lt_SNSazvrbJohUfT8ktQyJLKbRMq5ZbIctW6A8y4MxnLdRGjL7uw5_GxeBPljTl__c6Jom3lf67TMLO_CyEb2JZie4DJkpXu2WeJKbMEW6RR81p6rxMn_LO24HI1rJ1WgzPV9Rw65Z1VmjSp2rDB0jdibiFzOKdP0eaOAvKf3ek" />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant mb-2 block">Feb 24, 2024</span>
              <h3 className="font-headline-md text-body-lg text-on-surface group-hover:text-primary transition-colors">The Science of Spatial Audio in Web Streams</h3>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-container-padding-mobile md:px-container-padding-desktop max-w-4xl mx-auto">
          <div className="text-center mb-stack-lg">
            <h2 className="font-headline-lg text-on-surface mb-4">Frequently Asked Questions</h2>
            <p className="text-on-surface-variant">Everything you need to know about the InstantStream experience.</p>
          </div>
          <div className="space-y-4">
            <details className="group border border-black/5 rounded-xl bg-black/[0.02]">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <span className="font-headline-md text-on-surface">What video links are supported?</span>
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="px-6 pb-6 text-on-surface-variant font-body-md">
                InstantStream supports a wide variety of sources including YouTube, Vimeo, Twitch, Magnet Links, and direct video files (MP4, MKV, WebM, HLS).
              </div>
            </details>
            <details className="group border border-black/5 rounded-xl bg-black/[0.02]">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <span className="font-headline-md text-on-surface">Is my viewing history private?</span>
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="px-6 pb-6 text-on-surface-variant font-body-md">
                Absolutely. We use end-to-end encryption for your stream data and never store the content of the videos you watch. Your history is yours alone.
              </div>
            </details>
            <details className="group border border-black/5 rounded-xl bg-black/[0.02]">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <span className="font-headline-md text-on-surface">Do I need a high-speed connection for 8K?</span>
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="px-6 pb-6 text-on-surface-variant font-body-md">
                For 8K streaming, we recommend a connection of at least 100Mbps. However, our adaptive bitrate technology ensures smooth playback on slower connections.
              </div>
            </details>
            <details className="group border border-black/5 rounded-xl bg-black/[0.02]">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <span className="font-headline-md text-on-surface">What are the Pro features?</span>
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="px-6 pb-6 text-on-surface-variant font-body-md">
                Pro members get ad-free streaming, 8K resolution access, unlimited cloud library syncing, priority support, and early access to features like Cinema Sync.
              </div>
            </details>
          </div>
        </section>

        {/* Newsletter Subscription Section */}
        <section className="py-24 px-container-padding-mobile md:px-container-padding-desktop max-w-[1920px] mx-auto">
          <div className="glass-panel p-12 rounded-3xl relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-primary/5 -z-10"></div>
            <div className="max-w-2xl mx-auto">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-4 block">Newsletter</span>
              <h2 className="font-headline-lg text-on-surface mb-6">Stay in the Loop</h2>
              <p className="text-on-surface-variant mb-10 text-body-lg">Get the latest technical deep dives, cinematic features, and product updates delivered straight to your inbox.</p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <div className="relative flex-grow group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl opacity-20 group-focus-within:opacity-50 transition duration-500 blur"></div>
                  <input className="relative w-full bg-surface-container-low border border-black/10 rounded-xl px-6 py-4 text-on-surface focus:ring-0 placeholder:text-on-surface-variant/40 font-body-md" placeholder="Enter your email address" type="email" />
                </div>
                <button className="premium-button-gradient text-on-primary-container px-8 py-4 rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 whitespace-nowrap">Subscribe for Updates</button>
              </form>
              <p className="text-on-surface-variant/40 text-label-sm mt-6">Join over 50,000+ streaming enthusiasts. No spam, ever.</p>
            </div>
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
              className="min-h-screen pt-32 pb-12 px-container-padding-mobile md:px-container-padding-desktop flex flex-col z-20 relative"
            >
              <div className="max-w-[1600px] mx-auto w-full flex-grow flex flex-col">
                <button 
                  onClick={() => setStreamData(null)}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors self-start mb-6 group bg-surface-container-lowest/50 px-4 py-2 rounded-lg border border-black/5 backdrop-blur-md shadow-sm"
                >
                  <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  <span className="font-bold">Back to Home</span>
                </button>
                
                <div className="w-full bg-black rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,122,255,0.15)] border border-white/10 relative flex-grow min-h-[65vh] flex items-center justify-center">
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
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-surface-container border border-black/10 rounded-xl hover:bg-surface-dim transition-colors font-bold text-on-surface">
                      <span className="material-symbols-outlined">cast</span>
                      <span>Cast to TV</span>
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 premium-button-gradient text-on-primary-container shadow-lg rounded-xl hover:scale-105 active:scale-95 transition-all font-bold">
                      <span className="material-symbols-outlined">download</span>
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full pt-stack-lg pb-12 border-t border-outline-variant/10 bg-surface-container-lowest">
        <div className="px-container-padding-mobile md:px-container-padding-desktop max-w-[1920px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-gutter mb-stack-lg">
            <div className="col-span-2">
              <span className="font-display-lg text-headline-md tracking-tighter text-on-surface mb-6 block">InstantStream</span>
              <p className="text-on-surface-variant font-body-md max-w-xs mb-8">Redefining the cinematic experience through cutting-edge web technology and privacy-first streaming.</p>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">public</span>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">share</span>
              </div>
            </div>
            <div>
              <h4 className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest mb-6">Company</h4>
              <nav className="flex flex-col gap-4">
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">About Us</a>
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Careers</a>
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Press</a>
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Blog</a>
              </nav>
            </div>
            <div>
              <h4 className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest mb-6">Resources</h4>
              <nav className="flex flex-col gap-4">
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Help Center</a>
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">API Docs</a>
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Community</a>
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Status</a>
              </nav>
            </div>
            <div>
              <h4 className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest mb-6">Legal</h4>
              <nav className="flex flex-col gap-4">
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Cookie Policy</a>
              </nav>
            </div>
          </div>
          <div className="border-t border-black/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 InstantStream. Cinematic Precision. Built for the modern web.</p>
            <div className="flex gap-stack-md">
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><i className="fab fa-twitter"></i></a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><i className="fab fa-github"></i></a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><i className="fab fa-discord"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

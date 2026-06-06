import Link from "next/link";
import Logo from "@/components/Logo";
import type { Metadata } from "next";
import { Download, Layout, Palette, Share2, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Branding & Assets | FluxPlays",
  description: "Official FluxPlays brand assets, logos, and guidelines for press and partners.",
};

export default function BrandingPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
          Press Kit
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">Branding & Assets</h1>
        <p className="text-white/60 text-lg mb-16 max-w-2xl leading-relaxed">
          Official resources for creators, developers, and partners. Please use these assets following our brand guidelines to ensure consistency.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Logo Section */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
               <Layout className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-4">Official Logo</h2>
            <div className="aspect-video bg-white overflow-hidden rounded-2xl mb-6 flex items-center justify-center relative group">
               <Logo className="w-24 h-24" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2">
                   <Download className="w-4 h-4" /> Download SVG
                 </button>
               </div>
            </div>
            <p className="text-white/40 text-sm">Use the primary logo for all light and dark backgrounds.</p>
          </div>

          {/* Scale Section */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
               <Palette className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-xl font-bold mb-4">Color Palette</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#0070f3]"></div>
                <div>
                  <div className="text-sm font-bold text-white">Primary Blue</div>
                  <div className="text-[10px] text-white/40 tracking-widest uppercase">#0070F3</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#7928ca]"></div>
                <div>
                  <div className="text-sm font-bold text-white">Secondary Purple</div>
                  <div className="text-[10px] text-white/40 tracking-widest uppercase">#7928CA</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#000000] border border-white/10"></div>
                <div>
                  <div className="text-sm font-bold text-white">Surface Black</div>
                  <div className="text-[10px] text-white/40 tracking-widest uppercase">#000000</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-10 rounded-3xl border border-white/5 bg-gradient-to-br from-primary/5 to-transparent text-center">
           <h3 className="text-2xl font-bold mb-4">Need something specific?</h3>
           <p className="text-white/60 mb-8 max-w-sm mx-auto tracking-tight">For high-resolution assets or custom media requests, please reach out to our team.</p>
           <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform">
             Contact Media Dept. <Share2 className="w-4 h-4 ml-1" />
           </Link>
        </div>
      </div>
    </main>
  );
}

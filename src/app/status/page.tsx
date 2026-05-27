import type { Metadata } from "next";
import { CheckCircle, Activity, Globe, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "System Status | FluxPlays",
  description: "Real-time performance and uptime status for FluxPlays streaming services.",
};

export default function StatusPage() {
  const services = [
    { name: "Global Video Resolver", status: "Operational", uptime: "99.99%", latency: "42ms" },
    { name: "HLS Proxy Network", status: "Operational", uptime: "99.98%", latency: "115ms" },
    { name: "MP4 Direct Engine", status: "Operational", uptime: "100%", latency: "12ms" },
    { name: "Google Drive Connector", status: "Operational", uptime: "99.95%", latency: "210ms" },
    { name: "Telegram API Streamer", status: "Operational", uptime: "99.97%", latency: "185ms" },
    { name: "Community Link Index", status: "Operational", uptime: "100%", latency: "8ms" },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
             <h1 className="text-4xl font-bold tracking-tighter mb-2">System Status</h1>
             <p className="text-white/50 text-sm">Real-time status updates for FluxPlays global network.</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold text-sm">
             <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
             All Systems Operational
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
           {services.map((s) => (
             <div key={s.name} className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between group">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Activity className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                 </div>
                 <div>
                    <div className="text-sm font-bold text-white mb-0.5">{s.name}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest">{s.latency} Latency</div>
                 </div>
               </div>
               <div className="flex flex-col items-end">
                  <div className="text-[10px] text-green-500 font-bold uppercase tracking-wider mb-1">{s.status}</div>
                  <div className="text-[9px] text-white/20">{s.uptime} Uptime</div>
               </div>
             </div>
           ))}
        </div>

        {/* Global Latency Map Mockup */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/[0.01] text-center">
            <h3 className="text-lg font-bold mb-8 opacity-60">Global Edge Network Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               <div>
                  <div className="text-2xl font-bold text-white mb-1">12ms</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest text-center">North America</div>
               </div>
               <div>
                  <div className="text-2xl font-bold text-white mb-1">28ms</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest text-center">Europe Central</div>
               </div>
               <div>
                  <div className="text-2xl font-bold text-white mb-1">45ms</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest text-center">Asia Pacific</div>
               </div>
               <div>
                  <div className="text-2xl font-bold text-white mb-1">39ms</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest text-center">South America</div>
               </div>
            </div>
        </div>
      </div>
    </main>
  );
}

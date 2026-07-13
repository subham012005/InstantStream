import Link from "next/link";
import { ArrowRight, PlaySquare, Film, RefreshCw, MonitorPlay, Cloud, Send, Type, List, Activity, FileText } from "lucide-react";

export const metadata = {
  title: "Free Tools | FluxPlays",
  description: "A collection of free utility tools for video streaming and media conversion.",
};

const toolsList = [
  {
    name: "Paste & Play",
    desc: "Stream direct video URLs, MP4s, or magnet links without downloading.",
    href: "/play-direct-video-links",
    icon: PlaySquare,
    tags: ["Free", "Direct Link", "MP4"]
  },
  {
    name: "IMDb Player",
    desc: "Paste any IMDb ID to instantly stream the movie or TV show.",
    href: "/imdb-movie-stream-player",
    icon: Film,
    tags: ["Free", "IMDb", "Cinema Mode"]
  },
  {
    name: "IMDb ↔ TMDB Converter",
    desc: "Convert media IDs between IMDb and TMDB databases.",
    href: "/tools/imdb-tmdb-converter",
    icon: RefreshCw,
    tags: ["Developer", "Metadata", "No API Key"]
  },
  {
    name: "HLS Stream Player",
    desc: "Play and debug live HLS (.m3u8) streams in your browser.",
    href: "/hls-m3u8-stream-player",
    icon: MonitorPlay,
    tags: ["Developer", "Live Stream", "HLS"]
  },
  {
    name: "IPTV Playlist Validator",
    desc: "Validate, parse, and verify M3U playlists and channels.",
    href: "/tools/iptv-playlist-validator",
    icon: List,
    tags: ["Utility", "IPTV", "M3U"]
  },
  {
    name: "HLS Latency Tester",
    desc: "Measure connection response latency and verify HLS stream configs.",
    href: "/tools/hls-latency-tester",
    icon: Activity,
    tags: ["Developer", "Latency", "HLS"]
  },
  {
    name: "Subtitle Converter",
    desc: "Convert SRT subtitle files to WebVTT (.vtt) format online instantly.",
    href: "/tools/srt-to-vtt-converter",
    icon: FileText,
    tags: ["Free", "WebVTT", "SRT"]
  },
  {
    name: "Google Drive Player",
    desc: "Stream Google Drive video links securely.",
    href: "/google-drive-video-player",
    icon: Cloud,
    tags: ["Free", "Google Drive", "Private"]
  },
  {
    name: "Telegram Video Player",
    desc: "Play videos directly from Telegram channels.",
    href: "/telegram-video-player",
    icon: Send,
    tags: ["Free", "Telegram", "Secure"]
  },
  {
    name: "Subtitle Player",
    desc: "Load and test SRT/VTT subtitles against any video.",
    href: "/subtitle-video-player",
    icon: Type,
    tags: ["Utility", "VTT", "SRT"]
  }
];

export default function ToolsHub() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] pt-[80px] pb-[40px] px-4 md:px-8 max-w-[1200px] mx-auto">
      <div className="mb-12">
        <h1 className="font-[family-name:var(--font-sora)] font-bold text-[48px] text-[var(--text-primary)] mb-4">
          Free Tools
        </h1>
        <p className="font-[family-name:var(--font-dm-sans)] text-[18px] text-[var(--text-muted)] max-w-2xl">
          For casual viewers and power users alike.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        {toolsList.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link 
              key={tool.name}
              href={tool.href}
              className="group block relative bg-[var(--bg-surface)] border border-[var(--border)] rounded-[14px] p-[24px] transition-all hover:-translate-y-1 hover:border-[var(--accent)]"
            >
              <div className="absolute top-6 right-6">
                <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <h2 className="font-[family-name:var(--font-sora)] font-bold text-[16px] text-[var(--text-primary)] mb-2">
                {tool.name}
              </h2>
              <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-muted)] mb-6 pr-8">
                {tool.desc}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {tool.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] text-[12px] font-[family-name:var(--font-jetbrains-mono)] text-[var(--text-secondary)] border border-[var(--border)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

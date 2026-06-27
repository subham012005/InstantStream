"use client";

import Link from "next/link";
import Image from "next/image";

export default function TelegramFloatingButton() {
  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <Link 
        href="https://t.me/fluxplays"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-[60px] h-[60px] rounded-full shadow-[0_4px_24px_rgba(42,171,238,0.4)] transition-transform duration-300 hover:scale-110 hover:-translate-y-1 bg-white"
        aria-label="Join our Telegram Group"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 w-full h-full rounded-full bg-[#2AABEE] opacity-0 group-hover:animate-ping z-[-1]"></div>
        
        {/* Official Telegram SVG Icon */}
        <Image 
          src="/logos/telegram.svg" 
          alt="Telegram" 
          width={60} 
          height={60} 
          className="w-full h-full object-contain"
        />

        {/* Tooltip on hover */}
        <div className="absolute right-full mr-4 px-3 py-1.5 bg-[#161618] border border-white/10 rounded-lg text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap hidden sm:block">
          Join our Telegram Group
        </div>
      </Link>
    </div>
  );
}

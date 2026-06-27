"use client";

import { ArrowRight } from "lucide-react";

export default function ComingSoonButton() {
  return (
    <button
      onClick={(e) => { e.preventDefault(); alert('Coming Soon!'); }}
      className="group relative bg-[#00A8E1]/10 border border-[#00A8E1]/30 rounded-[20px] p-6 flex items-center justify-between overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,168,225,0.15)] hover:bg-[#00A8E1]/20 text-left w-full cursor-pointer"
    >
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#00A8E1] flex items-center justify-center font-bold text-white text-xl">
          P
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-sora)] font-bold text-[18px] text-[var(--text-primary)] group-hover:text-white transition-colors">Amazon Prime</h3>
          <p className="font-[family-name:var(--font-dm-sans)] text-[#00A8E1] text-[14px] font-semibold">Coming Soon</p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-[#00A8E1] group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

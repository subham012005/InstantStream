"use client";

import { useEffect, useRef, useState } from "react";

function AnimatedNumber({ target, suffix = "", duration = 2000 }: { target: number, suffix?: string, duration?: number }) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    let hasRun = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasRun) {
          hasRun = true;
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutExpo
            const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(easeOut * target));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={nodeRef}>
      {count === 0 ? "0" : count}
      {count > 0 && count === target && suffix}
    </span>
  );
}

export function LandingPageStats() {
  return (
    <section className="py-16 px-4 md:px-8 max-w-[1200px] mx-auto border-t border-[var(--border-subtle)]">
      <div className="flex flex-col md:flex-row items-center justify-between">
        
        <div className="flex-1 flex flex-col items-center text-center p-8 md:border-r border-[var(--border)]">
          <div className="font-[family-name:var(--font-sora)] font-bold text-[48px] text-[var(--text-primary)] mb-2">
            <AnimatedNumber target={500} suffix="K+" />
          </div>
          <div className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-secondary)]">Movies</div>
        </div>

        <div className="flex-1 flex flex-col items-center text-center p-8 md:border-r border-[var(--border)]">
          <div className="font-[family-name:var(--font-sora)] font-bold text-[48px] text-[var(--text-primary)] mb-2">
            <AnimatedNumber target={6} />
          </div>
          <div className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-secondary)]">Player Types</div>
        </div>

        <div className="flex-1 flex flex-col items-center text-center p-8">
          <div className="font-[family-name:var(--font-sora)] font-bold text-[48px] text-[var(--text-primary)] mb-2">
            Zero
          </div>
          <div className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-secondary)]">Sign-ups</div>
        </div>

      </div>
    </section>
  );
}

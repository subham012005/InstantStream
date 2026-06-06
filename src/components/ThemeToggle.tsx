"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[56px] h-[28px] rounded-full bg-[var(--bg-elevated)] border border-[var(--border)]" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-[56px] h-[28px] rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center px-1 transition-colors hover:border-[var(--accent)] outline-none"
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center shadow-sm z-10"
        initial={false}
        animate={{
          x: isDark ? 26 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-[var(--text-secondary)]" />
        ) : (
          <Sun className="w-3 h-3 text-[var(--text-secondary)]" />
        )}
      </motion.div>
    </button>
  );
}

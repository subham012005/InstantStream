import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "w-8 h-8", size }: LogoProps) {
  const sizeStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={sizeStyle}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D946EF" /> {/* Fuchsia */}
          <stop offset="50%" stopColor="#8B5CF6" /> {/* Violet */}
          <stop offset="100%" stopColor="#3B82F6" /> {/* Cyber Blue */}
        </linearGradient>
        <filter id="logo-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Outer flowing loop (Flux) */}
      <path
        d="M25 25C12 40 12 60 25 75C38 90 62 90 75 75C82 68 85 58 82 48"
        stroke="url(#logo-grad)"
        strokeWidth="7"
        strokeLinecap="round"
        className="opacity-30"
      />
      <path
        d="M25 25C12 40 12 60 25 75C38 90 62 90 75 75C82 68 85 58 82 48"
        stroke="url(#logo-grad)"
        strokeWidth="5"
        strokeLinecap="round"
        filter="url(#logo-glow)"
      />
      {/* Sleek play triangle at center (Play) */}
      <path
        d="M44 36L66 50L44 64V36Z"
        fill="url(#logo-grad)"
        filter="url(#logo-glow)"
      />
    </svg>
  );
}

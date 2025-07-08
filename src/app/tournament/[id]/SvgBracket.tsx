import React from "react";

const BRACKET_WIDTH = 900;
const BRACKET_HEIGHT = 600;

export default function SvgBracketNeonBackgroundOnly() {
  return (
    <div className="relative w-full h-[600px]">
      <svg
        width={BRACKET_WIDTH}
        height={BRACKET_HEIGHT}
        className="absolute inset-0 z-0"
      >
        <defs>
          <linearGradient id="neon-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0ff" />
            <stop offset="50%" stopColor="#181828" />
            <stop offset="100%" stopColor="#ff0080" />
          </linearGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width={BRACKET_WIDTH}
          height={BRACKET_HEIGHT}
          fill="url(#neon-bg)"
        />
      </svg>
    </div>
  );
}

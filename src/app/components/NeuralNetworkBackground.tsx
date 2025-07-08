"use client";

import { useEffect, useRef } from "react";

interface NeuralNetworkBackgroundProps {
  className?: string;
}

export default function NeuralNetworkBackground({
  className = "",
}: NeuralNetworkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 크기 설정
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", () => {
      resizeCanvas();
      drawStaticBackground();
    });

    // 네온 그래피티 곡선/브러시/스프레이 데이터 생성
    const palette = [
      "#ff0080", // 네온 핑크
      "#00ffff", // 네온 블루
      "#ffe600", // 네온 옐로우
      "#8a2be2", // 퍼플
      "#00ff88", // 네온 그린
    ];

    function drawStaticBackground() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 어두운 배경
      ctx.save();
      const bgGradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      bgGradient.addColorStop(0, "#0a0a15");
      bgGradient.addColorStop(1, "#181828");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // 네온 그래피티 곡선
      for (let i = 0; i < 8; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        const glow = color;
        const width = Math.random() * 18 + 12;
        const alpha = Math.random() * 0.3 + 0.25;
        const points = [];
        const cx = Math.random() * canvas.width;
        const cy = Math.random() * canvas.height;
        const len = Math.floor(Math.random() * 5) + 5;
        for (let j = 0; j < len; j++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 180 + 80;
          points.push({
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r,
          });
        }
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.shadowColor = glow;
        ctx.shadowBlur = 32;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.restore();
      }

      // 스프레이(페인트 점)
      for (let i = 0; i < 120; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 8 + 2;
        const alpha = Math.random() * 0.18 + 0.08;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.filter = "blur(2px)";
        ctx.fill();
        ctx.restore();
      }

      // 중앙 로고 뒤 네온 오라
      function drawNeonGlow(
        x: number,
        y: number,
        radius: number,
        color: string,
        alpha: number
      ) {
        if (!ctx) return;
        ctx.save();
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `${color}AA`);
        gradient.addColorStop(0.5, `${color}44`);
        gradient.addColorStop(1, `${color}00`);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.filter = "blur(16px)";
        ctx.fill();
        ctx.restore();
      }
      const logoX = canvas.width / 2;
      const logoY = canvas.height / 2;
      drawNeonGlow(
        logoX,
        logoY,
        Math.min(canvas.width, canvas.height) * 0.18,
        "#ff0080",
        0.18
      );
      drawNeonGlow(
        logoX,
        logoY,
        Math.min(canvas.width, canvas.height) * 0.12,
        "#00ffff",
        0.12
      );
      drawNeonGlow(
        logoX,
        logoY,
        Math.min(canvas.width, canvas.height) * 0.08,
        "#ffe600",
        0.1
      );
    }

    drawStaticBackground();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
        style={{ zIndex: -1 }}
      />
      {/* 중앙 로고 이미지 */}
      <img
        src="/uploads/tushig+logo.png"
        alt="Logo"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
        style={{
          zIndex: 0,
          opacity: 0.13,
          width: "40vw",
          maxWidth: 480,
          minWidth: 200,
          filter: "drop-shadow(0 0 32px #0008)",
        }}
        draggable={false}
      />
    </>
  );
}

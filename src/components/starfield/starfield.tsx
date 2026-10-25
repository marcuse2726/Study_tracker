"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "@/lib/store/settings";

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  vx: number;
  vy: number;
  /** 亮星：带光晕 */
  glow: boolean;
  /** 最亮星：带十字星光 */
  sparkle: boolean;
}

interface Nebula {
  x: number;
  y: number;
  r: number;
  color: string;
  vx: number;
  vy: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

/**
 * 宇宙星空背景：全屏 Canvas。
 * - 星空闪烁 + 缓慢漂移（亮星带光晕 / 十字星光）
 * - 银河带（对角带状光晕 + 密集小星）
 * - 星云 + 大而亮的流星
 * - pointer-events:none，不阻挡交互；尊重 prefers-reduced-motion；标签页隐藏时暂停。
 */
export function Starfield() {
  const { starfieldEnabled } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!starfieldEnabled) return;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    // 显式非空类型别名，避免 TS 在函数闭包中丢失收窄
    const cv: HTMLCanvasElement = canvasEl;
    const c2d: CanvasRenderingContext2D = ctx;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let nebulas: Nebula[] = [];
    let raf = 0;
    let t = 0;
    let running = true;
    let shooting: ShootingStar | null = null;
    let nextShoot = 2500 + Math.random() * 3500;

    // 银河带的中心线（从左下到右上）
    const bandY0 = () => height * 0.72;
    const bandY1 = () => height * 0.18;

    function initStars() {
      // 普通星星
      const normalCount = Math.min(320, Math.floor((width * height) / 3600));
      stars = Array.from({ length: normalCount }, () => {
        const glow = Math.random() < 0.1;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.4 + 0.4,
          baseAlpha: Math.random() * 0.5 + 0.5,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.4,
          vx: (Math.random() - 0.5) * 0.06,
          vy: (Math.random() - 0.5) * 0.06,
          glow,
          sparkle: glow && Math.random() < 0.25,
        };
      });

      // 银河带密集小星（沿对角带散布）
      const y0 = bandY0();
      const y1 = bandY1();
      const dx = width;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy) || 1;
      const px = -dy / len;
      const py = dx / len;
      const thickness = height * 0.16;
      const mwCount = Math.min(280, Math.floor((width * height) / 5000));
      for (let i = 0; i < mwCount; i++) {
        const tt = Math.random();
        const cx = tt * width;
        const cy = y0 + tt * (y1 - y0);
        const off = (Math.random() * 2 - 1) * thickness;
        stars.push({
          x: cx + px * off,
          y: cy + py * off,
          r: Math.random() * 0.6 + 0.15,
          baseAlpha: Math.random() * 0.4 + 0.15,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.8,
          vx: (Math.random() - 0.5) * 0.02,
          vy: (Math.random() - 0.5) * 0.02,
          glow: false,
          sparkle: false,
        });
      }

      const m = Math.max(width, height);
      nebulas = [
        { x: width * 0.18, y: height * 0.28, r: m * 0.45, color: "99,102,241", vx: 0.03, vy: 0.02 },
        { x: width * 0.82, y: height * 0.72, r: m * 0.4, color: "168,85,247", vx: -0.02, vy: 0.03 },
        { x: width * 0.55, y: height * 0.45, r: m * 0.5, color: "59,130,246", vx: 0.02, vy: -0.02 },
      ];
    }

    function drawBackground() {
      const g = c2d.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, "#05060f");
      g.addColorStop(0.5, "#0b0f26");
      g.addColorStop(1, "#141033");
      c2d.fillStyle = g;
      c2d.fillRect(0, 0, width, height);
    }

    function drawMilkyWay() {
      const y0 = bandY0();
      const y1 = bandY1();
      const cx = width / 2;
      const cy = (y0 + y1) / 2;
      const angle = Math.atan2(y1 - y0, width);
      const halfLen = Math.hypot(width, height) / 2 + 60;
      const halfThick = height * 0.2;

      c2d.save();
      c2d.translate(cx, cy);
      c2d.rotate(angle);
      const g = c2d.createLinearGradient(0, -halfThick, 0, halfThick);
      g.addColorStop(0, "rgba(150,170,255,0)");
      g.addColorStop(0.5, "rgba(175,195,255,0.10)");
      g.addColorStop(1, "rgba(150,170,255,0)");
      c2d.fillStyle = g;
      c2d.fillRect(-halfLen, -halfThick, halfLen * 2, halfThick * 2);
      c2d.restore();
    }

    function drawNebulas() {
      for (const n of nebulas) {
        const g = c2d.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, `rgba(${n.color},0.13)`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        c2d.fillStyle = g;
        c2d.fillRect(0, 0, width, height);
      }
    }

    function drawSparkle(s: Star, alpha: number) {
      const len = s.r * 7;
      const d = len * 0.5;
      c2d.strokeStyle = `rgba(255,255,255,${(alpha * 0.8).toFixed(3)})`;
      c2d.lineWidth = 0.8;
      c2d.beginPath();
      c2d.moveTo(s.x - len, s.y);
      c2d.lineTo(s.x + len, s.y);
      c2d.stroke();
      c2d.beginPath();
      c2d.moveTo(s.x, s.y - len);
      c2d.lineTo(s.x, s.y + len);
      c2d.stroke();
      c2d.beginPath();
      c2d.moveTo(s.x - d, s.y - d);
      c2d.lineTo(s.x + d, s.y + d);
      c2d.stroke();
      c2d.beginPath();
      c2d.moveTo(s.x + d, s.y - d);
      c2d.lineTo(s.x - d, s.y + d);
      c2d.stroke();
    }

    function drawStars(fixedAlpha: boolean) {
      for (const s of stars) {
        const tw = fixedAlpha ? 1 : 0.35 + 0.65 * Math.sin(s.phase + t * s.speed);
        const alpha = Math.max(0, Math.min(1, s.baseAlpha * tw));

        if (s.glow) {
          const haloR = s.r * 5;
          const halo = c2d.createRadialGradient(s.x, s.y, 0, s.x, s.y, haloR);
          halo.addColorStop(0, `rgba(210,220,255,${(alpha * 0.5).toFixed(3)})`);
          halo.addColorStop(1, "rgba(210,220,255,0)");
          c2d.fillStyle = halo;
          c2d.beginPath();
          c2d.arc(s.x, s.y, haloR, 0, Math.PI * 2);
          c2d.fill();
        }

        c2d.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        c2d.beginPath();
        c2d.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        c2d.fill();

        if (s.sparkle) drawSparkle(s, alpha);
      }
    }

    function drawStatic() {
      drawBackground();
      drawMilkyWay();
      drawNebulas();
      drawStars(true);
    }

    function frame() {
      if (!running) return;
      t += 0.016;

      drawBackground();
      drawMilkyWay();

      for (const n of nebulas) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -n.r) n.x = width + n.r;
        if (n.x > width + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = height + n.r;
        if (n.y > height + n.r) n.y = -n.r;
      }
      drawNebulas();

      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;
      }
      drawStars(false);

      nextShoot -= 16;
      if (!shooting && nextShoot <= 0) {
        shooting = {
          x: width * 0.15 + Math.random() * width * 0.7,
          y: Math.random() * height * 0.4,
          vx: -(4 + Math.random() * 3),
          vy: 2.5 + Math.random() * 2,
          life: 0,
          maxLife: 800 + Math.random() * 400,
        };
        nextShoot = 4200 + Math.random() * 6000;
      }
      if (shooting) {
        shooting.life += 16;
        shooting.x += shooting.vx;
        shooting.y += shooting.vy;
        const fade = Math.max(0, 1 - shooting.life / shooting.maxLife);
        const tx = shooting.x - shooting.vx * 9;
        const ty = shooting.y - shooting.vy * 9;
        if (
          shooting.life >= shooting.maxLife ||
          shooting.x < -60 ||
          shooting.y > height + 60
        ) {
          shooting = null;
        } else {
          // 头部光晕
          const head = c2d.createRadialGradient(
            shooting.x, shooting.y, 0,
            shooting.x, shooting.y, 11,
          );
          head.addColorStop(0, `rgba(255,255,255,${fade.toFixed(3)})`);
          head.addColorStop(1, "rgba(255,255,255,0)");
          c2d.fillStyle = head;
          c2d.beginPath();
          c2d.arc(shooting.x, shooting.y, 11, 0, Math.PI * 2);
          c2d.fill();
          // 尾巴
          const g = c2d.createLinearGradient(shooting.x, shooting.y, tx, ty);
          g.addColorStop(0, `rgba(255,255,255,${fade.toFixed(3)})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          c2d.strokeStyle = g;
          c2d.lineWidth = 3;
          c2d.beginPath();
          c2d.moveTo(shooting.x, shooting.y);
          c2d.lineTo(tx, ty);
          c2d.stroke();
        }
      }

      raf = requestAnimationFrame(frame);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      cv.width = Math.floor(width * dpr);
      cv.height = Math.floor(height * dpr);
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
      if (reduced) drawStatic();
    }

    function onVisibility() {
      running = !document.hidden;
      if (running && !reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    }

    resize();

    if (reduced) {
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }

    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [starfieldEnabled]);

  if (!starfieldEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}

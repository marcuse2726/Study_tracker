"use client";

// ============================================================================
// background-layer.tsx —— 全屏壁纸背景层
// ============================================================================
// 文件开头的 "use client" 是 Next.js 的指令：
// 说明这个组件会在【浏览器】里运行（因为要用 useState 记录加载状态）。
//
// 这一层由三部分组成，从下往上：
//   1. <video>  全屏循环播放壁纸（muted 静音，浏览器才允许自动播放）
//   2. 深色遮罩 压低整幅亮度，保证白字在明亮区域也能看清
//   3. 渐变遮罩 顶部/底部再压暗一档，导航栏和页脚区域更清晰
//
// 关键容错：壁纸文件不在仓库里（public/wallpaper/ 已被 .gitignore 排除）。
// 所以一旦视频加载失败（文件不存在 / 别的电脑上没这个文件），
// 就自动回退到原来的 Canvas 星空背景 —— 别人 clone 你的仓库也不会白屏。
// ============================================================================

import { useState } from "react";
import { Starfield } from "@/components/starfield/starfield";

/** 壁纸视频路径。public/ 下的文件在网址根目录直接访问，所以省掉 "public"。 */
const WALLPAPER_SRC = "/wallpaper/wallpaper.mp4";

/** 首帧海报：视频解码出第一帧之前先显示它，避免黑屏闪一下。 */
const WALLPAPER_POSTER = "/wallpaper/poster.jpg";

/**
 * 遮罩不透明度，0 ~ 1。
 *   0    → 完全不遮，壁纸最漂亮，但明亮区域上的文字看不清
 *   0.7  → 当前取值：兼顾观感与可读性
 *   1    → 全黑，等于看不见壁纸
 * 想调亮/调暗壁纸，只改这一个数字即可。
 */
const OVERLAY_OPACITY = 0.7;

export function BackgroundLayer() {
  // 视频加载失败时置为 true，于是整层换成星空背景
  const [failed, setFailed] = useState(false);

  // 失败就直接交出星空背景，后面什么都不渲染
  if (failed) {
    return <Starfield />;
  }

  return (
    <>
      {/*
        <video> 作为背景视频的要点：
          autoPlay   → 自动播放（配合 muted 才不被浏览器拦截）
          muted      → 必须静音，否则绝大多数浏览器禁止自动播放
          loop       → 播完循环，做成无缝背景
          playsInline→ iOS Safari 上不要全屏接管播放
          preload=auto → 提前加载
          onError    → 加载失败（404 等）时切到星空
          onLoadedData → 拿到第一帧后可以淡入（这里不做额外处理，靠 poster 过渡）
          aria-hidden  → 纯装饰，对屏幕阅读器隐藏

        className 说明：
          fixed inset-0  → 固定铺满整个视口
          z-0            → 最底层（页面内容那一层是 z-10，会盖在它上面）
          size-full      → 宽高 100%
          object-cover   → 按比例铺满并裁切，不变形
          pointer-events-none → 不接收鼠标事件，不会挡住按钮
      */}
      <video
        className="pointer-events-none fixed inset-0 z-0 size-full object-cover"
        src={WALLPAPER_SRC}
        poster={WALLPAPER_POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onError={() => setFailed(true)}
      />

      {/* 均匀深色遮罩：把整幅壁纸压暗到 (1 - 0.7) 的亮度 */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ backgroundColor: `rgba(4, 6, 15, ${OVERLAY_OPACITY})` }}
        aria-hidden="true"
      />

      {/*
        纵向渐变遮罩：
          0%   → 半透明深色，给顶部导航栏垫底
          22%  → 完全透明，中间露出壁纸
          70%  → 仍然透明
          100% → 半透明深色，给底部页脚垫底
      */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(4,6,15,0.55) 0%, rgba(4,6,15,0) 22%, rgba(4,6,15,0) 70%, rgba(4,6,15,0.6) 100%)",
        }}
        aria-hidden="true"
      />
    </>
  );
}

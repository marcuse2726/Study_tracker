const SPARKLES = [
  { left: "-3%", top: "-4%", size: "1.3rem", delay: "0s" },
  { left: "103%", top: "12%", size: "1rem", delay: "0.7s" },
  { left: "5%", top: "96%", size: "0.9rem", delay: "1.2s" },
  { left: "95%", top: "90%", size: "1.1rem", delay: "0.4s" },
  { left: "50%", top: "-34%", size: "0.8rem", delay: "0.9s" },
];

/** 大主页：装饰性主界面，居中大标题 + 副标题，缓慢淡入 + 星空艺术字 */
export default function LandingPage() {
  return (
    <div className="flex min-h-[68vh] flex-col items-center justify-center">
      <div
        className="relative px-8 text-center"
        style={{ animation: "landing-fade-in 2.2s ease-out both" }}
      >
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="landing-sparkle"
            style={{
              left: s.left,
              top: s.top,
              fontSize: s.size,
              animationDelay: s.delay,
            }}
            aria-hidden="true"
          >
            ✦
          </span>
        ))}

        <h1 className="landing-title text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Study Tracker
        </h1>

        <p
          className="mt-5 text-lg text-muted-foreground sm:text-xl"
          style={{ animation: "landing-fade-in 2.2s ease-out 0.5s both" }}
        >
          让学习看得见
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// page.tsx —— 主页，对应网址 "/"
// ============================================================================
// 【这个文件是谁】
// Next.js 的"页面"约定文件：只要文件夹里叫 page.tsx，它就是一个可访问的页面，
// 网址由【文件夹路径】决定，不需要你手写任何 URL 映射表。
//
//     src/app/page.tsx              →  /
//     src/app/english/page.tsx      →  /english
//     src/app/schedule/page.tsx     →  /schedule
//
// 这条规则是 Next.js 的核心：文件系统即路由。
//
// 【它是"服务端组件"（Server Component）】
// 文件开头没有 "use client" 指令 → 默认在服务器上渲染成 HTML 再发给浏览器。
// 好处：浏览器不需要下载这块的 JS 就能看到内容，首屏更快。
//
// 这一页全是静态文字和装饰，没有任何交互（没有点击、没有输入、没有状态），
// 所以做成服务端组件是最合适的。凡是需要 useState / useEffect / onClick 的
// 组件，才必须加 "use client" 改成客户端组件。
// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// 模块级常量：5 颗装饰星星的位置、大小、闪烁延迟。
//
// 作用类似 C++ 里的文件作用域全局数组：模块被加载时创建一次，
// 之后每次渲染都复用它，不会重复构造。
//
// 每个元素（一个对象）的字段含义：
//   left  → 星星相对标题框的横向位置，百分比。可以用负数或超过 100%，
//           表示故意溢出到标题框外面，看起来更自然、更像随机散布
//   top   → 纵向位置，同样是百分比
//   size  → 字号。星星用的是 ✦ 字符，所以字号 = 星星大小
//   delay → CSS 动画延迟。让 5 颗星星【错开】闪烁，
//           而不是整齐划一地同时闪（那样会很假）
// ----------------------------------------------------------------------------
const SPARKLES = [
  { left: "-3%", top: "-4%", size: "1.3rem", delay: "0s" },
  { left: "103%", top: "12%", size: "1rem", delay: "0.7s" },
  { left: "5%", top: "96%", size: "0.9rem", delay: "1.2s" },
  { left: "95%", top: "90%", size: "1.1rem", delay: "0.4s" },
  { left: "50%", top: "-34%", size: "0.8rem", delay: "0.9s" },
];


// ----------------------------------------------------------------------------
// 主页组件。
// 函数没有参数 → 它是"叶子页面"，不需要父组件传任何数据进来。
// 函数名 LandingPage 可以随便起（LandingPage / Home / Index 都行），
// 框架只认 "default 导出" 这个身份，不认函数名。
// ----------------------------------------------------------------------------
export default function LandingPage() {
  // return 的是 JSX：一段"长得像 HTML 的表达式"。
  // 编译后它变成函数调用，生成虚拟 DOM；React 再把虚拟 DOM 变成真实页面。
  return (
    /*
      最外层容器，负责把内容【整体居中】。四个类名分工：

        flex          → 开启弹性布局（相当于 display: flex）
        flex-col      → 主轴改成纵向（默认是横向），即"从上到下排"
        items-center  → 交叉轴居中 = 横向居中
        justify-center→ 主轴居中 = 纵向居中
        两个 center 合起来，就是"水平垂直都居中"

        min-h-[68vh]  → 最小高度 = 屏幕高度的 68%。
                        方括号是 Tailwind 的"任意值"写法：值不是预设档位时，
                        就把它原样变成 CSS。68% 是刻意留出上下空间，
                        让标题不至于被导航栏和页脚夹得太挤。
    */
    <div className="flex min-h-[68vh] flex-col items-center justify-center">
      {/*
        relative：让这个 div 成为下面那些星星的"定位参照物"。
        因为 CSS 里 .landing-sparkle 是 position: absolute，
        绝对定位的元素会去找【最近的】定位祖先作为坐标系 —— 就是这一层。

        px-8      → 左右内边距 2rem，防止文字贴边
        text-center → 文字居中

        style={{ ... }} 是 React 的内联样式写法：
          - 传的必须是一个【对象】，不是字符串
          - 键名必须用驼峰：font-size 要写成 fontSize
          - 和 className 的分工：className 放"可复用的命名样式"，
            style 放"每个元素都不一样、需要计算的值"

        这里的动画拆开读：
          animation: "landing-fade-in 2.2s ease-out both"
            动画名      → landing-fade-in（在 globals.css 里用 @keyframes 定义：
                          从"透明 + 下移 28px"渐变到"不透明 + 归位"）
            2.2s        → 持续 2.2 秒
            ease-out    → 缓动曲线：先快后慢，收尾柔和
            both        → 填充模式：动画开始前就应用第一帧、结束后保持最后一帧。
                          不加 both 的话，2.2 秒前可能会有一次"闪一下"的跳动。
      */}
      <div
        className="relative px-8 text-center"
        style={{ animation: "landing-fade-in 2.2s ease-out both" }}
      >
        {/*
          批量生成 5 颗星星。

          {SPARKLES.map((s, i) => ( ... ))} 拆开看：
            .map()   → 数组方法，把数组里每一项变成一个 JSX 元素，
                       最后得到一个"JSX 数组"。类似于 C++ 里对容器做 transform
                       后收集结果。React 允许直接渲染数组，会依次显示。
            (s, i)   → 回调参数：s 是当前元素（一个对象），i 是下标
            => ( ... ) → 箭头函数返回一块 JSX（用括号包起来是为了排版好看）

          key={i} 是必须的：React 靠 key 判断"这一项还是不是上一轮那一项"，
          以便复用已有的 DOM 节点、减少重排。用下标 i 当 key 只适合这种
          【顺序和数量都永远不变的静态列表】；真实业务里动态增删的列表
          应该用数据自带的唯一 id，否则会出现"删错行"的诡异 bug。
        */}
        {SPARKLES.map((s, i) => (
          /*
            <span> 是行内元素，适合承载这种小装饰。
            className="landing-sparkle" 对应 globals.css 里的定义：
              position: absolute   → 绝对定位，坐标由下面 style 的 left/top 给
              pointer-events: none → 不接收鼠标事件，所以它不会妨碍你点别的东西
              animation: twinkle   → 循环的闪烁（缩放 + 旋转 + 透明度起伏）
          */
          <span
            key={i}
            className="landing-sparkle"
            // 每颗星星各自的位置、大小、延迟都不同，所以只能用内联 style
            // 逐个赋值，不能共用一个 className。
            // 注意 fontSize: s.size 里 s.size 是 "1.3rem" 这种【带单位的字符串】，
            // React 会原样输出；如果写成数字（如 13），React 会自动补上 px。
            style={{
              left: s.left,
              top: s.top,
              fontSize: s.size,
              animationDelay: s.delay,
            }}
            // aria-hidden="true"：无障碍属性。告诉屏幕阅读器"这是纯装饰，
            // 别念出来"。否则读屏软件会念一串"星、星、星"。
            aria-hidden="true"
          >
            {/* 一颗 Unicode 星形字符 ✦，不需要任何图标库 */}
            ✦
          </span>
        ))}

        {/*
          主标题。
          .landing-title 对应 globals.css 里那套"流光渐变字"：
            背景是 5 段渐变色 → background-clip: text 把背景裁进文字形状 →
            color: transparent 让文字本身透明（于是看到的是背景渐变）→
            animation: text-shimmer 让渐变缓慢横向流动 →
            filter: drop-shadow(...) 加一圈紫色辉光

          其余的类是 Tailwind 尺寸/排版：
            text-5xl  → 字号 3rem
            sm:text-6xl → 屏幕 ≥640px 时字号升到 3.75rem
            md:text-7xl → 屏幕 ≥768px 时升到 4.5rem
            font-bold → 加粗
            tracking-tight → 字间距收紧一点，大标题更紧凑好看

          没有写 style，因为动画和渐变都封在 .landing-title 这个类里了 ——
          这正是 className 和 style 的取舍：能复用、能写成固定规则的，用类。
        */}
        <h1 className="landing-title text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Study Tracker
        </h1>

        {/*
          副标题。
            mt-5 → 与上方标题保持 1.25rem 间距
            text-lg / sm:text-xl → 字号随屏幕变大
            text-muted-foreground → 用"次要文字色"（比正文更淡），
                                    形成主次层次

          style 里的动画和第 12 行那个 div 是同一个关键帧，
          但多了一个 0.5s 的【延迟】：
          animation 简写里"2.2s"是持续时间，"0.5s"这个位置是 delay，
          所以标题先淡入，半秒后副标题才跟着淡入，有先后节奏。
        */}
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

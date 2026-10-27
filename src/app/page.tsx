// ============================================================================
// page.tsx —— 主页，对应网址 "/"
// ============================================================================
// 【这是不是用 HTML 写的？】
// 不是，是 TypeScript + JSX（文件名后缀 .tsx 就是 .ts + jsx）。
// 它看起来几乎就是 HTML，但 JSX 是 JavaScript 的语法扩展，会被编译成函数调用。
// 本文件里就能看到 HTML 做不到的东西：下面用 SPARKLES.map(...) 循环生成 5 颗星星。
//
// 两条必须记住的差异：HTML 的 class 在 JSX 里叫 className；
// HTML 注释 <!-- --> 在 JSX 里必须写成花括号包起来的块注释。
//
// 【这个文件是谁】
// Next.js 的"页面"约定文件：文件夹里有 page.tsx，它就对应一个网址。
// 网址由【文件夹路径】决定，不需要你手写任何 URL 映射表：
//     src/app/page.tsx           →  /
//     src/app/english/page.tsx   →  /english
//     src/app/schedule/page.tsx  →  /schedule
// 这条规则是 Next.js 的核心：文件系统即路由。
//
// 【它是"服务端组件"（Server Component）】
// 文件开头没有 "use client" 指令 → 默认在服务器上渲染成 HTML 再发给浏览器。
// 好处：浏览器不必下载这块 JS 就能看到内容，首屏更快。
// 这一页全是静态文字和装饰（没有点击、没有输入、没有状态），
// 所以做成服务端组件最合适。只有需要 useState / useEffect / onClick 的组件，
// 才必须加 "use client" 改成客户端组件。
// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// 模块级常量：5 颗装饰星星的位置、大小、闪烁延迟。
//
// 作用类似 C++ 的文件作用域全局数组：模块加载时创建一次，
// 之后每次渲染都复用它，不会重复构造。
//
// 数组里每个元素是一个"对象"（花括号包起来的键值对），共 4 个字段：
//   left  → 星星相对标题框的横向位置，百分比。
//           允许负数或超过 100%，故意溢出到标题框外面，看起来更像随机散布。
//   top   → 纵向位置，同样是百分比。
//   size  → 字号。星星用的是 ✦ 这个字符，所以字号就等于星星大小。
//   delay → 动画延迟。让 5 颗星星【错开】闪烁，
//           而不是整齐划一地同时闪（那样很假）。
//
// 行尾的逗号是数组/对象允许的"尾随逗号"，不是语法错误。
// ----------------------------------------------------------------------------
const SPARKLES = [
  // 第 1 颗：左上角外侧，稍大，立刻开始闪（delay 0s）
  { left: "-3%", top: "-4%", size: "1.3rem", delay: "0s" },
  // 第 2 颗：右上角外侧，延迟 0.7 秒后开始
  { left: "103%", top: "12%", size: "1rem", delay: "0.7s" },
  // 第 3 颗：左下角外侧，延迟 1.2 秒
  { left: "5%", top: "96%", size: "0.9rem", delay: "1.2s" },
  // 第 4 颗：右下角外侧，延迟 0.4 秒
  { left: "95%", top: "90%", size: "1.1rem", delay: "0.4s" },
  // 第 5 颗：正上方偏外，延迟 0.9 秒
  { left: "50%", top: "-34%", size: "0.8rem", delay: "0.9s" },
];


// ----------------------------------------------------------------------------
// 主页组件。
// 这一行逐段拆解：
//   export default → 作为本文件的"默认导出"。Next.js 要求页面必须默认导出。
//   function       → 定义一个函数；在 React 里"返回界面的函数"就是组件。
//   LandingPage    → 函数名，框架不认名字，只认 default 导出（叫什么都行）。
//   ()             → 没有参数：说明它是"叶子页面"，不需要父组件传数据进来。
//   {              → 函数体开始。
// ----------------------------------------------------------------------------
export default function LandingPage() {
  // return 返回 JSX。后面跟圆括号 ( 而不是花括号 {，
  // 因为要返回的是"表达式"，圆括号只是为了能换行排版。
  return (
    /*
      最外层容器：负责把内容【整体居中】。5 个类名分工如下：

        flex            → display: flex，开启弹性布局
        flex-col        → 主轴改为纵向（默认横向），即"从上到下排"
        items-center    → 交叉轴居中 = 横向居中
        justify-center  → 主轴居中 = 纵向居中
        两个 center 合起来，就是"水平垂直都居中"

        min-h-[68vh]    → 最小高度 = 屏幕高度的 68%。
                          方括号是 Tailwind 的"任意值"写法：值不在预设档位里时，
                          就把它原样变成 CSS。68% 是刻意留白，
                          让标题不被导航栏和页脚夹得太挤。
    */
    <div className="flex min-h-[68vh] flex-col items-center justify-center">
      {/*
        内层容器：定位参照物 + 文字排版。

          relative      → position: relative
                          让这个 div 成为下面那些星星的"定位参照物"。
                          因为 CSS 里 .landing-sparkle 是 position: absolute，
                          绝对定位元素会去找【最近的】定位祖先当坐标系 —— 就是这层。
          px-8          → 左右内边距 2rem，防止文字贴边
          text-center   → 文字水平居中

        style={{ ... }} 是 React 的内联样式写法，两条规则：
          - 传的必须是【对象】，不是字符串
          - 键名必须驼峰：font-size 要写成 fontSize

        className 和 style 的分工：
          className 放"可复用的命名样式"（固定规则，写一次到处用）
          style     放"每个元素都不一样、需要计算的值"

        这里动画简写拆开读：
          animation: "landing-fade-in 2.2s ease-out both"
            动画名      → landing-fade-in。它在 globals.css 里用 @keyframes 定义：
                          从"透明 + 下移 28px"渐变到"不透明 + 归位"
            2.2s        → 持续 2.2 秒
            ease-out    → 缓动曲线：先快后慢，收尾柔和
            both        → 填充模式：开始前就应用第一帧、结束后保持最后一帧。
                          不加 both 的话，2.2 秒之前可能会"闪一下"再开始。
      */}
      <div
        className="relative px-8 text-center"
        style={{ animation: "landing-fade-in 2.2s ease-out both" }}
      >
        {/*
          批量生成 5 颗星星。这一行把三件事拼在一起：

            { ... }              → 花括号表示"这里放一个 JS 表达式的值"。
            SPARKLES.map(...)    → 数组方法：把数组每一项变成一个 JSX 元素，
                                   最后得到一个"JSX 数组"，React 会依次渲染。
                                   相当于对容器做 transform 后收集结果。
            (s, i) => ( ... )    → 箭头函数（相当于匿名函数/lambda）：
                                   s 是当前元素（一个对象），i 是下标。
                                   返回括号里那块 JSX。

          key={i} 为什么必须有：
          React 靠 key 判断"这一项还是上一轮那一项"，以便复用已有的 DOM 节点、
          减少重排。用下标 i 当 key 只适合这种【顺序和数量永远不变的静态列表】；
          真实业务里动态增删的列表应该用数据自带的唯一 id，
          否则会出现"删错行"的诡异 bug。
        */}
        {SPARKLES.map((s, i) => (
          /*
            <span> 是行内元素，适合承载这种小装饰。
            这一行有 4 个属性：

              key={i}
                   React 列表项的"身份证"，见上面的解释。
                   注意它是花括号包表达式，不是字符串，所以不加引号。

              className="landing-sparkle"
                   对应 globals.css 里的定义：
                     position: absolute    → 绝对定位，坐标由下面 style 的 left/top 给
                     pointer-events: none  → 不接收鼠标事件，所以不会妨碍你点别的东西
                     animation: twinkle    → 循环闪烁（缩放 + 旋转 + 透明度起伏）
                   因为坐标每颗都不一样，className 只负责"共同的样式"。

              style={{ ... }}
                   每颗星星各自的位置、大小、延迟都不同，只能逐个赋值：
                     left: s.left             → 横向坐标，来自上面的数据
                     top: s.top               → 纵向坐标
                     fontSize: s.size         → 字号即大小。s.size 是 "1.3rem"
                                                这种【带单位的字符串】，React 原样输出；
                                                若写成数字（如 13），React 会自动补 px。
                     animationDelay: s.delay  → 让各颗星星错开开始闪

              aria-hidden="true"
                   无障碍属性：告诉屏幕阅读器"这是纯装饰，别念出来"。
                   否则读屏软件会念一串"星、星、星"。
          */
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
            {/* 一颗 Unicode 星形字符 ✦，不需要引入任何图标库。
                注意：JSX 里标签之间的文字会【自动成为子元素】，
                所以这个 ✦ 不需要任何包裹，直接写在这里就是 span 的内容。 */}
            ✦
          </span>
        ))}

        {/*
          主标题。

          className 里前半段 landing-title 是自定义类，对应 globals.css 里那套
          "流光渐变字"，它的实现步骤是：
            5 段渐变色背景 → background-clip: text 把背景裁进文字形状 →
            color: transparent 让文字本身透明（于是看到的是背景渐变）→
            animation: text-shimmer 让渐变缓慢横向流动 →
            filter: drop-shadow(...) 加一圈紫色辉光

          后半段全是 Tailwind 的排版类：
            text-5xl      → 字号 3rem
            sm:text-6xl   → 屏幕 ≥640px 时升到 3.75rem
            md:text-7xl   → 屏幕 ≥768px 时升到 4.5rem
            font-bold     → 加粗
            tracking-tight→ 字间距收紧一点，大标题更紧凑好看

          这里没写 style，因为动画和渐变全封在 .landing-title 类里了 ——
          这正是 className 和 style 的取舍：能写成固定规则的，就放进类。
        */}
        <h1 className="landing-title text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          {/* 标签之间的文字会被原样输出到页面上（首尾空白会被 JSX 裁掉）。 */}
          Study Tracker
        </h1>

        {/*
          副标题。类名逐个解释：
            mt-5                  → 与上方标题保持 1.25rem 间距
            text-lg               → 字号 1.125rem
            sm:text-xl            → 屏幕 ≥640px 时升到 1.25rem
            text-muted-foreground → 用"次要文字色"（比正文更淡），形成主次层次

          style 里的动画和第 12 行那个 div 是同一个关键帧 landing-fade-in，
          但简写里多了一个 0.5s —— animation 简写的位置含义是：
            "名字 持续时间 缓动 延迟 填充模式"
          所以标题先淡入，半秒后副标题才跟着淡入，形成先后节奏。
        */}
        <p
          className="mt-5 text-lg text-muted-foreground sm:text-xl"
          style={{ animation: "landing-fade-in 2.2s ease-out 0.5s both" }}
        >
          让学习看得见
        </p>
        {/* 到这里，内层 div 的所有子元素结束。 */}
      </div>
    </div>
  );
  // 分号结束 return 语句；再下面这行的 } 结束整个组件函数。
}

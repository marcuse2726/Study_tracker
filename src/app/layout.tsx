// ============================================================================
// layout.tsx —— 全站"总外壳"（Root Layout）
// ============================================================================
// 【这个文件是谁】
// Next.js 的约定文件：src/app/layout.tsx 是"根布局"，由框架按路径自动挂载，
// 不需要（也不应该）在别处手动 import 它。
//
// 【它解决什么问题】
// 相当于 C++ 里"所有页面共用的那层外层函数"：
// 不管你访问 /、/algorithm 还是 /schedule，最终都会被套进这个
// <html> -> <body> 的外壳里渲染，页面自己只负责填中间那块内容。
//
//   Render(layout) { html { body { Navbar; Render(page); Footer } } }
//
// 【关键概念：layout 和 page 的分工】
//   - layout.tsx：外壳，多个页面共用。切换页面时它【不会】重新渲染，
//                 所以导航栏不会闪、星空不会重画。
//   - page.tsx  ：内容，对应一个具体网址。切换页面时只有它被替换。
//
// 【两层组件模型，对应你熟悉的说法】
//   组件（Component）  ≈ 一个函数，返回"一段界面"
//   props             ≈ 函数参数
//   children          ≈ 框架替你传进来的"下一个页面"
//
// 【为什么文末要 <html> 里放 <body>】
// 根布局必须渲染整个 HTML 文档的最外层两个标签，这是 Next.js 的硬性规定。
// ----------------------------------------------------------------------------


// `import type` = 只导入"类型"，不导入任何可执行代码。
// 编译成 JS 时这行会被【完全擦除】（TypeScript 的类型只在编译期存在，
// 类似 C++ 头文件里的声明：链接完就没了，运行时不留痕迹）。
import type { Metadata } from "next";

// 导入全局样式表。这是"副作用导入"：不接收返回值，
// 只是为了执行 globals.css 里的代码（定义主题色变量、所有 @keyframes 动画）。
// 全站只需要在这里导入一次，样式会自动作用于所有页面。
import "./globals.css";

// `@/` 是 tsconfig.json 里配置的路径别名，等价于 `src/`。
// 所以 "@/components/providers" 实际指向 src/components/providers.tsx。
// 好处：不用写 "../../../components/..." 这种又长又容易错相对路径。
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AlgoClickDecorator } from "@/components/algo-decoration/algo-click-decorator";
import { Starfield } from "@/components/starfield/starfield";


// ----------------------------------------------------------------------------
// metadata：Next.js 认识的"特殊导出"。
// 它不是给代码调用的，而是框架在构建/渲染时读取它，自动生成 HTML <head> 里的
// <title>、<meta name="description"> 等标签。
// 影响两件事：浏览器标签页上的文字；搜索引擎抓到的页面简介。
//
// 这里刻意写成对象，是因为要配 title 模板：
//   default  → 没单独设标题的页面用它："Study Tracker · 让学习看得见"
//   template → 子页面设了标题时套格式，%s 会被替换成子页面的 title
//
// 举例：src/app/algorithm/page.tsx 里写的是 title: "算法竞赛"，
//       最终浏览器标签页显示："算法竞赛 · Study Tracker"
// ----------------------------------------------------------------------------
export const metadata: Metadata = {
  title: {
    default: "Study Tracker · 让学习看得见",
    template: "%s · Study Tracker",
  },
  description:
    "Study Tracker —— 让学习看得见：算法竞赛刷题计划、Codeforces 数据统计、算法扭蛋机。",
};


// ----------------------------------------------------------------------------
// RootLayout：本文件唯一的默认导出组件，也是整个站点的渲染入口。
//
// 参数写法拆解：
//   export default function RootLayout({ children }: { children: React.ReactNode })
//
// 语义上等价于 C++ 的：
//   void RootLayout(Node children);
//
// 这是"对象解构"：框架传进来的其实是一个对象 { children: <当前页面的内容> }，
// 花括号的写法直接把里面的 children 取出来当局部变量用。
//
// React.ReactNode 可以理解成"任何能显示的东西"：
// 字符串、数字、HTML 元素、子组件、数组、null……类似一个万能类型。
// ----------------------------------------------------------------------------
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 组件 return 的是 JSX —— 一段"长得像 HTML 的表达式"。
  // JSX 不是字符串；它会被编译成函数调用，最终生成"虚拟 DOM"这棵树。
  // 之后 React 会把这棵树和上一次的树做 diff，只更新真正变化的部分。
  return (
    // <html>：整个文档的最外层标签。三个属性各有用途：
    //
    //   lang="zh-CN"
    //       声明页面语言是简体中文。影响屏幕阅读器的发音、浏览器的
    //       "是否要翻译此页"判断、以及搜索引擎的语言归类。
    //
    //   className="dark"
    //       给 <html> 加上 dark 这个类名，即【默认开启深色主题】。
    //       Tailwind 的 dark: 前缀样式，以及 globals.css 里 `.dark { ... }`
    //       定义的整套颜色变量，全靠这个类名才生效。
    //       （你的主题切换按钮做的事情，本质上就是增删这个类名。）
    //
    //   suppressHydrationWarning
    //       抑制一条 React 警告，不是玄学，原因很具体：
    //       服务端先把页面渲染成静态 HTML 发给浏览器；浏览器加载 JS 后要
    //       "接管"这份 HTML（叫水合 hydration），接管时会逐项比对两边是否一致。
    //       主题相关的类名可能在接管前就已经被改动，比对必然不一致 → 报警。
    //       这个属性表示"该元素允许存在差异，别报"。
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      {/*
        <body> 上挂的全是 Tailwind 工具类：一个类名 = 一条预设 CSS 规则。
        这是 Tailwind 的核心思路 —— 不写单独的 .css 文件，直接在标签上
        用类名"拼"样式，省掉起名字和跨文件找样式的麻烦。

          min-h-screen    → min-height: 100vh，页面至少占满一屏高
                            （vh = 视口高度，1vh = 屏幕高度的 1%）
          bg-background   → 背景色用主题变量 --background
                            （深色主题下就是接近黑的深空色）
          font-sans       → 使用无衬线字体栈
                            （本项目配成了系统字体，绕开国内下载 Google 字体失败的问题）
          text-foreground → 文字色用主题变量 --foreground
                            （深色主题下是浅色字，保证对比度）
          antialiased     → 字体抗锯齿，让文字边缘更细腻
      */}
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {/*
          Providers：把 5 个"数据管家"一次性套在最外层。

          这 5 个管家分别管：主题(theme)、设置(settings)、任务与扭蛋(study)、
          单词(english)、日程(schedule)。它们都是 React Context。

          Context 是什么：相当于"全局共享变量 + 订阅机制"。
          套在顶层之后，任何深度的子组件都能直接调用 useSettings() 之类的钩子
          读取和修改数据，【不需要一层层往上传参】。
          （C++ 里你可能会用全局单例达到类似目的，Context 额外提供了
            "数据变了，用到它的组件自动重画"这个能力。）

          放在 <body> 最外层，就是为了让下面所有内容都覆盖到。
        */}
        <Providers>
          {/*
            小坑提醒：JSX 内部不能直接写双斜杠注释，
            必须用花括号包起来的块注释，也就是现在你看到的这种形式。
            否则那行字会被当成普通文本，直接显示在页面上。

            Starfield：Canvas 星空背景（星星闪烁、银河带、流星）。
            它内部用 fixed 定位 + 负层级/低层级，相当于垫在所有内容最底下的画布。
            放在内容之前书写，也符合"先画背景、再画内容"的直觉。
          */}
          <Starfield />

          {/*
            这一层 div 是"正经内容"的容器，四个类各有职责：

              relative → 建立自己的层叠上下文，配合下面的 z-10 表示"盖在星空之上"
              z-10     → 层级高于星空背景，避免内容被星星盖住
              flex flex-col → 纵向弹性布局：导航栏 / 主内容 / 页脚 依次往下排
              min-h-screen  → 整层至少一屏高

            为什么用 flex-col 而不是普通块级排列：
            配合下面 <main> 上的 flex-1，可以让内容很少的页面（比如主页）
            把页脚"顶"到屏幕最底部，而不是尴尬地悬在页面中间。
          */}
          <div className="relative z-10 flex min-h-screen flex-col">
            {/* 顶部导航栏：4 个标签页 + 设置入口 + 亮暗主题切换按钮 */}
            <Navbar />

            {/*
              <main> 是语义标签，语义上代表"本页的主体内容"
              （与 <nav>、<header>、<footer> 同类，主要给屏幕阅读器和搜索引擎看）。
              它的类名逐个解释：

                mx-auto    → 左右 auto 外边距 = 水平居中
                w-full     → 宽度撑满父容器
                max-w-6xl  → 但最宽限制在 72rem（约 1152px），
                             否则在超大显示器上会被拉得过宽、难读
                flex-1     → 占满剩余高度，从而把页脚压到最底部
                px-4 py-6  → 内边距：左右 1rem、上下 1.5rem
                sm:px-6    → 响应式：屏幕宽度 ≥640px 时，左右内边距改为 1.5rem
                             （sm/md/lg 是 Tailwind 的断点前缀，写法即"某尺寸以上"）

              {children} 是整个外壳最关键的一行：
              这里就是"当前页面内容"被插入的位置。
              访问 /         → 插入 LandingPage
              访问 /english  → 插入英语页
              访问 /schedule → 插入日程页
              一个外壳服务所有页面，这就是布局复用的意义。
            */}
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
              {children}
            </main>

            {/* 页脚：说明文字 + 「声明」链接（跳到 /about） */}
            <Footer />
          </div>

          {/*
            AlgoClickDecorator：点击页面空白处，随机飘出算法知识卡片的全局装饰。

            为什么放在这个位置（而不是放进上面那个 z-10 容器里）：
            它内部通过 Portal 把卡片直接渲染到 document.body 上，
            并设置 pointer-events: none，因此它只"监听"点击、不"拦截"点击，
            永远不会挡住你点按钮、链接或输入框。
          */}
          <AlgoClickDecorator />
        </Providers>
      </body>
    </html>
  );
}

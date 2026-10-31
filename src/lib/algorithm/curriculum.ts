// ============================================================================
// curriculum.ts —— 算法学习路径（拓扑图）的数据源
// ============================================================================
// 这个文件是「算法竞赛」页的核心数据：54 个知识点、它们的前置依赖、
// 以及每个知识点对应的 Codeforces 标签（用于随机抽题）。
//
// 三条设计原则：
//   1. stage 表示「阶段」，数字越小越基础。拓扑图按阶段分行绘制。
//   2. prereq 表示「前置知识」，图上的连线就是靠它画出来的。
//   3. lanqiao 为 false 的节点在「蓝桥杯 A 组」模式下会收起（变灰）。
//
// 难度档位的 CF rating 区间见 RATING_RANGE，两种模式不同。
// ============================================================================

export type Mode = "lanqiao" | "icpc";

/** core = 必学，adv = 进阶，opt = 选学 */
export type Tier = "core" | "adv" | "opt";

/** 每档难度的名称 */
export type Level = "入门" | "基础" | "提高";

export const LEVELS: Level[] = ["入门", "基础", "提高"];

export interface LuoguProblem {
  /** 洛谷题号，例如 P1886 */
  id: string;
  /** 题目标题（人工核对用，点开链接可当场验证） */
  name: string;
}

export interface AlgorithmNode {
  id: string;
  name: string;
  /** 阶段，0 最基础 */
  stage: number;
  tier: Tier;
  /** 一句话说明这个知识点解决什么问题 */
  desc: string;
  /** 前置知识点 id（图上连线的依据） */
  prereq: string[];
  /** 对应的 Codeforces 标签；没有合适标签时留空，只靠精选题 */
  cfTags?: string[];
  /** 洛谷精选题；未整理的节点留空，界面会提示「题目整理中」 */
  luogu?: Partial<Record<Level, LuoguProblem[]>>;
  /** 是否纳入蓝桥杯 A 组考纲（默认纳入） */
  lanqiao?: boolean;
}

/** 阶段标题 */
export const STAGES: { index: number; title: string; hint: string }[] = [
  { index: 0, title: "语言地基", hint: "不通过这一关，后面全废" },
  { index: 1, title: "基础算法", hint: "几乎所有题都在用" },
  { index: 2, title: "线性数据结构", hint: "从数组长出来的分支" },
  { index: 3, title: "搜索", hint: "暴力也要有章法" },
  { index: 4, title: "动态规划", hint: "竞赛最大的分水岭" },
  { index: 5, title: "图论", hint: "最短路与生成树" },
  { index: 6, title: "数学", hint: "数论与组合" },
  { index: 7, title: "进阶结构", hint: "ICPC 才需要，蓝桥不考" },
];

/** 两种模式下每档难度对应的 CF rating 区间 */
export const RATING_RANGE: Record<Mode, Record<Level, [number, number]>> = {
  lanqiao: {
    入门: [900, 1200],
    基础: [1200, 1500],
    提高: [1500, 2000],
  },
  icpc: {
    入门: [1000, 1300],
    基础: [1300, 1700],
    提高: [1700, 2200],
  },
};

/** 洛谷题目直达链接 */
export function luoguUrl(id: string): string {
  return `https://www.luogu.com.cn/problem/${id}`;
}

/** Codeforces 题目直达链接 */
export function cfUrl(contestId: number, index: string): string {
  return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
}

/** CSDN 搜索链接（只生成搜索地址，不抓取内容） */
export function csdnSearchUrl(keyword: string): string {
  return `https://so.csdn.net/so/search?q=${encodeURIComponent(keyword)}`;
}

// ---------------------------------------------------------------------------
// 54 个知识点
//
// 注意：节点 id 里的 s0~s7 只是「历史编号」，不代表当前阶段。
// 阶段顺序以每个节点的 stage 字段为准
// （当前顺序：语言地基 → 基础算法 → 线性结构 → 搜索 → 动态规划 → 图论 → 数学 → 进阶）。
// ---------------------------------------------------------------------------
export const ALGORITHMS: AlgorithmNode[] = [
  // ===== 阶段 0：语言地基 =====
  {
    id: "s0-io",
    name: "语法与输入输出",
    stage: 0,
    tier: "core",
    desc: "cin/cout 与 scanf/printf 的区别、读入到 EOF、多组数据",
    prereq: [],
    cfTags: ["implementation"],
  },
  {
    id: "s0-type",
    name: "变量类型与溢出",
    stage: 0,
    tier: "core",
    desc: "int 只有 2e9，long long 才够；浮点误差不能直接比较",
    prereq: ["s0-io"],
  },
  {
    id: "s0-loop",
    name: "分支与循环",
    stage: 0,
    tier: "core",
    desc: "if/for/while 的基本功，边界条件最容易错",
    prereq: ["s0-type"],
  },
  {
    id: "s0-array",
    name: "数组与二维数组",
    stage: 0,
    tier: "core",
    desc: "所有线性结构的地基，后面 8 个方向都由它长出来",
    prereq: ["s0-loop"],
  },
  {
    id: "s0-string",
    name: "字符串处理",
    stage: 0,
    tier: "core",
    desc: "char 数组与 std::string、ASCII、回文与子串",
    prereq: ["s0-array"],
    cfTags: ["strings"],
  },
  {
    id: "s0-func",
    name: "函数与递归",
    stage: 0,
    tier: "core",
    desc: "递归是搜索和分治的前置，先弄懂调用栈",
    prereq: ["s0-loop"],
  },
  {
    id: "s0-struct",
    name: "结构体与 sort",
    stage: 0,
    tier: "core",
    desc: "自定义比较函数、多关键字排序",
    prereq: ["s0-array"],
    cfTags: ["sortings"],
  },
  {
    id: "s0-stl",
    name: "STL 容器",
    stage: 0,
    tier: "core",
    desc: "vector/string/pair/map/set 的常用操作与复杂度",
    prereq: ["s0-array"],
    cfTags: ["data structures"],
  },
  {
    id: "s0-complexity",
    name: "复杂度与评测",
    stage: 0,
    tier: "core",
    desc: "怎么估 1e8 次运算、TLE/MLE/RE 都是什么意思",
    prereq: ["s0-loop"],
  },

  // ===== 阶段 1：基础算法 =====
  {
    id: "s1-enum",
    name: "枚举与模拟",
    stage: 1,
    tier: "core",
    desc: "蓝桥杯最爱：照着题意写，考的是细致不细致",
    prereq: ["s0-loop"],
    cfTags: ["brute force", "implementation"],
  },
  {
    id: "s1-sort",
    name: "排序与去重",
    stage: 1,
    tier: "core",
    desc: "sort/unique 的套路，以及按第二关键字排序",
    prereq: ["s0-struct"],
    cfTags: ["sortings"],
  },
  {
    id: "s1-prefix",
    name: "前缀和与差分",
    stage: 1,
    tier: "core",
    desc: "把区间求和、区间加从 O(n) 降到 O(1)",
    prereq: ["s0-array"],
    luogu: {
      入门: [
        { id: "P1115", name: "最大子段和" },
        { id: "P2004", name: "领地选择" },
      ],
      基础: [{ id: "P1719", name: "最大加权矩形" }],
      提高: [
        { id: "P2367", name: "语文成绩（差分模板）" },
        { id: "P4552", name: "[Poetize6] IncDec Sequence" },
      ],
    },
  },
  {
    id: "s1-binary",
    name: "二分",
    stage: 1,
    tier: "core",
    desc: "二分查找（lower_bound）与二分答案（求最值转判定），蓝桥杯高频考点",
    prereq: ["s1-sort"],
    cfTags: ["binary search"],
    luogu: {
      入门: [
        { id: "P1102", name: "A-B 数对" },
        { id: "P1024", name: "一元三次方程求解" },
      ],
      基础: [
        { id: "P1873", name: "砍树" },
        { id: "P2440", name: "木材加工" },
      ],
      提高: [
        { id: "P2678", name: "跳石头" },
        { id: "P1182", name: "数列分段 Section II" },
      ],
    },
  },
  {
    id: "s1-twoptr",
    name: "双指针",
    stage: 1,
    tier: "core",
    desc: "同向/相向扫描，把两层循环压成一层",
    prereq: ["s0-array"],
    cfTags: ["two pointers"],
    luogu: {
      入门: [{ id: "P1102", name: "A-B 数对" }],
      基础: [
        { id: "P1638", name: "逛画展" },
        { id: "P1381", name: "单词背诵" },
      ],
    },
  },
  {
    id: "s1-window",
    name: "滑动窗口",
    stage: 1,
    tier: "core",
    desc: "定长/不定长窗口维护区间信息",
    prereq: ["s1-twoptr"],
    cfTags: ["two pointers"],
  },
  {
    id: "s1-greedy",
    name: "贪心入门",
    stage: 1,
    tier: "core",
    desc: "排序后取、优先取最优——但要会举反例验证",
    prereq: ["s1-sort"],
    cfTags: ["greedy"],
  },
  {
    id: "s1-recur",
    name: "递推",
    stage: 1,
    tier: "core",
    desc: "从已知推未知，是动态规划的前身",
    prereq: ["s0-func"],
  },

  // ===== 阶段 2：线性数据结构 =====
  {
    id: "s2-stack",
    name: "栈",
    stage: 2,
    tier: "core",
    desc: "后进先出：括号匹配、表达式求值、单调栈的基础",
    prereq: ["s0-array"],
    cfTags: ["data structures"],
  },
  {
    id: "s2-monostack",
    name: "单调栈",
    stage: 2,
    tier: "adv",
    desc: "求「下一个更大/更小元素」，O(n) 解决区间最值",
    prereq: ["s2-stack"],
    cfTags: ["data structures"],
  },
  {
    id: "s2-queue",
    name: "队列",
    stage: 2,
    tier: "core",
    desc: "先进先出：BFS 的骨架，手写循环队列避免 resize",
    prereq: ["s0-array"],
  },
  {
    id: "s2-monoqueue",
    name: "单调队列",
    stage: 2,
    tier: "adv",
    desc: "滑动窗口最值，也是 DP 优化的常用手段",
    prereq: ["s2-queue", "s1-window"],
    cfTags: ["data structures"],
    luogu: {
      入门: [
        { id: "P1440", name: "求 m 区间内的最小值" },
        { id: "P1886", name: "【模板】单调队列 / 滑动窗口" },
      ],
      基础: [{ id: "P2032", name: "扫描" }],
      提高: [{ id: "P1714", name: "切蛋糕" }],
    },
  },
  {
    id: "s2-list",
    name: "链表",
    stage: 2,
    tier: "core",
    desc: "指针/数组模拟，插入删除 O(1)",
    prereq: ["s0-array"],
  },
  {
    id: "s2-hash",
    name: "哈希表",
    stage: 2,
    tier: "core",
    desc: "判重、计数、去重，map/set 背后的原理",
    prereq: ["s0-stl"],
    cfTags: ["hashing"],
  },
  {
    id: "s2-heap",
    name: "堆与优先队列",
    stage: 2,
    tier: "core",
    desc: "动态取最值，Dijkstra 和贪心的必备",
    prereq: ["s0-stl"],
    cfTags: ["data structures"],
  },
  {
    id: "s2-dsu",
    name: "并查集",
    stage: 2,
    tier: "core",
    desc: "维护连通性，路径压缩 + 按秩合并",
    prereq: ["s0-array"],
    cfTags: ["dsu"],
    luogu: {
      入门: [
        { id: "P3367", name: "【模板】并查集" },
        { id: "P1551", name: "亲戚" },
      ],
      基础: [
        { id: "P1892", name: "团伙" },
        { id: "P2024", name: "食物链" },
      ],
      提高: [{ id: "P1197", name: "星球大战" }],
    },
  },

  // ===== 阶段 3：搜索 =====
  {
    id: "s3-dfs",
    name: "DFS 深度优先搜索",
    stage: 3,
    tier: "core",
    desc: "一条路走到黑，配合回溯与剪枝",
    prereq: ["s0-func"],
    cfTags: ["dfs and similar"],
    luogu: {
      入门: [
        { id: "P1706", name: "全排列问题" },
        { id: "P1219", name: "八皇后 Checker Challenge" },
      ],
      基础: [
        { id: "P1605", name: "迷宫" },
        { id: "P1036", name: "选数" },
      ],
      提高: [{ id: "P1596", name: "[USACO10OCT] Lake Counting" }],
    },
  },
  {
    id: "s3-bfs",
    name: "BFS 广度优先搜索",
    stage: 3,
    tier: "core",
    desc: "一层层扩散，求无权图最短路",
    prereq: ["s2-queue"],
    cfTags: ["dfs and similar"],
  },
  {
    id: "s3-prune",
    name: "剪枝",
    stage: 3,
    tier: "adv",
    desc: "可行性剪枝、最优性剪枝，把暴力救回来",
    prereq: ["s3-dfs"],
  },
  {
    id: "s3-memo",
    name: "记忆化搜索",
    stage: 3,
    tier: "core",
    desc: "把重复子问题存起来，是从搜索走向 DP 的桥",
    prereq: ["s3-dfs"],
    cfTags: ["dp"],
  },

  // ===== 阶段 4：图论 =====
  {
    id: "s4-graph",
    name: "图的存储",
    stage: 5,
    tier: "core",
    desc: "邻接表/邻接矩阵，有向与无向、带权",
    prereq: ["s0-array"],
    cfTags: ["graphs"],
  },
  {
    id: "s4-topo",
    name: "拓扑排序",
    stage: 5,
    tier: "core",
    desc: "有向无环图的线性化，常用于依赖关系题",
    prereq: ["s4-graph"],
    cfTags: ["graphs"],
  },
  {
    id: "s4-dijkstra",
    name: "最短路",
    stage: 5,
    tier: "core",
    desc: "Dijkstra（堆优化）/ Bellman-Ford·SPFA（负边权、负环）/ Floyd（任意两点），一节点全覆盖",
    prereq: ["s4-graph", "s2-heap"],
    cfTags: ["shortest paths"],
    luogu: {
      入门: [{ id: "P3371", name: "【模板】单源最短路径（弱化版）" }],
      基础: [
        { id: "P4779", name: "【模板】单源最短路径（标准版）" },
        { id: "P1629", name: "邮递员送信" },
      ],
      提高: [
        { id: "P1144", name: "最短路计数" },
        { id: "P1119", name: "灾后重建" },
      ],
    },
  },
  {
    id: "s4-mst",
    name: "最小生成树",
    stage: 5,
    tier: "core",
    desc: "Kruskal（并查集）与 Prim，求连通最小代价",
    prereq: ["s2-dsu", "s4-graph"],
    cfTags: ["graphs"],
  },
  {
    id: "s4-scc",
    name: "连通分量与缩点",
    stage: 5,
    tier: "opt",
    desc: "Tarjan 求强连通分量，缩点后转 DAG",
    prereq: ["s4-graph"],
    cfTags: ["graphs"],
    lanqiao: false,
  },
  {
    id: "s4-lca",
    name: "树上基础与 LCA",
    stage: 5,
    tier: "adv",
    desc: "倍增求最近公共祖先、树上距离",
    prereq: ["s4-graph"],
    cfTags: ["trees"],
  },

  // ===== 阶段 5：动态规划 =====
  {
    id: "s5-linear",
    name: "线性 DP",
    stage: 4,
    tier: "core",
    desc: "状态定义 + 转移方程，最基础也最常考",
    prereq: ["s1-recur", "s3-memo"],
    cfTags: ["dp"],
  },
  {
    id: "s5-knapsack",
    name: "背包问题",
    stage: 4,
    tier: "core",
    desc: "01 / 完全 / 多重背包，蓝桥杯几乎年年考",
    prereq: ["s5-linear"],
    cfTags: ["dp"],
    luogu: {
      入门: [
        { id: "P1048", name: "采药" },
        { id: "P1049", name: "装箱问题" },
      ],
      基础: [
        { id: "P1060", name: "开心的金明" },
        { id: "P1164", name: "小 A 点菜" },
      ],
      提高: [
        { id: "P1616", name: "疯狂的采药（完全背包）" },
        { id: "P1833", name: "樱花（多重背包）" },
      ],
    },
  },
  {
    id: "s5-interval",
    name: "区间 DP",
    stage: 4,
    tier: "adv",
    desc: "按区间长度递推，石子合并、括号匹配类问题",
    prereq: ["s5-linear"],
    cfTags: ["dp"],
  },
  {
    id: "s5-tree",
    name: "树形 DP",
    stage: 4,
    tier: "adv",
    desc: "在树上做 DP、子树合并（需要先会树的遍历，见图论阶段）",
    prereq: ["s5-linear"],
    cfTags: ["dp", "trees"],
  },
  {
    id: "s5-bitmask",
    name: "状压 DP",
    stage: 4,
    tier: "opt",
    desc: "把集合压成二进制整数，n≤20 时使用",
    prereq: ["s5-linear"],
    cfTags: ["bitmasks", "dp"],
    lanqiao: false,
  },
  {
    id: "s5-digit",
    name: "数位 DP",
    stage: 4,
    tier: "opt",
    desc: "统计区间内满足数位条件的数",
    prereq: ["s5-linear"],
    cfTags: ["dp"],
    lanqiao: false,
  },
  {
    id: "s5-opt",
    name: "DP 优化",
    stage: 4,
    tier: "adv",
    desc: "单调队列/前缀和优化，把 O(n²) 降到 O(n)",
    prereq: ["s5-knapsack", "s2-monoqueue"],
  },

  // ===== 阶段 6：数学 =====
  {
    id: "s6-mod",
    name: "整除与同余",
    stage: 6,
    tier: "core",
    desc: "取模运算、gcd/lcm、exgcd 入门",
    prereq: ["s0-type"],
    cfTags: ["number theory"],
  },
  {
    id: "s6-pow",
    name: "快速幂",
    stage: 6,
    tier: "core",
    desc: "O(log n) 求 a^b，矩阵快速幂的前置",
    prereq: ["s6-mod"],
  },
  {
    id: "s6-sieve",
    name: "素数筛",
    stage: 6,
    tier: "core",
    desc: "埃氏筛与线性筛，预处理 1e7 以内的素数",
    prereq: ["s6-mod"],
    cfTags: ["number theory"],
  },
  {
    id: "s6-inv",
    name: "逆元与组合数",
    stage: 6,
    tier: "core",
    desc: "组合数取模、费马小定理求逆元",
    prereq: ["s6-pow"],
    cfTags: ["combinatorics", "number theory"],
  },
  {
    id: "s6-matrix",
    name: "矩阵快速幂",
    stage: 6,
    tier: "opt",
    desc: "加速线性递推，比如求第 1e18 项斐波那契",
    prereq: ["s6-pow"],
    cfTags: ["matrices"],
    lanqiao: false,
  },
  {
    id: "s6-game",
    name: "博弈论入门",
    stage: 6,
    tier: "opt",
    desc: "Nim 游戏与 SG 函数",
    prereq: ["s6-mod"],
    cfTags: ["games"],
    lanqiao: false,
  },

  // ===== 阶段 7：进阶结构（蓝桥杯不考）=====
  {
    id: "s7-bit",
    name: "树状数组",
    stage: 7,
    tier: "opt",
    desc: "单点修改 + 前缀查询，代码短、常数小",
    prereq: ["s1-prefix"],
    cfTags: ["data structures"],
    lanqiao: false,
  },
  {
    id: "s7-seg",
    name: "线段树",
    stage: 7,
    tier: "opt",
    desc: "区间修改 + 区间查询，懒标记",
    prereq: ["s1-prefix"],
    cfTags: ["data structures"],
    lanqiao: false,
  },
  {
    id: "s7-hashstr",
    name: "字符串哈希",
    stage: 7,
    tier: "opt",
    desc: "O(1) 判断两个子串是否相等",
    prereq: ["s0-string"],
    cfTags: ["hashing", "strings"],
    lanqiao: false,
  },
  {
    id: "s7-kmp",
    name: "KMP",
    stage: 7,
    tier: "opt",
    desc: "线性求模式串匹配，next 数组是核心",
    prereq: ["s0-string"],
    cfTags: ["string suffix structures", "strings"],
    lanqiao: false,
  },
  {
    id: "s7-trie",
    name: "Trie 字典树",
    stage: 7,
    tier: "opt",
    desc: "字符串前缀查询、异或最大值",
    prereq: ["s0-string"],
    cfTags: ["strings", "trees"],
    lanqiao: false,
  },
  {
    id: "s7-flow",
    name: "网络流入门",
    stage: 7,
    tier: "opt",
    desc: "最大流、最小割，Dinic 实现",
    prereq: ["s4-graph"],
    cfTags: ["flows"],
    lanqiao: false,
  },
];

/** 某模式下要显示的节点（lanqiao 模式会收起草纲外的节点） */
export function nodesForMode(mode: Mode): AlgorithmNode[] {
  if (mode === "icpc") return ALGORITHMS;
  return ALGORITHMS.filter((n) => n.lanqiao !== false);
}

/** 按 id 快速查找 */
export const ALGORITHM_MAP: Record<string, AlgorithmNode> = Object.fromEntries(
  ALGORITHMS.map((n) => [n.id, n]),
);

/** 某个节点的前置节点（只保留当前模式下可见的） */
export function visiblePrereq(node: AlgorithmNode, mode: Mode): string[] {
  const visible = new Set(nodesForMode(mode).map((n) => n.id));
  return node.prereq.filter((p) => visible.has(p));
}

/**
 * 解析用户手填的洛谷题号。
 *
 * 支持这些写法（可以混着用，换行 / 空格 / 逗号分隔都行）：
 *   P1115
 *   P1115 最大子段和
 *   P1115,P2004,P1719
 *   https://www.luogu.com.cn/problem/P1886
 *   P1886 滑动窗口  P1440 求 m 区间最小值
 *
 * 规则：
 *   - 「题号」= 1~4 个字母 + 1~7 位数字（P / B / T / U / CF / AT / SP 都能认）
 *   - 题号后面紧跟的文字（直到下一个题号为止）会被当作题目名
 */
export function parseLuoguPool(text: string): LuoguProblem[] {
  // 洛谷题号形态很杂：P1115 / B2001 / T123456 / U99999 / SP1234 /
  // CF1234A / AT_abc123_a …… 统一规则：字母开头、只含字母数字下划线、且必须带数字。
  const ID_RE = /^(?=.*\d)[A-Za-z][A-Za-z0-9_]{0,15}$/;
  const URL_RE = /luogu\.com\.cn\/problem\/([A-Za-z][A-Za-z0-9_]{0,15})/i;

  const tokens = text
    .split(/[\s,，;；、]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const result: LuoguProblem[] = [];
  const seen = new Set<string>();
  let pending: LuoguProblem | null = null;

  const flush = () => {
    if (pending && !seen.has(pending.id)) {
      seen.add(pending.id);
      result.push(pending);
    }
    pending = null;
  };

  for (const token of tokens) {
    let id: string | null = null;
    if (ID_RE.test(token)) {
      id = token;
    } else {
      const m = token.match(URL_RE);
      if (m) id = m[1];
    }

    if (id) {
      flush();
      // 题号大小写要小心：P1115 / CF1234A 是大写，但 AT_abc123_a 是全小写，
      // 大写化会造成死链。含下划线的（AT_xxx）保持原样，其余转大写。
      pending = { id: id.includes("_") ? id : id.toUpperCase(), name: "" };
    } else if (pending) {
      pending.name = pending.name ? `${pending.name} ${token}` : token;
    }
  }
  flush();

  return result;
}

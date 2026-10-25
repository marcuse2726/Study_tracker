/**
 * 点击随机算法装饰的算法数据。
 * 共 38 个常用算法：名称 / 英文 / 分类 / 一句话描述 / 伪代码片段。
 */

export interface Algorithm {
  name: string;
  en: string;
  category: string;
  description: string;
  pseudo: string;
}

/** 分类 -> 主题色（用于气泡装饰） */
export const CATEGORY_COLORS: Record<string, string> = {
  排序: "#F59E0B",
  搜索: "#6366F1",
  图论: "#0EA5E9",
  动态规划: "#8B5CF6",
  数据结构: "#10B981",
  字符串: "#EC4899",
  数学: "#EF4444",
  技巧: "#14B8A6",
  树: "#84CC16",
  计算几何: "#F97316",
};

export const ALGORITHMS: Algorithm[] = [
  {
    name: "快速排序",
    en: "Quick Sort",
    category: "排序",
    description: "分治 + 基准划分，平均 O(n log n)。",
    pseudo: "partition(arr, l, r)\n  pivot = arr[r]",
  },
  {
    name: "归并排序",
    en: "Merge Sort",
    category: "排序",
    description: "稳定分治排序，先拆后合。",
    pseudo: "mergeSort(l, r)\n  mid = (l+r)/2",
  },
  {
    name: "堆排序",
    en: "Heap Sort",
    category: "排序",
    description: "利用堆结构选择极值。",
    pseudo: "buildHeap(arr)\n  extract-max 循环",
  },
  {
    name: "二分查找",
    en: "Binary Search",
    category: "搜索",
    description: "有序区间上折半逼近。",
    pseudo: "while l <= r\n  mid = (l+r)>>1",
  },
  {
    name: "深度优先搜索",
    en: "DFS",
    category: "搜索",
    description: "沿一条路走到底再回溯。",
    pseudo: "dfs(u):\n  for v in adj[u]",
  },
  {
    name: "广度优先搜索",
    en: "BFS",
    category: "搜索",
    description: "逐层扩散，求最短步数。",
    pseudo: "queue.push(start)\n  while queue",
  },
  {
    name: "A* 搜索",
    en: "A* Search",
    category: "搜索",
    description: "启发式搜索，f = g + h。",
    pseudo: "f(n) = g(n) + h(n)\n  open set 择优",
  },
  {
    name: "Dijkstra",
    en: "Dijkstra",
    category: "图论",
    description: "非负权单源最短路。",
    pseudo: "dist[s]=0, 堆优化\n  relax(u, v)",
  },
  {
    name: "Floyd",
    en: "Floyd-Warshall",
    category: "图论",
    description: "多源最短路，O(n³)。",
    pseudo: "for k for i for j\n  d[i][j]=min(...)",
  },
  {
    name: "Prim",
    en: "Prim",
    category: "图论",
    description: "加点法求最小生成树。",
    pseudo: "每次选最小边\n  加入集合",
  },
  {
    name: "Kruskal",
    en: "Kruskal",
    category: "图论",
    description: "按边权贪心 + 并查集判环。",
    pseudo: "sort(edges)\n  union if 不连通",
  },
  {
    name: "拓扑排序",
    en: "Topological Sort",
    category: "图论",
    description: "DAG 的线性排序。",
    pseudo: "入度为 0 入队\n  依次删除边",
  },
  {
    name: "动态规划",
    en: "Dynamic Programming",
    category: "动态规划",
    description: "状态定义 + 转移方程。",
    pseudo: "dp[i] = f(dp[i-1])\n  记忆化",
  },
  {
    name: "背包问题",
    en: "Knapsack",
    category: "动态规划",
    description: "01 背包、完全背包等。",
    pseudo: "dp[j] = max(dp[j],\n  dp[j-w]+v)",
  },
  {
    name: "最长公共子序列",
    en: "LCS",
    category: "动态规划",
    description: "双串 DP 经典模型。",
    pseudo: "dp[i][j] =\n  max(dp[i-1][j],...)",
  },
  {
    name: "单调栈",
    en: "Monotonic Stack",
    category: "数据结构",
    description: "求下一个更大/更小元素。",
    pseudo: "while top < a[i]\n  pop 并记录",
  },
  {
    name: "单调队列",
    en: "Monotonic Queue",
    category: "数据结构",
    description: "滑动窗口极值维护。",
    pseudo: "deque 维护单调\n  队首即窗口最值",
  },
  {
    name: "并查集",
    en: "Union-Find",
    category: "数据结构",
    description: "合并查询 + 路径压缩。",
    pseudo: "find(x) 路径压缩\n  union(x, y)",
  },
  {
    name: "线段树",
    en: "Segment Tree",
    category: "数据结构",
    description: "区间查询与区间修改。",
    pseudo: "build(1,1,n)\n  query(l, r)",
  },
  {
    name: "树状数组",
    en: "Fenwick Tree",
    category: "数据结构",
    description: "单点改 + 前缀和，lowbit。",
    pseudo: "add(i, v) i+=lowbit\n  sum(i) i-=lowbit",
  },
  {
    name: "字典树",
    en: "Trie",
    category: "数据结构",
    description: "前缀匹配 / 字符串检索。",
    pseudo: "insert(s) 逐字符\n  ch = s[i]-'a'",
  },
  {
    name: "哈希表",
    en: "Hash Table",
    category: "数据结构",
    description: "O(1) 平均查找。",
    pseudo: "hash(key) -> index\n  冲突处理",
  },
  {
    name: "优先队列",
    en: "Heap",
    category: "数据结构",
    description: "动态取极值。",
    pseudo: "push(x), pop()\n  维护堆性质",
  },
  {
    name: "KMP 匹配",
    en: "KMP",
    category: "字符串",
    description: "前缀函数避免回退。",
    pseudo: "next[i] = 最长公共前后缀\n  j = next[j]",
  },
  {
    name: "字符串哈希",
    en: "Rolling Hash",
    category: "字符串",
    description: "把字符串映射为整数。",
    pseudo: "h = h*base + c\n  比较子串哈希",
  },
  {
    name: "贪心算法",
    en: "Greedy",
    category: "技巧",
    description: "局部最优推导全局最优。",
    pseudo: "sort + 选择策略\n  证明最优子结构",
  },
  {
    name: "双指针",
    en: "Two Pointers",
    category: "技巧",
    description: "同向/相向指针缩区间。",
    pseudo: "while l < r\n  依据条件移动",
  },
  {
    name: "滑动窗口",
    en: "Sliding Window",
    category: "技巧",
    description: "维护可变长度子区间。",
    pseudo: "扩大右端 r++\n  收缩左端 l++",
  },
  {
    name: "分治",
    en: "Divide & Conquer",
    category: "技巧",
    description: "分解子问题再合并。",
    pseudo: "solve(l, r)\n  merge(左, 右)",
  },
  {
    name: "回溯",
    en: "Backtracking",
    category: "技巧",
    description: "试探 + 剪枝 + 撤销。",
    pseudo: "选择 -> 递归 -> 撤销\n  剪枝优化",
  },
  {
    name: "差分数组",
    en: "Difference Array",
    category: "技巧",
    description: "区间增减 O(1)。",
    pseudo: "d[l]+=x, d[r+1]-=x\n  前缀和还原",
  },
  {
    name: "前缀和",
    en: "Prefix Sum",
    category: "技巧",
    description: "区间和 O(1) 查询。",
    pseudo: "pre[i]=pre[i-1]+a[i]\n  sum(l,r)=pre[r]-pre[l-1]",
  },
  {
    name: "快速幂",
    en: "Fast Power",
    category: "数学",
    description: "二分指数，O(log n)。",
    pseudo: "while b:\n  if b&1: res*=a",
  },
  {
    name: "埃氏筛",
    en: "Sieve",
    category: "数学",
    description: "筛出 [1, n] 的质数。",
    pseudo: "for i=2..√n\n  标记合数",
  },
  {
    name: "位运算",
    en: "Bit Manipulation",
    category: "技巧",
    description: "lowbit / 异或 / 掩码。",
    pseudo: "x & -x 取最低位\n  x ^= x 技巧",
  },
  {
    name: "最近公共祖先",
    en: "LCA",
    category: "树",
    description: "树上两节点最近祖先。",
    pseudo: "倍增 up[i][k]\n  跳到同深度",
  },
  {
    name: "凸包",
    en: "Convex Hull",
    category: "计算几何",
    description: "最小凸多边形包住点集。",
    pseudo: "按极角排序\n  单调栈维护",
  },
  {
    name: "莫队算法",
    en: "Mo's Algorithm",
    category: "技巧",
    description: "离线分块处理区间询问。",
    pseudo: "按块排序询问\n  指针移动 O(√n)",
  },
];

/** 随机挑选一个算法，避免与最近展示过的重复 */
export function pickAlgorithm(recentNames: string[]): Algorithm {
  const recentSet = new Set(recentNames);
  const candidates = ALGORITHMS.filter((a) => !recentSet.has(a.name));
  const pool = candidates.length > 0 ? candidates : ALGORITHMS;
  return pool[Math.floor(Math.random() * pool.length)];
}

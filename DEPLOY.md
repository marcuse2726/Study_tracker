# 部署到 Vercel

本项目的标准 Next.js（App Router）应用，Vercel 可零配置识别，无需 `vercel.json`。

## 前置条件

- Node.js ≥ 20.9（本地已满足）
- 一个 [Vercel](https://vercel.com) 账号（可用 GitHub 账号登录）
- 方式一需要 Git；方式二使用 Vercel CLI，可不装 Git

## 方式一：Git + Vercel Dashboard（推荐）

1. **安装 Git**（本机尚未安装）：https://git-scm.com/download/win
2. 在项目目录初始化并提交：

   ```bash
   cd coding-stats
   git init
   git add .
   git commit -m "init: CodeStat"
   ```

3. 推送到 GitHub / GitLab（先在网页上建一个空仓库）：

   ```bash
   git remote add origin https://github.com/<你的用户名>/coding-stats.git
   git branch -M main
   git push -u origin main
   ```

4. 打开 Vercel → **Add New Project** → 导入该仓库。
5. 构建配置保持默认（Vercel 会自动识别 Next.js）：
   - Build Command：`next build`
   - Output Directory：`.next`
   - Install Command：`npm install`
6. 点击 **Deploy**，完成后访问分配的 `*.vercel.app` 域名即可。

## 方式二：Vercel CLI（无需 Git）

```bash
npm i -g vercel
cd coding-stats
vercel            # 首次会要求登录并关联项目（一路回车即可）
vercel --prod     # 部署到生产环境
```

> 方式二会直接把本地文件上传到 Vercel，不依赖 Git 仓库。

## 环境变量

**当前无需任何环境变量即可运行**（Codeforces / AtCoder 走公开接口，用户名在浏览器 localStorage）。

未来接入共享缓存 / 数据库时的可选变量：

| 变量 | 用途 | 何时需要 |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST 地址 | 生产环境换共享缓存时 |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis Token | 同上 |
| `DATABASE_URL` | Prisma/Supabase 连接串 | 接入数据库时 |

## 缓存说明（重要）

当前缓存实现为**进程内存缓存**（`src/providers/cache.ts`）：

- 本地开发、单实例部署：完全够用，已带 TTL（5~30 分钟）+ 并发去重，不会高频请求上游；
- **Vercel Serverless 是无状态多实例**：每个实例各自缓存、冷启动清空，因此缓存命中率会降低（功能不受影响，只是部分请求会打到上游）。

生产环境若想提升缓存命中，可把 `cache.ts` 换成 Upstash Redis（REST，纯 `fetch`，无需额外依赖）：

```ts
// 伪代码：用 Upstash REST 替换 cacheGet/cacheSet
const REST = process.env.UPSTASH_REDIS_REST_URL!;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

export async function cacheGet<T>(key: string): Promise<T | undefined> {
  const res = await fetch(`${REST}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json();
  return data.result ? (JSON.parse(data.result) as T) : undefined;
}

export async function cacheSet(key: string, value: unknown, ttlMs: number): Promise<void> {
  await fetch(`${REST}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ value: JSON.stringify(value), ex: Math.floor(ttlMs / 1000) }),
  });
}
```

## 已知问题与提示

1. **LeetCode.cn / 洛谷反爬**：从本机网络看，leetcode.cn 有阿里云反爬、洛谷有 JS 反爬，因此通常会回退示例数据；**Vercel 服务器（海外）访问这些站点的行为可能不同**，可能出现真实数据，也可能仍被拦截——两种情况都已处理为「失败自动回退」，不会报错。
2. **函数超时**：Vercel Hobby 计划函数默认超时约 10s。`/api/stats` 会并行请求多个上游（首次冷启动 + AtCoder 题面库约 1MB），一般 10s 内能完成；若遇到超时，可升级 Pro 计划，或在 API 路由加 `export const maxDuration = 30`。
3. **`.npmrc` 镜像**：项目内置 `.npmrc` 指向 npmmirror（国内加速）。Vercel 构建时也会用它（可用，但海外略慢）；若想构建更快，可在 Vercel 项目设置里加环境变量 `NPM_CONFIG_REGISTRY=https://registry.npmjs.org/`，或直接删除本地 `.npmrc`。
4. **`启动网站.bat`**：仅本地双击启动用的便利脚本，对 Vercel 无影响，可保留或从仓库中删除。

## 本地 vs 线上

| | 本地 | 线上（Vercel） |
|---|---|---|
| 启动 | 双击 `启动网站.bat` 或 `npm run dev` | 访问 `*.vercel.app` |
| 数据源 | 本机网络（CF/AtCoder 可达，LC/洛谷被反爬） | Vercel 海外服务器（表现可能不同） |
| 缓存 | 进程内存缓存，稳定 | 多实例内存缓存，命中率较低 |

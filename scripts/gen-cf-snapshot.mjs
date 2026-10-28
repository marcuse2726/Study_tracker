// ============================================================================
// scripts/gen-cf-snapshot.mjs —— 生成 Codeforces 题目快照
// ============================================================================
// 为什么需要这个脚本：
//   算法竞赛页要「随机出题」。CF 官方 API 一次返回 2 MB+、耗时近 10 秒，
//   不可能每次点击都去请求。所以离线生成一份精简快照，前端本地随机抽取，
//   零延迟、断网也能用。
//
// 用法（在项目根目录）：
//   node scripts/gen-cf-snapshot.mjs
// 输出：
//   public/data/cf-problems.json
//
// 数据来源：https://codeforces.com/api/problemset.problems （官方公开接口）
// ============================================================================

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/data/cf-problems.json");

/** 这些标签的题不适合给新手随机推荐 */
const EXCLUDE_TAGS = new Set([
  "*special", // 特殊评测（交互式/输出型），不适合刷
  "interactive", // 交互题，新手不碰
  "fft", // 超纲
  "meet-in-the-middle", // 超纲
  "probabilities", // 偏难且不常考
  "communication", // 交互/通信题
]);

/** 只保留这个难度区间（蓝桥到 ICPC 区域赛的覆盖范围） */
const MIN_RATING = 800;
const MAX_RATING = 2400;

const res = await fetch("https://codeforces.com/api/problemset.problems");
if (!res.ok) {
  console.error(`请求失败: HTTP ${res.status}`);
  process.exit(1);
}
const json = await res.json();
if (json.status !== "OK") {
  console.error(`接口返回异常: ${json.status}`);
  process.exit(1);
}

const all = json.result.problems;
const tagSet = new Set();
const rows = [];

for (const p of all) {
  if (p.type !== "PROGRAMMING") continue;
  if (typeof p.rating !== "number") continue;
  if (p.rating < MIN_RATING || p.rating > MAX_RATING) continue;
  if (!Array.isArray(p.tags) || p.tags.length === 0) continue;
  if (p.tags.some((t) => EXCLUDE_TAGS.has(t))) continue;

  for (const t of p.tags) tagSet.add(t);
  rows.push([
    p.contestId,
    p.index,
    p.rating,
    p.name,
    p.tags,
  ]);
}

const tags = [...tagSet].sort();
const tagIndex = new Map(tags.map((t, i) => [t, i]));

// 紧凑格式：[contestId, index, rating, name, tagId...]
const problems = rows.map(([cid, idx, rating, name, tgs]) => [
  cid,
  idx,
  rating,
  name,
  ...tgs.map((t) => tagIndex.get(t)),
]);

const payload = {
  generatedAt: new Date().toISOString(),
  source: "https://codeforces.com/api/problemset.problems",
  range: [MIN_RATING, MAX_RATING],
  tags,
  problems,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(payload), "utf8");

const size = Buffer.byteLength(JSON.stringify(payload));
console.log(`题目数: ${problems.length}`);
console.log(`标签数: ${tags.length}`);
console.log(`输出: ${OUT}`);
console.log(`大小: ${(size / 1024).toFixed(1)} KB`);

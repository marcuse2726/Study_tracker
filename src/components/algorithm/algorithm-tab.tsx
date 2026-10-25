import { GachaMachine } from "./gacha";
import { DailyPlan } from "./daily-plan";
import { CodeforcesSection } from "./codeforces-section";

/** 算法竞赛功能：扭蛋机 + 每日计划 + Codeforces 数据 */
export function AlgorithmTab() {
  return (
    <div className="space-y-6">
      <GachaMachine />
      <DailyPlan />
      <CodeforcesSection />
    </div>
  );
}

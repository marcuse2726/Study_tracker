import type { Metadata } from "next";
import { AlgorithmTab } from "@/components/algorithm/algorithm-tab";

export const metadata: Metadata = { title: "算法竞赛" };

export default function AlgorithmPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">算法竞赛</h1>
      <AlgorithmTab />
    </div>
  );
}

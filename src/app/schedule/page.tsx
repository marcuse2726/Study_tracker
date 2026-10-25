import type { Metadata } from "next";
import { ScheduleCalendar } from "@/components/schedule/schedule-calendar";

export const metadata: Metadata = { title: "日程规划" };

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">日程规划</h1>
      <ScheduleCalendar />
    </div>
  );
}

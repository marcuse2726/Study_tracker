import type { Metadata } from "next";
import { EnglishModule } from "@/components/english/english-module";

export const metadata: Metadata = { title: "英语" };

export default function EnglishPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">英语</h1>
      <EnglishModule />
    </div>
  );
}

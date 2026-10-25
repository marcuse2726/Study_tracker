"use client";

import useSWR from "swr";
import type { PlatformDetail } from "@/lib/types";
import { useSettings } from "@/lib/store/settings";

/** 通用 JSON fetcher，非 2xx 统一抛错（供 SWR 进入 error 态） */
async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`请求失败（${res.status}）`);
  }
  return res.json() as Promise<T>;
}

const SWR_OPTIONS = {
  revalidateOnFocus: false,
  dedupingInterval: 30_000,
  keepPreviousData: true,
} as const;

/** Codeforces 数据（空用户名 / 失败时后端回退示例数据） */
export function useCodeforces() {
  const { codeforcesUsername } = useSettings();
  const key = `/api/codeforces?username=${encodeURIComponent(codeforcesUsername)}`;
  return useSWR<PlatformDetail>(key, fetcher, SWR_OPTIONS);
}

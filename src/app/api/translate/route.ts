import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface TranslateResult {
  meanings: string[];
  phonetic?: string;
}

/**
 * 单词翻译接口：有道词典 JSON 接口优先（多义项），MyMemory 兜底。
 * 后端代理，避免浏览器跨域；带进程内缓存。
 */
const cache = new Map<string, { value: TranslateResult; expiresAt: number }>();
const TTL = 24 * 60 * 60 * 1000;

/* eslint-disable @typescript-eslint/no-explicit-any */

function extractYoudao(j: any): TranslateResult | null {
  const meanings: string[] = [];
  const addLine = (line: string) => {
    for (const part of line.split(/[；;]/)) {
      const p = part.trim();
      if (p && !meanings.includes(p)) meanings.push(p);
    }
  };

  const word = j?.ec?.word?.[0];
  if (Array.isArray(word?.trs)) {
    for (const t of word.trs) {
      for (const tr of t?.tr ?? []) {
        const lines = tr?.l?.i;
        if (Array.isArray(lines)) {
          for (const line of lines) if (typeof line === "string") addLine(line);
        }
      }
    }
  }
  if (meanings.length === 0 && Array.isArray(j?.basic?.explains)) {
    for (const line of j.basic.explains) if (typeof line === "string") addLine(line);
  }
  if (meanings.length === 0 && Array.isArray(j?.basic?.trans)) {
    for (const line of j.basic.trans) if (typeof line === "string") addLine(line);
  }
  if (meanings.length === 0) {
    const web = j?.web_trans?.["web-translation"];
    if (Array.isArray(web)) {
      for (const w of web.slice(0, 3)) {
        for (const tr of w?.trans ?? []) {
          const v = tr?.value;
          if (typeof v === "string" && v.trim() && !meanings.includes(v.trim())) {
            meanings.push(v.trim());
          }
        }
      }
    }
  }

  if (meanings.length === 0) return null;
  const phonetic =
    typeof word?.usphone === "string" && word.usphone.trim()
      ? word.usphone.trim()
      : undefined;
  return { meanings: meanings.slice(0, 6), phonetic };
}

async function translateYoudao(word: string): Promise<TranslateResult | null> {
  try {
    const res = await fetch(
      `https://dict.youdao.com/jsonapi?q=${encodeURIComponent(word)}`,
      {
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0 StudyTracker/1.0" },
      },
    );
    if (!res.ok) return null;
    return extractYoudao(await res.json());
  } catch {
    return null;
  }
}

async function translateMyMemory(word: string): Promise<TranslateResult | null> {
  try {
    const url =
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(word) +
      "&langpair=" +
      encodeURIComponent("en|zh-CN");
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "StudyTracker/1.0" },
    });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      responseData?: { translatedText?: string };
    };
    const v = j.responseData?.translatedText?.trim();
    return v ? { meanings: [v] } : null;
  } catch {
    return null;
  }
}

/**
 * GET /api/translate?word=hello -> { meanings: [...], phonetic? }
 */
export async function GET(request: NextRequest) {
  const word = (request.nextUrl.searchParams.get("word") ?? "").trim();
  if (!word) return Response.json({ error: "缺少单词" }, { status: 400 });
  if (word.length > 40) {
    return Response.json({ error: "单词过长" }, { status: 400 });
  }

  const key = word.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() < hit.expiresAt) {
    return Response.json(hit.value);
  }

  const result =
    (await translateYoudao(word)) ?? (await translateMyMemory(word));
  if (!result) {
    return Response.json({ error: "翻译服务暂不可用" }, { status: 502 });
  }

  cache.set(key, { value: result, expiresAt: Date.now() + TTL });
  return Response.json(result);
}

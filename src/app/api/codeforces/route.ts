import { type NextRequest } from "next/server";
import { getCodeforces } from "@/providers/registry";

export const dynamic = "force-dynamic";

/** GET /api/codeforces?username={...} -> Codeforces 数据（真实 / 示例兜底） */
export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username") ?? "";
  const detail = await getCodeforces(username);
  return Response.json(detail);
}

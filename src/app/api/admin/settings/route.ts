import { NextResponse } from "next/server";
import { getAdminConfig, updateAdminConfig } from "@/lib/settings";

export const runtime = "nodejs"; // ensure we can use globalThis reliably if needed, though edge can sometimes too.
export const dynamic = "force-dynamic";

export async function GET() {
  const config = getAdminConfig();
  const stats = (globalThis as any).proxyStats || [];
  return NextResponse.json({ ...config, proxyStats: stats });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = updateAdminConfig(body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

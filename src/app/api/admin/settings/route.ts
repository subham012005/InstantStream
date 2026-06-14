import { NextResponse } from "next/server";
import { getAdminConfig, updateAdminConfig } from "@/lib/settings";

export const runtime = "nodejs"; // ensure we can use globalThis reliably if needed, though edge can sometimes too.

export async function GET() {
  const config = getAdminConfig();
  return NextResponse.json(config);
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

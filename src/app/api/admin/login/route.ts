import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER = "whoissubham";
const ADMIN_PASS = "idk";
const COOKIE_NAME = "admin_session";
const COOKIE_VALUE = "authenticated";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("admin_session");
  return res;
}

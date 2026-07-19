import { NextResponse } from "next/server";
import { registerUser, loginUser } from "@/lib/users";

export const runtime = "edge";

// POST /api/user  body: { action: "register" | "login", name, pin }
export async function POST(req: Request) {
  let body: { action?: string; name?: string; pin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim();
  const pin = String(body.pin ?? "");
  if (!name || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: "bad_input" }, { status: 400 });
  }
  try {
    const res = body.action === "login" ? await loginUser(name, pin) : await registerUser(name, pin);
    return NextResponse.json(res);
  } catch (e) {
    const msg = (e as Error).message || "error";
    const code = msg === "name_taken" ? 409 : msg === "not_found" || msg === "bad_pin" ? 401 : 400;
    return NextResponse.json({ error: msg }, { status: code });
  }
}

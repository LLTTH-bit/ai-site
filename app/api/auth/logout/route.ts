import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ message: "登出成功" });
}

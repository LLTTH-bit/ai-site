import { NextResponse } from "next/server";

// 注册已禁用 - 只能通过管理员添加用户
export async function POST() {
  return NextResponse.json(
    { error: "注册已禁用，请联系管理员添加账号" },
    { status: 403 }
  );
}

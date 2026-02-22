import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      userId: session.userId,
      email: session.email,
      role: session.role,
      isLoggedIn: true,
    });
  } catch (error) {
    console.error("获取会话错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

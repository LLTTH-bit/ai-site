import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (name !== undefined) {
      const user = await prisma.user.update({
        where: { id: session.userId },
        data: { name: name.trim() || null },
      });

      return NextResponse.json({
        success: true,
        user: {
          name: user.name,
        },
      });
    }

    return NextResponse.json({ error: "无效的参数" }, { status: 400 });
  } catch (error) {
    console.error("更新用户信息失败:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

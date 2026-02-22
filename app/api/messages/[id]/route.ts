import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// PATCH - 标记消息为已暂停
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { id } = await params;

    // 查找消息
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: true,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "消息不存在" }, { status: 404 });
    }

    // 权限检查：用户只能标记自己的消息
    if (message.conversation.userId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    // 更新消息为已暂停
    const updated = await prisma.message.update({
      where: { id },
      data: { paused: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("标记消息暂停错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// PATCH - 更新对话标题
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
    const body = await req.json();
    const { title } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    }

    // 检查对话是否存在且属于当前用户
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "对话不存在" }, { status: 404 });
    }

    // 更新标题
    const updated = await prisma.conversation.update({
      where: { id },
      data: { title: title.trim() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("更新对话标题错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

// DELETE - 删除对话
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 管理员可以删除任何用户的对话，普通用户只能删除自己的
    const { id } = await params;
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return NextResponse.json({ error: "对话不存在" }, { status: 404 });
    }

    // 权限检查：管理员可以删除任何对话，用户只能删除自己的
    if (session.role !== "ADMIN" && conversation.userId !== session.userId) {
      return NextResponse.json({ error: "无权删除此对话" }, { status: 403 });
    }

    await prisma.conversation.delete({
      where: { id },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除会话错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { createConversationSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        model: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("获取会话列表错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await req.json();
    const result = createConversationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "输入数据无效", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId: session.userId,
        title: result.data.title || "新对话",
        model: result.data.model || process.env.DEFAULT_MODEL || "claude-sonnet-4-20250514",
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("创建会话错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

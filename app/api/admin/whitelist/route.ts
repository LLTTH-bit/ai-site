import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const whitelist = await prisma.whitelist.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(whitelist);
  } catch (error) {
    console.error("获取白名单错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email, note } = body;

    const existing = await prisma.whitelist.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "邮箱已在白名单中" }, { status: 400 });
    }

    const item = await prisma.whitelist.create({
      data: {
        email,
        note: note || null,
        used: false,
        createdBy: session.userId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("添加白名单错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

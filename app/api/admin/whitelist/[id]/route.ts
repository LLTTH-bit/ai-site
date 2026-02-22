import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session.isLoggedIn || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.whitelist.delete({ where: { id } });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除白名单错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

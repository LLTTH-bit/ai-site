import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session.isLoggedIn || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { status, role } = body;

    const updateData: Record<string, string> = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("更新用户错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

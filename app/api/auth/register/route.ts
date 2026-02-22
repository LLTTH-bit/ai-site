import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "输入数据无效", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // 1. 白名单校验
    const whitelistEntry = await prisma.whitelist.findFirst({
      where: { email, used: false },
    });

    if (!whitelistEntry) {
      return NextResponse.json(
        { error: "该邮箱不在白名单中或已被使用" },
        { status: 403 }
      );
    }

    // 2. 检查邮箱是否已被注册
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    // 3. 创建用户
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        role: "USER",
        status: "ACTIVE",
      },
    });

    // 4. 更新白名单状态
    await prisma.whitelist.update({
      where: { id: whitelistEntry.id },
      data: { used: true },
    });

    return NextResponse.json(
      { message: "注册成功", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

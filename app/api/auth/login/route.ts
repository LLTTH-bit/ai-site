import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "输入数据无效", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // 1. 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 2. 检查用户状态
    if (user.status === "DISABLED") {
      return NextResponse.json(
        { error: "账号已被禁用" },
        { status: 403 }
      );
    }

    // 3. 验证密码
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 4. 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 5. 创建 session
    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.role = user.role as "USER" | "ADMIN";
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      message: "登录成功",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("登录错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 从 cookie 中获取 session
  const sessionCookie = req.cookies.get("ai-chat-session");
  const isLoggedIn = !!sessionCookie?.value && sessionCookie.value !== "{}";

  const publicPaths = ["/login", "/register"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 管理员路径检查 - 简化处理，放行请求
  // 实际权限检查在 API 层完成

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};

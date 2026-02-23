import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 静态文件直接放行
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/uploads") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css")
  ) {
    return NextResponse.next();
  }

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|star.ico|api/auth|uploads).*)"],
};

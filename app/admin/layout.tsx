import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LayoutDashboard, Users, KeyRound, BarChart3, MessageSquare, LogOut, MessageCircle, FolderOpen } from "lucide-react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/");
  }

  const navItems = [
    { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
    { href: "/admin/users", label: "用户管理", icon: Users },
    { href: "/admin/conversations", label: "对话管理", icon: MessageCircle },
    { href: "/admin/usage", label: "用量统计", icon: BarChart3 },
    { href: "/admin/files", label: "文件管理", icon: FolderOpen },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* 侧边栏 */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-800">管理后台</h1>
              <p className="text-xs text-slate-500">AI 对话管理系统</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">返回对话</span>
          </Link>

          <div className="px-3 py-2 text-xs text-slate-400">
            登录身份: <span className="text-slate-600 font-medium">{session.email}</span>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-300">{children}</div>
      </main>
    </div>
  );
}

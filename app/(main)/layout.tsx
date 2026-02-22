import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PlusCircle, Settings, LogOut, User } from "lucide-react";
import ConversationSidebar from "@/components/conversation-sidebar";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  const isAdmin = session.role === "ADMIN";

  // 获取对话列表（用于侧边栏显示）- 只显示有消息的对话
  const conversations = await prisma.conversation.findMany({
    where: {
      userId: session.userId,
      messages: {
        some: {},
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      _count: {
        select: { messages: true },
      },
    },
  });

  const handleLogout = async () => {
    "use server";
    const session = await getSession();
    session.destroy();
    redirect("/login");
  };

  const createNewConversation = async () => {
    "use server";
    const session = await getSession();
    const conversation = await prisma.conversation.create({
      data: {
        userId: session.userId,
        title: "新对话",
      },
    });
    redirect(`/chat/${conversation.id}`);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* 侧边栏 */}
      <aside className="w-72 bg-sidebar flex flex-col text-sidebar-foreground">
        <div className="p-3 border-b border-sidebar-border">
          <form action={createNewConversation}>
            <button
              type="submit"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors w-full"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">新建对话</span>
            </button>
          </form>
        </div>

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <h3 className="text-xs font-bold text-sidebar-foreground/80 uppercase tracking-wider mb-2 px-3">
              对话历史
            </h3>
            <ConversationSidebar initialConversations={conversations} />
          </div>
        </div>

        {/* 管理员后台（仅管理员可见） */}
        {isAdmin && (
          <div className="p-2 border-t border-sidebar-border">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              管理后台
            </Link>
          </div>
        )}

        {/* 用户信息 */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.email}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {isAdmin ? "管理员" : "用户"}
              </p>
            </div>
          </div>
          <form action={handleLogout}>
            <button
              type="submit"
              className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              登出
            </button>
          </form>
        </div>
      </aside>

      {/* 分隔线 */}
      <div className="w-px bg-sidebar-border" />

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  );
}

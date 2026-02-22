import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SidebarWrapper } from "./sidebar-wrapper";

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

  return (
    <div className="h-screen flex bg-background relative">
      <SidebarWrapper
        conversations={conversations}
        isAdmin={isAdmin}
        email={session.email}
      />

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300 ml-0">
        {children}
      </main>
    </div>
  );
}

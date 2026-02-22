"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Settings, LogOut, User, ChevronLeft, ChevronRight } from "lucide-react";
import ConversationSidebar from "@/components/conversation-sidebar";
import { LogoutButton } from "./logout-button";

interface Conversation {
  id: string;
  title: string;
  _count: {
    messages: number;
  };
}

interface SidebarWrapperProps {
  conversations: Conversation[];
  isAdmin: boolean;
  email: string;
}

export function SidebarWrapper({ conversations, isAdmin, email }: SidebarWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* 侧边栏 */}
      <aside
        className={`bg-sidebar flex flex-col text-sidebar-foreground transition-all duration-300 ease-in-out overflow-hidden ${
          collapsed ? "w-0" : "w-72"
        }`}
      >
        <div className={`p-3 border-b border-sidebar-border ${collapsed ? "hidden" : ""}`}>
          <form action={async () => {
            "use server";
            const { getSession } = await import("@/lib/session");
            const { prisma } = await import("@/lib/prisma");
            const { redirect } = await import("next/navigation");
            const session = await getSession();
            const conversation = await prisma.conversation.create({
              data: {
                userId: session.userId,
                title: "新对话",
              },
            });
            redirect(`/chat/${conversation.id}`);
          }}>
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
        <div className={`flex-1 overflow-y-auto ${collapsed ? "hidden" : ""}`}>
          <div className="p-3">
            <h3 className="text-xs font-bold text-sidebar-foreground/80 uppercase tracking-wider mb-2 px-3">
              对话历史
            </h3>
            <ConversationSidebar initialConversations={conversations} />
          </div>
        </div>

        {/* 管理员后台（仅管理员可见） */}
        {isAdmin && !collapsed && (
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
        <div className={`p-3 border-t border-sidebar-border ${collapsed ? "hidden" : ""}`}>
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{email}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {isAdmin ? "管理员" : "用户"}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* 收起/展开按钮 */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-sidebar border border-sidebar-border rounded-r-lg p-1 hover:bg-sidebar-accent transition-colors"
        style={{ left: collapsed ? "0" : "288px" }}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
        )}
      </button>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Settings, User, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Camera } from "lucide-react";
import ConversationSidebar from "@/components/conversation-sidebar";
import { LogoutButton } from "./logout-button";
import PersonalCenter from "@/components/personal-center";

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
  nickname: string | null;
}

export function SidebarWrapper({ conversations, isAdmin, email, nickname }: SidebarWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [showPersonalCenter, setShowPersonalCenter] = useState(false);
  const [currentNickname, setCurrentNickname] = useState(nickname);
  const router = useRouter();

  const handleCreateConversation = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "新对话" }),
      });

      if (!res.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await res.json();
      router.push(`/chat/${data.id}`);
    } catch (error) {
      console.error("创建对话失败:", error);
      alert("创建对话失败，请重试");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* 侧边栏 */}
      <aside
        className={`relative bg-sidebar flex flex-col text-sidebar-foreground overflow-hidden ${
          collapsed ? "w-0" : "w-72"
        }`}
        style={{ transition: "width 0.3s ease-in-out" }}
      >
        {/* 顶部：Logo 和 LLTTH */}
        <div
          className={`p-4 flex items-center gap-3 border-b border-sidebar-border ${
            collapsed ? "opacity-0 invisible" : "opacity-100 visible"
          }`}
          style={{ transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out" }}
        >
          <img src="/star.ico" alt="logo" className="w-8 h-8" />
          <span
            className="text-lg font-bold tracking-wider"
            style={{
              fontFamily: "'Courier New', monospace",
              textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
            }}
          >
            LLTTH
          </span>
        </div>

        {/* 对话列表（包含新建对话和历史） */}
        <div
          className={`flex-1 overflow-y-auto ${
            collapsed ? "opacity-0 invisible" : "opacity-100 visible"
          }`}
          style={{ transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out" }}
        >
          <div className="p-3 pt-0">
            {/* 新建对话按钮 */}
            <button
              onClick={handleCreateConversation}
              disabled={isCreating}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors w-full disabled:opacity-50 mb-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">{isCreating ? "创建中..." : "新建对话"}</span>
            </button>

            {/* 学术照相馆链接 */}
            <Link
              href="/photo-studio"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors w-full mb-2"
            >
              <Camera className="w-5 h-5" />
              <span className="font-medium">学术照相馆</span>
            </Link>

            {/* 你的聊天 - 可收起 */}
            <div>
              <button
                onClick={() => setHistoryExpanded(!historyExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <h3 className="text-xs font-bold text-sidebar-foreground/80 uppercase tracking-wider">
                  你的聊天
                </h3>
                {historyExpanded ? (
                  <ChevronUp className="w-4 h-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
                )}
              </button>

              {/* 对话历史列表 - 可收起 */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  historyExpanded ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                }`}
                style={{ transformOrigin: "top" }}
              >
                <ConversationSidebar initialConversations={conversations} />
              </div>
            </div>
          </div>
        </div>

        {/* 管理员后台（仅管理员可见） */}
        {isAdmin && (
          <div
            className={`p-2 border-t border-sidebar-border ${
              collapsed ? "opacity-0 invisible" : "opacity-100 visible"
            }`}
            style={{ transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out" }}
          >
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              管理后台
            </Link>
          </div>
        )}

        {/* 用户信息（点击可打开个人中心） */}
        <div
          className={`p-3 border-t border-sidebar-border ${
            collapsed ? "opacity-0 invisible" : "opacity-100 visible"
          }`}
          style={{ transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out" }}
        >
          <button
            onClick={() => !isAdmin && setShowPersonalCenter(true)}
            className={`flex items-center gap-2 px-2 py-2 w-full rounded-lg transition-colors ${
              !isAdmin ? "hover:bg-sidebar-accent cursor-pointer" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{currentNickname || email}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {isAdmin ? "管理员" : (currentNickname ? email : "点击设置昵称")}
              </p>
            </div>
          </button>
          <LogoutButton />
        </div>
      </aside>

      {/* 个人中心浮窗 */}
      <PersonalCenter
        isOpen={showPersonalCenter}
        onClose={() => setShowPersonalCenter(false)}
        onNicknameChange={(newNickname) => setCurrentNickname(newNickname)}
      />

      {/* 收起/展开按钮 - 始终可见 */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 transform -translate-y-1/2 z-20 bg-sidebar border border-sidebar-border rounded-full p-1.5 hover:bg-sidebar-accent transition-all duration-300"
        style={{
          left: collapsed ? "8px" : "264px",
        }}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
        )}
      </button>

      {/* 分隔线 - 收起时隐藏 */}
      {!collapsed && (
        <div
          className="w-px bg-sidebar-border"
          style={{ marginLeft: collapsed ? "0" : "0" }}
        />
      )}
    </>
  );
}

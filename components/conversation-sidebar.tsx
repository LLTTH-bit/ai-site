"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Trash2 } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  _count: {
    messages: number;
  };
}

export default function ConversationSidebar({
  initialConversations,
}: {
  initialConversations: Conversation[];
}) {
  const pathname = usePathname();
  const [conversations, setConversations] = useState(initialConversations);
  const [newConversationIds, setNewConversationIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const prevIdsRef = useRef<Set<string>>(new Set());

  // 从 URL 获取当前对话 ID
  const currentConversationId = pathname.startsWith("/chat/")
    ? pathname.split("/chat/")[1]
    : null;

  // 过滤掉没有消息的对话（只显示有实际对话内容的）
  const activeConversations = conversations.filter(
    (conv) => conv._count.messages > 0
  );

  // 获取对话列表的函数
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data: Conversation[] = await res.json();

        // 检测新对话（新出现的 ID）
        const currentIds = new Set(data.map((c) => c.id));
        const newIds = new Set<string>();

        data.forEach((conv) => {
          if (!prevIdsRef.current.has(conv.id) && conv._count.messages > 0) {
            newIds.add(conv.id);
          }
        });

        if (newIds.size > 0) {
          setNewConversationIds(newIds);
          // 3秒后移除新标识
          setTimeout(() => {
            setNewConversationIds(new Set());
          }, 3000);
        }

        prevIdsRef.current = currentIds;
        setConversations(data);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // 删除对话
  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("确定要删除这个对话吗？此操作不可恢复。")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        // 如果删除的是当前对话，跳转到首页
        if (id === currentConversationId) {
          window.location.href = "/";
        }
      } else {
        const data = await res.json();
        alert(data.error || "删除失败");
      }
    } finally {
      setDeletingId(null);
    }
  };

  // 初始加载时设置之前的 ID
  useEffect(() => {
    const ids = new Set(initialConversations.map((c) => c.id));
    prevIdsRef.current = ids;
  }, [initialConversations]);

  // 定时刷新对话列表（每1秒）
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 1000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // 当路径变化时，立即刷新
  useEffect(() => {
    fetchConversations();
  }, [pathname, fetchConversations]);

  return (
    <div className="space-y-1">
      {activeConversations.length === 0 ? (
        <p className="px-3 py-2 text-sm text-sidebar-foreground/50">暂无对话</p>
      ) : (
        activeConversations.map((conv) => {
          const isActive = conv.id === currentConversationId;
          const isNew = newConversationIds.has(conv.id);

          return (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent"
              } ${
                isNew
                  ? "animate-slide-in"
                  : ""
              }`}
            >
              <MessageSquare className="w-4 h-4 text-sidebar-foreground/50 flex-shrink-0" />
              <span className="text-sm font-medium truncate flex-1">{conv.title}</span>

              {/* 操作按钮 */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
                {isNew && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  disabled={deletingId === conv.id}
                  className={`p-1 rounded hover:bg-red-500/20 text-sidebar-foreground/50 hover:text-red-500 transition-colors ${
                    deletingId === conv.id ? "opacity-50" : ""
                  }`}
                  title="删除对话"
                >
                  {deletingId === conv.id ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}

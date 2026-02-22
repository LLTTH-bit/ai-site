"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, MessageSquare, Calendar, User, AlertTriangle, Eye } from "lucide-react";
import { getModelById } from "@/lib/models";

interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  user: {
    email: string;
    name: string | null;
  };
  _count: {
    messages: number;
  };
  messages: {
    content: string;
    role: string;
  }[];
}

export default function ConversationList({
  initialConversations,
}: {
  initialConversations: Conversation[];
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const deleteConversation = async (id: string) => {
    if (!confirm("确定要删除这个对话吗？此操作不可恢复。")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "删除失败");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">对话管理</h1>
        <p className="text-slate-500 text-sm mt-1">查看和管理所有用户的对话</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="搜索用户邮箱..."
              className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="text-sm text-slate-500">
            共 {filteredConversations.length} 条对话
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <h3 className="font-medium text-slate-800 truncate">
                    {conv.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">
                      {conv.user.name || conv.user.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(conv.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                  <div className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                    {conv._count.messages} 条消息
                  </div>
                  <div className="px-2 py-0.5 bg-blue-50 rounded text-xs text-blue-600">
                    {getModelById(conv.model)?.name || conv.model.split("/").pop()}
                  </div>
                </div>

                {/* 第一条消息预览 */}
                {conv.messages[0] && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-400 mb-1">
                      {conv.messages[0].role === "user" ? "用户第一条消息:" : "AI第一条回复:"}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {conv.messages[0].content.length > 100
                        ? conv.messages[0].content.slice(0, 100) + "..."
                        : conv.messages[0].content}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/conversations/${conv.id}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  查看
                </Link>
                <button
                  onClick={() => deleteConversation(conv.id)}
                  disabled={deletingId === conv.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deletingId === conv.id ? (
                    "删除中..."
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      删除
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredConversations.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">暂无对话数据</p>
        </div>
      )}
    </div>
  );
}

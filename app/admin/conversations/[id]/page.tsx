import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ArrowLeft, User, Calendar, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminConversationDetailPage({ params }: Props) {
  const session = await getSession();

  if (!session.isLoggedIn || session.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      user: {
        select: { email: true, name: true, role: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/conversations"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          返回对话列表
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* 对话信息头部 */}
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">{conversation.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{conversation.user.name || conversation.user.email}</span>
                  {conversation.user.role === "ADMIN" && (
                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">
                      管理员
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>创建于 {new Date(conversation.createdAt).toLocaleString("zh-CN")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>{conversation.messages.length} 条消息</span>
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm">
              {conversation.model.split("/").pop()}
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="divide-y divide-slate-200">
          {conversation.messages.length === 0 ? (
            <div className="p-8 text-center text-slate-500">暂无消息</div>
          ) : (
            conversation.messages.map((msg) => (
              <div key={msg.id} className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      msg.role === "user"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {msg.role === "user" ? "用户" : "AI"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(msg.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

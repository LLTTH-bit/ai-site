import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Users, UserCheck, MessageSquare, TrendingUp, Key, Zap } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session.isLoggedIn || session.role !== "ADMIN") {
    redirect("/");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeUsers,
    totalConversations,
    todayConversations,
    todayTokens,
    whitelistAvailable,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.conversation.count({ where: { messages: { some: {} } } }),
    prisma.conversation.count({ where: { createdAt: { gte: today }, messages: { some: {} } } }),
    prisma.apiUsageLog.aggregate({
      _sum: { totalTokens: true },
      where: { createdAt: { gte: today } },
    }),
    prisma.whitelist.count({ where: { used: false } }),
  ]);

  const stats = [
    { label: "总用户数", value: totalUsers, icon: Users, color: "blue", bgColor: "bg-blue-50" },
    { label: "活跃用户", value: activeUsers, icon: UserCheck, color: "green", bgColor: "bg-green-50" },
    { label: "总对话数", value: totalConversations, icon: MessageSquare, color: "purple", bgColor: "bg-purple-50" },
    { label: "今日对话", value: todayConversations, icon: TrendingUp, color: "orange", bgColor: "bg-orange-50" },
    { label: "今日 Token", value: todayTokens._sum.totalTokens || 0, icon: Zap, color: "yellow", bgColor: "bg-yellow-50" },
    { label: "剩余白名单", value: whitelistAvailable, icon: Key, color: "cyan", bgColor: "bg-cyan-50" },
  ];

  const colorMap: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    yellow: "text-yellow-600",
    cyan: "text-cyan-600",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">仪表盘</h1>
        <p className="text-slate-500 text-sm mt-1">系统运行概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.label === "今日 Token" ? "/admin/usage" : "#"}
            className={`bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow ${
              stat.label === "今日 Token" ? "cursor-pointer hover:border-blue-300" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${colorMap[stat.color]}`} />
              </div>
              {stat.label === "今日 Token" && (
                <span className="text-xs text-blue-500">点击查看详情</span>
              )}
            </div>
            <div className="mt-3">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">
                {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-3">快速说明</h2>
        <ul className="text-sm text-slate-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></span>
            本页面显示系统的实时统计数据
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></span>
            管理员可以在此监控用户活跃度和 Token 消耗情况
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></span>
            剩余白名单名额可用于邀请新用户注册
          </li>
        </ul>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Calendar, Zap, BarChart3, User } from "lucide-react";

interface UserStat {
  email: string;
  name: string | null;
  totalTokens: number;
  requestCount: number;
}

interface UserWithUsage {
  email: string;
  name: string | null;
  _count: { usageLogs: number };
  usageLogs: { totalTokens: number }[];
}

interface ModelUsage {
  model: string;
  _sum: { totalTokens: number | null };
}

export default async function UsagePage() {
  const session = await getSession();

  if (!session.isLoggedIn || session.role !== "ADMIN") {
    redirect("/");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayUsage, monthUsage, userUsage, modelUsage] = await Promise.all([
    prisma.apiUsageLog.aggregate({
      _sum: { inputTokens: true, outputTokens: true, totalTokens: true },
      where: { createdAt: { gte: today } },
    }),
    prisma.apiUsageLog.aggregate({
      _sum: { inputTokens: true, outputTokens: true, totalTokens: true },
      where: { createdAt: { gte: thisMonth } },
    }),
    prisma.user.findMany({
      include: {
        _count: { select: { usageLogs: true } },
        usageLogs: {
          select: { totalTokens: true },
        },
      },
    }),
    prisma.apiUsageLog.groupBy({
      by: ["model"],
      _sum: { totalTokens: true },
    }),
  ]);

  const userStats: UserStat[] = (userUsage as UserWithUsage[])
    .map((u: UserWithUsage) => ({
      email: u.email,
      name: u.name,
      totalTokens: u.usageLogs.reduce((sum, log) => sum + log.totalTokens, 0),
      requestCount: u._count.usageLogs,
    }))
    .sort((a, b) => b.totalTokens - a.totalTokens)
    .slice(0, 10);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">用量统计</h1>
        <p className="text-slate-500 text-sm mt-1">监控 Token 消耗和 API 调用情况</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-slate-600">今日 Token</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {(todayUsage._sum.totalTokens || 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm text-slate-600">本月 Token</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {(monthUsage._sum.totalTokens || 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-green-50">
              <Zap className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-slate-600">模型使用分布</span>
          </div>
          <div className="space-y-1.5">
            {(modelUsage as ModelUsage[]).map((m: ModelUsage) => (
              <div key={m.model} className="flex justify-between text-sm">
                <span className="text-slate-500 truncate max-w-[150px]" title={m.model}>
                  {m.model.split("/").pop()}
                </span>
                <span className="font-medium text-slate-700">
                  {(m._sum.totalTokens || 0).toLocaleString()}
                </span>
              </div>
            ))}
            {(modelUsage as ModelUsage[]).length === 0 && (
              <p className="text-sm text-slate-400">暂无数据</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">用户用量排行</h2>
        </div>
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                排名
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                用户
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                请求次数
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Token 消耗
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {userStats.map((user, index) => (
              <tr key={user.email} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                        ? "bg-slate-100 text-slate-600"
                        : index === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-slate-50 text-slate-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">
                      {user.name || user.email}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-slate-600">
                  {user.requestCount}
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm font-medium text-slate-800">
                    {user.totalTokens.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {userStats.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            暂无用量数据
          </div>
        )}
      </div>
    </div>
  );
}

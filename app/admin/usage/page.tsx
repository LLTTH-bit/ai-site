import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Calendar, Zap, BarChart3, User, ArrowLeft } from "lucide-react";

// 模型价格（每百万 tokens）
const MODEL_PRICING: Record<string, number> = {
  // 免费模型
  "Qwen/Qwen2.5-7B-Instruct": 0,
  "THUDM/glm-4-9b-chat": 0,
  // 收费模型
  "Pro/MiniMaxAI/MiniMax-M2.5": 7,
  "deepseek-ai/DeepSeek-V3.2": 2.5,
};

// 计算费用
function calculateCost(totalTokens: number, model: string): number {
  const pricePerMillion = MODEL_PRICING[model] || 0;
  return (totalTokens / 1000000) * pricePerMillion;
}

export default async function UsagePage() {
  const session = await getSession();

  if (!session.isLoggedIn || session.role !== "ADMIN") {
    redirect("/");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayUsage, monthUsage, userUsage, todayModelUsage, monthModelUsage] = await Promise.all([
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
      _sum: { inputTokens: true, outputTokens: true, totalTokens: true },
      where: { createdAt: { gte: today } },
    }),
    prisma.apiUsageLog.groupBy({
      by: ["model"],
      _sum: { inputTokens: true, outputTokens: true, totalTokens: true },
    }),
  ]);

  const userStats = userUsage.map((u: any) => ({
    email: u.email,
    name: u.name,
    totalTokens: u.usageLogs.reduce((sum: number, log: any) => sum + log.totalTokens, 0),
    requestCount: u._count.usageLogs,
  })).sort((a: any, b: any) => b.totalTokens - a.totalTokens).slice(0, 10);

  // 计算今日各模型费用
  const todayModelStats = (todayModelUsage as any[]).map((m: any) => ({
    model: m.model,
    inputTokens: m._sum.inputTokens || 0,
    outputTokens: m._sum.outputTokens || 0,
    totalTokens: m._sum.totalTokens || 0,
    cost: calculateCost(m._sum.totalTokens || 0, m.model),
  }));

  // 计算本月各模型费用
  const monthModelStats = (monthModelUsage as any[]).map((m: any) => ({
    model: m.model,
    inputTokens: m._sum.inputTokens || 0,
    outputTokens: m._sum.outputTokens || 0,
    totalTokens: m._sum.totalTokens || 0,
    cost: calculateCost(m._sum.totalTokens || 0, m.model),
  }));

  // 今日总费用
  const todayTotalCost = todayModelStats.reduce((sum, m) => sum + m.cost, 0);
  // 本月总费用
  const monthTotalCost = monthModelStats.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回仪表盘
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">用量统计</h1>
        <p className="text-slate-500 text-sm mt-1">监控 Token 消耗和 API 调用情况</p>
      </div>

      {/* 今日 Token 明细 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
          <div className="text-sm text-orange-600 mt-1">
            约 ¥{todayTotalCost.toFixed(4)}
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
          <div className="text-sm text-orange-600 mt-1">
            约 ¥{monthTotalCost.toFixed(4)}
          </div>
        </div>
      </div>

      {/* 今日模型使用明细 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">今日各模型使用明细</h2>
        </div>
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">模型</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase">输入 Token</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase">输出 Token</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase">总计 Token</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase">费用 (¥)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {todayModelStats.map((m) => (
              <tr key={m.model} className="hover:bg-slate-50">
                <td className="px-5 py-3 text-sm text-slate-700">{m.model.split("/").pop()}</td>
                <td className="px-5 py-3 text-sm text-slate-600 text-right">{m.inputTokens.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm text-slate-600 text-right">{m.outputTokens.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm font-medium text-slate-800 text-right">{m.totalTokens.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm font-medium text-orange-600 text-right">
                  {m.cost > 0 ? `¥${m.cost.toFixed(4)}` : "免费"}
                </td>
              </tr>
            ))}
            {todayModelStats.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-500">暂无数据</td>
              </tr>
            )}
          </tbody>
          {todayModelStats.length > 0 && (
            <tfoot className="bg-slate-50">
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-700">合计</td>
                <td className="px-5 py-3 text-sm font-semibold text-slate-700 text-right">
                  {todayModelStats.reduce((s, m) => s + m.inputTokens, 0).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-sm font-semibold text-slate-700 text-right">
                  {todayModelStats.reduce((s, m) => s + m.outputTokens, 0).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-sm font-semibold text-slate-700 text-right">
                  {todayModelStats.reduce((s, m) => s + m.totalTokens, 0).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-sm font-semibold text-orange-600 text-right">
                  ¥{todayTotalCost.toFixed(4)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* 本月模型使用分布 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">本月模型使用分布</h2>
        </div>
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">模型</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase">总计 Token</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase">费用 (¥)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {monthModelStats.map((m) => (
              <tr key={m.model} className="hover:bg-slate-50">
                <td className="px-5 py-3 text-sm text-slate-700">{m.model.split("/").pop()}</td>
                <td className="px-5 py-3 text-sm font-medium text-slate-800 text-right">{m.totalTokens.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm font-medium text-orange-600 text-right">
                  {m.cost > 0 ? `¥${m.cost.toFixed(4)}` : "免费"}
                </td>
              </tr>
            ))}
            {monthModelStats.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-500">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 用户用量排行 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">用户用量排行</h2>
        </div>
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">排名</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">用户</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">请求次数</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Token 消耗</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {userStats.map((user: any, index: number) => (
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
                    <span className="text-sm text-slate-700">{user.name || user.email}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-slate-600">{user.requestCount}</td>
                <td className="px-5 py-3">
                  <span className="text-sm font-medium text-slate-800">{user.totalTokens.toLocaleString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
          {userStats.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-500">暂无用量数据</td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}

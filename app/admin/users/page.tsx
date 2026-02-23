import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import UserList from "./user-list";

// 模型价格（每百万 tokens）
const MODEL_PRICING: Record<string, number> = {
  // 免费模型
  "Qwen/Qwen2.5-7B-Instruct": 0,
  "THUDM/glm-4-9b-chat": 0,
  // 收费模型
  "Pro/MiniMaxAI/MiniMax-M2.5": 7,      // ¥7/1M tokens
  "deepseek-ai/DeepSeek-V3.2": 2.5,      // ¥2.5/1M tokens
};

// 计算费用
function calculateCost(totalTokens: number, model: string): number {
  const pricePerMillion = MODEL_PRICING[model] || 0;
  return (totalTokens / 1000000) * pricePerMillion;
}

export default async function UsersPage() {
  const session = await getSession();

  if (!session.isLoggedIn || session.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { conversations: true, usageLogs: true },
      },
      usageLogs: {
        select: { model: true, totalTokens: true },
      },
    },
  });

  // 计算每个用户的费用
  const usersWithCost = users.map((user) => {
    let totalCost = 0;

    // 按模型分组计算费用
    const modelUsage: Record<string, number> = {};
    for (const log of user.usageLogs) {
      const modelKey = log.model;
      if (!modelUsage[modelKey]) {
        modelUsage[modelKey] = 0;
      }
      modelUsage[modelKey] += log.totalTokens;
    }

    // 计算总费用
    for (const [model, tokens] of Object.entries(modelUsage)) {
      totalCost += calculateCost(tokens, model);
    }

    return {
      ...user,
      totalCost: Math.round(totalCost * 10000) / 10000, // 精确到小数点后4位
    };
  });

  return <UserList users={usersWithCost} />;
}

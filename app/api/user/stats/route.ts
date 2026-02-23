import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 模型价格（每百万 tokens）
const MODEL_PRICING: Record<string, number> = {
  "Qwen/Qwen2.5-7B-Instruct": 0,
  "THUDM/glm-4-9b-chat": 0,
  "Pro/MiniMaxAI/MiniMax-M2.5": 7,
  "deepseek-ai/DeepSeek-V3.2": 2.5,
};

export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const userId = session.userId;

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 获取对话数（有消息的）
    const conversationCount = await prisma.conversation.count({
      where: {
        userId,
        messages: { some: {} },
      },
    });

    // 获取总消息数
    const messageCount = await prisma.message.count({
      where: {
        conversation: { userId },
      },
    });

    // 获取 token 使用统计
    const usageLogs = await prisma.apiUsageLog.findMany({
      where: { userId },
      select: {
        model: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 计算总费用
    let totalCost = 0;
    const modelUsage: Record<string, { tokens: number; cost: number }> = {};

    for (const log of usageLogs) {
      totalCost += calculateCost(log.totalTokens, log.model);
      if (!modelUsage[log.model]) {
        modelUsage[log.model] = { tokens: 0, cost: 0 };
      }
      modelUsage[log.model].tokens += log.totalTokens;
      modelUsage[log.model].cost += calculateCost(log.totalTokens, log.model);
    }

    const totalTokens = usageLogs.reduce((sum, log) => sum + log.totalTokens, 0);
    const totalInputTokens = usageLogs.reduce((sum, log) => sum + log.inputTokens, 0);
    const totalOutputTokens = usageLogs.reduce((sum, log) => sum + log.outputTokens, 0);

    // 按模型分组的数据
    const modelStats = Object.entries(modelUsage).map(([model, data]) => ({
      model,
      modelName: model.split("/").pop(),
      tokens: data.tokens,
      cost: data.cost,
    }));

    return NextResponse.json({
      user: {
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      stats: {
        conversationCount,
        messageCount,
        totalTokens,
        totalInputTokens,
        totalOutputTokens,
        totalCost: Math.round(totalCost * 10000) / 10000,
      },
      modelStats,
    });
  } catch (error) {
    console.error("获取用户统计失败:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

function calculateCost(totalTokens: number, model: string): number {
  const pricePerMillion = MODEL_PRICING[model] || 0;
  return (totalTokens / 1000000) * pricePerMillion;
}

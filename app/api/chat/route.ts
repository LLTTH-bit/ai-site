import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest } from "next/server";
import { chatSchema } from "@/lib/validators";

const AI_API_BASE = process.env.AI_API_BASE_URL!;
const AI_API_KEY = process.env.AI_API_KEY!;
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "Qwen/Qwen2.5-7B-Instruct";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return new Response(JSON.stringify({ error: "未登录" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user || user.status === "DISABLED") {
      return new Response(JSON.stringify({ error: "账号已被禁用" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const result = chatSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: "请求参数无效", details: result.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { conversationId, message, model = DEFAULT_MODEL, thinking = false } = result.data;

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: { role: true, content: true },
        },
      },
    });

    if (!conversation) {
      return new Response(JSON.stringify({ error: "会话不存在" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 保存用户消息
    const userMessageRecord = await prisma.message.create({
      data: {
        conversationId,
        role: "user",
        content: message,
      },
    });

    // 转换消息格式
    const messages = conversation.messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));
    messages.push({ role: "user", content: message });

    const startTime = Date.now();

    // 使用流式 API
    // 调用 AI API
    console.log(`[AI API] Using model: ${model}, thinking: ${thinking}`);

    // 构建请求体
    const requestBody: Record<string, unknown> = {
      model: model,
      messages: messages,
      stream: true,
    };

    // 如果启用深度思考，添加相关参数
    if (thinking) {
      requestBody.enable_thinking = true;
      requestBody.thinking_budget = 4096;
    }

    const aiResponse = await fetch(`${AI_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!aiResponse.ok || !aiResponse.body) {
      const errText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "AI 服务不可用", details: errText }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const decoder = new TextDecoder();
    let assistantContent = "";
    let saved = false;

    let userMessageIdSent = false;

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // 首次发送数据时，先发送用户消息 ID
        if (!userMessageIdSent) {
          userMessageIdSent = true;
          const userMessageData = {
            type: "user_message_id",
            userMessageId: userMessageRecord.id,
          };
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(userMessageData)}\n\n`));
        }
        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const dataStr = line.slice(6).trim();
          if (dataStr === "[DONE]") continue;

          try {
            const data = JSON.parse(dataStr);
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              const sseData = {
                type: "content_block_delta",
                delta: { text: content }
              };
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(sseData)}\n\n`));
            }
          } catch {
            // ignore
          }
        }
      },

      flush(controller) {
        const durationMs = Date.now() - startTime;

        // 保存到数据库（只保存一次）
        if (!saved && assistantContent) {
          saved = true;
          prisma.message.create({
            data: {
              conversationId,
              role: "assistant",
              content: assistantContent,
            },
          }).catch(console.error);

          prisma.apiUsageLog.create({
            data: {
              userId: user.id,
              conversationId,
              model,
              inputTokens: Math.floor(message.length / 4),
              outputTokens: Math.floor(assistantContent.length / 4),
              totalTokens: Math.floor((message.length + assistantContent.length) / 4),
              durationMs,
            },
          }).catch(console.error);

          prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date(), model: model },
          }).catch(console.error);

          if (!conversation.title || conversation.title === "新对话") {
            const title = message.slice(0, 30) + (message.length > 30 ? "..." : "");
            prisma.conversation.update({
              where: { id: conversationId },
              data: { title },
            }).catch(console.error);
          }
        }

        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      },
    });

    return new Response(aiResponse.body.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "服务器内部错误", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

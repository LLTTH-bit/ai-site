import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  console.log("[HomePage] Session:", session);

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  // 检查用户是否存在
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  console.log("[HomePage] User found:", user);

  if (!user) {
    redirect("/login");
  }

  // 自动创建新对话并跳转
  console.log("[HomePage] Creating conversation for userId:", session.userId);
  try {
    const conversation = await prisma.conversation.create({
      data: {
        userId: session.userId,
        title: "新对话",
      },
    });
    console.log("[HomePage] Conversation created:", conversation.id);
    redirect(`/chat/${conversation.id}`);
  } catch (error) {
    console.error("[HomePage] Error creating conversation:", error);
    throw error;
  }
}

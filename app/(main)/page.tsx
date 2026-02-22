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
    // 先确认用户存在
    const userCheck = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    console.log("[HomePage] User check result:", userCheck ? "exists" : "not found");

    const conversation = await prisma.conversation.create({
      data: {
        userId: session.userId,
        title: "新对话",
      },
    });
    console.log("[HomePage] Conversation created:", conversation.id);
    redirect(`/chat/${conversation.id}`);
  } catch (error: any) {
    console.error("[HomePage] Error creating conversation:", error.message);
    console.error("[HomePage] UserId being used:", session.userId);
    throw error;
  }
}

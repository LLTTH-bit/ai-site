import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { appendFileSync } from "fs";

export default async function HomePage() {
  const session = await getSession();

  const log = (msg: string) => {
    const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
    try { appendFileSync("/tmp/homepage.log", logMsg); } catch {}
  };

  log("Session: " + JSON.stringify(session));

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  // 检查用户是否存在
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  log("User found: " + (user ? "yes" : "no"));

  if (!user) {
    redirect("/login");
  }

  // 自动创建新对话并跳转
  log("Creating conversation for userId: " + session.userId);
  try {
    const conversation = await prisma.conversation.create({
      data: {
        userId: session.userId,
        title: "新对话",
      },
    });
    log("Conversation created: " + conversation.id);
    redirect(`/chat/${conversation.id}`);
  } catch (error: any) {
    log("Error: " + error.message);
    throw error;
  }
}

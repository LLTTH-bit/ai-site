import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  // 自动创建新对话并跳转
  const conversation = await prisma.conversation.create({
    data: {
      userId: session.userId,
      title: "新对话",
    },
  });
  redirect(`/chat/${conversation.id}`);
}

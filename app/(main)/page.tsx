import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  // 使用事务确保原子性
  const conversation = await prisma.$transaction(async (tx) => {
    // 先确认用户存在
    const user = await tx.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // 创建对话
    return tx.conversation.create({
      data: {
        userId: session.userId,
        title: "新对话",
      },
    });
  });

  redirect(`/chat/${conversation.id}`);
}

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import ConversationList from "./conversation-list";

export default async function AdminConversationsPage() {
  const session = await getSession();

  if (!session.isLoggedIn || session.role !== "ADMIN") {
    redirect("/");
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      messages: {
        some: {},
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      user: {
        select: { email: true, name: true },
      },
      _count: {
        select: { messages: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { content: true, role: true },
      },
    },
  });

  return <ConversationList initialConversations={conversations} />;
}

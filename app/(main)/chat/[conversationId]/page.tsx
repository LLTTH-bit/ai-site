import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ChatInterface } from "./chat-interface";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { conversationId } = await params;
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId: session.userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  return <ChatInterface conversation={conversation} />;
}

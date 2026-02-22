"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function createNewConversation() {
  const session = await getSession();
  const conversation = await prisma.conversation.create({
    data: {
      userId: session.userId,
      title: "新对话",
    },
  });
  redirect(`/chat/${conversation.id}`);
}

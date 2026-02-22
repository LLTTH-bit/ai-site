import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import UserList from "./user-list";

export default async function UsersPage() {
  const session = await getSession();

  if (!session.isLoggedIn || session.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { conversations: true, usageLogs: true },
      },
    },
  });

  return <UserList users={users} />;
}

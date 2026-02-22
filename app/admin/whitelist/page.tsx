import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import WhitelistManager from "./whitelist-manager";

export default async function WhitelistPage() {
  const session = await getSession();

  if (!session.isLoggedIn || session.role !== "ADMIN") {
    redirect("/");
  }

  const whitelist = await prisma.whitelist.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <WhitelistManager initialData={whitelist} adminId={session.userId} />;
}

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPassword = process.env.ADMIN_PASSWORD!;

  if (!adminEmail || !adminPassword) {
    console.log("未配置管理员账号，跳过初始化");
    return;
  }

  // 检查是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingUser) {
    console.log("管理员账号已存在");
    return;
  }

  // 创建管理员
  const passwordHash = await hashPassword(adminPassword);
  const user = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      name: "管理员",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // 添加到白名单
  await prisma.whitelist.create({
    data: {
      email: adminEmail,
      note: "系统初始管理员",
      used: true,
      createdBy: user.id,
    },
  });

  console.log("管理员账号创建成功:", adminEmail);
}

main()
  .catch((e) => {
    console.error("Seed 失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

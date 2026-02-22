const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('776270Qaz', 10);
  await prisma.user.create({
    data: {
      email: 'cuber936bit@163.com',
      passwordHash: hash,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });
  console.log('Admin created!');
  await prisma.$disconnect();
}

run();

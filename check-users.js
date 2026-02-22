const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany();
  console.log('Users:', users.map(u => u.id));

  const conversations = await p.conversation.findMany();
  console.log('Conversations:', conversations.map(c => ({ id: c.id, userId: c.userId })));

  // Check for orphaned conversations
  const userIds = new Set(users.map(u => u.id));
  const orphaned = conversations.filter(c => !userIds.has(c.userId));
  console.log('Orphaned conversations:', orphaned);

  await p.$disconnect();
}

main();

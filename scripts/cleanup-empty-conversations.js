// 清理没有消息的对话
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanup() {
  try {
    // 找出没有消息的对话
    const emptyConversations = await prisma.$queryRaw`
      SELECT c.id FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversationId
      WHERE m.id IS NULL
    `;

    if (emptyConversations.length > 0) {
      const ids = emptyConversations.map(c => c.id);
      await prisma.conversation.deleteMany({
        where: {
          id: { in: ids }
        }
      });
      console.log(`已清理 ${ids.length} 个空对话`);
    } else {
      console.log('没有需要清理的对话');
    }
  } catch (error) {
    console.error('清理失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();

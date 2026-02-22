const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  try {
    const conversation = await p.conversation.create({
      data: {
        userId: 'cmlxhrs6u00002t9g5k785f4g',
        title: 'test'
      }
    });
    console.log('Created:', conversation.id);
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    await p.$disconnect();
  }
}

main();

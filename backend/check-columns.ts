import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const result = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User';`;
  console.log(JSON.stringify(result, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());

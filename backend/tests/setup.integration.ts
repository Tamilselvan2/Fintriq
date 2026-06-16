import { prisma } from '../src/db/prisma';

// Increase timeout for remote database operations
jest.setTimeout(30000);

async function clearDatabase() {
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

beforeAll(async () => {
  await clearDatabase();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

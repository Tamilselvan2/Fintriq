import { prismaMock } from './__mocks__/prisma';

// Mock the real prisma instance with our deep mock
jest.mock('../src/db/prisma', () => ({
  prisma: prismaMock,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

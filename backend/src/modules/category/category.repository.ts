import { prisma } from '../../db/prisma';

export class CategoryRepository {
  async findMany(orgId: string) {
    return prisma.category.findMany({
      where: { orgId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findByName(orgId: string, name: string) {
    return prisma.category.findUnique({
      where: { orgId_name: { orgId, name } },
    });
  }

  async create(orgId: string, name: string) {
    return prisma.category.create({
      data: { orgId, name, isActive: true },
    });
  }

  async updateStatus(id: string, orgId: string, isActive: boolean) {
    return prisma.category.update({
      where: { id, orgId }, // orgId ensures safety
      data: { isActive },
    });
  }

  async deleteSoft(id: string, orgId: string) {
    return this.updateStatus(id, orgId, false);
  }
}

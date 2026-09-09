import { prisma } from '../../db/prisma';

export class PresetService {
  async getPresetsByCategory(orgId: string, categoryId: string) {
    return prisma.purchasePresetItem.findMany({
      where: { orgId, categoryId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updatePresetsForCategory(orgId: string, categoryId: string, items: { id?: string, name: string, price: number, isActive: boolean }[]) {
    // We can do this in a transaction:
    // 1. Mark all existing items not in the list as inactive, or update them.
    // Actually, simple sync: delete all and recreate, or upsert.
    // Since IDs might be referenced later if we change our minds, upsert or soft delete is better.
    
    return prisma.$transaction(async (tx) => {
      const existingItems = await tx.purchasePresetItem.findMany({
        where: { orgId, categoryId }
      });
      
      const incomingIds = items.map(i => i.id).filter(Boolean);
      
      // Deactivate items not in the incoming list
      await tx.purchasePresetItem.updateMany({
        where: {
          orgId,
          categoryId,
          id: { notIn: incomingIds as string[] }
        },
        data: { isActive: false }
      });
      
      // Upsert incoming items
      for (const item of items) {
        if (item.id && existingItems.find(e => e.id === item.id)) {
          await tx.purchasePresetItem.update({
            where: { id: item.id, orgId },
            data: {
              name: item.name,
              price: item.price,
              isActive: item.isActive,
            }
          });
        } else {
          await tx.purchasePresetItem.create({
            data: {
              orgId,
              categoryId,
              name: item.name,
              price: item.price,
              isActive: item.isActive,
            }
          });
        }
      }
      
      return tx.purchasePresetItem.findMany({
        where: { orgId, categoryId, isActive: true },
        orderBy: { createdAt: 'asc' },
      });
    });
  }
}

export const presetService = new PresetService();

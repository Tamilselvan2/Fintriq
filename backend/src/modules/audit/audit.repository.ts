import { prisma } from '../../db/prisma';

interface CreateAuditLogParams {
  orgId: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export class AuditRepository {
  async create(params: CreateAuditLogParams) {
    return prisma.auditLog.create({
      data: {
        orgId: params.orgId,
        userId: params.userId,
        userEmail: params.userEmail,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: params.details,
        ipAddress: params.ipAddress,
      },
    });
  }

  async findMany(params: {
    orgId: string;
    cursor?: string;
    limit: number;
    action?: string;
    entityType?: string;
  }) {
    const { orgId, cursor, limit, action, entityType } = params;

    const where = {
      orgId,
      ...(action && { action }),
      ...(entityType && { entityType }),
    };

    const items = await prisma.auditLog.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, role: true } },
      },
    });

    let nextCursor: string | null = null;
    if (items.length > limit) {
      const next = items.pop();
      nextCursor = next!.id;
    }

    const total = await prisma.auditLog.count({ where });

    return { items, total, nextCursor };
  }
}

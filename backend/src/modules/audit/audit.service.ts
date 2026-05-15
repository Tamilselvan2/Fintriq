import { AuditRepository } from './audit.repository';

const repo = new AuditRepository();

export const AuditActions = {
  CREATE_TRANSACTION: 'CREATE_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  INVITE_MEMBER: 'INVITE_MEMBER',
  UPDATE_MEMBER_ROLE: 'UPDATE_MEMBER_ROLE',
  REMOVE_MEMBER: 'REMOVE_MEMBER',
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];

export interface LogEventParams {
  orgId: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export class AuditService {
  /** Fire-and-forget: log an event without blocking the main request */
  async log(params: LogEventParams) {
    return repo.create(params).catch((err) => {
      console.error('[AuditService Error]: Failed to create audit log', err);
    });
  }

  async getLogs(params: {
    orgId: string;
    cursor?: string;
    limit?: number;
    action?: string;
    entityType?: string;
  }) {
    const limit = Number(params.limit) || 20;
    const result = await repo.findMany({ ...params, limit });

    return {
      data: result.items,
      meta: {
        total: result.total,
        limit,
        nextCursor: result.nextCursor,
        hasMore: result.nextCursor !== null,
      },
    };
  }
}

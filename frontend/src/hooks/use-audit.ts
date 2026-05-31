import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AuditLog {
  id: string;
  orgId: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
  user: { email: string; role: string };
}

interface AuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  meta: {
    total: number;
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
}

interface FetchAuditParams {
  cursor?: string;
  limit?: number;
  action?: string;
  entityType?: string;
}

export function useAuditLogs(params: FetchAuditParams = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') searchParams.append(k, String(v));
      });
      const res = await api.get<AuditLogsResponse>(`/audit?${searchParams.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  });
}

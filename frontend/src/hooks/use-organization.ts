import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, Role } from '@/types/models';
import { ApiResponse } from '@/types/api';

export function useOrganization() {
  return useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const res = await api.get('/organizations/current');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await api.patch('/organizations/current', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      // Invalidate user/auth related queries if they exist
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

interface MembersQueryParams {
  limit?: number;
  cursor?: string;
}

export function useMembers(params?: MembersQueryParams) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.cursor) searchParams.set('cursor', params.cursor);
      
      const res = await api.get(`/organizations/members?${searchParams.toString()}`);
      return res.data as { data: User[], meta: { total: number, limit: number, nextCursor: string | null, hasMore: boolean } };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; role: Role; password?: string }) => {
      const res = await api.post('/organizations/members', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const res = await api.patch(`/organizations/members/${id}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/organizations/members/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: Role;
  expiresAt: string;
  createdAt: string;
}

export function usePendingInvitations() {
  return useQuery({
    queryKey: ['pending-invitations'],
    queryFn: async () => {
      const res = await api.get('/organizations/invitations/pending');
      return res.data.data as PendingInvitation[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/organizations/invitations/${id}/resend`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
    },
  });
}


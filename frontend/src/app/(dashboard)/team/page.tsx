'use client';

import { RoleGate } from '@/components/auth/role-gate';
import { Role } from '@/types/models';
import { UserPlus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useMembers } from '@/hooks/use-organization';
import { TeamTable } from '@/components/organization/team-table';
import { InviteMemberModal } from '@/components/organization/invite-member-modal';
import { PendingInvitationsTable } from '@/components/organization/pending-invitations-table';

import { Pagination } from '@/components/shared/pagination';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Suspense, useCallback } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { TeamSkeleton } from '@/components/skeletons/team-skeleton';

function TeamPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cursor = searchParams.get('cursor') || undefined;
  const limit = Number(searchParams.get('limit')) || 20;

  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const currentPage = cursorStack.length + 1;

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const { data, isLoading, isFetching, isError, error } = useMembers({ cursor, limit });
  const members = data?.data || [];

  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '') params.delete(k);
      else params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const handleNext = () => {
    if (!data?.meta.nextCursor) return;
    setCursorStack(prev => [...prev, cursor ?? '']);
    updateParams({ cursor: data.meta.nextCursor! });
  };

  const handlePrev = () => {
    const stack = [...cursorStack];
    const prev = stack.pop();
    setCursorStack(stack);
    updateParams({ cursor: prev || undefined });
  };

  const handleLimitChange = (newLimit: number) => {
    setCursorStack([]);
    updateParams({ limit: newLimit.toString(), cursor: undefined });
  };

  if (isLoading && !data) {
    return <TeamSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Team Management</h2>
              {isFetching && !isLoading && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-full animate-in fade-in duration-300">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Updating...
                </div>
              )}
            </div>
            <p className="text-slate-500 mt-1 font-medium">Manage members, update access roles, and secure your organization.</p>
          </div>
        </div>
        
        <RoleGate allowedRoles={[Role.ADMIN]}>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:translate-y-px"
          >
            <UserPlus size={20} strokeWidth={2.5} />
            <span>Invite Member</span>
          </button>
        </RoleGate>
      </div>

      <div className={`bg-white dark:bg-slate-950 border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-opacity duration-300 ${isFetching && !isLoading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        {isError ? (
          <div className="p-10 text-center text-slate-700 dark:text-slate-200">
            <p className="font-semibold">Unable to load team members.</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{(error as any)?.message || 'Please refresh the page.'}</p>
          </div>
        ) : (
          <TeamTable members={members} />
        )}
        {!isLoading && !isError && (data?.meta.total ?? 0) > 0 && (
          <Pagination
            currentPage={currentPage}
            totalRecords={data?.meta.total ?? 0}
            limit={limit}
            hasPrev={cursorStack.length > 0}
            hasNext={data?.meta.hasMore ?? false}
            onPrev={handlePrev}
            onNext={handleNext}
            onLimitChange={handleLimitChange}
          />
        )}
      </div>

      <PendingInvitationsTable />

      <InviteMemberModal 
        isOpen={isInviteModalOpen} 
        onOpenChange={setIsInviteModalOpen} 
      />
    </div>
    </ErrorBoundary>
  );
}

export default function TeamPage() {
  return (
    <Suspense fallback={<div className="p-10 text-slate-500">Loading...</div>}>
      <TeamPageInner />
    </Suspense>
  );
}

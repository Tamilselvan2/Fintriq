'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuditLogs, AuditLog } from '@/hooks/use-audit';
import { format } from 'date-fns';
import { ShieldCheck, Plus, Pencil, Trash2, UserPlus } from 'lucide-react';
import { Pagination } from '@/components/shared/pagination';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { AuditLogSkeleton } from '@/components/skeletons/audit-log-skeleton';

const ACTION_LABELS: Record<string, { label: string; icon: JSX.Element; color: string }> = {
  CREATE_TRANSACTION: { label: 'Created Transaction', icon: <Plus size={14} />, color: 'text-brand-emerald bg-brand-emerald/10' },
  UPDATE_TRANSACTION: { label: 'Updated Transaction', icon: <Pencil size={14} />, color: 'text-brand-blue bg-brand-blue/10' },
  DELETE_TRANSACTION: { label: 'Deleted Transaction', icon: <Trash2 size={14} />, color: 'text-brand-rose bg-brand-rose/10' },
  INVITE_MEMBER:       { label: 'Invited Member',       icon: <UserPlus size={14} />, color: 'text-purple-500 bg-purple-500/10' },
  UPDATE_MEMBER_ROLE:  { label: 'Updated Member Role',  icon: <Pencil size={14} />, color: 'text-amber-500 bg-amber-500/10' },
  REMOVE_MEMBER:       { label: 'Removed Member',       icon: <Trash2 size={14} />, color: 'text-brand-rose bg-brand-rose/10' },
};

function AuditLogRow({ log }: { log: AuditLog }) {
  const action = ACTION_LABELS[log.action] ?? { label: log.action, icon: <ShieldCheck size={14} />, color: 'text-slate-500 bg-slate-100' };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-b border-border last:border-0">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">{log.userEmail}</div>
        <div className="text-xs text-slate-400 mt-0.5">{log.user?.role}</div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${action.color}`}>
          {action.icon}
          {action.label}
        </span>
      </td>
      <td className="px-6 py-4">
        {log.details && Object.keys(log.details).length > 0 ? (
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 max-w-[260px]">
            {log.details.amount !== undefined && (
              <div><span className="font-semibold">Amount:</span> ${log.details.amount}</div>
            )}
            {log.details.type && (
              <div><span className="font-semibold">Type:</span> {log.details.type}</div>
            )}
            {log.details.category && (
              <div><span className="font-semibold">Category:</span> {log.details.category}</div>
            )}
            {log.details.description && (
              <div className="truncate max-w-[200px]"><span className="font-semibold">Desc:</span> {log.details.description}</div>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">No details</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
      </td>
    </tr>
  );
}

function AuditLogPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cursor = searchParams.get('cursor') || undefined;
  const action = searchParams.get('action') || '';
  const limit = Number(searchParams.get('limit')) || 20;

  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const currentPage = cursorStack.length + 1;

  const { data, isLoading, isError, error } = useAuditLogs({ cursor, limit, action: action || undefined });

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (!v) params.delete(k); else params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

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
    return <AuditLogSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-brand-blue" size={28} />
            Audit Log
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Immutable record of all organisation activity.</p>
        </div>

        {/* Action filter */}
        <select
          value={action}
          onChange={e => { setCursorStack([]); updateParams({ action: e.target.value, cursor: undefined }); }}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-border rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 shadow-sm"
        >
          <option value="">All Actions</option>
          <option value="CREATE_TRANSACTION">Created Transaction</option>
          <option value="UPDATE_TRANSACTION">Updated Transaction</option>
          <option value="DELETE_TRANSACTION">Deleted Transaction</option>
          <option value="INVITE_MEMBER">Invited Member</option>
          <option value="UPDATE_MEMBER_ROLE">Updated Member Role</option>
          <option value="REMOVE_MEMBER">Removed Member</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-950 border border-border rounded-2xl shadow-sm overflow-hidden">
        {isError ? (
          <div className="px-8 py-16 text-center text-slate-700 dark:text-slate-200">
            <p className="text-lg font-semibold">Unable to load audit logs.</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{(error as any)?.message || 'Please try again later.'}</p>
          </div>
        ) : !data?.data.length ? (
          <div className="p-16 text-center bg-white dark:bg-slate-950 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-24 h-24 bg-gradient-to-tr from-brand-blue/20 to-emerald-400/20 dark:from-brand-blue/10 dark:to-emerald-400/10 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-800 relative">
              <div className="absolute inset-2 bg-gradient-to-tr from-brand-blue to-emerald-400 rounded-full opacity-10 blur-xl"></div>
              <ShieldCheck className="w-10 h-10 text-brand-blue relative z-10" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">No activity yet</h3>
            <p className="mt-3 text-slate-500 font-medium max-w-md">Actions performed in this organisation will appear here securely.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-border text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map(log => <AuditLogRow key={log.id} log={log} />)}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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
    </div>
    </ErrorBoundary>
  );
}

export default function AuditLogPage() {
  return (
    <Suspense fallback={<div className="p-10 text-slate-500">Loading...</div>}>
      <AuditLogPageInner />
    </Suspense>
  );
}

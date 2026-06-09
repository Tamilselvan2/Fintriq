'use client';

import { RoleGate } from '@/components/auth/role-gate';
import { Role, Transaction } from '@/types/models';
import { Plus, Download, Loader2 } from 'lucide-react';
import { useCallback, useState, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransactions, useDeleteTransaction } from '@/hooks/use-transactions';
import { FilterBar } from '@/components/transactions/filter-bar';
import { TransactionTable } from '@/components/transactions/transaction-table';
import { TransactionModal } from '@/components/transactions/transaction-modal';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from 'sonner';
import api from '@/lib/api';
import { TableSkeleton } from '@/components/skeletons/table-skeleton';
import { Spinner } from '@/components/ui/spinner';

function TransactionsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- Read state from URL ---
  const cursor = searchParams.get('cursor') || undefined;
  const type = (searchParams.get('type') as 'INCOME' | 'EXPENSE' | '') || '';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  // cursor history stack for "Previous" navigation
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isFetching } = useTransactions({
    cursor,
    limit: 10,
    type: type || undefined,
    category: category || undefined,
    search: search || undefined,
  });

  const deleteMutation = useDeleteTransaction();

  // --- URL update helpers ---
  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '') {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const handleFilterChange = useCallback((filters: { search?: string; type?: string; category?: string }) => {
    // reset cursor when filters change
    setCursorStack([]);
    updateParams({ ...filters, cursor: undefined });
  }, [updateParams]);

  const handleNextPage = () => {
    if (!data?.meta.nextCursor) return;
    setCursorStack(prev => [...prev, cursor ?? '']);
    updateParams({ cursor: data.meta.nextCursor! });
  };

  const handlePrevPage = () => {
    const stack = [...cursorStack];
    const prevCursor = stack.pop();
    setCursorStack(stack);
    updateParams({ cursor: prevCursor || undefined });
  };

  const handleCreate = () => { setEditingTransaction(null); setIsModalOpen(true); };
  const handleEdit = (t: Transaction) => { setEditingTransaction(t); setIsModalOpen(true); };
  const handleDeleteClick = (t: Transaction) => { setDeletingTransaction(t); setIsConfirmOpen(true); };

  const confirmDelete = async () => {
    if (!deletingTransaction) return;
    try {
      await deleteMutation.mutateAsync(deletingTransaction.id);
      toast.success('Transaction deleted');
      setIsConfirmOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const handleExportCsv = async () => {
    if ((data?.meta.total ?? 0) === 0) {
      toast.error('No transactions available for export');
      return;
    }

    setIsExporting(true);
    try {
      const exportParams = new URLSearchParams(searchParams.toString());
      exportParams.delete('cursor');
      exportParams.delete('limit');

      const response = await api.get(`/transactions/export?${exportParams.toString()}`, { responseType: 'blob' });
      
      let filename = `fintriq-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV Export downloaded!');
    } catch (error) {
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const currentPage = cursorStack.length + 1;
  const hasMore = data?.meta.hasMore ?? false;
  const hasPrev = cursorStack.length > 0;

  if (isLoading && !data) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Transactions</h2>
              {isFetching && !isLoading && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-full animate-in fade-in duration-300">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Refreshing...
                </div>
              )}
            </div>
            <p className="text-slate-500 mt-1 font-medium">Manage and view all financial records.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RoleGate allowedRoles={[Role.ADMIN, Role.ACCOUNTANT]}>
            <button
              onClick={handleExportCsv}
              disabled={isExporting}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-border hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? <Spinner className="w-[18px] h-[18px]" /> : <Download size={18} strokeWidth={2.5} />}
              <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-gradient-to-r from-brand-blue to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:translate-y-px"
            >
              <Plus size={20} strokeWidth={3} />
              <span>New Transaction</span>
            </button>
          </RoleGate>
        </div>
      </div>

      <FilterBar
        initialSearch={search}
        initialType={type}
        initialCategory={category}
        onFilterChange={handleFilterChange}
      />

      <div className={`bg-white dark:bg-slate-950 border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-opacity duration-300 ${isFetching && !isLoading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        <TransactionTable
          transactions={data?.data || []}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />

        {/* Cursor Pagination Controls */}
        {!isLoading && (data?.meta.total ?? 0) > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-border rounded-b-2xl">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span>
              {' '}· <span className="font-bold text-slate-900 dark:text-white">{data?.meta.total ?? 0}</span> total records
            </p>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={!hasPrev}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!hasMore}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <TransactionModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} transaction={editingTransaction} />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone and will permanently affect your dashboard analytics."
        onConfirm={confirmDelete}
        isConfirming={deleteMutation.isPending}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-slate-500">Loading...</div>}>
      <TransactionsPageInner />
    </Suspense>
  );
}

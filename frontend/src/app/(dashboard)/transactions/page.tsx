'use client';

import { RoleGate } from '@/components/auth/role-gate';
import { Role, Transaction } from '@/types/models';
import { Plus, Download } from 'lucide-react';
import { useState } from 'react';
import { useTransactions, useDeleteTransaction } from '@/hooks/use-transactions';
import { FilterBar } from '@/components/transactions/filter-bar';
import { TransactionTable } from '@/components/transactions/transaction-table';
import { PaginationControls } from '@/components/transactions/pagination-controls';
import { TransactionModal } from '@/components/transactions/transaction-modal';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ search?: string; type?: 'INCOME' | 'EXPENSE' | ''; category?: string }>({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const { data, isLoading } = useTransactions({ 
    page, 
    limit: 10,
    ...filters
  });

  const deleteMutation = useDeleteTransaction();

  const handleCreate = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (t: Transaction) => {
    setDeletingTransaction(t);
    setIsConfirmOpen(true);
  };

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
    try {
      const response = await api.get('/transactions/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV Export downloaded!');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Transactions</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage and view all financial records.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <RoleGate allowedRoles={[Role.ADMIN, Role.ACCOUNTANT]}>
            <button 
              onClick={handleExportCsv}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-border hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm active:translate-y-px"
            >
              <Download size={18} strokeWidth={2.5} />
              <span>Export CSV</span>
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
        onFilterChange={(f) => {
          setFilters(f);
          setPage(1); // Reset to page 1 on filter change
        }} 
      />

      <div className="bg-white dark:bg-slate-950 border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <TransactionTable 
          transactions={data?.data || []} 
          isLoading={isLoading} 
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
        
        {!isLoading && data?.meta && (
          <PaginationControls 
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            onPageChange={setPage}
          />
        )}
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        transaction={editingTransaction} 
      />

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
